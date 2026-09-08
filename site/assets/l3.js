/* L3 论文阅读卡渲染器（PAPER-DEEP-READ-DESIGN.md §5）。
   独立经典脚本：app.js 在 render() 分发时调用 window.L3（依赖方向单一：app → L3）。
   注意：escapeHtml/badge/section 等最小工具集与 app.js 各有一份（app.js 是 IIFE，内部不可见），
   两处行为必须保持一致——改动需双处同步（MAINTENANCE §6 登记的同步纪律）。 */
(function () {
  'use strict';

  /* ── 最小工具集（与 app.js 同行为） ── */
  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function text(v) { return escapeHtml(v == null ? '—' : v); }
  function badge(label, cls) { return '<span class="badge ' + (cls || 'b-dim') + '">' + escapeHtml(label) + '</span>'; }
  /* 折叠块（与 app.js details 同行为：ref=true 为档案层降噪折叠；改动双处同步） */
  function details(title, body, open, right, ref) {
    return '<details class="acc' + (ref ? ' ref' : '') + '"' + (open ? ' open' : '') + '><summary>' + escapeHtml(title) +
      '<span class="spacer"></span>' + (right || '') + '</summary><div class="acc-body">' + body + '</div></details>';
  }
  function section(title, id) {
    return '<h3 class="sec"' + (id ? ' id="' + escapeHtml(id) + '"' : '') + '>' + escapeHtml(title) + '</h3>';
  }
  // 自由文本里的 arXiv id → 所属 L3 链接（与 app.js linkAx 同口径：未命中清单则不成链）
  function axLink(value) {
    return escapeHtml(value).replace(/(\d{4}\.\d{4,5})/g, function (m) {
      var home = homeOf(m);
      return home ? '<a class="ax-link" href="#reading/' + home + '/' + m + '">' + m + '</a>' : m;
    });
  }
  function homeOf(ax) {
    var items = window.RESEARCH && window.RESEARCH.reading && window.RESEARCH.reading.common.items;
    var i, p;
    for (i = 0; items && i < items.length; i += 1) { p = items[i]; if (p.ax === ax) return 'common'; }
    var tracks = (window.RESEARCH && window.RESEARCH.reading && window.RESEARCH.reading.tracks) || {};
    for (i = 0; i < TRACK_IDS.length; i += 1) {
      var list = (tracks[TRACK_IDS[i]] || {}).papers || [];
      for (var j = 0; j < list.length; j += 1) if (list[j].ax === ax) return TRACK_IDS[i];
    }
    return null;
  }

  /* ── 常量副本（app.js 内部不可见，改动双处同步） ── */
  var TRACK_IDS = ['A', 'B', 'C', 'D', 'E', 'F'];
  var trackShort = { A: '任务完成验证', B: '交叉审查', C: '记忆评测', D: '图结构记忆', E: '代码基准审计', F: '记忆压缩' };
  var ACT = {
    deep: { label: '精读', cls: 'act-deep', li: '' },
    scan: { label: '过一遍', cls: 'act-scan', li: ' class="scan"' },
    skip: { label: '跳过', cls: 'act-skip', li: ' class="skip"' }
  };
  var SOURCE_LABEL = {
    arxiv_html: '本次抓取了 arXiv 全文（LaTeXML）',
    abstract: '只有摘要级别的信息',
    knowledge: 'AI 既有知识写的，本次未联网核对',
    none: 'AI 完全没读过全文'
  };

  /* ── 数据查找：research.js 是归属的唯一事实源 ── */
  function findEntry(level, ax) {
    var reading = window.RESEARCH && window.RESEARCH.reading;
    if (!reading) return null;
    var list = level === 'common' ? reading.common.items : ((reading.tracks[level] || {}).papers || null);
    if (!list) return null;
    for (var i = 0; i < list.length; i += 1) if (list[i].ax === ax) return list[i];
    return null;
  }
  function hasPaper(level, ax) { return !!findEntry(level, ax); }

  // 该层级的展示顺序：前置 → 主路径 → 延伸（与 L2 渲染顺序一致）
  function orderedList(level) {
    var reading = window.RESEARCH.reading;
    var list = level === 'common' ? reading.common.items : reading.tracks[level].papers;
    if (level === 'common') return list;
    var prereq = [], main = [], ext = [];
    list.forEach(function (p) {
      if (p.tier === 'extend') ext.push(p);
      else if (p.tier === 'prereq') prereq.push(p);
      else main.push(p);
    });
    return prereq.concat(main, ext);
  }
  function siblings(level, ax) {
    var list = orderedList(level);
    var idx = -1;
    list.forEach(function (p, i) { if (p.ax === ax) idx = i; });
    return { prev: list[idx - 1] || null, next: list[idx + 1] || null };
  }
  /* 前后篇按钮：有 ax 才生成站内卡链接；无 ax 的预印本给原文外链（绝无空 ID 路由，实施路线 §5.5） */
  function sibLink(sib, dir, level) {
    if (!sib) return '<span></span>';
    var label = sib.t.length > 22 ? sib.t.slice(0, 22) + '…' : sib.t;
    var title = ' title="' + escapeHtml(sib.t) + '"';
    if (sib.ax) {
      return dir < 0
        ? '<a class="btn" href="#reading/' + escapeHtml(level) + '/' + escapeHtml(sib.ax) + '"' + title + '>← 上一篇 · ' + escapeHtml(label) + '</a>'
        : '<a class="btn" href="#reading/' + escapeHtml(level) + '/' + escapeHtml(sib.ax) + '"' + title + '>' + escapeHtml(label) + ' · 下一篇 →</a>';
    }
    if (sib.srcUrl) {
      return '<a class="btn" href="' + encodeURI(sib.srcUrl) + '" target="_blank" rel="noreferrer"' + title + '>' +
        (dir < 0 ? '← 上一篇（站外预印本）' : '下一篇（站外预印本） →') + '</a>';
    }
    return '<a class="btn" href="#reading/' + escapeHtml(level) + '">返回目录</a>';
  }
  function skillName(id) {
    var roadmap = (window.SKILLS && window.SKILLS.roadmap) || [];
    for (var i = 0; i < roadmap.length; i += 1) if (roadmap[i].id === id) return roadmap[i];
    return null;
  }

  /* ── 页头 ── */
  function crumbHtml(level, entry) {
    var home = level === 'common' ? '公共必读' : '方向 ' + level + ' · ' + (trackShort[level] || level);
    var here = entry.t.length > 34 ? entry.t.slice(0, 34) + '…' : entry.t;
    return '<nav class="crumb"><a href="#reading">本周学习</a><span>/</span>' +
      '<a href="#reading/' + escapeHtml(level) + '">' + escapeHtml(home) + '</a><span class="crumb-here">/ ' + escapeHtml(here) + '</span></nav>';
  }
  function headerHtml(level, entry, card) {
    var home = level === 'common' ? '公共必读' : '方向 ' + level + ' · ' + (trackShort[level] || level);
    var badges = '';
    if (entry.tier === 'extend') badges += badge('延伸 · 不在 90 天计划里', 'b-dim') + ' ';
    if (entry.tier === 'prereq') badges += badge('选这个方向才要求', 'b-dim') + ' ';
    if (entry.key) badges += badge('必读', 'b-acc') + ' ';
    if (entry.warn) badges += badge('和别的方向撞题', 'b-low') + ' ';
    if (String(entry.y || '').indexOf('2026') === 0) badges += badge('2026 预印本 · 引用前复核', 'b-mid');
    var lede = [home, entry.n ? '第 ' + entry.n + ' 篇' : null, entry.v, entry.y,
      entry.c == null ? null : 'cited ' + entry.c, entry.h]
      .filter(function (x) { return x != null && x !== ''; }).map(text).join(' · ');
    return '<header class="page-head l3-head">' +
      '<h2>' + escapeHtml(entry.t) + '</h2>' +
      '<p class="lede">' + lede + (badges ? '　' + badges : '') + '</p></header>' +
      '<div class="l3-actions">' +
      // 防御：findEntry 按 ax 匹配，正常数据进不来无 ax 条目；但仍不给无 ax 的 entry 拼 arXiv 链接
      // （qwen 审查 major-1：万一数据演化出无 ax 条目，应走 srcUrl，绝不生成 /abs/ 空链）
      (entry.ax
        ? '<a class="btn" href="https://arxiv.org/abs/' + escapeHtml(entry.ax) + '" target="_blank" rel="noreferrer">📄 arXiv abs</a>' +
          '<a class="btn" href="https://arxiv.org/html/' + escapeHtml(entry.ax) + '" target="_blank" rel="noreferrer">🌐 arXiv HTML（LaTeXML）</a>'
        : (entry.srcUrl
          ? '<a class="btn" href="' + encodeURI(entry.srcUrl) + '" target="_blank" rel="noreferrer">🌐 原文外链（站外预印本）</a>'
          : '')) +
      '<span class="mono-sm">本站不保存 PDF。卡片里标 § 的位置，指的是 arXiv HTML 版的章节。</span>' +
      '</div>';
  }

  /* ── 通用块 ── */
  function locBlock(entry, leadLabel) {
    return '<section class="page-summary l3-loc"><div class="ps-head">' + escapeHtml(leadLabel) + '</div>' +
      (entry.intro ? '<p>' + axLink(entry.intro) + '</p>' : '') +
      '<p>' + axLink(entry.why || '') + '</p></section>';
  }
  function checkHtml(id, label, checked) {
    return '<label class="mini-check"><input type="checkbox" data-check-id="' + escapeHtml(id) + '"' +
      (checked ? ' checked' : '') + ' aria-label="' + escapeHtml(label) + '"> 我读完了</label>';
  }
  function unreadHtml(unread) {
    if (!unread) {
      return '<p class="mono-sm l3-unread">AI 没读过这篇的全文：速览卡只写了元数据和站内导读，引用前请以原文为准。</p>';
    }
    return '<p class="mono-sm l3-unread">AI 没读全声明（' + escapeHtml(unread.at || '') + '）· 来源：' +
      escapeHtml(SOURCE_LABEL[unread.source] || unread.source) + '。读了：' + escapeHtml((unread.read || []).join('、') || '（无）') +
      '；没读：' + escapeHtml((unread.notRead || []).join('、') || '（无）') + '。没读过的部分不能当成核对过，引用前请以原文为准。</p>';
  }

  /* ── 深读卡正文 ── */
  function deepBlocks(card, entry, checks) {
    var html = '';
    html += section('这篇在讲什么') + '<p class="l3-tldr">' + axLink(card.tldr || '') + '</p>';
    if (card.must && card.must.length) {
      html += section('原文里重点读这几处') + '<ul class="l3-must">';
      card.must.forEach(function (m) {
        var act = ACT[m.act] || ACT.scan;
        html += '<li' + act.li + '><span class="act ' + act.cls + '">' + act.label + '</span>' +
          '<div class="l3-must-body"><b>' + escapeHtml(m.k) + '</b>' + axLink(m.why || '') +
          (m.a ? ' <a href="' + escapeHtml(m.a) + '" target="_blank" rel="noreferrer">↗ 原文</a>' : '') + '</div></li>';
      });
      html += '</ul>';
    }
    if (card.sections && card.sections.length) {
      var secRows = '';
      card.sections.forEach(function (s) {
        secRows += '<div class="l3-sec"><dt>§' + escapeHtml(s.k) + (s.t ? ' ' + escapeHtml(s.t) : '') +
          (s.a ? ' <a href="' + escapeHtml(s.a) + '" target="_blank" rel="noreferrer" title="arXiv HTML 原节">↗</a>' : '') +
          '</dt><dd>' + axLink(s.s || '') + '</dd></div>';
      });
      html += details('各章都讲了什么（不用读原文的部分）', '<dl class="l3-sec-list">' + secRows + '</dl>', false, '', true);
    }
    if (card.slices && card.slices.length) {
      var sliceRows = '';
      card.slices.forEach(function (s) {
        sliceRows += '<blockquote class="l3-slice">' + escapeHtml(s.q || '') +
          '<span class="where">§' + escapeHtml(s.k) + (s.t ? ' · ' + escapeHtml(s.t) : '') +
          (s.a ? ' · <a href="' + escapeHtml(s.a) + '" target="_blank" rel="noreferrer">原文锚点</a>' : '') + '</span></blockquote>';
      });
      html += details('值得对着原文读的段落（公式是纯文本，排版以原文为准）', '<div class="card">' + sliceRows + '</div>', false, '', true);
    }
    if (card.link && (card.link.week || (card.link.skills && card.link.skills.length))) {
      html += section('它用在哪里') + '<div class="ws-group">';
      if (card.link.week) {
        html += '<span class="ws-label">90 天里的周次</span><a class="ws-chip" href="#reading/week/' + escapeHtml(card.link.week) + '">' + escapeHtml(card.link.week) + '</a>';
      }
      html += '</div>';
      if (card.link.skills && card.link.skills.length) {
        html += '<div class="filters" style="margin-top:10px">' + card.link.skills.map(function (sid) {
          var s = skillName(sid);
          return s ? '<a class="chip" href="#skills/' + escapeHtml(sid) + '">' + escapeHtml(s.name) + ' · ' + escapeHtml(s.priority) + '</a>' : '';
        }).join('') + '</div>';
      }
    }
    if (card.quiz && card.quiz.length) {
      html += section('合上论文，这几问能答上吗') + '<ol class="l3-quiz">' +
        card.quiz.map(function (q) { return '<li>' + axLink(q) + '</li>'; }).join('') + '</ol>' +
        '<label class="mini-check"><input type="checkbox" data-check-id="paper-quiz-' + escapeHtml(entry.ax) + '"' +
        (checks.has('paper-quiz-' + entry.ax) ? ' checked' : '') +
        ' aria-label="合上论文自测做过了：' + escapeHtml(entry.t) + '"> 这几问我都能答</label>';
    }
    return html;
  }

  /* ── 速览卡正文 ── */
  function skimBlocks(skim) {
    return section('为什么现在不用细读') + '<p class="l3-tldr">' + escapeHtml(skim.whySkim || '') + '</p>' +
      section('什么时候值得回来读') + '<p class="l3-tldr">' + escapeHtml(skim.whenBack || '') + '</p>';
  }

  /* ── 主渲染入口：app.js 在第三段路由合法时调用 ── */
  function render(level, ax, ctx) {
    var entry = findEntry(level, ax);
    if (!entry) return '';
    var checks = (ctx && ctx.checks) || { has: function () { return false; } };
    var card = (window.PAPERS_BY_AX || {})[ax] || null;
    var skim = card && card.skim;
    var html = '<div class="page">' + crumbHtml(level, entry) + headerHtml(level, entry, card) +
      locBlock(entry, level === 'common' ? '为什么在主线公共必读里' : '为什么在这条路线里');

    if (card && !skim) {
      html += unreadHtml(card.unread);
      html += deepBlocks(card, entry, checks);
      html += section('读完打卡') + checkHtml('paper-' + level + '-' + entry.ax, '已读：' + entry.t, checks.has('paper-' + level + '-' + entry.ax));
    } else if (skim) {
      html += unreadHtml(null);
      html += skimBlocks(skim);
      html += section('读过打卡') + checkHtml('paper-' + level + '-' + entry.ax, '已读：' + entry.t, checks.has('paper-' + level + '-' + entry.ax));
    } else {
      html += '<div class="callout warn"><span class="t">阅读卡待生成</span>' +
        '这篇论文还没有导读卡。现在可以先用上面的 arXiv 链接读原文；' +
        '卡片生成后，这一页会加上内容摘要、阅读重点和自测问题。</div>' +
        section('读完打卡') + checkHtml('paper-' + level + '-' + entry.ax, '已读：' + entry.t, checks.has('paper-' + level + '-' + entry.ax));
    }

    var sib = siblings(level, ax);
    var mid = '<a class="btn l3-nav-mid" href="#reading/' + escapeHtml(level) + '">返回 ' +
      escapeHtml(level === 'common' ? '公共必读' : '方向 ' + level) + '</a>';
    html += '<div class="l3-nav">' + sibLink(sib.prev, -1, level) + mid + sibLink(sib.next, 1, level) + '</div>';

    return html + '</div>';
  }

  window.L3 = { render: render, hasPaper: hasPaper };
}());
