# 資安檢查與上線注意事項

這個 App 是 GitHub Pages 靜態 PWA + Supabase 同步。手機安裝後本質上仍是在瀏覽器沙盒中執行網頁，不是原生 APK / IPA，因此一般不會像安裝未知 APK 那樣直接取得手機系統權限；但如果網站程式被竄改，惡意 JavaScript 仍可能讀取 App 內資料、要求定位、導向釣魚頁或把行程資料送到外部網站。

## 目前已確認的保護

- 沒有使用 `eval()` 或 `new Function()`。
- 沒有載入遠端第三方 JavaScript。
- 沒有把 Supabase `service_role` key 放在前端。
- 使用者輸入顯示到畫面時，大多透過 `escapeHtml()` / `escapeAttr()` 轉義，降低 XSS 風險。
- 外部連結透過 `normalizeUrl()` 處理；未設定連結會擋下，不會導向奇怪預設地點。
- 新版 migration 會把 Supabase 改成 Email Magic Link 登入，並用 `trip_members` + RLS 限制只有旅程成員可讀寫。

## 目前仍存在的風險

### 1. 公開 GitHub repository 的程式碼可能被有權限的人竄改

一般陌生人不能直接改你的 GitHub Pages 檔案；他們最多只能 fork 或發 pull request。真正危險的是：

- 你把 repository 寫入權限給太多人。
- GitHub 帳號被盜。
- 不小心合併惡意 pull request。
- GitHub token 外洩。

如果有人成功改到 `app.js`，手機上的 PWA 下次更新時就可能載入被竄改的程式。

建議：

- GitHub 開啟兩步驟驗證。
- repository 只給必要的人寫入權限。
- main branch 開 branch protection。
- 要求 pull request review 才能 merge。
- 不要隨便接受陌生人的 PR。

### 2. 如果尚未執行新版 migration，Supabase 仍可能是「知道網址與 key 的人都能改同一趟旅程」

舊版 App 的 Supabase URL、publishable key、trip id 都在前端。這是靜態網站常見做法，但如果還沒有執行 `supabase-auth-normalized-migration.sql`，任何人如果知道這些資訊，理論上可以呼叫 Supabase API：

- 讀取 `okinawa-family-2026` 的行程資料
- 新增資料
- 修改資料
- 用 `deleted_at` 讓資料看起來像被刪除

他們不能用 publishable key 修改資料庫 schema，也不能拿到 service role 權限；但可以破壞或偷看這趟旅行資料。

新版建議：

- 執行 `supabase-auth-normalized-migration.sql`。
- 在 Supabase Dashboard 開啟 Email provider。
- 將每位登入過的家人加入 `trip_members`。
- 出國正式使用前，建議至少把重要個資拿掉，不要放護照、信用卡、完整住址、生日等敏感資料。

### 3. PWA 快取可能保留舊版或惡意版本

PWA 會快取 `app.js`、`styles.css` 等檔案，讓 App 離線可用。如果曾經部署過錯誤或惡意版本，部分手機可能短時間仍拿到舊快取。

建議：

- 每次更新都同步調整 `service-worker.js` 的 `CACHE_NAME`。
- 發現異常時，請家人關掉 App、重新整理網站，必要時清除瀏覽器網站資料後重新加入主畫面。

### 4. 定位資料屬於敏感資料

定位資料會存在手機本機，並可能同步到 Supabase。這對旅行很方便，但也代表資料庫被濫用時可能洩漏家人最後位置。

建議：

- 只在需要時開啟定位。
- 不要把定位更新頻率設太高。
- 行程結束後可清除定位紀錄或停用 Supabase 專案。

## 建議上線前安全設定清單

- [ ] GitHub 帳號開啟兩步驟驗證。
- [ ] GitHub repository 寫入權限只給自己或可信任的人。
- [ ] main branch 開啟 branch protection。
- [ ] Supabase 不公開 service role key。
- [ ] Supabase RLS 保持啟用，並已執行 `supabase-auth-normalized-migration.sql`。
- [ ] 家人帳號已加入 `trip_members`。
- [ ] 不把高度敏感個資寫入行程。
- [ ] 出發前測試 iPhone / Android 都能同步。
- [ ] 旅程結束後匯出或備份資料，再考慮停用 Supabase 專案或清空資料。

## 建議的下一階段強化

這一版已開始加入 Supabase Auth。下一階段可再加強：

- 在 App 內做 admin 成員管理頁，不必手動進 SQL Editor。
- 將舊 `trip_records` 完全遷移到正規化表後移除橋接表。
- 對定位資料加入自動過期或旅程結束後一鍵清除。
