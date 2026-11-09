// H7886 - Docusaurus plugin: per-page Open Graph social cards.
// postBuild pass: for every built page (both `about.html` and
// `dir/index.html` shapes - the site uses trailingSlash: false), render a
// 1200x630 card PNG
// (plugins/og-cards/renderCard.js), write it to build/og-cards/<slug>.png and
// rewrite the page og:image + twitter:image to point at it. Pages without a
// card (404) keep the sitewide themeConfig.image fallback. docs/internal is
// excluded from the build upstream (docusaurus.config.js), so no internal
// page ever gets a card.
//
// v0.2 (H7886 follow-up): the card gains the page description and a section
// label, and every page gains the social tags Docusaurus does not emit -
// og:site_name, og:type, og:image:alt, og:image:width/height, twitter:site,
// twitter:title, twitter:description.
//
// v0.3 (H7903): every page that carries NO description at all - the routes
// Docusaurus generates from plugin data (blog tag list + tag post pages, the
// ejected search page), 404, and the static newsletter redirect - gets one
// derived here from its own <h1> plus the configured site title/tagline.
// No blog-plugin option reaches those routes (blogDescription feeds only the
// paginated blog list, the tags file needs hand-written prose per tag), so the
// postBuild pass owns it. Guarded by scripts/og-description-census.mjs.

const fs = require('fs');
const path = require('path');
const { renderCard } = require('./renderCard');

const TWITTER_SITE = '@sanskritlexicon';

// Numeric character references (&#39;, &#x2014;, ...) plus the five named
// entities. Docusaurus emits numeric ones for apostrophes and dashes, so the
// old five-entity decoder left "&#x27;" inside card text.
function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
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

// Visible page heading, entity-decoded and tag-stripped. The plugin-generated
// routes have no frontmatter description, but their own <h1> is a page-specific
// string that comes from page data rather than from prose typed for SEO.
function pageHeading(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!m) return '';
  return decodeEntities(m[1].replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

// Site-level half of a derived description: configured title + configured
// tagline, joined so the pair reads as one sentence. Both come from
// docusaurus.config.js, so the suffix cannot drift from the site it describes.
function siteDescriptionSuffix(siteConfig) {
  const tagline = String(siteConfig.tagline || '').trim();
  if (!tagline) return siteConfig.title;
  return siteConfig.title + ', ' + tagline.charAt(0).toLowerCase() + tagline.slice(1);
}

// Description for a page that carries none: "<h1> — <site title>, <tagline>",
// falling back to the page title when there is no <h1>, and to the site line
// alone when there is neither. Deterministic from page data - no per-route
// hand-authored prose, so a new tag page needs no edit here.
function derivedDescription(html, siteConfig) {
  const suffix = siteDescriptionSuffix(siteConfig);
  const heading = pageHeading(html) || pageTitle(html, siteConfig.title);
  return heading && heading !== siteConfig.title ? heading + ' — ' + suffix : suffix;
}

// Counts for the card's footer, derived from committed sources at build time -
// never typed: the catalog feed knows how many dictionaries it carries, the
// docs tree knows how many public guide pages it has, blog/ knows the posts.
// A count that cannot be read is omitted rather than guessed.
function countGuidePages(docsDir) {
  let n = 0;
  for (const e of fs.readdirSync(docsDir, { withFileTypes: true })) {
    const p = path.join(docsDir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'internal') continue; // build-excluded, never a public page
      n += countGuidePages(p);
    } else if (/\.mdx?$/.test(e.name) && !e.name.endsWith('.meta.md')) {
      n = n + 1;
    }
  }
  return n;
}

let statsCache = null;

function siteStats() {
  if (statsCache) return statsCache;
  const root = path.join(__dirname, '..', '..');
  const stats = [];
  try {
    const catalog = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'dictionaries.json'), 'utf8'));
    if (catalog.totalRows) stats.push([catalog.totalRows, 'dictionaries']);
  } catch (e) {
    // feed absent: drop the count, never invent one
  }
  try {
    const guides = countGuidePages(path.join(root, 'docs'));
    if (guides) stats.push([guides, 'guides']);
  } catch (e) {}
  try {
    const posts = fs.readdirSync(path.join(root, 'blog')).filter((f) => /\.mdx?$/.test(f)).length;
    if (posts) stats.push([posts, 'posts']);
  } catch (e) {}
  statsCache = stats;
  return stats;
}

// Card slug: deterministic, filesystem-safe, collision-proof (page path plus a
// short hash of the path, so 'a/b' and 'a-b' cannot collide).
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

const SECTION_LABELS = {
  '': 'HOME',
  news: 'NEWS',
  newsletter: 'NEWSLETTER',
  dictionaries: 'DICTIONARIES',
  tools: 'TOOLS',
  users: 'USER GUIDES',
  developers: 'DEVELOPERS',
  about: 'ABOUT',
  contributing: 'CONTRIBUTING',
  search: 'SEARCH',
};

function sectionLabel(pagePath) {
  const first = pagePath.split('/').filter(Boolean)[0] || '';
  return SECTION_LABELS[first] || first.replace(/-/g, ' ').toUpperCase();
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

// Insert a tag only when the page does not carry it yet.
function ensureMeta(html, key, attr, value) {
  const tagRe = new RegExp('<meta[^>]*' + attr + '="' + key + '"[^>]*>', 'i');
  if (tagRe.test(html)) return html;
  const fresh = '<meta ' + attr + '="' + key + '" content="' + escapeHtml(value) + '" />';
  return html.replace('</head>', fresh + '\n    </head>');
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
  let derived = 0;
  for (const file of files) {
    const pagePath = pagePathOf(outDir, file);
    const is404 = pagePath === '404';
    if (pagePath.split('/').includes('internal')) continue; // belt+braces
    const html = fs.readFileSync(file, 'utf8');
    const titleText = pageTitle(html, siteConfig.title);
    const description = metaContent(html, 'og:description') || metaContent(html, 'description') || '';
    const pageDescription = description || derivedDescription(html, siteConfig);
    if (!description) derived = derived + 1;
    let out = html;

    if (!is404) {
      const slug = cardSlug(pagePath);
      const imageUrl = url + baseUrl + 'og-cards/' + slug + '.png';
      // A derived description starts with the page heading, i.e. the title, so
      // it is dropped from the card rather than printed twice in a row. The
      // home page keeps its own description: it names the guides, not the brand.
      let cardDescription = pageDescription;
      if (cardDescription.startsWith(titleText)) cardDescription = '';
      const png = await renderCard(titleText, {
        description: cardDescription,
        section: sectionLabel(pagePath),
        stats: siteStats(),
      });
      fs.writeFileSync(path.join(cardsDir, slug + '.png'), png);
      out = setMetaContent(out, 'og:image', 'property', imageUrl);
      out = setMetaContent(out, 'twitter:image', 'name', imageUrl);
      if (!/<meta[^>]*name="twitter:card"[^>]*>/i.test(out)) {
        out = out.replace(
          '</head>',
          '<meta name="twitter:card" content="summary_large_image" />\n    </head>',
        );
      }
      cards = cards + 1;
    }

    // H7903: routes Docusaurus generates from plugin data (blog tag pages, the
    // ejected search page), 404 and the static newsletter redirect carry no
    // description at all - pageDescription above derives one; ensureMeta is
    // idempotent, so a page that already has either tag keeps its own text.
    out = ensureMeta(out, 'description', 'name', pageDescription);
    out = ensureMeta(out, 'og:description', 'property', pageDescription);

    // Social tags Docusaurus 3.10 does not emit (GitHub does; a missing alt
    // costs accessibility, missing dimensions cost a fetch per unfurl).
    const fullTitle = siteConfig.title;
    const altText = pageDescription ? titleText + ' — ' + fullTitle : titleText;
    out = ensureMeta(out, 'og:site_name', 'property', fullTitle);
    out = ensureMeta(out, 'og:type', 'property', 'website');
    out = ensureMeta(out, 'og:image:alt', 'property', altText);
    out = ensureMeta(out, 'og:image:width', 'property', '1200');
    out = ensureMeta(out, 'og:image:height', 'property', '630');
    out = ensureMeta(out, 'twitter:site', 'name', TWITTER_SITE);
    out = ensureMeta(out, 'twitter:title', 'name', titleText);
    out = ensureMeta(out, 'twitter:description', 'name', pageDescription);

    fs.writeFileSync(file, out);
  }
  // Fail loudly rather than silently shipping pages whose OG card is still the
  // sitewide fallback: a render pass that produced nothing means the page
  // collector or the title extraction broke (H7886 saw both).
  if (cards === 0) {
    throw new Error('og-cards: no pages rendered - collector or title extraction is broken');
  }
  console.log('og-cards: rendered ' + cards + ' per-page OG cards');
  console.log(
    'og-cards: derived a description for ' + derived + ' page(s) that carried none',
  );
}

module.exports = function ogCardsPlugin() {
  return { name: 'og-cards', postBuild };
};
