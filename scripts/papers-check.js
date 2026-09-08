/* 论文数据校验（PAPER-DEEP-READ-DESIGN.md §11.2；2026-09-06 方向重构后口径）。
   纯 node、无 DOM：加载 research.js 与 papers.js 后断言结构契约，失败非零退出。
   口径（2026-09-06 重构版，两个总数分开写死，防混用）：
   - research.js：条目总数 73、各层级分段计数、有 ax 的条目 ax 全局唯一、
     每条必须有 ax 或 srcUrl（srcUrl = 无 arXiv id 的预印本/外链条目，不得建卡）、pdf:true 残留为 0；
   - papers.js：键必须存在于 research.js 且 level 与归属一致；深读卡必填 tldr/sections/must/quiz/unread
     （sections 允许为空仅当 source='abstract'——未核验章节结构不装读过）；速览卡必有 skim 两字段；
   - 卡键总数 72 = 54 深读 + 18 速览；差额 1 = 无卡预印本（Strategic Verification，202608.2057）。
   - 覆盖率（全部硬性）：公共 ax 11 篇深读卡、主路径 30 篇深读卡、前置 3 篇深读卡；
     延伸 28 篇必须有卡（深读或速览均可），速览卡仅允许延伸篇持有。
     不为通过测试删除结构性检查；只随阅读结构更新数量断言（重构说明 §5）。 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

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
check('条目总数', flat.length, 73);
check('公共必读（11 ax + 1 预印本）', common.length, 12);
const expectTracks = { A: 2, B: 12, C: 16, D: 20, E: 5, F: 6 };
trackIds.forEach((t) => check(`方向 ${t} 篇数`, R.reading.tracks[t].papers.length, expectTracks[t]));
check('方向卡数量（主线+扩展成卡，2026-09-06 二次收编）', R.angles.length, 3);
check('主线唯一', R.angles.filter((a) => a.tier === 'main').length, 1);
check('主线为 A', R.angles[0].id, 'A');
check('扩展为 B/E', R.angles.slice(1).map((a) => a.id).join(''), 'BE');
check('档案方向为 C/D/F', (R.archived || []).map((a) => a.id).join(''), 'CDF');
check('档案方向均有对应轨道', (R.archived || []).every((a) => !!R.reading.tracks[a.track]), true);
const noSource = flat.filter((x) => !x.p.ax && !x.p.srcUrl).map((x) => x.level + ':' + x.p.t);
check('全部有 ax 或 srcUrl', noSource.length, 0);
const srcUrlWithAx = flat.filter((x) => x.p.srcUrl && x.p.ax);
check('srcUrl 条目不得带 ax', srcUrlWithAx.length, 0);
const axed = flat.filter((x) => x.p.ax);
const dup = axed.map((x) => x.p.ax).filter((ax, i, a) => a.indexOf(ax) !== i);
check('ax 全局唯一（一篇只归一处）', dup.length, 0);
const extendCount = flat.filter((x) => x.p.tier === 'extend').length;
check('延伸（tier=extend）', extendCount, 28);
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
check('深读卡数量', deep, 54);
check('速览卡数量', skim, 18);
check('卡键总数（条目 73 的差额 1 = 无卡预印本）', deep + skim, 72);

/* ── srcUrl 条目（预印本）：无卡由「srcUrl 条目不得带 ax」+「卡键总数 72」共同保证，
   无需独立断言（卡只能以 ax 为键，而它们没有 ax）。 ── */

/* ── 覆盖率 ── */
console.log('覆盖率：');
const commonAx = common.filter((p) => p.ax);
const commonCovered = commonAx.filter((p) => P[p.ax] && !P[p.ax].skim).length;
check('公共 11 篇（有 ax 者）深读卡', commonCovered, commonAx.length);
const extendList = flat.filter((x) => x.p.tier === 'extend');
const extendCovered = extendList.filter((x) => P[x.p.ax] && (P[x.p.ax].skim || !P[x.p.ax].skim)).length;
check('延伸 28 篇有卡（深读或速览）', extendCovered, extendList.length);
const mainline = flat.filter((x) => x.level !== 'common' && x.p.tier !== 'extend' && x.p.tier !== 'prereq');
const mainCovered = mainline.filter((x) => P[x.p.ax] && !P[x.p.ax].skim).length;
check('主路径 30 深读卡', mainCovered, mainline.length);
const prereqList = flat.filter((x) => x.p.tier === 'prereq');
const prereqCovered = prereqList.filter((x) => P[x.p.ax] && !P[x.p.ax].skim).length;
check('前置 3 深读卡', prereqCovered, prereqList.length);
const missingAll = flat
  .filter((x) => x.p.ax && !P[x.p.ax])
  .map((x) => x.level + ':' + x.p.ax);
if (missingAll.length) console.log('  info  无卡论文：' + missingAll.join('、'));

console.log(failed ? `\n通过 0 — 共 ${failed} 项失败` : '\n论文数据契约全部通过。');
process.exit(failed ? 1 : 0);
