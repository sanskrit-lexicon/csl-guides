// H7931 — four candidate OG-card layouts for a dictionary page, rendered from
// the committed feeds through the same satori -> @resvg/resvg-js pipeline the
// production plugin uses (plugins/og-cards/renderCard.js stays untouched).
//
// Run:  node scripts/og-card-v4/render-layouts.mjs [--code MW] [--out DIR]
// Deps: satori + @resvg/resvg-js (already in package.json dependencies; a normal
//       `npm ci` in the repo is enough).
//
// Every value printed on a card comes from ./card-data.mjs, which reads
// src/data/dictionaries.json and src/data/atlas-extract.json. There are no
// data literals in this file: the only numbers here are typography and canvas
// geometry. A missing source field is omitted, never invented.
//
// Output: four 1200x630 PNGs plus card-data.json (the resolved values and the
// SHA-256 of every PNG) under docs/internal/evidence/H7931/ by default.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { REPO_ROOT, loadCardData, dataRows, fmt } from './card-data.mjs';

const WIDTH = 1200;
const HEIGHT = 630;
const PAD = 72;
const BRAND = 'Cologne Digital Sanskrit Dictionaries';
const SECTION = 'DICTIONARIES';

const COLORS = {
  ivory: '#FBF7EC',
  ink: '#2A2418',
  saffron: '#D9A441',
  bronze: '#8A7A57',
  muted: '#5C5343',
  sand: '#C9BFA6',
  white: '#FFFDF6',
  brown: '#6B4A22',
};

const el = (type, style, children) => ({ type, props: { style, children } });

function loadFonts() {
  const dir = path.join(REPO_ROOT, 'static', 'fonts');
  return [
    { name: 'Charis SIL', data: fs.readFileSync(path.join(dir, 'Charis-Regular.ttf')), weight: 400, style: 'normal' },
    { name: 'Charis SIL', data: fs.readFileSync(path.join(dir, 'Charis-Bold.ttf')), weight: 700, style: 'normal' },
  ];
}

function loadLogo() {
  const png = fs.readFileSync(path.join(REPO_ROOT, 'static', 'img', 'logo-mark.png'));
  return 'data:image/png;base64,' + png.toString('base64');
}

function clampText(text, max) {
  const s = String(text || '').trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const floor = max * 0.55;
  const sentence = cut.lastIndexOf('. ');
  if (sentence > floor) return cut.slice(0, sentence + 1);
  const clause = Math.max(cut.lastIndexOf(', '), cut.lastIndexOf('; '), cut.lastIndexOf(' — '));
  if (clause > floor) return cut.slice(0, clause) + '…';
  const at = cut.lastIndexOf(' ');
  return (at > floor ? cut.slice(0, at) : cut).replace(/[,;:.\s]+$/, '') + '…';
}

const kicker = (text, color = COLORS.bronze, size = 22) =>
  el('div', { fontSize: size, letterSpacing: '0.22em', textTransform: 'uppercase', color }, text);

const rule = (width = 168, color = COLORS.saffron) =>
  el('div', { width: `${width}px`, height: '3px', backgroundColor: color }, '');

function header(section = SECTION) {
  const contentWidth = WIDTH - 2 * PAD;
  return el('div', { display: 'flex', flexDirection: 'column', padding: `${56}px ${PAD}px 0 ${PAD}px`, width: `${WIDTH}px` }, [
    el('div', { display: 'flex', width: `${contentWidth}px` }, [
      kicker(BRAND),
      el('div', { fontSize: 22, letterSpacing: '0.22em', textTransform: 'uppercase', color: COLORS.saffron, marginLeft: 'auto' }, section),
    ]),
    el('div', { marginTop: '24px', marginBottom: '26px' }, [rule()]),
  ]);
}

function footer(children = []) {
  const row = children.length
    ? el('div', { display: 'flex', width: `${WIDTH}px`, padding: `0 ${PAD}px` }, children)
    : el('div', { height: '0px' }, '');
  return el('div', { display: 'flex', flexDirection: 'column', marginTop: 'auto' }, [
    row,
    el('div', { height: '22px' }, ''),
  ]);
}

function strip() {
  return el('div', { display: 'flex', width: `${WIDTH}px`, height: '10px' }, [
    el('div', { width: '620px', height: '10px', backgroundColor: COLORS.saffron }, ''),
    el('div', { width: '220px', height: '10px', backgroundColor: COLORS.bronze }, ''),
    el('div', { width: '360px', height: '10px', backgroundColor: COLORS.sand }, ''),
  ]);
}

function frame(section, body, foot) {
  return el(
    'div',
    {
      width: `${WIDTH}px`,
      height: `${HEIGHT}px`,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: COLORS.ivory,
      fontFamily: 'Charis SIL',
      position: 'relative',
    },
    [header(section), body, foot, strip()]
  );
}

function titleBlock(title, size, description, max = 150) {
  return el('div', { display: 'flex', flexDirection: 'column', width: `${WIDTH - 2 * PAD - 142}px` }, [
    el('div', { fontSize: size, lineHeight: 1.24, color: COLORS.ink }, title),
    description
      ? el('div', { fontSize: 26, lineHeight: 1.45, color: COLORS.muted, marginTop: 18 }, clampText(description, max))
      : el('div', { height: '0px' }, ''),
  ]);
}

function mark(size = 96) {
  return el('div', { display: 'flex', width: `${size + 4}px`, marginLeft: '36px', marginTop: '4px' }, [
    { type: 'img', props: { src: loadLogo(), width: size, height: size, style: { width: `${size}px`, height: `${size}px` } } },
  ]);
}

// ---------------------------------------------------------------- layout A
// Library label: the v3 composition plus one bibliographic line under the
// title — year · pages · entries, the three fields MG asked for.
function layoutA(d) {
  const row = dataRows(d).A;
  const body = el('div', { display: 'flex', flexDirection: 'column', padding: `0 ${PAD}px`, width: `${WIDTH}px`, marginTop: '6px' }, [
    el('div', { display: 'flex', width: '100%' }, [
      titleBlock(d.dictionary.title, 56, d.description || '', 118),
      mark(96),
    ]),
    el('div', { display: 'flex', alignItems: 'center', marginTop: '30px', width: '100%' }, [
      el('div', { width: '34px', height: '2px', backgroundColor: COLORS.saffron, marginRight: '18px' }, ''),
      el('div', { fontSize: 30, color: COLORS.brown, letterSpacing: '0.02em' }, row),
    ]),
  ]);
  return frame(SECTION, body, footer([]));
}

// ---------------------------------------------------------------- layout B
// Scale: the entry count is the hero, with a comparison bar against the whole
// atlas (the denominator is printed, not implied).
function layoutB(d) {
  const rows = dataRows(d).B;
  const trackWidth = WIDTH - 2 * PAD;
  const fill = Math.max(0, Math.min(100, rows.sharePct || 0));
  const body = el('div', { display: 'flex', flexDirection: 'column', padding: `0 ${PAD}px`, width: `${WIDTH}px` }, [
    el('div', { display: 'flex', width: '100%' }, [
      el('div', { display: 'flex', flexDirection: 'column', width: `${WIDTH - 2 * PAD - 142}px` }, [
        el('div', { fontSize: 38, lineHeight: 1.25, color: COLORS.ink }, d.dictionary.title),
        el('div', { display: 'flex', alignItems: 'flex-end', marginTop: '34px' }, [
          el('div', { fontSize: 132, fontWeight: 700, lineHeight: 1, color: COLORS.ink }, rows.hero || ''),
          el('div', { fontSize: 30, letterSpacing: '0.18em', textTransform: 'uppercase', color: COLORS.bronze, marginLeft: '22px', marginBottom: '16px' }, 'entries'),
        ]),
        el('div', { fontSize: 24, color: COLORS.muted, marginTop: '10px' }, rows.denominator),
      ]),
      mark(96),
    ]),
    el('div', { display: 'flex', flexDirection: 'column', marginTop: '36px', width: '100%' }, [
      el('div', { display: 'flex', width: `${trackWidth}px`, height: '22px', backgroundColor: COLORS.sand }, [
        el('div', { width: `${(trackWidth * fill) / 100}px`, height: '22px', backgroundColor: COLORS.saffron }, ''),
      ]),
      el('div', { display: 'flex', width: `${trackWidth}px`, marginTop: '12px' }, [
        el('div', { fontSize: 22, color: COLORS.brown }, `${rows.sharePct}% of the atlas`),
        el('div', { fontSize: 22, color: COLORS.bronze, marginLeft: 'auto' }, `${d.site.atlasDictionaries} dictionaries · ${fmt(d.site.atlasEntriesTotal)} entries`),
      ]),
    ]),
  ]);
  return frame(SECTION, body, footer([]));
}

// ---------------------------------------------------------------- layout C
// Timeline: the year sits on the catalog's real 1832–1993 span, so the reader
// sees the edition in the library's history rather than as a bare number.
function layoutC(d) {
  const rows = dataRows(d).C;
  const trackWidth = WIDTH - 2 * PAD - 140;
  const share = d.site.yearMax === d.site.yearMin ? 0 : (d.dictionary.year - d.site.yearMin) / (d.site.yearMax - d.site.yearMin);
  const left = Math.round(trackWidth * share);
  const body = el('div', { display: 'flex', flexDirection: 'column', padding: `0 ${PAD}px`, width: `${WIDTH}px` }, [
    el('div', { display: 'flex', width: '100%' }, [
      titleBlock(d.dictionary.title, 46, '', 0),
      mark(88),
    ]),
    el('div', { display: 'flex', flexDirection: 'column', marginTop: '40px', width: `${trackWidth}px`, position: 'relative' }, [
      el('div', { position: 'absolute', top: '0px', left: `${left - 40}px`, width: '80px', textAlign: 'center', fontSize: 34, fontWeight: 700, color: COLORS.ink }, String(d.dictionary.year)),
      el('div', { position: 'absolute', top: '52px', left: '0px', width: `${trackWidth}px`, height: '3px', backgroundColor: COLORS.sand }, ''),
      el('div', { position: 'absolute', top: '44px', left: `${left - 9}px`, width: '20px', height: '20px', borderRadius: '10px', backgroundColor: COLORS.saffron }, ''),
      el('div', { height: '50px' }, ''),
    ]),
    el('div', { display: 'flex', width: `${trackWidth}px`, marginTop: '16px', justifyContent: 'space-between' }, [
      el('div', { fontSize: 22, color: COLORS.bronze }, String(d.site.yearMin)),
      el('div', { fontSize: 22, color: COLORS.bronze }, String(d.site.yearMax)),
    ]),
    el('div', { display: 'flex', alignItems: 'center', marginTop: '34px' }, [
      el('div', { width: '34px', height: '2px', backgroundColor: COLORS.saffron, marginRight: '18px' }, ''),
      el('div', { fontSize: 28, color: COLORS.brown }, rows.secondary),
    ]),
  ]);
  return frame(SECTION, body, footer([]));
}

// ---------------------------------------------------------------- layout D
// Atlas: the dictionary's language group plus the catalogue-wide digitisation
// badges — the product promise rather than another count of words.
function layoutD(d) {
  const rows = dataRows(d).D;
  const badge = (text) =>
    el('div', {
      display: 'flex',
      alignItems: 'center',
      border: `2px solid ${COLORS.saffron}`,
      borderRadius: '999px',
      padding: '12px 24px',
      marginRight: '14px',
      fontSize: 22,
      color: COLORS.brown,
      backgroundColor: COLORS.white,
    }, text);
  const body = el('div', { display: 'flex', flexDirection: 'column', padding: `0 ${PAD}px`, width: `${WIDTH}px` }, [
    el('div', { display: 'flex', width: '100%' }, [
      el('div', { display: 'flex', flexDirection: 'column', width: `${WIDTH - 2 * PAD - 142}px` }, [
        el('div', { fontSize: 24, letterSpacing: '0.18em', textTransform: 'uppercase', color: COLORS.saffron }, rows.group ? `${rows.group} · ${d.site.groups} groups` : ''),
        el('div', { fontSize: 48, lineHeight: 1.24, color: COLORS.ink, marginTop: '14px' }, d.dictionary.title),
      ]),
      mark(88),
    ]),
    el('div', { display: 'flex', flexWrap: 'wrap', marginTop: '40px', width: '100%' }, rows.badges.map(badge)),
    el('div', { display: 'flex', alignItems: 'center', marginTop: '38px' }, [
      el('div', { width: '34px', height: '2px', backgroundColor: COLORS.saffron, marginRight: '18px' }, ''),
      el('div', { fontSize: 28, color: COLORS.brown }, [String(d.dictionary.year), fmt(d.dictionary.pages) && ` · ${fmt(d.dictionary.pages)} pages`, fmt(d.dictionary.entries) && ` · ${fmt(d.dictionary.entries)} entries`].filter(Boolean).join('')),
    ]),
  ]);
  return frame(SECTION, body, footer([]));
}

// One page description read from the real MW guide page frontmatter (kept in
// the evidence README, not typed into the canvas).
const DESCRIPTIONS = {
  MW: 'Guide to the Monier-Williams Sanskrit–English Dictionary (1899) on CDSL — the standard general reference: how to read and search an entry.',
};

async function main() {
  const args = process.argv.slice(2);
  const arg = (name, fallback) => {
    const i = args.indexOf(name);
    return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
  };
  const code = arg('--code', 'MW');
  const outDir = path.resolve(arg('--out', path.join(REPO_ROOT, 'docs', 'internal', 'evidence', 'H7931')));

  const data = loadCardData({ code });
  data.description = DESCRIPTIONS[String(code).toUpperCase()] || '';

  const satori = (await import('satori')).default;
  const { Resvg } = await import('@resvg/resvg-js');
  const fonts = loadFonts();

  const layouts = [
    ['library-label', 'A', layoutA],
    ['scale', 'B', layoutB],
    ['timeline', 'C', layoutC],
    ['atlas', 'D', layoutD],
  ];

  fs.mkdirSync(outDir, { recursive: true });
  const manifest = { code, generatedAt: new Date().toISOString(), data, rows: dataRows(data), renders: [] };
  for (const [slug, key, build] of layouts) {
    const tree = build(data);
    const svg = await satori(tree, { width: WIDTH, height: HEIGHT, fonts });
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng();
    const file = `layout-${key}-${slug}.png`;
    fs.writeFileSync(path.join(outDir, file), png);
    const sha256 = crypto.createHash('sha256').update(png).digest('hex');
    manifest.renders.push({ layout: key, name: slug, file, bytes: png.length, sha256, dataRow: dataRows(data)[key] });
    console.log(`${file}  ${png.length} bytes  sha256=${sha256}`);
  }
  fs.writeFileSync(path.join(outDir, 'card-data.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`card-data.json written to ${outDir}`);
}

main().catch((err) => {
  console.error('render-layouts: ' + err.message);
  process.exit(1);
});
