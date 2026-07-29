/* 板块 2：研究主线 —— 图结构化记忆驱动的多 Agent 协作
   arXiv 编号均经 arXiv API 按标题反查确认；引用量为 Semantic Scholar 2026-07-28 快照 */
window.RESEARCH = {

  positioning: {
    title: '对外叫「Agent 长期记忆系统」，不叫 GraphRAG',
    body: '在腾讯 625 条 + 百度 1287 条 JD 原文中，"GraphRAG" 出现 <b>0 次</b>；而"记忆/Memory"在腾讯技术岗出现 7.2%、"上下文工程" 6.7%、"知识图谱" 2.1%。图是你的实现手段，记忆与上下文才是市场语言。学术投稿用图的语言（对接导师），求职表述用记忆的语言（对接 JD）——这两套话术要同时准备。',
    tag: 'strategy'
  },

  // ---------- 五个切口 ----------
  angles: [
    {
      id:'A', star:true,
      name:'属性感知异构记忆图的社区发现与分层压缩',
      en:'Attribute-Aware Heterogeneous Community Detection for Long-Term Memory of LLM Agents',
      problem:'GraphRAG 用 Leiden、Zep 用标签传播划分记忆图社区——都是 2000 年代的经典无监督算法，假设图是同质、无属性、静态的。而记忆图是异构（实体/事件/工具调用）+ 带文本嵌入与时间戳 + 增量演化的。这个错配就是缝隙，且正好落在导师的属性图聚类与多嵌入融合强项上。',
      method:[
        '记忆图定义为异构属性图 G=(V,E,X,T)，三类节点，含时间与置信度属性',
        'HAN 式元路径注意力编码节点，融合结构嵌入与文本嵌入 ← 导师方法论签名',
        'DMoN 式可微模块度损失做端到端社区划分，加语义一致性正则',
        '社区内摘要形成分层记忆',
        '检索时社区级粗筛 → 节点级精排'
      ],
      exp:{
        graph:'Cora / Citeseer / DBLP / ACM，比 DMoN、SDCN、DAEGC、Leiden，指标 NMI / ARI / 模块度',
        e2e:'LoCoMo + LongMemEval + MultiHop-RAG，比 LightRAG、GraphRAG、A-MEM、Mem0，指标 F1 / Recall@k / token 成本 / 延迟'
      },
      venue:'KBS / ESWA / Neurocomputing（导师主场）；冲一冲 TOIS',
      cost:'低。图聚类单卡数小时；LLM 抽取一次性完成后缓存，API 成本估数百元',
      risk:'HKUDS 类团队可能抢先。缓解：把「异构三类节点 + 工具轨迹」作为不可替代的差异点',
      scores:{ fit:5, novel:4, cheap:5, first:5, safe:3 }
    },
    {
      id:'B',
      name:'工具调用轨迹入图：Agent 程序性记忆的图组织',
      en:'Tool-Trajectory-Enriched Heterogeneous Memory Graph with Subgraph Retrieval',
      problem:'现有记忆图节点类型基本是"实体 + 事件"。Agent 的核心行为是调工具，工具调用轨迹（调了什么、参数、返回、成败）是高价值的程序性记忆，但目前只被当扁平文本或 workflow 脚本存储，没有建成图节点参与图上推理。',
      method:[
        '从 τ-bench / AgentBench 轨迹抽取工具调用节点（工具名、参数模式、返回摘要、成败标签）',
        '建"实体—事件—工具调用"三元异构图，边含调用依赖与因果先后',
        '异构 GNN 学节点表示',
        'PCST / G-Retriever 式子图召回，同时召回相关实体与成功轨迹',
        '成败标签作为边权，让失败轨迹起负向指导'
      ],
      exp:{ graph:'—', e2e:'τ-bench（零售+航空）、AgentBench 子集；比无记忆、扁平文本记忆、Agent Workflow Memory、A-MEM、LEGOMem；指标任务成功率 / 平均步数 / token 成本 / 跨任务迁移成功率' },
      venue:'ESWA / KBS（应用导向）；EAAI（导师 2025 年发过）',
      cost:'中高。轨迹采集需大量 LLM 调用，是主要成本。缓解：用开源小模型跑 Agent，或复用已公开轨迹',
      risk:'成本风险最高。预算紧就只用离线公开轨迹',
      scores:{ fit:3, novel:5, cheap:2, first:3, safe:5 }
    },
    {
      id:'C',
      name:'预算约束下的记忆图压缩：压缩率-性能帕累托前沿',
      en:'Budget-Constrained Agent Memory Compression via Graph Coarsening',
      problem:'所有工作都报"我比 full-context 省了 X% token 且准确率更高"，但没人给出「给定 token 预算，如何组织记忆使性能最优」这条曲线。图粗化领域有成熟的"压缩比 vs 谱性质保持"理论，完全没被引入记忆场景。',
      method:[
        '把记忆压缩形式化为图粗化：保持检索相关谱性质的前提下最小化节点数',
        '借 2106.05150 的粗化框架，设计以检索效用为目标的粗化准则',
        '社区发现产出候选超节点，逐层粗化形成多分辨率记忆',
        '检索时按预算自适应选择分辨率层'
      ],
      exp:{ graph:'—', e2e:'LoCoMo / LongMemEval / NarrativeQA。核心产出是帕累托曲线（x=token 预算，y=准确率），比 full-context、随机丢弃、衰减式、RAPTOR、SeCom' },
      venue:'Neurocomputing / Applied Soft Computing',
      cost:'最低。纯图算法 + 缓存嵌入',
      risk:'可能被评"已有技术的组合应用"。缓解：粗化准则要有真正新东西 + 给简单误差界',
      scores:{ fit:4, novel:4, cheap:5, first:5, safe:3 }
    },
    {
      id:'D',
      name:'多 Agent 共享记忆图的冲突类型学与消解',
      en:'Conflict Taxonomy and Graph-based Resolution for Shared Memory in Multi-Agent LLM Systems',
      problem:'多 Agent 并发写入共享记忆图会产生时间冲突、来源冲突、置信冲突。现有系统用"后写覆盖"这种朴素规则，冲突的类型学与图上消解算法都是空白。',
      method:[
        '提出冲突类型学（时序矛盾 / 属性矛盾 / 关系矛盾 / 来源不可信）',
        '记忆图上定义一致性约束，冲突检测转化为矛盾子图识别',
        '用社区结构做冲突局部化（冲突通常在同一社区内），降低检测复杂度',
        '消解融合来源可信度传播（PageRank 式）与时序优先规则',
        '可选安全视角：注入恶意记忆时的鲁棒性 ← 对接导师 AI 安全兴趣'
      ],
      exp:{ graph:'—', e2e:'需自建冲突数据集（在 LoCoMo 上程序注入冲突），比 Mem0 / Zep / MIRIX 默认策略，用 MemoryAgentBench 的冲突消解维度' },
      venue:'KBS / ESWA；安全角度可对接导师官网自述的 AI 安全方向',
      cost:'低',
      risk:'2026 年已开始热（多篇 Governed Shared Memory 预印本：2606.24535 / 2605.04264 / 2606.18829）；自建数据集会被质疑代表性。建议作第二或第三篇',
      scores:{ fit:3, novel:4, cheap:5, first:3, safe:2 }
    },
    {
      id:'E',
      name:'记忆图的动态社区演化与增量维护',
      en:'Dynamic Community Evolution for Incrementally Growing Agent Memory Graphs',
      problem:'记忆持续增长，社区结构要么全量重算（贵）要么不更新（漂移导致检索退化）。而"社区结构漂移对检索质量的影响"从未被量化。',
      method:[
        '定义记忆图的增量更新流',
        '增量社区维护算法（局部重划分 + 触发条件判定）',
        '引入时间衰减边权 ← 呼应导师 DSS-GCN 的 dynamic 思想',
        '量化"社区漂移度"指标并研究其与检索质量的相关性'
      ],
      exp:{ graph:'—', e2e:'把 LoCoMo 对话按时间切成多 session 模拟增长；比全量重算（上界）、不更新（下界）、LightRAG 增量策略、Zep' },
      venue:'Neurocomputing / KBS',
      cost:'低',
      risk:'提升可能只体现在效率而非效果，故事性稍弱。缓解：把"漂移量化"做成独立贡献',
      scores:{ fit:5, novel:3, cheap:5, first:4, safe:5 }
    }
  ],

  angleAdvice: '第一篇做 <b>A</b>，把 <b>C</b> 的帕累托曲线作为 A 的一组实验（A 的实验部分立刻厚实）。第二篇做 <b>B</b>（届时已有轨迹数据与实验框架积累）。<b>D</b> 留作与导师安全兴趣结合的第三篇。五个切口全部按"不训练大模型、LLM 走 API 可缓存、单卡够用"筛选，这是刻意的。',

  // ---------- 阅读清单 ----------
  reading: {
    L0: {
      name:'第 0 层 · 必读奠基',
      note:'按下列顺序读，合计约 35 小时，压在开学前三周。顺序不是按年份，是按理解依赖。',
      items:[
        { n:1, t:'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks', ax:'2005.11401', y:'2020-05', v:'NeurIPS 2020', c:16334, h:'2h', why:'整条技术线起点，写 related work 必引' },
        { n:2, t:'Generative Agents: Interactive Simulacra of Human Behavior', ax:'2304.03442', y:'2023-04', v:'UIST 2023', c:4898, h:'3h', why:'memory stream + 三因子检索 + reflection 树。Agent 记忆的原型，reflection 就是记忆压缩的雏形' },
        { n:3, t:'MemGPT: Towards LLMs as Operating Systems', ax:'2310.08560', y:'2023-10', v:'arXiv（后演化为 Letta）', c:989, h:'2h', why:'借 OS 虚拟内存做记忆分页。记忆管理的系统视角，也是你要避开的重工程方向典型' },
        { n:4, t:'RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval', ax:'2401.18059', y:'2024-01', v:'ICLR 2024', c:589, h:'3h', why:'和你切口最近的先驱：同样用聚类做记忆分层，但用 GMM 而非图方法', key:true },
        { n:5, t:'From Local to Global: A Graph RAG Approach to Query-Focused Summarization', ax:'2404.16130', y:'2024-04', v:'微软研究院技术报告', c:1815, h:'4h', why:'导师技术栈的直接接口。精读它的社区层级构建——Leiden 就是你要替换的那一行', key:true },
        { n:6, t:'HippoRAG: Neurobiologically Inspired Long-Term Memory for LLMs', ax:'2405.14831', y:'2024-05', v:'NeurIPS 2024', c:284, h:'3h', why:'用 PPR 在开放 KG 上模拟海马索引。图算法替代多轮检索的范式，PPR 是你能立刻上手的工具' },
        { n:7, t:'From RAG to Memory: Non-Parametric Continual Learning for LLMs (HippoRAG 2)', ax:'2502.14802', y:'2025-02', v:'ICML 2025', c:181, h:'3h', why:'段落节点+概念节点混合图，明确把 RAG 重定义为 memory 问题' },
        { n:8, t:'LightRAG: Simple and Fast Retrieval-Augmented Generation', ax:'2410.05779', y:'2024-10', v:'EMNLP 2025', c:386, h:'3h', why:'最易复现的 baseline，也是最常被比较的对象', key:true },
        { n:9, t:'G-Retriever: RAG for Textual Graph Understanding and QA', ax:'2402.07630', y:'2024-02', v:'NeurIPS 2024', c:321, h:'3h', why:'把子图检索形式化为带奖赏斯坦纳树（PCST）。你的子图召回要从这里出发' },
        { n:10, t:'A-MEM: Agentic Memory for LLM Agents', ax:'2502.12110', y:'2025-02', v:'NeurIPS 2025', c:772, h:'4h', why:'和你切口撞得最厉害的一篇。Zettelkasten 式记忆自主生成链接并演化。必须精读并想清差异点', key:true, warn:true },
        { n:11, t:'Zep: A Temporal Knowledge Graph Architecture for Agent Memory', ax:'2501.13956', y:'2025-01', v:'arXiv（Zep 公司）', c:263, h:'3h', why:'Graphiti 引擎三层时序图。它已经做了社区层——你要读懂它社区层的粗糙之处', key:true, warn:true },
        { n:12, t:'Mem0: Building Production-Ready AI Agents with Scalable Long-Term Memory', ax:'2504.19413', y:'2025-04', v:'ECAI 2025', c:492, h:'2h', why:'工业界最主流的对比对象，LOCOMO 数字被反复引用' }
      ]
    },
    L1S: {
      name:'第 1 层A · 综述（最快建立全局图景）',
      note:'先读这几篇，术语体系一次建立好，后面读方法论文会快很多。',
      items:[
        { t:'A Survey on the Memory Mechanism of LLM-based Agents', ax:'2404.13501', y:'2024-04', v:'ACM TOIS', c:664, why:'首篇 Agent 记忆专门综述，source/form/operation 三维分类。第一本该读的' },
        { t:'From Human Memory to AI Memory: A Survey', ax:'2504.15965', y:'2025-04', v:'arXiv', c:106, why:'情节/语义/程序性记忆分类法的出处' },
        { t:'From Storage to Experience: A Survey on the Evolution of LLM Agent Memory', ax:'2605.06716', y:'2026-05', v:'ACL 2026 Findings', c:10, why:'最新全局图景，直接给你 2026 年的 open problems' },
        { t:'Graph Retrieval-Augmented Generation: A Survey', ax:'2408.08921', y:'2024-08', v:'ACM TOIS', c:500, why:'GraphRAG 首篇综述，G-Indexing/G-Retrieval/G-Generation 三段框架。你论文的图检索分类框架就用它' },
        { t:'Cognitive Architectures for Language Agents (CoALA)', ax:'2309.02427', y:'2023-09', v:'TMLR', c:449, why:'把 Agent 拆成记忆/动作空间/决策循环' },
        { t:'Retrieval-Augmented Generation with Graphs (GraphRAG)', ax:'2501.00309', y:'2024-12', v:'arXiv', c:236, why:'从图类型维度组织' }
      ]
    },
    L1M: {
      name:'第 1 层B · 代表性方法',
      items:[
        { t:'MemoryBank: Enhancing LLMs with Long-Term Memory', ax:'2305.10250', y:'2023-05', v:'AAAI 2024', c:569, why:'艾宾浩斯遗忘曲线做记忆更新。遗忘机制的经典引用' },
        { t:'Think-in-Memory', ax:'2311.08719', y:'2023-11', v:'arXiv', c:null, why:'存"思考结果"而非原始对话。记忆粒度设计的反例参考' },
        { t:'AriGraph: KG World Models with Episodic Memory for LLM Agents', ax:'2407.04363', y:'2024-07', v:'IJCAI 2025', c:92, why:'语义+情节记忆融合的世界模型图。异构记忆图的直接前身，代码开源', key:true },
        { t:'Agent Workflow Memory', ax:'2409.07429', y:'2024-09', v:'ICML 2025', c:207, why:'从历史轨迹归纳可复用 workflow。切口 B 的主要对手' },
        { t:'MemoRAG', ax:'2409.05591', y:'2024-09', v:'WWW 2025', c:127, why:'轻量全局记忆模型生成检索线索。记忆作为索引器的思路' },
        { t:'SeCom: On Memory Construction and Retrieval for Personalized Agents', ax:'2502.05589', y:'2025-02', v:'ICLR 2025', c:79, why:'论证记忆最优粒度是"话题段"。你做压缩率实验必引', key:true },
        { t:'Memory OS of AI Agent (MemoryOS)', ax:'2506.06326', y:'2025-05', v:'EMNLP 2025', c:92, why:'短期/中期/长期三级存储+页面调度。国内同类（北邮），可参考其投稿路径' },
        { t:'MIRIX: Multi-Agent Memory System for LLM-Based Agents', ax:'2507.07957', y:'2025-07', v:'arXiv', c:135, why:'六类记忆模块由多 Agent 分工管理。多 Agent+记忆的直接对手', warn:true },
        { t:'From Experience to Strategy: Trainable Graph Memory', ax:'2511.07800', y:'2025-11', v:'arXiv', c:10, why:'"可训练图记忆"这个词已被占，读它划清边界', warn:true },
        { t:'General Agentic Memory Via Deep Research', ax:'2511.18423', y:'2025-11', v:'arXiv', c:31, why:'反方观点：放弃预构建索引。读它想清"预构图是否必要"' },
        { t:'Memory is Reconstructed, Not Retrieved: Graph Memory for LLM Agents', ax:'2606.06036', y:'2026-06', v:'ICML 2026', c:2, why:'2026 最新且撞方向，必读', key:true, warn:true },
        { t:'Implicit Graph, Explicit Retrieval: Efficient Long-horizon Memory', ax:'2601.03417', y:'2026-01', v:'arXiv', c:0, why:'与你"轻量"定位一致，看它省在哪' },
        { t:'Oblivion: Self-Adaptive Agentic Memory Control through Decay-Driven Activation', ax:'2604.00131', y:'2026-03', v:'arXiv（NEC Labs）', c:0, why:'遗忘/压缩的 2026 最新对手，代码开源' }
      ]
    },
    L1B: {
      name:'第 1 层C · 评测基准（当数据集论文读）',
      items:[
        { t:'Evaluating Very Long-Term Conversational Memory (LoCoMo)', ax:'2402.17753', y:'2024-02', v:'ACL 2024', c:664, why:'超长对话记忆基准，事实上的行业标准', key:true },
        { t:'LongMemEval: Benchmarking Chat Assistants on Long-Term Interactive Memory', ax:'2410.10813', y:'2024-10', v:'ICLR 2025', c:450, why:'500 问，五类记忆能力细分诊断' },
        { t:'MemoryAgentBench: Evaluating Memory via Incremental Multi-Turn Interactions', ax:'2507.05257', y:'2025-07', v:'arXiv', c:156, why:'四维能力：精确检索/测试时学习/长程理解/冲突消解。"冲突消解"维度直接对应切口 D', key:true }
      ]
    },
    L2: {
      name:'第 2 层 · 图学习方法侧（对接导师技术栈）',
      note:'这一层是你和导师的公共语言。读完才能在组会上跟他有效对话。',
      items:[
        { t:'Semi-Supervised Classification with Graph Convolutional Networks (GCN)', ax:'1609.02907', y:'2016', v:'ICLR 2017', c:36222, why:'导师所有论文的地基', cat:'基础' },
        { t:'Graph Attention Networks (GAT)', ax:'1710.10903', y:'2017', v:'ICLR 2018', c:27410, why:'导师偏爱注意力机制', cat:'基础' },
        { t:'Inductive Representation Learning on Large Graphs (GraphSAGE)', ax:'1706.02216', y:'2017', v:'NeurIPS 2017', c:20487, why:'邻居采样 → 你的子图采样', cat:'基础' },
        { t:'Heterogeneous Graph Attention Network (HAN)', ax:'1903.07293', y:'2019', v:'WWW 2019', c:3260, why:'元路径+节点级/语义级双注意力。你记忆图的主干候选', cat:'异构图', key:true },
        { t:'Heterogeneous Graph Transformer (HGT)', ax:'2003.01332', y:'2020', v:'WWW 2020', c:1697, why:'元关系参数化注意力，免手工元路径', cat:'异构图' },
        { t:'Are we really making much progress? Revisiting HGNNs (HGB)', ax:'2112.14936', y:'2021', v:'KDD 2021', c:481, why:'泼冷水式评测基准，帮你避免虚假提升', cat:'异构图', key:true },
        { t:'Attributed Graph Clustering: Deep Attentional Embedding (DAEGC)', ax:'1906.06532', y:'2019', v:'IJCAI 2019', c:646, why:'属性图聚类奠基，导师 ASOC 2024 的同族', cat:'图聚类' },
        { t:'Structural Deep Clustering Network (SDCN)', ax:'2002.01633', y:'2020', v:'WWW 2020', c:686, why:'AE+GCN 双流融合。导师"多嵌入融合"的思想来源', cat:'图聚类', key:true },
        { t:'Graph Clustering with Graph Neural Networks (DMoN)', ax:'2006.16904', y:'2020', v:'JMLR 24(127) 2023', c:413, why:'可微模块度池化。端到端社区发现的关键武器', cat:'图聚类', key:true },
        { t:'A Survey of Deep Graph Clustering', ax:'2211.12875', y:'2022', v:'IEEE TKDE', c:53, why:'深度图聚类综述 + 开源资源清单', cat:'图聚类' },
        { t:'Simple Contrastive Graph Clustering (SCGC)', ax:'2205.07865', y:'2022', v:'IEEE TNNLS', c:196, why:'极简对比式图聚类，单卡友好', cat:'图聚类' },
        { t:'Hard Sample Aware Network for Contrastive Deep Graph Clustering', ax:'2212.08665', y:'2022', v:'AAAI 2023', c:185, why:'难样本感知', cat:'图聚类' },
        { t:'Dink-Net: Neural Clustering on Large Graphs', ax:'2305.18405', y:'2023', v:'ICML 2023', c:81, why:'可扩展到大图', cat:'图聚类' },
        { t:'A Comprehensive Survey on Community Detection with Deep Learning', ax:'2105.12584', y:'2021', v:'IEEE TNNLS', c:456, why:'导师方向的地图', cat:'社区发现' },
        { t:'Graph Summarization Methods and Applications: A Survey', ax:'1612.04883', y:'2016', v:'ACM CSUR', c:156, why:'"记忆压缩"的理论词汇库', cat:'图压缩' },
        { t:'Scaling Up GNNs Via Graph Coarsening', ax:'2106.05150', y:'2021', v:'KDD 2021', c:144, why:'图粗化。直接可迁移为记忆图分层压缩（切口 C 的地基）', cat:'图压缩', key:true },
        { t:'GRAG: Graph Retrieval-Augmented Generation', ax:'2405.16506', y:'2024', v:'NAACL 2025 Findings', c:134, why:'图检索补充', cat:'图检索' },
        { t:'HybGRAG', ax:'2412.16311', y:'2024', v:'ACL 2025', c:43, why:'混合检索', cat:'图检索' },
        { t:'HiRAG: RAG with Hierarchical Knowledge', ax:'2503.10150', y:'2025', v:'EMNLP 2025 Findings', c:40, why:'层级知识，与你的分层记忆重叠，注意划界', cat:'图检索' }
      ]
    },
    L3: {
      name:'第 3 层 · 多 Agent 协作与通信',
      items:[
        { t:'CAMEL: Communicative Agents for Mind Exploration', ax:'2303.17760', y:'2023', v:'NeurIPS 2023', c:1654, why:'角色扮演式协作起点' },
        { t:'ChatDev: Communicative Agents for Software Development', ax:'2307.07924', y:'2023', v:'ACL 2024', c:1006, why:'瀑布流式多 Agent 协作' },
        { t:'MetaGPT: Meta Programming for Multi-Agent Collaborative Framework', ax:'2308.00352', y:'2023', v:'ICLR 2024', c:2177, why:'SOP 编码进 Agent 分工' },
        { t:'AutoGen: Multi-Agent Conversation', ax:'2308.08155', y:'2023', v:'COLM 2024', c:2178, why:'最主流 MAS 框架，AgentParliament 的对标物', key:true },
        { t:'AgentVerse', ax:'2308.10848', y:'2023', v:'ICLR 2024', c:704, why:'动态组队+涌现行为' },
        { t:'LLM based Multi-Agents: A Survey of Progress and Challenges', ax:'2402.01680', y:'2024', v:'IJCAI 2024', c:1047, why:'MAS 综述入口' },
        { t:'Language Agents as Optimizable Graphs (GPTSwarm)', ax:'2402.16823', y:'2024', v:'ICML 2024', c:null, why:'把 Agent 系统建模为可优化图。你切口的方法论范本', key:true },
        { t:'Scaling LLM-based Multi-Agent Collaboration (MacNet)', ax:'2406.07155', y:'2024', v:'ICLR 2025', c:null, why:'协作拓扑的规模定律' },
        { t:'Improving Multi-Agent Debate with Sparse Communication Topology', ax:'2406.11776', y:'2024', v:'EMNLP 2024 Findings', c:null, why:'稀疏拓扑省 token 且不掉性能' },
        { t:'AFlow: Automating Agentic Workflow Generation', ax:'2410.10762', y:'2024', v:'ICLR 2025', c:null, why:'MCTS 搜索 workflow 图' },
        { t:'G-Designer: Multi-agent Communication Topologies via GNNs', ax:'2410.11782', y:'2024', v:'ICML 2025', c:88, why:'用 VGAE 生成通信拓扑。导师方法能直接读懂的一篇', key:true },
        { t:'Multi-agent Architecture Search via Agentic Supernet (MaAS)', ax:'2502.04180', y:'2025', v:'ICML 2025', c:null, why:'超网式架构搜索' },
        { t:'Why Do Multi-Agent LLM Systems Fail? (MAST)', ax:'2503.13657', y:'2025', v:'NeurIPS 2025', c:474, why:'14 类失败模式分类，信息共享失败直指切口 D', key:true },
        { t:'LEGOMem: Modular Procedural Memory for Multi-agent LLM Systems', ax:'2510.04851', y:'2025', v:'会议论文集', c:29, why:'多 Agent 程序性记忆分配。切口 B 的对手' },
        { t:'Topology Matters: Measuring Memory Leakage in Multi-Agent LLMs', ax:'2512.04668', y:'2025', v:'ACL 2026 Findings', c:5, why:'拓扑影响记忆泄漏。安全侧切入点，对接导师 AI 安全' },
        { t:'INMS: Memory Sharing for LLM based Agents', ax:'2404.09982', y:'2024', v:'arXiv', c:null, why:'早期记忆共享池尝试' }
      ]
    }
  },

  // ---------- 已饱和 ----------
  saturated: [
    { t:'"用知识图谱组织 Agent 记忆"这个大框架本身', e:'Zep/Graphiti、A-MEM、AriGraph、GraphRAG、LightRAG、MIRIX 全都做了', j:'单纯"我建了个记忆图"已无新意' },
    { t:'实体-关系抽取式的记忆图构建管线', e:'微软 GraphRAG、LightRAG、Graphiti 三套开源实现', j:'工程细节已被穷尽' },
    { t:'层级摘要式记忆压缩（树形）', e:'RAPTOR 用 GMM+摘要，GraphRAG 用 Leiden+社区摘要，HiRAG 也做了', j:'用"聚类+摘要"当唯一贡献已经不够' },
    { t:'只在 LoCoMo 上刷点', e:'Mem0、A-MEM、Zep、MemoryOS 全在这个榜上，数字互相矛盾', j:'我的判断：只刷 LoCoMo 很难说服审稿人' },
    { t:'遗忘曲线式记忆衰减', e:'MemoryBank(2023) → Oblivion(2026) 已完整覆盖', j:'饱和' },
    { t:'多 Agent 通信拓扑优化', e:'GPTSwarm / G-Designer / MacNet / AFlow / MaAS 五篇顶会连续做', j:'很卷，且需要大量 LLM 调用预算' },
    { t:'再写一篇 Agent 记忆综述', e:'2024 年 2 篇 TOIS + 2025/2026 各 1 篇', j:'轮不到你写' }
  ],

  // ---------- 竞争团队 ----------
  rivals: [
    { n:'HKU Data Intelligence Lab (HKUDS, Chao Huang)', w:'LightRAG + 大量 GraphRAG 变体', f:'极高，几乎月更', note:'最需盯的团队，最容易被抢先', level:'danger' },
    { n:'Rutgers AGI Research (Yongfeng Zhang)', w:'A-MEM, AIOS', f:'高', note:'Agent 记忆的主要产出方', level:'danger' },
    { n:'OSU NLP Group (Yu Su)', w:'HippoRAG 1 & 2', f:'高，NeurIPS/ICML 级', note:'神经科学叙事+图算法，正面竞争难', level:'warn' },
    { n:'Microsoft Research', w:'GraphRAG', f:'中，但影响力极大', note:'工程投入大，不要在系统层面比', level:'warn' },
    { n:'北大 / BAAI (qhjqhj00)', w:'MemoRAG, MemoBrain', f:'高', note:'中文社区强', level:'warn' },
    { n:'Zep AI（公司）', w:'Zep / Graphiti', f:'中', note:'工业界，评测口径偏向自家', level:'ok' },
    { n:'Mem0（公司）', w:'Mem0', f:'中', note:'同上', level:'ok' },
    { n:'BAI-LAB（北邮）', w:'MemoryOS', f:'中', note:'国内同类，可参考投稿路径', level:'ok' },
    { n:'AIRI Institute（俄）', w:'AriGraph', f:'低', note:'但方向最接近你', level:'ok' },
    { n:'Snap Research', w:'LoCoMo', f:'低', note:'数据集方', level:'ok' }
  ],
  rivalJudgement:'HKUDS 和 agiresearch 的产出速度是你最大的现实风险。单卡+新手无法在速度上竞争，必须靠「导师方法论的独特性」建立差异化，而不是靠「更大更全的系统」。这也是为什么切口设计要牢牢咬住属性图聚类与多嵌入融合——那是别人不会顺手做的方向。',

  // ---------- 代码与数据 ----------
  repos: [
    { r:'HKUDS/LightRAG', s:38248, l:'MIT', p:'2026-07-28', rep:'Dockerfile ×3 + compose ×3 + requirements ×4', ease:5, note:'最易复现，首选 baseline', pick:true },
    { r:'gusye1234/nano-graphrag', s:3946, l:'MIT', p:'2026-01-27', rep:'requirements ×2, setup.py', ease:5, note:'约千行的教学级实现，最适合改造与读懂原理', pick:true },
    { r:'mem0ai/mem0', s:61884, l:'Apache-2.0', p:'2026-07-25', rep:'poetry.lock, pyproject', ease:4, note:'库式设计，但论文实验非全开源' },
    { r:'getzep/graphiti', s:29267, l:'Apache-2.0', p:'2026-07-28', rep:'Dockerfile + compose ×2', ease:4, note:'需 Neo4j / FalkorDB' },
    { r:'OSU-NLP-Group/HippoRAG', s:3892, l:'MIT', p:'2026-07-24', rep:'requirements.txt, setup.py', ease:4, note:'含 HippoRAG 2 代码' },
    { r:'microsoft/graphrag', s:34938, l:'MIT', p:'2026-07-26', rep:'pyproject, uv.lock', ease:3, note:'索引阶段 LLM 调用量大，会烧掉你的 API 预算。不要一上手碰', warn:true },
    { r:'agiresearch/A-mem', s:1126, l:'MIT', p:'2025-12-12', rep:'pyproject, requirements', ease:4, note:'撞方向的那篇，必须跑一遍' },
    { r:'letta-ai/letta（原 MemGPT）', s:23991, l:'Apache-2.0', p:'2026-07-22', rep:'Dockerfile + compose', ease:3, note:'已产品化，偏离论文' },
    { r:'qhjqhj00/MemoRAG', s:2259, l:'Apache-2.0', p:'2025-09-11', rep:'—', ease:3, note:'' },
    { r:'BAI-LAB/MemoryOS', s:1525, l:'Apache-2.0', p:'2026-07-07', rep:'—', ease:3, note:'' },
    { r:'parthsarthi03/raptor', s:1729, l:'MIT', p:'2024-09-03', rep:'requirements.txt', ease:3, note:'已两年未更新' },
    { r:'XiaoxinHe/G-Retriever', s:549, l:'MIT', p:'2025-03-19', rep:'根目录未见依赖文件', ease:2, note:'需自行配环境' },
    { r:'AIRI-Institute/AriGraph', s:173, l:'MIT', p:'2024-09-10', rep:'—', ease:2, note:'需 TextWorld 环境' },
    { r:'nec-research/oblivion', s:6, l:'NOASSERTION', p:'2026-05-25', rep:'—', ease:2, note:'很新，star 少' }
  ],
  repoPath:'<b>复现路径</b>：nano-graphrag（读懂原理，代码量小，能定位到"社区划分在哪一行"）→ LightRAG（Docker 一键跑通完整 baseline）→ 在 LightRAG 上替换社区划分模块做你的方法。GitHub 数据为 REST API 实测，2026-07-28。',

  datasets: {
    mem:[
      { n:'LoCoMo', ax:'2402.17753', size:'50 段超长对话，平均约 300 轮', get:'snap-research/locomo（1049★）', use:'Agent 记忆事实标准', key:true },
      { n:'LongMemEval', ax:'2410.10813', size:'500 问，5 类能力', get:'xiaowu0162/LongMemEval（967★, MIT）', use:'记忆能力细分诊断', key:true },
      { n:'MemoryAgentBench', ax:'2507.05257', size:'四维能力', get:'见论文', use:'含冲突消解维度', key:true },
      { n:'τ-bench', ax:'2406.12045', size:'零售/航空双域', get:'sierra-research/tau-bench（1351★, MIT）', use:'工具调用轨迹来源（切口 B）' },
      { n:'AgentBench', ax:'2308.03688', size:'8 类环境', get:'THUDM/AgentBench（3607★, Apache-2.0）', use:'Agent 轨迹来源' },
      { n:'GAIA', ax:'2311.12983', size:'466 问', get:'HF gaia-benchmark', use:'通用助手能力' }
    ],
    qa:[
      { n:'HotpotQA', ax:'1809.09600', size:'113k 问', get:'hotpotqa.github.io / HF', use:'多跳 QA 标配' },
      { n:'2WikiMultihopQA', ax:'2011.01060', size:'约 19 万问', get:'Alab-NII/2wikimultihop', use:'带推理路径标注' },
      { n:'MuSiQue', ax:'2108.00573', size:'约 2.5 万问', get:'StonyBrookNLP/musique', use:'抗捷径设计，最难' },
      { n:'MultiHop-RAG', ax:'2401.15391', size:'2556 问', get:'yixuantt/MultiHop-RAG', use:'RAG 专用多跳' },
      { n:'NarrativeQA', ax:'1712.07040', size:'1567 故事 / 46765 问', get:'google-deepmind/narrativeqa', use:'长文档理解' },
      { n:'GraphRAG-Bench', ax:'2506.02404', size:'领域推理', get:'GraphRAG-Bench/GraphRAG-Benchmark', use:'GraphRAG 专用评测' },
      { n:'UltraDomain', ax:null, size:'多领域长文档', get:'LightRAG README / HF', use:'LightRAG 对比必需' }
    ],
    graph:[
      { n:'Cora / Citeseer / PubMed', ax:'1603.08861', size:'2708 / 3327 / 19717 节点', get:'PyG Planetoid 一行加载', use:'图聚类标配，导师论文全用它', key:true },
      { n:'DBLP / ACM / IMDB 异构图', ax:null, size:'DBLP 约 2.6 万节点', get:'PyG DBLP/IMDB 或 HGB', use:'异构图标配，你的方法要先在这验证', key:true },
      { n:'HGB', ax:'2112.14936', size:'多个异构图', get:'THUDM/HGB', use:'公平评测协议' },
      { n:'OGB', ax:'2005.00687', size:'ogbn-arxiv 169k / products 240 万', get:'ogb pip 包', use:'规模化验证' }
    ]
  },
  dualTrack:'<b>双轨验证是本方向最关键的策略。</b>先在 Cora / DBLP 这类导师熟悉的图数据集上证明聚类模块本身有效（他能看懂、能背书、能给实质修改意见），再在 LoCoMo / LongMemEval 上证明端到端记忆效果（这部分对接求职叙事）。这是把导师能力转化为你的资产的最直接方式，也是让一个他不熟的题目变成他能指导的题目的唯一办法。',

  metrics: [
    { g:'效果', items:['F1 / EM / Accuracy','Recall@k, MRR, nDCG','多跳准确率（按 hop 分层）← 最能体现图方法优势','LLM-as-Judge 四维胜率（comprehensiveness/diversity/empowerment）'] },
    { g:'成本', items:['Prompt token / 查询','索引阶段总 token 与 LLM 调用次数、费用 ← 单卡穷学生的核心卖点'] },
    { g:'延迟', items:['端到端检索延迟 P50 / P95 / P99'] },
    { g:'压缩', items:['记忆压缩率 = 压缩后 token / 原始 token','图规模压缩比（节点/边缩减）← 来自图粗化领域'] },
    { g:'图质量', items:['模块度 Q、NMI、ARI、Conductance ← 导师最熟的一组','社区数稳定性、结构漂移度（动态场景）'] },
    { g:'记忆专用', items:['冲突消解正确率（MemoryAgentBench）','时序推理准确率','遗忘的选择性（该忘的忘了、该留的留了）','记忆连贯性 ← 百度 JD 原词，求职时用这个说法'] },
    { g:'鲁棒', items:['记忆投毒下的准确率保持 ← 对接导师 AI 安全方向'] }
  ],

  // ---------- 90 天 ----------
  plan90: [
    { w:'W1', ph:1, read:'第 0 层 1/2/3/4（RAG、Generative Agents、MemGPT、RAPTOR）+ 综述 2404.13501', run:'配环境 PyTorch+PyG+LLM API 客户端；跑通 PyG 官方 GCN on Cora', out:'术语对照表（记忆类型/操作/评测）；环境可用', stuck:'PyG 装不上就用 DGL 或纯 PyTorch sparse。环境别死磕，先用 conda 官方 whl' },
    { w:'W2', ph:1, read:'GraphRAG、LightRAG、综述 2408.08921', run:'精读 nano-graphrag 全部源码（约千行），画出数据流图', out:'架构笔记，明确标出"社区划分"在哪一行', stuck:'看不懂就先跑起来打断点看中间产物，不要试图一次看懂全部' },
    { w:'W3', ph:1, read:'HippoRAG 1&2、G-Retriever', run:'Docker 起 LightRAG，在小数据集（UltraDomain 单域或自建 100 篇文档）跑通索引+查询', out:'第一份 baseline 数字（哪怕规模很小）', stuck:'Docker 失败就退回 pip 装 + 单文件脚本；API 超支就换更便宜的模型做抽取' },
    { w:'W4', ph:1, read:'A-MEM、Zep、Mem0 + 综述 2605.06716', run:'在 LoCoMo 子集（先取 5 段对话）跑通 LightRAG 或 A-MEM，拿可比数字', out:'⭐ 文献综述初稿 3000 字 + 第一次组会汇报 PPT', stuck:'数据集处理卡住就先用 LongMemEval 的 oracle 设定简化；A-MEM 跑不通就只留 LightRAG 一个 baseline', mile:'能对导师说"我复现了 X，在 Y 上拿到 Z 分，代码在我手上跑得动"' },
    { w:'W5', ph:2, read:'SDCN、DAEGC、DMoN + 导师 ASOC 2024 与 Neurocomputing 2024 原文', run:'在 Cora/Citeseer 跑通 DMoN 和 SDCN，确认 NMI/ARI 能复现论文数字', out:'导师方法论拆解笔记：他的"多嵌入融合"具体融合了什么', stuck:'复现不出原数字就用作者仓库预设超参，别自己调。差 2-3 个点是正常的' },
    { w:'W6', ph:2, read:'HAN、HGT、HGB 基准', run:'在 DBLP 异构图跑通 HAN；把 LightRAG 产出的记忆图导出为 PyG 异构图对象', out:'⭐ 切口定稿一页纸 + 记忆图统计特征报告（节点类型分布、度分布、连通性）', stuck:'导出格式卡住就手写 networkx→PyG 转换；异构图跑不动就先退化为同质图' },
    { w:'W7', ph:2, read:'与切口最近的 3-4 篇针对性精读（选 A 则从本站 L1M/L2 层标 ⭐ 的撞方向论文中挑：A-MEM、Zep、2606.06036、SDCN、DMoN）', run:'搭自己的实验框架：统一 config/数据加载/指标计算/结果落盘，把 baseline 全部纳管', out:'能一键复跑的实验脚本仓库', stuck:'框架别过度设计，一个 yaml + 一个 runner 就够，直接复用 LightRAG 目录结构' },
    { w:'W8', ph:2, read:'GPTSwarm、G-Designer、MAST', run:'跑齐 2-3 个 baseline × 2 个数据集的完整对比', out:'⭐ Baseline 对比表（可直接放进论文的表 1）+ 第二次组会', stuck:'数据集太贵就固定用小规模子集并在论文中说明；baseline 跑不齐就减到 2 个但把消融做深', mile:'切口确定、框架可用、baseline 表格成型。这是 90 天最关键的检查点——W8 还没定切口就立刻找导师砍需求' },
    { w:'W9', ph:3, read:'补读方法所需具体技术（可微池化、PPR、图粗化）', run:'实现方法 v1（最小可用版本，不追求好看）', out:'方法能跑出数字，哪怕比 baseline 差', stuck:'差于 baseline 是常态。先确认实现无 bug——用退化设定验证：把你的模块关掉应该精确等于 baseline' },
    { w:'W10', ph:3, read:'相关工作补漏，开始整理 related work 章节', run:'调参 + 消融：至少 3 组（去掉聚类模块 / 换成 Leiden / 换成 k-means）', out:'消融表', stuck:'提升不显著就换评测角度：不比准确率，比 token 成本或"给定压缩率下的准确率保持"' },
    { w:'W11', ph:3, read:'目标期刊（KBS/ESWA/Neurocomputing）近一年同类论文 3 篇，学格式与叙事', run:'补充实验：双轨验证（Cora/DBLP 聚类指标 + LoCoMo 端到端指标）', out:'完整实验结果集 + 3-4 张图', stuck:'实验做不完就明确标注"进行中"，不要伪造。优先保证主表完整' },
    { w:'W12', ph:3, read:'—', run:'复跑关键实验确认可重复（固定随机种子，3 次取均值方差）', out:'⭐ 20 页汇报材料：问题定义、方法图、主结果表、消融表、下一步', stuck:'结果不理想就把汇报重心放在"我发现了什么现象"而非"我提升了多少"。负结果也是结果', mile:'能完整讲清"我在做什么、为什么它是新的、目前数字如何、还差什么"' }
  ],
  fallback: [
    { s:'API 预算烧光', a:'把 LLM 抽取阶段结果缓存，之后所有实验复用同一份记忆图，只改图算法部分（这部分不花钱）' },
    { s:'单卡跑不动', a:'你的方法本身应该都能跑。跑不动说明设计跑偏了，回退到更轻的图算法' },
    { s:'三周没进展', a:'立刻降级目标：从"提出新方法"降到"系统性对比 + 发现现象"。这在 Elsevier 期刊也能发，参考 HGB（2112.14936）这类"泼冷水式"评测分析论文的写法' },
    { s:'被抢先发表', a:'检查差异点，转向相邻 gap。这就是为什么准备了 5 个切口而不是 1 个' },
    { s:'导师不熟 Agent 概念', a:'用「术语翻译表」把问题重述为图问题。前 6 页汇报全部用图的语言' }
  ],

  // ---------- 沟通 ----------
  translate: [
    ['Agent 长期记忆', '一个持续增长的<b>属性图</b>，节点带文本属性'],
    ['实体/事件/工具调用三类节点', '<b>异构图</b>，三种节点类型，多种边类型，元路径可定义'],
    ['记忆分层与压缩', '<b>图聚类 / 社区发现 + 图粗化</b>，社区即记忆的语义簇'],
    ['记忆检索', '<b>子图召回</b>，等价于给定查询节点做邻域或斯坦纳树抽取'],
    ['记忆冲突消解', '图上的<b>一致性约束求解 + 可信度传播</b>'],
    ['记忆遗忘', '<b>边权时间衰减 + 图稀疏化</b>'],
    ['多 Agent 记忆共享', '多视图图上的<b>共享子图与视图对齐</b>'],
    ['多 Agent 通信拓扑', 'Agent 关系图上的<b>结构学习</b>'],
    ['GraphRAG 的社区摘要', '用 Leiden 做社区发现后对每个社区做文本摘要 —— <b>这里的 Leiden 就是可以被您的方法替换的地方</b>'],
    ['token 成本', '检索子图的规模约束，等价于<b>图压缩比</b>'],
    ['LLM', '特征抽取器 + 最终的读出（readout）函数，中间的图学习部分完全是我们的战场']
  ],
  pitch:'老师，我想做的事情，本质上是把大模型 Agent 的长期记忆建成一个异构属性图，然后用图聚类和社区发现做记忆的分层与压缩，检索时做子图召回。现在这个领域里最主流的做法（微软 GraphRAG、Zep）用的还是 Leiden、标签传播这些经典算法，完全没有利用节点的文本属性和类型异构性——这正好是您做属性图聚类和多嵌入融合的强项。我想把您的方法迁移到这个新场景上。',

  reportDeck: [
    { p:'1', c:'标题页', k:'用图的语言起标题，不要用 "Agent" 开头' },
    { p:'2', c:'一页讲清场景', k:'LLM Agent 需要长期记忆；记忆天然是图；给一张记忆图示意图（三色节点）' },
    { p:'3', c:'问题的图学表述', k:'直接给形式化 G=(V,E,X,T)，异构属性图，随时间增长' },
    { p:'4-5', c:'现状与不足', k:'表格对比 GraphRAG/LightRAG/Zep/A-MEM 各自的图构建方式与社区划分算法，用红字标出 "Leiden / 标签传播 / 无"' },
    { p:'6', c:'缝隙陈述', k:'一句话：经典社区发现算法在异构属性记忆图上失配。给 2-3 篇文献证据' },
    { p:'7', c:'与课题组能力的衔接', k:'明确列出导师三篇相关论文（ESWA 2023 社区发现、Neurocomputing 2024 图聚类、ASOC 2024 属性图聚类），说明如何迁移' },
    { p:'8-9', c:'方法草案', k:'总体框架图 + 分模块说明。融合模块与知识增强模块要显眼' },
    { p:'10-11', c:'实验设计', k:'双轨验证表 + baseline 清单 + 指标清单' },
    { p:'12', c:'已完成的工作', k:'复现了什么、跑出什么数字、代码在哪。这一页决定他信不信你' },
    { p:'13', c:'算力与成本评估', k:'主动说清"全部实验单卡可完成，LLM 走 API 且可缓存，预算 X 元"，主动消解他对算力的顾虑' },
    { p:'14', c:'时间计划', k:'什么时候出第一版结果、什么时候投稿，目标期刊明确写 KBS/ESWA/Neurocomputing' },
    { p:'15', c:'需要的支持', k:'具体到 API 预算、服务器权限、组内是否有人做过相关' }
  ],
  reportTips: [
    '<b>先给他熟悉的东西，再给新东西。</b>前 6 页全部用图的语言，让他确认"这是我懂的领域"，再引入 Agent 场景。',
    '<b>主动提算力可控。</b>他不做系统方向，最怕学生选一个跑不动的题。第 13 页主动说清成本，会大幅提升信任。',
    '<b>把工程背景摆成资产而不是噪音。</b>一句话定位分工："我有 4 年 Python 和 Agent 开发经验，写过一个多 Agent 项目，所以实现和数据采集这部分我能自己扛，希望在方法设计和论文写作上向您学习。"'
  ],

  firstMail:{
    title:'给导师的第一封邮件（建议 2026 年 9 月开学前发）',
    dont:'不要问"您的方向是什么"——这会暴露你没做过功课，也浪费了唯一的第一印象。',
    body:`刘老师您好：

我是今年录取到您门下的 XXX。入学前读了您几篇论文，2024 年 Neurocomputing 那篇 information-enhanced deep graph clustering，和 2025 年 KBS 上的 DSS-GCN，对其中"把多路互补信息用可学习方式融合"的思路印象很深。

我本科是软件工程，毕业后做了一年多 Python 后端，其间做过一些大模型应用开发，自己写了一个多 Agent 协作的开源项目（GitHub: Ctrl1CandV/AgentParliament）。做的过程中撞到一个我当时解决不了的问题：Agent 跑长任务时，记忆越攒越多，上下文塞不下，检索还越来越不准。

我最近查了一下，目前主流做法（微软 GraphRAG、Zep）是把记忆建成图，然后用 Leiden、标签传播这类经典算法划分社区做分层摘要——但这些算法假设图是同质、无属性、静态的，而记忆图其实是异构的、节点带文本嵌入和时间戳、还在持续增长。我想请教，能不能把您在属性图聚类和多嵌入融合上的方法迁移到这个场景来。

如果方向可行，我希望入学前先把相关文献和 baseline 复现做起来，开学时能直接汇报。也想请问组里目前的算力情况，以便我把实验方案设计在可行范围内。

打扰您了，盼回复。

XXX`,
    effect:'这封邮件同时完成三件事：证明你读过他的论文（不是群发）、暴露你的工程资产（GitHub + 工作经历）、把选题主动权拿到手（你提方向，他做判断）。最后那句问算力是刻意的——它既是实务需求，也在暗示你懂得为约束做设计。'
  }
};
