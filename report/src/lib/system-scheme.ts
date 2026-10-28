// The "system" light/dark mode: the OS preference, unless a host page stands in for it. The
// gallery (showcase/) shows each template in an iframe and passes its own mode as the system one,
// first as ?scheme=light|dark on the frame URL (index.html reads it before first paint) and then
// in messages whenever it changes. Only a "system" theme choice follows it.

export type Scheme = "light" | "dark"

export const SCHEME_PARAM = "scheme"
export const SCHEME_MESSAGE = "frontier:scheme"

const DARK_QUERY = "(prefers-color-scheme: dark)"
const isScheme = (v: unknown): v is Scheme => v === "light" || v === "dark"

let hostScheme: Scheme | null = null
const listeners = new Set<() => void>()

if (typeof window !== "undefined" && window.parent !== window) {
  const param = new URLSearchParams(window.location.search).get(SCHEME_PARAM)
  if (isScheme(param)) hostScheme = param
  window.addEventListener("message", (e: MessageEvent) => {
    if (e.source !== window.parent) return
    const { type, scheme } = e.data ?? {}
    if (type !== SCHEME_MESSAGE || !isScheme(scheme) || scheme === hostScheme)
      return
    hostScheme = scheme
    listeners.forEach((l) => l())
  })
}

export function systemScheme(): Scheme {
  if (hostScheme) return hostScheme
  if (typeof window === "undefined") return "light"
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light"
}

/** Notifies when the OS preference or the host's stand-in for it changes. */
export function subscribeSystemScheme(listener: () => void) {
  listeners.add(listener)
  const media = window.matchMedia(DARK_QUERY)
  const onMedia = () => {
    if (!hostScheme) listener()
  }
  media.addEventListener("change", onMedia)
  return () => {
    listeners.delete(listener)
    media.removeEventListener("change", onMedia)
  }
}
