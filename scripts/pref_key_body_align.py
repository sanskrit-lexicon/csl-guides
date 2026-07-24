# -*- coding: utf-8 -*-
"""pref_key_body_align.py — apply body-attested pref legend key renames (H1569).

Policy: csl-orig body .txt wins for *naming* of works. Pref OCR keys are
rewritten toward body forms when a classify row provides alt_form with
alt_body_count >= 1. Every change is written to a change-log meta document.

Does not invent forms. Does not delete rare/MS keys. Expansions unchanged
except the bold key token.

Examples::

    python scripts/pref_key_body_align.py --dict PWG --dry-run
    python scripts/pref_key_body_align.py --dict PWG --apply
    python scripts/pref_key_body_align.py --dict PW --apply
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

APPLY_CLASSES = frozenset({"ortho", "ocr_key", "spacing"})
MIN_ALT_BODY = 1

# Pref roots (source DE pages + translations that carry the same bold keys).
DICT_PREF: dict[str, dict] = {
    "PWG": {
        "root": GITHUB / "PWG" / "prefaces",
        "prefix": "pwgpref",
        "decompose": HERE / "out" / "pwg_pref_only_decompose.tsv",
    },
    "PW": {
        "root": GITHUB / "PWK" / "prefaces",
        "prefix": "pwpref",
        "decompose": HERE / "out" / "pw_pref_only_decompose.tsv",
    },
}


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
    # Longest first so nested keys don't partial-corrupt
    rows.sort(key=lambda x: -len(x["old"]))
    return rows


def pref_source_files(root: Path, prefix: str) -> list[Path]:
    """Source + translation pages that hold bold keys (not consolidated all)."""
    out: list[Path] = []
    if not root.is_dir():
        return out
    for p in sorted(root.iterdir()):
        if not p.is_file() or not p.name.endswith(".md"):
            continue
        low = p.name.lower()
        if low in ("readme.md",) or "methods" in low or "build" in low:
            continue
        if "pref_all" in low or low.endswith(".meta.md"):
            continue
        if not low.startswith(prefix.lower()):
            continue
        # pwgpref07.md, pwgpref07.en.md, pwgpref07.ru.md
        out.append(p)
    return out


def replace_key_in_text(text: str, old: str, new: str) -> tuple[str, int]:
    """Replace bold-key and bare-key legend forms. Returns (text, n_replacements)."""
    n = 0
    # PWG-style: **KEY** =
    bold_old = f"**{old}**"
    bold_new = f"**{new}**"
    if bold_old in text:
        c = text.count(bold_old)
        text = text.replace(bold_old, bold_new)
        n += c
    # Eq style without bold: KEY =  at line start (PW sometimes)
    # Only whole-line-ish: start or after whitespace before =
    pat = re.compile(
        rf"(?m)^(\s*)({re.escape(old)})(\s*=\s+)"
    )
    text2, c2 = pat.subn(rf"\1{new}\3", text)
    if c2:
        text = text2
        n += c2
    # Leading OCR junk variants already handled if old includes them
    return text, n


def apply_dict(code: str, dry_run: bool) -> dict:
    meta = DICT_PREF[code]
    root: Path = meta["root"]
    tsv: Path = meta["decompose"]
    if not tsv.is_file():
        raise SystemExit(f"missing decompose TSV: {tsv}")
    if not root.is_dir():
        raise SystemExit(f"missing pref root: {root}")

    rows = load_apply_rows(tsv)
    files = pref_source_files(root, meta["prefix"])
    print(f"=== {code} ===", flush=True)
    print(f"  candidates: {len(rows)}  files: {len(files)}  dry_run={dry_run}", flush=True)

    changes: list[dict] = []
    file_hits: dict[str, int] = {}

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
            file_hits[path.name] = file_hits.get(path.name, 0) + n
            if not dry_run:
                path.write_text(updated, encoding="utf-8", newline="\n")
        if total > 0:
            changes.append(
                {
                    **row,
                    "replacements": total,
                    "files": "; ".join(touched),
                }
            )
            print(f"  {'WOULD ' if dry_run else ''}{old!r} → {new!r}  ×{total}  ({row['class']})", flush=True)
        else:
            print(f"  SKIP (not found in files): {old!r} → {new!r}", flush=True)

    # Change log
    out_dir = HERE / "out"
    out_dir.mkdir(parents=True, exist_ok=True)
    log_md = out_dir / f"{code.lower()}_pref_key_body_align_changes.md"
    log_tsv = out_dir / f"{code.lower()}_pref_key_body_align_changes.tsv"
    write_change_log(log_md, log_tsv, code, changes, dry_run, root)
    print(f"  wrote {log_md}", flush=True)
    print(f"  applied_rows={len(changes)} replacements={sum(c['replacements'] for c in changes)}", flush=True)
    return {"dict": code, "changes": len(changes), "replacements": sum(c["replacements"] for c in changes)}


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
        f"**Handoff:** [H1569](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1569-Sonnet_csl-guides_pref-body-naming-authority-apply_24.07.26.md) · "
        f"**Policy:** [pref-body-naming-authority.md](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/dictionaries/pref-body-naming-authority.md) · "
        f"**Issue:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123)",
        "",
        "## Policy",
        "",
        "- Body `.txt` wins for siglum *naming*; pref keys rewritten only with body-attested `alt_form`.",
        "- Every row below is one documented change (or dry-run proposal).",
        "- Expansions not rewritten. `rare` / `true_unused` / unattested `ambiguous` held.",
        "",
        f"**Pref root:** `{root}`",
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
        "## Reproduce",
        "",
        "```text",
        f"python scripts/pref_key_body_align.py --dict {code} --apply",
        f"cd {root} && python build_combined.py",
        "```",
        "",
        "---",
        "",
        f"_H1569 · Grok 4.5 (`grok-4.5`) · {mode}._",
        "",
        "_Dr. Mārcis Gasūns_",
        "",
    ]
    path_md.write_text("\n".join(lines), encoding="utf-8")

    cols = [
        "old",
        "new",
        "class",
        "confidence",
        "alt_body_count",
        "replacements",
        "files",
        "notes",
    ]
    with path_tsv.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols, delimiter="\t", lineterminator="\n", extrasaction="ignore")
        w.writeheader()
        for c in changes:
            w.writerow(c)


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Align pref legend keys to body naming (H1569)")
    ap.add_argument("--dict", dest="dict_code", help="PWG or PW")
    ap.add_argument("--all", action="store_true", help="PWG and PW")
    ap.add_argument("--apply", action="store_true", help="Write files (default is dry-run)")
    ap.add_argument("--dry-run", action="store_true", help="Explicit dry-run (default)")
    args = ap.parse_args(argv)

    codes: list[str] = []
    if args.all:
        codes = ["PWG", "PW"]
    elif args.dict_code:
        codes = [args.dict_code.upper()]
    else:
        ap.error("provide --dict CODE or --all")

    dry = not args.apply
    if args.dry_run:
        dry = True

    for code in codes:
        if code not in DICT_PREF:
            raise SystemExit(f"unsupported dict {code}; choose PWG or PW")
        apply_dict(code, dry_run=dry)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
