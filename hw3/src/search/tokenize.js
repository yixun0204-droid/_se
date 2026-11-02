const CJK_RUN = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]+/g;
const LATIN_WORD = /[a-z0-9]+/g;

export function normalizeText(input) {
  return String(input ?? '').normalize('NFKC').toLowerCase();
}

export function tokenize(input) {
  const text = normalizeText(input);
  const tokens = [];

  for (const match of text.matchAll(LATIN_WORD)) {
    tokens.push(match[0]);
  }

  for (const run of text.match(CJK_RUN) ?? []) {
    const chars = [...run];
    if (chars.length === 1) {
      tokens.push(chars[0]);
      continue;
    }
    for (let i = 0; i < chars.length - 1; i++) {
      tokens.push(chars[i] + chars[i + 1]);
    }
  }

  return tokens;
}
