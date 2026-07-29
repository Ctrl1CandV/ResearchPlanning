/* 板块 6：技能矩阵。百分比为岗位文本命中率，不等于硬性要求率。 */
window.SKILLS = {
  meta: {
    baidu: { denominator:747, scope:'百度关键词快照中的技术岗；含工作内容和任职要求', sourceAsOf:'2026-07-28' },
    tencent: { denominator:419, scope:'腾讯关键词快照中的技术岗；只有工作内容，命中率是下限', sourceAsOf:'2026-07-28' },
    warning:'两家公司字段完整度不同，百分比不可合并，也不应作人才供需或竞争强弱的直接证据。'
  },
  signals: [
    { id:'python', name:'Python', domain:'backend', baidu:53.7, tencent:1.7, priority:'P0', judgement:'基础门槛；腾讯字段缺失导致明显低估' },
    { id:'cpp', name:'C++', domain:'backend', baidu:39.1, tencent:0.7, priority:'P3', judgement:'总体强信号，但与主投应用工程不完全一致' },
    { id:'go', name:'Go', domain:'backend', baidu:29.2, tencent:1.2, priority:'P1', judgement:'Agent Runtime、高并发调度的重要加分项' },
    { id:'java', name:'Java', domain:'backend', baidu:20.5, tencent:0, priority:'P2', judgement:'后端保底能力；无需挤占主线投入' },
    { id:'distributed', name:'微服务 / 分布式', domain:'systems', baidu:32.8, tencent:26.7, priority:'P0', judgement:'最应复用的既有工程能力' },
    { id:'multimodal', name:'多模态', domain:'model', baidu:15.3, tencent:25.1, priority:'P3', judgement:'有需求，但不是当前研究与作品集主线' },
    { id:'eval', name:'评测 / Eval', domain:'agent', baidu:12.3, tencent:15.5, priority:'P0', judgement:'主线能力，必须有固定 benchmark 与回归机制' },
    { id:'observability', name:'可观测性', domain:'agent', baidu:4.1, tencent:7.6, priority:'P0', judgement:'与后端经验结合的差异化能力' },
    { id:'signal-rag', name:'RAG', domain:'agent', baidu:5.2, tencent:9.1, priority:'P1', judgement:'必须会完整链路，不押具体框架' },
    { id:'function-calling', name:'Function Calling', domain:'agent', baidu:3.9, tencent:10.0, priority:'P1', judgement:'比 LangChain 熟练度更接近真实职责' },
    { id:'memory', name:'Memory', domain:'agent', baidu:2.9, tencent:7.2, priority:'P0', judgement:'论文与求职叙事的接口' },
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
    { id:'skill-algo', name:'算法题与真实编码', priority:'P0', domain:'interview', target:'中等题稳定 25—35 分钟，能口述复杂度与边界', deadline:'2027.12 前', deliverable:'按专题完成题单；每月一次 90 分钟模拟面试', status:'planned' },
    { id:'skill-cs', name:'OS / 网络 / 数据库 / 并发', priority:'P0', domain:'interview', target:'能从生产故障与系统设计角度解释，不只背定义', deadline:'2027.12 前', deliverable:'四份主题笔记 + 20 个生产案例回答', status:'planned' },
    { id:'skill-eval', name:'Agent 评测与可观测性', priority:'P0', domain:'agent', target:'独立设计 benchmark、trace schema、指标和回归门禁', deadline:'2027.06 前', deliverable:'AgentParliament Eval 报告与可回放 trace', status:'planned' },
    { id:'skill-memory', name:'长期记忆与上下文工程', priority:'P0', domain:'agent', target:'能比较扁平、层级、图记忆的质量/成本/延迟', deadline:'2027.08 前', deliverable:'论文 baseline 表 + 图记忆 A/B 实验', status:'planned' },
    { id:'skill-system-design', name:'后端与 Agent 系统设计', priority:'P0', domain:'systems', target:'设计高可用 Agent Runtime，覆盖幂等、重试、限流、观测和成本', deadline:'2028.01 前', deliverable:'6 个系统设计题 + 架构图 + trade-off 文档', status:'planned' },
    { id:'skill-go', name:'Go 并发服务', priority:'P1', domain:'backend', target:'能写并压测 worker pool、调度器和流式服务', deadline:'2027.08 前', deliverable:'Go AST/调度服务，带 benchmark 与 pprof', status:'planned' },
    { id:'skill-rag', name:'RAG 全链路', priority:'P1', domain:'agent', target:'掌握切分、稠密/稀疏召回、融合、重排、评测与索引更新', deadline:'2027.06 前', deliverable:'至少两个 baseline 的同口径对比', status:'planned' },
    { id:'skill-protocols', name:'MCP / Skills / Function Calling', priority:'P1', domain:'agent', target:'实现协议两端并能讲清能力发现、安全和生命周期差异', deadline:'2027.03 前', deliverable:'一个 MCP server/client + 对比文档', status:'planned' },
    { id:'skill-agent-patterns', name:'Agent 架构模式', priority:'P1', domain:'agent', target:'能按任务选择 ReAct、Plan-and-Execute、Self-Refine、多 Agent', deadline:'2027.06 前', deliverable:'同 benchmark 下的策略消融', status:'planned' },
    { id:'skill-model-basics', name:'Transformer / KV Cache / LoRA / RLHF 基础', priority:'P1', domain:'model', target:'达到应用工程面试解释与成本估算水平', deadline:'2027.12 前', deliverable:'一份模型基础面试手册', status:'planned' },
    { id:'skill-k8s', name:'K8s 部署与治理', priority:'P2', domain:'systems', target:'会部署、探针、HPA、资源限制、灰度与故障排查', deadline:'2027.10 前', deliverable:'项目二部署清单与压测记录', status:'planned' },
    { id:'skill-graphdb', name:'图数据库工程', priority:'P2', domain:'data', target:'掌握 schema、索引、查询、批量写入和性能边界', deadline:'2027.08 前', deliverable:'Neo4j/FalkorDB 二选一的代码图谱实现', status:'planned' },
    { id:'skill-framework-judgement', name:'LangChain / LangGraph 判断力', priority:'P3', domain:'framework', target:'能解释何时复用、何时自建，不依赖框架完成核心逻辑', deadline:'按项目需要', deliverable:'一次框架与自建实现的 trade-off 记录', status:'planned' }
  ],
  interviewTracks: [
    { id:'track-code', name:'算法与编码', target:'稳定通过机考和手撕', items:['数组/链表/树/图','二分/滑窗/回溯/动态规划','并发安全与工程代码质量','复杂度、测试与边界'] },
    { id:'track-foundation', name:'计算机基础', target:'把八股连接到生产案例', items:['进程线程、内存与 I/O','TCP/HTTP/一致性与重试','索引、事务、隔离与慢查询','缓存、消息队列与分布式一致性'] },
    { id:'track-agent', name:'Agent 工程', target:'从 demo 讲到可靠生产系统', items:['上下文与记忆生命周期','工具选择、参数准确率与恢复','Eval、Trace、成本与回归','MCP、沙箱、权限和注入风险'] },
    { id:'track-design', name:'系统设计', target:'兼顾吞吐、成功率、P99 与单位成本', items:['Agent Runtime 与任务调度','RAG/知识图谱服务','多租户隔离与配额','降级、熔断、幂等和可观测性'] }
  ]
};
