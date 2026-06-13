---
id: generation-pipeline
title: Generation Pipeline
sidebar_label: Generation Pipeline
---

# Generation Pipeline

The generation pipeline turns canonical source text in `csl-orig` into the XML, search
indices, and web displays served on the live site. The tooling lives in
[`csl-pywork`](https://github.com/sanskrit-lexicon/csl-pywork).

## Generate a dictionary

```sh
cd csl-pywork/v02
sh generate_dict.sh {dict} tempparent/{dict}
```

This reads `csl-orig/v02/{dict}/{dict}.txt` and produces the generated artifacts under
the target directory.

## Validate the XML

```sh
sh xmlchk_xampp.sh {dict}
```

On a machine without XAMPP/`xmllint` (typical on Windows), run the Python XML builder and
treat **"All records parsed by ET"** from `make_xml.py` as a passing signal.

## Prerequisites (local Windows setup)

- `python3` available on `PATH` — a thin wrapper forwarding to `python` works:

  ```sh
  printf '#!/bin/bash\npython "$@"\n' > /tmp/pybin/python3
  chmod +x /tmp/pybin/python3
  export PATH="/tmp/pybin:$PATH"
  ```

- `mako` installed: `pip install mako`.
- [`csl-websanlexicon`](https://github.com/sanskrit-lexicon/csl-websanlexicon) checked
  out as a **sibling** of `csl-pywork`.

## Windows / encoding notes

- Every Python script should call
  `sys.stdout.reconfigure(encoding='utf-8')` and the same for `stderr`.
- Pass `encoding='utf-8'` to every `subprocess.run` that reads `gh api` output.
- **Never** write source files with a BOM — use `open(f, 'w', encoding='utf-8')`, not
  `utf-8-sig`.

## Where this fits

This step sits between **[Corrections Workflow](../contributing/corrections-workflow)**
(producing corrected source) and the published site. See **[Architecture](architecture)**
for the end-to-end diagram.

:::note Needs maintainer input
How generated artifacts reach the live server (deploy mechanism, cadence, who triggers
it) is not documented publicly — fill from the project's own operations notes.
:::
