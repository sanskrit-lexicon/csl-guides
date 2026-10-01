// H5542 acceptance evidence: verify the DictionaryComparison sanitizer in a REAL browser DOM.
//
// Loads DOMPurify (the version pinned in package-lock) into Chromium, reconstructs
// extractEntry() with FORBIDDEN_TAGS / SANITIZE_CONFIG extracted verbatim from
// src/components/DictionaryComparison.js (fails loud on drift), then runs:
//   * hostile payloads — the bypass classes the old hand-rolled blocklist missed
//     (xlink:href javascript:, tab-obfuscated `jav&#9;ascript:`, on* handlers, mXSS-style
//     nesting) plus the tags the old pass never covered (form/base/template/noscript);
//   * a legit entry fixture — asserting display markup (span/table/i/a/br, style/class,
//     link target=_blank rel=noreferrer) survives sanitization.
// Usage: node scripts/verify-dict-sanitizer.mjs
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {chromium} from 'playwright';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const componentSrc = readFileSync(path.join(repoRoot, 'src/components/DictionaryComparison.js'), 'utf8');

// Single source of truth: pull the live config out of the component, fail loud on drift.
const tagsMatch = componentSrc.match(/const FORBIDDEN_TAGS = \[([^\]]*)\]/);
const cfgMatch = componentSrc.match(/const SANITIZE_CONFIG = (\{[\s\S]*?\n\});/);
if (!tagsMatch || !cfgMatch) {
  console.error('FAIL: FORBIDDEN_TAGS / SANITIZE_CONFIG not found in DictionaryComparison.js (renamed or moved?)');
  process.exit(1);
}
const forbiddenTags = tagsMatch[1].split(',').map((s) => s.trim().replace(/['"]/g, '')).filter(Boolean);
// The config literal references FORBIDDEN_TAGS — bind it, then evaluate the object literal.
const sanitizeConfig = (0, eval)(`(() => { const FORBIDDEN_TAGS = ${JSON.stringify(forbiddenTags)}; return (${cfgMatch[1]}); })()`);

// DOMPurify from the lockfile-resolved install.
const purifyPath = path.join(repoRoot, 'node_modules/dompurify/dist/purify.min.js');

// Offline hostile fixtures: each names the bypass class it covers.
const HOSTILE = [
  {name: 'script+on* handlers', html: `<div id='CologneBasic'><p onclick='x()'>t</p><script>alert(1)</script><img src=x onerror=alert(4)></div>`},
  {name: 'plain javascript: href', html: `<div id='CologneBasic'><a href='javascript:alert(1)'>l</a></div>`},
  {name: 'svg xlink:href javascript:', html: `<div id='CologneBasic'><svg><a xlink:href='javascript:alert(2)'><text>x</text></a></svg></div>`},
  {name: 'tab-obfuscated javascript: href', html: `<div id='CologneBasic'><a href='jav&#9;ascript:alert(3)'>t</a></div>`},
  {name: 'mXSS-style svg/style nesting', html: `<div id='CologneBasic'><svg></p><style><a id='</style><img src=1 onerror=alert(5)>'></svg></div>`},
  {name: 'containers old pass missed', html: `<div id='CologneBasic'><form action='javascript:alert(6)'><input onfocus=alert(7)></form><base href='javascript:'><iframe src='x'></iframe><template><script>alert(8)</script></template><noscript><img src=x onerror=alert(9)></noscript></div>`},
];

// Synthetic legit-entry fixture shaped like the real Cologne getword payload
// (span/table/i/a/br + style/class/title attrs + <listinfo> custom tag + custom `n` attr).
const LEGIT = `<div id='CologneBasic'><h1>&nbsp;<span class='sdata'>agni</span></h1>
<table class='display' style='width:100%'><tr><td class='display' valign='top'><i>fire</i><br><a href='#x' title='see'>x</a></td></tr></table>
<listinfo n='3'><span style='font-weight:bold'>RV</span></listinfo><ocs>pw</ocs></div>`;

const browser = await chromium.launch({channel: 'chrome'}).catch(() => chromium.launch());
const page = await browser.newPage();
await page.setContent('<!doctype html><body></body>');
await page.addScriptTag({path: purifyPath});

const results = await page.evaluate(({forbiddenTags, sanitizeConfig, hostile, legit}) => {
  // Negative control: replica of the PRE-H5542 hand-rolled blocklist, run on the same
  // fixtures — shows which bypass classes the old pass actually missed.
  const oldExtract = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const root = doc.querySelector('#CologneBasic') || doc.body;
    root.querySelectorAll('script,style,link,meta,iframe,object,embed').forEach((n) => n.remove());
    root.querySelectorAll('*').forEach((el) => {
      el.getAttributeNames().forEach((name) => {
        const n = name.toLowerCase();
        const val = el.getAttribute(name) || '';
        if (n.startsWith('on')) el.removeAttribute(name);
        else if ((n === 'href' || n === 'src') && /^\s*javascript:/i.test(val)) el.removeAttribute(name);
      });
    });
    root.querySelectorAll('a[href]').forEach((a) => {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noreferrer');
    });
    return root.innerHTML;
  };
  // Replicates extractEntry() in DictionaryComparison.js (same steps, same order, same hook).
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.hasAttribute('href')) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noreferrer');
    }
  });
  const extractEntry = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const root = doc.querySelector('#CologneBasic') || doc.body;
    return DOMPurify.sanitize(root.innerHTML, sanitizeConfig);
  };
  // Audit a sanitized fragment: any surviving vector => reason string.
  const audit = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const reasons = [];
    const dangerousUri = (name, val) => {
      if (!['href', 'src', 'xlink:href', 'action', 'formaction', 'srcdoc'].includes(name)) return false;
      return /^\s*(javascript|vbscript|data:text\/html)/i.test(String(val).replace(/[\t\n\r]/g, ''));
    };
    for (const el of doc.querySelectorAll('*')) {
      const tag = el.tagName.toLowerCase();
      if (forbiddenTags.includes(tag)) reasons.push(`forbidden tag <${tag}>`);
      for (const attr of Array.from(el.attributes)) {
        const n = attr.name.toLowerCase();
        if (n.startsWith('on')) reasons.push(`handler ${n} on <${tag}>`);
        if (dangerousUri(n, attr.value)) reasons.push(`dangerous URI in ${n} on <${tag}>`);
      }
    }
    return reasons;
  };
  const out = {hostile: [], oldMissed: {}, legit: {}};
  for (const f of hostile) {
    out.hostile.push({name: f.name, reasons: audit(extractEntry(f.html))});
    out.oldMissed[f.name] = audit(oldExtract(f.html)).length;
  }
  const clean = extractEntry(legit);
  const doc = new DOMParser().parseFromString(clean, 'text/html');
  const count = (sel) => doc.querySelectorAll(sel).length;
  out.legit = {
    reasons: audit(clean),
    counts: {
      span: count('span'), table: count('table'), tr: count('tr'), td: count('td'),
      i: count('i'), a: count('a'), br: count('br'), listinfo: count('listinfo'), ocs: count('ocs'),
    },
    styledKept: !!doc.querySelector("span[style='font-weight:bold']"),
    linkTargetKept: (() => {
      const a = doc.querySelector('a');
      return !!a && a.getAttribute('target') === '_blank' && a.getAttribute('rel') === 'noreferrer';
    })(),
  };
  return out;
}, {forbiddenTags, sanitizeConfig, hostile: HOSTILE, legit: LEGIT});
await browser.close();

let failed = 0;
for (const r of results.hostile) {
  const oldMissed = results.oldMissed[r.name] || 0;
  const note = oldMissed ? ` (old blocklist missed this: ${oldMissed} surviving vector(s))` : '';
  if (r.reasons.length) { console.log(`FAIL  ${r.name}: ${r.reasons.join('; ')}`); failed++; }
  else console.log(`PASS  ${r.name}${note}`);
}
const L = results.legit;
const need = {span: 2, table: 1, tr: 1, td: 1, i: 1, a: 1, br: 1, listinfo: 1, ocs: 1};
const short = Object.entries(need).filter(([k, n]) => (L.counts[k] || 0) < n);
if (L.reasons.length || short.length || !L.styledKept || !L.linkTargetKept) {
  console.log(`FAIL  legit-entry preservation: reasons=[${L.reasons}] short=[${short}] styledKept=${L.styledKept} linkTargetKept=${L.linkTargetKept}`);
  failed++;
} else {
  console.log(`PASS  legit-entry preservation (span/table/i/a/br/listinfo/style attrs/link target+rel kept)`);
}
console.log(failed ? `VERIFY: FAIL (${failed} case(s))` : 'VERIFY: PASS (all cases)');
process.exit(failed ? 1 : 0);
