# -*- coding: utf-8 -*-
"""pref_legend_emit.py — emit structured legend JSON from crosscheck (+ decompose).

UC-3 / H1591. Joins committed `*_pref_abbr_crosscheck.tsv` with optional
`*_pref_only_decompose.tsv` residual classes. Does **not** invent expansions;
assigns provisional `work_id` + `review_required` for work-class rows (R8).

stdlib only (jsonschema optional at parity time).

Examples (from csl-guides repo root)::

    python scripts/pref_legend_emit.py --dict PWG --dict PW
    python scripts/pref_legend_emit.py --dict PWG --out-dir scripts/out
    python scripts/pref_legend_emit.py --self-check
"""
from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from datetime import date
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

HERE = Path(__file__).resolve().parent
REPO = HERE.parent
DEFAULT_OUT = HERE / "out"
PILOT_DICTS = ("PWG", "PW")

# Heuristic class signals (legend rows are mostly works for PWG/PW).
RE_GRAMMAR_EXP = re.compile(
    r"\b("
    r"adjective?s?|adjectiv\w*|adverb\w*|particip\w*|pronoun\w*|pronomen|"
    r"substantiv\w*|suffix\w*|prefix\w*|"
    r"nominativ\w*|accusativ\w*|genitiv\w*|dativ\w*|ablativ\w*|locativ\w*|vocativ\w*|"
    r"masculin\w*|feminin\w*|neutr\w*|singular|plural|dual|"
    r"konjugation|deklination|casus|tempus|modus|"
    r"grammati[sc]\w*|wurzel|stammform|infinitiv\w*|gerund\w*"
    r")\b",
    re.I,
)
RE_META_KEY = re.compile(
    r"^(Sch\.|Schol\.|Hdschr\.|Ms\.|Mss\.|ed\.|Ed\.)$",
    re.I,
)
RE_META_EXP = re.compile(
    r"^(scholiast|schol\.|handschrift|manuscript|vgl\.|compare|confer|"
    r"siehe\b|see\b|ed\.\s|editio)",
    re.I,
)
RE_SLUG_BAD = re.compile(r"[^A-Za-z0-9._-]+")


def classify_row(key: str, expansion: str) -> str:
    """Return work | grammar | meta | unknown (heuristic, not gold)."""
    k = (key or "").strip()
    e = (expansion or "").strip()
    if RE_META_KEY.match(k) or RE_META_EXP.match(e):
        return "meta"
    if RE_GRAMMAR_EXP.search(e) and len(e) < 80:
        return "grammar"
    if not e:
        return "unknown"
    # Default for PWG/PW citation legends
    return "work"


def provisional_work_id(dict_code: str, key: str) -> str:
    # Keep trailing abbreviation dots (AK.); only collapse non-slug chars.
    slug = RE_SLUG_BAD.sub("_", key.strip()).strip("_-")
    if not slug:
        slug = "empty"
    if len(slug) > 80:
        slug = slug[:80]
    return f"prov:{dict_code.upper()}:{slug}"


def load_tsv(path: Path) -> list[dict[str, str]]:
    if not path.is_file():
        raise FileNotFoundError(str(path))
    with path.open(encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f, delimiter="\t"))


def load_residual_map(path: Path | None) -> dict[str, str]:
    """key_norm → residual class from decompose TSV."""
    if path is None or not path.is_file():
        return {}
    out: dict[str, str] = {}
    for row in load_tsv(path):
        k = (row.get("key_norm") or "").strip()
        cls = (row.get("class") or "").strip()
        if k and cls:
            out[k] = cls
    return out


def row_to_legend(
    dict_code: str,
    cross: dict[str, str],
    residual: dict[str, str],
) -> dict:
    key = (cross.get("key_norm") or cross.get("key_raw") or "").strip()
    expansion = (cross.get("expansion") or "").strip()
    flag = (cross.get("flag") or "").strip()
    try:
        body_count = int(cross.get("body_count") or 0)
    except ValueError:
        body_count = 0
    sources = (cross.get("sources") or "").strip()
    cls = classify_row(key, expansion)

    residual_class = None
    if flag == "pref_only" or body_count == 0:
        residual_class = residual.get(key)
        # Decompose only samples top-N; leave null if not classified
        if residual_class is None and flag == "pref_only":
            residual_class = None

    work_id = None
    review_required = False
    if cls == "work":
        work_id = provisional_work_id(dict_code, key)
        review_required = True  # all provisional in wave-1 (R8)
    elif cls == "unknown":
        review_required = True

    return {
        "dict": dict_code.upper(),
        "key": key,
        "expansion": expansion,
        "class": cls,
        "body_count": body_count,
        "residual_class": residual_class,
        "work_id": work_id,
        "review_required": review_required,
        "sources": sources,
        "fold_applied": None,
    }


def emit_dict(
    dict_code: str,
    out_dir: Path,
    *,
    crosscheck_tsv: Path | None = None,
    decompose_tsv: Path | None = None,
) -> dict:
    code = dict_code.upper()
    stem = code.lower()
    cross_path = crosscheck_tsv or (out_dir / f"{stem}_pref_abbr_crosscheck.tsv")
    decomp_path = decompose_tsv or (out_dir / f"{stem}_pref_only_decompose.tsv")
    if not cross_path.is_file():
        raise FileNotFoundError(
            f"missing crosscheck TSV for {code}: {cross_path} "
            f"(run: python scripts/pref_abbr_crosscheck.py --dict {code} --out-dir {out_dir})"
        )

    residual = load_residual_map(decomp_path if decomp_path.is_file() else None)
    cross_rows = load_tsv(cross_path)
    legend_rows = [row_to_legend(code, r, residual) for r in cross_rows if (r.get("key_norm") or r.get("key_raw") or "").strip()]

    # Stable order: key
    legend_rows.sort(key=lambda r: r["key"])

    payload = {
        "dict": code,
        "generated": date.today().isoformat(),
        "source": {
            "crosscheck_tsv": _rel(cross_path),
            "decompose_tsv": _rel(decomp_path) if decomp_path.is_file() else "",
        },
        "n": len(legend_rows),
        "rows": legend_rows,
    }

    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{stem}_legend.json"
    out_path.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(
        json.dumps(
            {
                "dict": code,
                "n": payload["n"],
                "out": str(out_path),
                "with_residual": sum(1 for r in legend_rows if r["residual_class"]),
                "work_class": sum(1 for r in legend_rows if r["class"] == "work"),
            },
            ensure_ascii=False,
        ),
        flush=True,
    )
    return payload


def _rel(path: Path) -> str:
    try:
        return str(path.resolve().relative_to(REPO.resolve())).replace("\\", "/")
    except ValueError:
        return str(path).replace("\\", "/")


def emit_combined(payloads: list[dict], out_dir: Path) -> Path:
    """Optional combined feed: {dicts: {PWG: …, PW: …}, n_total}."""
    by_dict = {p["dict"]: p for p in payloads}
    combined = {
        "generated": date.today().isoformat(),
        "dicts": sorted(by_dict.keys()),
        "n_total": sum(p["n"] for p in payloads),
        "by_dict": by_dict,
    }
    path = out_dir / "pref_legends_combined.json"
    path.write_text(
        json.dumps(combined, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"wrote combined {path} n_total={combined['n_total']}", flush=True)
    return path


def self_check() -> int:
    sample_cross = HERE / "_selfcheck_legend_cross.tsv"
    sample_decomp = HERE / "_selfcheck_legend_decomp.tsv"
    out = HERE / "_selfcheck_legend_out"
    try:
        sample_cross.write_text(
            "key_raw\tkey_norm\tin_pref\tbody_count\tsamples\tflag\tshort_key\tsources\texpansion\n"
            "AK.\tAK.\t1\t12\t1,2\t\t0\tpwgpref07.md:10\tAmarakosha.\n"
            "RareWork.\tRareWork.\t1\t0\t\tpref_only\t0\tpwgpref07.md:11\tSome rare MS work.\n"
            "a.\ta.\t1\t0\t\tshort_pref_only\t1\tpwgpref07.md:12\tadjective.\n",
            encoding="utf-8",
        )
        sample_decomp.write_text(
            "dict\tkey_norm\tclass\tconfidence\talt_form\talt_body_count\tbody_count\texpansion\tsources\tnotes\n"
            "PWG\tRareWork.\trare\thigh\t\t0\t0\tSome rare MS work.\tpwgpref07.md:11\texpansion_rare_signal\n",
            encoding="utf-8",
        )
        out.mkdir(parents=True, exist_ok=True)
        payload = emit_dict(
            "PWG",
            out,
            crosscheck_tsv=sample_cross,
            decompose_tsv=sample_decomp,
        )
        assert payload["n"] == 3, payload["n"]
        by = {r["key"]: r for r in payload["rows"]}
        assert by["AK."]["class"] == "work", by["AK."]
        assert by["AK."]["body_count"] == 12
        assert by["AK."]["work_id"] == "prov:PWG:AK."
        assert by["AK."]["review_required"] is True
        assert by["AK."]["residual_class"] is None
        assert by["RareWork."]["residual_class"] == "rare"
        assert by["a."]["class"] == "grammar", by["a."]
        assert by["a."]["work_id"] is None
        # schema fields present
        for r in payload["rows"]:
            for f in (
                "dict",
                "key",
                "expansion",
                "class",
                "body_count",
                "residual_class",
                "work_id",
                "review_required",
                "sources",
                "fold_applied",
            ):
                assert f in r, f
        print("self-check OK: emit legend", payload["n"], "rows")
        return 0
    finally:
        sample_cross.unlink(missing_ok=True)
        sample_decomp.unlink(missing_ok=True)
        legend = out / "pwg_legend.json"
        if legend.is_file():
            legend.unlink()
        if out.is_dir():
            try:
                out.rmdir()
            except OSError:
                pass


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(
        description="Emit structured legend JSON from pref×body crosscheck TSVs (UC-3)"
    )
    ap.add_argument(
        "--dict",
        dest="dicts",
        action="append",
        help="Dictionary code (repeatable). Default: PWG and PW pilot.",
    )
    ap.add_argument("--out-dir", type=Path, default=DEFAULT_OUT)
    ap.add_argument(
        "--combined",
        action="store_true",
        help="Also write pref_legends_combined.json",
    )
    ap.add_argument("--self-check", action="store_true")
    args = ap.parse_args(argv)

    if args.self_check:
        return self_check()

    codes = [c.upper() for c in (args.dicts or list(PILOT_DICTS))]
    out_dir = Path(args.out_dir)
    payloads: list[dict] = []
    errors = 0
    for code in codes:
        try:
            payloads.append(emit_dict(code, out_dir))
        except FileNotFoundError as exc:
            print(f"ERROR {code}: {exc}", flush=True)
            errors += 1
        except Exception as exc:  # noqa: BLE001
            print(f"ERROR {code}: {exc}", flush=True)
            errors += 1

    if args.combined and payloads:
        emit_combined(payloads, out_dir)

    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
