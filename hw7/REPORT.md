# HW7 三層測試報告：TaskFlow 任務管理網站

## 摘要

本作業在 `hw7/` 建立一個可直接操作的任務管理網站 **TaskFlow**，並依序補上三種測試：

| 測試層級 | 工具 | 測試數量 | 結果 |
|---|---|---:|---|
| 單元測試（伺服器端必測，客戶端加測） | Node.js 內建 `node:test` | 34 | 34 passed / 0 failed |
| 系統測試（Web API） | `node:test` + `fetch` 呼叫真實 HTTP Server | 17 | 17 passed / 0 failed |
| E2E 測試（無頭瀏覽器） | Playwright + Chromium headless | 7 | 7 passed / 0 failed |
| **合計** |  | **58** | **58 passed / 0 failed** |

網站提供任務的新增、查詢、篩選、狀態流轉（待辦 → 進行中 → 已完成 → 重開）與刪除，並將資料持久化到 JSON 檔。伺服器端以 Node.js 原生 `http` 模組實作，沒有使用 Express 等框架；前端為原生 HTML/CSS/ES Module。選擇 Node.js 的原因是本機環境沒有 Rust toolchain，而作業要求的重點是「伺服器端一定要有單元測試」；本報告的測試分層可直接對應到 Rust/axum 或任何後端語言。

---

## 1. 需求對照

| 作業要求 | 本作業實作 |
|---|---|
| 寫一個網站應用 | TaskFlow 任務管理網站，含完整前端與 REST API |
| 單元測試：server 一定要測 | `test/unit/` 中針對 domain 驗證、統計、篩選與 store 持久化共 28 個伺服器端單元測試 |
| 單元測試：client 可以不測 | 仍額外為前端純函式 `public/client-utils.js` 寫了 6 個單元測試 |
| 系統測試：Web API 測試 | `test/system/api.test.js` 啟動真實 HTTP Server，以 `fetch` 驗證 17 個 API 行為 |
| E2E：無頭瀏覽器、Playwright | `e2e/taskflow.spec.js` 使用 Playwright Chromium headless 驗證 7 個使用者流程 |
| 放在 hw7 | 所有程式、測試、設定與本報告皆位於 `hw7/` |
| 記得寫出報告 | 本文件 |

---

## 2. 系統架構

```text
瀏覽器（HTML/CSS/ES Module）
        │
        │ fetch /api/*
        ▼
Node.js HTTP Server（src/app.js）
        │
        ├── Domain Layer（src/domain/）
        │     ├── task.js      建立、驗證、更新任務
        │     ├── stats.js     統計與篩選
        │     └── errors.js    驗證 / 404 / 400 / 413 錯誤
        │
        └── Store Layer（src/store/task-store.js）
              └── JSON 檔持久化（data/tasks.json）
```

### 2.1 技術選型

| 層級 | 技術 | 說明 |
|---|---|---|
| 伺服器 | Node.js 原生 `http` | 不依賴 Web 框架，降低安裝成本，也讓 API 行為更容易被測試 |
| 資料層 | JSON 檔 + 原子寫入 | 使用暫存檔再 `rename`，避免寫入中斷造成半截檔案 |
| 前端 | 原生 HTML / CSS / ES Module | 以 `data-testid` 提供穩定的 E2E 定位點 |
| 單元 / 系統測試 | Node.js `node:test` + `node:assert/strict` | Node 內建，無額外測試框架 |
| E2E | `@playwright/test` + Chromium | 由 Playwright `webServer` 自動啟動真實伺服器 |

### 2.2 目錄結構

```text
hw7/
├── REPORT.md
├── package.json
├── playwright.config.js
├── server.js
├── data/                       # 執行時產生的 JSON 資料（已 gitignore）
├── public/
│   ├── index.html
│   ├── app.js                  # 前端 DOM 邏輯
│   ├── client-utils.js         # 前端純函式（可單元測試）
│   └── styles.css
├── src/
│   ├── app.js                  # HTTP 路由與靜態檔案
│   ├── http.js                 # JSON body 讀取與回應工具
│   ├── domain/
│   │   ├── errors.js
│   │   ├── stats.js
│   │   └── task.js
│   └── store/
│       └── task-store.js
├── test/
│   ├── unit/
│   │   ├── task.test.js
│   │   ├── stats.test.js
│   │   ├── store.test.js
│   │   └── client-utils.test.js
│   └── system/
│       └── api.test.js
└── e2e/
    └── taskflow.spec.js
```

---

## 3. API 設計

| Method | Path | 說明 | 成功狀態碼 |
|---|---|---|---|
| GET | `/api/health` | 健康檢查 | 200 |
| GET | `/api/tasks` | 列出任務，支援 `status`、`priority`、`q` 篩選 | 200 |
| POST | `/api/tasks` | 新增任務 | 201 |
| GET | `/api/tasks/:id` | 取得單一任務 | 200 |
| PATCH | `/api/tasks/:id` | 部分更新任務 | 200 |
| PUT | `/api/tasks/:id` | 部分更新任務（語意上保留給完整更新） | 200 |
| DELETE | `/api/tasks/:id` | 刪除任務 | 204 |
| DELETE | `/api/tasks` | 清空所有任務（測試 / 示範用） | 204 |
| GET | `/api/stats` | 取得統計 | 200 |

### 3.1 任務欄位

```json
{
  "id": "uuid",
  "title": "完成 HW7 測試報告",
  "description": "整理三層測試結果",
  "priority": "low | medium | high",
  "dueDate": "YYYY-MM-DD | null",
  "status": "todo | doing | done",
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

### 3.2 驗證規則

- `title` 必填、去除前後空白、長度 1–120。
- `description` 選填、長度 0–1000。
- `priority` 僅允許 `low`、`medium`、`high`，大小寫不敏感。
- `status` 僅允許 `todo`、`doing`、`done`，大小寫不敏感。
- `dueDate` 必須是 `YYYY-MM-DD` 且為真實日曆日期（例如 `2025-02-29` 會被拒絕）。
- 建立與更新皆拒絕未知欄位，避免客戶端誤傳欄位卻無聲失敗。

---

## 4. 測試策略

### 4.1 測試金字塔

```text
          ┌──────────────────────┐
          │   E2E（7）            │  Playwright + headless Chromium
          │   真實瀏覽器與 UI 流程 │
          ├──────────────────────┤
          │   系統測試（17）       │  真實 HTTP Server + fetch
          │   Web API 行為         │
          ├──────────────────────┤
          │   單元測試（34）       │  純函式 / store / client utils
          │   快速、隔離、邊界條件 │
          └──────────────────────┘
```

### 4.2 單元測試（34）

伺服器端單元測試（28）：

| 檔案 | 數量 | 測試重點 |
|---|---:|---|
| `test/unit/task.test.js` | 12 | 建立任務、預設值、欄位 trim、長度上限、priority/status 驗證、日期合法性、未知欄位、部分更新、清空 dueDate、狀態更新、正規化結果 |
| `test/unit/stats.test.js` | 8 | 空列表統計、狀態 / 優先級計數、完成率、未知狀態忽略、非陣列錯誤、狀態 / 優先級 / 關鍵字篩選、描述搜尋、回傳新陣列 |
| `test/unit/store.test.js` | 8 | 防禦性複製、CRUD、清空、JSON 持久化與重新載入、seed 僅在檔案不存在時使用、壞檔拒絕、無檔案路徑的記憶體模式 |

客戶端單元測試（6）：

| 檔案 | 數量 | 測試重點 |
|---|---:|---|
| `test/unit/client-utils.test.js` | 6 | 狀態 / 優先級中文標籤、日期格式化、逾期判斷、完成率格式化、查詢字串組裝、任務排序 |

### 4.3 系統測試（17）

`test/system/api.test.js` 每個測試都會：

1. 建立獨立的暫存目錄與 JSON 資料檔。
2. 啟動真實 HTTP Server，監聽 `127.0.0.1:0`（由作業系統分配埠）。
3. 以 `fetch` 發出真實 HTTP 請求。
4. 測試結束後關閉 Server 並刪除暫存目錄。

涵蓋案例：

- 健康檢查回應格式與時間。
- 空任務列表。
- 建立任務、列表、單筆查詢。
- 建立後確實寫入 JSON 檔。
- 缺少標題、非法 priority、未知欄位的 400 驗證錯誤。
- PATCH 部分更新與 PUT 部分更新。
- 不存在的任務回傳 404。
- 刪除任務與刪除後查詢 404。
- 狀態 / 優先級 / 關鍵字 / 組合篩選。
- 非法篩選值回傳 400。
- 統計數字與完成率。
- 清空所有任務。
- 格式錯誤 JSON、空 body 的 400。
- 未知 API 路由的 404。
- 靜態檔案與 Content-Type。
- 以同一個資料檔重建 Server 後資料仍存在。

### 4.4 E2E 測試（7）

`e2e/taskflow.spec.js` 使用 Playwright 的 `webServer` 自動啟動 `node server.js`，並以 headless Chromium 操作真實頁面。每個測試前會透過 API 清空任務，避免測試互相污染；`workers: 1` 讓資料檔存取保持順序。

涵蓋案例：

1. 沒有任務時顯示空狀態與 0% 完成率。
2. 從表單建立任務，驗證標題、描述、優先級、截止日與統計數字。
3. 標題為空時顯示驗證訊息，且不會建立任務。
4. 任務狀態流轉：待辦 → 進行中 → 已完成 → 重開，並驗證統計與完成率。
5. 以搜尋文字、狀態、優先級篩選任務。
6. 刪除任務後回到空狀態。
7. 重新載入頁面後任務仍然存在（驗證伺服器持久化）。

---

## 5. 測試隔離與穩定性設計

- **固定時鐘**：單元與系統測試注入 `clock`，讓 `createdAt` / `updatedAt` 可預測。
- **暫存資料庫**：系統測試使用 `fs.mkdtempSync` 建立獨立資料夾，測試後刪除。
- **E2E 資料清除**：`test.beforeEach` 先呼叫 `GET /api/tasks`，再逐筆 `DELETE`，確保每個情境從乾淨狀態開始。
- **E2E 專用資料檔**：Playwright `webServer` 以 `DATA_FILE=data/e2e-tasks.json` 啟動，不影響開發用的 `data/tasks.json`。
- **防禦性複製**：`TaskStore` 的 `list()` / `get()` 回傳 `structuredClone`，避免測試或呼叫端意外修改內部狀態。
- **原子寫入**：先寫 `.tmp` 再 `rename`，降低 JSON 檔損毀風險。

---

## 6. 執行方式

### 6.1 安裝

```bash
cd hw7
npm install
npx playwright install chromium
```

> 若本機已安裝 Chrome，也可用 `PLAYWRIGHT_CHANNEL=chrome` 讓 Playwright 使用系統 Chrome。

### 6.2 啟動網站

```bash
npm start
```

開啟 <http://127.0.0.1:3000>。

可用環境變數：

```bash
PORT=3100 DATA_FILE=data/demo.json npm start
```

### 6.3 執行測試

```bash
# 全部單元 + 系統測試
npm test

# 只跑伺服器 / 客戶端單元測試
npm run test:unit

# 只跑 Web API 系統測試
npm run test:system

# 只跑 Playwright E2E
npm run test:e2e

# 開啟 Playwright HTML 報告
npm run test:e2e:report
```

Playwright 報告會產生在 `playwright-report/index.html`。

---

## 7. 實際執行結果

執行環境：

| 項目 | 版本 |
|---|---|
| OS | Windows 10.0.26200 |
| Node.js | v24.16.0 |
| npm | 11.13.0 |
| Playwright | 1.64.1 |
| Chromium | 156.0.8078.4（Playwright 內建） |

### 7.1 單元測試

```text
> node --test "test/unit/*.test.js"

ℹ tests 34
ℹ pass 34
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ duration_ms 122.609
```

### 7.2 系統測試

```text
> node --test "test/system/*.test.js"

ℹ tests 17
ℹ pass 17
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ duration_ms 254.7192
```

### 7.3 E2E 測試

```text
> playwright test

Running 7 tests using 1 worker

  ✓  shows the empty state when there are no tasks
  ✓  creates a task from the form and renders its details
  ✓  shows a validation message when the title is empty
  ✓  moves a task through todo, doing, done, and back to todo
  ✓  filters tasks by search text, status, and priority
  ✓  deletes a task and returns to the empty state
  ✓  keeps tasks after a full page reload

  7 passed (6.4s)
```

### 7.4 全部測試

```text
> npm test

ℹ tests 51
ℹ pass 51
ℹ fail 0
```

加上 E2E 的 7 個測試，總計 **58 個測試全數通過**。

---

## 8. 測試期間發現與修正的問題

1. **Node.js 測試 runner 不支援直接傳入資料夾路徑**
   - 原本使用 `node --test test/unit test/system`，Node 24 會把資料夾當成模組解析而失敗。
   - 改為 `node --test`（自動搜尋 `*.test.js`）以及 glob 形式 `node --test "test/unit/*.test.js"`。

2. **E2E 測試共用資料檔造成順序依賴**
   - 若前一個測試留下的任務未清除，後面的空狀態與統計斷言會失敗。
   - 在 `beforeEach` 透過公開 API 清空任務，並將 `workers` 設為 `1`。

3. **Playwright 與開發伺服器埠號衝突**
   - E2E 使用 `PORT=3100` 與獨立的 `data/e2e-tasks.json`，避免與 `npm start` 的 3000 埠及開發資料互相影響。

4. **日期驗證只檢查格式仍不足**
   - `2025-02-29` 符合 `YYYY-MM-DD` 格式但不是真實日期。
   - 以 UTC 解析後比對 `toISOString().slice(0, 10)`，可正確拒絕不存在的日期。

---

## 9. 未涵蓋範圍與後續改進

- 目前沒有使用者認證與授權，任何呼叫端都能操作所有任務。
- 資料層為單一 JSON 檔，不適合高併發；正式系統應改用資料庫與交易。
- 尚未測試多程序同時寫入、檔案權限錯誤、磁碟滿等基礎設施異常。
- 尚未進行無障礙（accessibility）與跨瀏覽器（Firefox/WebKit）完整測試。
- 若課程要求伺服器使用 Rust，可將 `src/domain` 與 `src/store` 改寫為 Rust crate，並以 `cargo test` 執行同等單元測試；Web API 與 Playwright E2E 測試案例可直接沿用。

---

## 10. 結論

本作業完成一個可實際操作的任務管理網站，並建立三層測試：

- **單元測試**：以純函式與 store 為核心，快速驗證邊界條件與持久化邏輯。
- **系統測試**：啟動真實 HTTP Server，從外部驗證 Web API 的狀態碼、JSON 格式與錯誤處理。
- **E2E 測試**：以 Playwright 無頭瀏覽器操作真實頁面，驗證使用者看得到的完整流程。

三層測試合計 58 個案例全數通過，且測試具備獨立資料、固定時鐘與可重複執行的特性。這套分層方式也能直接套用到其他後端語言（例如 Rust）與更大的系統。
