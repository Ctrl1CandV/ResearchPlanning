# 决策工作台 · 维护手册

这份文档写给三年后的你（或任何接手的人），目的是让你能在忘记全部实现细节的情况下，安全地改数据、加板块、接持久化。

- 站点入口：`site/index.html`，双击即可打开（`file://`），也可用任意静态服务器。
- 技术栈：原生 HTML/CSS/JS，**零依赖、无构建、无网络请求**。
- 数据截止：2026-07-28。

---

## 1. 目录与职责

```
site/
├── index.html          页面骨架、导航、脚本加载顺序
├── assets/
│   ├── style.css       全部样式（设计令牌 + 组件 + 响应式 + 打印）
│   └── app.js          渲染器、路由、搜索、筛选、会话状态
└── data/
    ├── facts.js        window.DATA       现实基线（导师、制度、校企、就业）
    ├── research.js     window.RESEARCH   研究主线、阅读清单、90 天计划
    ├── tools.js        window.TOOLS      科研工具链与规范
    ├── jobs.js         window.JOBS       招聘快照、岗位、实习阶梯、待核验
    ├── skills.js       window.SKILLS     技能信号与学习路线
    └── portfolio.js    window.PORTFOLIO  作品集与求职叙事
```

**改内容只动 `data/`，改外观只动 `style.css`，改结构才动 `app.js`。** 九成的日常更新只需要编辑 `data/` 里的数组。

### 脚本加载顺序（不可颠倒）

`index.html` 底部按此顺序加载，六个数据文件必须在 `app.js` 之前：

```
facts → research → tools → jobs → skills → portfolio → app
```

数据文件之间没有依赖，彼此顺序可换；但 `app.js` 必须最后。

---

## 2. 为什么是这个架构

选择的理由，避免以后误改：

- **不用框架、不用打包**：这是一份要用三年的个人决策文档。任何构建链在三年后都可能装不起来，而 `file://` 双击永远能打开。
- **用经典脚本 + 全局变量，不用 ES module**：`file://` 下 ES module 会被 CORS 拦截，直接双击就白屏。
- **不把 `.jobs/baidu.json`（2.26 MB，1287 条）放进页面**：站点只存可复算的聚合数字和 12 个代表岗位。原始数据留在 `.jobs/` 供复核。
- **状态不持久化**：勾选/筛选/主题只存内存，刷新即重置。数据都带稳定 `id`，接持久化时按 id 落库即可（见第 7 节）。

---

## 3. 数据模块速查

括号内为当前条目数，便于改动后核对。

| 全局对象 | 顶层键 |
|---|---|
| `DATA` | `meta, corrections, advisor, rules, partners, employment, wafNote` |
| `RESEARCH` | `positioning, angles(5), angleAdvice, reading(69 篇), saturated, rivals, rivalJudgement, repos(14), repoPath, datasets, dualTrack, metrics, plan90(12), fallback, translate, pitch, reportDeck, reportTips, firstMail` |
| `TOOLS` | `disclaimer, discover, manage, reading, experiment, writing, ai, submit, advisor, noteTemplate, evidenceWorkflow, reproducibilityChecklist, submissionChecklist, monthly` |
| `JOBS` | `meta, stats, roleFamilies(9), teams(14), internshipLadder(4), timeline, regions(5), risks, verification(12)` |
| `SKILLS` | `meta, signals(19), roadmap(13), interviewTracks(4)` |
| `PORTFOLIO` | `projects(2), principles, narratives, resumeBullets, storyTemplate, applicationPriority` |

### 常用字段结构

```js
// JOBS.teams[] —— 代表岗位卡
// cityFit 是地域约束维度，决定这条到底能不能投（见第 4.1 节）
{ id, company, name, cities[], cityFit, roleFamily, targetTier, recruitmentTypes[],
  careerStages[], tags[], summary, claimType, evidenceLevel, sourceAsOf,
  freshness, opening, tier }

// JOBS.verification[] —— 待核验项
{ id, area, title, impact, status, evidence, action }

// SKILLS.signals[] —— 市场信号（百分比是文本命中率，不是硬要求率）
{ id, name, domain, baidu, tencent, priority, judgement }

// SKILLS.roadmap[] —— 学习路线
{ id, name, priority, domain, target, deadline, deliverable, status }

// RESEARCH.reading.L0.items[] —— 论文条目
// n=序号 t=标题 ax=arXiv y=年月 v=venue c=引用量 h=预计工时 why=为什么读
// 可选：key=必精读  warn=撞方向
{ n, t, ax, y, v, c, h, why }

// PORTFOLIO.projects[].metrics[] —— 四项核心指标
{ key, label, value, status }   // value 为 null 时显示"待实测"
```

`reading` 的六层：`L0` 必读奠基 / `L1S` 综述 / `L1M` 代表方法 / `L1B` 评测基准 / `L2` 图学习 / `L3` 多 Agent。

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
| `cityFit`（地域适配） | `preferred` `acceptable` `avoid` |

---

## 4.1 地域约束（改岗位数据前必读）

地域是**硬约束，优先于岗位匹配度**。一个方向再对口，城市不符也不能标成主投目标。

| 阶段 | 可接受城市 | 说明 |
|---|---|---|
| 读研期间（研一—研三） | 重庆、成都 | 重庆是驻地；成都在 1—2 小时高铁圈，是唯一现实的跳板 |
| 毕业后（2029 起） | 杭州（首选）、深圳、广州、上海 | 杭州优先级最高 |
| 任何阶段 | **北京不作为投递目标** | 除非该岗位明确支持远程 |

对应的 `cityFit` 取值：

- `preferred` —— 命中首选城市（重庆/成都读研期；杭州毕业后）
- `acceptable` —— 可接受但非首选（深圳、广州、上海）
- `avoid` —— **纯北京岗位。保留它们只为「能力情报」**：从 JD 反推能力要求与作品集包装方式，不用于投递。这类条目应同时满足 `targetTier:'secondary'`、`tier:'C'`、`opening` 写明「不投递」。

> 不要因为北京岗位方向好就把它升回 `primary`/`S`。第一版就是这么做的：12 个代表岗位里 6 个涉及北京且都标为 S/A，而毕业首选的杭州一个都没有，整页策略与真实意向相反。

**两个目标池是数据缺口，不是已核验岗位**：`hz-target-pool`（杭州）和 `cd-hz-winter-pool`（研二寒假成都/杭州）都标为 `needsVerification`，因为本轮 1912 条快照没有覆盖这些雇主。补数据时按抓腾讯/百度的同样方法补样本，再把这两条替换为具体团队，并同步销掉 `verify-hz-jobs` / `verify-cd-student-base` 两个核验项。

> `roleFamily` 用连字符（`ai-app`），不是驼峰（`aiApp`）。第一版曾因这个不一致导致「AI 应用」筛选永远为空。
>
> 新增枚举值时，记得同步 `app.js` 顶部的标签映射表（`familyLabels` / `tierLabels` / `stageLabels` / `evidenceLabels` / `claimLabels`），否则按钮和徽章会直接显示英文键名。

---

## 5. 常见修改怎么做

**加一个代表岗位**：在 `JOBS.teams` 末尾追加一条，`id` 全站唯一，枚举照第 4 节填。筛选器和搜索会自动收录，无需改 `app.js`。

**加一篇论文**：在 `RESEARCH.reading.<层级>.items` 追加。**如果只在正文里提 arXiv 编号（比如 90 天计划、风险说明），必须同时把它加进阅读清单或数据集列表**，否则就成了站点自己禁止的「未核验引文」。

**新增待核验项**：追加到 `JOBS.verification`，`impact` 决定排序权重。

**填入实测指标**：把 `PORTFOLIO.projects[].metrics[].value` 从 `null` 改成真实值，并把 `status` 改为 `measured`。**没实测前不要填目标值**——页面靠 `null` 显示「待实测」，填了就等于把目标冒充成果。

**加一个新板块（需要动 `app.js`）**，四处都要改，缺一处会静默失效：
1. `routeMeta` 加标题与副标题
2. 写一个 `renderXxx()` 返回 HTML 字符串
3. `renderers` 注册路由 → 函数
4. `index.html` 侧栏加 `<a class="nav-item" href="#xxx" data-route="xxx">`

---

## 6. 渲染层要点

`app.js` 是一个 IIFE，结构为「工具函数 → 组件 → 十个页面 → 状态与事件」。

- **路由**：`location.hash`，未知 hash 回退到 `dashboard`。
- **组件**：`card / stat / badge / callout / table / kv / list / tags / details / section / timeline / checkList / filterGroup / claimBadge / evidenceBadge`。
- **`escapeHtml()` vs `rich()`**：
  - `escapeHtml()` 用于所有可能来自外部的文本（岗位名、JD 摘要、搜索词）。
  - `rich()` **不转义**，只允许用于仓库内自己写的、含 `<b>/<br>/<code>` 的策展字符串。
  - 以后若从 API/issue 同步数据，**必须走 `escapeHtml()`**，否则就是 XSS 入口。
- **容错**：`render()` 和搜索索引都包了 try/catch，单个板块数据出错会显示错误原因而不是整页白屏。
- **滚动**：`render(true)` 保留滚动位置（筛选、勾选用），`render()` 回到顶部（切页用）。

---

## 7. 以后接持久化

内存状态集中在 `app.js` 顶部的 `state`：

```js
state = { checks: Set<id>, jobCity, jobTier, jobStage, jobFamily,
          jobEvidence, skillPriority, skillDomain, verifyImpact,
          verifyStatus, paperLevel, paperFlag, paperCategory }
```

`state.checks` 存的就是各条目的稳定 `id`（`paper-*` / `week-*` / `ap-*` / `cg-*` / `verify-*` / `repro-*` / `submission-*` / `monthly-*` / 技能 id）。

最小改造：在 IIFE 启动时读取存储填充 `state`，在 `bindPageEvents` 的 change/click 回调里写回。**不要改 id 命名规则**，否则历史勾选记录会全部失效。

注意：`file://` 下 `localStorage` 在部分浏览器受限，若要可靠持久化，建议改用本地静态服务器打开，或落到文件/后端。

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
```

3) 浏览器冒烟：双击 `site/index.html`，逐一点开十个导航项，确认 F12 控制台无红色报错、页面无 `undefined`。
4) 交互：任选一组筛选（含组合筛选与空态）、勾一个清单看进度是否变化、搜一个关键词点结果跳转、切主题、窄窗口试移动侧栏（遮罩 / Esc / 点导航后自动收起）。

---

## 9. 内容纪律（比代码更重要）

这个站点的价值在于「不骗自己」，以下规则请勿放宽：

1. **事实、推断、待核验、预测四类必须分开标注**。2028/2029 年的招聘窗口全部是历史规律外推，只能标 `forecast`。
2. **不要把 1287 条说成「百度全部 AI 岗位」**。它是 15 个关键词、三类招聘类型的检索快照，含大量产品/销售岗。
3. **城市数字不可相加**：163 条记录含多城市，做饼图必错，只能用横向柱状图并注明「按记录是否包含该城市计数」。
4. **技能百分比是文本命中率**，不等于硬性要求率，也不能证明人才供需。百度与腾讯字段完整度不同（腾讯缺任职要求），**两组百分比不可合并、不可直接排名对比**。
5. **作品集四个数字未实测前保持 `null`**。
6. **引用前核对标题/作者/venue/年份/DOI**，无法核实就不写进站点。
7. **简历主标签不用 GraphRAG**（当前样本零命中），用 Memory / Context Engineering / Evaluation / Knowledge Graph。这不代表技术无价值，只是不适合 ATS 检索。

---

## 10. 已知限制

- **重邮官网**（`cs/yjs/xxgk/job.cqupt.edu.cn`）部署了瑞数动态防护，命令行抓取返回 412；只有 `/__local/...`、`/attached/file/...` 静态路径可取。你在浏览器里能正常打开，凡标「需自行核实」的多数点开即可看到。
- **学位成果要求、实习管理办法全文**未获取到公开版，是最高优先级的待核验项——直接影响能否毕业和研二能否外出实习。
- **腾讯 625 条快照没有本地原始文件**，无法像百度那样复算；其技能命中率只能视为下限。
- **`tools.js` 证据等级低于其他板块**：基于既有知识整理，未逐条检索核实。工具免费额度与期刊 AI 政策变化快，投稿前务必回到目标期刊的 Guide for Authors 原文确认。
