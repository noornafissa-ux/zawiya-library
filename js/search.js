// البحث في الدواوين — يعمل بالكامل في المتصفح، ويشمل كل ديوان مذكور في المكتبة.
import { normalize } from './util.js?v=41b7ca4fce';
import * as data from './data.js?v=41b7ca4fce';

const prepared = new Map(); // bookId -> [{id,title,author,lines,nTitle,nLines,nAll}]

async function prepare(bookId) {
  if (prepared.has(bookId)) return prepared.get(bookId);
  const idx = await data.searchIndex(bookId);
  const rows = idx.map(([id, title, author, lines]) => {
    const nLines = lines.map(normalize);
    const nTitle = normalize(title);
    return { id, title, author, lines, nTitle, nLines, nAll: nTitle + ' ' + nLines.join(' ') };
  });
  prepared.set(bookId, rows);
  return rows;
}

export function queryWords(q) {
  return [...new Set(normalize(q).split(' ').filter((w) => w.length >= 2 || /\d/.test(w)))];
}

/**
 * @param {string} q
 * @param {string[]} bookIds الدواوين المراد البحث فيها
 * @returns {Promise<Array<{book, id, title, author, titleHit, hits:Array<{i,text}>, total}>>}
 */
export async function search(q, bookIds) {
  const words = queryWords(q);
  if (!words.length) return { words, results: [] };
  const results = [];
  for (const b of bookIds) {
    const rows = await prepare(b);
    for (const r of rows) {
      if (!words.every((w) => r.nAll.includes(w))) continue;
      const titleHit = words.some((w) => r.nTitle.includes(w));
      const hits = [];
      r.nLines.forEach((nl, i) => {
        const c = words.filter((w) => nl.includes(w)).length;
        if (c) hits.push({ i, text: r.lines[i], c });
      });
      hits.sort((a, b2) => b2.c - a.c || a.i - b2.i);
      const score = (titleHit ? 1000 : 0) + (hits[0]?.c || 0) * 10 + Math.min(hits.length, 9);
      results.push({ book: b, id: r.id, title: r.title, author: r.author, titleHit, hits: hits.slice(0, 2).sort((a, c) => a.i - c.i), total: hits.length, score });
    }
  }
  results.sort((a, b) => b.score - a.score);
  return { words, results };
}
