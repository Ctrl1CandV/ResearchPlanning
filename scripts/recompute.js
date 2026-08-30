/**
 * 从 .jobs/baidu.json 复算 jobs.js 里所有引用的聚合数字。
 *
 * 为什么要有这个脚本：站点的可信度建立在「每个数字都能复算」上。
 * 手写 node -e 命令做这件事出过两次错 ——
 *   1) heredoc 被截断，写坏了 style.css
 *   2) 正则 `接受远程办公` 命中了 `不接受远程办公`，把 2 条拒绝算成 2 条提供
 * 第 2 条尤其危险：它会把「远程不存在」的负面证据翻转成正面，
 * 而研一研二的整个策略都建立在那个结论上。所以固化成脚本 + 显式期望值。
 *
 * 用法：node scripts/recompute.js
 * 任何数字与 jobs.js 里写的不一致就非零退出。
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const RAW = path.join(ROOT, '.jobs', 'baidu.json');

if (!fs.existsSync(RAW)) {
  console.error('找不到 .jobs/baidu.json —— 原始快照是复算的唯一依据，不能删。');
  process.exit(1);
}

const rows = JSON.parse(fs.readFileSync(RAW, 'utf8'));

// 意向城市：读研期（重庆）+ 毕业期（杭沪蓉渝穗深）的并集
const WANTED = ['重庆', '成都', '杭州', '上海', '深圳', '广州'];

const place = (r) => String(r.workPlace || '');
const hasCity = (r, c) => place(r).includes(c);
const hasWanted = (r) => WANTED.some((c) => hasCity(r, c));
const isTech = (r) => r.postType === '技术';
const fullText = (r) => `${r.workContent || ''} ${r.serviceCondition || ''}`;

const results = [];
const record = (label, actual, expected) =>
  results.push({ label, actual, expected, ok: actual === expected });

/**
 * 区间断言：给「从自由文本抽取、口径本身不稳」的指标用。
 *
 * 为什么需要它：实习最低时长这个数我算了五次得到五个结果
 * （23 / 43 / 39 / 28 / 22），每换一种正则就变一次 —— 因为 JD 里
 * 「至少3个月，6个月以上优先」「3-6个月及以上」这类写法没有统一口径，
 * 任何正则都是一种解释，不存在唯一正确答案。
 *
 * 这种指标不该以精确值写进站点，否则每次改脚本都会「发现数据错了」。
 * 但它也不能删 —— 「相当一部分实习要求半年以上现场」是真实约束。
 * 折中做法：断言落在区间上，站点文案用定性表述 + 标注口径不稳。
 */
const recordRange = (label, actual, lo, hi) =>
  results.push({
    label, actual, expected: `${lo}—${hi}`, ok: actual >= lo && actual <= hi
  });

// ── 1. 总量与招聘类型（MAINTENANCE 第 8 节的原有基线）──
record('总记录数', rows.length, 1287);
record('社招', rows.filter((r) => r._rt === 'SOCIAL').length, 796);
record('日常实习', rows.filter((r) => r._rt === 'INTERN').length, 332);
record('校招', rows.filter((r) => r._rt === '校招').length, 159);
record('技术岗', rows.filter(isTech).length, 747);

// ── 2. 可投池：含意向城市「且不含北京」才算真正可投 ──
const real = rows.filter((r) => hasWanted(r) && !hasCity(r, '北京'));
record('真正可投（含意向城市且不含北京）', real.length, 163);
record('  其中技术岗', real.filter(isTech).length, 94);
record('含意向城市但同时挂北京',
  rows.filter((r) => hasWanted(r) && hasCity(r, '北京')).length, 141);
record('纯北京（不含任何意向城市）',
  rows.filter((r) => hasCity(r, '北京') && !hasWanted(r)).length, 943);

// ── 3. 按招聘类型拆分可投池 ──
const byType = (rt) => real.filter((r) => r._rt === rt);
record('可投·实习', byType('INTERN').length, 36);
record('可投·实习·技术', byType('INTERN').filter(isTech).length, 18);
record('可投·校招', byType('校招').length, 59);
record('可投·校招·技术', byType('校招').filter(isTech).length, 38);
record('可投·社招', byType('SOCIAL').length, 68);
record('可投·社招·技术', byType('SOCIAL').filter(isTech).length, 38);

// ── 4. 远程办公证据 ──
// 关键：判断「提供远程」时必须排除「不接受远程」。
// 用否定后行断言，而不是简单包含 —— 这正是之前算错的地方。
const REFUSE = /不接受远程|不支持远程|不可远程/;
const OFFER = /(?<!不)(接受|支持|可以)远程办公|混合办公|不限地点|任意地点|远程优先/;
record('明确拒绝远程', rows.filter((r) => REFUSE.test(fullText(r))).length, 2);
record('提供远程办公', rows.filter((r) => OFFER.test(fullText(r))).length, 0);

// 实习时长门槛：≥6 个月与在校学业直接冲突。
//
// 这个口径我算错过三次，三个坑按踩到的顺序记下来，别再踩：
//   1. 只匹配「6个月」→ 把「至少3个月，6个月以上优先」算成要求 6 个月（硬门槛其实是 3）
//   2. 加了硬性词但没处理区间 →「3-6个月及以上」被当成 6，实际下界是 3
//   3. 没排除「优先」→「6个月及以上者优先」是偏好，不是门槛
//
// 正确口径：抽出所有硬性表述的月份，区间取下界，跟着「优先」的丢掉，再取全文最小值。
// 结果 88 条有硬门槛 / 其中 28 条 ≥6 个月，28 条我逐条读过匹配上下文确认无误。
const HARD_WORDS = '至少|不少于|不低于|最少|需要|需|保证|承诺|稳定|连续|持续|大于';
const DURATION_RE = new RegExp(
  '(?:' + HARD_WORDS + ')' +            // 硬性表述
  '[^。；]{0,12}?' +                     // 中间允许少量修饰（"每周4天以上、持续"）
  '(?:(\\d{1,2})\\s*[-—~到至]\\s*)?' +   // 可选区间下界，如 3-6 个月
  '(\\d{1,2})\\s*个月',
  'g'
);

/** 返回这条 JD 的硬性最低实习时长（月），没有明确要求返回 null */
function minInternMonths(text) {
  const found = [];
  let m;
  DURATION_RE.lastIndex = 0;
  while ((m = DURATION_RE.exec(text))) {
    // 紧跟「优先/更佳/加分」的是偏好，不是门槛
    if (/^[^。；]{0,6}(优先|更佳|加分)/.test(text.slice(m.index + m[0].length))) continue;
    // 有区间时取下界：「3-6 个月」的门槛是 3
    const n = Number(m[1] || m[2]);
    if (n >= 1 && n <= 12) found.push(n);
  }
  return found.length ? Math.min(...found) : null;
}

const internDurations = rows
  .filter((r) => r._rt === 'INTERN')
  .map((r) => minInternMonths(fullText(r)))
  .filter((v) => v !== null);

// 用区间而非精确值：见文件顶部 recordRange 的说明。
//
// 区间下界不是猜的，是五版正则实测出来的解释跨度：
//   有硬门槛的实习   57 — 94 条（口径松紧决定）
//   其中 ≥6 个月     22 — 39 条
// 结论「相当一部分实习要求半年以上现场」在整个跨度里都成立，
// 策略不因具体落点改变，所以不再为一个精确数字反复调正则。
const sixPlus = internDurations.filter((v) => v >= 6).length;
recordRange('有明确最低时长的实习', internDurations.length, 55, 95);
recordRange('其中最低时长 ≥6 个月', sixPlus, 20, 40);

// ── 5. 单城市分布（jobs.js stats.cities 用）──
const cityExpect = {
  北京: [1084, 634], 上海: [190, 135], 深圳: [133, 74],
  广州: [14, 5], 杭州: [7, 0], 成都: [7, 4], 重庆: [2, 0]
};
for (const [city, [cnt, tech]] of Object.entries(cityExpect)) {
  const hits = rows.filter((r) => hasCity(r, city));
  record(`${city} 记录数`, hits.length, cnt);
  record(`${city} 技术岗`, hits.filter(isTech).length, tech);
}

// ── 输出 ──
const failed = results.filter((r) => !r.ok);
const pad = (s, n) => String(s).padEnd(n, ' ');

console.log('百度快照复算 · 期望值来自 site/data/jobs.js\n');
for (const r of results) {
  const mark = r.ok ? 'ok  ' : 'FAIL';
  const detail = r.ok ? String(r.actual) : `${r.actual}（期望 ${r.expected}）`;
  console.log(`  ${mark} ${pad(r.label, 34)} ${detail}`);
}

console.log(`\n通过 ${results.length - failed.length} / 失败 ${failed.length}`);

if (failed.length) {
  console.error('\n复算不一致。要么数据源变了，要么 jobs.js 里的数字写错了 ——');
  console.error('两种情况都必须先查清再改，不要直接把期望值改成实际值。');
  process.exit(1);
}
console.log('所有聚合数字与 jobs.js 一致。');
