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

  var routeMeta = {
    dashboard: ['总览仪表盘', '把研究、工程与求职压成一条可执行主线。'],
    baseline: ['现实基线', '先确认导师、学校制度和产业资源，再做选择。'],
    research: ['研究主线', '主线：可信 Agent 系统（假成功检测与评测）；图记忆为导师锚定线。'],
    reading: ['阅读与 90 天启动', '公共必读打底，按方向进入专属路线；默认沿方向 A 启动。'],
    tools: ['科研工具链', '速查卡：核心工具与方法论归档位置。'],
    jobs: ['实习与岗位', '按阶段搭跳板，北京按中转定位纳入。'],
    skills: ['技能矩阵', '市场信号决定优先级，每条路线配学习参考。'],
    portfolio: ['作品集', '用真实开源项目证明可靠性、性能和工程判断。'],
    career: ['求职资产', '方向参考：临近 2027.12 再按当年市场重做。'],
    verify: ['待核验清单', '优先消除会改变路线的未知条件。']
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
    return '<section class="page-summary"><div class="ps-head">本页要点</div><ul>' +
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

  function details(title, body, open, right) {
    return '<details class="acc"' + (open ? ' open' : '') + '><summary>' + escapeHtml(title) +
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
  var PHASES = [
    { id: 'pre', until: '2026-09-01', name: '入学前', next: '入学', focus: '完成入学前后立即执行的清单：给导师的邮件/组会材料、公共必读、制度核验、算力确认。' },
    { id: 'y1a', until: '2027-01-12', name: '研一上 · 90 天启动', next: '研一寒假', focus: '评测设施定型（minibank-trap 受控评测）；启动 openEuler 开源实习与 OSPP 报名。' },
    { id: 'y1b', until: '2027-09-01', name: '研一寒假与下学期', next: '研二', focus: '寒假逐家核验重庆本地线索；Eval 与 Go；暑假 GLCC / 开源与项目推进。' },
    { id: 'y2', until: '2028-02-01', name: '研二上', next: '暑期实习主投', focus: '两项目定型并实测四个核心数字；联系成都/杭州 mentor；2027.12 起每周跟踪招聘窗口。' },
    { id: 'sprint', until: '2028-07-01', name: '暑期实习主投期', next: '暑期实习', focus: '简历冻结；按 杭州→上海→深圳→广州 主投，北京按中转定位一并投递。' },
    { id: 'intern', until: null, name: '暑期实习与秋招', next: null, focus: '暑期实习用成功率、成本、延迟、吞吐记录贡献；提前批与秋招并行，不押单一团队。' }
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
        { t: '给导师的第一封邮件若尚未发出，开学前发出；已联系则准备组会汇报材料', to: '#research' },
        { t: '公共必读前 4 篇读完（RAG、Generative Agents、MemGPT、记忆综述）', to: '#reading' },
        { t: '向学位办索取现行《学位成果要求》与《实习管理办法》全文', to: '#verify' },
        { t: '向导师确认 GPU、API 预算、服务器权限与组内相关工作', to: '#verify' },
        { t: '跑通 Atlas 全量测试与一次 dry-run；minibank-trap 升级为受控评测', to: '#portfolio' }
      ];
    }
    var acts = [];
    var w = plan90Week(now);
    if (w >= 1 && w <= 12) {
      acts.push({ t: '90 天计划 · ' + RESEARCH.plan90[w - 1].w + ' 产出：' + RESEARCH.plan90[w - 1].out, to: '#reading' });
    } else if (w > 12) {
      acts.push({ t: '90 天计划已过执行期，按方向卡「阶段路线」与实习阶梯继续推进', to: '#reading' });
    }
    if (phaseId === 'y1a') acts.push({ t: '注册 openEuler 开源实习领任务；OSPP 点亮计划报名', to: '#jobs' });
    if (phaseId === 'y1b') acts.push({ t: '寒假：重庆本地线索逐家核验是否真实在招、是否兼容学业', to: '#jobs' });
    if (phaseId === 'y2') acts.push({ t: '两项目四项核心数字实测；建立杭州雇主清单', to: '#portfolio' });
    if (phaseId === 'sprint' || phaseId === 'intern') acts.push({ t: '按偏好顺序投递并跟踪面试；北京 offer 须同时满足可迁移方向与跳出计划', to: '#jobs' });
    acts.push({ t: '每月巡检：Scholar Alert、arXiv 扫描、openEuler/OSPP 进度、待核验项销号', to: '#verify' });
    return acts;
  }

  function renderNowCard(now) {
    var cur = currentPhase(now);
    var p = cur.phase;
    var w = plan90Week(now);
    var actions = phaseActions(p.id, now);
    return '<section class="now-card"><div class="now-head"><div><div class="ps-head">当前阶段</div>' +
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
    return '<section class="card progress-card"><div class="card-head"><strong>进度总览</strong><span class="session-note">本机保存</span></div>' +
      line('公共必读', cDone, common.length) + line('90 天计划', wDone, RESEARCH.plan90.length) + line('核验销项', vDone, JOBS.verification.length) + '</section>';
  }

  function renderDashboard() {
    var now = new Date();
    var firstAngle = RESEARCH.angles[0];
    return '<div class="page">' + pageHead('dashboard', 'Decision cockpit') +
      callout('唯一主线', '<strong>后端工程 → Agent 应用 → Harness / 评测 / 可观测 → 可信 Agent 系统：假成功检测与证据化评测。</strong><br>论文负责建立方法深度，作品集负责证明系统能力，实习负责获得生产证据。', 'good hero-line') +
      renderNowCard(now) +
      renderProgress() +
      '<div class="grid c4">' +
        stat('2026.09', '入学', '先核验制度与算力') +
        stat('W8', '研究切口冻结', 'baseline 表必须成型', 'warn') +
        stat('2028.02', '暑期实习主投', '预测窗口，需提前复核', 'warn') +
        stat('2 个', '深度作品集', 'Atlas + AgentParliament', 'good') +
      '</div>' +
      section(DATA.corrections.length + ' 条会改变计划的纠偏') +
      '<div class="grid c3">' + DATA.corrections.map(function (item) {
        return '<article class="card correction"><div class="wrong">原假设 · ' + escapeHtml(item.wrong) + '</div><h4>' + rich(item.right) +
          '</h4><p>' + rich(item.why) + '</p><div class="impact"><b>行动影响</b> ' + escapeHtml(item.impact) + '</div>' + sourceLine(item.src, item.ref) + '</article>';
      }).join('') + '</div>' +
      section('当前研究决策') +
      '<div class="hero-decision card pad-lg"><div><span class="badge b-acc">首篇建议</span><h3>' + escapeHtml(firstAngle.name) +
        '</h3><p class="mono-sm">' + escapeHtml(firstAngle.en) + '</p><p>' + escapeHtml(firstAngle.problem) + '</p></div>' +
        '<div class="score-grid">' + Object.keys(firstAngle.scores).map(function (key) {
          var names = { value: '问题价值', novelty: '新颖性', falsifiable: '可证伪', feasible: '可实施', resource: '资源匹配', career: '求职对齐' };
          return '<div class="score-item"><span>' + names[key] + '</span>' + stars(firstAngle.scores[key]) + '</div>';
        }).join('') + '</div></div>' +
      '<div class="card"><strong>必须守住的边界</strong>' + list([
        '不把 GraphRAG 当简历主标签；用 Memory、Context、Evaluation 和 Knowledge Graph。',
        '不把 1,287 条快照说成百度全部 AI 岗位。',
        '不把预测招聘时间、二手实习政策或目标指标写成事实。',
        '不把“能运行”当作品集完成；必须报告成功率、P99、QPS 与单位成本。'
      ]) + '</div>' +
      section('三年阶段图') + details('展开查看 2026—2029 关键节点（远期信息，属历史规律外推）', renderCareerTimeline(JOBS.timeline.slice(0, 8)), false) + '</div>';
  }

  function renderBaseline() {
    return '<div class="page">' + pageHead('baseline', 'Evidence before strategy') +
      pageSummary(DATA.summary) +
      anchorNav([['advisor', '导师画像'], ['rules', '培养制度'], ['partners', '校企资源'], ['employment', '就业事实']]) +
      section('导师画像与方法签名', 'advisor') +
      '<div class="grid c2"><div class="card">' + kv(DATA.advisor.basic, true) + '</div><div class="card"><strong>可借力的方法签名</strong>' +
      DATA.advisor.methodology.map(function (item) { return '<div class="method-row"><b>' + escapeHtml(item.k) + '</b><p>' + escapeHtml(item.v) + '</p></div>'; }).join('') + '</div></div>' +
      callout('选题接口', DATA.advisor.tactic, '') +
      '<h4 class="sub">代表论文</h4>' + table(['年份', '期刊 / DOI', '主题', '引用快照'], DATA.advisor.papers.map(function (p) {
        // DOI 里的斜杠必须保留字面量，encodeURIComponent 会把它转成 %2F 导致 doi.org 解析失败
        return [text(p.y), '<a href="https://doi.org/' + encodeURI(p.doi) + '" target="_blank" rel="noreferrer">' + escapeHtml(p.j) + '</a><div class="mono-sm">' + escapeHtml(p.doi) + '</div>', text(p.t), text(p.cite)];
      })) + '<p class="mono-sm">' + escapeHtml(DATA.advisor.papersNote) + '</p>' +
      '<div class="grid c2"><div class="card"><strong>公开项目</strong>' + table(['项目', '级别', '时间'], DATA.advisor.projects.map(function (r) { return r.map(function (c) { return text(c); }); })) + '</div>' +
      '<div class="card"><strong>公开信息盲区</strong>' + list(DATA.advisor.blindspots, false, true) + '</div></div>' +
      section('培养制度：已知与未知必须分开', 'rules') +
      DATA.rules.map(function (item) {
        return details(item.q, '<p>' + rich(item.a) + '</p>' + (item.action ? callout('下一步核验', escapeHtml(item.action), 'warn') : '') + sourceLine(item.src, item.ref), false, badge(item.src === 's1' ? '一手' : '待复核', item.src === 's1' ? 'b-high' : 'b-mid'));
      }).join('') +
      section('校企资源：通道不等于机会自动落地', 'partners') +
      callout('两项纠正', list(DATA.partners.corrections, false, true), 'warn') +
      '<div class="grid c2">' + DATA.partners.items.map(function (item) {
        return '<article class="job tier-' + escapeHtml(item.tier) + '"><div class="jh"><div class="jt">' + escapeHtml(item.name) + '</div>' + badge(item.tier, 'b-acc') +
          '</div><div class="jm">' + badge(item.level, 'b-info') + '</div><p>' + rich(item.note) + '</p><div class="jq"><b>价值判断：</b>' + rich(item.why) + '</div>' + sourceLine(item.src, item.ref) + '</article>';
      }).join('') + '</div>' +
      details('可关注实验室（' + DATA.partners.labs.length + ' 个 · 背景档案）', table(['平台', '层级', '与路线的接口'], DATA.partners.labs.map(function (r) { return r.map(function (c) { return text(c); }); })) +
      '<p class="mono-sm">' + rich(DATA.partners.labNote) + '</p>', false) +
      section('就业事实与不可用口径', 'employment') +
      details('落实率、雇主样本与薪资警告（背景数据）', '<div class="grid c2"><div>' + table(['口径', '比例', '时间'], DATA.employment.official.map(function (r) { return r.map(function (c) { return text(c); }); })) +
      '<div class="card"><strong>头部雇主样本</strong><p>' + escapeHtml(DATA.employment.employers) + '</p></div></div>' +
      '<div>' + callout('薪资数据不可引用', DATA.employment.salaryWarning, 'bad') + '<div class="card"><strong>权威核验路径</strong><p>' + escapeHtml(DATA.employment.authoritative) + '</p>' + sourceLine(DATA.employment.src, DATA.employment.ref) + '</div></div></div>', false) +
      details(DATA.wafNote.title, DATA.wafNote.body, false) + '</div>';
  }

  function renderResearch() {
    return '<div class="page">' + pageHead('research', 'Thesis × market language') +
      pageSummary(RESEARCH.summary) +
      callout(RESEARCH.positioning.title, RESEARCH.positioning.body, 'good') +
      section('六个研究切口') + '<div class="matrix">' + RESEARCH.angles.map(function (angle) {
        return '<article class="mx-card' + (angle.star ? ' rec' : '') + '">' + (angle.star ? '<span class="mx-tag">RECOMMENDED</span>' : '') +
          '<h5>' + escapeHtml(angle.id + ' · ' + angle.name) + '</h5><div class="en">' + escapeHtml(angle.en) + '</div>' +
          kv([['问题', angle.problem], ['目标刊', angle.venue], ['成本', angle.cost], ['风险', angle.risk]], true) +
          '<div class="score-grid compact">' + Object.keys(angle.scores).map(function (key) {
            var names = { value: '价值', novelty: '新意', falsifiable: '可证伪', feasible: '实施', resource: '资源', career: '求职' };
            return '<div class="score-item"><span>' + names[key] + '</span>' + stars(angle.scores[key]) + '</div>';
          }).join('') + '</div>' + details('方法草案', list(angle.method), false) + '</article>';
      }).join('') + '</div>' +
      callout('建议排序', RESEARCH.angleAdvice, '') +
      details('已拒绝的方向（2026-08-28 存档，防止重新发明）', '<div class="grid c2">' + arr(RESEARCH.rejected).map(function (r) {
        return '<div class="card"><strong>' + escapeHtml(r.name) + '</strong><p>' + escapeHtml(r.reason) + '</p></div>';
      }).join('') + '</div>', false) +
      section('双轨验证与指标体系') + callout('为什么要双轨', RESEARCH.dualTrack, 'good') +
      details('指标体系（' + RESEARCH.metrics.length + ' 组 · 实验设计时查阅）', '<div class="grid c3">' + RESEARCH.metrics.map(function (metric) {
        return '<div class="card"><strong>' + escapeHtml(metric.g) + '</strong>' + list(metric.items) + '</div>';
      }).join('') + '</div>', false) +
      section('已经饱和的方向') + details(RESEARCH.saturated.length + ' 条饱和判断（防止重新发明）', table(['方向', '证据', '判断'], RESEARCH.saturated.map(function (item) {
        return [text(item.t), text(item.e), '<strong>' + text(item.j) + '</strong>'];
      })), false) +
      section('竞争团队雷达') + details(RESEARCH.rivals.length + ' 个团队 × 跟踪频率', '<div class="grid c2">' + RESEARCH.rivals.map(function (item) {
        var cls = item.level === 'danger' ? 'bad' : item.level === 'warn' ? 'warn' : '';
        return '<div class="card rival ' + cls + '"><div class="card-head"><strong>' + escapeHtml(item.n) + '</strong>' + badge(item.f, cls === 'bad' ? 'b-low' : cls === 'warn' ? 'b-mid' : 'b-dim') +
          '</div><p>' + escapeHtml(item.w) + '</p><div class="mono-sm">' + escapeHtml(item.note) + '</div></div>';
      }).join('') + '</div>' + callout('竞争判断', RESEARCH.rivalJudgement, 'warn'), false) +
      section('给导师的翻译层') + table(['Agent 语言', '图学习语言'], RESEARCH.translate.map(function (r) { return [text(r[0]), rich(r[1])]; })) +
      '<blockquote><p>' + escapeHtml(RESEARCH.pitch) + '</p><cite>组会开场建议</cite></blockquote>' +
      details('见导师材料（组会汇报骨架 · 第一封邮件存档）',
        '<p class="muted">2026-08 已与导师确认方向支持（见「现实基线」纠偏四）。下面的 15 页骨架供 W4 / W8 / W12 组会复用；第一封邮件留档备查。</p>' +
        table(['页', '内容', '要点'], RESEARCH.reportDeck.map(function (r) { return [text(r.p), text(r.c), text(r.k)]; })) +
        '<div class="card"><strong>汇报要点</strong>' + list(RESEARCH.reportTips, false, true) + '</div>' +
        '<h4 class="sub">' + escapeHtml(RESEARCH.firstMail.title) + '</h4>' +
        '<p class="muted">' + escapeHtml(RESEARCH.firstMail.dont) + '</p>' +
        '<pre class="mail-body">' + escapeHtml(RESEARCH.firstMail.body) + '</pre>' +
        '<p class="muted">' + escapeHtml(RESEARCH.firstMail.effect) + '</p>', false) + '</div>';
  }

  function allPapers() {
    // 公共必读 + 各方向论文统一收集，供搜索索引与 PDF 统计使用
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

  // 方向卡的短名（chip 按钮用），缺失时回退到编号
  var trackShort = { A: '假成功检测', B: '交叉审查边界', C: '记忆评测科学', D: '图结构记忆', E: '代码评测审计', F: '记忆压缩帕累托' };

  function paperItem(paper) {
    var id = paper.ax || paper.y || 'paper';
    var pdfLink = (paper.pdf && paper.ax)
      ? '<a class="pdf-link" href="papers/' + encodeURI(paper.ax) + '.pdf" target="_blank" rel="noreferrer" title="打开本地 PDF">📄 PDF</a>'
      : '';
    return '<article class="paper' + (paper.key ? ' must' : '') + '"><div class="pid">' +
      (paper.ax ? '<a href="https://arxiv.org/abs/' + encodeURI(paper.ax) + '" target="_blank" rel="noreferrer">' + escapeHtml(paper.ax) + '</a>' : text(id)) +
      '</div><div class="pb"><div class="pt">' + escapeHtml(paper.t) + pdfLink + '</div><div class="pv">' + text(paper.v) + ' · ' + text(paper.y) +
      (paper.c == null ? '' : ' · cited ' + escapeHtml(paper.c)) + '</div>' +
      (paper.intro ? '<div class="p-intro">' + escapeHtml(paper.intro) + '</div>' : '') +
      '<div class="pw">' + escapeHtml(paper.why) + '</div>' +
      '<div class="tag-row">' + (paper.key ? badge('必读', 'b-acc') : '') + (paper.warn ? badge('撞方向', 'b-low') : '') + (paper.cat ? badge(paper.cat, 'b-info') : '') + '</div></div></article>';
  }

  function renderReading() {
    var reading = RESEARCH.reading;
    var common = reading.common;
    var tracks = reading.tracks;
    var track = tracks[state.track] ? state.track : 'A';
    var t = tracks[track];

    var commonChecks = common.items.map(function (p, i) {
      return { id: 'paper-common-' + (p.ax || i), text: p.t, meta: (p.ax || '') + ' · 公共必读' };
    });
    var pdfCount = allPapers().filter(function (p) { return p.pdf && p.ax; }).length;
    var trackChips = filterGroup('方向', 'track', Object.keys(tracks).map(function (tid) {
      return [tid, tid + ' · ' + (trackShort[tid] || tid)];
    }), track);

    return '<div class="page">' + pageHead('reading', 'Common first, then your track') +
      pageSummary(RESEARCH.readingSummary) +
      callout('本页怎么用', '<b>先公共、后私有。</b>公共必读（' + common.items.length + ' 篇）无论最终走哪个方向都要读；想清楚方向后，切换到对应方向卡，按「阶段路线」推进该方向的必读与资产。标 📄 的 <b>' + pdfCount + ' 篇</b>论文已下载到 <code>site/papers/</code>，点「📄 PDF」直接开始阅读，无需联网。', 'good') +

      section('公共必读 · 无论走哪条线', 'common-reading') +
      '<div class="card paper-list">' + common.items.map(paperItem).join('') + '</div>' +
      section('公共必读进度') + details('勾选进度（' + common.items.length + ' 篇）', checkList('reading-common', '公共必读清单（' + common.items.length + ' 篇）', commonChecks, '勾选自动保存在本机；正式读书记录进 Zotero/Obsidian。'), false) +

      section('方向路线：选一条进入', 'tracks') + '<div class="filters filter-stack">' + trackChips + '</div>' +
      renderTrackCard(track, t) +

      section('90 天启动路线（公共 4 周 + 默认沿方向 A）', 'plan90') +
      callout('换轨说明', rich(RESEARCH.plan90Switch), 'warn') + renderPlan90() +

      section('卡住时怎么退', 'fallback') + '<div class="grid c2">' + RESEARCH.fallback.map(function (item) {
        return '<div class="card"><strong>' + escapeHtml(item.s) + '</strong><p>' + escapeHtml(item.a) + '</p></div>';
      }).join('') + '</div></div>';
  }

  // 方向卡：定位 → 阶段路线（可视化）→ 方向必读 → 资产 → 提示
  function renderTrackCard(tid, t) {
    return '<article class="card track-card pad-lg">' +
      '<div class="track-head"><span class="badge b-acc">方向 ' + escapeHtml(tid) + '</span><div>' +
      '<h3>' + escapeHtml(String(t.name).replace(/^方向 [A-F] · /, '')) + '</h3>' +
      '<p class="track-pitch">' + escapeHtml(t.pitch) + '</p></div></div>' +
      '<div class="track-fit"><b>接口</b>' + escapeHtml(t.fit) + '</div>' +
      '<h4 class="sub">阶段路线</h4><div class="stage-flow">' + arr(t.stages).map(function (s, i) {
        return '<div class="stage"><span class="s-no">' + (i + 1) + '</span><div class="stage-body"><b>' + escapeHtml(s.k) + '</b><p>' + escapeHtml(s.v) + '</p></div></div>';
      }).join('') + '</div>' +
      '<h4 class="sub">方向必读（' + arr(t.papers).length + ' 篇）</h4><div class="card paper-list">' + arr(t.papers).map(paperItem).join('') + '</div>' +
      '<div class="grid c2">' +
        '<div class="card"><strong>复现资产</strong>' + list(arr(t.repos).map(function (r) { return r.r + ' —— ' + r.note; })) + '</div>' +
        '<div class="card"><strong>数据集</strong>' + list(arr(t.datasets).map(function (d) { return d.n + ' —— ' + d.d; })) + '</div>' +
      '</div>' +
      callout('使用提示', escapeHtml(t.note), '') +
      '</article>';
  }

  function renderPlan90() {
    // 12 周按 Phase 分三组折叠，默认展开 Phase 1——整条时间线一次性铺开是本页最长的墙
    var phaseNames = { 1: '公共必读、Atlas 复现与综述初稿', 2: '标注协议、基准设计与检测器 v1', 3: '消融、复现包与投稿材料' };
    return [1, 2, 3].map(function (ph) {
      var weeks = RESEARCH.plan90.filter(function (item) { return item.ph === ph; });
      if (!weeks.length) return '';
      return details('Phase ' + ph + ' · ' + weeks[0].w + '—' + weeks[weeks.length - 1].w + ' · ' + phaseNames[ph],
        '<div class="timeline">' + weeks.map(plan90Item).join('') + '</div>', ph === 1);
    }).join('');
  }

  function plan90Item(item) {
    var checkId = 'week-' + item.w;
    return '<article class="tl-item' + (item.mile ? ' milestone' : '') + '"><div class="tl-when">' + escapeHtml(item.w) + ' · Phase ' + escapeHtml(item.ph) + '</div>' +
      '<div class="tl-what">' + escapeHtml(item.out) + '</div><div class="tl-desc"><b>读：</b>' + escapeHtml(item.read) + '<br><b>做：</b>' + escapeHtml(item.run) +
      '<br><b>卡住：</b>' + escapeHtml(item.stuck) + '</div>' + (item.mile ? '<div class="tl-check"><b>里程碑：</b>' + escapeHtml(item.mile) + '</div>' : '') +
      '<label class="mini-check"><input type="checkbox" data-check-id="' + checkId + '"' + (state.checks.has(checkId) ? ' checked' : '') + '> 本周验收完成</label></article>';
  }

  function renderTools() {
    return '<div class="page">' + pageHead('tools', 'Quick reference only') +
      callout('速查卡声明', rich(TOOLS.disclaimer), 'warn') +
      section('核心工具速查') + table(['工具', '用途', '入口'], TOOLS.core.map(function (tool) {
        return ['<strong>' + escapeHtml(tool.n) + '</strong>', escapeHtml(tool.use), escapeHtml(tool.ref || '—')];
      })) +
      section('方法论归档：grad-companion') +
      callout(escapeHtml(TOOLS.companion.name), '<b>策略文档：</b><code>' + escapeHtml(TOOLS.companion.playbook) + '</code><br>' + rich(TOOLS.companion.note), 'good') +
      '<p class="mono-sm">需要完整方法论时（三遍读法、可复现检查表、投稿清单等），打开上面的归档文档；本站不再重复维护。每月固定动作已并入「待核验清单」页。</p></div>';
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
      (JOBS.pageNote ? callout('本页重点：实习，不是求职', rich(JOBS.pageNote), 'warn') : '') +
      anchorNav([['city-policy', '地域约束'], ['ladder', '实习阶梯'], ['job-samples', '岗位样本'], ['snapshot', '数据口径']]) +
      section('地域约束：一切筛选的前置条件', 'city-policy') +
      renderCityPolicy() +
      section('实习四级阶梯', 'ladder') + '<div class="timeline">' + JOBS.internshipLadder.map(function (step) {
        return '<article class="tl-item milestone"><div class="tl-when">STEP ' + escapeHtml(step.step) + ' · ' + escapeHtml(step.when) + '</div><div class="tl-what">' + escapeHtml(step.title) +
          '</div><div class="tl-desc">' + list(step.actions) + '</div><div class="tl-check"><b>验收：</b>' + escapeHtml(step.acceptance) + '</div></article>';
      }).join('') + '</div>' +
      section('岗位族：主投什么、不主投什么') + '<div class="grid c3">' + JOBS.roleFamilies.map(function (role) {
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
      '<div class="result-count">显示 ' + teams.length + ' / ' + JOBS.teams.length + ' 个策展样本</div><div class="grid c2">' +
      (teams.length ? teams.map(renderJobCard).join('') : '<div class="empty card">没有符合筛选条件的岗位样本</div>') + '</div>' +
      section('招聘时间线') + renderCareerTimeline(JOBS.timeline) +
      section('数据口径：这份快照能说明什么', 'snapshot') +
      callout(JOBS.meta.title, '<strong>' + JOBS.meta.denominator + ' 条去重记录</strong> · ' + escapeHtml(JOBS.meta.sampleScope) + '<br>' + escapeHtml(JOBS.meta.warning), 'warn') +
      '<div class="grid c4">' + JOBS.stats.recruitment.map(function (item) {
        return stat(item.count, item.label, item.pct + '% of snapshot', item.id === 'dailyIntern' ? 'good' : '');
      }).join('') + stat(techPost ? techPost.count : '—', '技术岗', (techPost ? techPost.pct + '%' : '') + '，不是应届可投数', 'warn') + '</div>' +
      details('城市记录分布与可投池测算', renderCityDistribution(), false, badge('按记录计数', 'b-dim')) +
      details('抽样与字段质量', '<div class="grid c2"><div>' + table(['岗位类型', '记录数', '占比'], JOBS.stats.postType.map(function (i) { return [text(i.label), text(i.count), text(i.pct + '%')]; })) +
        '</div><div>' + table(['字段质量', '数值', '解释'], JOBS.stats.quality.map(function (i) { return [text(i.label), text(i.value), text(i.note)]; })) + '</div></div>', false) +
      section('不要跨过的数据边界') + details('数据口径风险与生涯决策风险', '<div class="grid c2">' + Object.keys(JOBS.risks).map(function (group) {
        var title = group === 'data' ? '数据口径风险' : '生涯决策风险';
        return '<div class="card"><div class="card-head"><strong>' + title + '</strong>' + claimBadge('inference') + '</div>' + list(JOBS.risks[group]) + '</div>';
      }).join('') + '</div>', false) + '</div>';
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
      arr(policy.transit.cities).map(escapeHtml).join('、') + '</strong><div class="mono-sm">TRANSIT, NOT DESTINATION</div></div>' +
      badge('1—2 年跳板', 'b-mid') + '</div><p class="phase-rule">' + escapeHtml(policy.transit.rule) +
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
      }).join('') + '</div>', false);
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
      callout('怎么读这张图', rich(JOBS.stats.cityNote), 'warn');
  }

  function renderJobCard(job) {
    return '<article class="job tier-' + escapeHtml(job.tier) + '"><div class="jh"><div class="jt">' + escapeHtml(job.company + ' · ' + job.name) + '</div>' + badge(job.tier, job.tier === 'S' ? 'b-pur' : 'b-acc') +
      '</div><div class="jm">' + job.cities.map(function (v) { return badge(v, 'b-dim'); }).join('') + badge(familyLabels[job.roleFamily] || job.roleFamily, 'b-info') +
      badge(tierLabels[job.targetTier] || job.targetTier, 'b-acc') + '</div>' + tags(job.tags) + '<div class="jq">' + safeRich(job.summary) + '</div><div class="jw">' +
      escapeHtml(job.opening) + ' · 快照 ' + escapeHtml(job.sourceAsOf) + '</div><div class="evidence-row">' + claimBadge(job.claimType) + evidenceBadge(job.evidenceLevel) + '</div></article>';
  }

  function renderCareerTimeline(items) {
    return '<div class="timeline">' + items.map(function (item) {
      // type 直接透传：plan 显示「计划」，forecast 显示「预测」，不再把 plan 误标为策略判断
      return '<article class="tl-item' + (item.type === 'forecast' ? ' soft' : ' milestone') + '"><div class="tl-when">' + escapeHtml(item.when) + '</div><div class="tl-what">' +
        escapeHtml(item.title) + ' ' + claimBadge(item.type || 'plan') + '</div><div class="tl-desc">' + escapeHtml(item.detail) + '</div></article>';
    }).join('') + '</div>';
  }

  function renderSkills() {
    var signals = SKILLS.signals.filter(function (skill) {
      return (state.skillPriority === 'all' || skill.priority === state.skillPriority) && (state.skillDomain === 'all' || skill.domain === state.skillDomain);
    });
    var roadmap = SKILLS.roadmap.filter(function (skill) {
      return (state.skillPriority === 'all' || skill.priority === state.skillPriority) && (state.skillDomain === 'all' || skill.domain === state.skillDomain);
    });
    var domains = Array.from(new Set(SKILLS.roadmap.concat(SKILLS.signals).map(function (s) { return s.domain; })));
    return '<div class="page">' + pageHead('skills', 'Market signal → proof of skill') +
      pageSummary(SKILLS.summary) +
      callout('双口径不可合并', '<b>百度：</b>' + SKILLS.meta.baidu.denominator + ' 个技术岗，含职责与要求。<br><b>腾讯：</b>' + SKILLS.meta.tencent.denominator + ' 个技术岗，只有工作内容，命中率是下限。<br>' + escapeHtml(SKILLS.meta.warning), 'warn') +
      '<div class="filters filter-stack">' + filterGroup('优先级', 'skillPriority', [['all', '全部'], ['P0', 'P0'], ['P1', 'P1'], ['P2', 'P2'], ['P3', 'P3']], state.skillPriority) +
      filterGroup('能力域', 'skillDomain', [['all', '全部']].concat(domains.map(function (d) { return [d, domainLabels[d] || d]; })), state.skillDomain) + '</div>' +
      section('学习路线与可验证交付物') + '<div class="grid c2">' + roadmap.map(function (skill) {
        return '<article class="card"><div class="card-head"><strong>' + escapeHtml(skill.name) + '</strong>' + badge(skill.priority, skill.priority === 'P0' ? 'b-high' : skill.priority === 'P1' ? 'b-acc' : 'b-dim') +
          '</div>' + kv([['目标水平', skill.target], ['截止阶段', skill.deadline], ['交付证据', skill.deliverable]]) +
          skillRefs(skill.refs) +
          '<label class="mini-check"><input type="checkbox" data-check-id="' +
          escapeHtml(skill.id) + '"' + (state.checks.has(skill.id) ? ' checked' : '') + '> 标记完成</label></article>';
      }).join('') + '</div>' +
      details('市场信号矩阵（' + signals.length + ' / ' + SKILLS.signals.length + ' 项 · 调研证据）', '<div class="result-count">显示 ' + signals.length + ' / ' + SKILLS.signals.length + ' 项</div>' +
      table(['技能', '领域', '百度 ' + SKILLS.meta.baidu.denominator, '腾讯 ' + SKILLS.meta.tencent.denominator, '优先级', '判断'], signals.map(function (skill) {
        return ['<strong>' + escapeHtml(skill.name) + '</strong>', text(domainLabels[skill.domain] || skill.domain), skill.baidu == null ? '—' : '<div class="bar-cell"><div class="bar"><i style="width:' + skill.baidu + '%"></i></div><span>' + skill.baidu + '%</span></div>',
          skill.tencent == null ? '—' : '<div class="bar-cell"><div class="bar"><i class="cold" style="width:' + skill.tencent + '%"></i></div><span>' + skill.tencent + '%</span></div>', badge(skill.priority, skill.priority === 'P0' ? 'b-high' : skill.priority === 'P1' ? 'b-acc' : 'b-dim'), text(skill.judgement)];
      })) + callout('如何读这些数字', '关键词存在率不等于岗位硬要求率，也不能证明候选人供给。<b>GraphRAG 零命中只说明不适合作为 ATS 主标签，不代表图记忆技术无价值。</b>', ''), false) +
      details('面试四条能力线（2028 准备框架）', '<div class="grid c2">' + SKILLS.interviewTracks.map(function (track) {
        return '<div class="card"><div class="card-head"><strong>' + escapeHtml(track.name) + '</strong>' + badge(track.target, 'b-info') + '</div>' + list(track.items) + '</div>';
      }).join('') + '</div>', false) + '</div>';
  }

  // 学习参考渲染：kind=book/web/paper；local 指向 site/papers/ 的本地 PDF
  var refKindIcons = { book: '📕', web: '🌐', paper: '📄' };
  function skillRefs(refs) {
    if (!arr(refs).length) return '';
    return '<h4 class="sub">学习参考（从这里开始）</h4><div class="ref-list">' + refs.map(function (r) {
      var href = r.local ? 'papers/' + encodeURI(r.local) + '.pdf' : (r.url || '');
      var body = href
        ? '<a href="' + encodeURI(href) + '"' + (r.local ? ' target="_blank" rel="noreferrer"' : '') + '>' + escapeHtml(r.label) + '</a>'
        : escapeHtml(r.label);
      return '<div class="ref-item"><span aria-hidden="true">' + (refKindIcons[r.kind] || '•') + '</span> ' + body +
        (r.local ? ' <span class="mono-sm">本地PDF</span>' : '') + '</div>';
    }).join('') + '</div>';
  }

  function renderPortfolio() {
    return '<div class="page">' + pageHead('portfolio', 'Measured engineering evidence') +
      callout('作品集硬规则', '两个深项目优于多个浅项目。每个项目必须有问题、架构、权衡、失败复盘、可复跑 benchmark，以及 <b>QPS / 成功率 / P99 / 单位成本</b> 四项实测数字。', 'good') +
      '<div class="grid c3">' + PORTFOLIO.principles.map(function (p) { return '<div class="card"><strong>' + escapeHtml(p.title) + '</strong><p>' + escapeHtml(p.detail) + '</p></div>'; }).join('') + '</div>' +
      PORTFOLIO.projects.map(function (project, projectIndex) {
        return section((projectIndex + 1) + ' · ' + project.name) + '<article class="project card pad-lg"><div class="project-head"><div><span class="badge b-info">' + escapeHtml(project.status) + '</span><h3>' + escapeHtml(project.name) +
          '</h3><p>' + escapeHtml(project.problem) + '</p></div>' + claimBadge(project.claimType) + '</div><div class="grid c2"><div><h4 class="sub">架构</h4>' + list(project.architecture) + '</div><div><h4 class="sub">关键权衡</h4>' + list(project.tradeoffs) + '</div></div>' +
          '<h4 class="sub">四项核心指标</h4><div class="grid c4">' + project.metrics.map(function (metric) {
            var note = metric.value == null ? '目标位，不是成果' : (metric.status === 'preliminary' ? '初步实测（n=1），待补重复' : 'measured');
            var cls = metric.value == null ? 'warn' : (metric.status === 'preliminary' ? '' : 'good');
            return stat(metric.value == null ? '待实测' : metric.value, metric.label, note, cls);
          }).join('') + '</div><h4 class="sub">里程碑</h4><div class="timeline">' + project.milestones.map(function (mile) {
            return '<article class="tl-item milestone"><div class="tl-when">' + escapeHtml(mile.stage) + '</div><div class="tl-what">' + escapeHtml(mile.title) + '</div><div class="tl-desc">' + list(mile.tasks) +
              '</div><div class="tl-check"><b>验收：</b>' + escapeHtml(mile.acceptance) + '</div><label class="mini-check"><input type="checkbox" data-check-id="' + escapeHtml(mile.id) + '"' + (state.checks.has(mile.id) ? ' checked' : '') + '> 里程碑完成</label></article>';
          }).join('') + '</div><div class="grid c2"><div><h4 class="sub">证据产物</h4>' + list(project.artifacts) + '</div><div><h4 class="sub">岗位映射</h4>' + tags(project.relatedRoles) + tags(project.relatedTeams) + '</div></div></article>';
      }).join('') +
      section('错误选择 → 测量 → 纠正') + '<div class="story-flow">' + PORTFOLIO.storyTemplate.map(function (step, index) {
        return '<div class="story-step"><span>' + (index + 1) + '</span><strong>' + escapeHtml(step.step) + '</strong><p>' + escapeHtml(step.prompt) + '</p></div>';
      }).join('') + '</div></div>';
  }

  function renderCareer() {
    return '<div class="page">' + pageHead('career', 'Direction reference only') +
      callout('本页定位：方向参考', '正式求职在 2028 年秋，距今还有两年以上——届时市场、JD 与公司策略大概率都会过时。本页只保留<b>长期有效的方向性判断</b>（定位、叙事骨架、投递优先级）；临近 2027 年 12 月时按当年市场数据<b>重做整页</b>，而不是沿用这里的具体信息。当前真正可执行的是「实习与岗位」页的实习阶梯。', 'warn') +
      section('一句话定位') + '<blockquote><p>' + escapeHtml(PORTFOLIO.narratives.positioning) + '</p></blockquote>' +
      '<div class="grid c2"><div class="card"><strong>为什么读研</strong><p>' + escapeHtml(PORTFOLIO.narratives.whyGraduate) + '</p></div><div class="card"><strong>论文如何服务岗位</strong><p>' + escapeHtml(PORTFOLIO.narratives.thesisToJob) + '</p></div></div>' +
      callout('不要把自己说成 GraphRAG 专家', escapeHtml(PORTFOLIO.narratives.notGraphRag) + tags(PORTFOLIO.narratives.labels), 'warn') +
      section('投递优先级（方向参考）') + '<div class="grid c3">' + PORTFOLIO.applicationPriority.map(function (item) {
        return '<div class="job tier-' + escapeHtml(item.tier) + '"><div class="jh"><div class="jt">Tier ' + escapeHtml(item.tier) + '</div></div>' + tags(item.targets) + '<div class="jq">' + escapeHtml(item.reason) + '</div></div>';
      }).join('') + '</div>' +
      section('面试开场的证据顺序（骨架，细节届时重填）') + '<div class="story-flow">' + [
        ['生产背景', '我做过 Python 后端和 AI 应用，理解可靠性与交付约束。'], ['真实问题', '多模型流水线的「假成功」——宣称完成但证据不成立——无法靠 prompt 补丁解决。'],
        ['研究动作', '我把「成功」拆成声明/证据/状态三层，做类型学、基准与检测器，并延伸到记忆后端的成本-精度-延迟评测。'], ['工程证据', 'Atlas（假成功检测 + 哈希断言 + JSONL 台账）与 AgentParliament（三级权限交叉审查）是可复跑的测量基础设施。'],
        ['岗位匹配', '因此我适合 Agent Runtime、Harness、评测、可观测与知识工程团队。']
      ].map(function (s, i) { return '<div class="story-step"><span>' + (i + 1) + '</span><strong>' + s[0] + '</strong><p>' + s[1] + '</p></div>'; }).join('') + '</div>' +
      '<p class="mono-sm">简历 bullet 模板保留在 data/portfolio.js（resumeBullets），只在实测出数字后启用；本页 2027.12 重做时一并刷新。</p></div>';
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
      callout('核验排序规则', '先处理会改变论文能否毕业、实习能否外出、方向是否有算力的未知条件；低影响信息不要抢占注意力。勾选状态自动保存在本机。', 'warn') +
      '<div class="filters filter-stack">' + filterGroup('影响', 'verifyImpact', [['all', '全部'], ['critical', '关键'], ['high', '高'], ['medium', '中']], state.verifyImpact) +
      filterGroup('本次会话', 'verifyStatus', [['all', '全部'], ['open', '未处理'], ['done', '已标记']], state.verifyStatus) + '</div>' +
      '<div class="result-count">显示 ' + items.length + ' / ' + JOBS.verification.length + ' 项</div><div class="verification-list">' + items.map(function (item) {
        var checked = state.checks.has(item.id);
        return '<article class="card verify-card ' + (checked ? 'done' : '') + '"><div class="card-head"><div><span class="mono-sm">' + escapeHtml(item.area) + '</span><h3>' + escapeHtml(item.title) +
          '</h3></div><div>' + badge(item.impact, item.impact === 'critical' ? 'b-low' : item.impact === 'high' ? 'b-mid' : 'b-dim') + ' ' + evidenceBadge(item.evidence) + '</div></div><p><b>核验动作：</b>' + escapeHtml(item.action) +
          '</p><label class="mini-check"><input type="checkbox" data-check-id="' + escapeHtml(item.id) + '"' + (checked ? ' checked' : '') + '> 标记已处理</label></article>';
      }).join('') + '</div>' +
      section('每月巡检') + checkList('monthly', TOOLS.monthly.t, TOOLS.monthly.items.map(function (item, i) { return { id: 'monthly-' + i, text: item }; }), '建议在你后续的持久化系统中设为重复任务。') + '</div>';
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

  function render(keepScroll) {
    var route = currentRoute();
    var offset = keepScroll ? window.pageYOffset : 0;
    try {
      app.innerHTML = renderers[route]();
    } catch (error) {
      // 渲染失败时显示原因，避免整页空白让人无法判断问题
      app.innerHTML = '<div class="page"><div class="callout bad"><span class="t">页面渲染失败：' +
        escapeHtml(route) + '</span><p>' + escapeHtml(error && error.message ? error.message : String(error)) +
        '</p><p>请确认 data 目录下的六个数据文件均已随 index.html 一起打开。</p></div></div>';
    }
    document.querySelectorAll('.nav-item').forEach(function (item) {
      var active = item.getAttribute('data-route') === route;
      item.classList.toggle('active', active);
      if (active) item.setAttribute('aria-current', 'page'); else item.removeAttribute('aria-current');
    });
    buildPageToc();
    bindPageEvents();
    window.scrollTo(0, offset);
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
        var target = document.getElementById(link.getAttribute('data-anchor'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    allPapers().forEach(function (item) { entries.push({ route: 'reading', title: item.t, detail: (item.ax || '') + ' ' + (item.intro || '') + ' ' + item.why }); });
    TOOLS.core.forEach(function (item) { entries.push({ route: 'tools', title: item.n, detail: item.use + ' ' + (item.ref || '') }); });
    JOBS.teams.forEach(function (item) { entries.push({ route: 'jobs', title: item.company + ' · ' + item.name, detail: item.summary + ' ' + item.tags.join(' ') }); });
    SKILLS.signals.forEach(function (item) { entries.push({ route: 'skills', title: item.name, detail: item.judgement }); });
    PORTFOLIO.projects.forEach(function (item) { entries.push({ route: 'portfolio', title: item.name, detail: item.problem }); });
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
      return '<a href="#' + escapeHtml(item.route) + '" class="search-result"><span class="where">' + escapeHtml(routeMeta[item.route][0]) + '</span><strong>' +
        escapeHtml(item.title) + '</strong><span class="excerpt">' + escapeHtml(item.detail.slice(0, 92)) + (item.detail.length > 92 ? '…' : '') + '</span></a>';
    }).join('') : '<div class="empty">没有匹配的策展内容</div>';
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
