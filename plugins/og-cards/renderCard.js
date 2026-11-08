// H7886 — per-page OG card renderer, light-minimal-academic (MG-grilled):
// ivory ground, Charis SIL serif title, thin saffron rule, small-caps brand
// line. v0.2 adds the page description under the title and the section name
// on the brand row. 1200x630 PNG. Fonts vendored in static/fonts/ under
// SIL OFL 1.1 (static/fonts/Charis-OFL.txt).

const fs = require('fs');
const path = require('path');

const WIDTH = 1200;
const HEIGHT = 630;
const BRAND = 'Cologne Digital Sanskrit Dictionaries';

const COLORS = {
  ivory: '#FBF7EC',
  ink: '#2A2418',
  saffron: '#D9A441',
  bronze: '#8A7A57',
  muted: '#5C5343',
};

let fontCache = null;

function loadFonts() {
  if (fontCache) return fontCache;
  const dir = path.join(__dirname, '..', '..', 'static', 'fonts');
  fontCache = [
    { name: 'Charis SIL', data: fs.readFileSync(path.join(dir, 'Charis-Regular.ttf')), weight: 400, style: 'normal' },
    { name: 'Charis SIL', data: fs.readFileSync(path.join(dir, 'Charis-Bold.ttf')), weight: 700, style: 'normal' },
  ];
  return fontCache;
}

function titleFontSize(len) {
  if (len <= 60) return 62;
  if (len <= 110) return 50;
  if (len <= 170) return 40;
  return 32;
}

// Truncate for two lines at 30px (measured: ~118 chars keeps it to two). Prefer a sentence boundary,
// then a clause break, then a word boundary - a card that ends "...at…" reads
// like a broken template, one that ends "dictionaries." reads like prose.
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

// satori element tree as plain objects (module stays CommonJS, no build step).
function cardTree(titleText, description, section) {
  const children = [
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 26,
        },
        children: [
          {
            type: 'div',
            props: {
              style: { fontSize: 26, letterSpacing: '0.22em', textTransform: 'uppercase', color: COLORS.bronze },
              children: BRAND,
            },
          },
          {
            type: 'div',
            props: {
              style: { fontSize: 22, letterSpacing: '0.22em', textTransform: 'uppercase', color: COLORS.saffron },
              children: section || '',
            },
          },
        ],
      },
    },
    {
      type: 'div',
      props: {
        style: { width: 168, height: 3, backgroundColor: COLORS.saffron, marginBottom: 34 },
        children: '',
      },
    },
    {
      type: 'div',
      props: {
        style: { fontSize: titleFontSize(String(titleText).length), lineHeight: 1.3, color: COLORS.ink },
        children: titleText,
      },
    },
  ];

  if (description) {
    children.push({
      type: 'div',
      props: {
        style: { fontSize: 30, lineHeight: 1.45, color: COLORS.muted, marginTop: 22 },
        children: clampText(description, 118),
      },
    });
  }

  return {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '72px 84px',
        backgroundColor: COLORS.ivory,
        fontFamily: 'Charis SIL',
      },
      children,
    },
  };
}

// Render one 1200x630 card PNG for a page title. satori is ESM-only here, so
// it is imported dynamically; @resvg/resvg-js is the CommonJS native renderer.
async function renderCard(titleText, options = {}) {
  if (!fontCache) loadFonts();
  const satori = (await import('satori')).default;
  const { Resvg } = require('@resvg/resvg-js');
  const tree = cardTree(String(titleText), options.description, options.section);
  const svg = await satori(tree, { width: WIDTH, height: HEIGHT, fonts: fontCache });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } });
  return resvg.render().asPng();
}

module.exports = { renderCard, COLORS, BRAND, WIDTH, HEIGHT };
