# HW4：分支、合併、Fork、Pull Request

本篇說明如何使用 Git/GitHub 達成「分支（branch）」、「合併（merge）」、「Fork」、「Pull Request（PR）」這四個操作，並對應到 Git 的分支流程做法。

## 參考連結

- 母專案（upstream）：[https://github.com/se-test-examples/git-examples](https://github.com/se-test-examples/git-examples)
  - Commits（main）：[https://github.com/se-test-examples/git-examples/commits/main/](https://github.com/se-test-examples/git-examples/commits/main/)
- 分支（branch）：[https://github.com/se-test-examples/git-examples/commits/developGitBranch](https://github.com/se-test-examples/git-examples/commits/developGitBranch)
- 子專案（fork 後的自己的 repo）：[https://github.com/ccckmit/git-examples](https://github.com/ccckmit/git-examples)
  - Commits（main）：[https://github.com/ccckmit/git-examples/commits/main/](https://github.com/ccckmit/git-examples/commits/main/)

## 適用的 Git 流程

這種做法最接近 **Feature Branch Workflow（功能分支工作流程）**。

簡單概括：
1. 從主分支（main）建立功能分支（例如 `developGitBranch`）
2. 在功能分支上開發、提交（commit）
3. 將功能分支推送（push）到遠端
4. 透過 Pull Request（PR）請求合併回主分支
5. 通過審查後合併（merge）到 main

若是多人協作且直接向母專案貢獻時，常會先 **Fork** 母專案到自己的帳號，接著在自己的 repo 建立分支開發，再發 PR 給 upstream。

## 操作步驟與對應指令

### 1. 建立分支（Branch）

分支的目的是隔離開發，不影響 `main` 分支的穩定狀態。

#### 在本地建立並切換分支
```bash
# 從目前分支（建議是 main）建立新分支
git checkout -b developGitBranch

# 或使用較新的指令
git switch -c developGitBranch
```

#### 將分支推送到遠端
```bash
git push -u origin developGitBranch
```

對應 GitHub 上的狀態：可以在 [developGitBranch 分支的 commits 頁面](https://github.com/se-test-examples/git-examples/commits/developGitBranch) 看到此分支的歷史。

### 2. 合併（Merge）

開發完成後，將功能分支的變更合併回目標分支（通常是 `main`）。

#### 在本地合併（以 main 為目標）
```bash
# 切換回 main
git checkout main
# 或 git switch main

# 從 developGitBranch 合併變更
git merge developGitBranch

# 將合併結果推送到遠端
git push origin main
```

#### 在 GitHub 上合併（透過 PR）
最常用的方式是透過 Pull Request 合併，GitHub 會提供 `Create a merge commit` / `Squash and merge` / `Rebase and merge` 等選項。

### 3. Fork（分叉）

Fork 是在 GitHub 上複製整個專案到自己的帳號底下，建立一個獨立的遠端倉庫（子專案），方便沒有直接 push 權限的情況下進行貢獻。

#### GitHub 上的動作
1. 前往母專案 [se-test-examples/git-examples](https://github.com/se-test-examples/git-examples)
2. 點擊右上角的 `Fork` → 選擇自己的帳號
3. GitHub 會建立 [ccckmit/git-examples](https://github.com/ccckmit/git-examples)（子專案）

#### 將 fork 下來的 repo clone 到本地
```bash
git clone https://github.com/ccckmit/git-examples.git
cd git-examples
```

#### 設定 upstream（連回母專案，方便同步）
```bash
git remote add upstream https://github.com/se-test-examples/git-examples.git

# 確認遠端設定
git remote -v
# origin    -> https://github.com/ccckmit/git-examples.git (自己的 fork)
# upstream  -> https://github.com/se-test-examples/git-examples.git (母專案)
```

#### 從 upstream 同步最新變更
```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

### 4. Pull Request（PR）

當在 fork 的 repo（或有權限的 repo）完成開發後，透過 Pull Request 請求將變更合併到母專案。

#### 流程
1. 在自己的 fork（[ccckmit/git-examples](https://github.com/ccckmit/git-examples)）建立分支並開發、提交、推送
   ```bash
   git checkout -b feature/xxx
   # 修改程式碼...
   git add .
   git commit -m "說明這次變更"
   git push -u origin feature/xxx
   ```
2. 前往 GitHub，GitHub 會自動提示 `Compare & pull request`，或手動從 `Pull requests` → `New pull request` 建立
3. 設定 PR 的來源與目標
   - base repository: `se-test-examples/git-examples`（母專案）
   - base: `main`（通常）
   - head repository: `ccckmit/git-examples`（自己的 fork）
   - compare: `feature/xxx`（自己的分支）
4. 填寫標題與說明後送出 PR，等待維護者審查、討論與合併

## 總結

| 操作 | 目的 | 常用方式 |
|---|---|---|
| 分支（Branch） | 隔離開發、平行作業 | `git checkout -b <branch>` / `git switch -c <branch>` |
| 合併（Merge） | 將分支變更整合回目標分支 | `git merge <branch>` 或 GitHub PR 的 Merge |
| Fork | 複製母專案到自己的帳號（無直接 push 權限時） | GitHub 上的 `Fork` 按鈕 |
| Pull Request（PR） | 請求將自己的變更合併到母專案，並提供審查機制 | GitHub `New pull request` |

**建議流程（對應本例）：** `Fork` 母專案 → `clone` 到本地 → `branch` 開發 → `commit/push` 到 fork → `Pull Request` 請求合併至母專案 →（審查通過後）`Merge` 到 `main`。
