// الحفظ المحلي على جهاز القارئ: المفضلة، آخر قراءة، الإعدادات.
// كل شيء مفهرس بمعرّف الديوان + معرّف القصيدة الثابت، فلا يتأثر بتغيّر الترتيب أو الأرقام.
const K = { favs: 'dl.favs.v1', last: 'dl.last.v1', settings: 'dl.settings.v1', offline: 'dl.offline.v1' };

function read(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}

const listeners = new Set();
export const onChange = (fn) => listeners.add(fn);
const emit = (what) => listeners.forEach((fn) => fn(what));

// ——— المفضلة ———
export function favorites() { return read(K.favs, []); }
export function isFav(book, poem) { return favorites().some((f) => f.b === book && f.p === poem); }
export function toggleFav(book, poem, snapshot) {
  let list = favorites();
  const had = list.some((f) => f.b === book && f.p === poem);
  if (had) list = list.filter((f) => !(f.b === book && f.p === poem));
  else list.unshift({ b: book, p: poem, t: Date.now(), title: snapshot.title, bookTitle: snapshot.bookTitle });
  write(K.favs, list); emit('favs');
  return !had;
}
export function removeFav(book, poem) {
  write(K.favs, favorites().filter((f) => !(f.b === book && f.p === poem))); emit('favs');
}

// ——— آخر قراءة ———
export function lastRead() { return read(K.last, null); }
export function clearLastRead() { try { localStorage.removeItem(K.last); } catch {} }
export function setLastRead(entry) { write(K.last, { ...entry, t: Date.now() }); }
export function setLastScroll(book, poem, ratio) {
  const l = lastRead();
  if (l && l.b === book && l.p === poem) write(K.last, { ...l, scroll: Math.round(ratio * 1000) / 1000 });
}

// ——— الإعدادات ———
const SIZES = [0.85, 0.92, 1, 1.1, 1.22, 1.36, 1.52, 1.7];
export function settings() { return { size: 1, mode: 'auto', ...read(K.settings, {}) }; }
export function applySettings() {
  const s = settings();
  const root = document.documentElement;
  root.style.setProperty('--verse-scale', s.size);
  if (s.mode === 'auto') root.dataset.mode = 'auto'; else root.dataset.mode = s.mode;
  const themeColor = s.mode === 'night' || (s.mode === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches) ? '#12201b' : '#0e4d3d';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
  emit('settings');
}
export function stepSize(dir) {
  const s = settings();
  let i = SIZES.findIndex((x) => Math.abs(x - s.size) < 0.01); if (i < 0) i = 2;
  i = Math.max(0, Math.min(SIZES.length - 1, i + dir));
  write(K.settings, { ...s, size: SIZES[i] }); applySettings();
  return SIZES[i];
}
export function setMode(mode) { write(K.settings, { ...settings(), mode }); applySettings(); }
export function cycleMode() {
  const order = ['auto', 'ivory', 'light', 'night'];
  const m = settings().mode; const next = order[(order.indexOf(m) + 1) % order.length];
  setMode(next); return next;
}
export const MODE_NAMES = { auto: 'تلقائي', ivory: 'عاجي', light: 'أبيض', night: 'ليلي' };

// ——— الحفظ دون اتصال ———
export function offlineSaved(book) { return read(K.offline, {})[book] || null; }
export function markOffline(book, version) { const o = read(K.offline, {}); o[book] = { version, t: Date.now() }; write(K.offline, o); }
