from __future__ import annotations

import hashlib
import hmac
import json
import os
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException

from app.fixtures import fixture_plan, fixture_profile
from app.memory import latest_approved_plan
from app.models import DayPlanIn, LinkAcceptIn, LinkAcceptOut, LinkStartIn, LinkStartOut, ProfileIn

PIN_LENGTH = 6
QR_TTL_MINUTES = 10
# Local demo HMAC only. Not a public API key. Do not log tokens.
_LINK_SECRET = os.getenv("LINK_SECRET", "calmstep-local-link").encode("utf-8")

# pin -> session; token -> pin
_SESSIONS: dict[str, dict] = {}
_TOKEN_INDEX: dict[str, str] = {}


def _sign(token: str, exp: int) -> str:
    return hmac.new(_LINK_SECRET, f"{token}.{exp}".encode("utf-8"), hashlib.sha256).hexdigest()[:16]


def _new_pin() -> str:
    for _ in range(20):
        pin = f"{secrets.randbelow(10**PIN_LENGTH):0{PIN_LENGTH}d}"
        if pin not in _SESSIONS:
            return pin
    raise HTTPException(status_code=503, detail="Could not make a PIN. Try again.")


def start_link(body: LinkStartIn) -> LinkStartOut:
    profile = body.profile or fixture_profile()
    plan = body.plan
    if plan is None:
        approved = latest_approved_plan()
        plan = approved[1] if approved else fixture_plan()
    pin = _new_pin()
    token = secrets.token_urlsafe(24)
    exp_dt = datetime.now(timezone.utc) + timedelta(minutes=QR_TTL_MINUTES)
    exp = int(exp_dt.timestamp())
    sig = _sign(token, exp)
    payload = json.dumps({"t": token, "e": exp, "s": sig}, separators=(",", ":"))
    _SESSIONS[pin] = {
        "token": token,
        "exp": exp,
        "profile": profile,
        "plan": plan,
        "profile_id": "linked-profile",
    }
    _TOKEN_INDEX[token] = pin
    return LinkStartOut(pin=pin, qr_payload=payload, expires_at=exp_dt.isoformat())


def accept_link(body: LinkAcceptIn) -> LinkAcceptOut:
    pin: str | None = None
    if body.pin:
        pin = body.pin.strip()
    elif body.qr_payload:
        pin = _pin_from_payload(body.qr_payload)
    elif body.token:
        pin = _TOKEN_INDEX.get(body.token)
    if not pin or pin not in _SESSIONS:
        raise HTTPException(status_code=400, detail="That PIN or QR is not valid. Ask the Planner for a new one.")
    session = _SESSIONS[pin]
    now = int(datetime.now(timezone.utc).timestamp())
    if now > int(session["exp"]):
        _drop(pin)
        raise HTTPException(status_code=400, detail="That link expired. Ask the Planner for a new PIN.")
    profile: ProfileIn = session["profile"]
    plan: DayPlanIn | None = session["plan"]
    token: str = session["token"]
    profile_id: str = session["profile_id"]
    _drop(pin)
    return LinkAcceptOut(
        profile_id=profile_id,
        profile=profile,
        plan=plan,
        token=token,
    )


def _pin_from_payload(raw: str) -> str | None:
    try:
        data = json.loads(raw)
        token = data["t"]
        exp = int(data["e"])
        sig = data["s"]
    except (json.JSONDecodeError, KeyError, TypeError, ValueError):
        return None
    expected = _sign(token, exp)
    if not hmac.compare_digest(expected, str(sig)):
        return None
    return _TOKEN_INDEX.get(token)


def _drop(pin: str) -> None:
    session = _SESSIONS.pop(pin, None)
    if session:
        _TOKEN_INDEX.pop(session.get("token"), None)
