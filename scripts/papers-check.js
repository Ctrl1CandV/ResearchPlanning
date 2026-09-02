/* 论文数据校验（PAPER-DEEP-READ-DESIGN.md §11.2）。
   纯 node、无 DOM：加载 research.js 与 papers.js 后断言结构契约，失败非零退出。
   口径：
   - research.js：总数 70、各层级分段计数、ax 全局唯一、70 篇全部有 ax、pdf:true 标记为 0；
   - papers.js：键必须存在于 research.js 且 level 与归属一致；深读卡必填 tldr/sections/must/quiz/unread
     （sections 允许为空仅当 source='abstract'——未核验章节结构不装读过）；速览卡必有 skim 两字段；
   - 覆盖率：公共 13 深读卡 + 延伸 17 速览卡为**硬性**（批 1/批 3 已交付）；
     主路径+前置的深读卡覆盖率（批 2）仅报告不失败，交付完成后可改 --strict 收紧。 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const strict = process.argv.includes('--strict');

function loadGlobal(file) {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), sandbox);
  return sandbox.window;
}

let failed = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) failed += 1;
  console.log((ok ? '  ok ' : '  FAIL') + '  ' + label + (ok ? '' : `  期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`));
}

const R = loadGlobal('site/data/research.js').RESEARCH;
const P = loadGlobal('site/data/papers.js').PAPERS_BY_AX || {};

/* ── research.js 结构 ── */
const common = R.reading.common.items;
const trackIds = Object.keys(R.reading.tracks);
const all = [{ level: 'common', list: common }].concat(
  trackIds.map((t) => ({ level: t, list: R.reading.tracks[t].papers }))
);
const flat = [];
all.forEach((g) => g.list.forEach((p) => flat.push({ level: g.level, p })));

console.log('research.js 结构：');
check('论文总数', flat.length, 70);
check('公共必读', common.length, 13);
const expectTracks = { A: 8, B: 12, C: 9, D: 18, E: 5, F: 5 };
trackIds.forEach((t) => check(`方向 ${t} 篇数`, R.reading.tracks[t].papers.length, expectTracks[t]));
const noAx = flat.filter((x) => !x.p.ax).map((x) => x.level + ':' + x.p.t);
check('全部有 ax 字段', noAx.length, 0);
const dup = flat.map((x) => x.p.ax).filter((ax, i, a) => a.indexOf(ax) !== i);
check('ax 全局唯一（一篇只归一处）', dup.length, 0);
const extendCount = flat.filter((x) => x.p.tier === 'extend').length;
check('延伸（tier=extend）', extendCount, 17);
const prereqCount = flat.filter((x) => x.p.tier === 'prereq').length;
check('前置（tier=prereq）', prereqCount, 3);

const raw = fs.readFileSync(path.join(ROOT, 'site/data/research.js'), 'utf8');
check('pdf:true 残留标记', (raw.match(/pdf:\s*true/g) || []).length, 0);

/* ── papers.js 契约 ── */
console.log('papers.js 契约：');
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SOURCES = ['arxiv_html', 'abstract', 'knowledge', 'none'];
let deep = 0, skim = 0, bad = [];
Object.keys(P).forEach((ax) => {
  const card = P[ax];
  const hit = flat.find((x) => x.p.ax === ax);
  if (!hit) { bad.push(`${ax}: 不在 research.js 阅读清单中`); return; }
  if (card.level !== hit.level) { bad.push(`${ax}: level=${card.level} 与归属 ${hit.level} 不一致`); return; }
  if (card.skim) {
    skim += 1;
    if (!card.skim.whySkim || !card.skim.whenBack) bad.push(`${ax}: 速览卡缺 whySkim/whenBack`);
    if (card.unread && card.unread.source !== 'none') bad.push(`${ax}: 速览卡 source 应为 none`);
    if (hit.p.tier !== 'extend') bad.push(`${ax}: 速览卡只允许延伸篇（当前 tier=${hit.p.tier || 'core'}）`);
    return;
  }
  deep += 1;
  ['tldr', 'sections', 'must', 'quiz', 'unread'].forEach((k) => {
    if (card[k] == null) bad.push(`${ax}: 深读卡缺 ${k}`);
  });
  if (card.unread) {
    if (!DATE_RE.test(card.unread.at || '')) bad.push(`${ax}: unread.at 非日期`);
    if (SOURCES.indexOf(card.unread.source) < 0) bad.push(`${ax}: unread.source 非法`);
    if (card.unread.source === 'knowledge' && !(card.sections || []).length) bad.push(`${ax}: knowledge 卡必须有 sections`);
  }
  if (Array.isArray(card.must)) {
    card.must.forEach((m) => { if (['deep', 'scan', 'skip'].indexOf(m.act) < 0) bad.push(`${ax}: must.act 非法 ${m.act}`); });
  }
});
check('papers.js 键全部合法且 level 一致', bad.length, 0);
bad.forEach((b) => console.log('        - ' + b));
check('深读卡数量', deep, 13);
check('速览卡数量', skim, 17);

/* ── 覆盖率 ── */
console.log('覆盖率：');
const commonCovered = common.filter((p) => P[p.ax] && !P[p.ax].skim).length;
check('公共 13 深读卡（批 1 硬性）', commonCovered, 13);
const extendList = flat.filter((x) => x.p.tier === 'extend');
const extendCovered = extendList.filter((x) => P[x.p.ax] && P[x.p.ax].skim).length;
check('延伸 17 速览卡（批 3 硬性）', extendCovered, 17);
const mainline = flat.filter((x) => x.level !== 'common' && x.p.tier !== 'extend' && x.p.tier !== 'prereq');
const mainCovered = mainline.filter((x) => P[x.p.ax] && !P[x.p.ax].skim).length;
const missing = mainline.filter((x) => !P[x.p.ax] || P[x.p.ax].skim).map((x) => x.p.ax);
console.log(`  info  批 2（主路径+前置深读卡）：已覆盖 ${mainCovered} / ${mainline.length}${missing.length ? '，待生成 ' + missing.join('、') : ''}`);
if (strict) check('[--strict] 批 2 覆盖', mainCovered, mainline.length);

console.log(failed ? `\n通过 0 — 共 ${failed} 项失败` : '\n论文数据契约全部通过。');
process.exit(failed ? 1 : 0);
