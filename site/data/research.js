/* 板块 2：研究主线 —— 可信 Agent 系统（假成功检测）为主线
   2026-08-28 第二次修订（结构重构）：
   - 方向 B（MCP/A2A 工具生态）、D（最小权限执行）被本人明确拒绝，存档于 rejected；
     补位：E 代码智能体评测质量审计（来自调研会话）、F 记忆压缩帕累托（恢复自旧版切口 C）。
   - 阅读清单重构为「公共必读 + 按方向私有路线」：common 无论走哪条线都要读；
     tracks 按方向携带各自的论文、阶段路线（可视化）、复现资产。
   - 所有 arXiv 编号经 arXiv API 按标题反查确认（2026-08-28）。
     原文入口为每篇阅读卡的 arXiv 双外链（abs / LaTeXML HTML）；本地 PDF 库已于 2026-08-31 移除（PAPER-DEEP-READ-DESIGN.md §9.1）。 */
window.RESEARCH = {

  positioning: {
    title: '论文主线：可信 Agent 系统；图记忆作为和导师合作的线',
    body: '三次独立调研都指向同一个判断：最适合的论文类型是评测、基准和实证研究，而不是提出新方法。这类工作靠协议设计和扎实数据说话，不需要算力。第一个要解决的问题是 Agent 的「假成功」：模型宣称任务完成、流程退出码为 0，但证据、环境状态或约束条件其实没有成立。Atlas（假成功检测加哈希断言）和 AgentParliament（交叉审查）正好是这个问题的测量基础设施。市场侧也能印证：腾讯技术岗 JD 里，评测占 15.5%，可观测性占 7.6%，记忆占 7.2%，都是高频词。',
    tag: 'strategy'
  },

  // ---------- 六个方向 ----------
  angles: [
    {
      id:'A', star:true,
      name:'给 Agent 的假成功做分类、基准和检测',
      en:'Characterizing, Benchmarking and Detecting False Success in LLM Agents',
      problem:'Agent 流水线最常见的可靠性事故是「假成功」：模型宣称任务完成、流程判定通过，但证据、环境状态或安全约束里至少有一项没成立。2606.09863（FAGEN@ICML 2026）刚给这个问题起了名字，目前标题级的论文只有这一篇。窗口刚开，但问题已经不算空白，所以要做它没有的东西：一个可以复算的基准，加上分层的检测器。Atlas 里已经有雏形（空输出、截断、缺字段的拦截，SHA-256 产物断言，JSONL 台账），minibank-trap 是现成的带缺陷评测集。',
      method:[
        '整理假成功的类型：工具虚假成功、产物缺失或过期、产物和输入对不上、只做了一半却宣称全部完成、测试预言不足、多 Agent 形成错误共识、副作用没被发现、重跑结果不稳定。样本来自真实轨迹和受控故障注入两个渠道。',
        '把「成功」拆成六个可以分别检验的层面：声明、结构、证据、任务、安全、重复成功。',
        '检测器 v1 做声明、证据、状态三层解耦检查。Atlas 的哈希断言和截断哨兵就是证据层的 baseline。',
        '把 minibank-trap 扩展成公开评测协议，每次运行都记录配置、模型、重复次数和成本。',
        '对比对象选 LLM-as-Judge、退出码、JSON Schema 检查和 Atlas 内置检测器。指标看假成功检出率、误报率、reliability@k 和单位成本。'
      ],
      venue:'NeurIPS Datasets & Benchmarks；ICSE/FSE/ASE（实证软件工程方向）；也可以先从 FAGEN 这类 workshop 起步',
      cost:'成本最低。全部走 API、单机可跑，Atlas 台账自动记账。',
      risk:'2606.09863 已经抢占了「命名」的先机。应对办法是分工不同：它只做现象刻画，而你要做可复算的基准、检测器和误报分析，类型学覆盖面也要超出它（副作用、重跑稳定性）。',
      scores:{ value:5, novelty:3, falsifiable:5, feasible:5, resource:5, career:5 }
    },
    {
      id:'B',
      name:'多模型交叉审查什么时候真的有用',
      en:'When Does Cross-Model Review Help? Boundaries and Failure Attribution of Heterogeneous Multi-Agent Verification',
      problem:'AgentParliament 建立在一个假设上：引入外部对立视角能打破确认偏差。这个假设从来没有被系统量化过。Interaction Tax（ICML 2026）证明模型之间通信会抹平多样性，Collaboration Tax 量化了协调成本，但两个问题仍然没有答案：独立审查在什么条件下好于全文共享的辩论？出了错怎么归因到具体角色？手头的 10 工具三级权限设计和 minibank-trap 带缺陷评测集，正好就是为这个问题搭好的实验台。',
      method:[
        '固定任务和预算，做三组受控对比：独立审查（权限分层）、全文共享辩论、单模型审查。',
        '量化审查带来的增益：缺陷召回、误报率、成本、延迟。',
        '做失败归因：错误共识是怎么形成又是怎么传播的，对接 MAST 失败分类和 LIFE 综述。',
        '消融审查拓扑的要素：审查者数量、模型是否异质、什么时机介入。'
      ],
      venue:'ESWA / KBS（应用导向）；ICSE/FSE（实证方向）；ACL Findings',
      cost:'中等。多模型调用是主要成本，Atlas 的预算机制可控住。',
      risk:'结论可能是「增益有限」。这也能发表：负结果加上边界刻画，写法参照 HGB（见公共必读第 13 篇）。',
      scores:{ value:4, novelty:3, falsifiable:5, feasible:4, resource:4, career:4 }
    },
    {
      id:'C',
      name:'给 Agent 的记忆后端做一次统一横评（接导师线）',
      en:'An Evaluation Science of Agent Memory Backends: Cost, Accuracy and Latency',
      problem:'Harness the Memory（2608.15008）已经证明没有哪种存储方式能一直最优，MemoryArena 也做了配对研究。但记忆后端的评测方法还是很散：成本、精度、延迟怎么一起量，冲突和信息漂移怎么处理，检索噪声什么时候会伤害决策，都没有统一的测量办法。这是图记忆和评测主线自然交汇的地方：图记忆在这里不是被提出的新方法，而是被评测的对象之一。',
      method:[
        '定一个统一评测协议：成本、精度、延迟三根轴，乘上检索、更新、冲突处理、遗忘四类能力。',
        '让图结构记忆（导师可以参与设计）和平铺、层级、向量记忆在同一口径下对比。',
        '做「记忆什么时候反而有害」的边界实验：过期信息污染、检索噪声。',
        '按时间切片纵向测量记忆的漂移和冲突（用 LoCoMo）。'
      ],
      venue:'KBS / ESWA / Neurocomputing（导师的主场，他能给出实质指导）；NeurIPS D&B',
      cost:'低到中。LLM 抽取结果缓存之后，跑图算法基本不花钱。',
      risk:'评测类工作的新颖性有上限。应对办法是把结论做尖：说清楚「图记忆在什么条件下值得用」，让这条边界本身成为贡献。',
      scores:{ value:4, novelty:3, falsifiable:5, feasible:4, resource:4, career:4 }
    },
    {
      id:'D',
      name:'图结构化记忆：用导师的属性图聚类改进记忆分层',
      en:'Attribute-Aware Heterogeneous Community Detection for Long-Term Memory of LLM Agents',
      problem:'GraphRAG 划分记忆图用 Leiden，Zep 用标签传播，这些都是经典的无监督算法。它们默认图是同质的、没有属性、静态不变，而记忆图恰恰是异构的、带属性的、不断增量更新的，两边对不上。导师做属性图聚类和多嵌入融合，方法正好对症。在导师已经支持主线的前提下，这条线的定位是和导师合作的线：他能深度指导、能给出实质修改意见，适合作为第二或第三篇，也可以和方向 C 合并。',
      method:[
        '把记忆图定义成异构属性图 G=(V,E,X,T)，节点分实体、事件、工具调用三类。',
        '用 HAN 式的元路径注意力，把结构嵌入和文本嵌入融合起来（这是导师惯用的做法）。',
        '用 DMoN 式的可微模块度损失，端到端做社区划分。',
        '社区内做摘要，形成分层的记忆；检索时先按社区粗筛，再到节点级精排。'
      ],
      venue:'KBS / ESWA / Neurocomputing（导师的主场）；有余力可以冲一下 TOIS',
      cost:'低。图聚类单卡跑几个小时；LLM 抽取结果缓存后基本不花额外费用。',
      risk:'HKUDS 这类团队产出极快，速度上拼不过。另外 GraphRAG 这个词在 1912 条 JD 里零命中，求职时的说法要换成记忆、评测这些词（方向 A/C 的词频更高）。',
      scores:{ value:4, novelty:4, falsifiable:4, feasible:4, resource:4, career:3 }
    },
    {
      id:'E',
      name:'审计代码智能体基准：数据污染、难度分桶与测试预言',
      en:'Auditing Code-Agent Benchmarks: Contamination, Difficulty Bucketing and Test-Oracle Enhancement',
      problem:'代码智能体论文的分数，建立在一些本身有毛病的基准上。PAIChecker 发现，即使是最干净的 SWE-bench Verified，也有 13.6% 的 PR 和 Issue 对不上号；reliability@k 的研究说明单次 pass@k 不可信；τ²-bench 里大量失败是不报错的静默错误状态。经检索确认，污染检测、按复杂度和改动规模分桶、测试预言增强这三件事还没有人系统地做，而它们直接决定所有 coding agent 论文数字的可信度。这个方向和方向 A 共用评测设施，投的也是同一批会议。',
      method:[
        '对 SWE-bench-Like 基准做一次数据质量普查：找出 PR 与 Issue 不匹配的样本、有缺陷的测试、被污染的样本。',
        '按圈复杂度、改动行数、测试覆盖度分桶，重算每个桶的通过率，检查基准标称的难度是不是真的难。',
        '接入 reliability@k 协议：同一实例跑 k 次，看稳定通过率。',
        '用执行轨迹来加强测试预言，专门判别「测试通过了但其实没修好」的静默失败。',
        '最终产出三样东西：一份审计报告、一版修正后的榜单、一个可复算的审计工具。'
      ],
      venue:'ICSE / FSE / ASE（实证软件工程主场，偏爱 empirical study）；NeurIPS D&B',
      cost:'低。静态分析、数据构建加推理 API，单机可以做完整套。',
      risk:'要依赖上游基准，版本会变。应对办法是把审计工具写成通用件，能对任意 SWE-bench-Like 数据集重跑。',
      scores:{ value:5, novelty:3, falsifiable:5, feasible:5, resource:5, career:4 }
    },
    {
      id:'F',
      name:'给定 token 预算，记忆怎么压缩性能最好',
      en:'Budget-Constrained Agent Memory Compression via Graph Coarsening',
      problem:'现在的记忆系统都只报一个单点数字：比 full-context 省了多少 token、准确率还更高。但没人回答真正该问的问题：给定一个 token 预算，记忆要怎么组织，性能才能最好？这条压缩率和性能的曲线没人画过。图粗化领域恰好有现成的理论，讲的就是压缩率和谱性质保持之间的取舍，只是从来没人把它用到记忆上。这个方向成本低、和导师的图粗化/社区发现背景契合，也是旧版规划里验证过可行的题目，现在恢复为和导师合作的第二条线。',
      method:[
        '把记忆压缩形式化成图粗化问题：在保持检索相关性质的前提下，让节点数尽可能少。',
        '借用 2106.05150 的粗化框架，设计以检索效用为目标的粗化准则。',
        '用社区发现产出候选超节点，逐层粗化，形成多分辨率的记忆结构。',
        '检索时按当前预算自动选择用哪一层分辨率。'
      ],
      venue:'Neurocomputing / Applied Soft Computing（导师的主场）',
      cost:'最低的一档。纯图算法加缓存的嵌入，几乎不产生 API 费用。',
      risk:'可能被审稿人评价为「已有技术的组合应用」。应对办法是粗化准则本身要有真正的创新，再附一个简单的误差界。',
      scores:{ value:4, novelty:4, falsifiable:4, feasible:5, resource:5, career:3 }
    }
  ],

  /* 已拒绝方向（2026-08-28 本人确认）。保留记录防止未来重新发明：
     若要翻案，先在此处删除并更新 idea-ledger。 */
  rejected: [
    { id:'old-B', name:'MCP / A2A 工具生态的评测与审计', reason:'权衡优先级后明确不做：手上的自研资产在这个方向复用得少；窗口虽然新开，但涌入的人更多，不适合当论文主线。相关工作的 PDF 已从本地库移除。' },
    { id:'old-D', name:'Agent 最小权限执行与副作用审计', reason:'明确不做：安全形式化的门槛高，和主线 A 的「成功验证」有重叠，但撑不起第一篇。Runtime Contract 那篇因为和成功验证直接相关，保留在方向 A 的路线里；其余安全向的 PDF 已移除。' }
  ],

  angleAdvice:'第一篇做 <b>A（假成功）</b>：现成资产复用最多、成本最低、和评测岗位的重合度最高，而且窗口刚开。<b>E（代码基准审计）</b>和 A 共用评测设施、投同一批会议，可以作第二篇，也可以和 A 并行。<b>B（交叉审查）</b>复用 A 建好的基准，适合放第二或第三篇。<b>C（记忆评测）</b>和 <b>D/F（图记忆、记忆压缩）</b>是和导师合作的线：如果导师希望课题更贴他的技术栈，就把 D+F 或 C 提到前面，公共路线不变。所有方向都有一个共同约束：不训练大模型、API 结果可缓存、单机能跑完。这个约束是刻意设的。',

  /* ── 页面要点（渲染在页头下方；文案从本页现有内容提炼，勿新造结论） ── */
  summary: [
    '论文主线在 2026-08 转向：现在做可信 Agent 系统，具体是假成功的分类、基准与检测；图记忆不再是主线，改成和导师合作的线。',
    '第一篇默认走方向 A。理由：现成资产复用最多、成本最低、和评测岗位（JD 命中率 15.5%）最对口，问题窗口刚开。',
    '所有方向都守着同一条约束：不训练大模型、API 可缓存、单机可跑。',
    '每个方向都同时产出两类东西：能复跑的实验和台账（求职时拿得出手），以及分类、基准、协议（论文投稿用）。同一套实验两边都受益。',
    '组会开场怎么说，看本页底部的发言稿；15 页汇报的骨架在本页的折叠块里。'
  ],
  readingSummary: [
    '读书顺序是先公共后方向：13 篇公共必读不管走哪条方向都要读，前 4 篇先把语言立起来。每篇论文都有自己的阅读卡，里面有导读和 arXiv 原文入口。',
    '方向卡 A—F 一次只看一条：先定位，再看阶段路线、方向必读，最后看复现资产和数据集。公共层在各方向之间是共用的。',
    '90 天计划默认沿方向 A 展开。中途换方向时，W1—W4 的公共层不动，W8 检查点和 W12 汇报的节点也不动。',
    '卡住时允许降级：从「提出检测器」降到「系统性测量加现象发现」。实证分析在 ICSE/FSE/ASE 同样能发表。'
  ],

  dualTrack:'新主线下的「两条产出」其实是一件事的两面。主线 A/E 的每一组实验，跑出来的台账和可复跑系统归 Atlas/AgentParliament，是求职时拿得出手的工程资产；同一批实验整理成分类、基准和协议，就是投稿用的论文资产。导师这边保留 C/D/F：记忆评测和图方法让他在组会上能给出实质意见。他已经确认支持自选方向，所以这条线不再是「必须贴着他走」，而是「能让合作更有内容」。',

  // ---------- 阅读：公共必读 + 方向私有路线 ----------
  reading: {
    common: {
      name:'公共必读 · 六个方向共用',
      note:'这 13 篇是六个方向共同的地基：前 4 篇先把语言立起来；中间 5 篇是记忆系统的参照对象，也是实验里常遇到的 baseline；后 4 篇教的是怎么做评测、怎么批判。按顺序读完大约 37 小时（每篇小时数相加，2026-08-30 订正）。点论文行能进入这篇的阅读卡，原文从 arXiv 链接打开。',
      items:[
        { n:1, t:'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks', ax:'2005.11401', y:'2020-05', v:'NeurIPS 2020', c:16334, h:'2h',
          intro:'检索增强生成的奠基论文。它把「先检索再生成」写成一个可以端到端训练的框架（DPR + BART），此后五年所有 RAG 工作都在用它定下的这套语言说话。',
          why:'整条技术线的起点，写 related work 必引。重点是理解参数化知识和非参数化知识各自管什么，之后所有记忆、检索方面的定位都绕不开这个框架。' },
        { n:2, t:'Generative Agents: Interactive Simulacra of Human Behavior', ax:'2304.03442', y:'2023-04', v:'UIST 2023', c:4898, h:'3h',
          intro:'25 个 Agent 住进一个小镇的模拟。它提出了 memory stream、recency/importance/relevance 三因子检索和 reflection 机制，是 Agent 记忆系统的原型，后来的记忆论文几乎都拿它当参照。',
          why:'它的 reflection 其实就是记忆压缩的雏形。设计记忆评测协议时，三因子检索是必须拿来对照的基线组合。' },
        { n:3, t:'MemGPT: Towards LLMs as Operating Systems', ax:'2310.08560', y:'2023-10', v:'arXiv（后演化为 Letta）', c:989, h:'2h',
          intro:'把操作系统的虚拟内存思路搬进 LLM 记忆：主上下文放不下就换页到外部存储，中断和调度都交给 Agent 自己管理。后来产品化为 Letta。',
          why:'它提供了记忆管理的系统视角，也是一个典型的「要避开的大工程」：这篇论文证明了做一套记忆操作系统是个很深的坑，相比之下评测科学才是更现实的切入方式。' },
        { n:4, t:'A Survey on the Memory Mechanism of LLM-based Agents', ax:'2404.13501', y:'2024-04', v:'ACM TOIS', c:664, h:'3h',
          intro:'第一篇专门讲 Agent 记忆的综述。它从记什么（source）、什么形态（form）、怎么操作（operation）三个维度做了分类，把散在各处的记忆工作放进同一张地图。',
          why:'术语一次立好，后面读方法论文会快很多。论文里的记忆评测协议要引用它的分类框架。' },
        { n:5, t:'A-MEM: Agentic Memory for LLM Agents', ax:'2502.12110', y:'2025-02', v:'NeurIPS 2025', c:772, h:'4h', warn:true,
          intro:'按卡片盒笔记法（Zettelkasten）组织的记忆：每条笔记会自动建立链接，并随着新经验不断演化。是「记忆自己生长」这条路线的代表。',
          why:'它和记忆方向撞得最厉害。必须精读到能讲清它的演化触发条件，并说清楚自己的方向和它的差别在哪里。' },
        { n:6, t:'Zep: A Temporal Knowledge Graph Architecture for Agent Memory', ax:'2501.13956', y:'2025-01', v:'arXiv（Zep 公司）', c:263, h:'3h', warn:true,
          intro:'工业界的图记忆代表。它的 Graphiti 引擎用三层时序知识图（实体、社区、语义边）承载 Agent 记忆，重点在处理事实的有效时间和失效。',
          why:'社区层它已经做了。要读出它社区层的粗糙之处（粒度、更新、属性缺失），那里就是图记忆方向（D）能下手的地方。' },
        { n:7, t:'Mem0: Building Production-Ready AI Agents with Scalable Long-Term Memory', ax:'2504.19413', y:'2025-04', v:'ECAI 2025', c:492, h:'2h',
          intro:'工业界用得最多的记忆库。管线分抽取、更新两步，存储是向量和图的混合，LOCOMO 上的数字被后来的论文反复引用。',
          why:'它是记忆实验的默认对比对象。它的评测口径被后续横评质疑过，这些口径问题本身就是方向 C 的研究素材。' },
        { n:8, t:'From Local to Global: A Graph RAG Approach to Query-Focused Summarization', ax:'2404.16130', y:'2024-04', v:'微软研究院技术报告', c:1815, h:'4h',
          intro:'微软 GraphRAG：用 Leiden 算法把语料图聚成社区、逐层生成摘要，查询时按社区粒度召回。层级摘要式检索的代表作。',
          why:'这是和导师技术栈直接对接的一篇。精读它的社区层级构建，其中 Leiden 这一步就是方向 D 要换成属性感知聚类的位置。' },
        { n:9, t:'LightRAG: Simple and Fast Retrieval-Augmented Generation', ax:'2410.05779', y:'2024-10', v:'EMNLP 2025', c:386, h:'3h',
          intro:'HKUDS 出品的简化版 GraphRAG：检索分实体级和主题级两层，Docker 一键跑通，是目前最容易复现的图检索 baseline。',
          why:'第一个 baseline 数字大概率就从这里来。方向 D 要换聚类算法来做实验，对象最可能也是它。' },
        { n:10, t:'Evaluating Very Long-Term Conversational Memory (LoCoMo)', ax:'2402.17753', y:'2024-02', v:'ACL 2024', c:664, h:'3h',
          intro:'50 段平均 300 轮的超长对话构成的记忆基准。Mem0、A-MEM、Zep 都在它上面比过，已经是记忆后端横评的事实标准。',
          why:'它的 QA 分成单跳、时序、多跳、开放域几类，读懂这个划分，记忆评测协议才有可以对话的对象。各家在它上面报的数字互相矛盾，这正是方向 C 要解决的问题。' },
        { n:11, t:'Why Do Multi-Agent LLM Systems Fail? (MAST)', ax:'2503.13657', y:'2025-03', v:'NeurIPS 2025', c:474, h:'3h',
          intro:'对多 Agent 系统的系统性失败分析：人工标注出 14 类失败模式（包括信息共享失败、验证不足），给出了完整的标注协议和各类型的分布。',
          why:'失败分类学的标准范本。假成功类型学在方法上和它是近亲；方向 B 的失败归因会直接引用它的分类。' },
        { n:12, t:'From Confident Closing to Silent Failure: Characterizing False Success in LLM Agents', ax:'2606.09863', y:'2026-06', v:'FAGEN @ ICML 2026', h:'3h', warn:true,
          intro:'给「假成功」命名的那篇论文，系统刻画了 Agent 宣称完成但实际没有达成的现象，给出了初步的分类。',
          why:'第一篇的直接对手。它做的是现象刻画，要做的是那篇没有的：可复算的基准、分层检测器和误报分析。必须精读，并把差异点划清楚。' },
        { n:13, t:'Are we really making much progress? Revisiting HGNNs (HGB)', ax:'2112.14936', y:'2021', v:'KDD 2021', c:481, h:'2h',
          intro:'「泼冷水」式评测的代表作：在同一口径下重新测试大量异构图神经网络，发现很多声称的提升来自不公平比较和调参空间。',
          why:'写实证和评测类论文时拿它当模板。负结果和边界刻画怎么写成一篇有影响力的论文，看它。' }
      ]
    },
    tracks: {
      A: {
        name:'方向 A · Agent 假成功的分类、基准与检测',
        pitch:'主线与第一篇。把「宣称成功」和「实际成功」拆开分别检验，做一个能复算的基准和三层检测器。手上已有 Atlas、AgentParliament 和 minibank-trap。',
        fit:'和导师的配合点：实验严谨性和论文写作他可以把关。和求职的配合点：这就是评测岗（腾讯 JD 命中率 15.5%）的对口方向。',
        stages:[
          { k:'第 1—2 月', v:'整理假成功的分类：从真实轨迹和故障注入两个渠道取样，定下标注协议 v1 和边界案例的仲裁规则' },
          { k:'第 3 月', v:'建基准：把 minibank-trap 扩成公开协议，任务分层、gold 状态、检测器统一接口' },
          { k:'第 4—5 月', v:'实现检测器并做对比：三层检测器对 LLM-as-Judge、退出码、Schema 检查，接入 reliability@k' },
          { k:'第 6 月起', v:'写论文与投稿：NeurIPS D&B、ICSE/FSE NIER 或 FAGEN 一类 workshop；整理复现包和脱敏评测集' }
        ],
        papers:[
          { t:'Cognitive Architectures for Language Agents (CoALA)', ax:'2309.02427', y:'2023-09', v:'TMLR', c:449, h:'3h', why:'把 Agent 拆成记忆、动作空间、决策循环的总框架。说「假成功出在哪一层」时，用它这套坐标来定位' },
          { t:'From Agent Traces to Trust: A Survey of Evidence Tracing and Execution Provenance in LLM Agents', ax:'2606.04990', y:'2026-06', v:'arXiv（综述）', h:'4h', why:'证据追踪和执行溯源的综述。相当于「证据层验证」这张主题的理论地图，related work 的骨架照着它搭', key:true },
          { t:'Beyond Pass@k: Measuring Reliability and Security of Agentic Code Generation', ax:'2608.14711', y:'2026-08', v:'arXiv', h:'2h', why:'reliability@k 协议的出处：单次 pass@k 不可信。评测协议直接借用这套做法', key:true },
          { t:'Reason Less, Verify More: Deterministic Gates Recover a Silent Policy-Violation Failure Mode in Tool-Using LLM Agents', ax:'2607.07405', y:'2026-07', v:'arXiv', h:'2h', why:'用确定性检查门拦住 LLM 漏掉的静默违约。思路和 Atlas 的哈希断言是同一类，可以当作方法上的同盟证据' },
          { t:'Agent Safety Should Be a Runtime Contract', ax:'2608.11274', y:'2026-08', v:'arXiv', h:'2h', why:'主张把成功和安全约束从 prompt 挪进运行时。检测器要做哪些检查，可以从这篇找需求' },
          { t:'Noise Floor Audit for Agent Benchmarks', ax:'2608.22331', y:'2026-08', v:'arXiv', h:'2h', why:'讲基准的扰动方差（噪声地板）。自建 benchmark 之前必须先控制这个变量，不然检出率的差异说明不了问题' },
          { t:'When Errors Become Narratives: A Longitudinal Taxonomy of Silent Failures in a Production LLM Agent Runtime', ax:'2606.14589', y:'2026-06', v:'arXiv', h:'2h', why:'生产环境里静默失败的纵向分类。做类型学时，这是现成的工业界对照样本' },
          { t:'REFLECT: Intervention-Supported Error Attribution for Silent Failures in LLM Agent Traces', ax:'2606.09071', y:'2026-06', v:'arXiv', h:'2h', why:'用干预验证做错误归因。「检测出来之后如何定位责任环节」直接参照它' }
        ],
        repos:[ { r:'Ctrl1CandV/Atlas', note:'假成功检测、哈希断言、JSONL 台账都在这里，全部实验都跑在这套系统上' }, { r:'Ctrl1CandV/AgentParliament', note:'交叉审查工具和权限分层；多 Agent 错误共识的样本也从这里来' } ],
        datasets:[ { n:'minibank-trap（自有）', d:'6 个代码缺陷、5 个设计漏洞、2 个规则违规；gold 答案暂不公开防泄漏，之后补脱敏公开版' }, { n:'τ-bench / τ²-bench', d:'工具调用场景，含静默策略违约（2607.07405 用的就是它）' }, { n:'Atlas 生产轨迹', d:'自带台账：每个节点的输入输出、token、费用和失败链都在' } ],
        note:'第一篇默认沿这个方向推进：90 天计划的 W5—W12 就是按这里展开的。'
      },
      B: {
        name:'方向 B · 交叉审查什么时候真的有用',
        pitch:'用 AgentParliament 做受控实验，回答「独立审查什么时候值得做」：量化它带来的增益、成本和失败归因。第二、三篇的候选。',
        fit:'和导师的配合点：实验设计他能把关。和求职的配合点：对多 Agent 协作和评测岗。',
        stages:[
          { k:'第 1 月', v:'设计受控对比矩阵：独立审查（权限分层）、共享辩论、单审三组，固定任务和预算' },
          { k:'第 2—3 月', v:'扩充评测集并跑完全部配置：复用 minibank-trap，新增设计类缺陷' },
          { k:'第 4—5 月', v:'量化增益、做失败归因：召回、误报、成本，再用 MAST 框架分析错误共识是怎么形成的' },
          { k:'第 6 月起', v:'写论文：ESWA / KBS / ICSE-FSE 实证方向；如果结果是负的，按 HGB 的模板写' }
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
        note:'这个方向依赖 A 建好的评测协议和台账。排在 A 之后启动，可以省一个月的基建时间。'
      },
      C: {
        name:'方向 C · 给记忆后端做统一横评',
        pitch:'定一个统一协议，把各种记忆后端（包括图记忆）放在一起横评，画出「记忆什么时候值得用」的边界。这是和导师方法衔接最短的一条路。',
        fit:'和导师的配合点：图记忆是被评测对象之一，他能深度参与设计。和求职的配合点：记忆（腾讯 JD 出现率 7.2%）和评测（百度口径 12.3%、腾讯口径 15.5%）都是市场语言。',
        stages:[
          { k:'第 1 月', v:'定统一评测协议：成本、精度、延迟三轴，配检索、更新、冲突处理、遗忘四种能力' },
          { k:'第 2—4 月', v:'跑后端横评：平铺、层级、向量、图记忆四类（图方案请导师参与）在同一口径下过 LoCoMo 和 LongMemEval' },
          { k:'第 5 月', v:'做边界实验：过期信息污染、检索噪声、冲突注入，看记忆什么时候反而有害' },
          { k:'第 6 月起', v:'写论文：KBS / ESWA / Neurocomputing，或 NeurIPS D&B' }
        ],
        papers:[
          /* C：主路径 5 + 延伸 4。Oblivion（2604.00131）已从本方向删除——一篇只归一处，
             它的家在方向 F（压缩/衰减基线）；对照关系写在本方向 note 里。 */
          { t:'LongMemEval: Benchmarking Chat Assistants on Long-Term Interactive Memory', ax:'2410.10813', y:'2024-10', v:'ICLR 2025', c:450, h:'3h', why:'500 个问题、五类记忆能力的细分。评测协议里的能力维度直接沿用它的划分', key:true },
          { t:'MemoryAgentBench: Evaluating Memory via Incremental Multi-Turn Interactions', ax:'2507.05257', y:'2025-07', v:'arXiv', c:156, h:'2h', why:'四维能力里带「冲突消解」，做边界实验时这个维度是现成的', key:true },
          { t:'Harness the Memory: A Holistic Evaluation of Memory Substrates in Memory Agents', ax:'2608.15008', y:'2026-08', v:'arXiv', h:'3h', why:'它的结论是没有哪种存储能一直最优。这是最直接的前作，协议设计必须建立在对它的比较之上', key:true },
          { t:'MemoryLake on MemoryArena: A Matched Study of Agent Memory Backends', ax:'2608.13883', y:'2026-08', v:'arXiv', h:'2h', why:'配对研究（matched study）的设计范式，同口径对比照着它的模板来' },
          { t:'From Storage to Experience: A Survey on the Evolution of LLM Agent Memory', ax:'2605.06716', y:'2026-05', v:'ACL 2026 Findings', c:10, h:'3h', why:'2026 年最新的记忆领域全景和开放问题清单' },
          { t:'Memory OS of AI Agent (MemoryOS)', ax:'2506.06326', y:'2025-05', v:'EMNLP 2025', c:92, h:'2h', tier:'extend', why:'三级存储加页面调度，层级记忆这一类的被评测代表，国内同类工作' },
          { t:'MIRIX: Multi-Agent Memory System for LLM-Based Agents', ax:'2507.07957', y:'2025-07', v:'arXiv', c:135, h:'2h', tier:'extend', why:'六类记忆模块的分工，相当于记忆分类的工业版本' },
          { t:'MemoryBank: Enhancing LLMs with Long-Term Memory', ax:'2305.10250', y:'2023-05', v:'AAAI 2024', c:569, h:'2h', tier:'extend', why:'用艾宾浩斯遗忘曲线做记忆更新，遗忘这条线的起点' },
          { t:'General Agentic Memory Via Deep Research', ax:'2511.18423', y:'2025-11', v:'arXiv', c:31, h:'2h', tier:'extend', why:'站在反方：放弃预构建的索引。要回答「记忆到底需不需要组织」，它是必须回应的对立面' }
        ],
        repos:[ { r:'mem0ai/mem0', note:'被评测的后端之一' }, { r:'getzep/graphiti', note:'图记忆后端（需要 Neo4j 或 FalkorDB）' }, { r:'letta-ai/letta', note:'MemGPT 这一系的后端' } ],
        datasets:[ { n:'LoCoMo（公共层第 10 篇）', d:'对话记忆的主基准' }, { n:'LongMemEval / MemoryAgentBench', d:'能力细分和冲突维度的来源' } ],
        note:'如果导师希望课题更贴他的技术栈，这个方向可以和 D/F 合并提前：图记忆就从「被评测的对象」升级成「被设计的方案」。遗忘和衰减策略的对照看方向 F 的 Oblivion（2604.00131）。'
      },
      D: {
        name:'方向 D · 图结构化记忆：社区发现与分层压缩',
        pitch:'和导师合作的线：把他的属性图聚类和多嵌入融合迁移到记忆图上，换掉 GraphRAG/Zep 里的经典无监督算法。',
        fit:'这条线导师配合度最高，能给实质修改意见；但求职时不好讲：GraphRAG 这个词在 JD 里一次都没出现，对外表述要换成 Memory、Knowledge Graph。',
        stages:[
          { k:'第 1 月', v:'补图侧基本功：在 Cora/Citeseer 上复现 DMoN 和 SDCN，把 NMI/ARI 对齐到论文数字' },
          { k:'第 2 月', v:'构建记忆图：把 LightRAG/Graphiti 产出的记忆图导出成 PyG 异构图，出一份特征统计报告' },
          { k:'第 3—4 月', v:'实现方法并两边验证：HAN 式融合加 DMoN 式划分，既看图聚类指标，也看端到端记忆指标' },
          { k:'第 5—6 月', v:'写论文：KBS / ESWA / Neurocomputing（导师熟悉这几个刊），有余力冲一下 TOIS' }
        ],
        papers:[
          /* D：前置 3（tier:'prereq'，选本方向才要求）+ 主列表 8 + 延伸 7。
             HAN 是方法主干，进主列表不进前置；粗化 2106.05150 的家在这里，方向 F 只引用不复制。 */
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
          { t:'Memory is Reconstructed, Not Retrieved: Graph Memory for LLM Agents', ax:'2606.06036', y:'2026-06', v:'ICML 2026', c:2, h:'3h', warn:true, why:'2026 最新、和这个方向正面相撞，必读并划界' },
          { t:'Heterogeneous Graph Transformer (HGT)', ax:'2003.01332', y:'2020', v:'WWW 2020', c:1697, h:'3h', tier:'extend', why:'按元关系参数化的注意力，不用手工设计元路径，是 HAN 的替代选项' },
          { t:'Attributed Graph Clustering: Deep Attentional Embedding (DAEGC)', ax:'1906.06532', y:'2019', v:'IJCAI 2019', c:646, h:'3h', tier:'extend', why:'属性图聚类的奠基作，导师 ASOC 2024 那篇和它同族' },
          { t:'A Comprehensive Survey on Community Detection with Deep Learning', ax:'2105.12584', y:'2021', v:'IEEE TNNLS', c:456, h:'3h', tier:'extend', why:'深度学习社区发现的全景图，正好是导师这个方向的地图' },
          { t:'HiRAG: RAG with Hierarchical Knowledge', ax:'2503.10150', y:'2025', v:'EMNLP 2025 Findings', c:40, h:'2h', tier:'extend', why:'层级知识检索，和分层记忆概念重叠，读它是为了写清楚两者的区别' },
          { t:'From Experience to Strategy: Trainable Graph Memory', ax:'2511.07800', y:'2025-11', v:'arXiv', c:10, h:'2h', tier:'extend', warn:true, why:'「可训练图记忆」这个说法已经被它占了，贡献声明前必须对照它划清边界' },
          { t:'From RAG to Memory: Non-Parametric Continual Learning for LLMs (HippoRAG 2)', ax:'2502.14802', y:'2025-02', v:'ICML 2025', c:181, h:'3h', tier:'extend', why:'段落加概念的混合图，明确把 RAG 重新说成 memory 问题' },
          { t:'G-Retriever: RAG for Textual Graph Understanding and QA', ax:'2402.07630', y:'2024-02', v:'NeurIPS 2024', c:321, h:'3h', tier:'extend', why:'把子图检索形式化成带奖赏的斯坦纳树，做子图召回算法从这里出发' }
        ],
        repos:[ { r:'gusye1234/nano-graphrag', note:'只有千行左右的教学级实现，适合用来搞清楚社区划分发生在哪一步' }, { r:'HKUDS/LightRAG', note:'跑 baseline 用的系统' }, { r:'microsoft/graphrag', note:'官方实现，但索引阶段花 token 很多，先不要拿它跑实验', warn:true } ],
        datasets:[ { n:'Cora / Citeseer / PubMed', d:'图聚类的标准数据集（PyG Planetoid）' }, { n:'DBLP / ACM / IMDB 异构图', d:'方法先在这些异构图上验证（PyG/HGB）' }, { n:'LoCoMo / LongMemEval', d:'端到端记忆指标（公共层已读）' } ],
        note:'D、F、C 三条属于同一族，可以拼成和导师合作的完整故事：D 出方法，F 出压缩曲线，C 出统一评测。'
      },
      E: {
        name:'方向 E · 审计代码智能体的基准数据',
        pitch:'审计评测的地基本身：SWE-bench-Like 数据的错配与污染、难度分桶、测试预言增强。和方向 A 共用设施，投同一批会议。',
        fit:'和导师的配合点：实证研究的方法他可以把关。和求职的配合点：各家 coding agent 团队（阿里 Qoder、Kimi、字节）都需要读得懂基准数据的人。',
        stages:[
          { k:'第 1 月', v:'数据质量普查：写检测工具和协议，找出 PR 与 Issue 不匹配、测试有缺陷、被污染的样本' },
          { k:'第 2—3 月', v:'难度分桶与可靠性：按复杂度、改动规模、覆盖度分桶重算通过率，接入 reliability@k' },
          { k:'第 4—5 月', v:'测试预言增强：用执行轨迹判别「测试通过了但其实没修好」的静默失败' },
          { k:'第 6 月起', v:'写论文：ICSE / FSE / ASE（empirical study / NIER）或 NeurIPS D&B' }
        ],
        papers:[
          { t:'SWE-bench: Can Language Models Resolve Real-World GitHub Issues?', ax:'2310.06770', y:'2023-10', v:'ICLR 2024', h:'3h', why:'代码智能体基准的源头，也就是你要审计的对象本身', key:true },
          { t:'PAIChecker: Uncovering and Checking PR-Issue Misalignment in SWE-Bench-Like Benchmarks', ax:'2607.28587', y:'2026-07', v:'arXiv', h:'2h', why:'发现 Verified 集有 13.6% 的 PR-Issue 不匹配。「基准自己也需要被检查」的直接证据，从这里起步', key:true },
          { t:'SWE-Doctor: Guiding Software Engineering Agents with Runtime Diagnosis from Multi-Faceted Bug Reproduction Tests', ax:'2607.00990', y:'2026-07', v:'arXiv', h:'2h', why:'用运行时诊断辅助 SWE Agent，是测试预言增强旁边的相关工作' },
          { t:'Open-SWE-Traces: Advancing Dual-Mode Multilingual Distillation for Software Engineering Agents', ax:'2606.16038', y:'2026-06', v:'arXiv', h:'2h', why:'20 万条量级的真实轨迹，审计和分桶实验的数据可以从这里来' },
          { t:'Break It Down, Pass It On: Cross-Task Skill Transfer in LLM Agents', ax:'2608.20274', y:'2026-08', v:'arXiv', h:'2h', why:'技能跨任务迁移的受控研究，写法上可当「什么结论在什么条件下可信」的实证模板' }
        ],
        repos:[ { r:'princeton-nlp/SWE-bench', note:'既是审计对象，也是实验要跑的代码（Docker harness）' } ],
        datasets:[ { n:'SWE-bench / Verified', d:'主审计对象；注意 PAIChecker 发现的不匹配问题' }, { n:'Open-SWE-Traces', d:'大规模真实轨迹' } ],
        note:'和方向 A 的关系：共用缺陷注入的思路、reliability@k 协议和 ICSE/FSE 社区。区别在问题本身：A 问「单次运行可信吗」，E 问「基准本身可信吗」。'
      },
      F: {
        name:'方向 F · 记忆压缩：压缩率和性能的帕累托曲线',
        pitch:'回答「给定 token 预算，记忆该怎么组织」：把压缩形式化成图粗化，画出压缩率和性能的帕累托曲线。成本最低的一条和导师合作的线。',
        fit:'和导师的配合点：图粗化、社区发现正好在他的方法库里。对求职也有用：这条曲线讲的是成本优化，是岗位愿意听的词。',
        stages:[
          { k:'第 1 月', v:'把问题形式化：记忆压缩等于保持检索效用的图粗化，定义粗化准则和误差界' },
          { k:'第 2—3 月', v:'实现与预算扫描：在 LoCoMo 上按预算逐层粗化，画出压缩率对准确率的帕累托前沿' },
          { k:'第 4 月', v:'跑基线对比：full-context、随机丢弃、衰减式（Oblivion）、RAPTOR、SeCom 的粒度' },
          { k:'第 5—6 月', v:'写论文：Neurocomputing / Applied Soft Computing（导师熟悉这两个刊）' }
        ],
        papers:[
          { t:'RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval', ax:'2401.18059', y:'2024-01', v:'ICLR 2024', c:589, h:'3h', why:'它也做记忆分层，用的是 GMM 加摘要的树。画帕累托曲线时它就是曲线上的直接对手', key:true },
          { t:'SeCom: On Memory Construction and Retrieval for Personalized Agents', ax:'2502.05589', y:'2025-02', v:'ICLR 2025', c:79, h:'2h', why:'论证记忆的最优粒度是话题段。压缩「压到什么粒度」这条轴的依据来自它', key:true },
          { t:'Oblivion: Self-Adaptive Agentic Memory Control through Decay-Driven Activation', ax:'2604.00131', y:'2026-03', v:'arXiv（NEC Labs）', h:'2h', why:'衰减式压缩的 2026 年代表，基线之一' },
          { t:'Graph Summarization Methods and Applications: A Survey', ax:'1612.04883', y:'2016', v:'ACM CSUR', c:156, h:'3h', why:'图压缩方法的总目录。设计粗化准则要用到的理论词汇基本都能在这里找到出处' },
          { t:'NarrativeQA', ax:'1712.07040', y:'2017', v:'TACL', c:null, h:'2h', why:'长文档理解基准，作为预算扫描的第二个评测域' }
        ],
        repos:[ { r:'parthsarthi03/raptor', note:'RAPTOR 参考实现（已停更，当基线够用）' }, { r:'gusye1234/nano-graphrag', note:'社区划分这一步在它里面能看清楚，和 D 共用' } ],
        datasets:[ { n:'LoCoMo', d:'主评测域（公共层已读）' }, { n:'NarrativeQA', d:'长文档第二评测域' }, { n:'UltraDomain', d:'LightRAG 对比必需' } ],
        note:'纯图算法加缓存的嵌入，API 成本接近于零。如果题目被抢发、或者导师要求转向，这条线是成本最低的退路。'
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
    { t:'再做一个通用多 Agent 框架或编排 demo', e:'Interaction Tax 和 Collaboration Tax 已经在量化协调的开销与收益', j:'红海，而且「多 Agent 到底有没有增益」本身存疑' },
    { t:'纯 prompt 包装、编排层套壳', e:'面经调研的共识：这类项目在 2029 届秋招会被大量同质简历淹没', j:'学术和求职两边都不加分' },
    { t:'Agentic RL 后训练、预训练、GUI 小模型微调', e:'这是大厂大组和顶级实验室的主场，需要多卡集群', j:'算力上根本不可行，硬进去只是陪跑' },
    { t:'再写一篇 Agent 记忆综述', e:'2024 年有 2 篇 TOIS，2025、2026 各出了 1 篇', j:'没有综述的位置了' }
  ],

  // ---------- 竞争团队 ----------
  rivals: [
    { n:'FAGEN / 假成功线（2606.09863 作者等）', w:'False Success 现象刻画（ICML 2026 workshop）', f:'刚起步，窗口正开', note:'第一篇的直接对手。它刻画现象，我们做基准、检测器和误报分析', level:'danger' },
    { n:'SWE-bench 批判线（PAIChecker、reliability@k 等）', w:'基准质量审计、可靠性协议', f:'高，ICSE/FSE 社区节奏快', note:'方向 E 的同场竞争者，以后也可能变成合作或延续的对象', level:'danger' },
    { n:'记忆评测横评线（Harness the Memory、MemoryArena）', w:'记忆后端横评与配对研究', f:'高（arXiv 检索约 21 篇/年）', note:'方向 C 的直接对手，协议设计必须超过它们', level:'warn' },
    { n:'证据溯源线（Traces to Trust 综述及后继）', w:'执行溯源、审计', f:'中，约 26 篇/年', note:'提供理论地图；证据链的组织方式可以和它衔接', level:'warn' },
    { n:'HKU Data Intelligence Lab (HKUDS, Chao Huang)', w:'LightRAG 加大量 GraphRAG 变体', f:'极高，几乎月更', note:'记忆线（C/D/F）最需要盯的团队', level:'warn' },
    { n:'Rutgers AGI Research (Yongfeng Zhang)', w:'A-MEM、AIOS', f:'高', note:'Agent 记忆方向的主要产出方', level:'warn' },
    { n:'OSU NLP Group (Yu Su)', w:'HippoRAG 1 和 2', f:'高，NeurIPS/ICML 级别', note:'神经科学叙事加图算法，记忆线正面碰不过', level:'warn' },
    { n:'Zep AI / Mem0（公司）', w:'Graphiti、Mem0', f:'中', note:'工业界玩家，评测口径偏向自家产品；它们是方向 C 的被评测对象', level:'ok' },
    { n:'BAI-LAB（北邮）', w:'MemoryOS', f:'中', note:'国内同类工作，投稿路径可以参考它', level:'ok' }
  ],
  rivalJudgement:'和新对手拉开差距，靠的不是做更大更全的系统，而是<b>手上已有的测量设施</b>：Atlas 的假成功检测、哈希断言、成本台账，AgentParliament 的三级权限交叉审查，这些是多数评测方向的对手没有的。一个人加一张卡，拼速度拼不过 HKUDS；可以拼的是可复算的基准和诚实的负结果，这恰好就是评测实证类论文的评价标准。',

  metrics: [
    { g:'效果', items:['F1 / EM / Accuracy','Recall@k, MRR, nDCG','多跳准确率（按跳数分层报告）','LLM-as-Judge 四维胜率'] },
    { g:'验证与可信（主线）', items:['假成功检出率（按类型分别报告）','误报率（把真成功误判为假的比例）','reliability@k：同一任务跑 k 次的稳定通过率','证据完备性：判定能追溯到具体产物或哈希的比例','可复算性：第三方能否凭台账独立复现判定'] },
    { g:'成本', items:['每次查询的 prompt token','索引阶段的总 token、LLM 调用次数和费用','多 Agent 场景的协调开销'] },
    { g:'延迟', items:['端到端检索延迟 P50 / P95 / P99'] },
    { g:'压缩', items:['记忆压缩率 = 压缩后 token 除以原始 token','图规模压缩比（节点、边各缩减多少）'] },
    { g:'图质量（C/D/F 用）', items:['模块度 Q、NMI、ARI、Conductance，这组导师最熟','社区数稳定性、结构漂移度（动态场景）'] },
    { g:'记忆专用（C 用）', items:['冲突消解正确率（来自 MemoryAgentBench）','时序推理准确率','记忆连贯性（这个词出自百度 JD 原文）'] },
    { g:'鲁棒', items:['记忆被投毒后的准确率保持程度','有检索噪声和过期信息时的性能下降程度（方向 C 的边界实验）'] }
  ],

  // ---------- 90 天启动（公共层 + 默认沿方向 A 展开） ----------
  plan90: [
    { w:'W1', ph:1, read:'公共必读第 1—4 篇：RAG、Generative Agents、MemGPT、记忆综述', run:'把 Atlas 的 542 项测试全部跑通，再做一次 dry-run 加一次真实小图运行；配好 LLM API 和缓存层', out:'术语对照表一份；开发环境可用', stuck:'Atlas 本来就只能跑 Windows，不用折腾跨平台；API 预算先设死上限，打开成本预留' },
    { w:'W2', ph:1, read:'公共必读第 12 篇（假成功）加方向 A 的 2606.04990、2608.11274', run:'逐行读 Atlas 的假成功检测代码（空输出、截断哨兵、哈希断言、fallback、台账），画出每一类故障在哪里被拦下', out:'⭐ Atlas 检测机制笔记，以及六级成功验证清单的初稿', stuck:'直接读代码读不懂时，拿 STATUS.md 里记录的失败运行打断点调试，不要干读' },
    { w:'W3', ph:1, read:'方向 A 的 2608.14711、2607.07405、2606.14589、2606.09071', run:'受控重跑 minibank-trap：固定模型、温度和 prompt 版本，重复 3 次，记录成本和方差', out:'第一份带完整配置和重复次数的评测记录，替代之前的 n=1 结果', stuck:'方差大的时候先找非确定性来源（温度、工具调用时序），找到了再谈结论' },
    { w:'W4', ph:1, read:'公共必读第 5—10 篇：A-MEM、Zep、Mem0、GraphRAG、LightRAG、LoCoMo，加 2605.06716', run:'从真实轨迹和故障注入两个渠道各收集 20 条以上假成功样本，按八类做初步标注', out:'⭐ 文献综述初稿 3000 字，加第一次组会汇报 PPT', mile:'能向导师讲清楚三件事：假成功是什么、手上有什么设施、第一篇要做成什么', stuck:'分类拿不准就标两轮，先粗后细，让样本自己把类别逼出来' },
    { w:'W5', ph:2, read:'补读方向 A 的相邻工作（顺 2606.09863 的引用链）', run:'写出标注协议 v1：每一类的定义、边界案例的仲裁规则、标注者一致性方案', out:'标注协议 v1，加一页假成功分类说明', stuck:'两个类别互相覆盖时，按导致失败的第一环归类，优先级写进协议' },
    { w:'W6', ph:2, read:'方向 A 的 2608.22331（噪声地板）加公共必读第 13 篇（HGB）', run:'设计基准任务集：难度分层、gold 状态定义、检测器统一接口，把 Atlas 的检测器注册成 baseline 之一', out:'⭐ 基准设计文档和检测器接口草案', stuck:'任务集不要贪大：先做 30—50 个能精确判定的任务，质量比数量重要' },
    { w:'W7', ph:2, read:'第二遍精读 2606.09863，这次做虚拟复现：按它的描述在脑中重跑一遍它的实验', run:'实现检测器 v1：声明层查输出结构，证据层查产物哈希和引用，状态层查环境断言，三层互相独立', out:'检测器 v1 能在自建任务上给出数字，哪怕暂时不如 baseline', stuck:'验证正确性先用退化设定：关掉自己加的层，结果应当精确等于 baseline，不等就说明有 bug' },
    { w:'W8', ph:2, read:'方向 B 的预备阅读（2608.23541、2607.26212）', run:'在 2 个任务域上跑全对比：LLM-as-Judge、退出码、Schema 检查、Atlas 内置检测', out:'⭐ 一页定稿的问题界定，加 baseline 对比表（论文表 1 的雏形），并开第二次组会', mile:'问题定稿、协议可用、对比表成型。到 W8 还定不下来，就主动找导师砍范围，这是 90 天里最关键的检查点', stuck:'检出率不占优就换比较角度：不比谁检出率高，比同样检出率下谁的误报率低、谁便宜' },
    { w:'W9', ph:3, read:'方向 E 的预备阅读（2310.06770、2607.28587）', run:'做消融：逐层去掉验证，看每层各贡献多少。再做误报分析：每一条误报都归因清楚', out:'消融表和误报案例集', stuck:'如果各层提升都不显著，把论文贡献改写成「协议加现象发现」，写法参照 HGB' },
    { w:'W10', ph:3, read:'精读目标会议（NeurIPS D&B 或 FSE）最近一年的同类论文 3 篇', run:'接入 reliability@k 协议，检查数据泄漏，做出 minibank-trap 的脱敏公开版', out:'完整的实验结果集、3—4 张图，加一份可公开的评测子集', stuck:'实验做不完就如实标注「进行中」，优先保证主表完整，不能挑好看的数字凑' },
    { w:'W11', ph:3, read:'研究目标会议的复现要求（D&B 的 artifact 条款）', run:'复跑关键实验：固定种子、3 次取均值和方差；把台账整理成论文附录', out:'可复现包：代码、配置、台账样例和 README 各一份', stuck:'复现包的整理至少预留一周，审稿人是真的会跑' },
    { w:'W12', ph:3, read:'—', run:'定稿 20 页汇报材料：问题定义、分类、基准、主表、消融、下一步计划', out:'⭐ 20 页汇报材料，加投稿目标和时间表', mile:'能完整讲清楚：假成功为什么重要、基准和检测器是什么、数字怎么样、还差什么' }
  ],
  plan90Switch:'这 12 周默认按<b>方向 A</b> 排。如果第一篇换了别的方向：<b>W1—W4 的公共层不动</b>（术语、环境、综述初稿对哪个方向都要用）；W5 开始改按那个方向卡里的阶段路线走，W8 检查点和 W12 汇报的时间不变。',
  fallback: [
    { s:'API 预算花完了', a:'Atlas 的成本预留先设成硬上限；抽取和轨迹生成的结果全部进缓存，后面的检测器实验都复用这批缓存轨迹，不再花钱' },
    { s:'检出率比不过 LLM-as-Judge', a:'换评价维度：同样的召回下误报率多少、每条判定能不能追溯到证据、token 成本多少。确定性检查在这几项上有天然优势' },
    { s:'三周没有进展', a:'降低目标：从「提出检测器」退到「系统性测量加现象发现」，先量清楚假成功在真实轨迹里的分布和类型占比。实证分析在 ICSE/FSE/ASE 也收' },
    { s:'题目被别人抢发', a:'检查还有哪里不一样，往相邻的空位走：分类、基准、检测、归因、审计这几个子问题可以轮换。同时准备了 6 个方向，就是为了这种时候' },
    { s:'导师不熟悉评测、验证这些概念', a:'用下表的术语翻译把问题说成他熟悉的语言（验证对应实验充分性，台账对应可追溯的实验记录）；汇报的前 6 页全部用他的叙事习惯' },
    { s:'minibank-trap 私有数据集被质疑', a:'按计划（W10）补一个脱敏的公开子集和公开协议。不等审稿人提，先主动放进复现包' }
  ],

  // ---------- 沟通 ----------
  translate: [
    ['Agent 假成功检测', '一套判断「实验是否真的成立」的协议。您审稿时会检查实验做得够不够，我做的就是把这种检查系统化'],
    ['证据层验证 / 执行溯源', '每次实验的输入、中间产物、输出都用哈希链固定下来，任何判定都能回溯到具体证据'],
    ['记忆评测（方向 C）', '对不同记忆组织方式做受控对比实验，图结构记忆是其中一个被评测的对象'],
    ['实体/事件/工具调用三类节点', '<b>异构图</b>：三种节点类型、多种边类型，可以定义元路径'],
    ['记忆分层与压缩', '<b>图聚类 / 社区发现加图粗化</b>：一个社区就是记忆的一个语义簇'],
    ['记忆检索', '<b>子图召回</b>：给定查询节点，抽取邻域或斯坦纳树'],
    ['记忆遗忘', '<b>边权随时间衰减，再做图稀疏化</b>'],
    ['GraphRAG 的社区摘要', '先用 Leiden 找社区，再对每个社区做文本摘要。<b>这里的 Leiden 正是可以用您的方法替换的一步</b>'],
    ['token 成本', '本质是检索子图的规模约束，对应<b>图压缩比</b>'],
    ['LLM 在我的系统里干什么', '特征抽取器加最后的读出（readout）函数；中间的图学习部分才是我们的主场']
  ],
  pitch:'老师，我的论文主线想做 Agent 系统的可信性问题。这些系统经常宣称任务完成了，但证据其实不成立。这和您审稿时检查一篇论文的实验是否真的成立，是同一类判断，我想把它做成可复算的基准和自动检测方法。为此我已经写了两个开源工具：一个是带假成功检测和产物哈希断言的多模型工作流引擎，一个是多模型交叉审查服务，它们可以直接当实验平台。另外我也想把您的图方法用到记忆评测上：把不同的记忆组织方式（包括图结构记忆）放在同一个协议下比成本、精度和延迟，这部分正好用得上您在属性图聚类和多嵌入融合上的积累。我的计划是第一篇做基准和检测，之后向记忆评测靠，具体怎么结合想听您的意见。',
  reportDeck: [
    { p:'1', c:'标题页', k:'标题从「可信 Agent 系统」说起，副标题点出图方法加评测的结合点' },
    { p:'2', c:'一页讲清场景', k:'讲 Agent 流水线的假成功现象，配一张真实故障截图（从 Atlas 台账的失败案例里选）' },
    { p:'3', c:'问题的形式化', k:'六级成功验证（声明、结构、证据、任务、安全、重复），假成功就是至少一层不成立' },
    { p:'4-5', c:'现状与不足', k:'分别说 LLM-as-Judge、退出码、Schema 检查各自会怎么失效；引 2606.09863 说明问题 2026 年刚被命名' },
    { p:'6', c:'研究空档', k:'现在的状况：有现象刻画，但没有可复算的基准和分层检测器，误报和成本也没人测' },
    { p:'7', c:'和课题组能力的衔接', k:'两条：证据链的组织可以借图的溯源结构；第三篇走向记忆评测，直接用属性图聚类和多嵌入融合（列出导师三篇相关论文）' },
    { p:'8-9', c:'方法草案', k:'按分类、基准、三层检测器的顺序讲；Atlas 的哈希断言和截断哨兵作为证据层 baseline 要重点展示' },
    { p:'10-11', c:'实验设计', k:'基准任务怎么分层，对比对象是 Judge、退出码、Schema 检查，指标是检出率、误报率、reliability@k 和成本' },
    { p:'12', c:'已完成的工作', k:'Atlas（542 项测试、真实故障拦截记录）、AgentParliament（37 星）、minibank-trap 首轮受控数据。导师信不信你，就看这一页' },
    { p:'13', c:'算力与成本评估', k:'全部实验单机可完成，LLM 走 API 且有成本预留和缓存。算力问题要主动讲，不要等他问' },
    { p:'14', c:'时间计划', k:'W8 定稿问题，W12 汇报，投稿目标是 NeurIPS D&B、ICSE/FSE 或 ESWA' },
    { p:'15', c:'需要的支持', k:'说到具体处：API 预算、服务器权限、组里有没有人做过评测或软工方向' }
  ],
  reportTips: [
    '<b>先讲他能判断的东西，再讲新的东西。</b>用「实验充分性的自动化」类比评测验证，用记忆评测衔接他的方法积累。不要一开头就堆 Agent 术语。',
    '<b>算力问题主动讲。</b>第 13 页说清单机可跑加成本预留机制，能明显提升他的信任。',
    '<b>工程背景要讲成资产，不是杂音。</b>两个开源仓库就是实验设施，说法是：实现和数据采集我自己能扛，想在问题形式化和论文写作上跟他学。'
  ],

  firstMail:{
    title:'给导师的第一封邮件（2026-08 修订版：主线已定，重点是建立联系）',
    dont:'两件事不要做：不要问「您的方向是什么」，这显得没做过功课；也不要写成单方面通知，结尾要留出让他调整方向的余地。',
    body:`刘老师您好：

我是今年录取到您门下的 XXX。入学前读了您几篇论文，2024 年 Neurocomputing 那篇 information-enhanced deep graph clustering，和 2025 年 KBS 上的 DSS-GCN，对其中"把多路互补信息用可学习方式融合"的思路印象很深。

我本科是软件工程，毕业后做了一年多 Python 后端和大模型应用开发，自己写了两个开源项目：一个多模型工作流引擎（带假成功检测、产物哈希断言和成本台账），一个多模型交叉审查的 MCP 服务。做的过程中我反复撞到同一个问题：Agent 系统经常"宣称完成"，但证据、环境状态并不成立。我想把这个问题做成可复算的评测基准和自动检测方法，这是我想申请的论文主线。

同时我也注意到，您的属性图聚类和多嵌入融合方法与"记忆评测"方向有直接结合点：把图结构记忆和其他记忆组织方式放在同一协议下做受控对比，图方法既能作为被评测对象，也能贡献设计。我希望主线之外，第二篇能往这个结合点走，具体怎么衔接想听您的意见。

如果可行，我入学前会先把评测协议和 baseline 复现做起来，开学时直接汇报进展。也想请问组里的算力情况，以便我把实验方案设计在可行范围内。

打扰您了，盼回复。

XXX`,
    effect:'这封邮件一次做完四件事：证明读过他的论文；亮出工程经历（两个开源仓库加工作背景）；方向由我提出、判断交给他；并且给他一个能用自己方法参与的入口（记忆评测）。他要不要支持、怎么支持，取决于有没有一个具体的地方可以下手。'
  }
};
