# Pref keys ↔ body `.txt` naming authority

_Created: 24-07-2026 · Last updated: 24-07-2026_

**Handoff:** [H1569](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1569-Sonnet_csl-guides_pref-body-naming-authority-apply_24.07.26.md) · **Issue:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123) · **Prior:** [H1530](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1530-Sonnet_csl-guides_pref-abbr-body-crosscheck_23.07.26.md) · [H1543](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1543-Sonnet_csl-guides_pref-abbr-crosscheck-all_23.07.26.md) · [H1560](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1560-Sonnet_csl-guides_pref-only-pwg-pw-decompose_24.07.26.md)

## Ruling (24-07-2026)

csl-orig body `.txt` for CDSL dictionaries was **already human-edited** over a long correction history. Front-matter pref Markdown is **OCR of the printed Vorwort/legend** and has **not** yet been brought to the same editorial standard.

We do **not** “modernise” 19th‑c. orthography for its own sake. We ensure that **how a work is named (siglum) in the body is the same way it is named in the pref legend**, so both channels share one naming for the same cited work.

| Layer | Authority |
|-------|-----------|
| Body `csl-orig/v02/{dict}/{dict}.txt` | **Wins** for siglum orthography / naming |
| Pref OCR source pages (`*prefNN.md`) | Corrected **toward body**; **every key change logged** in a meta change log |
| Print scan | Audit trail; rare/MS works never in body stay in the legend |

This **supersedes** the H1530–H1560 non-goal “no bulk pref overwrite / scan remains truth for keys.” Expansions (full titles) remain scan-faithful unless a key rewrite requires a minimal key-side fix.

## Apply gate

| Apply | Hold |
|-------|------|
| `ortho` · `ocr_key` · `spacing` with body-attested `alt_form` (`alt_body_count ≥ 1`) | `rare` (handschrift / occasional) |
| OCR artifacts (leading `\` / quotes) when bare form hits body | `true_unused` long bibliographic titles |
| Dual-key / parenthetical strip when a body form is attested | `ambiguous` without body attestation |
| | Invented forms with zero body hits |

## Tools

| Script | Role |
|--------|------|
| [`scripts/pref_abbr_crosscheck.py`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/pref_abbr_crosscheck.py) | Census keys vs body |
| [`scripts/pref_only_decompose.py`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/pref_only_decompose.py) | Type residual `pref_only` |
| [`scripts/pref_key_body_align.py`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/pref_key_body_align.py) | Apply gated key rewrites + write change log |

## Change logs

Per-dict apply runs write a dated change-log meta document under `scripts/out/` (e.g. `pwg_pref_key_body_align_changes.md`) listing every `old → new` with class, body count, source file, and line.

After editing source pages, rebuild consolidated editions with each dict’s `prefaces/build_combined.py`.

## Reproduce

```text
python scripts/pref_abbr_crosscheck.py --dict PWG --out-dir scripts/out --json-summary
python scripts/pref_only_decompose.py --dict PWG
python scripts/pref_key_body_align.py --dict PWG --apply
# then in PWG/prefaces: python build_combined.py
```

---

_Dr. Mārcis Gasūns_
