# GitHub Pages 部署筆記

這個版本可以放到 GitHub Pages。GitHub Pages 只會提供靜態檔案，所以公開網址上不會使用 `server.py` 或本機 `data/trip-state.csv` API；行程資料會先存在手機/電腦瀏覽器，網路可用時再同步到 Supabase。

## 建議流程

1. 在 GitHub 建立一個新的 repository，例如 `okinawa-family-trip`。
2. 把這個資料夾的網站檔案放到 repo 根目錄：`index.html`、`styles.css`、`app.js`、`manifest.webmanifest`、`service-worker.js`、`icon.svg`、`supabase-setup.sql`、`.nojekyll`。
3. 不要推到目前這台電腦上的 `AIChatbot` remote；那不是這個旅遊 App 的專案。
4. 推上 GitHub 後，到 repository 的 `Settings` -> `Pages`。
5. 在 `Build and deployment` 選 `Deploy from a branch`。
6. Branch 選 `main`，資料夾選 `/ (root)`，按 `Save`。
7. 等 GitHub Pages 建置完成後，開啟 `https://你的帳號.github.io/okinawa-family-trip/?v=30`。
8. iPhone 用 Safari 開啟後選「加入主畫面」；Android 用 Chrome 開啟後選「安裝應用程式」或「加入主畫面」。

## 如果打開後變成白底黑字

這通常代表 `index.html` 有被打開，但同一層找不到 `styles.css`、`app.js`、`icon.svg` 等檔案。請檢查：

1. GitHub repository 根目錄要直接看到 `index.html`、`styles.css`、`app.js`，不要只上傳 `GITHUB_PAGES_DEPLOY.md`。
2. 不要把整個 `2026-05-17/app` 資料夾原封不動丟到 repo 裡，導致檔案變成 `2026-05-17/app/index.html`。GitHub Pages 選 `/ (root)` 時會從 repo 根目錄找檔案。
3. 如果檔案真的放在子資料夾，GitHub Pages 的 branch source 只支援 `/ (root)` 或 `/docs`，建議把 App 檔案移到 repo 根目錄。
4. 檔名大小寫要完全一致：`styles.css` 不能變成 `Styles.css`，`app.js` 不能變成 `App.js`。
5. 在瀏覽器直接打開 `https://你的帳號.github.io/okinawa-family-trip/styles.css?v=30`，如果看到 404，代表 CSS 沒有放在正確位置。
6. 改完後等 GitHub Pages 重新部署，並用無痕視窗或網址加 `?v=30` 重新開，避免手機吃到舊快取。

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
