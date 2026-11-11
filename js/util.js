// أدوات عامة صغيرة

/** إنشاء عنصر: h('div', {class:'x', onclick}, child1, 'نص', [..]) */
export function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  append(el, children);
  return el;
}
function append(el, children) {
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

export const svg = (inner, cls = '') => {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true');
  if (cls) s.setAttribute('class', cls);
  s.innerHTML = inner;
  return s;
};
export const ICONS = {
  star8: '<path d="M12 2l2.9 4.1L20 5.1l-1 5.1L23 12l-4 1.8 1 5.1-5.1-1L12 22l-2.9-4.1L4 18.9l1-5.1L1 12l4-1.8-1-5.1 5.1 1z"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r=".6"/><circle cx="4" cy="12" r=".6"/><circle cx="4" cy="18" r=".6"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.9l7.6-4.6M8.2 13.1l7.6 4.6"/>',
  textSize: '<path d="M3 19L8.5 5h1L15 19M5.2 14h7.6"/><path d="M17 9v6M14 12h6"/>',
  textSmall: '<path d="M3 19L8.5 5h1L15 19M5.2 14h7.6"/><path d="M14 12h6"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  book: '<path d="M3 5.5C5.5 4.5 9 4.5 12 6.5c3-2 6.5-2 9-1V19c-2.5-1-6-1-9 1-3-2-6.5-2-9-1z"/><path d="M12 6.5V20"/>',
  library: '<path d="M4 4h4v16H4zM10 4h4v16h-4zM16.5 4.5l3.6 1 -4 15-3.6-1z"/>',
  chev: '<path d="M6 9l6 6 6-6"/>',
  back: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  next: '<path d="M15 6l-6 6 6 6"/>',
  prev: '<path d="M9 6l6 6-6 6"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  headphones: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4.5" height="6.5" rx="1.6"/><rect x="16.5" y="14" width="4.5" height="6.5" rx="1.6"/>',
  noAudio: '<path d="M4 15v-3a8 8 0 0 1 12.5-6.6M20 12v3"/><rect x="3" y="14" width="4.5" height="6.5" rx="1.6"/><path d="M3 3l18 18"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  trash: '<path d="M5 7h14M10 11v6M14 11v6M7 7l1 13h8l1-13M9 7V4h6v3"/>',
};

export function ornament() {
  return h('div', { class: 'ornament', 'aria-hidden': 'true' }, svg(ICONS.star8));
}

// ——— النص العربي ———
const TASHKEEL = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
const MARK_1 = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/;
/** إزالة المدّ الزخرفي فقط (للعرض) */
export const display = (s) => (s || '').replace(/ـ/g, '').replace(/\s+/g, ' ').trim();

/** تطبيع للبحث: بلا تشكيل ولا مدّ، وتوحيد الهمزات والياء والتاء المربوطة */
export function normalize(s) {
  return (s || '')
    .replace(TASHKEEL, '')
    .replace(/[إأآٱ]/g, 'ا').replace(/[ىی]/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/ک/g, 'ك')
    .replace(/[^ء-ي0-9a-zA-Z\s]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

/** نص مطبّع مع خريطة من كل حرف مطبّع إلى موضعه في النص الأصلي — لتلوين المطابقات بدقة */
function normalizeWithMap(s) {
  let out = ''; const map = [];
  let lastSpace = true;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (MARK_1.test(ch)) continue;
    let n = normalize(ch);
    if (!n) n = ' ';
    if (n === ' ') { if (lastSpace) continue; lastSpace = true; } else lastSpace = false;
    out += n; map.push(i);
  }
  return { out, map };
}

/** يعيد عقدة فيها النص الأصلي مع <mark> حول مواضع الكلمات المطلوبة */
export function highlight(text, words) {
  const frag = document.createDocumentFragment();
  if (!words || !words.length) { frag.append(text); return { node: frag, hit: false }; }
  const { out, map } = normalizeWithMap(text);
  const ranges = [];
  for (const w of words) {
    if (!w) continue;
    let i = out.indexOf(w);
    while (i !== -1) {
      const a = map[i], lastIdx = map[i + w.length - 1];
      // امتداد النهاية ليشمل التشكيل التابع لآخر حرف
      let b = lastIdx + 1;
      while (b < text.length && /[ً-ٰٟـ]/.test(text[b])) b++;
      ranges.push([a, b]);
      i = out.indexOf(w, i + w.length);
    }
  }
  if (!ranges.length) { frag.append(text); return { node: frag, hit: false }; }
  ranges.sort((x, y) => x[0] - y[0]);
  const merged = [];
  for (const r of ranges) { const l = merged[merged.length - 1]; if (l && r[0] <= l[1]) l[1] = Math.max(l[1], r[1]); else merged.push([...r]); }
  let pos = 0;
  for (const [a, b] of merged) { frag.append(text.slice(pos, a)); frag.append(h('mark', null, text.slice(a, b))); pos = b; }
  frag.append(text.slice(pos));
  return { node: frag, hit: true };
}

export const arNum = (n) => String(n);
export function plural(n, one, two, few, many) {
  if (n === 1) return one; if (n === 2) return two;
  if (n >= 3 && n <= 10) return `${n} ${few}`;
  return `${n} ${many}`;
}

let toastTimer;
export function toast(msg, action) {
  const t = document.getElementById('toast');
  t.replaceChildren(h('span', null, msg));
  if (action) t.append(h('button', { type: 'button', onclick: () => { t.hidden = true; action.run(); } }, action.label));
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, action ? 12000 : 2600);
}

export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    const ta = h('textarea', { style: 'position:fixed;opacity:0;top:0' }); ta.value = text; document.body.append(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch {}
    ta.remove(); return ok;
  }
}

// ——— الروابط ———
// على الموقع المنشور: روابط نظيفة (/b/…/p/…). في المعاينة فقط (حيث لا يمكن ذلك) تُستعمل روابط # كما كانت.
export const HASH_MODE = typeof window !== 'undefined' && !!window.__HASHROUTE;
export function currentPath() {
  return HASH_MODE ? (location.hash.replace(/^#/, '') || '/') : (location.pathname + location.search);
}
// عمق التنقّل داخل الموقع محفوظ في history.state ليعرف زرّ «رجوع» هل يرجع خطوة أم يذهب إلى الصفحة الأعلى
const navDepth = () => (history.state && history.state.d) || 0;
export function navigate(path, replace = false) {
  if (path === currentPath()) return;
  const d = replace ? navDepth() : navDepth() + 1;
  history[replace ? 'replaceState' : 'pushState']({ d }, '', HASH_MODE ? `#${path}` : path);
  dispatchEvent(new Event('app:navigate'));
}
export function goBack(fallback) {
  if (navDepth() > 0) history.back(); else navigate(fallback || '/', true);
}
export function setUrlQuietly(path) {
  history.replaceState(history.state, '', HASH_MODE ? `#${path}` : path);
}
