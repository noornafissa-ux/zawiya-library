// نقطة البدء: التوجيه، القائمة، الإعدادات، عامل الخدمة
import { h, toast, HASH_MODE, currentPath, navigate } from './util.js?v=e2c97a9164';
import * as store from './store.js?v=e2c97a9164';
import * as data from './data.js?v=e2c97a9164';
import * as V from './views.js?v=e2c97a9164';

const main = document.getElementById('main');
let current = null;

function parse() {
  const raw = currentPath();
  const [p, qs] = raw.split('?');
  return { parts: p.split('/').filter(Boolean).map(decodeURIComponent), params: new URLSearchParams(qs || '') };
}

async function route() {
  const { parts, params } = parse();
  let nav = 'library';
  let viewP;
  if (!parts.length) viewP = V.libraryView();
  else if (parts[0] === 'b' && parts[1] && !parts[2]) viewP = V.bookView(parts[1], params.get('p'));
  else if (parts[0] === 'b' && parts[2] === 'intro') viewP = V.introView(parts[1]);
  else if (parts[0] === 'b' && parts[2] === 's' && parts[3] != null) viewP = V.sheikhView(parts[1], parts[3]);
  else if (parts[0] === 'b' && parts[2] === 'page') viewP = V.pageView(parts[1], parts[3]);
  else if (parts[0] === 'b' && parts[2] === 'p' && parts[3]) { viewP = V.poemView(parts[1], parts[3], params); nav = params.get('resume') ? 'continue' : 'library'; }
  else if (parts[0] === 'search') { viewP = V.searchView(params); nav = 'search'; }
  else if (parts[0] === 'favorites') { viewP = V.favoritesView(); nav = 'favorites'; }
  else if (parts[0] === 'continue') {
    const t = V.continueTarget();
    if (t) { navigate(t, true); return; }
    viewP = Promise.resolve(V.noReadingView()); nav = 'continue';
  } else viewP = V.libraryView();

  document.querySelectorAll('[data-nav]').forEach((a) => (a.dataset.nav === nav ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  const loadingTimer = setTimeout(() => main.replaceChildren(h('div', { class: 'loading' }, 'جارٍ التحميل…')), 150);
  let view;
  try { view = await viewP; }
  catch (e) {
    console.error(e);
    view = h('div', { class: 'page' }, h('div', { class: 'empty' }, h('div', { class: 'big' }, 'تعذّر تحميل هذه الصفحة'), h('div', null, navigator.onLine ? 'حدث خطأ غير متوقع.' : 'أنت غير متصل بالإنترنت، وهذه الصفحة لم تُحفظ على الجهاز بعد.'), h('button', { class: 'btn', type: 'button', onclick: route }, 'إعادة المحاولة')));
  }
  clearTimeout(loadingTimer);
  current = view;
  document.querySelectorAll('audio').forEach((a) => a.pause());   // إيقاف التسجيل عند الانتقال
  main.replaceChildren(view);
  window.scrollTo(0, 0);
  if (view._after) requestAnimationFrame(() => view._after());
  closeDrawer();
}

// ——— القائمة الجانبية ———
const drawer = document.getElementById('drawer');
const scrim = document.getElementById('scrim');
const menuBtn = document.getElementById('menu-btn');
function openDrawer() { drawer.hidden = false; scrim.hidden = false; menuBtn.setAttribute('aria-expanded', 'true'); drawer.querySelector('a,button')?.focus(); syncSettingsUI(); }
function closeDrawer() { if (drawer.hidden) return; drawer.hidden = true; scrim.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); }
menuBtn.addEventListener('click', () => (drawer.hidden ? openDrawer() : closeDrawer()));
scrim.addEventListener('click', closeDrawer);
document.getElementById('drawer-close').addEventListener('click', () => { closeDrawer(); menuBtn.focus(); });
drawer.addEventListener('click', (e) => { if (e.target.closest('a')) closeDrawer(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDrawer();
  if (current && current._keys && !e.target.closest('input,textarea') && !e.altKey && !e.ctrlKey && !e.metaKey) current._keys(e);
});

drawer.querySelectorAll('[data-size]').forEach((b) => b.addEventListener('click', () => { store.stepSize(Number(b.dataset.size)); syncSettingsUI(); }));
drawer.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => { store.setMode(b.dataset.mode); syncSettingsUI(); }));
function syncSettingsUI() {
  const s = store.settings();
  document.getElementById('size-out').textContent = `${Math.round(s.size * 100)}%`;
  drawer.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.mode === s.mode)));
}

async function fillDrawerBooks() {
  try {
    const lib = await data.library();
    const first = document.getElementById('drawer-books');
    const byId = Object.fromEntries(lib.books.map((b) => [b.id, b]));
    const shelves = lib.shelves && lib.shelves.length ? lib.shelves : [{ title: 'الدواوين', books: lib.books.map((b) => b.id) }];
    // قسم لكل رفّ في المكتبة: الدواوين، المدائح النبوية، الأوراد…
    const secs = shelves.map((sh) => {
      const links = [...(sh.books || []).map((id) => byId[id]).filter(Boolean).map((b) => h('a', { href: V.href.book(b.id) }, V.emblem(), b.shortTitle)),
        ...(sh.links || []).map((l) => h('a', { href: l.url, target: '_blank', rel: 'noopener' }, V.emblem(), l.title))];
      return links.length ? h('div', { class: 'drawer-sec' }, h('h3', null, sh.title), ...links) : null;
    }).filter(Boolean);
    first.replaceWith(...secs);
  } catch {}
}

// حفظ موضع القراءة أثناء التمرير
let scrollT;
addEventListener('scroll', () => { clearTimeout(scrollT); scrollT = setTimeout(() => current && current._scroll && current._scroll(), 300); }, { passive: true });
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => store.applySettings());
// إعادة تنسيق الأبيات عند تغيّر حجم الشاشة أو حجم الخط
let resizeT;
addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => current?._layout?.(), 120); });
store.onChange((what) => { if (what === 'settings') requestAnimationFrame(() => current?._layout?.()); });

// ——— التثبيت على الشاشة الرئيسية ———
let installEvt = null;
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; document.getElementById('install-sec').hidden = false; });
document.getElementById('install-btn').addEventListener('click', async () => {
  if (!installEvt) return; installEvt.prompt(); await installEvt.userChoice.catch(() => {}); installEvt = null; document.getElementById('install-sec').hidden = true;
});

// ——— عامل الخدمة (العمل دون اتصال) ———
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('sw.js');
      reg.update?.();
    } catch (e) { console.warn('SW', e); }
  });
}
fetch('version.txt').then((r) => (r.ok ? r.text() : '')).then((v) => { if (v) document.getElementById('app-version').textContent = `الإصدار ${v.trim()}`; }).catch(() => {});

store.applySettings();
fillDrawerBooks();
// الروابط القديمة التي فيها # (مثل /#/b/…) تتحوّل إلى الشكل الجديد تلقائيًا
if (!HASH_MODE && location.hash.startsWith('#/')) history.replaceState(null, '', location.hash.slice(1) || '/');
// كل رابط داخلي يُفتح داخل التطبيق دون إعادة تحميل الصفحة
document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest('a[href]'); if (!a || a.target || a.hasAttribute('download')) return;
  const href = a.getAttribute('href');
  if (href.startsWith('#') && !href.startsWith('#/')) {          // رابط داخل الصفحة نفسها (مثل «تخطَّ إلى المحتوى»)
    const el = document.getElementById(href.slice(1)); if (el) { e.preventDefault(); el.focus(); el.scrollIntoView(); }
    return;
  }
  if (!href.startsWith('/') || href.startsWith('//')) return;
  if (/\.(json|txt|png|jpe?g|webp|mp3|m4a|pdf)(\?|$)/i.test(href)) return;
  e.preventDefault();
  navigate(href);
});
// تحميل مسبق: عند لمس رابط كتاب أو قصيدة (أو مرور الفأرة عليه) تبدأ بياناته بالتحميل قبل الضغط
function prefetchFor(a) {
  const href = (a.getAttribute('href') || '').replace(/^#/, '').split('?')[0];
  const m = href.match(/^\/b\/([^/]+)(?:\/p\/([^/]+))?/);
  if (!m) return;
  data.book(m[1]).catch(() => {});
  if (m[2]) data.poem(m[1], m[2]).catch(() => {});
}
for (const ev of ['pointerover', 'touchstart', 'focusin']) {
  document.addEventListener(ev, (e) => { const a = e.target.closest && e.target.closest('a[href]'); if (a) prefetchFor(a); }, { passive: true });
}
// بعد فتح المكتبة: تحميل فهارس الكتب في وقت الفراغ حتى تُفتح فورًا
(window.requestIdleCallback || ((f) => setTimeout(f, 1200)))(() => data.library().then((lib) => lib.books.forEach((b) => data.book(b.id).catch(() => {}))).catch(() => {}));
addEventListener(HASH_MODE ? 'hashchange' : 'popstate', route);
// رابط قديم بـ # فُتح والموقع مفتوح في التبويب نفسه
if (!HASH_MODE) addEventListener('hashchange', () => {
  if (location.hash.startsWith('#/')) { history.replaceState(null, '', location.hash.slice(1) || '/'); route(); }
});
addEventListener('app:navigate', route);
// إن نُشر إصدار أحدث والصفحة مفتوحة منذ مدة (أو التطبيق مثبّت على الهاتف): يُعاد التحميل تلقائيًا ليظهر الجديد
let lastCheck = 0;
async function checkVersion() {
  if (!window.__V || Date.now() - lastCheck < 60000) return; lastCheck = Date.now();
  try {
    const r = await fetch(`version.txt?t=${Date.now()}`, { cache: 'no-store' });
    const v = r.ok ? (await r.text()).trim() : '';
    if (v && /^[a-f0-9]{6,}$/.test(v) && v !== window.__V) location.reload();
  } catch {}
}
addEventListener('app:navigate', checkVersion);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkVersion(); });
setTimeout(checkVersion, 3000);
route();
