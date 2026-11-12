// الشاشات: المكتبة، الديوان والفهرس، المقدمة، القارئ، البحث، المفضلة
import { h, svg, ICONS, ornament, display, highlight, toast, copyText, navigate, setUrlQuietly, goBack } from './util.js?v=d4426b6f79';
import * as data from './data.js?v=d4426b6f79';
import * as store from './store.js?v=d4426b6f79';
import { search, queryWords } from './search.js?v=d4426b6f79';

const href = {
  library: () => '/',
  book: (b) => `/b/${b}`,
  intro: (b) => `/b/${b}/intro`,
  poem: (b, p, q) => `/b/${b}/p/${p}${q ? `?q=${encodeURIComponent(q)}` : ''}`,
  search: (q) => `/search${q ? `?q=${encodeURIComponent(q)}` : ''}`,
  sheikh: (b, i) => `/b/${b}/s/${i}`,
  page: (b, n) => `/b/${b}/page/${n}`,
};
export { href };

/** شارة الديوان: نجمة ثمانية ذهبية بقلب مفرَّغ (بدل الرموز التعبيرية) */
export const emblem = () => svg('<path d="M12 1.5l3 4.3 5.2-1-1 5.2 4.3 3-4.3 3 1 5.2-5.2-1-3 4.3-3-4.3-5.2 1 1-5.2L.5 12l4.3-3-1-5.2 5.2 1z"/><circle cx="12" cy="12" r="4.2" class="hole"/><circle cx="12" cy="12" r="1.6"/>', 'emblem');

/** شعار الموقع (من الشريط العلوي نفسه) */
const siteLogo = () => {
  const w = document.querySelector('.brand .wordmark');
  const img = h('img', { class: 'logo', src: `icons/zawiya-logo.webp${window.__V ? `?v=${window.__V}` : ''}`, alt: '', width: '512', height: '512', decoding: 'async' });
  return h('div', { class: 'lockup', role: 'img', 'aria-label': 'مكتبة الزاوية التمسّكية' }, img, w ? w.cloneNode(true) : null);
};

const page = (cls, ...kids) => h('div', { class: `page ${cls || ''}` }, ...kids);
const notFound = (msg) => page('', h('div', { class: 'empty' }, h('div', { class: 'big' }, msg), h('a', { class: 'btn', href: '/' }, 'العودة إلى المكتبة')));
const pluralPoems = (n) => (n === 1 ? 'قصيدة واحدة' : n === 2 ? 'قصيدتان' : n <= 10 ? `${n} قصائد` : `${n} قصيدة`);
const sectionLabel = (s) => s.title || '';


// زرّ الرجوع: يرجع إلى الصفحة السابقة داخل الموقع، أو إلى الصفحة الأعلى إن فُتح الرابط مباشرة
const backIcon = (fallback) => h('button', { class: 'icon-btn back-btn', type: 'button', 'aria-label': 'رجوع', title: 'رجوع', onclick: () => goBack(fallback) }, svg(ICONS.back));
const backLink = (fallback) => h('button', { class: 'back-link', type: 'button', onclick: () => goBack(fallback) }, svg(ICONS.back), h('span', null, 'رجوع'));

// غلاف القصائد: القبة الخضراء
export function domeCover(title) {
  const ns = 'http://www.w3.org/2000/svg';
  const s = document.createElementNS(ns, 'svg');
  s.setAttribute('viewBox', '0 0 210 297'); s.setAttribute('preserveAspectRatio', 'xMidYMid slice'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('class', 'dome-art');
  const t = String(title).replace(/[<>&]/g, '');
  // مئذنة عاجية بشرفتين وقبّة صغيرة منتفخة (كمآذن المسجد النبوي)
  const minaret = (cx) => {
    const r = (x, y, w, hh, f = 'url(#dg-ivory)') => `<rect x="${cx + x}" y="${y}" width="${w}" height="${hh}" fill="${f}"/>`;
    const arches = (y, n, w, hh, gap) => Array.from({ length: n }, (_, i) => { const x = cx - ((n - 1) * gap) / 2 + i * gap - w / 2; return `<path d="M${x} ${y + hh}V${y + w / 2}a${w / 2} ${w / 2} 0 0 1 ${w} 0V${y + hh}z" fill="#c9b48a"/>`; }).join('');
    return `${r(-9, 128, 18, 60)}${arches(140, 3, 3.2, 14, 5.2)}
      ${r(-11.5, 122, 23, 6, '#e6d6b2')}${r(-12.5, 119, 25, 3.5, '#d9c69c')}
      ${r(-7, 86, 14, 33)}${arches(96, 3, 2.6, 13, 4.2)}
      ${r(-9.5, 81, 19, 5, '#e6d6b2')}${r(-10.5, 78.5, 21, 3, '#d9c69c')}
      ${r(-5, 62, 10, 16.5)}${r(-6, 60, 12, 2.5, '#e6d6b2')}
      <ellipse cx="${cx}" cy="51" rx="5.6" ry="8.5" fill="url(#dg-ivory)"/>
      <rect x="${cx - 1.2}" y="35" width="2.4" height="9" fill="url(#dg-ivory)"/><ellipse cx="${cx}" cy="38" rx="2.4" ry="3" fill="url(#dg-ivory)"/>
      <line x1="${cx}" y1="35" x2="${cx}" y2="26" stroke="#b8893a" stroke-width="1"/><circle cx="${cx}" cy="30" r="1.3" fill="#c9a24e"/>`;
  };
  const ribs = Array.from({ length: 15 }, (_, i) => {
    const k = (i + 1) / 16, x = 42 + 126 * k, ctl = 105 + (x - 105) * 0.98;
    return `M105 80 C ${ctl} 86, ${x} 112, ${x} 152`;
  }).join(' ');
  const winRow = (y, n, w, hh, x0, x1, f) => Array.from({ length: n }, (_, i) => { const x = x0 + ((x1 - x0) * (i + 0.5)) / n - w / 2; return `<path d="M${x} ${y + hh}V${y + w / 2}a${w / 2} ${w / 2} 0 0 1 ${w} 0V${y + hh}z" fill="${f}"/>`; }).join('');
  s.innerHTML = `<defs>
    <linearGradient id="dg-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4ece0"/><stop offset=".55" stop-color="#f6e7cf"/><stop offset="1" stop-color="#f1dcb4"/></linearGradient>
    <linearGradient id="dg-dome" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1f6e3d"/><stop offset=".35" stop-color="#3d9c5e"/><stop offset=".55" stop-color="#349155"/><stop offset="1" stop-color="#1b6236"/></linearGradient>
    <linearGradient id="dg-drum" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1d6a3b"/><stop offset=".4" stop-color="#36955a"/><stop offset="1" stop-color="#1a5f35"/></linearGradient>
    <linearGradient id="dg-ivory" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e9dbbd"/><stop offset=".45" stop-color="#f8efdc"/><stop offset="1" stop-color="#dcc9a3"/></linearGradient>
    <linearGradient id="dg-gold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a87a2e"/><stop offset=".5" stop-color="#f0cf7e"/><stop offset="1" stop-color="#a87a2e"/></linearGradient>
  </defs>
  <rect width="210" height="297" fill="url(#dg-sky)"/>
  <rect x="9" y="9" width="192" height="279" rx="6" fill="none" stroke="#b8893a" stroke-width="2"/>
  <rect x="14" y="14" width="182" height="269" rx="4" fill="none" stroke="#d4b26a" stroke-width=".8"/>
  ${minaret(36)}${minaret(174)}
  <path d="M42 152 C 42 108, 72 82, 105 80 C 138 82, 168 108, 168 152 Z" fill="url(#dg-dome)"/>
  <clipPath id="dg-clip"><path d="M42 152 C 42 108, 72 82, 105 80 C 138 82, 168 108, 168 152 Z"/></clipPath>
  <g clip-path="url(#dg-clip)"><path d="${ribs}" fill="none" stroke="#174f2e" stroke-width=".45" opacity=".55"/>
  <path d="M40 128 C 70 123, 140 123, 170 128" fill="none" stroke="#2c7d4a" stroke-width=".6" opacity=".6"/></g>
  <rect x="38" y="150" width="134" height="5" rx="1" fill="#2a8250"/>
  <rect x="40" y="155" width="130" height="20" fill="url(#dg-drum)"/>
  ${winRow(158, 12, 6, 14, 40, 170, '#1b5f36')}
  <rect x="34" y="174" width="142" height="4" fill="#2a8250"/>
  <rect x="36" y="178" width="138" height="26" fill="url(#dg-drum)"/>
  ${winRow(184, 9, 8, 16, 36, 174, '#185a32')}
  <rect x="28" y="203" width="154" height="4" rx="1" fill="#2d8a53"/>
  <path d="M24 207 H186 L182 222 H28 Z" fill="#f7f1e4"/>
  <path d="M100.5 80 L105 66 L109.5 80 Z" fill="url(#dg-gold)"/>
  <circle cx="105" cy="63" r="3" fill="url(#dg-gold)"/><circle cx="105" cy="57.5" r="2.3" fill="url(#dg-gold)"/><circle cx="105" cy="53" r="1.8" fill="url(#dg-gold)"/>
  <line x1="105" y1="51" x2="105" y2="40" stroke="#b8893a" stroke-width="1.1"/>
  <text x="105" y="258" text-anchor="middle" font-family="Aref Ruqaa, serif" font-weight="700" font-size="34" fill="#0e4d3d">${t}</text>
  <path d="M70 272 H140" stroke="#b8893a" stroke-width=".9"/><circle cx="105" cy="272" r="2" fill="#b8893a"/>`;
  return s;
}

// بطاقة رابط خارجي (تطبيق، قناة تلغرام…)
const LINK_ICONS = {
  telegram: '<path d="M21.5 4.5L2.8 11.7c-.9.4-.9 1.5.1 1.8l4.7 1.5 1.8 5.6c.3.8 1.2 1 1.8.4l2.6-2.4 4.9 3.6c.7.5 1.6.1 1.8-.7L22.9 5.8c.2-1-.6-1.7-1.4-1.3z" fill="currentColor" stroke="none"/><path d="M7.6 15l9.8-7.2-7.6 8.6" stroke="#fff" stroke-width="1.2" fill="none"/>',
  apple: '<path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8s1.9.8 3.2.8c1.3 0 2.1-1.2 2.9-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.4-.9-2.4-3.9zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.6-2.8 1.4-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.5 2.8-1.3z" fill="currentColor" stroke="none"/>',
  android: '<path d="M7 9h10v8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1zM5 9.5v5M19 9.5v5M10 18v3M14 18v3M7.5 8a4.5 4.5 0 0 1 9 0z" /><path d="M8.5 3.5l1.3 2M15.5 3.5l-1.3 2"/><circle cx="10" cy="6.4" r=".5" fill="currentColor"/><circle cx="14" cy="6.4" r=".5" fill="currentColor"/>',
};
const linkCard = (l) => h('a', { class: `link-card lc-${l.icon || 'link'}`, href: l.url, target: '_blank', rel: 'noopener' },
  h('span', { class: 'lc-ico' }, svg(LINK_ICONS[l.icon] || ICONS.external)),
  h('span', { class: 'lc-txt' }, h('b', null, l.title), l.sub ? h('small', { dir: 'auto' }, l.sub) : null),
  h('span', { class: 'lc-go', 'aria-hidden': 'true' }, svg(ICONS.external)));

// ═══════════ المكتبة ═══════════
export async function libraryView() {
  const lib = await data.library();
  document.title = lib.siteName || lib.title;
  const last = store.lastRead();
  const V = window.__V ? `?v=${window.__V}` : '';
  const metaLine = (b) => (b.type === 'pages' ? `${b.pages} صفحة`
    : b.type === 'qasida' ? `${b.verses} بيتًا · ${b.chapters} فصلًا`
    : b.type === 'prose' ? `${b.parts} حرفًا`
    : `${pluralPoems(b.poems)} · ${b.sections} أقسام`);
  // بطاقة الكتاب: غلاف كالكتاب على الرف، وتحته العنوان
  const tile = (b) => h('a', { class: `tile tile-${b.type || 'diwan'}`, href: href.book(b.id), 'aria-label': b.title },
    h('div', { class: 'tile-cover' },
      b.coverThumb ? h('img', { src: b.coverThumb, alt: '', loading: 'lazy' }) : domeCover(b.shortTitle),
      h('span', { class: 'tile-spine', 'aria-hidden': 'true' })),
    h('div', { class: 'tile-body' },
      h('h3', null, b.title),
      b.author ? h('div', { class: 'tile-author' }, b.author.replace(/^الإمام\s+/, '')) : null,
      h('div', { class: 'tile-meta' }, metaLine(b))));
  const byId = Object.fromEntries(lib.books.map((b) => [b.id, b]));
  const shelves = (lib.shelves && lib.shelves.length ? lib.shelves : [{ id: 'all', title: lib.title, books: lib.books.map((b) => b.id) }])
    .map((sh) => ({ ...sh, list: (sh.books || []).map((id) => byId[id]).filter(Boolean), links: sh.links || [] })).filter((sh) => sh.list.length || sh.links.length);
  const groupsOf = (sh) => [...new Set(sh.links.map((l) => l.group || sh.title))];
  const go = (id) => (e) => { e.preventDefault(); document.getElementById(`shelf-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const hero = h('header', { class: 'home-hero' },
    h('div', { class: 'hero-in' },
      siteLogo(),
      h('p', { class: 'hero-tag' }, 'دواوين ومدائح وأوراد للقراءة والسماع'),
      h('a', { class: 'hero-search', href: '/search' }, svg(ICONS.search), h('span', null, 'ابحث عن قصيدة أو بيت…')),
      h('nav', { class: 'hero-chips', 'aria-label': 'أقسام المكتبة' },
        shelves.flatMap((sh) => (sh.compact && sh.links.length ? groupsOf(sh).map((g, i) => [`${sh.id}-g${i}`, g, sh.links.filter((l) => (l.group || sh.title) === g).length]) : [[sh.id, sh.title, sh.list.length || sh.links.length]])
          .map(([id, t, c]) => h('a', { href: `#shelf-${id}`, onclick: go(id) }, t, h('small', null, String(c))))))));
  const blocks = shelves.map((sh) => h('section', { class: 'shelf', id: `shelf-${sh.id}`, 'aria-label': sh.title },
    sh.compact ? null : h('header', { class: 'shelf-head' },
      h('span', { class: 'sh-line', 'aria-hidden': 'true' }),
      h('h2', null, sh.title),
      h('span', { class: 'sh-line', 'aria-hidden': 'true' })),
    sh.subtitle ? h('p', { class: 'shelf-sub' }, sh.subtitle) : null,
    sh.list.length ? h('div', { class: 'shelf-books' }, sh.list.map(tile)) : null,
    sh.links.length ? (sh.compact
      ? h('div', { class: 'link-groups' }, groupsOf(sh).map((g, i) => h('div', { class: 'link-group-c', id: `shelf-${sh.id}-g${i}` },
          h('h3', null, g),
          h('div', { class: 'link-icons' }, sh.links.filter((l) => (l.group || sh.title) === g).map((l) => h('a', { class: `li-${l.icon || 'link'}`, href: l.url, target: '_blank', rel: 'noopener', title: l.title, 'aria-label': l.title },
            h('span', { class: 'lc-ico' }, svg(LINK_ICONS[l.icon] || ICONS.external)), h('small', null, l.short || l.title)))))))
      : h('div', { class: 'link-cards' }, sh.links.map(linkCard))) : null));
  const view = h('div', { class: 'home' }, hero,
    page('wide home-page', last ? continueCard(last, lib) : null, ...blocks,
      h('footer', { class: 'home-foot' }, ornament(), h('p', null, 'مكتبة الزاوية التمسّكية'))));
  return view;
}
/** رابط «متابعة القراءة» حسب نوع آخر ما قُرئ */
function lastHref(l) {
  if (l.kind === 'page') return href.page(l.b, l.n || 1);
  if (l.kind === 'qasida') return `${href.book(l.b)}${l.ch && l.p === 'qasida' ? `#ch-${l.ch}` : ''}`;
  return `${href.poem(l.b, l.p)}?resume=1`;
}
function continueCard(last, lib) {
  const b = lib.books.find((x) => x.id === last.b);
  if (!b) return null;
  const card = h('section', { class: 'continue-card', 'aria-label': 'متابعة القراءة' },
    h('button', { class: 'dismiss', type: 'button', 'aria-label': 'إخفاء آخر قراءة', title: 'إخفاء', onclick: () => { store.clearLastRead(); card.remove(); } }, '×'),
    h('div', { class: 'ico' }, svg(ICONS.book)),
    h('div', null, h('small', null, 'آخر قصيدة قرأتها'), h('div', { class: 't' }, `«${last.title}»`), h('small', null, b.shortTitle)),
    h('a', { class: 'btn', href: lastHref(last) }, 'متابعة القراءة'));
  return card;
}

// ═══════════ الديوان والفهرس ═══════════
export async function bookView(bookId, focusPoem) {
  let meta;
  try { meta = await data.book(bookId); } catch { return notFound('هذا الديوان غير موجود في المكتبة.'); }
  if (meta.type === 'pages') return pagesBookView(meta);
  if (meta.type === 'qasida') return qasidaView(meta);
  if (meta.type === 'prose') return proseView(meta);
  document.title = meta.shortTitle;
  const last = store.lastRead();
  const resume = last && last.b === bookId && meta.order.includes(last.p) ? last : null;
  const favs = new Set(store.favorites().filter((f) => f.b === bookId).map((f) => f.p));
  const first = meta.order[0];

  const hero = h('section', { class: 'book-hero' },
    meta.cover ? h('div', { class: 'cover' }, h('img', { src: meta.cover, alt: `غلاف ${meta.title}`, width: '900', height: '1273' })) : null,
    h('div', { style: 'display:grid;gap:12px' },
      h('h1', { class: 'h-display' }, emblem(), meta.title),
      meta.summary ? h('p', { class: 'summary' }, meta.summary) : null,
      h('div', { class: 'actions' },
        resume ? h('a', { class: 'btn', href: `${href.poem(bookId, resume.p)}?resume=1` }, 'متابعة القراءة') : h('a', { class: 'btn', href: href.poem(bookId, first) }, 'ابدأ القراءة'),
        h('button', { class: 'btn ghost', type: 'button', onclick: () => document.getElementById('toc').scrollIntoView({ behavior: 'smooth' }) }, 'الفهرس'),
        meta.hasIntro ? h('a', { class: 'btn ghost', href: href.intro(bookId) }, 'المقدمة') : null),
      resume ? h('p', { class: 'muted', style: 'margin:0;font-size:.9rem;text-align:inherit' }, `آخر قراءة: «${resume.title}»`) : null));

  const info = meta.sheikhs.length ? h('section', { class: 'panel' },
    h('h2', null, 'المشايخ'),
    h('ul', { class: 'sheikhs' }, meta.sheikhs.map((s, i) => {
      const n = data.sheikhPoems(meta, i).total;
      return h('li', null, h('a', { href: href.sheikh(bookId, i), 'aria-label': `قصائد ${s.name}` },
        h('span', { class: 'nm' }, s.name),
        h('span', { class: 'meta' }, s.death ? h('span', null, `[${s.death}]`) : null, n ? h('span', { class: 'cnt' }, pluralPoems(n)) : null, svg(ICONS.chev))));
    }))) : null;

  const toc = h('section', { class: 'toc', id: 'toc', 'aria-label': 'الفهرس' }, h('h2', { class: 'h-display', style: 'font-size:1.6rem' }, 'الفهرس'));
  for (const s of meta.sections) {
    const list = (poems, showAuthor) => h('ul', { class: 'toc-list' }, poems.map((p) =>
      h('li', null, h('a', { href: href.poem(bookId, p.id), class: p.id === focusPoem ? 'current' : null, id: `toc-${p.id}` },
        h('span', { class: 'n' }, p.n ?? '۞'),
        h('span', null, h('span', { class: 't' }, p.title), showAuthor ? h('span', { class: 'a' }, p.author) : null),
        h('span', { class: 'marks' },
          p.a ? h('span', { class: 'aud', title: 'يوجد تسجيل', 'aria-label': 'يوجد تسجيل' }, svg(ICONS.headphones)) : null,
          favs.has(p.id) ? h('span', { class: 'fav', 'aria-label': 'في المفضلة' }, '❤') : null)))));
    if (!s.title) {
      // قصائد لا تنتمي لأي قسم: تُعرض بعد فاصل، بلا عنوان قسم
      toc.append(ornament(), h('div', { class: 'toc-plain' }, list(s.poems, true)));
      continue;
    }
    const open = focusPoem ? s.poems.some((p) => p.id === focusPoem) : false;
    const det = h('details', { class: 'toc-sec', open: open || null },
      h('summary', null, h('h2', null, s.title), h('span', { class: 'count' }, pluralPoems(s.poems.length)), h('span', { class: 'chev' }, svg(ICONS.chev))),
      s.description || s.quran ? h('div', { class: 'sec-about' }, s.quran ? h('p', { class: 'quran', style: 'margin:0' }, s.quran) : null, s.description ? h('p', { style: 'margin:0' }, s.description) : null) : null,
      data.groupByAuthor(s.poems).map((g) => h('div', { class: 'toc-group' }, h('h3', null, `قصائد ${g.author}`), list(g.poems, false))));
    toc.append(det);
  }

  const saved = store.offlineSaved(bookId);
  const offline = 'serviceWorker' in navigator ? h('section', { class: 'panel' },
    h('h2', null, 'القراءة دون اتصال'),
    h('p', { class: 'muted', style: 'margin:0' }, saved && saved.version === meta.contentVersion ? 'الديوان محفوظ على هذا الجهاز ويمكن قراءته دون إنترنت.' : 'احفظ الديوان كاملًا على هذا الجهاز لتقرأه دون إنترنت.'),
    h('button', { class: 'btn ghost', type: 'button', onclick: (e) => saveOffline(meta, e.currentTarget) }, svg(ICONS.download), saved && saved.version === meta.contentVersion ? 'تحديث النسخة المحفوظة' : 'حفظ الديوان على الجهاز')) : null;

  const view = page('', backLink('/'), hero, info, toc, offline);
  view._after = () => { if (focusPoem) document.getElementById(`toc-${focusPoem}`)?.scrollIntoView({ block: 'center' }); };
  return view;
}

// ═══════════ قصائد شيخ واحد مقسّمة على أقسام الديوان ═══════════
export async function sheikhView(bookId, idx) {
  let meta;
  try { meta = await data.book(bookId); } catch { return notFound('هذا الديوان غير موجود في المكتبة.'); }
  const r = data.sheikhPoems(meta, Number(idx));
  if (!r) return notFound('لم نجد هذا الشيخ في الديوان.');
  document.title = r.sheikh.name;
  const favs = new Set(store.favorites().filter((f) => f.b === bookId).map((f) => f.p));
  const list = (poems) => h('ul', { class: 'toc-list' }, poems.map((p) =>
    h('li', null, h('a', { href: href.poem(bookId, p.id) },
      h('span', { class: 'n' }, p.n ?? '۞'),
      h('span', null, h('span', { class: 't' }, p.title)),
      h('span', { class: 'marks' },
        p.a ? h('span', { class: 'aud', title: 'يوجد تسجيل', 'aria-label': 'يوجد تسجيل' }, svg(ICONS.headphones)) : null,
        favs.has(p.id) ? h('span', { class: 'fav', 'aria-label': 'في المفضلة' }, '❤') : null)))));
  const head = h('header', { class: 'sheikh-head' },
    h('a', { class: 'crumb', href: href.book(bookId) }, meta.shortTitle),
    h('h1', { class: 'sheikh-name' }, r.sheikh.name),
    r.sheikh.death ? h('p', { class: 'muted', style: 'margin:0' }, `[${r.sheikh.death}]`) : null,
    h('p', { class: 'muted', style: 'margin:0' }, r.total ? `${pluralPoems(r.total)} في هذا الديوان` : 'لا توجد له قصائد في هذا الديوان'));
  const secs = r.sections.map((s) => h('section', { class: 'toc-sec open-sec' },
    h('div', { class: 'sec-head' }, h('h2', null, s.title || 'قصائد أخرى'), h('span', { class: 'count' }, pluralPoems(s.poems.length))),
    list(s.poems)));
  return page('', backLink(href.book(bookId)), head, ornament(), h('section', { class: 'toc' }, ...secs),
    h('div', { class: 'actions' }, h('a', { class: 'btn ghost', href: href.book(bookId) }, 'العودة إلى الديوان')));
}

// ═══════════ قصيدة طويلة بفصول (البردة، الهمزية) ═══════════
const ORD = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر', 'الحادي عشر', 'الثاني عشر', 'الثالث عشر', 'الرابع عشر', 'الخامس عشر', 'السادس عشر', 'السابع عشر', 'الثامن عشر', 'التاسع عشر', 'العشرون', 'الحادي والعشرون', 'الثاني والعشرون', 'الثالث والعشرون', 'الرابع والعشرون', 'الخامس والعشرون', 'السادس والعشرون', 'السابع والعشرون', 'الثامن والعشرون', 'التاسع والعشرون', 'الثلاثون', 'الحادي والثلاثون', 'الثاني والثلاثون', 'الثالث والثلاثون', 'الرابع والثلاثون', 'الخامس والثلاثون', 'السادس والثلاثون', 'السابع والثلاثون', 'الثامن والثلاثون', 'التاسع والثلاثون', 'الأربعون'];
const arNum = (n) => String(n);
// ═══════════ نص نثري (الصلوات الدرديرية) ═══════════
/** نص الصلاة مع تلوين الآيات ﴿…﴾ */
function proseText(t) {
  const frag = document.createDocumentFragment();
  const words = (x, el) => x.split(/(\s+)/).forEach((w) => { if (!w) return; el.append(/\s/.test(w) ? w : h('span', { class: 'w', 'data-t': w }, w)); });
  t.split(/(﴿[^﴾]*﴾)/).forEach((x) => { if (!x) return; if (x.startsWith('﴿')) { const a = h('span', { class: 'pr-aya' }); words(x, a); frag.append(a); } else words(x, frag); });
  return frag;
}
/** ضبط الأسطر بالمدّ (الكشيدة) كالكتاب المطبوع: كل سطر يمتدّ إلى آخر العرض دون فراغات واسعة بين الكلمات */
function justifyKashida(root) {
  if (!root || !root.isConnected) return;
  root.querySelectorAll('.w[data-t]').forEach((w) => { if (w.textContent !== w.dataset.t) w.textContent = w.dataset.t; });
  const first = root.querySelector('.w[data-t]'); if (!first) return;
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.font = getComputedStyle(first).font;
  const tw = ctx.measureText('ـ').width; if (!tw) return;
  const stretchWord = (el, c) => {
    const base = el.dataset.t; const slots = kashidaSlots(base)[0] || [];
    if (!slots.length || c < 1) { el.textContent = base; return; }
    const order = [slots[slots.length - 1], ...slots.slice(0, -1).reverse()];
    const cnt = new Map(); for (let k = 0; k < c; k++) { const pos = order[k % order.length]; cnt.set(pos, (cnt.get(pos) || 0) + 1); }
    let out = base; [...cnt.entries()].sort((a, b) => b[0] - a[0]).forEach(([pos, m]) => { out = out.slice(0, pos) + 'ـ'.repeat(m) + out.slice(pos); });
    el.textContent = out;
  };
  for (const p of root.querySelectorAll('.pr-p')) {
    const cs = getComputedStyle(p);
    const r0 = p.getBoundingClientRect();
    const left = r0.left + parseFloat(cs.paddingLeft), right = r0.right - parseFloat(cs.paddingRight);
    const items = [...p.querySelectorAll('.w[data-t], .pr-orn')];
    // الأسطر: تُقرأ مرة واحدة (المدّ داخل السطر لا يغيّر توزيع الكلمات ما دام لا يتجاوز العرض)
    const lines = [];
    const lh = parseFloat(cs.lineHeight) || 40;
    for (const el of items) { const r = el.getBoundingClientRect(); const mid = (r.top + r.bottom) / 2; const L = lines[lines.length - 1];
      if (L && Math.abs(L.mid - mid) < lh * 0.4) L.items.push(el); else lines.push({ mid, items: [el] }); }
    const midOf = (el) => { const r = el.getBoundingClientRect(); return (r.top + r.bottom) / 2; };
    for (const L of lines.slice(0, -1)) {                     // السطر الأخير من الفقرة يبقى طبيعيًا
      const words = L.items.filter((el) => el.classList.contains('w') && (kashidaSlots(el.dataset.t)[0] || []).length);
      if (!words.length) continue;
      // العرض الطبيعي للسطر (دون تمديد المسافات): مجموع عروض العناصر + مسافة طبيعية بينها
      const natural = L.items.reduce((a, el) => a + el.getBoundingClientRect().width, 0) + ctx.measureText(' ').width * (L.items.length - 1);
      let n = Math.floor(((right - left) - natural) / tw * 0.9);
      const lastEl = L.items[L.items.length - 1];
      const apply = (n) => { const per = new Array(words.length).fill(0); for (let k = 0; k < n; k++) per[k % words.length]++; words.forEach((w, i) => stretchWord(w, per[i])); };
      let g = 0;
      while (n > 0 && g++ < 8) {
        apply(n);
        if (Math.abs(midOf(lastEl) - midOf(L.items[0])) < lh * 0.4) break;   // بقي السطر سطرًا واحدًا
        n = Math.floor(n * 0.7);
      }
      if (g > 8 || n <= 0) apply(0);
    }
  }
}

function proseView(meta) {
  document.title = meta.shortTitle;
  const letters = meta.sections.map((s, i) => ({ s, i })).filter((x) => x.s.title);
  const body = h('div', { class: 'prose-body', lang: 'ar' });
  meta.sections.forEach((s, i) => {
    const sec = h('section', { class: `pr-sec pr-${s.kind}`, id: `s-${i}` });
    if (s.title) sec.append(h('div', { class: 'pr-head' },
      h('span', { class: 'pr-wing', 'aria-hidden': 'true' }, '❧'), h('h2', null, s.title), h('span', { class: 'pr-wing r', 'aria-hidden': 'true' }, '❧')));
    if (s.kind === 'closing') sec.append(h('div', { class: 'q-ch-orn', 'aria-hidden': 'true' }, '❁ ✦ ❁'));
    s.paras.forEach((p) => {
      const para = h('p', { class: 'pr-p' });
      p.forEach((it, k) => { if (k) para.append(h('span', { class: 'pr-orn', 'aria-hidden': 'true' }, ' ۞ ')); para.append(proseText(it)); });
      sec.append(para);
    });
    body.append(sec);
  });
  const toc = h('nav', { class: 'q-toc pr-toc', 'aria-label': 'الحروف' }, letters.map(({ s, i }) =>
    h('a', { href: `#s-${i}`, onclick: (e) => { e.preventDefault(); document.getElementById(`s-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, s.title.replace(/^حرف\s+/, ''))));
  const head = h('header', { class: 'q-head' },
    h('div', { class: 'q-orn', 'aria-hidden': 'true' }, '❁ ✦ ❁'),
    h('h1', { class: 'q-title' }, meta.title),
    meta.subtitle ? h('p', { class: 'q-sub' }, meta.subtitle) : null,
    meta.author ? h('p', { class: 'q-author' }, meta.author) : null,
    h('p', { class: 'q-basmala' }, 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ'));
  const tools = h('div', { class: 'reader-tools' },
    backIcon('/'),
    h('a', { class: 'icon-btn', href: '/', 'aria-label': 'المكتبة', title: 'المكتبة' }, svg(ICONS.library)),
    h('div', { class: 'crumb' }, meta.shortTitle),
    h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'تصغير الخط', onclick: () => sizeToast(store.stepSize(-1)) }, svg(ICONS.textSmall)),
    h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'تكبير الخط', onclick: () => sizeToast(store.stepSize(1)) }, svg(ICONS.textSize)));
  const frame = h('article', { class: 'q-frame pr-frame' }, head,
    h('details', { class: 'q-toc-wrap' }, h('summary', null, 'الانتقال إلى حرف'), toc), body,
    h('div', { class: 'q-end' }, 'تَمَّ بِحَمْدِ اللهِ'));
  const view = h('div', { class: 'reader q-reader' }, tools, h('div', { class: 'page' }, frame));
  view._layout = () => justifyKashida(body);
  view._after = () => {
    justifyKashida(body);
    document.fonts?.load?.('20px "Scheherazade New"', 'بسم').then(() => document.fonts.ready).then(() => body.isConnected && justifyKashida(body));
  };
  let tm;
  view._scroll = () => { clearTimeout(tm); tm = setTimeout(() => {
    let cur = null; letters.forEach(({ s, i }) => { const el = document.getElementById(`s-${i}`); if (el && el.getBoundingClientRect().top < innerHeight * 0.4) cur = s.title; });
    store.setLastRead({ b: meta.id, p: 'prose', kind: 'qasida', title: `${meta.shortTitle}${cur ? ` — ${cur}` : ''}`, bookTitle: meta.shortTitle });
  }, 400); };
  store.setLastRead({ b: meta.id, p: 'prose', kind: 'qasida', title: meta.shortTitle, bookTitle: meta.shortTitle });
  attachToc(view, 'الحروف', () => {
    const its = meta.sections.map((s, i) => ({ s, i })).filter((x) => x.s.title);
    let cur = -1; its.forEach((x, k) => { const el = document.getElementById(`s-${x.i}`); if (el && el.getBoundingClientRect().top < innerHeight * 0.4) cur = k; });
    return its.map((x, k) => ({ title: x.s.title, target: `s-${x.i}`, current: k === cur }));
  });
  return view;
}

function qasidaView(meta) {
  document.title = meta.shortTitle;
  const starts = new Map(meta.chapters.map((c, i) => [c.from, i]));
  const notes = meta.notes || {};
  const blk = h('div', { class: 'blk c2' });
  for (const v of meta.verses) {
    if (starts.has(v.n)) {
      const i = starts.get(v.n), c = meta.chapters[i];
      blk.append(h('div', { class: 'q-ch', id: `ch-${i + 1}` },
        h('div', { class: 'q-ch-orn', 'aria-hidden': 'true' }, '❁'),
        h('div', { class: 'q-ch-k' }, `الفصل ${ORD[i] || arNum(i + 1)}`),
        h('h2', { class: 'q-ch-t' }, c.title),
        h('div', { class: 'q-ch-line', 'aria-hidden': 'true' })));
    }
    const row = h('div', { class: 'row v2', id: `v-${v.n}`, 'data-n': arNum(v.n) });
    v.s.forEach((t, k) => row.append(h('div', { class: 'part', 'data-col': k }, h('span', { class: 'tx', 'data-t': t, 'data-o': t }, t))));
    row.append(h('span', { class: 'vn', 'aria-label': `البيت ${v.n}` }, h('span', null, arNum(v.n)), notes[v.n] ? h('sup', null, '*') : null));
    blk.append(row);
    if (notes[v.n]) blk.append(h('p', { class: 'q-note' }, h('b', null, `* البيت ${arNum(v.n)}: `), notes[v.n]));
  }
  const body = h('div', { class: 'poem q-poem', lang: 'ar' }, blk);
  const toc = h('nav', { class: 'q-toc', 'aria-label': 'فصول القصيدة' }, meta.chapters.map((c, i) =>
    h('a', { href: `#ch-${i + 1}`, onclick: (e) => { e.preventDefault(); document.getElementById(`ch-${i + 1}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } },
      h('span', { class: 'k' }, ORD[i] || arNum(i + 1)), h('span', null, c.title))));
  const head = h('header', { class: 'q-head' },
    h('div', { class: 'q-orn', 'aria-hidden': 'true' }, '❁ ✦ ❁'),
    h('h1', { class: 'q-title' }, meta.title),
    meta.subtitle ? h('p', { class: 'q-sub' }, meta.subtitle) : null,
    meta.author ? h('p', { class: 'q-author' }, meta.author) : null,
    meta.meter ? h('p', { class: 'muted', style: 'margin:0' }, `${meta.meter} · ${arNum(meta.verses.length)} بيتًا`) : null,
    h('p', { class: 'q-basmala' }, 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ'));
  const tools = h('div', { class: 'reader-tools' },
    backIcon('/'),
    h('a', { class: 'icon-btn', href: '/', 'aria-label': 'المكتبة', title: 'المكتبة' }, svg(ICONS.library)),
    h('div', { class: 'crumb' }, meta.shortTitle),
    h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'تصغير الخط', onclick: () => sizeToast(store.stepSize(-1)) }, svg(ICONS.textSmall)),
    h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'تكبير الخط', onclick: () => sizeToast(store.stepSize(1)) }, svg(ICONS.textSize)));
  // اللازمة: بيت يُردَّد مع القصيدة، في الوسط بإطار مزخرف
  const refrain = meta.refrain ? h('section', { class: 'q-refrain', 'aria-label': 'اللازمة' },
    meta.refrain.verses.map((v) => h('div', { class: 'rf-v' }, v.map((t) => h('span', { class: 'rf-s' }, t)))),
    meta.refrain.note ? (() => { const ws = meta.refrain.note.split(' '); const first = ws.shift(); const last = ws.pop(); return h('p', { class: 'rf-note' }, h('span', { class: 'nw' }, h('span', { class: 'rf-par', 'aria-hidden': 'true' }, '❪'), first), ` ${ws.join(' ')} `, h('span', { class: 'nw' }, last, h('span', { class: 'rf-par', 'aria-hidden': 'true' }, '❫'))); })() : null) : null;
  const frame = h('article', { class: 'q-frame' }, head, refrain, h('details', { class: 'q-toc-wrap', open: true }, h('summary', null, 'فصول القصيدة'), toc), body,
    meta.chapterNote ? h('p', { class: 'q-foot' }, meta.chapterNote) : null,
    h('div', { class: 'q-end' }, 'تَمَّ بِحَمْدِ اللهِ'));
  const view = h('div', { class: 'reader q-reader' }, tools, h('div', { class: 'page' }, frame));
  view._layout = () => layoutPoem(body);
  view._after = () => {
    // التنسيق مرة واحدة بعد تحميل الخط الخاص (وإن تأخّر الخط كثيرًا نُنسّق الآن ثم نعيد عند وصوله)
    const fontOk = () => document.fonts?.check?.('20px "Scheherazade New"', 'بسم');
    if (!document.fonts?.load || fontOk()) layoutPoem(body);
    else {
      let done = false;
      const t = setTimeout(() => { if (!done) layoutPoem(body); }, 2500);
      document.fonts.load('20px "Scheherazade New"', 'بسم').then(() => document.fonts.ready).then(() => { done = true; clearTimeout(t); if (body.isConnected) layoutPoem(body); });
    }
    const m = location.hash.match(/^#(ch-\d+|v-\d+)$/);
    if (m) document.getElementById(m[1])?.scrollIntoView({ block: 'start' });
  };
  // آخر قراءة: الفصل الظاهر على الشاشة
  let tm;
  view._scroll = () => { clearTimeout(tm); tm = setTimeout(() => {
    const chs = [...body.querySelectorAll('.q-ch')]; let cur = 0;
    chs.forEach((el, i) => { if (el.getBoundingClientRect().top < innerHeight * 0.4) cur = i + 1; });
    store.setLastRead({ b: meta.id, p: 'qasida', kind: 'qasida', ch: cur || 1, title: `${meta.shortTitle}${cur ? ` — الفصل ${ORD[cur - 1]}` : ''}`, bookTitle: meta.shortTitle });
  }, 400); };
  store.setLastRead({ b: meta.id, p: 'qasida', kind: 'qasida', ch: 1, title: meta.shortTitle, bookTitle: meta.shortTitle });
  attachToc(view, 'فصول القصيدة', () => {
    let cur = -1; meta.chapters.forEach((c, i) => { const el = document.getElementById(`ch-${i + 1}`); if (el && el.getBoundingClientRect().top < innerHeight * 0.4) cur = i; });
    return meta.chapters.map((c, i) => ({ title: c.title, sub: `الفصل ${ORD[i] || arNum(i + 1)}`, target: `ch-${i + 1}`, current: i === cur }));
  });
  return view;
}

// ═══════════ كتاب يُعرض صفحاتٍ (الأوراد) ═══════════
function offlinePanel(meta) {
  if (!('serviceWorker' in navigator)) return null;
  const saved = store.offlineSaved(meta.id);
  const ok = saved && saved.version === meta.contentVersion;
  return h('section', { class: 'panel' },
    h('h2', null, 'القراءة دون اتصال'),
    h('p', { class: 'muted', style: 'margin:0' }, ok ? 'الكتاب محفوظ على هذا الجهاز ويمكن قراءته دون إنترنت.' : 'احفظ الكتاب كاملًا على هذا الجهاز لتقرأه دون إنترنت.'),
    h('button', { class: 'btn ghost', type: 'button', onclick: (e) => saveOffline(meta, e.currentTarget) }, svg(ICONS.download), ok ? 'تحديث النسخة المحفوظة' : 'حفظ الكتاب على الجهاز'));
}
function pagesBookView(meta) {
  document.title = meta.shortTitle;
  const last = store.lastRead();
  const resume = last && last.b === meta.id && last.kind === 'page' ? last : null;
  // تجهيز أولى الصفحات مسبقًا ليظهر الكتاب فور الضغط على «ابدأ» أو «متابعة»
  const warm = (k) => { if (k >= 1 && k <= meta.pages.length) { new Image().src = (meta.thumbs || meta.pages)[k - 1]; } };
  setTimeout(() => { for (const k of [1, 2, 3]) warm(k); if (resume) for (const k of [resume.n, resume.n + 1]) warm(k); }, 50);
  const hero = h('section', { class: 'book-hero' },
    (meta.coverThumb || meta.cover) ? h('div', { class: 'cover' }, h('img', { src: meta.coverThumb || meta.cover, alt: `غلاف ${meta.title}`, width: '420', height: '600' })) : null,
    h('div', { style: 'display:grid;gap:12px' },
      h('h1', { class: 'h-display' }, emblem(), meta.title),
      meta.compiler ? h('p', { class: 'summary' }, `${meta.compilerLabel ? meta.compilerLabel + ': ' : ''}${meta.compiler}`) : null,
      h('p', { class: 'muted', style: 'margin:0' }, `${meta.pageCount || meta.pages.length} صفحة`),
      h('div', { class: 'actions' },
        resume ? h('a', { class: 'btn', href: href.page(meta.id, resume.n) }, `متابعة القراءة (صفحة ${resume.n})`) : null,
        h('a', { class: resume ? 'btn ghost' : 'btn', href: href.page(meta.id, 1) }, 'ابدأ من الأول'))));
  const toc = meta.toc.length ? h('section', { class: 'toc', 'aria-label': 'الفهرس' },
    h('h2', { class: 'h-display', style: 'font-size:1.6rem' }, 'الفهرس'),
    h('div', { class: 'toc-sec open-sec' }, h('ul', { class: 'toc-list' }, meta.toc.map((t) =>
      h('li', null, h('a', { href: href.page(meta.id, t.page) }, h('span', { class: 'n' }, t.page), h('span', null, h('span', { class: 't' }, t.title)))))))) : null;
  if (!meta.pdf && meta.pages.length) setTimeout(() => { const last = store.lastRead(); const k = last && last.b === meta.id && last.kind === 'page' ? last.n : 1; const im = new Image(); im.src = meta.pages[k - 1]; }, 300);
  return page('', backLink('/'), hero, toc, offlinePanel(meta));
}
// ——— كتب PDF: تُرسم الصفحة في المتصفح (ملف واحد بدل مئات الصور) ———
let pdfLib = null; const pdfDocs = new Map();
function loadPdfLib() {
  if (!pdfLib) pdfLib = new Promise((res, rej) => {
    const v = window.__V ? `?v=${window.__V}` : '';
    const sc = document.createElement('script'); sc.src = `vendor/pdfjs/pdf.min.js${v}`;
    sc.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = `vendor/pdfjs/pdf.worker.min.js${v}`; res(window.pdfjsLib); };
    sc.onerror = () => { pdfLib = null; rej(new Error('pdf.js')); };
    document.head.append(sc);
  });
  return pdfLib;
}
function pdfDoc(url) {
  if (!pdfDocs.has(url)) pdfDocs.set(url, loadPdfLib().then((lib) => lib.getDocument({ url: new URL(url, document.baseURI).href, disableRange: true, disableStream: true, isEvalSupported: false, disableFontFace: true, useSystemFonts: false }).promise).catch((e) => { pdfDocs.delete(url); throw e; }));
  return pdfDocs.get(url);
}
async function renderPdfPage(url, n, canvas, box) {
  const doc = await pdfDoc(url);
  const page = await doc.getPage(n);
  const base = page.getViewport({ scale: 1 });
  const cssW = Math.max(280, box.clientWidth || 600);
  const scale = (cssW / base.width) * Math.min(3, (window.devicePixelRatio || 1) * 1.5);
  const vp = page.getViewport({ scale });
  canvas.width = Math.floor(vp.width); canvas.height = Math.floor(vp.height);
  canvas.style.aspectRatio = `${vp.width} / ${vp.height}`;
  await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
  if (n < doc.numPages) doc.getPage(n + 1).catch(() => {});   // تجهيز الصفحة التالية
}

// ——— زرّ الفهرس العائم: قائمة تظهر من الأسفل، والقسم الحالي عليه علامة، وورد اليوم مميّز ———
const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const normDay = (s) => (s || '').replace(/[إأآ]/g, 'ا').replace(/[ً-ْ]/g, '');
function attachToc(view, heading, getItems) {
  const today = normDay(DAYS[new Date().getDay()]);
  const close = () => { sheet.hidden = true; scrim.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
  const scrim = h('div', { class: 'toc-scrim', hidden: true, onclick: close });
  const list = h('div', { class: 'toc-sheet-list', role: 'list' });
  const sheet = h('div', { class: 'toc-sheet', hidden: true, role: 'dialog', 'aria-label': heading },
    h('div', { class: 'toc-sheet-head' }, h('span', { class: 'grip', 'aria-hidden': 'true' }), h('b', null, heading),
      h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'إغلاق', onclick: close }, svg('<path d="M6 6l12 12M18 6L6 18"/>'))), list);
  const open = () => {
    const items = getItems();
    list.replaceChildren(...items.map((it) => {
      const isToday = normDay(it.title).includes(today);
      const row = h('a', { class: `toc-item${it.current ? ' cur' : ''}${isToday ? ' today' : ''}`, href: it.href || `#${it.target}`, role: 'listitem',
        onclick: (e) => { if (it.target) { e.preventDefault(); close(); document.getElementById(it.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } else close(); } },
        h('span', { class: 'ti-t' }, it.title, isToday ? h('em', null, 'ورد اليوم') : null),
        it.sub ? h('small', null, it.sub) : null,
        h('span', { class: 'ti-check', 'aria-hidden': 'true' }, it.current ? '✓' : ''));
      return row;
    }));
    sheet.hidden = false; scrim.hidden = false; btn.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => (list.querySelector('.cur') || list.querySelector('.today'))?.scrollIntoView({ block: 'center' }));
  };
  const btn = h('button', { class: 'toc-fab', type: 'button', 'aria-label': heading, title: heading, 'aria-expanded': 'false', onclick: open },
    svg('<path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z"/>'));
  view.append(btn, scrim, sheet);
}

export async function pageView(bookId, nStr) {
  let meta;
  try { meta = await data.book(bookId); } catch { return notFound('هذا الكتاب غير موجود في المكتبة.'); }
  if (meta.type !== 'pages') return notFound('هذا الكتاب لا يُعرض صفحاتٍ.');
  const N = meta.pageCount || meta.pages.length;
  const n = Math.min(N, Math.max(1, parseInt(nStr, 10) || 1));
  const [pw, ph] = meta.pageSize || [1182, 1674];
  const secOf = (k) => [...(meta.toc || [])].reverse().find((t) => t.page <= k);
  const crumb = h('div', { class: 'crumb' });
  const pageNo = h('span', { class: 'page-no' });
  const tools = h('div', { class: 'reader-tools' },
    backIcon(href.book(bookId)),
    h('a', { class: 'icon-btn', href: href.book(bookId), 'aria-label': 'صفحة الكتاب', title: 'صفحة الكتاب' }, svg(ICONS.list)),
    crumb, pageNo);
  // القراءة متصلة: كل الصفحات تحت بعضها، تُحمَّل صورها عند الاقتراب منها
  const sheets = [];
  const stack = h('div', { class: 'page-stack' });
  for (let k = 1; k <= N; k++) {
    const near = Math.abs(k - n) <= 2;
    const img = h('img', { class: 'page-img', alt: `${meta.title} — صفحة ${k}`, width: String(pw), height: String(ph), decoding: 'async',
      loading: near ? 'eager' : 'lazy', src: meta.thumbs ? meta.thumbs[k - 1] : meta.pages[k - 1] });
    const fig = h('figure', { class: 'page-sheet', id: `pg-${k}`, 'data-n': k }, img);
    sheets.push(fig); stack.append(fig);
  }
  // الصفحة الكاملة الجودة تُجلب مسبقًا لما حولك (نسخة خفيفة تظهر أولًا ريثما تصل)
  const sharp = new Set();
  const upgrade = (k) => {
    if (k < 1 || k > N || sharp.has(k)) return; sharp.add(k);
    const img = sheets[k - 1].firstChild, full = meta.pages[k - 1];
    if (img.src.endsWith(full)) return;
    const pre = new Image(); pre.decoding = 'async'; pre.src = full;
    (pre.decode ? pre.decode() : Promise.resolve()).then(() => { img.src = full; }, () => { img.src = full; });
  };
  let cur = 0;
  const setCur = (k) => {
    if (k === cur) return; cur = k;
    for (const d of [0, 1, -1, 2, 3]) upgrade(k + d);
    const sec = secOf(k);
    crumb.replaceChildren(h('a', { href: href.book(bookId) }, meta.shortTitle), sec ? ` › ${sec.title}` : '');
    pageNo.textContent = `صفحة ${k} من ${N}`;
    document.title = `${meta.shortTitle} — صفحة ${k}`;
    setUrlQuietly(href.page(bookId, k));
    store.setLastRead({ b: bookId, p: `page:${k}`, kind: 'page', n: k, title: `${meta.shortTitle} — صفحة ${k}`, bookTitle: meta.shortTitle });
  };
  setCur(n);
  const visible = () => {           // الصفحة التي في منتصف الشاشة
    const y = innerHeight * 0.45; let lo = 0, hi = sheets.length - 1;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (sheets[m].getBoundingClientRect().top <= y) lo = m; else hi = m - 1; }
    return lo + 1;
  };
  const goTo = (k, smooth) => document.getElementById(`pg-${k}`)?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
  const view = h('div', { class: 'reader pages-reader' }, tools, h('div', { class: 'page' }, stack));
  view._after = () => { if (n > 1) { goTo(n); setTimeout(() => goTo(n), 400); } };
  view._scroll = () => setCur(visible());
  view._keys = (e) => { if (e.key === 'ArrowLeft') goTo(Math.min(N, cur + 1), true); if (e.key === 'ArrowRight') goTo(Math.max(1, cur - 1), true); };
  if (meta.toc && meta.toc.length) attachToc(view, 'الفهرس', () => {
    const c = [...meta.toc].map((t, i) => [t, i]).reverse().find(([t]) => t.page <= cur);
    return meta.toc.map((t, i) => ({ title: t.title, sub: `صفحة ${t.page}`, target: `pg-${t.page}`, current: c && c[1] === i }));
  });
  return view;
}

async function saveOffline(meta, btn) {
  btn.disabled = true;
  const vv = (u) => (window.__V ? `${u}?v=${window.__V}` : u);
  const urls = meta.type === 'pages' ? (meta.pdf ? [meta.pdf] : [...meta.pages]) : [vv(`data/books/${meta.id}/search.json`), vv(`data/books/${meta.id}/intro.json`), ...meta.order.map((p) => data.poemUrl(meta.id, p)),
    ...meta.sections.map((s) => s.image).filter(Boolean)];
  let done = 0; const label = btn.lastChild;
  try {
    for (let i = 0; i < urls.length; i += 8) {
      await Promise.all(urls.slice(i, i + 8).map((u) => fetch(u).then((r) => { if (!r.ok) throw new Error(u); })));
      done = Math.min(urls.length, i + 8); label.textContent = ` جارٍ الحفظ… ${Math.round((done / urls.length) * 100)}%`;
    }
    store.markOffline(meta.id, meta.contentVersion);
    label.textContent = 'حُفظ الديوان على الجهاز ✓';
    toast('أصبح الديوان متاحًا دون اتصال.');
  } catch {
    label.textContent = 'تعذّر الحفظ — حاول مجددًا';
    toast('تعذّر حفظ الديوان. تأكد من الاتصال ثم أعد المحاولة.');
  }
  btn.disabled = false;
}

// ═══════════ المقدمة ═══════════
export async function introView(bookId) {
  let meta, intro;
  try { [meta, intro] = await Promise.all([data.book(bookId), data.intro(bookId)]); } catch { return notFound('لا توجد مقدمة لهذا الديوان.'); }
  document.title = `المقدمة — ${meta.shortTitle}`;
  const box = h('article', { class: 'intro' });
  let ul = null;
  for (const p of intro.paragraphs) {
    const t = display(p.text);
    if (p.kind === 'sheikh' || p.kind === 'item') { if (!ul) { ul = h('ul'); box.append(ul); } ul.append(h('li', null, t)); continue; }
    ul = null;
    if (p.kind === 'basmala') box.append(h('p', { class: 'basmala' }, t));
    else if (p.kind === 'verse') box.append(h('p', { class: 'verse' }, t));
    else if (p.kind === 'quran') box.append(h('p', { class: 'quran' }, t));
    else if (p.kind === 'signature') box.append(h('p', { class: 'sign' }, t));
    else box.append(h('p', null, t));
  }
  return page('', backLink(href.book(bookId)), h('div', { class: 'eyebrow' }, meta.shortTitle), h('h1', { class: 'h-display', style: 'font-size:2rem' }, 'المقدمة'), box,
    h('div', { class: 'reader-foot' }, h('a', { class: 'btn', href: href.poem(bookId, meta.order[0]) }, 'ابدأ القراءة'), h('a', { class: 'btn ghost', href: href.book(bookId) }, 'الفهرس')));
}

// ═══════════ القارئ ═══════════
export async function poemView(bookId, poemId, params) {
  let meta, poem;
  try { [meta, poem] = await Promise.all([data.book(bookId), data.poem(bookId, poemId)]); }
  catch { return notFound('لم نجد هذه القصيدة. ربما تغيّر الديوان؛ ابحث عنها في الفهرس.'); }
  const loc = data.locate(meta, poemId);
  if (!loc) return notFound('هذه القصيدة لم تعد ضمن الديوان.');
  const title = display(poem.title);
  document.title = `${title} — ${meta.shortTitle}`;
  const words = params.get('q') ? queryWords(params.get('q')) : [];

  store.setLastRead({ b: bookId, p: poemId, title, bookTitle: meta.shortTitle });

  // النص
  const body = h('div', { class: 'poem', lang: 'ar' });
  let i = 0; let firstHit = null;
  for (const b of poem.blocks) {
    const prose = b.cols === 1 && b.rows.length > 1;
    const blk = h('div', { class: `blk c${b.cols}${prose ? ' prose' : ''}` });
    if (b.widths) { blk.dataset.w = JSON.stringify(b.widths); blk.dataset.g = JSON.stringify(b.gaps || []); }
    for (const r of b.rows) {
      let parts = Array.isArray(r) ? r : [r.span];
      let colIdx = parts.map((_, k) => k);
      // نوع السطر: لازمة متوسّطة، أو بيت بشطرين، أو أجزاء بمواضعها (التخطيط المتدرّج)
      let kind = Array.isArray(r) ? `v${b.cols}` : 'span';
      if (Array.isArray(r) && b.cols === 3) {
        const filled = r.map((x, k) => (x ? k : -1)).filter((k) => k >= 0).join();
        if (filled === '1') { kind = 'span'; parts = [r[1]]; }
        else if (filled === '0,2') { kind = 'v2'; parts = [r[0], r[2]]; colIdx = [0, 2]; }
      }
      if (b.cols === 1 && Array.isArray(r)) kind = 'v1';
      const row = h('div', { class: `row ${kind}`, 'data-i': i });
      let hit = false;
      for (const [pi, p] of parts.entries()) {
        const res = highlight(display(p), words);
        hit = hit || res.hit;
        // النص الأصلي يُحفظ لإعادة حساب المدّ عند تغيّر العرض (الأسطر الملوّنة بالبحث لا تُمدّ)
        row.append(h('div', { class: 'part', 'data-col': colIdx[pi] }, p ? h('span', { class: 'tx', 'data-t': res.hit ? null : display(p), 'data-o': res.hit ? null : p.replace(/\s+/g, ' ').trim() }, res.node) : null));
      }
      if (hit) { row.classList.add('hit'); firstHit = firstHit || row; }
      blk.append(row); i++;
    }
    body.append(blk);
  }

  const fav = store.isFav(bookId, poemId);
  const favBtn = h('button', { class: 'icon-btn', type: 'button', 'aria-pressed': String(fav), 'aria-label': fav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة', title: 'المفضلة' }, svg(ICONS.heart));
  favBtn.addEventListener('click', () => {
    const on = store.toggleFav(bookId, poemId, { title, bookTitle: meta.shortTitle });
    favBtn.setAttribute('aria-pressed', String(on)); favBtn.setAttribute('aria-label', on ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة');
    toast(on ? 'أُضيفت إلى المفضلة ❤' : 'أُزيلت من المفضلة');
  });

  const sec = loc.section;
  const plain = () => {
    const lines = poem.blocks.flatMap((b) => b.rows.map((r) => (Array.isArray(r) ? r.filter(Boolean).map(display).join('    ') : display(r.span))));
    return [`${loc.entry.n ? `(${loc.entry.n}) ` : ''}${title}`, display(poem.author), '', ...lines, '', `— ${meta.title}`].join('\n');
  };
  const link = () => location.href.split('?')[0];
  const tools = h('div', { class: 'reader-tools' },
    backIcon(`${href.book(bookId)}?p=${poemId}`),
    h('a', { class: 'icon-btn', href: `${href.book(bookId)}?p=${poemId}`, 'aria-label': 'العودة إلى الفهرس', title: 'الفهرس' }, svg(ICONS.list)),
    h('div', { class: 'crumb' }, h('a', { href: href.book(bookId) }, meta.shortTitle), sec.title ? ` › ${sec.title}` : ''),
    h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'تصغير الخط', title: 'تصغير الخط', onclick: () => sizeToast(store.stepSize(-1)) }, svg(ICONS.textSmall)),
    h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'تكبير الخط', title: 'تكبير الخط', onclick: () => sizeToast(store.stepSize(1)) }, svg(ICONS.textSize)),
    h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'تغيير وضع القراءة', title: 'وضع القراءة', onclick: () => toast(`وضع القراءة: ${store.MODE_NAMES[store.cycleMode()]}`) }, svg(ICONS.moon)),
    favBtn,
    h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'نسخ القصيدة', title: 'نسخ', onclick: async () => toast((await copyText(plain())) ? 'نُسخت القصيدة.' : 'تعذّر النسخ.') }, svg(ICONS.copy)),
    h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'مشاركة القصيدة', title: 'مشاركة', onclick: async () => {
      const shareData = { title: `${title} — ${meta.shortTitle}`, text: `«${title}» — ${display(poem.author)}\nمن ${meta.title}`, url: link() };
      if (navigator.share) { try { await navigator.share(shareData); return; } catch (e) { if (e.name === 'AbortError') return; } }
      toast((await copyText(`${shareData.text}\n${shareData.url}`)) ? 'نُسخ رابط القصيدة للمشاركة.' : 'تعذّرت المشاركة.');
    } }, svg(ICONS.share)));

  const head = h('header', { class: 'poem-head' },
    sec.title ? h('div', { class: 'sec' }, sec.title) : null,
    h('h1', null, loc.entry.n ? h('span', { class: 'num' }, `(${loc.entry.n})`) : null, title),
    h('div', { class: 'by' }, display(poem.author)));

  let listen = recordingsPanel(poem.recordings || [], title, display(poem.author), meta.shortTitle);
  // التسجيلات مدمجة في بيانات القصيدة عند البناء فتظهر فورًا؛ وفي الخلفية يُقرأ links.txt لالتقاط رابط أُضيف بعد البناء
  {
    const num = loc.entry.n ?? (sec.poems.findIndex((x) => x.id === poemId) + 1);
    const have = new Set((poem.recordings || []).map((r) => r.src));
    audioLinks(bookId).then((links) => {
      const extra = (links[`${sec.id}-${num}`] || []).filter((r) => !have.has(r.src));
      if (!extra.length || !listen.isConnected) return;
      const recs = [...(poem.recordings || []), ...extra].map((r, k) => ({ ...r, i: k + 1 }));
      const panel = recordingsPanel(recs, title, display(poem.author), meta.shortTitle);
      listen.replaceWith(panel); listen = panel;
    });
  }

  // القصيدتان السابقة والتالية تُحمَّلان في الخلفية لتُفتحا فورًا
  setTimeout(() => { for (const x of [loc.next, loc.prev]) if (x) data.poem(bookId, x.id).catch(() => {}); }, 600);
  const pager = h('nav', { class: 'pager', 'aria-label': 'التنقل بين القصائد' },
    loc.prev ? h('a', { class: 'prev', href: href.poem(bookId, loc.prev.id), rel: 'prev' }, h('small', null, '→ السابقة'), h('span', { class: 't' }, loc.prev.title)) : h('span', { class: 'ph' }),
    loc.next ? h('a', { class: 'next', href: href.poem(bookId, loc.next.id), rel: 'next' }, h('small', null, 'التالية ←'), h('span', { class: 't' }, loc.next.title)) : h('span', { class: 'ph' }));

  const foot = h('div', { class: 'reader-foot' },
    h('a', { class: 'btn ghost', href: `${href.book(bookId)}?p=${poemId}` }, svg(ICONS.list), 'الفهرس'),
    h('a', { class: 'btn ghost', href: '/' }, svg(ICONS.library), 'المكتبة'));

  const pos = h('p', { class: 'muted', style: 'text-align:center;margin:0;font-size:.82rem' }, `القصيدة ${loc.index + 1} من ${loc.total}`);
  const view = h('div', null, tools, page('reader', head, listen, ornament(), body, poem.notes ? h('div', { class: 'poem-notes' }, poem.notes.join(' ')) : null, pos, pager, foot));
  view._layout = () => layoutPoem(body);
  view._after = () => {
    layoutPoem(body);
    document.fonts?.ready.then(() => layoutPoem(body));
    if (firstHit) firstHit.scrollIntoView({ block: 'center' });
    else if (params.get('resume')) {
      const l = store.lastRead();
      if (l && l.scroll) window.scrollTo(0, l.scroll * (document.documentElement.scrollHeight - innerHeight));
    }
  };
  view._keys = (e) => {
    if (e.key === 'ArrowLeft' && loc.next) navigate(href.poem(bookId, loc.next.id));
    if (e.key === 'ArrowRight' && loc.prev) navigate(href.poem(bookId, loc.prev.id));
  };
  view._scroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (max > 0) store.setLastScroll(bookId, poemId, scrollY / max);
  };
  attachToc(view, loc.section.title || meta.shortTitle, () => loc.section.poems.map((p) => ({ title: display(p.title), sub: p.n ? String(p.n) : '', href: href.poem(bookId, p.id), current: p.id === poemId })));
  return view;
}
/**
 * تنسيق الأبيات: كل شطر على سطر واحد، وكل الأشطر بعرض واحد (عرض أطول شطر)، مضبوطة من البداية إلى النهاية.
 * - إن اتّسعت الشاشة للشطرين متجاورين → «side»
 * - وإلا يُعرض الصدر فوق العجز → «stack»
 * - إن كان أطول شطر أعرض من الشاشة يُصغَّر خط هذه القصيدة بالقدر اللازم فقط.
 */
export function layoutPoem(poem) {
  if (!poem || !poem.isConnected) return;
  // إعادة كل شيء إلى حالته الطبيعية قبل القياس
  poem.querySelectorAll('.tx[data-t]').forEach((t) => { if (t.textContent !== t.dataset.t) t.textContent = t.dataset.t; });
  poem.querySelectorAll('.row.v2, .row.v3').forEach((r) => { r.style.gridTemplateColumns = ''; });
  poem.querySelectorAll('.row.v2 .part, .row.v3 .part').forEach((p) => { p.style.width = ''; p.style.gridColumn = ''; p.style.justifySelf = ''; p.style.paddingInline = ''; p.style.marginInlineStart = ''; p.style.textAlign = ''; p.style.textAlignLast = ''; });
  poem.style.setProperty('--fit', '1');
  poem.classList.remove('side', 'stack');
  poem.classList.add('measuring');
  const avail = poem.clientWidth;
  const fs = parseFloat(getComputedStyle(poem).fontSize) || 20;
  let spanW = 0;
  poem.querySelectorAll('.row.span .tx, .blk.c1:not(.prose) .tx').forEach((t) => { spanW = Math.max(spanW, t.getBoundingClientRect().width); });

  // عرض الأعمدة: من جدول Word نفسه (بالنسب الأصلية)، وإن لم يتوفر فمن أطول نص في كل عمود
  const blocks = [...poem.querySelectorAll('.blk')].filter((b) => b.querySelector('.row.v2, .row.v3'));
  if (!blocks.length) {
    const fit = spanW > avail ? avail / spanW : 1;
    poem.style.setProperty('--fit', String(Math.floor(fit * 1000) / 1000));
    poem.classList.remove('measuring');
    return;
  }
  const info = blocks.map((b) => {
    const nat = [];
    b.querySelectorAll('.row.v2 .part, .row.v3 .part').forEach((p) => {
      const t = p.querySelector('.tx'); if (!t) return;
      const k = Number(p.dataset.col); nat[k] = Math.max(nat[k] || 0, t.getBoundingClientRect().width);
    });
    const n = Math.max(nat.length, b.dataset.w ? JSON.parse(b.dataset.w).length : 0);
    for (let k = 0; k < n; k++) nat[k] = nat[k] || 0;
    let w = b.dataset.w ? JSON.parse(b.dataset.w) : null, g = b.dataset.g ? JSON.parse(b.dataset.g) : null;
    if (!w || w.length !== n || w.some((x) => !x)) { w = nat.map((x) => x || fs); g = new Array(n - 1).fill(fs * 2.4); }
    return { b, nat, w, g };
  });
  // عرض كل عمود = أطول شطر فيه، فتتساوى أشطر العمود الواحد طولًا (وفي الثنائية: الصدر والعجز بعرض واحد)،
  // وبين الأعمدة مسافة ثابتة، والمجموع في وسط الصفحة — توازن كالديوان المطبوع
  const pad0 = Math.round(fs * 0.25), gap0 = Math.round(fs * (parseFloat(getComputedStyle(poem).getPropertyValue('--gap-em')) || 2.2));
  for (const x of info) {
    x.cw = x.nat.map((v) => Math.ceil(v) + 2);
    if (x.cw.length === 2) { const m = Math.max(...x.cw); x.cw = [m, m]; }
  }
  const sideNeed = Math.max(...info.map((x) => x.cw.reduce((a, c) => a + c + 2 * pad0, 0) + gap0 * (x.cw.length - 1)));
  const colMax = Math.max(...info.map((x) => Math.max(...x.cw) + 2 * pad0));
  let mode, fit;
  if (innerWidth >= 680 && sideNeed <= avail) { mode = 'side'; fit = 1; }   // على الهاتف: دائمًا متدرّجة
  else if (innerWidth >= 680 && sideNeed * 0.82 <= avail) { mode = 'side'; fit = avail / sideNeed; }
  else { mode = 'stack'; fit = Math.min(1, avail / colMax); }
  fit = Math.min(fit, spanW ? avail / spanW : 1);
  fit = Math.floor(fit * 1000) / 1000;
  poem.style.setProperty('--fit', String(fit));
  poem.classList.add(mode);

  for (const x of info) {
    const pad = Math.round(pad0 * fit);
    const px = x.cw.map((v) => Math.floor(v * fit) + 2 * pad);
    const gp = Math.floor(gap0 * fit);
    const n = px.length;
    const tpl = px.flatMap((v, k) => (k < n - 1 ? [`${v}px`, `${gp}px`] : [`${v}px`])).join(' ');
    // على الشاشة الضيقة: الأشطر متدرّجة — الأول يبدأ من اليمين والأخير ينتهي عند اليسار، وما بينهما بالتساوي،
    // وكلها بعرض واحد في القصيدة كلها حتى تتساوى بداياتها ونهاياتها
    const sw = Math.min(avail, Math.max(Math.max(...px), Math.floor(avail * (n === 2 ? 0.62 : n === 3 ? 0.58 : 0.54))));
    x.b.querySelectorAll('.row.v2, .row.v3').forEach((r) => {
      r.style.gridTemplateColumns = mode === 'side' ? tpl : 'minmax(0, 1fr)';
      r.querySelectorAll('.part').forEach((p) => {
        const k = Number(p.dataset.col);
        const w = mode === 'side' ? px[k] : sw;
        p.style.width = `${w}px`;
        p.style.paddingInline = `${pad}px`;
        p.dataset.w = w - 2 * pad;
        if (mode === 'side') p.style.gridColumn = String(2 * k + 1);
        else { p.style.justifySelf = 'start'; p.style.marginInlineStart = n > 1 ? `${Math.round((avail - sw) * k / (n - 1))}px` : ''; }
      });
    });
  }
  kashida(poem);
  poem.classList.remove('measuring');
}

// ——— الضبط بالمدّ (الكشيدة) كما في الديوان المطبوع ———
const MARK = /[\u0610-\u061A\u064B-\u065F\u0670]/;
// حروف تتصل بما بعدها
const JOINS_NEXT = new Set('بتثجحخسشصضطظعغفقكلمنهيئىـ'.split(''));
const LETTER = /[\u0621-\u064A]/;
const ALEFS = new Set('اأإآٱ'.split(''));
/** مواضع المدّ الممكنة في كل كلمة: بعد حرف متصل (وحركاته) يليه حرف من الكلمة نفسها */
function kashidaSlots(text) {
  const words = [];
  let cur = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === ' ') { if (cur.length) words.push(cur); cur = []; continue; }
    if (!JOINS_NEXT.has(ch)) continue;
    let j = i + 1;
    while (j < text.length && MARK.test(text[j])) j++;
    const next = text[j];
    if (!next || !LETTER.test(next)) continue;
    if (ALEFS.has(next)) continue;                                        // لا مدّ قبل الألف: يميل الألف في خط أميري (ولا تُكسر «لا»)
    if (ch === 'ل' && next === 'ل') continue;                             // ولا «الله/لله»
    if (ch === 'ل' && i > 0 && text.slice(Math.max(0, i - 3), i).replace(/[\u064B-\u0652\u0670]/g, '').endsWith('ل')) continue;
    cur.push(j);                                                          // يُدرج المدّ بعد الحركات
  }
  if (cur.length) words.push(cur);
  return words;
}
let tatweelW = 0, tatweelFont = '';
function measureTatweel(el) {  // (غير مستعمل حاليًا)
  const f = getComputedStyle(el).font;
  if (f !== tatweelFont) {
    const c = document.createElement('canvas').getContext('2d'); c.font = f;
    tatweelW = c.measureText('ـ').width; tatweelFont = f;
  }
  return tatweelW;
}
function kashida(poem) {
  // كل القياسات دفعة واحدة ثم كل الكتابات دفعة واحدة (بدل قياس كل شطر بعد تعديله) — أسرع بكثير في القصائد الطويلة
  const parts = [...poem.querySelectorAll('.row.v2 .tx[data-t], .row.v3 .tx[data-t]')];
  if (!parts.length) return;
  const fs = parseFloat(getComputedStyle(poem).fontSize) || 20;
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.font = getComputedStyle(parts[0]).font;
  const tw0 = ctx.measureText('ـ').width;
  // ١) قراءة: العرض الطبيعي لكل شطر
  const items = parts.map((t) => ({ t, colw: Number(t.parentElement.dataset.w) || 0, w: t.getBoundingClientRect().width }));
  // ٢) حساب النص الممدود
  // (التحقق من عدم التجاوز يتم بعد الكتابة بقراءة واحدة من الصفحة، فلا حاجة لقياس كل نص هنا)
  for (const it of items) {
    if (!it.colw) continue;
    it.out = stretchText(it.t.dataset.t, it.t.dataset.o, it.colw, it.w, tw0, null);
  }
  // ٣) كتابة
  for (const it of items) if (it.out != null && it.out !== it.t.textContent) it.t.textContent = it.out;
  // ٤) قراءة واحدة للتحقق: لا شطر يتجاوز عموده، ومحاذاة ما بقي فيه فراغ كبير
  const widths = items.map((it) => (it.colw ? it.t.getBoundingClientRect().width : 0));
  const side = poem.classList.contains('side');
  items.forEach((it, idx) => {
    if (!it.colw) return;
    let w = widths[idx];
    if (w > it.colw + 0.5) {                            // نادر: تصحيح دقيق في الصفحة نفسها
      let g = 0;
      while (w > it.colw && g++ < 60) {
        const i = it.t.textContent.lastIndexOf('ـ'); if (i < 0) break;
        it.t.textContent = it.t.textContent.slice(0, i) + it.t.textContent.slice(i + 1);
        w = it.t.getBoundingClientRect().width;
      }
    }
    // إن بقي فراغ كبير لا يملؤه المدّ، لا نوزّعه بين الكلمات: يبقى الشطر بمسافاته الطبيعية
    // ملاصقًا لجهته (الأول يمينًا، والأخير يسارًا، والأوسط في الوسط)
    const gap = it.colw - w;
    const spaces = (it.t.textContent.trim().match(/ +/g) || []).length;
    if (gap > fs * 0.35 * Math.max(1, spaces)) {
      const p = it.t.parentElement, row = p.parentElement;
      const cols = row.querySelectorAll('.part').length, k = Number(p.dataset.col);
      const al = side ? 'center' : k === 0 ? 'start' : k === cols - 1 ? 'end' : 'center';
      p.style.textAlign = al; p.style.textAlignLast = al;
    }
  });
}
/** مواضع المدّ (ـ) في النص الأصلي، منقولة إلى النص بلا مدّ: [{pos, len}] — يُستبعد ما قبل الألف (يميل في خط أميري) */
function originalRuns(orig, base) {
  if (!orig || !orig.includes('ـ')) return [];
  const clean = orig.replace(/ـ/g, '').replace(/\s+/g, ' ').trim();
  if (clean !== base) return [];
  const runs = []; let bi = 0, lead = 0;
  const o = orig.replace(/\s+/g, ' ');
  while (o[lead] === ' ') lead++;
  if (o.slice(lead).replace(/ـ/g, '').trimEnd() !== base) return [];   // تطابق المواضع حرفًا بحرف
  for (let i = lead; i < o.length;) {
    if (o[i] === 'ـ') {
      let j = i; while (o[j] === 'ـ') j++;
      let pos = bi; while (pos < base.length && MARK.test(base[pos])) pos++;          // بعد الحركات
      let k = pos - 1; while (k >= 0 && MARK.test(base[k])) k--;
      const prev = base[k], next = base[pos];
      if (prev && next && JOINS_NEXT.has(prev) && LETTER.test(next) && !ALEFS.has(next) && !(prev === 'ل' && next === 'ل')) {
        const last = runs[runs.length - 1];
        if (last && last.pos === pos) last.len += j - i; else runs.push({ pos, len: j - i });
      }
      i = j;
    } else { bi++; i++; }
  }
  return runs;
}
/** النص بعد المدّ ليملأ عرض العمود colw — w: عرضه الطبيعي، tw: عرض حرف المدّ، measure: دالة قياس */
function stretchText(base, orig, colw, w, tw, measure) {
  if (!tw) return base;
  let n = Math.floor((colw - w) / tw * 0.97);            // نترك هامشًا صغيرًا جدًا تملؤه المسافات
  if (n < 1) return base;
  const shrink = (out, max) => {                         // إن تجاوز العرض نُنقص المدّ حتى يعود ضمن العمود
    if (!measure) return out;
    let g = 0;
    while (measure(out) > colw && g++ < max) { const i = out.lastIndexOf('ـ'); if (i < 0) break; out = out.slice(0, i) + out.slice(i + 1); }
    return out;
  };
  // ١) مواضع المدّ كما في الملف الأصلي: يُوزَّع المدّ عليها بنسبة طولها الأصلي
  const runs = originalRuns(orig, base);
  if (runs.length) {
    const sum = runs.reduce((a, r) => a + r.len, 0);
    const per = runs.map((r) => (n * r.len) / sum);
    const fl = per.map(Math.floor);
    let rest = n - fl.reduce((a, b) => a + b, 0);
    per.map((x, i) => [x - fl[i], i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (rest > 0) { fl[i]++; rest--; } });
    let out = base;
    runs.map((r, i) => [r.pos, fl[i]]).filter((x) => x[1]).sort((a, b) => b[0] - a[0])
      .forEach(([pos, c]) => { out = out.slice(0, pos) + 'ـ'.repeat(c) + out.slice(pos); });
    return shrink(out, 80);
  }
  // ٢) سطر بلا مدّ في الأصل: مواضع المدّ المعتادة في الخط
  const words = kashidaSlots(base).filter((x) => x.length);
  if (!words.length) return base;
  // الأولوية: موضع قبل آخر حرف متصل في كل كلمة، ثم بقية المواضع داخل الكلمات (كما في الخط المطبوع)
  const slots = [...words.map((ws) => ws[ws.length - 1]), ...words.flatMap((ws) => ws.slice(0, -1).reverse())];
  const per = new Array(slots.length).fill(0);
  let k = 0, guard = 0;
  while (n > 0 && guard++ < 20000) { per[k]++; n--; k = (k + 1) % slots.length; }   // كالمطبوع: يُملأ الشطر كله بالمدّ
  const ins = slots.map((pos, i) => [pos, per[i]]).filter((x) => x[1]).sort((a, b) => b[0] - a[0]);
  let out = base;
  for (const [pos, c] of ins) out = out.slice(0, pos) + 'ـ'.repeat(c) + out.slice(pos);
  return shrink(out, 60);
}

// ——— التسجيلات ———
const AUDIO_EXT = /\.(mp3|m4a|aac|ogg|oga|opus|wav|webm)(\?|#|$)/i;
/** ملف الروابط audio/links.txt: كل سطر «القسم-الرقم  الرابط» (مثل: muhammadiya-3 https://archive.org/download/.../a.mp3) */
const linksCache = new Map();
function audioLinks(bookId) {
  if (!linksCache.has(bookId)) {
    linksCache.set(bookId, fetch(`data/books/${bookId}/audio/links.txt`, { cache: 'no-cache' })
      .then((r) => (r.ok && /text\/plain/.test(r.headers.get('content-type') || '') ? r.text() : ''))
      .then((t) => {
        const map = {};
        for (const raw of t.split(/\r?\n/)) {
          const line = raw.trim(); if (!line || line.startsWith('#')) continue;
          const m = line.match(/^([a-z]+-\d+)\s+(https:\/\/\S+)(?:\s+(.+))?$/i);
          if (m) (map[m[1].toLowerCase()] ||= []).push({ src: m[2], reciter: (m[3] || '').trim() });
        }
        return map;
      }).catch(() => ({})));
  }
  return linksCache.get(bookId);
}
function recordingsPanel(recs, title, author, bookTitle) {
  if (!recs.length) {
    return h('div', { class: 'listen none' }, svg(ICONS.noAudio), h('span', null, 'لا يوجد تسجيل لهذه القصيدة'));
  }
  const box = h('section', { class: 'listen', 'aria-label': 'التسجيل' });
  recs.forEach((r) => {
    const label = r.reciter ? `إنشاد: ${r.reciter}` : (recs.length > 1 ? `التسجيل ${r.i}` : '');
    const playable = !/^https?:/.test(r.src) || AUDIO_EXT.test(r.src);
    if (playable) {
      const audio = h('audio', { preload: 'metadata', src: r.src });
      // إن تعذّر التشغيل داخل الصفحة (الرابط أو الصيغة): نعرض رابطًا يفتح التسجيل مباشرة
      audio.addEventListener('error', () => {
        const host = audio.closest('.slim-player') || audio;
        if (host.nextElementSibling?.classList.contains('rec-fallback')) return;
        host.after(h('p', { class: 'rec-fallback' }, 'تعذّر تشغيل التسجيل هنا. ',
          h('a', { href: r.src, target: '_blank', rel: 'noopener' }, 'افتحه في صفحة مستقلة')));
      });
      audio.addEventListener('play', () => {
        document.querySelectorAll('audio').forEach((a) => { if (a !== audio) a.pause(); });
        if ('mediaSession' in navigator && window.MediaMetadata) {
          navigator.mediaSession.metadata = new MediaMetadata({ title, artist: r.reciter || author, album: bookTitle });
        }
      });
      box.append(h('div', { class: 'rec' }, (label || r.note) ? h('div', { class: 'lbl' }, label ? h('span', null, label) : null, r.note ? h('small', null, r.note) : null) : null, slimPlayer(audio)));
    } else {
      box.append(h('div', { class: 'rec' }, h('div', { class: 'lbl' }, svg(ICONS.headphones), h('span', null, label), r.note ? h('small', null, r.note) : null),
        h('a', { class: 'btn ghost', href: r.src, target: '_blank', rel: 'noopener' }, svg(ICONS.external), 'الاستماع إلى التسجيل')));
    }
  });
  return box;
}

// شريط تشغيل رفيع: تشغيل/إيقاف، شريط التقدّم، الوقت المتبقّي، وسرعة التشغيل
const PLAY_I = '<path d="M7 4.5v15l12.5-7.5z" fill="currentColor" stroke="none"/>';
const PAUSE_I = '<path d="M7 4.5h3.6v15H7zM13.4 4.5H17v15h-3.6z" fill="currentColor" stroke="none"/>';
const GEAR_I = '<path d="M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8z"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.5A7.6 7.6 0 0 0 7 6.5l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 3l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a7.6 7.6 0 0 0 2.6-1.5l2.4 1 2-3.4z"/>';
const fmtT = (t) => { if (!isFinite(t) || t < 0) t = 0; t = Math.round(t); const m = Math.floor(t / 60), s2 = t % 60; return `${String(m).padStart(2, '0')}:${String(s2).padStart(2, '0')}`; };
function slimPlayer(audio) {
  const btn = h('button', { class: 'sp-play', type: 'button', 'aria-label': 'تشغيل' }, svg(PLAY_I));
  const bar = h('input', { class: 'sp-bar', type: 'range', min: '0', max: '1000', value: '0', step: '1', 'aria-label': 'موضع التسجيل' });
  const time = h('span', { class: 'sp-time' }, '--:--');
  const speeds = [0.75, 1, 1.25, 1.5];
  const menu = h('div', { class: 'sp-menu', hidden: true }, speeds.map((v) => h('button', { type: 'button', 'data-v': v, class: v === 1 ? 'on' : '', onclick: () => {
    audio.playbackRate = v; menu.querySelectorAll('button').forEach((b) => b.classList.toggle('on', +b.dataset.v === v)); menu.hidden = true; } }, v === 1 ? 'عادية' : `×${v}`)));
  const gear = h('button', { class: 'sp-gear', type: 'button', 'aria-label': 'سرعة التشغيل', title: 'سرعة التشغيل', onclick: () => { menu.hidden = !menu.hidden; } }, svg(GEAR_I));
  let seeking = false;
  const paint = () => {
    const d = audio.duration, c = audio.currentTime;
    if (!seeking && isFinite(d) && d > 0) bar.value = String(Math.round((c / d) * 1000));
    bar.style.setProperty('--p', `${(+bar.value) / 10}%`);
    time.textContent = isFinite(d) ? `-${fmtT(d - c)}` : '--:--';
  };
  btn.onclick = () => { if (audio.paused) audio.play().catch(() => {}); else audio.pause(); };
  audio.addEventListener('play', () => { btn.replaceChildren(svg(PAUSE_I)); btn.setAttribute('aria-label', 'إيقاف مؤقّت'); });
  audio.addEventListener('pause', () => { btn.replaceChildren(svg(PLAY_I)); btn.setAttribute('aria-label', 'تشغيل'); });
  audio.addEventListener('ended', () => { btn.replaceChildren(svg(PLAY_I)); });
  ['timeupdate', 'loadedmetadata', 'durationchange'].forEach((ev) => audio.addEventListener(ev, paint));
  bar.addEventListener('input', () => { seeking = true; bar.style.setProperty('--p', `${(+bar.value) / 10}%`);
    if (isFinite(audio.duration)) time.textContent = `-${fmtT(audio.duration * (1 - bar.value / 1000))}`; });
  bar.addEventListener('change', () => { if (isFinite(audio.duration)) audio.currentTime = audio.duration * bar.value / 1000; seeking = false; });
  return h('div', { class: 'slim-player', dir: 'ltr' }, audio, btn, bar, time, h('div', { class: 'sp-gear-w' }, gear, menu));
}

function sizeToast(v) { toast(`حجم الخط: ${Math.round(v * 100)}%`); }

// ═══════════ البحث ═══════════
export async function searchView(params) {
  let lib = await data.library();
  document.title = 'البحث — مكتبة الزاوية التمسّكية';
  const q0 = params.get('q') || '';
  let scope = params.get('in') || 'all';
  const input = h('input', { type: 'search', id: 'q', name: 'q', value: q0, placeholder: 'ابحث عن كلمة أو عبارة… مثل: المحبة', autocomplete: 'off', enterkeyhint: 'search', 'aria-label': 'كلمات البحث' });
  const out = h('div', { class: 'results', 'aria-live': 'polite' });
  lib = { ...lib, books: lib.books.filter((b) => !b.type) };   // كتب الصفحات المصوّرة لا نص فيها للبحث
  const chips = lib.books.length > 1 ? h('div', { class: 'chips', role: 'group', 'aria-label': 'نطاق البحث' },
    [{ id: 'all', shortTitle: 'كل الدواوين' }, ...lib.books].map((b) => h('button', { type: 'button', class: 'chip', 'aria-pressed': String(scope === b.id), onclick: (e) => {
      scope = b.id; chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === e.currentTarget))); run();
    } }, b.shortTitle))) : null;
  const books = () => (scope === 'all' ? lib.books.map((b) => b.id) : [scope]);
  const titles = Object.fromEntries(lib.books.map((b) => [b.id, b.shortTitle]));

  let token = 0;
  async function run() {
    const q = input.value.trim();
    const my = ++token;
    setUrlQuietly(href.search(q));
    if (!q) { out.replaceChildren(h('div', { class: 'empty' }, h('div', { class: 'big' }, 'ابحث في نصوص القصائد وعناوينها'), h('div', null, 'يتجاهل البحث التشكيل والمدّ، فكلمة «المحبة» تطابق «المحبّة» و«المحبه».'))); return; }
    out.replaceChildren(h('div', { class: 'loading' }, 'جارٍ البحث…'));
    let res;
    try { res = await search(q, books()); } catch { if (my === token) out.replaceChildren(h('div', { class: 'empty' }, 'تعذّر تحميل فهرس البحث. تحقق من الاتصال.')); return; }
    if (my !== token) return;
    const { words, results } = res;
    if (!words.length) { out.replaceChildren(h('div', { class: 'empty' }, 'اكتب كلمة من حرفين أو أكثر.')); return; }
    if (!results.length) { out.replaceChildren(h('div', { class: 'empty' }, h('div', { class: 'big' }, `لا توجد نتائج لـ «${q}»`), h('div', null, 'جرّب كلمة أقصر أو صيغة أخرى.'))); return; }
    const frag = [h('div', { class: 'result-count' }, results.length === 1 ? 'قصيدة واحدة' : `${results.length} ${results.length <= 10 ? 'قصائد' : 'قصيدة'}`)];
    for (const r of results.slice(0, 200)) {
      frag.push(h('a', { class: 'result', href: href.poem(r.book, r.id, q) },
        h('div', { class: 'top' }, h('span', { class: 't' }, highlight(r.title, words).node), h('span', { class: 'src' }, `${titles[r.book]} · ${r.author}`)),
        r.hits.map((x) => h('div', { class: 'snip' }, highlight(x.text, words).node)),
        r.total > r.hits.length ? h('div', { class: 'more' }, `و${r.total - r.hits.length} مواضع أخرى في القصيدة`) : null));
    }
    out.replaceChildren(...frag);
  }
  let t; input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(run, 220); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { clearTimeout(t); run(); input.blur(); } });
  const view = page('', h('h1', { class: 'h-display', style: 'font-size:1.9rem' }, 'البحث'),
    h('form', { class: 'search-box', role: 'search', onsubmit: (e) => e.preventDefault() }, svg(ICONS.search), input), chips, out);
  view._after = () => { run(); if (!q0) input.focus(); };
  return view;
}

// ═══════════ المفضلة ═══════════
export async function favoritesView() {
  document.title = 'المفضلة — مكتبة الزاوية التمسّكية';
  const favs = store.favorites();
  if (!favs.length) return page('', h('h1', { class: 'h-display', style: 'font-size:1.9rem' }, 'المفضلة'),
    h('div', { class: 'empty' }, h('div', { class: 'big' }, 'لا توجد قصائد في المفضلة بعد'), h('div', null, 'اضغط ❤ أثناء قراءة أي قصيدة لتجدها هنا، محفوظة على هذا الجهاز.'), h('a', { class: 'btn', href: '/' }, 'تصفّح المكتبة')));
  const lib = await data.library();
  const metas = {};
  await Promise.all([...new Set(favs.map((f) => f.b))].map(async (b) => { try { metas[b] = await data.book(b); } catch { metas[b] = null; } }));
  const list = h('div', { class: 'fav-list' });
  for (const f of favs) {
    const m = metas[f.b]; const loc = m && data.locate(m, f.p);
    const bookTitle = lib.books.find((b) => b.id === f.b)?.shortTitle || f.bookTitle;
    const del = h('button', { class: 'icon-btn', type: 'button', 'aria-label': `إزالة «${f.title}» من المفضلة`, onclick: () => { store.removeFav(f.b, f.p); item.remove(); toast('أُزيلت من المفضلة'); } }, svg(ICONS.trash));
    const item = loc
      ? h('div', { class: 'fav-item' }, h('a', { href: href.poem(f.b, f.p) }, h('span', { class: 't' }, loc.entry.title), h('small', null, `${bookTitle}${loc.section.title ? ` · ${loc.section.title}` : ''} · ${loc.entry.author}`)), del)
      : h('div', { class: 'fav-item gone' }, h('div', { style: 'padding:6px 10px;display:grid' }, h('span', { class: 't' }, f.title), h('small', null, 'لم تعد هذه القصيدة متوفرة في الديوان الحالي.')), del);
    list.append(item);
  }
  return page('', h('h1', { class: 'h-display', style: 'font-size:1.9rem' }, 'المفضلة'), h('p', { class: 'muted', style: 'margin:0' }, 'محفوظة على هذا الجهاز فقط.'), list);
}

// ═══════════ متابعة القراءة ═══════════
export function continueTarget() {
  const l = store.lastRead();
  return l ? lastHref(l) : null;
}
export function noReadingView() {
  document.title = 'متابعة القراءة';
  return page('', h('div', { class: 'empty' }, h('div', { class: 'big' }, 'لم تبدأ القراءة بعد'), h('div', null, 'عندما تفتح قصيدة، ستجدها هنا لتكمل من حيث توقفت.'), h('a', { class: 'btn', href: '/' }, 'اختر ديوانًا')));
}
