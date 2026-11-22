from datetime import date, timedelta

from app.models import DayPlanIn, PlanItemIn, PlanSupportIn, ProfileIn


def today_or_monday() -> str:
    today = date.today()
    monday = today - timedelta(days=(today.weekday()))
    return monday.isoformat()


def fixture_profile() -> ProfileIn:
    return ProfileIn(
        display_name="Kit",
        answered_by="guardian",
        age_band="7-10",
        communication=["short sentences", "pictograms"],
        sensory_triggers=["loud bells", "crowded halls"],
        overload_signs=["covers ears", "goes quiet"],
        coping_strategies=["headphones", "quiet corner", "water"],
        transition_warnings_min=[5, 10],
        motivators=["trains", "stickers"],
        must_stay_fixed=["lunch at 12:00"],
    )


def fixture_plan() -> DayPlanIn:
    return DayPlanIn(
        date=today_or_monday(),
        items=[
            PlanItemIn(start="08:00", end="08:30", title="Breakfast", icon_id="eat", load="low"),
            PlanItemIn(start="08:30", end="12:00", title="School", icon_id="school", load="high"),
            PlanItemIn(start="12:00", end="12:30", title="Lunch", icon_id="lunch", load="low"),
            PlanItemIn(start="12:30", end="13:00", title="Quiet time", icon_id="quiet", load="low"),
            PlanItemIn(start="15:30", end="16:00", title="Snack", icon_id="snack", load="low"),
            PlanItemIn(start="18:00", end="18:30", title="Dinner", icon_id="eat", load="mid"),
        ],
        supports=[
            PlanSupportIn(
                type="break",
                after_item=1,
                reason="School is high load; a break support is attached after it.",
            )
        ],
    )


INTERVIEW_SCRIPT = [
    "What nickname should we use? (no real name)",
    "How does Kit like to be told things: short words, pictures, or both?",
    "Which sounds or crowds are hard?",
    "What does Kit do when overloaded (no diagnosis, just what you see)?",
    "What helps: headphones, a quiet corner, water, something else?",
    "What must stay at a fixed time (for example lunch)?",
]
