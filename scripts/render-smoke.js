/* 无头渲染冒烟：加载 7 个数据文件 + l3.js + app.js，逐个路由执行渲染。
   用途：node scripts/render-smoke.js —— 全部路由无异常、无 "undefined" 泄漏即通过。
   覆盖：10 个一级路由 + 阅读/技能 L2 + 论文 L3 阅读卡（hash 第三段）+ 非法第二/三段回退的样例。
   实现说明：用间接 eval 在真实全局作用域执行（浏览器中数据与渲染器都是全局脚本），
   因此裸 DATA/RESEARCH/window/location 都能像在浏览器里一样解析。
   （真实浏览器交互仍按 MAINTENANCE.md 第 8 节手动冒烟） */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');   // 已从仓库根移入 scripts/，回退一层定位 site/
const ROUTES = ['dashboard', 'baseline', 'research', 'reading', 'tools', 'jobs', 'skills', 'portfolio', 'career', 'verify'];
// 学习层多级路由：L2 样例 + L3 样例 + 非法第二/三段必须逐级回退（PAPER-DEEP-READ-DESIGN.md §11.1）
// 2026-09-06 方向重构后：公共层 = 主线地基（前三篇立问题），记忆类移入 C/D，MRAgent 移入 A
const L2_ROUTES = [
  ['reading/common', '把问题立起来'],
  ['reading/A', '方向必读'],
  ['reading/B', '延伸阅读'],
  ['reading/C', '延伸阅读'],
  ['reading/D', '方向前置'],
  ['reading/E', 'SWE-bench'],
  ['reading/F', '方向必读'],
  ['skills/skill-eval', '学习步骤'],
  ['skills/skill-algo', '面试的硬门槛'],
  ['skills/skill-graphdb', '二选一'],
  ['reading/ZZZ', '方向轨道'],
  ['skills/nope', '学习路线']
];
// L3 阅读卡：深读卡样例（公共/主线 A/方向 D 前置/换轨卡）/ 速览卡 / 第三段非法逐级回退
// （2026-09-06 起条目 73 = 72 卡 + 1 预印本无卡走外链；降级占位页仅作防御分支）
const L3_ROUTES = [
  ['reading/common/2606.09863', '原文里重点读这几处'],
  ['reading/common/2608.02645', '原文里重点读这几处'],
  ['reading/common/2606.04990', '原文里重点读这几处'],
  ['reading/A/2309.02427', '这篇在讲什么'],
  ['reading/A/2606.06036', '这篇在讲什么'],
  ['reading/D/1609.02907', '这篇在讲什么'],
  ['reading/D/2404.16130', '这篇在讲什么'],
  ['reading/F/2401.18059', '合上论文，这几问能答上吗'],
  ['reading/F/2606.13177', '为什么现在不用细读'],
  ['reading/B/2303.17760', '为什么现在不用细读'],
  ['reading/A/2303.17760', '方向必读'],
  ['reading/common/2303.17760', '分三段'],
  ['reading/A/9999.00000', '方向必读']
];

function makeEl() {
  return {
    innerHTML: '',
    textContent: '',
    style: {},
    setAttribute() {}, getAttribute() { return null; }, removeAttribute() {},
    classList: { toggle() {}, add() {}, remove() {} },
    addEventListener() {},
    appendChild() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    focus() {}
  };
}

const appEl = makeEl();
global.window = global;                    // 数据文件裸引用 window → 指向真实全局
global.addEventListener = () => {};        // 浏览器 window 事件桩
global.pageYOffset = 0;
global.scrollTo = () => {};
global.location = { hash: '#dashboard' };
global.document = {
  getElementById(id) { return id === 'app' ? appEl : makeEl(); },
  querySelector() { return makeEl(); },
  querySelectorAll() { return []; },
  createElement() { return makeEl(); },
  addEventListener() {},
  body: { classList: { toggle() {}, add() {}, remove() {} } },
  activeElement: { tagName: 'BODY' }
};

const run = (file) => (0, eval)(fs.readFileSync(path.join(ROOT, file), 'utf8'));
for (const f of ['facts', 'research', 'tools', 'jobs', 'skills', 'portfolio', 'papers']) {
  run('site/data/' + f + '.js');
}
run('site/assets/l3.js');

let failed = 0;
for (const r of ROUTES) {
  global.location.hash = '#' + r;
  appEl.innerHTML = '';
  let threw = null;
  try { run('site/assets/app.js'); } catch (e) { threw = e; }
  const html = appEl.innerHTML;
  const problems = [];
  if (threw) problems.push('异常: ' + (threw && threw.message ? threw.message : threw));
  if (!threw) {
    if (!html || html.length < 200) problems.push('渲染结果过短');
    if (/undefined/.test(html)) problems.push('出现 undefined');
    if (/>\s*null\s*</.test(html)) problems.push('出现裸 null');
    if (html.indexOf('页面渲染失败') >= 0) {
      const m = html.match(/<p>([^<]+)<\/p>/);
      problems.push('渲染进入 catch 分支' + (m ? '：' + m[1] : ''));
    }
  }
  if (problems.length) { failed += 1; console.log('FAIL', r, '->', problems.join('; ')); }
  else console.log('PASS', r, '(' + html.length + ' chars)');
}

for (const [r, expect] of L2_ROUTES.concat(L3_ROUTES)) {
  global.location.hash = '#' + r;
  appEl.innerHTML = '';
  let threw = null;
  try { run('site/assets/app.js'); } catch (e) { threw = e; }
  const html = appEl.innerHTML;
  const problems = [];
  if (threw) problems.push('异常: ' + (threw && threw.message ? threw.message : threw));
  if (!threw) {
    if (!html || html.length < 200) problems.push('渲染结果过短');
    if (/undefined/.test(html)) problems.push('出现 undefined');
    if (/>\s*null\s*</.test(html)) problems.push('出现裸 null');
    if (html.indexOf('页面渲染失败') >= 0) problems.push('渲染进入 catch 分支');
    if (expect && html.indexOf(expect) < 0) problems.push('缺少期望内容「' + expect + '」');
  }
  if (problems.length) { failed += 1; console.log('FAIL', r, '->', problems.join('; ')); }
  else console.log('PASS', r, '(' + html.length + ' chars)');
}
process.exit(failed ? 1 : 0);
