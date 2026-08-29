/* 板块 5：实习与岗位。聚合数据，不在浏览器加载 1287 条原始记录。 */
window.JOBS = {
  meta: {
    title: '百度 AI/Agent 相关关键词招聘快照',
    sourceAsOf: '2026-07-28',
    revisedAt: '2026-08-28（地域政策改为「北京中转」并复算口径；快照数据本身未重新抓取）',
    sampleScope: '15 个关键词、社招/日常实习/校招三类检索结果，按 postId 去重',
    denominator: 1287,
    warning: '这是关键词检索快照，不是“百度全部 AI 岗位”；记录数不等于 HC，也不代表当前仍开放。'
  },
  pageNote: '求职（正式校招/秋招）在 2028 年秋，距今还有两年以上，届时信息大多会失效——那部分内容只作预判。<b>实习是研一、研二的事，是当前真正可执行的部分</b>：下面的四级阶梯、地域约束与岗位核验动作按学期推进即可。方向性的求职判断集中放在「求职资产」页（方向参考）。',
  /* ── 页面要点（渲染在页头下方；文案从本页现有内容提炼，勿新造结论） ── */
  summary: [
    '本页重点：实习，不是求职——研一、研二执行四级阶梯 STEP 0—2，方向性求职判断在「求职资产」页。',
    '先城市后岗位：读研期默认只考虑重庆（驻地）与成都（唯一现实跳板）；毕业按杭州→上海→深圳→广州投递。',
    '北京按「中转跳板」纳入：毕业后可接受 1—2 年，优先可迁移方向，不作长期驻地。',
    '14 个策展样本是远期目标地图；研一真正要盯的是阶梯验收标准与重庆/成都线索核验。',
    '快照口径：1287 条是关键词检索样本，不是「百度全部 AI 岗位」，记录数不等于 HC。'
  ],
  /* 地域约束是硬前置：先筛城市，再谈岗位匹配度。
     2026-08-28 修订：北京从「任何阶段不投递」改为「毕业后可接受 1—2 年中转」——
     用最强岗位密度换平台与能力，再跳向更优岗位/城市；读研期实习仍以重庆/成都为默认。
     phases[].cities[].rank 就是你的投递优先级，渲染层用它排序，不按样本量排序。 */
  cityPolicy: {
    headline: '先定城市，再谈岗位。四个意向城市顺序即偏好强度；北京按「中转跳板」定位纳入，不作长期驻地。',
    phases: [
      {
        id: 'study',
        label: '读研期间',
        window: '2026.09 — 2029.06',
        rule: '默认只在重庆与成都；北京日常实习仅作为研二寒假跳板落空后的备选（详见下方中转规则）。',
        cities: [
          { name: '重庆', rank: 1, role: '驻地', why: '学校所在地，研一默认不离渝，通勤成本为零。' },
          { name: '成都', rank: 2, role: '唯一现实跳板', why: '1—2 小时高铁圈，寒暑假可去而不必长期脱离学业。' }
        ]
      },
      {
        id: 'employment',
        label: '毕业就业',
        window: '2029 起',
        rule: '按 杭州 → 上海 → 深圳 → 广州 的顺序投递与取舍；顺序即偏好强度。北京作为中转选项排在其后，接受 1—2 年。',
        cities: [
          { name: '杭州', rank: 1, role: '首选', why: '毕业主投方向，且有本科导师人脉可用。' },
          { name: '上海', rank: 2, role: '次选', why: 'AI 岗密度高于广深，样本中记录数排第二。' },
          { name: '深圳', rank: 3, role: '第三', why: '当前证据最强的一组团队集中在此（腾讯 CSIG）。' },
          { name: '广州', rank: 4, role: '第四', why: '可接受但样本最薄，仅 14 条记录。' },
          { name: '北京', rank: 5, role: '中转跳板（1—2 年）', why: '样本最厚、AI 岗最多。可接受毕业后先在京 1—2 年，再跳向意向城市或更优岗位；不作为长期驻地。' }
        ]
      }
    ],
    transit: {
      cities: ['北京'],
      rule: '北京不再是禁区：可接受毕业后的 1—2 年北京工作作为中转，用最强的岗位密度与平台换能力积累，再跳向首选城市或更优团队。',
      use: '中转的定位是「跳板」而非「终点」：入职时就明确 1—2 年后的跳向（目标城市、目标团队、需要补的能力），优先选可迁移方向（Agent 评测/记忆/平台）与离职溢价高的团队，而不是纯薪资最高的团队。',
      limit: '读研期间的日常实习仍默认重庆/成都；北京 1—2 个月的寒假实习可接受，把它当作中转路线的低成本试错。长期（2 年以上）驻京不在计划内。'
    },
    tension: '偏好顺序与证据强度并不一致：最想去的杭州目前零条已核验 JD，而样本最厚的北京只能作为中转。这不是要你改偏好，而是两件事必须并行——<b>补杭州数据</b>（毕业主投不能零情报），以及<b>把北京中转当成有明确退出计划的路线</b>而不是默认归宿。'
  },
  stats: {
    recruitment: [
      { id:'social', label:'社招', count:796, pct:61.8 },
      { id:'dailyIntern', label:'日常实习', count:332, pct:25.8 },
      { id:'campus', label:'校招', count:159, pct:12.4 }
    ],
    postType: [
      { id:'tech', label:'技术', count:747, pct:58.0 },
      { id:'product', label:'产品', count:352, pct:27.4 },
      { id:'general', label:'综合', count:80, pct:6.2 },
      { id:'government', label:'政企', count:76, pct:5.9 },
      { id:'sales', label:'销售', count:32, pct:2.5 }
    ],
    /* fit 决定这条在城市图里的呈现方式：
       target = 你的意向城市（读研期或毕业期），transit = 北京（中转可接受），
       other = 与决策无关的城市。
       样本量大不代表机会多，所以图表按 fit 分组，不按 count 排序。 */
    cities: [
      { city:'北京', count:1084, pct:84.2, tech:null, fit:'transit' },
      { city:'上海', count:190, pct:14.8, tech:135, fit:'target' },
      { city:'深圳', count:133, pct:10.3, tech:74, fit:'target' },
      { city:'新加坡', count:21, pct:1.6, tech:null, fit:'other' },
      { city:'广州', count:14, pct:1.1, tech:5, fit:'target' },
      { city:'杭州', count:7, pct:0.5, tech:0, fit:'target' },
      { city:'成都', count:7, pct:0.5, tech:4, fit:'target' },
      { city:'大连', count:7, pct:0.5, tech:null, fit:'other' },
      { city:'武汉', count:3, pct:0.2, tech:null, fit:'other' },
      { city:'重庆', count:2, pct:0.2, tech:0, fit:'target' }
    ],
    /* 以下数字按「记录是否包含该城市」去重统计，不是各城市相加（163 条含多城市）。
       2026-08-28 复算：北京从中转视角纳入后，实际选择面是 1,247 条（含技术岗 728）。
       复算命令见 MAINTENANCE.md 第 8 节。 */
    cityReach: [
      { label:'含意向城市（不含北京）', value:'304 / 23.6%', note:'重庆、成都、杭州、上海、深圳、广州任一，其中技术岗 197 条 —— 毕业直接落意向城市的部分' },
      { label:'北京（中转可接受）', value:'943 / 73.3%', note:'纯北京记录，其中技术岗 531 条；作为毕业后 1—2 年中转池纳入，不再是禁区' },
      { label:'意向城市或北京（实际选择面）', value:'1,247 / 96.9%', note:'中转路线成立后的总可投池，其中技术岗 728 条；各城市计数可重叠，不可相加成饼图' }
    ],
    cityNote: '北京占 84.2% 是百度总部效应，不是机会分布；但在「1—2 年中转」的新定位下，它从纯情报变成了真实选项——<b>含北京的总可投池为 1,247 条（技术岗 728）</b>。注意杭州与重庆的技术岗仍为 <b>0</b>——杭州是首选城市却零技术岗样本，最需要自己补数据的地方没有变化。',
    quality: [
      { label:'多城市记录', value:'163 / 12.7%', note:'城市计数可重叠，不能做总和 100% 的饼图' },
      { label:'recruitNum = 0', value:'41 / 3.2%', note:'不应默认视为有效在招' },
      { label:'education 为空', value:'1,277 / 1,287', note:'学历常写在任职要求正文' },
      { label:'workYears 为空', value:'1,285 / 1,287', note:'经验门槛需从正文提取' }
    ]
  },
  roleFamilies: [
    { id:'ai-app', name:'AI 应用开发', tier:'primary', fit:'主目标', scope:'LLM 接入、编排、上下文、工具调用、稳定性', reason:'复用 Python 后端和生产 AI 应用经验', claimType:'inference' },
    { id:'agent', name:'Agent 开发 / 架构', tier:'primary', fit:'主目标', scope:'Runtime、Tool、Memory、Context、多 Agent', reason:'与 AgentParliament 和论文主线直接相连', claimType:'inference' },
    { id:'harness', name:'Harness / 评测 / 可观测', tier:'primary', fit:'第一战略方向', scope:'Trace、Eval、回归、成本、可靠性', reason:'岗位有需求，且能形成工程差异化；“竞争最低”尚无供给数据证明', claimType:'inference' },
    { id:'rag', name:'RAG / 知识库工程', tier:'secondary', fit:'次目标', scope:'混合检索、知识图谱、召回、重排、评测', reason:'必须会完整链路，但不以框架熟练度代替系统能力', claimType:'inference' },
    { id:'posttrain', name:'后训练 / SFT / RL', tier:'avoid', fit:'不作主投', scope:'数据、训练、奖励建模、强化学习', reason:'更偏算法研究，常要求顶会、博士或训练经验', claimType:'inference' },
    { id:'inference', name:'推理优化', tier:'avoid', fit:'不作主投', scope:'CUDA、算子、编译器、推理框架', reason:'与现有积累和导师能力距离较远', claimType:'inference' },
    { id:'platform', name:'云原生 AI 平台', tier:'secondary', fit:'次目标', scope:'K8s、调度、网关、高可用、资源治理', reason:'可复用后端能力，补 Go/K8s 后形成副线', claimType:'inference' },
    { id:'fde', name:'FDE / 解决方案交付', tier:'fallback', fit:'兜底', scope:'客户场景落地、集成、交付与问题定位', reason:'重庆机会相对现实，但长期技术积累取决于团队', claimType:'inference' },
    { id:'backend', name:'传统后端', tier:'fallback', fit:'保底双线', scope:'服务端、分布式、数据库、稳定性', reason:'保留已有职业资本，不能因转 AI 而丢掉', claimType:'inference' }
  ],
  teams: [
    { id:'tx-wx-knowledge', company:'腾讯', name:'WXG 企业微信·企业知识挖掘和应用', cities:['成都','北京'], cityFit:'preferred', roleFamily:'agent', targetTier:'primary', recruitmentTypes:['summerIntern','campus'], careerStages:['summer2029','campus2029'], tags:['Memory','知识图谱','图存储','分布式'], summary:'企业知识图谱、记忆压缩、图存储与高可用后端，是论文与工程经历最强交集。<b>成都有 base，是地域与方向唯一双满足的团队</b>，应作为第一优先。', claimType:'fact', evidenceLevel:'officialPartialJD', sourceAsOf:'2026-07-28', freshness:'historicalSample', opening:'未来实习/校招 HC 待核验；须确认成都是否放学生岗', tier:'S' },
    { id:'tx-wx-memory', company:'腾讯', name:'WXG 企业微信·记忆系统', cities:['北京','成都'], cityFit:'preferred', roleFamily:'harness', targetTier:'primary', recruitmentTypes:['campus'], careerStages:['summer2029','campus2029'], tags:['Memory','压缩','上下文'], summary:'与论文方向最贴合。<b>JD 以北京为先、成都为次</b>：成都 base 仍优先争取；若最终只落北京，在新中转政策下可接受——但入职前就要想清楚 1—2 年后的跳向（杭州/上海的同方向团队）。', claimType:'fact', evidenceLevel:'officialPartialJD', sourceAsOf:'2026-07-28', freshness:'historicalSample', opening:'待核验（成都 base 优先级未知；北京 base 按中转定位可接受）', tier:'A' },
    { id:'tx-databuddy', company:'腾讯', name:'CSIG DataBuddy Agent 研发', cities:['深圳'], cityFit:'acceptable', roleFamily:'agent', targetTier:'primary', recruitmentTypes:['summerIntern','campus'], careerStages:['summer2029','campus2029'], tags:['图谱','Memory','Context','Eval','可观测性'], summary:'同时命中图谱、记忆、上下文、评测与可观测性，适合以 Atlas（假成功检测/台账）与 AgentParliament（交叉审查）作为作品集。深圳在你的可接受范围内。', claimType:'fact', evidenceLevel:'officialPartialJD', sourceAsOf:'2026-07-28', freshness:'historicalSample', opening:'待核验', tier:'S' },
    { id:'tx-harness', company:'腾讯', name:'CSIG Agent Harness / 策略工程', cities:['深圳'], cityFit:'acceptable', roleFamily:'harness', targetTier:'primary', recruitmentTypes:['summerIntern','campus'], careerStages:['summer2029','campus2029'], tags:['Harness','高并发','评测','策略'], summary:'名称偏算法，职责实质包含高并发 Agent 工程、评测和策略闭环。', claimType:'fact', evidenceLevel:'officialPartialJD', sourceAsOf:'2026-07-28', freshness:'historicalSample', opening:'待核验', tier:'S' },
    { id:'tx-yuanbao', company:'腾讯', name:'CSIG 元宝 Agent 架构', cities:['深圳'], cityFit:'acceptable', roleFamily:'agent', targetTier:'primary', recruitmentTypes:['campus'], careerStages:['campus2029'], tags:['Tool','Memory','Context'], summary:'Agent 核心模块架构方向，匹配度高但门槛也高。', claimType:'fact', evidenceLevel:'officialPartialJD', sourceAsOf:'2026-07-28', freshness:'historicalSample', opening:'待核验', tier:'A' },
    { id:'tx-pcg-agent', company:'腾讯', name:'PCG AI 应用开发·Agent 方向', cities:['深圳'], cityFit:'acceptable', roleFamily:'agent', targetTier:'primary', recruitmentTypes:['summerIntern','campus'], careerStages:['summer2029','campus2029'], tags:['MCP','Durable Execution','Eval'], summary:'工程编排、持久执行和评测要求可由开源项目直接举证。', claimType:'fact', evidenceLevel:'officialPartialJD', sourceAsOf:'2026-07-28', freshness:'historicalSample', opening:'待核验', tier:'A' },
    { id:'hz-target-pool', company:'杭州（待建）', name:'阿里 / 蚂蚁 / 网易 / 字节杭州 · Agent 与知识工程方向', cities:['杭州'], cityFit:'preferred', roleFamily:'agent', targetTier:'primary', recruitmentTypes:['summerIntern','campus'], careerStages:['summer2029','campus2029'], tags:['待抓取 JD','Agent','RAG','知识工程'], summary:'<b>这是当前数据的最大缺口，不是已核验岗位。</b>杭州是你毕业后首选城市，但本轮 1912 条（腾讯 625 + 百度 1287）快照未覆盖杭州雇主，因此没有任何可引用的 JD。需要按抓取腾讯/百度的同样方法补一份杭州样本，再把这一条替换为具体团队。', claimType:'needsVerification', evidenceLevel:'needsVerification', sourceAsOf:'—', freshness:'possiblyExpired', opening:'尚无数据，须优先补齐', tier:'S' },
    { id:'cd-hz-winter-pool', company:'成都 / 杭州（待建）', name:'研二寒假跳板实习目标池 · 中厂与 AI 初创', cities:['成都','杭州'], cityFit:'preferred', roleFamily:'ai-app', targetTier:'primary', recruitmentTypes:['dailyIntern'], careerStages:['masterYear2Winter'], tags:['待抓取 JD','Agent 应用','RAG','AI 平台'], summary:'<b>这是阶梯第 2 步的落点，目前没有已核验岗位。</b>研二寒假是唯一能在不牺牲学业的前提下拿到生产经历的窗口，但当前快照里该阶段只剩北京岗位（已降级为情报）。需要在 2027 年上半年补齐成都、杭州的中厂与初创样本，优先找愿意接受 1—2 个月、且有真实 Agent 生产场景的团队。', claimType:'needsVerification', evidenceLevel:'needsVerification', sourceAsOf:'—', freshness:'possiblyExpired', opening:'尚无数据，须在 2027 上半年补齐', tier:'S' },
    { id:'bd-acg-99649', company:'百度', name:'ACG 智能体应用开发实习生 J99649', cities:['北京','上海'], cityFit:'acceptable', roleFamily:'agent', targetTier:'primary', recruitmentTypes:['dailyIntern'], careerStages:['masterYear2Winter','summer2029'], tags:['Neo4j','FalkorDB','AST','调用链'], summary:'完整 JD 与“代码知识图谱 + Agent 根因分析”项目高度一致。<b>上海 base 使其仍在可接受范围</b>，但须确认该岗是否真的在上海开放而非仅挂名。', claimType:'fact', evidenceLevel:'officialFullJD', sourceAsOf:'2026-07-28', freshness:'snapshot', opening:'快照记录；须确认上海是否实际承接', tier:'A' },
    { id:'bd-aidu-99974', company:'百度', name:'AIDU Agent 应用全栈 J99974', cities:['北京'], cityFit:'acceptable', roleFamily:'ai-app', targetTier:'secondary', recruitmentTypes:['campus'], careerStages:['campus2029'], tags:['Agent','全栈','自发项目','中转候选'], summary:'<b>北京中转政策下的首选中转候选。</b>它的任职要求全篇不提学历、明确接受课程与自发项目，是对 AgentParliament/Atlas 这类自发开源项目最友好的 JD。按中转定位使用：入职即规划 1—2 年后的跳向，选可迁移方向积累。', claimType:'fact', evidenceLevel:'officialFullJD', sourceAsOf:'2026-07-28', freshness:'snapshot', opening:'中转路线候选；意向城市有同档 offer 时仍优先意向城市', tier:'B' },
    { id:'bd-coding-96208', company:'百度', name:'Coding Agent 策略实习生 J96208', cities:['北京'], cityFit:'acceptable', roleFamily:'harness', targetTier:'secondary', recruitmentTypes:['dailyIntern'], careerStages:['masterYear2Winter'], tags:['Context','错误恢复','消融','Eval'], summary:'对上下文策略、错误恢复和消融实验的要求，是 AgentParliament/Atlas Eval 层最好的需求参照。<b>研二寒假跳板落空时，可去北京做 1—2 个月日常实习</b>——既攒生产经历，也低成本试错中转路线。', claimType:'fact', evidenceLevel:'officialFullJD', sourceAsOf:'2026-07-28', freshness:'snapshot', opening:'成都/杭州寒假跳板落空后的备选；即使不投，其 JD 仍按情报用于设计 Eval 层', tier:'B' },
    { id:'bd-eval-101072', company:'百度', name:'评测产品实习生 J101072', cities:['北京'], cityFit:'acceptable', roleFamily:'harness', targetTier:'secondary', recruitmentTypes:['dailyIntern'], careerStages:['masterYear2Winter'], tags:['长程任务','记忆连贯性','成本'], summary:'偏产品，主要价值是了解企业如何定义 Agent 质量与成本口径（“记忆连贯性”出现在 JD 原文）。<b>北京中转政策下可作为评测方向的实习备选</b>，优先级低于 Coding Agent 岗。', claimType:'fact', evidenceLevel:'officialFullJD', sourceAsOf:'2026-07-28', freshness:'snapshot', opening:'备选；其“记忆连贯性/成本”指标口径照常用于论文与作品集设计', tier:'C' },
    { id:'tx-cloud-cq', company:'腾讯云', name:'AI 产品客户成功 / FDE', cities:['重庆'], cityFit:'preferred', roleFamily:'fde', targetTier:'fallback', recruitmentTypes:['social','campus'], careerStages:['masterYear1','fallback'], tags:['MCP','RAG','编排','交付'], summary:'本地可接触 Agent 场景，但更偏交付，作为研一不离渝阶段的兜底。', claimType:'fact', evidenceLevel:'officialPartialJD', sourceAsOf:'2026-07-28', freshness:'historicalSample', opening:'待核验', tier:'B' },
    { id:'cq-local-watch', company:'重庆本地', name:'脉聘 / 梧桐车联 / 云从 / 中电科技候选', cities:['重庆'], cityFit:'preferred', roleFamily:'ai-app', targetTier:'fallback', recruitmentTypes:['dailyIntern'], careerStages:['masterYear1','masterYear1Winter'], tags:['Agent','RAG','后端'], summary:'多数证据只有搜索索引摘要或历史职位，只能作为线索池，不能标记为在招。研一唯一不需要离渝的付薪选项。', claimType:'needsVerification', evidenceLevel:'secondaryWeak', sourceAsOf:'2026-07-28', freshness:'possiblyExpired', opening:'逐家核验', tier:'C' }
  ],
  internshipLadder: [
    { id:'ladder-0', step:'0', when:'2026.09 起（入学首月）', title:'把现有远程工程经历正规化', actions:['确认合同、证明和可公开边界（四件套：合同/证明人/脱敏边界/量化口径）','保留提交记录与上线证据，整理成可背调的时间线','补 QPS、成功率、P99、单位成本四个数','和本科导师约定固定的产出汇报节奏'], acceptance:'形成可背调、可量化、可讲清的正式经历', claimType:'inference' },
    { id:'ladder-1', step:'1', when:'研一（2026.09—2027.08）', title:'不长期离渝：开源与本地项目', actions:['openEuler 开源实习：11 月前满 10 积分拿 offer，冲 60 积分拿正式实习证明','OSPP 点亮计划（已改全年开放报名，研一任意时点可启动）','GLCC（研一暑假执行，CCF 背书）','重庆本地短期或校内产业项目：脉聘 / 梧桐车联 / 云从 / 中冶赛迪逐家核验','AgentParliament 加 Eval 层 + Go 并发调度服务','2027.03—06 固定 benchmark、八项指标（与方向 A 评测线共享产出）'], acceptance:'至少 1 个已合并 PR / 正式证明 + minibank-trap 受控评测报告 + Go 并发服务', claimType:'inference' },
    { id:'ladder-2', step:'2', when:'研二寒假前后（2028.01—02）', title:'成都跳板实习（首选），杭州为备选，北京为末位备选', actions:['首选成都：高铁通勤、不必长期脱离学业','2027.10—11 开始接触目标团队 mentor（OSPP/GLCC 导师、开源社区、导师人脉）','同步补抓杭州雇主 JD，为毕业主投铺路','优先 Agent 应用、RAG、AI 平台团队','若成都/杭州落空：北京 1—2 个月日常实习作为中转路线的低成本试错','争取正式 mentor 和生产功能','积累至少两条可靠内推关系'], acceptance:'一个上线功能 + 四项工程指标 + 可核验实习证明', claimType:'inference' },
    { id:'ladder-3', step:'3', when:'2028.02 起', title:'2029 届暑期实习：杭州 → 上海 → 深圳 → 广州，北京按中转定位并行', actions:['2027.12 开始跟踪，意向城市按偏好顺序投递','北京岗位按「中转跳板」定位一并投递：排在意向城市之后，优先可迁移方向','2028.02—03 主投：杭州优先，但须先补齐 JD 证据；深圳证据最强可同时投','2028.04—06 面试与补录','2028.07—08 实习并争取转正；北京 offer 只有在「可迁移方向 + 明确跳出计划」时才接受'], acceptance:'在意向城市进入目标团队，或拿到北京中转 offer 且已写清 1—2 年退出计划', claimType:'forecast' }
  ],
  timeline: [
    { id:'career-2026-09', when:'2026.09', title:'入学与证据建设', detail:'远程经历正规化、开源项目、算法题与基础查漏', type:'plan' },
    { id:'career-2026-q4', when:'2026.10—12', title:'评测设施定型', detail:'minibank-trap 升级为受控评测（配置/重复/成本），准备 MCP / Skills / Function Calling 表达；Atlas 保持测试与台账绿线', type:'plan' },
    { id:'career-2027-q1', when:'2027.01—02', title:'重庆本地尝试', detail:'只把职位当线索，逐一核验是否真实在招与是否兼容学业', type:'plan' },
    { id:'career-2027-h1', when:'2027.03—06', title:'Eval 与 Go', detail:'固定 benchmark、八项指标、Go 调度服务', type:'plan' },
    { id:'career-2027-summer', when:'2027.07—08', title:'开源与项目二', detail:'GLCC / OSPP、代码知识图谱、K8s 基础', type:'plan' },
    { id:'career-2027-h2', when:'2027.09—12', title:'两项目定型', detail:'实测四个核心数字，联系成都/杭州 mentor；开始建立杭州雇主清单', type:'plan' },
    { id:'career-2028-q1', when:'2028.01—03', title:'简历冻结与暑期实习主投', detail:'按 杭州→上海→深圳→广州 顺序投递，成都作为读研期跳板并行保留；北京岗位按中转定位一并投递（排在意向城市之后）。具体窗口属历史规律外推，2027.12 起按公司重新核验', type:'forecast', milestone:true },
    { id:'career-2028-q2', when:'2028.04—06', title:'面试与补录', detail:'保持论文节点与实习审批同步', type:'forecast' },
    { id:'career-2028-summer', when:'2028.07—08', title:'暑期实习', detail:'用成功率、成本、延迟、吞吐记录生产贡献', type:'forecast', milestone:true },
    { id:'career-2028-fall', when:'2028.07—11', title:'提前批与秋招', detail:'暑期转正与正式校招并行，不押单一团队；北京 offer 按「1—2 年中转」定位接受，须同时有可迁移方向与明确跳出计划', type:'forecast' },
    { id:'career-2028-winter', when:'2028.12—2029.03', title:'补录与兜底', detail:'AI 应用、Agent、RAG、AI 平台、后端按优先级展开', type:'forecast' }
  ],
  /* 顺序 = 投递优先级。phase 区分读研期与毕业期，rank 为该阶段内的偏好次序。
     渲染层按 phase 分组、按 rank 排序，不按样本量排序。 */
  regions: [
    { city:'重庆', phase:'study', rank:1, role:'驻地', tier:'preferred', sample:'2 条记录 · 技术岗 0', strategy:'研一默认不离渝：用开源实习、校内产业项目和本地短期机会攒证据，把远程工作正规化。', risk:'大厂技术岗极少，腾讯云岗位偏交付；本地机会多为线索而非已核验在招。' },
    { city:'成都', phase:'study', rank:2, role:'唯一现实跳板', tier:'preferred', sample:'7 条记录 · 技术岗 4', strategy:'读研期最现实的异地目标：与重庆同城化通勤，寒暑假可去而不必长期脱离学业。重点盯腾讯 WXG 企业知识/记忆方向，研二前建立联系。', risk:'当前 JD 只证明团队在成都有 base，不保证成都承接学生 HC——这是首要待核验项。' },
    { city:'杭州', phase:'employment', rank:1, role:'毕业首选', tier:'preferred', sample:'7 条记录 · 技术岗 0', strategy:'毕业主投方向，并有本科导师人脉可用。但本轮快照未覆盖杭州雇主，须优先补抓阿里、蚂蚁、网易、字节杭州的 Agent/知识工程 JD，再定具体团队。', risk:'<b>技术岗样本为 0</b>，所有判断都还是空白。偏好最高但证据最弱，必须自己补数据，不能凭印象规划。' },
    { city:'上海', phase:'employment', rank:2, role:'毕业次选', tier:'preferred', sample:'190 条记录 · 技术岗 135', strategy:'意向城市中样本最厚的一个，可承接百度 ACG 智能体应用方向。在杭州数据补齐前，与深圳并列为现实主线。', risk:'需确认岗位是否真在上海开放而非仅挂名；日常实习常要求每周 4—5 天、连续 5—6 个月。' },
    { city:'深圳', phase:'employment', rank:3, role:'毕业第三', tier:'preferred', sample:'133 条记录 · 技术岗 74', strategy:'腾讯 CSIG（DataBuddy、Harness、元宝、PCG）集中在此，是当前<b>证据最强</b>的一组团队。偏好排第三但情报最扎实。', risk:'仍需确认各团队是否在深圳 base 开放学生岗。' },
    { city:'广州', phase:'employment', rank:4, role:'毕业第四', tier:'preferred', sample:'14 条记录 · 技术岗 5', strategy:'可接受范围内的最后一档，样本最薄，作为补录与兜底方向。', risk:'仅 5 条技术岗记录，不足以支撑独立策略，需与深圳合并考虑。' },
    { city:'北京', phase:'employment', rank:5, role:'中转跳板（1—2 年）', tier:'acceptable', sample:'1,084 条记录 · 占 84.2%', strategy:'2026-08 起的新定位：毕业后可接受 1—2 年北京工作作为中转，用最强岗位密度（样本中技术岗 531 条在纯北京）换平台与能力，再跳向意向城市或更优团队。入职即写清退出计划：目标城市、目标团队、需补能力；优先可迁移方向（评测/记忆/平台），不押不可带的业务。', risk:'中转有真实成本：跳槽谈判窗口、居住成本、社保/公积金连续性；最大的风险是「中转变归宿」——只有把跳出条件写进 offer 决策时，这条路才是跳板而不是陷阱。读研期的北京日常实习同理，只作末位备选。' }
  ],
  risks: {
    data: ['关键词样本不是公司招聘全集','百度与腾讯字段不可比：腾讯缺任职要求','城市可重复计数，记录数不等于 HC','updateDate 不能单独证明仍在招','关键词存在率不等于硬性要求率'],
    career: [
      '北京纳入中转后，实际选择面从 304 条扩大到 1,247 条（技术岗 728）——但其中 943 条纯北京记录只服务「1—2 年中转」这一种用法，不能当作毕业直接落地的默认选项',
      '偏好顺序与证据强度仍然相反：最想去的杭州技术岗样本为 0，意向城市直接落地最厚的是上海（190 条）。杭州补数据与北京中转计划两件事并行，互不替代',
      '杭州目前没有任何已核验的目标岗位，只是意向城市；阿里/蚂蚁/网易的 Agent 岗需要在 2027 年底前自行补齐 JD 证据',
      '成都是唯一「已有 S 级团队证据 + 离渝成本可接受」的城市，但企业微信成都是否开放学生岗位仍未核验，不能当作确定退路',
      '中转路线的隐性成本容易被低估：北京 1—2 年后的跳槽谈判、居住成本、社保连续性；若打算长期（2 年以上）留京，这条路就偏离了本站的地域策略，需要重新做整页决策',
      '头部 AI 公司远程实习缺少可靠证据，不能作为规避异地的默认方案',
      'AI 应用岗仍考算法题和计算机基础；地域选择不降低技术门槛，北京中转岗的竞争反而更激烈',
      'GraphRAG 零命中不代表技术无价值，只是不宜作 ATS 主标签',
      '未来招聘月份、城市与 HC 必须逐年核验，团队常在城市间调整编制'
    ]
  },
  verifySummary: [
    '排序规则：先销掉会改变「能否毕业、能否外出实习、方向是否有算力」的未知条件。',
    'critical 5 项：现行学位成果要求、外出实习办法全文、杭州目标团队 JD、成都学生 HC、2028 招聘窗口。',
    '每项都有明确核验动作；完成后标记销项（本机保存），每月巡检清单一并在本页底部。'
  ],
  verification: [
    { id:'verify-degree', area:'学校', title:'现行学位成果要求', impact:'critical', status:'open', evidence:'needsVerification', action:'向学院学位分委会或研究生院学位办索取全文' },
    { id:'verify-intern-policy', area:'学校', title:'外出实习办法完整原文与适用条件', impact:'critical', status:'open', evidence:'needsVerification', action:'确认“三个月以上”前后完整限定语，不依赖推测安排行程' },
    { id:'verify-compute', area:'科研', title:'课题组算力与 API 经费', impact:'high', status:'open', evidence:'needsVerification', action:'定题前确认 GPU 型号、可用时长、共享规则和预算' },
    { id:'verify-ospp', area:'实习', title:'OSPP 点亮计划当前规则', impact:'medium', status:'open', evidence:'needsVerification', action:'以当年官网确认是否全年、报名窗口和证明规则' },
    { id:'verify-cq-jobs', area:'岗位', title:'重庆候选岗位是否仍在招', impact:'high', status:'open', evidence:'needsVerification', action:'逐家进入官方招聘页或 App 核验，不依赖搜索摘要' },
    { id:'verify-hz-teams', area:'岗位', title:'杭州目标团队与 Agent 岗证据', impact:'critical', status:'open', evidence:'needsVerification', action:'这是毕业首选城市但目前零已核验岗位。抓取阿里/蚂蚁/网易/字节杭州的 Agent、RAG、记忆方向 JD 原文，建立与深圳同等强度的证据池' },
    { id:'verify-cd-student-hc', area:'岗位', title:'成都是否开放学生岗位', impact:'critical', status:'open', evidence:'needsVerification', action:'企业微信成都被定为核心跳板，但现有 JD 只证明团队方向。需确认成都是否单独招实习/校招，而非仅北京编制' },
    { id:'verify-remote-intern', area:'实习', title:'目标团队是否接受远程实习', impact:'high', status:'open', evidence:'needsVerification', action:'地域偏好下远程是关键变量。逐个团队确认是否有远程或混合办公实习先例，不要依据社招政策推断学生岗' },
    { id:'verify-2028-window', area:'招聘', title:'2029 届暑期实习和秋招窗口', impact:'critical', status:'open', evidence:'forecast', action:'2027 年 12 月起建立公司级日历，每周更新' },
    { id:'verify-tx-snapshot', area:'数据', title:'补存腾讯原始岗位快照', impact:'medium', status:'open', evidence:'needsVerification', action:'保存原始响应，复算 625 / 419 与技能出现率' },
    { id:'verify-ap-repo', area:'作品集', title:'AgentParliament 当前能力与指标', impact:'high', status:'open', evidence:'needsVerification', action:'仓库审计后区分 existing / planned / measured' },
    { id:'verify-remote-proof', area:'经历', title:'远程工作证明与可公开成果', impact:'high', status:'open', evidence:'needsVerification', action:'确认合同、证明人、项目脱敏边界与量化口径' }
  ]
};
