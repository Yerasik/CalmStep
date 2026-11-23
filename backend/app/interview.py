from __future__ import annotations

from uuid import uuid4

from pydantic import ValidationError

from app.fixtures import INTERVIEW_SCRIPT
from app.llm_client import LlmError, chat_completions
from app.models import InterviewLlmOut, InterviewTurnOut, ProfileIn
from app.prompts import INTERVIEW_SYSTEM
from app.settings import IF_LLM_DOWN, MAX_INTERVIEW_QUESTIONS

SESSIONS: dict[str, dict] = {}

_DEFAULT_COPING = ["deep breaths", "quiet corner", "drink water"]


def _new_session() -> str:
    session_id = str(uuid4())
    SESSIONS[session_id] = {"messages": [{"role": "system", "content": INTERVIEW_SYSTEM}], "answers": []}
    return session_id


def _list_from_text(text: str, fallback: list[str] | None = None) -> list[str]:
    parts = [part.strip() for part in text.replace(";", ",").split(",") if part.strip()]
    if parts:
        return parts
    return list(fallback or [])


def _minutes_from_text(text: str) -> list[int]:
    mins: list[int] = []
    for part in text.replace(";", ",").split(","):
        digits = "".join(ch for ch in part if ch.isdigit())
        if digits:
            mins.append(int(digits))
    return mins[:4]


def _at(answers: list[str], index: int) -> str:
    if index >= len(answers):
        return ""
    return answers[index].strip()


def _profile_from_answers(answers: list[str]) -> ProfileIn:
    """Map Q1–Q10 onto the Profile. Do not keep leftover Kit fixture fields."""
    nickname = _at(answers, 0).split()[0][:32] if _at(answers, 0) else "Friend"
    who = _at(answers, 1).lower()
    answered_by = "self" if "self" in who else "guardian"
    mins = _minutes_from_text(_at(answers, 7))
    return ProfileIn.model_validate(
        {
            "display_name": nickname,
            "answered_by": answered_by,
            "age_band": (_at(answers, 2) or "unspecified")[:24],
            "communication": _list_from_text(_at(answers, 3), ["pictograms"]),
            "sensory_triggers": _list_from_text(_at(answers, 4)),
            "overload_signs": _list_from_text(_at(answers, 5)),
            "coping_strategies": _list_from_text(_at(answers, 6), _DEFAULT_COPING),
            "transition_warnings_min": mins or [5, 10],
            "motivators": _list_from_text(_at(answers, 8)),
            "must_stay_fixed": _list_from_text(_at(answers, 9)),
        }
    )


def _scripted_turn(session_id: str) -> InterviewTurnOut:
    session = SESSIONS[session_id]
    answers: list[str] = session["answers"]
    asked = len(answers)
    if asked >= MAX_INTERVIEW_QUESTIONS or asked >= len(INTERVIEW_SCRIPT):
        return InterviewTurnOut(
            session_id=session_id,
            question="Interview complete. Review the Profile Card.",
            turn_index=asked,
            done=True,
            profile=_profile_from_answers(answers),
            source="fixture",
        )
    return InterviewTurnOut(
        session_id=session_id,
        question=INTERVIEW_SCRIPT[asked],
        turn_index=asked + 1,
        done=False,
        profile=None,
        source="fixture",
    )


def _record_reply(session_id: str, reply: str | None) -> None:
    if not reply or not reply.strip():
        return
    SESSIONS[session_id]["answers"].append(reply.strip())


def interview_turn(session_id: str | None, reply: str | None, turn_index: int = 0) -> InterviewTurnOut:
    del turn_index  # Scripted flow keys off answer count so a stale client index cannot skip questions.
    sid = session_id if session_id and session_id in SESSIONS else _new_session()
    _record_reply(sid, reply)

    # llama3.1 is often missing; fixtures must not call it or answers get duplicated on retry.
    if IF_LLM_DOWN == "fixtures":
        return _scripted_turn(sid)

    try:
        return _llm_turn(sid, reply)
    except (LlmError, ValidationError, ValueError, KeyError, TypeError):
        return _scripted_turn(sid)


def _llm_turn(session_id: str, reply: str | None) -> InterviewTurnOut:
    session = SESSIONS[session_id]
    messages: list[dict[str, str]] = session["messages"]
    answers: list[str] = session["answers"]
    asked = len(answers)

    if reply and reply.strip():
        messages.append({"role": "user", "content": reply.strip()})
    elif len(messages) == 1:
        messages.append(
            {
                "role": "user",
                "content": "Ask the first interview question only. Return JSON with kind=question.",
            }
        )

    force_profile = asked >= MAX_INTERVIEW_QUESTIONS
    if force_profile:
        messages.append(
            {
                "role": "user",
                "content": "No more questions. Emit kind=profile and fill every Profile field now.",
            }
        )

    raw = chat_completions(
        messages,
        json_schema=InterviewLlmOut.model_json_schema(),
        schema_name="interview_turn",
    )
    parsed = InterviewLlmOut.model_validate(raw)

    # Profile always comes from the Planner's answers, not from a short LLM guess.
    if force_profile or (parsed.kind == "profile" and asked >= MAX_INTERVIEW_QUESTIONS):
        profile = _profile_from_answers(answers)
        if parsed.profile is not None:
            try:
                ProfileIn.model_validate(parsed.profile.model_dump())
            except ValidationError:
                pass
        messages.append({"role": "assistant", "content": "profile"})
        return InterviewTurnOut(
            session_id=session_id,
            question="Interview complete. Review the Profile Card.",
            turn_index=asked,
            done=True,
            profile=profile,
            source="llm",
        )

    question = parsed.question if parsed.kind == "question" and parsed.question else None
    if not question:
        return _scripted_turn(session_id)
    messages.append({"role": "assistant", "content": question})
    return InterviewTurnOut(
        session_id=session_id,
        question=question,
        turn_index=asked + 1,
        done=False,
        profile=None,
        source="llm",
    )
