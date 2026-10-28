// UI language: every displayed string is a `Text` with an English and a Chinese version.
// English is the default; the choice is remembered per browser.

import { useCallback, useSyncExternalStore } from "react"
import { APP_ID } from "@/lib/app"

export type Lang = "en" | "zh"
export type Text = Record<Lang, string>

/** A string that reads the same in both languages (names, product terms). */
export const same = (s: string): Text => ({ en: s, zh: s })

export const DEFAULT_LANG: Lang = "en"
const STORAGE_KEY = `${APP_ID}:lang`
const HTML_LANG: Record<Lang, string> = { en: "en", zh: "zh-CN" }

export function readLang(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === "en" || saved === "zh") return saved
  } catch {
    // Storage can be unavailable (private mode, blocked site data); fall back to the default.
  }
  return DEFAULT_LANG
}

export function applyLang(lang: Lang) {
  document.documentElement.lang = HTML_LANG[lang]
}

const listeners = new Set<() => void>()

export function setLang(lang: Lang) {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // Not persisted; the language still applies for this session.
  }
  applyLang(lang)
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return
    applyLang(readLang())
    listener()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

export const otherLang = (lang: Lang): Lang => (lang === "en" ? "zh" : "en")

/** Current language; server rendering and hydration see DEFAULT_LANG. */
export const useLang = () =>
  useSyncExternalStore(subscribe, readLang, () => DEFAULT_LANG)

/** Picks the current language's string out of a `Text`. */
export function useT() {
  const lang = useLang()
  return useCallback((text: Text) => text[lang], [lang])
}

/** Colon after a label: full-width in Chinese, ": " in English. */
export const COLON: Text = { en: ": ", zh: "：" }
