import React from 'react';
import Link from '@docusaurus/Link';

// Audience-oriented landing cards for the home page.

const FEATURES = [
  {
    title: 'Using the Site',
    emoji: '🔎',
    to: '/users/using-the-website',
    body: 'Look up words, the B/L/A/M display modes, transliteration schemes, downloads, and scans.',
  },
  {
    title: 'Dictionaries',
    emoji: '📚',
    to: '/dictionaries/overview',
    body: 'The auto-generated catalog of 43 dictionaries, abbreviations, and citation conventions.',
  },
  {
    title: 'Tools',
    emoji: '🛠️',
    to: '/tools/overview',
    body: 'Simple-Search, Advanced search, the multi-dictionary display, MW inflected forms, offline/StarDict.',
  },
  {
    title: 'Contributing',
    emoji: '✍️',
    to: '/contributing/overview',
    body: 'Report and submit corrections via the change-file workflow and the GitHub issue taxonomy.',
  },
  {
    title: 'Developers',
    emoji: '⚙️',
    to: '/developers/architecture',
    body: 'Repository map, the generation pipeline, source/XML data formats, and the REST + Salt API.',
  },
  {
    title: 'Live site ↗',
    emoji: '🌐',
    href: 'https://sanskrit-lexicon.uni-koeln.de',
    body: 'Open the Cologne Digital Sanskrit Dictionaries website itself.',
  },
];

function Card({f}) {
  const inner = (
    <>
      <div style={{fontSize: '1.6rem', lineHeight: 1}}>{f.emoji}</div>
      <h3 style={{margin: '0.6rem 0 0.3rem'}}>{f.title}</h3>
      <p style={{margin: 0, opacity: 0.85, fontSize: '0.95rem'}}>{f.body}</p>
    </>
  );
  const style = {
    display: 'block',
    border: '1px solid var(--ifm-color-emphasis-200)',
    borderRadius: 'var(--ifm-card-border-radius, 8px)',
    padding: '1.1rem 1.2rem',
    height: '100%',
    color: 'inherit',
    textDecoration: 'none',
    transition: 'border-color 0.2s, transform 0.2s',
  };
  return f.href ? (
    <a href={f.href} target="_blank" rel="noreferrer" style={style} className="csl-card">{inner}</a>
  ) : (
    <Link to={f.to} style={style} className="csl-card">{inner}</Link>
  );
}

export default function HomepageFeatures() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        margin: '1.5rem 0',
      }}
    >
      {FEATURES.map((f) => (
        <Card key={f.title} f={f} />
      ))}
    </div>
  );
}
