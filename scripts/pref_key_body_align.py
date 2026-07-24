# -*- coding: utf-8 -*-
"""pref_key_body_align.py — apply body-attested pref legend key renames (H1569/H1571/H1580).

Policy: csl-orig body .txt wins for *naming* of works.

Boost (H1580):
- Re-probe body at apply time for every census ``pref_only`` key (not only
  pre-classified alts).
- Preserve Markdown list bullets (``- KEY`` → ``- NEW``).
- Match OCR prefixes (``\\``, ``*``, ``ʼ``) and dual ``**A** oder **B**`` sides.
- Expanded orthography candidates (j/y, ç/ś, Gṛhj/Gṛhy, Kâtj/Kâty, …).

Examples::

    python scripts/pref_key_body_align.py --dict PWG --apply
    python scripts/pref_key_body_align.py --all --apply
"""
from __future__ import annotations

import argparse
import csv
import re
import sys
from datetime import date
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

HERE = Path(__file__).resolve().parent
TODAY = date.today().strftime("%d-%m-%Y")

sys.path.insert(0, str(HERE))
from pref_abbr_crosscheck import (  # noqa: E402
    DICT_CATALOG,
    fold_diacritics,
    resolve_body,
    resolve_pref_root,
)

MIN_ALT_BODY = 1
MIN_KEY_CHARS = 3

# Pref → body-ish orthography (documented; applied only if body attests).
ORTHO_SUBS: list[tuple[str, str]] = [
    (r"Gṛhj", "Gṛhy"),
    (r"Gṛhja", "Gṛhya"),
    (r"Pratjabd", "Pratyabd"),
    (r"Pathjâpathjav", "Pathyâpathyav"),
    (r"Dhjânav", "Dhyânav"),
    (r"Dhjânab", "Dhyânab"),
    (r"Dhjâna", "Dhyâna"),
    (r"Divja", "Divya"),
    (r"Divjâv", "Divyâv"),
    (r"Nâṭjaç", "Nâṭyaç"),
    (r"Nâṭja", "Nâṭya"),
    (r"Bhavishjott", "Bhavishyott"),
    (r"Maitrj", "Maitry"),
    (r"Saṁnj", "Saṁny"),
    (r"Tâṇḍja", "Tâṇḍya"),
    (r"Devatâdhj", "Devatâdhy"),
    (r"Suparṇâdhj", "Suparṇâdhy"),
    (r"Pravarâdhj", "Pravarâdhy"),
    (r"Kâtj\.", "Kâty."),
    (r"Kaij\.", "Kaiy."),
    (r"Jogas", "Yogas"),
    (r"Jogat", "Yogat"),
    (r"Jogaj", "Yogay"),
    (r"Juktikalpat", "Yuktikalpat"),
    (r"Javaneçv", "Yavaneçv"),
    (r"Jâǵnikad", "Yâjñikad"),
    (r"Jaǵ\.", "Yaj."),
    (r"Ǵjot", "Jyot"),
    (r"Ǵaim", "Jaim"),
    (r"Bhoǵa", "Bhoga"),
    (r"Bîǵag", "Bîjag"),
    (r"Prâjaçḱitt", "Prâyaçcitt"),
    (r"Prâjaçḱ", "Prâyaçc"),
    (r"Prâjaçkitt", "Prâyaçcitt"),
    (r"Khând\.", "Chând."),
    (r"Ḱhând\.", "Chând."),
    (r"Drâhj", "Drâhy"),
    (r"Dâj\.", "Dây."),
    (r"Dâjabh", "Dâyabh"),
    (r"Vjavahârat", "Vyavahârat"),
    (r"Gâbâlop", "Jâbâlop"),
    (r"Gâb\.", "Jâb."),
    (r"Kuvalaj", "Kuvalay"),
    (r"Kâvjapr", "Kâvyapr"),
    (r"Kâvja", "Kâvya"),
    (r"Sâṁkhjak", "Sâṁkhyak"),
    (r"Sâṃkhjak", "Sâṃkhyak"),
    (r"Vaidjabh", "Vaidyabh"),
    (r"Vaidj\.", "Vaidy."),
    (r"Prajogar", "Prayogar"),
    (r"Med\. avj", "Med. avy"),
    (r"Hâsj", "Hâsy"),
    (r"Lâṭj", "Lâṭy"),
    (r"Prij\.", "Priy."),
    (r"Sûrjad", "Sûryad"),
    (r"Sûrjas", "Sûryas"),
    (r"Vâju-P", "Vâyu-P"),
    (r"Ârjabh", "Âryabh"),
    (r"Matsja", "Matsya"),
    (r"Matsjop", "Matsyop"),
    (r"Tithjâdit", "Tithyâdit"),
    (r"Vjutp", "Vyutp"),
    (r"KRIJĀSAM", "KRIYĀSAM"),
    (r"Gîr\.", "Gît."),
]


def prep(s: str) -> str:
    return fold_diacritics(s).upper()


def count_in(search_body: str, form: str) -> int:
    n = prep(form)
    if not n or len(re.sub(r"\s+", "", n)) < MIN_KEY_CHARS:
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
    """(alt, kind) — kind in ortho|spacing|ocr_key."""
    seen: set[str] = set()
    out: list[tuple[str, str]] = []

    def add(alt: str, kind: str) -> None:
        alt = alt.strip()
        if not alt or alt == key or alt in seen:
            return
        if len(re.sub(r"\s+", "", alt)) < MIN_KEY_CHARS:
            return
        # never propose bare "-" or list junk
        if alt in ("-", "—", "–"):
            return
        seen.add(alt)
        out.append((alt, kind))

    # list-bullet prefix (MW72)
    if key.startswith("- "):
        add(key[2:].strip(), "spacing")
    bare_list = re.sub(r"^[-*•]\s+", "", key).strip()
    if bare_list != key:
        add(bare_list, "spacing")

    bare = re.sub(r"\s*\([^)]*\)\s*", "", key).strip().rstrip(",")
    if bare != key:
        add(bare, "spacing")

    for conj in (r"\s+oder\s+", r"\s+or\s+"):
        if re.search(conj, key, re.I):
            for p in re.split(conj, key, flags=re.I):
                add(p.strip().lstrip("-*• ").strip(), "spacing")

    m = re.match(r"^(.+?)\s+zu\s+.+$", key, re.I)
    if m:
        add(m.group(1).strip(), "spacing")

    add(key.replace("-", " "), "spacing")
    add(key.replace(" ", "-"), "spacing")
    add(re.sub(r"\.\s+", ".", key), "spacing")
    nospace = re.sub(r"\s+", "", key)
    if "." in nospace:
        add(nospace, "spacing")

    stripped = key.lstrip("\\*'ʼ`†‡§")
    if stripped != key:
        add(stripped, "ocr_key")
    add(re.sub(r"^[\\*'ʼ`†‡§]+", "", key), "ocr_key")
    add(re.sub(r"^\\+", "", key), "ocr_key")

    def workish(s: str) -> bool:
        if re.search(r"[ÂâĀāÎîĪīÛûŪūçÇśŚṣṢṭṬḍḌṇṆñÑṁṃṛṚǵǴḱḰ]", s):
            return True
        if re.search(r"[A-ZÄÖÜÁÉÍÓÚ][a-z].*\.", s) and len(s) >= 5:
            return True
        return False

    if workish(key):
        j2y = key.replace("J", "Y").replace("j", "y")
        if j2y != key:
            add(j2y, "ortho")
        if stripped != key and workish(stripped):
            j2y2 = stripped.replace("J", "Y").replace("j", "y")
            if j2y2 != stripped:
                add(j2y2, "ortho")

    for a, b in ORTHO_SUBS:
        if re.search(a, key):
            add(re.sub(a, b, key), "ortho")
        if stripped != key and re.search(a, stripped):
            add(re.sub(a, b, stripped), "ortho")

    add(key.replace("ç", "ś").replace("Ç", "Ś"), "ortho")
    add(key.replace("ç", "s").replace("Ç", "S"), "ortho")
    add(key.replace("ḱ", "k").replace("Ḱ", "K"), "ortho")
    add(key.replace("ḱ", "c").replace("Ḱ", "C"), "ortho")
    add(key.replace("ǵ", "j").replace("Ǵ", "J"), "ortho")
    add(key.replace("ǵ", "g").replace("Ǵ", "G"), "ortho")
    add(key.replace("ṅ", "n").replace("ń", "n"), "ortho")
    add(key.replace("ñ", "n"), "ortho")

    if workish(key):
        k2 = key.replace("j", "y").replace("J", "Y")
        k2 = k2.replace("ç", "ś").replace("Ç", "Ś")
        add(k2, "ortho")
        k3 = stripped.replace("j", "y").replace("J", "Y")
        k3 = k3.replace("ç", "ś").replace("Ç", "Ś")
        k3 = re.sub(r"Gṛhj", "Gṛhy", k3)
        k3 = re.sub(r"Kâtj\.", "Kâty.", k3)
        add(k3, "ortho")

    if key.endswith(" P."):
        add(key[:-3].strip() + "P.", "spacing")
    if key.endswith(" Up."):
        add(key[:-4].strip() + "Up.", "spacing")

    add(key.replace("Âçv", "Âśv").replace("Âcv", "Âśv"), "ortho")
    add(key.replace("Çr.", "Śr.").replace("çr.", "śr."), "ortho")
    add(key.replace("Çat.", "Śat."), "ortho")
    add(key.replace("Suçr", "Suśr"), "ortho")
    add(key.replace("Kauç", "Kauś"), "ortho")

    return out


def best_body_alt(key: str, search_body: str) -> tuple[str, int, str]:
    best_alt, best_n, best_kind = "", 0, ""
    for alt, kind in candidate_alts(key):
        n = count_in(search_body, alt)
        if n > best_n:
            best_n, best_alt, best_kind = n, alt, kind
    return best_alt, best_n, best_kind


def pref_source_files(root: Path, prefix: str) -> list[Path]:
    out: list[Path] = []
    if not root.is_dir():
        return out
    for p in sorted(root.iterdir()):
        if not p.is_file() or not p.name.endswith(".md"):
            continue
        low = p.name.lower()
        if low in ("readme.md",) or "methods" in low:
            continue
        if "pref_all" in low or low.endswith(".meta.md"):
            continue
        if not low.startswith(prefix.lower()):
            if prefix in ("wil", "yat") and re.match(rf"^{prefix}\d+", low):
                out.append(p)
            continue
        out.append(p)
    return out


def replace_key_in_text(text: str, old: str, new: str) -> tuple[str, int]:
    """Replace legend keys; preserve list bullets and dual-side structure."""
    if not old or old == new:
        return text, 0
    n = 0
    # variants of how OLD may appear in OCR markdown
    old_forms = [old]
    for pref in ("\\", "*", "ʼ", "'", "`", "†", "‡"):
        if not old.startswith(pref):
            old_forms.append(pref + old)
    old_forms.append("\\*" + old)  # **\*KEY**
    old_forms.append("*" + old)
    # unique preserve order
    seen: set[str] = set()
    forms: list[str] = []
    for f in old_forms:
        if f and f not in seen and f != new:
            seen.add(f)
            forms.append(f)

    for of in forms:
        # **OLD**
        bold_old, bold_new = f"**{of}**", f"**{new}**"
        if bold_old in text:
            c = text.count(bold_old)
            text = text.replace(bold_old, bold_new)
            n += c
        # **\*OLD** rare-star inside bold
        star_old = f"**\\*{of}**"
        if star_old in text:
            c = text.count(star_old)
            text = text.replace(star_old, f"**\\*{new}**")
            n += c
        star_old2 = f"**\\*{of.lstrip('*')}**"
        if of.startswith("*") is False and star_old2 in text and star_old2 != star_old:
            pass  # handled above patterns

    for of in forms:
        # list: "- OLD = " or "- OLD." at line start
        pat_list = re.compile(
            rf"(?m)^([ \t]*[-*•]\s+)({re.escape(of)})(\s*=\s+|\s+)"
        )
        text, c = pat_list.subn(rf"\1{new}\3", text)
        n += c
        # bare line start KEY =
        pat_eq = re.compile(rf"(?m)^([ \t]*)({re.escape(of)})(\s*=\s+)")
        text, c = pat_eq.subn(rf"\1{new}\3", text)
        n += c
        # table cell
        pat_cell = re.compile(rf"(?m)^(\|[ \t]*)({re.escape(of)})([ \t]*\|)")
        text, c = pat_cell.subn(rf"\1{new}\3", text)
        n += c
        # indented key
        pat_ind = re.compile(rf"(?m)^([ \t]{{2,}})({re.escape(of)})(\s+)")
        text, c = pat_ind.subn(rf"\1{new}\3", text)
        n += c

    return text, n


def load_pref_only_keys(code: str) -> list[dict]:
    """Prefer census TSV; fall back to decompose TSV."""
    census = HERE / "out" / f"{code.lower()}_pref_abbr_crosscheck.tsv"
    if census.is_file():
        rows = []
        with census.open(encoding="utf-8") as f:
            for r in csv.DictReader(f, delimiter="\t"):
                if r.get("flag") == "pref_only":
                    rows.append(r)
        return rows
    decomp = HERE / "out" / f"{code.lower()}_pref_only_decompose.tsv"
    if decomp.is_file():
        with decomp.open(encoding="utf-8") as f:
            return list(csv.DictReader(f, delimiter="\t"))
    return []


def _norm_form(s: str) -> str:
    """Fold for equality: strip list bullets, OCR junk, parentheticals."""
    s = (s or "").strip()
    s = re.sub(r"^[-*•]\s+", "", s)
    s = s.lstrip("\\*'ʼ`†‡§")
    s = re.sub(r"\s*\([^)]*\)\s*", "", s).strip().rstrip(",")
    return prep(s)


def meaningful_change(old: str, new: str) -> bool:
    """True only if naming orthography changes (not bullet/paren/whitespace-only)."""
    if not old or not new or old == new:
        return False
    a = re.sub(r"\s+", "", _norm_form(old))
    b = re.sub(r"\s+", "", _norm_form(new))
    return a != b


def expand_rewrite_jobs(key: str, search_body: str) -> list[dict]:
    """One or more old→new jobs for a pref_only key."""
    jobs: list[dict] = []
    key = (key or "").strip()
    if not key:
        return jobs

    # Dual legend "A oder B" / "A or B" / "A und B" (sides only; never collapse).
    sides = [
        s.strip()
        for s in re.split(r"\s+oder\s+|\s+or\s+|\s+und\s+", key, flags=re.I)
        if s.strip()
    ]
    if len(sides) > 1:
        targets = sides
    else:
        targets = [key]

    for tgt in targets:
        # List keys: work on bare form only (preserve bullet at replace time)
        work = re.sub(r"^[-*•]\s+", "", tgt).strip()
        work = work.lstrip("\\*'ʼ`†‡§") if work[:1] in "\\*'ʼ`†‡§" else work

        alt, n, kind = best_body_alt(work, search_body)
        # also try original tgt if different
        if (not alt or n < MIN_ALT_BODY) and work != tgt:
            alt, n, kind = best_body_alt(tgt, search_body)
            work = tgt

        if not alt or n < MIN_ALT_BODY or alt == work:
            continue
        if not meaningful_change(work, alt):
            continue
        # reject ultra-generic shorts with huge body counts (ed., Up., etc.)
        bare_len = len(re.sub(r"\s+", "", alt))
        if bare_len < 4 and n > 500:
            continue
        if bare_len < 3:
            continue

        jobs.append(
            {
                "old": work,
                "new": alt,
                "class": kind or "ortho",
                "alt_body_count": n,
                "notes": f"source_key={key!r}",
                "source_key": key,
            }
        )
        # OCR surface variants of the same old
        for junk in ("\\", "*", "ʼ", "†", "‡", "\\*"):
            surface = junk + work if not work.startswith(junk) else work
            if surface != work and meaningful_change(surface, alt):
                jobs.append(
                    {
                        "old": surface,
                        "new": alt,
                        "class": "ocr_key",
                        "alt_body_count": n,
                        "notes": f"surface_of={work!r}",
                        "source_key": key,
                    }
                )

    seen: set[str] = set()
    uniq: list[dict] = []
    for j in sorted(jobs, key=lambda x: -len(x["old"])):
        if j["old"] in seen or j["old"] == j["new"]:
            continue
        if not meaningful_change(j["old"], j["new"]):
            continue
        seen.add(j["old"])
        uniq.append(j)
    return uniq


def apply_dict(code: str, dry_run: bool) -> dict:
    code = code.upper()
    if code not in DICT_CATALOG:
        raise SystemExit(f"unknown dict {code}")
    meta = DICT_CATALOG[code]
    root = resolve_pref_root(code)
    if not root or not root.is_dir():
        print(f"=== {code} === SKIP no pref root", flush=True)
        return {"dict": code, "status": "skip_no_root", "changes": 0, "replacements": 0}

    pref_only = load_pref_only_keys(code)
    if not pref_only:
        print(f"=== {code} === SKIP no pref_only rows", flush=True)
        return {"dict": code, "status": "skip_empty", "changes": 0, "replacements": 0}

    body_path = resolve_body(code)
    if not body_path:
        print(f"=== {code} === SKIP no body", flush=True)
        return {"dict": code, "status": "skip_no_body", "changes": 0, "replacements": 0}

    print(f"=== {code} === loading body …", flush=True)
    search_body = prep(body_path.read_text(encoding="utf-8", errors="replace"))
    files = pref_source_files(root, meta["prefix"])
    print(f"  pref_only={len(pref_only)}  files={len(files)}  dry_run={dry_run}", flush=True)

    # Build jobs
    jobs: list[dict] = []
    for r in pref_only:
        key = (r.get("key_norm") or r.get("old") or "").strip()
        jobs.extend(expand_rewrite_jobs(key, search_body))
    # longest first
    jobs.sort(key=lambda x: -len(x["old"]))
    print(f"  rewrite_jobs={len(jobs)}", flush=True)

    changes: list[dict] = []
    for job in jobs:
        old, new = job["old"], job["new"]
        total = 0
        touched: list[str] = []
        for path in files:
            raw = path.read_text(encoding="utf-8", errors="replace")
            if old not in raw and f"**{old}**" not in raw and f"**\\*{old}**" not in raw:
                # still try list form
                if f"- {old}" not in raw and f"* {old}" not in raw:
                    continue
            updated, n = replace_key_in_text(raw, old, new)
            if n <= 0:
                continue
            total += n
            touched.append(f"{path.name}:{n}")
            if not dry_run:
                path.write_text(updated, encoding="utf-8", newline="\n")
        if total > 0:
            changes.append({**job, "replacements": total, "files": "; ".join(touched)})
            print(
                f"  {'WOULD ' if dry_run else ''}{old!r} → {new!r}  ×{total}  ({job['class']} n={job['alt_body_count']})",
                flush=True,
            )

    out_dir = HERE / "out"
    out_dir.mkdir(parents=True, exist_ok=True)
    write_change_log(
        out_dir / f"{code.lower()}_pref_key_body_align_changes.md",
        out_dir / f"{code.lower()}_pref_key_body_align_changes.tsv",
        code,
        changes,
        dry_run,
        root,
    )
    print(
        f"  wrote change log  rows={len(changes)} repl={sum(c['replacements'] for c in changes)}",
        flush=True,
    )
    return {
        "dict": code,
        "status": "ok",
        "changes": len(changes),
        "replacements": sum(c["replacements"] for c in changes),
        "pref_only": len(pref_only),
        "jobs": len(jobs),
    }


def write_change_log(
    path_md: Path,
    path_tsv: Path,
    code: str,
    changes: list[dict],
    dry_run: bool,
    root: Path,
) -> None:
    mode = "DRY-RUN" if dry_run else "APPLIED"
    lines = [
        f"# Pref key → body naming align — {code} ({mode})",
        "",
        f"_Created: {TODAY} · Last updated: {TODAY}_",
        "",
        f"**Handoff:** [H1580](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1580-Sonnet_csl-guides_pref-body-align-rewrite-boost_24.07.26.md) · "
        f"**Policy:** [pref-body-naming-authority.md](https://github.com/sanskrit-lexicon/csl-guides/blob/main/docs/dictionaries/pref-body-naming-authority.md) · "
        f"**Issue:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123)",
        "",
        f"**Pref root:** `{root}`",
        f"**Rows with ≥1 file hit:** {len(changes)}",
        f"**Total replacements:** {sum(c['replacements'] for c in changes)}",
        "",
        "## Changes",
        "",
        "| # | class | old key | new key (body) | body_n | × | files |",
        "|--:|-------|---------|----------------|-------:|--:|-------|",
    ]
    for i, c in enumerate(changes, 1):
        lines.append(
            f"| {i} | `{c['class']}` | `{c['old']}` | `{c['new']}` | "
            f"{c['alt_body_count']} | {c['replacements']} | {c['files']} |"
        )
    if not changes:
        lines.append("| — | — | *(none)* | | | | |")
    lines += [
        "",
        "```text",
        f"python scripts/pref_key_body_align.py --dict {code} --apply",
        "```",
        "",
        "---",
        "",
        f"_H1580 · Grok 4.5 (`grok-4.5`) · {mode}._",
        "",
        "_Dr. Mārcis Gasūns_",
        "",
    ]
    path_md.write_text("\n".join(lines), encoding="utf-8")
    cols = ["old", "new", "class", "alt_body_count", "replacements", "files", "notes", "source_key"]
    with path_tsv.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols, delimiter="\t", lineterminator="\n", extrasaction="ignore")
        w.writeheader()
        for c in changes:
            w.writerow(c)


def write_rollup(out_dir: Path, summaries: list[dict], dry_run: bool) -> None:
    path = out_dir / "ALL_pref_key_body_align.md"
    mode = "DRY-RUN" if dry_run else "APPLIED"
    lines = [
        f"# Pref key → body naming align — ALL ({mode})",
        "",
        f"_Created: {TODAY} · Last updated: {TODAY}_",
        "",
        f"**Handoff:** [H1580](https://github.com/gasyoun/Uprava/blob/main/handoffs/H1580-Sonnet_csl-guides_pref-body-align-rewrite-boost_24.07.26.md) · "
        f"**Issue:** [csl-guides#123](https://github.com/sanskrit-lexicon/csl-guides/issues/123)",
        "",
        "| Dict | status | pref_only | jobs | change rows | replacements |",
        "|------|--------|----------:|-----:|------------:|-------------:|",
    ]
    tot_c = tot_r = 0
    for s in summaries:
        lines.append(
            f"| **{s['dict']}** | {s.get('status', 'ok')} | {s.get('pref_only', 0)} | "
            f"{s.get('jobs', 0)} | {s.get('changes', 0)} | {s.get('replacements', 0)} |"
        )
        tot_c += s.get("changes", 0)
        tot_r += s.get("replacements", 0)
    lines += [
        "",
        f"**Total change rows:** {tot_c} · **Total replacements:** {tot_r}",
        "",
        "---",
        "",
        f"_H1580 · Grok 4.5 (`grok-4.5`) · {mode}._",
        "",
        "_Dr. Mārcis Gasūns_",
        "",
    ]
    path.write_text("\n".join(lines), encoding="utf-8")
    print(f"wrote {path}", flush=True)


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Align pref legend keys to body naming (boosted)")
    ap.add_argument("--dict", dest="dict_code")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args(argv)

    codes: list[str] = []
    if args.all:
        out = HERE / "out"
        for p in sorted(out.glob("*_pref_abbr_crosscheck.tsv")):
            stem = p.name.replace("_pref_abbr_crosscheck.tsv", "")
            if stem.lower() == "all":
                continue
            # any pref_only?
            n = 0
            with p.open(encoding="utf-8") as f:
                for r in csv.DictReader(f, delimiter="\t"):
                    if r.get("flag") == "pref_only":
                        n += 1
                        break
            if n:
                codes.append(stem.upper())
    elif args.dict_code:
        codes = [args.dict_code.upper()]
    else:
        ap.error("provide --dict CODE or --all")

    dry = not args.apply or args.dry_run
    summaries = [apply_dict(c, dry_run=dry) for c in codes]
    if len(summaries) > 1:
        write_rollup(HERE / "out", summaries, dry)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

