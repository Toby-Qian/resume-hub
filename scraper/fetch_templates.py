"""Fetch resume / CV template repos from GitHub and dump metadata to data/templates.json.

Usage:
    GITHUB_TOKEN=ghp_xxx python fetch_templates.py        # recommended, 5000 req/h
    python fetch_templates.py                             # unauthenticated, 60 req/h

The script runs several Search API queries (English + Chinese), de-dupes by repo full_name,
classifies each repo by detected stack (latex / html / typst / word / other) and language
(en / zh / mixed), and writes the result to ../data/templates.json.
"""

from __future__ import annotations

import json
import os
import re
import sys
import time
from pathlib import Path
from typing import Any

import requests

API = "https://api.github.com/search/repositories"
OUT = Path(__file__).resolve().parent.parent / "data" / "templates.json"

# (query, lang_hint) — lang_hint is what we assume when the repo doesn't tell us otherwise.
QUERIES: list[tuple[str, str]] = [
    ("topic:resume-template stars:>10", "en"),
    ("topic:cv-template stars:>10", "en"),
    ("topic:awesome-cv stars:>5", "en"),
    ("resume in:name template in:name stars:>10", "en"),
    ("cv in:name template in:name stars:>10", "en"),
    ("resume in:name latex in:description stars:>5", "en"),
    ("resume in:name html in:description stars:>5", "en"),
    ("简历 in:name stars:>5", "zh"),
    ("简历模板 in:name,description stars:>2", "zh"),
    ("中文简历 in:name,description stars:>2", "zh"),
    ("resume in:name 中文 in:description stars:>2", "zh"),
]

# Reject obvious non-template repos that still slip through.
NEGATIVE_NAME = re.compile(r"interview|leetcode|tutorial|self-?learn|guide|awesome-(?!cv|resume)|system-?design|100-?days|book", re.I)
POSITIVE_HINT = re.compile(r"resume|cv|简历", re.I)

# Content policy: drop repos whose name/description touches politically sensitive
# figures/events or NSFW content. The gallery is meant for resume templates only;
# anything else is noise and can embarrass the hosted site.
CONTENT_DENY = re.compile(
    r"xi[-\s]?jinping|jinping|mao[-\s]?zedong|tiananmen|tibet|xinjiang|uyghur|"
    r"falun|六四|天安门|习近平|毛泽东|法轮|共产|反共|台独|港独|"
    r"porn|nsfw|xxx|sex|hentai|erotic|adult|nude|onlyfans|涉黄|色情",
    re.I,
)

# Explicit full_name blacklist for repos that are not genuine resume templates.
EXPLICIT_BLACKLIST = {
    "cirosantilli/x86-bare-metal-examples",
    "cirosantilli/china-dictatorship",
    "cirosantilli/linux-kernel-module-cheat",
}


def is_blocked(repo: dict[str, Any]) -> bool:
    if repo.get("full_name") in EXPLICIT_BLACKLIST:
        return True
    owner = (repo.get("owner") or {}).get("login", "") if isinstance(repo.get("owner"), dict) else repo.get("owner", "")
    blob = f"{owner} {repo.get('name','')} {repo.get('description','') or ''} {' '.join(repo.get('topics') or [])}"
    return bool(CONTENT_DENY.search(blob))

PER_PAGE = 50
MAX_PAGES = 2  # 100 repos per query is plenty


def headers() -> dict[str, str]:
    h = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    tok = os.environ.get("GITHUB_TOKEN")
    if tok:
        h["Authorization"] = f"Bearer {tok}"
    return h


def detect_stack(repo: dict[str, Any]) -> str:
    lang = (repo.get("language") or "").lower()
    name = (repo.get("name") or "").lower()
    desc = (repo.get("description") or "").lower()
    blob = f"{name} {desc}"
    if lang == "tex" or "latex" in blob or "\\documentclass" in blob:
        return "latex"
    if "typst" in blob or lang == "typst":
        return "typst"
    if lang in {"html", "css", "javascript", "typescript", "vue", "svelte"} or "html" in blob:
        return "html"
    if "markdown" in blob or lang == "markdown":
        return "markdown"
    if "docx" in blob or "word" in blob:
        return "docx"
    return "other"


CJK = re.compile(r"[\u4e00-\u9fff]")


def detect_lang(repo: dict[str, Any], hint: str) -> str:
    blob = f"{repo.get('name','')} {repo.get('description','')}"
    has_cjk = bool(CJK.search(blob))
    if has_cjk and hint == "en":
        return "mixed"
    if has_cjk:
        return "zh"
    return "en"


def fetch_query(q: str, hint: str) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for page in range(1, MAX_PAGES + 1):
        params = {"q": q, "sort": "stars", "order": "desc", "per_page": PER_PAGE, "page": page}
        r = requests.get(API, params=params, headers=headers(), timeout=30)
        if r.status_code == 403:
            print(f"[rate-limit] {r.headers.get('X-RateLimit-Remaining')} remaining; sleeping 60s",
                  file=sys.stderr)
            time.sleep(60)
            r = requests.get(API, params=params, headers=headers(), timeout=30)
        r.raise_for_status()
        items = r.json().get("items", [])
        if not items:
            break
        for it in items:
            blob = f"{it.get('name','')} {it.get('description','') or ''}"
            if NEGATIVE_NAME.search(blob):
                continue
            if not POSITIVE_HINT.search(blob) and "resume" not in (it.get("topics") or []) and "cv" not in (it.get("topics") or []):
                continue
            if is_blocked(it):
                continue
            out.append({
                "full_name": it["full_name"],
                "name": it["name"],
                "owner": it["owner"]["login"],
                "html_url": it["html_url"],
                "description": it.get("description") or "",
                "stars": it["stargazers_count"],
                "forks": it["forks_count"],
                "language": it.get("language"),
                "topics": it.get("topics", []),
                "license": (it.get("license") or {}).get("spdx_id"),
                "default_branch": it["default_branch"],
                "pushed_at": it["pushed_at"],
                "homepage": it.get("homepage"),
                "stack": detect_stack(it),
                "lang": detect_lang(it, hint),
                # convention: most repos have a preview image at this path; ok if missing
                "screenshot_guess": f"https://raw.githubusercontent.com/{it['full_name']}/{it['default_branch']}/preview.png",
            })
        if len(items) < PER_PAGE:
            break
        time.sleep(1)
    return out


def main() -> None:
    seen: dict[str, dict[str, Any]] = {}
    for q, hint in QUERIES:
        print(f"[query] {q}", file=sys.stderr)
        try:
            for repo in fetch_query(q, hint):
                key = repo["full_name"]
                if key not in seen or repo["stars"] > seen[key]["stars"]:
                    seen[key] = repo
        except requests.HTTPError as e:
            print(f"[skip] {q}: {e}", file=sys.stderr)
        time.sleep(2)

    rows = sorted(seen.values(), key=lambda r: r["stars"], reverse=True)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(
        {"generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
         "count": len(rows), "templates": rows},
        ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[done] wrote {len(rows)} templates to {OUT}", file=sys.stderr)


if __name__ == "__main__":
    main()
