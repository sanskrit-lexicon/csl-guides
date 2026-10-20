// Shared byte hashing for the SHARED_CODE §24 edge contracts (bug hunt 19.10.2026, A1).
//
// Why this module exists. build-corpus-frequency.mjs pinned the SHA-256 of the
// upstream TSV by hashing the bytes of whatever copy happened to sit in the
// build machine's working tree. kosha declares `* text=auto eol=lf`, but git
// never rewrites a file that is already checked out when that rule appears: the
// TSV kept its old CRLF bytes until something resynced it, so the pin recorded a
// CRLF hash upstream never committed. The contract was then red on every correct
// checkout for 58 days and green only on the one machine that took the pin.
//
// The fix is to hash the form upstream's own .gitattributes declares canonical:
// line endings normalised to LF. Doing it at the byte level means nothing is
// re-encoded, so the only bytes that can change are CRLF pairs.

import {createHash} from 'node:crypto';

// Drop the CR of every CRLF pair. A lone CR (old-Mac line endings) is left
// alone on purpose: git's text normalisation rewrites CRLF only, so a lone CR is
// real content, not a line ending to fold.
export function stripCrlf(buf) {
  const out = Buffer.allocUnsafe(buf.length);
  let j = 0;
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] === 0x0d && buf[i + 1] === 0x0a) continue; // CR of CRLF
    out[j++] = buf[i];
  }
  return out.subarray(0, j);
}

// SHA-256 of `input` with line endings normalised to LF. Accepts a Buffer or a
// string; a string is encoded as UTF-8 first.
export function sha256Lf(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf8');
  return createHash('sha256').update(stripCrlf(buf)).digest('hex');
}
