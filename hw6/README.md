# HW6: Docker 微服務系統實作

## 目標
學會使用 Docker 建置並整合一個微服務系統，並透過簡易 Web 介面展示各個服務的運作狀態。

## 學習紀錄

### 什麼是 Docker？
Docker 是一個容器化平台，能將應用程式及其相依套件打包成「映像檔」（Image），再以「容器」（Container）形式獨立執行。相較於虛擬機，容器更輕量、啟動更快且資源消耗較少。

### 核心概念
- **Image（映像檔）**：唯讀的模板，用來建立容器。可透過 `Dockerfile` 自行定義。
- **Container（容器）**：由映像檔實際執行的實例，擁有獨立的檔案系統、網路與程序空間。
- **Volume（資料卷）**：用來持久化資料，避免容器被刪除時資料遺失（本作業使用 `postgres_data` 儲存 PostgreSQL 資料）。
- **Network（網路）**：讓不同容器之間能透過服務名稱互相通訊（本作業使用 `app-net`）。
- **Dockerfile**：定義如何建置映像檔的指令腳本。
- **docker-compose.yml**：統一定義、建置、啟動多個容器服務的設定檔。

### 本系統使用到的元件
| 元件 | 用途 | 說明 |
|---|---|---|
| **nginx** | Web Server / Reverse Proxy | 作為統一入口，將請求分派至對應的 API 服務，並負責提供靜態 Web 介面。 |
| **postgresql** | 資料庫 | 儲存服務狀態與測試資料，透過 `init.sql` 初始化。 |
| **node-service** | Node.js API | 使用 Express + `pg` 套件，連接 PostgreSQL 並回傳 JSON。 |
| **rust-service** | Rust API | 使用 `axum`、`tokio`、`sqlx` 建構輕量 REST API，連接 PostgreSQL。 |
| **python-service** | Python API | 使用 FastAPI、Uvicorn、`psycopg` 建構 API，連接 PostgreSQL。 |

## 系統架構圖（概念）
```
瀏覽器 (http://localhost)
        │
       Nginx (:80)
      ┌─┼─────────────────────────────────────────┐
     /  │ /api/node      /api/rust      /api/python
    web │   │               │                 │
       ▼   ▼               ▼                 ▼
     靜態頁  Node.js(:3000) Rust(:8080)    Python(:8000)
                │               │                 │
                └───────────────┼─────────────────┘
                                ▼
                            PostgreSQL(:5432)
```

## 檔案結構
```text
hw6/
├── README.md
├── docker-compose.yml
├── db/
│   └── init.sql
├── nginx/
│   ├── Dockerfile
│   └── default.conf
├── node-service/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── rust-service/
│   ├── Dockerfile
│   ├── Cargo.toml
│   └── src/
│       └── main.rs
├── python-service/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app.py
└── web/
    └── index.html
```

## 如何執行
### 前置需求
- 已安裝 [Docker Desktop](https://www.docker.com/products/docker-desktop/)（或 Docker Engine + Docker Compose）

### 建置與啟動
在 `hw6/` 目錄下執行：

```bash
# 建置所有映像檔並啟動容器（背景執行）
docker compose up --build -d
```

首次建置 Rust 服務會需要較長時間（下載 Rust toolchain 與編譯相依套件），屬正常現象。

### 瀏覽系統
啟動成功後，開啟瀏覽器前往：

- **主頁（系統展示介面）**： [http://localhost](http://localhost)
- **Node.js API**： [http://localhost/api/node/health](http://localhost/api/node/health)
- **Rust API**： [http://localhost/api/rust/health](http://localhost/api/rust/health)
- **Python API**： [http://localhost/api/python/health](http://localhost/api/python/health)

### 停止與清除
```bash
# 停止所有容器
docker compose down

# 停止並刪除容器、網路、映像檔（不保留 Volume）
docker compose down --rmi all

# 停止並連同資料庫資料一併刪除（謹慎使用）
docker compose down -v
```

## 驗證重點
- [x] 使用 `Dockerfile` 自行建置 Node.js、Rust、Python 服務映像檔
- [x] 使用 `docker-compose.yml` 整合 Nginx、PostgreSQL、各 API 服務
- [x] 採用微服務架構（每個服務獨立容器、各司其職）
- [x] 以 Nginx 作為 Reverse Proxy 統一入口
- [x] 使用 PostgreSQL 作為資料庫並透過 Volume 持久化
- [x] 提供簡易 Web 介面展示整個 Docker 微服務系統
