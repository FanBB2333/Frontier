// Geometry shared by a page and its thread, so the outline always wraps what the page draws.

import { byWidth, CANVAS_W, PAD_X, type Rect } from "@/deck/canvas"
import { ANATOMY, CHART, REFERENCES, STEPS } from "./content"

export const TITLE_RING = { cx: 1420, cy: 540, r: 300 }

export const ANATOMY_IMAGE = byWidth(1010, 262, 782, ANATOMY.image)

export const CODE_CARD: Rect = { x: 1010, y: 236, w: 782, h: 640 }

export const STEP_BOXES: Rect[] = STEPS.boxes.map((_, i) => ({
  x: PAD_X + i * 570,
  y: 470 - i * 40,
  w: 470,
  h: 136,
}))
export const STEP_TIP = CANVAS_W - PAD_X

export const RULES_RING = { cx: 1486, cy: 566, r: 256 }

export const PLOT = { x0: 250, x1: 1500, y0: 330, y1: 860 }
export const PLOT_MAX =
  Math.ceil(Math.max(...CHART.bars.map((b) => b.value)) / 5) * 5

export const SHORTCUT_TABLE = {
  x: PAD_X,
  y: 250,
  w: 1100,
  rowH: 96,
  keyColW: 360,
}

export const EXPORT_CARD: Rect = { x: PAD_X, y: 330, w: 940, h: 200 }

export const REF_ROWS = {
  top: 262,
  step: 150,
  tickX: 160,
  count: REFERENCES.length,
}
