// تحميل البيانات المولَّدة في dist/data — كل ملف يُحمَّل عند الحاجة فقط ويُحفظ في الذاكرة.
const cache = new Map();
// رقم الإصدار يُلحق بكل رابط حتى لا يخلط المتصفح ملفات إصدار قديم بإصدار جديد
const V = (typeof window !== 'undefined' && window.__V) || '';
const ver = (url) => (V ? `${url}?v=${V}` : url);
function get(url) {
  url = ver(url);
  if (!cache.has(url)) {
    cache.set(url, fetch(url).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}: ${url}`);
      return r.json();
    }).catch((e) => { cache.delete(url); throw e; }));
  }
  return cache.get(url);
}

export const library = () => get('data/library.json');
export const book = (id) => get(`data/books/${id}/book.json`);
export const poem = (b, p) => get(`data/books/${b}/poems/${p}.json`);
export const intro = (b) => get(`data/books/${b}/intro.json`);
export const searchIndex = (b) => get(`data/books/${b}/search.json`);
export const poemUrl = (b, p) => ver(`data/books/${b}/poems/${p}.json`);

/** معلومات قصيدة من بيانات الديوان: القسم، الرقم، السابق والتالي */
export function locate(meta, pid) {
  const i = meta.order.indexOf(pid);
  if (i < 0) return null;
  let sec = null, entry = null;
  for (const s of meta.sections) { const e = s.poems.find((x) => x.id === pid); if (e) { sec = s; entry = e; break; } }
  const find = (id) => { for (const s of meta.sections) { const e = s.poems.find((x) => x.id === id); if (e) return { ...e, section: s }; } return null; };
  return {
    index: i, total: meta.order.length, section: sec, entry,
    prev: i > 0 ? find(meta.order[i - 1]) : null,
    next: i < meta.order.length - 1 ? find(meta.order[i + 1]) : null,
  };
}

/** تجميع قصائد القسم حسب الشيخ، كما في فهرس الديوان المطبوع */
export function groupByAuthor(poems) {
  const groups = [];
  for (const p of poems) {
    const last = groups[groups.length - 1];
    if (last && last.author === p.author) last.poems.push(p); else groups.push({ author: p.author, poems: [p] });
  }
  return groups;
}

/** قصائد كل شيخ: يُطابَق اسم الشيخ في قائمة المشايخ مع اسم صاحب القصيدة (بعد حذف الألقاب والحركات) */
const TITLES = new Set(['سيدنا', 'سيدي', 'الشيخ', 'مولانا']);
const nameWords = (s) => (s || '').replace(/[\u064B-\u065F\u0670\u0640]/g, '').split(/\s+/).filter((w) => w && !TITLES.has(w));
export function isSheikhOf(sheikhName, author) {
  const sw = new Set(nameWords(sheikhName)), aw = nameWords(author);
  return aw.length > 0 && aw.every((w) => sw.has(w));
}
export function sheikhPoems(meta, idx) {
  const sh = meta.sheikhs[idx]; if (!sh) return null;
  const sections = meta.sections.map((s) => ({ ...s, poems: s.poems.filter((p) => isSheikhOf(sh.name, p.author)) })).filter((s) => s.poems.length);
  return { sheikh: sh, sections, total: sections.reduce((a, s) => a + s.poems.length, 0) };
}
