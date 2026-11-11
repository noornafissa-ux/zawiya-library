// عامل الخدمة — يُولَّد عند البناء (الإصدار وقائمة الملفات تُملأ تلقائيًا)
// المبدأ: الإنترنت أولًا للبيانات والصفحة، والنسخة المحفوظة عند انقطاع الاتصال أو تعذّر الوصول إلى الخادم.
// كل ملفات الإصدار تحمل ?v=رقم الإصدار، فلا يختلط ملف قديم بملف جديد.
const VERSION = '41b7ca4fce';
const SHELL = `shell-${VERSION}`;
const DATA = 'data-v1';
const PRECACHE = ["./","app.css?v=41b7ca4fce","data/books/burda/book.json?v=41b7ca4fce","data/books/burda/images/cover.webp?v=41b7ca4fce","data/books/dalail-khayrat/book.json?v=41b7ca4fce","data/books/dalail-khayrat/images/cover-thumb.webp?v=41b7ca4fce","data/books/hamziyya/book.json?v=41b7ca4fce","data/books/hamziyya/images/cover.webp?v=41b7ca4fce","data/books/nafahat-shadhiliya/book.json?v=41b7ca4fce","data/books/nafahat-shadhiliya/images/cover-thumb.webp?v=41b7ca4fce","data/books/nafahat-shadhiliya/images/cover.webp?v=41b7ca4fce","data/books/nafahat-shadhiliya/intro.json","data/books/nazm-badi/book.json?v=41b7ca4fce","data/books/nazm-badi/images/cover-thumb.webp?v=41b7ca4fce","data/books/nima-kubra/book.json?v=41b7ca4fce","data/books/nima-kubra/images/cover-thumb.webp?v=41b7ca4fce","data/books/rawdat-al-mahabba/book.json?v=41b7ca4fce","data/books/rawdat-al-mahabba/images/cover-thumb.webp?v=41b7ca4fce","data/books/salawat-dardir/book.json?v=41b7ca4fce","data/books/salawat-dardir/images/cover.webp?v=41b7ca4fce","data/library.json?v=41b7ca4fce","fonts/Amiri-Bold.woff","fonts/Amiri-Regular.woff","fonts/ArefRuqaa-Bold.woff","fonts/ElMessiri.woff","fonts/NotoNaskhArabic.woff","fonts/ReemKufi.woff","fonts/ScheherazadeNew.woff","icons/apple-touch-icon.png","icons/favicon.png","icons/icon-192.png","icons/icon-512.png","icons/zawiya-logo.png","icons/zawiya-logo.webp","js/data.js?v=41b7ca4fce","js/main.js?v=41b7ca4fce","js/search.js?v=41b7ca4fce","js/store.js?v=41b7ca4fce","js/util.js?v=41b7ca4fce","js/views.js?v=41b7ca4fce","manifest.webmanifest"];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(PRECACHE)));
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('shell-') && k !== SHELL).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

async function fromCache(req) {
  return (await caches.match(req)) || (await caches.match(req, { ignoreSearch: true }));
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (req.destination === 'audio' || url.pathname.includes('/audio/') || req.headers.has('range')) return;   // التسجيلات تُبثّ مباشرة

  // الصفحة: الإنترنت أولًا؛ عند الانقطاع أو خطأ الخادم تُفتح النسخة المحفوظة
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const res = await fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' });   // تحقّق دائم من وجود إصدار أحدث
        if (res.ok) { const c = await caches.open(SHELL); c.put('./', res.clone()); return res; }
        return (await caches.match('./', { ignoreSearch: true })) || res;
      } catch { return (await caches.match('./', { ignoreSearch: true })) || Response.error(); }
    })());
    return;
  }
  // البيانات (القصائد والفهارس): الإنترنت أولًا مع الحفظ، ثم أي نسخة محفوظة
  if (url.pathname.includes('/data/')) {
    e.respondWith((async () => {
      // ملف يحمل رقم الإصدار لا يتغيّر أبدًا: إن كان محفوظًا يُفتح فورًا دون انتظار الإنترنت
      if (url.search.includes('v=')) { const hit = await caches.match(req); if (hit) return hit; }
      try {
        const res = await fetch(req);
        if (res.ok) { const c = await caches.open(DATA); c.put(req, res.clone()); return res; }
        throw new Error(String(res.status));
      } catch {
        const c = await fromCache(req);
        return c || new Response('{"error":"offline"}', { status: 503, headers: { 'Content-Type': 'application/json' } });
      }
    })());
    return;
  }
  // ملفات الواجهة (تحمل رقم الإصدار): المحفوظة بالرابط نفسه، وإلا من الإنترنت، وإلا أي نسخة محفوظة
  e.respondWith((async () => {
    const exact = await caches.match(req);
    if (exact) return exact;
    try {
      const res = await fetch(req);
      if (res.ok && url.search.includes('v=')) { const c = await caches.open(SHELL); c.put(req, res.clone()); }   // حفظ ملفات الإصدار الجديد فور وصولها
      return res;
    } catch { return (await fromCache(req)) || Response.error(); }
  })());
});
