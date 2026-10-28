import type { ReactNode } from "react"

// Kumo has no key-cap component; this one is drawn with its tokens.
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-kumo-line bg-kumo-recessed px-1 font-sans text-[11px] font-medium text-kumo-subtle">
      {children}
    </kbd>
  )
}
