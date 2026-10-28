// The deck the engine renders. Add a page: write a component in pages.tsx, put its geometry
// in layout.ts and register it below with the thread outline it should get.

import type { DeckDef } from "@/deck/types"
import { axes, circle, frame, rule, spine, steps } from "@/deck/shapes"
import { DECK_TITLE, SECTIONS } from "./content"
import {
  ANATOMY_IMAGE,
  CODE_CARD,
  EXPORT_CARD,
  PLOT,
  REF_ROWS,
  RULES_RING,
  SHORTCUT_TABLE,
  STEP_BOXES,
  STEP_TIP,
  TITLE_RING,
} from "./layout"
import {
  AnatomySlide,
  ChartSlide,
  ExportSlide,
  MotionSlide,
  ReferencesSlide,
  RegistrySlide,
  ShortcutsSlide,
  StepsSlide,
  ThanksSlide,
  TitleSlide,
} from "./pages"

const ring = circle(TITLE_RING.cx, TITLE_RING.cy, TITLE_RING.r)
const tb = SHORTCUT_TABLE

export const DECK: DeckDef = {
  title: DECK_TITLE,
  sections: SECTIONS,
  slides: [
    {
      id: "title",
      section: null,
      stages: 1,
      label: { en: "Title", zh: "封面" },
      Component: TitleSlide,
      thread: () => ring,
    },
    {
      id: "anatomy",
      section: "build",
      stages: 1,
      Component: AnatomySlide,
      thread: () => frame(ANATOMY_IMAGE),
    },
    {
      id: "registry",
      section: "build",
      stages: 1,
      Component: RegistrySlide,
      thread: () => frame(CODE_CARD),
    },
    {
      id: "steps",
      section: "steps",
      stages: 3,
      Component: StepsSlide,
      thread: (s) => steps(STEP_BOXES.slice(0, s + 1), STEP_TIP),
    },
    {
      id: "motion",
      section: "steps",
      stages: 1,
      Component: MotionSlide,
      thread: () => circle(RULES_RING.cx, RULES_RING.cy, RULES_RING.r),
    },
    {
      id: "chart",
      section: "present",
      stages: 1,
      Component: ChartSlide,
      thread: () => axes(PLOT),
    },
    {
      id: "shortcuts",
      section: "present",
      stages: 1,
      Component: ShortcutsSlide,
      thread: () =>
        rule(
          tb.x + tb.keyColW - 20,
          tb.y + 40 + tb.rowH * 6 + 30,
          tb.y + 10,
          tb.x + tb.w - 40
        ),
    },
    {
      id: "export",
      section: "present",
      stages: 1,
      Component: ExportSlide,
      thread: () => frame(EXPORT_CARD),
    },
    {
      id: "references",
      section: "refs",
      stages: 1,
      Component: ReferencesSlide,
      thread: () =>
        spine(REF_ROWS.tickX, REF_ROWS.top, REF_ROWS.step, REF_ROWS.count),
    },
    {
      id: "thanks",
      section: null,
      stages: 1,
      label: { en: "Thanks", zh: "致谢" },
      Component: ThanksSlide,
      thread: () => ring,
    },
  ],
}
