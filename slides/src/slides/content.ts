// Every string the demo deck shows, in both languages. Replace this file (and pages.tsx)
// with your own talk; the engine in src/deck/ reads only what src/slides/index.tsx exports.

import canvasDiagram from "@/assets/canvas-diagram.svg"
import { same, type Text } from "@/lib/i18n"
import type { Section } from "@/deck/types"

export const DECK_TITLE = "Frontier Slides"

export type SectionId = "build" | "steps" | "present" | "refs"

export const SECTIONS: Record<SectionId, Section> = {
  build: { marker: "1.", title: { en: "Build a page", zh: "写一页" } },
  steps: { marker: "2.", title: { en: "Steps & motion", zh: "分步与动效" } },
  present: { marker: "3.", title: { en: "Present & share", zh: "演示与分享" } },
  refs: { marker: null, title: { en: "References", zh: "参考" } },
}

type Point = { lead: Text; rest: Text }

export const TITLE = {
  eyebrow: same("Frontier · Slides"),
  lines: [
    same("A deck engine"),
    { en: "on a 1920×1080 canvas", zh: "画在 1920×1080 画布上" },
  ],
  sub: {
    en: "React · Motion · Tailwind — press → to begin, ? for shortcuts",
    zh: "React · Motion · Tailwind —— 按 → 开始，按 ? 查看快捷键",
  },
}

export const ANATOMY = {
  heading: {
    en: "Every page is a React component",
    zh: "每一页都是一个 React 组件",
  },
  points: [
    {
      lead: {
        en: "Absolute positions on a fixed canvas",
        zh: "在固定画布上用绝对坐标排版",
      },
      rest: {
        en: ": the canvas scales to the window, so a page looks the same on any screen",
        zh: "：画布按窗口等比缩放，在任何屏幕上看起来都一样",
      },
    },
    {
      lead: { en: "Reveal and RevealImage", zh: "Reveal 与 RevealImage" },
      rest: {
        en: " stagger elements in by their order `i`",
        zh: " 按顺序号 `i` 依次入场",
      },
    },
    {
      lead: { en: "The thread", zh: "贯穿全片的线条" },
      rest: {
        en: " morphs into each page's outline — here, a frame around the image",
        zh: " 会变形成每页的轮廓——这一页是图片外框",
      },
    },
  ] satisfies Point[],
  image: { src: canvasDiagram, width: 1600, height: 1000 },
  alt: {
    en: "A 16:9 canvas scaled into a browser window",
    zh: "16:9 画布等比缩放进浏览器窗口",
  },
}

export const REGISTRY = {
  heading: { en: "Register it in one list", zh: "在一个列表里登记" },
  points: [
    {
      lead: { en: "section", zh: "section" },
      rest: {
        en: " groups pages under one header and one big numeral",
        zh: " 把多页归到同一个页眉和背景大数字下",
      },
    },
    {
      lead: { en: "stages", zh: "stages" },
      rest: {
        en: " adds in-page steps; → walks them before turning the page",
        zh: " 设定页内步骤数，→ 先走完步骤再翻页",
      },
    },
    {
      lead: { en: "thread", zh: "thread" },
      rest: {
        en: " returns the outline for each stage",
        zh: " 返回每一步线条要变成的轮廓",
      },
    },
  ] satisfies Point[],
  code: [
    "// src/slides/index.tsx",
    "export const DECK: DeckDef = {",
    '  title: "Frontier Slides",',
    "  sections: SECTIONS,",
    "  slides: [",
    "    {",
    '      id: "anatomy",',
    '      section: "build",',
    "      stages: 1,",
    "      Component: AnatomySlide,",
    "      thread: () => frame(ANATOMY_IMAGE),",
    "    },",
    "    // …",
    "  ],",
    "}",
  ],
}

export const STEPS = {
  heading: { en: "Reveal a page in steps", zh: "把一页拆成几步讲" },
  lead: {
    en: "This page has three stages. Each → adds a box and stretches the thread under it.",
    zh: "这一页有三步。每按一次 → 多出一个方框，线条也跟着延伸。",
  },
  boxes: [
    { en: "Set `stages: 3` in the registry", zh: "在登记表里写 `stages: 3`" },
    { en: "Read `stage` in the component", zh: "组件里读取 `stage`" },
    { en: "Return one thread per stage", zh: "每一步返回一条线" },
  ] satisfies Text[],
}

export const MOTION_RULES = {
  claim: {
    en: "Motion should explain, not decorate.",
    zh: "动效用来解释，而不是装饰。",
  },
  phrase: { en: "explain", zh: "解释" },
  do: {
    title: { en: "Do", zh: "建议" },
    items: [
      {
        en: "Animate opacity, transform and clip-path",
        zh: "只对 opacity、transform、clip-path 做动画",
      },
      {
        en: "Let content land after the thread starts moving",
        zh: "让内容在线条开始变形之后再落位",
      },
      { en: "Keep exits shorter than entrances", zh: "退场比入场更短" },
    ] satisfies Text[],
  },
  avoid: {
    title: { en: "Avoid", zh: "避免" },
    items: [
      { en: "Animating width, height or top", zh: "对宽高、top 做动画" },
      { en: "Moving every element on every page", zh: "每页每个元素都在动" },
      {
        en: "Ignoring reduced-motion settings",
        zh: "忽略「减少动态效果」设置",
      },
    ] satisfies Text[],
  },
  ring: {
    en: "Respects prefers-reduced-motion",
    zh: "遵循系统「减少动态效果」",
  },
}

export const CHART = {
  heading: { en: "Charts are pages too", zh: "图表也是普通的一页" },
  caption: {
    en: "Example data · talk length by section, minutes",
    zh: "示例数据 · 各部分讲解时长（分钟）",
  },
  bars: [
    { label: { en: "Intro", zh: "开场" }, value: 3 },
    { label: { en: "Build", zh: "写一页" }, value: 8 },
    { label: { en: "Steps", zh: "分步" }, value: 6 },
    { label: { en: "Motion", zh: "动效" }, value: 5 },
    { label: { en: "Present", zh: "演示" }, value: 4 },
    { label: { en: "Q&A", zh: "问答" }, value: 9 },
  ] satisfies { label: Text; value: number }[],
}

export const SHORTCUTS = {
  heading: { en: "Present from the keyboard", zh: "全程用键盘演示" },
  rows: [
    {
      keys: ["→", "Space"],
      label: { en: "Next step or page", zh: "下一步 / 下一页" },
    },
    {
      keys: ["←"],
      label: { en: "Previous step or page", zh: "上一步 / 上一页" },
    },
    { keys: ["O"], label: { en: "Overview of all pages", zh: "全部页面总览" } },
    { keys: ["T"], label: { en: "Next color theme", zh: "切换配色主题" } },
    { keys: ["L"], label: { en: "Switch language", zh: "切换语言" } },
    { keys: ["F"], label: { en: "Fullscreen", zh: "全屏" } },
  ] satisfies { keys: string[]; label: Text }[],
}

export const EXPORT = {
  heading: { en: "Share it as one file", zh: "导出成一个文件分享" },
  command: "pnpm export:html",
  output: "dist/frontier-slides.html",
  points: [
    {
      en: "Scripts, styles, fonts and images are inlined",
      zh: "脚本、样式、字体和图片全部内联",
    },
    { en: "Opens offline with a double-click", zh: "离线双击即可打开" },
    {
      en: "The URL hash (#/7) still links to a page",
      zh: "地址中的 #/7 依然能定位到页",
    },
  ] satisfies Text[],
}

export const REFERENCES: { label: Text; url: string }[] = [
  { label: same("Motion for React"), url: "https://motion.dev/docs/react" },
  { label: same("Tailwind CSS v4"), url: "https://tailwindcss.com/docs" },
  { label: same("shadcn/ui · Base UI"), url: "https://ui.shadcn.com/docs" },
  {
    label: {
      en: "View Transitions API",
      zh: "View Transitions API（主题切换动画）",
    },
    url: "https://developer.mozilla.org/docs/Web/API/View_Transition_API",
  },
]

export const THANKS = {
  eyebrow: same("Frontier · Slides"),
  word: { en: "Thanks", zh: "谢谢" },
}
