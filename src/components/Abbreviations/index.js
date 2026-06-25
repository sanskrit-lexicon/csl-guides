import React from 'react';
import data from '@site/src/data/abbreviations.json';
import styles from './styles.module.css';

// Rendered from the generated src/data/abbreviations.json (npm run build:abbreviations).
// Do not hand-edit the data — re-derive it from the per-dictionary source files.

function dictByCode(code) {
  return data.dicts.find((d) => d.code === code);
}

function fullTitle(code) {
  const d = dictByCode(code);
  return d ? `${d.fullTitle}${d.year ? ` (${d.year})` : ''}` : code;
}

/** One of the two cross-dictionary comparison matrices. `kind` = 'works' | 'grammatical'. */
export function AbbreviationComparison({kind}) {
  const rows = data.comparison[kind] || [];
  const freq = {};
  rows.forEach((r) => Object.keys(r.cells).forEach((c) => (freq[c] = (freq[c] || 0) + 1)));
  const cols = Object.keys(freq).sort((a, b) => freq[b] - freq[a] || a.localeCompare(b));
  const corner = kind === 'works' ? 'Work' : 'Term';
  return (
    <div className={styles.scroll}>
      <table className={styles.matrix}>
        <thead>
          <tr>
            <th className={styles.cornerCell}>{corner}</th>
            {cols.map((c) => (
              <th key={c} title={fullTitle(c)}>
                <a href={`#dict-${c.toLowerCase()}`}>{c}</a>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.concept}>
              <th className={styles.rowHead}>{r.concept}</th>
              {cols.map((c) => (
                <td key={c}>{r.cells[c] || <span className={styles.dot}>·</span>}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Cap how many rows a single list renders inline — long bibliographies (PWG ~2600) would
// otherwise bloat the page. The full list is one click away at the source file.
const CAP = 60;

function AbbrList({label, entries, moreUrl}) {
  if (!entries || !entries.length) return null;
  const shown = entries.slice(0, CAP);
  const overflow = entries.length - shown.length;
  const body = (
    <>
      <table className={styles.list}>
        <tbody>
          {shown.map((e, i) => (
            <tr key={i}>
              <td className={styles.abbr}>{e.abbr}</td>
              <td>{e.expansion}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {overflow > 0 && (
        <p className={styles.more}>
          + {overflow} more —{' '}
          {moreUrl ? <a href={moreUrl} target="_blank" rel="noopener noreferrer">see the full list in the source file</a> : 'see the source file'}
        </p>
      )}
    </>
  );
  return (
    <div className={styles.listBlock}>
      <p className={styles.listLabel}>
        {label} <span className={styles.count}>{entries.length}</span>
      </p>
      {shown.length > 30 ? (
        <details>
          <summary>Show {shown.length === entries.length ? `${entries.length}` : `first ${shown.length} of ${entries.length}`} abbreviations</summary>
          {body}
        </details>
      ) : (
        body
      )}
    </div>
  );
}

function SourceLink({sourceUrl}) {
  const urls = Array.isArray(sourceUrl) ? sourceUrl : [sourceUrl];
  return (
    <span className={styles.source}>
      source:{' '}
      {urls.map((u, i) => (
        <React.Fragment key={u}>
          {i > 0 && ', '}
          <a href={u} target="_blank" rel="noopener noreferrer">
            {u.split('/').pop()}
          </a>
        </React.Fragment>
      ))}
    </span>
  );
}

/**
 * One dictionary's abbreviation section. Used by the directory (with its title heading)
 * and embedded on each dictionary's deep page (`headless` — the page already has the title,
 * so only the source link + lists / front-matter note render).
 */
export function DictAbbreviations({code, level = 'h3', headless = false}) {
  const d = dictByCode(code);
  if (!d) return null;
  const Heading = level;
  const moreUrl = Array.isArray(d.sourceUrl) ? d.sourceUrl[0] : d.sourceUrl;
  const badge =
    d.status === 'data'
      ? {cls: styles.badgeData, txt: `${d.langLabel}${d.kind === 'names' ? ' · names index' : ''}`}
      : d.status === 'tokens'
        ? {cls: styles.badgeTokens, txt: 'tokens only'}
        : {cls: styles.badgeNone, txt: 'front matter only'};
  return (
    <div className={styles.dict}>
      {!headless && (
        <Heading id={`dict-${code.toLowerCase()}`}>
          {d.fullTitle} {d.year && <span className={styles.year}>{d.year}</span>}{' '}
          <span className={styles.code}>{code}</span>
          <span className={`${styles.badge} ${badge.cls}`}>{badge.txt}</span>
        </Heading>
      )}
      {d.status === 'data' && (
        <>
          <div className={styles.meta}>
            <SourceLink sourceUrl={d.sourceUrl} />
          </div>
          <AbbrList label="Literary sources" entries={d.works} moreUrl={moreUrl} />
          <AbbrList label="Grammatical & general" entries={d.grammatical} moreUrl={moreUrl} />
          <AbbrList label="Abbreviations" entries={d.mixed} moreUrl={moreUrl} />
        </>
      )}
      {d.status !== 'data' && (
        <p className={styles.noteText}>
          {d.note}{' '}
          {d.frontMatterUrl && (
            <a href={d.frontMatterUrl} target="_blank" rel="noopener noreferrer">
              View front matter →
            </a>
          )}
          {d.status === 'tokens' && d.sourceUrl && (
            <>
              {' · '}
              <a href={d.sourceUrl} target="_blank" rel="noopener noreferrer">
                token inventory →
              </a>
            </>
          )}
        </p>
      )}
    </div>
  );
}

/** Per-dictionary directory: a section for every catalogued dictionary, with-data first. */
export function AbbreviationDirectory() {
  const order = {data: 0, tokens: 1, none: 2};
  const dicts = [...data.dicts].sort(
    (a, b) => order[a.status] - order[b.status] || a.code.localeCompare(b.code),
  );
  return (
    <div>
      {dicts.map((d) => (
        <DictAbbreviations key={d.code} code={d.code} />
      ))}
    </div>
  );
}

/** Headline counts for the page intro. */
export function AbbreviationSummary() {
  const c = data.counts;
  return (
    <p className={styles.summary}>
      <strong>{c.withData}</strong> of {c.total} catalogued dictionaries have a machine-readable
      abbreviation legend transcribed here; <strong>{c.none + c.tokensOnly}</strong> keep theirs in
      scanned front matter (linked below).
    </p>
  );
}
