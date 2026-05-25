# GitHub Pages 部署筆記

這個版本可以放到 GitHub Pages。專案已升級為 Vite，因此 GitHub Pages 要用 GitHub Actions build `dist/`，不要再用「Deploy from a branch / root」直接發布原始檔。

## 建議流程

1. 在 GitHub 建立一個新的 repository，例如 `okinawa-family-trip`。
2. 把這個資料夾的檔案放到 repo 根目錄，包含 `package.json`、`package-lock.json`、`vite.config.js`、`.github/workflows/deploy.yml`、`index.html`、`styles.css`、`app.js`、`public/`、SQL migration 與文件。
3. 不要推到目前這台電腦上的 `AIChatbot` remote；那不是這個旅遊 App 的專案。
4. 推上 GitHub 後，到 repository 的 `Settings` -> `Pages`。
5. 在 `Build and deployment` 的 Source 選 `GitHub Actions`。
6. Push 到 `main` 後，Actions 會自動執行 `npm ci` 與 `npm run build`，並部署 `dist/`。
7. 等 GitHub Pages 建置完成後，開啟 `https://你的帳號.github.io/okinawa-family-trip/?v=31`。
8. iPhone 用 Safari 開啟後選「加入主畫面」；Android 用 Chrome 開啟後選「安裝應用程式」或「加入主畫面」。

## 如果打開後變成白底黑字

Vite 版若變成白底黑字，通常代表 GitHub Pages 沒有跑 Actions build，或 Pages source 還停在 branch root。請檢查：

1. GitHub repo -> `Actions`，確認 `Deploy GitHub Pages` 成功。
2. GitHub repo -> `Settings` -> `Pages`，Source 必須是 `GitHub Actions`。
3. repo 根目錄要有 `package.json` 和 `.github/workflows/deploy.yml`。
4. 不要手動發布原始 `index.html`；正式頁面要來自 `dist/`。
5. 改完後等 GitHub Pages 重新部署，並用無痕視窗或網址加 `?v=31` 重新開，避免手機吃到舊快取。

## 同步與離線

- 第一次需要網路載入 GitHub Pages 網址。
- 載入後會由 PWA 快取，之後可離線開啟。
- 編輯行程、住宿、花費、定位、工具清單時，會先存在本機。
- 有網路時按「立即同步」會透過 Supabase 合併資料。
- 不同人不需要在同一個 Wi-Fi，只要能連到 GitHub Pages 和 Supabase 即可。

## 注意

- Supabase publishable key 可以放在前端；真正的保護要靠 Supabase RLS policy。
- 不要把 service role key 放進這個專案。
- GitHub Pages 是公開網址，如果行程內容很私密，建議之後加登入或改成私有部署平台。
