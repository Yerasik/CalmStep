from app.models import DayPlanIn

# Demo memory only. Mobile SQLite is the offline cache (F8).
PLANS: dict[str, dict] = {}


def save_plan(plan_id: str, plan: DayPlanIn, approved: bool) -> None:
    PLANS[plan_id] = {"plan": plan, "approved": approved}


def get_plan(plan_id: str) -> dict | None:
    return PLANS.get(plan_id)


def latest_approved_plan() -> tuple[str, DayPlanIn] | None:
    for plan_id, row in reversed(list(PLANS.items())):
        if row.get("approved"):
            return plan_id, row["plan"]
    return None
