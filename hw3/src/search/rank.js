import { tokenize } from './tokenize.js';

export function rankDocuments(query, index) {
  const terms = [...new Set(tokenize(query))].filter((term) => index.idf.has(term));
  if (terms.length === 0) return [];

  const queryVector = new Map();
  let querySumSquares = 0;
  for (const term of terms) {
    const weight = index.idf.get(term);
    queryVector.set(term, weight);
    querySumSquares += weight * weight;
  }
  const queryNorm = Math.sqrt(querySumSquares) || 1;

  const results = [];
  for (const entry of index.entries) {
    let dotProduct = 0;
    const matchedTerms = [];

    for (const term of terms) {
      const documentWeight = entry.vector.get(term);
      if (!documentWeight) continue;
      dotProduct += documentWeight * queryVector.get(term);
      matchedTerms.push(term);
    }

    if (dotProduct <= 0) continue;

    results.push({
      document: entry.document,
      score: dotProduct / (entry.norm * queryNorm),
      matchedTerms,
    });
  }

  results.sort(
    (left, right) =>
      right.score - left.score || left.document.id.localeCompare(right.document.id),
  );

  return results;
}
