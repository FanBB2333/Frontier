import {
  useRef,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react"

export interface ResizeHandleProps {
  label: string
  // width of the panel to the right of the handle
  width: number
  min: number
  max: number
  onResize: (width: number) => void
  onReset: () => void
}

// Boundary on the left edge of a right-hand panel: drag it, or focus it and use ← / →
// (Shift for larger steps); double-click restores the default width.
export function ResizeHandle({
  label,
  width,
  min,
  max,
  onResize,
  onReset,
}: ResizeHandleProps) {
  const start = useRef<{ x: number; width: number } | null>(null)
  const clamp = (w: number) => Math.min(max, Math.max(min, Math.round(w)))

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.preventDefault()
    start.current = { x: e.clientX, width }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = start.current
    if (s) onResize(clamp(s.width - (e.clientX - s.x)))
  }
  const onPointerUp = () => (start.current = null)

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 64 : 16
    if (e.key === "ArrowLeft") onResize(clamp(width + step))
    else if (e.key === "ArrowRight") onResize(clamp(width - step))
    else return
    // the page uses the arrow keys to move through the tree
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={width}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={onReset}
      onKeyDown={onKeyDown}
      className="group relative z-10 -mx-1 w-2 shrink-0 cursor-col-resize touch-none outline-none"
    >
      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-kumo-hairline transition-[width,background-color] group-hover:w-0.5 group-hover:bg-kumo-brand group-focus-visible:w-0.5 group-focus-visible:bg-kumo-brand group-active:w-0.5 group-active:bg-kumo-brand" />
    </div>
  )
}
