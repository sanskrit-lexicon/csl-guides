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

## Deploying to the live server

CDSL is **not deployed by CI** — the site is generated and served directly on the
University of Cologne web server. Per
[`csl-websanlexicon/readme_cologne.org`](https://github.com/sanskrit-lexicon/csl-websanlexicon/blob/master/readme_cologne.org):

- Each dictionary's **web application** (the B/L/A/M displays, in PHP) is produced by a
  `generate.py` step using **mako** templates, run in the `v00` working directory on the
  Cologne host.
- Output is written into the server's scan tree at `…/{CODE}Scan/{year}/web/` — the very
  paths the live URLs use (e.g. `/scans/MWScan/2020/web/…`). The `{year}` segment marks
  the generation vintage (2013–2014 originally; **2020** for the current build).
- The Cologne host then serves those generated PHP/JS/CSS files directly (Apache + PHP;
  XAMPP is referenced for the equivalent local validation in `xmlchk_xampp.sh`).

So **regeneration is the deploy**: running the generator on the server refreshes what
visitors see. The cadence is **manual** — maintainers regenerate after a batch of
corrections — not triggered automatically.

:::note
`readme_cologne.org` is dated 2018 and references the Python 2 toolchain; the current
generation (`csl-pywork`, Python 3 + mako) is newer, but the **publish model is
unchanged** — generated files live in the server's `…/{CODE}Scan/{year}/web/` tree and are
served from there.
:::
