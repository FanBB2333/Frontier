import { useEffect, useRef } from "react"
import { CANVAS_H, CANVAS_W } from "./canvas"
import type { ThreadShape } from "./shapes"

// The thread is resampled into N points of equal arc length. Morphing interpolates
// point by point with a travelling delay, so the old shape "flows" into the new one
// instead of cross-fading.

const N = 260
const MORPH_MS = 1250
const WAVE = 0.38
const LIFT = 26
const COMET_SPEED = 260 // px per second along the path
const TAIL = 34

type Points = Float32Array

let sampler: SVGPathElement | null = null
const cache = new Map<string, Points>()

function samplePoints(d: string): Points {
  const hit = cache.get(d)
  if (hit) return hit
  if (!sampler) {
    const ns = "http://www.w3.org/2000/svg"
    const svg = document.createElementNS(ns, "svg")
    svg.setAttribute("aria-hidden", "true")
    svg.style.cssText =
      "position:absolute;width:0;height:0;overflow:hidden;visibility:hidden"
    sampler = document.createElementNS(ns, "path")
    svg.appendChild(sampler)
    document.body.appendChild(svg)
  }
  sampler.setAttribute("d", d)
  const length = sampler.getTotalLength()
  const out = new Float32Array(N * 2)
  for (let i = 0; i < N; i++) {
    const p = sampler.getPointAtLength((length * i) / (N - 1))
    out[i * 2] = p.x
    out[i * 2 + 1] = p.y
  }
  cache.set(d, out)
  return out
}

function cost(a: Points, b: Points) {
  let c = 0
  for (let i = 0; i < N; i += 3) {
    const dx = a[i * 2] - b[i * 2]
    const dy = a[i * 2 + 1] - b[i * 2 + 1]
    c += dx * dx + dy * dy
  }
  return c
}

function reorder(
  src: Points,
  closed: boolean,
  offset: number,
  reverse: boolean
): Points {
  const out = new Float32Array(N * 2)
  const m = closed ? N - 1 : N
  for (let i = 0; i < m; i++) {
    let j = reverse ? (closed ? offset - i : N - 1 - i) : i + offset
    j = ((j % m) + m) % m
    out[i * 2] = src[j * 2]
    out[i * 2 + 1] = src[j * 2 + 1]
  }
  if (closed) {
    out[(N - 1) * 2] = out[0]
    out[(N - 1) * 2 + 1] = out[1]
  }
  return out
}

/** Pick the start point and direction of the target that travels the least from the current shape. */
function align(from: Points, to: Points, closed: boolean): Points {
  let best = to
  let bestCost = cost(from, to)
  const tryOne = (offset: number, reverse: boolean) => {
    const candidate = reorder(to, closed, offset, reverse)
    const c = cost(from, candidate)
    if (c < bestCost) {
      best = candidate
      bestCost = c
    }
  }
  if (closed) {
    for (let k = 0; k < N - 1; k += 3) {
      tryOne(k, false)
      tryOne(k, true)
    }
  } else {
    tryOne(0, true)
  }
  return best
}

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)

function toPath(p: Points, from = 0, to = N - 1) {
  let d = `M${p[from * 2].toFixed(1)} ${p[from * 2 + 1].toFixed(1)}`
  for (let i = from + 1; i <= to; i++)
    d += `L${p[i * 2].toFixed(1)} ${p[i * 2 + 1].toFixed(1)}`
  return d
}

export function Thread({ shape, dir }: { shape: ThreadShape; dir: number }) {
  const mainRef = useRef<SVGPathElement>(null)
  const glowRef = useRef<SVGPathElement>(null)
  const tailRef = useRef<SVGPathElement>(null)
  const headRef = useRef<SVGCircleElement>(null)
  const state = useRef<{
    current: Points | null
    from: Points | null
    to: Points | null
    start: number
    dir: number
    closed: boolean
    phase: number
  }>({
    current: null,
    from: null,
    to: null,
    start: 0,
    dir: 1,
    closed: false,
    phase: 0,
  })

  // Retarget on every shape change; the first shape grows out of its own start point.
  useEffect(() => {
    const s = state.current
    const target = samplePoints(shape.d)
    if (!s.current) {
      const seed = new Float32Array(N * 2)
      for (let i = 0; i < N; i++) {
        seed[i * 2] = target[0]
        seed[i * 2 + 1] = target[1]
      }
      s.current = seed
    }
    s.from = s.current.slice()
    s.to = align(s.from, target, shape.closed)
    s.start = performance.now()
    s.dir = dir >= 0 ? 1 : -1
    s.closed = shape.closed
  }, [shape.d, shape.closed, dir])

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const s = state.current
      const dt = Math.max(0, Math.min(64, now - last)) / 1000
      last = now
      if (s.from && s.to && s.current) {
        const t = clamp01((now - s.start) / MORPH_MS)
        const cur = s.current
        for (let i = 0; i < N; i++) {
          const along = s.dir > 0 ? i / (N - 1) : 1 - i / (N - 1)
          const p = easeInOut(clamp01((t - WAVE * along) / (1 - WAVE)))
          const lift = Math.sin(Math.PI * p) * LIFT * Math.sin(i * 0.19 + t * 7)
          cur[i * 2] = s.from[i * 2] + (s.to[i * 2] - s.from[i * 2]) * p
          cur[i * 2 + 1] =
            s.from[i * 2 + 1] + (s.to[i * 2 + 1] - s.from[i * 2 + 1]) * p + lift
        }
        const d = toPath(cur)
        mainRef.current?.setAttribute("d", d)
        glowRef.current?.setAttribute("d", d)

        // Comet: constant speed along the current outline.
        let length = 0
        for (let i = 1; i < N; i++)
          length += Math.hypot(
            cur[i * 2] - cur[i * 2 - 2],
            cur[i * 2 + 1] - cur[i * 2 - 1]
          )
        s.phase = (s.phase + (dt * COMET_SPEED) / Math.max(length, 1)) % 1
        const head = Math.min(N - 1, Math.max(0, Math.floor(s.phase * (N - 1))))
        const tailStart = Math.max(0, head - TAIL)
        headRef.current?.setAttribute("cx", cur[head * 2].toFixed(1))
        headRef.current?.setAttribute("cy", cur[head * 2 + 1].toFixed(1))
        tailRef.current?.setAttribute(
          "d",
          head > tailStart ? toPath(cur, tailStart, head) : ""
        )
        const edge = s.closed ? 1 : Math.min(1, head / 12, (N - 1 - head) / 12)
        headRef.current?.setAttribute("opacity", edge.toFixed(2))
        tailRef.current?.setAttribute("opacity", (edge * 0.9).toFixed(2))
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={CANVAS_W}
      height={CANVAS_H}
      viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      aria-hidden="true"
    >
      <ThreadDefs />
      <path
        ref={glowRef}
        fill="none"
        stroke="url(#thread-stroke)"
        strokeWidth={12}
        strokeOpacity={0.16}
        filter="url(#thread-blur)"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        ref={mainRef}
        fill="none"
        stroke="url(#thread-stroke)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        ref={tailRef}
        fill="none"
        stroke="url(#thread-comet)"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#thread-soft)"
      />
      <circle
        ref={headRef}
        r={5.5}
        fill="var(--foreground)"
        filter="url(#thread-soft)"
      />
    </svg>
  )
}

function ThreadDefs() {
  return (
    <defs>
      <linearGradient
        id="thread-stroke"
        gradientUnits="userSpaceOnUse"
        x1={0}
        y1={0}
        x2={CANVAS_W}
        y2={CANVAS_H}
      >
        <stop offset="0%" stopColor="var(--signal)" />
        <stop offset="100%" stopColor="var(--signal-2)" />
      </linearGradient>
      <linearGradient
        id="thread-comet"
        gradientUnits="userSpaceOnUse"
        x1={0}
        y1={0}
        x2={CANVAS_W}
        y2={0}
      >
        <stop offset="0%" stopColor="var(--foreground)" stopOpacity={0.9} />
        <stop offset="100%" stopColor="var(--signal)" stopOpacity={0.9} />
      </linearGradient>
      <filter id="thread-blur" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation={10} />
      </filter>
      <filter id="thread-soft" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation={2.2} result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  )
}

/** Non-animated thread for overview thumbnails. */
export function StaticThread({
  shape,
  idPrefix,
}: {
  shape: ThreadShape
  idPrefix: string
}) {
  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={CANVAS_W}
      height={CANVAS_H}
      viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`${idPrefix}-stroke`}
          gradientUnits="userSpaceOnUse"
          x1={0}
          y1={0}
          x2={CANVAS_W}
          y2={CANVAS_H}
        >
          <stop offset="0%" stopColor="var(--signal)" />
          <stop offset="100%" stopColor="var(--signal-2)" />
        </linearGradient>
      </defs>
      <path
        d={shape.d}
        fill="none"
        stroke={`url(#${idPrefix}-stroke)`}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
