# 决策工作台 · 维护手册

这份文档写给三年后的你（或任何接手的人），目的是让你能在忘记全部实现细节的情况下，安全地改数据、加板块、接持久化。

- 站点入口：`site/index.html`，双击即可打开（`file://`），也可用任意静态服务器。
- 技术栈：原生 HTML/CSS/JS，**零依赖、无构建、无网络请求**。
- 数据修订至 2026-09-06（招聘快照数据仍为 2026-07-28 抓取）。历轮修订：① 北京中转政策、论文主线转向、作品集对齐真实仓库、本地 PDF 阅读库；② 阅读页重构为「公共必读 + 方向路线」、工具链缩编为速查卡（方法论移交 grad-companion 插件）、求职资产降级为方向参考、技能路线补学习参考；③ 2026-08-30 学习层两级 IA（原设计文档已删，规则并入本手册 §2/§6）：阅读/技能页改为「L1 目录 + L2 路线」，论文按 tier 分层，Oblivion 去重，技能侧修 LangChain 链与 6.5840 标签；④ 2026-08-31 论文 L3 阅读卡（[PAPER-DEEP-READ-DESIGN.md](../docs/PAPER-DEEP-READ-DESIGN.md)，已审查放行并实施）：`#reading/<层级>/<ax>` 每篇论文一张卡，本地 PDF 库移除、原文改 arXiv 双外链，死链 `pdf:true` 全清；⑤ 2026-08-31 全站文案去 AI 味：data 七个文件与 app/l3 的展示文案全部改写成自然口语，句子结构、字段名、数字、颜色纪律、localStorage key 都没动；写作守则登记在 §9.12，完整经验文档在本地 `docs/AI味排查与改写守则.md`（docs/ 已 gitignore，不入仓库）。⑥ 2026-09-02 批 2 深读卡补齐：主路径与前置 40 篇全部有卡（39 篇当次经 grad-radar 的 arxiv_html.py 抓取 LaTeXML 全文后撰写，2608.22152 无 HTML 按设计文档 §7.3 降级为摘要级；2606.09863 同日升级为 arxiv_html 并补切片），公共 13 张与延伸 17 张按守则做表达二刷，papers:check 收紧为全硬性。⑦ 2026-09-06 论文方向重构（依据本地 `docs/论文方向重构说明.md`，实施路线见 `docs/方向重构实施路线-2026-09-06.md`；路线文档与实施结果分别经记忆干净的 qwen3.8-flash 子代理审查放行：路线三轮、实施一轮，零 major）：主线改为**任务完成验证（预算约束下的环境证据选择）**；方向四档 tier（main/extension/conditional/paused）；公共必读重组为主线地基 12 条（含预印本 202608.2057 走 srcUrl 外链、无卡），原记忆类 10 篇移入 C/D 延伸层；新增 2608.02645 深读卡与 2606.13177 速览卡；条目 73 = 72 卡 + 1 预印本；90 天计划改为前 4 周问题验证；勾选迁移见 app.js `PAPER_MIGRATIONS`（仅同一篇论文换轨才迁移，`week-*` 不迁移）。同日二次收编：方向卡从四档收敛为**三条**（主线 A + 扩展 B/E），C/D/F 从 `angles` 移入新顶层键 `archived`（一行一条存档卡，渲染在研究页折叠块与阅读页轨道折叠块，含状态与启动/重启条件），其阅读轨道 `tracks.C/D/F` 与全部阅读卡**原样保留**、直接链接可达；papers:check 新增 angles=3 / archived=CDF / 主线唯一等结构断言。

---

## 1. 目录与职责

```
site/
├── index.html          页面骨架、导航、脚本加载顺序
├── assets/
│   ├── style.css       全部样式（设计令牌 + 组件 + 响应式 + 打印）
│   ├── l3.js           L3 论文阅读卡渲染器（window.L3；含与 app.js 平行的最小工具集）
│   └── app.js          渲染器、路由、搜索、筛选、会话状态
└── data/
    ├── facts.js        window.DATA       现实基线（导师、制度、校企、就业）
    ├── research.js     window.RESEARCH   研究主线、公共/方向阅读清单、90 天计划
    ├── papers.js       window.PAPERS_BY_AX  L3 阅读卡（主键 arXiv id；深读卡/速览卡）
    ├── tools.js        window.TOOLS      工具速查卡（方法论已移交插件）
    ├── jobs.js         window.JOBS       招聘快照、岗位、实习阶梯、待核验
    ├── skills.js       window.SKILLS     技能信号、学习路线（含学习参考）
    └── portfolio.js    window.PORTFOLIO  作品集与求职叙事
```

**改内容只动 `data/`，改外观只动 `style.css`，改结构才动 `app.js`。** 九成的日常更新只需要编辑 `data/` 里的数组。

### 脚本加载顺序（不可颠倒）

`index.html` 底部按此顺序加载，七个数据文件与 l3.js 必须在 `app.js` 之前：

```
facts → research → tools → jobs → skills → portfolio → papers → l3 → app
```

数据文件之间没有依赖，彼此顺序可换（papers 需在 app 之前）；l3.js 只依赖 RESEARCH/PAPERS_BY_AX/SKILLS，app.js 依赖 l3 暴露的 `window.L3`。

---

## 2. 为什么是这个架构

选择的理由，避免以后误改：

- **不用框架、不用打包**：这是一份要用三年的个人决策文档。任何构建链在三年后都可能装不起来，而 `file://` 双击永远能打开。
- **用经典脚本 + 全局变量，不用 ES module**：`file://` 下 ES module 会被 CORS 拦截，直接双击就白屏。
- **不把 `.jobs/baidu.json`（2.26 MB，1287 条）放进页面**：站点只存可复算的聚合数字和 14 个代表岗位。原始数据留在 `.jobs/` 供复核。
- **原文走 arXiv 双外链，不存本地 PDF（2026-08-31 起）**：每篇论文的原文入口是阅读卡页头的 `arxiv.org/abs/<ax>` 与 `arxiv.org/html/<ax>`（LaTeXML 在线版，细读标注的章节锚点指向它）。本地 47 篇 PDF 已移除——离线阅读不再是硬需求，仓库减重约 122 MB。**不要恢复 `site/papers/`**，也不要在新数据里写 `pdf:true`（渲染层已无此分支，`scripts/papers-check.js` 会把残留标记当失败）。
- **方法论不在站外归档**：文献漏斗与切片按 grad-companion 插件的 `grad-radar` skill 执行；逐篇论文的「读哪里、怎么读」由 L3 阅读卡承接（细读标注 + 盘问问题）。旧 `RESEARCH-PLAYBOOK.md` 的 D 盘路径已核实不存在，全部引用已清除，不要再写死个人盘路径。
- **状态已持久化（2026-08-29 起）**：勾选/主题/阅读方向经 localStorage 保存在本机（键与降级策略见第 7 节）；筛选器仍是会话态。数据都带稳定 `id`，**不要改 id 命名规则**，否则已保存的勾选会失效。
- **学习层是「目录 + 路线 + 阅读卡」三级（2026-08-30 起两级，2026-08-31 起三级）**：`#reading` / `#skills` 是目录（L1）；`#reading/common|A—F` 与 `#skills/<技能id>` 是单对象学习路线（L2）；`#reading/<层级>/<ax>` 是单篇论文的 L3 阅读卡。L1 不渲染论文全文墙与技能大卡全字段；L2 论文行即 L3 入口。**逐级回退**：非法第三段回退 L2，非法第二段回退 L1（不跳仪表盘、不报错）。原「两级」方案的裁定历史见 PAPER-DEEP-READ-DESIGN.md §1.2。

---

## 3. 数据模块速查

括号内为当前条目数，便于改动后核对。

| 全局对象 | 顶层键 |
|---|---|
| `DATA` | `meta, corrections(4，第三条带 superseded:true=已被 2026-09 主线取代，渲染归档标注用), advisor, rules, partners, employment, wafNote` |
| `RESEARCH` | `positioning, angles(3：A 主线 tier:'main' + B/E 扩展 tier:'extension'), archived(3：C/D/F 存档一行卡，各含 id/status/name/line/track), rejected(2), angleAdvice, reading{common(12 = 11 ax + 1 srcUrl 预印本，items 字段), tracks(A 2 · B 6+6延伸 · C 5+11延伸 · D 前置3+7主+10延伸 · E 5 · F 5+1延伸，各含 pitch/fit/stages/papers/repos/datasets/note)}, metrics(5 组), plan90(12), plan90Switch, fallback(6), saturated(10), rivals(11), rivalJudgement, translate, pitch, reportDeck, reportTips, firstMail` |
| `TOOLS` | `groups(4 任务组：查文献/读论文/记实验/准备投稿，引用 core 的工具名), core(11 速查), companion, monthly` |
| `JOBS` | `pageNote, meta, cityPolicy(phases×2 + transit), stats, roleFamilies(9), teams(14), internshipLadder(4), timeline, regions(7), risks, verification(13)` |
| `SKILLS` | `meta, signals(19), roadmap(13，每条含 refs 学习参考；refs 可带 tier:'extend'，roadmap 可带 note 边界说明), interviewTracks(4)` |
| `PORTFOLIO` | `projects(3), principles, narratives, resumeBullets(4，当前不渲染、2027 重做时启用), storyTemplate, applicationPriority` |

**2026-09-06 展示改版后 `pageSummary` 要点块与各页 `summary`/`readingSummary`/`verifySummary` 数据字段已整体删除**（与 positioning/pageNote 等导语重复，且长期双份维护必然漂移；2026-09-07 清理时移除）。不要再新增 summary 字段——页面导语一律走 positioning/pageNote/lede。
`dashboard / tools / career / portfolio` 四页从来没有要点块（各有定位说明或本身即速查）。

### 常用字段结构

```js
// JOBS.teams[] —— 代表岗位卡
// cityFit 是地域约束维度，决定这条到底能不能投（见第 4.1 节）
{ id, company, name, cities[], cityFit, roleFamily, targetTier, recruitmentTypes[],
  careerStages[], tags[], summary, claimType, evidenceLevel, sourceAsOf,
  freshness, opening, tier }

// JOBS.verification[] —— 待核验项
{ id, area, title, impact, status, evidence, action }

// JOBS.cityPolicy —— 地域偏好的唯一定义处（见第 4.1 节）
// 2026-08 修订：原 excluded（北京不投递）已替换为 transit（北京中转）。
// phases[].cities[].rank 是投递优先级，北京在就业阶段 rank=5，渲染层按它排序
{ headline, phases[{ id, label, window, rule, cities[{ name, rank, role, why }] }],
  transit: { cities[], rule, use, limit }, tension }

// JOBS.regions[] —— 各城市策略明细
// phase: 'study' | 'employment' | 'excluded'；rank 与 cityPolicy 保持一致，北京固定 99
{ city, phase, rank, role, tier, sample, strategy, risk }

// JOBS.stats.cities[] —— 城市记录分布
// fit 决定分组：target=意向城市 / transit=北京（中转） / other=与决策无关
// tech 为该城市技术岗数，null 表示未单独统计
{ city, count, pct, tech, fit }

// JOBS.stats.cityReach[] —— 去重后的可投池测算（不是各城市相加）
// 2026-08 复算口径：意向城市 304 / 北京 943 / 总池 1247（技术岗 728）
{ label, value, note }

// SKILLS.signals[] —— 市场信号（百分比是文本命中率，不是硬要求率）
{ id, name, domain, baidu, tencent, priority, judgement }

// SKILLS.roadmap[] —— 学习路线（每条带 refs 学习参考）
{ id, name, priority, domain, target, deadline, deliverable, status,
  note,                                            // 可选：技能 L2 的「边界说明」callout（当前 skill-eval / skill-graphdb）
  refs: [{ kind: 'book'|'web'|'paper', label, url, local?, tier? }] }
// refs.tier = 'extend' 表示延伸资料（技能 L2 折叠展示，不进学习步骤）；local=<ax> 指向该论文的 L3 阅读卡（站内跨路由链接）

// RESEARCH.reading —— 「公共必读 + 方向私有路线」两层结构
reading: {
  common: { name, note, items: [论文条目] },        // 无论走哪个方向都要读；条目带 intro 扩充介绍
  tracks: {
    A: { name, pitch, fit,                          // 方向定位与导师/求职接口
         stages: [{ k: '第 1—2 月', v: '做什么' }],  // 阶段路线，渲染为可视化 stepper
         papers: [论文条目], repos: [{ r, note }], datasets: [{ n, d }], note }
    // B—F 同构
  }
}

// 论文条目（common.items 与 tracks.papers 通用；注意 common 用 items、方向用 papers）
// t=标题 ax=arXiv y=年月 v=venue c=引用量 h=预计工时 why=为什么读
// 可选：key=必精读  warn=撞方向
//       srcUrl=无 arXiv id 条目的原文外链（预印本；有 srcUrl 就不写 ax、不建 L3 卡，
//       L2 行渲染站外链接，勾选 id 从 srcUrl 提取手稿号，如 paper-common-202608.2057）
//       tier：缺省=主路径；'prereq'=选本方向的前置（当前仅 D）；'extend'=延伸（L2 折叠，不进 90 天主路径）
// common 层另有 n=序号（1—12，L2 分段与工时合计依赖它）与 intro=两三句扩充介绍
{ t, ax, y, v, c, h, why }

// window.PAPERS_BY_AX（data/papers.js）—— L3 阅读卡，主键 = arXiv id；research.js 是归属事实源
// 深读卡：{ level, tldr, sections[{k,t,s,a?}], must[{k,act:'deep'|'scan'|'skip',why,a?}], slices[]?, link{week?,skills[]}?, quiz[], unread{read[],notRead[],source,at} }
//   unread.source ∈ arxiv_html（当次抓取）/ knowledge（模型既有知识，未当次抓取）/ abstract（仅摘要级，sections 可为空）
// 速览卡（延伸篇专用）：{ level, skim: { whySkim, whenBack } }
// 2026-09-06 方向重构后：条目 73 = 深读卡 54 + 速览卡 18 + 无卡预印本 1（Strategic Verification，202608.2057）；
// 「阅读卡待生成」降级页仅作防御分支保留；契约由 npm run papers:check 把关（全硬性，口径见脚本头注释）

// RESEARCH.angles[].tier —— 方向档位（2026-09-06 起，二次收编后仅两档成卡）
// main = 唯一主线（仅 A）；extension = 主线稳定后的扩展（B、E）。
// conditional / paused 枚举保留兼容，但 C/D/F 已从 angles 移入顶层键 archived（一行一条存档卡：
// { id, status, name, line, track }，line 写启动/重启条件），渲染在研究页折叠块与阅读页轨道折叠块；
// tracks.C/D/F 数据原样保留。重启某方向：把 archived 条目移回 angles 并补全 method/venue/cost/risk。

// RESEARCH.angles[].scores —— 六维评分（2026-08 换标尺，旧版 fit/novel/cheap/first/safe 已废弃）
{ value, novelty, falsifiable, feasible, resource, career }   // value 为 1-5 整数

// RESEARCH.rejected[] —— 已拒绝方向存档（本人确认，防止重新发明）
{ id, name, reason }

// TOOLS —— 缩编后的速查结构
{ disclaimer, core: [{ n, use, ref }], companion: { name, playbook, note }, monthly }

// PORTFOLIO.projects[].metrics[] —— 四项核心指标
// value 为 null 时显示"待实测"；status='preliminary' 表示 n=1 初步实测
{ key, label, value, status }
```

`reading` 不再按 L0—L4 分层（旧七层结构已废），而是**「主线公共必读 + 方向轨道」两层**：`common`（12 条 = 11 篇 ax + 1 条 srcUrl 预印本，含扩充介绍）永远显示，全部服务主线；`tracks` 按方向 A—F 切换渲染——目录卡只给主线 A 与扩展 B/E，C/D/F 收进折叠块给链接（数据由 `RESEARCH.archived` 驱动），轨道数据本身完整保留。方向档位由 `angles[].tier`（main/extension）与 `archived` 共同驱动目录卡与 L2 的状态徽章。每个方向卡自带阶段路线（可视化 stepper，档案方向的 stepper 以「暂缓说明」开头）、方向必读、复现资产与数据集。新增方向时必须在 `tracks` 下补齐 `pitch/fit/stages/papers/repos/datasets/note` 七个字段，缺一个方向卡就缺一块。

---

## 4. 枚举取值

岗位页的筛选按钮**从 `JOBS.teams` 动态派生**（`uniqueBy`），所以不会再出现「按钮存在但筛不出结果」的死选项：数据里没有的值不会生成按钮，新增的值会自动出现按钮。

但仍要照下表填写，否则按钮会显示成原始英文键名（缺少中文标签），或与「岗位族」等展示区对不上。

| 字段 | 合法值 |
|---|---|
| `claimType` | `fact` `inference` `needsVerification` `forecast` |
| `evidenceLevel` | `officialFullJD` `officialPartialJD` `officialProgram` `secondaryNamed` `secondaryWeak` `forecast` |
| `roleFamily` / `roleFamilies[].id` | `ai-app` `agent` `harness` `rag` `posttrain` `inference` `platform` `fde` `backend` |
| `targetTier` | `primary` `secondary` `fallback` `avoid` |
| `careerStages[]` | `masterYear1` `masterYear1Winter` `masterYear1Summer` `masterYear2Fall` `masterYear2Winter` `summer2029` `campus2029` `fallback` |
| `recruitmentTypes[]` | `social` `dailyIntern` `campus` `summerIntern` `talentProgram` `openSourceInternship` |
| `tier`（卡片色条） | `S` `A` `B` `C` |
| `impact`（待核验） | `critical` `high` `medium` |
| `priority`（技能） | `P0` `P1` `P2` `P3` |
| `src`（facts.js 来源） | `s1` 一手 / `s2` 二手 / `s3` 推断 |
| `timeline[].type` | `plan` `forecast` |
| `cityFit`（地域适配） | `preferred` `acceptable` `avoid`（2026-08 后仅用于「长期驻京无跳出价值」类岗位；北京岗位默认 `acceptable`） |
| `tier`（论文条目 / 技能 refs） | `core`（缺省，主路径） `prereq`（方向前置，当前仅 D） `extend`（延伸，不进 90 天主路径 / 学习步骤） |
| `tier`（RESEARCH.angles，方向档位） | `main`（唯一主线，仅 A） `extension`（扩展，B/E）；`conditional`/`paused` 已由 `RESEARCH.archived` 承载（C/D/F 存档卡），枚举保留兼容 |

---

## 4.1 地域约束（改岗位数据前必读）

地域是**硬约束，优先于岗位匹配度**——但约束本身会随本人意愿修订，2026-08-28 刚发生过一次：**北京从「任何阶段不投递」改为「毕业后可接受 1—2 年中转跳板」**。改地域相关内容前，先确认约束的当前版本。

**唯一事实源是 `JOBS.cityPolicy`**，岗位页开头就渲染它。改地域偏好只改这一处，不要散落到各段文案里。

| 阶段 | 城市与顺序 | 说明 |
|---|---|---|
| 读研期间（2026.09—2029.06） | 1 重庆 → 2 成都 | 重庆是驻地；成都在 1—2 小时高铁圈，是默认跳板。北京 1—2 个月的寒假实习仅作跳板落空后的末位备选 |
| 毕业就业（2029 起） | 1 杭州 → 2 上海 → 3 深圳 → 4 广州 → 5 北京（中转） | **顺序即偏好强度**，由 `rank` 表达；北京 rank=5，角色是「中转跳板（1—2 年）」 |
| 中转纪律 | 北京 = 跳板不是终点 | 入职前写清 1—2 年后的跳出计划（目标城市/团队/需补能力）；长期（>2 年）驻京不在计划内 |

`cityPolicy.phases[].cities[].rank` 是渲染排序依据，`JOBS.regions[].rank` 必须与它保持一致（渲染层按 `rank` 排序，不按样本量）。改偏好顺序时两处都要改。北京的中转规则、用法与上限写在 `cityPolicy.transit`（渲染为琥珀色「中转可接受」卡片，取代旧版红色「不投递」卡片）。

对应的 `cityFit` 取值：

- `preferred` —— 命中该阶段的首选城市（读研期重庆/成都；毕业期杭州/上海/深圳/广州）
- `acceptable` —— 在意向列表内但非首选，**含北京中转岗位**
- `avoid` —— 与地域意向真正冲突的岗位（现仅指「需长期驻京且无跳出价值」类）。这类条目应同时满足 `targetTier:'secondary'`、`tier:'C'`、`opening` 写明定位

> **2026-08 修订的教训要记住**：第一版曾因把北京标成 S/A 而整页策略与真实意向相反，于是矫枉过正写成「北京不投递、仅作情报」；半年后本人接受北京中转，策略再次反转。两次教训是同一个——**策略页必须忠实于当时的真实意向，意向变了就改数据并记录修订日期**（`JOBS.meta.revisedAt`），不要让旧约束以「纪律」的名义存活。

**页面顺序仍是策略的一部分**：岗位页先讲地域约束，再讲岗位族与样本，最后才折叠展示百度快照口径。

**城市分布图按 `fit` 分组**（`target` / `transit` / `other`），不按记录数排序。北京柱条固定进 `transit` 组并降饱和显示（琥珀色，不是旧版的红色）。新增城市时必须同时给 `fit`，否则不会出现在任何分组里。

**两个目标池仍是数据缺口，不是已核验岗位**：`hz-target-pool`（杭州）和 `cd-hz-winter-pool`（研二寒假成都/杭州）都标为 `needsVerification`，因为本轮 1912 条快照没有覆盖这些雇主。补数据时按抓腾讯/百度的同样方法补样本，再把这两条替换为具体团队，并同步销掉 `verify-hz-teams` / `verify-cd-student-hc` 两个核验项。

> **杭州技术岗样本为 0，这不是笔误。** 1287 条里杭州只有 7 条记录且技术岗为 0——首选城市恰好证据最薄。北京中转化并不解决这个问题：中转池（943 条）只在「1—2 年后跳走」的前提下才有价值，直接落地仍靠杭州补数据。`cityPolicy.tension` 就是在说这件事：偏好顺序与证据强度不一致时，要补数据，而不是改偏好。

> `roleFamily` 用连字符（`ai-app`），不是驼峰（`aiApp`）。第一版曾因这个不一致导致「AI 应用」筛选永远为空。
>
> 新增枚举值时，记得同步 `app.js` 顶部的标签映射表（`familyLabels` / `tierLabels` / `stageLabels` / `evidenceLabels` / `claimLabels`），否则按钮和徽章会直接显示英文键名。

---

## 5. 常见修改怎么做

**加一个代表岗位**：在 `JOBS.teams` 末尾追加一条，`id` 全站唯一，枚举照第 4 节填。筛选器和搜索会自动收录，无需改 `app.js`。

**加一篇论文**：在 `RESEARCH.reading.<层级>.items`（common）或 `tracks.<方向>.papers`（方向）追加。**一篇只归一处**：跨方向复用就在目标方向 `note` 里写「见方向 X」，绝不复制条目（2026-08-30 已按此把 Oblivion 从 C 删除，只留 F）。主路径与延伸用 `tier` 表达——降级写 `tier:'extend'`，**不要从数据里删除**，防止重新发明。**如果只在正文里提 arXiv 编号（比如 90 天计划、风险说明），必须同时把它加进阅读清单或数据集列表**，否则就成了站点自己禁止的「未核验引文」。同时决定阅读卡：主路径论文在 `papers.js` 补深读卡（流程与诚实标注见 PAPER-DEEP-READ-DESIGN.md §7），暂不补则该篇在 L3 显示「阅读卡待生成」降级页（`npm run papers:check` 的覆盖率行会提示）。**没有 arXiv id 的文献**（如 preprints.org 预印本）：写 `srcUrl` 不写 `ax`，不建卡，L2 行自动渲染站外链接——不要为了进卡体系给它硬造一个 ax。

**新增待核验项**：追加到 `JOBS.verification`，`impact` 决定排序权重。

**填入实测指标**：把 `PORTFOLIO.projects[].metrics[].value` 从 `null` 改成真实值，并把 `status` 改为 `measured`。**没实测前不要填目标值**——页面靠 `null` 显示「待实测」，填了就等于把目标冒充成果。

**加一个新板块（需要动 `app.js`）**，四处都要改，缺一处会静默失效：
1. `routeMeta` 加标题与副标题
2. 写一个 `renderXxx()` 返回 HTML 字符串
3. `renderers` 注册路由 → 函数
4. `index.html` 侧栏加 `<a class="nav-item" href="#xxx" data-route="xxx">`

---

## 6. 渲染层要点

**app.js ↔ l3.js 同步锁（2026-09-06 登记，qwen 审查 minor-2）**：`escapeHtml / badge / section / details` 四个工具在两个文件各有一份（IIFE 隔离，无法共享）。改任何一个的签名或行为，必须同步另一份——当前唯一保护是这条记录，没有自动化校验。

`app.js` 是一个 IIFE，结构为「工具函数 → 组件 → 十个页面 → 状态与事件」。

- **路由**：`location.hash`，未知 hash 回退到 `dashboard`。
- **组件**：`card / stat / badge / callout / table / kv / list / tags / details / section / pageSummary（要点块，读各模块 summary 字段）/ timeline / checkList / filterGroup / claimBadge / evidenceBadge / renderNowCard + currentPhase + phaseActions（仪表盘阶段感知，里程碑常量在渲染器顶部，每年复核）/ renderProgress（三条进度线）/ renderRoadmapSpine（三年主路线图）/ renderWeekStrip（90 天 12 周条）/ renderCurrentWeekCard（阅读 L1 的「本周」卡，读/做/产出三行，arXiv id 自动链接）/ commonStageFlow（公共必读三步分段，从 note 派生）/ renderCommonCatalog + renderTrackCatalog（阅读 L1 目录卡）/ renderReadingL2（阅读 L2 单方向路线页，十块骨架）/ renderSkills（技能 L1 目录卡，P0 置顶）/ renderSkillL2（技能 L2 学习路线页，八块骨架）/ l2Head + crumb（L2 面包屑与页头）/ l2PaperRows（L2 论文行：一行 = 序号/勾选/标题/原文外链/工时/why，行本身带 data-goto 进 L3）/ linkAx + paperHome（自由文本里的 arXiv id 自动链到 L3 阅读卡）/ stepItem（技能学习步骤；paper+local 自动链回 L3 阅读卡并标注「公共必读第 N 篇/方向 X」，不复制论文条目）/ renderTrackCard（已删除：方向全文下沉到 L2）/ skillRefs（已删除：学习参考改为 stepItem）`。
- **L3 渲染器（assets/l3.js）**：`window.L3.render(level, ax, ctx)` 返回阅读卡 HTML，`window.L3.hasPaper(level, ax)` 供 `render()` 分发校验。深读卡十块 / 速览卡五块 / 无卡降级页三种形态，骨架顺序在渲染器里写死。**l3.js 内有 escapeHtml/badge/section 等最小工具集与 app.js 各一份**（app.js 是 IIFE，内部不可见）——两处行为必须一致，改动需双处同步；新增全局常量（trackShort、ROUTE_NO 等）同样双份。
- **details() 第 5 参 `ref`（档案层降噪）**：`details(title, body, open, right, ref=true)` 渲染 `acc ref`，summary 字号/颜色弱化一档。**只加在档案类折叠块**（实验室/就业档案/口径/饱和/竞争/信号矩阵/见导师材料等），执行层折叠（90 天 Phase、公共必读进度、方法草案）不加——路线突出原则：阶梯、路线与周条永远排在档案折叠之前，执行层信息不折叠进背景噪音。
- **顶栏当前位置 chip**：`index.html` 的 `#phase-chip` 在每次渲染时由 `updatePhaseChip()` 填充（当前阶段名 + 开学后的周次）；元素缺失（如桩环境）静默跳过。原「进度保存在本机」文案保留在侧栏页脚。
- **信息分层约定（2026-08-29 起）**：页面内容分「要点层（pageSummary，永远可见）/ 执行层（默认展开）/ 证据层（默认折叠进 `details`）」。改内容时保持这个分层：情报类（饱和、竞争、口径、信号矩阵、就业档案）默认折叠，执行类（清单、路线、阶梯、学习路线）默认展开。折叠标题要自带信息量（名称 + 条数）。
- **学习层三级路由（2026-08-31 起）**：`render()` 先取 hash 第一段选 L1 渲染器；`reading` 与 `skills` 再读第二段——`READING_L2[sub]`（common/A—F）与 `skillById(sub)` 命中才渲染 L2，**非法第二段回退 L1**；`reading` 还有第三段 `#reading/<层级>/<ax>`——`window.L3.hasPaper(sub, ax)` 命中才渲染 L3 阅读卡（同时同步 `state.track` 并写回 `rp.track`），**非法第三段回退 L2**。L2 打开方向时同步 `state.track` 并写回 `rp.track`（URL 是事实源，不依赖 chip）。搜索索引的论文条目直达 `reading/<层级>/<ax>`，技能路线条目指向 `skills/<id>`（`crumb` 字段存结果卡左上角的来源标签）。
- **跨路由锚点（pendingAnchor）**：`data-anchor` 的目标不在当前 DOM 时（L2 周chip → L1 周条目、L3 接口块的周 chip → 周条目），先记下锚点再切 hash；`render()` 末尾滚动到位并展开所在 `details`。锚点 id 一律 `paper-<ax>` / `week-item-<Wx>`，**不要带 `/`**（会撞路由解析）。论文间的跳转已改直连 L3 路由（linkAx/stepItem），不再走锚点；`paper-<ax>` 作为 L2 行的结构 id 保留（无 JS 消费者，供校验与调试）。
- **勾选/筛选重渲染的焦点恢复**：`render(true)` 会先记录 `document.activeElement` 的 `data-check-id`，渲染后在对应勾选框上 `focus({preventScroll:true})` 归位——键盘连续勾选不因节点重建而丢焦点。
- **整块可点的键盘可达**：`[data-goto]` 块若带 `tabindex="0"`（当前是 L2 论文行），`bindPageEvents` 同时绑定 Enter/Space 触发；焦点落在行内控件（勾选框/外链）时不劫持。
- **目录卡整卡可点**：L1 目录卡带 `data-goto`（阅读方向卡用 `<a>` 原生跳转，技能卡用 div + data-goto）；点击落到 `a/button/label/input/summary/details` 上时让默认行为接管（保护勾选框）。
- **jobs 页 section 顺序**：地域约束 → 实习阶梯 → 岗位族 → 岗位样本 → 时间线 → 口径(折叠) → 数据边界(折叠)。阶梯在样本之前是刻意的（研一核心是阶梯不是目标地图），调整顺序前先想清楚。
- **verify 页渲染按 impact 排序**（critical → high → medium），数据顺序不动。
- **三个转义函数，按数据来源选**：
  - `escapeHtml()` —— 默认选择。用于所有纯文本字段（岗位名、城市、搜索词）。
  - `safeRich()` —— **先整体转义，再放回极小的白名单标签**（`b` `strong` `em` `code` `br`，且只认不带属性的裸标签）。用于策展文本里含 `<b>` 强调的字段：`teams[].summary`、`regions[].strategy`、`regions[].risk`、`RESEARCH.translate`。这类字段以前走 `escapeHtml()`，结果 `<b>` 被当字面量显示成 `&lt;b&gt;`；改用 `safeRich()` 后强调正常生效，`<script>`、`<img onerror>`、`<b onclick=...>` 仍全部保持转义。
  - `rich()` —— **完全不转义**，只允许用于仓库内手写、结构更复杂的 HTML 片段（`callout` 正文、`kv(rows, true)`）。
  - 以后若从 API/issue 同步数据，**必须走 `escapeHtml()` 或 `safeRich()`，绝不能用 `rich()`**，否则就是 XSS 入口。
- **容错**：`render()` 和搜索索引都包了 try/catch，单个板块数据出错会显示错误原因而不是整页白屏。
- **滚动**：`render(true)` 保留滚动位置（筛选、勾选用），`render()` 回到顶部（切页用）。
- **页内目录自动生成**：`buildPageToc()` 在每次渲染后扫描 `.page` 里的 `h3.sec`，≥3 个才注入右栏 `.page-toc`（少于 3 个时右栏是噪音）。**渲染器不需要维护章节清单**——新加一个 `section()` 会自动出现在目录里。
  - 中文标题经 `slug()` 会退化成一串连字符，所以缺 id 的标题按 `sec-<序号>` 补，保证唯一且稳定。
  - 高亮用 `IntersectionObserver`，并**按文档顺序**取第一个可见标题（不是按进入视口的先后），否则向上滚动会高亮错行。
  - `tocObserver` 是模块级单例，每次重建前 `disconnect()`——不断开会随每次筛选逐个累积。

---

## 6.1 布局系统（改样式前必读）

**不要再给 `.page` 加固定 `max-width`。** 第一版是 `max-width: 1180px` 左对齐，在 1920 屏上右侧有 488px（25%）完全空白，2560 屏上是 44%。

现在是三栏流式外壳，所有横向尺寸由 `:root` 的七个 token 驱动：

| token | 值 | 作用 |
|---|---|---|
| `--sidebar-w` | 256px | 左侧主导航 |
| `--toc-w` | 224px | 右侧页内目录轨（原来的死白） |
| `--shell-max` | 1840px | 超宽屏整体居中上限，留白左右对称 |
| `--measure` | 76ch | **仅**用于长段落行宽，不用于卡片/表格 |
| `--page-pad` | 38px | 左右内距**唯一来源** |
| `--topbar-h` | 57px | sticky topbar 实高 |
| `--gap` | 14px | 网格间距 |

三条规则：

1. **左右内距只改 `--page-pad`**，不要给单个元素写 `padding-left`。`.page`、`.topbar`、`.site-footer` 三者都从它派生，窄屏在 `@media` 里改 token 值即可，改动一处三者同步。若给某个元素单独加 padding，页脚横线会与正文错开（第一版就错了 4px）。
2. **网格按最小可读宽度自适应，不锁列数。** `.grid.c2/c3/c4` 现在是 `repeat(auto-fit, minmax(min(100%, Npx), 1fr))`，`c2/c3/c4` 表示**内容密度档位**而非列数：宽屏自动多排一列，窄屏自动落一列，中间不需要断点。若改回 `repeat(2, 1fr)`，1800px 正文宽下会变成两张 900px 的巨卡。
3. **限宽只加在文字上**。段落用 `--measure` 限宽保证可读；表格、卡片网格、图表应该吃满宽度。长清单（`.check-list`、`.paper-list`）在 ≥1500px 时用 `columns` 分两栏，避免单行拉到 1300px。

`scroll-margin-top` 已全局挂在 `h3.sec / h4.sub / [id]` 上，值为 `--topbar-h + 20px`。**新增锚点目标不需要单独处理**；但若改了 topbar 高度，要同步 `--topbar-h`，否则锚点跳转会被吸顶栏盖住。

---

## 6.2 配色约束

**2026-09-06 展示改版后：浅色是默认主题**（`:root` 即浅色值），深色整体挂在 `body.dark` 上；`index.html` 里 body 开标签后的内联脚本在首帧绘制前读 `rp.theme`，只有存过 `'dark'` 才切深色。改色时先分清「默认值」和「深色覆盖」两层。

强调色是克制蓝：浅色（默认）`#4055c8`，深色 `#7d9bff`。不是第一版的亮青。

**关键约束：绿 `--high` / 琥珀 `--mid` / 红 `--low` 三色已被「一手 / 二手 / 推断」占用，是内容语义而非装饰。** 强调色必须避开这三个色相，否则可靠度分级读不出来。`--info` 也因此从蓝移到青（`#38bdf8`），以免与靛色强调色混淆。

改任何颜色后请复算对比度，正文与小字号文本都要 ≥ 4.5:1：

```bash
npm run contrast   # scripts/contrast.js：双主题全组合审计，非零退出即不达标
```

`--text-dim` 与 `--text-faint` 承载的是统计标签、论文出处这类**真实元信息**，不是装饰，所以必须过 4.5:1。第一版这两个值分别只有 3.93 和 2.34。

**2026-08-31 对比度订正**：此前 `--text-faint`（深浅两主题）与浅色主题的 `--high / --mid / --low` 压在 hover/inset 背景上有 9 个组合落在 4.19—4.47。修法是只压亮度不改色相（证据三色语义不变）：深色 `--text-faint` `#7e8aa0→#7f8ba1`；浅色 `--text-faint` `#67738a→#626d83`（仍比 `--text-dim #5d6879` 浅，四级灰阶层级不变）、`--high` `#15803d→#157e3c`、`--mid` `#b45309→#b05109`、`--low` `#dc2626→#d52222`。改后 100/100 全过。再调色时沿用同一手法：HSL 只动 L，动完跑 `npm run contrast`。

侧栏底部的**证据分级图例**是这套设计的签名元素：这份文档的核心纪律就是「不把推断当事实」，把色码常驻视野里，读者不必去猜绿黄红代表什么。不要为了腾空间删掉它。

---

## 6.3 视觉身份（v3 · 安静的阅读工作台）

**2026-09-06 展示改版（设计说明见 docs/展示改版设计说明-给GLM5.3.md，实施记录见 docs/展示改版实施路线-2026-09-06.md §12）替换了 v2 的视觉身份。** v2 的网格底纹、点阵标记、编号系统、渐变标题已全部移除，不要恢复：

1. **主题**：浅色默认（`:root`），深色挂 `body.dark`。CSS 内不允许再出现 `body.light` 选择器；特例一律写 `body.dark` 覆盖。
2. **三个强调层级**：页面标题（`h2`）/ 当前交付（`.home-week`、`.home-deliver`）/ 主要行动（`.btn.primary`，每屏最多一个）。静态卡片不做按钮状，hover 反馈只属于可进入对象。
3. **无装饰**：无底纹、无渐变文字、无章节编号、无英文标语 eyebrow。`section()` 支持第三参 `short`（右栏目录短名），正文标题保持全称。
4. **层级色纪律不变**：绿/琥珀/红仍专属证据分级；岗位 tier 色条 S=紫、A=蓝、B/C=灰阶。
5. **首页骨架**：`renderDashboard` = 本周交付卡 + 阶段行动（左）/ 进度 + 待补（右）→ 次级三卡（下一篇阅读/待确认前提/工程证据）→ 主线一句 → 三年 spine 收进折叠。六维评分、纠正卡、红线清单不在首页（分别归研究页、读研前提、求职准备）。
6. **周选择路由**：`#reading/week/W<n>`（实施路线 §4-D5）。分发顺序：week → `READING_L2[sub]` → L1 回退；非法周次回退当前周。周详情一次只展示一周，当前周不重复出现。
7. **危险操作**：「清空全部进度」在侧栏「本机设置」折叠内，两步确认（第一次点击变「再点一次确认清空」，5 秒超时还原）。

`--topbar-h` 变更仍需同步锚点偏移。删除装饰时留下的孤儿类（`.hero-line`、`.eyebrow`、`--grid-line` 引用）确认无引用后才可删。

---

## 7. 持久化（2026-08-29 落地）

勾选、主题、阅读方向经 `localStorage` 保存在本机；键名集中在 `app.js` 的 `STORE`：

| 键 | 内容 |
|---|---|
| `rp.checks` | `state.checks` 的 JSON 数组（各条目稳定 id） |
| `rp.theme` | `'light'` / `'dark'` |
| `rp.track` | 阅读页方向选择（A—F） |

`state.checks` 存的就是各条目的稳定 `id`（`paper-common-*` / `paper-<方向>-*` / `paper-quiz-<ax>`（L3 盘问自测，2026-08-31 起）/ `plan90v2-*`（90 天计划勾选，2026-09-06 起带版本号；旧 `week-*` 条目留在 storage 作历史，任何新代码不得复用该前缀）/ `ap-*` / `atlas-*` / `cg-*` / `verify-*` / `monthly-*` / 技能 id）。读写全部走 `storeGet/storeSet/storeDel` 的 try/catch——**`file://` 下部分浏览器限制 localStorage，异常时静默降级为会话态**，不要把存储异常抛到页面上。侧栏「本机设置 → 清空全部进度」两步确认后清空 `rp.checks`（2026-09-06 起，防误触）。

**不要改 id 命名规则**，否则已保存的勾选记录会全部失效。**2026-09-06 的一次性迁移**：方向重构让 18 篇论文换了轨道（level 前缀变化），app.js 的 `PAPER_MIGRATIONS` 把旧勾选 id 迁到新 id——只迁同一篇论文（正则限定 `paper-<level>-<ax>` 形态、目标无记录才改写、幂等）；`paper-quiz-*` 按 ax 不受影响；**`week-*` 一律不迁**（旧周任务的完成不得算作新周任务的完成；同日又发现同名复用问题——新计划的勾选 id 已升版 `plan90v2-*`，旧 `week-*` 只作历史保留）。迁移完全生效后这张表可以整体删除。仪表盘「进度总览」三条线（公共必读 x/12、90 天 y/12、核验 z/13）直接从 `state.checks` 计数，与持久化同批上线——若回滚持久化，务必同时摘掉进度卡，避免出现恒为 0 的空条。阅读 L2 的方向论文行与技能步骤如需逐项勾选，**必须新增 id**（如 `skill-eval-step-1`），禁止复用现有技能 id；当前实现未加单步勾选。

---

## 8. 改完怎么验证

```bash
# 1) 语法（必做）
node --check site/assets/app.js
for f in site/data/*.js; do node --check "$f"; done

# 2) 百度聚合复算（改动 JOBS.stats 后必做）
#    应得 1287 / 796 社招 / 332 实习 / 159 校招 / 747 技术岗
node -e 'const a=require("./.jobs/baidu.json");
const c=x=>a.filter(r=>r._rt===x).length;
console.log(a.length,c("SOCIAL"),c("INTERN"),c("校招"),
a.filter(r=>r.postType==="技术").length)'

# 3) 可投池复算（改动 cityReach / cities[].tech 后必做）
#    2026-08 口径：应得 304 含意向城市（技术岗 197）/ 943 纯北京（技术岗 531）/ 1247 意向或北京（技术岗 728）
#    注意：这里用「记录是否包含该城市」判定，不是各城市相加
node -e 'const a=require("./.jobs/baidu.json");
const W=["重庆","成都","杭州","上海","深圳","广州"];
const has=(r,c)=>String(r.workPlace||"").includes(c);
const want=r=>W.some(c=>has(r,c));
const bj=r=>has(r,"北京"); const t=r=>r.postType==="技术";
console.log(a.filter(want).length, a.filter(r=>want(r)&&t(r)).length,
a.filter(r=>bj(r)&&!want(r)).length, a.filter(r=>bj(r)&&!want(r)&&t(r)).length,
a.filter(r=>bj(r)||want(r)).length, a.filter(r=>(bj(r)||want(r))&&t(r)).length)'

# 4) 论文数据契约（改动 reading / papers.js 后必做；也可直接跑 npm run verify 一并覆盖）
node scripts/papers-check.js
#    断言（2026-09-06 重构口径）：条目总数 73 / 公共 12（11 ax + 1 srcUrl 预印本）/
#    各方向 A2 · B12 · C16 · D20 · E5 · F6 / 有 ax 或 srcUrl / ax 唯一 / pdf:true 残留为 0；
#    papers.js 键合法且 level 与归属一致、深读卡必填字段、速览卡两字段、卡键总数 72（54 深读 + 18 速览）；
#    覆盖率全硬性：公共 ax 11 深读 + 主路径 30 深读 + 前置 3 深读 + 延伸 28 有卡（深读或速览，速览仅限延伸篇）
```

4) 浏览器冒烟：双击 `site/index.html`，逐一点开十个导航项，确认 F12 控制台无红色报错、页面无 `undefined`。
   也可以先跑无头版快速回归：`node scripts/render-smoke.js`——十个一级路由 + 阅读/技能 L2 + 论文 L3 阅读卡（深读/速览/无卡降级/非法第三段回退）样例，全部 PASS 即基本可用；
   阶段感知回归（三个模拟日期的阶段名/周次/行动切换）：`node scripts/phase-smoke.js`。
   阶段里程碑常量在 `app.js` 的 `PHASES`（依据 timeline 与阶梯节奏，**每年复核**）。
5) 交互：阅读 L1 点公共必读卡与任一方向卡进入 L2；点 L2 任一论文行进入 L3 阅读卡（键盘 Tab 到论文行按 Enter 也应进入），确认深读卡十块齐全（面包屑/原文双外链/定位/总览/逐节摘要/细读标注/接口/盘问/勾选/未读声明），延伸篇显示速览卡（全部 70 篇已有卡，「阅读卡待生成」仅是防御分支）；点 L2 的周 chip 与技能 chip 确认跨路由跳转并滚动到位；L3 的 上一篇/下一篇/返回 循环正确；勾选一个论文行进 L3 看状态同步、刷新后保留；勾一个清单看进度是否变化、勾选后焦点不丢；搜一个论文关键词确认结果直达 L3；连续勾选多个复选框确认键盘焦点不丢；切主题、窄窗口试移动侧栏（遮罩 / Esc / 点导航后自动收起）。
6) **地域顺序抽查**：打开 `#jobs`，确认页面第一屏是「地域约束」而不是百度快照；确认就业阶段顺序为 杭州 → 上海 → 深圳 → 广州 → 北京（中转）；确认北京卡片是琥珀色「中转可接受 · 1—2 年跳板」（不再是红色「不投递」），城市分布图里北京在「中转城市」分组。
7) **原文外链抽查**：打开 `#reading/common`，任选一条论文行点「↗ <ax>」确认新窗口打开 arXiv abs；进入其 L3 阅读卡点「arXiv HTML（LaTeXML）」确认在线版可达；抽取一篇细读标注核对章节号与 HTML 版一致（在线不可达时如实标注，不猜）。
8) **三级 IA 抽查**：打开 `#reading`，确认首屏没有 13 篇论文全文（导读只在 L3）；打开 `#reading/ZZZ`、`#skills/nope`、`#reading/A/9999.00000`、`#reading/common/2303.17760`，确认逐级回退（L3 非法→L2、L2 非法→L1）而不是报错或跳仪表盘；勾选一个 L2 论文行后刷新，确认进度保留（id 未变）。

---

## 9. 内容纪律（比代码更重要）

这个站点的价值在于「不骗自己」，以下规则请勿放宽：

1. **事实、推断、待核验、预测四类必须分开标注**。2028/2029 年的招聘窗口全部是历史规律外推，只能标 `forecast`。
2. **不要把 1287 条说成「百度全部 AI 岗位」**。它是 15 个关键词、三类招聘类型的检索快照，含大量产品/销售岗。
3. **城市数字不可相加**：163 条记录含多城市，做饼图必错，只能用横向柱状图并注明「按记录是否包含该城市计数」。
4. **技能百分比是文本命中率**，不等于硬性要求率，也不能证明人才供需。百度与腾讯字段完整度不同（腾讯缺任职要求），**两组百分比不可合并、不可直接排名对比**。
5. **作品集数字必须可追溯**：Atlas 的 542 测试 / 361s / $0.01 与 AgentParliament 的 6/6 来自仓库 README 与实测记录，可以写；但 n=1 必须标 `preliminary`，四个核心指标未实测前保持 `null`——**绝不把目标值冒充成果**。
6. **引用前核对标题/作者/venue/年份/DOI**，无法核实就不写进站点。清单内论文经 arXiv API 逐条反查确认（2026-08-28/08-30 两轮）；2026-09-06 新增的 2608.02645、2606.13177 经 arXiv 页面核实标题与摘要，Strategic Verification 经 preprints.org 链接核实（预印本，venue 如实标注）。后续新增同样照此办理。
7. **简历主标签不用 GraphRAG**（当前样本零命中），用 Agent Evaluation / Reliability / Observability / Harness / Memory。这不代表技术无价值，只是不适合 ATS 检索。
8. **原文不入库（2026-08-31 起）**：本地 PDF 库已移除，不要恢复 `site/papers/`，也不要在新数据写 `pdf:true`。原文经阅读卡的 arXiv 双外链打开；阅读卡内容按 PAPER-DEEP-READ-DESIGN.md §7 的诚实标注生成（`unread.source` 声明来源，未读部分明示），泛读论文保持速览卡，不要为「看起来完整」把没读过的论文写成深读卡。
9. **页面定位要写明「何时失效」**：求职资产页是方向参考（2027.12 重做）、岗位页重点是实习、工具页是速查卡——每处降级都要在页首 callout 写清定位与重做时点，防止三年后把过时内容当成现行事实。
10. **阅读页分层与方向收敛纪律（2026-09-06 更新）**：一篇论文只归一处（公共层或某一个方向），跨方向复用就在方向卡的 note 里写「引用公共层第 N 篇」，不要复制条目（2026-08-30 复核后全库唯一例外已清除，Oblivion 只在 F）。方向收敛：成卡方向只有主线 A 与扩展 B/E，C/D/F 在 `RESEARCH.archived` 存档（一行一条，资料在 tracks），页面上不要恢复六路并列或四档全展开；重启某方向时把 archived 条目移回 angles。**主线措辞纪律**：2606.09863 的轻量检测器写成必比基线（不写「它只刻画现象，我们补检测器」）；Strategic Verification 是预印本，引用前逐项划界；「读回状态、重试检查」不写成贡献；不靠大量弃权压误报。
11. **延伸与前置不删数据**：降级的论文 / 学习资料用 `tier:'extend'`、方向前置用 `tier:'prereq'` 留在数据里（L2 折叠展示），只有跨方向重复必须物理删除。「哪些论文重要」以 L2 主列表为准，不要看数据文件的书写顺序。
12. **展示文案说人话（2026-08-31 起）**：站内所有会渲染出来的文字必须写成有主语有动词的完整句子，不堆自造名词短语。硬规则：破折号每页最多一处；「不是 A 而是 B」只在真需要划界时用；自造概念先解释再使用，同一段不超过一个新词；UI 标签用用户此刻心里的话（勾选框写「这周验收完成」不写「本周验收完成」）；每个结论要接得住一个「因为」。行业通用词（baseline、ablation、reliability@k 等）不算 AI 味，保留。改文案前先读本地 `docs/AI味排查与改写守则.md`（不入仓库，丢了就从 §9.12 硬规则重建）。新增阅读卡（批 2）直接按此写，不要先写黑话版再回炉。

---

## 10. 已知限制

- **重邮官网**（`cs/yjs/xxgk/job.cqupt.edu.cn`）部署了瑞数动态防护，命令行抓取返回 412；只有 `/__local/...`、`/attached/file/...` 静态路径可取。你在浏览器里能正常打开，凡标「需自行核实」的多数点开即可看到。
- **学位成果要求、实习管理办法全文**未获取到公开版，是最高优先级的待核验项——直接影响能否毕业和研二能否外出实习。
- **腾讯 625 条快照没有本地原始文件**，无法像百度那样复算；其技能命中率只能视为下限。
- **`tools.js` 证据等级低于其他板块**：基于既有知识整理，未逐条检索核实。工具免费额度与期刊 AI 政策变化快，投稿前务必回到目标期刊的 Guide for Authors 原文确认。
- **导师支持新主线是口头结论（2026-08）**：属于一手但未经书面确认的信息，已按此修订选题策略；若后续沟通出现变化，先改 `facts.js` 第四条纠正与 `research.js` 的切口排序，再动其他板块。
- **切口 A–E 的引用多为 2026 年预印本**：venue 标注以 arXiv comment 为准（如 FAGEN@ICML 2026、Interaction Tax = ICML 2026），部分论文后续正式发表信息可能更新，引用前按第 9 节纪律复核。
- **arXiv 在线反查缺口（2026-08-30）**：两级 IA 实施期间 `export.arxiv.org` 连接被重置，76 个唯一 id 未能在本轮重做在线反查（2026-08-28 那轮已反查过）。网络可用时按第 9.6 条补一轮。技能侧 LangChain 文档已换到 `docs.langchain.com` 新址，MIT 课程号已改为 6.5840（URL 沿用旧路径，仍可达）。
- **L3 阅读卡的内容来源限制（2026-08-31 起，2026-09-06 更新）**：2026-09-06 重构后条目 73（卡 72 + 预印本 1 无卡）。来源分布：批 1 公共 13 篇里 12 篇为 `knowledge`（模型既有知识转写，未当次在线抓取核验），2606.09863 为 `arxiv_html`（含切片）；原批 2 主路径与前置 40 篇中 25 篇 `arxiv_html`、11 篇 `knowledge`（GCN/GAT/GraphSAGE、HAN、SDCN、CoALA、AutoGen 等经典，结构已对 HTML 目录核对）、4 篇 `abstract`；2026-09-06 新增 2608.02645 `arxiv_html`（当次抓取 HTML 章节结构）、2606.13177 速览卡。换轨只改 `level` 不改 `unread`（诚实记录仍是当次抓取事实）。卡片仍是 AI 生成、未经人工逐句校对，季度复核优先重跑 2026 预印本与全部 `abstract`/`knowledge` 卡。`npm run papers:check` 持续把关契约与覆盖（全硬性）。
