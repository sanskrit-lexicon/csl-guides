# -*- coding: utf-8 -*-
"""build-entry-anatomy.py — vendor the "anatomy of a dictionary entry" data.

Consumes the reusable /entry-anatomy producer skill
(~/.claude/skills/entry-anatomy/entry_anatomy.py, built under Uprava H791) over a
sibling csl-orig checkout, cleans the token stream for public display, and writes
src/data/entry-anatomy.json — the data the <EntryAnatomy/> React component renders
on docs/dictionaries/entry-anatomy.mdx. The skill is the producer; this is the
csl-guides consumer wiring. Re-run after the skill or the curated entry list
changes; the JSON is committed so the site build needs neither the skill nor
csl-orig.

    python scripts/build-entry-anatomy.py [--csl-root PATH] [--probe]
"""
import argparse
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

def _find_skill_dir():
    cands = [
        os.environ.get("ENTRY_ANATOMY_SKILL"),
        os.path.expanduser("~/.claude/skills/entry-anatomy"),
        os.path.join(os.environ.get("USERPROFILE", ""), ".claude", "skills", "entry-anatomy"),
        r"C:\Users\user\.claude\skills\entry-anatomy",
    ]
    for c in cands:
        if c and os.path.isfile(os.path.join(c, "entry_anatomy.py")):
            return c
    raise SystemExit("ERROR: cannot locate the entry-anatomy skill; set ENTRY_ANATOMY_SKILL")


SKILL_DIR = _find_skill_dir()
sys.path.insert(0, SKILL_DIR)
import entry_anatomy as ea  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
OUT = os.path.join(REPO, "src", "data", "entry-anatomy.json")

# Curated exemplars — deliberately SHORT headwords whose opening lines pack the
# structural parts, one per flagship dictionary, so each card reads as a compact
# Duden-style anatomy rather than a full concordance. Long entries are truncated
# to MAX_TOKENS with a continuation marker. SLP1 <k1> keys.
ENTRIES = [
    ("mw", "kAla"),      # MW (English flagship): homonym + grammar + Sanskrit form + citations
    ("pwg", "gaja"),     # PWG (German): grammar + sense + gloss + exhaustive citations
    ("ap90", "kARa"),    # Apte (English): bracket etymology + numbered senses + example
    ("gra", "iDma"),     # Grassmann (Vedic): derivation + attested Ṛg-Veda forms with loci
]

# Cap the displayed token run so a card stays a compact anatomy of the entry's
# opening (where the structural parts live), not a full reproduction.
MAX_TOKENS = 18


def clean(txt):
    """Skill's display cleaner + whitespace normalisation for inline HTML."""
    txt = ea._clean(txt)
    txt = txt.replace("­", "")           # soft hyphens
    txt = txt.replace("〉", ")")          # PWG/GRA sense divider 1〉 -> 1)
    txt = re.sub(r"_([^_]+)_", r"\1", txt)  # PWG italic markup _in_ -> in
    txt = re.sub(r"\s+", " ", txt)
    return txt


def to_iast(txt):
    """Transliterate a raw SLP1 Sanskrit form to IAST for reader-friendly
    display (garizWa -> gariṣṭha). Accent notation (\\, ^, /) is dropped first."""
    if not ea._HAVE_XLIT:
        return txt
    core = re.sub(r"[\\^/=]", "", txt)
    # keep surrounding whitespace so merged runs stay spaced
    lead = txt[: len(txt) - len(txt.lstrip())]
    trail = txt[len(txt.rstrip()):]
    try:
        out = ea.sanscript.transliterate(core.strip(), ea.sanscript.SLP1, ea.sanscript.IAST)
    except Exception:
        return txt
    return lead + out + trail


def merge_tokens(tokens):
    """Clean each token, drop empties, coalesce adjacent same-part runs."""
    out = []
    for t in tokens:
        part = t["part"]
        text = clean(t["text"])
        if not text:
            continue
        if part == "sanskrit":
            text = to_iast(text)
        elif part == "etymology" and re.fullmatch(r"[^.\d]+", text) and re.search(r"[A-Z]", text):
            # a bare SLP1 root form inside the derivation (e.g. gF-ku), not a
            # citation like "Uṇ. 1. 24." — render it in IAST too
            text = to_iast(text)
        if out and out[-1]["part"] == part:
            # join, keeping a single space between merged runs
            prev = out[-1]["text"]
            joiner = "" if prev.endswith(" ") or text.startswith(" ") else " "
            out[-1]["text"] = (prev + joiner + text)
        else:
            out.append({"part": part, "text": text})
    # trim leading/trailing whitespace of the whole run cosmetically
    for tk in out:
        tk["text"] = tk["text"]
    return out


def build_entry(dct, k1, root):
    path = ea.entry_path(root, dct)
    blocks = ea.load_entries(path, k1)
    if not blocks:
        raise SystemExit("ERROR: %s <k1>=%s not found" % (dct, k1))
    e = ea.analyze(blocks[0], dct)
    tokens = merge_tokens(e["tokens"])
    truncated = len(tokens) > MAX_TOKENS
    if truncated:
        tokens = tokens[:MAX_TOKENS]
        tokens.append({"part": "gloss", "text": " … "})
    return {
        "dict": e["dict"],
        "dict_name": e["dict_name"],
        "k1": e["k1"],
        "k2": e["k2"],
        "devanagari": e["devanagari"],
        "iast": e["iast"],
        "homonym": e["homonym"],
        "id": e["id"],
        "page": e["page"],
        "truncated": truncated,
        "tokens": tokens,
    }


def parts_meta():
    return [
        {"key": k, "label": lbl, "color": c, "desc": d}
        for (k, lbl, c, d) in ea.PARTS
    ]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csl-root", default=None)
    ap.add_argument("--probe", action="store_true",
                    help="print a plain-text preview of each entry, write nothing")
    args = ap.parse_args()
    root = ea.find_csl_root(args.csl_root)

    entries = [build_entry(d, k, root) for (d, k) in ENTRIES]

    if args.probe:
        for e in entries:
            flat = " ".join(t["text"] for t in e["tokens"])
            flag = "!" if ("�" in flat or "\\" in flat or "^" in flat) else " "
            used = sorted(set(t["part"] for t in e["tokens"]))
            print(flag, ("%s %s" % (e["dict"], e["iast"])).ljust(14),
                  "parts=", used)
            print("   ", flat[:120])
        return

    payload = {
        "_generated_by": "scripts/build-entry-anatomy.py over the /entry-anatomy skill (Uprava H791)",
        "parts": parts_meta(),
        "entries": entries,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    print("wrote %s (%d entries)" % (OUT, len(entries)))


if __name__ == "__main__":
    main()
