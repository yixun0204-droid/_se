import { DEFAULT_PREFERENCES } from '../preferences.js';
import { CARE_STEPS, EMERGENCY_NOTE } from '../safety/resources.js';
import { esc, hotlineCards } from './common.js';
import { layout } from './layout.js';

export function renderSafety({
  query,
  safety,
  preferences = DEFAULT_PREFERENCES,
  acknowledged = false,
}) {
  const labels = safety.categories.map((category) => category.label).join('、');

  const content = `
  <section class="crisis">
    <div class="crisis-main">
      <p class="eyebrow">我們在乎你</p>
      <h1>你不需要一個人面對。</h1>
      <p class="crisis-lead">你剛剛的搜尋${
        labels ? `與「${esc(labels)}」有關` : '讓我們想先停下來關心你'
      }。無論你現在經歷什麼，你的感受都值得被重視。</p>
      <p>如果此刻你有傷害自己的念頭，請先讓自己離開可能造成傷害的物品或場所，並聯絡一位你信任的人。你也可以直接撥打下面的專線，會有人願意聽你說。</p>
      <div class="crisis-actions">
        <a class="btn btn-primary btn-lg" href="tel:1925">撥打 1925 安心專線</a>
        <a class="btn btn-ghost btn-lg" href="tel:1995">撥打 1995 生命線</a>
      </div>
      <p class="emergency-note">${esc(EMERGENCY_NOTE)}</p>
    </div>
    <aside class="crisis-steps">
      <h2>現在可以做的事</h2>
      <ol>${CARE_STEPS.map((step) => `<li>${esc(step)}</li>`).join('')}</ol>
    </aside>
  </section>

  <section class="panel">
    <div class="panel-head">
      <h2>可以立即聯絡的資源</h2>
      <a href="/help">更多求助資訊</a>
    </div>
    ${hotlineCards()}
  </section>

  <section class="panel continue-panel">
    <h2>你仍然可以查看搜尋結果</h2>
    <p>我們不會阻止你取得資訊。若你現在狀況穩定，也可以繼續查看結果；這頁的求助資源仍會保留在結果頁上方。</p>
    <div class="crisis-actions">
      <a class="btn btn-ghost" href="/search?q=${encodeURIComponent(query)}&amp;ack=1">我了解，繼續查看結果</a>
      <a class="btn btn-ghost" href="/">回到首頁</a>
    </div>
  </section>
  `;

  return layout({ title: '先照顧自己', preferences, active: '/help', content });
}
