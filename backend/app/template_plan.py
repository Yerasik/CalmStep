from __future__ import annotations

import re

from app.fixtures import fixture_plan, today_or_monday
from app.models import DayPlanIn, PlanItemIn, PlanSupportIn, ProfileIn
from app.validator import validate_plan

TIME_RE = re.compile(r"(\d{1,2})(?::(\d{2}))?")


def _hm(hours: int, minutes: int = 0) -> str:
    return f"{hours:02d}:{minutes:02d}"


def _parse_hour_range(text: str) -> tuple[str, str] | None:
    match = re.search(
        r"school[^\d]{0,12}(\d{1,2})(?:[:.](\d{2}))?\s*(?:–|-|to)\s*(\d{1,2})(?:[:.](\d{2}))?",
        text,
        re.I,
    )
    if not match:
        return None
    start_h = int(match.group(1))
    start_m = int(match.group(2) or 0)
    end_h = int(match.group(3))
    end_m = int(match.group(4) or 0)
    if end_h <= 12 and start_h <= 12 and end_h < start_h:
        end_h += 12
    if 1 <= end_h <= 7:
        end_h += 12
    return _hm(start_h, start_m), _hm(end_h, end_m)


def _parse_named_time(text: str, name: str) -> str | None:
    match = re.search(rf"{name}[^\d]{{0,16}}(\d{{1,2}})(?::(\d{{2}}))?", text, re.I)
    if not match:
        return None
    hours = int(match.group(1))
    minutes = int(match.group(2) or 0)
    if name == "dentist" and hours < 8:
        hours += 12
    return _hm(hours, minutes)


def template_plan(day_text: str, profile: ProfileIn) -> DayPlanIn:
    """Deterministic plan when the LLM is down or still invalid after retries."""
    text = day_text.strip()
    if not text:
        plan = fixture_plan()
        if validate_plan(plan, profile).ok:
            return plan

    school_range = _parse_hour_range(text)
    lunch_at = "12:00"
    for fixed in profile.must_stay_fixed:
        found = re.search(r"(\d{1,2}:\d{2})", fixed)
        if found and "lunch" in fixed.lower():
            hours, minutes = found.group(1).split(":")
            lunch_at = f"{int(hours):02d}:{minutes}"

    school_start = "08:30"
    school_end = "15:00"
    if school_range:
        school_start, school_end = school_range
    breakfast_end = school_start if (school_range or re.search(r"school", text, re.I)) else "08:30"
    if breakfast_end <= "07:30":
        breakfast_end = "08:00"
    breakfast_start = "07:30" if breakfast_end <= "08:00" else "08:00"
    items: list[PlanItemIn] = [
        PlanItemIn(start=breakfast_start, end=breakfast_end, title="Breakfast", icon_id="eat", load="low")
    ]
    supports: list[PlanSupportIn] = []

    if school_range or re.search(r"school", text, re.I):
        start, end = school_start, school_end
        lunch_end_h, lunch_end_m = (int(x) for x in lunch_at.split(":"))
        lunch_end_m += 30
        if lunch_end_m >= 60:
            lunch_end_h += 1
            lunch_end_m -= 60
        lunch_end = _hm(lunch_end_h, lunch_end_m)
        items.append(PlanItemIn(start=start, end=lunch_at, title="School", icon_id="school", load="high"))
        supports.append(
            PlanSupportIn(
                type="break",
                after_item=len(items) - 1,
                reason="School is high load; lunch is the buffer.",
            )
        )
        items.append(PlanItemIn(start=lunch_at, end=lunch_end, title="Lunch", icon_id="lunch", load="low"))
        quiet_end_h = lunch_end_h
        quiet_end_m = lunch_end_m + 15
        if quiet_end_m >= 60:
            quiet_end_h += 1
            quiet_end_m -= 60
        quiet_end = _hm(quiet_end_h, quiet_end_m)
        items.append(
            PlanItemIn(start=lunch_end, end=quiet_end, title="Quiet time", icon_id="quiet", load="low")
        )
        if end > quiet_end:
            items.append(PlanItemIn(start=quiet_end, end=end, title="School", icon_id="school", load="high"))
            supports.append(
                PlanSupportIn(
                    type="break",
                    after_item=len(items) - 1,
                    reason="Afternoon school is high load; a break support is attached.",
                )
            )
    else:
        items.append(
            PlanItemIn(start="12:00", end="12:30", title="Lunch", icon_id="lunch", load="low")
        )

    dentist = _parse_named_time(text, "dentist")
    if dentist or re.search(r"dentist", text, re.I):
        start = dentist or "16:00"
        hours, minutes = (int(x) for x in start.split(":"))
        end_m = minutes + 30
        end_h = hours
        if end_m >= 60:
            end_h += 1
            end_m -= 60
        items.append(
            PlanItemIn(start=start, end=_hm(end_h, end_m), title="Dentist", icon_id="dentist", load="mid")
        )

    if re.search(r"swim", text, re.I):
        last_end = items[-1].end
        hours, minutes = (int(x) for x in last_end.split(":"))
        if last_end < "17:00":
            start_h, start_m = 17, 0
        else:
            start_h, start_m = hours, minutes
            start_m += 15
            if start_m >= 60:
                start_h += 1
                start_m -= 60
        end_h, end_m = start_h + 1, start_m
        items.append(
            PlanItemIn(
                start=_hm(start_h, start_m),
                end=_hm(end_h, end_m),
                title="Swimming",
                icon_id="swim",
                load="mid",
            )
        )

    if len(items) > 8:
        items = items[:8]

    plan = DayPlanIn(date=today_or_monday(), items=items, supports=supports)
    checked = validate_plan(plan, profile)
    if not checked.ok:
        fallback = fixture_plan()
        if validate_plan(fallback, profile).ok:
            return fallback
    return plan
