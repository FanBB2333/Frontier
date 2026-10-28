// Sample report with made-up content: a fictional course project, used by the template's
// demo. Copy this file to src/reports/<topic>-<YYYY-MM-DD>.ts and replace the tree.

import type { Report } from "@/report/types"

const report: Report = {
  id: "atlas-demo-2026-10-28",
  title: "Atlas 项目进度汇报",
  subtitle: "示例数据 · 一个虚构的课程项目：基于课程手册的检索增强问答助手",
  date: "2026-10-28",
  levels: ["通俗概念", "要点", "细节", "证据"],
  root: {
    id: "root",
    title: "Atlas 项目",
    summary:
      "检索部分已定型，生成部分在调提示词；主表跑完一轮，两个问题待你决定",
    status: "doing",
    body: [
      "Atlas 让学生用自然语言询问课程安排、作业要求和评分规则，回答时附上手册中的出处。",
      "这份汇报自顶向下组织：第一层是通俗的问题和结论，往下依次是要点、细节和证据（数字、文件路径、提交记录）。",
    ],
    metrics: [
      { label: "手册段落", value: "1,240 段", note: "切分后入库" },
      { label: "评测问题", value: "300 条", note: "人工标注答案与出处" },
      { label: "当前准确率", value: "71.3%", note: "带出处的完全正确" },
      { label: "距离截止", value: "12 天", note: "11 月 9 日答辩" },
    ],
    children: [
      {
        id: "goal",
        title: "我们要解决什么问题",
        summary: "课程手册很长，学生常问的问题其实都有答案，只是找不到",
        status: "done",
        body: [
          "课程手册约 80 页，答疑区一学期有 400 多个帖子，其中大约六成能在手册里直接找到答案。我们希望助手先回答这一类问题，并且一定给出处，方便核对。",
        ],
        children: [
          {
            id: "goal-users",
            title: "谁会用、在哪里用",
            summary: "选课学生在课程网站侧栏提问，助教用它起草答疑回复",
            status: "info",
            points: [
              "学生：作业截止时间、迟交规则、评分构成这类事实性问题",
              "助教：先让助手起草回复，再人工确认后发到答疑区",
            ],
          },
          {
            id: "goal-success",
            title: "怎样算做成了",
            summary: "带出处的正确率达到 80%，且答不了时要明确说不知道",
            status: "done",
            metrics: [
              { label: "目标准确率", value: "≥ 80%" },
              {
                label: "拒答准确率",
                value: "≥ 90%",
                note: "手册里没有答案的问题",
              },
              { label: "单次响应", value: "< 3 s", note: "笔记本 CPU" },
            ],
            sources: ["docs/proposal.md#success-criteria"],
          },
        ],
      },
      {
        id: "approach",
        title: "我们怎么做",
        summary: "先从手册里找出相关段落，再让模型只根据这些段落回答",
        status: "doing",
        body: [
          "流程分两步：检索把问题和手册段落都变成向量，取最相近的几段；生成把这几段和问题一起交给语言模型，要求它只用给出的内容作答并标注段落编号。",
        ],
        children: [
          {
            id: "retrieval",
            title: "检索：找出相关段落",
            summary: "按小节切分、每段约 300 字，召回前 5 段的覆盖率 93%",
            status: "done",
            children: [
              {
                id: "chunking",
                title: "切分方式",
                summary: "按小节标题切分，再把长小节拆成约 300 字的段",
                status: "done",
                body: [
                  "固定长度切分会把表格和列表拦腰截断，按小节切分则保留了「迟交规则」这类完整条目。300 字是在召回率和噪声之间折中的结果。",
                ],
                table: {
                  caption: "不同切分方式的召回率（前 5 段命中正确出处）",
                  columns: ["切分方式", "段落数", "Recall@5"],
                  rows: [
                    ["固定 200 字", "1,812", "84.0%"],
                    ["固定 500 字", "742", "88.3%"],
                    ["按小节 + 300 字上限", "1,240", "93.0%"],
                  ],
                  highlight: [2],
                },
                sources: ["notebooks/chunking.ipynb", "atlas/ingest/split.py"],
              },
              {
                id: "embedding",
                title: "向量模型",
                summary: "选用中文小模型，速度是大模型的 4 倍，召回只低 1 个点",
                status: "done",
                table: {
                  columns: ["模型", "维度", "Recall@5", "编码 1k 段耗时"],
                  rows: [
                    ["多语言大模型", "1024", "94.1%", "41 s"],
                    ["中文小模型", "512", "93.0%", "10 s"],
                  ],
                  highlight: [1],
                },
                sources: ["eval/embedding_bench.py", "commit 3f9c2a1"],
              },
            ],
          },
          {
            id: "generation",
            title: "生成：根据段落作答",
            summary: "提示词第三版减少了编造，但多段拼接的问题仍常出错",
            status: "doing",
            children: [
              {
                id: "prompt",
                title: "提示词模板",
                summary:
                  "要求逐句标注出处编号，找不到依据就回答「手册中没有提到」",
                status: "doing",
                points: [
                  "v1：只说「根据以下内容回答」，编造率 14%",
                  "v2：加入拒答指令，编造率降到 6%，但拒答过多",
                  "v3：要求逐句引用 `[段落编号]`，编造率 4%，拒答恢复正常",
                ],
                sources: ["atlas/prompts/answer_v3.txt"],
              },
              {
                id: "citation",
                title: "出处标注",
                summary: "引用编号能对应到手册页码，前端可以点开原文",
                status: "done",
                sources: ["atlas/render/citations.py", "commit 8b41e07"],
              },
            ],
          },
        ],
      },
      {
        id: "results",
        title: "目前的结果",
        summary: "带出处正确率 71.3%，比只用模型高 30 个点，离目标还差 9 个点",
        status: "doing",
        children: [
          {
            id: "main-table",
            title: "主表",
            summary: "300 条评测问题上的三组对比",
            status: "done",
            table: {
              caption: "300 条评测问题，带出处的完全正确率",
              columns: ["方法", "准确率", "拒答准确率", "平均耗时"],
              rows: [
                ["只用语言模型", "41.0%", "22.0%", "1.1 s"],
                ["关键词检索 + 生成", "63.7%", "81.5%", "1.6 s"],
                ["Atlas（向量检索 + v3 提示词）", "71.3%", "88.9%", "2.4 s"],
              ],
              highlight: [2],
            },
            sources: ["eval/results/2026-10-27.csv", "eval/run_eval.py"],
          },
          {
            id: "errors",
            title: "错在哪里",
            summary: "86 条错误里，一半是需要拼接两处信息的问题",
            status: "risk",
            metrics: [
              { label: "多处信息拼接", value: "43 条" },
              { label: "检索没找到", value: "21 条" },
              { label: "找到了但答错", value: "15 条" },
              { label: "标注本身有误", value: "7 条" },
            ],
            children: [
              {
                id: "errors-multihop",
                title: "多处信息拼接",
                summary: "例如「迟交两天的期中作业最多能得几分」需要同时读两节",
                status: "risk",
                body: [
                  "迟交扣分规则和期中作业满分写在不同小节，前 5 段往往只召回其中一段。增加召回段数能缓解，但会让回答变慢、噪声变多。",
                ],
                sources: ["eval/errors/multihop.md"],
              },
              {
                id: "errors-labels",
                title: "标注有误的 7 条",
                summary: "已和助教确认改正，下次评测生效",
                status: "done",
                sources: ["data/qa_v2.jsonl", "commit c07d5e2"],
              },
            ],
          },
        ],
      },
      {
        id: "decisions",
        title: "需要你决定的事",
        summary: "是否加重排序模型，以及答辩时现场演示还是录屏",
        status: "decision",
        children: [
          {
            id: "decision-rerank",
            title: "要不要加重排序模型",
            summary: "预计准确率 +5～7 个点，但单次响应会超过 3 秒的目标",
            status: "decision",
            points: [
              "加：多处拼接类问题预计能修好一半，最接近 80% 的目标",
              "不加：保持在 3 秒内，把精力放在改提示词和补标注上",
              "折中：只在检索分数不确定时启用重排序",
            ],
            metrics: [
              { label: "预计准确率", value: "76～78%" },
              { label: "预计耗时", value: "3.6 s" },
            ],
          },
          {
            id: "decision-demo",
            title: "答辩演示形式",
            summary: "现场演示更有说服力，但依赖网络和笔记本性能",
            status: "decision",
            points: [
              "现场：准备 5 个问题，其中 1 个故意问手册里没有的",
              "录屏：稳定，但少了现场提问的环节",
            ],
          },
        ],
      },
      {
        id: "plan",
        title: "接下来两周",
        summary: "第一周补齐检索与标注，第二周写报告、准备答辩",
        status: "info",
        children: [
          {
            id: "plan-week1",
            title: "第 1 周（10/29–11/4）",
            summary: "根据决定接入重排序或调整召回段数，重跑主表",
            status: "doing",
            points: [
              "补 50 条多处拼接类评测问题",
              "重跑主表与消融",
              "冻结代码，打 tag `v0.9`",
            ],
          },
          {
            id: "plan-week2",
            title: "第 2 周（11/5–11/9）",
            summary: "写报告、做幻灯片、彩排两次",
            status: "info",
            sources: ["report/outline.md"],
          },
          {
            id: "plan-risk",
            title: "风险：GPU 配额",
            summary: "共享 GPU 本周排队较长，重排序实验可能要排到周末",
            status: "risk",
            body: [
              "备选方案是在 CPU 上只跑 100 条子集，先确认趋势，再排队跑全量。",
            ],
          },
        ],
      },
    ],
  },
}

export default report
