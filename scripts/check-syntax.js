/**
 * 语法检查：等价于 MAINTENANCE 第 8.1 节那两行 node --check，
 * 但把「有没有漏文件」也一起检查了。
 *
 * 为什么不用 ESLint：站点是 ES5 风格的经典脚本（var + IIFE），
 * 主流 ESLint 配置会对此报一堆无意义的告警。这里只要「能不能被解析」。
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const SITE = path.join(__dirname, '..', 'site');

/** 从 index.html 反推该检查哪些脚本，避免新增数据文件后忘记加检查 */
function scriptsFromHtml() {
  const html = fs.readFileSync(path.join(SITE, 'index.html'), 'utf8');
  const out = [];
  const re = /<script src="([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}

const declared = scriptsFromHtml();
const onDisk = [
  ...fs.readdirSync(path.join(SITE, 'data')).filter((f) => f.endsWith('.js')).map((f) => `data/${f}`),
  ...fs.readdirSync(path.join(SITE, 'assets')).filter((f) => f.endsWith('.js')).map((f) => `assets/${f}`)
];

let failed = 0;

// 磁盘上有但 index.html 没加载的脚本 —— 通常是新增了数据文件却忘了引用
for (const file of onDisk) {
  if (!declared.includes(file)) {
    console.error(`✗ ${file} 存在但 index.html 未加载它`);
    failed += 1;
  }
}

for (const src of declared) {
  const abs = path.join(SITE, src);
  if (!fs.existsSync(abs)) {
    console.error(`✗ ${src} 被 index.html 引用但文件不存在`);
    failed += 1;
    continue;
  }
  try {
    new vm.Script(fs.readFileSync(abs, 'utf8'), { filename: abs });
    console.log(`✓ ${src}`);
  } catch (err) {
    console.error(`✗ ${src}: ${err.message}`);
    failed += 1;
  }
}

// app.js 必须最后加载（数据文件先定义全局，app.js 才能读到）
const appIndex = declared.indexOf('assets/app.js');
if (appIndex !== -1 && appIndex !== declared.length - 1) {
  console.error('✗ assets/app.js 不是最后一个脚本，数据会读不到');
  failed += 1;
}

if (failed) {
  console.error(`\n${failed} 个问题`);
  process.exit(1);
}
console.log(`\n${declared.length} 个脚本全部通过，加载顺序正确`);
