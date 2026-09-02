/* 板块 5：实习与岗位。聚合数据，不在浏览器加载 1287 条原始记录。 */
window.JOBS = {
  meta: {
    title: '百度 AI/Agent 相关关键词招聘快照',
    sourceAsOf: '2026-07-28',
    revisedAt: '2026-08-28（地域政策改为「北京可作中转」，相关数字重新算过；快照数据本身没有重新抓取）',
    sampleScope: '15 个关键词、社招/日常实习/校招三类检索结果，按 postId 去重',
    denominator: 1287,
    warning: '这是按关键词搜出来的快照，不等于「百度全部的 AI 岗位」；一条记录也不等于一个招聘名额，更不能说明这个岗位现在还在招。'
  },
  pageNote: '正式校招在 2028 年秋，距今两年多，到那时这里的大部分信息都会过期，所以相关内容只能当预判看。<b>实习才是当下真正要做的事，研一、研二就要执行</b>：下面的四级阶梯、城市限制和岗位核验动作，按学期推进就行。至于毕业后的方向性判断，集中在「求职资产」页。',
  /* ── 页面要点（渲染在页头下方；文案从本页现有内容提炼，勿新造结论） ── */
  summary: [
    '这一页的重点是实习，不是求职。研一、研二要做的是四级阶梯里的第 0—2 步；方向性的求职判断写在「求职资产」页。',
    '先看城市，再看岗位。读研期间默认只考虑两个城市：重庆（学校所在地）和成都（唯一现实的跳板）；毕业时按杭州、上海、深圳、广州的顺序投。',
    '北京按「中转」处理：毕业之后可以去干 1—2 年，但要优先选能力带得走的方向，不把北京当长期落脚的城市。',
    '页里人工整理的 14 个岗位样本，画的是远期要去哪里；研一真正要盯的，是实习阶梯每一步的验收标准，和重庆、成都线索的逐一核实。',
    '这份快照怎么来的：1287 条都是按关键词搜出来的样本，不是百度全部的 AI 岗位；一条记录也不等于一个招聘名额。'
  ],
  /* 地域约束是硬前置：先筛城市，再谈岗位匹配度。
     2026-08-28 修订：北京从「任何阶段不投递」改为「毕业后可接受 1—2 年中转」——
     用最强岗位密度换平台与能力，再跳向更优岗位/城市；读研期实习仍以重庆/成都为默认。
     phases[].cities[].rank 就是你的投递优先级，渲染层用它排序，不按样本量排序。 */
  cityPolicy: {
    headline: '先把城市定下来，再谈岗位。四个意向城市按喜欢的程度排了顺序；北京作为中转站也纳入考虑，但不打算长驻。',
    phases: [
      {
        id: 'study',
        label: '读研期间',
        window: '2026.09 — 2029.06',
        rule: '默认只考虑重庆和成都两个城市。北京的日常实习排在研二寒假的成都、杭州都落空之后，才作为备选（规则见下面的中转说明）。',
        cities: [
          { name: '重庆', rank: 1, role: '常驻', why: '学校就在这里。研一默认不离开重庆，上下班零成本。' },
          { name: '成都', rank: 2, role: '唯一现实的跳板', why: '高铁 1—2 小时能到学校。寒暑假可以去做实习，不用长期离开学业。' }
        ]
      },
      {
        id: 'employment',
        label: '毕业就业',
        window: '2029 起',
        rule: '按杭州、上海、深圳、广州的顺序投递和取舍，顺序就是偏好。北京排在这四个之后，可以接受待 1—2 年。',
        cities: [
          { name: '杭州', rank: 1, role: '首选', why: '毕业时主攻这里，而且本科导师的人脉在这个城市用得上。' },
          { name: '上海', rank: 2, role: '次选', why: 'AI 岗位比广州深圳密集，样本里记录数排第二。' },
          { name: '深圳', rank: 3, role: '第三', why: '目前证据最扎实的一组团队都在这里（腾讯 CSIG）。' },
          { name: '广州', rank: 4, role: '第四', why: '可以接受，但样本太少，只有 14 条记录。' },
          { name: '北京', rank: 5, role: '中转（1—2 年）', why: '样本最厚、AI 岗位最多。毕业后可以先去干 1—2 年，再跳到意向城市或更好的团队；不打算长期留在北京。' }
        ]
      }
    ],
    transit: {
      cities: ['北京'],
      rule: '北京不再是排除项。毕业后可以去工作 1—2 年，借那里最密集的岗位和平台攒能力，之后再跳去首选城市或更好的团队。',
      use: '把中转当跳板、别当终点：入职的时候就想清楚 1—2 年后跳去哪（哪个城市、哪类团队、要补什么能力）。挑团队优先看方向是不是带得走（Agent 评测、记忆、平台这类），其次看离职后身价涨不涨，只看薪资最高没有意义。',
      limit: '读研期间的日常实习还是只认重庆、成都。北京的寒假实习可以去 1—2 个月，相当于用很低的成本先试一遍中转这条路。长期留北京（2 年以上）不在计划里。'
    },
    tension: '喜欢的顺序和证据的强弱对不上：最想去的杭州目前没有一条核实过的 JD，样本最厚的北京却只能当中转。这不是要改偏好，而是有两件事必须同时做：<b>补上杭州的数据</b>（毕业的主投城市不能一点情报都没有），同时<b>给北京的中转路线写清楚退出计划</b>，别让它顺理成章变成归宿。'
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
      { label:'含意向城市（不含北京）', value:'304 / 23.6%', note:'重庆、成都、杭州、上海、深圳、广州任意一个，里面有 197 条技术岗。这部分对应的是毕业就能直接落在意向城市的岗位。' },
      { label:'北京（中转可接受）', value:'943 / 73.3%', note:'只写了北京的记录，其中技术岗 531 条。按毕业后去 1—2 年的中转池来看待，不再是排除项。' },
      { label:'意向城市或北京（实际选择面）', value:'1,247 / 96.9%', note:'算上北京中转之后的总可投池，其中技术岗 728 条。注意各城市的计数会重叠，不能拿来加总做饼图。' }
    ],
    cityNote: '北京的 84.2% 是因为百度总部就在北京，不代表机会都集中在那里。但按「毕业后可去 1—2 年」的新定位，它从纯参考信息变成了真实选项：<b>算上北京，总可投池是 1,247 条（技术岗 728）</b>。要留意杭州和重庆的技术岗样本依然是 <b>0</b>。最想去的杭州反而一条技术岗记录都没有，这个缺口还是得自己补。',
    quality: [
      { label:'多城市记录', value:'163 / 12.7%', note:'一条记录可以涉及多个城市，计数会重叠，不能拿来做总和 100% 的饼图' },
      { label:'recruitNum = 0', value:'41 / 3.2%', note:'招聘名额写 0，不能当成还在招' },
      { label:'education 为空', value:'1,277 / 1,287', note:'学历要求大多写在任职要求正文里' },
      { label:'workYears 为空', value:'1,285 / 1,287', note:'经验年限要从正文里找' }
    ]
  },
  roleFamilies: [
    { id:'ai-app', name:'AI 应用开发', tier:'primary', fit:'主目标', scope:'LLM 接入、编排、上下文、工具调用、稳定性', reason:'能直接用上我 Python 后端和 AI 应用的生产经验', claimType:'inference' },
    { id:'agent', name:'Agent 开发 / 架构', tier:'primary', fit:'主目标', scope:'Runtime、Tool、Memory、Context、多 Agent', reason:'和 AgentParliament、论文主线都接得上', claimType:'inference' },
    { id:'harness', name:'Harness / 评测 / 可观测', tier:'primary', fit:'第一战略方向', scope:'Trace、Eval、回归、成本、可靠性', reason:'岗位确实在招，也能让我和别的候选人区分开。至于「竞争最少」这个说法，还没有数据能证明。', claimType:'inference' },
    { id:'rag', name:'RAG / 知识库工程', tier:'secondary', fit:'次目标', scope:'混合检索、知识图谱、召回、重排、评测', reason:'整条链路必须都会，但框架玩得熟不等于会把系统做好', claimType:'inference' },
    { id:'posttrain', name:'后训练 / SFT / RL', tier:'avoid', fit:'不作主投', scope:'数据、训练、奖励建模、强化学习', reason:'更偏算法研究，通常要求顶会论文、博士学历或训练经验', claimType:'inference' },
    { id:'inference', name:'推理优化', tier:'avoid', fit:'不作主投', scope:'CUDA、算子、编译器、推理框架', reason:'离我现在的积累和导师的能力范围都太远', claimType:'inference' },
    { id:'platform', name:'云原生 AI 平台', tier:'secondary', fit:'次目标', scope:'K8s、调度、网关、高可用、资源治理', reason:'后端能力可以复用，把 Go 和 K8s 补上就能当第二主线', claimType:'inference' },
    { id:'fde', name:'FDE / 解决方案交付', tier:'fallback', fit:'兜底', scope:'客户场景落地、集成、交付与问题定位', reason:'在重庆这类机会最现实，但干久了技术会不会废掉，要看具体团队', claimType:'inference' },
    { id:'backend', name:'传统后端', tier:'fallback', fit:'保底双线', scope:'服务端、分布式、数据库、稳定性', reason:'这是我已有的职业资本，转 AI 不能把它丢掉', claimType:'inference' }
  ],
  teams: [
    { id:'tx-wx-knowledge', company:'腾讯', name:'WXG 企业微信·企业知识挖掘和应用', cities:['成都','北京'], cityFit:'preferred', roleFamily:'agent', targetTier:'primary', recruitmentTypes:['summerIntern','campus'], careerStages:['summer2029','campus2029'], tags:['Memory','知识图谱','图存储','分布式'], summary:'做企业知识图谱、记忆压缩、图存储和高可用后端，是论文方向和工程经历重合度最高的团队。<b>它在成都有办公点，是城市和方向唯一同时满足要求的团队</b>，排在第一优先。', claimType:'fact', evidenceLevel:'officialPartialJD', sourceAsOf:'2026-07-28', freshness:'historicalSample', opening:'未来实习/校招 HC 待核验；须确认成都是否放学生岗', tier:'S' },
    { id:'tx-wx-memory', company:'腾讯', name:'WXG 企业微信·记忆系统', cities:['北京','成都'], cityFit:'preferred', roleFamily:'harness', targetTier:'primary', recruitmentTypes:['campus'], careerStages:['summer2029','campus2029'], tags:['Memory','压缩','上下文'], summary:'方向上最贴合论文。<b>但 JD 先北京、后成都</b>：成都的岗位仍要优先争取；如果最后只有北京的 offer，按中转的定位可以去，但入职前就要想清楚 1—2 年后跳去哪（杭州、上海的同方向团队）。', claimType:'fact', evidenceLevel:'officialPartialJD', sourceAsOf:'2026-07-28', freshness:'historicalSample', opening:'待核验（成都 base 优先级未知；北京 base 按中转定位可接受）', tier:'A' },
    { id:'tx-databuddy', company:'腾讯', name:'CSIG DataBuddy Agent 研发', cities:['深圳'], cityFit:'acceptable', roleFamily:'agent', targetTier:'primary', recruitmentTypes:['summerIntern','campus'], careerStages:['summer2029','campus2029'], tags:['图谱','Memory','Context','Eval','可观测性'], summary:'岗位关键词同时有图谱、记忆、上下文、评测、可观测性，正适合拿 Atlas（假成功检测和台账）与 AgentParliament（交叉审查）当作品集去投。深圳在我的接受范围内。', claimType:'fact', evidenceLevel:'officialPartialJD', sourceAsOf:'2026-07-28', freshness:'historicalSample', opening:'待核验', tier:'S' },
    { id:'tx-harness', company:'腾讯', name:'CSIG Agent Harness / 策略工程', cities:['深圳'], cityFit:'acceptable', roleFamily:'harness', targetTier:'primary', recruitmentTypes:['summerIntern','campus'], careerStages:['summer2029','campus2029'], tags:['Harness','高并发','评测','策略'], summary:'职位名称看着偏算法，但职责实际是高并发的 Agent 工程、评测和策略闭环。', claimType:'fact', evidenceLevel:'officialPartialJD', sourceAsOf:'2026-07-28', freshness:'historicalSample', opening:'待核验', tier:'S' },
    { id:'tx-yuanbao', company:'腾讯', name:'CSIG 元宝 Agent 架构', cities:['深圳'], cityFit:'acceptable', roleFamily:'agent', targetTier:'primary', recruitmentTypes:['campus'], careerStages:['campus2029'], tags:['Tool','Memory','Context'], summary:'做 Agent 核心模块的架构。匹配度高，门槛也高。', claimType:'fact', evidenceLevel:'officialPartialJD', sourceAsOf:'2026-07-28', freshness:'historicalSample', opening:'待核验', tier:'A' },
    { id:'tx-pcg-agent', company:'腾讯', name:'PCG AI 应用开发·Agent 方向', cities:['深圳'], cityFit:'acceptable', roleFamily:'agent', targetTier:'primary', recruitmentTypes:['summerIntern','campus'], careerStages:['summer2029','campus2029'], tags:['MCP','Durable Execution','Eval'], summary:'要求工程编排、持久执行和评测，这三项我的开源项目可以直接当证明。', claimType:'fact', evidenceLevel:'officialPartialJD', sourceAsOf:'2026-07-28', freshness:'historicalSample', opening:'待核验', tier:'A' },
    { id:'hz-target-pool', company:'杭州（待建）', name:'阿里 / 蚂蚁 / 网易 / 字节杭州 · Agent 与知识工程方向', cities:['杭州'], cityFit:'preferred', roleFamily:'agent', targetTier:'primary', recruitmentTypes:['summerIntern','campus'], careerStages:['summer2029','campus2029'], tags:['待抓取 JD','Agent','RAG','知识工程'], summary:'<b>这是当前数据最大的缺口，不是一条核实过的岗位。</b>杭州是毕业后最想去的城市，但这次抓的 1912 条快照（腾讯 625 加百度 1287）没有覆盖杭州的雇主，所以一条能引用的 JD 都没有。要按抓腾讯、百度的同一个办法补一份杭州样本，然后把这条换成具体团队。', claimType:'needsVerification', evidenceLevel:'needsVerification', sourceAsOf:'—', freshness:'possiblyExpired', opening:'尚无数据，须优先补齐', tier:'S' },
    { id:'cd-hz-winter-pool', company:'成都 / 杭州（待建）', name:'研二寒假跳板实习目标池 · 中厂与 AI 初创', cities:['成都','杭州'], cityFit:'preferred', roleFamily:'ai-app', targetTier:'primary', recruitmentTypes:['dailyIntern'], careerStages:['masterYear2Winter'], tags:['待抓取 JD','Agent 应用','RAG','AI 平台'], summary:'<b>实习阶梯第 2 步要落在这里，但目前没有一条核实过的岗位。</b>研二寒假是唯一一个不用牺牲学业就能拿到生产经历的窗口，可快照里这个阶段能投的只剩北京的岗位（已经降级为参考情报）。要在 2027 年上半年把成都、杭州的中厂和初创样本补起来，优先找接受 1—2 个月短期实习、并且真有 Agent 生产场景的团队。', claimType:'needsVerification', evidenceLevel:'needsVerification', sourceAsOf:'—', freshness:'possiblyExpired', opening:'尚无数据，须在 2027 上半年补齐', tier:'S' },
    { id:'bd-acg-99649', company:'百度', name:'ACG 智能体应用开发实习生 J99649', cities:['北京','上海'], cityFit:'acceptable', roleFamily:'agent', targetTier:'primary', recruitmentTypes:['dailyIntern'], careerStages:['masterYear2Winter','summer2029'], tags:['Neo4j','FalkorDB','AST','调用链'], summary:'JD 全文和「代码知识图谱加 Agent 根因分析」这个项目高度对口。<b>办公地有上海，还在可接受范围内</b>，但要确认这个岗位真的在上海招人，而不是只挂了个地名。', claimType:'fact', evidenceLevel:'officialFullJD', sourceAsOf:'2026-07-28', freshness:'snapshot', opening:'快照记录；须确认上海是否实际承接', tier:'A' },
    { id:'bd-aidu-99974', company:'百度', name:'AIDU Agent 应用全栈 J99974', cities:['北京'], cityFit:'acceptable', roleFamily:'ai-app', targetTier:'secondary', recruitmentTypes:['campus'], careerStages:['campus2029'], tags:['Agent','全栈','自发项目','中转候选'], summary:'<b>走北京中转的话，这是第一候选。</b>任职要求通篇不提学历，明确写接受课程项目和自发项目，是对 AgentParliament、Atlas 这类自己做的开源项目最友好的一条 JD。按中转来用：入职就开始规划 1—2 年后去哪，积累挑带得走的方向。', claimType:'fact', evidenceLevel:'officialFullJD', sourceAsOf:'2026-07-28', freshness:'snapshot', opening:'中转路线候选；意向城市有同档 offer 时仍优先意向城市', tier:'B' },
    { id:'bd-coding-96208', company:'百度', name:'Coding Agent 策略实习生 J96208', cities:['北京'], cityFit:'acceptable', roleFamily:'harness', targetTier:'secondary', recruitmentTypes:['dailyIntern'], careerStages:['masterYear2Winter'], tags:['Context','错误恢复','消融','Eval'], summary:'要求里有上下文策略、错误恢复和消融实验，正好是 AgentParliament/Atlas 的 Eval 层要回答的问题，可以拿它当需求参照。<b>研二寒假成都、杭州都落空的话，可以去北京做 1—2 个月日常实习</b>：既攒了一段生产经历，也顺便把中转这条路低成本试一遍。', claimType:'fact', evidenceLevel:'officialFullJD', sourceAsOf:'2026-07-28', freshness:'snapshot', opening:'成都/杭州寒假跳板落空后的备选；即使不投，其 JD 仍按情报用于设计 Eval 层', tier:'B' },
    { id:'bd-eval-101072', company:'百度', name:'评测产品实习生 J101072', cities:['北京'], cityFit:'acceptable', roleFamily:'harness', targetTier:'secondary', recruitmentTypes:['dailyIntern'], careerStages:['masterYear2Winter'], tags:['长程任务','记忆连贯性','成本'], summary:'偏产品岗。它的主要价值是能看到企业怎么定义 Agent 的质量和成本（「记忆连贯性」这个词就出自 JD 原文）。<b>走北京中转时，可以当评测方向的实习备选</b>，排在 Coding Agent 岗之后。', claimType:'fact', evidenceLevel:'officialFullJD', sourceAsOf:'2026-07-28', freshness:'snapshot', opening:'备选；其“记忆连贯性/成本”指标口径照常用于论文与作品集设计', tier:'C' },
    { id:'tx-cloud-cq', company:'腾讯云', name:'AI 产品客户成功 / FDE', cities:['重庆'], cityFit:'preferred', roleFamily:'fde', targetTier:'fallback', recruitmentTypes:['social','campus'], careerStages:['masterYear1','fallback'], tags:['MCP','RAG','编排','交付'], summary:'在本地能接触到 Agent 场景，但工作偏交付。当作研一不离开重庆时的保底选择。', claimType:'fact', evidenceLevel:'officialPartialJD', sourceAsOf:'2026-07-28', freshness:'historicalSample', opening:'待核验', tier:'B' },
    { id:'cq-local-watch', company:'重庆本地', name:'脉聘 / 梧桐车联 / 云从 / 中电科技候选', cities:['重庆'], cityFit:'preferred', roleFamily:'ai-app', targetTier:'fallback', recruitmentTypes:['dailyIntern'], careerStages:['masterYear1','masterYear1Winter'], tags:['Agent','RAG','后端'], summary:'大部分证据只是搜索结果的摘要或过期的职位页，只能当线索清单看，不能当成在招。这是研一不用离开重庆仅有的几个带薪选项。', claimType:'needsVerification', evidenceLevel:'secondaryWeak', sourceAsOf:'2026-07-28', freshness:'possiblyExpired', opening:'逐家核验', tier:'C' }
  ],
  internshipLadder: [
    { id:'ladder-0', step:'0', when:'2026.09 起（入学首月）', title:'把已有的远程工程经历做成经得起背调的正式经历', actions:['把合同、证明人、哪些内容可以公开、可引用的数字范围这四样确认下来','把提交记录和上线证据留好，整理成一条经得起背调的时间线','把 QPS、成功率、P99、单位成本这四个数字补出来','和本科导师约定固定的汇报节奏'], acceptance:'这段经历经得起背调、拿得出数字、三分钟能讲清楚', claimType:'inference' },
    { id:'ladder-1', step:'1', when:'研一（2026.09—2027.08）', title:'不长期离渝：开源与本地项目', actions:['openEuler 开源实习：11 月前攒满 10 个积分拿 offer，再冲 60 积分拿正式实习证明','OSPP 点亮计划（现在全年都能报名，研一任何时间开始都行）','GLCC（研一暑假做，有 CCF 背书）','重庆本地短期岗位或校内产业项目：脉聘、梧桐车联、云从、中冶赛迪，一家一家去核','给 AgentParliament 加 Eval 层；另做一个 Go 并发调度服务','2027.03—06：把 benchmark 和八项指标固定下来（产出和方向 A 的评测线共用）'], acceptance:'至少 1 个合并进主干的 PR 或正式实习证明，加上 minibank-trap 的受控评测报告和 Go 并发服务', claimType:'inference' },
    { id:'ladder-2', step:'2', when:'研二寒假前后（2028.01—02）', title:'成都跳板实习（首选），杭州为备选，北京为末位备选', actions:['优先成都：高铁通勤，不用长期离开学校','2027.10—11 开始和目标团队的 mentor 搭上线（渠道：OSPP/GLCC 的导师、开源社区、导师人脉）','同时补抓杭州雇主的 JD，为毕业主投提前准备','优先找 Agent 应用、RAG、AI 平台这几类团队','成都、杭州都没落空的话，退一步：去北京做 1—2 个月日常实习，把中转这条路低成本试一遍','争取一个正式 mentor，和一段真正上线的功能','攒下至少两条能用的内推关系'], acceptance:'有 1 个上线的功能、4 项工程指标，和一份能核实真伪的实习证明', claimType:'inference' },
    { id:'ladder-3', step:'3', when:'2028.02 起', title:'2029 届暑期实习：杭州 → 上海 → 深圳 → 广州，北京按中转定位并行', actions:['2027.12 开始跟踪各家节奏，按偏好顺序给意向城市投递','北京的岗位按中转的定位一起投，但排在意向城市之后，优先挑方向带得走的','2028.02—03 主投：杭州优先，但要先补上 JD 证据；深圳证据最足，可以同一批投','2028.04—06 面试与补录','2028.07—08 做实习、争取转正；北京的 offer 只有在“方向带得走、离开计划写清楚”两个条件同时成立时才接'], acceptance:'进了意向城市的目标团队；或者拿到北京的 offer，并且退出计划（1—2 年后去哪）已经写清楚', claimType:'forecast' }
  ],
  timeline: [
    { id:'career-2026-09', when:'2026.09', title:'入学与证据建设', detail:'把远程工作经历做成经得起背调的正式材料；推进开源项目；刷算法题、补基础课的漏洞', type:'plan' },
    { id:'career-2026-q4', when:'2026.10—12', title:'评测设施定型', detail:'把 minibank-trap 升级成受控评测（记配置、重复次数、成本）；准备好 MCP、Skills、Function Calling 的说法；Atlas 的测试和台账保持全绿', type:'plan' },
    { id:'career-2027-q1', when:'2027.01—02', title:'重庆本地尝试', detail:'重庆的岗位先只当线索，一家一家核：是不是真在招、时间能不能和学业错开', type:'plan' },
    { id:'career-2027-h1', when:'2027.03—06', title:'Eval 与 Go', detail:'固定 benchmark 和八项指标；完成 Go 调度服务', type:'plan' },
    { id:'career-2027-summer', when:'2027.07—08', title:'开源与项目二', detail:'做 GLCC 或 OSPP；开始代码知识图谱；补 K8s 基础', type:'plan' },
    { id:'career-2027-h2', when:'2027.09—12', title:'两项目定型', detail:'把两个项目的四个核心数字测出来；联系成都和杭州的 mentor；开始整理杭州雇主清单', type:'plan' },
    { id:'career-2028-q1', when:'2028.01—03', title:'简历冻结与暑期实习主投', detail:'按杭州、上海、深圳、广州的顺序投；成都的跳板实习并行保留；北京岗位按中转的定位一起投，排在意向城市后面。具体时间点是从往年规律推的，2027.12 开始要一家一家公司重新核实', type:'forecast', milestone:true },
    { id:'career-2028-q2', when:'2028.04—06', title:'面试与补录', detail:'论文的时间节点和实习审批要一起安排，别互相挤掉', type:'forecast' },
    { id:'career-2028-summer', when:'2028.07—08', title:'暑期实习', detail:'把实习期的贡献用成功率、成本、延迟、吞吐记成可引用的数字', type:'forecast', milestone:true },
    { id:'career-2028-fall', when:'2028.07—11', title:'提前批与秋招', detail:'争取暑期实习转正，同时正常参加秋招，不吊死在一个团队；北京的 offer 按 1—2 年中转来接，前提同样是方向带得走、离开计划写清楚', type:'forecast' },
    { id:'career-2028-winter', when:'2028.12—2029.03', title:'补录与兜底', detail:'按优先级继续投 AI 应用、Agent、RAG、AI 平台、后端', type:'forecast' }
  ],
  /* 顺序 = 投递优先级。phase 区分读研期与毕业期，rank 为该阶段内的偏好次序。
     渲染层按 phase 分组、按 rank 排序，不按样本量排序。 */
  regions: [
    { city:'重庆', phase:'study', rank:1, role:'驻地', tier:'preferred', sample:'2 条记录 · 技术岗 0', strategy:'研一默认不离开重庆：用开源实习、校内产业项目和本地的短期机会攒材料，同时把之前的远程工作经历做成经得起背调的正式经历。', risk:'大厂的技术岗很少，腾讯云的岗位偏交付；本地那些机会大多是线索，没有一条核实过还在招。' },
    { city:'成都', phase:'study', rank:2, role:'唯一现实跳板', tier:'preferred', sample:'7 条记录 · 技术岗 4', strategy:'读研期间最现实的异地选择：和重庆高铁通勤，寒暑假去实习不用长期离开学校。重点盯腾讯 WXG 的企业知识和记忆方向，研二结束前和那边的人建立联系。', risk:'现在的 JD 只能证明这个团队在成都设有办公点，不证明成都接收实习生。这是最需要先去核实的一条。' },
    { city:'杭州', phase:'employment', rank:1, role:'毕业首选', tier:'preferred', sample:'7 条记录 · 技术岗 0', strategy:'毕业时主攻这里，本科导师的人脉也用得上。问题是这次快照没抓到杭州的雇主，所以要先补抓阿里、蚂蚁、网易、字节的杭州 Agent 和知识工程 JD，再定具体投哪个团队。', risk:'<b>技术岗样本是 0 条</b>，关于杭州的所有判断都还是空白。越想去、证据越少，必须自己补数据，不能靠印象做规划。' },
    { city:'上海', phase:'employment', rank:2, role:'毕业次选', tier:'preferred', sample:'190 条记录 · 技术岗 135', strategy:'意向城市里样本最多的一个，能接住百度 ACG 的智能体应用方向。杭州数据补起来之前，和上海、深圳并列作为现实主线。', risk:'要先确认岗位真的在上海招人、不是挂名；另外日常实习通常要求每周 4—5 天、连续 5—6 个月，学业上能不能答应要提前想。' },
    { city:'深圳', phase:'employment', rank:3, role:'毕业第三', tier:'preferred', sample:'133 条记录 · 技术岗 74', strategy:'腾讯 CSIG 的几个团队（DataBuddy、Harness、元宝、PCG）都在这里，是<b>目前证据最强</b>的一组。城市偏好排第三，但情报做得最扎实。', risk:'还要逐个确认这些团队在深圳是不是真的开学生岗。' },
    { city:'广州', phase:'employment', rank:4, role:'毕业第四', tier:'preferred', sample:'14 条记录 · 技术岗 5', strategy:'可接受的城市里排最后，样本也最薄，用来补录和兜底。', risk:'只有 5 条技术岗记录，做不了单独的策略，和深圳一起考虑。' },
    { city:'北京', phase:'employment', rank:5, role:'中转跳板（1—2 年）', tier:'acceptable', sample:'1,084 条记录 · 占 84.2%', strategy:'2026-08 定的新规矩：毕业后可接受先去北京干 1—2 年，用那里最密的岗位（纯北京技术岗 531 条）换平台和能力，之后再跳去意向城市或更好的团队。入职之前就要把退出计划写清楚：去哪个城市、投哪类团队、要补什么能力；优先做带得走的方向（评测、记忆、平台），不押注换城市就作废的业务。', risk:'中转是有代价的：下次谈判的时间窗口、北京的居住成本、社保和公积金断缴。最大的风险是「转着转着就不走了」。只有在拿到 offer 那天就把走人的条件写清楚，这条路才是跳板，不然就是陷阱。读研期间去北京做日常实习也是同样的道理，排最后。' }
  ],
  risks: {
    data: ['关键词样本不是公司招聘全集','百度与腾讯字段不可比：腾讯缺任职要求','城市可重复计数，记录数不等于 HC','updateDate 不能单独证明仍在招','关键词存在率不等于硬性要求率'],
    career: [
      '把北京算进中转之后，能投的范围从 304 条扩大到 1,247 条（技术岗 728）。但其中 943 条纯北京的记录只为「毕业先去 1—2 年」这一种用法服务，不能顺手当成毕业直接落脚的选择',
      '越想去的地方证据越少：杭州技术岗样本为 0，意向城市里记录最多的是上海（190 条）。补杭州数据和做北京中转是两件事，一起做，谁也替不了谁',
      '杭州到现在一条核实过的目标岗位都没有，只是「想去」而已。阿里、蚂蚁、网易的 Agent 岗，要在 2027 年底前自己把 JD 抓回来',
      '成都是唯一一个既有 S 级团队证据、离重庆成本又能接受的城市。但企业微信成都在不招学生还没核实，不能当成确定的退路',
      '中转的隐性成本容易被看低：1—2 年后重新谈判跳槽、北京的居住开销、社保不断缴。如果发现自己想留京 2 年以上，那就不符合本页的城市策略了，应该把这一页整个重做一遍再决定',
      '头部 AI 公司的远程实习没有查到可靠证据，不能拿它当「不去外地也有实习」的默认方案',
      'AI 应用岗照样考算法题和计算机基础。选哪个城市不会降低技术门槛；北京中转岗位抢的人反而更多',
      'GraphRAG 零命中只说明这个词不适合当简历标签，不代表相关技术本身没有价值',
      '以后每一年的招聘月份、城市和名额都要重新核实，团队经常在不同城市之间调整名额'
    ]
  },
  verifySummary: [
    '排顺序的规则：先把会影响「能不能毕业、能不能出去实习、有没有算力」的不确定项处理掉。',
    'critical 5 项：现行学位成果要求、外出实习办法全文、杭州目标团队 JD、成都学生 HC、2028 招聘窗口。',
    '每一项都写了具体的核验动作。做完就在页面上打钩销掉（记录只存在本机），每个月的例行检查也在这一页底部。'
  ],
  verification: [
    { id:'verify-degree', area:'学校', title:'现行学位成果要求', impact:'critical', status:'open', evidence:'needsVerification', action:'向学院学位分委会或研究生院学位办索取全文' },
    { id:'verify-intern-policy', area:'学校', title:'外出实习办法完整原文与适用条件', impact:'critical', status:'open', evidence:'needsVerification', action:'把「三个月以上」前后的完整限定语确认清楚，行程不要建立在推测上' },
    { id:'verify-compute', area:'科研', title:'课题组算力与 API 经费', impact:'high', status:'open', evidence:'needsVerification', action:'定题前确认 GPU 型号、可用时长、共享规则和预算' },
    { id:'verify-ospp', area:'实习', title:'OSPP 点亮计划当前规则', impact:'medium', status:'open', evidence:'needsVerification', action:'以当年官网确认是否全年、报名窗口和证明规则' },
    { id:'verify-cq-jobs', area:'岗位', title:'重庆候选岗位是否仍在招', impact:'high', status:'open', evidence:'needsVerification', action:'逐家进入官方招聘页或 App 核验，不依赖搜索摘要' },
    { id:'verify-hz-teams', area:'岗位', title:'杭州目标团队与 Agent 岗证据', impact:'critical', status:'open', evidence:'needsVerification', action:'这是毕业首选城市，但目前一条核实过的岗位都没有。抓取阿里、蚂蚁、网易、字节在杭州的 Agent、RAG、记忆方向 JD 原文，把证据做到和深圳一样扎实' },
    { id:'verify-cd-student-hc', area:'岗位', title:'成都是否开放学生岗位', impact:'critical', status:'open', evidence:'needsVerification', action:'企业微信成都被定为核心跳板，但现在的 JD 只证明团队方向对得上。要确认成都是否单独有实习和校招名额，而不是只挂在北京编制下' },
    { id:'verify-remote-intern', area:'实习', title:'目标团队是否接受远程实习', impact:'high', status:'open', evidence:'needsVerification', action:'因为对城市有要求，远程就成了关键变量。逐个团队去确认有没有远程或混合办公的实习先例，不能用社招的政策去推学生岗' },
    { id:'verify-2028-window', area:'招聘', title:'2029 届暑期实习和秋招窗口', impact:'critical', status:'open', evidence:'forecast', action:'2027 年 12 月起建立公司级日历，每周更新' },
    { id:'verify-tx-snapshot', area:'数据', title:'补存腾讯原始岗位快照', impact:'medium', status:'open', evidence:'needsVerification', action:'把原始响应保存下来，重算 625 / 419 和各技能出现率' },
    { id:'verify-ap-repo', area:'作品集', title:'AgentParliament 当前能力与指标', impact:'high', status:'open', evidence:'needsVerification', action:'先做一次仓库盘点，把每项能力分成已有、计划、实测过三类' },
    { id:'verify-remote-proof', area:'经历', title:'远程工作证明与可公开成果', impact:'high', status:'open', evidence:'needsVerification', action:'把合同、证明人、哪些内容可以公开、以及可引用的数字范围确认清楚' }
  ]
};
