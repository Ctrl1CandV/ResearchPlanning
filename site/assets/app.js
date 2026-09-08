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

  // 2026-09-06 方向重构：论文换轨后的勾选迁移（一次性的同篇迁移表，迁移后可整体删除）。
  // 防护纪律：只处理 paper-<level>-<ax> 形态的 id，且「旧勾选存在、新 id 无记录」才改写；
  // paper-quiz-*（按 ax，不受换轨影响）、week-*（旧周任务的完成不得算作新周任务的完成）、
  // skill-*、verify-*、里程碑 id 一律不在映射表内，天然不迁移。迁移幂等，重复执行无副作用。
  var PAPER_MIGRATIONS = {
    'paper-common-2005.11401': 'paper-D-2005.11401',
    'paper-common-2304.03442': 'paper-C-2304.03442',
    'paper-common-2310.08560': 'paper-C-2310.08560',
    'paper-common-2404.13501': 'paper-C-2404.13501',
    'paper-common-2502.12110': 'paper-C-2502.12110',
    'paper-common-2501.13956': 'paper-C-2501.13956',
    'paper-common-2504.19413': 'paper-C-2504.19413',
    'paper-common-2402.17753': 'paper-C-2402.17753',
    'paper-common-2404.16130': 'paper-D-2404.16130',
    'paper-common-2410.05779': 'paper-D-2410.05779',
    'paper-A-2606.04990': 'paper-common-2606.04990',
    'paper-A-2608.14711': 'paper-common-2608.14711',
    'paper-A-2607.07405': 'paper-common-2607.07405',
    'paper-A-2608.11274': 'paper-common-2608.11274',
    'paper-A-2608.22331': 'paper-common-2608.22331',
    'paper-A-2606.14589': 'paper-common-2606.14589',
    'paper-A-2606.09071': 'paper-common-2606.09071',
    'paper-D-2606.06036': 'paper-A-2606.06036'
  };
  function migrateChecks(ids) {
    var out = [];
    var changed = false;
    ids.forEach(function (id) {
      var next = id;
      if (/^paper-(common|[A-F])-\d{4}\.\d{4,5}$/.test(id) && PAPER_MIGRATIONS[id]) next = PAPER_MIGRATIONS[id];
      if (next !== id) changed = true;
      if (out.indexOf(next) < 0) out.push(next);
    });
    if (changed) storeSet(STORE.checks, JSON.stringify(out));
    return out;
  }

  var state = {
    checks: new Set(migrateChecks(savedChecks())),
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
  // 跨路由锚点：搜索结果/跨页链接的目标不在当前页时，先记下锚点再切 hash，
  // render() 末尾滚动到位并展开所在 details（实施路线 §4-D6）
  var pendingAnchor = null;
  // 防重入标记：锚点落空→重置筛选→重渲染一轮内只兜底一次；锚点流程结束即复位
  var anchorFilterRetry = false;
  // 锚点滚动统一入口：立即滚 + 双 rAF 后按最终布局补滚（details 展开改变布局时也能停准；
  // behavior 用 auto，避免 smooth 动画被渲染节流吞掉——审查 R3 实测修正）
  function scrollAnchorNow(el) {
    // 临时关闭全局 smooth（html{scroll-behavior:smooth}），防止动画期间布局变化吞掉滚动
    var html = document.documentElement;
    var prev = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    el.scrollIntoView({ behavior: 'auto', block: 'start' });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.scrollIntoView({ behavior: 'auto', block: 'start' });
        html.style.scrollBehavior = prev || '';
      });
    });
  }
  var FILTER_KEYS = ['jobCity', 'jobTier', 'jobStage', 'jobFamily', 'jobEvidence',
    'skillPriority', 'skillDomain', 'verifyImpact', 'verifyStatus'];

  var routeMeta = {
    dashboard: ['当前安排', '这周要交什么、做到哪了、接下来点哪里'],
    baseline: ['读研前提', '导师怎么参与当前课题、哪些制度和资源还要核实；历史纠正也归档在这里'],
    research: ['研究主线', '唯一主线是任务完成验证；B/E 是扩展，C/D/F 已入档，第一篇只投入主线'],
    reading: ['本周学习', '90 天计划一次看一周：先公共必读，再进主线方向'],
    tools: ['工具与方法', '按任务速查工具；方法论在 grad-companion 插件里'],
    jobs: ['实习与岗位', '实习是当下的事：按四级阶梯推进，先城市后岗位'],
    skills: ['技能学习', '当前最缺的是评测与可观测；其余路线按优先级筛选'],
    portfolio: ['作品集', 'Atlas 和 AgentParliament 各还缺什么证据，一眼可见'],
    career: ['求职准备', '只写两年后仍成立的判断，临近 2027.12 整页重做'],
    verify: ['待核验事项', '先处理会阻碍研究推进的少数前提，核完就销号']
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
    'ai-app': 'AI 应用', agent: 'Agent 架构', harness: '评测与可观测', rag: 'RAG 与知识库',
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

  // 页头只保留标题与导语两级（v3 去编号、去英文标语；标题来自 routeMeta）
  function pageHead(route) {
    var meta = routeMeta[route];
    return '<header class="page-head"><h2>' + escapeHtml(meta[0]) + '</h2><p class="lede">' + escapeHtml(meta[1]) + '</p></header>';
  }

  // 章节标题。short 可选：右栏页内目录用短名，正文标题不变
  function section(title, id, short) {
    return '<h3 class="sec"' + (id ? ' id="' + escapeHtml(id) + '"' : '') +
      (short ? ' data-short="' + escapeHtml(short) + '"' : '') + '>' + escapeHtml(title) + '</h3>';
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
    var name = level === 's1' ? '一手' : level === 's2' ? '二手' : '推断（未核实）';
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
        { t: '公共必读前三篇读完（假成功刻画、Strategic Verification 预印本、Verified Tool Calls），写下差别一页纸', to: '#reading' },
        { t: '去学位办要现行版《学位成果要求》和《实习管理办法》的完整原文', to: '#verify' },
        { t: '和导师确认 GPU、API 预算、服务器权限，以及组里做过的相关方向', to: '#verify' },
        { t: 'Atlas 全量测试跑通，再做一次 dry-run；minibank-trap 升级成受控评测', to: '#portfolio' }
      ];
    }
    var acts = [];
    var w = plan90Week(now);
    // 本周要交什么由首页的「本周交付」卡承载，这里只列其余行动；
    // 执行期过了不说「已执行完」——按未验收数如实报告（设计说明 §5.1：日期不等于完成）
    if (w > 12) {
      var un = unverifiedWeeks(now);
      acts.push({ t: '90 天计划的执行期已结束，还有 ' + un.length + ' / 12 周没有标记验收', to: un.length ? '#reading/week/' + un[0] : '#reading' });
    }
    if (phaseId === 'y1a') acts.push({ t: '注册 openEuler 开源实习领任务，报名 OSPP 点亮计划', to: '#jobs' });
    if (phaseId === 'y1b') acts.push({ t: '寒假：重庆本地线索逐家核，是不是真在招、时间能不能和学业错开', to: '#jobs' });
    if (phaseId === 'y2') acts.push({ t: '两个项目把四项核心数字测出来；开始整理杭州雇主清单', to: '#portfolio' });
    if (phaseId === 'sprint' || phaseId === 'intern') acts.push({ t: '按偏好顺序投递、跟踪面试；北京的 offer 要同时满足“方向带得走 + 走人计划写清楚”', to: '#jobs' });
    acts.push({ t: '每月例行：看 Scholar 引用提醒、扫 arXiv、跟进 openEuler 和 OSPP、清掉已核验的项', to: '#verify' });
    return acts;
  }

  // 早于当前周（或执行期已过时的全部周）且未勾验收的周次，W4/W8/W12 这类里程碑同理
  function unverifiedWeeks(now) {
    var w = plan90Week(now);
    var upto = w > 12 ? 12 : w - 1;
    var out = [];
    for (var i = 1; i <= upto; i += 1) {
      if (!state.checks.has('plan90v2-W' + i)) out.push('W' + i);
    }
    return out;
  }

  // 进度总览：三条进度线。与 localStorage 同批上线；存储不可用时数字仅为会话态
  function renderProgress() {
    var common = allPapers().filter(function (p) { return p.level === 'common'; });
    var cDone = common.filter(function (p) { return state.checks.has(p.id); }).length;
    var wDone = RESEARCH.plan90.filter(function (w) { return state.checks.has('plan90v2-' + w.w); }).length;
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

  // ── 12 周条：90 天计划的全景导航（v3 改为链接，选中周走 #reading/week/Wn，前进后退可回）。
  // 当前周实心、选中周描边、已勾周 ✓ 标记 + 完成底色（不只靠颜色区分），里程碑周星标 ──
  function renderWeekStrip(now, selected) {
    var w = plan90Week(now);
    var mile = { 4: 1, 8: 1, 12: 1 };
    var groups = [1, 2, 3].map(function (ph) {
      var chips = RESEARCH.plan90.filter(function (item) { return item.ph === ph; }).map(function (item) {
        var num = parseInt(String(item.w).slice(1), 10);
        var cls = 'ws-chip' + (num === w ? ' now' : '') + (num === selected && num !== w ? ' sel' : '') +
          (state.checks.has('plan90v2-' + item.w) ? ' done' : '') +
          (mile[num] ? ' mile' : '');
        var label = num === w ? escapeHtml(item.w) + '（本周）' : escapeHtml(item.w);
        return '<a class="' + cls + '" href="#reading/week/' + escapeHtml(item.w) + '" title="' + label + '"' +
          (num === w ? ' aria-current="date"' : '') + ' aria-label="' + label + '">' + escapeHtml(item.w) + '</a>';
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

  // ── 首页（当前安排）：本周交付占主区，进度与待补在辅区，长期信息全部下沉（实施路线 §5.1） ──

  // 本周交付卡：首屏主区。执行期外分别给「还没开学」与「未验收」口径
  function renderHomeWeekCard(now) {
    var w = plan90Week(now);
    // 主线一句话放卡片头部（审查 R7：手机 390 首屏要能答「主线是什么」）
    var mainline = '<p class="home-mainline" style="margin:0 0 10px">主线：<b>' + escapeHtml(RESEARCH.angles[0].name) +
      '</b> · <a href="#research">研究问题 →</a></p>';
    if (w >= 1 && w <= 12) {
      var item = RESEARCH.plan90[w - 1];
      return '<section class="card home-week pad-lg">' + mainline +
        '<div class="card-head"><strong>本周要交什么 · ' + escapeHtml(item.w) +
        '（Phase ' + escapeHtml(item.ph) + '）</strong>' + (item.mile ? badge('有检查点', 'b-acc') : '') + '</div>' +
        '<p class="home-deliver"><b>交付</b>' + linkAx(item.out) + '</p>' +
        '<dl class="kv"><dt>要读</dt><dd>' + linkAx(item.read) + '</dd><dt>要做</dt><dd>' + linkAx(item.run) + '</dd></dl>' +
        '<a class="btn primary" href="#reading">进入本周任务 →</a></section>';
    }
    if (w === 0) {
      return '<section class="card home-week pad-lg">' + mainline +
        '<div class="card-head"><strong>开学前的准备</strong></div>' +
        '<p class="home-deliver"><b>现在</b>90 天计划开学后启动。先读公共必读前四篇，把问题立起来。</p>' +
        '<a class="btn primary" href="#reading/common">先读公共必读 →</a></section>';
    }
    var un = unverifiedWeeks(now);
    return '<section class="card home-week pad-lg">' + mainline +
      '<div class="card-head"><strong>90 天计划 · 执行期已结束</strong></div>' +
      '<p class="home-deliver"><b>收尾</b>还有 ' + un.length + ' / 12 周没有标记验收。日期过了不等于完成，落下的周从下面补上。</p>' +
      (un.length ? '<a class="btn primary" href="#reading/week/' + escapeHtml(un[0]) + '">从 ' + escapeHtml(un[0]) + ' 开始补 →</a>' : '<a class="btn primary" href="#reading">查看 12 周总览 →</a>') +
      '</section>';
  }

  // 辅区待补提示：逾期周 + 未处理的 critical 核验（审查 R4：没有逾期 ≠ 全部验收，两套口径分开算）
  function renderFallenNotice(now) {
    var un = unverifiedWeeks(now);
    var crit = JOBS.verification.filter(function (v) {
      return v.impact === 'critical' && !state.checks.has(v.id);
    });
    // 「12 周全部验收」必须是事实：plan90v2-W1…W12 全部勾选才算
    var allWeeks = RESEARCH.plan90.every(function (item) { return state.checks.has('plan90v2-' + item.w); });
    if (!un.length && !crit.length) {
      // 没有逾期项：区分「全部验收」与「目前没有逾期」两种表述，不得混用
      var body = allWeeks
        ? '12 周全部验收，关键核验也清零了。'
        : '目前没有逾期的周任务，也没有未处理的关键核验。计划还在进行中，按周推进即可。';
      return '<div class="card"><strong>没有落下的事</strong><p class="muted" style="margin:6px 0 0">' + body + '</p></div>';
    }
    var rows = '';
    if (un.length) {
      rows += '<li>落下的周：<b class="n">' + un.length + '</b> 个（' + un.slice(0, 4).map(escapeHtml).join('、') + (un.length > 4 ? ' 等' : '') +
        '）<a href="#reading/week/' + escapeHtml(un[0]) + '">从 ' + escapeHtml(un[0]) + ' 补 →</a></li>';
    } else {
      // 没有逾期周时也如实报告状态，与「全部验收」区分（审查 R4）
      rows += '<li>' + (allWeeks ? '12 周已全部验收' : '周任务暂无逾期，进行中（' + doneWeeksCount() + ' / 12 已验收）') + '</li>';
    }
    if (crit.length) {
      rows += '<li>关键核验：<b class="n">' + crit.length + '</b> 项未处理<a href="#verify">去核验清单 →</a></li>';
    }
    return '<div class="card"><strong>待补</strong><ul class="fallen-list">' + rows + '</ul></div>';
  }

  // 已验收周数
  function doneWeeksCount() {
    return RESEARCH.plan90.filter(function (item) { return state.checks.has('plan90v2-' + item.w); }).length;
  }

  // 下一篇相关论文：第一条未勾的公共必读（预印本指向外链说明），全读完则指向主线轨道
  function renderNextPaper() {
    var common = arr(RESEARCH.reading.common.items);
    for (var i = 0; i < common.length; i += 1) {
      var p = common[i];
      var key = paperIdKey(p, i);
      if (!state.checks.has('paper-common-' + key)) {
        var href = p.ax ? '#reading/common/' + encodeURI(p.ax) : (p.srcUrl || '#reading/common');
        var label = p.ax ? escapeHtml(p.t) : escapeHtml(p.t) + '（站外预印本）';
        return '<div class="card"><span class="hn-k">下一篇相关阅读</span><p>' + label + '</p><a href="' + href + '">' +
          (p.ax ? '打开阅读卡 →' : '去读原文 →') + '</a></div>';
      }
    }
    return '<div class="card"><span class="hn-k">下一篇相关阅读</span><p>公共必读 12 条已读完，进入主线方向 A 的必读。</p><a href="#reading/A">进入方向 A →</a></div>';
  }

  // 当前需要确认的前提：未处理核验按「学位制度 → 实习条件 → 预算 → 复现」取前三（排序规则与 verify 页一致）
  function renderPendingVerify() {
    var prio = verifyPrio();
    var open = JOBS.verification.filter(function (v) { return !state.checks.has(v.id); })
      .slice().sort(function (a, b) { return (prio[a.id] || 90) - (prio[b.id] || 90); })
      .slice(0, 3);
    return '<div class="card"><span class="hn-k">当前需要确认的前提</span><p>' +
      open.map(function (v) { return escapeHtml(v.title); }).join('；') + '</p><a href="#verify">看全部待核验 →</a></div>';
  }

  function renderDashboard() {
    var now = new Date();
    var cur = currentPhase(now);
    return '<div class="page">' + pageHead('dashboard') +
      '<div class="home-grid"><div>' +
        renderHomeWeekCard(now) +
        '<section class="card" style="margin-bottom:0"><div class="card-head"><strong>这个阶段的行动</strong><span class="session-note">' +
          escapeHtml(cur.phase.name) + (cur.daysLeft != null ? ' · 距 ' + escapeHtml(cur.phase.next) + ' ' + cur.daysLeft + ' 天' : '') + '</span></div>' +
        '<ul class="now-actions">' + phaseActions(cur.phase.id, now).map(function (a) {
          return '<li><a href="' + a.to + '">' + escapeHtml(a.t) + '</a></li>';
        }).join('') + '</ul></section>' +
      '</div><div class="home-side">' +
        renderProgress() +
        renderFallenNotice(now) +
      '</div></div>' +
      '<div class="home-next">' + renderNextPaper() + renderPendingVerify() +
        '<div class="card"><span class="hn-k">工程证据</span><p>Atlas 与 AgentParliament 的实测数字和下一个待验收里程碑。</p><a href="#portfolio">打开作品集 →</a></div>' +
      '</div>' +
      '<p class="home-mainline">第一篇论文只做主线这一件事，B/E 是扩展，C/D/F 已入档。<a href="#research">查看研究问题 →</a></p>' +
      details('三年主路线（展开查看节奏）', renderRoadmapSpine(now), false, '', true) +
      '</div>';
  }

  function renderBaseline() {
    // 审查 R5：收敛为「导师怎样参与 → 当前制度与资源核验 → 档案」；论文/项目/纠正全部归档折叠
    var correctionsHtml = '<div class="grid c2">' + DATA.corrections.map(function (item, i) {
      // 已被后续主线取代的纠正由数据字段 superseded 标记（facts.js），归档时如实标注
      var superseded = !!item.superseded;
      return '<article class="card correction"><div class="wrong">当时的假设 · ' + escapeHtml(item.wrong) + '</div><h4>' + rich(item.right) +
        (superseded ? ' ' + badge('已被 2026-09 主线取代 · 仅作历史', 'b-dim') : '') +
        '</h4><p>' + rich(item.why) + '</p><div class="impact"><b>行动影响</b> ' + escapeHtml(item.impact) + '</div>' + sourceLine(item.src, item.ref) + '</article>';
    }).join('') + '</div>';
    return '<div class="page">' + pageHead('baseline') +
      anchorNav([['advisor', '导师参与'], ['rules', '学校制度'], ['partners', '校企资源'], ['employment', '就业数据与纠正']]) +
      section('导师怎样参与当前课题', 'advisor', '导师参与') +
      '<div class="grid c2"><div class="card">' + kv(DATA.advisor.basic, true) + '</div><div class="card"><strong>能借力的做法</strong>' +
      DATA.advisor.methodology.map(function (item) { return '<div class="method-row"><b>' + escapeHtml(item.k) + '</b><p>' + escapeHtml(item.v) + '</p></div>'; }).join('') + '</div></div>' +
      callout('怎么让导师参与进来', DATA.advisor.tactic, '') +
      details('导师的论文与项目档案（代表论文 · 公开项目 · 公开信息盲区）',
        '<h4 class="sub">代表论文</h4>' + table(['年份', '期刊 / DOI', '主题', '引用快照'], DATA.advisor.papers.map(function (p) {
          // DOI 里的斜杠必须保留字面量，encodeURIComponent 会把它转成 %2F 导致 doi.org 解析失败
          return [text(p.y), '<a href="https://doi.org/' + encodeURI(p.doi) + '" target="_blank" rel="noreferrer">' + escapeHtml(p.j) + '</a><div class="mono-sm">' + escapeHtml(p.doi) + '</div>', text(p.t), text(p.cite)];
        })) + '<p class="mono-sm">' + escapeHtml(DATA.advisor.papersNote) + '</p>' +
        '<div class="grid c2"><div class="card"><strong>公开项目</strong>' + table(['项目', '级别', '时间'], DATA.advisor.projects.map(function (r) { return r.map(function (c) { return text(c); }); })) + '</div>' +
        '<div class="card"><strong>公开信息盲区</strong>' + list(DATA.advisor.blindspots, false, true) + '</div></div>', false, '', true) +
      section('学校制度：查到的和查不到的分开列', 'rules', '学校制度') +
      DATA.rules.map(function (item, i) {
        // details id 供搜索锚点 rule-<i> 定位（实施路线 §4-D6）
        return details(item.q, '<p>' + rich(item.a) + '</p>' + (item.action ? callout('下一步核验', escapeHtml(item.action), 'warn') : '') + sourceLine(item.src, item.ref), false, badge(item.src === 's1' ? '一手' : '待复核', item.src === 's1' ? 'b-high' : 'b-mid')).replace('<details class="acc', '<details id="rule-' + i + '" class="acc');
      }).join('') +
      section('校企资源：有通道，不等于机会自动到手', 'partners', '校企资源') +
      callout('两处更正', list(DATA.partners.corrections, false, true), 'warn') +
      '<div class="grid c2">' + DATA.partners.items.map(function (item) {
        return '<article class="job tier-' + escapeHtml(item.tier) + '"><div class="jh"><div class="jt">' + escapeHtml(item.name) + '</div>' + badge(item.tier, 'b-acc') +
          '</div><div class="jm">' + badge(item.level, 'b-info') + '</div><p>' + rich(item.note) + '</p><div class="jq"><b>对我的意义：</b>' + rich(item.why) + '</div>' + sourceLine(item.src, item.ref) + '</article>';
      }).join('') + '</div>' +
      details('可关注实验室（' + DATA.partners.labs.length + ' 个 · 背景档案）', table(['平台', '层级', '和路线怎么接上'], DATA.partners.labs.map(function (r) { return r.map(function (c) { return text(c); }); })) +
      '<p class="mono-sm">' + rich(DATA.partners.labNote) + '</p>', false, '', true) +
      section('就业数据与历史纠正', 'employment', '数据与纠正') +
      details('落实率、雇主样本与薪资警告（背景数据）', '<div class="grid c2"><div>' + table(['统计范围', '比例', '时间'], DATA.employment.official.map(function (r) { return r.map(function (c) { return text(c); }); })) +
      '<div class="card"><strong>去了哪些公司（样本）</strong><p>' + escapeHtml(DATA.employment.employers) + '</p></div></div>' +
      '<div>' + callout('薪资数字不要引用', DATA.employment.salaryWarning, 'bad') + '<div class="card"><strong>去哪核实</strong><p>' + escapeHtml(DATA.employment.authoritative) + '</p>' + sourceLine(DATA.employment.src, DATA.employment.ref) + '</div></div></div>', false, '', true) +
      details('四条纠正记录（历史判断的修订 · 第三条旧结论已被主线取代）', correctionsHtml, false, '', true).replace('<details class="acc', '<details id="corrections-archive" class="acc') +
      details(DATA.wafNote.title, DATA.wafNote.body, false, '', true) + '</div>';
  }

  function renderResearch() {
    // 方向三层呈现（2026-09-06 二次收编）；v3 首屏 = 主线问题三步 + W1—W4/W8 指引 + 前期验证入口
    // （实施路线 §5.2。三步文案从 positioning.body 与 method 既有句子改写，不新增研究结论）
    var byTier = { main: [], extension: [], conditional: [], paused: [] };
    RESEARCH.angles.forEach(function (a) { (byTier[a.tier] || (byTier[a.tier] = [])).push(a); });
    var main = byTier.main[0];

    // 扩展卡：价值一句 + 启动条件一句，完整 kv/评分收进卡内 details
    function extCard(angle) {
      return '<article class="mx-card"><h5>' + escapeHtml(angle.id + ' · ' + angle.name) + '</h5>' +
        '<p style="margin:0 0 6px">' + escapeHtml(angle.problem) + '</p>' +
        '<p class="muted" style="margin:0 0 10px">启动条件：主线 W8 检查点之后才有排期资格，不预先承诺。</p>' +
        details('评分、成本与风险（' + escapeHtml(angle.id) + '）',
          kv([['往哪投', angle.venue], ['成本', angle.cost], ['风险', angle.risk]], true) +
          '<div class="score-grid compact">' + Object.keys(angle.scores).map(function (key) {
            var names = { value: '问题价值', novelty: '新意（有多新）', falsifiable: '结论可否证', feasible: '一个人做得完吗', resource: '资源匹配', career: '对求职有用吗' };
            return '<div class="score-item"><span>' + names[key] + '</span>' + stars(angle.scores[key]) + '</div>';
          }).join('') + '</div>', false) +
        '<div class="mono-sm"><a href="#reading/' + escapeHtml(angle.id) + '">进入轨道资料 →</a></div></article>';
    }

    return '<div class="page">' + pageHead('research') +
      section('主线 · 第一篇只做这一件事', 'mainline', '主线') +
      '<article class="mx-card rec" style="margin-bottom:14px"><span class="mx-tag">主线</span><h5>' + escapeHtml(main.id + ' · ' + main.name) + '</h5>' +
        '<ol class="mainline-steps">' +
          '<li><b>任务完成条件</b>——任务宣称做完了，环境里什么状态算数？</li>' +
          '<li><b>预算内查证</b>——只查得到一部分证据时，查哪几条最划算？</li>' +
          '<li><b>完成判断</b>——证据齐到什么程度敢判通过，什么时候承认无法确认？</li>' +
        '</ol>' +
        details('方法草案与实验设计（含六臂对照与两列标注）', list(main.method), false) +
        '<p class="mono-sm" style="margin:8px 0 0">' + escapeHtml(main.en) + '</p></article>' +
      '<div class="grid c2" style="margin-bottom:14px">' +
        '<div class="card" style="margin-bottom:0"><strong>W1—W4 要验证什么</strong>' +
          '<p style="margin:6px 0">把「查什么证据」从拍脑袋变成协议：标注两列、定检索预算、跑通公开环境的第一组对照。</p>' +
          '<a href="#reading/week/W1">从 W1 看起 →</a></div>' +
        '<div class="card" style="margin-bottom:0"><strong>W8 怎么决定去留</strong>' +
          '<p style="margin:6px 0">检查点：协议与基准已定型、第一组对照数字已测出；达不到就按预案调整，不硬扛。</p>' +
          '<a href="#reading/week/W8">看 W8 检查点 →</a></div>' +
      '</div>' +
      '<p class="home-mainline">前期验证：公共必读前三篇立问题（<a href="#reading/common">公共必读</a>）；' +
      '基线复现可行性在 <a href="#verify">待核验事项</a> 里跟踪。</p>' +
      details('为什么是这个方向（完整定位与边界）', callout(RESEARCH.positioning.title, RESEARCH.positioning.body, 'good'), false, '', true) +
      callout('先做哪个', RESEARCH.angleAdvice, '') +
      (byTier.extension.length ? section('扩展 · 主线稳定后才排期', 'extension', '扩展方向') +
        '<div class="grid c2">' + byTier.extension.map(extCard).join('') + '</div>' : '') +
      (arr(RESEARCH.archived).length ? details('备选与暂缓方向（' + RESEARCH.archived.length + ' 条 · 已收进档案，不在计划里）',
        '<div class="grid c2">' + RESEARCH.archived.map(function (a) {
          return '<div class="card"><div class="card-head"><strong>方向 ' + escapeHtml(a.id) + ' · ' + escapeHtml(a.name) + '</strong>' +
            badge(a.status, a.status === '条件性备选' ? 'b-mid' : 'b-dim') + '</div>' +
            '<p>' + escapeHtml(a.line) + '</p><div class="mono-sm"><a href="#reading/' + escapeHtml(a.track) + '">进入轨道资料 →</a></div></div>';
        }).join('') + '</div>', false, '', true) : '') +
      details('已拒绝的方向（2026-08-28 决定，2026-09-06 复核维持，存档防止重新捡起）', '<div class="grid c2">' + arr(RESEARCH.rejected).map(function (r) {
        return '<div class="card"><strong>' + escapeHtml(r.name) + '</strong><p>' + escapeHtml(r.reason) + '</p></div>';
      }).join('') + '</div>', false, '', true) +
      section('参考材料：指标、竞争与导师沟通', 'refs', '参考材料') +
      details('当前指标与实验条件（' + RESEARCH.metrics.length + ' 组指标，设计实验时查阅）',
        callout('为什么一个问题两种产出', RESEARCH.dualTrack, 'good') + '<div class="grid c3">' + RESEARCH.metrics.map(function (metric) {
        return '<div class="card"><strong>' + escapeHtml(metric.g) + '</strong>' + list(metric.items) + '</div>';
      }).join('') + '</div>', false, '', true) +
      details('已经饱和的方向（' + RESEARCH.saturated.length + ' 条 · 防止重复投入）', table(['看起来能做的题目', '谁已经做了', '结论'], RESEARCH.saturated.map(function (item) {
        return [text(item.t), text(item.e), '<strong>' + text(item.j) + '</strong>'];
      })), false, '', true) +
      details('竞争团队与跟踪判断（' + RESEARCH.rivals.length + ' 组）', '<div class="grid c2">' + RESEARCH.rivals.map(function (item) {
        var cls = item.level === 'danger' ? 'bad' : item.level === 'warn' ? 'warn' : '';
        return '<div class="card rival ' + cls + '"><div class="card-head"><strong>' + escapeHtml(item.n) + '</strong>' + badge(item.f, cls === 'bad' ? 'b-low' : cls === 'warn' ? 'b-mid' : 'b-dim') +
          '</div><p>' + escapeHtml(item.w) + '</p><div class="mono-sm">' + escapeHtml(item.note) + '</div></div>';
      }).join('') + '</div>' + callout('我们怎么和它们比', RESEARCH.rivalJudgement, 'warn'), false, '', true) +
      details('见导师要用的材料（翻译表 · 组会开场 · 15 页汇报骨架 · 第一封邮件存档）',
        table(['Agent 说法', '导师熟悉的说法'], RESEARCH.translate.map(function (r) { return [text(r[0]), rich(r[1])]; })) +
        '<blockquote><p>' + escapeHtml(RESEARCH.pitch) + '</p><cite>组会开场可以这么说</cite></blockquote>' +
        '<p class="muted">2026-08 已和导师确认他会支持（见「读研前提」第四条纠正）。下面这份 15 页骨架，W4、W8、W12 组会可以反复用；第一封邮件留档备查。</p>' +
        table(['页码', '讲什么', '怎么讲'], RESEARCH.reportDeck.map(function (r) { return [text(r.p), text(r.c), text(r.k)]; })) +
        '<div class="card"><strong>汇报的三条注意</strong>' + list(RESEARCH.reportTips, false, true) + '</div>' +
        '<h4 class="sub">' + escapeHtml(RESEARCH.firstMail.title) + '</h4>' +
        '<p class="muted">' + escapeHtml(RESEARCH.firstMail.dont) + '</p>' +
        '<pre class="mail-body">' + escapeHtml(RESEARCH.firstMail.body) + '</pre>' +
        '<p class="muted">' + escapeHtml(RESEARCH.firstMail.effect) + '</p>', false, '', true) + '</div>';
  }

  function allPapers() {
    // 公共必读 + 各方向论文统一收集，供搜索索引与进度计数使用
    var result = [];
    arr(RESEARCH.reading.common.items).forEach(function (paper, index) {
      result.push(Object.assign({ level: 'common', track: null, id: 'paper-common-' + paperIdKey(paper, index) }, paper));
    });
    Object.keys(RESEARCH.reading.tracks).forEach(function (tid) {
      RESEARCH.reading.tracks[tid].papers.forEach(function (paper, index) {
        result.push(Object.assign({ level: tid, track: tid, id: 'paper-' + tid + '-' + paperIdKey(paper, index) }, paper));
      });
    });
    return result;
  }

  // 方向短名（目录卡 / L2 面包屑用），缺失时回退到编号
  var trackShort = { A: '任务完成验证', B: '交叉审查', C: '记忆评测', D: '图结构记忆', E: '代码基准审计', F: '记忆压缩' };
  // 方向档位徽章（仅主线与扩展还在 angles 里；C/D/F 已移入 RESEARCH.archived，走档案徽章）
  var TRACK_TIER_BADGE = {
    main: ['主线 · 第一篇', 'b-acc'],
    extension: ['扩展 · 主线稳定后', 'b-info'],
    conditional: ['条件性备选', 'b-mid'],
    paused: ['暂缓 · 资料保留', 'b-dim']
  };
  function trackTier(tid) {
    var hit = null;
    arr(RESEARCH.angles).forEach(function (a) { if (a.id === tid) hit = a; });
    return hit ? hit.tier : null;
  }
  var refKindIcons = { book: '📕', web: '🌐', paper: '📄' };

  // ── 学习层硬映射：方向↔技能的单向导航（「需要练什么」 vs 「论文主场」），不要为了对称互相补边。
  //    规则并入 MAINTENANCE §6；原设计文档已删，历史裁定见 PAPER-DEEP-READ-DESIGN.md §1.2。 ──
  var READING_L2 = { common: 1, A: 1, B: 1, C: 1, D: 1, E: 1, F: 1 };
  var READING_SKILL_MAP = {
    common: ['skill-eval', 'skill-agent-patterns'],
    A: ['skill-eval', 'skill-agent-patterns'],
    B: ['skill-eval', 'skill-agent-patterns'],
    C: ['skill-memory', 'skill-eval'],
    D: ['skill-memory', 'skill-graphdb', 'skill-rag'],
    E: ['skill-eval', 'skill-algo'],
    F: ['skill-memory', 'skill-graphdb']
  };
  var SKILL_TRACK_MAP = {
    'skill-eval': ['A', 'E'],
    'skill-memory': ['C', 'D', 'F'],
    'skill-rag': ['D'],
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
    var html = escapeHtml(value).replace(/(\d{4}\.\d{4,5})/g, function (m) {
      var home = map[m];
      return home ? '<a class="ax-link" href="#reading/' + home.track + '/' + m + '">' + m + '</a>' : m;
    });
    // 审查 R6：周任务里「预印本」「HGB」这类无编号或简称的说法，也要能点到真实去处。
    // 标题匹配走 allPapers 的标题字典（精确全名），简称走显式映射；都不命中就保持原文。
    var byTitle = {};
    allPapers().forEach(function (p) {
      if (p.t) byTitle[p.t] = p;
    });
    // 全名/知名简称别名；「Strategic Verification」是预印本标题的前缀，indexOf 片段可命中
    var aliases = { 'HGB': 'Are we really making much progress? Revisiting HGNNs (HGB)' };
    html = html.replace(/(Strategic Verification|HGB|假成功刻画|Verified Tool Calls|REFLECT|MAST)/g, function (alias) {
      var title = aliases[alias] || alias;
      // 全名匹配：标题字典里找含该别名的论文
      var hit = byTitle[title];
      if (!hit) {
        var keys = Object.keys(byTitle);
        for (var i = 0; i < keys.length; i += 1) {
          if (keys[i].indexOf(title) === 0 || keys[i].indexOf(alias) >= 0) {
            // 多命中取最长匹配标题（确定性消歧，不依赖字典序；qwen 复审对 linkAx 的提示）
            if (!hit || keys[i].length > hit.t.length) hit = byTitle[keys[i]];
          }
        }
      }
      if (!hit) return alias;
      var track = hit.level || 'common';
      var href, label;
      if (hit.ax) {
        href = '#reading/' + track + '/' + hit.ax;
        label = alias;
      } else if (hit.srcUrl) {
        href = hit.srcUrl;
        label = alias + '（站外预印本 ↗）';
      } else return alias;
      return '<a class="ax-link" href="' + encodeURI(href) + '"' + (hit.ax ? '' : ' target="_blank" rel="noreferrer"') + '>' + label + '</a>';
    });
    return html;
  }

  function trackHours(list) {
    return arr(list).reduce(function (sum, p) {
      var h = parseInt(String(p.h || ''), 10);
      return sum + (isNaN(h) ? 0 : h);
    }, 0);
  }

  // L2 页头：面包屑 + 纯标题（v3 去编号 eyebrow）
  function l2Head(parentRoute, eyebrowText, title, lede, crumbHref, crumbLabel) {
    return '<nav class="crumb"><a href="' + crumbHref + '">' + escapeHtml(crumbLabel) + '</a><span class="crumb-here">/ ' +
      escapeHtml(eyebrowText) + '</span></nav>' +
      '<header class="page-head"><h2>' + escapeHtml(title) + '</h2><p class="lede">' + escapeHtml(lede) + '</p></header>';
  }

  // 论文条目的勾选 id 键：有 ax 用 ax；无 ax 的预印本从 srcUrl 提取手稿号（如 202608.2057），
  // 都没有才退化为序号（仅防御，正常数据不会走到）。id 全站要稳定，改规则会丢已存勾选。
  function paperIdKey(p, i) {
    if (p.ax) return p.ax;
    if (p.srcUrl) {
      var m = /(\d{6}\.\d{4,5})/.exec(String(p.srcUrl));
      if (m) return m[1];
    }
    return 'x' + i;
  }

  // L2 论文行：一行 = 序号/勾选/标题/原文外链/工时/why。intro·出处·徽章上收到 L3 阅读卡，
  // 行本身即入口（data-goto 进 #reading/<level>/<ax>，PAPER-DEEP-READ-DESIGN.md §4）。
  // 无 ax 的 srcUrl 条目（预印本）渲染外链、不生成 data-goto（没有 L3 卡，绝不产生非法路由）。
  function l2PaperRows(papers, level, opts) {
    opts = opts || {};
    var cont = opts.cont || 0;
    var checkable = opts.checkable !== false;
    return arr(papers).map(function (p, i) {
      var idKey = paperIdKey(p, i);
      var id = 'paper-' + level + '-' + idKey;
      var extLink = p.ax
        ? '<a class="src-link" href="https://arxiv.org/abs/' + encodeURI(p.ax) +
          '" target="_blank" rel="noreferrer" title="arXiv 原文（本站不存 PDF）">↗ ' + escapeHtml(p.ax) + '</a>'
        : (p.srcUrl ? '<a class="src-link" href="' + encodeURI(p.srcUrl) +
          '" target="_blank" rel="noreferrer" title="站外原文（预印本，无站内阅读卡）">↗ 原文外链</a>' : '');
      var gotoAttr = p.ax ? ' data-goto="reading/' + level + '/' + encodeURI(p.ax) +
        '" tabindex="0" role="link" aria-label="打开阅读卡：' + escapeHtml(p.t) + '"' : '';
      return '<article class="lpaper"' + gotoAttr + ' id="paper-' + escapeHtml(idKey) + '"><div class="lp-row">' +
        '<span class="lp-no">' + (cont + i + 1) + '</span>' +
        (checkable ? '<label class="chk lp-check"><input type="checkbox" data-check-id="' + escapeHtml(id) + '"' +
          (state.checks.has(id) ? ' checked' : '') + ' aria-label="已读：' + escapeHtml(p.t) + '"><span class="box" aria-hidden="true"></span><span class="sr-only">已读</span></label>' : '') +
        '<div class="lp-main"><div class="lp-title">' + escapeHtml(p.t) + extLink + '<span class="lp-h">' + escapeHtml(p.h || '') + '</span></div>' +
        '<div class="lp-why">' + linkAx(p.why || '') + '</div></div></div></article>';
    }).join('');
  }

  function weekChips(from, to) {
    var out = '';
    for (var w = from; w <= to; w += 1) {
      out += '<a class="ws-chip" href="#reading/week/W' + w + '">W' + w + '</a>';
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
    // 三步分段从 common.note 的既有句子派生（前 3 / 中 6 / 后 3），不新造结论
    var steps = [
      { k: '第 1—3 篇 · 把问题立起来', v: '假成功刻画、Strategic Verification（预印本）、Verified Tool Calls，三篇读完先写与最近工作的差别' },
      { k: '第 4—9 篇 · 检测与证据获取', v: '证据溯源综述、确定性检查门、运行时合同、生产静默失败、reliability@k、噪声地板，教的是核验怎么做、变量怎么控' },
      { k: '第 10—12 篇 · 归因与评测方法', v: 'REFLECT、MAST、HGB，教的是误报怎么归因、分类怎么标、负结果怎么写' }
    ];
    return '<div class="stage-flow">' + steps.map(function (s, i) {
      return '<div class="stage"><span class="s-no">' + (i + 1) + '</span><div class="stage-body"><b>' + escapeHtml(s.k) + '</b><p>' + escapeHtml(s.v) + '</p></div></div>';
    }).join('') + '</div>';
  }

  // 选中周详情卡：阅读页主体一次只展示一周（v3 周选择路由，实施路线 §4-D5/§5.3）。
  // selected=0（未开学）给开学前引导；selected=null（无第三段）取当前周，执行期外取未验收的第一周。
  function renderWeekDetail(now, selected) {
    var w = plan90Week(now);
    var pick = selected || (w >= 1 && w <= 12 ? w : (w > 12 ? null : null));
    if (!pick) {
      if (w === 0) {
        return '<section class="card home-week pad-lg"><div class="card-head"><strong>90 天计划还没开始</strong></div>' +
          '<p class="muted" style="margin:0 0 8px">开学后按周推进，周条会自动落在当前周。入学前先把公共必读的前 4 篇读掉。</p>' +
          '<a class="btn primary" href="#reading/common">先读公共必读 →</a></section>';
      }
      var un = unverifiedWeeks(now);
      return '<section class="card home-week pad-lg"><div class="card-head"><strong>执行期已结束 · ' + un.length + ' / 12 周未验收</strong></div>' +
        '<p class="muted" style="margin:0 0 8px">日期过了不等于完成。从最早没验收的一周开始补，或者看全部 12 周的交付总览。</p>' +
        (un.length ? '<a class="btn primary" href="#reading/week/' + escapeHtml(un[0]) + '">从 ' + escapeHtml(un[0]) + ' 开始补 →</a>' : '') +
        '</section>';
    }
    var item = RESEARCH.plan90[pick - 1];
    var isNow = pick === w;
    var checked = state.checks.has('plan90v2-' + item.w);
    return '<section class="card home-week pad-lg" id="week-detail"><div class="week-head"><div><div class="ps-head">这周要做什么</div>' +
      '<div class="now-name">' + escapeHtml(item.w) + ' · Phase ' + escapeHtml(item.ph) + (isNow ? '（本周）' : '') + '</div></div><div class="now-meta">' +
      (item.mile ? badge('有检查点', 'b-acc') : '') +
      (checked ? badge('已验收', 'b-high') : '') +
      (!isNow && w >= 1 && w <= 12 ? '<a class="btn sm" href="#reading">回到本周 →</a>' : '') +
      '</div></div>' +
      '<dl class="kv"><dt>要读</dt><dd>' + linkAx(item.read) + '</dd>' +
      '<dt>要做</dt><dd>' + linkAx(item.run) + '</dd>' +
      '<dt>交什么</dt><dd>' + linkAx(item.out) + '</dd>' +
      '<dt>卡住了</dt><dd>' + linkAx(item.stuck) + '</dd></dl>' +
      (item.mile ? '<div class="tl-check" style="margin-top:10px"><b>里程碑：</b>' + linkAx(item.mile) + '</div>' : '') +
      '<label class="mini-check"><input type="checkbox" data-check-id="plan90v2-' + escapeHtml(item.w) + '"' + (checked ? ' checked' : '') + '> 这周验收完成</label>' +
      '</section>';
  }

  function renderCommonCatalog() {
    var common = RESEARCH.reading.common;
    var done = 0;
    // 与 paperIdKey 同键（预印本取 srcUrl 手稿号），勾选计数才不含漏计
    common.items.forEach(function (p, i) {
      if (state.checks.has('paper-common-' + paperIdKey(p, i))) done += 1;
    });
    var total = common.items.length;
    return '<a class="card cat-card" href="#reading/common">' +
      '<div class="card-head"><strong>' + escapeHtml(common.name) + '</strong>' + badge(total + ' 条（含 1 篇站外预印本）', 'b-acc') + '</div>' +
      '<div class="cat-meta"><span>约 ' + trackHours(common.items) + ' 小时</span><span>已读 ' + done + ' / ' + total + '</span></div>' +
      '<div class="progress-line"><div class="track"><i style="width:' + (total ? Math.round(done / total * 100) : 0) + '%"></i></div><span class="lbl">' + done + ' / ' + total + '</span></div>' +
      '<p class="cat-pitch">前三篇立问题，中间六篇讲检测与证据获取，最后三篇是归因与评测方法的范本。记忆类的十篇已移到方向 C 和 D 的延伸层。</p>' +
      '<span class="cat-go">进入公共必读 →</span></a>';
  }

  function renderTrackCatalog() {
    var recFirst = !!(RESEARCH.angles[0] && RESEARCH.angles[0].star);
    var archivedIds = {};
    arr(RESEARCH.archived).forEach(function (a) { archivedIds[a.id] = true; });
    // 档案方向（C/D/F）不渲染目录卡，在折叠块里给链接；只有主线与扩展成卡
    return Object.keys(RESEARCH.reading.tracks).filter(function (tid) { return !archivedIds[tid]; }).map(function (tid) {
      var t = RESEARCH.reading.tracks[tid];
      var core = arr(t.papers).filter(function (p) { return p.tier !== 'extend'; });
      var ext = arr(t.papers).filter(function (p) { return p.tier === 'extend'; });
      var prereq = core.filter(function (p) { return p.tier === 'prereq'; }).length;
      var main = core.length - prereq;
      var pitch = String(t.pitch || '');
      if (pitch.length > 80) pitch = pitch.slice(0, 80) + '…';
      var tier = trackTier(tid);
      var tierBadge = TRACK_TIER_BADGE[tier];
      var headBadge = '';
      if (tid === 'A' && recFirst) headBadge = badge('第一篇就从它开始', 'b-acc');
      else if (tierBadge) headBadge = badge(tierBadge[0], tierBadge[1]);
      return '<a class="card cat-card' + (tid === 'A' && recFirst ? ' cat-rec' : '') + '" href="#reading/' + tid + '">' +
        '<div class="card-head"><strong>方向 ' + tid + ' · ' + escapeHtml(trackShort[tid] || tid) + '</strong>' + headBadge + '</div>' +
        '<div class="cat-meta">' +
        (prereq ? '<span>前置 ' + prereq + ' + 必读 ' + main + '</span>' : '<span>必读 ' + core.length + ' 篇</span>') +
        (ext.length ? '<span>延伸 ' + ext.length + ' 篇</span>' : '') + '</div>' +
        '<p class="cat-pitch">' + escapeHtml(pitch) + '</p>' +
        '<span class="cat-go">进入这条路线 →</span></a>';
    }).join('');
  }

  // 阅读页（本周学习）：首屏 = 周条 + 选中周详情；主体 = 公共必读与方向轨道目录；
  // 12 周交付总览、换方向、退路全部下沉（实施路线 §5.3）。selectedWeek 来自 #reading/week/Wn。
  function renderReading(selectedWeek) {
    var now = new Date();
    var aPapers = RESEARCH.reading.tracks.A ? RESEARCH.reading.tracks.A.papers : [];
    var aHours = trackHours(aPapers);
    var totalHours = trackHours(RESEARCH.reading.common.items) + aHours;
    var fallbackBody = '<div class="grid c2">' + RESEARCH.fallback.map(function (item) {
      return '<div class="card"><strong>' + escapeHtml(item.s) + '</strong><p>' + escapeHtml(item.a) + '</p></div>';
    }).join('') + '</div>';
    var overviewRows = RESEARCH.plan90.map(function (item) {
      var checked = state.checks.has('plan90v2-' + item.w);
      return '<tr><td><a href="#reading/week/' + escapeHtml(item.w) + '">' + escapeHtml(item.w) + '</a>' +
        (checked ? ' <span class="mono-sm" style="color:var(--accent)">✓</span>' : '') + '</td><td>' + linkAx(item.out) + '</td><td>' + linkAx(item.read) + '</td></tr>';
    }).join('');
    return '<div class="page">' + pageHead('reading') +
      renderWeekStrip(now, selectedWeek) +
      renderWeekDetail(now, selectedWeek) +
      '<p class="muted" style="margin-top:10px">先读公共层，再进方向。公共必读 ' + RESEARCH.reading.common.items.length +
      ' 条全部服务主线（含 1 篇站外预印本）；方向卡只留主线和扩展，A 先走，B、E 的预备阅读排在 W8 和 W9；C/D/F 已收进档案。时间预算：公共约 ' +
      trackHours(RESEARCH.reading.common.items) + ' 小时 + 方向 A 约 ' + aHours + ' 小时 = <b>' + totalHours + ' 小时，要装进 90 天</b>，还要留出搭环境和跑对比实验的时间。</p>' +
      section('公共必读 · 主线地基', 'common-entry') + renderCommonCatalog() +
      section('方向轨道：主线与扩展', 'tracks') + '<div class="grid c2">' + renderTrackCatalog() + '</div>' +
      details('备选与暂缓轨道（C / D / F · 资料保留，不在 90 天计划里）',
        '<div class="ws-group">' + arr(RESEARCH.archived).map(function (a) {
          return '<a class="chip" href="#reading/' + escapeHtml(a.track) + '">' + escapeHtml(a.id + ' · ' + (trackShort[a.id] || a.name)) + '</a>';
        }).join('') + '</div><p class="mono-sm">启动与重启条件见研究页的存档卡；轨道内的论文、阅读卡、仓库与数据集完整保留。</p>', false, '', true) +
      details('全部 12 周的交付总览', '<div class="tbl-wrap plan90-tbl"><table><thead><tr><th>周</th><th>交什么</th><th>主要读</th></tr></thead><tbody>' +
        overviewRows + '</tbody></table></div>', false, '', true) +
      details('换方向或调整节奏时', rich(RESEARCH.plan90Switch), false, '', true) +
      details('卡住时的 ' + RESEARCH.fallback.length + ' 条退路（背景档案）', fallbackBody, false, '', true) +
      '</div>';
  }

  // ── 阅读 L2：单方向学习路线。首屏给「从哪篇开始」；定位与提示、代码数据、延伸下沉（实施路线 §5.4） ──
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

    // 「从哪篇开始」：第一个未勾选的核心论文；全读完则指向第一篇（回访场景）
    var startIndex = 0;
    for (var si = 0; si < core.length; si += 1) {
      if (!state.checks.has('paper-' + level + '-' + paperIdKey(core[si], si))) { startIndex = si; break; }
      if (si === core.length - 1) startIndex = 0;
    }
    var startPaper = core[startIndex];
    var startHref = startPaper.ax ? '#reading/' + level + '/' + encodeURI(startPaper.ax) : (startPaper.srcUrl || '#reading/' + level);

    var html = '<div class="page">' +
      l2Head('reading', isCommon ? '公共必读' : '方向 ' + tid + ' · ' + (trackShort[tid] || tid), title, lede, '#reading', '本周学习') +
      '<p class="home-mainline">从哪篇开始：第 ' + (startIndex + 1) + ' 篇 · <a href="' + startHref + '">' + escapeHtml(startPaper.t) + '</a>' +
      '（共 ' + core.length + ' 条核心，约 ' + trackHours(core) + ' 小时）</p>';

    var isArchived = false;
    var arch = isCommon ? null : arr(RESEARCH.archived).filter(function (a) { return a.id === tid; })[0];
    if (arch) isArchived = true;
    var tierBadge = isCommon ? null : TRACK_TIER_BADGE[trackTier(tid)];
    var fitBits = [];
    if (!isCommon && t.fit) fitBits.push('<b>和谁配合</b>' + escapeHtml(t.fit));
    if (tierBadge) fitBits.push('<b>投入档位</b>' + badge(tierBadge[0], tierBadge[1]));
    else if (arch) fitBits.push('<b>投入档位</b>' + badge('已收进档案 · ' + escapeHtml(arch.status), 'b-dim') +
      '<span class="mono-sm"> ' + escapeHtml(arch.line) + '</span>');
    if (fitBits.length) html += details('这条轨道的定位与档位', '<div class="track-fit">' + fitBits.join('</div><div class="track-fit" style="margin-top:8px">') + '</div>', false, '', true);

    html += section(isCommon ? '公共必读路线' : ((trackTier(tid) === 'paused' || isArchived) ? '暂缓说明与重启路线' : '阶段路线'), '', '阶段路线') +
      (isCommon ? commonStageFlow() : '<div class="stage-flow">' + arr(t.stages).map(function (s, i) {
        return '<div class="stage"><span class="s-no">' + (i + 1) + '</span><div class="stage-body"><b>' + escapeHtml(s.k) + '</b><p>' + escapeHtml(s.v) + '</p></div></div>';
      }).join('') + '</div>');

    if (prereq.length) {
      html += section('方向前置 · 只有走这条方向才要求', '', '方向前置') +
        '<div class="card lp-list">' + l2PaperRows(prereq, level) + '</div>';
    }

    if (isCommon) {
      var groups = [
        { label: '把问题立起来 · 第 1—3 篇', from: 1, to: 3 },
        { label: '检测与证据获取 · 第 4—9 篇', from: 4, to: 9 },
        { label: '归因与评测方法 · 第 10—12 篇', from: 10, to: 12 }
      ];
      html += section('公共必读（' + core.length + ' 条 · 分三段，含 1 篇站外预印本）', '', '必读清单');
      groups.forEach(function (g) {
        var rows = core.filter(function (p) { return (p.n || 0) >= g.from && (p.n || 0) <= g.to; });
        html += '<h4 class="sub">' + escapeHtml(g.label) + '</h4><div class="card lp-list">' + l2PaperRows(rows, 'common', { cont: g.from - 1 }) + '</div>';
      });
      html += '<p class="mono-sm">每篇怎么读、读完问自己什么，都写在各自的阅读卡里；点上面的论文行就能进入。预印本那篇没有站内卡，从外链读。</p>';
    } else {
      html += section('方向必读（主路径 ' + main.length + ' 篇）', '', '必读清单') +
        '<div class="card lp-list">' + l2PaperRows(main, level) + '</div>';
    }

    if (!isCommon) {
      html += details('实践用的代码和数据', '<div class="grid c2">' +
        '<div class="card" style="margin-bottom:0"><strong>代码仓库</strong>' + list(arr(t.repos).map(function (r) { return r.r + '：' + r.note; })) + '</div>' +
        '<div class="card" style="margin-bottom:0"><strong>数据集</strong>' + list(arr(t.datasets).map(function (d) { return d.n + '：' + d.d; })) + '</div></div>', false, '', true);
    }

    html += section('放进 90 天计划的位置', '', '周次安排');
    if (isCommon) html += '<p class="muted">公共必读集中在第 1—4 周（Phase 1）：</p><div class="ws-group"><span class="ws-label">Phase 1</span>' + weekChips(1, 4) + '</div>';
    else if (tid === 'A') html += '<p class="muted">主线的主路径在第 4—12 周展开（W4 读 CoALA，Phase 2—3 做策略与对比）：</p><div class="ws-group"><span class="ws-label">Phase 1—3</span>' + weekChips(4, 12) + '</div>';
    else html += details('换方向或调整节奏时', rich(RESEARCH.plan90Switch), false, '', true);

    var skillIds = READING_SKILL_MAP[tid] || [];
    if (skillIds.length) html += section('对应的技能路线', '', '技能衔接') + '<div class="filters">' + skillChips(skillIds) + '</div>';

    if (ext.length) {
      html += details('延伸阅读（' + ext.length + ' 篇 · 不在 90 天计划里）',
        '<div class="card lp-list">' + l2PaperRows(ext, level, { checkable: false }) + '</div>', false, '', true);
    }

    if (!isCommon && t.note) html += details('这一条方向的使用提示', escapeHtml(t.note), false, '', true);

    return html + '</div>';
  }

  function renderTools() {
    var byName = {};
    arr(TOOLS.core).forEach(function (tool) { byName[tool.n] = tool; });
    var groupHtml = arr(TOOLS.groups).map(function (group) {
      var rows = arr(group.tools).map(function (name) { return byName[name]; }).filter(Boolean);
      if (!rows.length) return '';
      return '<h4 class="sub">' + escapeHtml(group.k) + '</h4>' +
        table(['工具', '用来干什么', '入口'], rows.map(function (tool) {
          // 审查 R6：入口列给真实链接（数据里的 url），插件类没有网页入口就写清打开路径
          var entry = tool.url
            ? '<a href="' + encodeURI(tool.url) + '" target="_blank" rel="noreferrer">' + escapeHtml(tool.ref || '打开') + ' ↗</a>'
            : escapeHtml(tool.ref || '—');
          return ['<strong>' + escapeHtml(tool.n) + '</strong>', escapeHtml(tool.use), entry];
        }));
    }).join('');
    return '<div class="page">' + pageHead('tools') +
      groupHtml +
      details('方法论由 grad-companion 插件承接（本站不重复维护）',
        callout(escapeHtml(TOOLS.companion.name), '<b>对应 skill：</b><code>' + escapeHtml(TOOLS.companion.playbook) + '</code><br>' + rich(TOOLS.companion.note), 'good') +
        '<p class="mono-sm">完整的读法（三遍读法、可复现检查表、投稿清单等）在插件自己的文档里。' + escapeHtml(TOOLS.disclaimer) + '</p>', false, '', true) +
      '</div>';
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
    // v3（实施路线 §5.8）：首屏 = 当前阶梯步 + 证据提示；岗位族/城市策略/时间线/快照统计全部下沉
    var now = new Date();
    var curLadder = null;
    JOBS.internshipLadder.forEach(function (step) { if (step.id === currentLadderId()) curLadder = step; });
    var ladderHtml = '<div class="timeline">' + JOBS.internshipLadder.map(function (step) {
      var isCurrent = step.id === currentLadderId();
      var mark = isCurrent
        ? (currentPhase(now).phase.id === 'pre' ? badge('下一步', 'b-acc') : badge('当前阶段', 'b-acc'))
        : '';
      if (isCurrent) {
        return '<article class="tl-item milestone current" id="' + escapeHtml(step.id) + '"><div class="tl-when">STEP ' + escapeHtml(step.step) + ' · ' + escapeHtml(step.when) + mark + '</div><div class="tl-what">' + escapeHtml(step.title) +
          '</div><div class="tl-desc">' + list(step.actions) + '</div><div class="tl-check"><b>验收：</b>' + escapeHtml(step.acceptance) + '</div></article>';
      }
      // 其余阶梯缩成节点行；完整行动与验收在下方折叠块里（锚点 id 保留）
      return '<article class="tl-item soft" id="' + escapeHtml(step.id) + '"><div class="tl-when">STEP ' + escapeHtml(step.step) + ' · ' + escapeHtml(step.when) + '</div><div class="tl-what">' + escapeHtml(step.title) + '</div></article>';
    }).join('') + '</div>';
    return '<div class="page">' + pageHead('jobs') +
      (JOBS.pageNote ? callout('这一页先看什么', rich(JOBS.pageNote), 'warn') : '') +
      section('当前阶梯与下一步证据', 'ladder', '当前阶梯') +
      (curLadder ? '<p class="home-mainline">现在的任务是 <b>STEP ' + escapeHtml(curLadder.step) + ' · ' + escapeHtml(curLadder.title) +
        '</b>；这一步要交出的证据：<b>' + escapeHtml(curLadder.acceptance) + '</b></p>' : '') +
      ladderHtml +
      details('全部四级阶梯的完整行动与验收',
        JOBS.internshipLadder.map(function (step) {
          return '<p style="margin:8px 0"><b>STEP ' + escapeHtml(step.step) + ' · ' + escapeHtml(step.when) + ' · ' + escapeHtml(step.title) + '</b><br>' +
            escapeHtml(step.actions.join('；')) + '<br><b>验收：</b>' + escapeHtml(step.acceptance) + '</p>';
        }).join(''), false, '', true) +
      section('代表团队与岗位样本', 'job-samples', '岗位样本') + '<div class="filters filter-stack">' +
      filterGroup('城市', 'jobCity', [['all', '全部']].concat(cityOptions), state.jobCity) +
      filterGroup('层级', 'jobTier', [['all', '全部']].concat(tierOptions), state.jobTier) +
      filterGroup('阶段', 'jobStage', [['all', '全部']].concat(stageOptions), state.jobStage) +
      filterGroup('岗位族', 'jobFamily', [['all', '全部']].concat(familyOptions), state.jobFamily) +
      filterGroup('证据', 'jobEvidence', [['all', '全部']].concat(evidenceOptions), state.jobEvidence) + '</div>' +
      '<div class="result-count">显示 ' + teams.length + ' / ' + JOBS.teams.length + ' 个人工整理的样本</div><div class="grid c2">' +
      (teams.length ? teams.map(renderJobCard).join('') : '<div class="empty card">没有符合筛选条件的岗位样本</div>') + '</div>' +
      details('城市策略与偏好顺序（为什么先城市后岗位）', renderCityPolicy(), false, '', true) +
      details('岗位类型：主攻哪些，放弃哪些（' + JOBS.roleFamilies.length + ' 类）', '<div class="grid c3">' + JOBS.roleFamilies.map(function (role) {
        var cls = role.tier === 'primary' ? 'b-high' : role.tier === 'secondary' ? 'b-acc' : role.tier === 'avoid' ? 'b-low' : 'b-mid';
        return '<article class="card"><div class="card-head"><strong>' + escapeHtml(role.name) + '</strong>' + badge(tierLabels[role.tier] || role.tier, cls) + '</div><p>' + escapeHtml(role.scope) +
          '</p><div class="mono-sm">' + escapeHtml(role.reason) + '</div>' + claimBadge(role.claimType) + '</article>';
      }).join('') + '</div>', false, '', true) +
      details('招聘时间线（预测口径 · 未来批次以官方公告为准）', renderCareerTimeline(JOBS.timeline), false, '', true) +
      details('这份快照能说明什么、不能说明什么（统计口径与字段质量）',
        callout(JOBS.meta.title, '<strong>按 postId 去重后 ' + JOBS.meta.denominator + ' 条</strong> · ' + escapeHtml(JOBS.meta.sampleScope) + '<br>' + escapeHtml(JOBS.meta.warning), 'warn') +
        '<div class="grid c4">' + JOBS.stats.recruitment.map(function (item) {
          return stat(item.count, item.label, item.pct + '% of snapshot', item.id === 'dailyIntern' ? 'good' : '');
        }).join('') + stat(techPost ? techPost.count : '—', '技术岗', (techPost ? techPost.pct + '%' : '') + '，不是应届可投数', 'warn') + '</div>' +
        renderCityDistribution() +
        '<div class="grid c2"><div>' + table(['岗位类型', '记录数', '占比'], JOBS.stats.postType.map(function (i) { return [text(i.label), text(i.count), text(i.pct + '%')]; })) +
        '</div><div>' + table(['字段质量', '数值', '解释'], JOBS.stats.quality.map(function (i) { return [text(i.label), text(i.value), text(i.note)]; })) + '</div></div>' +
        '<div class="grid c2">' + Object.keys(JOBS.risks).map(function (group) {
          var title = group === 'data' ? '数据本身的局限' : '生涯判断的风险';
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
      section('数字不能怎么用') + details('各城市策略与风险明细', '<div class="grid c2">' + arr(JOBS.regions).slice().sort(function (a, b) {
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
    // id 供搜索锚点定位到具体岗位（审查 R3：不能所有结果共用一个标题）
    return '<article class="job tier-' + escapeHtml(job.tier) + '" id="job-' + escapeHtml(job.id || slug(job.company + '-' + job.name)) + '"><div class="jh"><div class="jt">' + escapeHtml(job.company + ' · ' + job.name) + '</div>' + badge(job.tier, job.tier === 'S' ? 'b-pur' : 'b-acc') +
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
    // v3 推荐卡：主线 A 的硬映射技能（SKILL_TRACK_MAP 既有事实），不新增能力结论
    var rec = skillById('skill-eval');
    var recSignal = null;
    SKILLS.signals.forEach(function (x) { if (x.id === 'eval') recSignal = x; });
    var recCard = rec ? '<section class="page-summary" style="margin-bottom:16px"><div class="ps-head">当前研究最需要补的一条</div>' +
      '<p><b>' + escapeHtml(rec.name) + '（' + escapeHtml(rec.priority) + '）</b>——' + escapeHtml(recSignal ? recSignal.judgement : rec.target) + '</p>' +
      '<p style="margin:0"><a href="#skills/' + escapeHtml(rec.id) + '">进入这条路线 →</a>　<span class="mono-sm">交付物：' + escapeHtml(rec.deliverable) + '</span></p></section>' : '';
    return '<div class="page">' + pageHead('skills') +
      recCard +
      '<div class="filters filter-stack">' + filterGroup('优先级', 'skillPriority', [['all', '全部'], ['P0', 'P0'], ['P1', 'P1'], ['P2', 'P2'], ['P3', 'P3']], state.skillPriority) +
      filterGroup('能力域', 'skillDomain', [['all', '全部']].concat(domains.map(function (d) { return [d, domainLabels[d] || d]; })), state.skillDomain) + '</div>' +
      section('学习路线（共 ' + roadmap.length + ' 条）') + '<div class="grid c2">' + roadmap.map(function (skill) {
        return '<div class="card cat-card" id="' + escapeHtml(skill.id) + '" data-goto="skills/' + escapeHtml(skill.id) + '">' +
          '<div class="card-head"><strong><a href="#skills/' + escapeHtml(skill.id) + '">' + escapeHtml(skill.name) + '</a></strong>' + badge(skill.priority, skill.priority === 'P0' ? 'b-high' : skill.priority === 'P1' ? 'b-acc' : 'b-dim') + '</div>' +
          '<div class="cat-meta"><span>截止 ' + escapeHtml(skill.deadline) + '</span><span>' + escapeHtml(domainLabels[skill.domain] || skill.domain) + '</span></div>' +
          '<p class="cat-pitch">' + escapeHtml(skill.target) + '</p>' +
          '<label class="mini-check"><input type="checkbox" data-check-id="' +
          escapeHtml(skill.id) + '"' + (state.checks.has(skill.id) ? ' checked' : '') + '> 标记完成</label></div>';
      }).join('') + '</div>' +
      details('JD 词频矩阵（口径与局限 · 命中率不等于硬性要求率）', '<b>百度：</b>' + SKILLS.meta.baidu.denominator + ' 个技术岗，描述里既有职责也有要求。<b>腾讯：</b>' + SKILLS.meta.tencent.denominator + ' 个技术岗，只有工作内容一栏，算出来的命中率只能当最低值。' + escapeHtml(SKILLS.meta.warning) + '<div class="result-count">显示 ' + signals.length + ' / ' + SKILLS.signals.length + ' 项</div>' +
      table(['技能', '领域', '百度 ' + SKILLS.meta.baidu.denominator + ' 条中', '腾讯 ' + SKILLS.meta.tencent.denominator + ' 条中', '优先级', '判断'], signals.map(function (skill) {
        // 行 id 供搜索锚点定位具体信号（审查 R3 反例：技能结果与 DOM id 不符）
        return ['<strong id="signal-' + escapeHtml(skill.id) + '">' + escapeHtml(skill.name) + '</strong>', text(domainLabels[skill.domain] || skill.domain), skill.baidu == null ? '—' : '<div class="bar-cell"><div class="bar"><i style="width:' + skill.baidu + '%"></i></div><span>' + skill.baidu + '%</span></div>',
          skill.tencent == null ? '—' : '<div class="bar-cell"><div class="bar"><i class="cold" style="width:' + skill.tencent + '%"></i></div><span>' + skill.tencent + '%</span></div>', badge(skill.priority, skill.priority === 'P0' ? 'b-high' : skill.priority === 'P1' ? 'b-acc' : 'b-dim'), text(skill.judgement)];
      })) + callout('这些百分比怎么读', 'JD 里出现某个词的比例，不等于这个岗位硬性要求这项技能的比例，也说明不了竞争者多少。<b>GraphRAG 两边都是零命中，只说明它不适合当简历标签，不代表图记忆技术没有价值。</b>', ''), false, '', true).replace('<details class="acc', '<details id="jd-matrix" class="acc') +
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
    // v3（实施路线 §5.10）：首屏回答「还缺什么证据」；主展示区只留两个在做项目
    function projectBlock(project) {
      var nextMile = null;
      arr(project.milestones).forEach(function (m) { if (!nextMile && !state.checks.has(m.id)) nextMile = m; });
      var metricStats = '<div class="grid c4">' + project.metrics.map(function (metric) {
        var note = metric.value == null ? '这是目标，不是成果' : (metric.status === 'preliminary' ? '只测过一次（n=1），待补重复实验' : '已实测');
        var cls = metric.value == null ? 'warn' : (metric.status === 'preliminary' ? '' : 'good');
        return stat(metric.value == null ? '待实测' : metric.value, metric.label, note, cls);
      }).join('') + '</div>';
      var nextHtml = nextMile
        ? '<div class="home-deliver" style="margin:10px 0"><b>下一个要验收</b>' + escapeHtml(nextMile.title) + '（' + escapeHtml(nextMile.stage) + '）——验收：' + escapeHtml(nextMile.acceptance) + '</div>' +
          '<label class="mini-check"><input type="checkbox" data-check-id="' + escapeHtml(nextMile.id) + '"' + (state.checks.has(nextMile.id) ? ' checked' : '') + '> 里程碑完成</label>'
        : '<p class="muted" style="margin:8px 0">当前列出的里程碑都已标记完成，往「全部里程碑」里补新目标。</p>';
      return section(project.name, 'project-' + escapeHtml(project.id)) +
        '<article class="project card pad-lg"><div class="project-head"><div><span class="badge b-info">' + escapeHtml(project.status) + '</span><h3>' + escapeHtml(project.name) +
        '</h3><p>' + escapeHtml(project.problem) + '</p></div>' + claimBadge(project.claimType) + '</div>' +
        nextHtml +
        details('全部指标与证据状态（实测 / 单次 / 目标）', metricStats, false, '', true) +
        details('架构与取舍', '<div class="grid c2"><div><h4 class="sub">架构</h4>' + list(project.architecture) + '</div><div><h4 class="sub">当时的取舍</h4>' + list(project.tradeoffs) + '</div></div>', false, '', true) +
        details('全部里程碑时间线', '<div class="timeline">' + project.milestones.map(function (mile) {
          return '<article class="tl-item milestone"><div class="tl-when">' + escapeHtml(mile.stage) + '</div><div class="tl-what">' + escapeHtml(mile.title) + '</div><div class="tl-desc">' + list(mile.tasks) +
            '</div><div class="tl-check"><b>验收：</b>' + escapeHtml(mile.acceptance) + '</div><label class="mini-check"><input type="checkbox" data-check-id="' + escapeHtml(mile.id) + '"' + (state.checks.has(mile.id) ? ' checked' : '') + '> 里程碑完成</label></article>';
        }).join('') + '</div>', false, '', true) +
        details('可查证的产出与岗位映射', '<div class="grid c2"><div><h4 class="sub">可查证的产出</h4>' + list(project.artifacts) + '</div><div><h4 class="sub">对得上哪些岗位</h4>' + tags(project.relatedRoles) + tags(project.relatedTeams) + '</div></div>', false, '', true) +
        '</article>';
    }
    var active = PORTFOLIO.projects.filter(function (p) { return p.id !== 'code-graph-rca'; });
    var reserve = PORTFOLIO.projects.filter(function (p) { return p.id === 'code-graph-rca'; })[0];
    return '<div class="page">' + pageHead('portfolio') +
      '<p class="home-mainline">两个做得深的项目，好过四个浅的。每个项目必须有实测数字：成功率、P99、QPS、单位成本；只有一次实验的标 <b>preliminary</b>。</p>' +
      active.map(projectBlock).join('') +
      (reserve ? details('第三储备 · 未开工（' + escapeHtml(reserve.name) + '）', 
        '<p>没开工之前不算进作品集。这里是防止未来重新规划时从零开始：问题、架构与验收标准完整保留。</p>' +
        '<p>' + escapeHtml(reserve.problem) + '</p>' +
        '<div class="grid c2"><div><h4 class="sub">规划中的架构</h4>' + list(reserve.architecture) + '</div><div><h4 class="sub">取舍</h4>' + list(reserve.tradeoffs) + '</div></div>' +
        details('储备项目的完整里程碑与指标', '<div class="timeline">' + reserve.milestones.map(function (mile) {
          return '<article class="tl-item milestone"><div class="tl-when">' + escapeHtml(mile.stage) + '</div><div class="tl-what">' + escapeHtml(mile.title) + '</div><div class="tl-desc">' + list(mile.tasks) +
            '</div><div class="tl-check"><b>验收：</b>' + escapeHtml(mile.acceptance) + '</div></article>';
        }).join('') + '</div>', false, '', true), false, '', true).replace('<details class="acc', '<details id="project-code-graph-rca" class="acc') : '') +
      details('作品集的四条原则', '<div class="grid c2">' + PORTFOLIO.principles.map(function (p) { return '<div class="card"><strong>' + escapeHtml(p.title) + '</strong><p>' + escapeHtml(p.detail) + '</p></div>'; }).join('') + '</div>', false, '', true) +
      section('怎么讲一个选错技术的故事', 'story', '讲故事方法') + '<div class="story-flow">' + PORTFOLIO.storyTemplate.map(function (step, index) {
        return '<div class="story-step"><span>' + (index + 1) + '</span><strong>' + escapeHtml(step.step) + '</strong><p>' + escapeHtml(step.prompt) + '</p></div>';
      }).join('') + '</div></div>';
  }

  function renderCareer() {
    // v3（实施路线 §5.11）：现在积累什么在前；远期参考全部下沉，不冒充今天的待办
    return '<div class="page">' + pageHead('career') +
      callout('这一页怎么用', '正式求职在 2028 年秋，距今还有两年多，到时候市场、JD 和公司策略大概率都变了。所以这一页只写<b>两年后仍然成立的判断</b>。具体信息到 2027 年 12 月要按当年情况<b>整页重做</b>，不要直接沿用。眼下能执行的只有「实习与岗位」页的实习阶梯。', 'warn') +
      section('现在应当积累什么', 'now', '现在积累') +
      '<p class="home-mainline">论文和岗位的连接点：<b>' + escapeHtml(PORTFOLIO.narratives.thesisToJob) + '</b></p>' +
      '<p>贡献记录记在两个地方：<a href="#portfolio">作品集</a>（实测数字与里程碑）和 <a href="#reading">90 天计划</a>（周验收）。投递方案到 2027.12 再按当年市场整理。</p>' +
      details('个人定位（两年后仍然成立的版本）',
        '<blockquote><p>' + escapeHtml(PORTFOLIO.narratives.positioning) + '</p></blockquote>' +
        '<div class="grid c2"><div class="card"><strong>为什么还要读研</strong><p>' + escapeHtml(PORTFOLIO.narratives.whyGraduate) + '</p></div></div>', false, '', true) +
      details('投递优先级（方向参考，按当年市场重做）', '<div class="grid c3">' + PORTFOLIO.applicationPriority.map(function (item) {
        return '<div class="job tier-' + escapeHtml(item.tier) + '"><div class="jh"><div class="jt">Tier ' + escapeHtml(item.tier) + '</div></div>' + tags(item.targets) + '<div class="jq">' + escapeHtml(item.reason) + '</div></div>';
      }).join('') + '</div>', false, '', true) +
      details('面试开场怎么讲（骨架，细节到 2028 再填）', '<div class="story-flow">' + [
        ['生产背景', '我做过 Python 后端和 AI 应用开发，知道线上系统要考虑什么。'], ['真实问题', '多模型流水线里反复出现「假成功」：宣称完成但证据不成立，这不是 prompt 能打补丁解决的。'],
        ['研究动作', '我把「成功」拆成声明、证据、状态三层分别验证，做分类、基准和检测器；主线是预算约束下的环境证据选择。'], ['工程证据', 'Atlas（假成功检测、哈希断言、JSONL 台账）和 AgentParliament（三级权限交叉审查）是能直接重跑的测量设施。'],
        ['岗位匹配', '所以我适合 Agent Runtime、Harness、评测、可观测和知识工程这几类团队。']
      ].map(function (s, i) { return '<div class="story-step"><span>' + (i + 1) + '</span><strong>' + s[0] + '</strong><p>' + s[1] + '</p></div>'; }).join('') + '</div>', false, '', true) +
      details('表达红线（标签、数字与口径）',
        callout('不要自称 GraphRAG 专家', escapeHtml(PORTFOLIO.narratives.notGraphRag) + tags(PORTFOLIO.narratives.labels), 'warn') +
        list([
          '不要把 GraphRAG 当简历主标签；用 Memory、Context、Evaluation、Knowledge Graph 这些词。',
          '不要把 1,287 条快照说成百度全部的 AI 岗位。',
          '不要把预测的招聘时间、二手的实习政策、还没测到的指标写成事实。',
          '“能跑”不算作品集完成；每项都要报成功率、P99、QPS 和单位成本。'
        ]), false, '', true) +
      '<p class="mono-sm">简历要点模板在 data/portfolio.js（resumeBullets），测出真实数字前不启用。2027.12 重做这一页时一起更新。</p></div>';
  }

  // 核验项的展示优先级（实施路线 §5.12）：学位制度 → 实习条件 → 预算/算力 → 基线复现 → 城市证据
  // → 其余 → 招聘窗口（预测放最后）。设计说明 §5：不能仅因 2028 招聘是 critical 就排在当前复现条件之前。
  function verifyPrio() {
    return {
      'verify-degree': 1,
      'verify-intern-policy': 2,
      'verify-compute': 3,
      'verify-repl': 4,
      'verify-cd-student-hc': 5,
      'verify-hz-teams': 6,
      'verify-remote-intern': 7,
      'verify-cq-jobs': 8,
      'verify-remote-proof': 9,
      'verify-ap-repo': 10,
      'verify-ospp': 11,
      'verify-tx-snapshot': 12,
      'verify-2028-window': 13
    };
  }

  function renderVerify() {
    // 展示按 prio 升序（同序内按影响），数据顺序不动；筛选器语义保持
    var impactOrder = { critical: 0, high: 1, medium: 2 };
    var prio = verifyPrio();
    var items = JOBS.verification.slice().sort(function (a, b) {
      var pa = prio[a.id] || 90, pb = prio[b.id] || 90;
      if (pa !== pb) return pa - pb;
      return (impactOrder[a.impact] != null ? impactOrder[a.impact] : 9) - (impactOrder[b.impact] != null ? impactOrder[b.impact] : 9);
    }).filter(function (item) {
      var handled = state.checks.has(item.id);
      var statusOk = state.verifyStatus === 'all' ||
        (state.verifyStatus === 'done' ? handled : !handled);
      return (state.verifyImpact === 'all' || item.impact === state.verifyImpact) && statusOk;
    });
    return '<div class="page">' + pageHead('verify') +
      callout('为什么是这些排最前', '先处理那些会改变结果的问题：能不能毕业、能不能外出实习、有没有算力、基线能不能复现。招聘窗口是预测，放在最后。影响小的先不看，别让它占注意力。勾选状态自动保存在本机。', 'warn') +
      '<div class="filters filter-stack">' + filterGroup('影响', 'verifyImpact', [['all', '全部'], ['critical', '关键'], ['high', '高'], ['medium', '中']], state.verifyImpact) +
      filterGroup('本次会话', 'verifyStatus', [['all', '全部'], ['open', '未处理'], ['done', '已标记']], state.verifyStatus) + '</div>' +
      '<div class="result-count">显示 ' + items.length + ' / ' + JOBS.verification.length + ' 项</div><div class="verification-list">' + items.map(function (item) {
        var checked = state.checks.has(item.id);
        return '<article class="card verify-card ' + (checked ? 'done' : '') + '" id="verify-' + escapeHtml(item.id) + '"><div class="card-head"><div><span class="mono-sm">' + escapeHtml(item.area) + '</span><h3>' + escapeHtml(item.title) +
          '</h3></div><div>' + badge(item.impact, item.impact === 'critical' ? 'b-low' : item.impact === 'high' ? 'b-mid' : 'b-dim') + ' ' + evidenceBadge(item.evidence) + '</div></div><p><b>怎么核：</b>' + escapeHtml(item.action) +
          '</p><label class="mini-check"><input type="checkbox" data-check-id="' + escapeHtml(item.id) + '"' + (checked ? ' checked' : '') + '> 我处理过了</label></article>';
      }).join('') + '</div>' +
      section('每月例行检查', '', '每月例行') + details('每月例行检查（建议设成日历重复事项）', checkList('monthly', TOOLS.monthly.t, TOOLS.monthly.items.map(function (item, i) { return { id: 'monthly-' + i, text: item }; }), '建议在日历里设成每月重复的任务。')) + '</div>';
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
    // 勾选/筛选会整体重渲染：滚动、焦点、展开状态都属于会话连续性（审查 R2）。
    // - 焦点：记 data-check-id；焦点在筛选 chip 上时记筛选组与值，渲染后归位到同一个 chip；
    //   焦点在普通可交互元素上时记 data-focus-key（若渲染方提供了）。
    // - 展开状态：重渲染前收集全部已打开 details 的 summary 文本，渲染后按文本重新打开。
    //   勾选框同时出现在摘要与折叠时间线里时（作品集里程碑），优先恢复可见副本。
    var focusId = null;
    var focusFilter = null;
    var openDetails = [];
    if (keepScroll) {
      var act = document.activeElement;
      if (act && act.getAttribute) {
        focusId = act.getAttribute('data-check-id');
        if (act.hasAttribute('data-filter')) {
          focusFilter = { name: act.getAttribute('data-filter'), value: act.getAttribute('data-value') };
        }
      }
      if (route !== null) {
        // 双键（标题文本 + 同名出现序号）：同名折叠只恢复用户打开的那一个（qwen 复审 minor-1）。
        // 出现序号对全部同名 summary 递增（不看开合），否则与恢复侧的计数口径对不上。
        var seenText = {};
        app.querySelectorAll('details.acc > summary').forEach(function (sum) {
          var text = sum.textContent.replace(/\s+/g, ' ').trim();
          if (!text) return;
          var occ = seenText[text] || 0;
          seenText[text] = occ + 1;
          if (sum.parentElement.open) openDetails.push(text + '#' + occ);
        });
      }
    }
    try {
      var html;
      if (route === 'reading' && sub === 'week') {
        // v3 周选择路由 #reading/week/Wn：只决定周详情显示哪一周，L1 目录照常在下方。
        // 非法周次回退当前周；W1—W12 之外一律按无选中处理。
        var wk = /^W([1-9]|1[0-2])$/.test(paper) ? parseInt(paper.slice(1), 10) : null;
        html = renderReading(wk);
      }
      else if (route === 'reading' && READING_L2[sub]) {
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
    // 展开状态恢复：按「文本#出现序号」双键重开（审查 R2 + 复审核对同名歧义）
    if (openDetails.length) {
      var restoreSeen = {};
      app.querySelectorAll('details.acc > summary').forEach(function (sum) {
        var text = sum.textContent.replace(/\s+/g, ' ').trim();
        if (!text) return;
        var occ = restoreSeen[text] || 0;
        restoreSeen[text] = occ + 1;
        if (openDetails.indexOf(text + '#' + occ) >= 0) sum.parentElement.open = true;
      });
    }
    if (focusFilter) {
      var chip = app.querySelector('[data-filter="' + focusFilter.name + '"][data-value="' + focusFilter.value + '"]');
      if (chip) { try { chip.focus({ preventScroll: true }); } catch (e) { chip.focus(); } }
    } else if (focusId) {
      // 同一勾选框可能出现多份（如作品集里程碑），优先聚焦当前可见的那份；都不可见则不抢焦点
      var candidates = app.querySelectorAll('input[data-check-id="' + focusId + '"]');
      var target = null;
      candidates.forEach(function (el) {
        if (!target && el.offsetParent !== null) target = el;
      });
      if (!target && candidates.length === 1) target = candidates[0];
      if (target) { try { target.focus({ preventScroll: true }); } catch (e) { target.focus(); } }
    }
    window.scrollTo(0, offset);
    if (pendingAnchor) {
      var anchorId = pendingAnchor;
      var anchorEl = document.getElementById(anchorId);
      if (anchorEl) {
        pendingAnchor = null;
        // 先判隐藏原因：任何祖先 details 关闭 = 折叠藏住（展开即可）；
        // 祖先全开仍不可见 = 筛选结果未渲染（重置筛选重试）。（审查 R3 + 实测修正）
        var hiddenByClosedDetails = false;
        var node0 = anchorEl;
        while (node0 && node0 !== app) {
          if (node0.tagName === 'DETAILS' && !node0.open) { hiddenByClosedDetails = true; break; }
          node0 = node0.parentElement;
        }
        // 展开目标的全部 details 祖先（只开最近一层不足以处理嵌套归档）
        var node = anchorEl;
        while (node && node !== app) {
          if (node.tagName === 'DETAILS') node.open = true;
          node = node.parentElement;
        }
        if (hiddenByClosedDetails) {
          scrollAnchorNow(anchorEl);
          anchorFilterRetry = false;
          return;
        }
        // 祖先全开仍不可见：目标多半没被渲染（筛选或空态），走重置筛选重试
        if (anchorEl.offsetParent === null) {
          var usedFilters = FILTER_KEYS.filter(function (k) { return state[k] && state[k] !== 'all'; });
          if (!anchorFilterRetry && usedFilters.length) {
            // pendingAnchor 保留到下一轮继续定位
            anchorFilterRetry = true;
            try {
              usedFilters.forEach(function (k) { state[k] = 'all'; });
              render(keepScroll);
              return;
            } finally {
              anchorFilterRetry = false;
            }
          }
        }
        scrollAnchorNow(anchorEl);
        anchorFilterRetry = false;
      } else {
        // 锚点在当前 DOM 不存在：可能由筛选重渲染后才出现（如重置筛选后目标行才渲染）。
        // 保留 pendingAnchor 走一轮重置筛选的重渲染；只重置当前路由实际存在的筛选键。
        var routeFilters = FILTER_KEYS.filter(function (k) { return k in state && state[k] !== 'all'; });
        if (!anchorFilterRetry && routeFilters.length) {
          anchorFilterRetry = true;
          try {
            routeFilters.forEach(function (k) { state[k] = 'all'; });
            render(keepScroll);
            return;
          } finally {
            anchorFilterRetry = false;
          }
        }
        // 重试后仍找不到（如储备项目折叠 id 缺失等数据问题）：放弃定位，不报错
        pendingAnchor = null;
        anchorFilterRetry = false;
      }
    } else {
      anchorFilterRetry = false;
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
          scrollAnchorNow(target);
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
    // anchor：目标元素 id。点击搜索结果时先置 pendingAnchor，render() 会展开所在 details 并滚动到位；
    // 目标被筛选藏住时由 render() 的兜底逻辑重置筛选（实施路线 §4-D6）
    var entries = [];
    Object.keys(routeMeta).forEach(function (route) {
      entries.push({ route: route, title: routeMeta[route][0], detail: routeMeta[route][1] });
    });
    DATA.rules.forEach(function (item, i) { entries.push({ route: 'baseline', anchor: 'rule-' + i, title: item.q, detail: stripHtml(item.a) }); });
    DATA.advisor.papers.forEach(function (item) { entries.push({ route: 'baseline', title: item.t, detail: item.j + ' ' + item.doi }); });
    RESEARCH.angles.forEach(function (item) { entries.push({ route: 'research', anchor: item.tier === 'main' ? 'mainline' : 'extension', title: item.name, detail: item.problem }); });
    Object.keys(RESEARCH.reading.tracks).forEach(function (tid) {
      var t = RESEARCH.reading.tracks[tid];
      entries.push({ route: 'reading/' + tid, title: t.name, detail: t.pitch + ' ' + (trackShort[tid] || '') });
    });
    allPapers().forEach(function (item) {
      entries.push({ route: 'reading/' + (item.level === 'common' ? 'common' : item.level) + (item.ax ? '/' + item.ax : ''),
        crumb: '阅读 · ' + (item.level === 'common' ? '公共必读' : '方向 ' + item.level),
        title: item.t, detail: (item.ax || '') + ' ' + (item.intro || '') + ' ' + item.why });
    });
    TOOLS.core.forEach(function (item) { entries.push({ route: 'tools', title: item.n, detail: item.use + ' ' + (item.ref || '') }); });
    JOBS.teams.forEach(function (item) { entries.push({ route: 'jobs', anchor: 'job-' + (item.id || slug(item.company + '-' + item.name)), title: item.company + ' · ' + item.name, detail: item.summary + ' ' + item.tags.join(' ') }); });
    SKILLS.signals.forEach(function (item) { entries.push({ route: 'skills', anchor: 'signal-' + item.id, title: item.name, detail: item.judgement }); });
    PORTFOLIO.projects.forEach(function (item) { entries.push({ route: 'portfolio', anchor: 'project-' + item.id, title: item.name, detail: item.problem }); });
    // 储备项目在折叠块里：anchor 指向折叠 details 自身的 id（R3 反例二）
    SKILLS.roadmap.forEach(function (item) { entries.push({ route: 'skills/' + item.id, anchor: item.id, crumb: '技能 · 学习路线', title: item.name, detail: item.target + ' ' + item.deliverable }); });
    JOBS.verification.forEach(function (item) { entries.push({ route: 'verify', anchor: 'verify-' + item.id, title: item.title, detail: item.action }); });
    DATA.corrections.forEach(function (item, i) {
      entries.push({ route: 'baseline', anchor: 'corrections-archive', crumb: '读研前提 · 历史纠正',
        title: '纠正：' + stripHtml(item.right).slice(0, 40), detail: stripHtml(item.wrong) + ' ' + stripHtml(item.why) });
    });
    return entries;
  }

  function stripHtml(value) {
    var node = document.createElement('div');
    node.innerHTML = value || '';
    return node.textContent || '';
  }

  // 搜索索引失败不能拖垮整页渲染，退化为空索引即可
  var searchIndex = [];
  var lastHits = [];
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
    searchResults.innerHTML = hits.length ? hits.map(function (item, i) {
      var where = item.crumb || (routeMeta[item.route] ? routeMeta[item.route][0] : '');
      return '<a href="#' + escapeHtml(item.route) + '" class="search-result" data-idx="' + i + '"><span class="where">' + escapeHtml(where) + '</span><strong>' +
        escapeHtml(item.title) + '</strong><span class="excerpt">' + escapeHtml(item.detail.slice(0, 92)) + (item.detail.length > 92 ? '…' : '') + '</span></a>';
    }).join('') : '<div class="empty">没有匹配的内容</div>';
    lastHits = hits;
    searchResults.hidden = false;
  }

  function closeNav() {
    document.body.classList.remove('nav-open');
    sidebarToggle.setAttribute('aria-expanded', 'false');
    // 关闭后焦点回菜单按钮，避免落进已隐藏的侧栏或丢到 BODY（审查 R2）
    if (sidebarToggle.offsetParent !== null) {
      try { sidebarToggle.focus({ preventScroll: true }); } catch (e) { sidebarToggle.focus(); }
    }
  }

  searchInput.addEventListener('input', updateSearch);
  searchInput.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') { searchInput.value = ''; searchResults.hidden = true; }
  });
  document.addEventListener('click', function (event) {
    if (!event.target.closest('.search-wrap')) searchResults.hidden = true;
  });
  searchResults.addEventListener('click', function (event) {
    var link = event.target.closest ? event.target.closest('[data-idx]') : null;
    if (link) {
      var hit = lastHits[Number(link.getAttribute('data-idx'))];
      if (hit && hit.anchor) {
        pendingAnchor = hit.anchor;   // render() 末尾展开 details 并滚动
        // 同路由时 hash 不变化、hashchange 不触发，这里手动渲染一轮把锚点消费掉
        var href = link.getAttribute('href');
        if (href && '#' + location.hash.replace(/^#/, '') === href) render(true);
      }
    }
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
    // v3 主题口径：浅色默认（无类），深色 = body.dark。旧值 'light'/'dark' 语义兼容：
    // 'dark' → 深色；'light' 或无记录 → 浅色。点击立即切换并持久化，无需刷新（审查 R1）。
    var dark = document.body.classList.toggle('dark');
    themeToggle.setAttribute('aria-pressed', String(dark));
    storeSet(STORE.theme, dark ? 'dark' : 'light');
  });
  // 危险操作两步确认：按钮文案变化即待确认态；5 秒超时自动还原（设计说明 §5.7）
  var resetArmTimer = null;
  var resetBtn = document.getElementById('reset-progress');
  function resetDisarm() {
    if (resetArmTimer) { clearTimeout(resetArmTimer); resetArmTimer = null; }
    resetBtn.textContent = '清空全部进度';
  }
  resetBtn.addEventListener('click', function () {
    if (resetArmTimer) {
      resetDisarm();
      state.checks.clear();
      storeDel(STORE.checks);
      render(true);
      return;
    }
    resetBtn.textContent = '再点一次确认清空';
    resetArmTimer = setTimeout(resetDisarm, 5000);
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

  // 恢复本机保存的主题与方向选择（localStorage 不可用时静默跳过）。
  // 与 index.html 首帧脚本同一口径：仅 'dark' 加 dark 类；旧记录 'light' 语义不变。
  if (storeGet(STORE.theme) === 'dark') {
    document.body.classList.add('dark');
    themeToggle.setAttribute('aria-pressed', 'true');
  }
  var savedTrack = storeGet(STORE.track);
  if (savedTrack && RESEARCH.reading.tracks[savedTrack]) state.track = savedTrack;

  render();
}());
