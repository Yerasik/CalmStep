"""Interview answers map 1:1 onto the Profile. No Kit leftovers, no double-append."""

from fastapi.testclient import TestClient

from app.interview import SESSIONS
from app.main import app

client = TestClient(app)

ANSWERS = [
    "Sam the explorer",
    "guardian",
    "11-14",
    "pictures",
    "loud bells",
    "covers ears",
    "headphones, water",
    "5, 10",
    "trains",
    "lunch at 12:00",
]


def setup_function() -> None:
    SESSIONS.clear()


def test_ten_answers_fill_profile_from_replies_not_kit():
    first = client.post("/interview/turn", json={"turn_index": 0})
    assert first.status_code == 200
    data = first.json()
    assert data["done"] is False
    assert "nickname" in data["question"].lower()
    session_id = data["session_id"]
    turn_index = data["turn_index"]

    for reply in ANSWERS:
        response = client.post(
            "/interview/turn",
            json={"session_id": session_id, "reply": reply, "turn_index": turn_index},
        )
        assert response.status_code == 200
        data = response.json()
        turn_index = data["turn_index"]
        session_id = data["session_id"]

    assert data["done"] is True
    profile = data["profile"]
    assert profile["display_name"] == "Sam"
    assert profile["answered_by"] == "guardian"
    assert profile["age_band"] == "11-14"
    assert profile["communication"] == ["pictures"]
    assert profile["sensory_triggers"] == ["loud bells"]
    assert profile["overload_signs"] == ["covers ears"]
    assert profile["coping_strategies"] == ["headphones", "water"]
    assert profile["transition_warnings_min"] == [5, 10]
    assert profile["motivators"] == ["trains"]
    assert profile["must_stay_fixed"] == ["lunch at 12:00"]
    assert profile["display_name"] != "Kit"


def test_interview_does_not_finish_after_five_answers():
    first = client.post("/interview/turn", json={"turn_index": 0}).json()
    session_id = first["session_id"]
    turn_index = first["turn_index"]
    for reply in ANSWERS[:5]:
        data = client.post(
            "/interview/turn",
            json={"session_id": session_id, "reply": reply, "turn_index": turn_index},
        ).json()
        session_id = data["session_id"]
        turn_index = data["turn_index"]
    assert data["done"] is False
    assert data["profile"] is None
    assert len(SESSIONS[session_id]["answers"]) == 5
