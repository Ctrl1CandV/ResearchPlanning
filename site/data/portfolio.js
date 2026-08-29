/* 板块 7/8：作品集与求职表达。
   2026-08-28 按真实仓库状态重写（github.com/Ctrl1CandV）：
   AgentParliament 37★/5 fork、agent-parliament-plugin、Atlas（活跃开发）。
   指标纪律不变：只有实测过的数字才允许出现；n=1 的结果标 preliminary。 */
window.PORTFOLIO = {
  projects: [
    {
      id:'atlas', name:'Atlas', status:'活跃开发中（2026-08-28 仍在推进）', claimType:'fact',
      problem:'把多个 LLM 调用串成可靠流水线时，“看起来成功了”和“真的成功了”是两回事：空输出、截断、缺字段、静默失败、成本失控。这是论文主线（假成功检测）的工程基座。',
      architecture:['YAML 定义的有向图工作流，跨厂商模型各司其职','假成功检测：空输出、截断哨兵、缺字段、跨厂商 fallback','SHA-256 产物哈希断言与引用传递，缺失/截断/空输出显式失败','零成本同构 dry-run 预演','append-only JSONL 台账作为唯一事实源','崩溃恢复只续跑未完成节点','人工审批门绑定哈希证据，驳回必填理由','成本预留与上限；本机 Web 观测界面（节点级输入输出/token/耗时/费用）'],
      tradeoffs:['先 Windows 本机单机（不做通用部署），换取可测性与快速迭代','隔离靠路径/回环约束而非 OS 级沙箱——不能当安全边界','回边暂不携带审查意见，循环从冻结 baseline 重新实施（BACKLOG）','拓扑命名不保证独立意见，独立性要靠模型异质性保障'],
      milestones:[
        { id:'atlas-false-success', stage:'假成功检测', title:'显式失败与 fallback', tasks:['空输出/截断/缺字段拦截','截断哨兵与跨厂商 fallback','失败运行如实入账（思考耗尽预算致空输出、prompt 只送达 1% 均被记录）'], acceptance:'真实故障被拦截且在台账中可解释、可复放' },
        { id:'atlas-audit', stage:'审计与台账', title:'哈希断言 + JSONL 台账 + 人工门', tasks:['产物哈希事后独立复验','逐节点 token/耗时/费用记账','审批绑定材料哈希，驳回必填理由'], acceptance:'10 节点运行后每个产物可独立复验，全程成本逐条可查' },
        { id:'atlas-eval', stage:'评测基准', title:'检测器同口径对比（规划）', tasks:['内置检测器 vs LLM-as-Judge / 退出码 / Schema 检查','假成功类型学标注协议','误报率与成本曲线'], acceptance:'论文级对比表，直接支撑首篇论文实验章节' }
      ],
      metrics:[
        { key:'tests', label:'自动化测试', value:'542 + 22 web（2026-08-26 基线，CI 绿）', status:'measured' },
        { key:'e2e', label:'10 节点端到端（MCP 直跑）', value:'361 s · 约 $0.01（2026-08-22）', status:'measured' },
        { key:'fixloop', label:'修复循环两轮真实案例', value:'两轮 $0.96 · diff 全程留档（2026-08-19）', status:'measured' },
        { key:'falsesuccess', label:'假成功检出率 vs LLM-as-Judge', value:null, status:'target' }
      ],
      artifacts:['GitHub 仓库（Apache-2.0，双语 README）','docs/STATUS.md 测试矩阵（含诚实失败记录）','可复用 YAML 示例图','CI 流水线与 2026-08-26 测试基线'],
      relatedRoles:['Harness / 评测 / 可观测','Agent 开发 / 架构','AI 平台'],
      relatedTeams:['百度 AIDU 全栈（接受自发项目）','腾讯 CSIG Harness/策略工程','评测型岗位（阿里/美团 LongCat 类）']
    },
    {
      id:'agent-parliament', name:'AgentParliament', status:'开源维护中 · 37★ / 5 fork', claimType:'fact',
      problem:'单模型既当运动员又当裁判的结构性缺陷：盲区（不知道自己不知道）、确认偏差（倾向肯定自己的结论）、纸上谈兵（方案看着可行跑起来才崩）。解法不是换更强的模型，而是用角色分工与对抗性交叉验证打破确认偏差。',
      architecture:['MCP 服务（10 个工具，MCP 1.2+）','三级权限阶梯：Tier 0 文本融合 / Tier 1 只读核查 / Tier 2 git-worktree 隔离可执行','peer_review · independent_analysis · validate_approach · test_audit · consensus · advisor 等工具','agent-parliament-plugin：orchestrator + 六角色（规划/方案对抗/开发/复盘/纾困/文档）的调度层','四层项目文档制度（CLAUDE.md / ADR / SPEC / PLAN）','minibank-trap：私有埋雷评测集（6 代码缺陷 + 5 设计漏洞 + 2 规则违规，gold 答案不公开防泄漏）'],
      tradeoffs:['用模型异质性换独立立场，但拓扑名不保证意见独立','Tier 2 隔离是文件树级 worktree 而非进程沙箱','评测集私有 gold 防泄漏，代价是无法第三方直接复算（待补脱敏版）'],
      milestones:[
        { id:'ap-core', stage:'核心', title:'MCP 服务与三级权限', tasks:['10 个工具全量实现','权限越界拒绝与只读白名单','双语 README 与安装链路'], acceptance:'已达成：工具可用、权限边界生效' },
        { id:'ap-trap', stage:'评测', title:'minibank-trap 埋雷实测', tasks:['补齐配置、模型、温度、重复次数、成本记录','按论文标准重新受控重跑','与 LLM-as-Judge 单审对比'], acceptance:'n≥3 的可引用结论，替代现有 n=1 记录' },
        { id:'ap-eval', stage:'Eval', title:'指标体系与回归报告（规划）', tasks:['任务成功率、缺陷召回、恢复率','交叉审查 vs 单审的增益量化','与 Atlas 假成功检测打通'], acceptance:'可复跑评测报告，支撑论文第二篇（交叉审查有效边界）' }
      ],
      metrics:[
        { key:'trap-code', label:'minibank-trap 代码缺陷召回', value:'6/6（n=1，待补重复实验）', status:'preliminary' },
        { key:'trap-design', label:'设计漏洞召回', value:'5/5（n=1，待补重复实验）', status:'preliminary' },
        { key:'success', label:'交叉审查 vs 单审成功率差', value:null, status:'target' },
        { key:'cost', label:'单位审查成本', value:null, status:'target' }
      ],
      artifacts:['GitHub 仓库（MIT，双语 README）','agent-parliament-plugin 调度层仓库','埋雷评测记录（待按论文标准补齐）'],
      relatedRoles:['Harness / 评测 / 可观测','Agent 开发 / 架构','AI 应用开发'],
      relatedTeams:['腾讯 CSIG DataBuddy','腾讯 PCG Agent','百度 Coding Agent / AIDU 全栈']
    },
    {
      id:'code-graph-rca', name:'代码知识图谱 + Agent 根因分析', status:'规划中（第三储备）', claimType:'inference',
      problem:'仅靠向量检索难以保留调用、依赖和影响关系；故障定位需要结构化代码图与可验证的推理路径。与百度 ACG J99649 的“代码知识图谱 + 根因分析”方向直接对应。',
      architecture:['Go 并发 AST 解析器','调用/依赖/类型图','Neo4j 或 FalkorDB','MCP 图查询服务','Python RCA Agent','增量索引与影响面分析'],
      tradeoffs:['先支持 Go 单语言，换取深度和可测性','图数据库二选一，不为技术清单重复实现','根因答案必须附文件/函数/关系路径，避免不可验证生成'],
      milestones:[
        { id:'cg-index', stage:'Index', title:'代码图谱构建', tasks:['解析包、类型、函数和调用边','并发扫描与增量更新','schema 和索引设计'], acceptance:'在公开中型仓库上给出索引耗时、吞吐与图规模' },
        { id:'cg-query', stage:'Query', title:'MCP 图查询', tasks:['邻居、路径、调用者、影响面工具','参数校验、分页和超时','查询 trace'], acceptance:'Agent 可组合工具完成 5 类结构查询' },
        { id:'cg-rca', stage:'RCA', title:'Issue / 栈追踪到根因', tasks:['构造带 ground truth 的故障集','检索与推理分离','置信度和证据路径','错误分析'], acceptance:'报告 Top-k 根因命中率、P99、成本与失败类型' }
      ],
      metrics:[
        { key:'qps', label:'解析 / 查询吞吐', value:null, status:'target' },
        { key:'success', label:'Top-k 根因命中率', value:null, status:'target' },
        { key:'p99', label:'P99 查询延迟', value:null, status:'target' },
        { key:'cost', label:'单次分析成本', value:null, status:'target' }
      ],
      artifacts:['公开仓库可复现实验','图 schema 与查询示例','RCA benchmark 与错误分析','MCP server/client','性能剖析与 trade-off 文档'],
      relatedRoles:['Agent 应用开发','RAG / 知识工程','云原生 AI 平台'],
      relatedTeams:['百度 ACG J99649','企业微信知识团队']
    }
  ],
  principles: [
    { title:'两深胜过四浅', detail:'Atlas 与 AgentParliament 是两个深项目；代码图谱只作储备，不在未开工时计入作品集。' },
    { title:'数字要可追溯', detail:'n=1 的结果必须标 preliminary；只有补齐配置、模型、重复次数后才能升级为可引用结论。' },
    { title:'一个错误故事', detail:'Atlas 的失败矩阵（空输出、1% prompt、超支终止）就是现成的“错误选择→测量→纠正”素材。' },
    { title:'证据可追溯', detail:'README、CI、STATUS.md、台账、diff 留档共同构成可信作品集；私有评测集需补脱敏版才能对外复算。' }
  ],
  narratives: {
    positioning:'我是有生产后端经验的可信 Agent 工程师：研究生阶段把 Agent 的成功验证、评测与可观测做成可量化的系统能力，并由开源项目（Atlas、AgentParliament）承载。',
    whyGraduate:'在真实项目里反复撞到两类靠 prompt 补丁解决不了的问题：多模型流水线的「假成功」（宣称完成但证据不成立）和长任务记忆失控。前者已经做成 Atlas 的检测机制，后者是论文延伸线；读研是为了把这两个工程问题形式化、做基准、做方法，再回到生产验证。',
    thesisToJob:'Agent 流水线最大的可靠性缺口是「假成功」：退出码为 0、模型宣称完成，但环境状态、产物证据或安全约束并未成立。我的工作把成功验证拆成声明/证据/状态三层，做类型学、基准与检测器，并延伸到记忆后端的成本-精度-延迟评测；产出的成功率、误报率、成本指标正是 Harness/评测岗位的日常语言。',
    notGraphRag:'学术上研究可信 Agent 系统与评测方法学（记忆线保留图方法作为与导师技术栈的衔接）；求职时表述为 Agent 评测、可靠性、可观测性与 Harness 工程。',
    labels:['Agent Evaluation','Reliability','False-Success Detection','Harness Engineering','Observability','MCP','Distributed Backend','Go / Python','Knowledge Graph']
  },
  resumeBullets: [
    { id:'resume-atlas', project:'Atlas', template:'构建本地可审计的多模型工作流引擎：假成功检测 + 产物哈希断言 + JSONL 台账 + 人工审批门；542 项测试 CI 绿，10 节点端到端 361s / 约 $0.01；（实测后补充）假成功检出率较 LLM-as-Judge 提升 {A}%，误报率 {B}%。' },
    { id:'resume-ap', project:'AgentParliament', template:'设计并实现多模型交叉验证 MCP 服务（10 工具 / 三级权限），在私有埋雷评测集上召回 6/6 代码缺陷、5/5 设计漏洞（n=1，补齐重复实验后更新）；（实测后补充）交叉审查较单审成功率提升 {B}%，单位成本 {C}。' },
    { id:'resume-memory', project:'记忆后端评测', template:'在成本-精度-延迟三轴上同口径评测 {记忆后端集合}，量化图结构记忆相对平铺记忆在 {数据集} 上的 {指标}，token 成本变化 {数值}。（仅在实测后填写）' },
    { id:'resume-codegraph', project:'代码图谱 RCA', template:'使用 Go 并发解析 {规模} 代码库并构建调用图，通过 MCP 为 Agent 提供可验证路径查询；根因 Top-{k} 命中率 {数值}，索引吞吐 {数值}，P99 {数值}。（仅在实测后填写）' }
  ],
  storyTemplate: [
    { step:'错误选择', prompt:'我最初为什么选择这个方案？当时依据是什么？' },
    { step:'异常信号', prompt:'哪个指标、日志或用户反馈证明它不工作？' },
    { step:'最小实验', prompt:'怎样隔离变量，排除实现 bug 与数据口径问题？' },
    { step:'纠正方案', prompt:'替代方案的 trade-off 是什么？' },
    { step:'结果', prompt:'成功率、成本、P99、吞吐分别怎样变化？' },
    { step:'边界', prompt:'什么场景下仍应使用原方案？' }
  ],
  applicationPriority: [
    { tier:'S', targets:['杭州：阿里云 / 蚂蚁 Agent 与知识团队（JD 待补抓）','成都：腾讯 WXG 企业知识 / 记忆'], reason:'毕业首选城市 + 研究与作品集主线交汇；杭州侧团队仍需逐一核验原始 JD' },
    { tier:'A', targets:['深圳：腾讯 CSIG DataBuddy / Harness / 元宝 / PCG','上海：评测与 Agent 平台团队','杭州：网易 / 中厂 / 强 AI 初创'], reason:'可接受城市中匹配度最高的一批；深圳证据最完整' },
    { tier:'B', targets:['北京：按「1—2 年中转」定位考虑（百度 AIDU 全栈等明确接受自发项目的岗位）','远程优先的 Agent 团队'], reason:'北京中转路线：入职前写清 1—2 年跳出计划，优先可迁移方向；远程机会需核实是否真实存在' },
    { tier:'Fallback', targets:['重庆：FDE / 国企数科 / 本地开发','AI 平台','传统后端'], reason:'不牺牲工程成长性，优先真实问题和团队中心度' },
    { tier:'Avoid', targets:['计划长期（2 年以上）驻京且无跳出价值的岗位','纯交付、无技术积累的岗位'], reason:'中转定位的上限是 1—2 年；长期驻京或纯交付偏离整站地域与成长策略' }
  ]
};
