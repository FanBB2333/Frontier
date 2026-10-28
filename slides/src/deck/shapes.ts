// Path builders for the thread — one continuous stroke that morphs from page to page.
// Every shape is a single sub-path (no `M` jumps), so it can be resampled by length.

import type { Rect } from "./canvas"

export type ThreadShape = { d: string; closed: boolean }

const n = (v: number) => Math.round(v * 10) / 10

export function circle(cx: number, cy: number, r: number): ThreadShape {
  return {
    d: `M ${n(cx)} ${n(cy - r)} A ${r} ${r} 0 1 1 ${n(cx)} ${n(cy + r)} A ${r} ${r} 0 1 1 ${n(cx)} ${n(cy - r)}`,
    closed: true,
  }
}

/** A rounded frame `pad` px outside a rect, e.g. around an image. */
export function frame(rect: Rect, pad = 16, r = 26): ThreadShape {
  const x = rect.x - pad
  const y = rect.y - pad
  const w = rect.w + pad * 2
  const h = rect.h + pad * 2
  return {
    d: [
      `M ${x + r} ${y}`,
      `H ${x + w - r}`,
      `A ${r} ${r} 0 0 1 ${x + w} ${y + r}`,
      `V ${y + h - r}`,
      `A ${r} ${r} 0 0 1 ${x + w - r} ${y + h}`,
      `H ${x + r}`,
      `A ${r} ${r} 0 0 1 ${x} ${y + h - r}`,
      `V ${y + r}`,
      `A ${r} ${r} 0 0 1 ${x + r} ${y}`,
    ].join(" "),
    closed: true,
  }
}

/** A smooth curve through the given points (cubic, horizontal tangents). */
export function curve(points: { x: number; y: number }[]): ThreadShape {
  const [first, ...rest] = points
  const parts = [`M ${n(first.x)} ${n(first.y)}`]
  let prev = first
  for (const p of rest) {
    const mid = (prev.x + p.x) / 2
    parts.push(
      `C ${n(mid)} ${n(prev.y)} ${n(mid)} ${n(p.y)} ${n(p.x)} ${n(p.y)}`
    )
    prev = p
  }
  return { d: parts.join(" "), closed: false }
}

/** Underlines below a row of boxes, joined by curves and ending in an arrow head at `tipX`. */
export function steps(boxes: Rect[], tipX: number, gap = 22): ThreadShape {
  const parts: string[] = []
  boxes.forEach((b, i) => {
    const y = b.y + b.h + gap
    if (i === 0) parts.push(`M ${b.x} ${y}`)
    else {
      const prev = boxes[i - 1]
      const py = prev.y + prev.h + gap
      const mid = (prev.x + prev.w + b.x) / 2
      parts.push(`C ${mid} ${py} ${mid} ${y} ${b.x} ${y}`)
    }
    parts.push(`H ${b.x + b.w}`)
  })
  const last = boxes[boxes.length - 1]
  const y = last.y + last.h + gap
  parts.push(
    `H ${tipX}`,
    `L ${tipX - 22} ${y - 18}`,
    `L ${tipX} ${y}`,
    `L ${tipX - 22} ${y + 18}`
  )
  return { d: parts.join(" "), closed: false }
}

/** Chart axes: y axis from the top, x axis along the bottom of `plot`. */
export function axes(
  plot: { x0: number; x1: number; y0: number; y1: number },
  overshoot = 36
): ThreadShape {
  return {
    d: `M ${plot.x0} ${plot.y0 - overshoot} V ${plot.y1} H ${plot.x1 + overshoot}`,
    closed: false,
  }
}

/** A vertical spine at `x` with one tick per row, e.g. beside a list of links. */
export function spine(
  x: number,
  top: number,
  step: number,
  count: number,
  tick = 40
): ThreadShape {
  const parts = [`M ${x} ${top - 40}`]
  for (let i = 0; i < count; i++) {
    const y = top + i * step + 28
    parts.push(`V ${y}`, `H ${x + tick}`, `H ${x}`)
  }
  parts.push(`V ${top + (count - 1) * step + 110}`)
  return { d: parts.join(" "), closed: false }
}

/** Γ-shaped rule: a column divider rising from `bottom` that turns into a header underline. */
export function rule(
  x: number,
  bottom: number,
  headerY: number,
  right: number
): ThreadShape {
  return { d: `M ${x} ${bottom} V ${headerY} H ${right}`, closed: false }
}
