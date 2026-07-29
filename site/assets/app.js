/* 研究生三年发展路径 · 原生渲染器（无依赖、无持久化） */
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

  var state = {
    checks: new Set(),
    paperLevel: 'all',
    paperFlag: 'all',
    paperCategory: 'all',
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

  var routeMeta = {
    dashboard: ['总览仪表盘', '把研究、工程与求职压成一条可执行主线。'],
    baseline: ['现实基线', '先确认导师、学校制度和产业资源，再做选择。'],
    research: ['研究主线', '用图学习语言获得导师指导，用 Agent 记忆语言对接岗位。'],
    reading: ['阅读与 90 天启动', '从文献地图进入可运行 baseline，而不是停在阅读。'],
    tools: ['科研工具链与规范', '发现、核验、实验、写作和伦理组成一个可追溯闭环。'],
    jobs: ['实习与岗位', '按阶段搭跳板，区分已观察岗位与未来开放机会。'],
    skills: ['技能矩阵', '市场信号决定优先级，项目交付物证明掌握程度。'],
    portfolio: ['作品集', '用两个深项目证明可靠性、性能和工程判断。'],
    career: ['求职资产', '把论文、经历和项目翻译成招聘方能识别的语言。'],
    verify: ['待核验清单', '优先消除会改变路线的未知条件。']
  };

  var claimLabels = {
    fact: ['事实', 'b-high'],
    inference: ['策略判断', 'b-info'],
    needsVerification: ['待核验', 'b-low'],
    forecast: ['预测', 'b-mid']
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
  function slug(value) { return String(value || '').replace(/[^a-zA-Z0-9_-]/g, '-'); }

  function pageHead(route, eyebrow) {
    var meta = routeMeta[route];
    return '<header class="page-head"><div class="eyebrow">' + escapeHtml(eyebrow) +
      '</div><h2>' + escapeHtml(meta[0]) + '</h2><p class="lede">' + escapeHtml(meta[1]) + '</p></header>';
  }

  function section(title, id) {
    return '<h3 class="sec"' + (id ? ' id="' + escapeHtml(id) + '"' : '') + '>' + escapeHtml(title) + '</h3>';
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
      '<div class="card-head"><strong>' + escapeHtml(title) + '</strong><span class="session-note">当前会话</span></div>' +
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

  function renderDashboard() {
    var firstAngle = RESEARCH.angles[0];
    var immediate = [
      { id: 'dash-policy', text: '入学后索取现行学位成果要求与实习管理办法全文' },
      { id: 'dash-compute', text: '向导师确认 GPU、API 预算、服务器权限和组内相关工作' },
      { id: 'dash-read', text: '完成 L0 前四篇，并跑通 PyG GCN on Cora' },
      { id: 'dash-trace', text: '为 AgentParliament 设计最小 Trace 事件模型' }
    ];
    return '<div class="page">' + pageHead('dashboard', 'Decision cockpit') +
      callout('唯一主线', '<strong>后端工程 → Agent 应用 → Harness / 评测 / 可观测 → 长期记忆与图结构检索。</strong><br>论文负责建立方法深度，作品集负责证明系统能力，实习负责获得生产证据。', 'good') +
      '<div class="grid c4">' +
        stat('2026.09', '入学', '先核验制度与算力') +
        stat('W8', '研究切口冻结', 'baseline 表必须成型', 'warn') +
        stat('2028.02', '暑期实习主投', '预测窗口，需提前复核', 'warn') +
        stat('2 个', '深度作品集', '每个都有四项实测指标', 'good') +
      '</div>' +
      section('三条会改变计划的纠偏') +
      '<div class="grid c3">' + DATA.corrections.map(function (item) {
        return '<article class="card correction"><div class="wrong">原假设 · ' + escapeHtml(item.wrong) + '</div><h4>' + rich(item.right) +
          '</h4><p>' + rich(item.why) + '</p><div class="impact"><b>行动影响</b> ' + escapeHtml(item.impact) + '</div>' + sourceLine(item.src, item.ref) + '</article>';
      }).join('') + '</div>' +
      section('当前研究决策') +
      '<div class="hero-decision card pad-lg"><div><span class="badge b-acc">首篇建议</span><h3>' + escapeHtml(firstAngle.name) +
        '</h3><p class="mono-sm">' + escapeHtml(firstAngle.en) + '</p><p>' + escapeHtml(firstAngle.problem) + '</p></div>' +
        '<div class="score-grid">' + Object.keys(firstAngle.scores).map(function (key) {
          var names = { fit: '导师适配', novel: '新颖性', cheap: '成本友好', first: '首篇可行', safe: '撞题安全' };
          return '<div><span>' + names[key] + '</span>' + stars(firstAngle.scores[key]) + '</div>';
        }).join('') + '</div></div>' +
      '<div class="grid c2">' + checkList('dashboard-now', '入学前后立即执行', immediate, '刷新后重置；完成证据应进入你后续的持久化系统。') +
      '<div class="card"><strong>必须守住的边界</strong>' + list([
        '不把 GraphRAG 当简历主标签；用 Memory、Context、Evaluation 和 Knowledge Graph。',
        '不把 1,287 条快照说成百度全部 AI 岗位。',
        '不把预测招聘时间、二手实习政策或目标指标写成事实。',
        '不把“能运行”当作品集完成；必须报告成功率、P99、QPS 与单位成本。'
      ]) + '</div></div>' +
      section('三年阶段图') + renderCareerTimeline(JOBS.timeline.slice(0, 8)) + '</div>';
  }

  function renderBaseline() {
    return '<div class="page">' + pageHead('baseline', 'Evidence before strategy') +
      anchorNav([['advisor', '导师画像'], ['rules', '培养制度'], ['partners', '校企资源'], ['employment', '就业事实']]) +
      section('导师画像与方法签名', 'advisor') +
      '<div class="grid c2"><div class="card">' + kv(DATA.advisor.basic, true) + '</div><div class="card"><strong>可借力的方法签名</strong>' +
      DATA.advisor.methodology.map(function (item) { return '<div class="method-row"><b>' + escapeHtml(item.k) + '</b><p>' + escapeHtml(item.v) + '</p></div>'; }).join('') + '</div></div>' +
      callout('选题接口', DATA.advisor.tactic, '') +
      '<h4 class="sub">代表论文</h4>' + table(['年份', '期刊 / DOI', '主题', '引用快照'], DATA.advisor.papers.map(function (p) {
        return [text(p.y), '<a href="https://doi.org/' + encodeURIComponent(p.doi) + '" target="_blank" rel="noreferrer">' + escapeHtml(p.j) + '</a><div class="mono-sm">' + escapeHtml(p.doi) + '</div>', text(p.t), text(p.cite)];
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
      '<h4 class="sub">可关注实验室</h4>' + table(['平台', '层级', '与路线的接口'], DATA.partners.labs.map(function (r) { return r.map(function (c) { return text(c); }); })) +
      '<p class="mono-sm">' + rich(DATA.partners.labNote) + '</p>' +
      section('就业事实与不可用口径', 'employment') +
      '<div class="grid c2"><div>' + table(['口径', '比例', '时间'], DATA.employment.official.map(function (r) { return r.map(function (c) { return text(c); }); })) +
      '<div class="card"><strong>头部雇主样本</strong><p>' + escapeHtml(DATA.employment.employers) + '</p></div></div>' +
      '<div>' + callout('薪资数据不可引用', DATA.employment.salaryWarning, 'bad') + '<div class="card"><strong>权威核验路径</strong><p>' + escapeHtml(DATA.employment.authoritative) + '</p>' + sourceLine(DATA.employment.src, DATA.employment.ref) + '</div></div></div>' +
      callout(DATA.wafNote.title, DATA.wafNote.body, 'warn') + '</div>';
  }

  function renderResearch() {
    return '<div class="page">' + pageHead('research', 'Thesis × market language') +
      callout(RESEARCH.positioning.title, RESEARCH.positioning.body, 'good') +
      section('五个研究切口') + '<div class="matrix">' + RESEARCH.angles.map(function (angle) {
        return '<article class="mx-card' + (angle.star ? ' rec' : '') + '">' + (angle.star ? '<span class="mx-tag">RECOMMENDED</span>' : '') +
          '<h5>' + escapeHtml(angle.id + ' · ' + angle.name) + '</h5><div class="en">' + escapeHtml(angle.en) + '</div>' +
          kv([['问题', angle.problem], ['实验', '图侧：' + angle.exp.graph + '<br>端到端：' + angle.exp.e2e], ['目标刊', angle.venue], ['成本', angle.cost], ['风险', angle.risk]], true) +
          '<div class="score-grid compact">' + Object.keys(angle.scores).map(function (key) {
            var names = { fit: '适配', novel: '新意', cheap: '低成本', first: '首篇', safe: '安全' };
            return '<div><span>' + names[key] + '</span>' + stars(angle.scores[key]) + '</div>';
          }).join('') + '</div>' + details('方法草案', list(angle.method), false) + '</article>';
      }).join('') + '</div>' +
      callout('建议排序', RESEARCH.angleAdvice, '') +
      section('双轨验证与指标体系') + callout('为什么要双轨', RESEARCH.dualTrack, 'good') +
      '<div class="grid c3">' + RESEARCH.metrics.map(function (metric) {
        return '<div class="card"><strong>' + escapeHtml(metric.g) + '</strong>' + list(metric.items) + '</div>';
      }).join('') + '</div>' +
      section('已经饱和的方向') + table(['方向', '证据', '判断'], RESEARCH.saturated.map(function (item) {
        return [text(item.t), text(item.e), '<strong>' + text(item.j) + '</strong>'];
      })) +
      section('竞争团队雷达') + '<div class="grid c2">' + RESEARCH.rivals.map(function (item) {
        var cls = item.level === 'danger' ? 'bad' : item.level === 'warn' ? 'warn' : '';
        return '<div class="card rival ' + cls + '"><div class="card-head"><strong>' + escapeHtml(item.n) + '</strong>' + badge(item.f, cls === 'bad' ? 'b-low' : cls === 'warn' ? 'b-mid' : 'b-dim') +
          '</div><p>' + escapeHtml(item.w) + '</p><div class="mono-sm">' + escapeHtml(item.note) + '</div></div>';
      }).join('') + '</div>' + callout('竞争判断', RESEARCH.rivalJudgement, 'warn') +
      section('给导师的翻译层') + table(['Agent 语言', '图学习语言'], RESEARCH.translate.map(function (r) { return [text(r[0]), rich(r[1])]; })) +
      '<blockquote><p>' + escapeHtml(RESEARCH.pitch) + '</p><cite>组会开场建议</cite></blockquote></div>';
  }

  function allPapers() {
    var result = [];
    Object.keys(RESEARCH.reading).forEach(function (level) {
      RESEARCH.reading[level].items.forEach(function (paper, index) {
        result.push(Object.assign({ level: level, id: 'paper-' + level + '-' + (paper.ax || index) }, paper));
      });
    });
    return result;
  }

  function paperItem(paper) {
    var id = paper.ax || paper.y || 'paper';
    return '<article class="paper' + (paper.key ? ' must' : '') + '"><div class="pid">' +
      (paper.ax ? '<a href="https://arxiv.org/abs/' + encodeURIComponent(paper.ax) + '" target="_blank" rel="noreferrer">' + escapeHtml(paper.ax) + '</a>' : text(id)) +
      '</div><div class="pb"><div class="pt">' + escapeHtml(paper.t) + '</div><div class="pv">' + text(paper.v) + ' · ' + text(paper.y) +
      (paper.c == null ? '' : ' · cited ' + escapeHtml(paper.c)) + '</div><div class="pw">' + escapeHtml(paper.why) + '</div>' +
      '<div class="tag-row">' + (paper.key ? badge('必读', 'b-acc') : '') + (paper.warn ? badge('撞方向', 'b-low') : '') + (paper.cat ? badge(paper.cat, 'b-info') : '') + '</div></div></article>';
  }

  function renderReading() {
    var papers = allPapers().filter(function (paper) {
      var levelOk = state.paperLevel === 'all' || paper.level === state.paperLevel;
      var flagOk = state.paperFlag === 'all' || (state.paperFlag === 'key' && paper.key) || (state.paperFlag === 'warn' && paper.warn);
      var catOk = state.paperCategory === 'all' || paper.cat === state.paperCategory;
      return levelOk && flagOk && catOk;
    });
    var paperChecks = allPapers().filter(function (p) { return p.key; }).map(function (p) {
      return { id: p.id, text: p.t, meta: (p.ax || '无 arXiv') + ' · ' + p.level };
    });
    return '<div class="page">' + pageHead('reading', 'Read → reproduce → decide') +
      section('论文地图与筛选') + '<div class="filters filter-stack">' +
      filterGroup('层级', 'paperLevel', [['all', '全部'], ['L0', 'L0 奠基'], ['L1S', '综述'], ['L1M', '方法'], ['L1B', '基准'], ['L2', '图学习'], ['L3', '多 Agent']], state.paperLevel) +
      filterGroup('标记', 'paperFlag', [['all', '全部'], ['key', '必读'], ['warn', '撞方向']], state.paperFlag) +
      filterGroup('类别', 'paperCategory', [['all', '全部'], ['基础', '基础'], ['异构图', '异构图'], ['图聚类', '图聚类'], ['图压缩', '图压缩'], ['图检索', '图检索']], state.paperCategory) + '</div>' +
      '<div class="result-count">显示 ' + papers.length + ' / ' + allPapers().length + ' 篇</div><div class="card paper-list">' + (papers.length ? papers.map(paperItem).join('') : '<div class="empty">没有符合筛选条件的论文</div>') + '</div>' +
      section('必读进度') + checkList('reading-key', '必读与直接竞争论文', paperChecks, '这里只记录当前页面会话，正式读书记录应进入 Zotero/Obsidian。') +
      section('复现仓库') + table(['仓库', '许可证', '难度', '定位', '快照'], RESEARCH.repos.map(function (repo) {
        return ['<a href="https://github.com/' + escapeHtml(repo.r) + '" target="_blank" rel="noreferrer">' + escapeHtml(repo.r) + '</a>' + (repo.pick ? ' ' + badge('首选', 'b-acc') : ''), text(repo.l), stars(repo.ease), text(repo.note), text(repo.p)];
      })) + callout('复现顺序', RESEARCH.repoPath, '') +
      section('数据集') + Object.keys(RESEARCH.datasets).map(function (group) {
        var names = { mem: '记忆与 Agent', qa: '多跳问答', graph: '图学习' };
        return details(names[group], table(['数据集', '规模', '获取', '用途'], RESEARCH.datasets[group].map(function (d) {
          return [text(d.n) + (d.key ? ' ' + badge('关键', 'b-acc') : ''), text(d.size), text(d.get), text(d.use)];
        })), group === 'mem');
      }).join('') +
      section('90 天启动路线') + renderPlan90() +
      section('卡住时怎么退') + '<div class="grid c2">' + RESEARCH.fallback.map(function (item) {
        return '<div class="card"><strong>' + escapeHtml(item.s) + '</strong><p>' + escapeHtml(item.a) + '</p></div>';
      }).join('') + '</div></div>';
  }

  function renderPlan90() {
    return '<div class="timeline">' + RESEARCH.plan90.map(function (item) {
      var checkId = 'week-' + item.w;
      return '<article class="tl-item' + (item.mile ? ' milestone' : '') + '"><div class="tl-when">' + escapeHtml(item.w) + ' · Phase ' + escapeHtml(item.ph) + '</div>' +
        '<div class="tl-what">' + escapeHtml(item.out) + '</div><div class="tl-desc"><b>读：</b>' + escapeHtml(item.read) + '<br><b>做：</b>' + escapeHtml(item.run) +
        '<br><b>卡住：</b>' + escapeHtml(item.stuck) + '</div>' + (item.mile ? '<div class="tl-check"><b>里程碑：</b>' + escapeHtml(item.mile) + '</div>' : '') +
        '<label class="mini-check"><input type="checkbox" data-check-id="' + checkId + '"' + (state.checks.has(checkId) ? ' checked' : '') + '> 本周验收完成</label></article>';
    }).join('') + '</div>';
  }

  function renderTools() {
    var reproducibility = TOOLS.reproducibilityChecklist.map(function (item) { return { id: item.id, text: item.text }; });
    var submission = TOOLS.submissionChecklist.map(function (item) { return { id: item.id, text: item.text }; });
    return '<div class="page">' + pageHead('tools', 'Research operating system') +
      callout('动态信息声明', TOOLS.disclaimer, 'warn') +
      anchorNav([['discover', '文献发现'], ['manage', '管理与阅读'], ['experiment', '实验'], ['writing', '写作'], ['ethics', '伦理与投稿']]) +
      section('文献发现：从关键词到引文网络', 'discover') + '<div class="grid c2">' + TOOLS.discover.map(function (tool) {
        return '<article class="card"><div class="card-head"><strong>' + escapeHtml(tool.n) + '</strong>' + badge(tool.tier, tool.tier.indexOf('必') >= 0 ? 'b-acc' : 'b-dim') +
          '</div><p><b>' + escapeHtml(tool.use) + '</b></p><p>' + escapeHtml(tool.how) + '</p><div class="mono-sm">访问：' + escapeHtml(String(tool.free)) + '</div></article>';
      }).join('') + '</div>' +
      section('文献管理与精读', 'manage') + callout('工具选择', TOOLS.manage.pick, 'good') +
      '<div class="grid c3">' + TOOLS.manage.items.map(function (item) {
        return '<div class="card"><div class="card-head"><strong>' + escapeHtml(item.n) + '</strong>' + badge(item.tier, 'b-info') + '</div><p>' + escapeHtml(item.why) + '</p></div>';
      }).join('') + '</div>' +
      details('统一入库与标注工作流', list(TOOLS.manage.workflow, true, true), true) +
      '<div class="grid c2"><div class="card"><strong>' + escapeHtml(TOOLS.reading.threePass.t) + '</strong>' + TOOLS.reading.threePass.p.map(function (pass) {
        return '<div class="method-row"><b>' + escapeHtml(pass.n) + '</b><p>' + rich(pass.d) + '</p></div>';
      }).join('') + '</div><div class="card"><strong>阅读判断原则</strong>' + list(TOOLS.reading.tips, false, true) + '</div></div>' +
      '<h4 class="sub">固定精读记录</h4>' + table(['字段', '必须记录'], TOOLS.noteTemplate.fields.map(function (r) { return [text(r[0]), text(r[1])]; })) +
      '<div class="grid c2"><div class="card"><strong>Claim–Evidence 管理</strong>' + list(TOOLS.evidenceWorkflow.rules) + '</div><div class="card"><strong>Related Work 分类</strong>' + tags(TOOLS.evidenceWorkflow.taxonomy) + '<p>AI 摘要只负责导航，进入论文或汇报的事实必须回到原文。</p></div></div>' +
      section('实验工程与可复现性', 'experiment') + callout('学术实验与产品开发的差异', TOOLS.experiment.note, '') +
      '<div class="grid c2">' + TOOLS.experiment.stack.map(function (group) {
        return '<div class="card"><strong>' + escapeHtml(group.g) + '</strong>' + kv(group.items) + '</div>';
      }).join('') + '</div>' +
      '<div class="card"><strong>实验纪律</strong>' + list(TOOLS.experiment.discipline, false, true) + '</div>' +
      '<div class="grid c2">' + checkList('repro', '实验可复现检查表', reproducibility, '每组主实验完成后逐项核对。') +
      '<div class="card"><strong>最低统计标准</strong>' + list([
        '随机过程至少 3 次独立运行，报告 mean ± std。', '主结果之外必须有消融、强 baseline、错误分析和数据泄漏检查。',
        '记录 seed、commit、config、硬件、依赖、模型/API 版本、prompt、token 与费用。', '保留原始输出、失败运行和负结果，不能只留最好数字。'
      ]) + '</div></div>' +
      section('写作、伦理与投稿', 'writing') + '<div class="grid c2"><div class="card"><strong>写作工具</strong>' + TOOLS.writing.stack.map(function (item) {
        return '<div class="method-row"><b>' + escapeHtml(item.n) + '</b><p>' + rich(item.use) + '</p></div>';
      }).join('') + '</div><div class="card"><strong>' + escapeHtml(TOOLS.writing.structure.t) + '</strong>' + kv(TOOLS.writing.structure.s, true) + '</div></div>' +
      '<div class="card"><strong>写作工艺</strong>' + list(TOOLS.writing.craft, false, true) + '</div>' +
      section('AI、保密与作者责任', 'ethics') + callout('投稿时重新确认', TOOLS.ai.warn, 'bad') +
      '<div class="grid c2">' + TOOLS.ai.consensus.map(function (item) {
        return '<div class="card"><strong>' + escapeHtml(item.rule) + '</strong><p>' + rich(item.why) + '</p></div>';
      }).join('') + '</div><div class="card">' + list(TOOLS.ai.practical, false, true) + '</div>' +
      '<div class="grid c2"><div>' + TOOLS.submit.flow.map(function (step) { return details(step.s, '<p>' + rich(step.d) + '</p>'); }).join('') + '</div>' +
      checkList('submission', '投稿前检查表', submission, '目标期刊政策可能变化，每次投稿都应重新执行。') + '</div>' +
      callout('拒稿处理', TOOLS.submit.reject, 'warn') + '<div class="card"><strong>伦理红线</strong>' + list(TOOLS.submit.ethics, false, true) + '</div></div>';
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
    return '<div class="page">' + pageHead('jobs', 'Evidence-led internship ladder') +
      callout(JOBS.meta.title, '<strong>' + JOBS.meta.denominator + ' 条去重记录</strong> · ' + escapeHtml(JOBS.meta.sampleScope) + '<br>' + escapeHtml(JOBS.meta.warning), 'warn') +
      section('招聘快照口径') + '<div class="grid c4">' + JOBS.stats.recruitment.map(function (item) {
        return stat(item.count, item.label, item.pct + '% of snapshot', item.id === 'dailyIntern' ? 'good' : '');
      }).join('') + stat(747, '技术岗', '58.0%，不是应届可投数', 'warn') + '</div>' +
      '<div class="grid c2"><div>' + table(['岗位类型', '记录数', '占比'], JOBS.stats.postType.map(function (i) { return [text(i.label), text(i.count), text(i.pct + '%')]; })) +
      '</div><div>' + table(['字段质量', '数值', '解释'], JOBS.stats.quality.map(function (i) { return [text(i.label), text(i.value), text(i.note)]; })) + '</div></div>' +
      '<h4 class="sub">城市记录分布（城市可重叠，不是 HC）</h4><div class="bar-chart">' + JOBS.stats.cities.map(function (city) {
        return '<div class="bar-row"><span>' + escapeHtml(city.city) + '</span><div class="bar"><i style="width:' + city.pct + '%"></i></div><b>' + city.count + '</b><small>' + city.pct + '%</small></div>';
      }).join('') + '</div>' +
      section('岗位族：主投什么、不主投什么') + '<div class="grid c3">' + JOBS.roleFamilies.map(function (role) {
        var cls = role.tier === 'primary' ? 'b-high' : role.tier === 'secondary' ? 'b-acc' : role.tier === 'avoid' ? 'b-low' : 'b-mid';
        return '<article class="card"><div class="card-head"><strong>' + escapeHtml(role.name) + '</strong>' + badge(tierLabels[role.tier], cls) + '</div><p>' + escapeHtml(role.scope) +
          '</p><div class="mono-sm">' + escapeHtml(role.reason) + '</div>' + claimBadge(role.claimType) + '</article>';
      }).join('') + '</div>' +
      section('代表团队与岗位样本') + '<div class="filters filter-stack">' +
      filterGroup('城市', 'jobCity', [['all', '全部']].concat(cityOptions), state.jobCity) +
      filterGroup('层级', 'jobTier', [['all', '全部']].concat(tierOptions), state.jobTier) +
      filterGroup('阶段', 'jobStage', [['all', '全部']].concat(stageOptions), state.jobStage) +
      filterGroup('岗位族', 'jobFamily', [['all', '全部']].concat(familyOptions), state.jobFamily) +
      filterGroup('证据', 'jobEvidence', [['all', '全部']].concat(evidenceOptions), state.jobEvidence) + '</div>' +
      '<div class="result-count">显示 ' + teams.length + ' / ' + JOBS.teams.length + ' 个策展样本</div><div class="grid c2">' +
      (teams.length ? teams.map(renderJobCard).join('') : '<div class="empty card">没有符合筛选条件的岗位样本</div>') + '</div>' +
      section('实习四级阶梯') + '<div class="timeline">' + JOBS.internshipLadder.map(function (step) {
        return '<article class="tl-item milestone"><div class="tl-when">STEP ' + escapeHtml(step.step) + ' · ' + escapeHtml(step.when) + '</div><div class="tl-what">' + escapeHtml(step.title) +
          '</div><div class="tl-desc">' + list(step.actions) + '</div><div class="tl-check"><b>验收：</b>' + escapeHtml(step.acceptance) + '</div></article>';
      }).join('') + '</div>' +
      section('地域策略') + '<div class="grid c3">' + JOBS.regions.map(function (region) {
        return '<div class="card"><div class="card-head"><strong>' + escapeHtml(region.city) + '</strong>' + badge(region.role, 'b-info') + '</div><p>' + escapeHtml(region.strategy) + '</p><div class="callout warn"><b>风险：</b>' + escapeHtml(region.risk) + '</div></div>';
      }).join('') + '</div>' +
      section('招聘时间线') + renderCareerTimeline(JOBS.timeline) +
      section('不要跨过的数据边界') + '<div class="grid c2">' + Object.keys(JOBS.risks).map(function (group) {
        var title = group === 'data' ? '数据口径风险' : '生涯决策风险';
        return '<div class="card"><div class="card-head"><strong>' + title + '</strong>' + claimBadge('inference') + '</div>' + list(JOBS.risks[group]) + '</div>';
      }).join('') + '</div></div>';
  }

  function renderJobCard(job) {
    return '<article class="job tier-' + escapeHtml(job.tier) + '"><div class="jh"><div class="jt">' + escapeHtml(job.company + ' · ' + job.name) + '</div>' + badge(job.tier, job.tier === 'S' ? 'b-high' : 'b-acc') +
      '</div><div class="jm">' + job.cities.map(function (v) { return badge(v, 'b-dim'); }).join('') + badge(familyLabels[job.roleFamily] || job.roleFamily, 'b-info') +
      badge(tierLabels[job.targetTier] || job.targetTier, 'b-acc') + '</div>' + tags(job.tags) + '<div class="jq">' + escapeHtml(job.summary) + '</div><div class="jw">' +
      escapeHtml(job.opening) + ' · 快照 ' + escapeHtml(job.sourceAsOf) + '</div><div class="evidence-row">' + claimBadge(job.claimType) + evidenceBadge(job.evidenceLevel) + '</div></article>';
  }

  function renderCareerTimeline(items) {
    return '<div class="timeline">' + items.map(function (item) {
      return '<article class="tl-item' + (item.type === 'forecast' ? ' soft' : ' milestone') + '"><div class="tl-when">' + escapeHtml(item.when) + '</div><div class="tl-what">' +
        escapeHtml(item.title) + ' ' + claimBadge(item.type === 'forecast' ? 'forecast' : 'inference') + '</div><div class="tl-desc">' + escapeHtml(item.detail) + '</div></article>';
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
      callout('双口径不可合并', '<b>百度：</b>' + SKILLS.meta.baidu.denominator + ' 个技术岗，含职责与要求。<br><b>腾讯：</b>' + SKILLS.meta.tencent.denominator + ' 个技术岗，只有工作内容，命中率是下限。<br>' + escapeHtml(SKILLS.meta.warning), 'warn') +
      '<div class="filters filter-stack">' + filterGroup('优先级', 'skillPriority', [['all', '全部'], ['P0', 'P0'], ['P1', 'P1'], ['P2', 'P2'], ['P3', 'P3']], state.skillPriority) +
      filterGroup('能力域', 'skillDomain', [['all', '全部']].concat(domains.map(function (d) { return [d, d]; })), state.skillDomain) + '</div>' +
      section('市场信号矩阵') + '<div class="result-count">显示 ' + signals.length + ' / ' + SKILLS.signals.length + ' 项</div>' +
      table(['技能', '领域', '百度 747', '腾讯 419', '优先级', '判断'], signals.map(function (skill) {
        return ['<strong>' + escapeHtml(skill.name) + '</strong>', text(skill.domain), skill.baidu == null ? '—' : '<div class="bar-cell"><div class="bar"><i style="width:' + skill.baidu + '%"></i></div><span>' + skill.baidu + '%</span></div>',
          skill.tencent == null ? '—' : '<div class="bar-cell"><div class="bar"><i class="cold" style="width:' + skill.tencent + '%"></i></div><span>' + skill.tencent + '%</span></div>', badge(skill.priority, skill.priority === 'P0' ? 'b-high' : skill.priority === 'P1' ? 'b-acc' : 'b-dim'), text(skill.judgement)];
      })) + callout('如何读这些数字', '关键词存在率不等于岗位硬要求率，也不能证明候选人供给。<b>GraphRAG 零命中只说明不适合作为 ATS 主标签，不代表图记忆技术无价值。</b>', '') +
      section('学习路线与可验证交付物') + '<div class="grid c2">' + roadmap.map(function (skill) {
        return '<article class="card"><div class="card-head"><strong>' + escapeHtml(skill.name) + '</strong>' + badge(skill.priority, skill.priority === 'P0' ? 'b-high' : skill.priority === 'P1' ? 'b-acc' : 'b-dim') +
          '</div>' + kv([['目标水平', skill.target], ['截止阶段', skill.deadline], ['交付证据', skill.deliverable]]) + '<label class="mini-check"><input type="checkbox" data-check-id="' +
          escapeHtml(skill.id) + '"' + (state.checks.has(skill.id) ? ' checked' : '') + '> 当前会话标记完成</label></article>';
      }).join('') + '</div>' +
      section('面试四条能力线') + '<div class="grid c2">' + SKILLS.interviewTracks.map(function (track) {
        return '<div class="card"><div class="card-head"><strong>' + escapeHtml(track.name) + '</strong>' + badge(track.target, 'b-info') + '</div>' + list(track.items) + '</div>';
      }).join('') + '</div></div>';
  }

  function renderPortfolio() {
    return '<div class="page">' + pageHead('portfolio', 'Measured engineering evidence') +
      callout('作品集硬规则', '两个深项目优于多个浅项目。每个项目必须有问题、架构、权衡、失败复盘、可复跑 benchmark，以及 <b>QPS / 成功率 / P99 / 单位成本</b> 四项实测数字。', 'good') +
      '<div class="grid c3">' + PORTFOLIO.principles.map(function (p) { return '<div class="card"><strong>' + escapeHtml(p.title) + '</strong><p>' + escapeHtml(p.detail) + '</p></div>'; }).join('') + '</div>' +
      PORTFOLIO.projects.map(function (project, projectIndex) {
        return section((projectIndex + 1) + ' · ' + project.name) + '<article class="project card pad-lg"><div class="project-head"><div><span class="badge b-info">' + escapeHtml(project.status) + '</span><h3>' + escapeHtml(project.name) +
          '</h3><p>' + escapeHtml(project.problem) + '</p></div>' + claimBadge(project.claimType) + '</div><div class="grid c2"><div><h4 class="sub">架构</h4>' + list(project.architecture) + '</div><div><h4 class="sub">关键权衡</h4>' + list(project.tradeoffs) + '</div></div>' +
          '<h4 class="sub">四项核心指标</h4><div class="grid c4">' + project.metrics.map(function (metric) {
            return stat(metric.value == null ? '待实测' : metric.value, metric.label, metric.value == null ? '目标位，不是成果' : 'measured', metric.value == null ? 'warn' : 'good');
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
    return '<div class="page">' + pageHead('career', 'Translate evidence into hiring language') +
      section('一句话定位') + '<blockquote><p>' + escapeHtml(PORTFOLIO.narratives.positioning) + '</p></blockquote>' +
      '<div class="grid c2"><div class="card"><strong>为什么读研</strong><p>' + escapeHtml(PORTFOLIO.narratives.whyGraduate) + '</p></div><div class="card"><strong>论文如何服务岗位</strong><p>' + escapeHtml(PORTFOLIO.narratives.thesisToJob) + '</p></div></div>' +
      callout('不要把自己说成 GraphRAG 专家', escapeHtml(PORTFOLIO.narratives.notGraphRag) + tags(PORTFOLIO.narratives.labels), 'warn') +
      section('学术语言 → JD 语言') + table(['学术/实现语言', '求职语言'], RESEARCH.translate.map(function (r) { return [text(r[1]).replace(/&lt;b&gt;|&lt;\/b&gt;/g, ''), text(r[0])]; })) +
      section('简历 bullet：只在实测后填数字') + PORTFOLIO.resumeBullets.map(function (item) {
        return '<div class="card"><div class="card-head"><strong>' + escapeHtml(item.project) + '</strong>' + badge('模板', 'b-mid') + '</div><p class="resume-line">' + escapeHtml(item.template) + '</p></div>';
      }).join('') +
      section('投递优先级') + '<div class="grid c3">' + PORTFOLIO.applicationPriority.map(function (item) {
        return '<div class="job tier-' + escapeHtml(item.tier) + '"><div class="jh"><div class="jt">Tier ' + escapeHtml(item.tier) + '</div></div>' + tags(item.targets) + '<div class="jq">' + escapeHtml(item.reason) + '</div></div>';
      }).join('') + '</div>' +
      section('面试开场的证据顺序') + '<div class="story-flow">' + [
        ['生产背景', '我做过 Python 后端和 AI 应用，理解可靠性与交付约束。'], ['真实问题', '长任务中的记忆、上下文和工具失败无法靠 prompt 补丁解决。'],
        ['研究动作', '我把问题形式化为异构图上的组织、压缩与检索，并做双轨评测。'], ['工程证据', 'AgentParliament v2 用 Trace/Eval/Memory 报告成功率、成本、P99 与吞吐。'],
        ['岗位匹配', '因此我适合 Agent Runtime、Harness、评测、记忆与知识工程团队。']
      ].map(function (s, i) { return '<div class="story-step"><span>' + (i + 1) + '</span><strong>' + s[0] + '</strong><p>' + s[1] + '</p></div>'; }).join('') + '</div></div>';
  }

  function renderVerify() {
    var items = JOBS.verification.filter(function (item) {
      var handled = state.checks.has(item.id);
      var statusOk = state.verifyStatus === 'all' ||
        (state.verifyStatus === 'done' ? handled : !handled);
      return (state.verifyImpact === 'all' || item.impact === state.verifyImpact) && statusOk;
    });
    return '<div class="page">' + pageHead('verify', 'Uncertainty register') +
      callout('核验排序规则', '先处理会改变论文能否毕业、实习能否外出、方向是否有算力的未知条件；低影响信息不要抢占注意力。状态修改仅在当前会话有效。', 'warn') +
      '<div class="filters filter-stack">' + filterGroup('影响', 'verifyImpact', [['all', '全部'], ['critical', '关键'], ['high', '高'], ['medium', '中']], state.verifyImpact) +
      filterGroup('本次会话', 'verifyStatus', [['all', '全部'], ['open', '未处理'], ['done', '已标记']], state.verifyStatus) + '</div>' +
      '<div class="result-count">显示 ' + items.length + ' / ' + JOBS.verification.length + ' 项</div><div class="verification-list">' + items.map(function (item) {
        var checked = state.checks.has(item.id);
        return '<article class="card verify-card ' + (checked ? 'done' : '') + '"><div class="card-head"><div><span class="mono-sm">' + escapeHtml(item.area) + '</span><h3>' + escapeHtml(item.title) +
          '</h3></div><div>' + badge(item.impact, item.impact === 'critical' ? 'b-low' : item.impact === 'high' ? 'b-mid' : 'b-dim') + ' ' + evidenceBadge(item.evidence) + '</div></div><p><b>核验动作：</b>' + escapeHtml(item.action) +
          '</p><label class="mini-check"><input type="checkbox" data-check-id="' + escapeHtml(item.id) + '"' + (checked ? ' checked' : '') + '> 当前会话标记已处理</label></article>';
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
    bindPageEvents();
    window.scrollTo(0, offset);
  }

  function bindPageEvents() {
    app.querySelectorAll('[data-filter]').forEach(function (button) {
      button.addEventListener('click', function () {
        var name = button.getAttribute('data-filter');
        state[name] = button.getAttribute('data-value');
        render(true);
      });
    });
    app.querySelectorAll('[data-check-id]').forEach(function (input) {
      input.addEventListener('change', function () {
        var id = input.getAttribute('data-check-id');
        if (input.checked) state.checks.add(id); else state.checks.delete(id);
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
    allPapers().forEach(function (item) { entries.push({ route: 'reading', title: item.t, detail: (item.ax || '') + ' ' + item.why }); });
    TOOLS.discover.forEach(function (item) { entries.push({ route: 'tools', title: item.n, detail: item.use + ' ' + item.how }); });
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

  render();
}());
