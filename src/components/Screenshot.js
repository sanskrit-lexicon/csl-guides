import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

// Shared screenshot wrapper for the guides. Resolves the src against the site
// baseUrl, carries intrinsic width/height to avoid layout shift, and lazy-loads.
// Usage in any .mdx page:
//   import Screenshot from '@site/src/components/Screenshot';
//   <Screenshot src="/img/displays/frontpage.png" alt="…" width={1280} height={1500} />
export default function Screenshot({src, alt, width, height}) {
  return (
    <img
      src={useBaseUrl(src)}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      className="csl-shot"
      style={{
        border: '1px solid var(--ifm-color-emphasis-300)',
        borderRadius: '8px',
        maxWidth: '100%',
        height: 'auto',
        marginTop: '0.5rem',
      }}
    />
  );
}
