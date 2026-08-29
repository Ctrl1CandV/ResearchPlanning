/* 板块 6：技能矩阵。百分比为岗位文本命中率，不等于硬性要求率。
   2026-08-28 更新：roadmap 每条补「学习参考」（书/网站/论文），让人能从本页开始一步步补。
   信号数据仍为 2026-07-28 快照口径（未重新抓取）。 */
window.SKILLS = {
  meta: {
    baidu: { denominator:747, scope:'百度关键词快照中的技术岗；含工作内容和任职要求', sourceAsOf:'2026-07-28' },
    tencent: { denominator:419, scope:'腾讯关键词快照中的技术岗；只有工作内容，命中率是下限', sourceAsOf:'2026-07-28' },
    revisedAt:'2026-08-28（信号口径不变；本次更新重点是补学习参考与主线对齐）',
    warning:'两家公司字段完整度不同，百分比不可合并，也不应作人才供需或竞争强弱的直接证据。'
  },
  /* ── 页面要点（渲染在页头下方；文案从本页现有内容提炼，勿新造结论） ── */
  summary: [
    '双口径不可合并：百度 747 技术岗（职责+要求）与腾讯 419（仅工作内容，命中率是下限），不可直接排名对比。',
    '学习路线是执行层：P0 五项（算法题、OS/网络/数据库基础、评测与可观测、记忆与上下文、系统设计）都有截止阶段与可验证交付物。',
    '每条路线配「学习参考」，部分直接指向 site/papers/ 的本地 PDF，从这里开始学。',
    '信号矩阵是调研证据：关键词存在率不等于硬要求率；GraphRAG 零命中只说明不作 ATS 主标签。'
  ],
  signals: [
    { id:'python', name:'Python', domain:'backend', baidu:53.7, tencent:1.7, priority:'P0', judgement:'基础门槛；腾讯字段缺失导致明显低估' },
    { id:'cpp', name:'C++', domain:'backend', baidu:39.1, tencent:0.7, priority:'P3', judgement:'总体强信号，但与主投应用工程不完全一致' },
    { id:'go', name:'Go', domain:'backend', baidu:29.2, tencent:1.2, priority:'P1', judgement:'Agent Runtime、高并发调度的重要加分项' },
    { id:'java', name:'Java', domain:'backend', baidu:20.5, tencent:0, priority:'P2', judgement:'后端保底能力；无需挤占主线投入' },
    { id:'distributed', name:'微服务 / 分布式', domain:'systems', baidu:32.8, tencent:26.7, priority:'P0', judgement:'最应复用的既有工程能力' },
    { id:'multimodal', name:'多模态', domain:'model', baidu:15.3, tencent:25.1, priority:'P3', judgement:'有需求，但不是当前研究与作品集主线' },
    { id:'eval', name:'评测 / Eval', domain:'agent', baidu:12.3, tencent:15.5, priority:'P0', judgement:'主线能力（方向 A/E 的核心），必须有固定 benchmark 与回归机制' },
    { id:'observability', name:'可观测性', domain:'agent', baidu:4.1, tencent:7.6, priority:'P0', judgement:'与后端经验结合的差异化能力；Atlas 台账是现成载体' },
    { id:'signal-rag', name:'RAG', domain:'agent', baidu:5.2, tencent:9.1, priority:'P1', judgement:'必须会完整链路，不押具体框架' },
    { id:'function-calling', name:'Function Calling', domain:'agent', baidu:3.9, tencent:10.0, priority:'P1', judgement:'比 LangChain 熟练度更接近真实职责' },
    { id:'memory', name:'Memory', domain:'agent', baidu:2.9, tencent:7.2, priority:'P0', judgement:'论文（方向 C/D）与求职叙事的接口' },
    { id:'context', name:'上下文工程', domain:'agent', baidu:1.5, tencent:6.7, priority:'P0', judgement:'长任务稳定性、压缩与恢复的核心' },
    { id:'multi-agent', name:'Multi-Agent', domain:'agent', baidu:4.0, tencent:4.5, priority:'P1', judgement:'用项目和评测证明，不停留在编排 demo' },
    { id:'mcp', name:'MCP', domain:'agent', baidu:0.8, tencent:3.6, priority:'P1', judgement:'会实现 server/client，并能解释与 Function Calling、Skills 的边界' },
    { id:'k8s', name:'Kubernetes', domain:'systems', baidu:11.6, tencent:2.6, priority:'P2', judgement:'平台岗必需，应用岗加分；重点理解部署与治理' },
    { id:'langchain', name:'LangChain', domain:'framework', baidu:3.1, tencent:0.2, priority:'P3', judgement:'能判断何时用即可，不做框架专家' },
    { id:'langgraph', name:'LangGraph', domain:'framework', baidu:0.8, tencent:0.2, priority:'P3', judgement:'同上' },
    { id:'graphdb', name:'Neo4j / FalkorDB', domain:'data', baidu:0.3, tencent:0.2, priority:'P2', judgement:'低频但与论文、代码图谱项目高度协同' },
    { id:'graphrag', name:'GraphRAG', domain:'framework', baidu:0, tencent:0, priority:'P3', judgement:'当前样本零命中；技术可用，但不作简历主标签' }
  ],
  roadmap: [
    { id:'skill-algo', name:'算法题与真实编码', priority:'P0', domain:'interview', target:'中等题稳定 25—35 分钟，能口述复杂度与边界', deadline:'2027.12 前', deliverable:'按专题完成题单；每月一次 90 分钟模拟面试', status:'planned',
      refs:[
        { kind:'web', label:'LeetCode · Hot 100 学习计划', url:'https://leetcode.cn/studyplan/top-100-liked/' },
        { kind:'web', label:'代码随想录（按专题的免费题单与图解）', url:'https://programmercarl.com/' },
        { kind:'book', label:'《剑指 Offer（第 2 版）》', url:'' }
      ] },
    { id:'skill-cs', name:'OS / 网络 / 数据库 / 并发', priority:'P0', domain:'interview', target:'能从生产故障与系统设计角度解释，不只背定义', deadline:'2027.12 前', deliverable:'四份主题笔记 + 20 个生产案例回答', status:'planned',
      refs:[
        { kind:'book', label:'《操作系统导论》（OSTEP，英文版官网免费）', url:'https://pages.cs.wisc.edu/~remzi/OSTEP/' },
        { kind:'web', label:'CMU 15-445 数据库系统（公开课 + 项目）', url:'https://15445.courses.cs.cmu.edu/' },
        { kind:'web', label:'小林 coding（图解网络 / 图解系统 / 图解 MySQL）', url:'https://xiaolincoding.com/' },
        { kind:'book', label:'《TCP/IP 详解 卷 1》', url:'' }
      ] },
    { id:'skill-eval', name:'Agent 评测与可观测性', priority:'P0', domain:'agent', target:'独立设计 benchmark、trace schema、指标和回归门禁', deadline:'2027.06 前', deliverable:'minibank-trap 受控评测报告 + Atlas 假成功检测对比数据', status:'planned',
      refs:[
        { kind:'paper', label:'假成功刻画（首篇对手，必读）', url:'https://arxiv.org/abs/2606.09863', local:'2606.09863' },
        { kind:'paper', label:'reliability@k 评测协议', url:'https://arxiv.org/abs/2608.14711', local:'2608.14711' },
        { kind:'paper', label:'静默失败纵向分类（生产运行时）', url:'https://arxiv.org/abs/2606.14589', local:'2606.14589' },
        { kind:'web', label:'OpenTelemetry 文档（trace/span 语义模型）', url:'https://opentelemetry.io/docs/' }
      ] },
    { id:'skill-memory', name:'长期记忆与上下文工程', priority:'P0', domain:'agent', target:'能比较扁平、层级、图记忆的质量/成本/延迟', deadline:'2027.08 前', deliverable:'记忆后端三轴评测报告（方向 C）+ 图记忆对照实验', status:'planned',
      refs:[
        { kind:'paper', label:'记忆机制综述（TOIS，术语坐标系）', url:'https://arxiv.org/abs/2404.13501', local:'2404.13501' },
        { kind:'paper', label:'A-MEM（演化式记忆代表）', url:'https://arxiv.org/abs/2502.12110', local:'2502.12110' },
        { kind:'paper', label:'Zep（时序知识图记忆）', url:'https://arxiv.org/abs/2501.13956', local:'2501.13956' },
        { kind:'paper', label:'LoCoMo（记忆评测标准）', url:'https://arxiv.org/abs/2402.17753', local:'2402.17753' }
      ] },
    { id:'skill-system-design', name:'后端与 Agent 系统设计', priority:'P0', domain:'systems', target:'设计高可用 Agent Runtime，覆盖幂等、重试、限流、观测和成本', deadline:'2028.01 前', deliverable:'6 个系统设计题 + 架构图 + trade-off 文档', status:'planned',
      refs:[
        { kind:'book', label:'《Designing Data-Intensive Applications》（DDIA）', url:'' },
        { kind:'web', label:'ByteByteGo 系统设计图解', url:'https://bytebytego.com/' },
        { kind:'web', label:'MIT 6.824 分布式系统（公开课 + lab）', url:'https://pdos.csail.mit.edu/6.824/' }
      ] },
    { id:'skill-go', name:'Go 并发服务', priority:'P1', domain:'backend', target:'能写并压测 worker pool、调度器和流式服务', deadline:'2027.08 前', deliverable:'Go AST/调度服务，带 benchmark 与 pprof', status:'planned',
      refs:[
        { kind:'web', label:'A Tour of Go（官方交互教程）', url:'https://go.dev/tour/' },
        { kind:'book', label:'《Go 程序设计语言》（The Go Programming Language, gopl.io）', url:'https://www.gopl.io/' },
        { kind:'web', label:'Go by Example（按特性的代码样例）', url:'https://gobyexample.com/' }
      ] },
    { id:'skill-rag', name:'RAG 全链路', priority:'P1', domain:'agent', target:'掌握切分、稠密/稀疏召回、融合、重排、评测与索引更新', deadline:'2027.06 前', deliverable:'至少两个 baseline 的同口径对比', status:'planned',
      refs:[
        { kind:'paper', label:'RAG 奠基论文', url:'https://arxiv.org/abs/2005.11401', local:'2005.11401' },
        { kind:'paper', label:'GraphRAG（社区层级检索）', url:'https://arxiv.org/abs/2404.16130', local:'2404.16130' },
        { kind:'paper', label:'GraphRAG 综述（G-Indexing/G-Retrieval/G-Generation 框架）', url:'https://arxiv.org/abs/2408.08921', local:'2408.08921' }
      ] },
    { id:'skill-protocols', name:'MCP / Skills / Function Calling', priority:'P1', domain:'agent', target:'实现协议两端并能讲清能力发现、安全和生命周期差异', deadline:'2027.03 前', deliverable:'一个 MCP server/client + 对比文档', status:'planned',
      refs:[
        { kind:'web', label:'Model Context Protocol 官方文档与规范', url:'https://modelcontextprotocol.io/' },
        { kind:'paper', label:'Toolformer（模型自学调工具的起点）', url:'https://arxiv.org/abs/2302.04761' }
      ] },
    { id:'skill-agent-patterns', name:'Agent 架构模式', priority:'P1', domain:'agent', target:'能按任务选择 ReAct、Plan-and-Execute、Self-Refine、多 Agent', deadline:'2027.06 前', deliverable:'同 benchmark 下的策略消融', status:'planned',
      refs:[
        { kind:'paper', label:'ReAct（推理+行动交织）', url:'https://arxiv.org/abs/2210.03629' },
        { kind:'paper', label:'Chain-of-Thought（思维链）', url:'https://arxiv.org/abs/2201.11903' },
        { kind:'paper', label:'Reflexion（语言化自我反思）', url:'https://arxiv.org/abs/2303.11366' }
      ] },
    { id:'skill-model-basics', name:'Transformer / KV Cache / LoRA / RLHF 基础', priority:'P1', domain:'model', target:'达到应用工程面试解释与成本估算水平', deadline:'2027.12 前', deliverable:'一份模型基础面试手册', status:'planned',
      refs:[
        { kind:'paper', label:'Attention Is All You Need（Transformer 原文）', url:'https://arxiv.org/abs/1706.03762' },
        { kind:'paper', label:'LoRA（低秩适配）', url:'https://arxiv.org/abs/2106.09685' },
        { kind:'web', label:'The Illustrated Transformer（图解）', url:'https://jalammar.github.io/illustrated-transformer/' }
      ] },
    { id:'skill-k8s', name:'K8s 部署与治理', priority:'P2', domain:'systems', target:'会部署、探针、HPA、资源限制、灰度与故障排查', deadline:'2027.10 前', deliverable:'项目二部署清单与压测记录', status:'planned',
      refs:[
        { kind:'web', label:'Kubernetes 官方文档与交互教程', url:'https://kubernetes.io/zh-cn/docs/tutorials/' },
        { kind:'book', label:'《Kubernetes in Action》', url:'' }
      ] },
    { id:'skill-graphdb', name:'图数据库工程', priority:'P2', domain:'data', target:'掌握 schema、索引、查询、批量写入和性能边界', deadline:'2027.08 前', deliverable:'Neo4j/FalkorDB 二选一的代码图谱实现', status:'planned',
      refs:[
        { kind:'web', label:'Neo4j GraphAcademy（官方免费课程）', url:'https://graphacademy.neo4j.com/' },
        { kind:'web', label:'FalkorDB 文档', url:'https://docs.falkordb.com/' }
      ] },
    { id:'skill-framework-judgement', name:'LangChain / LangGraph 判断力', priority:'P3', domain:'framework', target:'能解释何时复用、何时自建，不依赖框架完成核心逻辑', deadline:'按项目需要', deliverable:'一次框架与自建实现的 trade-off 记录', status:'planned',
      refs:[
        { kind:'web', label:'LangChain 官方文档（知道抽象边界即可）', url:'https://python.langchain.com/docs/introduction/' },
        { kind:'web', label:'站内「错误选择→测量→纠正」故事模板（portfolio 板块）', url:'#portfolio' }
      ] }
  ],
  interviewTracks: [
    { id:'track-code', name:'算法与编码', target:'稳定通过机考和手撕', items:['数组/链表/树/图','二分/滑窗/回溯/动态规划','并发安全与工程代码质量','复杂度、测试与边界'] },
    { id:'track-foundation', name:'计算机基础', target:'把八股连接到生产案例', items:['进程线程、内存与 I/O','TCP/HTTP/一致性与重试','索引、事务、隔离与慢查询','缓存、消息队列与分布式一致性'] },
    { id:'track-agent', name:'Agent 工程', target:'从 demo 讲到可靠生产系统', items:['上下文与记忆生命周期','工具选择、参数准确率与恢复','Eval、Trace、成本与回归','MCP、沙箱、权限和注入风险'] },
    { id:'track-design', name:'系统设计', target:'兼顾吞吐、成功率、P99 与单位成本', items:['Agent Runtime 与任务调度','RAG/知识图谱服务','多租户隔离与配额','降级、熔断、幂等和可观测性'] }
  ]
};
