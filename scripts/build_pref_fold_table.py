# -*- coding: utf-8 -*-
"""Rebuild scripts/pref_fold_table.json from PWG/PW align change logs (UC-8 / H1592).

Examples come from ``scripts/out/{pwg,pw}_pref_key_body_align_changes.tsv``.
Pattern rules are the documented ORTHO_SUBS set (kept here so the JSON is the
registry home, not silent invent-a-fold in align).

Usage (from csl-guides root)::

    python scripts/build_pref_fold_table.py
    python scripts/pref_key_body_align.py --self-check
"""
from __future__ import annotations

import csv
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent

# Pattern rules from documented ORTHO_SUBS (H1580 align); UC-8 registry home.
ORTHO_SUBS: list[tuple[str, str, str, str]] = [
    (r"Gṛhj", "Gṛhy", "grhy-j-y", "j/y in Gṛhy compound"),
    (r"Gṛhja", "Gṛhya", "grhya-j-y", "j/y in Gṛhya"),
    (r"Pratjabd", "Pratyabd", "pratyabd-j-y", "j/y"),
    (r"Pathjâpathjav", "Pathyâpathyav", "pathy-j-y", "j/y"),
    (r"Dhjânav", "Dhyânav", "dhyana-v", "j/y"),
    (r"Dhjânab", "Dhyânab", "dhyana-b", "j/y"),
    (r"Dhjâna", "Dhyâna", "dhyana", "j/y"),
    (r"Divja", "Divya", "divya", "j/y"),
    (r"Divjâv", "Divyâv", "divyav", "j/y"),
    (r"Nâṭjaç", "Nâṭyaç", "natya-c", "j/y"),
    (r"Nâṭja", "Nâṭya", "natya", "j/y"),
    (r"Bhavishjott", "Bhavishyott", "bhavishya", "j/y"),
    (r"Maitrj", "Maitry", "maitry", "j/y"),
    (r"Saṁnj", "Saṁny", "samny", "j/y"),
    (r"Tâṇḍja", "Tâṇḍya", "tandya", "j/y"),
    (r"Devatâdhj", "Devatâdhy", "devatadhy", "j/y"),
    (r"Suparṇâdhj", "Suparṇâdhy", "suparnadhy", "j/y"),
    (r"Pravarâdhj", "Pravarâdhy", "pravaradhy", "j/y"),
    (r"Kâtj\.", "Kâty.", "katy", "Kâtj→Kâty (documented UC-8)"),
    (r"Kaij\.", "Kaiy.", "kaiy", "j/y"),
    (r"Jogas", "Yogas", "yogas", "J→Y"),
    (r"Jogat", "Yogat", "yogat", "J→Y"),
    (r"Jogaj", "Yogay", "yogay", "J→Y"),
    (r"Juktikalpat", "Yuktikalpat", "yukti", "J→Y"),
    (r"Javaneçv", "Yavaneçv", "yavane", "J→Y"),
    (r"Jâǵnikad", "Yâjñikad", "yajnika", "J/ǵ fold"),
    (r"Jaǵ\.", "Yaj.", "yaj", "J/ǵ"),
    (r"Ǵjot", "Jyot", "jyot", "Ǵ→J"),
    (r"Ǵaim", "Jaim", "jaim", "Ǵ→J"),
    (r"Bhoǵa", "Bhoga", "bhoga", "ǵ body form Bhoga/Bhoja family"),
    (r"Bîǵag", "Bîjag", "bijag", "ǵ→j"),
    (r"Prâjaçḱitt", "Prâyaçcitt", "prayascitt", "j/y + ḱ/c"),
    (r"Prâjaçḱ", "Prâyaçc", "prayasc", "j/y + ḱ/c"),
    (r"Prâjaçkitt", "Prâyaçcitt", "prayascitt2", "j/y"),
    (r"Khând\.", "Chând.", "chand", "Kh→Ch OCR/ortho"),
    (r"Ḱhând\.", "Chând.", "chand-k", "Ḱh→Ch"),
    (r"Drâhj", "Drâhy", "drahy", "j/y"),
    (r"Dâj\.", "Dây.", "day", "j/y"),
    (r"Dâjabh", "Dâyabh", "dayabh", "j/y"),
    (r"Vjavahârat", "Vyavahârat", "vyavahara", "j/y after V"),
    (r"Gâbâlop", "Jâbâlop", "jabalop", "G→J body"),
    (r"Gâb\.", "Jâb.", "jab", "G→J"),
    (r"Kuvalaj", "Kuvalay", "kuvalay", "j/y"),
    (r"Kâvjapr", "Kâvyapr", "kavyapr", "j/y"),
    (r"Kâvja", "Kâvya", "kavya", "j/y"),
    (r"Sâṁkhjak", "Sâṁkhyak", "samkhya", "j/y"),
    (r"Sâṃkhjak", "Sâṃkhyak", "samkhya2", "j/y"),
    (r"Vaidjabh", "Vaidyabh", "vaidya", "j/y"),
    (r"Vaidj\.", "Vaidy.", "vaidy", "j/y"),
    (r"Prajogar", "Prayogar", "prayoga", "j/y"),
    (r"Med\. avj", "Med. avy", "med-avy", "j/y"),
    (r"Hâsj", "Hâsy", "hasy", "j/y"),
    (r"Lâṭj", "Lâṭy", "laty", "j/y"),
    (r"Prij\.", "Priy.", "priy", "j/y"),
    (r"Sûrjad", "Sûryad", "suryad", "j/y"),
    (r"Sûrjas", "Sûryas", "suryas", "j/y"),
    (r"Vâju-P", "Vâyu-P", "vayu", "j/y"),
    (r"Ârjabh", "Âryabh", "aryabh", "j/y"),
    (r"Matsja", "Matsya", "matsya", "j/y"),
    (r"Matsjop", "Matsyop", "matsyop", "j/y"),
    (r"Tithjâdit", "Tithyâdit", "tithya", "j/y"),
    (r"Vjutp", "Vyutp", "vyutp", "j/y"),
    (r"KRIJĀSAM", "KRIYĀSAM", "kriya", "J→Y caps"),
    (r"Gîr\.", "Gît.", "git", "OCR r→t"),
]

CHAR_RULES = [
    {
        "id": "rule-c-cedilla-to-sacute",
        "kind": "ortho",
        "pattern": "ç",
        "replacement": "ś",
        "flags": "literal",
        "notes": "ç → ś (body IAST-ish); UC-8",
    },
    {
        "id": "rule-c-cedilla-upper",
        "kind": "ortho",
        "pattern": "Ç",
        "replacement": "Ś",
        "flags": "literal",
        "notes": "Ç → Ś",
    },
    {
        "id": "rule-k-acute-to-c",
        "kind": "ortho",
        "pattern": "ḱ",
        "replacement": "c",
        "flags": "literal",
        "notes": "ḱ/c OCR (UC-8 example)",
    },
    {
        "id": "rule-k-acute-upper",
        "kind": "ortho",
        "pattern": "Ḱ",
        "replacement": "C",
        "flags": "literal",
        "notes": "Ḱ → C",
    },
    {
        "id": "rule-g-acute-to-j",
        "kind": "ortho",
        "pattern": "ǵ",
        "replacement": "j",
        "flags": "literal",
        "notes": "ǵ → j (Laghuǵ→Laghuj)",
    },
    {
        "id": "rule-g-acute-upper",
        "kind": "ortho",
        "pattern": "Ǵ",
        "replacement": "J",
        "flags": "literal",
        "notes": "Ǵ → J",
    },
]


def load_examples() -> list[dict]:
    examples: list[dict] = []
    for code in ("PWG", "PW"):
        tsv = HERE / "out" / f"{code.lower()}_pref_key_body_align_changes.tsv"
        with tsv.open(encoding="utf-8") as f:
            for i, r in enumerate(csv.DictReader(f, delimiter="\t"), 1):
                log = (
                    "https://github.com/sanskrit-lexicon/csl-guides/blob/main/"
                    f"scripts/out/{code.lower()}_pref_key_body_align_changes.md"
                )
                examples.append(
                    {
                        "id": f"ex-{code.lower()}-{i:02d}",
                        "dict": code,
                        "old": r["old"],
                        "new": r["new"],
                        "class": r["class"],
                        "body_n": int(r["alt_body_count"]),
                        "source_log": log,
                        "notes": r.get("notes") or "",
                    }
                )
    return examples


def main() -> None:
    examples = load_examples()
    rules: list[dict] = []
    for pat, rep, rid, notes in ORTHO_SUBS:
        rules.append(
            {
                "id": f"rule-{rid}",
                "kind": "ortho",
                "pattern": pat,
                "replacement": rep,
                "flags": "regex",
                "notes": notes,
                "source": (
                    "ORTHO_SUBS in pref_key_body_align.py (H1580); "
                    "registry home is this fold table (UC-8 / H1592)"
                ),
            }
        )
    rules.extend(CHAR_RULES)

    doc = {
        "version": 1,
        "title": "Pref orthography / OCR fold table (UC-8)",
        "description": (
            "Documented old→new key folds for pref legend ↔ body naming. "
            "Loaded by pref_key_body_align.py (additive candidate generation) — "
            "never invent a fold without a row here or body attestation. "
            "Diacritic strip for search lives separately in fold_diacritics()."
        ),
        "policy": (
            "https://github.com/sanskrit-lexicon/csl-guides/blob/main/"
            "docs/dictionaries/pref-body-naming-authority.md"
        ),
        "handoff": (
            "https://github.com/gasyoun/Uprava/blob/main/handoffs/"
            "H1592-Sonnet_csl-guides_pref-fold-table-registry_24.07.26.md"
        ),
        "issue": "https://github.com/sanskrit-lexicon/csl-guides/issues/123",
        "use_case": "UC-8",
        "examples": examples,
        "rules": rules,
    }
    out = HERE / "pref_fold_table.json"
    out.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    n_body = sum(1 for e in examples if e["body_n"] >= 1)
    print(f"wrote {out} examples={len(examples)} rules={len(rules)} body_n>=1={n_body}")


if __name__ == "__main__":
    main()
