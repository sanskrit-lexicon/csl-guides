import React from 'react';
import data from '@site/src/data/dictionaries.json';

// Single source of truth for the live CDSL site version. It is scraped from the
// front page by scripts/build-catalog.mjs into src/data/dictionaries.json
// (the `siteVersion` field) and surfaced here so the docs never hard-code it in
// several places that can drift. Usage in any .mdx page:
//   import SiteVersion from '@site/src/components/SiteVersion';
//   … version <SiteVersion />.
export default function SiteVersion() {
  return <>{data.siteVersion || '2.9.0'}</>;
}
