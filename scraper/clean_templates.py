"""One-shot cleaner for data/templates.json — reapplies content denylist to an
already-scraped templates.json so we don't have to refetch.

Usage:
    python scraper/clean_templates.py
"""

from __future__ import annotations

import json
from pathlib import Path

from fetch_templates import is_blocked, is_noise

ROOT = Path(__file__).resolve().parent.parent
TARGETS = [ROOT / "data" / "templates.json", ROOT / "web" / "data" / "templates.json"]


def main() -> None:
    for path in TARGETS:
        if not path.exists():
            print(f"[skip] {path} (missing)")
            continue
        doc = json.loads(path.read_text(encoding="utf-8"))
        before = len(doc.get("templates", []))
        kept = [t for t in doc.get("templates", []) if not is_blocked(t) and not is_noise(t)]
        removed = before - len(kept)
        doc["templates"] = kept
        doc["count"] = len(kept)
        path.write_text(json.dumps(doc, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"[clean] {path}: removed {removed}, kept {len(kept)}")


if __name__ == "__main__":
    main()
