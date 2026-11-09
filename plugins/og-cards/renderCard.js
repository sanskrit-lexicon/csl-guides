// H7886 — per-page OG card renderer, light-minimal-academic (MG-grilled):
// ivory ground, Charis SIL serif title, thin saffron rule, small-caps brand
// line. Hybrid layout: the page's own text stack plus the two ingredients
// GitHub's card carries that actually say something — the site mark and a count
// row — and a full-bleed accent strip. 1200x630 PNG. Fonts vendored in
// static/fonts/ under SIL OFL 1.1 (static/fonts/Charis-OFL.txt).

const fs = require('fs');
const path = require('path');

const WIDTH = 1200;
const HEIGHT = 630;
const PAD = 72;
const BRAND = 'Cologne Digital Sanskrit Dictionaries';

const COLORS = {
  ivory: '#FBF7EC',
  ink: '#2A2418',
  saffron: '#D9A441',
  bronze: '#8A7A57',
  muted: '#5C5343',
  sand: '#C9BFA6',
};

let fontCache = null;
let logoCache = null;

function loadFonts() {
  if (fontCache) return fontCache;
  const dir = path.join(__dirname, '..', '..', 'static', 'fonts');
  fontCache = [
    { name: 'Charis SIL', data: fs.readFileSync(path.join(dir, 'Charis-Regular.ttf')), weight: 400, style: 'normal' },
    { name: 'Charis SIL', data: fs.readFileSync(path.join(dir, 'Charis-Bold.ttf')), weight: 700, style: 'normal' },
  ];
  return fontCache;
}

// The site's own logo, rasterized once at 2x and inlined as a data URI. satori
// renders images, not SVG documents, so the SVG is pre-rendered with resvg.
function loadLogo() {
  if (logoCache) return logoCache;
  const svg = fs.readFileSync(path.join(__dirname, '..', '..', 'static', 'img', 'logo.svg'), 'utf8');
  const { Resvg } = require('@resvg/resvg-js');
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 200 } }).render().asPng();
  logoCache = 'data:image/png;base64,' + Buffer.from(png).toString('base64');
  return logoCache;
}

function titleFontSize(len) {
  if (len <= 60) return 60;
  if (len <= 110) return 48;
  return 38;
}

// Truncate for two lines at 26px in a 916px column (measured: ~118 chars keeps
// it to two). Prefer a sentence boundary, then a clause break, then a word
// boundary - a card that ends "...at…" reads like a broken template, one that
// ends "dictionaries." reads like prose.
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

const el = (type, style, children) => ({ type, props: { style, children } });

function statColumn(number, label) {
  return el('div', { display: 'flex', flexDirection: 'column', marginRight: 52 }, [
    el('div', { fontSize: 28, fontWeight: 700, color: COLORS.ink, lineHeight: 1.1 }, String(number)),
    el('div', { fontSize: 16, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.bronze, marginTop: 5 }, label),
  ]);
}

// satori element tree as plain objects (module stays CommonJS, no build step).
function cardTree(titleText, description, section, stats) {
  const contentWidth = WIDTH - 2 * PAD;

  const header = el('div', { display: 'flex', flexDirection: 'column', padding: `${56}px ${PAD}px 0 ${PAD}px`, width: `${WIDTH}px` }, [
    el('div', { display: 'flex', width: `${contentWidth}px` }, [
      el('div', { fontSize: 24, letterSpacing: '0.22em', textTransform: 'uppercase', color: COLORS.bronze }, BRAND),
      el('div', { fontSize: 22, letterSpacing: '0.22em', textTransform: 'uppercase', color: COLORS.saffron, marginLeft: 'auto' }, section || ''),
    ]),
    el('div', { width: '168px', height: '3px', backgroundColor: COLORS.saffron, marginTop: '24px', marginBottom: '30px' }, ''),
    el('div', { display: 'flex', width: `${contentWidth}px` }, [
      el('div', { display: 'flex', flexDirection: 'column', width: '916px' }, [
        el('div', { fontSize: titleFontSize(String(titleText).length), lineHeight: 1.28, color: COLORS.ink }, titleText),
        description
          ? el('div', { fontSize: 26, lineHeight: 1.45, color: COLORS.muted, marginTop: 20 }, clampText(description, 118))
          : '',
      ]),
      el('div', { display: 'flex', width: '104px', marginLeft: '36px', marginTop: '4px' }, [
        { type: 'img', props: { src: loadLogo(), width: 100, height: 100, style: { width: 100, height: 100 } } },
      ]),
    ]),
  ]);

  const footer = el('div', { display: 'flex', flexDirection: 'column', marginTop: 'auto' }, [
    stats && stats.length
      ? el('div', { display: 'flex', width: `${WIDTH}px`, padding: `0 ${PAD}px` }, stats.map(([n, label]) => statColumn(n, label)))
      : el('div', { height: '0px' }, ''),
    el('div', { height: '24px' }, ''),
  ]);

  const strip = el('div', { display: 'flex', width: `${WIDTH}px`, height: '10px' }, [
    el('div', { width: '620px', height: '10px', backgroundColor: COLORS.saffron }, ''),
    el('div', { width: '220px', height: '10px', backgroundColor: COLORS.bronze }, ''),
    el('div', { width: '360px', height: '10px', backgroundColor: COLORS.sand }, ''),
  ]);

  return el(
    'div',
    {
      width: `${WIDTH}px`,
      height: `${HEIGHT}px`,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: COLORS.ivory,
      fontFamily: 'Charis SIL',
    },
    [header, footer, strip],
  );
}

// Render one 1200x630 card PNG for a page title. satori is ESM-only here, so
// it is imported dynamically; @resvg/resvg-js is the CommonJS native renderer.
async function renderCard(titleText, options = {}) {
  if (!fontCache) loadFonts();
  const satori = (await import('satori')).default;
  const { Resvg } = require('@resvg/resvg-js');
  const tree = cardTree(String(titleText), options.description, options.section, options.stats);
  const svg = await satori(tree, { width: WIDTH, height: HEIGHT, fonts: fontCache });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } });
  return resvg.render().asPng();
}

module.exports = { renderCard, COLORS, BRAND, WIDTH, HEIGHT };
