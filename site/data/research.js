/* 板块 2：研究主线 —— 面向工具调用智能体的任务完成验证：预算约束下的环境证据选择
   2026-09-06 第三次修订（方向重构，依据 docs/论文方向重构说明.md）：
   - 主线唯一：方向 A 按新题目重写；B、E 降为主线稳定后的扩展；C 改条件性备选；
     D、F 暂缓但资料保留。angles[].tier ∈ main | extension | conditional | paused。
   - 阅读重组：公共必读 12 篇全部服务主线（其中 Strategic Verification 为 preprints.org
     预印本，无 arXiv id，走 srcUrl 外链、不建阅读卡）；原偏记忆的 10 篇移入 C/D 的延伸层，
     一篇只归一处不变。
   - 90 天计划改为前 4 周问题验证优先。研究依据按重构说明纠正：2606.09863 的轻量检测器
     纳入必比基线；Strategic Verification 要求逐项划界；2608.02645 说明读回/重试不是贡献；
     MemRefine 与 PRISM 已研究记忆预算取舍（F 暂缓理由之一）。
   - 学习进度迁移：app.js 的 PAPER_MIGRATIONS 仅迁移同一篇论文换轨的勾选；
     旧 90 天周任务勾选不迁移到新周任务。
   历次修订：2026-08-28（六方向 + 公共/方向阅读结构）、2026-08-31（两级 IA）、
   2026-09-02（L3 阅读卡）。所有 arXiv 编号沿用 2026-08-28/08-30 两轮 API 反查结果；
   新增条目经 arXiv/出版社页面核对（2026-09-06）。 */
window.RESEARCH = {

  positioning: {
    title: '论文主线：工具调用智能体的任务完成验证（预算约束下的环境证据选择）',
    body: 'Agent 系统最常见的可靠性事故之一是宣称完成而实际没完成：要求更新 20 条记录，工具返回成功，实际只更新了 19 条。检查的一方拿不到评测标准答案，只能通过正常查询接口获取有限信息，所以真正的问题是：在查询预算内检查哪些环境状态，才能用可接受的成本和误报率判断任务是否完成，什么时候只能承认无法确认。这个方向适合眼下的条件：Atlas 的执行台账和 AgentParliament 的审查服务可以直接当实验设施，研究所得对接评测、可观测和平台工程岗位，导师可以参与问题建模、多源证据融合和实验设计。方向是 2026-09 定稿的；具体创新仍要靠文献与实验支持，先把与最近工作的差别核实清楚。',
    tag: 'strategy'
  },

  // ---------- 方向（2026-09-06 二次收编：成卡仅主线 A + 扩展 B/E；C/D/F 移入 archived 存档） ----------
  angles: [
    {
      id:'A', tier:'main', star:true,
      name:'任务完成验证：预算约束下的环境证据选择',
      en:'Task-Completion Verification for Tool-Using Agents: Selecting Environmental Evidence under Budget Constraints（暂定，随文献补查修订）',
      problem:'验证器面对的处境是：Agent 宣称任务完成，但无法直接读取评测标准答案，只能通过正常查询接口获取有限信息。要回答的是：应该检查哪些环境状态、查多少，才能以可接受的成本和误报率判断任务是否完成；证据不足时如何诚实地输出"无法确认"。例：要求更新 20 条记录，工具返回成功，实际只更新了 19 条。2606.09863 已经刻画了这个现象并训练了轻量检测器，所以类型学和检测本身不能当贡献；值得研究的是有限预算下的环境证据选择及其跨任务效果。',
      method:[
        '类型学沿用 2606.09863 的三分类（假成功、诚实失败、模糊），按证据类型扩展子类，注明出处。注意它分的是失败轨迹的收尾表达，不是完整的任务结果分类；类型学样本来自公开轨迹和受控故障注入两个渠道。',
        '实验标注分两列保存，互不混用：真值列记「实际完成与否」，必须包含真实成功样本；判定列记验证器输出「通过、拒绝、无法确认」。误报、漏检、弃权率由两列交叉计算；「无法确认」是验证器的第三种输出，不借用 09863 的「模糊」。',
        '把任务条件映射成可查询的证据点清单：每个任务条件对应哪些环境状态、用什么接口查、单次查询的成本是多少。',
        '按证据缺口和查询成本给核验操作排序，形成选择策略；检查器保持纯函数、只读（2607.07405 的门是现成范本）。',
        '同预算、同接口权限下对比：证据选择策略、随机查询顺序、固定查询顺序、纯日志方法（单独说明信息差异）、LLM-as-Judge，外加 2606.09863 的轻量检测器（必比基线，按其原文协议跑）。随机与固定顺序这两条对照，用来把「提升来自更会选择证据」和「提升来自多查了环境信息」分开；全量核验不限预算单独跑一遍，作为成本参照上界，不塞进同预算组。',
        '跨任务、跨模型检验：至少两个结构化任务域、两个模型家族，按留一模型族划分报告。'
      ],
      venue:'NeurIPS Datasets & Benchmarks；ICSE/FSE/ASE（实证软件工程方向）；也可以先从 FAGEN 这类 workshop 起步',
      cost:'成本低。全部走 API、单机可跑，Atlas 台账自动记账；查询预算本身是实验变量，不追求大而全。',
      risk:'三个最近工作都压在这里：2606.09863 有检测器和误报分析，Strategic Verification（预印本）讨论了预算下自适应验证，2608.02645 做了调用级后置条件验证。应对办法是先划界再动手：任务完成核验、环境证据获取、实验设置三处逐项写清差别；划界站不住就调整问题位置。novelty 评分 3 是诚实值，W8 检查点后重估。',
      scores:{ value:5, novelty:3, falsifiable:5, feasible:5, resource:5, career:5 }
    },
    {
      id:'B', tier:'extension',
      name:'交叉审查什么时候真的有用（扩展）',
      en:'When Does Cross-Model Review Help? Boundaries and Failure Attribution of Heterogeneous Multi-Agent Verification',
      problem:'主线稳定后的对照实验，不预先承诺第二篇：在同等预算下，额外的模型审查和额外的环境查询，哪个更能提高完成判断的可信度。AgentParliament 建立在"外部对立视角打破确认偏差"的假设上，Interaction Tax（ICML 2026）证明模型间通信会抹平多样性，这个假设值得量化，但只在主线发现需要审查对照的现象之后再排期。',
      method:[
        '固定任务和预算，四组受控对比：独立审查（权限分层）、全文共享辩论、单模型审查、同等查询预算的环境核验。',
        '量化审查带来的增益：缺陷召回、误报率、成本、延迟，全部与"把钱花在环境查询上"对照。',
        '做失败归因：错误共识怎么形成、怎么传播，对接 MAST 失败分类。',
        '消融审查拓扑：审查者数量、模型是否异质、介入时机。'
      ],
      venue:'ESWA / KBS（应用导向）；ICSE/FSE（实证方向）；ACL Findings',
      cost:'中等。多模型调用是主要成本，Atlas 的预算机制可控住；借用主线的任务集和台账，不另起基建。',
      risk:'结论可能是"审查增益有限"。这也能发表：负结果加边界刻画，写法参照 HGB。不预先把它写成第二篇论文。',
      scores:{ value:4, novelty:3, falsifiable:5, feasible:4, resource:4, career:4 }
    },
    {
      id:'E', tier:'extension',
      name:'审计代码任务的完成判定（扩展，收窄）',
      en:'Auditing Task-Completion Verdicts in Code-Agent Benchmarks',
      problem:'收窄后的应用扩展：只做「测试通过却未满足任务要求」的验证问题，把主线的证据选择思路用到代码基准上。原来同时普查污染、难度和测试质量的计划已经移除：无法访问训练数据时，污染只能停留在猜测，写成确认结论会越界。保留的是判定与需求的错位验证，这在软件工程上有明确价值。',
      method:[
        '从 SWE-bench 实例里筛「测试通过但任务没完成」的样本，定义任务级 gold（PAIChecker 报告的 13.6% 错配是起点证据，不作为本方向前提）。',
        '把主线的证据选择策略移植过来：从执行轨迹和仓库状态里选证据，同预算对比测试预言和任务级核验。',
        '接入 reliability@k 协议，检查单次判定和稳定判定的差距。',
        '产出：一份判定错位的审计报告加一个可复算的核验工具。'
      ],
      venue:'ICSE / FSE / ASE（实证软件工程主场，偏爱 empirical study）；NeurIPS D&B',
      cost:'低。静态分析、数据构建加推理 API，单机可以做完整套。',
      risk:'依赖上游基准，版本会变。应对办法是把核验工具写成通用件，能对任意 SWE-bench-Like 数据集重跑。',
      scores:{ value:4, novelty:3, falsifiable:5, feasible:5, resource:5, career:4 }
    }
  ],

  /* 已收进档案的方向（2026-09-06 二次收编）：不占方向卡，资料完整留在 tracks.C/D/F 里
     （论文、阅读卡、仓库、数据集全部保留，直接链接可达）。
     重启动作：把条目移回 angles 并补全 method/venue/cost/risk（git 历史可查）。 */
  archived: [
    { id:'C', status:'条件性备选', name:'给记忆后端做统一横评',
      line:'启动条件：主线实验观察到过期或冲突记忆让完成判断出错，或导师提出相关课题；一般性横评不足以证明新意（Harness the Memory、MemoryArena 已做配对研究）。图记忆在协议里是被评测对象之一，导师可参与设计。',
      track:'C' },
    { id:'D', status:'暂缓', name:'图结构化记忆：属性图聚类改进记忆分层',
      line:'暂缓：更高的聚类指标未必带来更好的任务表现，先要有具体失效现象和初步证据，不把替换聚类模块当选题依据。方法与数据资产完整保留。',
      track:'D' },
    { id:'F', status:'暂缓', name:'记忆压缩：压缩率和性能的取舍',
      line:'暂缓：MemRefine（2606.13177）与 PRISM 已研究记忆预算与性能取舍；重启需把差异落到图粗化的结构压缩（顶点保留、只收缩结构）并与内容压缩对比。',
      track:'F' }
  ],

  /* 已拒绝方向（2026-08-28 本人确认，2026-09-06 复核维持）。保留记录防止未来重新发明：
     若要翻案，先在此处删除并更新 idea-ledger。 */
  rejected: [
    { id:'old-B', name:'MCP / A2A 工具生态的评测与审计', reason:'权衡优先级后明确不做：手上的自研资产在这个方向复用得少；窗口虽然新开，但涌入的人更多，不适合当论文主线。相关工作的 PDF 已从本地库移除。' },
    { id:'old-D', name:'Agent 最小权限执行与副作用审计', reason:'明确不做：安全形式化的门槛高，和主线「成功验证」有重叠，但撑不起第一篇。Runtime Contract 那篇因为和成功验证直接相关，保留在公共必读里；其余安全向的 PDF 已移除。' }
  ],

  angleAdvice:'投入顺序是：<b>A（任务完成验证）是唯一主线</b>，第一篇只围绕它做，限定到一两类结构化任务环境。<b>B（交叉审查）和 E（代码任务判定审计）是扩展</b>：主线 W8 检查点之后才有排期资格，B 做主线必需的审查对照实验，E 把主线方法移植到代码基准；不预先承诺第二、第三篇。<b>C/D/F 已收进档案</b>：启动与重启条件写在研究页的存档卡里，资料完整保留在各自阅读轨道，不再占方向卡。所有方向共同约束：不训练大模型、API 结果可缓存、单机能跑完。这么定有三个实际原因：训练需要的算力和数据一个人备不齐；API 结果进缓存后，开发调试可以近乎零成本地重跑（报可靠性指标仍须真重复，这条省钱边界的可复算协议还没建立，按待验证处理）；单机能跑完，进度就不用看实验室机器的排期。',

  dualTrack:'主线的每一组实验都落在 Atlas 的台账里：查询次数、token、费用、判定依据全部可查。这套台账整理出来是求职时的工程资产；同一批实验按协议写成对比表和误报分析，就是投稿用的论文资产。扩展方向（B/E）借用同一套设施，不另起基建。导师那边，问题建模、实验设计、证据融合三处是他能实质参与的；C/D/F 的资料保留，等有具体现象或课题再说。',

  // ---------- 阅读：主线公共必读 + 方向轨道（A/B/E 成卡；C/D/F 资料保留、入口折叠） ----------
  reading: {
    common: {
      name:'公共必读 · 主线地基',
      note:'这 12 篇是主线（任务完成验证）的公共地基：前三篇立问题，中间六篇讲检测与证据获取的做法，最后三篇是归因与评测方法的范本。按顺序读完大约 28 小时（每篇小时数相加，预计工时）。原先偏记忆的 10 篇（RAG、记忆系统五篇、LoCoMo 等）移到了方向 C 和 D 的延伸层，走对应轨道时再读。点论文行能进入阅读卡；Strategic Verification 是预印本，没有站内卡，从外链读。',
      items:[
        { n:1, t:'From Confident Closing to Silent Failure: Characterizing False Success in LLM Agents', ax:'2606.09863', y:'2026-06', v:'FAGEN @ ICML 2026', h:'3h',
          intro:'给「假成功」命名的那篇论文：9,876 条 tau2-bench 轨迹加 1,879 条 AppWorld 轨迹，量出单控制域 45—48% 的失败其实是假成功；训练了三个轻量检测器（最好的 XGBoost 达 0.825 AUROC），并发现 LLM 当评审几乎抓不住这个问题。',
          why:'第一篇要正面回应的对手。它的轻量检测器是主线实验里的必比基线；要在预算下的证据选择上做出它没做的部分，先把它的标注协议、数据划分和误报分析吃透。注意它的三分类只描述失败轨迹的收尾表达，不等于任务结果分类，实验标注要按真值列与判定列分开保存。' },
        { n:2, t:'Strategic Verification for Long-Running LLM Agents', ax:null, srcUrl:'https://www.preprints.org/manuscript/202608.2057', y:'2026-08', v:'Preprints.org（预印本，未经同行评审）', h:'2h', warn:true,
          intro:'讨论长时程 Agent 在预算约束下的自适应验证：什么时候值得花查询去验证、验证到什么程度。它和主线的问题距离最近。',
          why:'最近的"同行"，也是预印本，结论还没经过评审。先把它的验证对象、预算定义和实验设置抄下来，逐项和自己的方案对照；区别写不清楚的地方就是主线要挪位置的地方。它没有 arXiv 编号，从外链进原文，正式发表或读完全文后再补站内阅读卡。' },
        { n:3, t:'Verified Tool Calls', ax:'2608.02645', y:'2026-08', v:'arXiv', h:'2h',
          intro:'研究工具调用的后置条件验证、重试前的验证和幂等处理。它说明了一件事：把「读回状态再确认」做进工具调用流程，已经是有人系统做过的工作。',
          why:'和主线最容易被混淆的一篇。主线问的是"预算内选哪些证据去查"，它做的是"单次调用怎么验证"。读它是为了划界：加读回、加重试检查本身不是贡献，贡献只能落在证据选择与预算取舍上。' },
        { n:4, t:'From Agent Traces to Trust: A Survey of Evidence Tracing and Execution Provenance in LLM Agents', ax:'2606.04990', y:'2026-06', v:'arXiv（综述）', h:'4h',
          intro:'证据追踪与执行溯源的综述：把执行过程本身当成证据，沿六个维度组织现有工作，并点名跨组件、关系标注、恢复导向三个评测缺口。',
          why:'证据层验证的理论地图。验证器查的每一项环境状态都能在它的维度里定位；related work 的骨架照着它搭。' },
        { n:5, t:'Reason Less, Verify More: Deterministic Gates Recover a Silent Policy-Violation Failure Mode in Tool-Using LLM Agents', ax:'2607.07405', y:'2026-07', v:'arXiv', h:'2h',
          intro:'在 tau2-bench 航空域给工具调用加确定性检查门：纯函数、只读、无 LLM，不放行就短路并返回结构化拒绝；门真正触发的任务上成功率升了 19.2 个百分点。',
          why:'确定性核验的实证样本。主线的核验操作要保持纯函数、只读的性质，它的门的形式化可以直接借。' },
        { n:6, t:'Agent Safety Should Be a Runtime Contract', ax:'2608.11274', y:'2026-08', v:'arXiv', h:'2h',
          intro:'主张 Agent 的安全与成功约束要在运行时执行：预防面在动作前拦截，证据面要求每条结论挂可重放的证据链；52 起真实事故里 40 起完全可预防。',
          why:'核验器要做哪些检查，需求清单从这篇找；组合门控一节还回答了「多层检查怎么不打架」。' },
        { n:7, t:'When Errors Become Narratives: A Longitudinal Taxonomy of Silent Failures in a Production LLM Agent Runtime', ax:'2606.14589', y:'2026-06', v:'arXiv', h:'2h',
          intro:'对一个真实运行三个月以上的个人助理 Agent 做纵向事故研究：22 起静默失败归成五类，约 70% 最后是人肉看输出才发现的。',
          why:'生产环境里「验证缺失长什么样」的对照样本。类型学扩展和故障注入设计都拿它当外部效度参照。' },
        { n:8, t:'Beyond Pass@k: Measuring Reliability and Security of Agentic Code Generation', ax:'2608.14711', y:'2026-08', v:'arXiv', h:'2h',
          intro:'发现现有榜单把 pass@k 的公式用错了（把测试数量当成独立尝试次数），提出 reliability@k：同一任务独立跑 k 次的成功率；错误算法平均虚高 0.92。',
          why:'主线所有「重复多次」的实验都要按它的协议来；它给的相关性阈值 0.70 是"省成本只跑一次"的反面证据。' },
        { n:9, t:'Noise Floor Audit for Agent Benchmarks', ax:'2608.22331', y:'2026-08', v:'arXiv', h:'2h',
          intro:'量了基准分数本身有多稳：温度 0 重跑 10 次的波动很小，四种保义改写造成的波动是重跑噪声的 11—58 倍。',
          why:'自建评测前先控变量。检出的差异必须大于扰动噪声才算数，实验设置照它的协议抄。' },
        { n:10, t:'REFLECT: Intervention-Supported Error Attribution for Silent Failures in LLM Agent Traces', ax:'2606.09071', y:'2026-06', v:'arXiv', h:'2h',
          intro:'研究「检测出失败之后怎么定位错在哪一步」：提出归因记录（在第 i* 步修正并保留前缀重放），只有重放翻转结果，归因才算有干预证据支撑。',
          why:'误报分析的方法论起点：每条误报都要能指出「改哪层会翻转判定」，做不到就说明归因是猜的。' },
        { n:11, t:'Why Do Multi-Agent LLM Systems Fail? (MAST)', ax:'2503.13657', y:'2025-03', v:'NeurIPS 2025', c:474, h:'3h',
          intro:'对多 Agent 系统的系统性失败分析：人工标注出三大类共 14 种失败模式（包括信息共享失败、验证不足），给出了完整的标注协议和一致性数据。',
          why:'失败分类学的标准范本，主线类型学照它「定义加正反例加仲裁」的写法做；扩展方向 B 的失败归因也直接引用它。' },
        { n:12, t:'Are we really making much progress? Revisiting HGNNs (HGB)', ax:'2112.14936', y:'2021', v:'KDD 2021', c:481, h:'2h',
          intro:'「泼冷水」式评测的代表作：在同一套条件下重新测试大量异构图神经网络，发现很多声称的提升来自不公平比较和调参空间。',
          why:'写实证和评测类论文时拿它当模板。负结果和边界刻画怎么写成一篇有影响力的论文，看它。' }
      ]
    },
    tracks: {
      A: {
        name:'方向 A · 任务完成验证：预算约束下的环境证据选择（主线）',
        pitch:'唯一主线，也是第一篇。Agent 宣称完成后，验证器在拿不到标准答案、只能通过正常查询接口拿信息的条件下，决定查哪些环境状态、查多少、何时承认无法确认。',
        fit:'和导师的配合点：问题建模、多源证据融合、实验设计这三处他可以把关。和求职的配合点：评测、可观测、Harness 岗位每天在谈的就是这套判断。',
        stages:[
          { k:'第 1—2 月', v:'问题验证：与三个最近工作划界，搭起 τ²-bench 或 AppWorld 环境，把任务条件映射成证据点清单' },
          { k:'第 3 月', v:'策略与对比：证据选择策略 v1 对随机/固定查询顺序、纯日志、LLM-as-Judge 和 2606.09863 的轻量检测器，同预算同接口权限；全量核验作成本参照上界' },
          { k:'第 4—5 月', v:'跨任务与跨模型：第二个任务域、第二个模型家族；误报归因和弃权阈值' },
          { k:'第 6 月起', v:'写论文与投稿：NeurIPS D&B、ICSE/FSE 实证方向或 FAGEN 一类 workshop；整理复现包' }
        ],
        papers:[
          { t:'Cognitive Architectures for Language Agents (CoALA)', ax:'2309.02427', y:'2023-09', v:'TMLR', c:449, h:'3h', why:'把 Agent 拆成记忆、动作空间、决策循环的总框架。说「失败出在哪一层」时，用它这套坐标来定位', key:true },
          { t:'Memory is Reconstructed, Not Retrieved: Graph Memory for LLM Agents (MRAgent)', ax:'2606.06036', y:'2026-06', v:'ICML 2026', c:2, h:'3h', warn:true, why:'2026 年「主动获取信息」的代表：agent 边推理边发明新的检索线索，并证明主动检索严格强于被动检索。主线把「主动」用在完成核验上：决定下一步查哪个状态，和它的检索线索生成是近邻问题。它原本在图记忆轨道（现暂缓），因与证据获取直接相关移入主线，卡内划界内容仍可对照' }
        ],
        repos:[ { r:'Ctrl1CandV/Atlas', note:'执行与评测设施：假成功检测、哈希断言、JSONL 台账都在这里，全部实验跑在这套系统上' }, { r:'Ctrl1CandV/AgentParliament', note:'审查对照与后续扩展：三级权限交叉审查，用在「模型审查对环境查询」的对照实验里' } ],
        datasets:[ { n:'minibank-trap（自有）', d:'带缺陷评测集：6 个代码缺陷、5 个设计漏洞、2 个规则违规；主线里作受控故障注入的补充，公开环境为主' }, { n:'τ-bench / τ²-bench', d:'工具调用场景，含静默策略违约（2607.07405 用的就是它）；主线首选的公开环境' }, { n:'Atlas 生产轨迹', d:'自带台账：每个节点的输入输出、token、费用和失败链都在' } ],
        note:'主路径论文现在只有两篇，这是诚实的现状：90 天计划 W1—W6 的任务之一就是沿 2606.09863 和 Strategic Verification 的引用链补查 3—5 篇，补进本方向并生成阅读卡。不要为凑数把没读过的论文标成必读。'
      },
      B: {
        name:'方向 B · 交叉审查什么时候真的有用（扩展）',
        pitch:'主线稳定后的对照实验：同等预算下，额外的模型审查和额外的环境查询哪个更划算。复用 AgentParliament，借用主线的任务集和台账。',
        fit:'和导师的配合点：实验设计他能把关。和求职的配合点：多 Agent 协作和评测岗。',
        stages:[
          { k:'启动条件', v:'主线 W8 检查点通过之后才排期；不预先承诺第二篇论文' },
          { k:'第 1 月', v:'设计对照矩阵：独立审查（权限分层）、共享辩论、单审、同等查询预算的环境核验，四组同条件' },
          { k:'第 2—4 月', v:'跑完全部配置并量化：缺陷召回、误报、成本、延迟，再用 MAST 框架分析错误共识的形成' },
          { k:'第 5—6 月', v:'写论文：ESWA / KBS / ICSE-FSE 实证方向；结果为负就按 HGB 的模板写' }
        ],
        papers:[
          /* tier 约定：缺省 = 主路径；'extend' = 延伸（L2 折叠，不进 90 天主路径）。
             B：主路径 6 + 延伸 6。 */
          { t:'The Interaction Tax: When Communication Erases Diversity in Multi-Agent Teams', ax:'2608.23541', y:'2026-08', v:'ICML 2026 (PMLR 306)', h:'3h', why:'证明模型间通信会抹平多样性，正好打在「交叉审查能打破确认偏差」这个假设上，实验设计必须回应它', key:true },
          { t:'The Collaboration Tax: How Much LLM Multi-Agent Systems Pay to Coordinate', ax:'2608.22152', y:'2026-08', v:'arXiv', h:'2h', why:'量化多 Agent 的协调成本，成本侧的指标从这里来' },
          { t:'OrchestraBench: Evaluating Multi-Agent Orchestration Failure Modes, Recovery, and Decomposition Quality', ax:'2608.05263', y:'2026-08', v:'arXiv', h:'2h', why:'编排失败模式和恢复能力的评测，实验任务和指标可以直接拿来参照' },
          { t:'AutoGen: Multi-Agent Conversation', ax:'2308.08155', y:'2023', v:'COLM 2024', c:2178, h:'2h', why:'用得最多的多 Agent 框架，共享辩论这条基线就用它来实现' },
          { t:'Language Agents as Optimizable Graphs (GPTSwarm)', ax:'2402.16823', y:'2024', v:'ICML 2024', h:'3h', why:'把 Agent 系统建模成可优化的图，审查拓扑的消融实验照这个套路设计' },
          { t:'G-Designer: Multi-agent Communication Topologies via GNNs', ax:'2410.11782', y:'2024', v:'ICML 2025', c:88, h:'2h', why:'用 GNN 生成通信拓扑。导师的图方法能直接看懂这篇，是和他的衔接点' },
          { t:'Multi-Agent Debate Strategies: Survey, Taxonomy, and Challenges', ax:'2607.26212', y:'2026-07', v:'arXiv（投 ACM CSUR）', h:'3h', tier:'extend', why:'多 Agent 辩论策略的分类综述，写 related work 时当骨架用' },
          { t:'Beyond Individual Intelligence: Surveying Collaboration, Failure Attribution, and Self-Evolution in LLM-based Multi-Agent Systems', ax:'2605.14892', y:'2026-05', v:'arXiv（LIFE 综述）', h:'3h', tier:'extend', why:'把协作、归因、自演化放进一个框架讲，失败归因那部分要对话的就是它' },
          { t:'Agent Workflow Memory', ax:'2409.07429', y:'2024-09', v:'ICML 2025', c:207, h:'2h', tier:'extend', why:'从历史轨迹归纳可复用的 workflow。设计「审查经验该共享还是私有」的对照实验时参照它' },
          { t:'CAMEL: Communicative Agents for Mind Exploration', ax:'2303.17760', y:'2023', v:'NeurIPS 2023', c:1654, h:'2h', tier:'extend', why:'角色扮演式协作的起点，审查角色的设计思想可以溯到这里' },
          { t:'MetaGPT: Meta Programming for Multi-Agent Collaborative Framework', ax:'2308.00352', y:'2023', v:'ICLR 2024', c:2177, h:'2h', tier:'extend', why:'把标准作业流程（SOP）编码进 Agent 分工，权限分层在工业界的对应做法' },
          { t:'LEGOMem: Modular Procedural Memory for Multi-agent LLM Systems', ax:'2510.04851', y:'2025', v:'会议论文集', c:29, h:'2h', tier:'extend', why:'程序性记忆怎么在多 Agent 间分配，是「经验给谁用」的对照' }
        ],
        repos:[ { r:'Ctrl1CandV/AgentParliament', note:'实验运行的地方：10 个工具、三级权限、角色链 profiles' }, { r:'microsoft/autogen', note:'共享辩论基线的实现' } ],
        datasets:[ { n:'minibank-trap（自有）', d:'缺陷召回的 gold 集' }, { n:'OrchestraBench', d:'编排失败模式的任务来源' } ],
        note:'这个方向依赖主线建好的评测协议和台账。排在主线 W8 之后启动，可以省一个月的基建时间。'
      },
      C: {
        name:'方向 C · 给记忆后端做统一横评（条件性备选）',
        pitch:'有启动条件才做的备选：主线发现过期或冲突记忆让完成判断出错，或导师给出具体课题时启动。图记忆在这里是被评测对象之一，导师可以参与设计。',
        fit:'和导师的配合点：图记忆是被评测对象之一，他能深度参与设计。和求职的配合点：记忆（腾讯 JD 出现率 7.2%）和评测（百度样本里出现率 12.3%、腾讯样本里 15.5%）都是市场语言。',
        stages:[
          { k:'启动条件', v:'主线实验观察到记忆过期、冲突导致完成误判的具体现象；或导师提出相关课题' },
          { k:'第 1 月', v:'定统一评测协议：成本、精度、延迟三轴，配检索、更新、冲突处理、遗忘四种能力' },
          { k:'第 2—4 月', v:'跑后端横评：平铺、层级、向量、图记忆四类（图方案请导师参与）在同一套条件下过 LoCoMo 和 LongMemEval' },
          { k:'第 5—6 月', v:'边界实验与写论文：过期污染、检索噪声对完成判断的影响；投 KBS / ESWA / Neurocomputing 或 NeurIPS D&B' }
        ],
        papers:[
          /* C：主路径 5 + 延伸 11（原延伸 4 + 自公共层移入的 7 篇背景）。
             Oblivion（2604.00131）在方向 F；对照关系写在本方向 note 里。 */
          { t:'LongMemEval: Benchmarking Chat Assistants on Long-Term Interactive Memory', ax:'2410.10813', y:'2024-10', v:'ICLR 2025', c:450, h:'3h', why:'500 个问题、五类记忆能力的细分。评测协议里的能力维度直接沿用它的划分', key:true },
          { t:'MemoryAgentBench: Evaluating Memory via Incremental Multi-Turn Interactions', ax:'2507.05257', y:'2025-07', v:'arXiv', c:156, h:'2h', why:'四维能力里带「冲突消解」，做边界实验时这个维度是现成的', key:true },
          { t:'Harness the Memory: A Holistic Evaluation of Memory Substrates in Memory Agents', ax:'2608.15008', y:'2026-08', v:'arXiv', h:'3h', why:'它的结论是没有哪种存储能一直最优。这是最直接的前作，协议设计必须建立在对它的比较之上', key:true },
          { t:'MemoryLake on MemoryArena: A Matched Study of Agent Memory Backends', ax:'2608.13883', y:'2026-08', v:'arXiv', h:'2h', why:'配对研究（matched study）的设计范式，同条件对比照着它的模板来' },
          { t:'From Storage to Experience: A Survey on the Evolution of LLM Agent Memory', ax:'2605.06716', y:'2026-05', v:'ACL 2026 Findings', c:10, h:'3h', why:'2026 年最新的记忆领域全景和开放问题清单' },
          { t:'Generative Agents: Interactive Simulacra of Human Behavior', ax:'2304.03442', y:'2023-04', v:'UIST 2023', c:4898, h:'3h', tier:'extend', why:'记忆系统的原型（memory stream、三因子检索、reflection）。设计记忆评测协议时，三因子检索是必须对照的基线组合' },
          { t:'MemGPT: Towards LLMs as Operating Systems', ax:'2310.08560', y:'2023-10', v:'arXiv（后演化为 Letta）', c:989, h:'2h', tier:'extend', why:'记忆管理的系统视角，也是典型的「要避开的大工程」：做记忆操作系统是个深坑，评测科学是更现实的切入方式' },
          { t:'A Survey on the Memory Mechanism of LLM-based Agents', ax:'2404.13501', y:'2024-04', v:'ACM TOIS', c:664, h:'3h', tier:'extend', why:'第一篇 Agent 记忆综述，术语一次立好；协议里记忆能力的分类要引用它的框架' },
          { t:'A-MEM: Agentic Memory for LLM Agents', ax:'2502.12110', y:'2025-02', v:'NeurIPS 2025', c:772, h:'4h', tier:'extend', warn:true, why:'「记忆自己生长」路线的代表。C 启动时必须精读到能讲清演化触发条件，并说清协议与它的差别' },
          { t:'Zep: A Temporal Knowledge Graph Architecture for Agent Memory', ax:'2501.13956', y:'2025-01', v:'arXiv（Zep 公司）', c:263, h:'3h', tier:'extend', why:'工业界图记忆代表。社区层它已经做了，要读出粗糙之处（粒度、更新、属性缺失），那里是图方向（D）能下手的地方' },
          { t:'Mem0: Building Production-Ready AI Agents with Scalable Long-Term Memory', ax:'2504.19413', y:'2025-04', v:'ECAI 2025', c:492, h:'2h', tier:'extend', why:'记忆实验的默认对比对象。它在 LoCoMo 上的统计方式被后续横评质疑过，这些统计差异本身就是协议素材' },
          { t:'Evaluating Very Long-Term Conversational Memory (LoCoMo)', ax:'2402.17753', y:'2024-02', v:'ACL 2024', c:664, h:'3h', tier:'extend', why:'记忆后端横评的事实标准场地。各家在它上面报的数字互相矛盾，这是 C 协议要解决的原始素材' },
          { t:'Memory OS of AI Agent (MemoryOS)', ax:'2506.06326', y:'2025-05', v:'EMNLP 2025', c:92, h:'2h', tier:'extend', why:'三级存储加页面调度，层级记忆这一类的被评测代表，国内同类工作' },
          { t:'MIRIX: Multi-Agent Memory System for LLM-Based Agents', ax:'2507.07957', y:'2025-07', v:'arXiv', c:135, h:'2h', tier:'extend', why:'六类记忆模块的分工，相当于记忆分类的工业版本' },
          { t:'MemoryBank: Enhancing LLMs with Long-Term Memory', ax:'2305.10250', y:'2023-05', v:'AAAI 2024', c:569, h:'2h', tier:'extend', why:'用艾宾浩斯遗忘曲线做记忆更新，遗忘这条线的起点' },
          { t:'General Agentic Memory Via Deep Research', ax:'2511.18423', y:'2025-11', v:'arXiv', c:31, h:'2h', tier:'extend', why:'站在反方：放弃预构建的索引。要回答「记忆到底需不需要组织」，它是必须回应的对立面' }
        ],
        repos:[ { r:'mem0ai/mem0', note:'被评测的后端之一' }, { r:'getzep/graphiti', note:'图记忆后端（需要 Neo4j 或 FalkorDB）' }, { r:'letta-ai/letta', note:'MemGPT 这一系的后端' } ],
        datasets:[ { n:'LoCoMo', d:'对话记忆的主基准（延伸层有专卡）' }, { n:'LongMemEval / MemoryAgentBench', d:'能力细分和冲突维度的来源' } ],
        note:'启动前这些论文都在延伸层等用：5 篇主路径加 11 篇背景（含从原公共层移入的 7 篇）。若启动，把主路径 5 篇提回阶段路线。遗忘和衰减策略的对照看方向 F 的 Oblivion（2604.00131）。'
      },
      D: {
        name:'方向 D · 图结构化记忆：社区发现与分层压缩（暂缓）',
        pitch:'暂缓，资料保留：更高的聚类指标未必带来更好的任务表现。先有具体失效现象和初步证据再考虑图方法；重启条件是主线或生产环境里出现「记忆组织方式导致检索质量上不去」的具体案例。',
        fit:'这条线导师配合度最高，能给实质修改意见，所以资料全部保留；但暂缓期间不安排学习任务，也不写进默认计划。',
        stages:[
          { k:'暂缓说明', v:'不排期。重启需要：具体的失效现象、初步证据、以及和导师确认的时间窗口' },
          { k:'重启第 1 月', v:'补图侧基本功：在 Cora/Citeseer 上复现 DMoN 和 SDCN，把 NMI/ARI 对齐到论文数字' },
          { k:'重启第 2—4 月', v:'构建记忆图并实现方法：HAN 式融合加 DMoN 式划分，图聚类指标和端到端记忆指标都看' },
          { k:'重启第 5—6 月', v:'写论文：KBS / ESWA / Neurocomputing（导师熟悉这几个刊）' }
        ],
        papers:[
          /* D：前置 3（tier:'prereq'，重启本方向才要求）+ 主路径 7 + 延伸 10。
             MRAgent（2606.06036）已移入主线 A（证据获取相关）；粗化 2106.05150 的家在这里，方向 F 只引用不复制。 */
          { t:'Semi-Supervised Classification with Graph Convolutional Networks (GCN)', ax:'1609.02907', y:'2016', v:'ICLR 2017', c:36222, h:'2h', tier:'prereq', why:'导师全部论文的共同地基，要求能徒手推导' },
          { t:'Graph Attention Networks (GAT)', ax:'1710.10903', y:'2017', v:'ICLR 2018', c:27410, h:'2h', tier:'prereq', why:'导师偏爱注意力机制，这篇是必读基础' },
          { t:'Inductive Representation Learning on Large Graphs (GraphSAGE)', ax:'1706.02216', y:'2017', v:'NeurIPS 2017', c:20487, h:'2h', tier:'prereq', why:'它的邻居采样思路，就是后面做子图采样的基础' },
          { t:'Heterogeneous Graph Attention Network (HAN)', ax:'1903.07293', y:'2019', v:'WWW 2019', c:3260, h:'3h', why:'元路径加双通道注意力，记忆图主干方法的首选', key:true },
          { t:'Structural Deep Clustering Network (SDCN)', ax:'2002.01633', y:'2020', v:'WWW 2020', c:686, h:'3h', why:'AE 和 GCN 双流融合，导师「多嵌入融合」的想法可以追到这里', key:true },
          { t:'Graph Clustering with Graph Neural Networks (DMoN)', ax:'2006.16904', y:'2020', v:'JMLR 24(127) 2023', c:413, h:'3h', why:'可微模块度池化，端到端社区发现要用的就是它', key:true },
          { t:'Scaling Up GNNs Via Graph Coarsening', ax:'2106.05150', y:'2021', v:'KDD 2021', c:144, h:'3h', why:'图粗化，分层压缩的理论基础；方向 F 的核心也建在这篇上', key:true },
          { t:'Graph Retrieval-Augmented Generation: A Survey', ax:'2408.08921', y:'2024-08', v:'ACM TOIS', c:500, h:'3h', why:'GraphRAG 的第一篇综述，G-Indexing/G-Retrieval/G-Generation 三段框架；D 写检索相关工作就用它组织' },
          { t:'AriGraph: KG World Models with Episodic Memory for LLM Agents', ax:'2407.04363', y:'2024-07', v:'IJCAI 2025', c:92, h:'3h', why:'语义记忆和情节记忆融合的世界模型图，算异构记忆图的直接前身，代码开源' },
          { t:'HippoRAG: Neurobiologically Inspired Long-Term Memory for LLMs', ax:'2405.14831', y:'2024-05', v:'NeurIPS 2024', c:284, h:'3h', why:'在开放知识图上用 PPR 模拟海马体索引，一套马上能动手复现的图算法' },
          { t:'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks', ax:'2005.11401', y:'2020-05', v:'NeurIPS 2020', c:16334, h:'2h', tier:'extend', why:'检索增强生成的奠基论文：参数化知识和非参数化知识各自管什么，之后所有记忆、检索方面的定位都绕不开这个框架' },
          { t:'From Local to Global: A Graph RAG Approach to Query-Focused Summarization', ax:'2404.16130', y:'2024-04', v:'微软研究院技术报告', c:1815, h:'4h', tier:'extend', why:'微软 GraphRAG：Leiden 聚社区加逐层摘要。精读它的社区层级构建，Leiden 这一步就是 D 要换成属性感知聚类的位置' },
          { t:'LightRAG: Simple and Fast Retrieval-Augmented Generation', ax:'2410.05779', y:'2024-10', v:'EMNLP 2025', c:386, h:'3h', tier:'extend', why:'HKUDS 的简化版 GraphRAG，最容易复现的图检索 baseline；第一个 baseline 数字大概率从它这里来' },
          { t:'Heterogeneous Graph Transformer (HGT)', ax:'2003.01332', y:'2020', v:'WWW 2020', c:1697, h:'3h', tier:'extend', why:'按元关系参数化的注意力，不用手工设计元路径，是 HAN 的替代选项' },
          { t:'Attributed Graph Clustering: Deep Attentional Embedding (DAEGC)', ax:'1906.06532', y:'2019', v:'IJCAI 2019', c:646, h:'3h', tier:'extend', why:'属性图聚类的奠基作，导师 ASOC 2024 那篇和它同族' },
          { t:'A Comprehensive Survey on Community Detection with Deep Learning', ax:'2105.12584', y:'2021', v:'IEEE TNNLS', c:456, h:'3h', tier:'extend', why:'深度学习社区发现的全景图，正好是导师这个方向的地图' },
          { t:'HiRAG: RAG with Hierarchical Knowledge', ax:'2503.10150', y:'2025', v:'EMNLP 2025 Findings', c:40, h:'2h', tier:'extend', why:'层级知识检索，和分层记忆概念重叠，读它是为了写清楚两者的区别' },
          { t:'From Experience to Strategy: Trainable Graph Memory', ax:'2511.07800', y:'2025-11', v:'arXiv', c:10, h:'2h', tier:'extend', warn:true, why:'「可训练图记忆」这个说法已经被它占了，重启前必须对照它划清贡献边界' },
          { t:'From RAG to Memory: Non-Parametric Continual Learning for LLMs (HippoRAG 2)', ax:'2502.14802', y:'2025-02', v:'ICML 2025', c:181, h:'3h', tier:'extend', why:'段落加概念的混合图，明确把 RAG 重新说成 memory 问题' },
          { t:'G-Retriever: RAG for Textual Graph Understanding and QA', ax:'2402.07630', y:'2024-02', v:'NeurIPS 2024', c:321, h:'3h', tier:'extend', why:'把子图检索形式化成带奖赏的斯坦纳树，做子图召回算法从这里出发' }
        ],
        repos:[ { r:'gusye1234/nano-graphrag', note:'只有千行左右的教学级实现，适合用来搞清楚社区划分发生在哪一步' }, { r:'HKUDS/LightRAG', note:'跑 baseline 用的系统' }, { r:'microsoft/graphrag', note:'官方实现，但索引阶段花 token 很多，先不要拿它跑实验', warn:true } ],
        datasets:[ { n:'Cora / Citeseer / PubMed', d:'图聚类的标准数据集（PyG Planetoid）' }, { n:'DBLP / ACM / IMDB 异构图', d:'方法先在这些异构图上验证（PyG/HGB）' }, { n:'LoCoMo / LongMemEval', d:'端到端记忆指标（方向 C 延伸层有专卡）' } ],
        note:'暂缓不等于删除：图记忆资料完整保留，重启条件写在 pitch 里。D、F、C 三条同族，可以拼成和导师合作的完整故事：D 出方法，F 出压缩曲线，C 出统一评测。'
      },
      E: {
        name:'方向 E · 审计代码任务的完成判定（扩展，收窄）',
        pitch:'收窄后的应用扩展：只做「测试通过却未满足任务要求」的验证问题，把主线方法用到代码基准上。不再同时普查污染、难度和测试质量。',
        fit:'和导师的配合点：实证研究的方法他可以把关。和求职的配合点：各家 coding agent 团队（阿里 Qoder、Kimi、字节）都需要读得懂基准数据的人。',
        stages:[
          { k:'启动条件', v:'主线 W8 检查点之后，作为应用扩展排期；复用主线的核验思路与脚本' },
          { k:'第 1 月', v:'把「测试通过但任务没完成」的样本从 SWE-bench 实例里筛出来，定义任务级 gold' },
          { k:'第 2—4 月', v:'移植主线的证据选择策略：从执行轨迹和仓库状态里选证据，同预算对比测试预言和任务级核验' },
          { k:'第 5—6 月', v:'写论文：ICSE / FSE / ASE（empirical study / NIER）或 NeurIPS D&B' }
        ],
        papers:[
          { t:'SWE-bench: Can Language Models Resolve Real-World GitHub Issues?', ax:'2310.06770', y:'2023-10', v:'ICLR 2024', h:'3h', why:'代码智能体基准的源头，也是本方向要审计判定质量的对象本身', key:true },
          { t:'PAIChecker: Uncovering and Checking PR-Issue Misalignment in SWE-Bench-Like Benchmarks', ax:'2607.28587', y:'2026-07', v:'arXiv', h:'2h', why:'发现 Verified 集有 13.6% 的 PR-Issue 不匹配，「基准判定自己需要被检查」的直接证据。本方向只取它的判定与需求错位维度；污染与难度普查已从本方向移除', key:true },
          { t:'SWE-Doctor: Guiding Software Engineering Agents with Runtime Diagnosis from Multi-Faceted Bug Reproduction Tests', ax:'2607.00990', y:'2026-07', v:'arXiv', h:'2h', why:'用运行时诊断辅助 SWE Agent，是测试预言增强旁边的相关工作' },
          { t:'Open-SWE-Traces: Advancing Dual-Mode Multilingual Distillation for Software Engineering Agents', ax:'2606.16038', y:'2026-06', v:'arXiv', h:'2h', why:'20 万条量级的真实轨迹，判定错位分析的数据来源' },
          { t:'Break It Down, Pass It On: Cross-Task Skill Transfer in LLM Agents', ax:'2608.20274', y:'2026-08', v:'arXiv', h:'2h', why:'技能跨任务迁移的受控研究，写法上可当「什么结论在什么条件下可信」的实证模板' }
        ],
        repos:[ { r:'princeton-nlp/SWE-bench', note:'既是审计对象，也是实验要跑的代码（Docker harness）' } ],
        datasets:[ { n:'SWE-bench / Verified', d:'主审计对象；注意 PAIChecker 发现的不匹配问题' }, { n:'Open-SWE-Traces', d:'大规模真实轨迹' } ],
        note:'收窄说明：原「数据质量普查（污染、难度、测试预言三件套）」不再属于本方向，因为无法访问训练数据时污染只能停留在猜测。保留的是判定与需求的错位验证，它和主线共用「证据选择」的思路。'
      },
      F: {
        name:'方向 F · 记忆压缩：压缩率和性能的取舍（暂缓）',
        pitch:'暂缓，资料保留：MemRefine 与 PRISM 已研究记忆预算与性能的取舍；重启条件是主线或导师课题里出现需要记忆预算分析的具体场景，且与它们的方法差异能落到图粗化的结构压缩上。',
        fit:'和导师的配合点：图粗化、社区发现正好在他的方法库里。暂缓期间不安排学习任务。',
        stages:[
          { k:'暂缓说明', v:'不排期。重启需要：与 MemRefine/PRISM 的方法差异落到公式级，以及导师确认的时间窗口' },
          { k:'重启第 1 月', v:'把问题形式化：记忆压缩等于保持检索效用的图粗化，定义粗化准则和误差界' },
          { k:'重启第 2—4 月', v:'实现与预算扫描：在 LoCoMo 上按预算逐层粗化，画出压缩率对准确率的取舍曲线' },
          { k:'重启第 5—6 月', v:'写论文：Neurocomputing / Applied Soft Computing（导师熟悉这两个刊）' }
        ],
        papers:[
          /* F：主路径 5 + 延伸 1（MemRefine，F 暂缓的理由链之一）。
             Oblivion（2604.00131）在本方向；C 的 note 里有对照引用。 */
          { t:'RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval', ax:'2401.18059', y:'2024-01', v:'ICLR 2024', c:589, h:'3h', why:'树形分层记忆的代表作。画预算-性能曲线时它是曲线上的直接对手：同样分层压缩，它走聚类加摘要，F 走图粗化', key:true },
          { t:'SeCom: On Memory Construction and Retrieval for Personalized Agents', ax:'2502.05589', y:'2025-02', v:'ICLR 2025', c:79, h:'2h', why:'论证记忆的最优粒度是话题段。压缩「压到什么粒度」这条轴的依据来自它', key:true },
          { t:'Oblivion: Self-Adaptive Agentic Memory Control through Decay-Driven Activation', ax:'2604.00131', y:'2026-03', v:'arXiv（NEC Labs）', h:'2h', why:'衰减式压缩的 2026 年代表，基线之一' },
          { t:'Graph Summarization Methods and Applications: A Survey', ax:'1612.04883', y:'2016', v:'ACM CSUR', c:156, h:'3h', why:'图压缩方法的总目录。设计粗化准则要用到的理论词汇基本都能在这里找到出处' },
          { t:'NarrativeQA', ax:'1712.07040', y:'2017', v:'TACL', c:null, h:'2h', why:'长文档理解基准，作为预算扫描的第二个评测域' },
          { t:'MemRefine: LLM-Guided Compression for Long-Term Agent Memory', ax:'2606.13177', y:'2026-06', v:'arXiv', h:'1h', tier:'extend', why:'记忆预算与性能取舍已有研究的证据（在固定预算内删、并、留记忆条目），是 F 暂缓的理由链之一；重启时它是必须划界的对象，PRISM（jingyip-cat.github.io/PRISM/）同列' }
        ],
        repos:[ { r:'parthsarthi03/raptor', note:'RAPTOR 参考实现（已停更，当基线够用）' }, { r:'gusye1234/nano-graphrag', note:'社区划分这一步在它里面能看清楚，和 D 共用' } ],
        datasets:[ { n:'LoCoMo', d:'主评测域（方向 C 延伸层有专卡）' }, { n:'NarrativeQA', d:'长文档第二评测域' }, { n:'UltraDomain', d:'LightRAG 对比必需' } ],
        note:'纯图算法加缓存的嵌入，API 成本接近于零。暂缓不等于删除：如果主线或导师课题里出现记忆预算的具体场景，这条线重启成本最低。'
      }
    }
  },

  // ---------- 已饱和 ----------
  saturated: [
    { t:'「用知识图谱组织 Agent 记忆」这个提法本身', e:'Zep/Graphiti、A-MEM、AriGraph、GraphRAG、LightRAG、MIRIX 全都做过', j:'只说「我建了一张记忆图」已经不新鲜' },
    { t:'实体关系抽取式的记忆图构建流程', e:'微软 GraphRAG、LightRAG、Graphiti 三套开源实现', j:'工程细节基本被做尽了' },
    { t:'树形层级摘要式的记忆压缩', e:'RAPTOR 用 GMM 加摘要，GraphRAG 用 Leiden 加社区摘要，HiRAG 也做了', j:'「聚类加摘要」不能再当唯一贡献' },
    { t:'只在 LoCoMo 上刷分', e:'Mem0、A-MEM、Zep、MemoryOS 都在这个榜上比过，报的数字互相矛盾', j:'只刷 LoCoMo 很难说服审稿人' },
    { t:'遗忘曲线式的记忆衰减', e:'从 MemoryBank（2023）到 Oblivion（2026），这条线已经有人走完整', j:'已经没有位置' },
    { t:'再做一个通用多 Agent 框架或编排 demo', e:'Interaction Tax 和 Collaboration Tax 已经在量化协调的开销与收益', j:'进来的人已经太多，而且「多 Agent 到底有没有增益」本身存疑' },
    { t:'把「检查更多环境状态」本身当贡献', e:'2608.02645 已系统研究工具调用的后置条件验证、重试前验证和幂等处理；2606.09863 有检测器', j:'贡献只能落在预算下选什么证据查，不能落在「我会查状态」' },
    { t:'纯 prompt 包装、编排层套壳', e:'面经调研的共识：这类项目在 2029 届秋招会被大量同质简历淹没', j:'学术和求职两边都不加分' },
    { t:'Agentic RL 后训练、预训练、GUI 小模型微调', e:'这是大厂大组和顶级实验室的主场，需要多卡集群', j:'算力上根本不可行，硬进去只是陪跑' },
    { t:'再写一篇 Agent 记忆综述', e:'2024 年有 2 篇 TOIS，2025、2026 各出了 1 篇', j:'没有综述的位置了' }
  ],

  // ---------- 竞争团队 ----------
  rivals: [
    { n:'FAGEN / 假成功线（2606.09863 作者等）', w:'False Success 现象刻画、轻量检测器、误报分析（ICML 2026 workshop）', f:'刚起步，窗口正开', note:'第一篇的直接对手。它的轻量检测器是必比基线；差别在它判轨迹真假，主线做预算下的证据选择与完成核验协议', level:'danger' },
    { n:'Strategic Verification（预印本作者线）', w:'预算约束下的自适应验证（Preprints.org 2026-08）', f:'预印本阶段，发表动向要盯', note:'问题距离最近的近邻。主线必须逐项划界：任务完成核验、环境证据获取、实验设置', level:'danger' },
    { n:'Verified Tool Calls（2608.02645 作者线）', w:'后置条件验证、重试前验证、幂等处理', f:'中', note:'易混淆的近邻，划界点在「单次调用怎么验证」对「预算下查什么」', level:'warn' },
    { n:'SWE-bench 批判线（PAIChecker、reliability@k 等）', w:'基准质量审计、可靠性协议', f:'高，ICSE/FSE 社区节奏快', note:'扩展方向 E 的同场竞争者，以后也可能变成合作或延续的对象', level:'warn' },
    { n:'记忆评测横评线（Harness the Memory、MemoryArena）', w:'记忆后端横评与配对研究', f:'高（arXiv 检索约 21 篇/年）', note:'方向 C（条件备选）的对手，协议设计必须超过它们', level:'warn' },
    { n:'证据溯源线（Traces to Trust 综述及后继）', w:'执行溯源、审计', f:'中，约 26 篇/年', note:'提供理论地图；证据链的组织方式可以和它衔接', level:'warn' },
    { n:'HKU Data Intelligence Lab (HKUDS, Chao Huang)', w:'LightRAG 加大量 GraphRAG 变体', f:'极高，几乎月更', note:'暂缓方向（D/F）需要盯的团队；主线不直接对撞', level:'ok' },
    { n:'Rutgers AGI Research (Yongfeng Zhang)', w:'A-MEM、AIOS', f:'高', note:'Agent 记忆方向的主要产出方，与备选方向 C 相关', level:'ok' },
    { n:'OSU NLP Group (Yu Su)', w:'HippoRAG 1 和 2', f:'高，NeurIPS/ICML 级别', note:'神经科学叙事加图算法，暂缓方向正面碰不过', level:'ok' },
    { n:'Zep AI / Mem0（公司）', w:'Graphiti、Mem0', f:'中', note:'工业界玩家，报数字时偏向自家产品；它们是方向 C 的被评测对象', level:'ok' },
    { n:'BAI-LAB（北邮）', w:'MemoryOS', f:'中', note:'国内同类工作，投稿路径可以参考它', level:'ok' }
  ],
  rivalJudgement:'和新对手拉开差距，靠两样东西。一是问题位置的差别：对手判「这次运行是不是假的」，主线回答「预算内该查什么才能下判断」，后者要管成本、误报和无法确认之间的取舍，是另一道题。二是手上已有的测量设施：Atlas 的台账让每次查询有账可查，AgentParliament 让「模型审查对环境查询」的对照可以直接跑。一个人加一张卡，拼速度拼不过大组；可以拼的是诚实的协议和可复算的对比，这恰好是评测实证类论文的评价标准。',

  metrics: [
    { g:'检出与误报', items:['完成误判检出率（按任务与故障类型分别报告）','误报率：把真完成判为未完成的比例','与 2606.09863 轻量检测器、LLM-as-Judge 的同预算对比'] },
    { g:'无法确认', items:['无法确认比例单独报告——它是验证器的第三种判定输出，与 2606.09863 对失败轨迹收尾表达的「模糊」分类不是一回事','禁止靠大量弃权压低误报','弃权阈值敏感性：阈值移动时误报与检出怎么变'] },
    { g:'成本', items:['每次核验的查询次数、token 和费用','全量核验的成本作参照上界','同预算、同接口权限写进实验设置'] },
    { g:'延迟', items:['核验引入的端到端延迟 P50 / P95','与全量核验的延迟差'] },
    { g:'稳健性', items:['跨任务域：至少两个结构化任务域','跨模型：至少两个模型家族（留一模型族划分）','重复稳定性：reliability@k 协议'] }
  ],

  // ---------- 90 天启动（公共层服务主线，前 4 周问题验证） ----------
  plan90: [
    { w:'W1', ph:1, read:'公共必读第 1—3 篇：假成功刻画（2606.09863）、Strategic Verification、Verified Tool Calls（2608.02645）', run:'核实三篇的数据与代码可得性；写下与三个最近工作的差别一页纸：验证对象、预算定义、实验设置各占一行', out:'与最近工作的差别一页纸初稿；数据与代码可得性备忘', stuck:'预印本没有定稿章节的，按摘要划界并注明未读全文；差别写不出来的地方就是 W2 要补读的地方' },
    { w:'W2', ph:1, read:'第 4—6 篇：证据溯源综述（2606.04990）、确定性检查门（2607.07405）、运行时合同（2608.11274）', run:'搭环境：τ²-bench 和 AppWorld 二选一跑通，5 条真实轨迹进 Atlas 台账；对齐 2606.09863 的语料口径', out:'环境备忘与首批轨迹台账', stuck:'环境装不起来就降级到 minibank-trap 自建故障，并在台账里记下与公开环境的信息差异' },
    { w:'W3', ph:1, read:'第 7—9 篇：生产静默失败（2606.14589）、reliability@k（2608.14711）、噪声地板（2608.22331）', run:'写证据点清单 v1：把任务条件映射到可查询状态，逐项标查询成本；定两列标注方案（真值列含真实成功样本，判定列分通过/拒绝/无法确认）；全量核验不限预算跑一遍作成本上界', out:'证据点清单 v1 与两列标注方案；全量核验成本基线', stuck:'查不到的状态如实标「不可查询」，不要为了清单好看虚构可查项' },
    { w:'W4', ph:1, read:'方向 A 的 CoALA（2309.02427）加公共第 11 篇 MAST', run:'综述初稿 3000 字；第一次组会汇报', out:'⭐文献综述初稿 3000 字；第一次组会 PPT', mile:'能向导师讲清楚三件事：问题是什么、三个最近工作各做了什么、主线差在哪', stuck:'综述写不动就先写三篇对照表，每个工作一行：对象、预算、指标、缺口' },
    { w:'W5', ph:2, read:'公共第 10 篇 REFLECT 归因（2606.09071）加第 12 篇 HGB', run:'形式化 v1：预算、误报率、无法确认比例的度量定义，写成能贴在工位上的一页', out:'问题形式化一页 v1', stuck:'定义争不出来就用 2606.09863 的口径先跑，跑出数据再回头改定义' },
    { w:'W6', ph:2, read:'沿 2606.09863 和 Strategic Verification 的引用链补查 3—5 篇（grad-radar 流程）', run:'实现证据选择策略 v1：按证据缺口加查询成本排序的最简单策略；补查的论文归入方向 A 并生成阅读卡', out:'策略 v1 可跑；方向 A 主路径扩充', stuck:'引用链太长就限定二跳以内，只收任务完成核验与证据获取直接相关的' },
    { w:'W7', ph:2, read:'第二遍精读 2606.09863 和 Strategic Verification，这次做虚拟复现：按描述在脑中重跑它们的实验', run:'受控对比：策略 v1、随机查询顺序、固定查询顺序、纯日志方法、LLM-as-Judge 在同一预算、同一接口权限下各跑一遍；全量核验的成本上界单独列表', out:'第一张对比表（论文表 1 的雏形）', stuck:'日志方法信息更多就单独说明信息差异，不能混在同一个预算口径里报' },
    { w:'W8', ph:2, read:'扩展方向 B 的预备阅读（2608.23541）', run:'W8 检查点：划界是否还成立、基线是否复现、小实验有没有信号；拿结果找导师砍范围', out:'⭐问题界定定稿一页；对比表定稿；第二次组会', mile:'三个判断都有数据支撑：与最近工作的差别、基线可复现、策略有信号（或明确没信号）', stuck:'没信号也是结果：收窄问题或换证据类型，比硬撑到 W12 强' },
    { w:'W9', ph:3, read:'扩展方向 E 的预备阅读（2310.06770、2607.28587）', run:'误报归因：每条误报指出改哪层会翻转判定；设弃权阈值，检查误报不是靠弃权压下来的', out:'误报案例集与弃权阈值分析', stuck:'翻转不了判定的「误报」说明检查本身有 bug，先修再分析' },
    { w:'W10', ph:3, read:'目标会议（NeurIPS D&B 或 FSE）最近一年的同类论文 3 篇', run:'跨域检验：第二个任务域加第二个模型家族，按留一模型族划分', out:'跨任务、跨模型结果集', stuck:'第二个域跑不动就选最便宜的公开域，规模如实报告' },
    { w:'W11', ph:3, read:'研究目标会议的复现要求（D&B 的 artifact 条款）', run:'复现包：固定种子、3 次重复、台账附录；检查数据泄漏', out:'可复现包：代码、配置、台账样例、README', stuck:'复现包整理至少留一周，审稿人是真的会跑' },
    { w:'W12', ph:3, read:'—', run:'定稿 20 页汇报：问题定义、与相关工作的划界、方法、主表、误报分析、下一步', out:'⭐20 页汇报材料；投稿目标与时间表', mile:'能完整讲清楚：为什么是这个问题、差别在哪、数字怎么样、还差什么' }
  ],
  plan90Switch:'这 12 周按主线（方向 A）排。扩展方向的预备阅读已经排在 W8（B）和 W9（E）：主线验证后若正式转向，W1—W4 的公共层照读不误，W8 检查点和 W12 汇报的时间不变，W5 起按对应方向卡的阶段路线走。C/D/F 已收进档案，不在计划里。',
  fallback: [
    { s:'API 预算花完了', a:'Atlas 的成本预留先设成硬上限；轨迹生成和抽取结果全部进缓存。注意缓存复用不等于独立重复运行：报 reliability@k 的实验必须用真重复，缓存只用于开发调试' },
    { s:'策略 v1 看起来没优势', a:'先看对照：只有随机、固定顺序两条基线都跑赢它，才说明「选择」本身没价值；再看成本参照，策略的价值在同等误报下省多少查询。比起检出率，更该比的是成本-误报曲线和无法确认比例' },
    { s:'三周没有进展', a:'降级到「测量与现象发现」：先量清楚不同任务域里完成误判的分布和查询成本结构。实证发现在 ICSE/FSE/ASE 同样能发表' },
    { s:'题目被抢发', a:'Strategic Verification 正式发表时逐节对表：它的预算定义、核验对象、实验设置和主线差在哪。差别收窄就往相邻空位走（误报归因、跨域稳健性、成本协议），60 天内还能调' },
    { s:'导师不熟悉 Agent 验证', a:'用下面的翻译表把问题说成他熟悉的语言（任务完成验证对应实验充分性检查，证据选择对应有限预算下选做哪些检验）；汇报的前几页全用他的叙事习惯' },
    { s:'minibank-trap 私有数据集被质疑', a:'按计划补脱敏公开子集和公开协议，不等审稿人提。主线实验优先用公开环境（τ²-bench / AppWorld），minibank-trap 只作补充' }
  ],

  // ---------- 沟通 ----------
  translate: [
    ['任务完成验证', '一套判断「实验是否真的成立」的协议。您审稿时检查实验做得够不够，我做的就是把这种检查自动化，并且在有限预算下决定做哪些检查'],
    ['证据选择', '在有限的查询预算下，选做哪些检验、按什么顺序做。对应实验设计里「用最少的实验回答问题」的取舍'],
    ['环境状态断言', '任务执行后的可复验终态：数据库字段、文件产物、返回值。类似实验里留一份可复查的原始记录'],
    ['误报与无法确认', '把真结果判错是误报；检验力不够时如实说「确认不了」。这两项分开报告，不能靠大量弃权把误报做低'],
    ['多源证据融合', '核验要综合工具返回、环境状态、产物哈希多种来源。您在多嵌入融合上的方法正好用在这个环节'],
    ['执行溯源', '每次判定的依据都用台账固定下来，任何结论能回溯到具体查询和产物'],
    ['图结构记忆（备选）', '如果做记忆方向的备选课题：记忆图的组织与检索。这部分目前暂缓，资料保留']
  ],
  pitch:'老师，我的论文主线想做工具调用智能体的任务完成验证。这些系统经常宣称任务完成了，但环境里其实没做全，而检查的一方拿不到标准答案，只能通过正常接口有限地查。我想研究的问题是：在查询预算内，应该检查哪些环境状态，才能用可接受的成本和误报率判断任务是否完成。为此我已经写了两个开源工具：一个带产物哈希断言和成本台账的工作流引擎，一个多模型交叉审查服务，可以直接当实验平台。我的初步判断是这个问题要靠实验设计和证据融合来解决，这两处想请您把关；涉及多源信息融合的部分，您在多嵌入融合上的积累能直接用上。具体怎么结合想听您的意见。',
  reportDeck: [
    { p:'1', c:'标题页', k:'标题从「任务完成验证」说起，副标题点预算约束下的证据选择' },
    { p:'2', c:'一页讲清场景', k:'讲 Agent 宣称完成但环境没做全的例子（更新 20 条只成功 19 条），配 Atlas 台账里的真实失败案例' },
    { p:'3', c:'问题的形式化', k:'验证器拿不到标准答案，只能通过正常查询接口获取有限信息；预算、误报率、无法确认比例三个量' },
    { p:'4-5', c:'现状与不足', k:'2606.09863 刻画了现象并训练了轻量检测器；Strategic Verification（预印本）讨论预算下自适应验证；2608.02645 做了调用级后置条件验证' },
    { p:'6', c:'研究空档', k:'预算内查什么、查多少、何时承认无法确认，还没有可复算的协议与跨任务结论' },
    { p:'7', c:'和课题组能力的衔接', k:'问题建模、实验设计两处请导师把关；多源证据融合环节直接用多嵌入融合方法（列出导师相关论文）' },
    { p:'8-9', c:'方法草案', k:'任务条件映射成证据点清单；按证据缺口和查询成本排序核验操作；检查器保持纯函数、只读' },
    { p:'10-11', c:'实验设计', k:'同预算同接口对比选择策略、随机/固定查询顺序、纯日志、Judge 与 09863 检测器；全量核验作成本参照；标注分真值列与判定列' },
    { p:'12', c:'已完成的工作', k:'Atlas（542 项测试、真实故障拦截记录）、AgentParliament（37 星）、minibank-trap 首轮受控数据。导师信不信你，就看这一页' },
    { p:'13', c:'算力与成本评估', k:'全部实验单机可完成，LLM 走 API 且有成本预留和缓存；主动说明缓存复用与独立重复的区别' },
    { p:'14', c:'时间计划', k:'W8 定稿问题，W12 汇报；研一争取完成主要实验和初稿，投稿与毕业要求分别核验' },
    { p:'15', c:'需要的支持', k:'说到具体处：API 预算、服务器权限、组里有没有人做过评测或软工方向' }
  ],
  reportTips: [
    '<b>先讲他能判断的东西。</b>用「实验充分性检查的自动化」类比任务完成验证，前几页全用他的叙事习惯，不要一开头堆 Agent 术语。',
    '<b>算力问题主动讲。</b>第 13 页说清单机可跑加成本预留，能明显提升他的信任。',
    '<b>工程背景要讲成资产，不是杂音。</b>两个开源仓库就是实验设施，说法是：实现和数据采集我自己能扛，问题形式化和论文写作想跟他学。'
  ],

  firstMail:{
    title:'给导师的第一封邮件（2026-09 修订版：主线改为任务完成验证）',
    dont:'两件事不要做：不要问「您的方向是什么」，这显得没做过功课；也不要写成单方面通知，结尾要留出让他调整方向的余地。',
    body:`刘老师您好：

我是今年录取到您门下的 XXX。入学前读了您几篇论文，2024 年 Neurocomputing 那篇 information-enhanced deep graph clustering，和 2025 年 KBS 上的 DSS-GCN，对其中"把多路互补信息用可学习方式融合"的思路印象很深。

我本科是软件工程，毕业后做了一年多 Python 后端和大模型应用开发，自己写了两个开源项目：一个多模型工作流引擎（带产物哈希断言和成本台账），一个多模型交叉审查的 MCP 服务。做的过程中我反复撞到同一个问题：智能体系统经常"宣称完成"，但环境里其实没做全，而检查的一方拿不到标准答案，只能通过正常接口有限地查。我想把"在查询预算内该检查哪些环境状态、如何以可接受的误报率判断任务完成"做成可复算的协议和实验，这是我想申请的论文主线。

这个问题里最关键的环节是证据的取舍与融合：不同来源的信号怎么综合、什么情况下该承认无法确认。您在多源信息融合上的方法积累正好能用在这一点上，问题建模和实验设计也想请您把关。具体怎么安排，想听您的意见。

如果可行，我入学前会先把评测环境和基线复现做起来，开学时直接汇报进展。也想请问组里的算力情况，以便我把实验方案设计在可行范围内。

打扰您了，盼回复。

XXX`,
    effect:'这封邮件一次做完四件事：证明读过他的论文；亮出工程经历（两个开源仓库加工作背景）；方向由我提出、判断交给他；并且给他一个能用自己方法参与的入口（证据取舍与融合的环节）。他要不要支持、怎么支持，取决于有没有一个具体的地方可以下手。'
  }
};
