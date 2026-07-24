#!/usr/bin/env python3
"""
H1559 — Bounded dual-pass OCR probe for PWG/PW front matter.

Runs Engine B (Tesseract crop-then-OCR) on a pre-registered stratified
sample of pages and compares token sets against Engine A (canonical
`prefNN.md` gold). Does NOT overwrite gold. Writes a dated metrics table
for the quality report.

Usage:
  python scripts/pref_ocr_en_quality_probe.py
  python scripts/pref_ocr_en_quality_probe.py --skip-tesseract  # sample list only
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass
from datetime import date
from pathlib import Path
from typing import List, Tuple

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "scripts" / "out"
# Sibling dict repos under Documents/GitHub (or Documents when worktree is sibling of GitHub/)
GH = ROOT.parent
if not (GH / "PWG" / "prefaces").is_dir():
    GH = ROOT.parent / "GitHub"
PWG = GH / "PWG" / "prefaces"
PWK = GH / "PWK" / "prefaces"

TESS_LANG = "deu+eng+san"
TESS_CFG = r"--psm 6 -c preserve_interword_spaces=1"

# ---------------------------------------------------------------------------
# Pre-registered stratified sample (selection rule fixed BEFORE measurement)
# ---------------------------------------------------------------------------
# Rule: cover every section type present for the dict, prefer first page of
# each type + one mid/late volume exemplar for long series. PWG only has
# addenda. Not a random sample; deliberate layout/volume coverage.
#
# layout: single | prose_2col | list_2col

SAMPLE: List[dict] = [
    # ---- PWG ----
    {"dict": "PWG", "stratum": "title", "label": "pwg-title-v1",
     "scan": "pwg1-0000--01.png", "a_file": "pwgpref01.md", "layout": "single"},
    {"dict": "PWG", "stratum": "title", "label": "pwg-title-v2",
     "scan": "pwg2-0000--01.png", "a_file": "pwgpref12.md", "layout": "single"},
    {"dict": "PWG", "stratum": "title", "label": "pwg-title-v7",
     "scan": "pwg7-0000--01.png", "a_file": "pwgpref26.md", "layout": "single"},
    {"dict": "PWG", "stratum": "vorwort", "label": "pwg-vorwort-v1-p1",
     "scan": "pwg1-0000--02.png", "a_file": "pwgpref02.md", "layout": "prose_2col"},
    {"dict": "PWG", "stratum": "vorwort", "label": "pwg-vorwort-v2",
     "scan": "pwg2-0000--04.png", "a_file": "pwgpref15.md", "layout": "prose_2col"},
    {"dict": "PWG", "stratum": "vorwort", "label": "pwg-vorwort-v7-final",
     "scan": "pwg7-0000--02.png", "a_file": "pwgpref27.md", "layout": "prose_2col"},
    {"dict": "PWG", "stratum": "abbreviations", "label": "pwg-abbr-v1-p1",
     "scan": "pwg1-0000--06.png", "a_file": "pwgpref07.md", "layout": "list_2col"},
    {"dict": "PWG", "stratum": "abbreviations", "label": "pwg-abbr-v1-p4",
     "scan": "pwg1-0000--10.png", "a_file": "pwgpref10.md", "layout": "list_2col"},
    {"dict": "PWG", "stratum": "abbreviations", "label": "pwg-abbr-v2-add",
     "scan": "pwg2-0000--05.png", "a_file": "pwgpref16.md", "layout": "list_2col"},
    {"dict": "PWG", "stratum": "addenda", "label": "pwg-addenda-v1",
     "scan": "pwg2-0000--02.png", "a_file": "pwgpref13.md", "layout": "list_2col"},
    {"dict": "PWG", "stratum": "addenda", "label": "pwg-addenda-v2",
     "scan": "pwg2-0000--03.png", "a_file": "pwgpref14.md", "layout": "list_2col"},
    # ---- PW (repo PWK) ----
    {"dict": "PW", "stratum": "title", "label": "pw-title-v1",
     "scan": "pw1-000-1.png", "a_file": "pwpref01.md", "layout": "single"},
    {"dict": "PW", "stratum": "vorwort", "label": "pw-vorwort",
     "scan": "pw1-000-2.png", "a_file": "pwpref02.md", "layout": "prose_2col"},
    {"dict": "PW", "stratum": "abbreviations", "label": "pw-abbr-p1",
     "scan": "pw1-000-3.png", "a_file": "pwpref03.md", "layout": "list_2col"},
    {"dict": "PW", "stratum": "abbreviations", "label": "pw-abbr-p3",
     "scan": "pw1-000-5.png", "a_file": "pwpref05.md", "layout": "list_2col"},
]


def pref_root(d: str) -> Path:
    return PWG if d == "PWG" else PWK


def strip_a(text: str) -> str:
    lines = text.splitlines()
    i = 0
    if lines and lines[0].strip() == "---":
        i = 1
        while i < len(lines) and lines[i].strip() != "---":
            i += 1
        i += 1
    while i < len(lines) and not lines[i].strip():
        i += 1
    if i < len(lines) and lines[i].lstrip().startswith("#"):
        i += 1
    while i < len(lines) and not lines[i].strip():
        i += 1
    return "\n".join(lines[i:]).strip()


def normalize_for_compare(s: str) -> str:
    s = s.replace("\r\n", "\n").replace("\r", "\n")
    s = re.sub(r"\*\*([^*]+)\*\*", r"\1", s)
    s = re.sub(r"`([^`]+)`", r"\1", s)
    s = re.sub(r"\[page [^\]]+\]", "", s, flags=re.I)
    s = re.sub(r"\s+", " ", s)
    return s.strip().lower()


def tokens(s: str) -> List[str]:
    return re.findall(
        r"[\w\u00C0-\u024F\u0900-\u097F]+",
        normalize_for_compare(s),
        flags=re.U,
    )


def token_jaccard(a: str, b: str) -> float:
    ta, tb = set(tokens(a)), set(tokens(b))
    if not ta and not tb:
        return 1.0
    if not ta or not tb:
        return 0.0
    return len(ta & tb) / len(ta | tb)


def token_recall_vs_a(a: str, b: str) -> float:
    ta, tb = set(tokens(a)), set(tokens(b))
    if not ta:
        return 1.0 if not tb else 0.0
    return len(ta & tb) / len(ta)


def char_len(s: str) -> int:
    return len(normalize_for_compare(s).replace(" ", ""))


def crop_bands(img, layout: str) -> List:
    """Return list of PIL crops; 2-col = left then right, 3 vertical bands each."""
    from PIL import Image

    w, h = img.size
    crops = []
    if layout == "single":
        # full page, 3 overlapping vertical bands
        for i in range(3):
            y0 = int(h * i / 3) - (20 if i else 0)
            y1 = int(h * (i + 1) / 3) + (20 if i < 2 else 0)
            y0 = max(0, y0)
            y1 = min(h, y1)
            crops.append(img.crop((0, y0, w, y1)))
        return crops
    # 2-col: left then right, 3 bands
    mid = w // 2
    for x0, x1 in ((0, mid + 15), (mid - 15, w)):
        for i in range(3):
            y0 = int(h * i / 3) - (15 if i else 0)
            y1 = int(h * (i + 1) / 3) + (15 if i < 2 else 0)
            y0 = max(0, y0)
            y1 = min(h, y1)
            crops.append(img.crop((x0, y0, x1, y1)))
    return crops


def run_tesseract(scan_path: Path, layout: str) -> str:
    import pytesseract
    from PIL import Image

    img = Image.open(scan_path)
    # downscale very large only for tess speed; keep long side <= 2400
    w, h = img.size
    long = max(w, h)
    if long > 2400:
        scale = 2400 / long
        img = img.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
    parts = []
    for crop in crop_bands(img, layout):
        text = pytesseract.image_to_string(crop, lang=TESS_LANG, config=TESS_CFG)
        parts.append(text)
    return "\n".join(parts)


@dataclass
class PageResult:
    label: str
    dict_code: str
    stratum: str
    a_file: str
    scan: str
    a_chars: int
    b_chars: int
    a_tok: int
    b_tok: int
    jaccard: float
    recall_a: float
    status: str


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--skip-tesseract", action="store_true")
    args = ap.parse_args()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    today = date.today().isoformat()

    sample_path = OUT_DIR / "H1559_pref_ocr_en_sample_registry.json"
    sample_path.write_text(
        json.dumps(
            {
                "handoff": "H1559",
                "date": today,
                "selection_rule": (
                    "Stratify by page type (title · Vorwort · abbreviations · "
                    "addenda for PWG). Prefer first page of each type plus one "
                    "mid/late-volume exemplar for multi-page series. Fixed before "
                    "measurement; not a random sample."
                ),
                "n_pages": len(SAMPLE),
                "sample": SAMPLE,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"Wrote sample registry: {sample_path}")

    if args.skip_tesseract:
        return 0

    results: List[PageResult] = []
    b_cache = OUT_DIR / "H1559_dualpass_B_cache"
    b_cache.mkdir(parents=True, exist_ok=True)

    for item in SAMPLE:
        root = pref_root(item["dict"])
        a_path = root / item["a_file"]
        scan_path = root / "scans" / item["scan"]
        if not a_path.is_file():
            print(f"MISSING A: {a_path}", file=sys.stderr)
            continue
        if not scan_path.is_file():
            print(f"MISSING SCAN: {scan_path}", file=sys.stderr)
            continue
        a_text = strip_a(a_path.read_text(encoding="utf-8"))
        cache_f = b_cache / f"{item['label']}.md"
        if cache_f.is_file():
            b_text = cache_f.read_text(encoding="utf-8")
            print(f"cache hit {item['label']}")
        else:
            print(f"tesseract {item['label']} …", flush=True)
            b_text = run_tesseract(scan_path, item["layout"])
            cache_f.write_text(b_text, encoding="utf-8")
        jac = token_jaccard(a_text, b_text)
        rec = token_recall_vs_a(a_text, b_text)
        results.append(
            PageResult(
                label=item["label"],
                dict_code=item["dict"],
                stratum=item["stratum"],
                a_file=item["a_file"],
                scan=item["scan"],
                a_chars=char_len(a_text),
                b_chars=char_len(b_text),
                a_tok=len(set(tokens(a_text))),
                b_tok=len(set(tokens(b_text))),
                jaccard=round(jac, 3),
                recall_a=round(rec, 3),
                status="ok",
            )
        )
        print(
            f"  {item['label']}: Jaccard={jac:.3f} Recall@A={rec:.3f} "
            f"A_tok={len(set(tokens(a_text)))} B_tok={len(set(tokens(b_text)))}"
        )

    metrics_json = OUT_DIR / "H1559_pref_ocr_dualpass_metrics.json"
    metrics_json.write_text(
        json.dumps(
            {
                "handoff": "H1559",
                "date": today,
                "method": (
                    "Engine B = Tesseract 5.5 deu+eng+san, crop bands (single: 3 "
                    "vertical; 2-col: L then R × 3 bands). Engine A = canonical "
                    "prefNN.md. Tokens = Unicode word pieces after lowercasing; "
                    "drop **bold** and [page N]. Jaccard = |A∩B|/|A∪B|; "
                    "Recall@A = |A∩B|/|A|. A is production gold; B is audit only "
                    "— dual-pass is NOT a scan-truth error rate."
                ),
                "engine_b": f"tesseract {TESS_LANG} {TESS_CFG}",
                "results": [asdict(r) for r in results],
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"Wrote {metrics_json}")

    # TSV
    tsv = OUT_DIR / "H1559_pref_ocr_dualpass_metrics.tsv"
    with tsv.open("w", encoding="utf-8") as f:
        f.write(
            "label\tdict\tstratum\ta_file\tscan\ta_chars\tb_chars\t"
            "a_tok\tb_tok\tjaccard\trecall_a\n"
        )
        for r in results:
            f.write(
                f"{r.label}\t{r.dict_code}\t{r.stratum}\t{r.a_file}\t{r.scan}\t"
                f"{r.a_chars}\t{r.b_chars}\t{r.a_tok}\t{r.b_tok}\t"
                f"{r.jaccard}\t{r.recall_a}\n"
            )
    print(f"Wrote {tsv}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
