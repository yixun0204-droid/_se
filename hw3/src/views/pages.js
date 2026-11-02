import { DEFAULT_PREFERENCES, DENSITIES, THEMES } from '../preferences.js';
import {
  CARE_STEPS,
  DISTRESS_STEPS,
  EMERGENCY_NOTE,
  PHYSICAL_STEPS,
} from '../safety/resources.js';
import { esc, hotlineCards } from './common.js';
import { layout } from './layout.js';

function stepList(steps) {
  return `<ol class="step-list">${steps.map((step) => `<li>${esc(step)}</li>`).join('')}</ol>`;
}

export function renderAbout({ preferences = DEFAULT_PREFERENCES }) {
  const content = `
  <section class="page-header">
    <p class="eyebrow">演算法說明</p>
    <h1>為什麼每個人看到的排序都一樣？</h1>
    <p class="hero-lead">安心搜尋刻意不做個人化。排序結果只取決於「你打了什麼字」與「文件裡有什麼內容」，與你是誰、你的偏好、你過去搜尋過什麼都無關。</p>
  </section>

  <section class="panel">
    <h2>使用的資料</h2>
    <div class="two-col">
      <div>
        <h3>會影響排序</h3>
        <ul class="check-list">
          <li>查詢字詞本身</li>
          <li>文件標題（權重 3）</li>
          <li>文件標籤與分類（權重 2）</li>
          <li>文件內容（權重 1）</li>
          <li>全體文件的詞頻與逆文件頻率（IDF）</li>
          <li>同分時的文件編號（固定由小到大）</li>
        </ul>
      </div>
      <div>
        <h3>不會影響排序</h3>
        <ul class="cross-list">
          <li>使用者偏好設定</li>
          <li>瀏覽紀錄與搜尋歷史</li>
          <li>地理位置與裝置</li>
          <li>時間、熱門度或廣告</li>
          <li>帳號、身分或個人檔案</li>
          <li>任何即時回饋或點擊行為</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="panel">
    <h2>演算法步驟</h2>
    <ol class="step-list">
      <li>將查詢與文件轉為小寫並正規化。</li>
      <li>中文以相鄰二字詞（bigram）切分，英文與數字以單詞切分。</li>
      <li>依標題、標籤、分類、內容的固定權重計算詞頻 TF。</li>
      <li>以 IDF = ln((N + 1) / (df + 1)) + 1 計算每個詞的重要性。</li>
      <li>將查詢與文件表示為 TF-IDF 向量，計算餘弦相似度。</li>
      <li>依分數由高到低排序；分數相同時，依文件編號由小到大排序。</li>
    </ol>
    <pre class="formula">score(q, d) = (q · d) / (|q| × |d|)

q：查詢的 TF-IDF 向量
d：文件的 TF-IDF 向量
|q|、|d|：向量長度
同分排序：document.id 由小到大</pre>
  </section>

  <section class="panel">
    <h2>如何驗證？</h2>
    <p>偏好設定頁面可以切換主題、密度與是否顯示分數，但這些設定只改變畫面外觀。你可以用兩個不同的瀏覽器設定搜尋同一個關鍵字，結果的順序與分數會完全相同。系統也提供 <code>/api/search?q=關鍵字</code>，回應中固定標示 <code>personalization: false</code> 與 <code>preferencesUsed: false</code>。</p>
    <p>這個設計的取捨是：無法針對個別使用者調整結果，但能得到可預測、可比較、可稽核的搜尋結果。</p>
  </section>

  <section class="panel">
    <h2>敏感搜尋的處理</h2>
    <p>系統在排序之前會先進行安全偵測。若查詢包含自殺、自我傷害、傷害他人等關鍵字，會先顯示求助資源，而不是一般結果頁。這是唯一會改變「看到什麼」的規則，而且它對所有使用者一視同仁，不因個人偏好而不同。</p>
    <p>偵測採關鍵字比對，會先進行 NFKC 正規化、去除空白與標點，以降低「自 殺」這類規避寫法的漏判；同時加入少量排除詞，降低「想死你了」、「自殺突擊隊」等誤判。關鍵字法仍有其限制，無法完全取代專業判斷。</p>
  </section>

  <section class="panel">
    <h2>隱私</h2>
    <p>本系統不建立使用者帳號、不記錄搜尋紀錄、不寫入查詢日誌。偏好設定只儲存在瀏覽器 Cookie 中，用於外觀呈現。伺服器不會將查詢內容持久化。</p>
  </section>
  `;

  return layout({ title: '演算法說明', preferences, active: '/about', content });
}

export function renderHelp({ preferences = DEFAULT_PREFERENCES }) {
  const content = `
  <section class="page-header">
    <p class="eyebrow">求助資源</p>
    <h1>你值得被好好接住。</h1>
    <p class="hero-lead">無論是情緒、身體或人身安全，尋求幫助都不是軟弱。以下資源可以立即使用；如果你或身邊的人有立即危險，請先撥打 119 或 110。</p>
  </section>

  <section class="panel">
    <h2>24 小時與主要專線</h2>
    ${hotlineCards()}
    <p class="emergency-note">${esc(EMERGENCY_NOTE)}</p>
  </section>

  <section class="panel">
    <h2>如果你正有傷害自己的念頭</h2>
    ${stepList(CARE_STEPS)}
  </section>

  <section class="panel">
    <h2>如果你正被情緒淹沒</h2>
    ${stepList(DISTRESS_STEPS)}
  </section>

  <section class="panel">
    <h2>如果身體出現持續不適</h2>
    ${stepList(PHYSICAL_STEPS)}
  </section>

  <section class="panel">
    <h2>如何陪伴身邊的人</h2>
    <ul class="check-list">
      <li>先傾聽，不急著給建議，也不急著評價對方的感受。</li>
      <li>直接而溫和地詢問：「你最近還好嗎？有沒有想過傷害自己？」</li>
      <li>不要承諾保密到危及安全的程度；必要時陪同對方尋求專業協助。</li>
      <li>如果對方有立即危險，留在身邊並撥打 119 或 110。</li>
      <li>陪伴者也需要支持，可以一起使用專線或尋求諮商。</li>
    </ul>
  </section>

  <section class="panel">
    <h2>什麼時候該就醫或尋求專業協助？</h2>
    <ul class="check-list">
      <li>情緒低落、焦慮或失眠持續數週，並影響日常生活。</li>
      <li>出現傷害自己或他人的念頭、計畫或行為。</li>
      <li>身體不適持續惡化，或出現意識不清、劇烈疼痛等警訊。</li>
      <li>身邊的人表達絕望、告別或交代後事等訊息。</li>
    </ul>
  </section>
  `;

  return layout({ title: '求助資源', preferences, active: '/help', content });
}

function radioGroup({ name, label, options, value }) {
  return `<fieldset class="field-group">
    <legend>${esc(label)}</legend>
    <div class="radio-row">
      ${options
        .map(
          (option) => `<label class="radio-card">
        <input type="radio" name="${esc(name)}" value="${esc(option.value)}" ${
          option.value === value ? 'checked' : ''
        }>
        <span>
          <strong>${esc(option.label)}</strong>
          <small>${esc(option.hint)}</small>
        </span>
      </label>`,
        )
        .join('')}
    </div>
  </fieldset>`;
}

export function renderPreferences({
  preferences = DEFAULT_PREFERENCES,
  ok = '',
  err = '',
}) {
  const content = `
  <section class="page-header">
    <p class="eyebrow">偏好設定</p>
    <h1>這裡的設定只改變外觀。</h1>
    <p class="hero-lead">安心搜尋不提供個人化排序。以下偏好不會影響搜尋結果的順序、篩選或危機偵測；它們只會改變主題、密度與是否顯示分數。</p>
  </section>

  <form class="panel form" method="post" action="/preferences">
    ${radioGroup({
      name: 'theme',
      label: '主題',
      value: preferences.theme,
      options: THEMES.map((theme) => ({
        value: theme,
        label: theme === 'dark' ? '深色' : '淺色',
        hint: theme === 'dark' ? '降低夜間螢幕亮度' : '預設的明亮介面',
      })),
    })}
    ${radioGroup({
      name: 'density',
      label: '結果密度',
      value: preferences.density,
      options: DENSITIES.map((density) => ({
        value: density,
        label: density === 'compact' ? '緊湊' : '寬鬆',
        hint: density === 'compact' ? '縮小間距，一頁看到更多' : '較大的間距，閱讀較輕鬆',
      })),
    })}
    <label class="check-row">
      <input type="checkbox" name="showScores" value="1" ${
        preferences.showScores ? 'checked' : ''
      }>
      <span>在搜尋結果顯示相似度分數</span>
    </label>
    <div class="form-actions">
      <button class="btn btn-primary" type="submit">儲存偏好</button>
      <a class="btn btn-ghost" href="/">回到首頁</a>
    </div>
  </form>

  <section class="panel">
    <h2>目前設定</h2>
    <ul class="check-list">
      <li>主題：${esc(preferences.theme === 'dark' ? '深色' : '淺色')}</li>
      <li>密度：${esc(preferences.density === 'compact' ? '緊湊' : '寬鬆')}</li>
      <li>顯示分數：${preferences.showScores ? '是' : '否'}</li>
    </ul>
    <p class="muted">偏好儲存在瀏覽器 Cookie 中，不會上傳到伺服器資料庫，也不會參與搜尋排序。</p>
  </section>

  <section class="panel">
    <h2>想確認排序真的沒變？</h2>
    <p>切換偏好後，用同一個關鍵字搜尋，或直接開啟 <code>/api/search?q=健康</code>。結果的順序與分數不會因為偏好而改變。</p>
    <div class="crisis-actions">
      <a class="btn btn-ghost" href="/search?q=健康">搜尋「健康」</a>
      <a class="btn btn-ghost" href="/api/search?q=健康">查看 JSON</a>
    </div>
  </section>
  `;

  return layout({
    title: '偏好設定',
    preferences,
    active: '/preferences',
    content,
    ok,
    err,
  });
}
