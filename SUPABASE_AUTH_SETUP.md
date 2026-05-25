# Supabase Auth / RLS 設定步驟

## 1. 開啟 Email Magic Link

1. 到 Supabase Dashboard。
2. 進入 `Authentication` -> `Providers`。
3. 啟用 `Email`。
4. 建議先使用 Magic Link，不必讓家人設定密碼。

## 2. 設定登入跳轉網址

到 `Authentication` -> `URL Configuration`：

Site URL：

```text
https://susan30295.github.io/okinawa-family-trip/
```

Redirect URLs：

```text
https://susan30295.github.io/okinawa-family-trip/**
http://localhost:4173/**
```

## 3. 執行 migration

到 `SQL Editor`，貼上並執行：

```text
supabase-auth-normalized-migration.sql
```

這會建立：

- `profiles`
- `trips`
- `trip_members`
- `trip_days`
- `trip_stops`
- `trip_routes`
- `trip_hotels`
- `expenses`
- `expense_participants`
- `location_points`
- `personal_items`
- `emergency_contacts`

也會把舊的 `trip_records` 從 `anon` 讀寫改為 `authenticated` 讀寫，並套用 membership RLS。

## 4. 讓家人先登入一次

每位家人先在 App 輸入 Email 並點 Magic Link。登入後如果尚未加入旅程，App 會顯示「尚未加入此旅程」。

這是正常的，因為需要先在 Supabase 建立 user，再把 user 加入 `trip_members`。

## 5. 加入旅程成員

到 `Authentication` -> `Users`，複製每位家人的 `User UID`。

再到 `SQL Editor` 執行：

```sql
insert into public.trip_members (trip_id, user_id, display_name, role)
values
  ('okinawa-family-2026', '貼上你的-user-uid', '我', 'admin'),
  ('okinawa-family-2026', '貼上媽媽的-user-uid', '媽媽', 'member')
on conflict (trip_id, user_id) do update
set display_name = excluded.display_name,
    role = excluded.role,
    updated_at = now();
```

至少要有一位 `admin`，之後才方便管理成員。

## 6. 測試

- 未登入：只能看到登入畫面。
- 登入但未加入 `trip_members`：不能看行程。
- 成員登入：可以讀寫行程、帳單、定位、個人清單。
- 使用 publishable key 但沒有登入 session：不能讀寫資料。

## 7. GitHub Pages

新版是 Vite 專案，GitHub Pages 請使用 `GitHub Actions` source。不要再使用 `Deploy from a branch / root`。
