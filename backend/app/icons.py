from pathlib import Path

ICON_IDS = {
    "eat",
    "school",
    "lunch",
    "quiet",
    "snack",
    "dinner",
    "break",
    "dentist",
    "swim",
    "bus",
    "sleep",
    "home",
}

CATALOG_PATH = Path(__file__).resolve().parents[2] / "packages" / "shared" / "icons.json"
