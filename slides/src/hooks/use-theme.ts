import { useCallback, useSyncExternalStore } from "react"
import { flushSync } from "react-dom"
import {
  DEFAULT_THEME,
  readTheme,
  resolveTheme,
  setTheme as storeTheme,
  subscribeTheme,
  type ThemeChoice,
} from "@/lib/theme"

export type Origin = { x: number; y: number }

/** Removes CSS transitions for one frame so a theme change does not animate every color. */
function freezeTransitions() {
  const style = document.createElement("style")
  style.textContent = "*,*::before,*::after{transition:none!important}"
  document.head.appendChild(style)
  return () => {
    window.getComputedStyle(document.body)
    requestAnimationFrame(() => requestAnimationFrame(() => style.remove()))
  }
}

/**
 * Current theme choice and a setter. With an `origin` the new theme is revealed as a circle
 * growing from that point (View Transitions, when the browser has them and motion is allowed).
 */
export function useTheme() {
  const theme = useSyncExternalStore(
    subscribeTheme,
    readTheme,
    () => DEFAULT_THEME
  )

  const setTheme = useCallback((choice: ThemeChoice, origin?: Origin) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!origin || reduce || !("startViewTransition" in document)) {
      const restore = freezeTransitions()
      storeTheme(choice)
      restore()
      return
    }
    const { x, y } = origin
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )
    const transition = document.startViewTransition(() =>
      flushSync(() => storeTheme(choice))
    )
    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 700,
          easing: "cubic-bezier(0.65, 0, 0.35, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      )
    })
  }, [])

  return { theme, resolved: resolveTheme(theme), setTheme }
}

/** Center of an element, as the origin of a theme reveal. */
export const originOf = (el: Element | null): Origin | undefined => {
  const r = el?.getBoundingClientRect()
  return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : undefined
}
