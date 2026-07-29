/* 板块 7/8：作品集与求职表达。所有性能指标在实测前保持 null。 */
window.PORTFOLIO = {
  projects: [
    {
      id:'agent-parliament-v2', name:'AgentParliament v2', status:'planned', claimType:'inference',
      problem:'多模型协作若缺乏 Trace、Eval 和长期记忆，只能证明“能跑”，不能证明“更可靠或更划算”。',
      architecture:['Python 多 Agent 编排核心','统一 span/trace 事件模型','离线 Eval runner + golden cases','实体—关系—证据图记忆','指标看板与回归报告'],
      tradeoffs:['先建 Trace 再做 Eval，避免无法解释指标变化','Eval 先用固定小 benchmark，换可重复性而非规模','图记忆必须与平铺记忆对照，不预设图一定更好'],
      milestones:[
        { id:'ap-trace', stage:'Trace', title:'完整任务回放', tasks:['span 树与父子关系','输入/输出、token、延迟、成本','失败、重试与 fallback 链连续性'], acceptance:'任一任务可由 trace 定位失败节点并计算总成本' },
        { id:'ap-eval', stage:'Eval', title:'固定 benchmark 与回归', tasks:['golden answer / workflow','成功率、工具选择与参数准确率','恢复率、重试数、P99、成本、上下文利用率','单模型 vs 多模型、聚合策略消融'], acceptance:'输出可复跑报告，并记录至少一个反直觉结论' },
        { id:'ap-memory', stage:'Graph Memory', title:'跨会话图记忆', tasks:['实体—关系—证据 schema','增量更新与来源追踪','冲突检测和 salience 衰减','flat vs graph A/B'], acceptance:'同时报告长程成功率、记忆连贯性、token 成本与 P99' }
      ],
      metrics:[
        { key:'qps', label:'吞吐 / QPS', value:null, status:'target' },
        { key:'success', label:'任务成功率', value:null, status:'target' },
        { key:'p99', label:'P99 延迟', value:null, status:'target' },
        { key:'cost', label:'单位任务成本', value:null, status:'target' }
      ],
      artifacts:['GitHub 仓库与版本化 release','可重放 trace 样例','benchmark 数据与评测报告','架构决策与失败复盘','3—5 分钟演示视频'],
      relatedRoles:['Harness / 评测 / 可观测','Agent 开发 / 架构','AI 应用开发'],
      relatedTeams:['腾讯 CSIG DataBuddy','腾讯 PCG Agent','百度 Coding Agent']
    },
    {
      id:'code-graph-rca', name:'代码知识图谱 + Agent 根因分析', status:'planned', claimType:'inference',
      problem:'仅靠向量检索难以保留调用、依赖和影响关系；故障定位需要结构化代码图与可验证的推理路径。',
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
    { title:'两深胜过四浅', detail:'每个项目都必须有真实用户问题、架构权衡、失败复盘和可复跑数字。' },
    { title:'四个数字', detail:'吞吐/QPS、成功率、P99 延迟、单位成本；未实测就显示“待实测”。' },
    { title:'一个错误故事', detail:'记录一次错误选择、观测证据、纠正方案和纠正后的结果。' },
    { title:'证据可追溯', detail:'README、release、benchmark、trace、演示和公开 PR 共同构成可信作品集。' }
  ],
  narratives: {
    positioning:'我是有生产后端经验的 Agent 工程师，研究生阶段把长期记忆、评测和可观测性做成可量化的系统能力。',
    whyGraduate:'工作中遇到长任务记忆与可靠性问题，单靠调用模型和工程补丁无法系统解决，因此用研究生阶段把问题形式化、做基准、做方法并回到生产验证。',
    thesisToJob:'长运行 Agent 会积累大量记忆；平铺存储丢关系、冲突难处理、上下文成本高。我的工作用异构图表达实体/事件/工具轨迹，以社区分层压缩和子图检索控制质量、成本与 P99，并明确图方案不值得使用的边界。',
    notGraphRag:'学术上研究异构属性图聚类；求职时表述为 Agent 长期记忆、上下文压缩、知识图谱检索与生命周期管理。',
    labels:['Agent Evaluation','Observability','Long-term Memory','Context Engineering','Distributed Backend','MCP','RAG','Knowledge Graph','Go / Python']
  },
  resumeBullets: [
    { id:'resume-ap', project:'AgentParliament', template:'设计并实现多模型 Agent 的端到端 Trace/Eval 管线，覆盖 {任务数} 个基准任务；将成功率从 {A} 提升至 {B}，P99 为 {C}，单位任务成本降低 {D}。（仅在实测后填写）' },
    { id:'resume-memory', project:'图记忆研究', template:'构建实体—事件—工具轨迹异构记忆图，以社区级粗召回 + 节点级精排实现长程记忆；相较平铺记忆在 {数据集} 上取得 {指标}，token 成本变化 {数值}。（仅在实测后填写）' },
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
    { tier:'S', targets:['杭州：阿里云 / 蚂蚁 Agent 与知识团队','成都：腾讯 WXG 企业知识 / 记忆'], reason:'毕业首选城市 + 研究与作品集主线交汇；杭州侧团队仍需逐一核验原始 JD' },
    { tier:'A', targets:['深圳：腾讯 CSIG DataBuddy / AgentRuntime / 元宝 / PCG','广州：AI 应用与平台团队','杭州：网易 / 中厂 / 强 AI 初创'], reason:'可接受城市中匹配度最高的一批；深圳证据最完整' },
    { tier:'B', targets:['上海：AI Lab 与大厂 Agent 团队','远程优先的 Agent 团队'], reason:'可考虑但非首选；远程机会需核实是否真实存在' },
    { tier:'Fallback', targets:['重庆：FDE / 国企数科 / 本地开发','AI 平台','传统后端'], reason:'不牺牲工程成长性，优先真实问题和团队中心度' },
    { tier:'Avoid', targets:['仅限北京且无远程的岗位'], reason:'与个人地域意向冲突，除非该团队提供远程或成都/深圳同岗位' }
  ]
};
