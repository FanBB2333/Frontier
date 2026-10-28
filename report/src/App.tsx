import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react"
import report from "@report"
import {
  ArrowsInLineVerticalIcon,
  ArrowsOutLineVerticalIcon,
  CornersOutIcon,
  ListBulletsIcon,
  MagnifyingGlassIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  PresentationChartIcon,
  SidebarSimpleIcon,
  TreeStructureIcon,
} from "@phosphor-icons/react"
import {
  Badge,
  Button,
  Checkbox,
  InputGroup,
  LayerCard,
  LayerDialog,
  Radio,
  Tabs,
  Text,
} from "@cloudflare/kumo"

import {
  ancestorsOf,
  expandedToDepth,
  indexTree,
  maxDepthOf,
  preorder,
  search,
  statusCounts,
} from "@/report/tree"
import { STATUS, STATUS_ORDER, StatusDot } from "@/report/status"
import type { Status } from "@/report/types"
import { NodeDetail } from "@/components/report/node-detail"
import { OutlineView } from "@/components/report/outline-view"
import { SettingsMenu } from "@/components/report/settings-menu"
import { TreeView } from "@/components/report/tree-view"
import { WalkBar } from "@/components/report/walk-bar"
import { Kbd } from "@/components/kbd"
import { ResizeHandle } from "@/components/resize-handle"
import {
  CANVAS_MIN,
  PANEL_WIDTH_MIN,
  STYLE_DEFAULTS,
  useTheme,
} from "@/components/theme-provider"

const INDEX = indexTree(report.root)
const ORDER = preorder(report.root)
const MAX_DEPTH = maxDepthOf(INDEX)
const COUNTS = statusCounts(INDEX)
const ZOOMS = [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.15, 1.3, 1.5, 1.75, 2]
// showing the whole tree is only worth it while the text stays readable; a taller tree is
// fitted to the width instead and scrolls vertically
const FIT_MIN = 0.65
const FIT_MAX = 1.75
// canvas padding around the tree: the zoom bar on top, the walk bar at the bottom
const PAD_X = 16
const PAD_TOP = 48
const PAD_BOTTOM = 16
const PAD_BOTTOM_WALK = 200

type View = "tree" | "outline"

function useWindowWidth() {
  const [width, setWidth] = useState(() => window.innerWidth)
  useEffect(() => {
    const on = () => setWidth(window.innerWidth)
    window.addEventListener("resize", on)
    return () => window.removeEventListener("resize", on)
  }, [])
  return width
}

function clampZoom(z: number) {
  return Math.min(ZOOMS[ZOOMS.length - 1], Math.max(ZOOMS[0], z))
}

// zoom at which the tree fills the canvas; content carries the zoom currently applied
function fitZoom(canvas: HTMLElement, content: HTMLElement, padBottom: number) {
  const applied = parseFloat(content.style.zoom) || 1
  const r = content.getBoundingClientRect()
  const byWidth = (canvas.clientWidth - 2 * PAD_X) / (r.width / applied)
  const byHeight =
    (canvas.clientHeight - PAD_TOP - padBottom) / (r.height / applied)
  const whole = Math.min(byWidth, byHeight)
  const z = whole >= FIT_MIN ? whole : Math.max(ZOOMS[0], byWidth)
  return Math.round(Math.min(FIT_MAX, z) * 100) / 100
}

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    !!target.closest("input, textarea, select, [contenteditable='true']")
  )
}

export default function App() {
  const vw = useWindowWidth()
  const wide = vw >= 1024

  const [view, setView] = useState<View>(() =>
    window.matchMedia("(min-width: 768px)").matches ? "tree" : "outline"
  )
  const [depth, setDepth] = useState(1)
  const [expanded, setExpanded] = useState<Set<string>>(() =>
    expandedToDepth(INDEX, 1)
  )
  const [selected, setSelected] = useState(report.root.id)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [cursor, setCursor] = useState(-1)
  const [statusFilter, setStatusFilter] = useState<Status[]>([])
  const [zoom, setZoom] = useState(1)
  // follow the canvas size until the zoom is changed by hand
  const [autoFit, setAutoFit] = useState(true)
  // wide screens: the detail panel starts closed so the tree fills the window, and opens on a click
  const [panel, setPanel] = useState(false)
  const { style, setStyle } = useTheme()
  const panelMax = Math.max(PANEL_WIDTH_MIN, vw - CANVAS_MIN)
  const panelW = Math.min(style.panelWidth, panelMax)
  const [walk, setWalk] = useState({ on: false, step: 0, focus: true })

  const canvasRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const scrollTarget = useRef<string | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const drag = useRef<{
    x: number
    y: number
    left: number
    top: number
  } | null>(null)
  // zoom as last requested, ahead of the render that applies it
  const zoomRef = useRef(1)
  // the point of the tree under the cursor, kept in place while zooming
  const anchor = useRef<{
    fx: number
    fy: number
    x: number
    y: number
  } | null>(null)
  // touch points on the canvas, and the pinch they started
  const touches = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef<{ dist: number; zoom: number } | null>(null)

  const walkOrder = useMemo(() => preorder(report.root, depth), [depth])
  const matches = useMemo(() => search(INDEX, ORDER, query), [query])
  const highlight = useMemo(() => {
    if (query.trim()) return new Set(matches)
    if (statusFilter.length)
      return new Set(
        ORDER.filter((id) =>
          statusFilter.includes(INDEX.get(id)!.node.status as Status)
        )
      )
    return null
  }, [query, matches, statusFilter])

  useEffect(() => {
    document.title = report.title
  }, [])

  // scroll the node chosen by keyboard, search or the walk into view, after it is rendered
  useEffect(() => {
    const id = scrollTarget.current
    if (!id) return
    scrollTarget.current = null
    requestAnimationFrame(() => {
      canvasRef.current
        ?.querySelector(`[data-node-id="${CSS.escape(id)}"]`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        })
    })
  })

  const reveal = (ids: Iterable<string>) =>
    setExpanded((prev) => new Set([...prev, ...ancestorsOf(INDEX, ids)]))

  const select = (
    id: string,
    opts: { scroll?: boolean; sheet?: boolean } = {}
  ) => {
    setSelected(id)
    if (opts.scroll) {
      reveal([id])
      scrollTarget.current = id
    }
    if (opts.sheet) {
      if (wide) setPanel(true)
      else setSheetOpen(true)
    }
  }

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const showDepth = (d: number) => {
    setDepth(d)
    setExpanded(expandedToDepth(INDEX, d))
    // the walk order depends on the depth, so a running walk ends here
    setWalk((w) => ({ ...w, on: false }))
  }

  const walkTo = (step: number, focus = walk.focus) => {
    const id = walkOrder[step]
    const e = INDEX.get(id)!
    setExpanded((prev) => {
      const next = focus ? new Set<string>() : new Set(prev)
      e.path.slice(0, -1).forEach((a) => next.add(a))
      if (e.node.children?.length && e.depth < depth) next.add(id)
      return next
    })
    setSelected(id)
    scrollTarget.current = id
    setWalk({ on: true, step, focus })
  }

  const startWalk = () => {
    const at = walkOrder.indexOf(selected)
    walkTo(at >= 0 ? at : 0)
  }

  const onSearch = (q: string) => {
    setQuery(q)
    setCursor(-1)
    reveal(search(INDEX, ORDER, q))
  }

  const nextMatch = (dir: 1 | -1) => {
    if (!matches.length) return
    const c = (cursor + dir + matches.length) % matches.length
    setCursor(c)
    select(matches[c], { scroll: true })
  }

  const onStatusFilter = (v: Status[]) => {
    setStatusFilter(v)
    reveal(
      ORDER.filter((id) => v.includes(INDEX.get(id)!.node.status as Status))
    )
  }

  const padBottom = walk.on ? PAD_BOTTOM_WALK : PAD_BOTTOM

  // fit to the window, again whenever the window, the detail panel or the expanded tree
  // changes size
  useEffect(() => {
    const c = canvasRef.current
    const el = contentRef.current
    if (view !== "tree" || !autoFit || !c || !el) return
    let frame = 0
    const apply = () => {
      const z = fitZoom(c, el, padBottom)
      setZoom((prev) => (Math.abs(prev - z) < 0.01 ? prev : z))
    }
    apply()
    // a frame later, so the zoom change does not resize the observed boxes inside the callback
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(apply)
    })
    ro.observe(c)
    ro.observe(el)
    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
    }
  }, [view, autoFit, padBottom])

  // the tree view opens at its top
  useEffect(() => {
    if (view === "tree") canvasRef.current?.scrollTo({ top: 0, left: 0 })
  }, [view])

  // zoom by hand around the screen point (x, y); this ends fitting to the window
  const zoomAt = useCallback((next: number, x: number, y: number) => {
    const el = contentRef.current
    if (el) {
      const r = el.getBoundingClientRect()
      anchor.current = {
        fx: (x - r.left) / r.width,
        fy: (y - r.top) / r.height,
        x,
        y,
      }
    }
    zoomRef.current = clampZoom(next)
    setAutoFit(false)
    setZoom(zoomRef.current)
  }, [])

  useLayoutEffect(() => {
    zoomRef.current = zoom
    const a = anchor.current
    const c = canvasRef.current
    const el = contentRef.current
    anchor.current = null
    if (!a || !c || !el) return
    const r = el.getBoundingClientRect()
    c.scrollLeft += r.left + a.fx * r.width - a.x
    c.scrollTop += r.top + a.fy * r.height - a.y
  }, [zoom])

  // zoom gestures over the tree zoom the tree, not the page: a trackpad pinch or
  // Ctrl/⌘ + wheel arrives as a wheel event with ctrlKey/metaKey, Safari sends gesture events
  useEffect(() => {
    const sec = sectionRef.current
    if (view !== "tree" || !sec) return
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      const d = Math.max(-20, Math.min(20, e.deltaY))
      zoomAt(zoomRef.current * Math.exp(-d * 0.01), e.clientX, e.clientY)
    }
    let base = 1
    const onGestureStart = (e: Event) => {
      e.preventDefault()
      base = zoomRef.current
    }
    const onGestureChange = (e: Event) => {
      e.preventDefault()
      const g = e as Event & { scale: number; clientX: number; clientY: number }
      zoomAt(base * g.scale, g.clientX, g.clientY)
    }
    const prevent = (e: Event) => e.preventDefault()
    sec.addEventListener("wheel", onWheel, { passive: false })
    sec.addEventListener("gesturestart", onGestureStart)
    sec.addEventListener("gesturechange", onGestureChange)
    sec.addEventListener("gestureend", prevent)
    return () => {
      sec.removeEventListener("wheel", onWheel)
      sec.removeEventListener("gesturestart", onGestureStart)
      sec.removeEventListener("gesturechange", onGestureChange)
      sec.removeEventListener("gestureend", prevent)
    }
  }, [view, zoomAt])

  // the zoom buttons step through ZOOMS around the middle of the canvas
  const stepZoom = (dir: 1 | -1) => {
    const i = ZOOMS.findIndex((z) => z >= zoom - 1e-6)
    const next =
      ZOOMS[
        Math.min(
          ZOOMS.length - 1,
          Math.max(0, (i < 0 ? ZOOMS.length - 1 : i) + dir)
        )
      ]
    const r = canvasRef.current!.getBoundingClientRect()
    zoomAt(next, r.left + r.width / 2, r.top + r.height / 2)
  }

  // keyboard: walk with ← → while presenting; otherwise move through the tree
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return
      if (e.key === "/") {
        e.preventDefault()
        searchRef.current?.focus()
        return
      }
      if (walk.on) {
        const map: Record<string, number> = {
          ArrowRight: 1,
          " ": 1,
          PageDown: 1,
          ArrowLeft: -1,
          PageUp: -1,
        }
        if (e.key in map) {
          e.preventDefault()
          const s = walk.step + map[e.key]
          if (s >= 0 && s < walkOrder.length) walkTo(s)
        } else if (e.key === "Escape") setWalk((w) => ({ ...w, on: false }))
        return
      }
      const cur = INDEX.get(selected)!
      const siblings = cur.parent
        ? INDEX.get(cur.parent)!.node.children!
        : [cur.node]
      const pos = siblings.findIndex((n) => n.id === selected)
      let target: string | undefined
      if (e.key === "ArrowUp") target = cur.parent ?? undefined
      else if (e.key === "ArrowDown") target = cur.node.children?.[0]?.id
      else if (e.key === "ArrowLeft") target = siblings[pos - 1]?.id
      else if (e.key === "ArrowRight") target = siblings[pos + 1]?.id
      else if (e.key === "Enter" && cur.node.children?.length) {
        e.preventDefault()
        toggle(selected)
        return
      } else if (e.key === "p") {
        startWalk()
        return
      }
      if (target) {
        e.preventDefault()
        select(target, { scroll: true })
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  const spread = () => {
    const [a, b] = [...touches.current.values()]
    return {
      dist: Math.hypot(a.x - b.x, a.y - b.y),
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
    }
  }

  // mouse: drag the empty canvas to pan; touch: the browser pans, two fingers pinch-zoom the tree
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") {
      touches.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (touches.current.size === 2)
        pinch.current = { dist: spread().dist, zoom: zoomRef.current }
      return
    }
    if (e.button !== 0 || (e.target as HTMLElement).closest("button")) return
    const c = canvasRef.current!
    drag.current = {
      x: e.clientX,
      y: e.clientY,
      left: c.scrollLeft,
      top: c.scrollTop,
    }
    c.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") {
      if (!touches.current.has(e.pointerId)) return
      touches.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      const p = pinch.current
      if (p && touches.current.size === 2) {
        const s = spread()
        zoomAt((p.zoom * s.dist) / p.dist, s.x, s.y)
      }
      return
    }
    const d = drag.current
    if (!d) return
    const c = canvasRef.current!
    c.scrollLeft = d.left - (e.clientX - d.x)
    c.scrollTop = d.top - (e.clientY - d.y)
  }
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    touches.current.delete(e.pointerId)
    if (touches.current.size < 2) pinch.current = null
    drag.current = null
  }

  const viewProps = {
    root: report.root,
    index: INDEX,
    levels: report.levels,
    expanded,
    selected,
    highlight,
    onSelect: (id: string) => {
      select(id, { sheet: true })
      if (walk.on) {
        const s = walkOrder.indexOf(id)
        if (s >= 0) setWalk((w) => ({ ...w, step: s }))
      }
    },
    onToggle: toggle,
  }

  const detail = (
    <div style={{ zoom: style.detailScale }}>
      <NodeDetail
        index={INDEX}
        levels={report.levels}
        id={selected}
        onSelect={(id) => select(id, { scroll: true })}
        onLocate={(id) => {
          setSheetOpen(false)
          select(id, { scroll: true })
        }}
      />
    </div>
  )

  return (
    <div className="flex h-svh flex-col bg-kumo-canvas text-kumo-default">
      <header className="flex shrink-0 flex-col gap-3 border-b border-kumo-hairline bg-kumo-base px-4 py-3">
        <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <Text variant="heading" as="h1">
                {report.title}
              </Text>
              <Badge variant="secondary">{report.date}</Badge>
            </div>
            {report.subtitle && (
              <p className="text-sm text-kumo-subtle">{report.subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="primary"
              icon={PresentationChartIcon}
              onClick={() =>
                walk.on ? setWalk((w) => ({ ...w, on: false })) : startWalk()
              }
            >
              {walk.on ? "退出汇报" : "汇报模式"}
            </Button>
            <SettingsMenu />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Tabs
            variant="segmented"
            value={view}
            onValueChange={(v) => setView(v as View)}
            tabs={[
              {
                value: "tree",
                label: (
                  <span className="flex items-center gap-1.5">
                    <TreeStructureIcon />
                    树状图
                  </span>
                ),
              },
              {
                value: "outline",
                label: (
                  <span className="flex items-center gap-1.5">
                    <ListBulletsIcon />
                    大纲
                  </span>
                ),
              },
            ]}
          />

          <Radio.Group
            appearance="segmented"
            className="flex-row items-center"
            value={String(depth)}
            onValueChange={(v) => showDepth(Number(v))}
          >
            <Radio.Legend className="text-xs text-kumo-subtle">
              展开到
            </Radio.Legend>
            {report.levels.slice(0, MAX_DEPTH).map((name, i) => (
              <Radio.Item key={name} value={String(i + 1)} label={name} />
            ))}
          </Radio.Group>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              icon={ArrowsOutLineVerticalIcon}
              onClick={() => showDepth(MAX_DEPTH)}
            >
              全部展开
            </Button>
            <Button
              variant="ghost"
              icon={ArrowsInLineVerticalIcon}
              onClick={() => showDepth(1)}
            >
              收起
            </Button>
          </div>

          <InputGroup className="w-full sm:ml-auto sm:w-64">
            <InputGroup.Addon>
              <MagnifyingGlassIcon />
            </InputGroup.Addon>
            <InputGroup.Input
              ref={searchRef}
              aria-label="搜索"
              placeholder="搜索节点、数字或文件"
              value={query}
              onChange={(e) => onSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") nextMatch(e.shiftKey ? -1 : 1)
                if (e.key === "Escape") {
                  onSearch("")
                  e.currentTarget.blur()
                }
              }}
            />
            <InputGroup.Addon align="end">
              {query ? (
                <span className="text-xs tabular-nums">
                  {matches.length} 处
                </span>
              ) : (
                <Kbd>/</Kbd>
              )}
            </InputGroup.Addon>
          </InputGroup>
        </div>

        <div
          role="group"
          aria-label="按状态筛选"
          className="flex flex-wrap items-center gap-x-4 gap-y-2"
        >
          <span className="text-xs text-kumo-subtle">按状态筛选</span>
          {STATUS_ORDER.filter((s) => COUNTS[s] > 0).map((s) => (
            <Checkbox
              key={s}
              checked={statusFilter.includes(s)}
              onCheckedChange={(on) =>
                onStatusFilter(
                  on
                    ? [...statusFilter, s]
                    : statusFilter.filter((x) => x !== s)
                )
              }
              label={
                <span className="flex items-center gap-1.5">
                  <StatusDot status={s} />
                  {STATUS[s].label}
                  <span className="text-kumo-subtle tabular-nums">
                    {COUNTS[s]}
                  </span>
                </span>
              }
            />
          ))}
        </div>
      </header>

      <main className="flex min-h-0 flex-1">
        <section
          ref={sectionRef}
          className="relative flex min-w-0 flex-1 flex-col"
        >
          {view === "tree" && (
            <LayerCard className="absolute top-3 right-3 z-10 flex items-center gap-0.5 p-1 shadow-xs">
              <Button
                variant="ghost"
                shape="square"
                size="sm"
                icon={MagnifyingGlassMinusIcon}
                title="缩小"
                onClick={() => stepZoom(-1)}
              />
              <span className="w-10 text-center text-xs tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                shape="square"
                size="sm"
                icon={MagnifyingGlassPlusIcon}
                title="放大"
                onClick={() => stepZoom(1)}
              />
              <Button
                variant={autoFit ? "secondary" : "ghost"}
                size="sm"
                icon={CornersOutIcon}
                aria-pressed={autoFit}
                onClick={() => setAutoFit(true)}
              >
                适应窗口
              </Button>
              {wide && (
                <Button
                  variant="ghost"
                  shape="square"
                  size="sm"
                  icon={SidebarSimpleIcon}
                  title={panel ? "收起详情面板" : "展开详情面板"}
                  onClick={() => setPanel((v) => !v)}
                />
              )}
            </LayerCard>
          )}

          <div
            ref={canvasRef}
            className={
              view === "tree"
                ? "min-h-0 flex-1 cursor-grab touch-pan-x touch-pan-y [scrollbar-gutter:stable] overflow-auto active:cursor-grabbing"
                : "min-h-0 flex-1 overflow-auto"
            }
            onPointerDown={view === "tree" ? onPointerDown : undefined}
            onPointerMove={view === "tree" ? onPointerMove : undefined}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {view === "tree" ? (
              <div
                className="flex min-h-full w-max min-w-full items-center justify-center"
                style={{
                  padding: `${PAD_TOP}px ${PAD_X}px ${padBottom}px`,
                }}
              >
                <div ref={contentRef} style={{ zoom }}>
                  <TreeView {...viewProps} />
                </div>
              </div>
            ) : (
              <OutlineView {...viewProps} />
            )}
          </div>

          {walk.on && (
            <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10">
              <WalkBar
                index={INDEX}
                levels={report.levels}
                order={walkOrder}
                step={walk.step}
                focus={walk.focus}
                onFocusChange={(f) => walkTo(walk.step, f)}
                onStep={(s) => walkTo(s)}
                onExit={() => setWalk((w) => ({ ...w, on: false }))}
                onDetail={
                  !wide
                    ? () => setSheetOpen(true)
                    : panel
                      ? undefined
                      : () => setPanel(true)
                }
              />
            </div>
          )}
        </section>

        {wide && panel && (
          <>
            <ResizeHandle
              label="调整详情面板宽度"
              width={panelW}
              min={PANEL_WIDTH_MIN}
              max={panelMax}
              onResize={(w) => setStyle({ panelWidth: w })}
              onReset={() =>
                setStyle({ panelWidth: STYLE_DEFAULTS.panelWidth })
              }
            />
            <aside
              className="flex shrink-0 flex-col bg-kumo-base"
              style={{ width: panelW }}
            >
              <div className="min-h-0 flex-1 overflow-y-auto">{detail}</div>
            </aside>
          </>
        )}
      </main>

      {!wide && (
        <LayerDialog.Root open={sheetOpen} onOpenChange={setSheetOpen}>
          <LayerDialog.Content closeLabel="关闭">
            <LayerDialog.Title>节点详情</LayerDialog.Title>
            <LayerDialog.Body>{detail}</LayerDialog.Body>
          </LayerDialog.Content>
        </LayerDialog.Root>
      )}
    </div>
  )
}
