// Every word on the page, in both languages. Swap this file for your own product; the
// section components in sections.tsx only lay it out.

import { REPO_URL } from "@/lib/app"
import { same, type Text } from "@/lib/i18n"

export const BRAND = "Frontier"

export const NAV: { href: string; label: Text }[] = [
  { href: "#templates", label: { en: "Templates", zh: "模板" } },
  { href: "#baseline", label: { en: "Shared base", zh: "共用基线" } },
  { href: "#quick-start", label: { en: "Quick start", zh: "快速开始" } },
  { href: "#compare", label: { en: "Compare", zh: "对比" } },
  { href: "#limits", label: { en: "Limits", zh: "边界" } },
]

export const UI = {
  github: same("GitHub"),
  viewGithub: { en: "View on GitHub", zh: "在 GitHub 查看" },
  browse: { en: "Browse templates", zh: "浏览模板" },
  theme: { en: "Switch color theme", zh: "切换配色" },
  lang: { en: "切换到中文", zh: "Switch to English" },
  langShort: { en: "中", zh: "EN" },
  copy: { en: "Copy", zh: "复制" },
  copied: { en: "Copied", zh: "已复制" },
  source: { en: "Source", zh: "源码" },
  entry: { en: "Start it", zh: "启动" },
}

export const HERO = {
  pill: {
    count: "4",
    text: { en: "templates on one shared baseline", zh: "个模板，同一套基线" },
  },
  title: ["Front", "ier"],
  tagline: {
    en: "Copy-ready frontend templates for review consoles, slide decks, product pages and progress reports.",
    zh: "拿来即用的前端模板：数据标注工作台、翻页演示、产品主页与项目汇报。",
  },
  lead: {
    en: "Each folder is a complete Vite + React app you can copy out and own. They share one toolchain, one way of doing themes, languages and single-file export, so moving between them feels familiar.",
    zh: "每个文件夹都是一个完整的 Vite + React 应用，复制出去就能独立使用。它们共用同一套工具链，以及同一套主题、语言与单文件导出方案，在模板之间切换不会有陌生感。",
  },
  facts: [
    { value: "MIT", label: { en: "License", zh: "许可" } },
    { value: "React 19", label: { en: "Vite 8 · TS 6", zh: "Vite 8 · TS 6" } },
    {
      value: { en: "Light & dark", zh: "浅色与深色" },
      label: { en: "Themes", zh: "主题" },
    },
  ] satisfies { value: string | Text; label: Text }[],
}

export type TemplateId = "annotation" | "slides" | "landing" | "report"

export const TERMINAL: Record<TemplateId, { cmd: string; out?: string }[]> = {
  annotation: [
    { cmd: "npx degit FanBB2333/Frontier/annotation review-console" },
    { cmd: "cd review-console && pnpm install", out: "Done in 4.2s" },
    {
      cmd: "pnpm dev",
      out: "➜  Local:   http://localhost:5173/   (mock API on)",
    },
  ],
  slides: [
    { cmd: "npx degit FanBB2333/Frontier/slides my-talk" },
    { cmd: "cd my-talk && pnpm install", out: "Done in 3.8s" },
    {
      cmd: "pnpm export:html",
      out: "Exported dist/frontier-slides.html (839 KB)",
    },
  ],
  landing: [
    { cmd: "npx degit FanBB2333/Frontier/landing my-site" },
    { cmd: "cd my-site && pnpm install", out: "Done in 3.1s" },
    { cmd: "pnpm build", out: "Prerendered dist/index.html" },
  ],
  report: [
    { cmd: "npx degit FanBB2333/Frontier/report weekly-report" },
    { cmd: "cd weekly-report && pnpm install", out: "Done in 3.4s" },
    {
      cmd: "pnpm build",
      out: "report written to out/atlas-demo-2026-10-28.html",
    },
  ],
}

export const TEMPLATES: {
  id: TemplateId
  name: Text
  body: Text
  stack: string[]
  entry: string
}[] = [
  {
    id: "annotation",
    name: { en: "Annotation console", zh: "数据标注平台" },
    body: {
      en: "Sign-in, a task list beside a sample editor with autosave and diffs, and an admin overview. Runs on an in-browser mock API until you point it at a server.",
      zh: "登录页、任务列表 + 带自动保存与差异对比的样本编辑器、管理概览。默认使用浏览器内的 mock API，接上后端即可替换。",
    },
    stack: ["React Router", "TanStack Query", "shadcn/ui", "sonner"],
    entry: "pnpm dev",
  },
  {
    id: "slides",
    name: { en: "Slide deck", zh: "翻页演示" },
    body: {
      en: "A 1920×1080 canvas scaled to any screen, in-page steps, an overview grid, four color themes, two languages and a line that morphs from page to page.",
      zh: "1920×1080 画布自适应缩放，支持页内分步、总览网格、四套配色、双语切换，以及在页面间流动变形的线条。",
    },
    stack: ["Motion", "Geist", "View Transitions"],
    entry: "pnpm export:html",
  },
  {
    id: "landing",
    name: { en: "Product page", zh: "产品主页" },
    body: {
      en: "This page: a hero, feature cards, a bento grid, copyable code, a comparison table and a footer, prerendered to static HTML at build time.",
      zh: "也就是本页：首屏、特性卡片、bento 网格、可复制代码、对比表格与页脚，构建时预渲染为静态 HTML。",
    },
    stack: ["Prerender", "Scroll reveal", "Serif display"],
    entry: "pnpm build",
  },
  {
    id: "report",
    name: { en: "Progress report", zh: "项目汇报" },
    body: {
      en: "A report written as one tree, from plain-language findings down to numbers and file paths. Tree and outline views, search, status filters and a walk mode for presenting.",
      zh: "把汇报写成一棵树，从通俗结论一路展开到数字和文件路径。提供树状图与大纲、搜索、状态筛选，以及逐个节点讲解的汇报模式。",
    },
    stack: ["Cloudflare Kumo", "Phosphor", "Single file"],
    entry: "pnpm build",
  },
]

export const BASELINE = {
  eyebrow: { en: "Shared base", zh: "共用基线" },
  title: { en: "One toolchain underneath.", zh: "底层是同一套工具链。" },
  dim: {
    en: "Learn it once, use it in every template.",
    zh: "学一次，每个模板都能用。",
  },
  cards: [
    {
      span: "s4",
      title: { en: "Design tokens and color themes", zh: "设计变量与配色主题" },
      body: {
        en: "Each theme is a block of CSS variables under :root[data-theme]. A tiny inline script applies the saved choice before first paint, so there is no flash.",
        zh: "每个主题是 :root[data-theme] 下的一组 CSS 变量；一段内联脚本在首次绘制前应用已保存的选择，不会闪烁。",
      },
      snippet:
        ':root[data-theme="dark"] {\n  --background: #1d1a18;\n  --primary: #9fb2c2;\n}',
      chips: ["src/lib/theme.ts", "useTheme()"],
    },
    {
      span: "s2",
      title: { en: "shadcn/ui on Base UI", zh: "shadcn/ui（Base UI 版）" },
      body: {
        en: "Components live in your repo; add more with the CLI.",
        zh: "组件代码就在仓库里，用 CLI 按需添加。",
      },
      chips: ["shadcn add dialog"],
    },
    {
      span: "s2",
      title: { en: "Two languages", zh: "中英双语" },
      body: {
        en: "Every string is a { en, zh } pair, read with useT().",
        zh: "每段文字都是 { en, zh }，用 useT() 读取。",
      },
      chips: ["src/lib/i18n.ts"],
    },
    {
      span: "s2",
      title: { en: "One-file export", zh: "单文件导出" },
      body: {
        en: "Inline scripts, styles, fonts and images into one HTML file.",
        zh: "把脚本、样式、字体和图片内联成一个 HTML 文件。",
      },
      chips: ["pnpm export:html"],
    },
    {
      span: "s2",
      title: { en: "Strict by default", zh: "默认严格" },
      body: {
        en: "Strict TypeScript, ESLint flat config and Prettier with class sorting.",
        zh: "严格模式 TypeScript、ESLint flat config、带类名排序的 Prettier。",
      },
      chips: ["pnpm lint", "pnpm format"],
    },
    {
      span: "s2",
      title: { en: "Sample data, never real data", zh: "只有样例数据" },
      body: {
        en: "Demos run on made-up content, so a public preview leaks nothing.",
        zh: "演示全部使用虚构内容，公开展示不会泄露真实数据。",
      },
      chips: ["src/lib/mock.ts"],
    },
  ] satisfies {
    span: "s2" | "s4"
    title: Text
    body: Text
    snippet?: string
    chips: string[]
  }[],
}

export const QUICK_START = {
  eyebrow: { en: "Quick start", zh: "快速开始" },
  title: { en: "Copy a folder,", zh: "复制一个文件夹，" },
  dim: { en: "then it is yours.", zh: "它就归你了。" },
  steps: [
    {
      title: { en: "Copy a template", zh: "复制模板" },
      body: {
        en: "degit fetches one folder without the git history. Plain cp works too.",
        zh: "degit 只拉取一个文件夹、不带 git 历史；直接 cp 也可以。",
      },
      code: "npx degit FanBB2333/Frontier/landing my-site",
    },
    {
      title: { en: "Install and run", zh: "安装并启动" },
      body: {
        en: "Node 22+ and pnpm. The dev server reloads as you edit.",
        zh: "需要 Node 22+ 与 pnpm，开发服务器支持热更新。",
      },
      code: "cd my-site\npnpm install\npnpm dev",
    },
    {
      title: { en: "Rename and build", zh: "改名并构建" },
      body: {
        en: "Set APP_ID in src/lib/app.ts (and the storage key in index.html), replace the content files, then build.",
        zh: "修改 src/lib/app.ts 中的 APP_ID（以及 index.html 里的存储键），替换内容文件后构建。",
      },
      code: "pnpm build        # dist/\npnpm export:html  # one-file copy",
    },
  ] satisfies { title: Text; body: Text; code: string }[],
}

export const COMPARE = {
  eyebrow: { en: "Compare", zh: "对比" },
  title: { en: "Which template?", zh: "选哪个模板？" },
  dim: { en: "Pick by what the page has to do.", zh: "按页面要做的事来选。" },
  facts: [
    {
      value: "4",
      label: { en: "templates, each a standalone app", zh: "个模板，各自独立" },
    },
    {
      value: "3",
      label: { en: "export to one HTML file", zh: "个可导出为单个 HTML 文件" },
    },
    { value: "2", label: { en: "UI languages", zh: "种界面语言" } },
    {
      value: "0",
      label: { en: "servers needed for the demos", zh: "台服务器即可跑演示" },
    },
  ] satisfies { value: string; label: Text }[],
  head: [
    { en: "Template", zh: "模板" },
    { en: "Best for", zh: "适合" },
    { en: "Navigation", zh: "导航" },
    { en: "Data", zh: "数据" },
    { en: "Output", zh: "产物" },
  ] satisfies Text[],
  rows: [
    [
      { en: "Annotation", zh: "标注平台" },
      {
        en: "Review and labeling tools, admin consoles",
        zh: "审核与标注工具、后台管理",
      },
      { en: "React Router (path or hash)", zh: "React Router（路径或 hash）" },
      { en: "TanStack Query + mock API", zh: "TanStack Query + mock API" },
      { en: "SPA", zh: "单页应用" },
    ],
    [
      { en: "Slides", zh: "翻页演示" },
      { en: "Talks, paper sharing, demos", zh: "分享、讲座、演示" },
      { en: "URL hash per page", zh: "每页一个 URL hash" },
      { en: "Content in TypeScript", zh: "TypeScript 内容文件" },
      { en: "SPA + one HTML file", zh: "单页应用 + 单个 HTML" },
    ],
    [
      { en: "Landing", zh: "产品主页" },
      { en: "Product and project home pages", zh: "产品与项目主页" },
      { en: "Anchored sections", zh: "页内锚点" },
      { en: "Content in TypeScript", zh: "TypeScript 内容文件" },
      { en: "Prerendered HTML + one file", zh: "预渲染 HTML + 单文件" },
    ],
    [
      { en: "Report", zh: "项目汇报" },
      { en: "Progress reports, project reviews", zh: "进度汇报、项目复盘" },
      { en: "Tree, outline and walk mode", zh: "树状图、大纲与汇报模式" },
      { en: "One tree per report file", zh: "每个报告一个树形数据文件" },
      { en: "One HTML file per report", zh: "每个报告一个 HTML 文件" },
    ],
  ] satisfies Text[][],
}

export const LIMITS = {
  eyebrow: { en: "Limits", zh: "边界" },
  title: { en: "What Frontier is", zh: "Frontier 是什么，" },
  dim: { en: "and what it isn't.", zh: "不是什么。" },
  lead: {
    en: "Templates are starting points, not a framework you upgrade. Once copied, a template is plain code in your repository.",
    zh: "模板是起点，而不是需要升级的框架。复制之后，它就是你仓库里的普通代码。",
  },
  items: [
    {
      en: "Shared files are copied, not imported; improve one and copy it to the others yourself.",
      zh: "共用文件是复制而非引用；改进其中一份后，需要自己同步到其他模板。",
    },
    {
      en: "The annotation backend is a mock. Wire api() to your server; the contract is in src/lib/api.ts.",
      zh: "标注平台的后端是 mock，需要把 api() 接到你的服务；接口约定见 src/lib/api.ts。",
    },
    {
      en: "The landing page prerenders English; Chinese renders in the browser after load.",
      zh: "产品主页预渲染的是英文版，中文在浏览器加载后渲染。",
    },
    {
      en: "Slides are laid out for 16:9 screens and letterbox on other shapes.",
      zh: "演示按 16:9 屏幕排版，其他比例会留边。",
    },
    {
      en: "The report template keeps Cloudflare Kumo components instead of shadcn/ui.",
      zh: "项目汇报模板使用 Cloudflare Kumo 组件，而不是 shadcn/ui。",
    },
  ] satisfies Text[],
}

export const CTA = {
  eyebrow: { en: "Get started", zh: "开始使用" },
  title: { en: "Start from a template", zh: "从一个模板开始，" },
  dim: { en: "and ship this week.", zh: "这周就上线。" },
  command: "npx degit FanBB2333/Frontier/landing my-site",
  sub: {
    en: "Every template also runs live in the gallery on GitHub Pages.",
    zh: "每个模板也都能在 GitHub Pages 的展示页中直接试用。",
  },
}

export const FOOTER = {
  blurb: {
    en: "Frontend templates for consoles, decks and product pages. Issues and pull requests are welcome.",
    zh: "面向后台、演示与产品主页的前端模板。欢迎提交 issue 与 PR。",
  },
  columns: [
    {
      title: { en: "Templates", zh: "模板" },
      links: [
        {
          label: { en: "Annotation", zh: "标注平台" },
          href: `${REPO_URL}/tree/main/annotation`,
        },
        {
          label: { en: "Slides", zh: "翻页演示" },
          href: `${REPO_URL}/tree/main/slides`,
        },
        {
          label: { en: "Landing", zh: "产品主页" },
          href: `${REPO_URL}/tree/main/landing`,
        },
        {
          label: { en: "Report", zh: "项目汇报" },
          href: `${REPO_URL}/tree/main/report`,
        },
      ],
    },
    {
      title: { en: "Built with", zh: "技术栈" },
      links: [
        { label: same("React"), href: "https://react.dev" },
        { label: same("Vite"), href: "https://vite.dev" },
        { label: same("Tailwind CSS"), href: "https://tailwindcss.com" },
        { label: same("shadcn/ui"), href: "https://ui.shadcn.com" },
      ],
    },
    {
      title: { en: "Project", zh: "项目" },
      links: [
        { label: same("GitHub"), href: REPO_URL },
        { label: same("Issues"), href: `${REPO_URL}/issues` },
        {
          label: { en: "License", zh: "许可证" },
          href: `${REPO_URL}/blob/main/LICENSE`,
        },
      ],
    },
  ] satisfies { title: Text; links: { label: Text; href: string }[] }[],
  bottom: {
    en: "Distributed under the MIT License.",
    zh: "以 MIT 许可证发布。",
  },
}
