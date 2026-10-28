import { useEffect, useRef, useState, type ReactNode } from "react"
import { CheckIcon, CopyIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLang, useT, type Text } from "@/lib/i18n"
import { UI } from "./content"

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("size-6 text-primary", className)}
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="3.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M8.5 9v11"
        className="stroke-muted-foreground"
        strokeWidth="1.4"
        strokeDasharray="2.2 1.6"
      />
      <circle cx="6" cy="6.5" r=".9" fill="currentColor" />
    </svg>
  )
}

export function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className={cn("size-4", className)}
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

export function Wrap({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn("mx-auto w-[min(1160px,100%-32px)]", className)}>
      {children}
    </div>
  )
}

/** Eyebrow, a two-tone serif heading and an optional lead paragraph. */
export function SectionHead({
  eyebrow,
  title,
  dim,
  lead,
  center,
}: {
  eyebrow: Text
  title: Text
  dim: Text
  lead?: Text
  center?: boolean
}) {
  const t = useT()
  const lang = useLang()
  return (
    <div className={cn("relative", center && "text-center")}>
      <span className="text-[12.5px] font-semibold tracking-[0.14em] text-primary uppercase">
        {t(eyebrow)}
      </span>
      <h2
        className={cn(
          "mt-3.5 max-w-[780px] font-serif text-[clamp(34px,4.8vw,56px)] leading-[1.06] tracking-[-0.02em]",
          center && "mx-auto"
        )}
      >
        {t(title)}
        {lang === "en" ? " " : ""}
        <span className="text-muted-foreground">{t(dim)}</span>
      </h2>
      {lead && (
        <p className="mt-4 max-w-[640px] text-[17px] text-body">{t(lead)}</p>
      )}
    </div>
  )
}

export function Section({
  id,
  children,
  className,
}: {
  id?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative scroll-mt-16 border-b py-[72px] md:py-[104px]",
        className
      )}
    >
      <Wrap>{children}</Wrap>
    </section>
  )
}

export function Card({
  className,
  children,
  style,
}: {
  className?: string
  children: ReactNode
  style?: React.CSSProperties
}) {
  return (
    <article
      data-reveal=""
      style={style}
      className={cn(
        "relative min-w-0 rounded-xl border bg-card p-6 shadow-soft transition-[border-color,box-shadow] hover:border-border-strong hover:shadow-card",
        className
      )}
    >
      {children}
    </article>
  )
}

export function Chip({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "rounded-full border border-primary-fill/40 bg-primary-fill/12 px-2.5 py-[7px] font-mono text-[12.5px] leading-none whitespace-nowrap text-primary",
        className
      )}
    >
      {children}
    </span>
  )
}

/** A code well with a copy button; lines starting with "$ " are shown as prompts but copied without it. */
export function CodePanel({
  code,
  label,
  className,
}: {
  code: string
  label?: string
  className?: string
}) {
  const t = useT()
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      timer.current = window.setTimeout(() => setCopied(false), 1400)
    } catch {
      // Clipboard blocked (insecure context or denied); the text stays selectable.
    }
  }
  return (
    <div className={cn("min-w-0 rounded-[14px] border bg-well", className)}>
      <div className="flex items-center gap-2 border-b px-3.5 py-2 text-[11.5px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
        {label ?? "Shell"}
        <button
          type="button"
          onClick={copy}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium tracking-normal normal-case transition-colors hover:bg-hover hover:text-foreground"
        >
          {copied ? (
            <CheckIcon className="size-3.5 text-ok" />
          ) : (
            <CopyIcon className="size-3.5" />
          )}
          {t(copied ? UI.copied : UI.copy)}
        </button>
      </div>
      <pre className="overflow-x-auto px-3.5 py-3 font-mono text-[13px] leading-[1.7] text-code">
        <code>
          {code.split("\n").map((line, i) => {
            const [text, comment] = line.split(/(?=\s+#)/)
            return (
              <span key={i} className="block">
                <span className="text-muted-foreground select-none">$ </span>
                {text}
                {comment && (
                  <span className="text-muted-foreground">{comment}</span>
                )}
              </span>
            )
          })}
        </code>
      </pre>
    </div>
  )
}

/**
 * Below-the-fold blocks marked `data-reveal` rise in as they scroll into view. Blocks visible
 * at load are left alone, so prerendered content never blinks.
 */
export function useScrollReveal() {
  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    )
      return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          e.target.classList.remove("reveal-pending")
          io.unobserve(e.target)
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    )
    const groups = new Map<Element, number>()
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) return
      // Siblings in one grid stagger by 60ms.
      const n = groups.get(el.parentElement!) ?? 0
      groups.set(el.parentElement!, n + 1)
      el.style.setProperty("--d", `${n * 60}ms`)
      el.classList.add("reveal", "reveal-pending")
      io.observe(el)
    })
    return () => io.disconnect()
  }, [])
}
