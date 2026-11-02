import { DEFAULT_PREFERENCES } from '../preferences.js';
import { careBanner, esc, searchForm } from './common.js';
import { layout } from './layout.js';

function resultCard(item, showScores) {
  const document = item.document;
  const snippet =
    document.content.length > 180
      ? `${document.content.slice(0, 180)}…`
      : document.content;

  return `<article class="result">
    <div class="result-head">
      <h2>${esc(document.title)}</h2>
      <span class="chip chip-static">${esc(document.category)}</span>
    </div>
    <p class="result-snippet">${esc(snippet)}</p>
    <div class="result-meta">
      ${document.tags.map((tag) => `<span class="tag">#${esc(tag)}</span>`).join('')}
      ${showScores ? `<span class="score">相似度 ${esc(item.score.toFixed(4))}</span>` : ''}
    </div>
    <details class="why">
      <summary>為什麼會看到這則結果？</summary>
      <p>命中詞：${
        item.matchedTerms.map((term) => `<code>${esc(term)}</code>`).join('、') || '—'
      }</p>
      <p>分數：${esc(item.score.toFixed(6))}（TF-IDF 餘弦相似度，未使用任何個人偏好）</p>
    </details>
  </article>`;
}

export function renderResults({
  query,
  safety,
  results,
  preferences = DEFAULT_PREFERENCES,
  acknowledged = false,
}) {
  const showScores = preferences.showScores !== false;

  const content = `
  <div class="results-top">
    ${searchForm({ query })}
    <p class="result-count">「${esc(query)}」共有 ${results.length} 筆結果 · 排序僅使用查詢與文件內容</p>
  </div>

  ${safety.flagged ? careBanner({ severity: safety.severity, acknowledged, categories: safety.categories }) : ''}

  <div class="preference-note">
    <strong>排序不受偏好影響。</strong>
    <span>目前偏好：主題 ${esc(preferences.theme === 'dark' ? '深色' : '淺色')}、密度 ${esc(
      preferences.density === 'compact' ? '緊湊' : '寬鬆',
    )}。這些設定只影響外觀。</span>
    <a href="/preferences">調整偏好</a>
  </div>

  <section class="result-list">
    ${
      results.length === 0
        ? `<div class="empty-state"><h2>找不到符合的結果</h2><p>試試更短的關鍵字，或更換同義詞。</p></div>`
        : results.map((item) => resultCard(item, showScores)).join('')
    }
  </section>
  `;

  return layout({ title: `搜尋：${query}`, preferences, active: '/search', content });
}
