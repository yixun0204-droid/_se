import { CATEGORY_META, EXCLUSIONS, KEYWORD_GROUPS } from './keywords.js';

export function normalizeForMatch(input) {
  const normalized = String(input ?? '').normalize('NFKC').toLowerCase();
  return {
    spaced: normalized.replace(/\s+/g, ' ').trim(),
    compact: normalized.replace(/[^\p{L}\p{N}]+/gu, ''),
  };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isLatinKeyword(keyword) {
  return /^[a-z0-9][a-z0-9' -]*$/.test(keyword);
}

function stripExclusions(compact) {
  let result = compact;
  for (const phrase of EXCLUSIONS) {
    result = result.split(phrase).join(' ');
  }
  return result;
}

function matchesKeyword(keyword, spaced, compact) {
  if (isLatinKeyword(keyword)) {
    const parts = keyword.trim().split(/\s+/).map(escapeRegExp);
    const pattern = new RegExp(`(^|[^a-z0-9])${parts.join('\\s+')}([^a-z0-9]|$)`);
    return pattern.test(spaced);
  }
  return compact.includes(keyword.replace(/\s+/g, ''));
}

export function detectSafety(input) {
  const { spaced, compact } = normalizeForMatch(input);
  const searchableCompact = stripExclusions(compact);
  const matches = [];
  const categories = new Map();

  for (const group of KEYWORD_GROUPS) {
    for (const keyword of group.keywords) {
      if (!matchesKeyword(keyword, spaced, searchableCompact)) continue;
      matches.push({ category: group.category, keyword });
      if (!categories.has(group.category)) {
        categories.set(group.category, CATEGORY_META[group.category]);
      }
    }
  }

  let severity = 'none';
  if (matches.length > 0) {
    severity = 'concern';
    for (const category of categories.keys()) {
      if (CATEGORY_META[category].severity === 'critical') {
        severity = 'critical';
        break;
      }
    }
  }

  return {
    flagged: matches.length > 0,
    severity,
    categories: [...categories.entries()].map(([id, meta]) => ({
      id,
      label: meta.label,
      severity: meta.severity,
    })),
    matches,
  };
}
