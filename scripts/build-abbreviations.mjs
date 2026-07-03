#!/usr/bin/env node
// Regenerates the abbreviation dataset for the "Abbreviations compared" page from the
// authoritative per-dictionary source files in the sanskrit-lexicon org.
//
// For each dictionary the CDSL ecosystem keeps its abbreviation legend in a different
// place and a different format (a repo .txt, an OCR-proofed preface .md, an HTML table,
// a colon/tab/equals-delimited list, ...). This script fetches the one canonical file
// per dictionary, parses it into a uniform {abbr, expansion} shape, classifies entries
// as literary-source ("works") vs grammatical/general where the source distinguishes
// them, and builds two cross-dictionary comparison tables keyed by a shared concept.
//
// Dictionaries whose legend exists only as a scanned image (or not at all in a machine
// -readable form) are recorded with status "none"/"tokens" and a link to their front
// matter, so the page lists all catalogued dictionaries honestly.
//
// Output: src/data/abbreviations.json  (consumed by src/components/Abbreviations)
// Usage:  node scripts/build-abbreviations.mjs   (npm run build:abbreviations)
// No auth needed (public raw.githubusercontent.com); ~20 network calls.

import {writeFile, mkdir, readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const RAW = 'https://raw.githubusercontent.com/sanskrit-lexicon';

// ---------------------------------------------------------------------------
// Per-dictionary source map. Each entry names the single canonical abbreviation
// file (verified by inspection of the org repos), its branch, and the parser to
// use. `type` fixes the category when a file is single-category; mixed files are
// left unclassified for per-dict display and matched by concept in the comparison.
// ---------------------------------------------------------------------------
const SOURCES = {
  MW:   {repo: 'MWS',      branch: 'main', file: 'mwabbreviations/mwab_input.txt',            parser: 'disp',     lang: 'en'},
  AE:   {repo: 'ApteES',   branch: 'main', file: 'issues/issue11/lexab/aeab_input.txt',       parser: 'disp',     lang: 'en', type: 'grammatical'},
  BUR:  {repo: 'BUR',      branch: 'main', file: 'burissues/issue5/burab_input_6.txt',        parser: 'disp',     lang: 'fr', type: 'grammatical'},
  AP90: {repo: 'AP90',     branch: 'main', file: 'markup/abls/abbrauth_1.txt',                parser: 'ap90colon',lang: 'en'},
  BHS:  {repo: 'BHS',      branch: 'main', file: 'issues/issue4/bhsfm_abbr.txt',              parser: 'bhstab',   lang: 'en'},
  BEN:  {repo: 'BEN',      branch: 'main', files: {grammatical: 'abbrev/ben_ab.txt', works: 'abbrev/ben_ls.txt'}, parser: 'eq', lang: 'en'},
  MW72: {repo: 'MW72',     branch: 'main', file: 'prefaces/mw72pref24.md',                    parser: 'mdbullet', lang: 'en'},
  LRV:  {repo: 'LRV',      branch: 'main',   file: 'glacier/LR_Vaidya_Front_proofed.txt',       parser: 'lrvtab',   lang: 'en'},
  MD:   {repo: 'MD',       branch: 'main', file: 'mdissues/issue11/abbrev1/abbrev1.txt',      parser: 'mdtab',    lang: 'en'},
  CAE:  {repo: 'CAE',      branch: 'main', file: 'prefaces/caepref06.md',                     parser: 'caeparen', lang: 'en', type: 'grammatical'},
  SHS:  {repo: 'SHS',      branch: 'main',   file: 'issues/issue1/shs_listed_abbrs.txt',        parser: 'tabsp',    lang: 'en', type: 'grammatical'},
  AP:   {repo: 'AP',       branch: 'main',   file: 'issues/issue2/AP57.printed.abbrs.txt',      parser: 'tabsp',    lang: 'en', type: 'grammatical'},
  STC:  {repo: 'csl-orig', branch: 'main', file: 'v02/stc/abbrev/abbreviationsStchoupak.txt', parser: 'tab',      lang: 'fr'},
  GRA:  {repo: 'GRA',      branch: 'main', file: 'graab/abbrevs/graab_input.txt',             parser: 'disp',     lang: 'de', type: 'grammatical'},
  PWG:  {repo: 'PWG',      branch: 'main', file: 'pwgissues/issue74/pwgbib_input.txt',        parser: 'pwgtab',   lang: 'de', type: 'works'},
  PW:   {repo: 'PWK',      branch: 'main', file: 'pw_ls/pwbib/pwbib_utf8.txt',                parser: 'pwbib',    lang: 'de', type: 'works'},
  INM:  {repo: 'csl-orig', branch: 'main', file: 'v02/inm/inm_abbr.txt',                      parser: 'inmhi',    lang: 'en'},
  BOP:  {repo: 'BOP',      branch: 'main',   file: {works: 'issues/issue6/cdsl/abbrevs/bopauth.txt', grammatical: 'issues/issue6/cdsl/abbrevs/bopab.txt'}, parser: 'tab', lang: 'la'},
};

// VCP carries an abbreviation INVENTORY (token + frequency) with no expansions — listed
// but not tabulated.
const TOKENS_ONLY = {VCP: 'abbrevprep/abbrev0_deva_all.txt'};

const LANG_LABEL = {en: 'English', fr: 'French', de: 'German', la: 'Latin'};

// ---------------------------------------------------------------------------
// Markup / entity cleanup shared by all parsers.
// ---------------------------------------------------------------------------
function clean(s) {
  if (!s) return '';
  return s
    .replace(/<lb[^>]*>/gi, ' ')
    .replace(/<\/?(?:i|b|s|sup|sub|em)>/gi, '')
    .replace(/<INFER\/?>|<UNMARKED>|<UNNEEDED\??>|<count>\d*<\/count>/gi, '')
    .replace(/\{[%#@](.+?)[%#@]\}/g, '$1')   // {%apud.%} {#x#} {@x@} -> inner
    .replace(/&#13;&#10;|&#10;|&#13;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[;,]\s*$/, '');
}

// Cologne "AS" (digit-modifier) transliteration -> IAST, used by the PW bibliography.
const AS_MAP = [
  ['A7', 'Ā'], ['a7', 'ā'], ['I7', 'Ī'], ['i7', 'ī'], ['U7', 'Ū'], ['u7', 'ū'],
  ['R2', 'Ṛ'], ['r2', 'ṛ'], ['R3', 'Ṝ'], ['r3', 'ṝ'], ['L2', 'Ḷ'], ['l2', 'ḷ'], ['L3', 'Ḹ'], ['l3', 'ḹ'],
  ['C2', 'Ś'], ['c2', 'ś'], ['S2', 'Ṣ'], ['s2', 'ṣ'], ['S1', 'Ś'], ['s1', 'ś'],
  ['N2', 'Ṇ'], ['n2', 'ṇ'], ['N3', 'Ṅ'], ['n3', 'ṅ'], ['N1', 'Ñ'], ['n1', 'ñ'],
  ['D2', 'Ḍ'], ['d2', 'ḍ'], ['T2', 'Ṭ'], ['t2', 'ṭ'], ['M2', 'Ṃ'], ['m2', 'ṃ'], ['H2', 'Ḥ'], ['h2', 'ḥ'],
  ['G2', 'Ġ'], ['g2', 'ġ'], ['J', 'Y'], ['j', 'y'],
];
function asToIast(s) {
  let out = s || '';
  for (const [a, b] of AS_MAP) out = out.split(a).join(b);
  return out;
}

// ---------------------------------------------------------------------------
// Parsers. Each returns {grammatical:[], works:[], mixed:[]} (only the relevant
// buckets populated). A bucket holds {abbr, expansion} objects.
// ---------------------------------------------------------------------------
function pushUnique(arr, abbr, expansion) {
  abbr = (abbr || '').trim();
  expansion = clean(expansion);
  if (!abbr || !expansion) return;
  if (abbr.length > 24) return; // guard against parse runaway
  if (/[{}#<>]/.test(abbr)) return; // drop SLP1/markup-only "abbreviations" (e.g. SHS {#..#} tail)
  arr.push({abbr, expansion});
}

const PARSERS = {
  // abbr <TAB> <id>..</id> <disp>EXPANSION</disp> [flags]   (MW, AE, BUR)
  disp(text, bucket) {
    for (const line of text.split(/\r?\n/)) {
      const tab = line.indexOf('\t');
      if (tab < 0) continue;
      const abbr = line.slice(0, tab);
      const m = line.match(/<disp>([\s\S]*?)<\/disp>/i);
      if (m) pushUnique(bucket, abbr, m[1]);
    }
  },
  // key:type(ab|ls):index:expansion   (AP90 abbrauth_1.txt)
  ap90colon(text, _b, out) {
    for (const line of text.split(/\r?\n/)) {
      if (!line.trim()) continue;
      const parts = line.split(':');
      if (parts.length < 4) continue;
      const [abbr, type] = parts;
      const exp = parts.slice(3).join(':');
      pushUnique(type === 'ls' ? out.works : out.grammatical, abbr, exp);
    }
  },
  // 0 <TAB> (ls|ab) <TAB> abbr <TAB> expansion   (BHS)
  bhstab(text, _b, out) {
    for (const line of text.split(/\r?\n/)) {
      const p = line.split('\t');
      if (p.length < 4) continue;
      pushUnique(p[1] === 'ls' ? out.works : out.grammatical, p[2], p.slice(3).join('\t'));
    }
  },
  // abbr = expansion   (BEN ben_ab.txt / ben_ls.txt, fed per-bucket)
  eq(text, bucket) {
    for (const line of text.split(/\r?\n/)) {
      const i = line.indexOf(' = ');
      if (i < 0) continue;
      pushUnique(bucket, line.slice(0, i), line.slice(i + 3));
    }
  },
  // markdown bullet "- abbr = expansion"   (MW72 preface)
  mdbullet(text, bucket) {
    let inFront = false;
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (line === '---') {inFront = !inFront; continue;}
      if (inFront || line.startsWith('#') || !line.startsWith('- ')) continue;
      const body = line.slice(2);
      const i = body.indexOf(' = ');
      if (i < 0) continue;
      pushUnique(bucket, body.slice(0, i), body.slice(i + 3));
    }
  },
  // two tab-separated sections; "Names of Works" header switches to works   (LRV)
  lrvtab(text, _b, out) {
    let target = out.grammatical;
    for (const raw of text.split(/\r?\n/)) {
      if (/names of works/i.test(raw)) {target = out.works; continue;}
      const tab = raw.indexOf('\t');
      if (tab < 0) continue;
      pushUnique(target, raw.slice(0, tab), raw.slice(tab + 1));
    }
  },
  // abbr <TAB> = expansion   (MD)
  mdtab(text, bucket) {
    for (const line of text.split(/\r?\n/)) {
      const tab = line.indexOf('\t');
      if (tab < 0) continue;
      pushUnique(bucket, line.slice(0, tab), line.slice(tab + 1).replace(/^=\s*/, ''));
    }
  },
  // markdown 3-column table with parenthetical abbreviations   (CAE preface)
  caeparen(text, bucket) {
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line.startsWith('|') || /Column \d|^\|[-\s|]+\|$/.test(line)) continue;
      for (let cell of line.split('|')) {
        cell = cell.trim();
        if (!cell) continue;
        const eq = cell.indexOf(' = ');
        if (eq >= 0) {pushUnique(bucket, cell.slice(0, eq), cell.slice(eq + 3)); continue;}
        const m = cell.match(/^([^()]*)\(([^()]+)\)(.*)$/);
        if (!m) continue;
        const prefix = m[1].trim();
        if (prefix) pushUnique(bucket, prefix + '.', (m[1] + m[2] + m[3]).trim());
        else pushUnique(bucket, m[2], m[3]); // "(r.) ritual or religion."
      }
    }
  },
  // abbr <TAB> [space] expansion, skip header/rule lines   (SHS, AP)
  tabsp(text, bucket) {
    for (const line of text.split(/\r?\n/)) {
      const tab = line.indexOf('\t');
      if (tab < 0) continue;
      pushUnique(bucket, line.slice(0, tab), line.slice(tab + 1));
    }
  },
  // abbr <TAB> expansion, skip ';' comments   (STC, BOP — fed per-bucket)
  tab(text, bucket) {
    for (const line of text.split(/\r?\n/)) {
      if (line.startsWith(';')) continue;
      const tab = line.indexOf('\t');
      if (tab < 0) continue;
      pushUnique(bucket, line.slice(0, tab), line.slice(tab + 1));
    }
  },
  // seq <TAB> ABBR <TAB> Abbr <TAB> "ABBR = title"   (PWG bibliography input)
  pwgtab(text, bucket) {
    for (const line of text.split(/\r?\n/)) {
      const p = line.split('\t');
      if (p.length < 4) continue;
      const abbr = p[1];
      const eq = p[3].indexOf(' = ');
      pushUnique(bucket, abbr, eq >= 0 ? p[3].slice(eq + 3) : p[3]);
    }
  },
  // [+.|<...>|[...]] AS-abbr == AS-title (vol. N)   (PW bibliography, AS-encoded)
  pwbib(text, bucket) {
    for (const line of text.split(/\r?\n/)) {
      if (line.startsWith('%') || line.startsWith(';')) continue;
      const i = line.indexOf(' == ');
      if (i < 0) continue;
      let abbr = line.slice(0, i)
        .replace(/^[+*]+/, '')
        .replace(/^[<[][^>\]]*[>\]]/, '')
        .replace(/^[.\s]+/, '')
        .trim();
      const exp = line.slice(i + 4);
      pushUnique(bucket, asToIast(abbr), asToIast(exp));
    }
  },
  // <HI>{@abbr@} = expansion.   (INM names index)
  inmhi(text, bucket) {
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/\{@(.+?)@\}\s*=\s*(.+)$/);
      if (m) pushUnique(bucket, m[1], m[2]);
    }
  },
};

async function rawText(repo, branch, file) {
  const url = `${RAW}/${repo}/${branch}/${file}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} for ${url}`);
  return {text: await r.text(), url: `https://github.com/sanskrit-lexicon/${repo}/blob/${branch}/${file}`};
}

async function parseSource(code, src) {
  const out = {grammatical: [], works: [], mixed: []};
  let sourceUrl = null;
  const run = (parser, text, bucket) =>
    PARSERS[parser](text, bucket, out);

  if (src.files || (src.file && typeof src.file === 'object')) {
    // per-bucket files (BEN, BOP)
    const files = src.files || src.file;
    const urls = [];
    for (const [cat, f] of Object.entries(files)) {
      const {text, url} = await rawText(src.repo, src.branch, f);
      run(src.parser, text, out[cat]);
      urls.push(url);
    }
    sourceUrl = urls;
  } else {
    const {text, url} = await rawText(src.repo, src.branch, src.file);
    sourceUrl = url;
    if (src.type === 'works') run(src.parser, text, out.works);
    else if (src.type === 'grammatical') run(src.parser, text, out.grammatical);
    else if (src.parser === 'ap90colon' || src.parser === 'bhstab' || src.parser === 'lrvtab') run(src.parser, text, null);
    else run(src.parser, text, out.mixed); // genuinely mixed, undistinguished (MW, MW72, STC, INM)
  }
  return {out, sourceUrl};
}

// ---------------------------------------------------------------------------
// Cross-dictionary comparison concepts. Each row matches when a synonym (after
// folding to ascii-lowercase, diacritics stripped) appears in a dict's expansion.
// ---------------------------------------------------------------------------
// Fold an expansion to ascii-lowercase, returning both its word tokens and a
// space-free form. Grammatical concepts match on whole tokens (so "verb" does NOT
// match inside "adverb"); works match multi-word titles against the space-free form.
function foldExpansion(s) {
  const f = (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  return {tokens: f.split(/[^a-z]+/).filter(Boolean), whole: f.replace(/[^a-z]/g, '')};
}
const matchGrammatical = (syn, {tokens}) =>
  tokens.some((t) => t === syn || (syn.length >= 5 && t.startsWith(syn)) || (t.length >= 5 && syn.startsWith(t)));
const matchWorks = (syn, {tokens, whole}) =>
  tokens.includes(syn) || (syn.length >= 7 && whole.includes(syn));

const GRAMMATICAL_CONCEPTS = [
  ['masculine',     ['masculine', 'masculin', 'masculinum', 'mannlich']],
  ['feminine',      ['feminine', 'feminin', 'femininum', 'weiblich']],
  ['neuter',        ['neuter', 'neutre', 'neutrum', 'sachlich']],
  ['adjective',     ['adjective', 'adjectif', 'adjektiv', 'adjectivum']],
  ['adverb',        ['adverb', 'adverbe', 'adverbium']],
  ['substantive (noun)', ['substantive', 'substantif', 'substantiv', 'noun']],
  ['verb',          ['verb', 'verbe', 'verbum']],
  ['pronoun',       ['pronoun', 'pronom', 'pronomen']],
  ['participle',    ['participle', 'participe', 'partizip']],
  ['indeclinable',  ['indeclinable', 'indeclinabile', 'indeclinabel']],
  ['nominative',    ['nominative', 'nominatif', 'nominativ']],
  ['accusative',    ['accusative', 'accusatif', 'accusativ']],
  ['instrumental',  ['instrumental', 'instrumentalis']],
  ['dative',        ['dative', 'datif', 'dativ']],
  ['ablative',      ['ablative', 'ablatif', 'ablativ']],
  ['genitive',      ['genitive', 'genitif', 'genitiv']],
  ['locative',      ['locative', 'locatif', 'lokativ', 'locativ']],
  ['vocative',      ['vocative', 'vocatif', 'vokativ']],
  ['singular',      ['singular', 'singulier', 'singularis']],
  ['plural',        ['plural', 'pluriel', 'pluralis']],
  ['Ātmanepada',    ['atmanepada', 'atmanepadum']],
  ['Parasmaipada',  ['parasmaipada', 'parasmaepada', 'parasmaipadum']],
  ['causal / causative', ['causal', 'causative', 'causatif', 'kausativ']],
  ['desiderative',  ['desiderative', 'desideratif', 'desiderativ']],
  ['aorist',        ['aorist', 'aoriste']],
  ['compound',      ['compound', 'compose', 'kompositum']],
  ['Bahuvrīhi',     ['bahuvrihi']],
  ['comparative',   ['comparative', 'comparatif', 'komparativ']],
  ['preposition',   ['preposition']],
  ['conjunction',   ['conjunction', 'conjonction', 'konjunktion']],
  ['interjection',  ['interjection']],
];

const WORKS_CONCEPTS = [
  ['Ṛgveda',          ['rgveda', 'rigveda', 'rikveda']],
  ['Atharvaveda',     ['atharvaveda']],
  ['Yajurveda',       ['yajurveda']],
  ['Sāmaveda',        ['samaveda']],
  ['Aitareyabrāhmaṇa',['aitareyabrahmana']],
  ['Mahābhārata',     ['mahabharata', 'mahabharatum']],
  ['Rāmāyaṇa',        ['ramayana']],
  ['Bhagavadgītā',    ['bhagavadgita']],
  ['Bhāgavatapurāṇa', ['bhagavatapurana', 'bhagavata']],
  ['Harivaṃśa',       ['harivamsa']],
  ['Manu',            ['manusmrti', 'manavadharma', 'manu']],
  ['Amarakośa',       ['amarakosa', 'amarakosha']],
  ['Pāṇini',          ['panini']],
  ['Raghuvaṃśa',      ['raghuvamsa']],
  ['Kumārasambhava',  ['kumarasambhava']],
  ['Meghadūta',       ['meghaduta']],
  ['Śākuntala',       ['sakuntala', 'sakoontala']],
  ['Hitopadeśa',      ['hitopadesa']],
  ['Pañcatantra',     ['pancatantra']],
  ['Kathāsaritsāgara',['kathasaritsagara']],
  ['Bhaṭṭikāvya',     ['bhattikavya', 'bhatti']],
  ['Suśruta',         ['susruta']],
  ['Bṛhatsaṃhitā',    ['brhatsamhita', 'brihatsamhita']],
];

function buildComparison(dicts, concepts, getEntries, match) {
  // Pre-fold every dict's candidate entries once.
  const folded = dicts.map((d) => ({
    code: d.code,
    entries: getEntries(d).map((e) => ({abbr: e.abbr, f: foldExpansion(e.expansion)})),
  }));
  const rows = [];
  for (const [concept, syns] of concepts) {
    const cells = {};
    for (const d of folded) {
      const hits = [];
      for (const e of d.entries) if (syns.some((s) => match(s, e.f))) hits.push(e.abbr);
      if (hits.length) cells[d.code] = [...new Set(hits)].join(', ');
    }
    if (Object.keys(cells).length >= 2) rows.push({concept, cells});
  }
  rows.sort((a, b) => Object.keys(b.cells).length - Object.keys(a.cells).length);
  return rows;
}

async function main() {
  const catalog = JSON.parse(await readFile(join(ROOT, 'src/data/dictionaries.json'), 'utf8'));
  const meta = {};
  for (const g of catalog.groups || []) for (const d of g.items || g.dictionaries || []) meta[d.code] = d;

  const dicts = [];
  for (const [code, d] of Object.entries(meta)) {
    const base = {
      code,
      title: (d.title || code).replace(/\s+Dictionary.*$/, '').trim() || code,
      fullTitle: d.title || code,
      year: d.year || '',
      repoUrl: d.repoUrl || '',
      frontMatterUrl: d.cslDocUrl || d.repoUrl || '',
    };
    if (SOURCES[code]) {
      const src = SOURCES[code];
      try {
        const {out, sourceUrl} = await parseSource(code, src);
        const total = out.grammatical.length + out.works.length + out.mixed.length;
        if (!total) throw new Error('parsed 0 entries');
        dicts.push({
          ...base, status: 'data', lang: src.lang, langLabel: LANG_LABEL[src.lang],
          kind: code === 'INM' ? 'names' : 'standard',
          sourceUrl,
          works: out.works, grammatical: out.grammatical, mixed: out.mixed,
          counts: {works: out.works.length, grammatical: out.grammatical.length, mixed: out.mixed.length, total},
        });
        console.log(`  ${code}: works=${out.works.length} gramm=${out.grammatical.length} mixed=${out.mixed.length}`);
      } catch (e) {
        console.error(`  ${code}: FAILED (${e.message}) — recording as none`);
        dicts.push({...base, status: 'none', note: `source parse failed: ${e.message}`});
      }
    } else if (TOKENS_ONLY[code]) {
      dicts.push({...base, status: 'tokens', sourceUrl: `https://github.com/sanskrit-lexicon/${code}/blob/main/${TOKENS_ONLY[code]}`,
        note: 'Abbreviation tokens are inventoried with frequencies, but the print front matter (which gives their expansions) is not yet transcribed.'});
      console.log(`  ${code}: tokens-only`);
    } else {
      dicts.push({...base, status: 'none',
        note: 'No machine-readable abbreviation list yet; the legend lives in the scanned front matter.'});
    }
  }

  const dataDicts = dicts.filter((d) => d.status === 'data');
  const grammComparison = buildComparison(
    dataDicts, GRAMMATICAL_CONCEPTS,
    (d) => [...d.grammatical, ...d.mixed], matchGrammatical);
  const worksComparison = buildComparison(
    dataDicts, WORKS_CONCEPTS,
    (d) => [...d.works, ...d.mixed], matchWorks);

  const payload = {
    source: 'per-dictionary abbreviation files in the sanskrit-lexicon org (see each dict sourceUrl)',
    counts: {
      total: dicts.length,
      withData: dataDicts.length,
      tokensOnly: dicts.filter((d) => d.status === 'tokens').length,
      none: dicts.filter((d) => d.status === 'none').length,
    },
    comparison: {grammatical: grammComparison, works: worksComparison},
    dicts,
  };

  await mkdir(join(ROOT, 'src/data'), {recursive: true});
  await writeFile(join(ROOT, 'src/data/abbreviations.json'), JSON.stringify(payload, null, 2) + '\n');
  console.log(`\nWrote src/data/abbreviations.json — ${dataDicts.length} dicts with data, ` +
    `${grammComparison.length} grammatical + ${worksComparison.length} works comparison rows.`);
}

main().catch((e) => {console.error(e); process.exit(1);});
