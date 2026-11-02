import { tokenize } from './tokenize.js';

const FIELD_WEIGHTS = {
  title: 3,
  tags: 2,
  category: 2,
  content: 1,
};

function fieldText(document, field) {
  const value = document[field];
  if (Array.isArray(value)) return value.join(' ');
  return String(value ?? '');
}

export function buildIndex(documents) {
  if (!Array.isArray(documents) || documents.length === 0) {
    throw new Error('搜尋索引至少需要一篇文件');
  }

  const raw = documents.map((document) => {
    const counts = new Map();
    for (const [field, weight] of Object.entries(FIELD_WEIGHTS)) {
      for (const token of tokenize(fieldText(document, field))) {
        counts.set(token, (counts.get(token) ?? 0) + weight);
      }
    }
    return { document, counts };
  });

  const documentFrequency = new Map();
  for (const entry of raw) {
    for (const token of entry.counts.keys()) {
      documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1);
    }
  }

  const total = raw.length;
  const idf = new Map();
  for (const [token, frequency] of documentFrequency) {
    idf.set(token, Math.log((total + 1) / (frequency + 1)) + 1);
  }

  const entries = raw.map(({ document, counts }) => {
    const vector = new Map();
    let sumSquares = 0;
    for (const [token, termFrequency] of counts) {
      const weight = termFrequency * (idf.get(token) ?? 0);
      vector.set(token, weight);
      sumSquares += weight * weight;
    }
    return {
      document,
      vector,
      norm: Math.sqrt(sumSquares) || 1,
    };
  });

  return { entries, idf, size: entries.length };
}
