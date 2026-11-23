import json
from pathlib import Path

CATALOG_PATH = Path(__file__).resolve().parents[2] / "packages" / "shared" / "icons.json"


def load_catalog() -> list[dict]:
    data = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    return list(data["icons"])


def catalog_ids() -> set[str]:
    return {entry["id"] for entry in load_catalog()}


ICON_IDS = catalog_ids()
