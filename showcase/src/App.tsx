import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import {
  ExternalLinkIcon,
  InfoIcon,
  LanguagesIcon,
  LaptopIcon,
  MenuIcon,
  MonitorIcon,
  MoonIcon,
  NetworkIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PanelsTopLeftIcon,
  PresentationIcon,
  RotateCwIcon,
  SmartphoneIcon,
  SquareCheckBigIcon,
  SunIcon,
  TabletIcon,
  XIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { APP_ID, REPO_URL } from "@/lib/app"
import { otherLang, setLang, useLang, useT, type Text } from "@/lib/i18n"
import { SCHEME_MESSAGE, SCHEME_PARAM, type Scheme } from "@/lib/system-scheme"
import { originOf, useTheme } from "@/hooks/use-theme"
import { TEMPLATES, type TemplateEntry } from "@/templates"
import { ResizeHandle } from "@/components/resize-handle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const ICONS: Record<string, typeof MonitorIcon> = {
  annotation: SquareCheckBigIcon,
  slides: PresentationIcon,
  landing: PanelsTopLeftIcon,
  report: NetworkIcon,
}

const UI = {
  gallery: { en: "Template gallery", zh: "模板展示" },
  templates: { en: "Templates", zh: "模板" },
  sample: { en: "Sample data", zh: "样例数据" },
  sampleNote: {
    en: "Every template here runs on made-up sample data; nothing is loaded from a real service.",
    zh: "这里的模板都只使用虚构的样例数据，不连接任何真实服务。",
  },
  open: { en: "Open in new tab", zh: "在新标签页打开" },
  source: { en: "Source on GitHub", zh: "在 GitHub 查看源码" },
  reload: { en: "Reload", zh: "重新加载" },
  drawer: { en: "Toggle sidebar", zh: "展开 / 收起侧栏" },
  resize: {
    en: "Drag to resize the sidebar, double-click to reset",
    zh: "拖动调整侧栏宽度，双击恢复默认",
  },
  theme: { en: "Switch theme", zh: "切换主题" },
  lang: { en: "切换到中文", zh: "Switch to English" },
  close: { en: "Close", zh: "关闭" },
  viewport: { en: "Preview width", zh: "预览宽度" },
} satisfies Record<string, Text>

type Viewport = "full" | "laptop" | "tablet" | "phone"
const VIEWPORTS: {
  id: Viewport
  width?: number
  icon: typeof MonitorIcon
  label: Text
}[] = [
  { id: "full", icon: MonitorIcon, label: { en: "Fill", zh: "铺满" } },
  {
    id: "laptop",
    width: 1280,
    icon: LaptopIcon,
    label: { en: "Laptop · 1280", zh: "笔记本 · 1280" },
  },
  {
    id: "tablet",
    width: 820,
    icon: TabletIcon,
    label: { en: "Tablet · 820", zh: "平板 · 820" },
  },
  {
    id: "phone",
    width: 390,
    icon: SmartphoneIcon,
    label: { en: "Phone · 390", zh: "手机 · 390" },
  },
]

function readHash(): TemplateEntry {
  const id = window.location.hash.replace(/^#\/?/, "")
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]
}

function useSelected() {
  const [selected, setSelected] = useState(readHash)
  useEffect(() => {
    const onHash = () => setSelected(readHash())
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])
  const select = useCallback((t: TemplateEntry) => {
    window.history.replaceState(null, "", `#/${t.id}`)
    setSelected(t)
  }, [])
  return [selected, select] as const
}

const useIsDesktop = () => {
  const query = "(min-width: 768px)"
  const [desktop, setDesktop] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setDesktop(media.matches)
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [])
  return desktop
}

const DRAWER = { default: 288, min: 240, max: 480 }
const DRAWER_KEY = `${APP_ID}:drawer-width`

function readDrawerWidth() {
  try {
    const saved = Number(window.localStorage.getItem(DRAWER_KEY))
    if (saved >= DRAWER.min && saved <= DRAWER.max) return saved
  } catch {
    // Storage can be unavailable; use the default width.
  }
  return DRAWER.default
}

function useDrawerWidth() {
  const [width, setWidth] = useState(readDrawerWidth)
  useEffect(() => {
    try {
      window.localStorage.setItem(DRAWER_KEY, String(width))
    } catch {
      // Not persisted; the width still applies for this session.
    }
  }, [width])
  return [width, setWidth] as const
}

function IconButton({
  label,
  onClick,
  href,
  children,
}: {
  label: string
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
  href?: string
  children: ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          href ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={label}
              nativeButton={false}
              render={<a href={href} target="_blank" rel="noreferrer" />}
            />
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={label}
              onClick={onClick}
            />
          )
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}

function Drawer({
  selected,
  onSelect,
  onClose,
  width,
}: {
  selected: TemplateEntry
  onSelect: (t: TemplateEntry) => void
  onClose?: () => void
  width?: number
}) {
  const t = useT()
  const lang = useLang()
  const { resolved, setTheme } = useTheme()
  return (
    <div
      className="flex h-full w-72 flex-col bg-card"
      style={width ? { width } : undefined}
    >
      <div className="flex h-12 shrink-0 items-center gap-2.5 border-b px-4">
        <img src="favicon.svg" alt="" className="size-5" />
        <span className="font-serif text-[17px] font-semibold tracking-tight">
          Frontier
        </span>
        <span className="text-xs text-muted-foreground">{t(UI.gallery)}</span>
        {onClose && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="ml-auto"
            aria-label={t(UI.close)}
            onClick={onClose}
          >
            <XIcon />
          </Button>
        )}
      </div>
      <nav
        aria-label={t(UI.templates)}
        className="flex min-h-0 flex-1 scrollbar-subtle flex-col gap-1 overflow-y-auto p-2"
      >
        <span className="px-2 pt-2 pb-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
          {t(UI.templates)}
        </span>
        {TEMPLATES.map((tpl) => {
          const Icon = ICONS[tpl.id] ?? MonitorIcon
          const active = tpl.id === selected.id
          return (
            <button
              key={tpl.id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => onSelect(tpl)}
              className={cn(
                "flex gap-3 rounded-lg border border-transparent p-2.5 text-left transition-colors hover:bg-muted",
                active &&
                  "border-border bg-background shadow-xs hover:bg-background"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border bg-card text-muted-foreground",
                  active && "text-foreground"
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">{t(tpl.name)}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {tpl.id}/
                  </span>
                </span>
                <span className="text-xs leading-relaxed text-muted-foreground">
                  {t(tpl.summary)}
                </span>
                <span className="mt-0.5 flex flex-wrap gap-1">
                  {tpl.stack.map((s) => (
                    <span
                      key={s}
                      className="rounded-sm bg-muted px-1.5 py-0.5 text-[10.5px] text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </span>
              </span>
            </button>
          )
        })}
      </nav>
      <div className="flex flex-col gap-3 border-t p-3">
        <p className="flex gap-2 rounded-md bg-muted px-2.5 py-2 text-xs leading-relaxed text-muted-foreground">
          <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
          {t(UI.sampleNote)}
        </p>
        <div className="flex items-center gap-1">
          <IconButton label={t(UI.source)} href={REPO_URL}>
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </IconButton>
          <IconButton
            label={t(UI.theme)}
            onClick={(e) =>
              setTheme(
                resolved.mode === "dark" ? "light" : "dark",
                originOf(e.currentTarget)
              )
            }
          >
            {resolved.mode === "dark" ? <SunIcon /> : <MoonIcon />}
          </IconButton>
          <IconButton
            label={t(UI.lang)}
            onClick={() => setLang(otherLang(lang))}
          >
            <LanguagesIcon />
          </IconButton>
          <span className="ml-auto font-mono text-[11px] text-muted-foreground">
            {TEMPLATES.length} templates
          </span>
        </div>
      </div>
    </div>
  )
}

// The gallery's mode is the templates' "system" mode: the frame URL carries the one it starts
// with, and later changes go in by message so the template keeps its state.
function frameSrc(path: string, scheme: Scheme) {
  const url = new URL(path, window.location.href)
  url.searchParams.set(SCHEME_PARAM, scheme)
  return url.href
}

function Stage({
  template,
  viewport,
  reloadKey,
  scheme,
}: {
  template: TemplateEntry
  viewport: Viewport
  reloadKey: number
  scheme: Scheme
}) {
  const [loaded, setLoaded] = useState(false)
  const width = VIEWPORTS.find((v) => v.id === viewport)?.width
  const key = `${template.id}-${reloadKey}`
  const [frame, setFrame] = useState(() => ({
    key,
    src: frameSrc(template.path, scheme),
  }))
  if (frame.key !== key) {
    setFrame({ key, src: frameSrc(template.path, scheme) })
    setLoaded(false)
  }
  const ref = useRef<HTMLIFrameElement>(null)
  const sendScheme = useCallback(() => {
    ref.current?.contentWindow?.postMessage(
      { type: SCHEME_MESSAGE, scheme },
      new URL(frame.src).origin
    )
  }, [scheme, frame.src])
  useEffect(() => sendScheme(), [sendScheme])
  return (
    <div
      className={cn(
        "relative min-h-0 flex-1 overflow-auto bg-stage",
        width && "p-4"
      )}
    >
      <div
        className={cn(
          "relative mx-auto h-full",
          width && "overflow-hidden rounded-lg border bg-background shadow-lg"
        )}
        style={{ width: width ?? "100%", maxWidth: "100%" }}
      >
        <iframe
          key={frame.key}
          ref={ref}
          src={frame.src}
          title={template.id}
          className="size-full border-0"
          onLoad={() => {
            setLoaded(true)
            sendScheme()
          }}
          allow="fullscreen; clipboard-write"
        />
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <span className="size-5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const t = useT()
  const desktop = useIsDesktop()
  const { resolved } = useTheme()
  const [selected, select] = useSelected()
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [drawerWidth, setDrawerWidth] = useDrawerWidth()
  const [resizing, setResizing] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [viewport, setViewport] = useState<Viewport>("full")
  const [reloadKey, setReloadKey] = useState(0)
  const frameUrl = new URL(selected.path, window.location.href).href

  useEffect(() => {
    document.title = `${t(selected.name)} · Frontier`
  }, [selected, t])

  const pick = (tpl: TemplateEntry) => {
    select(tpl)
    setMobileOpen(false)
  }

  return (
    <TooltipProvider delay={300}>
      <div className="flex h-svh overflow-hidden">
        {desktop ? (
          <>
            <aside
              className={cn(
                "shrink-0 overflow-hidden border-r",
                !resizing && "transition-[width] duration-300 ease-out",
                !drawerOpen && "border-r-0"
              )}
              style={{ width: drawerOpen ? drawerWidth : 0 }}
              aria-hidden={!drawerOpen}
            >
              <Drawer selected={selected} onSelect={pick} width={drawerWidth} />
            </aside>
            {drawerOpen && (
              <ResizeHandle
                label={t(UI.resize)}
                width={drawerWidth}
                min={DRAWER.min}
                max={DRAWER.max}
                onResize={setDrawerWidth}
                onReset={() => setDrawerWidth(DRAWER.default)}
                onDragChange={setResizing}
              />
            )}
          </>
        ) : (
          <>
            <div
              className={cn(
                "fixed inset-0 z-40 bg-black/40 transition-opacity",
                mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
              )}
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <aside
              className={cn(
                "fixed inset-y-0 left-0 z-50 border-r shadow-2xl transition-transform duration-300 ease-out",
                mobileOpen ? "translate-x-0" : "-translate-x-full"
              )}
            >
              <Drawer
                selected={selected}
                onSelect={pick}
                onClose={() => setMobileOpen(false)}
              />
            </aside>
          </>
        )}

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-card px-2">
            <IconButton
              label={t(UI.drawer)}
              onClick={() =>
                desktop ? setDrawerOpen((o) => !o) : setMobileOpen(true)
              }
            >
              {desktop ? (
                drawerOpen ? (
                  <PanelLeftCloseIcon />
                ) : (
                  <PanelLeftOpenIcon />
                )
              ) : (
                <MenuIcon />
              )}
            </IconButton>
            <Separator orientation="vertical" className="my-3" />
            <span className="truncate pl-1 text-sm font-medium">
              {t(selected.name)}
            </span>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {t(UI.sample)}
            </Badge>
            <span className="hidden min-w-0 truncate text-xs text-muted-foreground xl:inline">
              {t(selected.tip)}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <ToggleGroup
                size="sm"
                variant="outline"
                spacing={0}
                value={[viewport]}
                onValueChange={(v) => v[0] && setViewport(v[0] as Viewport)}
                aria-label={t(UI.viewport)}
                className="hidden lg:flex"
              >
                {VIEWPORTS.map((v) => (
                  <Tooltip key={v.id}>
                    <TooltipTrigger
                      render={
                        <ToggleGroupItem value={v.id} aria-label={t(v.label)} />
                      }
                    >
                      <v.icon />
                    </TooltipTrigger>
                    <TooltipContent side="bottom">{t(v.label)}</TooltipContent>
                  </Tooltip>
                ))}
              </ToggleGroup>
              <IconButton
                label={t(UI.reload)}
                onClick={() => setReloadKey((k) => k + 1)}
              >
                <RotateCwIcon />
              </IconButton>
              <IconButton label={t(UI.open)} href={frameUrl}>
                <ExternalLinkIcon />
              </IconButton>
              <IconButton
                label={t(UI.source)}
                href={`${REPO_URL}/tree/main/${selected.id}`}
              >
                <span className="font-mono text-[11px]">{"</>"}</span>
              </IconButton>
            </div>
          </header>
          <Stage
            template={selected}
            viewport={desktop ? viewport : "full"}
            reloadKey={reloadKey}
            scheme={resolved.mode}
          />
        </main>
      </div>
    </TooltipProvider>
  )
}
