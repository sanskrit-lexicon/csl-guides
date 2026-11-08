// H7886 - Docusaurus plugin: per-page Open Graph social cards.
// postBuild pass: for every built page (both `about.html` and
// `dir/index.html` shapes - the site uses trailingSlash: false), render a
// 1200x630 card PNG
// (plugins/og-cards/renderCard.js), write it to build/og-cards/<slug>.png and
// rewrite the page og:image + twitter:image to point at it. Pages without a
// card (404) keep the sitewide themeConfig.image fallback. docs/internal is
// excluded from the build upstream (docusaurus.config.js), so no internal
// page ever gets a card.

const fs = require('fs');
const path = require('path');
const { renderCard } = require('./renderCard');

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function collectHtmlFiles(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'og-cards') continue; // our own output, no HTML there
      collectHtmlFiles(p, out);
    } else if (e.name.endsWith('.html')) {
      out.push(p);
    }
  }
}

// The site builds with trailingSlash: false, so Docusaurus emits most routes as
// `about.html`, not `about/index.html`. Both shapes are handled: the page path
// is the route the URL resolves to ('', 'about', 'dictionaries/mw', ...).
function pagePathOf(outDir, file) {
  const rel = path.relative(outDir, file).split(path.sep).join('/');
  if (rel === 'index.html') return '';
  if (rel.endsWith('/index.html')) return rel.slice(0, -'/index.html'.length);
  return rel.replace(/\.html$/, '');
}

// Deterministic, filesystem-safe slug for a page path: the readable path with
// separators collapsed, plus a short content hash of the path so that
// 'a/b' and 'a-b' can never collide. Deterministic means an unchanged page
// keeps the same card URL across rebuilds.
function cardSlug(pagePath) {
  const readable =
    pagePath
      .split('/')
      .filter(Boolean)
      .join('-')
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'home';
  const hash = require('crypto').createHash('sha1').update(pagePath).digest('hex').slice(0, 6);
  return readable + '-' + hash;
}

// Read one <meta> content by key. Docusaurus emits `data-rh="true"` first and
// may order content before property, so the tag is matched whole and the
// content attribute extracted from it rather than assumed adjacent.
function metaContent(html, key) {
  const re = new RegExp('<meta[^>]*(?:property|name)="' + key + '"[^>]*>', 'i');
  const m = html.match(re);
  if (!m) return null;
  const c = m[0].match(/content="([^"]*)"/);
  return c ? decodeEntities(c[1]) : null;
}

// Page title for the card: og:title when present (first), <title> otherwise;
// the " | <site title>" suffix Docusaurus appends is stripped for both.
function pageTitle(html, siteTitle) {
  const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/);
  let text = metaContent(html, 'og:title') || (titleTag ? decodeEntities(titleTag[1]).trim() : '');
  const suffix = ' | ' + siteTitle;
  if (text.endsWith(suffix)) text = text.slice(0, -suffix.length);
  return text.trim() || siteTitle;
}

// Rewrite the content of the first matching <meta> in place, keeping the tag's
// own attributes (data-rh included) so the page never carries two og:image
// tags - crawlers use the first one, so a duplicate would silently win over
// the per-page card.
function setMetaContent(html, key, attr, value) {
  const tagRe = new RegExp('<meta[^>]*' + attr + '="' + key + '"[^>]*>', 'i');
  const m = html.match(tagRe);
  if (!m) {
    const fresh = '<meta ' + attr + '="' + key + '" content="' + escapeHtml(value) + '" />';
    return html.replace('</head>', fresh + '\n    </head>');
  }
  const tag = m[0];
  const replaced = /content="[^"]*"/.test(tag)
    ? tag.replace(/content="[^"]*"/, 'content="' + escapeHtml(value) + '"')
    : tag.replace(/\s*\/?>$/, ' content="' + escapeHtml(value) + '" />');
  return html.replace(tag, replaced);
}

async function postBuild({ siteConfig, outDir }) {
  const url = String(siteConfig.url).replace(/\/+$/, '');
  const baseUrl = siteConfig.baseUrl;
  const cardsDir = path.join(outDir, 'og-cards');
  // postBuild owns this directory; the fresh-output build does not create it.
  fs.mkdirSync(cardsDir, { recursive: true });
  const files = [];
  collectHtmlFiles(outDir, files);
  let cards = 0;
  for (const file of files) {
    const pagePath = pagePathOf(outDir, file);
    if (pagePath === '404') continue; // sitewide fallback card stays
    if (pagePath.split('/').includes('internal')) continue; // belt+braces
    const html = fs.readFileSync(file, 'utf8');
    const titleText = pageTitle(html, siteConfig.title);
    const slug = cardSlug(pagePath);
    const imageUrl = url + baseUrl + 'og-cards/' + slug + '.png';
    const png = await renderCard(titleText);
    fs.writeFileSync(path.join(cardsDir, slug + '.png'), png);
    let out = html;
    out = setMetaContent(out, 'og:image', 'property', imageUrl);
    out = setMetaContent(out, 'twitter:image', 'name', imageUrl);
    if (!/<meta[^>]*name="twitter:card"[^>]*>/i.test(out)) {
      out = out.replace(
        '</head>',
        '<meta name="twitter:card" content="summary_large_image" />\n    </head>',
      );
    }
    fs.writeFileSync(file, out);
    cards = cards + 1;
  }
  // Fail loudly rather than silently shipping pages whose OG card is still the
  // sitewide fallback: a render pass that produced nothing means the page
  // collector or the title extraction broke (H7886 saw both).
  if (cards === 0) {
    throw new Error('og-cards: no pages rendered - collector or title extraction is broken');
  }
  console.log('og-cards: rendered ' + cards + ' per-page OG cards');
}

module.exports = function ogCardsPlugin() {
  return { name: 'og-cards', postBuild };
};
