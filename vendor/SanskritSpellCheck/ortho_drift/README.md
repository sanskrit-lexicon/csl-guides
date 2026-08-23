# Vendored: SanskritSpellCheck ortho-drift reform maps

Vendored copies (the §24 transport) of the canonical upstream assets:

- [de_reform_map.tsv](https://github.com/drdhaval2785/SanskritSpellCheck/blob/master/ortho_drift/de_reform_map.tsv)
- [ru_reform_map.tsv](https://github.com/drdhaval2785/SanskritSpellCheck/blob/master/ortho_drift/ru_reform_map.tsv)

Upstream owns these maps; this repo consumes them frozen. The committed
generator `scripts/build-ortho-query-expansions.mjs` pins their SHA-256 in
`src/data/ortho-query-expansions.json`; `--check` re-hashes and exits 1 on
drift ("upstream moved — rebuild and re-commit"). Never hand-edit the TSVs
here; rebuild from the sibling checkout
(`../SanskritSpellCheck/ortho_drift/`) instead.

Contract: SHARED_CODE.md §24 (Interlink Graph v2 W4), edge row
`SanskritSpellCheck -> csl-guides · ortho_drift/*_reform_map.tsv` in Uprava's
`interlinks_edges.tsv`. Reference implementation of the same contract:
`scripts/build-corpus-frequency.mjs` ← kosha.

Search-normalization asset, never a correction list — upstream README applies.
