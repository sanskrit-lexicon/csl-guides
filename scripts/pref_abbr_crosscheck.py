# -*- coding: utf-8 -*-
"""pref_abbr_crosscheck.py — census pref OCR abbreviation keys vs body .txt.

Cross-check CDSL front-matter abbreviation legends (pref Markdown OCR) against
dictionary body text in csl-orig. Body is a *third channel* for prioritising
review loci — it does **not** auto-overwrite pref OCR or modernise 19th-c.
orthography. Full-diff of Vorwort/title pages is out of scope.

H1530 / csl-guides#123. stdlib only.

Examples (from csl-guides repo root)::

    python scripts/pref_abbr_crosscheck.py --dict PWG --self-check
    python scripts/pref_abbr_crosscheck.py --dict PWG \\
        --pref ../PWG/prefaces/pwgpref07.md ../PWG/prefaces/pwgpref08.md \\
        --out-dir scripts/out
    python scripts/pref_abbr_crosscheck.py --dict AP90 \\
        --pref ../AP90/prefaces/ap90pref05.md ../AP90/prefaces/ap90pref06.md \\
        --out-dir scripts/out
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from collections import OrderedDict
from datetime import date
from pathlib import Path
from typing import Iterable

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

HERE = Path(__file__).resolve().parent
REPO = HERE.parent
GITHUB = REPO.parent  # …/GitHub

# Prefer keys with this many non-space chars (short keys flood body false positives).
DEFAULT_MIN_KEY_CHARS = 3
DEFAULT_SAMPLE_CAP = 3
DEFAULT_LOW_COUNT = 3

# PWG: **KEY** = expansion  (optional leading * for rare/starred works)
RE_PWG_BOLD = re.compile(
    r"^\*?\s*\*\*(.+?)\*\*\s*=\s*(.+)$"
)
# Generic: KEY = expansion  (no markdown bold)
RE_EQ = re.compile(
    r"^[\s\u00a0]*([^*\n=]{1,60}?)\s*=\s+(.+)$"
)
# AP90 works/grammar: " Key. Expansion..." (key ends with '.' before expansion)
RE_AP90_DOT = re.compile(
    r"^[\s\u00a0]+(.+?)\.\s+([A-Za-zÀ-ÿ(].*)$"
)

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
    """Light normalize for body search: strip markdown, collapse space, keep period."""
    k = raw.strip()
    k = k.replace("**", "").replace("*", "").strip()
    k = re.sub(r"\s+", " ", k)
    return k


def key_search_forms(key_norm: str) -> list[str]:
    """Body search variants: as-is, and without trailing period if present."""
    forms: list[str] = []
    k = key_norm.strip()
    if not k:
        return forms
    forms.append(k)
    if k.endswith(".") and len(k) > 1:
        bare = k[:-1].rstrip()
        if bare and bare not in forms:
            forms.append(bare)
    # Inside <ls> tags body often has "KEY. " or "KEY " — keep forms as substrings
    return forms


def parse_pref_line(line: str) -> tuple[str, str] | None:
    """Return (key_raw, expansion) or None."""
    if _skip_line(line):
        return None
    # Drop leading list bullets
    s = line.rstrip("\n")
    s_stripped = s.lstrip()
    if s_stripped.startswith("- "):
        s_stripped = s_stripped[2:]

    m = RE_PWG_BOLD.match(s_stripped) or RE_PWG_BOLD.match(s)
    if m:
        return m.group(1).strip(), m.group(2).strip()

    m = RE_EQ.match(s)
    if m:
        key = m.group(1).strip()
        # Reject pure decorative / empty / leading "=" lines
        if key and len(key) <= 60 and not key.startswith("="):
            return key, m.group(2).strip()

    m = RE_AP90_DOT.match(s)
    if m:
        key = m.group(1).strip() + "."
        exp = m.group(2).strip()
        # Reject very long "keys" (misparsed prose)
        if 1 <= len(key) <= 50 and exp:
            return key, exp

    return None


def parse_pref_files(paths: Iterable[Path]) -> OrderedDict[str, dict]:
    """Parse keys from pref Markdown files. First raw form wins for duplicates."""
    keys: OrderedDict[str, dict] = OrderedDict()
    for path in paths:
        text = path.read_text(encoding="utf-8", errors="replace")
        for lineno, line in enumerate(text.splitlines(), 1):
            parsed = parse_pref_line(line)
            if not parsed:
                continue
            key_raw, expansion = parsed
            key_norm = normalize_key(key_raw)
            if not key_norm:
                continue
            # Dedup by normalized key
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


def resolve_body(dict_code: str, body_arg: str | None) -> Path:
    code = dict_code.lower()
    if body_arg:
        p = Path(body_arg)
        if not p.is_file():
            raise SystemExit(f"ERROR: body file not found: {p}")
        return p
    candidates = [
        GITHUB / "csl-orig" / "v02" / code / f"{code}.txt",
        REPO.parent / "csl-orig" / "v02" / code / f"{code}.txt",
        Path(f"../csl-orig/v02/{code}/{code}.txt"),
        Path(f"../../csl-orig/v02/{code}/{code}.txt"),
    ]
    for c in candidates:
        if c.is_file():
            return c.resolve()
    raise SystemExit(
        f"ERROR: cannot resolve body .txt for {dict_code}; pass --body PATH. "
        f"Tried: {', '.join(str(c) for c in candidates)}"
    )


def default_pref_paths(dict_code: str) -> list[Path]:
    code = dict_code.upper()
    if code == "PWG":
        base = GITHUB / "PWG" / "prefaces"
        # Abbr pages: pwgpref07–11 (legend); include 07-11 only
        paths = [base / f"pwgpref{i:02d}.md" for i in range(7, 12)]
        return [p for p in paths if p.is_file()]
    if code == "AP90":
        base = GITHUB / "AP90" / "prefaces"
        paths = [base / "ap90pref05.md", base / "ap90pref06.md"]
        return [p for p in paths if p.is_file()]
    raise SystemExit(
        f"ERROR: no default pref paths for {dict_code}; pass --pref FILE ..."
    )


def count_in_body(
    body: str,
    keys: OrderedDict[str, dict],
    sample_cap: int,
    min_key_chars: int,
    case_fold: bool = True,
) -> list[dict]:
    """Count each key in body text (single load). One primary form per key.

    Search order: key_norm as-is; if zero hits and key ends with '.', try bare
    form without the period (no double-count of overlapping forms).

    case_fold=True (default): compare uppercased key against uppercased body.
    Needed for PWG where pref has ``Bhag.`` / ``Ait. Br.`` but body has
    ``BHAG.`` / ``AIT. BR.``. Diacritic folding is out of scope for v1.
    """
    rows: list[dict] = []
    # Line starts via str.find (faster than per-char scan on large bodies)
    line_starts = [0]
    start = 0
    while True:
        nl = body.find("\n", start)
        if nl < 0:
            break
        line_starts.append(nl + 1)
        start = nl + 1

    search_body = body.upper() if case_fold else body

    def pos_to_line(pos: int) -> int:
        lo, hi = 0, len(line_starts) - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            if line_starts[mid] <= pos:
                lo = mid + 1
            else:
                hi = mid - 1
        return hi + 1  # 1-based

    def count_form(form: str) -> tuple[int, list[str]]:
        if not form:
            return 0, []
        needle = form.upper() if case_fold else form
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
        # Fallback bare form only when primary has zero hits
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
    zero_sample = pref_only[:20]
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

    body = f"""# Pref abbr × body `.txt` cross-check — {dict_code}

_Created: {today} · Last updated: {today}_

**Handoff:** [H1530](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1530-Sonnet_csl-guides_pref-abbr-body-crosscheck_23.07.26.md) · **Issue:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123)  
**Tool:** [`scripts/pref_abbr_crosscheck.py`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/pref_abbr_crosscheck.py)  
**Model provenance:** Grok 4.5 (`grok-4.5`) executing H1530 (filename tier Sonnet; mechanical census).

## Non-goals

- **No bulk overwrite** of `prefaces/*.md` from body matches.
- **Scan remains truth** for expansions (OCR of the printed legend).
- Body is a **prioritisation channel** only (pref_only / low_count flags).
- Do **not** full-diff Vorwort/title pages against body prose.
- Short keys (&lt; {min_key_chars} non-space chars) are counted but flagged `short_key` — high false-positive risk (`s.`, `v.`, `a.`).

## Inputs

| Role | Path |
|------|------|
| Pref sources | {", ".join(f"`{p.name}`" for p in pref_paths)} |
| Body | `{body_path.name}` under csl-orig (`{body_path.stat().st_size:,}` bytes) |
| low_count threshold | ≤ {low_count} |
| min_key_chars | {min_key_chars} |
| case fold | yes (default; PWG body keys are UPPER) |

## Summary

| Metric | n |
|--------|--:|
| Keys parsed from pref | {n} |
| Non-short keys with body_count &gt; 0 | {len(hit)} |
| `pref_only` (non-short, body_count = 0) | {len(pref_only)} |
| `low_count` (1…{low_count}) | {len(low)} |
| Short keys (excluded from main flags) | {len(short)} |

## Top body hits (non-short)

{_md_table(top, 15)}

## `pref_only` sample (keys in pref legend, zero body hits)

These are **review candidates** (OCR key mismatch, rare/starred works, orthography drift, or true unused abbreviations) — not auto-fixes.

{_md_table(zero_sample, 20)}

## `low_count` sample

{_md_table(low, 15)}

## Residual notes

- Case is folded by default (pref `Bhag.` matches body `BHAG.`).
- Diacritic / OCR orthography is **not** folded in v1 (`Âçv.` ≠ body `ACV.`, `Çâk.` ≠ `SAK.`).
  High `pref_only` on PWG is therefore expected and mostly review-queue signal, not proof the abbreviation is unused.
- Compound keys with spaces (`Ait. Br.`, `H. an.`) need the body to use the same spacing.

## Reproduce

```text
python scripts/pref_abbr_crosscheck.py --dict {dict_code} --out-dir scripts/out
```

Companion TSV: [`{dict_code.lower()}_pref_abbr_crosscheck.tsv`](./{dict_code.lower()}_pref_abbr_crosscheck.tsv)

---

_Auto-generated by pref_abbr_crosscheck.py (H1530)._
"""
    path.write_text(body, encoding="utf-8")


def self_check() -> int:
    """Tiny fixture parse + count without needing real dict files."""
    sample = """
# Erklärung der Abkürzungen.

**AK.** = Amarakosha nach der Ausgabe von Colebrooke.
**AV.** = Atharvavedasaṃhitâ.
**an.** = Anekârthasaṃgraha.

 Ait Br. Aitareya Brâhmaṇa (Bombay).
 Bg. Bhagavadgîtâ (Bombay).
 a. Adjective.
"""
    tmp = HERE / "_selfcheck_pref.md"
    tmp.write_text(sample, encoding="utf-8")
    try:
        keys = parse_pref_files([tmp])
        assert "AK." in keys, keys.keys()
        assert "AV." in keys
        assert "Ait Br." in keys or "Ait Br" in {normalize_key(k) for k in keys}
        # AP90-style "Ait Br." 
        norms = set(keys)
        assert any(k.startswith("Ait") for k in norms), norms
        assert any(k.startswith("Bg") for k in norms), norms
        body = "see <ls>AK. 1,2</ls> and <ls>AV. 3</ls> again AK. once"
        rows = count_in_body(body, keys, sample_cap=2, min_key_chars=3)
        by = {r["key_norm"]: r for r in rows}
        assert by["AK."]["body_count"] == 2, by["AK."]
        assert by["AV."]["body_count"] >= 1, by["AV."]
        apply_flags(rows, low_count=3)
        print(
            "self-check OK:",
            len(keys),
            "keys;",
            "AK. count=",
            by["AK."]["body_count"],
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
        "--pref",
        nargs="+",
        type=Path,
        help="Pref Markdown file(s); default: known abbr pages for --dict",
    )
    ap.add_argument("--body", type=Path, help="Body .txt path (default: csl-orig/v02/…)")
    ap.add_argument(
        "--out-dir",
        type=Path,
        default=HERE / "out",
        help="Output directory for TSV + MD (default: scripts/out)",
    )
    ap.add_argument("--min-key-chars", type=int, default=DEFAULT_MIN_KEY_CHARS)
    ap.add_argument("--low-count", type=int, default=DEFAULT_LOW_COUNT)
    ap.add_argument("--sample-cap", type=int, default=DEFAULT_SAMPLE_CAP)
    ap.add_argument(
        "--no-case-fold",
        action="store_true",
        help="Exact-case body search (default folds case; PWG body is UPPER)",
    )
    ap.add_argument("--self-check", action="store_true", help="Run fixture self-check and exit")
    ap.add_argument("--json-summary", action="store_true", help="Also write summary JSON")
    args = ap.parse_args(argv)

    if args.self_check:
        return self_check()

    if not args.dict_code:
        ap.error("--dict is required (unless --self-check)")

    dict_code = args.dict_code.upper()
    pref_paths = [Path(p).resolve() for p in args.pref] if args.pref else default_pref_paths(dict_code)
    if not pref_paths:
        raise SystemExit(f"ERROR: no pref files found for {dict_code}")
    for p in pref_paths:
        if not p.is_file():
            raise SystemExit(f"ERROR: pref file not found: {p}")

    body_path = resolve_body(dict_code, str(args.body) if args.body else None)
    print(f"dict={dict_code}", flush=True)
    print(f"pref={len(pref_paths)} files:", *[str(p) for p in pref_paths], sep="\n  ", flush=True)
    print(f"body={body_path} ({body_path.stat().st_size:,} bytes)", flush=True)

    keys = parse_pref_files(pref_paths)
    print(f"parsed {len(keys)} unique keys", flush=True)
    if not keys:
        raise SystemExit("ERROR: zero keys parsed — check pref format / paths")

    print("loading body…", flush=True)
    body = body_path.read_text(encoding="utf-8", errors="replace")
    print(f"body chars={len(body):,}; counting…", flush=True)
    rows = count_in_body(
        body,
        keys,
        sample_cap=args.sample_cap,
        min_key_chars=args.min_key_chars,
        case_fold=not args.no_case_fold,
    )
    apply_flags(rows, low_count=args.low_count)
    # Stable sort: pref_only first, then low_count, then by body_count desc
    flag_rank = {"pref_only": 0, "low_count": 1, "short_pref_only": 2, "short_key": 3, "": 4}
    rows.sort(key=lambda r: (flag_rank.get(r["flag"], 9), -r["body_count"], r["key_norm"]))

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    stem = f"{dict_code.lower()}_pref_abbr_crosscheck"
    tsv_path = out_dir / f"{stem}.tsv"
    md_path = out_dir / f"{stem}.md"
    write_tsv(tsv_path, rows)
    write_report(
        md_path,
        dict_code,
        pref_paths,
        body_path,
        rows,
        low_count=args.low_count,
        min_key_chars=args.min_key_chars,
    )

    pref_only_n = sum(1 for r in rows if r["flag"] == "pref_only")
    low_n = sum(1 for r in rows if r["flag"] == "low_count")
    hit_n = sum(1 for r in rows if r["body_count"] > 0 and not r["short_key"])
    summary = {
        "dict": dict_code,
        "keys": len(rows),
        "hits_nonshort": hit_n,
        "pref_only": pref_only_n,
        "low_count": low_n,
        "body": str(body_path),
        "pref": [str(p) for p in pref_paths],
        "tsv": str(tsv_path),
        "report": str(md_path),
        "date": date.today().isoformat(),
    }
    if args.json_summary:
        js = out_dir / f"{stem}.summary.json"
        js.write_text(json.dumps(summary, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"wrote {js}", flush=True)

    print(json.dumps(summary, ensure_ascii=False), flush=True)
    print(f"wrote {tsv_path}", flush=True)
    print(f"wrote {md_path}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
