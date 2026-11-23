from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.generate import generate_plan as run_generate
from app.interview import interview_turn
from app.link import accept_link, start_link
from app.memory import get_plan, save_plan
from app.models import (
    ApproveOut,
    GenerateIn,
    GenerateOut,
    HealthResponse,
    InterviewTurnIn,
    InterviewTurnOut,
    LinkAcceptIn,
    LinkAcceptOut,
    LinkStartIn,
    LinkStartOut,
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
def interview(body: InterviewTurnIn) -> InterviewTurnOut:
    """One question at a time. Max 10. Then Profile JSON. Screen talks via a store."""
    return interview_turn(body.session_id, body.reply, body.turn_index)


@app.post("/plans/generate", response_model=GenerateOut)
def generate_plan(body: GenerateIn) -> GenerateOut:
    """LLM proposes a DayPlan. Validator checks. Retry twice, then template."""
    return run_generate(body)


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


@app.post("/link/start", response_model=LinkStartOut)
def link_start(body: LinkStartIn) -> LinkStartOut:
    """PIN + signed QR. TTL 10 minutes. Do not log the token."""
    return start_link(body)


@app.post("/link/accept", response_model=LinkAcceptOut)
def link_accept(body: LinkAcceptIn) -> LinkAcceptOut:
    return accept_link(body)
