from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.fixtures import INTERVIEW_SCRIPT, fixture_plan, fixture_profile
from app.memory import get_plan, save_plan
from app.models import (
    ApproveOut,
    GenerateIn,
    GenerateOut,
    HealthResponse,
    InterviewTurnIn,
    InterviewTurnOut,
    ValidateIn,
    ValidateOut,
)
from app.validator import validate_plan

app = FastAPI(title="CalmStep API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    """Ch 9: typed JSON ping. Mobile calls this from a store, not from raw SQL."""
    return HealthResponse(ok=True)


@app.post("/interview/turn", response_model=InterviewTurnOut)
def interview_turn(body: InterviewTurnIn) -> InterviewTurnOut:
    """Stub script. No LLM in Stage 5."""
    index = max(0, body.turn_index)
    if index >= len(INTERVIEW_SCRIPT):
        return InterviewTurnOut(question="Interview complete. Review the Profile Card.", turn_index=index, done=True)
    return InterviewTurnOut(question=INTERVIEW_SCRIPT[index], turn_index=index + 1, done=False)


@app.post("/plans/generate", response_model=GenerateOut)
def generate_plan(_body: GenerateIn) -> GenerateOut:
    """Ignore LLM. Return a fixture that passes Stage 6 validate."""
    plan = fixture_plan()
    profile = _body.profile or fixture_profile()
    validation = validate_plan(plan, profile)
    plan_id = str(uuid4())
    save_plan(plan_id, plan, approved=False)
    return GenerateOut(id=plan_id, plan=plan, validation=validation)


@app.post("/plans/validate", response_model=ValidateOut)
def validate(body: ValidateIn) -> ValidateOut:
    return validate_plan(body.plan, body.profile)


@app.post("/plans/{plan_id}/approve", response_model=ApproveOut)
def approve(plan_id: str) -> ApproveOut:
    row = get_plan(plan_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Unknown plan id")
    save_plan(plan_id, row["plan"], approved=True)
    return ApproveOut(id=plan_id, approved=True)
