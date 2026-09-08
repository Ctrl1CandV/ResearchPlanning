/* 板块 6：技能矩阵。百分比为岗位文本命中率，不等于硬性要求率。
   2026-08-28 更新：roadmap 每条补「学习参考」（书/网站/论文），让人能从本页开始一步步补。
   信号数据仍为 2026-07-28 快照口径（未重新抓取）。 */
window.SKILLS = {
  meta: {
    baidu: { denominator:747, scope:'百度关键词快照中的技术岗；含工作内容和任职要求', sourceAsOf:'2026-07-28' },
    tencent: { denominator:419, scope:'腾讯关键词快照中的技术岗；只有工作内容，命中率是下限', sourceAsOf:'2026-07-28' },
    revisedAt:'2026-08-28（统计数据没重新抓；这次更新主要是给每条路线补学习参考）',
    warning:'两家的字段完整度不同，百分比不能合并成一个数，也不能直接拿来排先后，更不能当成人才供需或竞争激烈程度的证据。'
  },
  /* ── 页面要点（渲染在页头下方；文案从本页现有内容提炼，勿新造结论） ── */
  summary: [
    '两个数字来源不能混着看：百度的 747 个技术岗同时含职责和要求；腾讯的 419 个只有工作内容一栏，算出来的命中率只能当最低值。所以两边的百分比不能合并，也不能互相排名。',
    '学习路线是拿来执行的：P0 共四项（算法题、计算机基础、评测与可观测、系统设计），记忆与上下文降为 P1，只在方向 C/D 启动时回到主线。每一项都写了截止时间和交得出手的东西。',
    '每条路线下面配了学习参考。论文的参考直接链到对应的阅读卡，原文从 arXiv 打开。',
    '最下面的信号矩阵是调研证据，注意两个限制：JD 里出现某个关键词，不等于岗位硬性要求这项技能；GraphRAG 零命中也只说明它不适合做简历主标签，不代表相关技术没有价值。'
  ],
  signals: [
    { id:'python', name:'Python', domain:'backend', baidu:53.7, tencent:1.7, priority:'P0', judgement:'必会的基本功；腾讯那个数只有 1.7%，是因为字段里根本不写要求，被低估了' },
    { id:'cpp', name:'C++', domain:'backend', baidu:39.1, tencent:0.7, priority:'P3', judgement:'总量上很常见，但和主投的 AI 应用工程岗位关系不大' },
    { id:'go', name:'Go', domain:'backend', baidu:29.2, tencent:1.2, priority:'P1', judgement:'做 Agent Runtime 和高并发调度时常用，值得投入' },
    { id:'java', name:'Java', domain:'backend', baidu:20.5, tencent:0, priority:'P2', judgement:'保住后端找工作的底线即可，不要为它挤占主线时间' },
    { id:'distributed', name:'微服务 / 分布式', domain:'systems', baidu:32.8, tencent:26.7, priority:'P0', judgement:'两边都高频，是已有的工程经验里最该继续用的部分' },
    { id:'multimodal', name:'多模态', domain:'model', baidu:15.3, tencent:25.1, priority:'P3', judgement:'市场有需求，但不在我的研究和作品集主线里，先放着' },
    { id:'eval', name:'评测 / Eval', domain:'agent', baidu:12.3, tencent:15.5, priority:'P0', judgement:'主线核心能力：评测设计、状态核验、统计分析、成本测量都落在这条上。要有一套固定的 benchmark 和回归机制做支撑' },
    { id:'observability', name:'可观测性', domain:'agent', baidu:4.1, tencent:7.6, priority:'P0', judgement:'和后端经验结合后是差异化卖点，Atlas 的台账就是现成的证明材料' },
    { id:'signal-rag', name:'RAG', domain:'agent', baidu:5.2, tencent:9.1, priority:'P1', judgement:'整条链路必须都会，但不押注某一个框架' },
    { id:'function-calling', name:'Function Calling', domain:'agent', baidu:3.9, tencent:10.0, priority:'P1', judgement:'这项能力比 LangChain 熟练度更接近岗位实际要做的事' },
    { id:'memory', name:'Memory', domain:'agent', baidu:2.9, tencent:7.2, priority:'P1', judgement:'求职侧有用；论文侧方向 C/D 已条件化或暂缓，只在启动对应方向时回到主线' },
    { id:'context', name:'上下文工程', domain:'agent', baidu:1.5, tencent:6.7, priority:'P0', judgement:'决定长任务稳不稳，涉及压缩和故障恢复' },
    { id:'multi-agent', name:'Multi-Agent', domain:'agent', baidu:4.0, tencent:4.5, priority:'P1', judgement:'要用项目和评测数据来证明理解，只会搭编排 demo 不够' },
    { id:'mcp', name:'MCP', domain:'agent', baidu:0.8, tencent:3.6, priority:'P1', judgement:'要能自己实现 server 和 client，并说清它和 Function Calling、Skills 的区别' },
    { id:'k8s', name:'Kubernetes', domain:'systems', baidu:11.6, tencent:2.6, priority:'P2', judgement:'平台岗必需、应用岗加分；重点学部署和资源治理' },
    { id:'langchain', name:'LangChain', domain:'framework', baidu:3.1, tencent:0.2, priority:'P3', judgement:'会判断什么时候该用就够了，不用把自己做成框架专家' },
    { id:'langgraph', name:'LangGraph', domain:'framework', baidu:0.8, tencent:0.2, priority:'P3', judgement:'同 LangChain' },
    { id:'graphdb', name:'Neo4j / FalkorDB', domain:'data', baidu:0.3, tencent:0.2, priority:'P3', judgement:'JD 里出现得少；对应方向 D/F 已暂缓，只在代码图谱项目和方向重启时用' },
    { id:'graphrag', name:'GraphRAG', domain:'framework', baidu:0, tencent:0, priority:'P3', judgement:'两边样本都是零命中。技术本身可以用，但不要写进简历当主标签' }
  ],
  roadmap: [
    { id:'skill-algo', name:'算法题与真实编码', priority:'P0', domain:'interview', target:'中等题稳定 25—35 分钟，能口述复杂度与边界', deadline:'2027.12 前', deliverable:'按专题完成题单；每月一次 90 分钟模拟面试', status:'planned',
      refs:[
        { kind:'web', label:'LeetCode · Hot 100 学习计划', url:'https://leetcode.cn/studyplan/top-100-liked/' },
        { kind:'web', label:'代码随想录（按专题的免费题单与图解）', url:'https://programmercarl.com/' },
        { kind:'book', label:'《剑指 Offer（第 2 版）》', url:'', tier:'extend' }
      ] },
    { id:'skill-cs', name:'OS / 网络 / 数据库 / 并发', priority:'P0', domain:'interview', target:'能从生产故障与系统设计角度解释，不只背定义', deadline:'2027.12 前', deliverable:'四份主题笔记 + 20 个生产案例回答', status:'planned',
      refs:[
        { kind:'book', label:'《操作系统导论》（OSTEP，英文版官网免费）', url:'https://pages.cs.wisc.edu/~remzi/OSTEP/' },
        { kind:'web', label:'CMU 15-445 数据库系统（公开课；讲义优先，lab 可选）', url:'https://15445.courses.cs.cmu.edu/' },
        { kind:'web', label:'小林 coding（图解网络 / 图解系统 / 图解 MySQL）', url:'https://xiaolincoding.com/' },
        { kind:'book', label:'《TCP/IP 详解 卷 1》', url:'', tier:'extend' }
      ] },
    { id:'skill-eval', name:'Agent 评测与可观测性', priority:'P0', domain:'agent', target:'独立设计 benchmark、证据点清单、指标（检出率、误报率、无法确认比例）和回归检查', deadline:'2027.06 前', deliverable:'主线任务完成验证的受控评测报告 + 与 2606.09863 轻量检测器的对比数据', status:'planned',
      note:'评测设施在 90 天计划 W1—W8 就要动起来（划界、环境、证据点清单、对比表）；2027.06 指的是「能独立设计 benchmark、指标体系和回归检查」这项完整能力到那时必须就绪，不是说到那时才开始做。',
      refs:[
        { kind:'paper', label:'假成功刻画（首篇对手，检测器是必比基线）', url:'https://arxiv.org/abs/2606.09863', local:'2606.09863' },
        { kind:'paper', label:'Strategic Verification（预印本，划界对象）', url:'https://www.preprints.org/manuscript/202608.2057' },
        { kind:'paper', label:'reliability@k 评测协议', url:'https://arxiv.org/abs/2608.14711', local:'2608.14711' },
        { kind:'paper', label:'静默失败纵向分类（生产运行时）', url:'https://arxiv.org/abs/2606.14589', local:'2606.14589' },
        { kind:'web', label:'OpenTelemetry 文档（trace/span 语义模型）', url:'https://opentelemetry.io/docs/' }
      ] },
    { id:'skill-memory', name:'长期记忆与上下文工程', priority:'P1', domain:'agent', target:'能用质量、成本、延迟三个角度比较扁平、层级、图三类记忆组织方式', deadline:'2027.08 前', deliverable:'记忆后端三轴评测报告（方向 C 启动后交付，当前为条件备选）', status:'planned',
      refs:[
        { kind:'paper', label:'记忆机制综述（TOIS，把术语一次讲齐）', url:'https://arxiv.org/abs/2404.13501', local:'2404.13501' },
        { kind:'paper', label:'A-MEM（演化式记忆代表）', url:'https://arxiv.org/abs/2502.12110', local:'2502.12110' },
        { kind:'paper', label:'Zep（时序知识图记忆）', url:'https://arxiv.org/abs/2501.13956', local:'2501.13956' },
        { kind:'paper', label:'LoCoMo（记忆评测标准）', url:'https://arxiv.org/abs/2402.17753', local:'2402.17753' }
      ] },
    { id:'skill-system-design', name:'后端与 Agent 系统设计', priority:'P0', domain:'systems', target:'设计一个高可用的 Agent Runtime，把幂等、重试、限流、观测和成本方案都覆盖到', deadline:'2028.01 前', deliverable:'6 个系统设计题 + 架构图 + trade-off 文档', status:'planned',
      refs:[
        { kind:'book', label:'《Designing Data-Intensive Applications》（DDIA）', url:'' },
        { kind:'web', label:'ByteByteGo 系统设计图解（商业图解，作直觉，不作唯一来源）', url:'https://bytebytego.com/' },
        { kind:'web', label:'MIT 6.5840 分布式系统（公开课 + lab，原 6.824）', url:'https://pdos.csail.mit.edu/6.824/' }
      ] },
    { id:'skill-go', name:'Go 并发服务', priority:'P1', domain:'backend', target:'能写并压测 worker pool、调度器和流式服务', deadline:'2027.08 前', deliverable:'Go 的 AST 与调度服务，带 benchmark 与 pprof', status:'planned',
      refs:[
        { kind:'web', label:'A Tour of Go（官方交互教程）', url:'https://go.dev/tour/' },
        { kind:'book', label:'《Go 程序设计语言》（The Go Programming Language, gopl.io）', url:'https://www.gopl.io/' },
        { kind:'web', label:'Go by Example（按特性的代码样例）', url:'https://gobyexample.com/' }
      ] },
    { id:'skill-rag', name:'RAG 全链路', priority:'P1', domain:'agent', target:'掌握切分、稠密和稀疏召回、融合、重排、评测与索引更新', deadline:'2027.06 前', deliverable:'至少两个 baseline 在同一套条件下的对比', status:'planned',
      refs:[
        { kind:'paper', label:'RAG 奠基论文', url:'https://arxiv.org/abs/2005.11401', local:'2005.11401' },
        { kind:'paper', label:'GraphRAG（社区层级检索）', url:'https://arxiv.org/abs/2404.16130', local:'2404.16130' },
        { kind:'paper', label:'GraphRAG 综述（G-Indexing/G-Retrieval/G-Generation 框架）', url:'https://arxiv.org/abs/2408.08921', local:'2408.08921' }
      ] },
    { id:'skill-protocols', name:'MCP / Skills / Function Calling', priority:'P1', domain:'agent', target:'实现协议两端并能讲清能力发现、安全和生命周期差异', deadline:'2027.03 前', deliverable:'一个 MCP server/client + 对比文档', status:'planned',
      refs:[
        { kind:'web', label:'Model Context Protocol 官方文档与规范', url:'https://modelcontextprotocol.io/' },
        { kind:'paper', label:'Toolformer（模型自学调工具的起点）', url:'https://arxiv.org/abs/2302.04761', tier:'extend' }
      ] },
    { id:'skill-agent-patterns', name:'Agent 架构模式', priority:'P1', domain:'agent', target:'能按任务选择 ReAct、Plan-and-Execute、Self-Refine、多 Agent', deadline:'2027.06 前', deliverable:'同 benchmark 下的策略消融', status:'planned',
      refs:[
        { kind:'paper', label:'ReAct（推理+行动交织）', url:'https://arxiv.org/abs/2210.03629' },
        { kind:'paper', label:'Chain-of-Thought（思维链）', url:'https://arxiv.org/abs/2201.11903' },
        { kind:'paper', label:'Reflexion（语言化自我反思）', url:'https://arxiv.org/abs/2303.11366' }
      ] },
    { id:'skill-model-basics', name:'Transformer / KV Cache / LoRA / RLHF 基础', priority:'P1', domain:'model', target:'面试里能讲清原理，并估算不同方案的成本差异', deadline:'2027.12 前', deliverable:'一份模型基础面试手册', status:'planned',
      refs:[
        { kind:'paper', label:'Attention Is All You Need（Transformer 原文）', url:'https://arxiv.org/abs/1706.03762', tier:'extend' },
        { kind:'paper', label:'LoRA（低秩适配）', url:'https://arxiv.org/abs/2106.09685', tier:'extend' },
        { kind:'web', label:'The Illustrated Transformer（图解）', url:'https://jalammar.github.io/illustrated-transformer/' }
      ] },
    { id:'skill-k8s', name:'K8s 部署与治理', priority:'P2', domain:'systems', target:'会部署、探针、HPA、资源限制、灰度与故障排查', deadline:'2027.10 前', deliverable:'项目二部署清单与压测记录', status:'planned',
      refs:[
        { kind:'web', label:'Kubernetes 官方文档与交互教程', url:'https://kubernetes.io/zh-cn/docs/tutorials/' },
        { kind:'book', label:'《Kubernetes in Action》', url:'', tier:'extend' }
      ] },
    { id:'skill-graphdb', name:'图数据库工程', priority:'P3', domain:'data', target:'掌握 schema、索引、查询、批量写入和性能边界', deadline:'2027.08 前', deliverable:'Neo4j/FalkorDB 二选一的代码图谱实现', status:'planned',
      note:'Neo4j 或 FalkorDB 二选一做深，不为技术清单重复实现两套。方向 D/F 暂缓后，这条只在代码图谱项目和方向重启时排期。',
      refs:[
        { kind:'web', label:'Neo4j GraphAcademy（官方免费课程）', url:'https://graphacademy.neo4j.com/' },
        { kind:'web', label:'FalkorDB 文档', url:'https://docs.falkordb.com/' }
      ] },
    { id:'skill-framework-judgement', name:'LangChain / LangGraph 判断力', priority:'P3', domain:'framework', target:'能解释何时复用、何时自建，不依赖框架完成核心逻辑', deadline:'按项目需要', deliverable:'一次框架与自建实现的 trade-off 记录', status:'planned',
      refs:[
        { kind:'web', label:'LangChain 官方文档（知道抽象边界即可）', url:'https://docs.langchain.com/oss/python/langchain/overview' },
        { kind:'web', label:'站内「错误选择→测量→纠正」故事模板（portfolio 板块）', url:'#portfolio' }
      ] }
  ],
  interviewTracks: [
    { id:'track-code', name:'算法与编码', target:'稳定通过机考和手撕', items:['数组、链表、树、图','二分、滑窗、回溯、动态规划','并发安全与工程代码质量','复杂度、测试与边界'] },
    { id:'track-foundation', name:'计算机基础', target:'把八股连接到生产案例', items:['进程线程、内存与 I/O','TCP、HTTP、一致性与重试','索引、事务、隔离与慢查询','缓存、消息队列与分布式一致性'] },
    { id:'track-agent', name:'Agent 工程', target:'从 demo 讲到可靠生产系统', items:['上下文与记忆生命周期','工具选择、参数准确率与恢复','Eval、Trace、成本与回归','MCP、沙箱、权限和注入风险'] },
    { id:'track-design', name:'系统设计', target:'兼顾吞吐、成功率、P99 与单位成本', items:['Agent Runtime 与任务调度','RAG 和知识图谱服务','多租户隔离与配额','降级、熔断、幂等和可观测性'] }
  ]
};
