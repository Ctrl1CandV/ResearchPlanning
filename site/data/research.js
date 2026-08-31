/* 板块 2：研究主线 —— 可信 Agent 系统（假成功检测）为主线
   2026-08-28 第二次修订（结构重构）：
   - 方向 B（MCP/A2A 工具生态）、D（最小权限执行）被本人明确拒绝，存档于 rejected；
     补位：E 代码智能体评测质量审计（来自调研会话）、F 记忆压缩帕累托（恢复自旧版切口 C）。
   - 阅读清单重构为「公共必读 + 按方向私有路线」：common 无论走哪条线都要读；
     tracks 按方向携带各自的论文、阶段路线（可视化）、复现资产。
   - 所有 arXiv 编号经 arXiv API 按标题反查确认（2026-08-28）；
     标 pdf:true 的论文在 site/papers/<ax>.pdf 有本地全文。 */
window.RESEARCH = {

  positioning: {
    title: '主线：可信 Agent 系统（假成功检测与评测）；图记忆为导师锚定线',
    body: '三个独立调研收敛于同一判断：最适合你的论文类型是<b>评测/基准/实证</b>，不是提出新方法——它们靠协议设计和扎实数据说话，不靠算力。首选切口是 Agent 的「假成功」：宣称完成、退出码为 0，但证据/状态/约束并未成立。你的 Atlas（假成功检测+哈希断言）和 AgentParliament（交叉审查）就是这个方向的现成测量基础设施。市场语言上，评测（腾讯技术岗 15.5%）、可观测性（7.6%）、记忆（7.2%）全是高频词，与求职主线完全一致。',
    tag: 'strategy'
  },

  // ---------- 六个方向 ----------
  angles: [
    {
      id:'A', star:true,
      name:'Agent 假成功的类型学、基准与检测',
      en:'Characterizing, Benchmarking and Detecting False Success in LLM Agents',
      problem:'Agent 流水线最大的可靠性缺口是「假成功」：模型宣称完成、流程判定通过，但证据有效性、目标状态或安全约束至少一项不成立。2606.09863（FAGEN@ICML 2026）刚把问题命名，标题级工作仅此一篇——窗口刚开，但已不是空白，必须做出它没有的东西：可复算的基准 + 分层检测器。你的 Atlas 已经内置了雏形（空输出/截断/缺字段拦截、SHA-256 产物断言、JSONL 台账），minibank-trap 是现成的埋雷评测集。',
      method:[
        '假成功类型学：虚假工具成功、缺失/陈旧产物、产物与输入不匹配、部分完成宣称整体完成、测试预言不足、多 Agent 错误共识、副作用未捕捉、重跑不稳定（由真实轨迹 + 可控故障注入共同形成）',
        '六级成功验证：声明 / 结构 / 证据 / 任务 / 安全 / 重复成功——把「成功」拆成可独立检验的层',
        '检测器 v1：声明-证据-状态三层解耦检查（Atlas 的哈希断言与截断哨兵是证据层 baseline）',
        '基准构建：minibank-trap 扩展为带配置/模型/重复次数/成本记录的公开评测协议',
        '对比对象：LLM-as-Judge、退出码、JSON Schema 检查、Atlas 内置检测器；指标：假成功检出率、误报率、reliability@k、单位成本'
      ],
      venue:'NeurIPS Datasets & Benchmarks；ICSE/FSE/ASE（实证软工线）；workshop 起步（FAGEN 类）',
      cost:'最低。全部 API + 单机，Atlas 台账自带成本记账',
      risk:'2606.09863 已占「命名」先机；缓解：它做刻画，你做「可复算基准 + 检测器 + 误报分析」，且类型学覆盖面（副作用、重跑稳定性）超出其范围',
      scores:{ value:5, novelty:3, falsifiable:5, feasible:5, resource:5, career:5 }
    },
    {
      id:'B',
      name:'异质多模型交叉审查的有效边界与失败归因',
      en:'When Does Cross-Model Review Help? Boundaries and Failure Attribution of Heterogeneous Multi-Agent Verification',
      problem:'AgentParliament 的核心假设——「外部对立视角打破确认偏差」——从未被系统量化。Interaction Tax（ICML 2026）证明通信会抹除多样性，Collaboration Tax 量化了协调成本，但「独立审查何时优于全文共享辩论」「失败如何归因到具体角色」仍无答案。你的 10 工具三级权限设计与 minibank-trap 埋雷集就是为这个问题准备的实验台。',
      method:[
        '受控对比：独立审查（权限分层）vs 全文共享辩论 vs 单审，固定任务与预算',
        '审查增益的量化：缺陷召回、误报率、成本、延迟',
        '失败归因：错误共识如何形成与传播（对接 MAST 失败分类与 LIFE 综述）',
        '审查角色拓扑的消融：审查者数量、模型异质性、介入时机'
      ],
      venue:'ESWA / KBS（应用导向）；ICSE/FSE（实证线）；ACL Findings',
      cost:'中。多模型调用是主要成本，但 Atlas 的预算机制可控',
      risk:'结论可能是「增益有限」——这本身可发（负结果 + 边界刻画），参考 HGB 泼冷水式写法',
      scores:{ value:4, novelty:3, falsifiable:5, feasible:4, resource:4, career:4 }
    },
    {
      id:'C',
      name:'Agent 记忆后端的评测科学（衔接导师线）',
      en:'An Evaluation Science of Agent Memory Backends: Cost, Accuracy and Latency',
      problem:'Harness the Memory（2608.15008）证明「没有单一存储始终最优」，MemoryArena 做了配对研究——但记忆后端的评测协议仍碎片化：成本-精度-延迟三轴、冲突与漂移、检索噪声何时伤害决策，都缺统一测量方法。这是图记忆方向与评测主线的自然交汇点：图记忆不再作为「新方法」提出，而是作为被评测的对象之一。',
      method:[
        '统一评测协议：三轴（成本/精度/延迟）× 四类能力（检索/更新/冲突/遗忘）',
        '把图结构记忆（导师方法可参与设计）与平铺、层级、向量记忆同口径对比',
        '「记忆何时有害」的边界实验：过期信息污染、检索噪声',
        '漂移与冲突的纵向测量（LoCoMo 按时间切片）'
      ],
      venue:'KBS / ESWA / Neurocomputing（导师主场，他能实质指导）；NeurIPS D&B',
      cost:'低—中。LLM 抽取缓存后图算法免费',
      risk:'评测类工作的新颖性上限；缓解：把「图记忆在什么条件下值得用」的边界做成核心贡献',
      scores:{ value:4, novelty:3, falsifiable:5, feasible:4, resource:4, career:4 }
    },
    {
      id:'D',
      name:'图结构化记忆：异构属性记忆图的社区发现与分层压缩（导师锚定线）',
      en:'Attribute-Aware Heterogeneous Community Detection for Long-Term Memory of LLM Agents',
      problem:'GraphRAG 用 Leiden、Zep 用标签传播划分记忆图——经典无监督算法假设图同质、无属性、静态，与记忆图的异构、带属性、增量演化错配。导师的属性图聚类与多嵌入融合正是对症的方法库。在导师支持新主线的前提下，这条线的角色是<b>导师锚定线</b>：他能深度指导、能给实质修改意见，适合作为第二/三篇或与切口 C 合并。',
      method:[
        '记忆图定义为异构属性图 G=(V,E,X,T)，实体/事件/工具调用三类节点',
        'HAN 式元路径注意力融合结构嵌入与文本嵌入（导师方法论签名）',
        'DMoN 式可微模块度损失做端到端社区划分',
        '社区内摘要形成分层记忆；检索时社区级粗筛 → 节点级精排'
      ],
      venue:'KBS / ESWA / Neurocomputing（导师主场）；冲一冲 TOIS',
      cost:'低。图聚类单卡数小时；LLM 抽取缓存后免费',
      risk:'HKUDS 类团队产出极快；GraphRAG 零 JD 命中意味着求职叙事必须走记忆/评测语言——方向 A/C 的市场词频更强',
      scores:{ value:4, novelty:4, falsifiable:4, feasible:4, resource:4, career:3 }
    },
    {
      id:'E',
      name:'代码智能体评测的质量审计：数据污染、难度分桶与测试预言',
      en:'Auditing Code-Agent Benchmarks: Contamination, Difficulty Bucketing and Test-Oracle Enhancement',
      problem:'代码智能体的评测地基本身可疑：PAIChecker 发现连最干净的 SWE-bench Verified 都有 13.6% 的 PR-Issue 错配；reliability@k 证明单次 pass@k 不可信；τ²-bench 域内大量失败是「无报错的静默错状态」。污染检测、按复杂度/改动规模分桶、测试预言增强三件事经检索确认仍无人系统做——而它们直接决定所有 coding agent 论文数字的可信度。与方向 A 共享评测设施与 venue 社区。',
      method:[
        'SWE-bench-Like 基准的数据质量普查：PR-Issue 错配、测试缺陷、污染样本检测',
        '按圈复杂度/改动行数/测试覆盖度分桶，重算各桶通过率——看「难度」是否被误报',
        'reliability@k 协议接入：同一实例 k 次运行的稳定通过率',
        '轨迹条件测试预言增强：用执行轨迹判别「测试过了但没修好」的静默失败',
        '产出：审计报告 + 修正版榜单 + 可复算的审计工具'
      ],
      venue:'ICSE / FSE / ASE（实证软工主场，偏爱 empirical study）；NeurIPS D&B',
      cost:'低。静态分析 + 数据构建 + 推理 API，单机可做',
      risk:'依赖上游基准的版本变动；缓解：审计工具做成可对任意 SWE-bench-Like 数据集重跑',
      scores:{ value:5, novelty:3, falsifiable:5, feasible:5, resource:5, career:4 }
    },
    {
      id:'F',
      name:'预算约束下的记忆压缩：压缩率-性能帕累托前沿',
      en:'Budget-Constrained Agent Memory Compression via Graph Coarsening',
      problem:'所有记忆系统都报「我比 full-context 省了 X% token 且准确率更高」，但没人给出「给定 token 预算，如何组织记忆使性能最优」这条曲线。图粗化领域有成熟的「压缩比 vs 谱性质保持」理论，完全没被引入记忆场景。成本低、导师契合（图粗化/社区发现），是旧版规划里被验证过的扎实切口，恢复为导师锚定线的第二落点。',
      method:[
        '把记忆压缩形式化为图粗化：保持检索相关谱性质的前提下最小化节点数',
        '借 2106.05150 的粗化框架，设计以检索效用为目标的粗化准则',
        '社区发现产出候选超节点，逐层粗化形成多分辨率记忆',
        '检索时按预算自适应选择分辨率层'
      ],
      venue:'Neurocomputing / Applied Soft Computing（导师主场）',
      cost:'最低。纯图算法 + 缓存嵌入',
      risk:'可能被评"已有技术的组合应用"；缓解：粗化准则要有真正新东西 + 给简单误差界',
      scores:{ value:4, novelty:4, falsifiable:4, feasible:5, resource:5, career:3 }
    }
  ],

  /* 已拒绝方向（2026-08-28 本人确认）。保留记录防止未来重新发明：
     若要翻案，先在此处删除并更新 idea-ledger。 */
  rejected: [
    { id:'old-B', name:'MCP / A2A 工具生态的评测与审计', reason:'优先级权衡后明确拒绝：自研资产复用少于主线；窗口快但拥挤速度极快，不适合作为论文主线。相关工作（SCOUT/READ/AgentChaosBench/Exposed by Design 等）的 PDF 已从本地库移除。' },
    { id:'old-D', name:'Agent 最小权限执行与副作用审计', reason:'明确拒绝：安全形式化门槛高，与主线 A 的「成功验证」有重叠但不构成首篇。Runtime Contract 一篇因与成功验证直接相关保留在方向 A 路线，其余安全向 PDF 已移除。' }
  ],

  angleAdvice:'第一篇做 <b>A（假成功）</b>：资产复用最多、成本最低、与评测岗位重合度最高，窗口刚开。<b>E（代码评测审计）</b>与 A 共享评测设施和 ICSE/FSE 社区，可作第二篇或与 A 并行推进。<b>B（交叉审查边界）</b>复用 A 的基准做第二/三篇。<b>C（记忆评测）</b>与 <b>D/F（图记忆、压缩帕累托）</b>是导师锚定线——若导师希望课题更贴他的技术栈，把 D+F 或 C 前置，公共路线不变。全部方向维持「不训练大模型、API 可缓存、单机可跑」的约束——这是刻意的。',

  /* ── 页面要点（渲染在页头下方；文案从本页现有内容提炼，勿新造结论） ── */
  summary: [
    '论文主线（2026-08 转向）：可信 Agent 系统——「假成功」的类型学、基准与检测；图记忆降为导师锚定线。',
    '首篇默认方向 A：资产复用最多、成本最低、与评测岗位（评测 15.5%）重合度最高，窗口刚开。',
    '全部方向维持「不训练大模型、API 可缓存、单机可跑」的约束——这是刻意的。',
    '双轨 = 工程轨（Atlas / AgentParliament 可复跑实验，求职资产）+ 学术轨（类型学/基准/协议，投稿资产），同一套实验两边复用。',
    '组会开场用本页底部 pitch 的说法；15 页汇报骨架在本页折叠块里。'
  ],
  readingSummary: [
    '先公共、后私有：13 篇公共必读无论走哪个方向都要读，前 4 篇建立语言；全部已备好本地 PDF。',
    '方向卡 A—F 一次看一个：定位 → 阶段路线 → 方向必读 → 复现资产与数据集；公共层在方向间不变。',
    '90 天计划默认沿方向 A 展开；换轨时 W1—W4 公共层不动，W8 检查点与 W12 汇报节奏不变。',
    '卡住就降级：从「提出检测器」降到「系统性测量 + 现象发现」，实证分析在 ICSE/FSE/ASE 也能发。'
  ],

  dualTrack:'<b>双轨在新主线下的含义。</b>主线（A/E）本身就是双轨：<b>工程轨</b>是 Atlas/AgentParliament 的可复跑实验与台账（求职资产），<b>学术轨</b>是类型学/基准/协议（投稿资产），同一套实验产出两边复用。导师衔接轨保留在 C/D/F：记忆评测与图方法让他在组会上能给实质意见——他的支持已确认，这条从「必须」变成「增值」。',

  // ---------- 阅读：公共必读 + 方向私有路线 ----------
  reading: {
    common: {
      name:'公共必读 · 无论走哪条线',
      note:'以下 13 篇是六个方向共享的地基：前 4 篇建立语言，中间 5 篇是记忆系统的参照系与 baseline 常客，后 4 篇是评测与批判的方法论。按顺序读约 37 小时（逐篇 h 相加口径，2026-08-30 订正）；每篇都已在 site/papers/ 备好 PDF。',
      items:[
        { n:1, t:'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks', ax:'2005.11401', y:'2020-05', v:'NeurIPS 2020', c:16334, h:'2h', pdf:true,
          intro:'检索增强生成的奠基论文：把「先检索再生成」形式化为端到端可训练框架（DPR + BART）。它定义了此后五年所有 RAG 工作的对话语言。',
          why:'整条技术线的起点；写 related work 必引。读它理解「参数化知识 vs 非参数化知识」的边界——你之后所有记忆/检索工作都在这个框架里定位。' },
        { n:2, t:'Generative Agents: Interactive Simulacra of Human Behavior', ax:'2304.03442', y:'2023-04', v:'UIST 2023', c:4898, h:'3h', pdf:true,
          intro:'25 个 Agent 的小镇模拟。提出 memory stream + 三因子检索（recency/importance/relevance）+ reflection 树——Agent 记忆系统的原型，所有后续记忆论文都在与它对话。',
          why:'reflection 就是记忆压缩的雏形；检索三因子是你在设计记忆评测协议时必须对照的基线组合。' },
        { n:3, t:'MemGPT: Towards LLMs as Operating Systems', ax:'2310.08560', y:'2023-10', v:'arXiv（后演化为 Letta）', c:989, h:'2h', pdf:true,
          intro:'借操作系统的虚拟内存思想做 LLM 记忆分页：主上下文放不下就换页到外部存储，由 Agent 自己管理中断与调度。产品化为 Letta。',
          why:'记忆管理的系统视角。也是你要避开的重工程方向典型——它证明「做一个记忆 OS」是工程深坑，评测科学才是你的切口。' },
        { n:4, t:'A Survey on the Memory Mechanism of LLM-based Agents', ax:'2404.13501', y:'2024-04', v:'ACM TOIS', c:664, h:'3h', pdf:true,
          intro:'首篇 Agent 记忆专门综述，提出 source/form/operation 三维分类，把散落的记忆工作装进一个坐标系。',
          why:'术语体系一次建立好，后面读任何方法论文都会快。你论文的记忆评测协议要引用它的分类框架。' },
        { n:5, t:'A-MEM: Agentic Memory for LLM Agents', ax:'2502.12110', y:'2025-02', v:'NeurIPS 2025', c:772, h:'4h', pdf:true, warn:true,
          intro:'Zettelkasten 式记忆：笔记自主生成链接并持续演化（agentic memory construction）。记忆「活组织」路线的代表。',
          why:'与记忆线撞得最厉害的一篇。必须精读到能说出它的演化触发条件，并想清你的方向与它的差异在哪里。' },
        { n:6, t:'Zep: A Temporal Knowledge Graph Architecture for Agent Memory', ax:'2501.13956', y:'2025-01', v:'arXiv（Zep 公司）', c:263, h:'3h', pdf:true, warn:true,
          intro:'Graphiti 引擎：三层时序知识图（实体/社区/语义边）承载 Agent 记忆，强调有效时间与失效处理。工业界图记忆的代表。',
          why:'它已经做了社区层——读懂它社区层的粗糙之处，就是图方向（切口 D）的缝隙所在。' },
        { n:7, t:'Mem0: Building Production-Ready AI Agents with Scalable Long-Term Memory', ax:'2504.19413', y:'2025-04', v:'ECAI 2025', c:492, h:'2h', pdf:true,
          intro:'工业界最主流的记忆库：抽取-更新两阶段管线 + 向量/图混合存储，LOCOMO 数字被反复引用。',
          why:'你所有记忆实验的默认对比对象。它的评测口径问题（被后续横评质疑）本身就是切口 C 的素材。' },
        { n:8, t:'From Local to Global: A Graph RAG Approach to Query-Focused Summarization', ax:'2404.16130', y:'2024-04', v:'微软研究院技术报告', c:1815, h:'4h', pdf:true,
          intro:'微软 GraphRAG：用 Leiden 把语料图聚成社区、逐层摘要，查询时按社区粒度召回。层级摘要式检索的代表。',
          why:'导师技术栈的直接接口——精读它的社区层级构建，Leiden 就是切口 D 要替换的那一行。' },
        { n:9, t:'LightRAG: Simple and Fast Retrieval-Augmented Generation', ax:'2410.05779', y:'2024-10', v:'EMNLP 2025', c:386, h:'3h', pdf:true,
          intro:'HKUDS 出品的最简 GraphRAG：双层检索（实体级+主题级），Docker 一键跑通。最易复现的图 baseline。',
          why:'第一份 baseline 数字最可能来自它；也是切口 D 做替换实验的宿主系统。' },
        { n:10, t:'Evaluating Very Long-Term Conversational Memory (LoCoMo)', ax:'2402.17753', y:'2024-02', v:'ACL 2024', c:664, h:'3h', pdf:true,
          intro:'50 段平均 300 轮的超长对话记忆基准，事实上的行业标准——Mem0/A-MEM/Zep 全在上面比过。',
          why:'读懂它的 QA 类型划分（单跳/时序/多跳/开放域），你的记忆评测协议才有对话对象。数字互相矛盾的乱象也是切口 C 的直接动机。' },
        { n:11, t:'Why Do Multi-Agent LLM Systems Fail? (MAST)', ax:'2503.13657', y:'2025-03', v:'NeurIPS 2025', c:474, h:'3h', pdf:true,
          intro:'对多 Agent 系统的系统性失败分析：标注 14 类失败模式（含信息共享失败、验证不足），给出标注协议与分布。',
          why:'失败分类学的范本——你的假成功类型学在方法论上是它的近亲；方向 B 的失败归因直接引用它。' },
        { n:12, t:'From Confident Closing to Silent Failure: Characterizing False Success in LLM Agents', ax:'2606.09863', y:'2026-06', v:'FAGEN @ ICML 2026', h:'3h', pdf:true, warn:true,
          intro:'「假成功」的命名性论文：系统刻画 Agent 宣称完成但实际未达成的现象，给出初步分类。',
          why:'你的首篇直接对手：它做刻画，你做可复算基准 + 分层检测器 + 误报分析。必须精读并划清差异点。' },
        { n:13, t:'Are we really making much progress? Revisiting HGNNs (HGB)', ax:'2112.14936', y:'2021', v:'KDD 2021', c:481, h:'2h', pdf:true,
          intro:'泼冷水式评测的经典：同口径重测大量异构图神经网络，发现大量「提升」来自不公平比较与调参空间。',
          why:'你所有实证/评测型论文的写作模板——负结果与边界刻画怎么写成一篇有影响力的论文，看它。' }
      ]
    },
    tracks: {
      A: {
        name:'方向 A · Agent 假成功的类型学、基准与检测',
        pitch:'主线与首篇。把「宣称成功」与「实际成功」拆开，做可复算的基准和三层检测器。资产：Atlas + AgentParliament + minibank-trap。',
        fit:'导师接口：实验严谨性与论文写作他能实质把关；评测岗位（腾讯评测 15.5%）的对口线。',
        stages:[
          { k:'第 1—2 月', v:'假成功类型学：真实轨迹 + 故障注入双源采样，标注协议 v1 与仲裁规则' },
          { k:'第 3 月', v:'基准构建：minibank-trap 扩展为任务分层、gold 状态、检测器统一接口的公开协议' },
          { k:'第 4—5 月', v:'检测器与对比：声明/证据/状态三层检测器 vs LLM-as-Judge / 退出码 / Schema 检查，接入 reliability@k' },
          { k:'第 6 月起', v:'论文与投稿：NeurIPS D&B / ICSE-FSE NIER / FAGEN 类 workshop；复现包与脱敏评测集' }
        ],
        papers:[
          { t:'Cognitive Architectures for Language Agents (CoALA)', ax:'2309.02427', y:'2023-09', v:'TMLR', c:449, h:'3h', why:'把 Agent 拆成记忆/动作空间/决策循环的总框架——假成功的「哪一层失败」用它的坐标系说话' },
          { t:'From Agent Traces to Trust: A Survey of Evidence Tracing and Execution Provenance in LLM Agents', ax:'2606.04990', y:'2026-06', v:'arXiv（综述）', h:'4h', pdf:true, why:'证据追踪/执行溯源综述——你的「证据层验证」理论地图，related work 骨架', key:true },
          { t:'Beyond Pass@k: Measuring Reliability and Security of Agentic Code Generation', ax:'2608.14711', y:'2026-08', v:'arXiv', h:'2h', pdf:true, why:'reliability@k 协议：单次 pass@k 不可信。你的评测协议直接借用', key:true },
          { t:'Reason Less, Verify More: Deterministic Gates Recover a Silent Policy-Violation Failure Mode in Tool-Using LLM Agents', ax:'2607.07405', y:'2026-07', v:'arXiv', h:'2h', pdf:true, why:'确定性检查门能兜住 LLM 漏掉的静默违约——与 Atlas 哈希断言同构，方法层的同盟证据' },
          { t:'Agent Safety Should Be a Runtime Contract', ax:'2608.11274', y:'2026-08', v:'arXiv', h:'2h', pdf:true, why:'把成功/安全约束从 prompt 挪到运行时的合同视角——检测器设计的需求来源' },
          { t:'Noise Floor Audit for Agent Benchmarks', ax:'2608.22331', y:'2026-08', v:'arXiv', h:'2h', pdf:true, why:'基准扰动方差（噪声地板）：自建 benchmark 前必控的变量，否则检出率差异不可信' },
          { t:'When Errors Become Narratives: A Longitudinal Taxonomy of Silent Failures in a Production LLM Agent Runtime', ax:'2606.14589', y:'2026-06', v:'arXiv', h:'2h', pdf:true, why:'生产运行时的静默失败纵向分类——类型学的工业界对照样本' },
          { t:'REFLECT: Intervention-Supported Error Attribution for Silent Failures in LLM Agent Traces', ax:'2606.09071', y:'2026-06', v:'arXiv', h:'2h', pdf:true, why:'带干预验证的错误归因——「检测之后如何归因」的直接参照' }
        ],
        repos:[ { r:'Ctrl1CandV/Atlas', note:'假成功检测 + 哈希断言 + JSONL 台账，全部实验的宿主' }, { r:'Ctrl1CandV/AgentParliament', note:'交叉审查工具与权限分层，多 Agent 错误共识样本的来源' } ],
        datasets:[ { n:'minibank-trap（自有）', d:'6 代码缺陷 + 5 设计漏洞 + 2 规则违规，gold 私有防泄漏，待补脱敏公开版' }, { n:'τ-bench / τ²-bench', d:'工具调用 + 静默策略违约（2607.07405）' }, { n:'Atlas 生产轨迹', d:'自带台账：逐节点 I/O、token、费用、失败链' } ],
        note:'首篇默认沿本方向推进：90 天计划的 W5—W12 就是本方向的展开。'
      },
      B: {
        name:'方向 B · 异质多模型交叉审查的有效边界与失败归因',
        pitch:'用 AgentParliament 的受控实验回答「独立审查何时值得」：增益、成本与失败归因。第二/三篇候选。',
        fit:'导师接口：实验设计他能把关；岗位接口：多 Agent 协作与评测岗。',
        stages:[
          { k:'第 1 月', v:'受控对比矩阵设计：独立审查（权限分层）vs 共享辩论 vs 单审，固定任务与预算' },
          { k:'第 2—3 月', v:'埋雷集扩充与执行：minibank-trap 复用 + 新增设计类缺陷，跑全部配置' },
          { k:'第 4—5 月', v:'增益量化与失败归因：召回/误报/成本 + 错误共识的形成链分析（MAST 框架）' },
          { k:'第 6 月起', v:'论文：ESWA / KBS / ICSE-FSE 实证线；负结果按 HGB 模板写' }
        ],
        papers:[
          /* tier 约定（LEARNING-IA-DESIGN.md §7/§8）：缺省 = 主路径；'extend' = 延伸（L2 折叠，不进 90 天主路径）。
             B：主路径 6（全部有本地 PDF）+ 延伸 6。 */
          { t:'The Interaction Tax: When Communication Erases Diversity in Multi-Agent Teams', ax:'2608.23541', y:'2026-08', v:'ICML 2026 (PMLR 306)', h:'3h', pdf:true, why:'通信会抹除多样性——你的核心假设的量化对手，实验设计必须回应它', key:true },
          { t:'The Collaboration Tax: How Much LLM Multi-Agent Systems Pay to Coordinate', ax:'2608.22152', y:'2026-08', v:'arXiv', h:'2h', pdf:true, why:'协调成本量化：成本侧的证据与指标来源' },
          { t:'OrchestraBench: Evaluating Multi-Agent Orchestration Failure Modes, Recovery, and Decomposition Quality', ax:'2608.05263', y:'2026-08', v:'arXiv', h:'2h', pdf:true, why:'编排失败模式与恢复评测——实验任务与指标的现成参照' },
          { t:'AutoGen: Multi-Agent Conversation', ax:'2308.08155', y:'2023', v:'COLM 2024', c:2178, h:'2h', pdf:true, why:'最主流 MAS 框架——共享辩论基线的实现载体' },
          { t:'Language Agents as Optimizable Graphs (GPTSwarm)', ax:'2402.16823', y:'2024', v:'ICML 2024', h:'3h', pdf:true, why:'把 Agent 系统建模为可优化图——审查拓扑消融的方法论范本' },
          { t:'G-Designer: Multi-agent Communication Topologies via GNNs', ax:'2410.11782', y:'2024', v:'ICML 2025', c:88, h:'2h', pdf:true, why:'用 VGAE 生成通信拓扑——导师方法能直接读懂的一篇，衔接点' },
          { t:'Multi-Agent Debate Strategies: Survey, Taxonomy, and Challenges', ax:'2607.26212', y:'2026-07', v:'arXiv（投 ACM CSUR）', h:'3h', tier:'extend', why:'MAD 策略分类综述，related work 的组织骨架' },
          { t:'Beyond Individual Intelligence: Surveying Collaboration, Failure Attribution, and Self-Evolution in LLM-based Multi-Agent Systems', ax:'2605.14892', y:'2026-05', v:'arXiv（LIFE 综述）', h:'3h', tier:'extend', why:'协作/归因/自演化的统一框架，失败归因部分的对话对象' },
          { t:'Agent Workflow Memory', ax:'2409.07429', y:'2024-09', v:'ICML 2025', c:207, h:'2h', tier:'extend', why:'从历史轨迹归纳可复用 workflow——「经验应该共享还是私有」的参照' },
          { t:'CAMEL: Communicative Agents for Mind Exploration', ax:'2303.17760', y:'2023', v:'NeurIPS 2023', c:1654, h:'2h', tier:'extend', why:'角色扮演式协作起点，审查角色设计的思想来源' },
          { t:'MetaGPT: Meta Programming for Multi-Agent Collaborative Framework', ax:'2308.00352', y:'2023', v:'ICLR 2024', c:2177, h:'2h', tier:'extend', why:'SOP 编码进 Agent 分工——权限分层的工业界对应物' },
          { t:'LEGOMem: Modular Procedural Memory for Multi-agent LLM Systems', ax:'2510.04851', y:'2025', v:'会议论文集', c:29, h:'2h', tier:'extend', why:'多 Agent 程序性记忆分配——「经验给谁用」的对照' }
        ],
        repos:[ { r:'Ctrl1CandV/AgentParliament', note:'实验宿主：10 工具、三级权限、角色链 profiles' }, { r:'microsoft/autogen', note:'共享辩论基线实现' } ],
        datasets:[ { n:'minibank-trap（自有）', d:'缺陷召回的 gold 集' }, { n:'OrchestraBench', d:'编排失败模式任务' } ],
        note:'依赖方向 A 建好的评测协议与台账——排在 A 之后启动可省一个月基建。'
      },
      C: {
        name:'方向 C · Agent 记忆后端的评测科学',
        pitch:'统一协议下横评记忆后端（含图记忆），画出「记忆何时值得用」的边界。与导师方法衔接的最短路径。',
        fit:'导师接口：图记忆是被评测对象之一，他能深度参与设计；岗位接口：Memory 7.2% + 评测 12.3%。',
        stages:[
          { k:'第 1 月', v:'统一评测协议：成本/精度/延迟三轴 × 检索/更新/冲突/遗忘四能力' },
          { k:'第 2—4 月', v:'后端矩阵受控横评：平铺 / 层级 / 向量 / 图记忆（导师参与图方案设计）同口径跑 LoCoMo+LongMemEval' },
          { k:'第 5 月', v:'边界实验：过期信息污染、检索噪声、冲突注入——记忆何时有害' },
          { k:'第 6 月起', v:'论文：KBS / ESWA / Neurocomputing 或 NeurIPS D&B' }
        ],
        papers:[
          /* C：主路径 5 + 延伸 4。Oblivion（2604.00131）已从本方向删除——一篇只归一处，
             它的家在方向 F（压缩/衰减基线）；对照关系写在本方向 note 里。 */
          { t:'LongMemEval: Benchmarking Chat Assistants on Long-Term Interactive Memory', ax:'2410.10813', y:'2024-10', v:'ICLR 2025', c:450, h:'3h', pdf:true, why:'500 问、五类记忆能力细分——协议的能力维度直接借它的划分', key:true },
          { t:'MemoryAgentBench: Evaluating Memory via Incremental Multi-Turn Interactions', ax:'2507.05257', y:'2025-07', v:'arXiv', c:156, h:'2h', pdf:true, why:'四维能力含「冲突消解」——你边界实验的现成维度', key:true },
          { t:'Harness the Memory: A Holistic Evaluation of Memory Substrates in Memory Agents', ax:'2608.15008', y:'2026-08', v:'arXiv', h:'3h', pdf:true, why:'「没有单一存储始终最优」——你的直接前作，协议设计必须站在它肩上', key:true },
          { t:'MemoryLake on MemoryArena: A Matched Study of Agent Memory Backends', ax:'2608.13883', y:'2026-08', v:'arXiv', h:'2h', pdf:true, why:'配对研究（matched study）的实验设计范式——同口径对比的模板' },
          { t:'From Storage to Experience: A Survey on the Evolution of LLM Agent Memory', ax:'2605.06716', y:'2026-05', v:'ACL 2026 Findings', c:10, h:'3h', why:'2026 年的最新全局图景与 open problems' },
          { t:'Memory OS of AI Agent (MemoryOS)', ax:'2506.06326', y:'2025-05', v:'EMNLP 2025', c:92, h:'2h', tier:'extend', why:'三级存储+页面调度——层级记忆的被评测代表，国内同类' },
          { t:'MIRIX: Multi-Agent Memory System for LLM-Based Agents', ax:'2507.07957', y:'2025-07', v:'arXiv', c:135, h:'2h', tier:'extend', why:'六类记忆模块分工——「记忆分类法」的工业版' },
          { t:'MemoryBank: Enhancing LLMs with Long-Term Memory', ax:'2305.10250', y:'2023-05', v:'AAAI 2024', c:569, h:'2h', tier:'extend', why:'艾宾浩斯遗忘曲线做更新——遗忘策略谱系的起点' },
          { t:'General Agentic Memory Via Deep Research', ax:'2511.18423', y:'2025-11', v:'arXiv', c:31, h:'2h', tier:'extend', why:'反方观点：放弃预构建索引——「记忆是否需要组织」的对立面' }
        ],
        repos:[ { r:'mem0ai/mem0', note:'被评测后端之一' }, { r:'getzep/graphiti', note:'图记忆后端（需 Neo4j/FalkorDB）' }, { r:'letta-ai/letta', note:'MemGPT 系后端' } ],
        datasets:[ { n:'LoCoMo（公共层第 10 篇）', d:'对话记忆主基准' }, { n:'LongMemEval / MemoryAgentBench', d:'能力细分与冲突维度' } ],
        note:'若导师希望课题更贴他技术栈，本方向可与 D/F 合并前置——图记忆从「被评测对象」升级为「被设计的方案」。遗忘/衰减策略对照见方向 F 的 Oblivion（2604.00131）。'
      },
      D: {
        name:'方向 D · 图结构化记忆：异构属性记忆图的社区发现与分层压缩',
        pitch:'导师锚定线：把他的属性图聚类与多嵌入融合迁移到记忆图，替换 GraphRAG/Zep 里的经典算法。',
        fit:'导师接口最强（他能给实质修改意见）；求职叙事弱（GraphRAG 零 JD 命中）——对外表述走 Memory/Knowledge Graph。',
        stages:[
          { k:'第 1 月', v:'图侧地基：在 Cora/Citeseer 复现 DMoN、SDCN，确认 NMI/ARI 能对上论文数字' },
          { k:'第 2 月', v:'记忆图构建：把 LightRAG/Graphiti 产出的记忆图导出为 PyG 异构图，统计特征报告' },
          { k:'第 3—4 月', v:'方法实现与双轨实验：HAN 式融合 + DMoN 式划分；图聚类指标 + 端到端记忆指标' },
          { k:'第 5—6 月', v:'论文：KBS / ESWA / Neurocomputing（导师主场），冲一冲 TOIS' }
        ],
        papers:[
          /* D：前置 3（tier:'prereq'，选本方向才要求）+ 主列表 8 + 延伸 7。
             HAN 是方法主干，进主列表不进前置；粗化 2106.05150 的家在这里，方向 F 只引用不复制。 */
          { t:'Semi-Supervised Classification with Graph Convolutional Networks (GCN)', ax:'1609.02907', y:'2016', v:'ICLR 2017', c:36222, h:'2h', pdf:true, tier:'prereq', why:'导师所有论文的地基，必须能徒手推导' },
          { t:'Graph Attention Networks (GAT)', ax:'1710.10903', y:'2017', v:'ICLR 2018', c:27410, h:'2h', pdf:true, tier:'prereq', why:'导师偏爱注意力机制' },
          { t:'Inductive Representation Learning on Large Graphs (GraphSAGE)', ax:'1706.02216', y:'2017', v:'NeurIPS 2017', c:20487, h:'2h', pdf:true, tier:'prereq', why:'邻居采样 → 你的子图采样' },
          { t:'Heterogeneous Graph Attention Network (HAN)', ax:'1903.07293', y:'2019', v:'WWW 2019', c:3260, h:'3h', pdf:true, why:'元路径+双注意力——记忆图主干的首选', key:true },
          { t:'Structural Deep Clustering Network (SDCN)', ax:'2002.01633', y:'2020', v:'WWW 2020', c:686, h:'3h', pdf:true, why:'AE+GCN 双流融合——导师「多嵌入融合」的思想来源', key:true },
          { t:'Graph Clustering with Graph Neural Networks (DMoN)', ax:'2006.16904', y:'2020', v:'JMLR 24(127) 2023', c:413, h:'3h', pdf:true, why:'可微模块度池化——端到端社区发现的关键武器', key:true },
          { t:'Scaling Up GNNs Via Graph Coarsening', ax:'2106.05150', y:'2021', v:'KDD 2021', c:144, h:'3h', pdf:true, why:'图粗化——分层压缩的理论地基（也是方向 F 的核心）', key:true },
          { t:'Graph Retrieval-Augmented Generation: A Survey', ax:'2408.08921', y:'2024-08', v:'ACM TOIS', c:500, h:'3h', pdf:true, why:'GraphRAG 首篇综述，G-Indexing/G-Retrieval/G-Generation 三段框架——D 的检索分类框架就用它' },
          { t:'AriGraph: KG World Models with Episodic Memory for LLM Agents', ax:'2407.04363', y:'2024-07', v:'IJCAI 2025', c:92, h:'3h', pdf:true, why:'语义+情节记忆融合的世界模型图，异构记忆图直接前身，代码开源' },
          { t:'HippoRAG: Neurobiologically Inspired Long-Term Memory for LLMs', ax:'2405.14831', y:'2024-05', v:'NeurIPS 2024', c:284, h:'3h', pdf:true, why:'PPR 在开放 KG 上模拟海马索引——能立刻上手的图算法范式' },
          { t:'Memory is Reconstructed, Not Retrieved: Graph Memory for LLM Agents', ax:'2606.06036', y:'2026-06', v:'ICML 2026', c:2, h:'3h', pdf:true, warn:true, why:'2026 最新且撞方向，必读' },
          { t:'Heterogeneous Graph Transformer (HGT)', ax:'2003.01332', y:'2020', v:'WWW 2020', c:1697, h:'3h', tier:'extend', why:'元关系参数化注意力，免手工元路径' },
          { t:'Attributed Graph Clustering: Deep Attentional Embedding (DAEGC)', ax:'1906.06532', y:'2019', v:'IJCAI 2019', c:646, h:'3h', tier:'extend', why:'属性图聚类奠基，导师 ASOC 2024 的同族' },
          { t:'A Comprehensive Survey on Community Detection with Deep Learning', ax:'2105.12584', y:'2021', v:'IEEE TNNLS', c:456, h:'3h', tier:'extend', why:'导师方向的地图' },
          { t:'HiRAG: RAG with Hierarchical Knowledge', ax:'2503.10150', y:'2025', v:'EMNLP 2025 Findings', c:40, h:'2h', tier:'extend', why:'层级知识检索，与分层记忆重叠——划界用' },
          { t:'From Experience to Strategy: Trainable Graph Memory', ax:'2511.07800', y:'2025-11', v:'arXiv', c:10, h:'2h', tier:'extend', warn:true, why:'「可训练图记忆」已被占——读它划清边界' },
          { t:'From RAG to Memory: Non-Parametric Continual Learning for LLMs (HippoRAG 2)', ax:'2502.14802', y:'2025-02', v:'ICML 2025', c:181, h:'3h', pdf:true, tier:'extend', why:'段落+概念混合图，明确把 RAG 重定义为 memory 问题' },
          { t:'G-Retriever: RAG for Textual Graph Understanding and QA', ax:'2402.07630', y:'2024-02', v:'NeurIPS 2024', c:321, h:'3h', pdf:true, tier:'extend', why:'子图检索形式化为带奖赏斯坦纳树——子图召回的出发点' }
        ],
        repos:[ { r:'gusye1234/nano-graphrag', note:'千行教学级实现，定位「社区划分在哪一行」' }, { r:'HKUDS/LightRAG', note:'一键 baseline 宿主' }, { r:'microsoft/graphrag', note:'官方实现（索引烧钱，勿先碰）', warn:true } ],
        datasets:[ { n:'Cora / Citeseer / PubMed', d:'图聚类标配（PyG Planetoid）' }, { n:'DBLP / ACM / IMDB 异构图', d:'方法先在这验证（PyG/HGB）' }, { n:'LoCoMo / LongMemEval', d:'端到端记忆指标（公共层）' } ],
        note:'与 C/F 同族：D 出方法、F 出压缩曲线、C 出统一评测——三条可组合成导师线的完整故事。'
      },
      E: {
        name:'方向 E · 代码智能体评测的质量审计',
        pitch:'审计评测地基本身：SWE-bench-Like 数据的错配与污染、难度分桶、测试预言增强。与 A 共享设施与社区。',
        fit:'导师接口：实证方法他可以把关；岗位接口：所有 coding agent 团队（阿里 Qoder/灵码、Kimi Code、字节）都直接对口。',
        stages:[
          { k:'第 1 月', v:'数据质量普查：PR-Issue 错配、测试缺陷、污染样本的检测工具与协议' },
          { k:'第 2—3 月', v:'难度分桶与可靠性：按复杂度/改动规模/覆盖度分桶重算通过率，接入 reliability@k' },
          { k:'第 4—5 月', v:'测试预言增强：用执行轨迹判别「测试过了但没修好」的静默失败' },
          { k:'第 6 月起', v:'论文：ICSE / FSE / ASE（empirical study / NIER）或 NeurIPS D&B' }
        ],
        papers:[
          { t:'SWE-bench: Can Language Models Resolve Real-World GitHub Issues?', ax:'2310.06770', y:'2023-10', v:'ICLR 2024', h:'3h', pdf:true, why:'代码智能体基准的源头——你要审计的对象本体', key:true },
          { t:'PAIChecker: Uncovering and Checking PR-Issue Misalignment in SWE-Bench-Like Benchmarks', ax:'2607.28587', y:'2026-07', v:'arXiv', h:'2h', pdf:true, why:'Verified 集 13.6% 错配——「基准要被评测」的直接证据与起点', key:true },
          { t:'SWE-Doctor: Guiding Software Engineering Agents with Runtime Diagnosis from Multi-Faceted Bug Reproduction Tests', ax:'2607.00990', y:'2026-07', v:'arXiv', h:'2h', why:'运行时诊断辅助 SWE Agent——测试预言增强的相邻工作' },
          { t:'Open-SWE-Traces: Advancing Dual-Mode Multilingual Distillation for Software Engineering Agents', ax:'2606.16038', y:'2026-06', v:'arXiv', h:'2h', why:'20 万级真实轨迹——审计与分桶的数据来源候选' },
          { t:'Break It Down, Pass It On: Cross-Task Skill Transfer in LLM Agents', ax:'2608.20274', y:'2026-08', v:'arXiv', h:'2h', why:'技能跨任务迁移的受控研究——「什么在什么条件下可信」的实证模板' }
        ],
        repos:[ { r:'princeton-nlp/SWE-bench', note:'审计对象与实验宿主（Docker harness）' } ],
        datasets:[ { n:'SWE-bench / Verified', d:'主审计对象；注意 PAIChecker 发现的错配' }, { n:'Open-SWE-Traces', d:'大规模真实轨迹' } ],
        note:'与方向 A 的关系：共享埋雷思路、reliability@k 协议与 ICSE/FSE 社区；A 查「单次运行可信吗」，E 查「基准本身可信吗」。'
      },
      F: {
        name:'方向 F · 预算约束下的记忆压缩：压缩率-性能帕累托前沿',
        pitch:'回答「给定 token 预算，记忆该怎么组织」：图粗化形式化 + 帕累托曲线。成本最低的导师锚定线。',
        fit:'导师接口：图粗化/社区发现正中其方法库；产出曲线对岗位叙事（成本优化）也友好。',
        stages:[
          { k:'第 1 月', v:'形式化：记忆压缩 = 保持检索效用的图粗化，定义粗化准则与误差界' },
          { k:'第 2—3 月', v:'实现与预算扫描：LoCoMo 按预算逐层粗化，画压缩率-准确率帕累托前沿' },
          { k:'第 4 月', v:'基线对比：full-context、随机丢弃、衰减式（Oblivion）、RAPTOR、SeCom 粒度' },
          { k:'第 5—6 月', v:'论文：Neurocomputing / Applied Soft Computing（导师主场）' }
        ],
        papers:[
          { t:'RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval', ax:'2401.18059', y:'2024-01', v:'ICLR 2024', c:589, h:'3h', pdf:true, why:'同样做记忆分层但用 GMM 树——帕累托曲线上的直接对手', key:true },
          { t:'SeCom: On Memory Construction and Retrieval for Personalized Agents', ax:'2502.05589', y:'2025-02', v:'ICLR 2025', c:79, h:'2h', pdf:true, why:'论证记忆最优粒度是「话题段」——粒度轴的依据', key:true },
          { t:'Oblivion: Self-Adaptive Agentic Memory Control through Decay-Driven Activation', ax:'2604.00131', y:'2026-03', v:'arXiv（NEC Labs）', h:'2h', why:'衰减式压缩的 2026 代表——基线之一' },
          { t:'Graph Summarization Methods and Applications: A Survey', ax:'1612.04883', y:'2016', v:'ACM CSUR', c:156, h:'3h', why:'图压缩的理论词汇库，粗化准则设计的弹药库' },
          { t:'NarrativeQA', ax:'1712.07040', y:'2017', v:'TACL', c:null, h:'2h', why:'长文档理解基准——预算扫描的第二评测域' }
        ],
        repos:[ { r:'parthsarthi03/raptor', note:'RAPTOR 参考实现（已停更，作基线足够）' }, { r:'gusye1234/nano-graphrag', note:'社区划分宿主（与 D 共用）' } ],
        datasets:[ { n:'LoCoMo', d:'主评测域（公共层）' }, { n:'NarrativeQA', d:'长文档第二域' }, { n:'UltraDomain', d:'LightRAG 对比必需' } ],
        note:'纯图算法 + 缓存嵌入，API 成本≈0——被抢发或导师要求转向时，它是最低成本的安全垫。'
      }
    }
  },

  // ---------- 已饱和 ----------
  saturated: [
    { t:'"用知识图谱组织 Agent 记忆"这个大框架本身', e:'Zep/Graphiti、A-MEM、AriGraph、GraphRAG、LightRAG、MIRIX 全都做了', j:'单纯"我建了个记忆图"已无新意' },
    { t:'实体-关系抽取式的记忆图构建管线', e:'微软 GraphRAG、LightRAG、Graphiti 三套开源实现', j:'工程细节已被穷尽' },
    { t:'层级摘要式记忆压缩（树形）', e:'RAPTOR 用 GMM+摘要，GraphRAG 用 Leiden+社区摘要，HiRAG 也做了', j:'用"聚类+摘要"当唯一贡献已经不够' },
    { t:'只在 LoCoMo 上刷点', e:'Mem0、A-MEM、Zep、MemoryOS 全在这个榜上，数字互相矛盾', j:'只刷 LoCoMo 很难说服审稿人' },
    { t:'遗忘曲线式记忆衰减', e:'MemoryBank(2023) → Oblivion(2026) 已完整覆盖', j:'饱和' },
    { t:'再做一个通用多 Agent 框架/编排 demo', e:'Interaction Tax 与 Collaboration Tax 已在量化协调开销与收益', j:'红海，且"是否真有增益"存疑' },
    { t:'纯 prompt wrapper / 编排层套壳', e:'调研面经共识：这类项目在 2029 届秋招会被大量同质供给淹没', j:'无学术与求职价值' },
    { t:'Agentic RL 后训练 / 预训练 / GUI 小模型微调', e:'大厂大组与顶级实验室的主场，需要多卡集群', j:'算力上不可行，进去就是陪跑' },
    { t:'再写一篇 Agent 记忆综述', e:'2024 年 2 篇 TOIS + 2025/2026 各 1 篇', j:'轮不到你写' }
  ],

  // ---------- 竞争团队 ----------
  rivals: [
    { n:'FAGEN / 假成功线（2606.09863 作者等）', w:'False Success 刻画（ICML 2026 workshop）', f:'刚起步，窗口正开', note:'首篇直接对手；它做刻画，你做基准+检测器+误报分析', level:'danger' },
    { n:'SWE-bench 评测批判线（PAIChecker、reliability@k 等）', w:'基准质量审计、可靠性协议', f:'高，ICSE/FSE 社区节奏快', note:'方向 E 的同场竞技者，也可能变成合作/延续对象', level:'danger' },
    { n:'记忆评测横评线（Harness the Memory、MemoryArena）', w:'记忆后端横评与配对研究', f:'高（arXiv 检索 21 篇/年）', note:'方向 C 的直接对手；协议设计必须超过它们', level:'warn' },
    { n:'证据溯源线（Traces to Trust 综述及后继）', w:'execution provenance、审计', f:'中，26 篇/年', note:'理论地图提供方；「链式证据组织」可与之衔接', level:'warn' },
    { n:'HKU Data Intelligence Lab (HKUDS, Chao Huang)', w:'LightRAG + 大量 GraphRAG 变体', f:'极高，几乎月更', note:'方向 C/D/F（记忆线）最需盯的团队', level:'warn' },
    { n:'Rutgers AGI Research (Yongfeng Zhang)', w:'A-MEM, AIOS', f:'高', note:'Agent 记忆的主要产出方', level:'warn' },
    { n:'OSU NLP Group (Yu Su)', w:'HippoRAG 1 & 2', f:'高，NeurIPS/ICML 级', note:'神经科学叙事+图算法，记忆线正面竞争难', level:'warn' },
    { n:'Zep AI / Mem0（公司）', w:'Graphiti、Mem0', f:'中', note:'工业界，评测口径偏向自家；是方向 C 的被评测对象', level:'ok' },
    { n:'BAI-LAB（北邮）', w:'MemoryOS', f:'中', note:'国内同类，可参考投稿路径', level:'ok' }
  ],
  rivalJudgement:'新主线的差异化不靠「更大更全的系统」，而靠<b>你已有的测量基础设施</b>：Atlas 的假成功检测/哈希断言/成本台账和 AgentParliament 的三级权限交叉审查，是评测型对手普遍没有的工程底座。单卡+新手在速度上拼不过 HKUDS，但在「可复算的基准 + 诚实的负结果」上可以拼——这正是评测实证类论文的评审标准。',

  metrics: [
    { g:'效果', items:['F1 / EM / Accuracy','Recall@k, MRR, nDCG','多跳准确率（按 hop 分层）','LLM-as-Judge 四维胜率'] },
    { g:'验证与可信（主线）', items:['假成功检出率（按类型学分列）','误报率（把真成功误判为假）','reliability@k：同一任务 k 次运行的稳定通过率','证据完备性：判定可追溯到具体产物/哈希的比例','审计可复算性：第三方能否从台账独立复现判定'] },
    { g:'成本', items:['Prompt token / 查询','索引阶段总 token 与 LLM 调用次数、费用','协调开销（多 Agent 场景）'] },
    { g:'延迟', items:['端到端检索延迟 P50 / P95 / P99'] },
    { g:'压缩', items:['记忆压缩率 = 压缩后 token / 原始 token','图规模压缩比（节点/边缩减）'] },
    { g:'图质量（C/D/F）', items:['模块度 Q、NMI、ARI、Conductance ← 导师最熟的一组','社区数稳定性、结构漂移度（动态场景）'] },
    { g:'记忆专用（C）', items:['冲突消解正确率（MemoryAgentBench）','时序推理准确率','记忆连贯性 ← 百度 JD 原词'] },
    { g:'鲁棒', items:['记忆投毒下的准确率保持','检索噪声与过期信息下的性能退化 ← 方向 C 的边界实验'] }
  ],

  // ---------- 90 天启动（公共层 + 默认沿方向 A 展开） ----------
  plan90: [
    { w:'W1', ph:1, read:'公共必读 1—4（RAG、Generative Agents、MemGPT、记忆综述）', run:'跑通 Atlas 全量测试（542 项）与一次 dry-run + 真实小图运行；配齐 LLM API 与缓存层', out:'术语对照表；环境可用', stuck:'Atlas 只在 Windows 跑——就在 Windows 上做；API 预算先设上限并启用成本预留' },
    { w:'W2', ph:1, read:'公共必读 12（假成功）+ 方向 A 的 2606.04990、2608.11274', run:'精读 Atlas 的假成功检测代码路径（空输出/截断哨兵/哈希断言/fallback/台账），画出每类故障的拦截点', out:'⭐ Atlas 检测机制笔记 + 六级成功验证清单初稿', stuck:'读不懂先打断点看 STATUS.md 里的失败运行，不要空读' },
    { w:'W3', ph:1, read:'方向 A 的 2608.14711、2607.07405、2606.14589、2606.09071', run:'minibank-trap 受控重跑：固定模型/温度/prompt 版本，3 次重复，记录成本与方差', out:'第一份带配置与重复次数的评测记录（替代 n=1）', stuck:'方差大先查非确定性来源（温度、工具时序），再谈结论' },
    { w:'W4', ph:1, read:'公共必读 5—10（A-MEM、Zep、Mem0、GraphRAG、LightRAG、LoCoMo）+ 2605.06716', run:'从真实轨迹 + 故障注入收集假成功样本各 20+，按八类初步标注', out:'⭐ 文献综述初稿 3000 字 + 第一次组会汇报 PPT', mile:'能对导师讲清「假成功是什么、我已有什么设施、第一篇论文的基准+检测器计划」', stuck:'类型学拿不准就两轮标注：先粗后细，让样本逼出类别' },
    { w:'W5', ph:2, read:'补读方向 A 相邻工作（2606.09863 引用链）', run:'标注协议 v1：类型学定义、边界案例仲裁规则、标注者一致性方案', out:'标注协议 v1 + 假成功类型学一页纸', stuck:'类别互相重叠就按「首因」归类，并在协议里写明优先级' },
    { w:'W6', ph:2, read:'方向 A 的 2608.22331（噪声地板）+ 公共必读 13（HGB）', run:'基准任务集设计：难度分层、gold 状态定义、检测器统一接口（把 Atlas 检测器注册为 baseline 之一）', out:'⭐ 基准设计文档 + 检测器接口草案', stuck:'任务集别贪大：先 30—50 个可精确判定的任务，质量优先于规模' },
    { w:'W7', ph:2, read:'2606.09863 精读第二遍（虚拟复现）', run:'实现检测器 v1：声明层（输出结构）、证据层（产物哈希与引用）、状态层（环境断言）三层解耦', out:'检测器 v1 能在自建任务上出数（哪怕不如 baseline）', stuck:'先用退化设定验证正确性：关掉你的层应精确等于 baseline，不等就是 bug' },
    { w:'W8', ph:2, read:'方向 B 预备阅读（2608.23541、2607.26212）', run:'跑齐对比：LLM-as-Judge、退出码、Schema 检查、Atlas 内置检测 × 2 个任务域', out:'⭐ 切口定稿一页纸 + baseline 对比表（论文表 1 雏形）+ 第二次组会', mile:'切口确定、协议可用、对比表成型。W8 还没定就找导师砍需求——90 天最关键检查点', stuck:'检出率不占优就换角度：不比检出率，比「同等检出率下的误报率/成本」' },
    { w:'W9', ph:3, read:'方向 E 预备阅读（2310.06770、2607.28587）', run:'消融：去掉每一层验证的贡献；误报分析：所有误报逐条归因', out:'消融表 + 误报案例集', stuck:'提升不显著就把贡献重写为「协议 + 现象发现」，HGB 是模板' },
    { w:'W10', ph:3, read:'目标 venue（NeurIPS D&B / FSE）近一年同类论文 3 篇', run:'reliability@k 协议接入 + 数据泄漏检查 + minibank-trap 脱敏公开版', out:'完整实验结果集 + 3—4 张图 + 可公开的评测子集', stuck:'实验做不完就明确标注"进行中"，优先保证主表完整，不伪造' },
    { w:'W11', ph:3, read:'目标 venue 的复现清单要求（D&B 的 artifact 条款）', run:'复跑关键实验（固定种子、3 次均值方差）；把台账导出为论文附录', out:'可复现包：代码 + 配置 + 台账样例 + README', stuck:'复现包整理至少留一周，审稿人会真的跑' },
    { w:'W12', ph:3, read:'—', run:'定稿 20 页汇报材料：问题定义、类型学、基准、主表、消融、下一步', out:'⭐ 20 页汇报材料 + 投稿目标与时间表', mile:'能完整讲清「假成功为什么重要、我的基准和检测器是什么、数字如何、还差什么」' }
  ],
  plan90Switch:'以上 12 周默认沿<b>方向 A</b> 展开。若首篇改选其他方向：<b>W1—W4 公共层不动</b>（术语、环境、综述初稿对任何方向都成立）；W5 起改按该方向卡里的「阶段路线」执行，W8 检查点与 W12 汇报节奏不变。',
  fallback: [
    { s:'API 预算烧光', a:'Atlas 的成本预留先设为硬上限；抽取与轨迹生成结果全部缓存，之后所有检测器实验复用同一批轨迹（不花钱）' },
    { s:'检出率不比 LLM-as-Judge 好', a:'转向边界与成本：同等召回下的误报率、每条判定的可追溯性、token 成本——这些是确定性检查的天然优势' },
    { s:'三周没进展', a:'降级目标：从「提出检测器」降到「系统性测量 + 现象发现」（假成功在真实轨迹中的分布与类型占比）。实证分析在 ICSE/FSE/ASE 也能发' },
    { s:'被抢先发表', a:'检查差异点，转向相邻 gap：类型学 → 基准 → 检测 → 归因 → 审计，子问题可轮换；这也是准备 6 个方向的原因' },
    { s:'导师不熟评测/验证概念', a:'用「术语翻译表」把问题重述为他熟悉的语言（验证≈实验充分性，台账≈可追溯实验记录）；汇报前 6 页用他熟悉的叙事' },
    { s:'minibank-trap 私有集被质疑', a:'按 W10 计划补脱敏公开子集 + 公开协议；在被质疑前主动放进复现包' }
  ],

  // ---------- 沟通 ----------
  translate: [
    ['Agent 假成功检测', '一套「实验是否真正成立」的判定协议——和您审稿时检查实验充分性是同一件事的系统化'],
    ['证据层验证 / 执行溯源', '把每次实验的输入、中间产物、输出用哈希链固化，判定可回溯到具体证据'],
    ['记忆评测（切口 C）', '对「记忆组织方式」做受控对比实验——图结构记忆是被评测对象之一'],
    ['实体/事件/工具调用三类节点', '<b>异构图</b>，三种节点类型，多种边类型，元路径可定义'],
    ['记忆分层与压缩', '<b>图聚类 / 社区发现 + 图粗化</b>，社区即记忆的语义簇'],
    ['记忆检索', '<b>子图召回</b>，等价于给定查询节点做邻域或斯坦纳树抽取'],
    ['记忆遗忘', '<b>边权时间衰减 + 图稀疏化</b>'],
    ['GraphRAG 的社区摘要', '用 Leiden 做社区发现后对每个社区做文本摘要 —— <b>这里的 Leiden 就是可以被您的方法替换的地方</b>'],
    ['token 成本', '检索子图的规模约束，等价于<b>图压缩比</b>'],
    ['LLM', '特征抽取器 + 最终的读出（readout）函数，中间的图学习部分完全是我们的战场']
  ],
  pitch:'老师，我的论文主线想解决 Agent 系统的可信性问题：它们经常「宣称完成」但证据不成立——这和您审稿时检查一篇论文的实验是否真正成立，本质是同一类判断，我想把它做成可复算的基准和自动检测方法。我已经为此写了两个开源工具（一个多模型工作流引擎带假成功检测和产物哈希断言，一个多模型交叉审查服务），它们就是实验基座。同时我对把您的图方法用在记忆评测上很有兴趣：把不同记忆组织方式（包括图结构记忆）放在同一协议下测成本、精度和延迟——这部分能直接用上您在属性图聚类和多嵌入融合上的积累。我的计划是第一篇做基准与检测，之后往记忆评测方向靠，具体的结合点想听您的意见。',
  reportDeck: [
    { p:'1', c:'标题页', k:'标题用「可信 Agent 系统」起头，副标题给图/评测的结合点' },
    { p:'2', c:'一页讲清场景', k:'Agent 流水线的「假成功」现象：给一张真实故障截图（Atlas 台账里的失败案例）' },
    { p:'3', c:'问题的形式化', k:'六级成功验证：声明/结构/证据/任务/安全/重复成功；假成功 = 至少一项不成立' },
    { p:'4-5', c:'现状与不足', k:'LLM-as-Judge、退出码、Schema 检查各自的失效模式；引用 2606.09863 说明问题刚被命名' },
    { p:'6', c:'缝隙陈述', k:'有刻画、无可复算基准与分层检测器；误报与成本无人测' },
    { p:'7', c:'与课题组能力的衔接', k:'两条：①证据链组织可借图/溯源结构 ②第三篇走向记忆评测，直接用属性图聚类与多嵌入融合（列导师三篇相关论文）' },
    { p:'8-9', c:'方法草案', k:'类型学 → 基准 → 三层检测器；Atlas 的哈希断言/截断哨兵作为证据层 baseline 显眼呈现' },
    { p:'10-11', c:'实验设计', k:'基准任务分层 + 对比对象（Judge/退出码/Schema）+ 指标（检出率/误报/reliability@k/成本）' },
    { p:'12', c:'已完成的工作', k:'Atlas（542 测试、真实故障拦截记录）+ AgentParliament（37★）+ minibank-trap 首轮受控数据。这一页决定他信不信你' },
    { p:'13', c:'算力与成本评估', k:'全部实验单机可完成、LLM 走 API 且有成本预留与缓存；主动消解算力顾虑' },
    { p:'14', c:'时间计划', k:'W8 切口冻结、W12 汇报、投稿目标 NeurIPS D&B / ICSE-FSE / ESWA' },
    { p:'15', c:'需要的支持', k:'具体到 API 预算、服务器权限、组内是否有人做过评测/软工方向' }
  ],
  reportTips: [
    '<b>先给他能判断的东西，再给新东西。</b>用「实验充分性的自动化」类比评测验证，用记忆评测衔接他的方法积累；不要一上来堆 Agent 黑话。',
    '<b>主动提算力可控。</b>第 13 页说清单机可跑 + 成本预留机制，会大幅提升信任。',
    '<b>把工程背景摆成资产而不是噪音。</b>两个开源仓库就是测量基础设施——「实现和数据采集我能自己扛，希望在问题形式化和论文写作上向您学习」。'
  ],

  firstMail:{
    title:'给导师的第一封邮件（2026-08 修订版：主线已定，重在建联系）',
    dont:'不要问"您的方向是什么"——这会暴露你没做过功课。也不要写成单方面通知：结尾要留出他调整方向的余地。',
    body:`刘老师您好：

我是今年录取到您门下的 XXX。入学前读了您几篇论文，2024 年 Neurocomputing 那篇 information-enhanced deep graph clustering，和 2025 年 KBS 上的 DSS-GCN，对其中"把多路互补信息用可学习方式融合"的思路印象很深。

我本科是软件工程，毕业后做了一年多 Python 后端和大模型应用开发，自己写了两个开源项目：一个多模型工作流引擎（带假成功检测、产物哈希断言和成本台账），一个多模型交叉审查的 MCP 服务。做的过程中我反复撞到同一个问题：Agent 系统经常"宣称完成"，但证据、环境状态并不成立——我想把这个问题做成可复算的评测基准和自动检测方法，这是我想申请的论文主线。

同时我也注意到，您的属性图聚类和多嵌入融合方法与"记忆评测"方向有直接结合点：把图结构记忆和其他记忆组织方式放在同一协议下做受控对比，图方法既能作为被评测对象，也能贡献设计。我希望主线之外，第二篇能往这个结合点走，具体怎么衔接想听您的意见。

如果可行，我入学前会先把评测协议和 baseline 复现做起来，开学时直接汇报进展。也想请问组里的算力情况，以便我把实验方案设计在可行范围内。

打扰您了，盼回复。

XXX`,
    effect:'这封邮件同时完成四件事：证明你读过他的论文、暴露你的工程资产（两个开源仓库 + 工作经历）、把主线主动权拿到手（你提方向，他做判断）、并给他一条能用自己的方法参与进来的路径（记忆评测结合点）——支持需要具体的参与入口。'
  }
};
