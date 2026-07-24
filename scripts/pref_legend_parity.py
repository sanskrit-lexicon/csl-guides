# -*- coding: utf-8 -*-
"""pref_legend_parity.py — schema + key-count gate for legend store (UC-3 / H1591).

Compares emitted `*_legend.json` against:
  1. scripts/legend.schema.json (jsonschema if installed; else structural checks)
  2. sibling `*_pref_abbr_crosscheck.tsv` key inventory and body_count
  3. n == len(rows); non-short key coverage ≥ crosscheck non-short set

Examples::

    python scripts/pref_legend_parity.py --check
    python scripts/pref_legend_parity.py --check --dict PWG
    python scripts/pref_legend_parity.py --self-check
"""
from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

HERE = Path(__file__).resolve().parent
DEFAULT_OUT = HERE / "out"
SCHEMA_PATH = HERE / "legend.schema.json"
PILOT_DICTS = ("PWG", "PW")

ROW_REQUIRED = (
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
)
CLASS_ENUM = frozenset({"work", "grammar", "meta", "unknown"})


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def load_cross_keys(tsv: Path) -> tuple[dict[str, int], set[str], set[str]]:
    """Return (key→body_count, all_keys, non_short_keys)."""
    counts: dict[str, int] = {}
    all_keys: set[str] = set()
    non_short: set[str] = set()
    with tsv.open(encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f, delimiter="\t"):
            k = (row.get("key_norm") or "").strip()
            if not k:
                continue
            all_keys.add(k)
            try:
                counts[k] = int(row.get("body_count") or 0)
            except ValueError:
                counts[k] = 0
            short = str(row.get("short_key") or "0").strip() in ("1", "true", "True")
            if not short:
                non_short.add(k)
    return counts, all_keys, non_short


def structural_validate(payload: dict, schema: dict | None) -> list[str]:
    """Stdlib structural checks mirroring the legend schema (always run)."""
    errs: list[str] = []
    if not isinstance(payload, dict):
        return ["payload is not an object"]
    for req in ("dict", "generated", "n", "rows"):
        if req not in payload:
            errs.append(f"missing top-level field {req!r}")
    if not isinstance(payload.get("dict"), str) or not payload.get("dict"):
        errs.append("dict must be non-empty string")
    if not isinstance(payload.get("n"), int) or payload.get("n", -1) < 0:
        errs.append("n must be non-negative int")
    rows = payload.get("rows")
    if not isinstance(rows, list):
        errs.append("rows must be an array")
        return errs
    if payload.get("n") != len(rows):
        errs.append(f"n={payload.get('n')} != len(rows)={len(rows)}")
    for i, row in enumerate(rows):
        if not isinstance(row, dict):
            errs.append(f"rows[{i}] not an object")
            continue
        for f in ROW_REQUIRED:
            if f not in row:
                errs.append(f"rows[{i}] missing {f!r}")
        if row.get("class") not in CLASS_ENUM:
            errs.append(f"rows[{i}] class={row.get('class')!r} not in enum")
        if not isinstance(row.get("key"), str) or not row.get("key"):
            errs.append(f"rows[{i}] key empty")
        bc = row.get("body_count")
        if not isinstance(bc, int) or bc < 0:
            errs.append(f"rows[{i}] body_count invalid: {bc!r}")
        if not isinstance(row.get("review_required"), bool):
            errs.append(f"rows[{i}] review_required not bool")
        if row.get("work_id") is not None and not isinstance(row.get("work_id"), str):
            errs.append(f"rows[{i}] work_id must be string or null")
        if row.get("residual_class") is not None and not isinstance(
            row.get("residual_class"), str
        ):
            errs.append(f"rows[{i}] residual_class must be string or null")
        if row.get("fold_applied") is not None and not isinstance(
            row.get("fold_applied"), str
        ):
            errs.append(f"rows[{i}] fold_applied must be string or null")
        # R8: provisional work_id implies review_required
        wid = row.get("work_id")
        if isinstance(wid, str) and wid.startswith("prov:") and not row.get(
            "review_required"
        ):
            errs.append(f"rows[{i}] provisional work_id without review_required")
    # Optional: draft-2020-12 via jsonschema when present
    if schema is not None:
        try:
            import jsonschema  # type: ignore

            validator = jsonschema.Draft202012Validator(schema)
            for e in sorted(validator.iter_errors(payload), key=lambda x: list(x.path)):
                errs.append(f"jsonschema: {e.message} @ {list(e.path)}")
        except ImportError:
            pass
        except Exception as exc:  # noqa: BLE001
            errs.append(f"jsonschema error: {exc}")
    return errs


def check_dict(dict_code: str, out_dir: Path, schema: dict | None) -> list[str]:
    code = dict_code.upper()
    stem = code.lower()
    legend_path = out_dir / f"{stem}_legend.json"
    tsv_path = out_dir / f"{stem}_pref_abbr_crosscheck.tsv"
    errs: list[str] = []
    if not legend_path.is_file():
        return [f"{code}: missing {legend_path}"]
    if not tsv_path.is_file():
        return [f"{code}: missing crosscheck TSV {tsv_path}"]

    payload = load_json(legend_path)
    errs.extend(f"{code}: {e}" for e in structural_validate(payload, schema))

    if payload.get("dict") != code:
        errs.append(f"{code}: payload.dict={payload.get('dict')!r} expected {code}")

    counts, all_keys, non_short = load_cross_keys(tsv_path)
    legend_keys = {
        r["key"]
        for r in payload.get("rows", [])
        if isinstance(r, dict) and r.get("key")
    }

    # Key count ≥ crosscheck non-short keys
    missing_nonshort = non_short - legend_keys
    if missing_nonshort:
        sample = sorted(missing_nonshort)[:5]
        errs.append(
            f"{code}: legend missing {len(missing_nonshort)} non-short crosscheck keys "
            f"(e.g. {sample})"
        )

    # body_count parity for keys present in both
    mismatch = 0
    for row in payload.get("rows", []):
        if not isinstance(row, dict):
            continue
        k = row.get("key")
        if k not in counts:
            continue
        if row.get("body_count") != counts[k]:
            mismatch += 1
            if mismatch <= 5:
                errs.append(
                    f"{code}: body_count mismatch for {k!r}: "
                    f"legend={row.get('body_count')} tsv={counts[k]}"
                )
    if mismatch > 5:
        errs.append(f"{code}: … {mismatch - 5} further body_count mismatches")

    # Coverage report (not a failure if legend has extras)
    print(
        json.dumps(
            {
                "dict": code,
                "legend_n": len(legend_keys),
                "cross_n": len(all_keys),
                "cross_nonshort": len(non_short),
                "missing_nonshort": len(missing_nonshort),
                "ok": not errs or not any(e.startswith(f"{code}:") for e in errs),
            },
            ensure_ascii=False,
        ),
        flush=True,
    )
    return errs


def run_check(dicts: list[str], out_dir: Path) -> int:
    schema = None
    if SCHEMA_PATH.is_file():
        schema = load_json(SCHEMA_PATH)
    else:
        print(f"WARN: schema missing at {SCHEMA_PATH}", flush=True)

    all_errs: list[str] = []
    for code in dicts:
        all_errs.extend(check_dict(code, out_dir, schema))

    if all_errs:
        print("FAIL:", flush=True)
        for e in all_errs:
            print(f"  - {e}", flush=True)
        return 1
    print("pref_legend_parity --check OK", flush=True)
    return 0


def self_check() -> int:
    """Emit tiny fixture via pref_legend_emit and parity-check it."""
    sys.path.insert(0, str(HERE))
    from pref_legend_emit import emit_dict  # noqa: WPS433

    out = HERE / "_selfcheck_parity_out"
    cross = HERE / "_selfcheck_parity_cross.tsv"
    try:
        out.mkdir(parents=True, exist_ok=True)
        # Parity expects crosscheck TSV next to legend under out_dir
        cross_in_out = out / "pwg_pref_abbr_crosscheck.tsv"
        tsv_body = (
            "key_raw\tkey_norm\tin_pref\tbody_count\tsamples\tflag\tshort_key\tsources\texpansion\n"
            "AK.\tAK.\t1\t2\t1\t\t0\tx.md:1\tAmarakosha.\n"
            "x.\tx.\t1\t0\t\tshort_pref_only\t1\tx.md:2\tadjective.\n"
        )
        cross.write_text(tsv_body, encoding="utf-8")
        cross_in_out.write_text(tsv_body, encoding="utf-8")
        emit_dict("PWG", out, crosscheck_tsv=cross_in_out, decompose_tsv=None)
        rc = run_check(["PWG"], out)
        if rc != 0:
            print("self-check FAIL: parity red on fixture", flush=True)
            return 1
        # Corrupt body_count and expect fail
        path = out / "pwg_legend.json"
        payload = load_json(path)
        payload["rows"][0]["body_count"] = 999
        path.write_text(json.dumps(payload), encoding="utf-8")
        rc2 = run_check(["PWG"], out)
        if rc2 == 0:
            print("self-check FAIL: expected mismatch detection", flush=True)
            return 1
        print("self-check OK: parity green then red on corruption", flush=True)
        return 0
    finally:
        for p in (
            cross,
            out / "pwg_legend.json",
            out / "pwg_pref_abbr_crosscheck.tsv",
        ):
            if p.is_file():
                p.unlink()
        if out.is_dir():
            try:
                out.rmdir()
            except OSError:
                pass


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(
        description="Legend store schema + crosscheck parity gate (UC-3)"
    )
    ap.add_argument(
        "--check",
        action="store_true",
        help="Run parity checks (default action if no flags)",
    )
    ap.add_argument(
        "--dict",
        dest="dicts",
        action="append",
        help="Limit to dictionary code(s). Default: PWG PW",
    )
    ap.add_argument("--out-dir", type=Path, default=DEFAULT_OUT)
    ap.add_argument("--self-check", action="store_true")
    args = ap.parse_args(argv)

    if args.self_check:
        return self_check()

    # Default to --check when invoked with no action flags
    if not args.check and not args.self_check:
        args.check = True

    codes = [c.upper() for c in (args.dicts or list(PILOT_DICTS))]
    return run_check(codes, Path(args.out_dir))


if __name__ == "__main__":
    raise SystemExit(main())
