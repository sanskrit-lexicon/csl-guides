import React from 'react';
import Link from '@docusaurus/Link';
import data from '@site/src/data/dictionaries.json';

// Renders the dictionary catalog from src/data/dictionaries.json, which is
// regenerated from the live front page by scripts/build-catalog.mjs.

const ext = {target: '_blank', rel: 'noreferrer'};

// Display code -> slug of its in-guide "featured dictionary" page (docs/dictionaries/).
// Keep in sync with sidebars.js "Featured dictionaries".
const GUIDE_PAGES = {
  MW: 'mw', MW72: 'mw72', AP90: 'ap90', AP: 'ap', WIL: 'wil', CAE: 'cae', MD: 'md',
  BEN: 'ben', YAT: 'yat', SHS: 'shs', GST: 'gst', LRV: 'lrv', AE: 'ae', BOR: 'bor',
  BOP: 'bop', BUR: 'bur', FRI: 'fri', LAN: 'lan', PWG: 'pwg', PW: 'pw', SCH: 'sch',
  CCS: 'ccs', GRA: 'gra', BHS: 'bhs', STC: 'stc', MWE: 'mwe', SKD: 'skd', VCP: 'vcp',
  ABCH: 'abch', ACPH: 'acph', ACSJ: 'acsj', ARMH: 'armh', KRM: 'krm',
  ACC: 'acc', IEG: 'ieg', INM: 'inm', MCI: 'mci', PE: 'pe', PGN: 'pgn', PUI: 'pui',
  SNP: 'snp', VEI: 'vei',
};

function Letter({href, on, children, title, name}) {
  if (href && on) {
    // The visible label is a single glyph (B/L/A/M/D/S¹/S²); give assistive tech a real
    // accessible name (WCAG 2.4.4 Link Purpose) — `title` alone is only an advisory tooltip.
    const label = `${name ? `${title} — ${name}` : title} (opens in new tab)`;
    return (
      <a href={href} title={title} aria-label={label} {...ext} style={{marginRight: '0.3em'}}>
        {children}
      </a>
    );
  }
  return (
    <span
      title={`${title} — not available`}
      className="catalog-na"
      style={{marginRight: '0.3em'}}>
      {children}
    </span>
  );
}

function OpenCell({d}) {
  if (d.sampleOnly) {
    return (
      <a
        href={d.href.startsWith('http') ? d.href : `${data.source.replace(/\/$/, '')}${d.href}`}
        aria-label={`Sample page — ${d.title} (opens in new tab)`}
        {...ext}>
        sample
      </a>
    );
  }
  const u = d.urls || {};
  const a = d.actions || {};
  return (
    <>
      <Letter href={u.basic} on={a.basic} name={d.title} title="Basic display">B</Letter>
      <Letter href={u.list} on={a.list} name={d.title} title="List display">L</Letter>
      <Letter href={u.advanced} on={a.advanced} name={d.title} title="Advanced search">A</Letter>
      <Letter href={u.mobile} on={a.mobile} name={d.title} title="Mobile display">M</Letter>
    </>
  );
}

function DataCell({d}) {
  if (d.sampleOnly) return <span className="catalog-na">—</span>;
  const u = d.urls || {};
  const a = d.actions || {};
  return (
    <>
      <Letter href={u.download} on={a.download} name={d.title} title="Downloads (XML/PDF)">D</Letter>
      <Letter href={u.scanPdf} on={a.scanPdf} name={d.title} title="Scanned edition (PDF)">S¹</Letter>
      <Letter href={u.scanJpg} on={a.scanJpg} name={d.title} title="Scanned edition (JPG)">S²</Letter>
    </>
  );
}

export default function DictionaryCatalog() {
  return (
    <div className="dictionary-catalog">
      <p>
        <em>
          Auto-generated from the <a href={data.source} {...ext}>live front page</a> on{' '}
          {data.generatedAt} by <code>scripts/build-catalog.mjs</code>. {data.fullyDigitized} fully
          digitized dictionaries ({data.totalRows} rows including the PD sample);{' '}
          {data.documentedInCslDoc} have a{' '}
          <a href="https://github.com/sanskrit-lexicon/csl-doc" {...ext}>csl-doc</a> page.
        </em>
      </p>

      <p style={{fontSize: '0.9em'}}>
        <strong>Open</strong>: B=Basic · L=List · A=Advanced · M=Mobile.{' '}
        <strong>Data</strong>: D=Downloads · S¹=PDF scan · S²=JPG scan. Greyed letters are
        not offered for that dictionary. A <strong>📖 guide</strong> link marks dictionaries
        with a dedicated guide page in this site. Links to the live CDSL site, scans, and
        GitHub open in a new browser tab.
      </p>

      {data.groups.map((g) => (
        <section key={g.name}>
          <h3 id={g.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>
            {g.name} ({g.items.length})
          </h3>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Dictionary</th>
                <th>Year</th>
                <th>Pp.</th>
                <th>Open</th>
                <th>Data</th>
                <th>Repo</th>
                <th>csl-doc</th>
              </tr>
            </thead>
            <tbody>
              {g.items.map((d) => (
                <tr key={d.code}>
                  <td>
                    {d.cslOrigUrl ? (
                      <a href={d.cslOrigUrl} {...ext} title="csl-orig source"><code>{d.code}</code></a>
                    ) : (
                      <code>{d.code}</code>
                    )}
                  </td>
                  <td>
                    {d.urls ? (
                      <a href={d.urls.overview} {...ext} title={d.titleAttr}>{d.title}</a>
                    ) : (
                      <span title={d.titleAttr}>{d.title}</span>
                    )}
                    {d.sampleOnly && <em> (sample only)</em>}
                    {GUIDE_PAGES[d.code] && (
                      <>
                        {' '}
                        <Link
                          to={`/dictionaries/${GUIDE_PAGES[d.code]}`}
                          title={`Guide page for ${d.code}`}
                          style={{fontSize: '0.85em', whiteSpace: 'nowrap'}}
                        >
                          📖 guide
                        </Link>
                      </>
                    )}
                  </td>
                  <td>{d.year}</td>
                  <td>{d.pages || ''}</td>
                  <td style={{whiteSpace: 'nowrap'}}><OpenCell d={d} /></td>
                  <td style={{whiteSpace: 'nowrap'}}><DataCell d={d} /></td>
                  <td>
                    {d.repoUrl ? <a href={d.repoUrl} {...ext}>{d.repo}</a> : <span className="catalog-na">—</span>}
                  </td>
                  <td>
                    {d.cslDocUrl ? <a href={d.cslDocUrl} {...ext}>{d.cslDocPage}</a> : <span className="catalog-na">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
