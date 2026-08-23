// Pure query-expansion core (H3340). Environment-free: takes the expansions
// map as a parameter so Node scripts and the browser bundle share one code
// path. The browser wiring lives in normalizeQuery.mjs (static JSON import,
// which webpack bundles); Node callers read the JSON themselves.
//
// Expands user query tokens through the vendored SanskritSpellCheck reform-map
// subset so a query typed in one spelling era also matches gloss text spelled
// in the other: "Thier" finds pages about "Tier", "августъ" finds "август".
// Search-normalization, never correction — only the QUERY grows OR-branches;
// the index is untouched.

const MAX_ALIASES_PER_TOKEN = 8;

export function makeExpandToken(expansions) {
  return function expandToken(token) {
    const lower = token.toLowerCase();
    const aliases = expansions[lower];
    if (!aliases || aliases.length === 0) return [token];
    // Keep the typed form first so exact matches keep their ranking edge, then
    // the modern/older spellings from the upstream map.
    return [token, ...aliases.filter((a) => a !== lower).slice(0, MAX_ALIASES_PER_TOKEN)];
  };
}

export function makeOrthoQueryNormalizer(expansions) {
  const expandToken = makeExpandToken(expansions);
  // Splits the raw query on whitespace and expands each word; punctuation-only
  // chunks pass through untouched. lunr's default combiner is OR, so extra
  // branches only ADD candidate documents — exact-term ranking is preserved.
  return function normalizeOrthoQuery(query) {
    if (!query) return query;
    return String(query)
      .split(/(\s+)/)
      .map((chunk) => {
        if (/^\s*$/.test(chunk)) return chunk;
        const word = chunk.replace(/[^\p{L}\p{N}_-]+$/u, '');
        const rest = chunk.slice(word.length);
        if (!word) return chunk;
        return expandToken(word).join(' ') + rest;
      })
      .join('');
  };
}
