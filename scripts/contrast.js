/**
 * 对比度审计：MAINTENANCE 第 6.2 节要求「正文与小字号文本都要 ≥ 4.5:1」。
 *
 * 这个脚本自己出过一次「假通过」，值得记下来：
 *
 *   v2 视觉层追加了第二个 :root 并重定义了 --bg / --border 等，
 *   而当时的实现用 CSS.indexOf(':root') 只取**第一个**块，
 *   于是审计的是旧色板、页面用的是新色板，结果报 100/100 全通过。
 *   假绿灯比没有脚本更危险 —— 它会让你以为验过了。
 *
 * 现在的口径：
 *   1. 先剥离 @media print —— 打印块里 body.light 把 --text 改成 #111，
 *      那是纸面配色，不该参与屏幕审计
 *   2. 合并**所有** :root 块（按出现顺序，后者覆盖前者，模拟层叠）
 *   3. 浅色 = 所有 :root 合并结果，再叠加所有 body.light 块
 *   4. 打印最终解析值，人能直接核对脚本读到的是不是当前色板
 *
 * 用法：node scripts/contrast.js
 */
const fs = require('node:fs');
const path = require('node:path');

const RAW = fs.readFileSync(
  path.join(__dirname, '..', 'site', 'assets', 'style.css'), 'utf8');

const THRESHOLD = 4.5;   // WCAG AA，正文字号

/**
 * 去掉 @media print { ... } 整块。
 * 手写括号配对而不是用正则：print 块里含嵌套规则，正则的 [^}]* 会提前截断。
 */
function stripPrint(css) {
  let out = '';
  let i = 0;
  while (i < css.length) {
    const at = css.indexOf('@media print', i);
    if (at === -1) { out += css.slice(i); break; }
    out += css.slice(i, at);
    const open = css.indexOf('{', at);
    if (open === -1) break;
    let depth = 0;
    let j = open;
    for (; j < css.length; j += 1) {
      if (css[j] === '{') depth += 1;
      else if (css[j] === '}') {
        depth -= 1;
        if (depth === 0) { j += 1; break; }
      }
    }
    i = j;
  }
  return out;
}

const CSS = stripPrint(RAW);

/**
 * 取某个选择器**所有**块里的自定义属性，按出现顺序合并（后者覆盖前者）。
 * 只匹配「选择器 + 可选空白 + {」，避免 `body.light .foo {` 这类后代选择器混入。
 */
function tokensAll(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped + '\\s*\\{([^}]*)\\}', 'g');
  const out = {};
  let blocks = 0;
  let m;
  while ((m = re.exec(CSS))) {
    blocks += 1;
    const decl = /(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})/g;
    let d;
    while ((d = decl.exec(m[1]))) out[d[1]] = d[2];
  }
  if (!blocks) throw new Error(`找不到选择器 ${selector}`);
  return { tokens: out, blocks };
}

function expand(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return h.slice(0, 6);
}

function luminance(hex) {
  const h = expand(hex);
  const ch = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

function ratio(a, b) {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

const TEXT_KEYS = ['--text', '--text-soft', '--text-dim', '--text-faint',
  '--accent', '--high', '--mid', '--low', '--info', '--purple'];
const BG_KEYS = ['--bg', '--bg-elevated', '--bg-card', '--bg-card-hover', '--bg-inset'];

const root = tokensAll(':root');
// 2026-09-06 展示改版：浅色是默认（:root 即浅色），深色整体挂在 body.dark 上。
// 口径随 CSS 结构调整（设计说明 §4），两套主题都要审计，不允许只审一套。
const dark = tokensAll('body.dark');

const themes = [
  { name: 'LIGHT', tokens: root.tokens },
  { name: 'DARK ', tokens: { ...root.tokens, ...dark.tokens } }
];

let pass = 0;
const failures = [];
const alphaWarn = [];

for (const theme of themes) {
  for (const tk of TEXT_KEYS) {
    for (const bk of BG_KEYS) {
      const fg = theme.tokens[tk];
      const bg = theme.tokens[bk];
      if (!fg || !bg) continue;
      // 8 位 hex 带 alpha，亮度计算会忽略透明度 → 结果不可信，单独列出
      if (expand(fg).length !== 6 || fg.replace('#', '').length === 8) {
        alphaWarn.push(`${theme.name} ${tk} = ${fg}`);
      }
      const r = ratio(fg, bg);
      if (r >= THRESHOLD) pass += 1;
      else failures.push(`${theme.name} ${r.toFixed(2)}  ${tk} (${fg}) on ${bk} (${bg})`);
    }
  }
}

console.log('对比度审计 · 阈值 4.5:1（WCAG AA 正文）\n');

// 先打印脚本实际读到的值。这一段是防「假通过」的关键：
// 如果这里显示的不是你刚改的颜色，说明解析没跟上 CSS 结构。
console.log(`解析到 ${root.blocks} 个 :root 块、${dark.blocks} 个 body.dark 块（已排除 @media print）`);
console.log('脚本实际使用的色值：');
for (const theme of themes) {
  const bg = theme.tokens['--bg'];
  const card = theme.tokens['--bg-card'];
  const text = theme.tokens['--text'];
  console.log(`  ${theme.name}  --bg ${bg}  --bg-card ${card}  --text ${text}`);
}
console.log('');

if (alphaWarn.length) {
  console.log('以下 token 含 alpha，亮度按不透明计算，需人工确认：');
  for (const w of [...new Set(alphaWarn)]) console.log('  ! ' + w);
  console.log('');
}

for (const f of failures) console.log('  FAIL ' + f);

console.log(`通过 ${pass} / 失败 ${failures.length}`);

if (failures.length) {
  console.log('\n对比度不达标。改色时注意 MAINTENANCE 第 6.2 节：');
  console.log('绿/琥珀/红是证据分级语义，只能压深亮度，不能换色相。');
  process.exit(1);
}
console.log('两个主题下所有文字×背景组合均达标。');
