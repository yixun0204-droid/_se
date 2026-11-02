import { DEFAULT_PREFERENCES } from '../preferences.js';
import { EMERGENCY_NOTE } from '../safety/resources.js';
import { esc, hotlineCards, searchForm, statRow } from './common.js';
import { layout } from './layout.js';

const EXAMPLES = ['資料庫', '睡眠品質', '壓力調適', '網路安全', '時間管理'];

export function renderHome({ documents, preferences = DEFAULT_PREFERENCES }) {
  const categories = [...new Set(documents.map((document) => document.category))];

  const content = `
  <section class="hero">
    <p class="eyebrow">公平、透明、以人為本</p>
    <h1>同樣的查詢，<br>每個人看到同樣的結果。</h1>
    <p class="hero-lead">安心搜尋不使用你的偏好、瀏覽紀錄、位置或裝置來調整排序。當搜尋內容可能與自我傷害或嚴重情緒困擾有關時，系統會先停下來，提供立即的關心與求助資源。</p>
    ${searchForm({ large: true })}
    <div class="example-row">
      <span>試試看：</span>
      ${EXAMPLES.map(
        (query) =>
          `<a class="chip" href="/search?q=${encodeURIComponent(query)}">${esc(query)}</a>`,
      ).join('')}
    </div>
  </section>

  <section class="feature-grid">
    <article class="feature-card">
      <span class="feature-icon">01</span>
      <h2>不受偏好影響的排序</h2>
      <p>排序只根據查詢字詞與文件內容的 TF-IDF 餘弦相似度，同分時依文件編號排序。偏好設定只影響外觀。</p>
      <a href="/about">了解演算法</a>
    </article>
    <article class="feature-card">
      <span class="feature-icon">02</span>
      <h2>敏感搜尋的即時關懷</h2>
      <p>偵測到自殺、自我傷害、嚴重情緒困擾等關鍵字時，先顯示求助資源，而不是一般搜尋結果。</p>
      <a href="/help">查看求助資源</a>
    </article>
    <article class="feature-card">
      <span class="feature-icon">03</span>
      <h2>可驗證的透明規則</h2>
      <p>每一筆結果都顯示分數與命中詞，並公開說明使用了哪些資料、沒有使用哪些資料。</p>
      <a href="/about">閱讀設計說明</a>
    </article>
  </section>

  <section class="panel">
    <div class="panel-head">
      <h2>目前索引</h2>
      <span class="muted">共 ${documents.length} 篇文件</span>
    </div>
    ${statRow([
      { value: documents.length, label: '文件' },
      { value: categories.length, label: '分類' },
      { value: 0, label: '個人化訊號' },
    ])}
    <div class="category-row">${categories
      .map((category) => `<span class="chip chip-static">${esc(category)}</span>`)
      .join('')}</div>
  </section>

  <section class="panel care-panel">
    <h2>需要幫忙時，不必等到準備好</h2>
    <p>如果你現在正經歷難以承受的情緒，或身邊的人有立即危險，請先聯絡專業資源。</p>
    ${hotlineCards({ limit: 4 })}
    <p class="emergency-note">${esc(EMERGENCY_NOTE)}</p>
  </section>
  `;

  return layout({ title: '首頁', preferences, active: '/', content });
}
