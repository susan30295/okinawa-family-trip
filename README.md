# 沖繩家庭旅程 App

這是一個給家人一起使用的沖繩旅行 PWA。可以查看每天行程、住宿、交通路線、景點連結、定位、分帳、行李清單、藥品清單、購物記帳與緊急資訊。手機可加入主畫面，第一次載入後可以離線打開；有網路時再同步到 Supabase。

## 主要功能

- 每天行程檢視、編輯、新增、刪除與拖曳排序
- 晴天 / 雨天備案切換
- 景點官網、定位與下一段路線連結
- 住宿地點設定
- 家庭成員管理，連動定位與分帳
- 花費記錄與分帳
- 行李、藥品、購物清單與緊急資訊
- 手機 PWA 安裝，支援 iPhone / Android
- Email Magic Link 登入與 Supabase RLS 成員權限
- 本機離線儲存，有網路時同步到 Supabase
- 同步衝突提示，可以選擇保留自己的版本或雲端版本

## 使用方式

### 手機安裝

1. 用手機開啟 GitHub Pages 網址。
2. iPhone：用 Safari 開啟，按分享，選「加入主畫面」。
3. Android：用 Chrome 開啟，選「安裝應用程式」或「加入主畫面」。
4. 之後從手機桌面圖示打開即可。

### 離線與同步

- 沒網路時仍可查看與編輯，資料會先存在手機或電腦的瀏覽器。
- 有網路後按「立即同步」，資料會同步到 Supabase。
- 家人不需要在同一個 Wi-Fi，只要都能連到 GitHub Pages 和 Supabase 即可。
- 如果兩個人修改同一筆資料，App 會顯示衝突內容，讓使用者選擇保留哪個版本。

## 部署到 GitHub Pages

建議建立一個新的 GitHub repository，例如 `okinawa-family-trip`，不要推到其他既有專案。

專案使用 Vite，請把整個專案根目錄推到 GitHub，包含 `package.json`、`package-lock.json`、`vite.config.js`、`public/` 和 `.github/workflows/deploy.yml`。

部署步驟：

1. 把檔案推到 GitHub repository 的 `main` branch。
2. 到 GitHub repository 的 `Settings`。
3. 左側選 `Pages`。
4. `Build and deployment` 的 Source 選 `GitHub Actions`。
5. Push 後等待 `Deploy GitHub Pages` workflow 成功。
6. 按 `Save`。
7. 等 GitHub Pages 建置完成後，開啟：

```text
https://你的帳號.github.io/okinawa-family-trip/?v=31
```

更完整的部署筆記請看 [GITHUB_PAGES_DEPLOY.md](./GITHUB_PAGES_DEPLOY.md)。

## Supabase 設定

Supabase 用來讓家人之間同步行程資料。新版請在 Supabase 專案的 SQL Editor 執行：

```sql
-- 使用本專案的 supabase-auth-normalized-migration.sql
```

也就是把 [supabase-auth-normalized-migration.sql](./supabase-auth-normalized-migration.sql) 的內容貼上執行。它會建立 Auth/RLS 所需的成員表與第一階段正規化資料表，並把舊的 `trip_records` 改成 authenticated-only。

目前 App 使用：

```text
Project URL: https://hgmcqqjtystjwsiyqitc.supabase.co
Trip ID: okinawa-family-2026
```

`publishable key` 可以放在前端；不要把 Supabase `service_role` key 放進這個專案或 GitHub。

## 本機開發

在這個資料夾執行：

```bash
npm install
npm run dev
```

開啟：

```text
http://localhost:4173/?v=31
```

本機開發會由 Vite 提供 dev server；正式部署則由 GitHub Actions build `dist/` 到 GitHub Pages。

## 檔案說明

- `index.html`：畫面結構
- `styles.css`：視覺樣式與手機版排版
- `app.js`：行程、同步、定位、分帳與互動邏輯
- `manifest.webmanifest`：PWA 安裝設定
- `service-worker.js`：離線快取
- `supabase-setup.sql`：Supabase 資料表與 RLS 設定
- `supabase-auth-normalized-migration.sql`：Auth、成員權限與正規化表 migration
- `SUPABASE_AUTH_SETUP.md`：Supabase Email Magic Link、RLS 與成員設定教學
- `GITHUB_PAGES_DEPLOY.md`：GitHub Pages 部署步驟
- `SECURITY.md`：資安風險、上線檢查與建議防護

## 注意事項

- GitHub Pages 是公開網址，不要把護照、信用卡、完整住址等高度敏感資訊寫進公開 repo。
- 定位功能需要 HTTPS；GitHub Pages 的 `github.io` 網址支援 HTTPS。
- 如果更新了 `app.js` 或 `styles.css`，建議同步更新網址版本參數與 `service-worker.js` 的 cache 版本，避免手機吃到舊快取。
- 正式上線前請先看 [SECURITY.md](./SECURITY.md)，尤其是 GitHub 權限與 Supabase RLS 設定。
