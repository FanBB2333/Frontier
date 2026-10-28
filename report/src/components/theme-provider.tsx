import * as React from "react"

import { APP_ID } from "@/lib/app"
import { readStorage, writeStorage } from "@/lib/storage"

// Kumo reads the colour mode from data-mode on <html> and the token set from data-theme.
export type Mode = "light" | "dark" | "system"
export type Accent = "kumo" | "orange" | "green" | "violet"

export const MODES: Mode[] = ["light", "dark", "system"]
export const ACCENTS: Accent[] = ["kumo", "orange", "green", "violet"]

// Component style set in the settings panel. Sizes reach the CSS as variables on <html>;
// the card layout and the summary length are read by the components themselves.
export type CardStyle = "layered" | "flat"
export type Radius = "none" | "small" | "large"
export type Spacing = "compact" | "normal" | "loose"

export interface StylePrefs {
  // width of a first-level column of the tree, px
  nodeWidth: number
  // width of the detail panel on wide screens, px
  panelWidth: number
  card: CardStyle
  radius: Radius
  spacing: Spacing
  // summary lines shown on a card; 0 shows the whole summary
  clamp: number
  // zoom of the detail panel content
  detailScale: number
}

export const STYLE_DEFAULTS: StylePrefs = {
  nodeWidth: 224,
  panelWidth: 400,
  card: "layered",
  radius: "small",
  spacing: "normal",
  clamp: 3,
  detailScale: 1,
}
export const NODE_WIDTH_RANGE = { min: 176, max: 360 }
export const PANEL_WIDTH_MIN = 300
// the detail panel leaves the tree at least this much of the window
export const CANVAS_MIN = 360

const RADIUS_VALUE: Record<Radius, string> = {
  none: "0px",
  small: "0.5rem",
  large: "1rem",
}
const SPACING_VALUE: Record<Spacing, { x: string; y: string }> = {
  compact: { x: "0.2rem", y: "0.5rem" },
  normal: { x: "0.4rem", y: "0.75rem" },
  loose: { x: "0.8rem", y: "1.25rem" },
}
// where a nested card meets its connector: the middle of the layered header, or the
// level line of a flat card
const ELBOW_TOP: Record<CardStyle, string> = {
  layered: "0.875rem",
  flat: "1.25rem",
}

type ThemeState = {
  mode: Mode
  accent: Accent
  style: StylePrefs
  setMode: (mode: Mode) => void
  setAccent: (accent: Accent) => void
  setStyle: (patch: Partial<StylePrefs>) => void
  resetStyle: () => void
}

// index.html applies the saved mode and accent before first paint; keep its keys in sync.
const MODE_KEY = `${APP_ID}:mode`
const ACCENT_KEY = `${APP_ID}:accent`
const STYLE_KEY = `${APP_ID}:style`
const DARK_QUERY = "(prefers-color-scheme: dark)"

const ThemeContext = React.createContext<ThemeState | undefined>(undefined)

function readChoice<T extends string>(key: string, values: T[], fallback: T) {
  const v = readStorage(key)
  return values.includes(v as T) ? (v as T) : fallback
}

// keeps only stored fields that still have the type of the default
function readStyle(): StylePrefs {
  try {
    const stored = JSON.parse(readStorage(STYLE_KEY) ?? "{}")
    const out = { ...STYLE_DEFAULTS }
    for (const k of Object.keys(out) as (keyof StylePrefs)[])
      if (typeof stored[k] === typeof out[k])
        (out as Record<string, unknown>)[k] = stored[k]
    return out
  } catch {
    return { ...STYLE_DEFAULTS }
  }
}

function resolveMode(mode: Mode) {
  if (mode !== "system") return mode
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light"
}

function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      !!target.closest("input, textarea, select, [contenteditable='true']"))
  )
}

// switching tokens should not animate every transition on the page
function withoutTransitions(apply: () => void) {
  const style = document.createElement("style")
  style.textContent =
    "*,*::before,*::after{-webkit-transition:none!important;transition:none!important}"
  document.head.appendChild(style)
  apply()
  window.getComputedStyle(document.body)
  requestAnimationFrame(() => requestAnimationFrame(() => style.remove()))
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = React.useState<Mode>(() =>
    readChoice(MODE_KEY, MODES, "system")
  )
  const [accent, setAccentState] = React.useState<Accent>(() =>
    readChoice(ACCENT_KEY, ACCENTS, "kumo")
  )
  const [style, setStyleState] = React.useState<StylePrefs>(readStyle)

  const setMode = React.useCallback((next: Mode) => {
    writeStorage(MODE_KEY, next)
    setModeState(next)
  }, [])
  const setAccent = React.useCallback((next: Accent) => {
    writeStorage(ACCENT_KEY, next)
    setAccentState(next)
  }, [])
  const setStyle = React.useCallback(
    (patch: Partial<StylePrefs>) =>
      setStyleState((prev) => ({ ...prev, ...patch })),
    []
  )
  const resetStyle = React.useCallback(
    () => setStyleState({ ...STYLE_DEFAULTS }),
    []
  )

  React.useEffect(() => writeStorage(STYLE_KEY, JSON.stringify(style)), [style])

  React.useLayoutEffect(() => {
    const root = document.documentElement
    const apply = () =>
      withoutTransitions(() =>
        root.setAttribute("data-mode", resolveMode(mode))
      )
    apply()
    if (mode !== "system") return
    const mq = window.matchMedia(DARK_QUERY)
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [mode])

  React.useLayoutEffect(() => {
    withoutTransitions(() =>
      document.documentElement.setAttribute("data-theme", accent)
    )
  }, [accent])

  React.useLayoutEffect(() => {
    const s = document.documentElement.style
    s.setProperty("--node-width", `${style.nodeWidth}px`)
    s.setProperty("--card-radius", RADIUS_VALUE[style.radius])
    s.setProperty("--tree-gap-x", SPACING_VALUE[style.spacing].x)
    s.setProperty("--tree-gap-y", SPACING_VALUE[style.spacing].y)
    s.setProperty("--elbow-top", ELBOW_TOP[style.card])
  }, [style])

  // d toggles light and dark
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return
      if (isEditableTarget(e.target) || e.key.toLowerCase() !== "d") return
      setMode(resolveMode(mode) === "dark" ? "light" : "dark")
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [mode, setMode])

  // keep several open copies of the page in step
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === MODE_KEY)
        setModeState(readChoice(MODE_KEY, MODES, "system"))
      if (e.key === ACCENT_KEY)
        setAccentState(readChoice(ACCENT_KEY, ACCENTS, "kumo"))
      if (e.key === STYLE_KEY) setStyleState(readStyle())
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const value = React.useMemo(
    () => ({ mode, accent, style, setMode, setAccent, setStyle, resetStyle }),
    [mode, accent, style, setMode, setAccent, setStyle, resetStyle]
  )
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
