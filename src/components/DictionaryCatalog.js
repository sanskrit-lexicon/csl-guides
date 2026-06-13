import React from 'react';
import data from '@site/src/data/dictionaries.json';

// Renders the dictionary catalog from src/data/dictionaries.json, which is
// regenerated from the live front page by scripts/build-catalog.mjs.

const ext = {target: '_blank', rel: 'noreferrer'};

function Letter({href, on, children, title}) {
  if (href && on) {
    return (
      <a href={href} title={title} {...ext} style={{marginRight: '0.3em'}}>
        {children}
      </a>
    );
  }
  return (
    <span title={`${title} — not available`} style={{marginRight: '0.3em', opacity: 0.3}}>
      {children}
    </span>
  );
}

function OpenCell({d}) {
  if (d.sampleOnly) {
    return (
      <a href={d.href.startsWith('http') ? d.href : `${data.source.replace(/\/$/, '')}${d.href}`} {...ext}>
        sample
      </a>
    );
  }
  const u = d.urls || {};
  const a = d.actions || {};
  return (
    <>
      <Letter href={u.basic} on={a.basic} title="Basic display">B</Letter>
      <Letter href={u.list} on={a.list} title="List display">L</Letter>
      <Letter href={u.advanced} on={a.advanced} title="Advanced search">A</Letter>
      <Letter href={u.mobile} on={a.mobile} title="Mobile display">M</Letter>
    </>
  );
}

function DataCell({d}) {
  if (d.sampleOnly) return <span style={{opacity: 0.3}}>—</span>;
  const u = d.urls || {};
  const a = d.actions || {};
  return (
    <>
      <Letter href={u.download} on={a.download} title="Downloads (XML/PDF)">D</Letter>
      <Letter href={u.scanPdf} on={a.scanPdf} title="Scanned edition (PDF)">S¹</Letter>
      <Letter href={u.scanJpg} on={a.scanJpg} title="Scanned edition (JPG)">S²</Letter>
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
        not offered for that dictionary.
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
                  <td><code>{d.code}</code></td>
                  <td>
                    {d.urls ? (
                      <a href={d.urls.overview} {...ext}>{d.title}</a>
                    ) : (
                      d.title
                    )}
                    {d.sampleOnly && <em> (sample only)</em>}
                  </td>
                  <td>{d.year}</td>
                  <td>{d.pages || ''}</td>
                  <td style={{whiteSpace: 'nowrap'}}><OpenCell d={d} /></td>
                  <td style={{whiteSpace: 'nowrap'}}><DataCell d={d} /></td>
                  <td>
                    {d.repoUrl ? <a href={d.repoUrl} {...ext}>{d.repo}</a> : <span style={{opacity: 0.4}}>—</span>}
                  </td>
                  <td>
                    {d.cslDocUrl ? <a href={d.cslDocUrl} {...ext}>{d.cslDocPage}</a> : <span style={{opacity: 0.4}}>—</span>}
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
