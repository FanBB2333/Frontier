import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { DECK } from "@/slides"
import { Backdrop, SectionHeader } from "./chrome"
import { useT } from "@/lib/i18n"
import { CANVAS_H, CANVAS_W } from "./canvas"
import { DeckMotionContext, EASE_OUT } from "./motion"
import type { SlideDef } from "./types"
import { StaticThread } from "./Thread"
import { cn } from "@/lib/utils"

function Thumbnail({ slide, index }: { slide: SlideDef; index: number }) {
  const box = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.2)
  useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(() => setScale(el.clientWidth / CANVAS_W))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div
      ref={box}
      className="pointer-events-none relative aspect-video w-full overflow-hidden"
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          transform: `scale(${scale})`,
        }}
      >
        <DeckMotionContext.Provider value={{ dir: 1, isStatic: true }}>
          <Backdrop index={index} section={slide.section} isStatic />
          <StaticThread
            shape={slide.thread(0)}
            idPrefix={`thumb-${slide.id}`}
          />
          <motion.div
            data-slide-root=""
            className="absolute inset-0"
            initial={false}
            animate="center"
          >
            <slide.Component stage={0} />
          </motion.div>
          <SectionHeader section={slide.section} isStatic />
        </DeckMotionContext.Provider>
      </div>
    </div>
  )
}

export function Overview({
  open,
  current,
  onClose,
  onPick,
}: {
  open: boolean
  current: number
  onClose: () => void
  onPick: (index: number) => void
}) {
  const t = useT()
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-40 overflow-y-auto bg-background/88 backdrop-blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          onPointerDown={(e) => {
            e.stopPropagation()
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-8 p-8 sm:grid-cols-2 sm:p-12 lg:grid-cols-3">
            {DECK.slides.map((slide, i) => {
              const section = slide.section
                ? DECK.sections[slide.section]
                : null
              return (
                <motion.button
                  key={slide.id}
                  type="button"
                  className={cn(
                    "group flex flex-col gap-3 rounded-2xl p-2 text-left transition-colors outline-none hover:bg-foreground/5 focus-visible:ring-3 focus-visible:ring-ring",
                    i === current && "bg-foreground/5 ring-2 ring-primary"
                  )}
                  initial={{ opacity: 0, y: 24, scale: 0.96 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      delay: i * 0.035,
                      duration: 0.5,
                      ease: EASE_OUT,
                    },
                  }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  onClick={() => onPick(i)}
                >
                  <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10 transition-transform duration-300 group-hover:scale-[1.015]">
                    <Thumbnail slide={slide} index={i} />
                  </div>
                  <div className="flex items-baseline gap-3 px-1 text-sm">
                    <span className="font-mono text-muted-foreground tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate font-medium">
                      {section
                        ? [section.marker, t(section.title)]
                            .filter(Boolean)
                            .join(" ")
                        : slide.label
                          ? t(slide.label)
                          : DECK.title}
                    </span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
