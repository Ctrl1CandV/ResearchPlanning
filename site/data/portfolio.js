/* 板块 7/8：作品集与求职表达。
   2026-08-28 按真实仓库状态重写（github.com/Ctrl1CandV）：
   AgentParliament 37★/5 fork、agent-parliament-plugin、Atlas（活跃开发）。
   指标纪律不变：只有实测过的数字才允许出现；n=1 的结果标 preliminary。 */
window.PORTFOLIO = {
  projects: [
    {
      id:'atlas', name:'Atlas', status:'活跃开发中（2026-08-28 仍在推进）', claimType:'fact',
      problem:'把多个 LLM 调用串成流水线时，「看起来成功了」和「真的成功了」是两回事：输出为空、被截断、字段缺失、悄悄失败、成本失控。做一条能提前发现这些问题的流水线，正是论文主线（假成功检测）需要的工程基础。',
      architecture:['工作流用 YAML 定义，是一张有向图；不同厂商的模型各干各擅长的一段','假成功检测：拦空输出、加截断哨兵、查缺字段，失败时换另一家模型兜底','产物带 SHA-256 哈希断言，引用在节点间传递；缺失、截断、空输出都会明确报错而不是悄悄放过','dry-run 用同构的小数据预演一遍，不花钱','执行记录只追加、不改写的 JSONL 台账，是唯一的事实来源','崩溃后恢复时，只重跑没完成的节点','人工审批门绑定产物的哈希证据，驳回必须写理由','成本有预留和上限两道闸；本机网页界面能看每个节点的输入输出、token、耗时和费用'],
      tradeoffs:['目前只支持 Windows 单机运行，不做通用部署。换来的是随时能测、改得快。','隔离靠路径和白名单约束，不是操作系统级沙箱，不能当安全边界用','回边暂时不带审查意见，循环是从冻结的基线重新实施（记在 BACKLOG）','拓扑里写了“审查者”不等于真的有独立意见，独立性靠用不同厂商的模型来保证'],
      milestones:[
        { id:'atlas-false-success', stage:'假成功检测', title:'显式失败与 fallback', tasks:['空输出/截断/缺字段拦截','截断哨兵与跨厂商 fallback','失败运行如实入账（思考耗尽预算致空输出、prompt 只送达 1% 均被记录）'], acceptance:'真实故障能被拦下，台账里看得懂为什么被拦、能复现' },
        { id:'atlas-audit', stage:'审计与台账', title:'哈希断言 + JSONL 台账 + 人工门', tasks:['产物哈希事后独立复验','逐节点 token/耗时/费用记账','审批绑定材料哈希，驳回必填理由'], acceptance:'跑完 10 个节点，每个产物都能独立重验一遍；全程花费逐条可查' },
        { id:'atlas-eval', stage:'评测基准', title:'检测器同口径对比（规划）', tasks:['内置检测器 vs LLM-as-Judge / 退出码 / Schema 检查','假成功类型学标注协议','误报率与成本曲线'], acceptance:'对比表达到论文可引用的水平，直接支撑第一篇论文的实验章节' }
      ],
      metrics:[
        { key:'tests', label:'自动化测试', value:'542 + 22 web（2026-08-26 基线，CI 绿）', status:'measured' },
        { key:'e2e', label:'10 节点端到端（MCP 直跑）', value:'361 s · 约 $0.01（2026-08-22）', status:'measured' },
        { key:'fixloop', label:'修复循环两轮真实案例', value:'两轮 $0.96 · diff 全程留档（2026-08-19）', status:'measured' },
        { key:'falsesuccess', label:'假成功检出率 vs LLM-as-Judge', value:null, status:'target' }
      ],
      artifacts:['GitHub 仓库（Apache-2.0，双语 README）','docs/STATUS.md 测试矩阵，失败的记录也在里面','可直接复用的 YAML 示例工作流','CI 流水线与 2026-08-26 测试基线'],
      relatedRoles:['Harness / 评测 / 可观测','Agent 开发 / 架构','AI 平台'],
      relatedTeams:['百度 AIDU 全栈（接受自发项目）','腾讯 CSIG Harness/策略工程','评测型岗位（阿里/美团 LongCat 类）']
    },
    {
      id:'agent-parliament', name:'AgentParliament', status:'开源维护中 · 37★ / 5 fork', claimType:'fact',
      problem:'一个模型既写方案又给自己的方案打分，有三个结构性毛病：盲区（不知道自己不知道）、确认偏差（倾向于肯定自己）、纸上谈兵（方案看着可行，跑起来才崩）。解决办法不是换一个更强的模型，而是把写和审分开，用立场不同的模型互相对抗性审查。',
      architecture:['一个 MCP 服务，10 个工具，协议 1.2 以上','工具分三级权限：Tier 0 只做文本融合，Tier 1 只读核查，Tier 2 在 git worktree 里隔离后能执行','peer_review、independent_analysis、validate_approach、test_audit、consensus、advisor 这些工具','agent-parliament-plugin 是调度层：一个编排器加六个角色（规划、方案对抗、开发、复盘、纾困、文档）','项目文档分四层（CLAUDE.md / ADR / SPEC / PLAN）','minibank-trap 是私有的带缺陷评测集：6 个代码缺陷、5 个设计漏洞、2 个规则违规，标准答案不公开，防止被提前背走'],
      tradeoffs:['模型来自不同厂商，立场独立性高一些，但仍然不等于真的互相独立','Tier 2 的隔离只到文件树层面（worktree），不是进程沙箱','评测集的标准答案不公开，好处是不泄漏，代价是第三方没法直接拿去复算（之后要补一个脱敏版本）'],
      milestones:[
        { id:'ap-core', stage:'核心', title:'MCP 服务与三级权限', tasks:['10 个工具全量实现','权限越界拒绝与只读白名单','双语 README 与安装链路'], acceptance:'已达成：工具可用、权限边界生效' },
        { id:'ap-trap', stage:'评测', title:'minibank-trap 缺陷检出实测', tasks:['补齐配置、模型、温度、重复次数、成本记录','按论文标准重新受控重跑','与 LLM-as-Judge 单审对比'], acceptance:'结论至少有 3 次重复实验支撑，可以引用；替换掉现在 n=1 的记录' },
        { id:'ap-eval', stage:'Eval', title:'指标体系与回归报告（规划）', tasks:['任务成功率、缺陷召回、恢复率','交叉审查 vs 单审的增益量化','与 Atlas 假成功检测打通'], acceptance:'评测报告能重跑复现，支撑论文第二篇（交叉审查到底有没有用）' }
      ],
      metrics:[
        { key:'trap-code', label:'minibank-trap 代码缺陷召回', value:'6/6（n=1，待补重复实验）', status:'preliminary' },
        { key:'trap-design', label:'设计漏洞召回', value:'5/5（n=1，待补重复实验）', status:'preliminary' },
        { key:'success', label:'交叉审查 vs 单审成功率差', value:null, status:'target' },
        { key:'cost', label:'单位审查成本', value:null, status:'target' }
      ],
      artifacts:['GitHub 仓库（MIT，双语 README）','agent-parliament-plugin 调度层仓库','缺陷检出评测记录（重复实验还没按论文标准补齐）'],
      relatedRoles:['Harness / 评测 / 可观测','Agent 开发 / 架构','AI 应用开发'],
      relatedTeams:['腾讯 CSIG DataBuddy','腾讯 PCG Agent','百度 Coding Agent / AIDU 全栈']
    },
    {
      id:'code-graph-rca', name:'代码知识图谱 + Agent 根因分析', status:'规划中（第三储备）', claimType:'inference',
      problem:'光靠向量检索找不到调用、依赖、影响这些关系。定位故障需要一张结构化的代码图，以及一条每一步都能验证的推理路径。这个项目和百度 ACG J99649 的“代码知识图谱 + 根因分析”方向直接对应。',
      architecture:['Go 并发 AST 解析器','调用/依赖/类型图','Neo4j 或 FalkorDB','MCP 图查询服务','Python RCA Agent','增量索引与影响面分析'],
      tradeoffs:['先只支持 Go 一门语言，把深度和可测试性做出来','Neo4j 或 FalkorDB 选一个做，不为凑技术清单实现两遍','根因答案必须附上涉及的文件、函数和关系路径，不给验证不了的结论'],
      milestones:[
        { id:'cg-index', stage:'Index', title:'代码图谱构建', tasks:['解析包、类型、函数和调用边','并发扫描与增量更新','schema 和索引设计'], acceptance:'在一个公开的中型仓库上，给出索引耗时、吞吐和图规模' },
        { id:'cg-query', stage:'Query', title:'MCP 图查询', tasks:['邻居、路径、调用者、影响面工具','参数校验、分页和超时','查询 trace'], acceptance:'Agent 能自己组合这些工具，完成 5 类结构查询' },
        { id:'cg-rca', stage:'RCA', title:'Issue / 栈追踪到根因', tasks:['构造带 ground truth 的故障集','检索与推理分离','置信度和证据路径','错误分析'], acceptance:'报告里要有 Top-k 根因命中率、P99 延迟、单次成本和失败类型' }
      ],
      metrics:[
        { key:'qps', label:'解析 / 查询吞吐', value:null, status:'target' },
        { key:'success', label:'Top-k 根因命中率', value:null, status:'target' },
        { key:'p99', label:'P99 查询延迟', value:null, status:'target' },
        { key:'cost', label:'单次分析成本', value:null, status:'target' }
      ],
      artifacts:['公开仓库，实验可复现','图 schema 与查询示例','RCA benchmark 与错误分析','MCP server/client','性能剖析和取舍记录'],
      relatedRoles:['Agent 应用开发','RAG / 知识工程','云原生 AI 平台'],
      relatedTeams:['百度 ACG J99649','企业微信知识团队']
    }
  ],
  principles: [
    { title:'两个深项目，好过四个浅项目', detail:'Atlas 和 AgentParliament 是真正做深的两个；代码图谱只是储备，没开工之前不算进作品集。' },
    { title:'每个数字都能追到来源', detail:'只有一次实验的结果，必须标 preliminary。把配置、模型、重复次数补齐之后，才能升级成可引用的结论。' },
    { title:'准备一个讲犯错的故事', detail:'Atlas 的失败记录（空输出、prompt 只送达 1%、超支终止）正好能讲一个完整的“先选错、再量出来、然后改掉”的故事。' },
    { title:'让人自己验证', detail:'README、CI、STATUS.md、台账、diff 存档，这些放在一起才算可信的作品集。私有评测集要出脱敏版，别人才能复算。' }
  ],
  narratives: {
    positioning:'我有生产后端的经验，想做的是让 Agent 变得更可信：读研阶段把成功验证、评测、可观测做成能拿数字说话的系统能力，证明就是 Atlas 和 AgentParliament 这两个开源项目。',
    whyGraduate:'做实际项目时反复撞上两类问题，用 prompt 打补丁都解决不了：一是多模型流水线的「假成功」（宣称完成但证据不成立），二是长任务的记忆失控。前者已经做成了 Atlas 的检测机制，后者是论文的延伸方向。读研就是想把这两个工程问题写成正式的问题定义，做基准、做方法，再拿回生产环境验证。',
    thesisToJob:'Agent 流水线最大的可靠性漏洞是「假成功」：退出码为 0、模型说完成了，但环境状态、产物证据或安全约束其实没成立。我的工作是把“成功”拆成声明、证据、状态三层分别验证，做分类、基准和检测器，再延伸到记忆后端的成本、精度、延迟评测。做出来的成功率、误报率、成本这些指标，正是 Harness 和评测岗位每天在谈的东西。',
    notGraphRag:'学术上做的是可信 Agent 系统和评测方法（记忆这条线保留图方法，用来和导师的技术栈衔接）；求职时就说 Agent 评测、可靠性、可观测性、Harness 工程。',
    labels:['Agent Evaluation','Reliability','False-Success Detection','Harness Engineering','Observability','MCP','Distributed Backend','Go / Python','Knowledge Graph']
  },
  resumeBullets: [
    { id:'resume-atlas', project:'Atlas', template:'构建本地可审计的多模型工作流引擎：假成功检测 + 产物哈希断言 + JSONL 台账 + 人工审批门；542 项测试 CI 绿，10 节点端到端 361s / 约 $0.01；（实测后补充）假成功检出率较 LLM-as-Judge 提升 {A}%，误报率 {B}%。' },
    { id:'resume-ap', project:'AgentParliament', template:'设计并实现多模型交叉验证 MCP 服务（10 工具 / 三级权限），在私有的带缺陷评测集上召回 6/6 代码缺陷、5/5 设计漏洞（n=1，补齐重复实验后更新）；（实测后补充）交叉审查较单审成功率提升 {B}%，单位成本 {C}。' },
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
    { tier:'S', targets:['杭州：阿里云 / 蚂蚁 Agent 与知识团队（JD 待补抓）','成都：腾讯 WXG 企业知识 / 记忆'], reason:'毕业最想去、研究方向和作品集在这里也最对口；但杭州这边的团队还没有逐一核过原始 JD' },
    { tier:'A', targets:['深圳：腾讯 CSIG DataBuddy / Harness / 元宝 / PCG','上海：评测与 Agent 平台团队','杭州：网易 / 中厂 / 强 AI 初创'], reason:'在能接受的城市里，这批团队匹配度最高；其中深圳的证据最完整' },
    { tier:'B', targets:['北京：按「1—2 年中转」定位考虑（百度 AIDU 全栈等明确接受自发项目的岗位）','远程优先的 Agent 团队'], reason:'走北京中转的话：入职前就把 1—2 年后怎么跳走写清楚，优先做带得走的方向；远程机会先核实是不是真的' },
    { tier:'Fallback', targets:['重庆：FDE / 国企数科 / 本地开发','AI 平台','传统后端'], reason:'工程能力不能退步，所以优先挑真问题、团队核心位置' },
    { tier:'Avoid', targets:['计划长期（2 年以上）驻京且无跳出价值的岗位','纯交付、无技术积累的岗位'], reason:'中转最多 1—2 年。长驻北京或者纯交付的岗位，和这一页的城市策略、成长策略都不符合' }
  ]
};
