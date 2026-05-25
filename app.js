import { createClient } from "@supabase/supabase-js";
import Sortable from "sortablejs";

const STORAGE_KEY = "okinawa-family-trip-v2";
const LEGACY_KEY = "okinawa-family-trip-v1";
const TRACK_KEY = "okinawa-family-track-v1";
const SYNC_QUEUE_KEY = "okinawa-family-sync-queue-v1";
const SYNC_CONFIG_KEY = "okinawa-family-sync-config-v1";
const DEVICE_ID_KEY = "okinawa-family-device-id-v1";
const RECORD_META_KEY = "okinawa-family-record-meta-v1";
const TRACK_MIN_INTERVAL_MS = 10 * 60 * 1000;
const TRACK_MIN_DISTANCE_M = 150;
const DEFAULT_SYNC_CONFIG = {
  url: "https://hgmcqqjtystjwsiyqitc.supabase.co",
  anonKey: "sb_publishable_a8nASks-qAS_6D7FpoTsnw_Ayi61FMH",
  tripId: "okinawa-family-2026",
  userName: ""
};

const defaultTrip = {
  selectedDay: "day1",
  selectedStopId: "aquarium",
  weatherMode: "sunny",
  textSize: "normal",
  people: ["媽媽", "我", "家人"],
  familyLocations: [
    { person: "媽媽", lat: 26.6941, lng: 127.878, time: "範例：13:35", note: "美麗海水族館附近" },
    { person: "我", lat: 26.1958, lng: 127.6459, time: "範例：09:45", note: "那霸機場取車處" },
    { person: "家人", lat: 26.2152, lng: 127.6841, time: "範例：14:30", note: "國際通入口" },
    { person: "備用", lat: 26.1743, lng: 127.643, time: "範例：15:30", note: "瀨長島" }
  ],
  tools: {
    packing: [
      { id: "passport", text: "護照、駕照譯本、租車文件", done: false },
      { id: "rain", text: "摺疊傘、薄外套、行動電源", done: false },
      { id: "cash", text: "日幣現金、信用卡、交通卡", done: false }
    ],
    meds: [
      { id: "daily-meds", text: "長輩每日藥品與藥袋", done: false },
      { id: "motion", text: "暈車藥、胃藥、止痛藥", done: false },
      { id: "insurance", text: "旅平險資料與緊急聯絡人", done: false }
    ],
    shopping: [
      { id: "souvenir", person: "我", title: "伴手禮預算", amount: 5000, done: false }
    ],
    emergency: [
      { id: "taiwan-naha", title: "台灣駐琉球/那霸急難救助", value: "080-8056-0122", note: "重大急難使用；一般領務請於上班時間洽詢。" },
      { id: "mofa", title: "外交部旅外急難救助", value: "+886-800-085-095", note: "自國外撥回台灣；日本亦可依電信業撥 001-010-800-0885-0885 或 0061-010-800-0885-0885。" },
      { id: "japan-emergency", title: "日本緊急電話", value: "警察 110｜消防/救護 119", note: "遇事故、失竊、急病先打日本當地緊急電話。" },
      { id: "consumer", title: "訪日觀光客消費者熱線", value: "03-5449-0906", note: "中文可通；購物或旅遊消費爭議。" }
    ]
  },
  expenses: [
    { id: "rental-car", title: "租車與油資預估", amount: 9800, payer: "我", people: ["媽媽", "我", "家人"] }
  ],
  days: [
    {
      id: "day1",
      label: "第 1 天",
      date: "抵達與北部海景",
      hotel: {
        name: "Hotel Orion Motobu Resort & Spa",
        address: "沖繩縣國頭郡本部町備瀨 148-1",
        phone: "+81-980-51-7300",
        maps: "https://www.google.com/maps/search/?api=1&query=Hotel+Orion+Motobu+Resort+%26+Spa",
        note: "靠近美麗海水族館，長輩回房休息很方便。"
      },
      stops: [
        {
          id: "airport",
          time: "09:40",
          title: "那霸機場集合",
          transport: "飛機抵達，機場取車",
          routeToNext: {
            transport: "租車約 1 小時 45 分，走沖繩自動車道往本部",
            url: "https://www.google.com/maps/dir/?api=1&origin=Naha+Airport&destination=Okinawa+Churaumi+Aquarium&travelmode=driving",
            note: "中途可在伊藝服務區休息。"
          },
          summary: "先上洗手間、領行李、確認租車公司接駁點。家人只要跟著「租車接駁」標示走。",
          rainPlan: "機場取車後先去 AEON Mall Okinawa Rycom 用餐休息，再視天氣北上。",
          tags: ["集合", "洗手間", "租車"],
          budget: 0,
          official: "https://www.naha-airport.co.jp/en/",
          maps: "https://www.google.com/maps/search/?api=1&query=Naha+Airport",
          coords: [26.1958, 127.6459]
        },
        {
          id: "aquarium",
          time: "13:30",
          title: "沖繩美麗海水族館",
          transport: "租車約 1 小時 45 分",
          routeToNext: {
            transport: "開車約 6 分，飯店與林道都在附近",
            url: "https://www.google.com/maps/dir/?api=1&origin=Okinawa+Churaumi+Aquarium&destination=Bise+Fukugi+Tree+Road&travelmode=driving",
            note: "長輩累了可以直接改回飯店。"
          },
          summary: "看黑潮之海大水槽，館內冷氣足、動線平坦，適合長輩慢慢逛。",
          rainPlan: "雨天保留水族館，取消戶外散步，改在海洋博公園室內區域休息。",
          tags: ["親子", "室內", "長輩友善"],
          budget: 3200,
          official: "https://churaumi.okinawa/en/",
          maps: "https://www.google.com/maps/search/?api=1&query=Okinawa+Churaumi+Aquarium",
          coords: [26.6941, 127.878]
        },
        {
          id: "bise",
          time: "16:40",
          title: "備瀨福木林道",
          transport: "水族館開車約 6 分",
          routeToNext: { transport: "", url: "", note: "" },
          summary: "海邊綠蔭散步，路程可長可短；若長輩累了就改去飯店休息。",
          rainPlan: "若下雨就取消，改飯店休息或附近咖啡廳。",
          tags: ["散步", "拍照", "彈性"],
          budget: 0,
          official: "https://www.okinawastory.jp/spot/1080",
          maps: "https://www.google.com/maps/search/?api=1&query=Bise+Fukugi+Tree+Road",
          coords: [26.7016, 127.8817]
        }
      ]
    },
    {
      id: "day2",
      label: "第 2 天",
      date: "文化與市區",
      hotel: {
        name: "Naha Tokyu REI Hotel",
        address: "沖繩縣那霸市旭町 116-37",
        phone: "+81-98-869-0109",
        maps: "https://www.google.com/maps/search/?api=1&query=Naha+Tokyu+REI+Hotel",
        note: "靠近單軌電車旭橋站，市區移動簡單。"
      },
      stops: [
        {
          id: "shurijo",
          time: "10:00",
          title: "首里城公園",
          transport: "租車約 1 小時 35 分",
          routeToNext: {
            transport: "開車或計程車約 20 分",
            url: "https://www.google.com/maps/dir/?api=1&origin=Shurijo+Castle+Park&destination=Kokusai+Dori+Naha&travelmode=driving",
            note: "市區停車可先查百貨或收費停車場。"
          },
          summary: "沖繩歷史代表景點，坡道較多，安排慢走與休息點。",
          rainPlan: "雨勢大時改沖繩縣立博物館，美術館與咖啡廳都在室內。",
          tags: ["文化", "慢走", "拍照"],
          budget: 1600,
          official: "https://oki-park.jp/shurijo/en/",
          maps: "https://www.google.com/maps/search/?api=1&query=Shurijo+Castle+Park",
          coords: [26.217, 127.7192]
        },
        {
          id: "kokusai",
          time: "14:30",
          title: "國際通",
          transport: "開車或計程車約 20 分",
          routeToNext: { transport: "", url: "", note: "" },
          summary: "買伴手禮、吃沖繩料理。長輩可先到咖啡店坐，年輕人再分頭採買。",
          rainPlan: "下雨照常，改走有遮蔽的商店與百貨。",
          tags: ["購物", "餐廳多", "可分組"],
          budget: 6000,
          official: "https://naha-kokusaidori.okinawa/",
          maps: "https://www.google.com/maps/search/?api=1&query=Kokusai+Dori+Naha",
          coords: [26.2152, 127.6841]
        }
      ]
    },
    {
      id: "day3",
      label: "第 3 天",
      date: "南部輕鬆行",
      hotel: {
        name: "Naha Tokyu REI Hotel",
        address: "沖繩縣那霸市旭町 116-37",
        phone: "+81-98-869-0109",
        maps: "https://www.google.com/maps/search/?api=1&query=Naha+Tokyu+REI+Hotel",
        note: "最後一晚不換飯店，行李壓力小。"
      },
      stops: [
        {
          id: "okinawa-world",
          time: "10:00",
          title: "沖繩世界文化王國",
          transport: "租車約 35 分",
          routeToNext: {
            transport: "租車約 30 分，往機場方向移動",
            url: "https://www.google.com/maps/dir/?api=1&origin=Okinawa+World&destination=Umikaji+Terrace&travelmode=driving",
            note: "先確認還車時間，避免壓線。"
          },
          summary: "玉泉洞鐘乳石洞與傳統表演都在園區內，雨天也能照常玩。",
          rainPlan: "雨天照常，玉泉洞與表演動線較穩定。",
          tags: ["雨天備案", "表演", "室內外"],
          budget: 4200,
          official: "https://www.gyokusendo.co.jp/okinawaworld/en/",
          maps: "https://www.google.com/maps/search/?api=1&query=Okinawa+World",
          coords: [26.1419, 127.7485]
        },
        {
          id: "senaga",
          time: "15:30",
          title: "瀨長島 Umikaji Terrace",
          transport: "租車約 30 分",
          routeToNext: { transport: "", url: "", note: "" },
          summary: "看海、喝咖啡、離機場近。若大家累了，可以直接縮短停留。",
          rainPlan: "雨天改 Outlet Mall Ashibinaa 或提早到機場用餐。",
          tags: ["海景", "咖啡", "近機場"],
          budget: 2500,
          official: "https://www.umikajiterrace.com/",
          maps: "https://www.google.com/maps/search/?api=1&query=Umikaji+Terrace",
          coords: [26.1743, 127.643]
        }
      ]
    }
  ]
};

let trip = loadTrip();
let trackPoints = loadTrack();
let watchId = null;
let deferredInstallPrompt = null;
let touchDragId = null;
let touchDropTarget = null;
let pointerDown = null;
let pointerDropTarget = null;
let resolvedLocalConflicts = new Set();
let suppressNextCardClick = false;
let touchDragTimer = null;
let touchStartPoint = null;
let saveTimer = null;
let syncQueue = loadJson(SYNC_QUEUE_KEY, []);
let recordMeta = loadJson(RECORD_META_KEY, {});
let supabaseClient = null;
let authSession = null;
let currentMember = null;
let timelineSortable = null;
let remoteDayIds = new Map();
let remoteStopIds = new Map();
let remoteExpenseIds = new Map();

const els = {
  authGate: document.querySelector("#authGate"),
  authForm: document.querySelector("#authForm"),
  authEmail: document.querySelector("#authEmail"),
  authStatus: document.querySelector("#authStatus"),
  currentUserPill: document.querySelector("#currentUserPill"),
  dayTabs: document.querySelector("#dayTabs"),
  timeline: document.querySelector("#timeline"),
  currentStopTitle: document.querySelector("#currentStopTitle"),
  currentStopMeta: document.querySelector("#currentStopMeta"),
  mapTitle: document.querySelector("#mapTitle"),
  mapFrame: document.querySelector("#mapFrame"),
  mapLink: document.querySelector("#mapLink"),
  detailBox: document.querySelector("#detailBox"),
  hotelInfo: document.querySelector("#hotelInfo"),
  hotelMapLink: document.querySelector("#hotelMapLink"),
  stopDialog: document.querySelector("#stopDialog"),
  stopForm: document.querySelector("#stopForm"),
  stopDay: document.querySelector("#stopDay"),
  dayDialog: document.querySelector("#dayDialog"),
  dayForm: document.querySelector("#dayForm"),
  hotelDialog: document.querySelector("#hotelDialog"),
  hotelForm: document.querySelector("#hotelForm"),
  routeDialog: document.querySelector("#routeDialog"),
  routeForm: document.querySelector("#routeForm"),
  expenseDialog: document.querySelector("#expenseDialog"),
  expenseForm: document.querySelector("#expenseForm"),
  peopleDialog: document.querySelector("#peopleDialog"),
  peopleForm: document.querySelector("#peopleForm"),
  stopViewDialog: document.querySelector("#stopViewDialog"),
  exportDialog: document.querySelector("#exportDialog"),
  exportText: document.querySelector("#exportText"),
  exportStatus: document.querySelector("#exportStatus"),
  helpDialog: document.querySelector("#helpDialog"),
  installLinkDialog: document.querySelector("#installLinkDialog"),
  installShareText: document.querySelector("#installShareText"),
  familyDots: document.querySelector("#familyDots"),
  toolsPanel: document.querySelector("#toolsPanel"),
  packingList: document.querySelector("#packingList"),
  medsList: document.querySelector("#medsList"),
  shoppingList: document.querySelector("#shoppingList"),
  emergencyList: document.querySelector("#emergencyList"),
  shoppingForm: document.querySelector("#shoppingForm"),
  familyLocationDialog: document.querySelector("#familyLocationDialog"),
  familyLocationTitle: document.querySelector("#familyLocationTitle"),
  familyLocationFrame: document.querySelector("#familyLocationFrame"),
  familyLocationMeta: document.querySelector("#familyLocationMeta"),
  syncPreviewDialog: document.querySelector("#syncPreviewDialog"),
  syncPreviewList: document.querySelector("#syncPreviewList"),
  syncDialog: document.querySelector("#syncDialog"),
  syncForm: document.querySelector("#syncForm"),
  syncStatus: document.querySelector("#syncStatus"),
  conflictDialog: document.querySelector("#conflictDialog"),
  conflictList: document.querySelector("#conflictList"),
  weatherToggle: document.querySelector("#weatherToggle"),
  trackBtn: document.querySelector("#trackBtn"),
  trackCount: document.querySelector("#trackCount"),
  trackStatus: document.querySelector("#trackStatus"),
  trackList: document.querySelector("#trackList"),
  expenseSummary: document.querySelector("#expenseSummary"),
  expenseList: document.querySelector("#expenseList")
};

function loadTrip() {
  const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
  const base = raw ? JSON.parse(raw) : structuredClone(defaultTrip);
  return migrateTrip(base);
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function migrateTrip(data) {
  data.weatherMode ||= "sunny";
  data.textSize ||= "normal";
  data.people = Array.isArray(data.people) && data.people.length ? data.people : ["媽媽", "我", "家人"];
  data.familyLocations = Array.isArray(data.familyLocations) ? data.familyLocations : structuredClone(defaultTrip.familyLocations);
  syncPeopleBackedData(data);
  data.tools ||= structuredClone(defaultTrip.tools);
  data.tools.packing = Array.isArray(data.tools.packing) ? data.tools.packing : structuredClone(defaultTrip.tools.packing);
  data.tools.meds = Array.isArray(data.tools.meds) ? data.tools.meds : structuredClone(defaultTrip.tools.meds);
  data.tools.shopping = Array.isArray(data.tools.shopping) ? data.tools.shopping : structuredClone(defaultTrip.tools.shopping);
  data.tools.emergency = Array.isArray(data.tools.emergency) ? data.tools.emergency : structuredClone(defaultTrip.tools.emergency);
  if (data.people.join(",") === "爸爸,媽媽,我,家人") data.people = ["媽媽", "我", "家人"];
  data.expenses = Array.isArray(data.expenses) ? data.expenses : [];
  data.expenses.forEach((expense) => {
    if (Array.isArray(expense.people) && expense.people.join(",") === "爸爸,媽媽,我,家人") expense.people = ["媽媽", "我", "家人"];
    if (expense.payer === "爸爸") expense.payer = data.people[0] || "我";
    ensureRecordFields(expense, "expense", expense.id);
  });
  data.days.forEach((day) => {
    ensureRecordFields(day, "day", day.id);
    day.label ||= "第 1 天";
    day.date ||= "未命名行程";
    day.hotel ||= { name: "尚未設定住宿", address: "", phone: "", maps: "", note: "" };
    day.hotel.id ||= `${day.id}-hotel`;
    ensureRecordFields(day.hotel, "hotel", day.hotel.id);
    day.hotel.maps ||= mapsSearch(day.hotel.name || "Okinawa hotel");
    day.stops.forEach((stop, index) => {
      ensureRecordFields(stop, "stop", stop.id);
      stop.order = Number.isFinite(Number(stop.order)) ? Number(stop.order) : (index + 1) * 1000;
      stop.routeToNext ||= { transport: "", mode: "driving", url: "", note: "" };
      stop.routeToNext.id ||= `${stop.id}-route`;
      ensureRecordFields(stop.routeToNext, "route", stop.routeToNext.id);
      stop.routeToNext.mode ||= "driving";
      stop.rainPlan ||= "尚未設定雨天備案。";
      stop.budget = Number(stop.budget || 0);
      stop.linkLabel ||= "";
      stop.tags ||= [];
      stop.maps ||= "";
      stop.official ||= "";
    });
    day.stops.sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));
  });
  return data;
}

function ensureRecordFields(record, entity, id) {
  if (!record || typeof record !== "object") return;
  record.id ||= id || crypto.randomUUID();
  record.updated_at ||= new Date().toISOString();
  record.updated_by ||= getDeviceId();
  record.deleted_at ||= null;
  record.version = Number(record.version || 1);
  record.entity ||= entity;
}

function syncPeopleBackedData(data = trip) {
  const fallbackLocations = structuredClone(defaultTrip.familyLocations);
  data.familyLocations = data.people.slice(0, 4).map((person, index) => {
    const existing = (data.familyLocations || []).find((item) => item.person === person);
    return existing || { ...fallbackLocations[index % fallbackLocations.length], person };
  });
  data.expenses?.forEach((expense) => {
    expense.people = (expense.people || []).filter((person) => data.people.includes(person));
    if (!expense.people.length) expense.people = [...data.people];
    if (!data.people.includes(expense.payer)) expense.payer = data.people[0] || "我";
  });
}

function loadTrack() {
  const raw = localStorage.getItem(TRACK_KEY);
  const points = raw ? JSON.parse(raw) : [];
  return points.length ? points : sampleTrackPoints();
}

function sampleTrackPoints() {
  const base = Date.now() - 45 * 60 * 1000;
  return [
    { lat: 26.1958, lng: 127.6459, accuracy: 35, time: new Date(base).toISOString(), sample: true },
    { lat: 26.3213, lng: 127.753, accuracy: 52, time: new Date(base + 15 * 60 * 1000).toISOString(), sample: true },
    { lat: 26.492, lng: 127.892, accuracy: 48, time: new Date(base + 30 * 60 * 1000).toISOString(), sample: true },
    { lat: 26.6941, lng: 127.878, accuracy: 30, time: new Date(base + 45 * 60 * 1000).toISOString(), sample: true }
  ];
}

function saveTrip() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
  updateSyncStatus();
  clearTimeout(saveTimer);
  if (hasLocalCsvApi()) saveTimer = setTimeout(saveTripToCsv, 120);
}

function statePayload() {
  return { trip, trackPoints, records: buildSyncRecords(), syncQueue, savedAt: new Date().toISOString(), version: 2 };
}

function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = `device-${crypto.randomUUID()}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

function syncUserName() {
  return currentUserId() || currentDisplayName() || trip?.people?.[0] || getDeviceId();
}

function nowIso() {
  return new Date().toISOString();
}

function stampRecord(record, entity, id, deleted = false) {
  ensureRecordFields(record, entity, id);
  record.updated_at = nowIso();
  record.updated_by = syncUserName();
  record.version = Number(record.version || 0) + 1;
  record.deleted_at = deleted ? record.updated_at : null;
  return record;
}

function queueMutation(entity, recordId, op, data, fields = []) {
  const mutation = {
    id: crypto.randomUUID(),
    entity,
    record_id: recordId,
    op,
    fields,
    data: structuredClone(data || {}),
    updated_at: data?.updated_at || nowIso(),
    updated_by: syncUserName(),
    version: Number(data?.version || 1)
  };
  syncQueue.push(mutation);
  saveJson(SYNC_QUEUE_KEY, syncQueue);
  recordMeta[`${entity}:${recordId}`] = {
    dirty: true,
    updated_at: mutation.updated_at,
    version: mutation.version
  };
  saveJson(RECORD_META_KEY, recordMeta);
  updateSyncStatus();
}

function buildSyncRecords() {
  const records = [];
  trip.days.forEach((day) => {
    records.push(recordRow("day", day.id, day));
    records.push(recordRow("hotel", day.hotel.id || `${day.id}-hotel`, day.hotel));
    day.stops.forEach((stop, index) => {
      stop.order = Number.isFinite(Number(stop.order)) ? Number(stop.order) : (index + 1) * 1000;
      records.push(recordRow("stop", stop.id, stop));
      records.push(recordRow("route", stop.routeToNext?.id || `${stop.id}-route`, stop.routeToNext || {}));
    });
  });
  trip.expenses.forEach((expense) => records.push(recordRow("expense", expense.id, expense)));
  records.push(recordRow("people", "trip-people", { id: "trip-people", people: trip.people, updated_at: nowIso(), updated_by: syncUserName(), version: 1 }));
  return records;
}

function recordRow(entity, id, data) {
  return {
    entity,
    record_id: id,
    data,
    updated_at: data?.updated_at || nowIso(),
    updated_by: data?.updated_by || getDeviceId(),
    deleted_at: data?.deleted_at || null,
    version: Number(data?.version || 1)
  };
}

function loadSyncConfig() {
  const stored = loadJson(SYNC_CONFIG_KEY, {});
  const config = { ...DEFAULT_SYNC_CONFIG, ...stored };
  config.url = String(config.url || "").trim().replace(/\/+$/, "");
  if (config.url.includes("hgmcqqjtystjwsiyqitc.supabase.co")) {
    config.url = DEFAULT_SYNC_CONFIG.url;
    config.anonKey = DEFAULT_SYNC_CONFIG.anonKey;
    config.tripId = DEFAULT_SYNC_CONFIG.tripId;
  }
  return config;
}

function getSupabaseClient() {
  const config = loadSyncConfig();
  if (!config.url || !config.anonKey) return null;
  if (!supabaseClient) {
    supabaseClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }
  return supabaseClient;
}

function currentUserId() {
  return authSession?.user?.id || null;
}

function currentDisplayName() {
  return currentMember?.display_name || loadSyncConfig().userName || authSession?.user?.email || "我";
}

function setAuthStatus(message) {
  if (els.authStatus) els.authStatus.textContent = message;
}

function showAuthenticatedApp(show) {
  els.authGate.hidden = show;
  document.querySelector(".app-shell").hidden = !show;
  if (els.currentUserPill) {
    els.currentUserPill.textContent = show ? `${currentDisplayName()} 已登入` : "未登入";
  }
}

async function initAuth() {
  const client = getSupabaseClient();
  if (!client) {
    showAuthenticatedApp(false);
    setAuthStatus("尚未設定 Supabase，無法使用登入。");
    return;
  }
  const { data } = await client.auth.getSession();
  authSession = data.session;
  client.auth.onAuthStateChange(async (_event, session) => {
    authSession = session;
    await loadAuthenticatedState();
  });
  await loadAuthenticatedState();
}

async function sendMagicLink(email) {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase 尚未設定");
  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${location.origin}${location.pathname}`
    }
  });
  if (error) throw error;
}

async function signOut() {
  const client = getSupabaseClient();
  if (client) await client.auth.signOut();
  authSession = null;
  currentMember = null;
  showAuthenticatedApp(false);
  setAuthStatus("已登出。");
}

async function loadAuthenticatedState() {
  if (!authSession?.user) {
    currentMember = null;
    showAuthenticatedApp(false);
    setAuthStatus("請輸入 Email 取得登入連結。");
    return;
  }
  await ensureProfile();
  currentMember = await loadTripMember();
  if (!currentMember) {
    showAuthenticatedApp(false);
    setAuthStatus("已登入，但這個 Email 尚未加入此旅程。請到 Supabase 的 trip_members 加入這位使用者。");
    return;
  }
  showAuthenticatedApp(true);
  setAuthStatus("登入成功。");
  await loadTripFromSupabase();
  saveTrip();
  render();
  await syncNow(true);
}

async function ensureProfile() {
  const client = getSupabaseClient();
  const user = authSession?.user;
  if (!client || !user) return;
  await client.from("profiles").upsert({
    user_id: user.id,
    email: user.email,
    display_name: loadSyncConfig().userName || user.email || "",
    updated_at: nowIso()
  });
}

async function loadTripMember() {
  const client = getSupabaseClient();
  const config = loadSyncConfig();
  const user = authSession?.user;
  if (!client || !user) return null;
  const { data, error } = await client
    .from("trip_members")
    .select("*")
    .eq("trip_id", config.tripId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) {
    updateSyncStatus(`讀取成員權限失敗：${error.message}`);
    return null;
  }
  return data;
}

function saveSyncConfig(config) {
  saveJson(SYNC_CONFIG_KEY, config);
  supabaseClient = null;
  updateSyncStatus();
}

function updateSyncStatus(message) {
  if (!els.syncStatus) return;
  if (message) {
    els.syncStatus.textContent = message;
    return;
  }
  const config = loadSyncConfig();
  const pending = syncQueue.length;
  if (!config.url || !config.anonKey) {
    els.syncStatus.textContent = `離線可用；尚未設定 Supabase。待同步 ${pending} 筆，已存在本機與 CSV。`;
    return;
  }
  els.syncStatus.textContent = pending ? `Supabase 已連線設定，待同步 ${pending} 筆。` : "Supabase 已連線設定，目前沒有待同步變更。";
}

async function saveTripToCsv() {
  if (!hasLocalCsvApi()) return;
  try {
    await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(statePayload())
    });
  } catch {
    // LocalStorage remains the offline fallback when the CSV API is unavailable.
  }
}

async function loadTripFromCsv() {
  if (!hasLocalCsvApi()) return;
  try {
    const response = await fetch("/api/state");
    const payload = await response.json();
    if (payload.state && Object.keys(payload.state).length) {
      const incoming = payload.state.trip ? payload.state : { trip: payload.state };
      trip = migrateTrip(incoming.trip);
      if (Array.isArray(incoming.trackPoints) && incoming.trackPoints.length) {
        trackPoints = incoming.trackPoints;
        saveTrack();
      }
      if (Array.isArray(incoming.syncQueue)) {
        syncQueue = incoming.syncQueue;
        saveJson(SYNC_QUEUE_KEY, syncQueue);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
    } else {
      await saveTripToCsv();
    }
  } catch {
    // The static file version still works without the CSV server.
  }
}

function hasLocalCsvApi() {
  return ["localhost", "127.0.0.1"].includes(location.hostname) || /^192\.168\./.test(location.hostname);
}

function saveTrack() {
  localStorage.setItem(TRACK_KEY, JSON.stringify(trackPoints));
  saveTrip();
}

function currentDay() {
  return trip.days.find((day) => day.id === trip.selectedDay) || trip.days[0];
}

function currentStop() {
  const day = currentDay();
  return day.stops.find((stop) => stop.id === trip.selectedStopId) || day.stops[0];
}

function setSelected(dayId, stopId) {
  trip.selectedDay = dayId;
  trip.selectedStopId = stopId;
  saveTrip();
  render();
}

function render() {
  applyTextSize();
  renderFamilyDots();
  renderDayTabs();
  renderTimeline();
  renderSidePanels();
  renderExpenses();
  renderTrack();
  renderTools();
}

function applyTextSize() {
  document.body.classList.toggle("large-text", trip.textSize === "large");
  document.body.classList.toggle("huge-text", trip.textSize === "huge");
  document.querySelector("#largeTextBtn").textContent = trip.textSize === "normal" ? "字" : trip.textSize === "large" ? "大" : "特大";
}

function renderDayTabs() {
  els.dayTabs.innerHTML = trip.days
    .map((day) => {
      const selected = day.id === trip.selectedDay;
      return `<button class="day-tab" type="button" data-day="${day.id}" aria-selected="${selected}">${escapeHtml(day.label)}<br><small>${escapeHtml(day.date)}</small></button>`;
    })
    .join("");
}

function renderTimeline() {
  const day = currentDay();
  const pieces = [];
  day.stops.forEach((stop, index) => {
    pieces.push(renderStopCard(stop, index, day.stops.length));
    if (index < day.stops.length - 1) pieces.push(renderRouteConnector(stop, day.stops[index + 1]));
  });
  els.timeline.innerHTML = pieces.join("");
  initSortableTimeline();
}

function renderStopCard(stop, index, total) {
  const active = stop.id === trip.selectedStopId;
  const tags = (stop.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
  const mainText = trip.weatherMode === "rain" ? stop.rainPlan : stop.summary;
  return `
    <article class="stop-card ${active ? "active" : ""}" data-stop="${stop.id}" data-action="select" tabindex="0" aria-label="查看 ${escapeHtml(stop.title)}">
      <div class="drag-cue" aria-hidden="true" title="長按行程可拖曳排序"><span></span><span></span><span></span></div>
      <input class="time-input" type="time" value="${escapeHtml(stop.time)}" data-action="time" aria-label="調整 ${escapeHtml(stop.title)} 的時間" />
      <div class="stop-main">
        <h3>${escapeHtml(stop.title)}</h3>
        <p><strong>交通：</strong>${escapeHtml(stop.transport || "尚未設定")}</p>
        <p>${escapeHtml(mainText || "")}</p>
        <div class="tag-row">${tags}${stop.budget ? `<span class="tag">預估 ¥${formatMoney(stop.budget)}</span>` : ""}</div>
        <div class="stop-actions">
          <button class="link-button open-link" type="button" data-url="${escapeAttr(primaryStopUrl(stop))}" ${primaryStopUrl(stop) ? "" : "disabled"}>${escapeHtml(primaryStopLabel(stop))}</button>
          <button class="link-button open-link" type="button" data-url="${escapeAttr(stop.maps || "")}" ${stop.maps ? "" : "disabled"}>定位</button>
        </div>
      </div>
    </article>
  `;
}

function renderRouteConnector(stop, nextStop) {
  const route = stop.routeToNext || {};
  const mode = route.mode || "driving";
  const label = route.transport || recommendRoute(stop, nextStop, mode);
  const href = route.url || routeUrl(stop, nextStop, mode);
  return `
    <div class="route-connector" data-route-from="${stop.id}">
      <div class="route-line"></div>
      <button type="button" data-action="route">路線：${escapeHtml(label)}</button>
      <button class="open-link" type="button" data-url="${escapeAttr(href)}">開啟路線</button>
      <button class="copy-link" type="button" data-url="${escapeAttr(href)}">複製</button>
    </div>
  `;
}

function renderSidePanels() {
  const day = currentDay();
  const stop = currentStop();
  if (!stop) return;

  els.weatherToggle.textContent = trip.weatherMode === "rain" ? "雨天備案" : "晴天行程";
  els.weatherToggle.classList.toggle("rain", trip.weatherMode === "rain");
  els.currentStopTitle.textContent = `${stop.time} ${stop.title}`;
  els.currentStopMeta.textContent = `${day.label}｜${day.date}｜${stop.transport || "交通未設定"}`;
  els.mapTitle.textContent = stop.title;
  els.mapLink.dataset.url = stop.maps || "";
  els.mapLink.disabled = !stop.maps;
  if (Array.isArray(stop.coords) && stop.coords.length === 2) {
    const [lat, lng] = stop.coords;
    els.mapFrame.hidden = false;
    els.mapFrame.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.014}%2C${lat - 0.011}%2C${lng + 0.014}%2C${lat + 0.011}&layer=mapnik&marker=${lat}%2C${lng}`;
  } else {
    els.mapFrame.hidden = true;
  }
  els.detailBox.innerHTML = `
    <p><strong>${trip.weatherMode === "rain" ? "雨天備案" : "重點"}：</strong>${escapeHtml(trip.weatherMode === "rain" ? stop.rainPlan : stop.summary)}</p>
    <p><strong>交通：</strong>${escapeHtml(stop.transport || "尚未設定")}</p>
    <p><strong>預估花費：</strong>¥${formatMoney(stop.budget || 0)}</p>
    <div class="stop-actions">
      <button class="link-button open-link" type="button" data-url="${escapeAttr(primaryStopUrl(stop))}" ${primaryStopUrl(stop) ? "" : "disabled"}>${escapeHtml(primaryStopLabel(stop))}</button>
      <button class="link-button open-link" type="button" data-url="${escapeAttr(stop.maps || "")}" ${stop.maps ? "" : "disabled"}>開啟定位</button>
    </div>
  `;

  els.hotelMapLink.dataset.url = day.hotel.maps || mapsSearch(day.hotel.name);
  els.hotelInfo.innerHTML = `
    <p><strong>${escapeHtml(day.hotel.name || "尚未設定住宿")}</strong></p>
    <p>${escapeHtml(day.hotel.address || "地址尚未設定")}</p>
    <p>${escapeHtml(day.hotel.phone || "電話尚未設定")}</p>
    <p>${escapeHtml(day.hotel.note || "")}</p>
  `;
}

function renderExpenses() {
  const totals = calculateSplit();
  const totalAmount = trip.expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  els.expenseSummary.innerHTML = `
    <div class="expense-total">總花費 ¥${formatMoney(totalAmount)}</div>
    <div class="split-grid">
      ${totals.map((row) => `<span>${escapeHtml(row.person)}</span><strong class="${row.balance >= 0 ? "positive" : "negative"}">${row.balance >= 0 ? "應收" : "應付"} ¥${formatMoney(Math.abs(row.balance))}</strong>`).join("")}
    </div>
  `;
  els.expenseList.innerHTML = trip.expenses.length
    ? trip.expenses
        .map(
          (expense) => `
          <button class="expense-row" type="button" data-expense="${expense.id}">
            <span>${escapeHtml(expense.title)}</span>
            <strong>¥${formatMoney(expense.amount)}</strong>
            <small>${escapeHtml(expense.payer)} 先付，${expense.people.length} 人分</small>
          </button>
        `
        )
        .join("")
    : `<p class="muted">尚未新增花費。</p>`;
}

function renderTrack() {
  els.trackCount.textContent = trackPoints.length;
  els.trackList.innerHTML = trackPoints
    .slice(-6)
    .reverse()
    .map((point) => {
      const time = new Date(point.time).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" });
      return `<li>${time}：${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}${point.sample ? "（範例）" : ""}</li>`;
    })
    .join("");
}

function renderFamilyDots() {
  if (!els.familyDots) return;
  const locations = trip.familyLocations || [];
  els.familyDots.innerHTML = locations
    .slice(0, 4)
    .map(
      (item, index) => `
        <button class="family-dot dot-${index + 1}" type="button" data-person="${escapeAttr(item.person)}" title="${escapeAttr(item.person)} 最後定位">
          <span>${escapeHtml((item.person || "?").slice(0, 1))}</span>
        </button>
      `
    )
    .join("");
}

function renderTools() {
  if (!els.toolsPanel) return;
  els.packingList.innerHTML = renderChecklist("packing", trip.tools.packing);
  els.medsList.innerHTML = renderChecklist("meds", trip.tools.meds);
  els.shoppingList.innerHTML = trip.tools.shopping
    .map(
      (item) => `
        <label class="tool-row">
          <input type="checkbox" data-tool="shopping" data-id="${escapeAttr(item.id)}" ${item.done ? "checked" : ""} />
          <span>${escapeHtml(item.person || "我")}｜${escapeHtml(item.title || "未命名購物")}｜¥${formatMoney(item.amount || 0)}</span>
        </label>
      `
    )
    .join("");
  els.emergencyList.innerHTML = trip.tools.emergency
    .map(
      (item) => `
        <article class="emergency-row">
          <strong>${escapeHtml(item.title)}</strong>
          <a href="tel:${escapeAttr(String(item.value).replace(/[^\d+]/g, ""))}">${escapeHtml(item.value)}</a>
          <small>${escapeHtml(item.note)}</small>
        </article>
      `
    )
    .join("");
}

function renderChecklist(type, items) {
  return items
    .map(
      (item) => `
        <label class="tool-row">
          <input type="checkbox" data-tool="${escapeAttr(type)}" data-id="${escapeAttr(item.id)}" ${item.done ? "checked" : ""} />
          <span>${escapeHtml(item.text)}</span>
        </label>
      `
    )
    .join("");
}

function toggleToolItem(type, id, checked) {
  const list = trip.tools[type];
  const item = list?.find((entry) => entry.id === id);
  if (!item) return;
  item.done = checked;
  persistPersonalItem(type, item).catch((error) => updateSyncStatus(`個人清單同步失敗：${error.message}`));
  saveTrip();
  renderTools();
}

function addShoppingItem() {
  const title = document.querySelector("#shoppingTitle").value.trim();
  const amount = Number(document.querySelector("#shoppingAmount").value || 0);
  const person = currentDisplayName() || document.querySelector("#shoppingPerson").value.trim() || "我";
  if (!title) return;
  const item = { id: crypto.randomUUID(), ownerUserId: currentUserId(), person, title, amount, done: false };
  trip.tools.shopping.push(item);
  document.querySelector("#shoppingTitle").value = "";
  document.querySelector("#shoppingAmount").value = "";
  persistPersonalItem("shopping", item).catch((error) => updateSyncStatus(`購物清單同步失敗：${error.message}`));
  saveTrip();
  renderTools();
}

function openFamilyLocation(person) {
  const item = (trip.familyLocations || []).find((entry) => entry.person === person);
  if (!item) return;
  els.familyLocationTitle.textContent = `${item.person} 的最後定位`;
  els.familyLocationMeta.textContent = `${item.time || "尚未記錄時間"}｜${item.note || ""}`;
  els.familyLocationFrame.src = `https://www.openstreetmap.org/export/embed.html?bbox=${item.lng - 0.014}%2C${item.lat - 0.011}%2C${item.lng + 0.014}%2C${item.lat + 0.011}&layer=mapnik&marker=${item.lat}%2C${item.lng}`;
  els.familyLocationDialog.showModal();
}

function setAppView(view) {
  const tools = view === "tools";
  document.body.classList.toggle("tools-view", tools);
  document.querySelector("#tripViewBtn").classList.toggle("primary", !tools);
  document.querySelector("#toolsViewBtn").classList.toggle("primary", tools);
}

function openStopView(stop) {
  const day = currentDay();
  const index = day.stops.findIndex((item) => item.id === stop.id);
  const nextStop = day.stops[index + 1];
  const route = stop.routeToNext || {};
  document.querySelector("#viewStopId").value = stop.id;
  document.querySelector("#viewStopTitle").textContent = `${stop.time || "--:--"} ${stop.title || "未命名行程"}`;
  document.querySelector("#viewStopContent").innerHTML = `
    <p><strong>交通：</strong>${escapeHtml(stop.transport || "尚未設定")}</p>
    <p><strong>晴天重點：</strong>${escapeHtml(stop.summary || "尚未填寫")}</p>
    <p><strong>雨天備案：</strong>${escapeHtml(stop.rainPlan || "尚未設定")}</p>
    <p><strong>預估花費：</strong>¥${formatMoney(stop.budget || 0)}</p>
    ${nextStop ? `<p><strong>下一段路線：</strong>${escapeHtml(route.transport || recommendRoute(stop, nextStop, route.mode || "driving"))}</p>` : ""}
    <div class="stop-actions">
      <button class="link-button open-link" type="button" data-url="${escapeAttr(primaryStopUrl(stop))}" ${primaryStopUrl(stop) ? "" : "disabled"}>${escapeHtml(primaryStopLabel(stop))}</button>
      <button class="link-button open-link" type="button" data-url="${escapeAttr(stop.maps || "")}" ${stop.maps ? "" : "disabled"}>開啟定位</button>
      ${nextStop ? `<button class="link-button open-link" type="button" data-url="${escapeAttr(route.url || routeUrl(stop, nextStop, route.mode || "driving"))}">開啟下一段路線</button><button class="link-button copy-link" type="button" data-url="${escapeAttr(route.url || routeUrl(stop, nextStop, route.mode || "driving"))}">複製路線</button>` : ""}
    </div>
  `;
  trip.selectedStopId = stop.id;
  saveTrip();
  renderSidePanels();
  els.stopViewDialog.showModal();
}

function openStopViewById(stopId) {
  const stop = currentDay().stops.find((item) => item.id === stopId);
  if (stop) openStopView(stop);
}

window.openStopViewById = openStopViewById;

function openEditor(stop) {
  const day = currentDay();
  els.stopDay.innerHTML = trip.days.map((item) => `<option value="${item.id}">${escapeHtml(item.label)} ${escapeHtml(item.date)}</option>`).join("");
  document.querySelector("#dialogTitle").textContent = stop ? "編輯行程" : "新增景點";
  document.querySelector("#stopId").value = stop?.id || "";
  document.querySelector("#stopDay").value = day.id;
  document.querySelector("#stopTime").value = stop?.time || "12:00";
  document.querySelector("#stopTitle").value = stop?.title || "";
  document.querySelector("#stopTransport").value = stop?.transport || "";
  document.querySelector("#stopTags").value = (stop?.tags || []).join(",");
  document.querySelector("#stopSummary").value = stop?.summary || "";
  document.querySelector("#stopRain").value = stop?.rainPlan || "";
  document.querySelector("#stopBudget").value = stop?.budget || "";
  document.querySelector("#stopLinkLabel").value = stop?.linkLabel || "";
  document.querySelector("#stopOfficial").value = stop?.official || "";
  document.querySelector("#stopMaps").value = stop?.maps || "";
  document.querySelector("#stopCoords").value = stop?.coords ? stop.coords.join(",") : "";
  document.querySelector("#deleteStopBtn").style.visibility = stop ? "visible" : "hidden";
  els.stopDialog.showModal();
}

function openDayEditor() {
  const day = currentDay();
  document.querySelector("#dayLabel").value = day.label;
  document.querySelector("#dayTitle").value = day.date;
  els.dayDialog.showModal();
}

function openHotelEditor() {
  const hotel = currentDay().hotel;
  document.querySelector("#hotelName").value = hotel.name || "";
  document.querySelector("#hotelAddress").value = hotel.address || "";
  document.querySelector("#hotelPhone").value = hotel.phone || "";
  document.querySelector("#hotelMaps").value = hotel.maps || "";
  document.querySelector("#hotelNote").value = hotel.note || "";
  els.hotelDialog.showModal();
}

function openRouteEditor(fromId) {
  const stop = currentDay().stops.find((item) => item.id === fromId);
  const nextStop = currentDay().stops[currentDay().stops.findIndex((item) => item.id === fromId) + 1];
  const route = stop.routeToNext || { transport: "", mode: "driving", url: "", note: "" };
  const mode = route.mode || "driving";
  document.querySelector("#routeFromId").value = fromId;
  document.querySelector("#routeMode").value = mode;
  document.querySelector("#routeTransport").value = route.transport || (nextStop ? recommendRoute(stop, nextStop, mode) : "");
  document.querySelector("#routeUrl").value = route.url || (nextStop ? routeUrl(stop, nextStop, mode) : "");
  document.querySelector("#routeNote").value = route.note || "";
  els.routeDialog.showModal();
}

function openPeopleEditor() {
  document.querySelector("#peopleNames").value = trip.people.join(",");
  els.peopleDialog.showModal();
}

function openExpenseEditor(expense) {
  const people = trip.people;
  document.querySelector("#expenseId").value = expense?.id || "";
  document.querySelector("#expenseTitle").value = expense?.title || "";
  document.querySelector("#expenseAmount").value = expense?.amount || "";
  document.querySelector("#expensePayer").innerHTML = people.map((person) => `<option value="${escapeAttr(person)}">${escapeHtml(person)}</option>`).join("");
  document.querySelector("#expensePayer").value = expense?.payer || people[0];
  document.querySelector("#expensePeople").value = (expense?.people || people).join(",");
  document.querySelector("#deleteExpenseBtn").style.visibility = expense ? "visible" : "hidden";
  els.expenseDialog.showModal();
}

function moveStop(stopId, direction) {
  const day = currentDay();
  const index = day.stops.findIndex((stop) => stop.id === stopId);
  const next = index + direction;
  if (next < 0 || next >= day.stops.length) return;
  const [item] = day.stops.splice(index, 1);
  day.stops.splice(next, 0, item);
  saveTrip();
  render();
}

function moveStopTo(stopId, targetId) {
  if (stopId === targetId) return;
  const day = currentDay();
  const from = day.stops.findIndex((stop) => stop.id === stopId);
  const to = day.stops.findIndex((stop) => stop.id === targetId);
  if (from < 0 || to < 0) return;
  const [item] = day.stops.splice(from, 1);
  day.stops.splice(to, 0, item);
  persistStopOrder(day);
}

function persistStopOrder(day) {
  day.manualOrder = true;
  day.stops.forEach((stop, index) => {
    stop.order = (index + 1) * 1000;
    stampRecord(stop, "stop", stop.id);
    queueMutation("stop", stop.id, "update", stop, ["order"]);
  });
  saveTrip();
  render();
}

function clearDragState() {
  document.querySelector(".stop-card.dragging")?.classList.remove("dragging", "touch-dragging");
  document.querySelector(".stop-card.pressing")?.classList.remove("pressing");
  document.querySelectorAll(".stop-card.drop-target").forEach((card) => card.classList.remove("drop-target"));
  pointerDown = null;
  pointerDropTarget = null;
  touchDragId = null;
  touchDropTarget = null;
  touchStartPoint = null;
  clearTimeout(touchDragTimer);
  touchDragTimer = null;
}

function initSortableTimeline() {
  if (timelineSortable) timelineSortable.destroy();
  timelineSortable = Sortable.create(els.timeline, {
    draggable: ".stop-card",
    handle: ".drag-cue",
    animation: 180,
    delay: 180,
    delayOnTouchOnly: true,
    ghostClass: "dragging",
    chosenClass: "pressing",
    dragClass: "touch-dragging",
    filter: "input, button, a",
    preventOnFilter: false,
    onMove: (event) => event.related?.classList?.contains("stop-card") !== false,
    onEnd: (event) => {
      const stopId = event.item?.dataset.stop;
      const oldIndex = Number.isFinite(event.oldDraggableIndex) ? event.oldDraggableIndex : event.oldIndex;
      const newIndex = Number.isFinite(event.newDraggableIndex) ? event.newDraggableIndex : event.newIndex;
      if (!stopId || oldIndex === newIndex) {
        clearDragState();
        return;
      }
      moveStopToIndex(stopId, newIndex);
      suppressNextCardClick = true;
      clearDragState();
    }
  });
}

function moveStopToIndex(stopId, toIndex) {
  const day = currentDay();
  const from = day.stops.findIndex((stop) => stop.id === stopId);
  if (from < 0 || toIndex < 0) return;
  const [item] = day.stops.splice(from, 1);
  day.stops.splice(Math.min(toIndex, day.stops.length), 0, item);
  persistStopOrder(day);
}

function findTouchDropTarget(y) {
  const cards = [...document.querySelectorAll(".stop-card")].filter((card) => card.dataset.stop !== touchDragId);
  if (!cards.length) return null;
  return cards.reduce((best, card) => {
    const rect = card.getBoundingClientRect();
    const distance = Math.abs(y - (rect.top + rect.height / 2));
    return !best || distance < best.distance ? { card, distance } : best;
  }, null)?.card;
}

function delayDay(minutes) {
  currentDay().stops.forEach((stop) => {
    stop.time = addMinutes(stop.time, minutes);
  });
  saveTrip();
  render();
}

function setStopTime(stopId, time) {
  const stop = currentDay().stops.find((item) => item.id === stopId);
  if (!stop) return;
  stop.time = time;
  stampRecord(stop, "stop", stop.id);
  queueMutation("stop", stop.id, "update", stop, ["time"]);
  trip.selectedStopId = stop.id;
  currentDay().stops.sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));
  saveTrip();
  render();
}

function exportTrip() {
  const text = buildExportText();
  els.exportText.value = text;
  els.exportStatus.textContent = "可以直接複製貼到 LINE 或家族群組。";
  els.exportDialog.showModal();
}

async function copyExportText() {
  els.exportText.select();
  try {
    await navigator.clipboard.writeText(els.exportText.value);
    els.exportStatus.textContent = "已複製，可以貼到 LINE。";
  } catch {
    const ok = document.execCommand("copy");
    els.exportStatus.textContent = ok ? "已複製，可以貼到 LINE。" : "瀏覽器不允許自動複製，請手動選取文字複製。";
  }
}

async function nativeShare() {
  const text = els.exportText.value || buildExportText();
  if (!navigator.share) {
    els.exportStatus.textContent = "這個瀏覽器沒有系統分享，請用複製文字。";
    return;
  }
  try {
    await navigator.share({ title: "沖繩家庭旅程", text });
    els.exportStatus.textContent = "已開啟系統分享。";
  } catch {
    els.exportStatus.textContent = "分享已取消，文字仍可複製。";
  }
}

function openExternalUrl(url) {
  const normalized = normalizeUrl(url);
  if (!normalized || normalized === "#") {
    alert("尚未設定連結。");
    return;
  }
  const opened = window.open(normalized, "_blank", "noopener,noreferrer");
  if (!opened) window.location.href = normalized;
}

window.openExternalUrl = openExternalUrl;

async function copyText(text, message = "已複製連結。") {
  try {
    await navigator.clipboard.writeText(text);
    alert(message);
  } catch {
    const box = document.createElement("textarea");
    box.value = text;
    document.body.appendChild(box);
    box.select();
    document.execCommand("copy");
    box.remove();
    alert(message);
  }
}

async function showInstallLink() {
  let url = `${location.origin}/?v=31`;
  try {
    if (hasLocalCsvApi()) {
      const response = await fetch("/api/install-link");
      const payload = await response.json();
      if (payload.url) url = payload.url;
    }
  } catch {
    // Fallback keeps the current origin, useful for hosted deployments.
  }
  els.installShareText.value = `沖繩家庭旅程 app：\n${url}\n\niPhone 用 Safari 打開後「分享 → 加入主畫面」；Android 用 Chrome 打開後「安裝應用程式 / 加到主畫面」。`;
  els.installLinkDialog.showModal();
}

function exportSyncFile() {
  const blob = new Blob([JSON.stringify(statePayload(), null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `okinawa-trip-sync-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  URL.revokeObjectURL(link.href);
  link.remove();
}

function importSyncFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const text = String(reader.result || "");
      let payload;
      if (file.name.endsWith(".csv")) {
        const jsonCell = text.split(/\r?\n/).slice(1).join("\n").match(/^trip_state,current,"([\s\S]*)"\s*$/)?.[1];
        payload = JSON.parse((jsonCell || "").replaceAll('""', '"'));
      } else {
        payload = JSON.parse(text);
      }
      const incoming = payload.trip ? payload : { trip: payload };
      trip = migrateTrip(incoming.trip);
      if (Array.isArray(incoming.trackPoints)) trackPoints = incoming.trackPoints;
      saveTrip();
      saveTrack();
      render();
      alert("同步檔已匯入。");
    } catch {
      alert("無法讀取同步檔，請確認檔案是這個 app 匯出的 JSON 或 CSV。");
    }
  };
  reader.readAsText(file, "utf-8");
}

function openSyncConfig() {
  const config = loadSyncConfig();
  document.querySelector("#supabaseUrl").value = config.url || "";
  document.querySelector("#supabaseAnonKey").value = config.anonKey || "";
  document.querySelector("#syncTripId").value = config.tripId || "okinawa-family-2026";
  document.querySelector("#syncUserName").value = config.userName || "";
  els.syncDialog.showModal();
}

function handleSyncConfigSave() {
  const config = {
    url: document.querySelector("#supabaseUrl").value.trim().replace(/\/$/, ""),
    anonKey: document.querySelector("#supabaseAnonKey").value.trim(),
    tripId: document.querySelector("#syncTripId").value.trim() || "okinawa-family-2026",
    userName: document.querySelector("#syncUserName").value.trim()
  };
  saveSyncConfig(config);
  updateSyncStatus("同步設定已儲存；有網路時可按「立即同步」。");
}

function clearSyncConfig() {
  localStorage.removeItem(SYNC_CONFIG_KEY);
  updateSyncStatus("已清除 Supabase 設定；資料會保留在本機與 CSV。");
  els.syncDialog.close();
}

async function syncNow(skipPreview = false) {
  const config = loadSyncConfig();
  if (!config.url || !config.anonKey) {
    updateSyncStatus("尚未設定 Supabase；目前已存到本機與 CSV，可離線繼續使用。");
    openSyncConfig();
    return;
  }
  if (!skipPreview && syncQueue.length) {
    renderSyncPreview();
    return;
  }
  updateSyncStatus("正在同步 Supabase...");
  try {
    const remoteRows = await fetchRemoteRows(config);
    const conflicts = findConflicts(remoteRows);
    if (conflicts.length) {
      renderConflicts(conflicts);
      updateSyncStatus(`發現 ${conflicts.length} 筆同步衝突，請選擇要保留的版本。`);
      return;
    }
    if (syncQueue.length) await pushQueuedRows(config);
    syncQueue = [];
    saveJson(SYNC_QUEUE_KEY, syncQueue);
    resolvedLocalConflicts = new Set();
    Object.keys(recordMeta).forEach((key) => {
      recordMeta[key].dirty = false;
    });
    saveJson(RECORD_META_KEY, recordMeta);
    mergeRemoteRows(remoteRows);
    saveTrip();
    render();
    updateSyncStatus("同步完成。");
  } catch (error) {
    updateSyncStatus(`同步失敗：${error.message || "未知錯誤"}。已保留 ${syncQueue.length} 筆待同步變更。`);
    console.warn(error);
  }
}

function renderSyncPreview() {
  els.syncPreviewList.innerHTML = buildSyncPreviewItems(syncQueue)
    .map((item) => `<article class="sync-preview-item"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.body)}</span></article>`)
    .join("");
  els.syncPreviewDialog.showModal();
  updateSyncStatus(`準備同步 ${syncQueue.length} 筆變更，請確認內容。`);
}

function buildSyncPreviewItems(queue) {
  return queue.map((item) => ({
    title: readableRecordTitle(item),
    body: readableMutationText(item)
  }));
}

async function loadTripFromSupabase() {
  const client = getSupabaseClient();
  const config = loadSyncConfig();
  if (!client || !authSession || !currentMember) return;
  try {
    const [daysResult, hotelsResult, stopsResult, routesResult, expensesResult, participantsResult, itemsResult, contactsResult, locationsResult] = await Promise.all([
      client.from("trip_days").select("*").eq("trip_id", config.tripId).is("deleted_at", null).order("sort_order"),
      client.from("trip_hotels").select("*").eq("trip_id", config.tripId).is("deleted_at", null),
      client.from("trip_stops").select("*").eq("trip_id", config.tripId).is("deleted_at", null).order("sort_order"),
      client.from("trip_routes").select("*").eq("trip_id", config.tripId).is("deleted_at", null),
      client.from("expenses").select("*").eq("trip_id", config.tripId).is("deleted_at", null),
      client.from("expense_participants").select("*"),
      client.from("personal_items").select("*").eq("trip_id", config.tripId).is("deleted_at", null).order("created_at"),
      client.from("emergency_contacts").select("*").eq("trip_id", config.tripId).is("deleted_at", null).order("sort_order"),
      client.from("location_points").select("*").eq("trip_id", config.tripId).is("deleted_at", null).order("recorded_at", { ascending: false }).limit(80)
    ]);
    const blockingError = [daysResult, hotelsResult, stopsResult, routesResult, expensesResult, itemsResult, contactsResult, locationsResult].find((result) => result.error)?.error;
    if (blockingError) throw blockingError;
    if (!daysResult.data?.length) {
      updateSyncStatus("Supabase 已登入，正在初始化正規化行程資料...");
      await seedNormalizedTrip();
      updateSyncStatus("已把目前行程初始化到 Supabase。");
      return;
    }
    trip = tripFromNormalizedRows({
      days: daysResult.data || [],
      hotels: hotelsResult.data || [],
      stops: stopsResult.data || [],
      routes: routesResult.data || [],
      expenses: expensesResult.data || [],
      participants: participantsResult.data || [],
      items: itemsResult.data || [],
      contacts: contactsResult.data || [],
      locations: locationsResult.data || []
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
    saveTrack();
    updateSyncStatus("已從 Supabase 讀取最新旅程。");
  } catch (error) {
    updateSyncStatus(`讀取 Supabase 正規化資料失敗：${error.message || "未知錯誤"}。目前顯示本機快取。`);
  }
}

async function seedNormalizedTrip() {
  const client = getSupabaseClient();
  if (!client || !authSession || !currentMember) return;
  for (const [dayIndex, day] of trip.days.entries()) {
    day.sort_order = (dayIndex + 1) * 1000;
    await upsertNormalizedDay(client, day);
    if (day.hotel) await upsertNormalizedHotel(client, day.hotel);
    for (const [stopIndex, stop] of day.stops.entries()) {
      stop.order = (stopIndex + 1) * 1000;
      await upsertNormalizedStop(client, stop);
    }
  }
  for (const expense of trip.expenses) {
    await upsertNormalizedExpense(client, expense);
  }
  for (const item of trip.tools.packing) await persistPersonalItem("packing", { ...item, person: currentDisplayName(), ownerUserId: currentUserId(), title: item.text });
  for (const item of trip.tools.meds) await persistPersonalItem("meds", { ...item, person: currentDisplayName(), ownerUserId: currentUserId(), title: item.text });
  for (const item of trip.tools.shopping) await persistPersonalItem("shopping", { ...item, ownerUserId: currentUserId() });
  await seedEmergencyContacts(client);
}

async function seedEmergencyContacts(client) {
  const config = loadSyncConfig();
  const rows = trip.tools.emergency.map((item, index) => ({
    trip_id: config.tripId,
    title: item.title,
    value: item.value,
    note: item.note || "",
    sort_order: (index + 1) * 1000,
    updated_by: currentUserId()
  }));
  if (!rows.length) return;
  const { error } = await client.from("emergency_contacts").upsert(rows, { onConflict: "trip_id,title" });
  if (error && error.code !== "23505") throw error;
}

function tripFromNormalizedRows(rows) {
  remoteDayIds = new Map(rows.days.map((day) => [day.legacy_id || day.id, day.id]));
  remoteStopIds = new Map(rows.stops.map((stop) => [stop.legacy_id || stop.id, stop.id]));
  remoteExpenseIds = new Map(rows.expenses.map((expense) => [expense.legacy_id || expense.id, expense.id]));
  const routesByStop = new Map(rows.routes.map((route) => [route.legacy_from_stop_id || route.from_stop_id, route]));
  const hotelsByDay = new Map(rows.hotels.map((hotel) => [hotel.legacy_day_id || hotel.day_id, hotel]));
  const stopsByDay = new Map();
  rows.stops.forEach((stop) => {
    const dayKey = stop.legacy_day_id || stop.day_id;
    if (!stopsByDay.has(dayKey)) stopsByDay.set(dayKey, []);
    stopsByDay.get(dayKey).push(stop);
  });
  const people = rows.participants?.length
    ? [...new Set(rows.participants.map((item) => item.person_name).filter(Boolean))]
    : [currentDisplayName()];
  const nextTrip = structuredClone(defaultTrip);
  nextTrip.people = people.length ? people : [currentDisplayName()];
  nextTrip.familyLocations = latestLocationsByPerson(rows.locations);
  nextTrip.days = rows.days.map((day) => {
    const dayKey = day.legacy_id || day.id;
    const hotel = hotelsByDay.get(dayKey);
    const stops = (stopsByDay.get(dayKey) || []).map((stop) => normalizedStop(stop, routesByStop.get(stop.legacy_id || stop.id)));
    return {
      id: day.legacy_id || day.id,
      label: day.label,
      date: day.title,
      manualOrder: true,
      hotel: hotel
        ? {
            id: hotel.id,
            name: hotel.name || "",
            address: hotel.address || "",
            phone: hotel.phone || "",
            maps: hotel.maps_url || "",
            note: hotel.note || ""
          }
        : structuredClone(defaultTrip.days[0].hotel),
      stops
    };
  });
  nextTrip.expenses = rows.expenses.map((expense) => ({
    id: expense.legacy_id || expense.id,
    title: expense.title,
    amount: Number(expense.amount || 0),
    payer: expense.payer_name || currentDisplayName(),
    people: rows.participants.filter((item) => item.expense_id === expense.id).map((item) => item.person_name)
  }));
  nextTrip.tools = toolsFromPersonalItems(rows.items, rows.contacts);
  nextTrip.selectedDay = nextTrip.days[0]?.id || "day1";
  nextTrip.selectedStopId = nextTrip.days[0]?.stops?.[0]?.id || "";
  return migrateTrip(nextTrip);
}

function normalizedStop(stop, route) {
  return {
    id: stop.legacy_id || stop.id,
    time: stop.stop_time ? String(stop.stop_time).slice(0, 5) : "12:00",
    title: stop.title,
    transport: stop.transport || "",
    summary: stop.summary || "",
    rainPlan: stop.rain_plan || "",
    tags: stop.tags || [],
    budget: Number(stop.budget || 0),
    linkLabel: stop.link_label || "",
    official: stop.official_url || "",
    maps: stop.maps_url || "",
    coords: stop.lat && stop.lng ? [Number(stop.lat), Number(stop.lng)] : null,
    order: Number(stop.sort_order || 1000),
    routeToNext: {
      id: route?.id || `${stop.legacy_id || stop.id}-route`,
      transport: route?.transport || "",
      mode: route?.mode || "driving",
      url: route?.route_url || "",
      note: route?.note || ""
    }
  };
}

function toolsFromPersonalItems(items, contacts) {
  const byType = (type) =>
    items
      .filter((item) => item.item_type === type)
      .map((item) => ({
        id: item.id,
        ownerUserId: item.owner_user_id,
        person: item.owner_name,
        text: item.title,
        title: item.title,
        amount: Number(item.amount || 0),
        done: Boolean(item.done)
      }));
  return {
    packing: byType("packing"),
    meds: byType("meds"),
    shopping: byType("shopping"),
    emergency: contacts.length
      ? contacts.map((item) => ({ id: item.id, title: item.title, value: item.value, note: item.note || "" }))
      : structuredClone(defaultTrip.tools.emergency)
  };
}

function latestLocationsByPerson(locations) {
  const seen = new Set();
  const result = [];
  locations.forEach((item) => {
    if (seen.has(item.owner_user_id)) return;
    seen.add(item.owner_user_id);
    result.push({
      person: item.display_name,
      lat: Number(item.lat),
      lng: Number(item.lng),
      time: new Date(item.recorded_at).toLocaleString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      note: item.note || `精準度約 ${Math.round(Number(item.accuracy || 0))} 公尺`
    });
  });
  return result.length ? result.slice(0, 4) : structuredClone(defaultTrip.familyLocations);
}

function readableRecordTitle(item) {
  const data = item.data || {};
  const entityName = {
    day: "日期標題",
    stop: "行程",
    route: "路線",
    hotel: "住宿",
    expense: "花費",
    people: "參與人員"
  }[item.entity] || "資料";
  return `${entityName}：${data.title || data.name || data.label || item.record_id}`;
}

function readableMutationText(item) {
  if (item.op === "delete") return "刪除這筆資料。";
  const labels = {
    time: "時間",
    title: "名稱",
    transport: "交通方式",
    summary: "晴天重點",
    rainPlan: "雨天備案",
    tags: "標籤",
    budget: "預估花費",
    official: "主要連結",
    maps: "定位連結",
    coords: "座標",
    order: "行程順序",
    label: "日期標籤",
    date: "行程標題",
    people: "參與人員",
    amount: "金額",
    payer: "付款人"
  };
  const fields = (item.fields || []).map((field) => labels[field] || field).join("、");
  return `${item.op === "create" ? "新增" : "更新"}：${fields || "內容"}。`;
}

async function fetchRemoteRows(config) {
  const url = `${config.url}/rest/v1/trip_records?trip_id=eq.${encodeURIComponent(config.tripId)}&select=*`;
  const response = await fetch(url, { headers: supabaseHeaders(config) });
  if (!response.ok) throw new Error(`pull failed ${response.status}`);
  return response.json();
}

async function pushQueuedRows(config) {
  const allowedEntities = new Set(["day", "stop", "route", "hotel", "expense", "people"]);
  const merged = new Map();
  syncQueue.forEach((mutation) => {
    if (!allowedEntities.has(mutation.entity)) return;
    const key = `${mutation.entity}:${mutation.record_id}`;
    const previous = merged.get(key);
    merged.set(key, previous ? { ...mutation, fields: [...new Set([...(previous.fields || []), ...(mutation.fields || [])])] } : mutation);
  });
  const rows = [...merged.values()].map((mutation) => ({
    trip_id: config.tripId,
    entity: mutation.entity,
    record_id: mutation.record_id,
    op: mutation.op,
    fields: mutation.fields,
    data: mutation.data,
    updated_at: mutation.updated_at,
    updated_by: mutation.updated_by,
    deleted_at: mutation.data?.deleted_at || null,
    version: mutation.version
  }));
  if (!rows.length) return;
  await pushNormalizedMutations([...merged.values()]);
  const response = await fetch(`${config.url}/rest/v1/trip_records?on_conflict=trip_id,entity,record_id`, {
    method: "POST",
    headers: { ...supabaseHeaders(config), Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify(rows)
  });
  if (!response.ok) throw new Error(`push failed ${response.status}: ${(await response.text()).slice(0, 160)}`);
}

function supabaseHeaders(config) {
  const token = authSession?.access_token || config.anonKey;
  return {
    apikey: config.anonKey,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };
}

async function pushNormalizedMutations(mutations) {
  const client = getSupabaseClient();
  if (!client || !authSession || !currentMember || !navigator.onLine) return;
  for (const mutation of mutations) {
    await pushNormalizedMutation(client, mutation);
  }
}

async function pushNormalizedMutation(client, mutation) {
  if (mutation.entity === "day") return upsertNormalizedDay(client, mutation.data, mutation.op);
  if (mutation.entity === "stop") return upsertNormalizedStop(client, mutation.data, mutation.op);
  if (mutation.entity === "route") return upsertNormalizedRoute(client, mutation.data, mutation.op);
  if (mutation.entity === "hotel") return upsertNormalizedHotel(client, mutation.data, mutation.op);
  if (mutation.entity === "expense") return upsertNormalizedExpense(client, mutation.data, mutation.op);
  return null;
}

async function upsertNormalizedDay(client, day, op = "update") {
  const config = loadSyncConfig();
  const remoteId = remoteDayIds.get(day.id);
  const row = {
    trip_id: config.tripId,
    legacy_id: day.id,
    label: day.label || "",
    title: day.date || "",
    sort_order: day.sort_order || orderForLegacyId(trip.days, day.id),
    updated_at: nowIso(),
    updated_by: currentUserId(),
    deleted_at: op === "delete" ? nowIso() : null,
    version: Number(day.version || 1)
  };
  const query = remoteId ? client.from("trip_days").update(row).eq("id", remoteId).select("id").single() : client.from("trip_days").upsert(row, { onConflict: "trip_id,legacy_id" }).select("id").single();
  const { data, error } = await query;
  if (error) throw error;
  if (data?.id) remoteDayIds.set(day.id, data.id);
}

async function upsertNormalizedHotel(client, hotel, op = "update") {
  const config = loadSyncConfig();
  const day = trip.days.find((item) => item.hotel === hotel || item.hotel?.id === hotel.id) || currentDay();
  await ensureRemoteDay(client, day);
  const row = {
    trip_id: config.tripId,
    day_id: remoteDayIds.get(day.id),
    legacy_day_id: day.id,
    name: hotel.name || "",
    address: hotel.address || "",
    phone: hotel.phone || "",
    maps_url: hotel.maps || "",
    note: hotel.note || "",
    updated_at: nowIso(),
    updated_by: currentUserId(),
    deleted_at: op === "delete" ? nowIso() : null,
    version: Number(hotel.version || 1)
  };
  const { error } = await client.from("trip_hotels").upsert(row, { onConflict: "trip_id,legacy_day_id" });
  if (error) throw error;
}

async function upsertNormalizedStop(client, stop, op = "update") {
  const config = loadSyncConfig();
  const day = trip.days.find((item) => item.stops.some((candidate) => candidate.id === stop.id)) || currentDay();
  await ensureRemoteDay(client, day);
  const remoteId = remoteStopIds.get(stop.id);
  const row = {
    trip_id: config.tripId,
    day_id: remoteDayIds.get(day.id),
    legacy_id: stop.id,
    legacy_day_id: day.id,
    stop_time: stop.time || null,
    title: stop.title || "未命名行程",
    transport: stop.transport || "",
    summary: stop.summary || "",
    rain_plan: stop.rainPlan || "",
    tags: stop.tags || [],
    budget: Number(stop.budget || 0),
    link_label: stop.linkLabel || "",
    official_url: stop.official || "",
    maps_url: stop.maps || "",
    lat: Array.isArray(stop.coords) ? stop.coords[0] : null,
    lng: Array.isArray(stop.coords) ? stop.coords[1] : null,
    sort_order: Number(stop.order || orderForLegacyId(day.stops, stop.id)),
    updated_at: nowIso(),
    updated_by: currentUserId(),
    deleted_at: op === "delete" ? nowIso() : null,
    version: Number(stop.version || 1)
  };
  const query = remoteId ? client.from("trip_stops").update(row).eq("id", remoteId).select("id").single() : client.from("trip_stops").upsert(row, { onConflict: "trip_id,legacy_id" }).select("id").single();
  const { data, error } = await query;
  if (error) throw error;
  if (data?.id) remoteStopIds.set(stop.id, data.id);
  if (op !== "update-no-route" && stop.routeToNext) await upsertNormalizedRoute(client, stop.routeToNext, "update", stop);
}

async function upsertNormalizedRoute(client, route, op = "update", sourceStop = null) {
  const config = loadSyncConfig();
  const stop = sourceStop || trip.days.flatMap((day) => day.stops).find((item) => item.routeToNext === route || item.routeToNext?.id === route.id);
  if (!stop) return;
  await upsertNormalizedStop(client, stop, "update-no-route");
  const day = trip.days.find((item) => item.stops.some((candidate) => candidate.id === stop.id));
  const index = day?.stops.findIndex((item) => item.id === stop.id) ?? -1;
  const nextStop = index >= 0 ? day.stops[index + 1] : null;
  if (nextStop) await ensureRemoteStop(client, nextStop);
  const row = {
    trip_id: config.tripId,
    from_stop_id: remoteStopIds.get(stop.id),
    to_stop_id: nextStop ? remoteStopIds.get(nextStop.id) : null,
    legacy_from_stop_id: stop.id,
    transport: route.transport || "",
    mode: route.mode || "driving",
    route_url: route.url || "",
    note: route.note || "",
    updated_at: nowIso(),
    updated_by: currentUserId(),
    deleted_at: op === "delete" ? nowIso() : null,
    version: Number(route.version || 1)
  };
  const { error } = await client.from("trip_routes").upsert(row, { onConflict: "trip_id,legacy_from_stop_id" });
  if (error) throw error;
}

async function upsertNormalizedExpense(client, expense, op = "update") {
  const config = loadSyncConfig();
  const remoteId = remoteExpenseIds.get(expense.id);
  const row = {
    trip_id: config.tripId,
    legacy_id: expense.id,
    title: expense.title || "未命名花費",
    amount: Number(expense.amount || 0),
    payer_name: expense.payer || "",
    updated_at: nowIso(),
    updated_by: currentUserId(),
    deleted_at: op === "delete" ? nowIso() : null,
    version: Number(expense.version || 1)
  };
  const query = remoteId ? client.from("expenses").update(row).eq("id", remoteId).select("id").single() : client.from("expenses").upsert(row, { onConflict: "trip_id,legacy_id" }).select("id").single();
  const { data, error } = await query;
  if (error) throw error;
  const expenseId = data?.id || remoteId;
  if (expenseId) {
    remoteExpenseIds.set(expense.id, expenseId);
    await client.from("expense_participants").delete().eq("expense_id", expenseId);
    if (op !== "delete") {
      const people = (expense.people?.length ? expense.people : trip.people).map((person) => ({ expense_id: expenseId, person_name: person }));
      if (people.length) {
        const { error: participantError } = await client.from("expense_participants").insert(people);
        if (participantError) throw participantError;
      }
    }
  }
}

async function ensureRemoteDay(client, day) {
  if (remoteDayIds.has(day.id)) return;
  await upsertNormalizedDay(client, day);
}

async function ensureRemoteStop(client, stop) {
  if (remoteStopIds.has(stop.id)) return;
  await upsertNormalizedStop(client, stop, "update-no-route");
}

async function persistPersonalItem(type, item) {
  const client = getSupabaseClient();
  const config = loadSyncConfig();
  if (!client || !authSession || !currentMember || !navigator.onLine) return;
  const row = {
    id: isUuid(item.id) ? item.id : undefined,
    trip_id: config.tripId,
    owner_user_id: item.ownerUserId || currentUserId(),
    owner_name: item.person || currentDisplayName(),
    item_type: type,
    title: item.title || item.text || "未命名項目",
    amount: Number(item.amount || 0),
    done: Boolean(item.done),
    updated_at: nowIso(),
    updated_by: currentUserId(),
    version: Number(item.version || 1)
  };
  const { data, error } = await client.from("personal_items").upsert(row).select("id").single();
  if (error) throw error;
  if (data?.id) item.id = data.id;
}

async function persistLocationPoint(point) {
  const client = getSupabaseClient();
  const config = loadSyncConfig();
  if (!client || !authSession || !currentMember || !navigator.onLine) return;
  const { error } = await client.from("location_points").insert({
    trip_id: config.tripId,
    owner_user_id: currentUserId(),
    display_name: currentDisplayName(),
    lat: point.lat,
    lng: point.lng,
    accuracy: point.accuracy,
    recorded_at: point.time,
    note: `精準度約 ${Math.round(Number(point.accuracy || 0))} 公尺`,
    updated_by: currentUserId()
  });
  if (error) throw error;
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}

function orderForLegacyId(items, id) {
  const index = items.findIndex((item) => item.id === id);
  return (index + 1) * 1000;
}

function findConflicts(remoteRows) {
  const queuedByRecord = new Map(syncQueue.map((item) => [`${item.entity}:${item.record_id}`, item]));
  return remoteRows
    .filter((row) => {
      const key = `${row.entity}:${row.record_id}`;
      const local = queuedByRecord.get(key);
      if (!local) return false;
      if (resolvedLocalConflicts.has(key)) return false;
      if (row.updated_by === local.updated_by) return false;
      if (row.deleted_at && local.op !== "delete") return true;
      const remoteFields = Array.isArray(row.fields) ? row.fields : Object.keys(row.data || {});
      return local.fields.some((field) => remoteFields.includes(field));
    })
    .map((row) => ({ remote: row, local: queuedByRecord.get(`${row.entity}:${row.record_id}`) }));
}

function renderConflicts(conflicts) {
  els.conflictList.innerHTML = conflicts
    .map(
      (conflict, index) => `
        <section class="conflict-card">
          <h3>${escapeHtml(readableRecordTitle(conflict.local))}</h3>
          <p class="muted">${escapeHtml(conflict.remote.updated_by || "其他家人")} 與 ${escapeHtml(conflict.local.updated_by || "我")} 修改了同一筆資料。</p>
          <div class="conflict-versions">
            <div>
              <strong>雲端版本</strong>
              <p>${escapeHtml(readableRecordSummary(conflict.remote.data || {}))}</p>
              <button type="button" data-conflict="${index}" data-choice="remote">保留雲端</button>
            </div>
            <div>
              <strong>我的版本</strong>
              <p>${escapeHtml(readableRecordSummary(conflict.local.data || {}))}</p>
              <button class="primary" type="button" data-conflict="${index}" data-choice="local">保留我的</button>
            </div>
          </div>
        </section>
      `
    )
    .join("");
  els.conflictList.dataset.conflicts = JSON.stringify(conflicts);
  els.conflictDialog.showModal();
}

function readableRecordSummary(data) {
  const lines = [];
  if (data.time || data.title) lines.push(`${data.time || ""} ${data.title || ""}`.trim());
  if (data.name) lines.push(data.name);
  if (data.transport) lines.push(`交通：${data.transport}`);
  if (data.summary) lines.push(`重點：${data.summary}`);
  if (data.amount) lines.push(`金額：¥${formatMoney(data.amount)}`);
  if (Array.isArray(data.people)) lines.push(`人員：${data.people.join("、")}`);
  return lines.filter(Boolean).join("｜") || "這筆資料的內容已變更。";
}

function resolveConflict(index, choice) {
  const conflicts = JSON.parse(els.conflictList.dataset.conflicts || "[]");
  const conflict = conflicts[index];
  if (!conflict) return;
  if (choice === "remote") {
    applyRecord(conflict.remote.entity, conflict.remote.record_id, conflict.remote.data, Boolean(conflict.remote.deleted_at));
    syncQueue = syncQueue.filter((item) => !(item.entity === conflict.local.entity && item.record_id === conflict.local.record_id));
    saveJson(SYNC_QUEUE_KEY, syncQueue);
    saveTrip();
    render();
  } else {
    const key = `${conflict.local.entity}:${conflict.local.record_id}`;
    resolvedLocalConflicts.add(key);
    const local = syncQueue.find((item) => item.entity === conflict.local.entity && item.record_id === conflict.local.record_id);
    if (local) {
      local.updated_at = nowIso();
      local.updated_by = syncUserName();
      local.version = Number(local.version || 1) + 1;
      local.data.updated_at = local.updated_at;
      local.data.updated_by = local.updated_by;
      local.data.version = local.version;
      saveJson(SYNC_QUEUE_KEY, syncQueue);
    }
  }
  els.conflictDialog.close();
  updateSyncStatus(choice === "remote" ? "已保留雲端版本；其他待同步變更仍保留。" : "已保留我的版本；請再按一次立即同步上傳。");
}

function mergeRemoteRows(rows) {
  rows.forEach((row) => {
    const key = `${row.entity}:${row.record_id}`;
    if (recordMeta[key]?.dirty) return;
    applyRecord(row.entity, row.record_id, row.data, Boolean(row.deleted_at));
  });
}

function applyRecord(entity, id, data, deleted = false) {
  if (!data) return;
  if (entity === "people") {
    if (!deleted && Array.isArray(data.people)) trip.people = data.people;
    return;
  }
  if (entity === "expense") {
    trip.expenses = trip.expenses.filter((expense) => expense.id !== id);
    if (!deleted) trip.expenses.push(data);
    return;
  }
  const day = trip.days.find((item) => item.id === id || item.hotel?.id === id || item.stops.some((stop) => stop.id === id || stop.routeToNext?.id === id));
  if (entity === "day") {
    const target = trip.days.find((item) => item.id === id);
    if (target && !deleted) Object.assign(target, data);
    return;
  }
  if (entity === "hotel" && day) {
    if (!deleted) day.hotel = data;
    return;
  }
  if (entity === "stop" && day) {
    day.stops = day.stops.filter((stop) => stop.id !== id);
    if (!deleted) day.stops.push(data);
    day.stops.sort((a, b) => Number(a.order || 0) - Number(b.order || 0) || (a.time || "99:99").localeCompare(b.time || "99:99"));
    return;
  }
  if (entity === "route" && day) {
    const stop = day.stops.find((item) => item.routeToNext?.id === id || `${item.id}-route` === id);
    if (stop && !deleted) stop.routeToNext = data;
  }
}

function buildExportText() {
  const routeLine = (stop, nextStop) => {
    if (!nextStop) return "";
    const route = stop.routeToNext || {};
    return `  ⇢ 路線：${route.transport || recommendRoute(stop, nextStop, route.mode || "driving")} ${route.url || routeUrl(stop, nextStop, route.mode || "driving")}`;
  };
  const days = trip.days
    .map((day) => {
      const stops = day.stops
        .map((stop, index) => {
          const nextStop = day.stops[index + 1];
          const text = trip.weatherMode === "rain" ? stop.rainPlan : stop.summary;
          return `${stop.time} ${stop.title}\n  交通：${stop.transport}\n  ${trip.weatherMode === "rain" ? "雨天備案" : "重點"}：${text}\n  預估：¥${formatMoney(stop.budget || 0)}\n${routeLine(stop, nextStop)}`.trim();
        })
        .join("\n");
      return `${day.label} ${day.date}\n住宿：${day.hotel.name}｜${day.hotel.address}\n${stops}`;
    })
    .join("\n\n");
  const expenses = trip.expenses.map((expense) => `- ${expense.title} ¥${formatMoney(expense.amount)}｜${expense.payer} 先付`).join("\n");
  return `沖繩家庭旅程（${trip.weatherMode === "rain" ? "雨天備案" : "晴天行程"}）\n\n${days}\n\n花費\n${expenses || "尚未新增花費"}`;
}

function startTracking() {
  if (!navigator.geolocation) {
    els.trackStatus.textContent = "此裝置不支援定位";
    els.helpDialog.showModal();
    return;
  }
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    els.trackBtn.textContent = "開始記錄";
    els.trackStatus.textContent = "已暫停";
    return;
  }
  els.trackBtn.textContent = "停止記錄";
  els.trackStatus.textContent = "等待定位";
  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const lastPoint = trackPoints.findLast?.((point) => !point.sample) || trackPoints.filter((point) => !point.sample).at(-1);
      const now = Date.now();
      if (lastPoint) {
        const elapsed = now - new Date(lastPoint.time).getTime();
        const moved = distanceKm([lastPoint.lat, lastPoint.lng], [position.coords.latitude, position.coords.longitude]) * 1000;
        if (elapsed < TRACK_MIN_INTERVAL_MS && moved < TRACK_MIN_DISTANCE_M) {
          els.trackStatus.textContent = "定位已開啟，10 分鐘或移動 150 公尺才會更新一次";
          return;
        }
      }
      trackPoints.push({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        time: new Date().toISOString()
      });
      const currentPerson = currentDisplayName();
      const latest = trackPoints[trackPoints.length - 1];
      const personLocation = trip.familyLocations.find((item) => item.person === currentPerson) || trip.familyLocations[0];
      if (personLocation) {
        personLocation.lat = latest.lat;
        personLocation.lng = latest.lng;
        personLocation.time = new Date(latest.time).toLocaleString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
        personLocation.note = `精準度約 ${Math.round(position.coords.accuracy)} 公尺`;
      }
      saveTrack();
      persistLocationPoint(latest).catch((error) => updateSyncStatus(`定位同步失敗：${error.message}`));
      els.trackStatus.textContent = `精準度約 ${Math.round(position.coords.accuracy)} 公尺`;
      renderTrack();
    },
    () => {
      els.trackStatus.textContent = "定位被拒絕，請開啟定位權限";
      els.helpDialog.showModal();
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
        els.trackBtn.textContent = "開始記錄";
      }
    },
    { enableHighAccuracy: false, maximumAge: TRACK_MIN_INTERVAL_MS, timeout: 30000 }
  );
}

function saveEditor(action) {
  const id = document.querySelector("#stopId").value;
  const dayId = document.querySelector("#stopDay").value;
  const day = trip.days.find((item) => item.id === dayId);
  const oldDay = trip.days.find((item) => item.stops.some((stop) => stop.id === id));

  if (action === "delete" && id && oldDay) {
    const deleted = oldDay.stops.find((stop) => stop.id === id);
    if (deleted) {
      stampRecord(deleted, "stop", deleted.id, true);
      queueMutation("stop", deleted.id, "delete", deleted, ["deleted_at"]);
    }
    oldDay.stops = oldDay.stops.filter((stop) => stop.id !== id);
    trip.selectedStopId = oldDay.stops[0]?.id || "";
    saveTrip();
    render();
    return;
  }

  const existing = oldDay?.stops.find((stop) => stop.id === id);
  const title = document.querySelector("#stopTitle").value.trim();
  const coords = document.querySelector("#stopCoords").value.split(",").map((value) => Number(value.trim()));
  const item = {
    id: id || crypto.randomUUID(),
    time: document.querySelector("#stopTime").value || "12:00",
    title: title || "未命名行程",
    transport: document.querySelector("#stopTransport").value.trim(),
    routeToNext: existing?.routeToNext || { transport: "", mode: "driving", url: "", note: "" },
    summary: document.querySelector("#stopSummary").value.trim(),
    rainPlan: document.querySelector("#stopRain").value.trim() || "尚未設定雨天備案。",
    tags: parseTags(document.querySelector("#stopTags").value) || existing?.tags || ["自訂", "可調整"],
    budget: Number(document.querySelector("#stopBudget").value || 0),
    linkLabel: document.querySelector("#stopLinkLabel").value.trim(),
    official: normalizeUrl(document.querySelector("#stopOfficial").value.trim()) || "",
    maps: normalizeUrl(document.querySelector("#stopMaps").value.trim()) || "",
    coords: coords.length === 2 && coords.every(Number.isFinite) ? coords : existing?.coords || null,
    order: existing?.order || (day.stops.length + 1) * 1000,
    updated_at: existing?.updated_at,
    updated_by: existing?.updated_by,
    deleted_at: existing?.deleted_at || null,
    version: existing?.version
  };
  stampRecord(item, "stop", item.id);

  if (id && oldDay) oldDay.stops = oldDay.stops.filter((stop) => stop.id !== id);
  day.stops.push(item);
  day.stops.sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));
  trip.selectedDay = day.id;
  trip.selectedStopId = item.id;
  queueMutation("stop", item.id, id ? "update" : "create", item, ["time", "title", "transport", "summary", "rainPlan", "tags", "budget", "official", "maps", "coords"]);
  saveTrip();
  render();
}

function saveDay() {
  const day = currentDay();
  day.label = document.querySelector("#dayLabel").value.trim();
  day.date = document.querySelector("#dayTitle").value.trim();
  stampRecord(day, "day", day.id);
  queueMutation("day", day.id, "update", day, ["label", "date"]);
  saveTrip();
  render();
}

function saveHotel() {
  const day = currentDay();
  const name = document.querySelector("#hotelName").value.trim();
  day.hotel = {
    id: day.hotel.id || `${day.id}-hotel`,
    name,
    address: document.querySelector("#hotelAddress").value.trim(),
    phone: document.querySelector("#hotelPhone").value.trim(),
    maps: document.querySelector("#hotelMaps").value.trim() || mapsSearch(name),
    note: document.querySelector("#hotelNote").value.trim(),
    updated_at: day.hotel.updated_at,
    updated_by: day.hotel.updated_by,
    deleted_at: day.hotel.deleted_at || null,
    version: day.hotel.version
  };
  stampRecord(day.hotel, "hotel", day.hotel.id);
  queueMutation("hotel", day.hotel.id, "update", day.hotel, ["name", "address", "phone", "maps", "note"]);
  saveTrip();
  render();
}

function saveRoute() {
  const stop = currentDay().stops.find((item) => item.id === document.querySelector("#routeFromId").value);
  if (!stop) return;
  const existing = stop.routeToNext || {};
  stop.routeToNext = {
    id: existing.id || `${stop.id}-route`,
    transport: document.querySelector("#routeTransport").value.trim(),
    mode: document.querySelector("#routeMode").value,
    url: normalizeUrl(document.querySelector("#routeUrl").value.trim()),
    note: document.querySelector("#routeNote").value.trim(),
    updated_at: existing.updated_at,
    updated_by: existing.updated_by,
    deleted_at: existing.deleted_at || null,
    version: existing.version
  };
  stampRecord(stop.routeToNext, "route", stop.routeToNext.id);
  queueMutation("route", stop.routeToNext.id, "update", stop.routeToNext, ["transport", "mode", "url", "note"]);
  saveTrip();
  render();
}

function saveExpense(action) {
  const id = document.querySelector("#expenseId").value;
  if (action === "delete" && id) {
    const deleted = trip.expenses.find((expense) => expense.id === id);
    if (deleted) {
      stampRecord(deleted, "expense", deleted.id, true);
      queueMutation("expense", deleted.id, "delete", deleted, ["deleted_at"]);
    }
    trip.expenses = trip.expenses.filter((expense) => expense.id !== id);
    saveTrip();
    render();
    return;
  }
  const people = parsePeople(document.querySelector("#expensePeople").value);
  const existing = trip.expenses.find((expense) => expense.id === id);
  const item = {
    id: id || crypto.randomUUID(),
    title: document.querySelector("#expenseTitle").value.trim(),
    amount: Number(document.querySelector("#expenseAmount").value || 0),
    payer: document.querySelector("#expensePayer").value,
    people,
    updated_at: existing?.updated_at,
    updated_by: existing?.updated_by,
    deleted_at: existing?.deleted_at || null,
    version: existing?.version
  };
  stampRecord(item, "expense", item.id);
  people.forEach((person) => {
    if (!trip.people.includes(person)) trip.people.push(person);
  });
  if (item.payer && !trip.people.includes(item.payer)) trip.people.push(item.payer);
  trip.expenses = trip.expenses.filter((expense) => expense.id !== item.id);
  trip.expenses.push(item);
  queueMutation("expense", item.id, id ? "update" : "create", item, ["title", "amount", "payer", "people"]);
  saveTrip();
  render();
}

function savePeople() {
  const people = parsePeople(document.querySelector("#peopleNames").value).filter(Boolean);
  trip.people = people.length ? people : ["我"];
  syncPeopleBackedData(trip);
  queueMutation("people", "trip-people", "update", { id: "trip-people", people: trip.people, updated_at: nowIso(), updated_by: syncUserName(), version: 1 }, ["people"]);
  saveTrip();
  render();
}

function calculateSplit() {
  const ledger = Object.fromEntries(trip.people.map((person) => [person, 0]));
  trip.expenses.forEach((expense) => {
    const people = expense.people.length ? expense.people : trip.people;
    const share = Number(expense.amount || 0) / people.length;
    ledger[expense.payer] = (ledger[expense.payer] || 0) + Number(expense.amount || 0);
    people.forEach((person) => {
      ledger[person] = (ledger[person] || 0) - share;
    });
  });
  return Object.entries(ledger).map(([person, balance]) => ({ person, balance: Math.round(balance) }));
}

function recommendRoute(stop, nextStop, mode = "driving") {
  if (!stop.coords || !nextStop.coords) return "請設定交通方式";
  const km = distanceKm(stop.coords, nextStop.coords);
  const speed = mode === "walking" ? 12 : mode === "transit" ? 2.8 : 2.2;
  const minutes = Math.max(mode === "walking" ? 8 : 6, Math.round(km * speed));
  const label = mode === "walking" ? "步行" : mode === "transit" ? "巴士 / 單軌電車" : mode === "taxi" ? "計程車" : "開車 / 租車";
  return `建議${label}約 ${minutes} 分鐘`;
}

function routeUrl(stop, nextStop, mode = "driving") {
  const googleMode = mode === "walking" ? "walking" : mode === "transit" ? "transit" : "driving";
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(stop.title + " Okinawa")}&destination=${encodeURIComponent(nextStop.title + " Okinawa")}&travelmode=${googleMode}`;
}

function distanceKm(a, b) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earth = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earth * Math.asin(Math.sqrt(h));
}

function parsePeople(value) {
  const people = value
    .split(/[,，、\s]+/)
    .map((person) => person.trim())
    .filter(Boolean);
  return people.length ? people : trip.people;
}

function parseTags(value) {
  const tags = value
    .split(/[,，、\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean);
  return tags.length ? tags : null;
}

function addMinutes(time, minutes) {
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date(2000, 0, 1, hour, minute + minutes);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function mapsSearch(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((query || "Okinawa") + " Okinawa")}`;
}

function primaryStopLabel(stop) {
  if (stop.linkLabel) return stop.linkLabel;
  if (!primaryStopUrl(stop)) return "未設定連結";
  const tags = (stop.tags || []).join(",");
  if (/餐|咖啡|料理|用餐|店|美食/.test(`${stop.title || ""},${tags}`)) return "訂位 / 店家";
  return "主要連結";
}

function primaryStopUrl(stop) {
  return stop.official && stop.official !== "#" ? stop.official : "";
}

function normalizeUrl(value) {
  if (!value || value === "#") return value;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

function sortCurrentDayIfNeeded() {
  const day = currentDay();
  if (!day?.stops?.length) return;
  day.stops.sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));
}

function formatMoney(value) {
  return Math.round(Number(value || 0)).toLocaleString("zh-TW");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value || "#");
}

els.dayTabs.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-day]");
  if (!button) return;
  const day = trip.days.find((item) => item.id === button.dataset.day);
  setSelected(day.id, day.stops[0]?.id || "");
});

els.timeline.addEventListener("click", (event) => {
  if (suppressNextCardClick) {
    suppressNextCardClick = false;
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  const openButton = event.target.closest(".open-link");
  if (openButton) {
    event.preventDefault();
    event.stopPropagation();
    openExternalUrl(openButton.dataset.url || openButton.href);
    return;
  }
  const copyButton = event.target.closest(".copy-link");
  if (copyButton) {
    event.preventDefault();
    event.stopPropagation();
    copyText(copyButton.dataset.url, "已複製地圖路線。");
    return;
  }
  const routeButton = event.target.closest("[data-route-from] [data-action='route']");
  if (routeButton) {
    openRouteEditor(routeButton.closest("[data-route-from]").dataset.routeFrom);
    return;
  }
  const card = event.target.closest(".stop-card");
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (!card || action === "time" || event.target.closest("input")) return;
  const stop = currentDay().stops.find((item) => item.id === card.dataset.stop);
  if (action === "select") openStopView(stop);
  if (action === "edit") openEditor(stop);
});

els.timeline.addEventListener("change", (event) => {
  if (!event.target.matches(".time-input")) return;
  const card = event.target.closest(".stop-card");
  setStopTime(card.dataset.stop, event.target.value);
});

els.timeline.addEventListener("keydown", (event) => {
  if (!["Enter", " "].includes(event.key) || event.target.closest("input, button, a")) return;
  const card = event.target.closest(".stop-card");
  if (!card) return;
  event.preventDefault();
  const stop = currentDay().stops.find((item) => item.id === card.dataset.stop);
  if (stop) openStopView(stop);
});

els.stopForm.addEventListener("submit", (event) => {
  const action = event.submitter?.value;
  if (action === "cancel") return;
  event.preventDefault();
  saveEditor(action);
  els.stopDialog.close();
});

els.dayForm.addEventListener("submit", (event) => {
  if (event.submitter?.value === "cancel") return;
  event.preventDefault();
  saveDay();
  els.dayDialog.close();
});

els.hotelForm.addEventListener("submit", (event) => {
  if (event.submitter?.value === "cancel") return;
  event.preventDefault();
  saveHotel();
  els.hotelDialog.close();
});

els.routeForm.addEventListener("submit", (event) => {
  if (event.submitter?.value === "cancel") return;
  event.preventDefault();
  saveRoute();
  els.routeDialog.close();
});

document.querySelector("#routeMode").addEventListener("change", () => {
  const stop = currentDay().stops.find((item) => item.id === document.querySelector("#routeFromId").value);
  if (!stop) return;
  const nextStop = currentDay().stops[currentDay().stops.findIndex((item) => item.id === stop.id) + 1];
  if (!nextStop) return;
  const mode = document.querySelector("#routeMode").value;
  document.querySelector("#routeTransport").value = recommendRoute(stop, nextStop, mode);
  document.querySelector("#routeUrl").value = routeUrl(stop, nextStop, mode);
});

els.expenseForm.addEventListener("submit", (event) => {
  const action = event.submitter?.value;
  if (action === "cancel") return;
  event.preventDefault();
  saveExpense(action);
  els.expenseDialog.close();
});

els.peopleForm.addEventListener("submit", (event) => {
  if (event.submitter?.value === "cancel") return;
  event.preventDefault();
  savePeople();
  els.peopleDialog.close();
});

els.syncForm.addEventListener("submit", (event) => {
  if (event.submitter?.value === "cancel") return;
  event.preventDefault();
  handleSyncConfigSave();
  els.syncDialog.close();
});

document.querySelectorAll(".dialog-close").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog")?.close());
});

document.querySelector("#editViewedStopBtn").addEventListener("click", () => {
  const stop = currentDay().stops.find((item) => item.id === document.querySelector("#viewStopId").value);
  els.stopViewDialog.close();
  if (stop) openEditor(stop);
});

els.expenseList.addEventListener("click", (event) => {
  const row = event.target.closest("[data-expense]");
  if (!row) return;
  const expense = trip.expenses.find((item) => item.id === row.dataset.expense);
  openExpenseEditor(expense);
});

document.addEventListener("click", (event) => {
  const openButton = event.target.closest(".open-link");
  if (openButton) {
    event.preventDefault();
    openExternalUrl(openButton.dataset.url || openButton.href);
    return;
  }
  const copyButton = event.target.closest(".copy-link");
  if (copyButton) {
    event.preventDefault();
    copyText(copyButton.dataset.url, "已複製連結。");
  }
});

els.familyDots?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-person]");
  if (button) openFamilyLocation(button.dataset.person);
});

els.toolsPanel?.addEventListener("change", (event) => {
  const input = event.target.closest("[data-tool]");
  if (!input) return;
  toggleToolItem(input.dataset.tool, input.dataset.id, input.checked);
});

els.shoppingForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  addShoppingItem();
});

els.conflictList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-conflict]");
  if (!button) return;
  resolveConflict(Number(button.dataset.conflict), button.dataset.choice);
});

document.querySelector("#editDayBtn").addEventListener("click", openDayEditor);
document.querySelector("#addStopBtn").addEventListener("click", () => openEditor(null));
document.querySelector("#delayBtn").addEventListener("click", () => delayDay(15));
document.querySelector("#exportBtn").addEventListener("click", exportTrip);
document.querySelector("#copyExportBtn").addEventListener("click", copyExportText);
document.querySelector("#nativeShareBtn").addEventListener("click", nativeShare);
document.querySelector("#editHotelBtn").addEventListener("click", openHotelEditor);
document.querySelector("#editPeopleBtn").addEventListener("click", openPeopleEditor);
document.querySelector("#addExpenseBtn").addEventListener("click", () => openExpenseEditor(null));
document.querySelector("#trackBtn").addEventListener("click", startTracking);
document.querySelector("#locationHelpBtn").addEventListener("click", () => els.helpDialog.showModal());
document.querySelector("#configSyncBtn").addEventListener("click", openSyncConfig);
document.querySelector("#syncNowBtn").addEventListener("click", () => syncNow(false));
document.querySelector("#confirmSyncBtn").addEventListener("click", async () => {
  els.syncPreviewDialog.close();
  await syncNow(true);
});
document.querySelector("#clearSyncConfigBtn").addEventListener("click", clearSyncConfig);
document.querySelector("#tripViewBtn").addEventListener("click", () => setAppView("trip"));
document.querySelector("#toolsViewBtn").addEventListener("click", () => setAppView("tools"));
document.querySelector("#syncFileInput").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (file) importSyncFile(file);
  event.target.value = "";
});
document.querySelector("#clearTrackBtn").addEventListener("click", () => {
  trackPoints = [];
  saveTrack();
  renderTrack();
});
els.authForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = els.authEmail.value.trim();
  if (!email) return;
  setAuthStatus("正在寄送登入連結...");
  try {
    await sendMagicLink(email);
    setAuthStatus("登入連結已寄出，請到信箱點擊連結後回到 App。");
  } catch (error) {
    setAuthStatus(`寄送失敗：${error.message || "未知錯誤"}`);
  }
});
document.querySelector("#logoutBtn")?.addEventListener("click", signOut);
document.querySelector("#largeTextBtn").addEventListener("click", () => {
  trip.textSize = trip.textSize === "normal" ? "large" : trip.textSize === "large" ? "huge" : "normal";
  saveTrip();
  render();
});
document.querySelector("#weatherToggle").addEventListener("click", () => {
  trip.weatherMode = trip.weatherMode === "sunny" ? "rain" : "sunny";
  saveTrip();
  render();
});
document.querySelector("#resetBtn").addEventListener("click", () => {
  if (!confirm("要恢復成範例沖繩行程嗎？")) return;
  trip = structuredClone(defaultTrip);
  saveTrip();
  render();
});
document.querySelector("#installBtn").addEventListener("click", async () => {
  await showInstallLink();
});

document.querySelector("#copyInstallLinkBtn").addEventListener("click", () => copyText(els.installShareText.value, "已複製手機安裝說明。"));
document.querySelector("#shareInstallLinkBtn").addEventListener("click", async () => {
  if (navigator.share) {
    await navigator.share({ title: "沖繩家庭旅程 app", text: els.installShareText.value });
  } else {
    copyText(els.installShareText.value, "此瀏覽器不支援系統分享，已複製文字。");
  }
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js").catch(() => {});
}

async function initApp() {
  await loadTripFromCsv();
  await initAuth();
}

initApp();
