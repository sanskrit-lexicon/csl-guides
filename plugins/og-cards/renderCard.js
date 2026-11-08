// H7886 — per-page OG card renderer, light-minimal-academic (MG-grilled):
// ivory ground, Charis SIL serif title, thin saffron rule, small-caps brand
// line. 1200x630 PNG. Fonts vendored in static/fonts/ under SIL OFL 1.1
// (static/fonts/Charis-OFL.txt).

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

// satori element tree as plain objects (module stays CommonJS, no build step).
function cardTree(titleText) {
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
      children: [
        {
          type: 'div',
          props: {
            style: {
              fontSize: 26,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: COLORS.bronze,
              marginBottom: 26,
            },
            children: BRAND,
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
      ],
    },
  };
}

// Render one 1200x630 card PNG for a page title. satori is ESM-only here, so
// it is imported dynamically; @resvg/resvg-js is the CommonJS native renderer.
async function renderCard(titleText) {
  if (!fontCache) loadFonts();
  const satori = (await import('satori')).default;
  const { Resvg } = require('@resvg/resvg-js');
  const svg = await satori(cardTree(String(titleText)), { width: WIDTH, height: HEIGHT, fonts: fontCache });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } });
  return resvg.render().asPng();
}

module.exports = { renderCard, COLORS, BRAND, WIDTH, HEIGHT };
