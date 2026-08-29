/* 板块 3：科研工具链（2026-08-28 缩编为速查卡）
   完整方法论（三遍读法、实验纪律、写作投稿、AI 伦理、检查表等）已整体移交
   grad-companion 插件：D:\Program Project\grad-companion\docs\RESEARCH-PLAYBOOK.md。
   本页只保留「日常真正会打开」的最小集合。 */
window.TOOLS = {
  disclaimer:'本页是速查卡，不是教程。文献检索、论文精读、实验台账、投稿门禁的主力工作流走 <b>grad-companion 插件</b>；被缩编的完整方法论已归档为该插件的优化策略文档（见下），需要时直接看那份文档。',

  core: [
    { n:'grad-companion 插件', use:'主力工作流：每日文献漏斗（grad-radar）、检索设计（literature-search）、精读（paper-reader）、选题台账（idea-ledger）、实验台账（run-provenance）、投稿门禁（submission-gate）', ref:'ZCode 插件市场 · 本地开发 D:\\Program Project\\grad-companion' },
    { n:'Google Scholar', use:'引用追踪 + Alert：为 5—10 篇种子论文设引用提醒，是监控竞争团队最省力的办法', ref:'scholar.google.com' },
    { n:'arXiv（cs.CL / cs.AI / cs.LG）', use:'2025 年后的新工作基本只在这里；配合 grad-radar 的每日漏斗过滤', ref:'arxiv.org' },
    { n:'Semantic Scholar / OpenAlex', use:'引用网络、作者画像，可脚本化批量分析', ref:'semanticscholar.org · openalex.org' },
    { n:'DBLP', use:'核对 venue 与作者产出（注意覆盖不完整，不能只看它评价一个作者）', ref:'dblp.org' },
    { n:'Crossref', use:'引用前核对 DOI/作者/刊名/年份，元数据冲突以出版社页面为准', ref:'crossref.org' },
    { n:'Zotero + Better BibTeX', use:'文献库唯一事实源；选一个坚持三年不换', ref:'zotero.org' },
    { n:'Obsidian', use:'文献笔记双链，精读四问模板（问题/方法/实验设定/与我的关系）', ref:'obsidian.md' },
    { n:'Papers with Code', use:'按 benchmark 找有代码的实现，避免复现无代码论文', ref:'paperswithcode.com' },
    { n:'CNKI / 万方', use:'查导师指导过的学位论文（师兄师姐做了什么、去向）；入学后校园网可用', ref:'cnki.net' },
    { n:'LetPub / 中科院分区表', use:'投稿前查分区与审稿周期（每年会变，以当年为准）', ref:'letpub.com.cn' }
  ],

  companion: {
    name:'grad-companion · 方法论归档',
    playbook:'D:\\Program Project\\grad-companion\\docs\\RESEARCH-PLAYBOOK.md',
    note:'2026-08-28 起本站不再维护长篇方法论。文献发现三层分工、三遍读法与精读四问、实验可复现 12 条检查表、Elsevier 写作骨架、投稿流程与伦理红线、月度巡检清单，全部在该文档中，并已按 skill 职责标注归属（grad-radar / paper-reader / run-provenance / submission-gate / weekly-brief）。插件迭代时以该文档为优化策略输入。'
  },

  monthly:{
    t:'每月固定动作（建议设成日历重复事项）',
    items:[
      '种子论文 Alert 扫一遍：新增引用 = 竞争信号',
      'arXiv 扫核心关键词，重点看高风险竞争团队（FAGEN 线、SWE-bench 批判线、HKUDS）的新工作',
      '更新本站「待核验清单」的状态，销掉已确认的条目',
      '给 Atlas / AgentParliament 各提交一次有意义的 commit（保持仓库活跃度，求职时可见）',
      '求职临近（2027.12 起）追加：牛客搜「Agent 开发 面经」看最新真题'
    ]
  }
};
