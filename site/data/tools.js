/* 板块 3：科研工具链（2026-08-28 缩编为速查卡）
   方法论分工：文献漏斗与切片走 grad-companion 插件的 skill（grad-radar 等）；
   精读方法由站点内每篇论文的阅读卡承接（细读标注 + 盘问问题，见 PAPER-DEEP-READ-DESIGN.md）。
   旧 RESEARCH-PLAYBOOK.md 路径已于 2026-08-31 核实失效，全部引用已清除。 */
window.TOOLS = {
  disclaimer:'这一页只是速查卡，不是教程。每天怎么筛文献、实验怎么记、投稿前怎么核对，主力工具是 <b>grad-companion 插件</b>里的那几个 skill（见下面）。每篇具体论文读哪几节、怎么读，写在每篇论文自己的阅读卡里。',

  /* 按任务归组（2026-09-06 展示改版，实施路线 §5.7）：当前任务该用哪个工具一目了然 */
  groups: [
    { k: '查文献', tools: ['grad-companion 插件', 'Google Scholar', 'arXiv（cs.CL / cs.AI / cs.LG）', 'Semantic Scholar / OpenAlex', 'DBLP'] },
    { k: '读论文', tools: ['Zotero + Better BibTeX', 'Obsidian', 'Papers with Code'] },
    { k: '记实验', tools: ['grad-companion 插件'] },
    { k: '准备投稿', tools: ['Crossref', 'LetPub / 中科院分区表', 'CNKI / 万方'] }
  ],

  core: [
    { n:'grad-companion 插件', use:'主力工作流：每天筛文献、按章节切片（grad-radar）；记选题的取舍（idea-ledger）；记实验过程（run-provenance）；投稿前逐项核对（submission-gate）', ref:'ZCode 内运行 /plugin 安装 grad-companion（无网页入口）' },
    { n:'Google Scholar', use:'给 5—10 篇种子论文开引用提醒，新增引用说明这个方向有人跟上了。盯竞争团队，没有比这更省力的办法', ref:'scholar.google.com', url:'https://scholar.google.com' },
    { n:'arXiv（cs.CL / cs.AI / cs.LG）', use:'2025 年以后的新工作基本都先出现在这里。配合 grad-radar 每天过滤一遍', ref:'arxiv.org', url:'https://arxiv.org/list/cs.CL/recent' },
    { n:'Semantic Scholar / OpenAlex', use:'看引用网络、查作者情况，可以写脚本批量拉数据', ref:'semanticscholar.org · openalex.org', url:'https://www.semanticscholar.org' },
    { n:'DBLP', use:'核对论文的会议和作者的产出记录。它不收会议论文之外的内容，评价一个作者不能只看它', ref:'dblp.org', url:'https://dblp.org' },
    { n:'Crossref', use:'引用前核对 DOI、作者、刊名、年份。元数据有冲突时，以出版社自己的页面为准', ref:'crossref.org', url:'https://search.crossref.org' },
    { n:'Zotero + Better BibTeX', use:'文献库只用这一个，选定了三年就不要换', ref:'zotero.org', url:'https://www.zotero.org' },
    { n:'Obsidian', use:'文献笔记互相链接。每篇精读笔记固定回答四个问题：它解决什么问题、用了什么方法、实验怎么设置的、跟我的方向是什么关系', ref:'obsidian.md', url:'https://obsidian.md' },
    { n:'Papers with Code', use:'按 benchmark 找有代码的实现，别轻易决定复现一篇没放代码的论文', ref:'paperswithcode.com', url:'https://paperswithcode.com' },
    { n:'CNKI / 万方', use:'查导师带过的学位论文，看师兄师姐做了什么、毕业去了哪。入学后用校园网', ref:'cnki.net', url:'https://www.cnki.net' },
    { n:'LetPub / 中科院分区表', use:'投稿前查期刊分区和审稿周期。分区每年会调整，以当年的表为准', ref:'letpub.com.cn', url:'https://www.letpub.com.cn' }
  ],

  companion: {
    name:'grad-companion · 各管哪一段',
    playbook:'ZCode 插件 grad-companion · skills/grad-radar（按章节切片和自测问题的原始模板）',
    note:'这一站不再维护长篇的方法论笔记，各段工作有各自的工具：找文献、按章节读，用 grad-radar；具体到某篇论文怎么读（读哪几节、思考哪些问题），看它的阅读卡；实验记录和投稿前检查，用 run-provenance 和 submission-gate。以前的 RESEARCH-PLAYBOOK.md 归档路径已失效，不用去找。'
  },

  monthly:{
    t:'每月固定要做的事（建议在日历里设成重复事项）',
    items:[
      '过一遍种子论文的引用提醒。谁引用了它，说明谁在跟这个方向',
      '按关键词扫一遍 arXiv，重点看几个高威胁对象有没有新工作：任务完成验证线（2606.09863 的后继）、Strategic Verification 的发表动向、证据溯源线、SWE-bench 批判线；HKUDS 降为暂缓方向观察',
      '更新本站「待核验清单」：确认掉的划掉，过期的重新核',
      '给 Atlas 和 AgentParliament 各提一次有内容的 commit，仓库别断更（招聘的人会看）',
      '进入 2027.12 以后加一项：去牛客搜「Agent 开发 面经」，看最新的真实考题'
    ]
  }
};
