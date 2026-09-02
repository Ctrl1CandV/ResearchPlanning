/* 研究生三年发展路径 · 原生渲染器（无依赖；勾选/主题/方向经 localStorage 保存在本机） */
(function () {
  'use strict';

  var app = document.getElementById('app');
  var searchInput = document.getElementById('search');
  var searchResults = document.getElementById('search-results');
  var sidebarToggle = document.getElementById('sidebar-toggle');
  var navOverlay = document.getElementById('nav-overlay');
  var themeToggle = document.getElementById('theme-toggle');
  var skipLink = document.querySelector('.skip-link');
  var content = document.getElementById('content');

  // 启动前确认六个数据文件都已加载，缺失时给出可读提示而不是空白页
  var required = [['DATA', window.DATA], ['RESEARCH', window.RESEARCH], ['TOOLS', window.TOOLS],
    ['JOBS', window.JOBS], ['SKILLS', window.SKILLS], ['PORTFOLIO', window.PORTFOLIO]];
  var missing = required.filter(function (pair) { return !pair[1]; }).map(function (pair) { return pair[0]; });
  if (missing.length) {
    app.innerHTML = '<div class="page"><div class="callout bad"><span class="t">数据文件未加载：' +
      missing.join('、') + '</span><p>请直接打开 site/index.html，并保持 site/data 与 site/assets 目录结构完整。</p></div></div>';
    return;
  }

  // ── 本机持久化（file:// 下部分浏览器限制 localStorage：全部 try/catch，异常即静默降级为会话态） ──
  var STORE = { checks: 'rp.checks', theme: 'rp.theme', track: 'rp.track' };
  function storeGet(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } }
  function storeSet(key, value) { try { window.localStorage.setItem(key, value); } catch (e) { /* 降级为会话态 */ } }
  function storeDel(key) { try { window.localStorage.removeItem(key); } catch (e) { /* 同上 */ } }

  function savedChecks() {
    var raw = storeGet(STORE.checks);
    if (!raw) return [];
    try {
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(function (id) { return typeof id === 'string'; }) : [];
    } catch (e) { return []; }
  }

  var state = {
    checks: new Set(savedChecks()),
    track: 'A',
    jobCity: 'all',
    jobTier: 'all',
    jobStage: 'all',
    jobFamily: 'all',
    jobEvidence: 'all',
    skillPriority: 'all',
    skillDomain: 'all',
    verifyImpact: 'all',
    verifyStatus: 'all'
  };
  function persistChecks() { storeSet(STORE.checks, JSON.stringify(Array.from(state.checks))); }

  // 页内目录的滚动监听器；每次重渲染前断开，避免逐次累积
  var tocObserver = null;
  // 跨路由锚点：data-anchor 目标不在当前页时（如 L2 周chip → L1 周条目、技能步骤 → 论文锚点），
  // 先记下锚点再切 hash，render() 末尾滚动到位并展开所在 details
  var pendingAnchor = null;

  var routeMeta = {
    dashboard: ['总览仪表盘', '把研究、工程、求职排成一条能落地的时间线'],
    baseline: ['现实基线', '先把导师、学校制度、产业资源这些前提搞清楚，再谈选择'],
    research: ['研究主线', '主线是可信 Agent 系统（假成功检测与评测），图记忆作为和导师合作的线'],
    reading: ['阅读与 90 天启动', '先读公共必读，再按方向进入各自的路线，默认走方向 A'],
    tools: ['科研工具链', '常用工具速查，以及方法论放在哪里'],
    jobs: ['实习与岗位', '实习按阶段往上搭跳板，北京算作中转'],
    skills: ['技能矩阵', '优先级看市场信号，每条路线都配了学习参考'],
    portfolio: ['作品集', '用真实开源项目证明可靠性、性能和工程判断。'],
    career: ['求职资产', '只作方向参考，临近 2027.12 按当年市场重做'],
    verify: ['待核验清单', '先处理那些会改变路线的未知项']
  };

  var claimLabels = {
    fact: ['事实', 'b-high'],
    inference: ['策略判断', 'b-info'],
    needsVerification: ['待核验', 'b-low'],
    forecast: ['预测', 'b-mid'],
    plan: ['计划', 'b-acc']
  };
  var evidenceLabels = {
    officialFullJD: ['官方完整 JD', 'b-high'],
    officialPartialJD: ['官方部分 JD', 'b-high'],
    officialProgram: ['官方项目', 'b-high'],
    secondaryNamed: ['具名二手', 'b-mid'],
    secondaryWeak: ['弱二手', 'b-low'],
    forecast: ['历史外推', 'b-mid'],
    needsVerification: ['待核验', 'b-low']
  };
  var tierLabels = { primary: '主目标', secondary: '次目标', fallback: '兜底', avoid: '不主投' };
  var familyLabels = {
    'ai-app': 'AI 应用', agent: 'Agent 架构', harness: '评测/可观测', rag: 'RAG/知识库',
    posttrain: '后训练', inference: '推理优化', platform: 'AI 平台', fde: 'FDE', backend: '传统后端'
  };
  var domainLabels = {
    backend: '后端', systems: '系统与架构', agent: 'Agent', model: '模型基础',
    framework: '框架', data: '数据与存储', interview: '面试基础'
  };
  var stageLabels = {
    masterYear1: '研一', masterYear1Winter: '研一寒假', masterYear1Summer: '研一暑假',
    masterYear2Fall: '研二秋', masterYear2Winter: '研二寒假', summer2029: '2029 暑期',
    campus2029: '2029 校招', fallback: '兜底'
  };

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function text(value, fallback) {
    return value == null || value === '' ? (fallback || '—') : escapeHtml(value);
  }

  function arr(value) { return Array.isArray(value) ? value : []; }
  // 从数据里收集去重后的取值；pick 可返回单值或数组，用于动态生成筛选项
  function uniqueBy(list, pick) {
    var seen = [];
    arr(list).forEach(function (item) {
      var value = pick(item);
      arr(Array.isArray(value) ? value : [value]).forEach(function (v) {
        if (v != null && v !== '' && seen.indexOf(v) < 0) seen.push(v);
      });
    });
    return seen;
  }
  function rich(value) { return value == null ? '' : String(value); }
  // 先整体转义，再放回极小的行内标签白名单。
  // 用于策展文案里只含 <b>/<br>/<code> 强调的字段（岗位摘要、地域策略等）：
  // 既保留排版重点，又不像 rich() 那样把任意 HTML 直接注入。
  // 注意：任何来自 API / issue 同步的外部文本仍应走 escapeHtml()。
  function safeRich(value) {
    return escapeHtml(value)
      .replace(/&lt;(\/?)(b|strong|em|code|br)\s*\/?&gt;/g, function (match, slash, tag) {
        return '<' + slash + tag.toLowerCase() + '>';
      });
  }
  function slug(value) { return String(value || '').replace(/[^a-zA-Z0-9_-]/g, '-'); }

  // 页序号与侧栏导航编号一致，页头展示用
  var routeOrder = ['dashboard', 'baseline', 'research', 'reading', 'tools', 'jobs', 'skills', 'portfolio', 'career', 'verify'];

  function pageHead(route, eyebrow) {
    var meta = routeMeta[route];
    var no = ('0' + Math.max(0, routeOrder.indexOf(route))).slice(-2);
    return '<header class="page-head"><div class="eyebrow"><span class="eyebrow-no">' + no + '</span>' + escapeHtml(eyebrow) +
      '</div><h2>' + escapeHtml(meta[0]) + '</h2><p class="lede">' + escapeHtml(meta[1]) + '</p></header>';
  }

  function section(title, id) {
    return '<h3 class="sec"' + (id ? ' id="' + escapeHtml(id) + '"' : '') + '>' + escapeHtml(title) + '</h3>';
  }

  // 要点块：每页 3—5 条结论，渲染在页头下方；文案来自数据模块的 summary 字段
  function pageSummary(items) {
    if (!arr(items).length) return '';
    return '<section class="page-summary"><div class="ps-head">这一页的要点</div><ul>' +
      items.map(function (item) { return '<li>' + safeRich(item) + '</li>'; }).join('') + '</ul></section>';
  }

  function badge(label, cls) {
    return '<span class="badge ' + (cls || 'b-dim') + '">' + escapeHtml(label) + '</span>';
  }

  function claimBadge(type) {
    var item = claimLabels[type] || [type || '未标注', 'b-dim'];
    return badge(item[0], item[1]);
  }

  function evidenceBadge(level) {
    var item = evidenceLabels[level] || [level || '未标注', 'b-dim'];
    return badge(item[0], item[1]);
  }

  function sourceLine(level, label) {
    var cls = level === 's1' ? 's1' : level === 's2' ? 's2' : 's3';
    var name = level === 's1' ? '一手' : level === 's2' ? '二手' : '推断/未核实';
    return '<div class="src ' + cls + '"><span class="dot"></span><span>' + name +
      (label ? ' · ' + escapeHtml(label) : '') + '</span></div>';
  }

  function tags(items) {
    return '<div class="tag-row">' + arr(items).map(function (item) {
      return '<span class="pill">' + escapeHtml(item) + '</span>';
    }).join('') + '</div>';
  }

  function list(items, ordered, allowRich) {
    var tag = ordered ? 'ol' : 'ul';
    return '<' + tag + '>' + arr(items).map(function (item) {
      return '<li>' + (allowRich ? rich(item) : escapeHtml(item)) + '</li>';
    }).join('') + '</' + tag + '>';
  }

  function kv(rows, allowRich) {
    return '<dl class="kv">' + arr(rows).map(function (row) {
      return '<dt>' + escapeHtml(row[0]) + '</dt><dd>' + (allowRich ? rich(row[1]) : text(row[1])) + '</dd>';
    }).join('') + '</dl>';
  }

  function stat(value, label, note, cls) {
    return '<div class="stat ' + (cls || '') + '"><div class="k">' + text(value) + '</div><div class="l">' +
      escapeHtml(label) + '</div>' + (note ? '<div class="n">' + escapeHtml(note) + '</div>' : '') + '</div>';
  }

  function stars(value) {
    var count = Number(value) || 0;
    var out = '';
    for (var i = 1; i <= 5; i += 1) out += i <= count ? '★' : '<span class="off">★</span>';
    return '<span class="stars" aria-label="' + count + ' / 5">' + out + '</span>';
  }

  function table(headers, rows) {
    return '<div class="tbl-wrap"><table><thead><tr>' + headers.map(function (h) {
      return '<th>' + escapeHtml(h) + '</th>';
    }).join('') + '</tr></thead><tbody>' + rows.map(function (row) {
      return '<tr>' + row.map(function (cell) { return '<td>' + cell + '</td>'; }).join('') + '</tr>';
    }).join('') + '</tbody></table></div>';
  }

  function callout(title, body, cls) {
    return '<div class="callout ' + (cls || '') + '"><span class="t">' + escapeHtml(title) + '</span>' + rich(body) + '</div>';
  }

  function details(title, body, open, right, ref) {
    // ref=true 渲染「档案层」降噪折叠（acc ref）：只用于背景/口径/情报类折叠块，
    // 执行层折叠（勾选进度、90 天 Phase、方法草案）不带此标记，视觉保持原样
    return '<details class="acc' + (ref ? ' ref' : '') + '"' + (open ? ' open' : '') + '><summary>' + escapeHtml(title) +
      '<span class="spacer"></span>' + (right || '') + '</summary><div class="acc-body">' + body + '</div></details>';
  }

  function filterGroup(label, name, options, selected) {
    return '<div class="filter-group" data-filter-group="' + escapeHtml(name) + '"><span class="flabel">' +
      escapeHtml(label) + '</span>' + options.map(function (option) {
        var active = selected === option[0];
        return '<button type="button" class="chip' + (active ? ' on' : '') + '" aria-pressed="' + (active ? 'true' : 'false') +
          '" data-filter="' + escapeHtml(name) + '" data-value="' + escapeHtml(option[0]) + '">' + escapeHtml(option[1]) + '</button>';
      }).join('') + '</div>';
  }

  function checkList(id, title, items, meta) {
    var normalized = arr(items).map(function (item, index) {
      return typeof item === 'string' ? { id: id + '-' + index, text: item } : item;
    });
    var done = normalized.filter(function (item) { return state.checks.has(item.id); }).length;
    var pct = normalized.length ? Math.round(done / normalized.length * 100) : 0;
    return '<section class="card checklist-card" data-checklist="' + escapeHtml(id) + '">' +
      '<div class="card-head"><strong>' + escapeHtml(title) + '</strong><span class="session-note">本机保存</span></div>' +
      (meta ? '<p class="muted">' + escapeHtml(meta) + '</p>' : '') +
      '<div class="progress-line"><div class="track"><i style="width:' + pct + '%"></i></div><span class="lbl">' + done + ' / ' + normalized.length + '</span></div>' +
      '<div class="check-list">' + normalized.map(function (item) {
        return '<label class="chk"><input type="checkbox" data-check-id="' + escapeHtml(item.id) + '"' +
          (state.checks.has(item.id) ? ' checked' : '') + '><span class="box" aria-hidden="true"></span><span class="body"><span class="ttl">' +
          escapeHtml(item.text || item.title || '') + '</span>' + (item.meta ? '<span class="meta">' + escapeHtml(item.meta) + '</span>' : '') + '</span></label>';
      }).join('') + '</div></section>';
  }

  function anchorNav(items) {
    return '<nav class="anchor-nav" aria-label="页内导航">' + items.map(function (item) {
      return '<a href="#' + escapeHtml(item[0]) + '" data-anchor="' + escapeHtml(item[0]) + '">' + escapeHtml(item[1]) + '</a>';
    }).join('') + '</nav>';
  }

  // ── 阶段感知：里程碑常量（依据 JOBS.timeline 与实习阶梯的既定节奏，每年复核） ──
  var ENROLL_ISO = '2026-09-01';
  var GRADUATE_ISO = '2029-06-30';   // 三年主路线图终点的毕业节点锚点，每年复核
  var PHASES = [
    { id: 'pre', until: '2026-09-01', name: '开学之前', next: '入学', focus: '把入学前后要马上做的事做完：给导师的邮件、组会材料、公共必读、制度核验、算力确认。' },
    { id: 'y1a', until: '2027-01-12', name: '研一上 · 90 天启动', next: '研一寒假', focus: '把评测设施定下来（minibank-trap 做成受控评测）；开始 openEuler 开源实习和 OSPP 报名。' },
    { id: 'y1b', until: '2027-09-01', name: '研一寒假与下学期', next: '研二', focus: '寒假把重庆本地的岗位线索逐家核实；同时推进 Eval、Go 和开源项目。' },
    { id: 'y2', until: '2028-02-01', name: '研二上', next: '暑期实习主投', focus: '两个项目定型，四个核心数字测出来；联系成都和杭州的 mentor；2027.12 起每周看招聘窗口。' },
    { id: 'sprint', until: '2028-07-01', name: '暑期实习主投期', next: '暑期实习', focus: '简历冻结；按杭州、上海、深圳、广州主投，北京按中转一起投。' },
    { id: 'intern', until: null, name: '暑期实习与秋招', next: null, focus: '暑期实习把贡献记成成功率、成本、延迟、吞吐；提前批和秋招一起走，不押一个团队。' }
  ];

  function currentPhase(now) {
    for (var i = 0; i < PHASES.length; i += 1) {
      var until = PHASES[i].until ? new Date(PHASES[i].until + 'T00:00:00').getTime() : Infinity;
      if (now.getTime() < until) {
        return { phase: PHASES[i], daysLeft: PHASES[i].until ? Math.ceil((until - now.getTime()) / 86400000) : null };
      }
    }
    return { phase: PHASES[PHASES.length - 1], daysLeft: null };
  }

  // 90 天计划的当前周（自入学日起每 7 天一周）；0 = 未开学，13 = 已过执行期
  function plan90Week(now) {
    var start = new Date(ENROLL_ISO + 'T00:00:00').getTime();
    var days = Math.floor((now.getTime() - start) / 86400000);
    if (days < 0) return 0;
    var week = Math.floor(days / 7) + 1;
    return week > 12 ? 13 : week;
  }

  function phaseActions(phaseId, now) {
    if (phaseId === 'pre') {
      return [
        { t: '给导师的第一封邮件还没发的，开学前发掉；已经联系过的，准备组会汇报材料', to: '#research' },
        { t: '公共必读前 4 篇读完（RAG、Generative Agents、MemGPT、记忆综述）', to: '#reading' },
        { t: '去学位办要现行版《学位成果要求》和《实习管理办法》的完整原文', to: '#verify' },
        { t: '和导师确认 GPU、API 预算、服务器权限，以及组里做过的相关方向', to: '#verify' },
        { t: 'Atlas 全量测试跑通，再做一次 dry-run；minibank-trap 升级成受控评测', to: '#portfolio' }
      ];
    }
    var acts = [];
    var w = plan90Week(now);
    if (w >= 1 && w <= 12) {
      acts.push({ t: '90 天计划 · 本周（' + RESEARCH.plan90[w - 1].w + '）要交：' + RESEARCH.plan90[w - 1].out, to: '#reading' });
    } else if (w > 12) {
      acts.push({ t: '90 天计划已执行完，按方向卡的阶段路线和实习阶梯继续推进', to: '#reading' });
    }
    if (phaseId === 'y1a') acts.push({ t: '注册 openEuler 开源实习领任务，报名 OSPP 点亮计划', to: '#jobs' });
    if (phaseId === 'y1b') acts.push({ t: '寒假：重庆本地线索逐家核，是不是真在招、时间能不能和学业错开', to: '#jobs' });
    if (phaseId === 'y2') acts.push({ t: '两个项目把四项核心数字测出来；开始整理杭州雇主清单', to: '#portfolio' });
    if (phaseId === 'sprint' || phaseId === 'intern') acts.push({ t: '按偏好顺序投递、跟踪面试；北京的 offer 要同时满足“方向带得走 + 走人计划写清楚”', to: '#jobs' });
    acts.push({ t: '每月例行：看 Scholar 引用提醒、扫 arXiv、跟进 openEuler/OSPP、销掉核完的项', to: '#verify' });
    return acts;
  }

  function renderNowCard(now) {
    var cur = currentPhase(now);
    var p = cur.phase;
    var w = plan90Week(now);
    var actions = phaseActions(p.id, now);
    return '<section class="now-card"><div class="now-head"><div><div class="ps-head">现在处于哪一步</div>' +
      '<div class="now-name">' + escapeHtml(p.name) + '</div></div><div class="now-meta">' +
      (w >= 1 && w <= 12 ? '<span class="badge b-acc">90 天计划 · ' + escapeHtml(RESEARCH.plan90[w - 1].w) + '</span>' : '') +
      (cur.daysLeft != null ? '<span class="badge b-info">距 ' + escapeHtml(p.next) + ' ' + cur.daysLeft + ' 天</span>' : '') +
      '</div></div><p class="now-focus">' + escapeHtml(p.focus) + '</p>' +
      '<ul class="now-actions">' + actions.map(function (a) {
        return '<li><a href="' + a.to + '">' + escapeHtml(a.t) + '</a></li>';
      }).join('') + '</ul></section>';
  }

  // 进度总览：三条进度线。与 localStorage 同批上线；存储不可用时数字仅为会话态
  function renderProgress() {
    var common = allPapers().filter(function (p) { return p.level === 'common'; });
    var cDone = common.filter(function (p) { return state.checks.has(p.id); }).length;
    var wDone = RESEARCH.plan90.filter(function (w) { return state.checks.has('week-' + w.w); }).length;
    var vDone = JOBS.verification.filter(function (v) { return state.checks.has(v.id); }).length;
    function line(label, done, total) {
      var pct = total ? Math.round(done / total * 100) : 0;
      return '<div class="pg-row"><span class="pg-label">' + escapeHtml(label) + '</span>' +
        '<div class="progress-line"><div class="track"><i style="width:' + pct + '%"></i></div><span class="lbl">' + done + ' / ' + total + '</span></div></div>';
    }
    return '<section class="card progress-card"><div class="card-head"><strong>做到哪了</strong><span class="session-note">本机保存</span></div>' +
      line('公共必读', cDone, common.length) + line('90 天计划', wDone, RESEARCH.plan90.length) + line('核验清单', vDone, JOBS.verification.length) + '</section>';
  }

  // ── 三年主路线图：把 JOBS.timeline 提升为永远可见的路线层 ──
  // 节点状态按日期派生：已过（灰）/ 进行中或下一站（强调）/ 未来（空心）；
  // 不解析 DATA.meta.graduation 的句子，毕业节点用 GRADUATE_ISO 常量 + 原文作说明。
  function spineStart(when) {
    var m = /^(\d{4})\.(\d{2})/.exec(when || '');
    return m ? new Date(m[1] + '-' + m[2] + '-01T00:00:00').getTime() : Infinity;
  }

  function renderRoadmapSpine(now) {
    var t = now.getTime();
    var nodes = arr(JOBS.timeline).map(function (item) {
      return { when: item.when, title: item.title, detail: item.detail, type: item.type,
        milestone: !!item.milestone, start: spineStart(item.when) };
    });
    nodes.forEach(function (node, i) {
      // 节点窗口到下一个节点起始月为止；「当前进行中」= 起始 ≤ 今天 < 下一节点起始
      node.end = i + 1 < nodes.length ? nodes[i + 1].start : new Date(GRADUATE_ISO + 'T00:00:00').getTime();
    });
    nodes.push({ when: '2029.06', title: '毕业', detail: DATA.meta.graduation,
      type: 'plan', milestone: true, start: new Date(GRADUATE_ISO + 'T00:00:00').getTime(), end: Infinity });

    var nowIdx = -1, nextIdx = -1;
    nodes.forEach(function (node, i) {
      if (node.start <= t && t < node.end && nowIdx < 0) nowIdx = i;
      if (node.start > t && nextIdx < 0) nextIdx = i;
    });
    // 相邻节点同起始月（如 2028.07 的暑期实习与提前批秋招）会让前一个窗口为空，
    // 此刻两者都视为进行中；「当前阶段」徽章只标第一个
    var nowFlags = {};
    if (nowIdx >= 0) {
      nodes.forEach(function (node, i) {
        if (i <= nowIdx && node.start === nodes[nowIdx].start) nowFlags[i] = true;
      });
    }

    var rows = nodes.map(function (node, i) {
      var st = 'future';
      if (nowIdx >= 0) st = i < nowIdx && !nowFlags[i] ? 'past' : (nowFlags[i] ? 'now' : 'future');
      else st = i < nextIdx ? 'past' : (i === nextIdx ? 'next' : 'future');
      var marks = node.type === 'forecast' ? badge('预测', 'b-mid') : '';
      if (i === nowIdx) marks += badge('当前阶段', 'b-acc');
      if (i === nextIdx && nowIdx < 0) marks += badge('下一步', 'b-acc');
      return '<li class="spine-item ' + st + (node.milestone ? ' mile' : '') + '"><span class="spine-dot" aria-hidden="true"></span>' +
        '<div class="spine-main"><div class="spine-line"><span class="spine-when">' + escapeHtml(node.when) + '</span><b>' +
        escapeHtml(node.title) + '</b>' + marks + '</div><p class="spine-detail">' + escapeHtml(node.detail) + '</p></div></li>';
    }).join('');

    return '<section class="card spine-card"><div class="card-head"><strong>三年主时间线</strong>' +
      badge(currentPhase(now).phase.name, 'b-acc') + '</div><ol class="spine">' + rows + '</ol></section>';
  }

  // ── 12 周条：90 天计划的全景导航。当前周高亮，已勾周显示完成态，里程碑周星标 ──
  function renderWeekStrip(now) {
    var w = plan90Week(now);
    var mile = { 4: 1, 8: 1, 12: 1 };
    var groups = [1, 2, 3].map(function (ph) {
      var chips = RESEARCH.plan90.filter(function (item) { return item.ph === ph; }).map(function (item) {
        var num = parseInt(String(item.w).slice(1), 10);
        var cls = 'ws-chip' + (num === w ? ' now' : '') + (state.checks.has('week-' + item.w) ? ' done' : '') +
          (mile[num] ? ' mile' : '');
        return '<button type="button" class="' + cls + '" data-anchor="week-item-' + escapeHtml(item.w) + '">' +
          escapeHtml(item.w) + '</button>';
      }).join('');
      return '<div class="ws-group"><span class="ws-label">Phase ' + ph + '</span>' + chips + '</div>';
    }).join('');
    return '<div class="week-strip" aria-label="90 天计划 12 周导航">' + groups + '</div>';
  }

  // 阶梯当前步：阶段感知的同一套 PHASES 映射到四级阶梯（每年复核）。
  // pre 是「下一站」语义（入学首月即将开始）；y2 提前半年亮出 STEP 2，
  // 与 timeline 的「2027.10—11 接触 mentor」准备窗口一致。
  function currentLadderId() {
    var map = { pre: 'ladder-0', y1a: 'ladder-1', y1b: 'ladder-1', y2: 'ladder-2', sprint: 'ladder-3', intern: 'ladder-3' };
    return map[currentPhase(new Date()).phase.id] || 'ladder-0';
  }

  // 顶栏当前位置 chip：元素缺失或桩环境静默跳过
  var phaseChip = document.getElementById('phase-chip');
  function updatePhaseChip() {
    if (!phaseChip) return;
    var now = new Date();
    var w = plan90Week(now);
    phaseChip.hidden = false;
    phaseChip.textContent = '当前阶段 · ' + currentPhase(now).phase.name + (w >= 1 && w <= 12 ? ' · ' + RESEARCH.plan90[w - 1].w : '');
  }

  function renderDashboard() {
    var now = new Date();
    var firstAngle = RESEARCH.angles[0];
    return '<div class="page">' + pageHead('dashboard', 'Decision cockpit') +
      callout('主线一句话', '<strong>后端工程 → Agent 应用 → Harness / 评测 / 可观测 → 可信 Agent 系统：假成功检测与证据化评测。</strong><br>毕业论文建立方法深度，作品集证明系统能力，实习拿到生产证据。', 'good hero-line') +
      renderNowCard(now) +
      renderRoadmapSpine(now) +
      renderProgress() +
      '<div class="grid c4">' +
        stat('2026.09', '入学', '先核验制度与算力') +
        stat('W8', '研究问题定稿', 'baseline 表必须成型', 'warn') +
        stat('2028.02', '暑期实习主投', '预测窗口，需提前复核', 'warn') +
        stat('2 个', '做得深的开源项目', 'Atlas + AgentParliament', 'good') +
      '</div>' +
      section('当前要定的研究问题') +
      '<div class="hero-decision card pad-lg"><div><span class="badge b-acc">首篇建议</span><h3>' + escapeHtml(firstAngle.name) +
        '</h3><p class="mono-sm">' + escapeHtml(firstAngle.en) + '</p><p>' + escapeHtml(firstAngle.problem) + '</p></div>' +
        '<div class="score-grid">' + Object.keys(firstAngle.scores).map(function (key) {
          var names = { value: '问题价值', novelty: '新颖性', falsifiable: '可证伪', feasible: '可实施', resource: '资源匹配', career: '求职对齐' };
          return '<div class="score-item"><span>' + names[key] + '</span>' + stars(firstAngle.scores[key]) + '</div>';
        }).join('') + '</div></div>' +
      section('这 ' + DATA.corrections.length + ' 条纠正，每一条都会改变计划') +
      '<div class="grid c2">' + DATA.corrections.map(function (item) {
        return '<article class="card correction"><div class="wrong">当时的假设 · ' + escapeHtml(item.wrong) + '</div><h4>' + rich(item.right) +
          '</h4><p>' + rich(item.why) + '</p><div class="impact"><b>行动影响</b> ' + escapeHtml(item.impact) + '</div>' + sourceLine(item.src, item.ref) + '</article>';
      }).join('') + '</div>' +
      '<div class="card"><strong>不能越过的线</strong>' + list([
        '不要把 GraphRAG 当简历主标签；用 Memory、Context、Evaluation、Knowledge Graph 这些词。',
        '不要把 1,287 条快照说成百度全部的 AI 岗位。',
        '不要把预测的招聘时间、二手的实习政策、还没测到的指标写成事实。',
        '“能跑”不算作品集完成；每项都要报成功率、P99、QPS 和单位成本。'
      ]) + '</div></div>';
  }

  function renderBaseline() {
    return '<div class="page">' + pageHead('baseline', 'Evidence before strategy') +
      pageSummary(DATA.summary) +
      anchorNav([['advisor', '导师情况'], ['rules', '学校制度'], ['partners', '校企资源'], ['employment', '就业数据']]) +
      section('导师的论文路线', 'advisor') +
      '<div class="grid c2"><div class="card">' + kv(DATA.advisor.basic, true) + '</div><div class="card"><strong>能借力的做法' +
      DATA.advisor.methodology.map(function (item) { return '<div class="method-row"><b>' + escapeHtml(item.k) + '</b><p>' + escapeHtml(item.v) + '</p></div>'; }).join('') + '</div></div>' +
      callout('怎么让导师参与进来', DATA.advisor.tactic, '') +
      '<h4 class="sub">代表论文</h4>' + table(['年份', '期刊 / DOI', '主题', '引用快照'], DATA.advisor.papers.map(function (p) {
        // DOI 里的斜杠必须保留字面量，encodeURIComponent 会把它转成 %2F 导致 doi.org 解析失败
        return [text(p.y), '<a href="https://doi.org/' + encodeURI(p.doi) + '" target="_blank" rel="noreferrer">' + escapeHtml(p.j) + '</a><div class="mono-sm">' + escapeHtml(p.doi) + '</div>', text(p.t), text(p.cite)];
      })) + '<p class="mono-sm">' + escapeHtml(DATA.advisor.papersNote) + '</p>' +
      '<div class="grid c2"><div class="card"><strong>公开项目</strong>' + table(['项目', '级别', '时间'], DATA.advisor.projects.map(function (r) { return r.map(function (c) { return text(c); }); })) + '</div>' +
      '<div class="card"><strong>公开信息盲区</strong>' + list(DATA.advisor.blindspots, false, true) + '</div></div>' +
      section('培养制度：查到的和查不到的分开列', 'rules') +
      DATA.rules.map(function (item) {
        return details(item.q, '<p>' + rich(item.a) + '</p>' + (item.action ? callout('下一步核验', escapeHtml(item.action), 'warn') : '') + sourceLine(item.src, item.ref), false, badge(item.src === 's1' ? '一手' : '待复核', item.src === 's1' ? 'b-high' : 'b-mid'));
      }).join('') +
      section('校企资源：有通道，不等于机会自动到手', 'partners') +
      callout('两处更正', list(DATA.partners.corrections, false, true), 'warn') +
      '<div class="grid c2">' + DATA.partners.items.map(function (item) {
        return '<article class="job tier-' + escapeHtml(item.tier) + '"><div class="jh"><div class="jt">' + escapeHtml(item.name) + '</div>' + badge(item.tier, 'b-acc') +
          '</div><div class="jm">' + badge(item.level, 'b-info') + '</div><p>' + rich(item.note) + '</p><div class="jq"><b>对我的意义：</b>' + rich(item.why) + '</div>' + sourceLine(item.src, item.ref) + '</article>';
      }).join('') + '</div>' +
      details('可关注实验室（' + DATA.partners.labs.length + ' 个 · 背景档案）', table(['平台', '层级', '和路线怎么接上'], DATA.partners.labs.map(function (r) { return r.map(function (c) { return text(c); }); })) +
      '<p class="mono-sm">' + rich(DATA.partners.labNote) + '</p>', false, '', true) +
      section('就业数据：能用的和不能用的', 'employment') +
      details('落实率、雇主样本与薪资警告（背景数据）', '<div class="grid c2"><div>' + table(['口径', '比例', '时间'], DATA.employment.official.map(function (r) { return r.map(function (c) { return text(c); }); })) +
      '<div class="card"><strong>去了哪些公司（样本）</strong><p>' + escapeHtml(DATA.employment.employers) + '</p></div></div>' +
      '<div>' + callout('薪资数字不要引用', DATA.employment.salaryWarning, 'bad') + '<div class="card"><strong>去哪核实</strong><p>' + escapeHtml(DATA.employment.authoritative) + '</p>' + sourceLine(DATA.employment.src, DATA.employment.ref) + '</div></div></div>', false, '', true) +
      details(DATA.wafNote.title, DATA.wafNote.body, false, '', true) + '</div>';
  }

  function renderResearch() {
    return '<div class="page">' + pageHead('research', 'Thesis × market language') +
      pageSummary(RESEARCH.summary) +
      callout(RESEARCH.positioning.title, RESEARCH.positioning.body, 'good') +
      section('六个研究方向') + '<div class="matrix">' + RESEARCH.angles.map(function (angle) {
        return '<article class="mx-card' + (angle.star ? ' rec' : '') + '">' + (angle.star ? '<span class="mx-tag">RECOMMENDED</span>' : '') +
          '<h5>' + escapeHtml(angle.id + ' · ' + angle.name) + '</h5><div class="en">' + escapeHtml(angle.en) + '</div>' +
          kv([['要解决的问题', angle.problem], ['往哪投', angle.venue], ['成本', angle.cost], ['风险', angle.risk]], true) +
          '<div class="score-grid compact">' + Object.keys(angle.scores).map(function (key) {
            var names = { value: '问题价值', novelty: '新意（有多新）', falsifiable: '结论可否证', feasible: '一个人做得完吗', resource: '资源匹配', career: '对求职有用吗' };
            return '<div class="score-item"><span>' + names[key] + '</span>' + stars(angle.scores[key]) + '</div>';
          }).join('') + '</div>' + details('方法草案', list(angle.method), false) + '</article>';
      }).join('') + '</div>' +
      callout('先做哪个', RESEARCH.angleAdvice, '') +
      details('已拒绝的方向（2026-08-28 决定，存档防止重新捡起）', '<div class="grid c2">' + arr(RESEARCH.rejected).map(function (r) {
        return '<div class="card"><strong>' + escapeHtml(r.name) + '</strong><p>' + escapeHtml(r.reason) + '</p></div>';
      }).join('') + '</div>', false, '', true) +
      section('指标体系') + callout('为什么一个问题两种产出', RESEARCH.dualTrack, 'good') +
      details('共 ' + RESEARCH.metrics.length + ' 组指标（设计实验时查阅）', '<div class="grid c3">' + RESEARCH.metrics.map(function (metric) {
        return '<div class="card"><strong>' + escapeHtml(metric.g) + '</strong>' + list(metric.items) + '</div>';
      }).join('') + '</div>', false, '', true) +
      section('已经饱和的方向') + details('共 ' + RESEARCH.saturated.length + ' 条，都查过已被别人做过（防止重复投入）', table(['看起来能做的题目', '谁已经做了', '结论'], RESEARCH.saturated.map(function (item) {
        return [text(item.t), text(item.e), '<strong>' + text(item.j) + '</strong>'];
      })), false, '', true) +
      section('竞争团队') + details('共 ' + RESEARCH.rivals.length + ' 组，按更新频率跟踪', '<div class="grid c2">' + RESEARCH.rivals.map(function (item) {
        var cls = item.level === 'danger' ? 'bad' : item.level === 'warn' ? 'warn' : '';
        return '<div class="card rival ' + cls + '"><div class="card-head"><strong>' + escapeHtml(item.n) + '</strong>' + badge(item.f, cls === 'bad' ? 'b-low' : cls === 'warn' ? 'b-mid' : 'b-dim') +
          '</div><p>' + escapeHtml(item.w) + '</p><div class="mono-sm">' + escapeHtml(item.note) + '</div></div>';
      }).join('') + '</div>' + callout('我们怎么和它们比', RESEARCH.rivalJudgement, 'warn'), false, '', true) +
      section('把 Agent 的话翻译成导师的话') + table(['Agent 说法', '图学习说法'], RESEARCH.translate.map(function (r) { return [text(r[0]), rich(r[1])]; })) +
      '<blockquote><p>' + escapeHtml(RESEARCH.pitch) + '</p><cite>组会开场可以这么说</cite></blockquote>' +
      details('见导师要用的材料（15 页汇报骨架 + 第一封邮件存档）',
        '<p class="muted">2026-08 已和导师确认他会支持（见「现实基线」第四条纠正）。下面这份 15 页骨架，W4、W8、W12 组会可以反复用；第一封邮件留档备查。</p>' +
        table(['页码', '讲什么', '怎么讲'], RESEARCH.reportDeck.map(function (r) { return [text(r.p), text(r.c), text(r.k)]; })) +
        '<div class="card"><strong>汇报的三条注意</strong>' + list(RESEARCH.reportTips, false, true) + '</div>' +
        '<h4 class="sub">' + escapeHtml(RESEARCH.firstMail.title) + '</h4>' +
        '<p class="muted">' + escapeHtml(RESEARCH.firstMail.dont) + '</p>' +
        '<pre class="mail-body">' + escapeHtml(RESEARCH.firstMail.body) + '</pre>' +
        '<p class="muted">' + escapeHtml(RESEARCH.firstMail.effect) + '</p>', false, '', true) + '</div>';
  }

  function allPapers() {
    // 公共必读 + 各方向论文统一收集，供搜索索引使用
    var result = [];
    arr(RESEARCH.reading.common.items).forEach(function (paper, index) {
      result.push(Object.assign({ level: 'common', track: null, id: 'paper-common-' + (paper.ax || index) }, paper));
    });
    Object.keys(RESEARCH.reading.tracks).forEach(function (tid) {
      RESEARCH.reading.tracks[tid].papers.forEach(function (paper, index) {
        result.push(Object.assign({ level: tid, track: tid, id: 'paper-' + tid + '-' + (paper.ax || index) }, paper));
      });
    });
    return result;
  }

  // 方向短名（目录卡 / L2 面包屑用），缺失时回退到编号
  var trackShort = { A: '假成功检测', B: '交叉审查', C: '记忆评测', D: '图结构记忆', E: '代码基准审计', F: '记忆压缩' };
  var refKindIcons = { book: '📕', web: '🌐', paper: '📄' };

  // ── 学习层硬映射：方向↔技能的单向导航（「需要练什么」 vs 「论文主场」），不要为了对称互相补边。
  //    规则并入 MAINTENANCE §6；原设计文档已删，历史裁定见 PAPER-DEEP-READ-DESIGN.md §1.2。 ──
  var READING_L2 = { common: 1, A: 1, B: 1, C: 1, D: 1, E: 1, F: 1 };
  var READING_SKILL_MAP = {
    common: ['skill-memory', 'skill-rag'],
    A: ['skill-eval', 'skill-agent-patterns'],
    B: ['skill-eval', 'skill-agent-patterns'],
    C: ['skill-memory', 'skill-eval'],
    D: ['skill-memory', 'skill-graphdb', 'skill-rag'],
    E: ['skill-eval', 'skill-algo'],
    F: ['skill-memory', 'skill-graphdb']
  };
  var SKILL_TRACK_MAP = {
    'skill-eval': ['A', 'E'],
    'skill-memory': ['common', 'C', 'D', 'F'],
    'skill-rag': ['common', 'D'],
    'skill-protocols': ['A'],
    'skill-agent-patterns': ['A', 'B'],
    'skill-graphdb': ['D', 'F']
  };
  // 技能→信号只锁定「选哪一条」；百分比渲染时从 signals[] 读取，不硬抄设计稿里的示意数字
  var SKILL_SIGNAL_MAP = {
    'skill-algo': null, 'skill-cs': null, 'skill-eval': 'eval', 'skill-memory': 'memory',
    'skill-system-design': 'distributed', 'skill-go': 'go', 'skill-rag': 'signal-rag',
    'skill-protocols': 'function-calling', 'skill-agent-patterns': 'multi-agent',
    'skill-model-basics': null, 'skill-k8s': 'k8s', 'skill-graphdb': 'graphdb',
    'skill-framework-judgement': 'langchain'
  };
  var SKILL_SIGNAL_FALLBACK = {
    'skill-algo': '面试的硬门槛，和 JD 词频无关。',
    'skill-cs': '面试的硬门槛，和 JD 词频无关。',
    'skill-model-basics': '要求能在面试里讲明白，优先级不是从词频来的。'
  };
  var SKILL_INTERVIEW_MAP = {
    'skill-algo': 'track-code', 'skill-cs': 'track-foundation', 'skill-eval': 'track-agent',
    'skill-memory': 'track-agent', 'skill-system-design': 'track-design', 'skill-go': 'track-code',
    'skill-rag': 'track-agent', 'skill-protocols': 'track-agent', 'skill-agent-patterns': 'track-agent',
    'skill-model-basics': 'track-agent', 'skill-k8s': 'track-design', 'skill-graphdb': null,
    'skill-framework-judgement': 'track-agent'
  };

  function skillById(sid) {
    var found = null;
    SKILLS.roadmap.forEach(function (s) { if (s.id === sid) found = s; });
    return found;
  }

  // ax → 所属 L2（一篇只归一处：common 或某一个方向）。出现重复 ax 说明数据违例，先到者生效
  var paperHomeCache = null;
  function paperHome() {
    if (paperHomeCache) return paperHomeCache;
    var map = {};
    arr(RESEARCH.reading.common.items).forEach(function (p, i) {
      if (p.ax && !(p.ax in map)) map[p.ax] = { track: 'common', n: p.n || (i + 1) };
    });
    Object.keys(RESEARCH.reading.tracks).forEach(function (tid) {
      arr(RESEARCH.reading.tracks[tid].papers).forEach(function (p, i) {
        if (p.ax && !(p.ax in map)) map[p.ax] = { track: tid, n: i + 1 };
      });
    });
    paperHomeCache = map;
    return map;
  }

  // 自由文本里的 arXiv id 自动变成指向所属 L3 阅读卡的链接（PAPER-DEEP-READ-DESIGN.md §4）
  function linkAx(value) {
    var map = paperHome();
    return escapeHtml(value).replace(/(\d{4}\.\d{4,5})/g, function (m) {
      var home = map[m];
      return home ? '<a class="ax-link" href="#reading/' + home.track + '/' + m + '">' + m + '</a>' : m;
    });
  }

  function trackHours(list) {
    return arr(list).reduce(function (sum, p) {
      var h = parseInt(String(p.h || ''), 10);
      return sum + (isNaN(h) ? 0 : h);
    }, 0);
  }

  // L2 页头：复用 page-head 语汇，eyebrow-no 沿用父级序号，顶部给回父级目录的面包屑
  function l2Head(parentRoute, eyebrowText, title, lede, crumbHref, crumbLabel) {
    var no = ('0' + Math.max(0, routeOrder.indexOf(parentRoute))).slice(-2);
    return '<nav class="crumb"><a href="' + crumbHref + '">' + escapeHtml(crumbLabel) + '</a><span class="crumb-here">/ ' +
      escapeHtml(eyebrowText) + '</span></nav>' +
      '<header class="page-head"><div class="eyebrow"><span class="eyebrow-no">' + no + '</span>' + escapeHtml(eyebrowText) +
      '</div><h2>' + escapeHtml(title) + '</h2><p class="lede">' + escapeHtml(lede) + '</p></header>';
  }

  // L2 论文行：一行 = 序号/勾选/标题/原文外链/工时/why。intro·出处·徽章上收到 L3 阅读卡，
  // 行本身即入口（data-goto 进 #reading/<level>/<ax>，PAPER-DEEP-READ-DESIGN.md §4）
  function l2PaperRows(papers, level, opts) {
    opts = opts || {};
    var cont = opts.cont || 0;
    var checkable = opts.checkable !== false;
    return arr(papers).map(function (p, i) {
      var id = 'paper-' + level + '-' + (p.ax || i);
      var absLink = p.ax ? '<a class="src-link" href="https://arxiv.org/abs/' + encodeURI(p.ax) +
        '" target="_blank" rel="noreferrer" title="arXiv 原文（本站不存 PDF）">↗ ' + escapeHtml(p.ax) + '</a>' : '';
      var gotoAttr = p.ax ? ' data-goto="reading/' + level + '/' + encodeURI(p.ax) +
        '" tabindex="0" role="link" aria-label="打开阅读卡：' + escapeHtml(p.t) + '"' : '';
      return '<article class="lpaper"' + gotoAttr + ' id="paper-' + escapeHtml(p.ax || 'x' + i) + '"><div class="lp-row">' +
        '<span class="lp-no">' + (cont + i + 1) + '</span>' +
        (checkable ? '<label class="chk lp-check"><input type="checkbox" data-check-id="' + escapeHtml(id) + '"' +
          (state.checks.has(id) ? ' checked' : '') + ' aria-label="已读：' + escapeHtml(p.t) + '"><span class="box" aria-hidden="true"></span><span class="sr-only">已读</span></label>' : '') +
        '<div class="lp-main"><div class="lp-title">' + escapeHtml(p.t) + absLink + '<span class="lp-h">' + escapeHtml(p.h || '') + '</span></div>' +
        '<div class="lp-why">' + linkAx(p.why || '') + '</div></div></div></article>';
    }).join('');
  }

  function weekChips(from, to) {
    var out = '';
    for (var w = from; w <= to; w += 1) {
      out += '<a class="ws-chip" href="#reading" data-anchor="week-item-W' + w + '">W' + w + '</a>';
    }
    return out;
  }

  function skillChips(ids) {
    return arr(ids).map(function (sid) {
      var s = skillById(sid);
      return s ? '<a class="chip" href="#skills/' + escapeHtml(sid) + '">' + escapeHtml(s.name) + ' · ' + escapeHtml(s.priority) + '</a>' : '';
    }).join('');
  }

  // 技能学习步骤：paper+local 自动链回所属阅读 L2（不复制论文条目）；纸书无 URL 写明站点外
  function stepItem(r, no, omitNo) {
    var kindIcon = refKindIcons[r.kind] || '•';
    var kindName = r.kind === 'paper' ? '论文' : r.kind === 'book' ? '纸书' : '网页';
    var body;
    var home = r.local ? paperHome()[r.local] : null;
    if (home) {
      var homeLabel = home.track === 'common' ? '公共必读第 ' + home.n + ' 篇' : '方向 ' + home.track + ' · ' + (trackShort[home.track] || '');
      body = '<span class="mono-sm">' + escapeHtml(homeLabel) + '</span> <a href="#reading/' + home.track + '/' + encodeURI(r.local) + '">' + escapeHtml(r.label) + '</a>';
    } else if (r.url && r.url.charAt(0) === '#') {
      body = '<a href="' + escapeHtml(r.url) + '">' + escapeHtml(r.label) + '</a>';
    } else if (r.url) {
      body = '<a href="' + encodeURI(r.url) + '" target="_blank" rel="noreferrer">' + escapeHtml(r.label) + '</a>';
    } else {
      body = escapeHtml(r.label) + ' <span class="mono-sm">需要去图书馆借或自己买</span>';
    }
    return '<li class="step-item">' + (omitNo ? '' : '<span class="s-no">' + no + '</span>') +
      '<div class="step-body"><span class="step-kind">' + kindIcon + ' ' + kindName + '</span><div class="ref-item">' + body + '</div></div></li>';
  }

  // ── 阅读 L1：目录 + 90 天脊柱。论文全文墙与方向卡全文下沉到 L2（学习层目录化，规则并入 MAINTENANCE §2） ──
  function commonStageFlow() {
    // 三步分段从 common.note 的既有句子派生（前 4 / 中 5 / 后 4），不新造结论
    var steps = [
      { k: '第 1—4 篇 · 把语言立起来', v: 'RAG、Generative Agents、MemGPT、记忆综述' },
      { k: '第 5—9 篇 · 记忆系统的参照对象', v: 'A-MEM、Zep、Mem0、GraphRAG、LightRAG，都是记忆论文里常出现的系统和 baseline' },
      { k: '第 10—13 篇 · 评测与批评', v: 'LoCoMo、MAST、假成功刻画、HGB，教的是怎么评测、怎么批评' }
    ];
    return '<div class="stage-flow">' + steps.map(function (s, i) {
      return '<div class="stage"><span class="s-no">' + (i + 1) + '</span><div class="stage-body"><b>' + escapeHtml(s.k) + '</b><p>' + escapeHtml(s.v) + '</p></div></div>';
    }).join('') + '</div>';
  }

  function renderCurrentWeekCard(now) {
    var w = plan90Week(now);
    if (w >= 1 && w <= 12) {
      var item = RESEARCH.plan90[w - 1];
      return '<section class="now-card"><div class="now-head"><div><div class="ps-head">这周要做什么</div>' +
        '<div class="now-name">' + escapeHtml(item.w) + ' · Phase ' + escapeHtml(item.ph) + '</div></div><div class="now-meta">' +
        (item.mile ? badge('有检查点', 'b-acc') : '') +
        '<a class="ws-chip" href="#reading" data-anchor="week-item-' + escapeHtml(item.w) + '">看这周明细</a></div></div>' +
        '<dl class="kv"><dt>要读</dt><dd>' + linkAx(item.read) + '</dd>' +
        '<dt>要做</dt><dd>' + linkAx(item.run) + '</dd>' +
        '<dt>交什么</dt><dd>' + linkAx(item.out) + '</dd></dl></section>';
    }
    if (w === 0) {
      return '<div class="callout"><span class="t">90 天计划还没开始</span>开学后按周推进。入学前先把公共必读的前 4 篇读掉 → <a href="#reading/common">公共必读</a>。</div>';
    }
    return '<div class="callout warn"><span class="t">90 天计划已执行完</span>接下来按方向卡的阶段路线和实习阶梯继续走。</div>';
  }

  function renderCommonCatalog() {
    var common = RESEARCH.reading.common;
    var done = 0;
    common.items.forEach(function (p, i) {
      if (state.checks.has('paper-common-' + (p.ax || i))) done += 1;
    });
    var total = common.items.length;
    return '<a class="card cat-card" href="#reading/common">' +
      '<div class="card-head"><strong>' + escapeHtml(common.name) + '</strong>' + badge(total + ' 篇', 'b-acc') + '</div>' +
      '<div class="cat-meta"><span>约 ' + trackHours(common.items) + ' 小时</span><span>已勾 ' + done + ' / ' + total + '</span></div>' +
      '<div class="progress-line"><div class="track"><i style="width:' + (total ? Math.round(done / total * 100) : 0) + '%"></i></div><span class="lbl">' + done + ' / ' + total + '</span></div>' +
      '<p class="cat-pitch">前 4 篇把语言立起来，中间 5 篇是记忆系统的参照对象，后 4 篇讲怎么评测、怎么批判。</p>' +
      '<span class="cat-go">进入公共必读 →</span></a>';
  }

  function renderTrackCatalog() {
    var recFirst = !!(RESEARCH.angles[0] && RESEARCH.angles[0].star);
    return Object.keys(RESEARCH.reading.tracks).map(function (tid) {
      var t = RESEARCH.reading.tracks[tid];
      var core = arr(t.papers).filter(function (p) { return p.tier !== 'extend'; });
      var ext = arr(t.papers).filter(function (p) { return p.tier === 'extend'; });
      var prereq = core.filter(function (p) { return p.tier === 'prereq'; }).length;
      var main = core.length - prereq;
      var pitch = String(t.pitch || '');
      if (pitch.length > 80) pitch = pitch.slice(0, 80) + '…';
      return '<a class="card cat-card' + (tid === 'A' && recFirst ? ' cat-rec' : '') + '" href="#reading/' + tid + '">' +
        '<div class="card-head"><strong>方向 ' + tid + ' · ' + escapeHtml(trackShort[tid] || tid) + '</strong>' +
        (tid === 'A' && recFirst ? badge('第一篇就从它开始', 'b-acc') : '') + '</div>' +
        '<div class="cat-meta">' +
        (prereq ? '<span>前置 ' + prereq + ' + 必读 ' + main + '</span>' : '<span>必读 ' + core.length + ' 篇</span>') +
        (ext.length ? '<span>延伸 ' + ext.length + ' 篇</span>' : '') + '</div>' +
        '<p class="cat-pitch">' + escapeHtml(pitch) + '</p>' +
        '<span class="cat-go">进入这条路线 →</span></a>';
    }).join('');
  }

  function renderReading() {
    var now = new Date();
    var aPapers = RESEARCH.reading.tracks.A ? RESEARCH.reading.tracks.A.papers : [];
    var aHours = trackHours(aPapers);
    var totalHours = trackHours(RESEARCH.reading.common.items) + aHours;
    var fallbackBody = '<div class="grid c2">' + RESEARCH.fallback.map(function (item) {
      return '<div class="card"><strong>' + escapeHtml(item.s) + '</strong><p>' + escapeHtml(item.a) + '</p></div>';
    }).join('') + '</div>';
    return '<div class="page">' + pageHead('reading', 'Common first, then your track') +
      pageSummary(RESEARCH.readingSummary) +
      callout('这一页怎么用', '<b>先读公共层，再进方向。</b>公共必读 ' + RESEARCH.reading.common.items.length + ' 篇不管走哪个方向都要读。方向 A—F 一次只进一条，按里面的阶段路线推进。默认从方向 A 开始；中途换方向时，W1—W4 的公共层不动。<br><b>时间预算：</b>公共必读合计约 ' + trackHours(RESEARCH.reading.common.items) + ' 小时，方向 A 约 ' + aHours + ' 小时，加起来 <b>' + totalHours + ' 小时要在 90 天里读完</b>，还要留出 Atlas 实验的时间。六条方向不是开学就要全部读完的。', 'good') +
      section('90 天进度：现在在第几周', 'spine') + renderWeekStrip(now) + renderCurrentWeekCard(now) +
      section('公共必读 · 六个方向共用', 'common-entry') + renderCommonCatalog() +
      section('六条方向路线，选一条进入', 'tracks') + '<div class="grid c2">' + renderTrackCatalog() + '</div>' +
      callout('换方向怎么办', rich(RESEARCH.plan90Switch), 'warn') +
      details('卡住时的 ' + RESEARCH.fallback.length + ' 条退路（背景档案）', fallbackBody, false, '', true) +
      section('12 周逐周计划', 'plan90') + renderPlan90(now) +
      '</div>';
  }

  // ── 阅读 L2：单方向学习路线，十块骨架顺序固定（骨架规范见 MAINTENANCE §2；L3 扩展见 PAPER-DEEP-READ-DESIGN.md） ──
  function renderReadingL2(tid) {
    var isCommon = tid === 'common';
    var t = isCommon ? RESEARCH.reading.common : RESEARCH.reading.tracks[tid];
    if (!t) return '';
    if (!isCommon) { state.track = tid; storeSet(STORE.track, tid); }
    // common 的论文在 items 字段，方向在 papers 字段（research.js 既有结构）
    var papers = arr(isCommon ? t.items : t.papers);
    var core = papers.filter(function (p) { return p.tier !== 'extend'; });
    var ext = papers.filter(function (p) { return p.tier === 'extend'; });
    var prereq = core.filter(function (p) { return p.tier === 'prereq'; });
    var main = core.filter(function (p) { return p.tier !== 'prereq'; });
    var level = isCommon ? 'common' : tid;
    var title = isCommon ? t.name : String(t.name).replace(/^方向 [A-F] · /, '');
    var lede = isCommon ? (t.note || '') : (t.pitch || '');

    var html = '<div class="page">' +
      l2Head('reading', isCommon ? '公共必读' : '方向 ' + tid + ' · ' + (trackShort[tid] || tid), title, lede, '#reading', '阅读与 90 天启动');

    if (!isCommon) html += '<div class="track-fit"><b>和谁配合</b>' + escapeHtml(t.fit || '') + '</div>';

    html += section(isCommon ? '公共必读路线' : '阶段路线') +
      (isCommon ? commonStageFlow() : '<div class="stage-flow">' + arr(t.stages).map(function (s, i) {
        return '<div class="stage"><span class="s-no">' + (i + 1) + '</span><div class="stage-body"><b>' + escapeHtml(s.k) + '</b><p>' + escapeHtml(s.v) + '</p></div></div>';
      }).join('') + '</div>');

    if (prereq.length) {
      html += section('方向前置 · 只有走这条方向才要求') +
        '<div class="card lp-list">' + l2PaperRows(prereq, level) + '</div>';
    }

    if (isCommon) {
      var groups = [
        { label: '把语言立起来 · 第 1—4 篇', from: 1, to: 4 },
        { label: '记忆系统的参照对象和 baseline · 第 5—9 篇', from: 5, to: 9 },
        { label: '评测与批评的方法 · 第 10—13 篇', from: 10, to: 13 }
      ];
      html += section('公共必读（' + core.length + ' 篇 · 分三段）');
      groups.forEach(function (g) {
        var rows = core.filter(function (p) { return (p.n || 0) >= g.from && (p.n || 0) <= g.to; });
        html += '<h4 class="sub">' + escapeHtml(g.label) + '</h4><div class="card lp-list">' + l2PaperRows(rows, 'common', { cont: g.from - 1 }) + '</div>';
      });
      html += '<p class="mono-sm">每篇怎么读、读完问自己什么，都写在各自的阅读卡里；点上面的论文行就能进入。</p>';
    } else {
      html += section('方向必读（主路径 ' + main.length + ' 篇）') +
        '<div class="card lp-list">' + l2PaperRows(main, level) + '</div>';
    }

    if (!isCommon) {
      html += section('实践用的代码和数据') + '<div class="grid c2">' +
        '<div class="card"><strong>代码仓库</strong>' + list(arr(t.repos).map(function (r) { return r.r + '：' + r.note; })) + '</div>' +
        '<div class="card"><strong>数据集</strong>' + list(arr(t.datasets).map(function (d) { return d.n + '：' + d.d; })) + '</div></div>';
    }

    html += section('放进 90 天计划的位置');
    if (isCommon) html += '<p class="muted">公共必读集中在第 1—4 周（Phase 1）：</p><div class="ws-group"><span class="ws-label">Phase 1</span>' + weekChips(1, 4) + '</div>';
    else if (tid === 'A') html += '<p class="muted">这条方向的主路径在第 5—12 周展开（Phase 2—3）：</p><div class="ws-group"><span class="ws-label">Phase 2—3</span>' + weekChips(5, 12) + '</div>';
    else html += callout('换方向怎么办', rich(RESEARCH.plan90Switch), 'warn');

    var skillIds = READING_SKILL_MAP[tid] || [];
    if (skillIds.length) html += section('对应的技能路线') + '<div class="filters">' + skillChips(skillIds) + '</div>';

    if (ext.length) {
      html += details('延伸阅读（' + ext.length + ' 篇 · 不在 90 天计划里）',
        '<div class="card lp-list">' + l2PaperRows(ext, level, { checkable: false }) + '</div>', false, '', true);
    }

    if (!isCommon && t.note) html += callout('这一条方向的使用提示', escapeHtml(t.note), '');

    return html + '</div>';
  }

  function renderPlan90(now) {
    // 12 周按 Phase 分三组折叠；默认展开当前周所在 Phase（入学前 → Phase 1，过执行期 → Phase 3）
    var phaseNames = { 1: '公共必读、Atlas 复现、综述初稿', 2: '标注协议、基准设计、检测器 v1', 3: '消融、复现包、投稿材料' };
    var w = plan90Week(now);
    var activePh = (w >= 1 && w <= 12) ? RESEARCH.plan90[w - 1].ph : (w > 12 ? 3 : 1);
    return [1, 2, 3].map(function (ph) {
      var weeks = RESEARCH.plan90.filter(function (item) { return item.ph === ph; });
      if (!weeks.length) return '';
      return details('Phase ' + ph + ' · ' + weeks[0].w + '—' + weeks[weeks.length - 1].w + ' · ' + phaseNames[ph],
        '<div class="timeline">' + weeks.map(plan90Item).join('') + '</div>', ph === activePh);
    }).join('');
  }

  function plan90Item(item) {
    var checkId = 'week-' + item.w;
    return '<article class="tl-item' + (item.mile ? ' milestone' : '') + '" id="week-item-' + escapeHtml(item.w) + '"><div class="tl-when">' + escapeHtml(item.w) + ' · Phase ' + escapeHtml(item.ph) + '</div>' +
      '<div class="tl-what">' + linkAx(item.out) + '</div><div class="tl-desc"><b>读：</b>' + linkAx(item.read) + '<br><b>做：</b>' + linkAx(item.run) +
      '<br><b>卡住：</b>' + linkAx(item.stuck) + '</div>' + (item.mile ? '<div class="tl-check"><b>里程碑：</b>' + linkAx(item.mile) + '</div>' : '') +
      '<label class="mini-check"><input type="checkbox" data-check-id="' + checkId + '"' + (state.checks.has(checkId) ? ' checked' : '') + '> 这周验收完成</label></article>';
  }

  function renderTools() {
    return '<div class="page">' + pageHead('tools', 'Quick reference only') +
      callout('这一页是什么', rich(TOOLS.disclaimer), 'warn') +
      section('常用工具') + table(['工具', '用来干什么', '入口'], TOOLS.core.map(function (tool) {
        return ['<strong>' + escapeHtml(tool.n) + '</strong>', escapeHtml(tool.use), escapeHtml(tool.ref || '—')];
      })) +
      section('方法论在 grad-companion 插件里') +
      callout(escapeHtml(TOOLS.companion.name), '<b>对应 skill：</b><code>' + escapeHtml(TOOLS.companion.playbook) + '</code><br>' + rich(TOOLS.companion.note), 'good') +
      '<p class="mono-sm"><p class="mono-sm">完整的读法（三遍读法、可复现检查表、投稿清单等）在插件自己的文档里，本站不再抄一份维护。每个月的例行检查挪到了「待核验清单」页底部。</p></p></div>';
  }

  function renderJobs() {
    var teams = JOBS.teams.filter(function (job) {
      return (state.jobCity === 'all' || job.cities.indexOf(state.jobCity) >= 0) &&
        (state.jobTier === 'all' || job.targetTier === state.jobTier) &&
        (state.jobStage === 'all' || job.careerStages.indexOf(state.jobStage) >= 0) &&
        (state.jobFamily === 'all' || job.roleFamily === state.jobFamily) &&
        (state.jobEvidence === 'all' || job.evidenceLevel === state.jobEvidence);
    });
    // 筛选项一律从数据派生，避免出现按钮存在但数据无此值的“死选项”
    var cityOptions = uniqueBy(JOBS.teams, function (job) { return job.cities; })
      .map(function (v) { return [v, v]; });
    var familyOptions = uniqueBy(JOBS.teams, function (job) { return job.roleFamily; })
      .map(function (v) { return [v, familyLabels[v] || v]; });
    var tierOptions = uniqueBy(JOBS.teams, function (job) { return job.targetTier; })
      .map(function (v) { return [v, tierLabels[v] || v]; });
    var stageOptions = uniqueBy(JOBS.teams, function (job) { return job.careerStages; })
      .map(function (v) { return [v, stageLabels[v] || v]; });
    var evidenceOptions = uniqueBy(JOBS.teams, function (job) { return job.evidenceLevel; })
      .map(function (v) { return [v, (evidenceLabels[v] || [v])[0]]; });
    // 技术岗数字从数据读取，不再在渲染层硬编码 747 / 58.0%
    var techPost = arr(JOBS.stats.postType).filter(function (i) { return i.id === 'tech'; })[0];
    return '<div class="page">' + pageHead('jobs', 'City first, then role') +
      pageSummary(JOBS.summary) +
      (JOBS.pageNote ? callout('这一页先看什么', rich(JOBS.pageNote), 'warn') : '') +
      anchorNav([['city-policy', '城市限制'], ['ladder', '实习阶梯'], ['job-samples', '岗位样本'], ['snapshot', '数据说明']]) +
      section('先看城市，再看岗位', 'city-policy') +
      renderCityPolicy() +
      section('实习四级阶梯', 'ladder') + '<div class="timeline">' + JOBS.internshipLadder.map(function (step) {
        var isCurrent = step.id === currentLadderId();
        var mark = isCurrent
          ? (currentPhase(new Date()).phase.id === 'pre' ? badge('下一步', 'b-acc') : badge('当前阶段', 'b-acc'))
          : '';
        return '<article class="tl-item milestone' + (isCurrent ? ' current' : '') + '"><div class="tl-when">STEP ' + escapeHtml(step.step) + ' · ' + escapeHtml(step.when) + mark + '</div><div class="tl-what">' + escapeHtml(step.title) +
          '</div><div class="tl-desc">' + list(step.actions) + '</div><div class="tl-check"><b>验收：</b>' + escapeHtml(step.acceptance) + '</div></article>';
      }).join('') + '</div>' +
      section('岗位类型：主攻哪些，放弃哪些') + '<div class="grid c3">' + JOBS.roleFamilies.map(function (role) {
        var cls = role.tier === 'primary' ? 'b-high' : role.tier === 'secondary' ? 'b-acc' : role.tier === 'avoid' ? 'b-low' : 'b-mid';
        return '<article class="card"><div class="card-head"><strong>' + escapeHtml(role.name) + '</strong>' + badge(tierLabels[role.tier] || role.tier, cls) + '</div><p>' + escapeHtml(role.scope) +
          '</p><div class="mono-sm">' + escapeHtml(role.reason) + '</div>' + claimBadge(role.claimType) + '</article>';
      }).join('') + '</div>' +
      section('代表团队与岗位样本', 'job-samples') + '<div class="filters filter-stack">' +
      filterGroup('城市', 'jobCity', [['all', '全部']].concat(cityOptions), state.jobCity) +
      filterGroup('层级', 'jobTier', [['all', '全部']].concat(tierOptions), state.jobTier) +
      filterGroup('阶段', 'jobStage', [['all', '全部']].concat(stageOptions), state.jobStage) +
      filterGroup('岗位族', 'jobFamily', [['all', '全部']].concat(familyOptions), state.jobFamily) +
      filterGroup('证据', 'jobEvidence', [['all', '全部']].concat(evidenceOptions), state.jobEvidence) + '</div>' +
      '<div class="result-count">显示 ' + teams.length + ' / ' + JOBS.teams.length + ' 个人工整理的样本</div><div class="grid c2">' +
      (teams.length ? teams.map(renderJobCard).join('') : '<div class="empty card">没有符合筛选条件的岗位样本</div>') + '</div>' +
      section('招聘时间线') + renderCareerTimeline(JOBS.timeline) +
      section('这份快照能说明什么、不能说明什么', 'snapshot') +
      callout(JOBS.meta.title, '<strong>按 postId 去重后 ' + JOBS.meta.denominator + ' 条</strong> · ' + escapeHtml(JOBS.meta.sampleScope) + '<br>' + escapeHtml(JOBS.meta.warning), 'warn') +
      '<div class="grid c4">' + JOBS.stats.recruitment.map(function (item) {
        return stat(item.count, item.label, item.pct + '% of snapshot', item.id === 'dailyIntern' ? 'good' : '');
      }).join('') + stat(techPost ? techPost.count : '—', '技术岗', (techPost ? techPost.pct + '%' : '') + '，不是应届可投数', 'warn') + '</div>' +
      details('城市分布与可投范围', renderCityDistribution(), false, badge('按记录计数', 'b-dim'), true) +
      details('抓取范围与字段质量', '<div class="grid c2"><div>' + table(['岗位类型', '记录数', '占比'], JOBS.stats.postType.map(function (i) { return [text(i.label), text(i.count), text(i.pct + '%')]; })) +
        '</div><div>' + table(['字段质量', '数值', '解释'], JOBS.stats.quality.map(function (i) { return [text(i.label), text(i.value), text(i.note)]; })) + '</div></div>', false, '', true) +
      section('数字不能怎么用') + details('数据口径风险和求职判断风险', '<div class="grid c2">' + Object.keys(JOBS.risks).map(function (group) {
        var title = group === 'data' ? '数据口径风险' : '生涯判断风险';
        return '<div class="card"><div class="card-head"><strong>' + title + '</strong>' + claimBadge('inference') + '</div>' + list(JOBS.risks[group]) + '</div>';
      }).join('') + '</div>', false, '', true) + '</div>';
  }

  // 地域策略：按阶段分组 + 偏好序号，让「先城市后岗位」在视觉上就是第一层。
  // 2026-08 政策修订：北京从「排除」改为「中转」，excluded 卡片被 transit 卡片取代。
  function renderCityPolicy() {
    var policy = JOBS.cityPolicy;
    var byCity = {};
    arr(JOBS.regions).forEach(function (region) { byCity[region.city] = region; });

    var phases = arr(policy.phases).map(function (phase) {
      var cities = arr(phase.cities).slice().sort(function (a, b) { return a.rank - b.rank; });
      return '<article class="phase-card"><div class="phase-head"><div><strong>' + escapeHtml(phase.label) +
        '</strong><div class="mono-sm">' + escapeHtml(phase.window) + '</div></div>' + badge(cities.length + ' 个城市', 'b-acc') +
        '</div><p class="phase-rule">' + escapeHtml(phase.rule) + '</p><ol class="city-rank">' +
        cities.map(function (city) {
          var region = byCity[city.name];
          return '<li class="city-rank-item"><span class="rank">' + city.rank + '</span><div class="city-body"><div class="city-line"><b>' +
            escapeHtml(city.name) + '</b>' + badge(city.role, city.rank === 1 ? 'b-high' : 'b-dim') +
            (region && region.sample ? '<span class="city-sample">' + escapeHtml(region.sample) + '</span>' : '') +
            '</div><p>' + escapeHtml(city.why) + '</p></div></li>';
        }).join('') + '</ol></article>';
    }).join('');

    var transit = policy.transit ? '<article class="phase-card transit"><div class="phase-head"><div><strong>中转可接受 · ' +
      arr(policy.transit.cities).map(escapeHtml).join('、') + '</strong><div class="mono-sm">中转，不是终点</div></div>' +
      badge('待 1—2 年的跳板', 'b-mid') + '</div><p class="phase-rule">' + escapeHtml(policy.transit.rule) +
      '</p><p class="muted">' + escapeHtml(policy.transit.use) + '</p><p class="muted">' + escapeHtml(policy.transit.limit) + '</p></article>' : '';

    return callout(policy.headline, rich(policy.tension), 'good') +
      '<div class="phase-grid">' + phases + transit + '</div>' +
      details('各城市策略与风险明细', '<div class="grid c2">' + arr(JOBS.regions).slice().sort(function (a, b) {
        return (a.rank || 99) - (b.rank || 99);
      }).map(function (region) {
        var isTransit = policy.transit && policy.transit.cities.indexOf(region.city) >= 0;
        var cls = isTransit ? ' region-transit' : '';
        return '<div class="card region-card' + cls + '"><div class="card-head"><strong>' + escapeHtml(region.city) + '</strong>' +
          badge(region.role, isTransit ? 'b-mid' : 'b-info') + '</div>' +
          (region.sample ? '<div class="mono-sm">' + escapeHtml(region.sample) + '</div>' : '') +
          '<p>' + safeRich(region.strategy) + '</p><div class="region-risk"><b>风险</b> ' + safeRich(region.risk) + '</div></div>';
      }).join('') + '</div>', false, '', true);
  }

  // 城市分布：按 fit 分组呈现。北京作为「中转」单独一组降饱和显示，
  // 既不再冒充「排除」，也不让 84.2% 的长条主导视觉。
  function renderCityDistribution() {
    var cities = arr(JOBS.stats.cities);
    var groups = [
      { fit: 'target', title: '意向城市', cls: 'grp-target', note: '这些才是你会直接投递的城市' },
      { fit: 'transit', title: '中转城市', cls: 'grp-transit', note: '毕业后可接受 1—2 年，不作长期驻地' },
      { fit: 'other', title: '其他城市', cls: 'grp-other', note: '与你的地域约束无关' }
    ];
    var chart = groups.map(function (group) {
      var rows = cities.filter(function (city) { return city.fit === group.fit; });
      if (!rows.length) return '';
      return '<div class="city-group ' + group.cls + '"><div class="city-group-head"><b>' + escapeHtml(group.title) +
        '</b><span>' + escapeHtml(group.note) + '</span></div>' + rows.map(function (city) {
          return '<div class="bar-row"><span>' + escapeHtml(city.city) + '</span><div class="bar"><i style="width:' +
            (Number(city.pct) || 0) + '%"></i></div><b>' + escapeHtml(city.count) + '</b><small>' +
            (city.tech == null ? '技术岗 —' : '技术岗 ' + escapeHtml(city.tech)) + '</small></div>';
        }).join('') + '</div>';
    }).join('');

    return '<div class="bar-chart">' + chart + '</div>' +
      '<div class="grid c3">' + arr(JOBS.stats.cityReach).map(function (item) {
        return stat(item.value, item.label, item.note, item.label.indexOf('意向') >= 0 ? 'good' : '');
      }).join('') + '</div>' +
      callout('这张图怎么读', rich(JOBS.stats.cityNote), 'warn');
  }

  function renderJobCard(job) {
    return '<article class="job tier-' + escapeHtml(job.tier) + '"><div class="jh"><div class="jt">' + escapeHtml(job.company + ' · ' + job.name) + '</div>' + badge(job.tier, job.tier === 'S' ? 'b-pur' : 'b-acc') +
      '</div><div class="jm">' + job.cities.map(function (v) { return badge(v, 'b-dim'); }).join('') + badge(familyLabels[job.roleFamily] || job.roleFamily, 'b-info') +
      badge(tierLabels[job.targetTier] || job.targetTier, 'b-acc') + '</div>' + tags(job.tags) + '<div class="jq">' + safeRich(job.summary) + '</div><div class="jw">' +
      escapeHtml(job.opening) + ' · 抓取自 ' + escapeHtml(job.sourceAsOf) + '</div><div class="evidence-row">' + claimBadge(job.claimType) + evidenceBadge(job.evidenceLevel) + '</div></article>';
  }

  function renderCareerTimeline(items) {
    return '<div class="timeline">' + items.map(function (item) {
      // type 直接透传：plan 显示「计划」，forecast 显示「预测」，不再把 plan 误标为策略判断
      return '<article class="tl-item' + (item.type === 'forecast' ? ' soft' : ' milestone') + '"><div class="tl-when">' + escapeHtml(item.when) + '</div><div class="tl-what">' +
        escapeHtml(item.title) + ' ' + claimBadge(item.type || 'plan') + '</div><div class="tl-desc">' + escapeHtml(item.detail) + '</div></article>';
    }).join('') + '</div>';
  }

  // ── 技能 L1：目录。学习参考与交付细节下沉到 L2（学习层目录化，规则并入 MAINTENANCE §2） ──
  function renderSkills() {
    var priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
    var signals = SKILLS.signals.filter(function (skill) {
      return (state.skillPriority === 'all' || skill.priority === state.skillPriority) && (state.skillDomain === 'all' || skill.domain === state.skillDomain);
    });
    var roadmap = SKILLS.roadmap.slice().sort(function (a, b) {
      return (priorityOrder[a.priority] != null ? priorityOrder[a.priority] : 9) - (priorityOrder[b.priority] != null ? priorityOrder[b.priority] : 9);
    }).filter(function (skill) {
      return (state.skillPriority === 'all' || skill.priority === state.skillPriority) && (state.skillDomain === 'all' || skill.domain === state.skillDomain);
    });
    var domains = Array.from(new Set(SKILLS.roadmap.concat(SKILLS.signals).map(function (s) { return s.domain; })));
    return '<div class="page">' + pageHead('skills', 'Market signal → proof of skill') +
      pageSummary(SKILLS.summary) +
      callout('两边的百分比不能合并', '<b>百度：</b>' + SKILLS.meta.baidu.denominator + ' 个技术岗，描述里既有职责也有要求。<br><b>腾讯：</b>' + SKILLS.meta.tencent.denominator + ' 个技术岗，只有工作内容一栏，算出来的命中率只能当最低值。<br>' + escapeHtml(SKILLS.meta.warning), 'warn') +
      callout('这一页是目录', '每张卡是一条路线的入口，点进去才有学习步骤、论文衔接和面试对照。P0 排在最上面：先只挑一条属于当前阶段的进入。', 'good') +
      '<div class="filters filter-stack">' + filterGroup('优先级', 'skillPriority', [['all', '全部'], ['P0', 'P0'], ['P1', 'P1'], ['P2', 'P2'], ['P3', 'P3']], state.skillPriority) +
      filterGroup('能力域', 'skillDomain', [['all', '全部']].concat(domains.map(function (d) { return [d, domainLabels[d] || d]; })), state.skillDomain) + '</div>' +
      section('学习路线（共 ' + roadmap.length + ' 条）') + '<div class="grid c2">' + roadmap.map(function (skill) {
        return '<div class="card cat-card" data-goto="skills/' + escapeHtml(skill.id) + '">' +
          '<div class="card-head"><strong><a href="#skills/' + escapeHtml(skill.id) + '">' + escapeHtml(skill.name) + '</a></strong>' + badge(skill.priority, skill.priority === 'P0' ? 'b-high' : skill.priority === 'P1' ? 'b-acc' : 'b-dim') + '</div>' +
          '<div class="cat-meta"><span>截止 ' + escapeHtml(skill.deadline) + '</span><span>' + escapeHtml(domainLabels[skill.domain] || skill.domain) + '</span></div>' +
          '<p class="cat-pitch">' + escapeHtml(skill.target) + '</p>' +
          '<label class="mini-check"><input type="checkbox" data-check-id="' +
          escapeHtml(skill.id) + '"' + (state.checks.has(skill.id) ? ' checked' : '') + '> 标记完成</label></div>';
      }).join('') + '</div>' +
      details('市场信号矩阵（' + signals.length + ' / ' + SKILLS.signals.length + ' 项 · 来自调研数据）', '<div class="result-count">显示 ' + signals.length + ' / ' + SKILLS.signals.length + ' 项</div>' +
      table(['技能', '领域', '百度 ' + SKILLS.meta.baidu.denominator + ' 条中', '腾讯 ' + SKILLS.meta.tencent.denominator + ' 条中', '优先级', '判断'], signals.map(function (skill) {
        return ['<strong>' + escapeHtml(skill.name) + '</strong>', text(domainLabels[skill.domain] || skill.domain), skill.baidu == null ? '—' : '<div class="bar-cell"><div class="bar"><i style="width:' + skill.baidu + '%"></i></div><span>' + skill.baidu + '%</span></div>',
          skill.tencent == null ? '—' : '<div class="bar-cell"><div class="bar"><i class="cold" style="width:' + skill.tencent + '%"></i></div><span>' + skill.tencent + '%</span></div>', badge(skill.priority, skill.priority === 'P0' ? 'b-high' : skill.priority === 'P1' ? 'b-acc' : 'b-dim'), text(skill.judgement)];
      })) + callout('这些百分比怎么读', 'JD 里出现某个词的比例，不等于这个岗位硬性要求这项技能的比例，也说明不了竞争者多少。<b>GraphRAG 两边都是零命中，只说明它不适合当简历标签，不代表图记忆技术没有价值。</b>', ''), false, '', true) +
      details('面试的四条能力线（按 2028 年准备）', '<div class="grid c2">' + SKILLS.interviewTracks.map(function (track) {
        return '<div class="card"><div class="card-head"><strong>' + escapeHtml(track.name) + '</strong>' + badge(track.target, 'b-info') + '</div>' + list(track.items) + '</div>';
      }).join('') + '</div>', false, '', true) + '</div>';
  }

  // ── 技能 L2：单条学习路线，八块骨架（规则并入 MAINTENANCE §2） ──
  function renderSkillL2(sid) {
    var s = skillById(sid);
    if (!s) return '';
    var sigId = SKILL_SIGNAL_MAP[sid] || null;
    var signal = sigId ? SKILLS.signals.filter(function (x) { return x.id === sigId; })[0] : null;
    var refs = arr(s.refs);
    var mainRefs = refs.filter(function (r) { return r.tier !== 'extend'; });
    var extRefs = refs.filter(function (r) { return r.tier === 'extend'; });
    var interviewId = SKILL_INTERVIEW_MAP[sid] || null;
    var track = interviewId ? SKILLS.interviewTracks.filter(function (x) { return x.id === interviewId; })[0] : null;
    var trackIds = SKILL_TRACK_MAP[sid] || [];

    var whyBlock;
    if (signal) {
      whyBlock = '<section class="page-summary"><div class="ps-head">为什么这项要现在学</div><p>' + escapeHtml(signal.judgement) + '</p>' +
        '<p class="mono-sm">命中：百度 ' + (signal.baidu == null ? '—' : signal.baidu + '%') + ' · 腾讯 ' +
        (signal.tencent == null ? '—' : signal.tencent + '%') + '（关键词文本命中率，非硬性要求率；快照 2026-07-28）</p></section>';
    } else {
      whyBlock = '<section class="page-summary"><div class="ps-head">为什么这项要现在学</div><p>' +
        escapeHtml(SKILL_SIGNAL_FALLBACK[sid] || '按这条路线自己的计划推进。') + '</p></section>';
    }

    var trackChips = trackIds.map(function (tid) {
      return '<a class="chip" href="#reading/' + tid + '">' + escapeHtml(tid === 'common' ? '公共必读' : tid + ' · ' + (trackShort[tid] || tid)) + '</a>';
    }).join('');

    return '<div class="page">' +
      l2Head('skills', '技能 · ' + s.priority, s.name, s.target, '#skills', '技能矩阵') +
      whyBlock +
      '<div class="card">' + kv([['学到什么程度', s.target], ['什么时候完成', s.deadline], ['拿什么证明', s.deliverable]]) + '</div>' +
      section('学习步骤') + (mainRefs.length
        ? '<ol class="step-list">' + mainRefs.map(function (r, i) { return stepItem(r, i + 1, false); }).join('') + '</ol>'
        : '<p class="muted">这条路线还没拆成步骤，按目标和交付物自己安排。</p>') +
      (extRefs.length ? details('延伸资料（' + extRefs.length + ' 项 · 不在这条路线的必读范围）',
        '<ul class="ref-list">' + extRefs.map(function (r) { return stepItem(r, 0, true); }).join('') + '</ul>', false, '', true) : '') +
      section('怎么验收') + '<div class="card"><div class="card-head"><strong>交付证据</strong></div><p>' + escapeHtml(s.deliverable) + '</p>' +
      '<p class="muted">这些证据记在已有资产里（<a href="#portfolio">作品集</a> · <a href="#reading">90 天计划</a>），这一页不另造一套数字。</p>' +
      (s.note ? '<div class="callout warn" style="margin-bottom:0"><span class="t">范围限制</span>' + escapeHtml(s.note) + '</div>' : '') + '</div>' +
      (trackIds.length ? section('和论文方向的对应') + '<div class="filters">' + trackChips + '</div>' : '') +
      (track ? section('面试里怎么问') + '<div class="card"><div class="card-head"><strong>' + escapeHtml(track.name) + '</strong>' + badge(track.target, 'b-info') + '</div>' + list(track.items) + '</div>' : '') +
      '<label class="mini-check"><input type="checkbox" data-check-id="' + escapeHtml(s.id) + '"' + (state.checks.has(s.id) ? ' checked' : '') + '> 这条路线完成了</label>' +
      '</div>';
  }

  function renderPortfolio() {
    return '<div class="page">' + pageHead('portfolio', 'Measured engineering evidence') +
      callout('作品集的硬性标准', '两个做得深的项目，胜过四个做得浅的。每个项目必须有：解决的问题、架构、取舍、失败复盘、可复跑的 benchmark，以及 QPS、成功率、P99、单位成本四个<b>实测</b>数字。', 'good') +
      '<div class="grid c3">' + PORTFOLIO.principles.map(function (p) { return '<div class="card"><strong>' + escapeHtml(p.title) + '</strong><p>' + escapeHtml(p.detail) + '</p></div>'; }).join('') + '</div>' +
      PORTFOLIO.projects.map(function (project, projectIndex) {
        return section((projectIndex + 1) + ' · ' + project.name) + '<article class="project card pad-lg"><div class="project-head"><div><span class="badge b-info">' + escapeHtml(project.status) + '</span><h3>' + escapeHtml(project.name) +
          '</h3><p>' + escapeHtml(project.problem) + '</p></div>' + claimBadge(project.claimType) + '</div><div class="grid c2"><div><h4 class="sub">架构</h4>' + list(project.architecture) + '</div><div><h4 class="sub">当时的取舍</h4>' + list(project.tradeoffs) + '</div></div>' +
          '<h4 class="sub">四项核心指标</h4><div class="grid c4">' + project.metrics.map(function (metric) {
            var note = metric.value == null ? '这是目标，不是成果' : (metric.status === 'preliminary' ? '只测过一次（n=1），待补重复实验' : '已实测');
            var cls = metric.value == null ? 'warn' : (metric.status === 'preliminary' ? '' : 'good');
            return stat(metric.value == null ? '待实测' : metric.value, metric.label, note, cls);
          }).join('') + '</div><h4 class="sub">接下来的里程碑</h4><div class="timeline">' + project.milestones.map(function (mile) {
            return '<article class="tl-item milestone"><div class="tl-when">' + escapeHtml(mile.stage) + '</div><div class="tl-what">' + escapeHtml(mile.title) + '</div><div class="tl-desc">' + list(mile.tasks) +
              '</div><div class="tl-check"><b>验收：</b>' + escapeHtml(mile.acceptance) + '</div><label class="mini-check"><input type="checkbox" data-check-id="' + escapeHtml(mile.id) + '"' + (state.checks.has(mile.id) ? ' checked' : '') + '> 里程碑完成</label></article>';
          }).join('') + '</div><div class="grid c2"><div><h4 class="sub">可查证的产出</h4>' + list(project.artifacts) + '</div><div><h4 class="sub">对得上哪些岗位</h4>' + tags(project.relatedRoles) + tags(project.relatedTeams) + '</div></div></article>';
      }).join('') +
      section('怎么讲一个选错技术的故事') + '<div class="story-flow">' + PORTFOLIO.storyTemplate.map(function (step, index) {
        return '<div class="story-step"><span>' + (index + 1) + '</span><strong>' + escapeHtml(step.step) + '</strong><p>' + escapeHtml(step.prompt) + '</p></div>';
      }).join('') + '</div></div>';
  }

  function renderCareer() {
    return '<div class="page">' + pageHead('career', 'Direction reference only') +
      callout('这一页怎么用', '正式求职在 2028 年秋，距今还有两年多，到时候市场、JD 和公司策略大概率都变了。所以这一页只写<b>两年后仍然成立的判断</b>：定位、叙事骨架、投递优先级。具体信息到 2027 年 12 月要按当年情况<b>整页重做</b>，不要直接沿用。眼下能执行的只有「实习与岗位」页的实习阶梯。', 'warn') +
      section('一句话，我是谁') + '<blockquote><p>' + escapeHtml(PORTFOLIO.narratives.positioning) + '</p></blockquote>' +
      '<div class="grid c2"><div class="card"><strong>为什么还要读研</strong><p>' + escapeHtml(PORTFOLIO.narratives.whyGraduate) + '</p></div><div class="card"><strong>论文和岗位怎么接上</strong><p>' + escapeHtml(PORTFOLIO.narratives.thesisToJob) + '</p></div></div>' +
      callout('不要自称 GraphRAG 专家', escapeHtml(PORTFOLIO.narratives.notGraphRag) + tags(PORTFOLIO.narratives.labels), 'warn') +
      section('投递优先级（只是方向参考）') + '<div class="grid c3">' + PORTFOLIO.applicationPriority.map(function (item) {
        return '<div class="job tier-' + escapeHtml(item.tier) + '"><div class="jh"><div class="jt">Tier ' + escapeHtml(item.tier) + '</div></div>' + tags(item.targets) + '<div class="jq">' + escapeHtml(item.reason) + '</div></div>';
      }).join('') + '</div>' +
      section('面试开场怎么讲（骨架，细节到 2028 再填）') + '<div class="story-flow">' + [
        ['生产背景', '我做过 Python 后端和 AI 应用开发，知道线上系统要考虑什么。'], ['真实问题', '多模型流水线里反复出现「假成功」：宣称完成但证据不成立，这不是 prompt 能打补丁解决的。'],
        ['研究动作', '我把「成功」拆成声明、证据、状态三层分别验证，做分类、基准和检测器，再扩展到记忆后端的成本、精度、延迟评测。'], ['工程证据', 'Atlas（假成功检测、哈希断言、JSONL 台账）和 AgentParliament（三级权限交叉审查）是能直接重跑的测量设施。'],
        ['岗位匹配', '所以我适合 Agent Runtime、Harness、评测、可观测和知识工程这几类团队。']
      ].map(function (s, i) { return '<div class="story-step"><span>' + (i + 1) + '</span><strong>' + s[0] + '</strong><p>' + s[1] + '</p></div>'; }).join('') + '</div>' +
      '<p class="mono-sm">简历要点模板在 data/portfolio.js（resumeBullets），测出真实数字前不启用。2027.12 重做这一页时一起更新。</p></div>';
  }

  function renderVerify() {
    // 渲染按影响排序（critical → high → medium），数据顺序不动
    var impactOrder = { critical: 0, high: 1, medium: 2 };
    var items = JOBS.verification.slice().sort(function (a, b) {
      return (impactOrder[a.impact] != null ? impactOrder[a.impact] : 9) - (impactOrder[b.impact] != null ? impactOrder[b.impact] : 9);
    }).filter(function (item) {
      var handled = state.checks.has(item.id);
      var statusOk = state.verifyStatus === 'all' ||
        (state.verifyStatus === 'done' ? handled : !handled);
      return (state.verifyImpact === 'all' || item.impact === state.verifyImpact) && statusOk;
    });
    return '<div class="page">' + pageHead('verify', 'Uncertainty register') +
      pageSummary(JOBS.verifySummary) +
      callout('为什么是这些排最前', '先处理那些会改变结果的问题：能不能毕业、能不能外出实习、有没有算力。影响小的先不看，别让它占注意力。勾选状态自动保存在本机。', 'warn') +
      '<div class="filters filter-stack">' + filterGroup('影响', 'verifyImpact', [['all', '全部'], ['critical', '关键'], ['high', '高'], ['medium', '中']], state.verifyImpact) +
      filterGroup('本次会话', 'verifyStatus', [['all', '全部'], ['open', '未处理'], ['done', '已标记']], state.verifyStatus) + '</div>' +
      '<div class="result-count">显示 ' + items.length + ' / ' + JOBS.verification.length + ' 项</div><div class="verification-list">' + items.map(function (item) {
        var checked = state.checks.has(item.id);
        return '<article class="card verify-card ' + (checked ? 'done' : '') + '"><div class="card-head"><div><span class="mono-sm">' + escapeHtml(item.area) + '</span><h3>' + escapeHtml(item.title) +
          '</h3></div><div>' + badge(item.impact, item.impact === 'critical' ? 'b-low' : item.impact === 'high' ? 'b-mid' : 'b-dim') + ' ' + evidenceBadge(item.evidence) + '</div></div><p><b>怎么核：</b>' + escapeHtml(item.action) +
          '</p><label class="mini-check"><input type="checkbox" data-check-id="' + escapeHtml(item.id) + '"' + (checked ? ' checked' : '') + '> 我处理过了</label></article>';
      }).join('') + '</div>' +
      section('每月例行检查') + checkList('monthly', TOOLS.monthly.t, TOOLS.monthly.items.map(function (item, i) { return { id: 'monthly-' + i, text: item }; }), '建议在日历里设成每月重复的任务。') + '</div>';
  }

  var renderers = {
    dashboard: renderDashboard, baseline: renderBaseline, research: renderResearch, reading: renderReading,
    tools: renderTools, jobs: renderJobs, skills: renderSkills, portfolio: renderPortfolio,
    career: renderCareer, verify: renderVerify
  };

  function currentRoute() {
    var route = location.hash.replace(/^#/, '').split('/')[0];
    return renderers[route] ? route : 'dashboard';
  }

  // 学习层多级路由：hash 第二段（#reading/A、#skills/<id>），非法值由调用方回退 L1
  function currentSubRoute() {
    var parts = location.hash.replace(/^#/, '').split('/');
    return parts.length > 1 ? parts[1] : '';
  }

  // hash 第三段（#reading/<level>/<ax>）→ L3 阅读卡；合法性由调用方对照该层级清单校验
  function currentPaperRoute() {
    var parts = location.hash.replace(/^#/, '').split('/');
    return parts.length > 2 ? parts[2] : '';
  }

  function render(keepScroll) {
    var route = currentRoute();
    var sub = currentSubRoute();
    var paper = currentPaperRoute();
    var offset = keepScroll ? window.pageYOffset : 0;
    // 勾选/筛选会整体重渲染：先记住焦点所在的勾选框，渲染后归位（滚动位置之外，焦点也属于会话连续性）
    var focusId = null;
    if (keepScroll && document.activeElement && document.activeElement.getAttribute) {
      focusId = document.activeElement.getAttribute('data-check-id');
    }
    try {
      var html;
      if (route === 'reading' && READING_L2[sub]) {
        // 第三段命中该层级清单才进 L3 阅读卡；非法第三段回退 L2（PAPER-DEEP-READ-DESIGN.md §3）
        if (paper && window.L3 && window.L3.hasPaper(sub, paper)) {
          state.track = sub; storeSet(STORE.track, sub);
          html = window.L3.render(sub, paper, { checks: state.checks });
        } else html = renderReadingL2(sub);
      }
      else if (route === 'skills' && skillById(sub)) html = renderSkillL2(sub);
      else html = renderers[route]();
      app.innerHTML = html;
    } catch (error) {
      // 渲染失败时显示原因，避免整页空白让人无法判断问题
      app.innerHTML = '<div class="page"><div class="callout bad"><span class="t">页面渲染失败：' +
        escapeHtml(route) + '</span><p>' + escapeHtml(error && error.message ? error.message : String(error)) +
        '</p><p>请确认 data 目录下的数据文件与 assets/l3.js 均已随 index.html 一起打开。</p></div></div>';
    }
    document.querySelectorAll('.nav-item').forEach(function (item) {
      var active = item.getAttribute('data-route') === route;
      item.classList.toggle('active', active);
      if (active) item.setAttribute('aria-current', 'page'); else item.removeAttribute('aria-current');
    });
    updatePhaseChip();
    buildPageToc();
    bindPageEvents();
    if (focusId) {
      var focusEl = app.querySelector('input[data-check-id="' + focusId + '"]');
      if (focusEl) { try { focusEl.focus({ preventScroll: true }); } catch (e) { focusEl.focus(); } }
    }
    window.scrollTo(0, offset);
    if (pendingAnchor) {
      var anchorEl = document.getElementById(pendingAnchor);
      pendingAnchor = null;
      if (anchorEl) {
        var box = anchorEl.closest ? anchorEl.closest('details') : null;
        if (box) box.open = true;
        anchorEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  // 页内目录：从已渲染的 h3.sec 反推，渲染器不需要额外维护一份章节清单。
  // 这样新增 section() 会自动出现在右栏，不会像手写 anchorNav 那样漂移。
  function buildPageToc() {
    var page = app.querySelector('.page');
    if (!page) return;
    var heads = page.querySelectorAll('h3.sec');
    if (heads.length < 3) return;   // 章节太少时右栏反而是噪音

    var links = [];
    Array.prototype.forEach.call(heads, function (head, index) {
      // 中文标题经 slug() 会退化成一串连字符，所以用序号保证 id 稳定且唯一
      if (!head.id) head.id = 'sec-' + index;
      links.push('<a href="#' + escapeHtml(head.id) + '" data-toc="' + escapeHtml(head.id) + '">' +
        escapeHtml(head.textContent || '') + '</a>');
    });

    var toc = document.createElement('nav');
    toc.className = 'page-toc';
    toc.setAttribute('aria-label', '本页章节');
    toc.innerHTML = '<div class="toc-title">本页章节</div>' + links.join('');
    app.appendChild(toc);

    toc.querySelectorAll('[data-toc]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        var target = document.getElementById(link.getAttribute('data-toc'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    trackTocPosition(toc, heads);
  }

  // 用 IntersectionObserver 高亮当前章节；不支持时静默跳过，目录仍可点击
  function trackTocPosition(toc, heads) {
    if (typeof IntersectionObserver !== 'function') return;
    // 每次筛选都会重渲染，旧 observer 必须断开，否则会逐次累积
    if (tocObserver) tocObserver.disconnect();
    var links = {};
    toc.querySelectorAll('[data-toc]').forEach(function (link) {
      links[link.getAttribute('data-toc')] = link;
    });
    // 按文档顺序而非进入视口的先后顺序判断当前章节，否则向上滚动会高亮错行
    var order = Array.prototype.map.call(heads, function (head) { return head.id; });
    var visible = {};
    tocObserver = new IntersectionObserver(function (records) {
      records.forEach(function (record) {
        visible[record.target.id] = record.isIntersecting;
      });
      var current = null;
      for (var i = 0; i < order.length; i += 1) {
        if (visible[order[i]]) { current = order[i]; break; }
      }
      order.forEach(function (id) {
        if (links[id]) links[id].classList.toggle('active', id === current);
      });
    }, { rootMargin: '-88px 0px -70% 0px' });
    Array.prototype.forEach.call(heads, function (head) { tocObserver.observe(head); });
  }

  function bindPageEvents() {
    app.querySelectorAll('[data-filter]').forEach(function (button) {
      button.addEventListener('click', function () {
        var name = button.getAttribute('data-filter');
        state[name] = button.getAttribute('data-value');
        if (name === 'track') storeSet(STORE.track, state.track);
        render(true);
      });
    });
    app.querySelectorAll('[data-check-id]').forEach(function (input) {
      input.addEventListener('change', function () {
        var id = input.getAttribute('data-check-id');
        if (input.checked) state.checks.add(id); else state.checks.delete(id);
        persistChecks();
        render(true);
      });
    });
    app.querySelectorAll('[data-anchor]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        var id = link.getAttribute('data-anchor');
        var target = document.getElementById(id);
        if (target) {
          // 目标在折叠块内时先展开（周条 chip → 对应周条目）
          var box = target.closest ? target.closest('details') : null;
          if (box) box.open = true;
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        // 目标在另一条路由上：记下锚点，切路由后由 render() 滚动到位
        pendingAnchor = id;
        var href = link.getAttribute('href');
        if (href && href.charAt(0) === '#') {
          if (location.hash === href) render();
          else location.hash = href.slice(1);
        } else {
          render();
        }
      });
    });
    // 目录卡 / 论文行整块可点；点到勾选框/链接/折叠时让默认行为接管。
    // tabindex=0 的块（L2 论文行）还要能 Enter/Space 触发——焦点在行内控件上时不劫持。
    app.querySelectorAll('[data-goto]').forEach(function (card) {
      card.addEventListener('click', function (event) {
        if (event.target.closest('a, button, label, input, summary, details')) return;
        location.hash = card.getAttribute('data-goto');
      });
      card.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        if (event.target !== card) return;
        event.preventDefault();
        location.hash = card.getAttribute('data-goto');
      });
    });
  }

  function buildSearchIndex() {
    var entries = [];
    Object.keys(routeMeta).forEach(function (route) {
      entries.push({ route: route, title: routeMeta[route][0], detail: routeMeta[route][1] });
    });
    DATA.rules.forEach(function (item) { entries.push({ route: 'baseline', title: item.q, detail: stripHtml(item.a) }); });
    DATA.advisor.papers.forEach(function (item) { entries.push({ route: 'baseline', title: item.t, detail: item.j + ' ' + item.doi }); });
    RESEARCH.angles.forEach(function (item) { entries.push({ route: 'research', title: item.name, detail: item.problem }); });
    Object.keys(RESEARCH.reading.tracks).forEach(function (tid) {
      var t = RESEARCH.reading.tracks[tid];
      entries.push({ route: 'reading', title: t.name, detail: t.pitch + ' ' + (trackShort[tid] || '') });
    });
    allPapers().forEach(function (item) {
      entries.push({ route: 'reading/' + (item.level === 'common' ? 'common' : item.level) + (item.ax ? '/' + item.ax : ''),
        crumb: '阅读 · ' + (item.level === 'common' ? '公共必读' : '方向 ' + item.level),
        title: item.t, detail: (item.ax || '') + ' ' + (item.intro || '') + ' ' + item.why });
    });
    TOOLS.core.forEach(function (item) { entries.push({ route: 'tools', title: item.n, detail: item.use + ' ' + (item.ref || '') }); });
    JOBS.teams.forEach(function (item) { entries.push({ route: 'jobs', title: item.company + ' · ' + item.name, detail: item.summary + ' ' + item.tags.join(' ') }); });
    SKILLS.signals.forEach(function (item) { entries.push({ route: 'skills', title: item.name, detail: item.judgement }); });
    PORTFOLIO.projects.forEach(function (item) { entries.push({ route: 'portfolio', title: item.name, detail: item.problem }); });
    SKILLS.roadmap.forEach(function (item) { entries.push({ route: 'skills/' + item.id, crumb: '技能 · 学习路线', title: item.name, detail: item.target + ' ' + item.deliverable }); });
    JOBS.verification.forEach(function (item) { entries.push({ route: 'verify', title: item.title, detail: item.action }); });
    return entries;
  }

  function stripHtml(value) {
    var node = document.createElement('div');
    node.innerHTML = value || '';
    return node.textContent || '';
  }

  // 搜索索引失败不能拖垮整页渲染，退化为空索引即可
  var searchIndex = [];
  try {
    searchIndex = buildSearchIndex();
  } catch (error) {
    searchIndex = [];
  }
  function updateSearch() {
    var query = searchInput.value.trim().toLowerCase();
    if (query.length < 2) { searchResults.hidden = true; searchResults.innerHTML = ''; return; }
    var hits = searchIndex.filter(function (item) {
      return (item.title + ' ' + item.detail).toLowerCase().indexOf(query) >= 0;
    }).slice(0, 12);
    searchResults.innerHTML = hits.length ? hits.map(function (item) {
      var where = item.crumb || (routeMeta[item.route] ? routeMeta[item.route][0] : '');
      return '<a href="#' + escapeHtml(item.route) + '" class="search-result"><span class="where">' + escapeHtml(where) + '</span><strong>' +
        escapeHtml(item.title) + '</strong><span class="excerpt">' + escapeHtml(item.detail.slice(0, 92)) + (item.detail.length > 92 ? '…' : '') + '</span></a>';
    }).join('') : '<div class="empty">没有匹配的内容</div>';
    searchResults.hidden = false;
  }

  function closeNav() {
    document.body.classList.remove('nav-open');
    sidebarToggle.setAttribute('aria-expanded', 'false');
  }

  searchInput.addEventListener('input', updateSearch);
  searchInput.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') { searchInput.value = ''; searchResults.hidden = true; }
  });
  document.addEventListener('click', function (event) {
    if (!event.target.closest('.search-wrap')) searchResults.hidden = true;
  });
  searchResults.addEventListener('click', function () {
    searchInput.value = '';
    searchResults.hidden = true;
  });
  sidebarToggle.addEventListener('click', function () {
    var open = document.body.classList.toggle('nav-open');
    sidebarToggle.setAttribute('aria-expanded', String(open));
  });
  navOverlay.addEventListener('click', closeNav);
  document.getElementById('nav').addEventListener('click', closeNav);
  themeToggle.addEventListener('click', function () {
    var light = document.body.classList.toggle('light');
    themeToggle.setAttribute('aria-pressed', String(light));
    storeSet(STORE.theme, light ? 'light' : 'dark');
  });
  document.getElementById('reset-progress').addEventListener('click', function () {
    state.checks.clear();
    storeDel(STORE.checks);
    render(true);
  });
  skipLink.addEventListener('click', function (event) {
    // 用焦点转移代替 hash 跳转，避免 #content 触发路由回退到仪表盘
    event.preventDefault();
    content.focus();
  });
  window.addEventListener('hashchange', function () { render(); });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') { closeNav(); searchResults.hidden = true; }
    if (event.key === '/' && document.activeElement !== searchInput && !/input|textarea/i.test(document.activeElement.tagName)) {
      event.preventDefault(); searchInput.focus();
    }
  });

  // 恢复本机保存的主题与方向选择（localStorage 不可用时静默跳过）
  if (storeGet(STORE.theme) === 'light') {
    document.body.classList.add('light');
    themeToggle.setAttribute('aria-pressed', 'true');
  }
  var savedTrack = storeGet(STORE.track);
  if (savedTrack && RESEARCH.reading.tracks[savedTrack]) state.track = savedTrack;

  render();
}());
