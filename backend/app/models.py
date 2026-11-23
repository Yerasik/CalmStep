from typing import Literal

from pydantic import BaseModel, Field


class ProfileIn(BaseModel):
    model_config = {"extra": "forbid"}

    display_name: str
    answered_by: Literal["guardian", "self"]
    age_band: str
    communication: list[str]
    sensory_triggers: list[str]
    overload_signs: list[str]
    coping_strategies: list[str]
    transition_warnings_min: list[int]
    motivators: list[str]
    must_stay_fixed: list[str]


class PlanItemIn(BaseModel):
    model_config = {"extra": "forbid"}

    start: str = Field(pattern=r"^[0-9]{2}:[0-9]{2}$")
    end: str = Field(pattern=r"^[0-9]{2}:[0-9]{2}$")
    title: str
    icon_id: str
    load: Literal["low", "mid", "high"]


class PlanSupportIn(BaseModel):
    model_config = {"extra": "forbid"}

    type: str
    after_item: int = Field(ge=0)
    reason: str


class DayPlanIn(BaseModel):
    model_config = {"extra": "forbid"}

    date: str = Field(pattern=r"^[0-9]{4}-[0-9]{2}-[0-9]{2}$")
    items: list[PlanItemIn]
    supports: list[PlanSupportIn]


class HealthResponse(BaseModel):
    ok: bool


class InterviewTurnIn(BaseModel):
    reply: str | None = None
    turn_index: int = 0
    session_id: str | None = None


class InterviewTurnOut(BaseModel):
    session_id: str
    question: str
    turn_index: int
    done: bool
    profile: ProfileIn | None = None
    source: Literal["llm", "fixture"] = "fixture"


class InterviewLlmOut(BaseModel):
    model_config = {"extra": "ignore"}

    kind: Literal["question", "profile"]
    question: str | None = None
    profile: ProfileIn | None = None


class GenerateIn(BaseModel):
    day_text: str = ""
    profile: ProfileIn | None = None


class ValidateIn(BaseModel):
    plan: DayPlanIn
    profile: ProfileIn | None = None


class ValidateOut(BaseModel):
    ok: bool
    violations: list[str]


class GenerateOut(BaseModel):
    id: str
    plan: DayPlanIn
    validation: ValidateOut
    source: Literal["llm", "template"] = "template"
    attempts: int = 0
    planner_notes: str = ""


class ApproveOut(BaseModel):
    id: str
    approved: bool


class LinkStartIn(BaseModel):
    profile: ProfileIn | None = None
    plan: DayPlanIn | None = None


class LinkStartOut(BaseModel):
    pin: str
    qr_payload: str
    expires_at: str


class LinkAcceptIn(BaseModel):
    pin: str | None = None
    qr_payload: str | None = None
    token: str | None = None


class LinkAcceptOut(BaseModel):
    profile_id: str
    profile: ProfileIn
    plan: DayPlanIn | None = None
    token: str
