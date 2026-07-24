# -*- coding: utf-8 -*-
"""pref_abbr_crosscheck.py — census pref OCR abbreviation keys vs body .txt.

Cross-check CDSL front-matter abbreviation legends (pref Markdown OCR) against
dictionary body text in csl-orig.

**Naming authority (H1569):** csl-orig body `.txt` was already human-edited;
pref OCR was not. Legend **keys** (sigla) should match how the body *names*
the same works. This tool is the census/prioritisation channel; apply body-
aligned key repairs via `pref_key_body_align.py` with a change-log meta doc.
We do **not** modernise 19th-c. orthography for its own sake — we align names.
Expansions (titles) stay scan-faithful unless a key rewrite requires a minimal
key-side fix. Full-diff of Vorwort/title pages is out of scope.

H1530 pilot · H1543 scale · H1560 typed residual · H1569 body naming authority.
stdlib only.

Examples (from csl-guides repo root)::

    python scripts/pref_abbr_crosscheck.py --self-check
    python scripts/pref_abbr_crosscheck.py --dict PWG --out-dir scripts/out
    python scripts/pref_abbr_crosscheck.py --wave A --out-dir scripts/out
    python scripts/pref_abbr_crosscheck.py --all --out-dir scripts/out --json-summary
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from collections import OrderedDict
from datetime import date
from pathlib import Path
from typing import Iterable

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

HERE = Path(__file__).resolve().parent
REPO = HERE.parent
GITHUB = REPO.parent  # …/GitHub

DEFAULT_MIN_KEY_CHARS = 3
DEFAULT_SAMPLE_CAP = 3
DEFAULT_LOW_COUNT = 3

# PWG: **KEY** = expansion
RE_PWG_BOLD = re.compile(r"^\*?\s*\*\*(.+?)\*\*\s*=\s*(.+)$")
RE_EQ = re.compile(r"^[\s\u00a0]*([^*\n=]{1,60}?)\s*=\s+(.+)$")
RE_AP90_DOT = re.compile(r"^[\s\u00a0]+(.+?)\.\s+([A-Za-zÀ-ÿ(].*)$")
# CAE-style cell: abl(ative).  or  ger(und).
RE_PAREN_ABBR = re.compile(
    r"^([A-Za-zÀ-ÿ.]{1,24})\(([^)]{1,40})\)\.?$"
)
# Inline in cell: cf. = compare.
RE_CELL_EQ = re.compile(r"^([A-Za-zÀ-ÿ.]{1,24})\s*=\s+(.+)$")
RE_TABLE_SEP = re.compile(r"^\|[\s\-:|]+\|\s*$")

SKIP_LINE_PREFIXES = (
    "#",
    "---",
    "source_",
    "volume:",
    "extraction:",
    "N. B.",
    "N.B.",
    "Note.",
    "Note ",
    "mostly those",
    "Except where",
    "(Gedruckte",
    "After the Abbreviations",
)

# Prefer strong legend signals (avoid MW intro "symbols" / alphabet prose).
ABBREV_HINTS = re.compile(
    r"list of abbrev|abbreviations of|abbrev\. of works|"
    r"abk[uü]rzungen|erkl[aä]rung der abk|"
    r"grammatical terms|works?\s+cited|cited works|"
    r"bibliography and abbrev|sigla|"
    r"verzeichni[sß]\s+der\s+abk|literature\s+cited",
    re.I,
)

TABLE_HEADER_KEYS = {
    "abbr.",
    "abbr",
    "abbreviation",
    "abbreviations",
    "meaning",
    "column 1",
    "column 2",
    "column 3",
    "key",
    "expansion",
}

# Waves (OCR-ready + body expected). Skip: PE partial, SKD/PUI no OCR, AP/ABCH/LRV.
WAVE_A = [
    "PWG", "AP90", "PW", "GRA", "SCH", "CCS", "MD", "CAE", "BHS", "MW", "MWE", "MW72",
]
WAVE_B = [
    "BEN", "ACC", "AE", "SHS", "WIL", "YAT", "BOR", "INM", "VEI", "IEG",
]
WAVE_C = [
    "BUR", "STC", "BOP", "VCP", "KRM", "MCI", "GST", "PGN", "SNP", "LAN",
]
WAVES = {"A": WAVE_A, "B": WAVE_B, "C": WAVE_C, "ALL": WAVE_A + WAVE_B + WAVE_C}

# Pref roots relative to GitHub/; body is always csl-orig/v02/{body}/.
# file_prefix: basename stem filter (source pages only).
# body: csl-orig code (default = dict lower).
DICT_CATALOG: dict[str, dict] = {
    "PWG": {"roots": ["PWG/prefaces"], "prefix": "pwgpref", "body": "pwg"},
    "AP90": {"roots": ["AP90/prefaces"], "prefix": "ap90pref", "body": "ap90"},
    "PW": {"roots": ["PWK/prefaces"], "prefix": "pwpref", "body": "pw"},
    "GRA": {"roots": ["GRA/prefaces"], "prefix": "grapref", "body": "gra"},
    "SCH": {"roots": ["SCH/prefaces"], "prefix": "schpref", "body": "sch"},
    "CCS": {"roots": ["CCS/prefaces"], "prefix": "ccspref", "body": "ccs"},
    "MD": {"roots": ["MD/prefaces"], "prefix": "mdpref", "body": "md"},
    "CAE": {"roots": ["CAE/prefaces"], "prefix": "caepref", "body": "cae"},
    "BHS": {"roots": ["BHS/prefaces"], "prefix": "bhspref", "body": "bhs"},
    "MW": {"roots": ["MWS/prefaces"], "prefix": "mwpref", "body": "mw"},
    "MWE": {"roots": ["MWS/prefaces"], "prefix": "mwepref", "body": "mwe"},
    "MW72": {"roots": ["MW72/prefaces"], "prefix": "mw72pref", "body": "mw72"},
    "BEN": {"roots": ["BEN/prefaces"], "prefix": "benpref", "body": "ben"},
    "ACC": {"roots": ["ACC/prefaces"], "prefix": "accpref", "body": "acc"},
    "AE": {"roots": ["prefaces_ae/prefaces", "prefaces_ae"], "prefix": "aepref", "body": "ae"},
    "SHS": {"roots": ["SHS/prefaces"], "prefix": "shspref", "body": "shs"},
    "WIL": {"roots": ["Wil-YAT/prefaces"], "prefix": "wil", "body": "wil"},
    "YAT": {"roots": ["Wil-YAT/prefaces"], "prefix": "yat", "body": "yat"},
    "BOR": {"roots": ["BOR/prefaces"], "prefix": "borpref", "body": "bor"},
    "INM": {"roots": ["INM/prefaces"], "prefix": "inmpref", "body": "inm"},
    "VEI": {"roots": ["VEI/prefaces"], "prefix": "veipref", "body": "vei"},
    "IEG": {"roots": ["prefaces_ieg/prefaces", "prefaces_ieg"], "prefix": "iegpref", "body": "ieg"},
    "BUR": {"roots": ["BUR/prefaces"], "prefix": "burpref", "body": "bur"},
    "STC": {"roots": ["STC/prefaces"], "prefix": "stcpref", "body": "stc"},
    "BOP": {"roots": ["BOP/prefaces"], "prefix": "boppref", "body": "bop"},
    "VCP": {"roots": ["VCP/prefaces"], "prefix": "vcppref", "body": "vcp"},
    "KRM": {"roots": ["KRM/prefaces"], "prefix": "krmpref", "body": "krm"},
    "MCI": {"roots": ["MCI/prefaces"], "prefix": "mcipref", "body": "mci"},
    "GST": {"roots": ["prefaces_gst/prefaces", "prefaces_gst"], "prefix": "gstpref", "body": "gst"},
    "PGN": {"roots": ["prefaces_pgn/prefaces", "prefaces_pgn"], "prefix": "pgnpref", "body": "pgn"},
    "SNP": {"roots": ["prefaces_snp/prefaces", "prefaces_snp"], "prefix": "snppref", "body": "snp"},
    "LAN": {"roots": ["prefaces_lan/prefaces", "prefaces_lan"], "prefix": "lanpref", "body": "lan"},
}


def fold_diacritics(s: str) -> str:
    """NFD strip combining marks + a few OCR-common latin specials → ASCII-ish."""
    if not s:
        return s
    # Manual pre-map for chars that don't NFD cleanly for our use
    table = str.maketrans(
        {
            "ç": "c",
            "Ç": "C",
            "ß": "ss",
            "æ": "ae",
            "Æ": "AE",
            "œ": "oe",
            "Œ": "OE",
            "ð": "d",
            "Ð": "D",
            "þ": "th",
            "Þ": "TH",
            "ø": "o",
            "Ø": "O",
            "ł": "l",
            "Ł": "L",
            "ğ": "g",
            "ı": "i",
            "ſ": "s",
            "ǵ": "g",  # OCR Arǵ etc.
        }
    )
    s = s.translate(table)
    nfd = unicodedata.normalize("NFD", s)
    return "".join(c for c in nfd if unicodedata.category(c) != "Mn")


def _skip_line(raw: str) -> bool:
    s = raw.strip()
    if not s:
        return True
    if s.startswith(SKIP_LINE_PREFIXES):
        return True
    if s.startswith("<sub>") or s.startswith("## Page"):
        return True
    return False


def normalize_key(raw: str) -> str:
    k = raw.strip().replace("**", "").replace("*", "").strip()
    k = re.sub(r"\s+", " ", k)
    return k


def key_search_forms(key_norm: str) -> list[str]:
    forms: list[str] = []
    k = key_norm.strip()
    if not k:
        return forms
    forms.append(k)
    if k.endswith(".") and len(k) > 1:
        bare = k[:-1].rstrip()
        if bare and bare not in forms:
            forms.append(bare)
    return forms


def _parse_cell_abbr(cell: str) -> tuple[str, str] | None:
    """Parse one table cell that encodes an abbreviation."""
    cell = cell.strip()
    if not cell or cell.lower() in TABLE_HEADER_KEYS:
        return None
    # Drop leading (d.) style with only paren key
    m = RE_CELL_EQ.match(cell)
    if m:
        return m.group(1).strip(), m.group(2).strip()
    m = RE_PAREN_ABBR.match(cell)
    if m:
        # abl(ative). → key abl.  expansion ablative
        stem = m.group(1).rstrip(".")
        key = stem + "." if not stem.endswith(".") else stem
        return key, m.group(2).strip()
    # Bare "key. expansion" inside cell
    m = re.match(r"^([A-Za-zÀ-ÿ.]{1,24})\s+([A-Za-z(].{2,})$", cell)
    if m and len(m.group(1)) <= 20:
        return m.group(1).strip(), m.group(2).strip()
    return None


def parse_pref_line(line: str) -> list[tuple[str, str]]:
    """Return zero or more (key_raw, expansion) from a line."""
    if _skip_line(line):
        return []
    s = line.rstrip("\n")
    s_stripped = s.lstrip()
    if s_stripped.startswith("- "):
        s_stripped = s_stripped[2:]

    # Markdown table row
    if s_stripped.startswith("|") and not RE_TABLE_SEP.match(s_stripped):
        cells = [c.strip() for c in s_stripped.strip("|").split("|")]
        found: list[tuple[str, str]] = []
        # 2-col or 4-col key|meaning pairs
        if len(cells) in (2, 4):
            pairs = list(zip(cells[0::2], cells[1::2]))
            for k, e in pairs:
                if k.lower() in TABLE_HEADER_KEYS or e.lower() in TABLE_HEADER_KEYS:
                    continue
                if not k or not e:
                    continue
                # Prefer structured cell parse; else treat as key|expansion
                cell_parsed = _parse_cell_abbr(k) if "(" in k or "=" in k else None
                if cell_parsed:
                    found.append(cell_parsed)
                elif len(k) <= 50 and not k.startswith("---"):
                    found.append((k, e))
            if found:
                return found
        # 3-col CAE: each cell is self-contained abbr
        if len(cells) == 3:
            for cell in cells:
                cp = _parse_cell_abbr(cell)
                if cp:
                    found.append(cp)
            if found:
                return found
        return found

    m = RE_PWG_BOLD.match(s_stripped) or RE_PWG_BOLD.match(s)
    if m:
        return [(m.group(1).strip(), m.group(2).strip())]

    m = RE_EQ.match(s)
    if m:
        key = m.group(1).strip()
        if key and len(key) <= 60 and not key.startswith("="):
            return [(key, m.group(2).strip())]

    m = RE_AP90_DOT.match(s)
    if m:
        key = m.group(1).strip() + "."
        exp = m.group(2).strip()
        if 1 <= len(key) <= 50 and exp:
            return [(key, exp)]
    return []


def parse_pref_files(paths: Iterable[Path]) -> OrderedDict[str, dict]:
    keys: OrderedDict[str, dict] = OrderedDict()
    for path in paths:
        text = path.read_text(encoding="utf-8", errors="replace")
        for lineno, line in enumerate(text.splitlines(), 1):
            for key_raw, expansion in parse_pref_line(line):
                key_norm = normalize_key(key_raw)
                if not key_norm:
                    continue
                if key_norm in keys:
                    keys[key_norm]["sources"].append(f"{path.name}:{lineno}")
                    continue
                keys[key_norm] = {
                    "key_raw": key_raw,
                    "key_norm": key_norm,
                    "expansion": expansion[:200],
                    "sources": [f"{path.name}:{lineno}"],
                }
    return keys


def resolve_pref_root(dict_code: str) -> Path | None:
    meta = DICT_CATALOG.get(dict_code.upper())
    if not meta:
        return None
    for rel in meta["roots"]:
        p = GITHUB / rel
        if p.is_dir():
            return p
    return None


def _is_source_pref(name: str, prefix: str) -> bool:
    """Source-language pref page (exclude translations and consolidated)."""
    lower = name.lower()
    if not lower.endswith(".md"):
        return False
    if lower in ("readme.md",):
        return False
    if "pref_all" in lower:
        return False
    if re.search(r"\.(en|ru|de|fr|la|sa)\.md$", lower):
        # consolidated language files already excluded via pref_all; per-page .en.md etc.
        if re.search(r"pref\d+\.(en|ru|de|fr|la|sa)\.md$", lower):
            return False
        if re.search(r"^(wil|yat)\d+\.(en|ru)\.md$", lower):
            return False
    # WIL/YAT use wil01.md / yat01.md without "pref"
    if prefix in ("wil", "yat"):
        return bool(re.match(rf"^{prefix}\d+\.md$", lower))
    if not lower.startswith(prefix.lower()):
        return False
    # exclude pure translation siblings: foo.en.md already handled; also foo.ru.md
    if re.search(r"\.(en|ru)\.md$", lower):
        return False
    return True


def page_looks_like_abbr(path: Path) -> bool:
    try:
        head = path.read_text(encoding="utf-8", errors="replace")[:2500]
    except OSError:
        return False
    return bool(ABBREV_HINTS.search(head))


def discover_pref_paths(dict_code: str, all_source: bool = False) -> tuple[list[Path], str]:
    """Return (paths, note). Prefer abbr-hint pages; fallback to all source pages."""
    code = dict_code.upper()
    meta = DICT_CATALOG.get(code)
    if not meta:
        return [], f"unknown code {code} (not in DICT_CATALOG)"
    root = resolve_pref_root(code)
    if not root:
        return [], f"pref root missing (tried {meta['roots']})"
    prefix = meta["prefix"]
    candidates = sorted(
        p for p in root.iterdir() if p.is_file() and _is_source_pref(p.name, prefix)
    )
    if not candidates:
        return [], f"no source pref pages under {root} prefix={prefix}"
    if all_source:
        return candidates, "all_source"
    hinted = [p for p in candidates if page_looks_like_abbr(p)]
    if hinted:
        return hinted, f"abbr_hint ({len(hinted)}/{len(candidates)} pages)"
    return candidates, f"fallback_all_source ({len(candidates)} pages; no abbr hint)"


def resolve_body(dict_code: str, body_arg: str | None = None) -> Path | None:
    if body_arg:
        p = Path(body_arg)
        return p if p.is_file() else None
    code = dict_code.upper()
    body_code = DICT_CATALOG.get(code, {}).get("body", code.lower())
    candidates = [
        GITHUB / "csl-orig" / "v02" / body_code / f"{body_code}.txt",
        REPO.parent / "csl-orig" / "v02" / body_code / f"{body_code}.txt",
    ]
    for c in candidates:
        if c.is_file():
            return c.resolve()
    return None


def count_in_body(
    body: str,
    keys: OrderedDict[str, dict],
    sample_cap: int,
    min_key_chars: int,
    case_fold: bool = True,
    diacritic_fold: bool = True,
) -> list[dict]:
    rows: list[dict] = []
    line_starts = [0]
    start = 0
    while True:
        nl = body.find("\n", start)
        if nl < 0:
            break
        line_starts.append(nl + 1)
        start = nl + 1

    search_body = body
    if diacritic_fold:
        search_body = fold_diacritics(search_body)
    if case_fold:
        search_body = search_body.upper()

    def pos_to_line(pos: int) -> int:
        lo, hi = 0, len(line_starts) - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            if line_starts[mid] <= pos:
                lo = mid + 1
            else:
                hi = mid - 1
        return hi + 1

    def prep(form: str) -> str:
        s = form
        if diacritic_fold:
            s = fold_diacritics(s)
        if case_fold:
            s = s.upper()
        return s

    def count_form(form: str) -> tuple[int, list[str]]:
        if not form:
            return 0, []
        needle = prep(form)
        if not needle:
            return 0, []
        total = 0
        samples: list[str] = []
        flen = len(needle)
        pos = 0
        while True:
            idx = search_body.find(needle, pos)
            if idx < 0:
                break
            total += 1
            if len(samples) < sample_cap:
                samples.append(str(pos_to_line(idx)))
            pos = idx + max(flen, 1)
        return total, samples

    for key_norm, meta in keys.items():
        key_chars = len(re.sub(r"\s+", "", key_norm))
        short = key_chars < min_key_chars
        forms = key_search_forms(key_norm)
        primary = forms[0] if forms else key_norm
        total, samples = count_form(primary)
        if total == 0 and len(forms) > 1:
            total, samples = count_form(forms[1])
        rows.append(
            {
                "key_raw": meta["key_raw"],
                "key_norm": key_norm,
                "in_pref": 1,
                "body_count": total,
                "samples": ",".join(samples),
                "flag": "",
                "short_key": int(short),
                "expansion": meta.get("expansion", ""),
                "sources": ";".join(meta.get("sources", [])),
            }
        )
    return rows


def apply_flags(rows: list[dict], low_count: int) -> None:
    for r in rows:
        if r["short_key"]:
            if r["body_count"] == 0:
                r["flag"] = "short_pref_only"
            elif r["flag"] == "":
                r["flag"] = "short_key"
            continue
        if r["body_count"] == 0:
            r["flag"] = "pref_only"
        elif r["body_count"] <= low_count:
            r["flag"] = "low_count"


def write_tsv(path: Path, rows: list[dict]) -> None:
    cols = [
        "key_raw",
        "key_norm",
        "in_pref",
        "body_count",
        "samples",
        "flag",
        "short_key",
        "sources",
        "expansion",
    ]
    lines = ["\t".join(cols)]
    for r in rows:
        lines.append("\t".join(str(r.get(c, "")).replace("\t", " ") for c in cols))
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_report(
    path: Path,
    dict_code: str,
    pref_paths: list[Path],
    body_path: Path,
    rows: list[dict],
    low_count: int,
    min_key_chars: int,
    discover_note: str = "",
) -> None:
    n = len(rows)
    pref_only = [r for r in rows if r["flag"] == "pref_only"]
    low = [r for r in rows if r["flag"] == "low_count"]
    short = [r for r in rows if r["short_key"]]
    hit = [r for r in rows if r["body_count"] > 0 and not r["short_key"]]
    top = sorted(
        [r for r in rows if not r["short_key"]],
        key=lambda r: r["body_count"],
        reverse=True,
    )[:15]
    today = date.today().strftime("%d-%m-%Y")

    def _md_table(rs: list[dict], limit: int = 20) -> str:
        out = [
            "| key_norm | body_count | flag | samples |",
            "|---|---:|---|---|",
        ]
        for r in rs[:limit]:
            out.append(
                f"| `{r['key_norm']}` | {r['body_count']} | {r['flag'] or '—'} | {r['samples'] or '—'} |"
            )
        if not rs:
            out.append("| *(none)* | | | |")
        return "\n".join(out)

    hit_pct = f"{100.0 * len(hit) / n:.0f}%" if n else "—"
    body = f"""# Pref abbr × body `.txt` cross-check — {dict_code}

_Created: {today} · Last updated: {today}_

**Handoffs:** [H1530](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1530-Sonnet_csl-guides_pref-abbr-body-crosscheck_23.07.26.md) · [H1543](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1543-Sonnet_csl-guides_pref-abbr-crosscheck-all_23.07.26.md) · **Issue:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123)  
**Tool:** [`scripts/pref_abbr_crosscheck.py`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/pref_abbr_crosscheck.py)

## Policy (H1569)

- **Body `.txt` wins** for how a work is *named* (siglum orthography).
- Pref legend keys are corrected **toward body** via gated apply + change log — not left as raw OCR when body attests a form.
- **Expansions** (titles) remain scan-faithful; this census does not rewrite them.
- Short keys (&lt; {min_key_chars} non-space chars) flagged `short_key`.
- Hold without body attestation: rare/MS works, long bib titles, ambiguous keys.

## Inputs

| Role | Value |
|------|------|
| Pref sources | {", ".join(f"`{p.name}`" for p in pref_paths)} |
| Discover | {discover_note or "—"} |
| Body | `{body_path.name}` ({body_path.stat().st_size:,} bytes) |
| Folds | case + diacritic (default) |

## Summary

| Metric | n |
|--------|--:|
| Keys parsed | {n} |
| Hits (non-short) | {len(hit)} ({hit_pct}) |
| `pref_only` | {len(pref_only)} |
| `low_count` (≤{low_count}) | {len(low)} |
| Short keys | {len(short)} |

## Top body hits (non-short)

{_md_table(top, 15)}

## `pref_only` sample

{_md_table(pref_only[:20], 20)}

## `low_count` sample

{_md_table(low, 15)}

## Reproduce

```text
python scripts/pref_abbr_crosscheck.py --dict {dict_code} --out-dir scripts/out
```

TSV: [`{dict_code.lower()}_pref_abbr_crosscheck.tsv`](./{dict_code.lower()}_pref_abbr_crosscheck.tsv)

---

_Auto-generated by pref_abbr_crosscheck.py (H1543)._
"""
    path.write_text(body, encoding="utf-8")


def write_rollup(path: Path, summaries: list[dict]) -> None:
    today = date.today().strftime("%d-%m-%Y")
    lines = [
        "# Pref abbr × body cross-check — ALL rollup",
        "",
        f"_Created: {today} · Last updated: {today}_",
        "",
        "**Handoff:** [H1543](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1543-Sonnet_csl-guides_pref-abbr-crosscheck-all_23.07.26.md) · "
        "**Issue:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123) · "
        "**Tool:** [`pref_abbr_crosscheck.py`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/pref_abbr_crosscheck.py)",
        "",
        "## Policy (H1569)",
        "",
        "- Body `.txt` wins for siglum *naming*; pref keys align toward body (gated apply + change log).",
        "- Expansions stay scan-faithful; residual `pref_only` is typed (ortho / ocr / spacing / rare / true_unused).",
        "- Do not invent forms with zero body hits; do not delete rare/MS legend keys solely for body silence.",
        "",
        "## Rollup",
        "",
        "| Dict | wave | status | keys | hits | hit% | pref_only | low_count | short | pref pages | note |",
        "|------|------|--------|-----:|-----:|-----:|----------:|----------:|------:|-----------:|------|",
    ]
    for s in summaries:
        if s.get("status") != "ok":
            lines.append(
                f"| {s.get('dict','?')} | {s.get('wave','—')} | `{s.get('status')}` | "
                f"— | — | — | — | — | — | — | {s.get('note','')} |"
            )
            continue
        keys = s["keys"]
        hits = s["hits_nonshort"]
        pct = f"{100.0 * hits / keys:.0f}" if keys else "—"
        lines.append(
            f"| **{s['dict']}** | {s.get('wave','—')} | ok | {keys} | {hits} | {pct}% | "
            f"{s['pref_only']} | {s['low_count']} | {s.get('short',0)} | "
            f"{s.get('pref_pages',0)} | {s.get('discover','')} |"
        )
    ok = [s for s in summaries if s.get("status") == "ok"]
    tot_keys = sum(s["keys"] for s in ok)
    tot_hits = sum(s["hits_nonshort"] for s in ok)
    tot_po = sum(s["pref_only"] for s in ok)
    lines.extend(
        [
            "",
            f"**Ran OK:** {len(ok)} / {len(summaries)} · **keys:** {tot_keys} · "
            f"**hits:** {tot_hits} · **pref_only:** {tot_po}",
            "",
            "## Reproduce",
            "",
            "```text",
            "python scripts/pref_abbr_crosscheck.py --all --out-dir scripts/out --json-summary",
            "```",
            "",
            "---",
            "",
            "_Auto-generated by pref_abbr_crosscheck.py (H1543)._",
            "",
        ]
    )
    path.write_text("\n".join(lines), encoding="utf-8")


def run_one(
    dict_code: str,
    out_dir: Path,
    *,
    pref_override: list[Path] | None = None,
    body_override: Path | None = None,
    min_key_chars: int = DEFAULT_MIN_KEY_CHARS,
    low_count: int = DEFAULT_LOW_COUNT,
    sample_cap: int = DEFAULT_SAMPLE_CAP,
    case_fold: bool = True,
    diacritic_fold: bool = True,
    all_source: bool = False,
    json_summary: bool = False,
    wave: str = "—",
) -> dict:
    code = dict_code.upper()
    discover_note = ""
    if pref_override:
        pref_paths = [Path(p).resolve() for p in pref_override]
        discover_note = "cli --pref"
    else:
        pref_paths, discover_note = discover_pref_paths(code, all_source=all_source)
    if not pref_paths:
        return {
            "dict": code,
            "wave": wave,
            "status": "skip_no_pref",
            "note": discover_note,
        }
    body_path = resolve_body(code, str(body_override) if body_override else None)
    if not body_path:
        return {
            "dict": code,
            "wave": wave,
            "status": "skip_no_body",
            "note": "csl-orig body .txt not found",
            "discover": discover_note,
        }

    print(f"\n=== {code} ===", flush=True)
    print(f"pref={len(pref_paths)} ({discover_note})", flush=True)
    print(f"body={body_path} ({body_path.stat().st_size:,} B)", flush=True)

    keys = parse_pref_files(pref_paths)
    # If abbr-hint pages yielded nothing, retry all source pages once
    if not keys and not all_source and "abbr_hint" in discover_note:
        alt_paths, alt_note = discover_pref_paths(code, all_source=True)
        if alt_paths and alt_paths != pref_paths:
            keys2 = parse_pref_files(alt_paths)
            if keys2:
                pref_paths, discover_note, keys = alt_paths, alt_note + " (retry after 0 keys)", keys2
                print(f"retry all_source → {len(keys)} keys", flush=True)
    print(f"parsed {len(keys)} keys", flush=True)
    if not keys:
        return {
            "dict": code,
            "wave": wave,
            "status": "skip_zero_keys",
            "note": f"0 keys from {len(pref_paths)} pages ({discover_note})",
            "pref_pages": len(pref_paths),
            "discover": discover_note,
        }

    body = body_path.read_text(encoding="utf-8", errors="replace")
    rows = count_in_body(
        body,
        keys,
        sample_cap=sample_cap,
        min_key_chars=min_key_chars,
        case_fold=case_fold,
        diacritic_fold=diacritic_fold,
    )
    apply_flags(rows, low_count=low_count)
    flag_rank = {"pref_only": 0, "low_count": 1, "short_pref_only": 2, "short_key": 3, "": 4}
    rows.sort(key=lambda r: (flag_rank.get(r["flag"], 9), -r["body_count"], r["key_norm"]))

    out_dir.mkdir(parents=True, exist_ok=True)
    stem = f"{code.lower()}_pref_abbr_crosscheck"
    tsv_path = out_dir / f"{stem}.tsv"
    md_path = out_dir / f"{stem}.md"
    write_tsv(tsv_path, rows)
    write_report(
        md_path,
        code,
        pref_paths,
        body_path,
        rows,
        low_count=low_count,
        min_key_chars=min_key_chars,
        discover_note=discover_note,
    )

    pref_only_n = sum(1 for r in rows if r["flag"] == "pref_only")
    low_n = sum(1 for r in rows if r["flag"] == "low_count")
    short_n = sum(1 for r in rows if r["short_key"])
    hit_n = sum(1 for r in rows if r["body_count"] > 0 and not r["short_key"])
    summary = {
        "dict": code,
        "wave": wave,
        "status": "ok",
        "keys": len(rows),
        "hits_nonshort": hit_n,
        "pref_only": pref_only_n,
        "low_count": low_n,
        "short": short_n,
        "pref_pages": len(pref_paths),
        "discover": discover_note,
        "body": str(body_path),
        "tsv": str(tsv_path),
        "report": str(md_path),
        "date": date.today().isoformat(),
    }
    if json_summary:
        js = out_dir / f"{stem}.summary.json"
        js.write_text(json.dumps(summary, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({k: summary[k] for k in ("dict", "keys", "hits_nonshort", "pref_only", "low_count", "status")}), flush=True)
    return summary


def self_check() -> int:
    sample = """
# Erklärung der Abkürzungen.

**AK.** = Amarakosha nach der Ausgabe von Colebrooke.
**AV.** = Atharvavedasaṃhitâ.
**Âçv. Çr.** = Âçvalâjana's Çrautasûtrâni.
**an.** = Anekârthasaṃgraha.

 Ait Br. Aitareya Brâhmaṇa (Bombay).
 Bg. Bhagavadgîtâ (Bombay).
 a. Adjective.
"""
    tmp = HERE / "_selfcheck_pref.md"
    tmp.write_text(sample, encoding="utf-8")
    try:
        keys = parse_pref_files([tmp])
        assert "AK." in keys, list(keys)
        assert "AV." in keys
        norms = set(keys)
        assert any(k.startswith("Ait") for k in norms), norms
        assert any(k.startswith("Bg") for k in norms), norms
        assert any("çv" in k.lower() or "Acv" in fold_diacritics(k) for k in norms), norms
        # table + paren forms
        table_sample = "| abs. | absolute. |\n| abl(ative). | ger(und). | p(ossessive). |\n"
        tkeys = parse_pref_files([])  # no-op path
        from io import StringIO  # noqa: F401 — keep stdlib-only mindset
        tpath = HERE / "_selfcheck_table.md"
        tpath.write_text(
            "# List of Abbreviations\n\n| Abbr. | Meaning |\n|---|---|\n| abs. | absolute. |\n| AV. | Atharva-veda. |\n",
            encoding="utf-8",
        )
        tkeys = parse_pref_files([tpath])
        tpath.unlink(missing_ok=True)
        assert "abs." in tkeys or "AV." in tkeys, tkeys
        body = "see <ls>AK. 1,2</ls> and <ls>AV. 3</ls> again AK. once <ls>ACV. CR. 1</ls>"
        rows = count_in_body(
            body, keys, sample_cap=2, min_key_chars=3, case_fold=True, diacritic_fold=True
        )
        by = {r["key_norm"]: r for r in rows}
        assert by["AK."]["body_count"] == 2, by["AK."]
        assert by["AV."]["body_count"] >= 1, by["AV."]
        acv_keys = [k for k in by if "cv" in fold_diacritics(k).lower() or "çv" in k.lower()]
        assert acv_keys, "expected Âçv key"
        assert by[acv_keys[0]]["body_count"] >= 1, by[acv_keys[0]]
        assert fold_diacritics("Âçv.").upper() == "ACV."
        apply_flags(rows, low_count=3)
        assert "PWG" in DICT_CATALOG and "MW" in DICT_CATALOG
        print(
            "self-check OK:",
            len(keys),
            "keys; AK.=",
            by["AK."]["body_count"],
            "diacritic_hit=",
            by[acv_keys[0]]["body_count"],
            "table_keys=",
            len(tkeys),
        )
        return 0
    finally:
        if tmp.is_file():
            tmp.unlink()


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(
        description="Cross-check pref OCR abbreviation keys against dictionary body .txt"
    )
    ap.add_argument("--dict", dest="dict_code", help="Dictionary code (PWG, AP90, …)")
    ap.add_argument(
        "--all",
        action="store_true",
        help="Run all catalog codes (waves A+B+C)",
    )
    ap.add_argument(
        "--wave",
        choices=["A", "B", "C", "all", "ALL"],
        help="Run a named wave (A/B/C) or all",
    )
    ap.add_argument("--pref", nargs="+", type=Path, help="Override pref Markdown file(s)")
    ap.add_argument("--body", type=Path, help="Override body .txt path")
    ap.add_argument("--out-dir", type=Path, default=HERE / "out")
    ap.add_argument("--min-key-chars", type=int, default=DEFAULT_MIN_KEY_CHARS)
    ap.add_argument("--low-count", type=int, default=DEFAULT_LOW_COUNT)
    ap.add_argument("--sample-cap", type=int, default=DEFAULT_SAMPLE_CAP)
    ap.add_argument("--no-case-fold", action="store_true")
    ap.add_argument(
        "--no-diacritic-fold",
        action="store_true",
        help="Disable diacritic folding (default folds Âçv.→Acv.)",
    )
    ap.add_argument(
        "--all-source-pages",
        action="store_true",
        help="Use all source pref pages, not only abbr-hint pages",
    )
    ap.add_argument("--list-catalog", action="store_true", help="Print DICT_CATALOG and exit")
    ap.add_argument("--self-check", action="store_true")
    ap.add_argument("--json-summary", action="store_true")
    args = ap.parse_args(argv)

    if args.self_check:
        return self_check()

    if args.list_catalog:
        for code, meta in sorted(DICT_CATALOG.items()):
            root = resolve_pref_root(code)
            body = resolve_body(code)
            print(
                f"{code:6} roots={meta['roots']} prefix={meta['prefix']} "
                f"body={'yes' if body else 'NO'} pref={'yes' if root else 'NO'}"
            )
        return 0

    codes: list[tuple[str, str]] = []  # (code, wave)
    if args.all or (args.wave and args.wave.upper() == "ALL"):
        for wname, wcodes in (("A", WAVE_A), ("B", WAVE_B), ("C", WAVE_C)):
            for c in wcodes:
                codes.append((c, wname))
    elif args.wave:
        w = args.wave.upper()
        for c in WAVES[w]:
            codes.append((c, w))
    elif args.dict_code:
        codes.append((args.dict_code.upper(), "—"))
    else:
        ap.error("provide --dict CODE, --wave A|B|C|all, --all, --self-check, or --list-catalog")

    summaries: list[dict] = []
    for code, wave in codes:
        try:
            s = run_one(
                code,
                Path(args.out_dir),
                pref_override=list(args.pref) if args.pref and len(codes) == 1 else None,
                body_override=args.body if args.body and len(codes) == 1 else None,
                min_key_chars=args.min_key_chars,
                low_count=args.low_count,
                sample_cap=args.sample_cap,
                case_fold=not args.no_case_fold,
                diacritic_fold=not args.no_diacritic_fold,
                all_source=args.all_source_pages,
                json_summary=args.json_summary,
                wave=wave,
            )
        except Exception as exc:  # noqa: BLE001 — batch continues
            s = {
                "dict": code,
                "wave": wave,
                "status": "error",
                "note": str(exc)[:200],
            }
            print(f"ERROR {code}: {exc}", flush=True)
        summaries.append(s)

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    if len(summaries) > 1:
        rollup_md = out_dir / "ALL_pref_abbr_crosscheck.md"
        rollup_json = out_dir / "ALL_pref_abbr_crosscheck.summary.json"
        write_rollup(rollup_md, summaries)
        rollup_json.write_text(
            json.dumps(summaries, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
        )
        print(f"\nwrote {rollup_md}", flush=True)
        print(f"wrote {rollup_json}", flush=True)
        ok = sum(1 for s in summaries if s.get("status") == "ok")
        print(f"batch done: {ok}/{len(summaries)} ok", flush=True)

    return 0 if any(s.get("status") == "ok" for s in summaries) or len(summaries) == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
