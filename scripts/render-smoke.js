/* 无头渲染冒烟：加载 6 个数据文件 + app.js，逐个路由执行渲染。
   用途：node scripts/render-smoke.js —— 全部路由无异常、无 "undefined" 泄漏即通过。
   实现说明：用间接 eval 在真实全局作用域执行（浏览器中数据与渲染器都是全局脚本），
   因此裸 DATA/RESEARCH/window/location 都能像在浏览器里一样解析。
   （真实浏览器交互仍按 MAINTENANCE.md 第 8 节手动冒烟） */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');   // 已从仓库根移入 scripts/，回退一层定位 site/
const ROUTES = ['dashboard', 'baseline', 'research', 'reading', 'tools', 'jobs', 'skills', 'portfolio', 'career', 'verify'];

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
for (const f of ['facts', 'research', 'tools', 'jobs', 'skills', 'portfolio']) {
  run('site/data/' + f + '.js');
}

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
process.exit(failed ? 1 : 0);
