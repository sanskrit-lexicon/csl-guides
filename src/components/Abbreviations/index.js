import React from 'react';
import data from '@site/src/data/abbreviations.json';
import prefLegends from '@site/src/data/pref-legends.json';
import styles from './styles.module.css';

// Rendered from the generated src/data/abbreviations.json (npm run build:abbreviations)
// and, for PWG/PW pilot, src/data/pref-legends.json (npm run build:pref-legends from
// scripts/out/*_legend.json — UC-1 / H1593). Do not hand-edit either data file.

/** Dict codes that render from the pref legend store (body counts + residual class). */
const PREF_LEGEND_CODES = new Set(prefLegends.dicts || prefLegends.pilot || []);

function dictByCode(code) {
  return data.dicts.find((d) => d.code === code);
}

function prefLegendByCode(code) {
  const upper = (code || '').toUpperCase();
  return prefLegends.by_dict?.[upper] || null;
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

/** Pref-legend list: key → expansion + body citation count, sorted by body_count desc. */
function PrefLegendList({label, rows, sortByBody = true}) {
  if (!rows || !rows.length) return null;
  const ordered = sortByBody
    ? [...rows].sort((a, b) => (b.body_count || 0) - (a.body_count || 0) || a.key.localeCompare(b.key))
    : rows;
  const shown = ordered.slice(0, CAP);
  const overflow = ordered.length - shown.length;
  const body = (
    <>
      <table className={styles.list}>
        <thead>
          <tr>
            <th className={styles.colAbbr}>Abbr.</th>
            <th className={styles.colExp}>Expansion (pref)</th>
            <th className={styles.colBody} title="Body citation attestation count">Body</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((r) => (
            <tr key={r.key}>
              <td className={styles.abbr}>{r.key}</td>
              <td>
                {r.expansion || <span className={styles.muted}>—</span>}
                {r.residual_class && (
                  <span className={styles.residual} title="pref_only residual class">
                    {' '}
                    {r.residual_class}
                  </span>
                )}
                {r.review_required && r.class === 'work' && (
                  <span className={styles.reviewHint} title="work_id is provisional (R8)">
                    {' '}
                    review
                  </span>
                )}
              </td>
              <td className={styles.bodyCount}>
                {(r.body_count || 0).toLocaleString('en-US')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {overflow > 0 && (
        <p className={styles.more}>
          + {overflow} more in the legend store (top {CAP} by body citation count shown).
        </p>
      )}
    </>
  );
  return (
    <div className={styles.listBlock}>
      <p className={styles.listLabel}>
        {label} <span className={styles.count}>{ordered.length}</span>
      </p>
      {shown.length > 30 ? (
        <details open={false}>
          <summary>
            Show {shown.length === ordered.length ? `${ordered.length}` : `top ${shown.length} of ${ordered.length}`} by body count
          </summary>
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
 * PWG/PW pilot: render from pref legend store (pref OCR × body counts), not the
 * large issue74/pwbib bibliography alone. UC-1 ranked works + expansion panel.
 */
function PrefDictAbbreviations({code, level = 'h3', headless = false, catalog}) {
  const legend = prefLegendByCode(code);
  if (!legend) return null;
  const Heading = level;
  const d = catalog;
  const works = legend.rows.filter((r) => r.class === 'work');
  const grammar = legend.rows.filter((r) => r.class === 'grammar');
  const meta = legend.rows.filter((r) => r.class === 'meta' || r.class === 'unknown');
  const withBody = legend.rows.filter((r) => (r.body_count || 0) > 0).length;
  const prefOnly = legend.rows.length - withBody;

  return (
    <div className={styles.dict}>
      {!headless && d && (
        <Heading id={`dict-${code.toLowerCase()}`}>
          {d.fullTitle} {d.year && <span className={styles.year}>{d.year}</span>}{' '}
          <span className={styles.code}>{code}</span>
          <span className={`${styles.badge} ${styles.badgePref}`}>pref legend · body counts</span>
        </Heading>
      )}
      {headless && (
        <p className={styles.prefBanner}>
          <span className={`${styles.badge} ${styles.badgePref}`}>pref legend</span>
          {' '}
          Preface abbreviation legend joined to body <code>&lt;ls&gt;</code> counts
          ({legend.n} keys · {withBody} attested in body · {prefOnly} pref-only residual).
          Sorted by citation frequency.
        </p>
      )}
      {!headless && (
        <div className={styles.meta}>
          <span className={styles.source}>
            pref legend store · {legend.n} keys · {withBody} with body attestation · sorted by body count
          </span>
        </div>
      )}
      <PrefLegendList label="Literary sources (pref × body)" rows={works} />
      <PrefLegendList label="Grammatical & general" rows={grammar} />
      <PrefLegendList label="Meta / unclassified" rows={meta} />
      {d?.frontMatterUrl && (
        <p className={styles.more}>
          <a href={d.frontMatterUrl} target="_blank" rel="noopener noreferrer">
            Front matter index →
          </a>
          {' · '}
          <a
            href="https://github.com/sanskrit-lexicon/csl-guides/blob/main/scripts/out/README.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            legend store provenance
          </a>
        </p>
      )}
    </div>
  );
}

/**
 * One dictionary's abbreviation section. Used by the directory (with its title heading)
 * and embedded on each dictionary's deep page (`headless` — the page already has the title,
 * so only the source link + lists / front-matter note render).
 *
 * PWG and PW pilot: prefer pref-legends.json (UC-1). All other codes use abbreviations.json.
 */
export function DictAbbreviations({code, level = 'h3', headless = false}) {
  const upper = (code || '').toUpperCase();
  const d = dictByCode(upper);
  if (PREF_LEGEND_CODES.has(upper) && prefLegendByCode(upper)) {
    return (
      <PrefDictAbbreviations
        code={upper}
        level={level}
        headless={headless}
        catalog={d}
      />
    );
  }
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

/** Per-dictionary directory: a full section for each dictionary that has a transcribed
 *  legend (and the tokens-only dictionary). Scan-only ones are listed by ScanOnlyList. */
export function AbbreviationDirectory() {
  const order = {data: 0, tokens: 1};
  // Prefer pref-legend pilot codes even if they also appear in abbreviations.json
  const codes = new Set();
  const dicts = [];
  for (const code of PREF_LEGEND_CODES) {
    if (prefLegendByCode(code)) {
      codes.add(code);
      dicts.push({code, status: 'data', pref: true});
    }
  }
  for (const d of data.dicts) {
    if (d.status === 'none' || codes.has(d.code)) continue;
    codes.add(d.code);
    dicts.push(d);
  }
  dicts.sort((a, b) => {
    if (a.pref && !b.pref) return -1;
    if (!a.pref && b.pref) return 1;
    return (order[a.status] ?? 9) - (order[b.status] ?? 9) || a.code.localeCompare(b.code);
  });
  return (
    <div>
      {dicts.map((d) => (
        <DictAbbreviations key={d.code} code={d.code} />
      ))}
    </div>
  );
}

/** The dictionaries whose legend is not transcribed anywhere yet — only scanned front matter. */
export function ScanOnlyList() {
  const dicts = data.dicts
    .filter((d) => d.status === 'none' && !PREF_LEGEND_CODES.has(d.code))
    .sort((a, b) => a.code.localeCompare(b.code));
  return (
    <ul className={styles.scanList}>
      {dicts.map((d) => (
        <li key={d.code}>
          <span className={styles.code}>{d.code}</span> {d.fullTitle}
          {d.year ? ` (${d.year})` : ''} —{' '}
          {d.frontMatterUrl ? (
            <a href={d.frontMatterUrl} target="_blank" rel="noopener noreferrer">
              front matter
            </a>
          ) : (
            <span className={styles.muted}>no front matter linked</span>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Headline counts for the page intro. */
export function AbbreviationSummary() {
  const c = data.counts;
  const prefN = (prefLegends.dicts || []).length;
  return (
    <p className={styles.summary}>
      <strong>{c.withData}</strong> of {c.total} catalogued dictionaries have a machine-readable
      abbreviation legend transcribed here; <strong>{c.none + c.tokensOnly}</strong> keep theirs in
      scanned front matter (linked below).
      {prefN > 0 && (
        <>
          {' '}
          Pilot: <strong>PWG</strong> and <strong>PW</strong> also show the preface legend store
          joined to body citation counts ({prefLegends.n_total} keys).
        </>
      )}
    </p>
  );
}
