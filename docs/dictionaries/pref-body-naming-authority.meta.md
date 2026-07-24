# Metadoc — pref-body-naming-authority.md

_Created: 24-07-2026 · Last updated: 24-07-2026_

| Field | Value |
|-------|-------|
| Subject | [pref-body-naming-authority.md](./pref-body-naming-authority.md) |
| Purpose | Standing policy: body `.txt` wins for pref legend *naming* |
| Audience | Agents correcting CDSL pref OCR; humans reviewing #123 |
| Provenance | H1569 · Grok 4.5 (`grok-4.5`) · MG ruling 24-07-2026 · UC-8 fold registry H1592 · UC-11 FAIR surfaces H1595 |
| Supersedes | H1530–H1560 “no bulk pref overwrite” for **keys** |

## Improvement backlog

1. Extend apply beyond PWG/PW sample to full `pref_only` lists and other dicts.
2. Dual-key legends: optional split into two legend rows instead of collapsing to the attested side.
3. ~~Fold-table extensions (`ḱ`, German j/y) documented with examples before baking into census.~~ **Done (H1592):** [`scripts/pref_fold_table.json`](https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/pref_fold_table.json) + align loader + `--self-check`.
4. Optional: surface `fold_applied` example/rule id on legend emit rows (UC-3 join).

## Limitations

- Expansions are not re-edited from body.
- Body may omit rare works that remain correctly in the legend.
- Translations (`.en.md` / `.ru.md`) get the same **key** rewrite only when the bold key string matches source.

---

_Dr. Mārcis Gasūns_
