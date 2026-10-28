import { AnimatePresence, motion } from "motion/react"
import { DECK } from "@/slides"
import { useLang } from "@/lib/i18n"
import { EASE_IN_OUT, EASE_OUT } from "./motion"
import { cn } from "@/lib/utils"

/** Section marker + title, persistent across the pages of one section; letters roll when it (or the language) changes. */
export function SectionHeader({
  section,
  isStatic = false,
}: {
  section: string | null
  isStatic?: boolean
}) {
  const lang = useLang()
  return (
    <div className="pointer-events-none absolute top-[70px] left-[128px] h-[110px] w-[1400px]">
      <AnimatePresence initial={!isStatic}>
        {section ? (
          <motion.div
            key={`${section}-${lang}`}
            className="absolute inset-0 flex items-baseline gap-6"
            initial={isStatic ? false : "enter"}
            animate="center"
            exit="exit"
          >
            {DECK.sections[section].marker ? (
              <Roll
                text={DECK.sections[section].marker!}
                className="font-mono text-[30px] font-medium text-signal"
                delay={0.05}
              />
            ) : null}
            <Roll
              text={DECK.sections[section].title[lang]}
              className="text-[60px] font-semibold tracking-[-0.03em] text-foreground"
              delay={0.12}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function Roll({
  text,
  className,
  delay,
}: {
  text: string
  className?: string
  delay: number
}) {
  return (
    <span
      className={cn(
        "relative inline-flex overflow-hidden pb-[0.12em] leading-none",
        className
      )}
      aria-label={text}
    >
      {Array.from(text).map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="inline-block whitespace-pre"
          variants={{
            enter: { y: "110%", rotate: 8, opacity: 0 },
            center: {
              y: "0%",
              rotate: 0,
              opacity: 1,
              transition: {
                delay: delay + i * 0.028,
                duration: 0.7,
                ease: EASE_OUT,
              },
            },
            exit: {
              y: "-110%",
              rotate: -6,
              opacity: 0,
              transition: {
                delay: i * 0.012,
                duration: 0.34,
                ease: EASE_IN_OUT,
              },
            },
          }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  )
}

const GLOWS = [
  { a: [1380, 520], b: [260, 980] },
  { a: [1480, 260], b: [120, 760] },
  { a: [1100, 900], b: [420, 160] },
  { a: [1640, 660], b: [300, 420] },
  { a: [980, 240], b: [1600, 980] },
  { a: [1500, 820], b: [200, 220] },
]

export function Backdrop({
  index,
  section,
  isStatic = false,
}: {
  index: number
  section: string | null
  isStatic?: boolean
}) {
  const glow = GLOWS[index % GLOWS.length]
  const spring = isStatic
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 26, damping: 18 }
  const numeral = section
    ? DECK.sections[section].marker?.replace(".", "")
    : undefined
  return (
    <div className="absolute inset-0 overflow-hidden bg-background">
      <motion.div
        className="absolute size-[1100px] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklch, var(--signal) var(--glow), transparent), transparent)",
        }}
        initial={false}
        animate={{ x: glow.a[0] - 550, y: glow.a[1] - 550 }}
        transition={spring}
      />
      <motion.div
        className="absolute size-[1000px] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklch, var(--signal-2) var(--glow), transparent), transparent)",
        }}
        initial={false}
        animate={{ x: glow.b[0] - 500, y: glow.b[1] - 500 }}
        transition={spring}
      />
      <motion.div
        className="absolute -inset-[400px] dot-grid"
        initial={false}
        animate={{ x: -index * 26, y: -index * 9 }}
        transition={spring}
      />
      <AnimatePresence initial={false}>
        {numeral ? (
          <motion.div
            key={numeral}
            className="absolute right-[40px] bottom-[-150px] font-mono text-[680px] leading-none font-semibold text-outline select-none"
            initial={{ opacity: 0, y: 160, filter: "blur(20px)" }}
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 1.4, ease: EASE_OUT, delay: 0.2 },
            }}
            exit={{
              opacity: 0,
              y: -120,
              filter: "blur(16px)",
              transition: { duration: 0.6, ease: EASE_IN_OUT },
            }}
          >
            {numeral}
          </motion.div>
        ) : null}
      </AnimatePresence>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,var(--vignette))]" />
    </div>
  )
}

/** Rolling digits for the page counter. */
function Digits({ value, width }: { value: number; width: number }) {
  const chars = String(value).padStart(width, "0").split("")
  return (
    <span className="inline-flex tabular-nums">
      {chars.map((c, i) => (
        <span
          key={i}
          className="relative inline-block h-[1.2em] w-[0.62em] overflow-hidden"
        >
          <motion.span
            className="absolute inset-x-0 top-0 flex flex-col items-center"
            initial={false}
            animate={{ y: `${-Number(c) * 1.2}em` }}
            transition={{ type: "spring", stiffness: 140, damping: 20 }}
          >
            {Array.from({ length: 10 }, (_, d) => (
              <span key={d} className="h-[1.2em] leading-[1.2em]">
                {d}
              </span>
            ))}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

export function Footer({
  index,
  total,
  stage,
  stages,
}: {
  index: number
  total: number
  stage: number
  stages: number
}) {
  const progress =
    total > 1 ? (index + (stages > 1 ? stage / stages : 0)) / (total - 1) : 1
  return (
    <>
      <div className="pointer-events-none absolute right-[128px] bottom-[30px] left-[128px] flex items-center justify-between font-mono text-[17px] text-muted-foreground">
        <span className="tracking-wide">{DECK.title}</span>
        <div className="flex items-center gap-6">
          {stages > 1 ? (
            <div className="flex items-center gap-2">
              {Array.from({ length: stages }, (_, s) => (
                <motion.span
                  key={s}
                  className="block h-[6px] rounded-full bg-foreground"
                  initial={false}
                  animate={{
                    width: s === stage ? 26 : 6,
                    opacity: s === stage ? 0.9 : 0.25,
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                />
              ))}
            </div>
          ) : null}
          <span className="flex items-center gap-2 text-foreground/80">
            <Digits value={index + 1} width={2} />
            <span className="text-muted-foreground/60">/</span>
            <Digits value={total} width={2} />
          </span>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-foreground/6">
        <motion.div
          className="h-full origin-left bg-gradient-to-r from-signal to-signal-2"
          initial={false}
          animate={{ scaleX: Math.min(1, progress) }}
          transition={{ type: "spring", stiffness: 60, damping: 18 }}
        />
      </div>
    </>
  )
}
