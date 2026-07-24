# -*- coding: utf-8 -*-
"""pref_key_body_align.py — apply body-attested pref legend key renames (H1569/H1571).

Policy: csl-orig body .txt wins for *naming* of works. Pref OCR keys are
rewritten toward body forms when a classify row provides alt_form with
alt_body_count >= 1. Every change is written to a change-log meta document.

Examples::

    python scripts/pref_key_body_align.py --dict AP90 --apply
    python scripts/pref_key_body_align.py --all --apply
    python scripts/pref_key_body_align.py --all --dry-run
"""
from __future__ import annotations

import argparse
import csv
import re
import sys
from datetime import date
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

HERE = Path(__file__).resolve().parent
REPO = HERE.parent
GITHUB = REPO.parent
TODAY = date.today().strftime("%d-%m-%Y")

sys.path.insert(0, str(HERE))
from pref_abbr_crosscheck import DICT_CATALOG, resolve_pref_root  # noqa: E402

APPLY_CLASSES = frozenset({"ortho", "ocr_key", "spacing"})
MIN_ALT_BODY = 1


def load_apply_rows(tsv: Path) -> list[dict]:
    rows: list[dict] = []
    with tsv.open(encoding="utf-8") as f:
        for r in csv.DictReader(f, delimiter="\t"):
            cls = (r.get("class") or "").strip()
            alt = (r.get("alt_form") or "").strip()
            try:
                n = int(r.get("alt_body_count") or 0)
            except ValueError:
                n = 0
            if cls not in APPLY_CLASSES:
                continue
            if not alt or n < MIN_ALT_BODY:
                continue
            old = (r.get("key_norm") or "").strip()
            if not old or old == alt:
                continue
            rows.append(
                {
                    "old": old,
                    "new": alt,
                    "class": cls,
                    "confidence": r.get("confidence", ""),
                    "alt_body_count": n,
                    "sources": r.get("sources", ""),
                    "notes": r.get("notes", ""),
                    "expansion": (r.get("expansion") or "")[:120],
                }
            )
    rows.sort(key=lambda x: -len(x["old"]))
    return rows


def pref_source_files(root: Path, prefix: str) -> list[Path]:
    out: list[Path] = []
    if not root.is_dir():
        return out
    for p in sorted(root.iterdir()):
        if not p.is_file() or not p.name.endswith(".md"):
            continue
        low = p.name.lower()
        if low in ("readme.md",) or "methods" in low:
            continue
        if "pref_all" in low or low.endswith(".meta.md"):
            continue
        if "change" in low and "align" in low:
            continue
        if not low.startswith(prefix.lower()):
            # wil01.md / yat01.md style
            if prefix in ("wil", "yat") and re.match(rf"^{prefix}\d+", low):
                out.append(p)
            continue
        out.append(p)
    return out


def replace_key_in_text(text: str, old: str, new: str) -> tuple[str, int]:
    n = 0
    bold_old = f"**{old}**"
    bold_new = f"**{new}**"
    if bold_old in text:
        c = text.count(bold_old)
        text = text.replace(bold_old, bold_new)
        n += c
    # Table cells: | old | expansion |
    pat_cell = re.compile(
        rf"(?m)^(\|[ \t]*)({re.escape(old)})([ \t]*\|)"
    )
    text2, c2 = pat_cell.subn(rf"\1{new}\3", text)
    if c2:
        text = text2
        n += c2
    # Eq style: KEY = at line start
    pat = re.compile(rf"(?m)^(\s*)({re.escape(old)})(\s*=\s+)")
    text3, c3 = pat.subn(rf"\1{new}\3", text)
    if c3:
        text = text3
        n += c3
    # Indented AP90-style: "  KEY. expansion" — only exact key token at start
    pat_ind = re.compile(rf"(?m)^([ \t]+)({re.escape(old)})(\s+)")
    text4, c4 = pat_ind.subn(rf"\1{new}\3", text)
    if c4:
        text = text4
        n += c4
    return text, n


def apply_dict(code: str, dry_run: bool) -> dict:
    code = code.upper()
    if code not in DICT_CATALOG:
        raise SystemExit(f"unknown dict {code}")
    meta = DICT_CATALOG[code]
    root = resolve_pref_root(code)
    tsv = HERE / "out" / f"{code.lower()}_pref_only_decompose.tsv"
    if not tsv.is_file():
        print(f"=== {code} === SKIP no decompose TSV", flush=True)
        return {"dict": code, "status": "skip_no_tsv", "changes": 0, "replacements": 0}
    if not root or not root.is_dir():
        print(f"=== {code} === SKIP no pref root", flush=True)
        return {"dict": code, "status": "skip_no_root", "changes": 0, "replacements": 0}

    rows = load_apply_rows(tsv)
    files = pref_source_files(root, meta["prefix"])
    print(f"=== {code} ===", flush=True)
    print(f"  candidates: {len(rows)}  files: {len(files)}  dry_run={dry_run}", flush=True)

    changes: list[dict] = []
    for row in rows:
        old, new = row["old"], row["new"]
        total = 0
        touched: list[str] = []
        for path in files:
            raw = path.read_text(encoding="utf-8", errors="replace")
            if old not in raw and f"**{old}**" not in raw:
                continue
            updated, n = replace_key_in_text(raw, old, new)
            if n <= 0:
                continue
            total += n
            touched.append(f"{path.name}:{n}")
            if not dry_run:
                path.write_text(updated, encoding="utf-8", newline="\n")
        if total > 0:
            changes.append({**row, "replacements": total, "files": "; ".join(touched)})
            print(
                f"  {'WOULD ' if dry_run else ''}{old!r} → {new!r}  ×{total}  ({row['class']})",
                flush=True,
            )

    out_dir = HERE / "out"
    out_dir.mkdir(parents=True, exist_ok=True)
    log_md = out_dir / f"{code.lower()}_pref_key_body_align_changes.md"
    log_tsv = out_dir / f"{code.lower()}_pref_key_body_align_changes.tsv"
    write_change_log(log_md, log_tsv, code, changes, dry_run, root)
    print(
        f"  wrote {log_md.name}  rows={len(changes)} repl={sum(c['replacements'] for c in changes)}",
        flush=True,
    )
    return {
        "dict": code,
        "status": "ok",
        "changes": len(changes),
        "replacements": sum(c["replacements"] for c in changes),
        "root": str(root),
    }


def write_change_log(
    path_md: Path,
    path_tsv: Path,
    code: str,
    changes: list[dict],
    dry_run: bool,
    root: Path,
) -> None:
    mode = "DRY-RUN" if dry_run else "APPLIED"
    lines = [
        f"# Pref key → body naming align — {code} ({mode})",
        "",
        f"_Created: {TODAY} · Last updated: {TODAY}_",
        "",
        f"**Handoff:** [H1571](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1571-Sonnet_csl-guides_pref-body-align-all-dicts_24.07.26.md) · "
        f"**Policy:** [pref-body-naming-authority.md](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/dictionaries/pref-body-naming-authority.md) · "
        f"**Issue:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123)",
        "",
        f"**Pref root:** `{root.as_posix() if hasattr(root, 'as_posix') else root}`",
        f"**Rows with ≥1 file hit:** {len(changes)}",
        f"**Total replacements:** {sum(c['replacements'] for c in changes)}",
        "",
        "## Changes",
        "",
        "| # | class | conf | old key | new key (body) | body_n | × | files |",
        "|--:|-------|------|---------|----------------|-------:|--:|-------|",
    ]
    for i, c in enumerate(changes, 1):
        lines.append(
            f"| {i} | `{c['class']}` | {c['confidence']} | `{c['old']}` | `{c['new']}` | "
            f"{c['alt_body_count']} | {c['replacements']} | {c['files']} |"
        )
    if not changes:
        lines.append("| — | — | — | *(none)* | | | | |")
    lines += [
        "",
        "```text",
        f"python scripts/pref_key_body_align.py --dict {code} --apply",
        "```",
        "",
        "---",
        "",
        f"_H1571 · Grok 4.5 (`grok-4.5`) · {mode}._",
        "",
        "_Dr. Mārcis Gasūns_",
        "",
    ]
    path_md.write_text("\n".join(lines), encoding="utf-8")
    cols = ["old", "new", "class", "confidence", "alt_body_count", "replacements", "files", "notes"]
    with path_tsv.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols, delimiter="\t", lineterminator="\n", extrasaction="ignore")
        w.writeheader()
        for c in changes:
            w.writerow(c)


def write_rollup(out_dir: Path, summaries: list[dict], dry_run: bool) -> None:
    path = out_dir / "ALL_pref_key_body_align.md"
    mode = "DRY-RUN" if dry_run else "APPLIED"
    lines = [
        f"# Pref key → body naming align — ALL ({mode})",
        "",
        f"_Created: {TODAY} · Last updated: {TODAY}_",
        "",
        f"**Handoff:** [H1571](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1571-Sonnet_csl-guides_pref-body-align-all-dicts_24.07.26.md) · "
        f"**Issue:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123)",
        "",
        "| Dict | status | change rows | replacements |",
        "|------|--------|------------:|-------------:|",
    ]
    tot_c = tot_r = 0
    for s in summaries:
        lines.append(
            f"| **{s['dict']}** | {s.get('status', 'ok')} | {s.get('changes', 0)} | {s.get('replacements', 0)} |"
        )
        tot_c += s.get("changes", 0)
        tot_r += s.get("replacements", 0)
    lines += [
        "",
        f"**Total change rows:** {tot_c} · **Total replacements:** {tot_r}",
        "",
        "---",
        "",
        f"_H1571 · Grok 4.5 (`grok-4.5`) · {mode}._",
        "",
        "_Dr. Mārcis Gasūns_",
        "",
    ]
    path.write_text("\n".join(lines), encoding="utf-8")
    print(f"wrote {path}", flush=True)


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Align pref legend keys to body naming (H1569/H1571)")
    ap.add_argument("--dict", dest="dict_code", help="Dictionary code")
    ap.add_argument("--all", action="store_true", help="All codes with decompose TSV")
    ap.add_argument("--apply", action="store_true", help="Write files")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args(argv)

    codes: list[str] = []
    if args.all:
        out = HERE / "out"
        for p in sorted(out.glob("*_pref_only_decompose.tsv")):
            code = p.name.split("_")[0].upper()
            # pwg_pref_only → PWG; ap90 → AP90
            stem = p.name.replace("_pref_only_decompose.tsv", "")
            code = stem.upper()
            codes.append(code)
    elif args.dict_code:
        codes = [args.dict_code.upper()]
    else:
        ap.error("provide --dict CODE or --all")

    dry = not args.apply or args.dry_run
    summaries = [apply_dict(c, dry_run=dry) for c in codes]
    if len(summaries) > 1:
        write_rollup(HERE / "out", summaries, dry)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
