from __future__ import annotations

import re

from app.icons import ICON_IDS
from app.models import DayPlanIn, ProfileIn, ValidateOut

WAKE_START = 6 * 60
WAKE_END = 22 * 60
TIME_RE = re.compile(r"([0-9]{1,2}:[0-9]{2})")


def to_minutes(hhmm: str) -> int:
    hours, minutes = hhmm.split(":")
    return int(hours) * 60 + int(minutes)


def validate_plan(plan: DayPlanIn, profile: ProfileIn | None) -> ValidateOut:
    """Stage 6 rules 1–6. Used by /plans/validate and generate (Ch 14: not in the View)."""
    violations: list[str] = []
    items = plan.items

    if len(items) > 8:
        violations.append("At most 8 items so the Day Strip can fit.")

    for item in items:
        if item.icon_id not in ICON_IDS:
            violations.append(f"Unknown icon_id: {item.icon_id}")
        start = to_minutes(item.start)
        end = to_minutes(item.end)
        if end <= start:
            violations.append(f"{item.title}: end must be after start.")
        if start < WAKE_START or end > WAKE_END:
            violations.append(f"{item.title}: outside waking hours 06:00–22:00.")

    ordered = sorted(items, key=lambda item: to_minutes(item.start))
    for prev, nxt in zip(ordered, ordered[1:]):
        if to_minutes(prev.end) > to_minutes(nxt.start):
            violations.append(f"Overlap: {prev.title} and {nxt.title}.")

    streak = 0
    for index, item in enumerate(items):
        if item.load == "high":
            streak += 1
            if streak > 2:
                violations.append("At most 2 consecutive high-load items.")
            has_next = index + 1 < len(items)
            if has_next:
                gap = to_minutes(items[index + 1].start) - to_minutes(item.end)
                has_break = any(
                    support.type == "break" and support.after_item == index for support in plan.supports
                )
                if gap < 10 and not has_break:
                    violations.append(
                        f"After {item.title} need 10 minutes buffer or a break support."
                    )
        else:
            streak = 0

    if profile:
        for fixed in profile.must_stay_fixed:
            if not _fixed_is_present(fixed, items):
                violations.append(f"Must-stay-fixed missing: {fixed}")

    return ValidateOut(ok=len(violations) == 0, violations=violations)


def _fixed_is_present(fixed: str, items: list) -> bool:
    text = fixed.lower()
    match = TIME_RE.search(text)
    wanted_time: str | None = None
    words = text
    if match:
        raw = match.group(1)
        hours, minutes = raw.split(":")
        wanted_time = f"{int(hours):02d}:{minutes}"
        words = text.replace(raw, " ")
    tokens = [word for word in words.split() if word not in {"at", "the", "a"}]
    for item in items:
        title = item.title.lower()
        title_ok = title in text or any(token in title for token in tokens)
        time_ok = wanted_time is None or item.start == wanted_time
        if title_ok and time_ok:
            return True
    return False
