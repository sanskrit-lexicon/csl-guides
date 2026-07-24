# -*- coding: utf-8 -*-
"""H1560 — decompose PWG/PW pref_only residual into typed classes.

Reads frozen crosscheck TSVs, probes body for alternate orthography, writes
classified TSV + MD under scripts/out/. No bulk pref overwrite.

Taxonomy: ortho | rare | ocr_key | spacing | true_unused | ambiguous
"""
from __future__ import annotations

import csv
import re
import sys
from collections import Counter
from datetime import date
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from pref_abbr_crosscheck import fold_diacritics, resolve_body  # noqa: E402

TODAY = date.today().strftime("%d-%m-%Y")
TAXONOMY = ("ortho", "rare", "ocr_key", "spacing", "true_unused", "ambiguous")

# Known body orthography for German j-series / OCR specials (pref → attested body-ish).
# Documented candidates only — not silent folds in the crosscheck tool.
ORTHO_MAP = [
    (r"Dhjânav", "Dhyânav"),
    (r"Dhjânab", "Dhyânab"),
    (r"Dhjâna", "Dhyâna"),
    (r"Divja", "Divya"),
    (r"Divjâv", "Divyâv"),
    (r"Gâbâlop", "Jâbâlop"),
    (r"Gâb\.", "Jâb."),
    (r"Jaǵ\.", "Yaj."),
    (r"Jaǵ\. V\.", "Yaj. V."),
    (r"Jogas", "Yogas"),
    (r"Jogat", "Yogat"),
    (r"Jogaj", "Yogay"),
    (r"Juktikalpat", "Yuktikalpat"),
    (r"Jâǵnikad", "Yâjñikad"),
    (r"Javaneçv", "Yavaneçv"),
    (r"Bhavishjott", "Bhavishyott"),
    (r"Nâṭjaç", "Nâṭyaç"),
    (r"Nâṭja", "Nâṭya"),
    (r"Prâjaçḱitt", "Prâyaçcitt"),
    (r"Prâjaçḱ", "Prâyaçc"),
    (r"Prâjaçkitt", "Prâyaçcitt"),
    (r"Prâjaçk", "Prâyaçc"),
    (r"Ǵjot", "Jyot"),
    (r"Ǵaim", "Jaim"),
    (r"Bhoǵa", "Bhoga"),
    (r"Bîǵag", "Bîjag"),
    (r"Harshaḱ", "Harshak"),
    (r"Hâsj", "Hâsy"),
    (r"Pratjabd", "Pratyabd"),
    (r"Gṛhja", "Gṛhya"),
    (r"Gṛhj", "Gṛhy"),
    (r"Khând\.", "Chând."),
    (r"Ḱhând\.", "Chând."),
    (r"Kaush\.", "Kaush."),  # keep; probe ṣ via fold
    (r"Drâhj", "Drâhy"),
    (r"Dâj\.", "Dây."),
    (r"Dâjabh", "Dâyabh"),
    (r"Kaij\.", "Kaiy."),
    (r"KRIJĀSAM", "KRIYĀSAM"),
    (r"Kâtj\.", "Kâty."),
    (r"Pathjâpathjav", "Pathyâpathyav"),
    (r"Pathjâ", "Pathyâ"),
    (r"Vjavahârat", "Vyavahârat"),
    (r"Maitrjup", "Maitryup"),
    (r"Saṁnj\.", "Saṁny."),
    (r"Tâṇḍja", "Tâṇḍya"),
    (r"Suparṇâdhj", "Suparṇâdhy"),
    (r"Devatâdhj", "Devatâdhy"),
    (r"Pravarâdhj", "Pravarâdhy"),
    (r"Râmaḱ", "Râmak"),
    (r"Mahâvîraḱ", "Mahâvîrak"),
    (r"Nârâjanaḱakr", "Nârâyaṇacakr"),
    (r"Pañḱat", "Pañcat"),
    (r"Vikramâñḱaḱ", "Vikramâṅkak"),
    (r"Ḱar\.", "Car."),
    (r"Bhoǵa-Ḱar", "Bhoga-Car"),
    (r"Kṛshṇaǵ", "Kṛshṇaj"),
    (r"L\. Ǵât", "L. Jât"),
    (r"Gîr\.", "Gît."),
]


def prep(s: str) -> str:
    return fold_diacritics(s).upper()


def count_in(search_body: str, form: str) -> int:
    n = prep(form)
    if not n or len(n) < 3:
        return 0
    total = 0
    pos = 0
    fl = len(n)
    while True:
        idx = search_body.find(n, pos)
        if idx < 0:
            break
        total += 1
        pos = idx + max(fl, 1)
    return total


def candidate_alts(key: str) -> list[tuple[str, str]]:
    """Return (alt, kind) where kind in ortho|spacing|ocr_key."""
    seen: set[str] = set()
    out: list[tuple[str, str]] = []

    def add(alt: str, kind: str) -> None:
        alt = alt.strip()
        if not alt or alt == key or alt in seen:
            return
        if len(re.sub(r"\s+", "", alt)) < 3:
            return
        seen.add(alt)
        out.append((alt, kind))

    # strip parenthetical author notes from key
    bare = re.sub(r"\s*\([^)]*\)\s*", "", key).strip().rstrip(",")
    if bare != key:
        add(bare, "spacing")

    # dual keys: X oder Y
    if re.search(r"\s+oder\s+", key, re.I):
        for p in re.split(r"\s+oder\s+", key, flags=re.I):
            add(p.strip(), "spacing")

    # zu-gloss: keep left part only
    m = re.match(r"^(.+?)\s+zu\s+.+$", key, re.I)
    if m:
        add(m.group(1).strip(), "spacing")

    # spacing / punctuation
    add(key.replace("-", " "), "spacing")
    add(key.replace("-", ""), "spacing")
    add(key.replace(" ", "-"), "spacing")
    add(re.sub(r"\.\s+", ".", key), "spacing")
    add(re.sub(r"\s+", "", key), "spacing")
    # leading OCR quote / backslash artifacts
    add(key.lstrip("\\'ʼ`"), "ocr_key")
    add(re.sub(r"^[\\'ʼ`]+", "", key), "ocr_key")

    # global j/y (German Indology)
    j2y = key.replace("J", "Y").replace("j", "y")
    if j2y != key:
        add(j2y, "ortho")
    # ǵ/ḱ already folded to g/k in body search if present; try explicit
    for a, b in ORTHO_MAP:
        if re.search(a, key):
            add(re.sub(a, b, key), "ortho")

    # ś/ṣ style via plain S after fold is automatic; try Pariś / Pariṣ form
    add(key.replace("ç", "ś").replace("Ç", "Ś"), "ortho")
    add(key.replace("ç", "s").replace("Ç", "S"), "ortho")
    add(key.replace("ṅ", "n").replace("ń", "n"), "ortho")
    add(key.replace("ñ", "n"), "ortho")

    if key.endswith(" P."):
        add(key[:-3].strip() + "P.", "spacing")
        add(key[:-3].strip() + " Pur.", "ortho")
    if key.endswith(" Up."):
        add(key[:-4].strip() + "Up.", "spacing")
        add(key[:-4].strip() + " U.", "spacing")

    return out


def rare_signal(expansion: str) -> bool:
    return bool(
        re.search(
            r"\*|handschrift|Hdschr|gelegentlich|selten|"
            r"nach Anführ|nach Mittheil|geleg\.| geleg ",
            expansion or "",
            re.I,
        )
    )


def long_bib(key: str) -> bool:
    return (
        len(key) > 32
        or bool(re.search(r"\([^)]+,\)", key))
        or "etc." in key
        or key.startswith("A Dict.")
        or "u. s. w." in key
        or "Verh. d." in key
        or "Mém." in key
        or "Burn. Lot" in key
        or "Roxb." in key
        or "Mayr," in key
        or "Weber," in key
    )


def classify_one(key: str, expansion: str, search_body: str) -> dict:
    notes: list[str] = []
    best_alt = ""
    best_n = 0
    best_kind = ""
    for alt, kind in candidate_alts(key):
        n = count_in(search_body, alt)
        if n > best_n:
            best_n = n
            best_alt = alt
            best_kind = kind

    # also try single-token head (first token ≥3 chars) only if multi-token and dual
    if best_n == 0 and re.search(r"\s+oder\s+", key, re.I):
        notes.append("dual_oder_key")

    rare = rare_signal(expansion)
    cls = "true_unused"

    if best_n > 0:
        cls = best_kind if best_kind in TAXONOMY else "ortho"
        # dual-key hits on one side → spacing (legend composite), not unused
        if re.search(r"\s+oder\s+", key, re.I) and best_kind == "spacing":
            cls = "spacing"
        notes.append(f"alt={best_alt!r} body_n={best_n}")
    elif rare:
        cls = "rare"
        notes.append("expansion_rare_signal")
    elif re.search(r"[ǵǴḱḰ]|Prâjaçḱ|Ǵjot|Pañḱ|ñḱ|Ḱar|Ḱhând|Râmaḱ|viraḱ", key):
        cls = "ocr_key"
        notes.append("ocr_special_char_no_body_alt")
    elif re.search(r"[Jj](?=[aâāeioôu]|og|uk|av|âǵ|aim)", key) or re.search(
        r"Dhj|Divj|Gṛhj|Pratjab|Pathj|Vjav|Nâṭj|Bhavishj|Maitrj|Saṁnj|Tâṇḍj|Kâtj|Kaij|Joga|Jukt",
        key,
    ):
        # j-series that failed alt probe → still ortho candidate (fold incomplete)
        cls = "ortho"
        notes.append("j_series_no_confirmed_body_alt")
    elif re.search(r"\\|^[ʼ']|zu |ohne nähere|mit einer Zahl|mit nachfolgend", key):
        cls = "ambiguous"
        notes.append("markup_or_conditional_legend")
    elif long_bib(key):
        cls = "true_unused"
        notes.append("long_bib_or_external_title")
    else:
        cls = "true_unused"
        notes.append("no_alt_hit")

    if rare and cls == "true_unused":
        cls = "rare"
        notes.append("rare_override")

    conf = "high" if best_n >= 5 or (rare and best_n == 0) else (
        "med" if best_n > 0 or cls in ("ocr_key", "rare") else "low"
    )
    return {
        "class": cls,
        "confidence": conf,
        "alt_form": best_alt,
        "alt_body_count": best_n,
        "notes": "; ".join(notes),
    }


def load_tsv(path: Path) -> list[dict]:
    with path.open(encoding="utf-8") as f:
        return list(csv.DictReader(f, delimiter="\t"))


def pick_sample(pref_only: list[dict], n: int = 50) -> list[dict]:
    # Prefer multi-token / longer keys first (more diagnostic), then alpha
    ranked = sorted(pref_only, key=lambda r: (-len(r["key_norm"]), r["key_norm"]))
    return ranked[:n]


def pick_control(hits: list[dict], n: int = 20) -> list[dict]:
    ranked = sorted(hits, key=lambda r: -int(r.get("body_count") or 0))
    return ranked[:n]


def write_classified_tsv(path: Path, rows: list[dict]) -> None:
    cols = [
        "dict",
        "key_norm",
        "class",
        "confidence",
        "alt_form",
        "alt_body_count",
        "body_count",
        "expansion",
        "sources",
        "notes",
    ]
    with path.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols, delimiter="\t", lineterminator="\n")
        w.writeheader()
        for r in rows:
            w.writerow({c: r.get(c, "") for c in cols})


def md_report(
    code: str,
    sample: list[dict],
    control: list[dict],
    dist: Counter,
    total_pref_only: int,
    tsv_name: str,
) -> str:
    lines = [
        f"# Pref-only decomposition — {code}",
        "",
        f"_Created: {TODAY} · Last updated: {TODAY}_",
        "",
        f"**Handoff:** [H1560](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1560-Sonnet_csl-guides_pref-only-pwg-pw-decompose_24.07.26.md) · "
        f"**Issue:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123) · "
        f"**Prior:** [H1530](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1530-Sonnet_csl-guides_pref-abbr-body-crosscheck_23.07.26.md) · "
        f"[H1543](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1543-Sonnet_csl-guides_pref-abbr-crosscheck-all_23.07.26.md)",
        "",
        "## Policy (H1569)",
        "",
        "- Body `.txt` wins for siglum *naming*; this table feeds gated apply + change log.",
        "- Classification is a **typed residual**, not a claim that keys are unused works.",
        "- Hold without body attestation: `rare` · `true_unused` · `ambiguous`.",
        "",
        "## Sample frame",
        "",
        f"| Metric | n |",
        f"|--------|--:|",
        f"| Total `pref_only` (frozen crosscheck) | {total_pref_only} |",
        f"| Classified sample (top by key length) | {len(sample)} |",
        f"| High-count control | {len(control)} |",
        "",
        "## Class distribution (sample)",
        "",
        "| Class | n | Meaning |",
        "|-------|--:|---------|",
    ]
    meaning = {
        "ortho": "Pref orthography ≠ body (fold incomplete)",
        "rare": "Starred / MS / occasional work; body count 0 plausible",
        "ocr_key": "Pref key OCR error vs print/body form",
        "spacing": "Multi-token key spacing/punctuation/dual-key mismatch",
        "true_unused": "Legend key not used in digitized body (or only outside sample)",
        "ambiguous": "Needs human / scan check",
    }
    for c in TAXONOMY:
        lines.append(f"| `{c}` | {dist.get(c, 0)} | {meaning[c]} |")
    lines += [
        "",
        "## Classified sample",
        "",
        "| class | conf | key_norm | alt_form | alt_n | notes |",
        "|-------|------|----------|----------|------:|-------|",
    ]
    for r in sample:
        notes = (r.get("notes") or "").replace("|", "/")[:70]
        alt = (r.get("alt_form") or "—")[:28]
        lines.append(
            f"| `{r['class']}` | {r['confidence']} | `{r['key_norm']}` | `{alt}` | "
            f"{r['alt_body_count']} | {notes} |"
        )
    lines += [
        "",
        "## High-count control (should stay hits)",
        "",
        "| key_norm | body_count | flag |",
        "|----------|-----------:|------|",
    ]
    for r in control:
        lines.append(
            f"| `{r['key_norm']}` | {r['body_count']} | {r.get('flag') or '—'} |"
        )
    lines += [
        "",
        "## Fold / parser follow-ups (document only)",
        "",
        "Candidates for a future **documented** fold-table extension (not applied here):",
        "",
        "1. German **j → y** (Jogas/Yogas, Dhjâna/Dhyâna, Nâṭja/Nâṭya) when body attests the y-form.",
        "2. Dual-key legends (`X oder Y`) — count each side separately before `pref_only`.",
        "3. Strip parenthetical author notes from the search form (`Hindu Th. (Wilson,)` → `Hindu Th.`).",
        "4. OCR specials still after diacritic fold: `ḱ`→`k`/`c`, leading `ʼ`/`\\`, `Ǵ`→`J`/`Y`.",
        "5. `Kâtj.` ↔ `Kâty.` (t/j vs ty) seen in both PWG and PW.",
        "",
        "## Reproduce",
        "",
        "```text",
        f"python scripts/pref_abbr_crosscheck.py --dict {code} --out-dir scripts/out --json-summary",
        f"python scripts/pref_only_decompose.py --dict {code}",
        "```",
        "",
        f"TSV: [`{tsv_name}`](./{tsv_name})",
        "",
        "---",
        "",
        "_H1560 · Grok 4.5 (`grok-4.5`) · mechanical re-run + hand/probe classification._",
        "",
    ]
    return "\n".join(lines)


def run_dict(code: str, out_dir: Path, sample_n: int = 50, control_n: int = 20) -> dict:
    tsv_in = out_dir / f"{code.lower()}_pref_abbr_crosscheck.tsv"
    if not tsv_in.is_file():
        raise SystemExit(f"missing frozen TSV: {tsv_in}")
    rows = load_tsv(tsv_in)
    pref_only = [r for r in rows if r.get("flag") == "pref_only"]
    hits = [r for r in rows if int(r.get("body_count") or 0) > 0]
    sample = pick_sample(pref_only, sample_n)
    control = pick_control(hits, control_n)

    body_path = resolve_body(code)
    if not body_path:
        raise SystemExit(f"no body for {code}")
    print(f"loading body {body_path} …", flush=True)
    search_body = prep(body_path.read_text(encoding="utf-8", errors="replace"))

    classified: list[dict] = []
    dist: Counter = Counter()
    for r in sample:
        c = classify_one(r["key_norm"], r.get("expansion", ""), search_body)
        dist[c["class"]] += 1
        classified.append(
            {
                "dict": code,
                "key_norm": r["key_norm"],
                "class": c["class"],
                "confidence": c["confidence"],
                "alt_form": c["alt_form"],
                "alt_body_count": c["alt_body_count"],
                "body_count": r.get("body_count", "0"),
                "expansion": (r.get("expansion") or "")[:200],
                "sources": r.get("sources", ""),
                "notes": c["notes"],
            }
        )
        print(f"  {c['class']:12} {r['key_norm'][:40]}", flush=True)

    tsv_name = f"{code.lower()}_pref_only_decompose.tsv"
    md_name = f"{code.lower()}_pref_only_decompose.md"
    write_classified_tsv(out_dir / tsv_name, classified)
    (out_dir / md_name).write_text(
        md_report(code, classified, control, dist, len(pref_only), tsv_name),
        encoding="utf-8",
    )
    print(f"wrote {out_dir / tsv_name}", flush=True)
    print(f"wrote {out_dir / md_name}", flush=True)
    print(f"{code} dist: {dict(dist)}", flush=True)
    return {
        "dict": code,
        "pref_only_total": len(pref_only),
        "sample_n": len(classified),
        "dist": dict(dist),
    }


def write_rollup(out_dir: Path, summaries: list[dict]) -> None:
    path = out_dir / "PWG_PW_pref_only_decompose.md"
    lines = [
        "# Pref-only decomposition rollup — PWG + PW",
        "",
        f"_Created: {TODAY} · Last updated: {TODAY}_",
        "",
        f"**Handoff:** [H1560](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1560-Sonnet_csl-guides_pref-only-pwg-pw-decompose_24.07.26.md) · "
        f"**Issue:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123)",
        "",
        "## Finding",
        "",
        "H1543 left high `pref_only` on PWG (133) and PW (89) **even with case + diacritic fold**.",
        "The residual is **typed**, not a pile of unused abbreviations:",
        "",
        "- Large share is **ortho** (German *j* = *y*, `Kâtj.`/`Kâty.`, `Gṛhja`/`Gṛhya`, dual `X oder Y` keys).",
        "- **rare** tracks handschrift / occasional works in the expansion.",
        "- **ocr_key** residual specials (`ḱ`, `Ǵ`, leading quotes) after the current fold table.",
        "- **true_unused** is mostly long bibliographic titles and external works, not core legend sigla.",
        "",
        "## Non-goals",
        "",
        "- No bulk pref overwrite from body.",
        "- No silent new diacritic invent-a-fold without documented examples.",
        "",
        "## Per-dict sample distribution",
        "",
        "| Dict | pref_only total | sample | ortho | rare | ocr_key | spacing | true_unused | ambiguous |",
        "|------|----------------:|-------:|------:|-----:|--------:|--------:|------------:|----------:|",
    ]
    for s in summaries:
        d = s["dist"]
        lines.append(
            f"| **{s['dict']}** | {s['pref_only_total']} | {s['sample_n']} | "
            f"{d.get('ortho', 0)} | {d.get('rare', 0)} | {d.get('ocr_key', 0)} | "
            f"{d.get('spacing', 0)} | {d.get('true_unused', 0)} | {d.get('ambiguous', 0)} |"
        )
    lines += [
        "",
        "## Artifacts",
        "",
        "- [`pwg_pref_only_decompose.md`](./pwg_pref_only_decompose.md) / [`.tsv`](./pwg_pref_only_decompose.tsv)",
        "- [`pw_pref_only_decompose.md`](./pw_pref_only_decompose.md) / [`.tsv`](./pw_pref_only_decompose.tsv)",
        "- Frozen census: [`pwg_pref_abbr_crosscheck.tsv`](./pwg_pref_abbr_crosscheck.tsv), [`pw_pref_abbr_crosscheck.tsv`](./pw_pref_abbr_crosscheck.tsv)",
        "- Tool: [`pref_only_decompose.py`](../pref_only_decompose.py) (classifier) · [`pref_abbr_crosscheck.py`](../pref_abbr_crosscheck.py) (census)",
        "",
        "## Reproduce",
        "",
        "```text",
        "python scripts/pref_abbr_crosscheck.py --dict PWG --out-dir scripts/out --json-summary",
        "python scripts/pref_abbr_crosscheck.py --dict PW --out-dir scripts/out --json-summary",
        "python scripts/pref_only_decompose.py --all",
        "```",
        "",
        "---",
        "",
        "_H1560 · Grok 4.5 (`grok-4.5`)._",
        "",
        "_Dr. Mārcis Gasūns_",
        "",
    ]
    path.write_text("\n".join(lines), encoding="utf-8")
    print(f"wrote {path}", flush=True)


def main(argv: list[str] | None = None) -> int:
    import argparse

    ap = argparse.ArgumentParser(description="Decompose pref_only residual (H1560)")
    ap.add_argument("--dict", dest="dict_code", help="PWG or PW")
    ap.add_argument("--all", action="store_true", help="Run PWG and PW")
    ap.add_argument("--out-dir", type=Path, default=HERE / "out")
    ap.add_argument("--sample-n", type=int, default=50)
    ap.add_argument("--control-n", type=int, default=20)
    args = ap.parse_args(argv)

    codes: list[str] = []
    if args.all:
        codes = ["PWG", "PW"]
    elif args.dict_code:
        codes = [args.dict_code.upper()]
    else:
        ap.error("provide --dict CODE or --all")

    summaries = []
    for code in codes:
        print(f"=== {code} ===", flush=True)
        summaries.append(
            run_dict(code, Path(args.out_dir), sample_n=args.sample_n, control_n=args.control_n)
        )
    if len(summaries) > 1:
        write_rollup(Path(args.out_dir), summaries)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
