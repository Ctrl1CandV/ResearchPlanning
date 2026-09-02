/* 阶段感知冒烟：模拟三个日期渲染 dashboard，核对阶段名/周次/行动切换。
   用途：node scripts/phase-smoke.js —— 全部断言通过即通过。
   日期模拟：用可注入 iso 的 Date 子类替换 global.Date，再执行 app.js（每次整页重渲染）。 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');   // 已从仓库根移入 scripts/，回退一层定位 site/

function makeEl() {
  return {
    innerHTML: '', textContent: '', style: {},
    setAttribute() {}, getAttribute() { return null; }, removeAttribute() {},
    classList: { toggle() {}, add() {}, remove() {} },
    addEventListener() {}, appendChild() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
    focus() {}
  };
}

const appEl = makeEl();
global.window = global;
global.addEventListener = () => {};
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
for (const f of ['facts', 'research', 'tools', 'jobs', 'skills', 'portfolio']) {
  run('site/data/' + f + '.js');
}

const RealDate = Date;
function renderAt(iso) {
  global.Date = class extends RealDate {
    constructor(...args) { if (args.length === 0) super(iso); else super(...args); }
    static now() { return new RealDate(iso).getTime(); }
  };
  global.location.hash = '#dashboard';
  appEl.innerHTML = '';
  try {
    run('site/assets/app.js');
  } finally {
    global.Date = RealDate;
  }
  return appEl.innerHTML;
}

const CASES = [
  {
    iso: '2026-08-29T10:00:00',
    expect: {
      phase: '入学前',
      daysBadge: '距 入学 3 天',
      noWeekBadge: true,
      actions: ['第一封邮件', '公共必读前 4 篇', '学位成果要求', 'Atlas 全量测试']
    }
  },
  {
    iso: '2026-10-20T10:00:00',
    expect: {
      phase: '研一上 · 90 天启动',
      weekBadge: 'W8',
      actions: ['90 天计划 · W8', 'openEuler', '每月例行']
    }
  },
  {
    iso: '2028-02-20T10:00:00',
    expect: {
      phase: '暑期实习主投期',
      noWeekBadge: true,
      actions: ['杭州、上海、深圳、广州', '每月例行']
    }
  }
];

let failed = 0;
for (const c of CASES) {
  const html = renderAt(c.iso);
  const problems = [];
  if (!html.includes('class="now-card"')) problems.push('缺少当前阶段卡');
  if (!html.includes(c.expect.phase)) problems.push('阶段名不符，期望含「' + c.expect.phase + '」');
  if (c.expect.daysBadge && !html.includes(c.expect.daysBadge)) problems.push('缺天数徽章「' + c.expect.daysBadge + '」');
  if (c.expect.weekBadge && !html.includes(c.expect.weekBadge)) problems.push('缺周次徽章「' + c.expect.weekBadge + '」');
  if (c.expect.noWeekBadge && /90 天计划 · W\d+/.test(html)) problems.push('不应出现周次徽章');
  for (const a of (c.expect.actions || [])) {
    if (!html.includes(a)) problems.push('缺行动项「' + a + '」');
  }
  if (/undefined/.test(html)) problems.push('出现 undefined');
  if (problems.length) { failed += 1; console.log('FAIL', c.iso, '->', problems.join('; ')); }
  else console.log('PASS', c.iso, '(' + c.expect.phase + ')');
}
process.exit(failed ? 1 : 0);
