// The templates the gallery frames. `path` is relative to the gallery page; scripts/build-pages.sh
// puts each template's build in the folder of the same name next to it.

import type { Text } from "@/lib/i18n"

export type TemplateEntry = {
  id: string
  name: Text
  summary: Text
  stack: string[]
  path: string
  /** Hint shown above the frame, e.g. how to drive the demo. */
  tip: Text
}

export const TEMPLATES: TemplateEntry[] = [
  {
    id: "annotation",
    name: { en: "Annotation console", zh: "数据标注平台" },
    summary: {
      en: "Task list, sample editor with autosave and diffs, admin overview.",
      zh: "任务列表、带自动保存与差异对比的编辑器、管理概览。",
    },
    stack: ["React Router", "TanStack Query", "shadcn/ui"],
    // Signs the mock "admin" account in, so the demo opens on a populated workspace.
    path: "annotation/?as=admin#/tasks",
    tip: {
      en: "Signed in as admin on the in-browser mock API. Edits stay in this browser; reset them from the user menu.",
      zh: "已用 admin 登录浏览器内的 mock API，修改只保存在本浏览器，可在右上角用户菜单中重置。",
    },
  },
  {
    id: "slides",
    name: { en: "Slide deck", zh: "翻页演示" },
    summary: {
      en: "1920×1080 canvas, in-page steps, overview, four themes, two languages.",
      zh: "1920×1080 画布、页内分步、总览、四套配色、双语。",
    },
    stack: ["Motion", "Geist", "View Transitions"],
    path: "slides/",
    tip: {
      en: "Click the deck, then use ← → to turn pages, O for the overview and T for themes.",
      zh: "先点击画面，再用 ← → 翻页、O 打开总览、T 切换配色。",
    },
  },
  {
    id: "landing",
    name: { en: "Product page", zh: "产品主页" },
    summary: {
      en: "Hero, feature cards, bento grid, copyable code, comparison table.",
      zh: "首屏、特性卡片、bento 网格、可复制代码、对比表格。",
    },
    stack: ["Prerender", "Scroll reveal", "Serif display"],
    path: "landing/",
    tip: {
      en: "Prerendered at build time; switch the language and theme from its top bar.",
      zh: "构建时预渲染；语言和配色可在页面顶栏切换。",
    },
  },
  {
    id: "report",
    name: { en: "Progress report", zh: "项目汇报" },
    summary: {
      en: "One tree from findings to evidence: tree and outline views, search, walk mode.",
      zh: "一棵从结论到证据的树：树状图与大纲、搜索、汇报模式。",
    },
    stack: ["Cloudflare Kumo", "Phosphor", "Single file"],
    path: "report/",
    tip: {
      en: "A made-up project. Click a card for details, press P to present node by node, D for dark mode.",
      zh: "虚构的示例项目。点击卡片查看详情，按 P 进入汇报模式逐个讲解，按 D 切换深色。",
    },
  },
]
