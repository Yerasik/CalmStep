"""Ch 15 IO tests: POST /plans/validate for Stage 6 rules 1–6."""

from fastapi.testclient import TestClient

from app.fixtures import fixture_plan, fixture_profile
from app.main import app

client = TestClient(app)


def _body(plan=None, profile=None) -> dict:
    return {
        "plan": (plan or fixture_plan()).model_dump(),
        "profile": (profile or fixture_profile()).model_dump(),
    }


def test_fixture_plan_passes_validate():
    response = client.post("/plans/validate", json=_body())
    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert data["violations"] == []


def test_rule1_overlap():
    plan = fixture_plan()
    dumped = plan.model_dump()
    dumped["items"].append(
        {
            "start": "11:00",
            "end": "13:00",
            "title": "Clash",
            "icon_id": "home",
            "load": "low",
        }
    )
    response = client.post("/plans/validate", json=_body(plan=type(plan).model_validate(dumped)))
    data = response.json()
    assert data["ok"] is False
    assert any("Overlap" in item for item in data["violations"])


def test_rule1_outside_waking_hours():
    dumped = fixture_plan().model_dump()
    dumped["items"][0] = {
        "start": "22:00",
        "end": "23:00",
        "title": "Late",
        "icon_id": "sleep",
        "load": "low",
    }
    response = client.post("/plans/validate", json={"plan": dumped, "profile": None})
    data = response.json()
    assert data["ok"] is False
    assert any("waking hours" in item for item in data["violations"])


def test_rule2_unknown_icon():
    dumped = fixture_plan().model_dump()
    dumped["items"][0]["icon_id"] = "unicorn"
    response = client.post("/plans/validate", json={"plan": dumped, "profile": fixture_profile().model_dump()})
    data = response.json()
    assert data["ok"] is False
    assert any("Unknown icon_id" in item for item in data["violations"])


def test_rule3_missing_must_stay_fixed():
    dumped = fixture_plan().model_dump()
    dumped["items"] = [item for item in dumped["items"] if item["title"] != "Lunch"]
    response = client.post("/plans/validate", json=_body(plan=fixture_plan().model_validate(dumped)))
    data = response.json()
    assert data["ok"] is False
    assert any("Must-stay-fixed" in item for item in data["violations"])


def test_rule4_high_load_needs_buffer_or_break():
    dumped = fixture_plan().model_dump()
    dumped["supports"] = []
    response = client.post("/plans/validate", json={"plan": dumped, "profile": fixture_profile().model_dump()})
    data = response.json()
    assert data["ok"] is False
    assert any("10 minutes buffer" in item for item in data["violations"])


def test_rule5_three_consecutive_high_load():
    plan = {
        "date": fixture_plan().date,
        "items": [
            {"start": "08:00", "end": "09:00", "title": "A", "icon_id": "school", "load": "high"},
            {"start": "09:10", "end": "10:10", "title": "B", "icon_id": "school", "load": "high"},
            {"start": "10:20", "end": "11:20", "title": "C", "icon_id": "school", "load": "high"},
            {"start": "12:00", "end": "12:30", "title": "Lunch", "icon_id": "lunch", "load": "low"},
        ],
        "supports": [],
    }
    response = client.post("/plans/validate", json={"plan": plan, "profile": fixture_profile().model_dump()})
    data = response.json()
    assert data["ok"] is False
    assert any("consecutive high-load" in item for item in data["violations"])


def test_rule6_more_than_eight_items():
    dumped = fixture_plan().model_dump()
    extra = [
        {"start": "19:00", "end": "19:20", "title": "X", "icon_id": "play", "load": "low"},
        {"start": "19:30", "end": "19:50", "title": "Y", "icon_id": "walk", "load": "low"},
        {"start": "20:00", "end": "20:20", "title": "Z", "icon_id": "home", "load": "low"},
    ]
    dumped["items"].extend(extra)
    assert len(dumped["items"]) == 9
    response = client.post("/plans/validate", json={"plan": dumped, "profile": fixture_profile().model_dump()})
    data = response.json()
    assert data["ok"] is False
    assert any("At most 8 items" in item for item in data["violations"])
