from uuid import uuid4

from pydantic import ValidationError

from app.icons import load_catalog
from app.llm_client import LlmError, chat_completions
from app.memory import save_plan
from app.models import DayPlanIn, GenerateIn, GenerateOut
from app.prompts import GENERATE_SYSTEM
from app.settings import MAX_GENERATE_RETRIES
from app.template_plan import template_plan
from app.validator import validate_plan
from app.fixtures import fixture_profile, today_or_monday


def generate_plan(body: GenerateIn) -> GenerateOut:
    profile = body.profile or fixture_profile()
    catalog = load_catalog()
    notes: list[str] = []
    attempts = 0
    last_violations: list[str] = []

    user = (
        f"date={today_or_monday()}\n"
        f"day_text={body.day_text}\n"
        f"profile={profile.model_dump_json()}\n"
        f"icon_catalog={catalog}\n"
        "Return only DayPlan JSON."
    )
    messages = [
        {"role": "system", "content": GENERATE_SYSTEM},
        {"role": "user", "content": user},
    ]

    schema = DayPlanIn.model_json_schema()
    max_calls = 1 + MAX_GENERATE_RETRIES
    for _ in range(max_calls):
        attempts += 1
        try:
            raw = chat_completions(messages, json_schema=schema, schema_name="day_plan")
            plan = DayPlanIn.model_validate(raw)
        except LlmError as err:
            last_violations = [str(err)]
            notes.append("LLM unreachable or empty. Using a template plan.")
            break
        except (ValidationError, ValueError) as err:
            last_violations = [str(err)]
            messages.append({"role": "assistant", "content": str(err)})
            messages.append(
                {
                    "role": "user",
                    "content": f"That was not a valid DayPlan. Fix these issues and retry: {last_violations}",
                }
            )
            continue
        validation = validate_plan(plan, profile)
        if validation.ok:
            plan_id = str(uuid4())
            save_plan(plan_id, plan, approved=False)
            return GenerateOut(
                id=plan_id,
                plan=plan,
                validation=validation,
                source="llm",
                attempts=attempts,
                planner_notes="",
            )
        last_violations = validation.violations
        messages.append({"role": "assistant", "content": plan.model_dump_json()})
        messages.append(
            {
                "role": "user",
                "content": "Validator rejected this plan. Fix every item and retry. Violations: "
                + "; ".join(validation.violations),
            }
        )

    plan = template_plan(body.day_text, profile)
    validation = validate_plan(plan, profile)
    if last_violations:
        notes.append("LLM output failed checks: " + "; ".join(last_violations))
    notes.append("Showing a template plan. Approve still required before Supported view.")
    plan_id = str(uuid4())
    save_plan(plan_id, plan, approved=False)
    return GenerateOut(
        id=plan_id,
        plan=plan,
        validation=validation,
        source="template",
        attempts=attempts,
        planner_notes=" ".join(notes),
    )
