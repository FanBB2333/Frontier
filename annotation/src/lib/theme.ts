// Color themes. Each palette lives in index.css under `:root[data-theme="…"]`; this file names
// them, applies the choice and remembers it. index.html applies the saved theme inline before
// first paint, so keep its storage key and theme ids in sync with this file.

import { APP_ID } from "@/lib/app"
import { subscribeSystemScheme, systemScheme } from "@/lib/system-scheme"

export type ThemeMode = "light" | "dark"
export type ThemeDef = {
  id: string
  mode: ThemeMode
  swatch?: readonly [string, string, string]
}

// "system" resolves to the first theme of the system mode (see system-scheme.ts).
export const THEMES = [
  { id: "light", mode: "light" },
  { id: "dark", mode: "dark" },
] as const satisfies readonly ThemeDef[]

export type ThemeId = (typeof THEMES)[number]["id"]
export type ThemeChoice = ThemeId | "system"

export const nextTheme = (id: ThemeId): ThemeId =>
  THEMES[(THEMES.findIndex((t) => t.id === id) + 1) % THEMES.length].id

export const DEFAULT_THEME: ThemeChoice = "light"
const STORAGE_KEY = `${APP_ID}:theme`

const isChoice = (v: unknown): v is ThemeChoice =>
  v === "system" || THEMES.some((t) => t.id === v)

export function readTheme(): ThemeChoice {
  if (typeof window === "undefined") return DEFAULT_THEME
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (isChoice(saved)) return saved
  } catch {
    // Storage can be unavailable (private mode, blocked site data); fall back to the default.
  }
  return DEFAULT_THEME
}

export function resolveTheme(choice: ThemeChoice): ThemeDef {
  if (choice !== "system")
    return THEMES.find((t) => t.id === choice) ?? THEMES[0]
  const mode = systemScheme()
  return THEMES.find((t) => t.mode === mode) ?? THEMES[0]
}

export function applyTheme(choice: ThemeChoice) {
  const theme = resolveTheme(choice)
  const root = document.documentElement
  root.dataset.theme = theme.id
  root.classList.toggle("dark", theme.mode === "dark")
  root.style.colorScheme = theme.mode
}

const listeners = new Set<() => void>()

export function setTheme(choice: ThemeChoice) {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice)
  } catch {
    // Not persisted; the theme still applies for this session.
  }
  applyTheme(choice)
  listeners.forEach((l) => l())
}

/** Notifies on local changes, changes from other tabs and system mode changes (for "system"). */
export function subscribeTheme(listener: () => void) {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return
    applyTheme(readTheme())
    listener()
  }
  const unsubscribeSystem = subscribeSystemScheme(() => {
    if (readTheme() !== "system") return
    applyTheme("system")
    listener()
  })
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
    unsubscribeSystem()
  }
}
