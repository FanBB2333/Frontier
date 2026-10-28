import { useCallback, useEffect, useRef, useState } from "react"
import {
  AnimatePresence,
  MotionConfig,
  motion,
  type Variants,
} from "motion/react"
import { DECK } from "@/slides"
import { otherLang, setLang, useLang } from "@/lib/i18n"
import { nextTheme, type ThemeId } from "@/lib/theme"
import { useTheme } from "@/hooks/use-theme"
import { CANVAS_H, CANVAS_W } from "./canvas"
import { Backdrop, Footer, SectionHeader } from "./chrome"
import { Lightbox } from "./Lightbox"
import { DeckMotionContext, ZoomContext, type ZoomTarget } from "./motion"
import { Overview } from "./Overview"
import { Thread } from "./Thread"
import { Toolbar } from "./Toolbar"

type Position = { index: number; stage: number; dir: number }

const SLIDES = DECK.slides
const last = SLIDES.length - 1
const clampIndex = (i: number) => Math.max(0, Math.min(last, i))

function readHash(): number {
  const m = window.location.hash.match(/^#\/(\d+)/)
  return m ? clampIndex(Number(m[1]) - 1) : 0
}

function useFitScale() {
  const calc = () =>
    Math.min(window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H)
  const [scale, setScale] = useState(calc)
  useEffect(() => {
    const onResize = () => setScale(calc())
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])
  return scale
}

const slideVariants: Variants = {
  enter: { opacity: 1 },
  center: { opacity: 1 },
  exit: {
    opacity: 0,
    pointerEvents: "none",
    transition: { duration: 0.5, ease: "easeIn" },
  },
}

export function Deck() {
  const [pos, setPos] = useState<Position>(() => ({
    index: readHash(),
    stage: 0,
    dir: 0,
  }))
  const [overview, setOverview] = useState(false)
  const [help, setHelp] = useState(false)
  const [idle, setIdle] = useState(false)
  const [zoom, setZoom] = useState<ZoomTarget | null>(null)
  const scale = useFitScale()
  const { resolved, setTheme } = useTheme()
  const theme = resolved.id as ThemeId
  const lang = useLang()
  const toggleLang = useCallback(() => setLang(otherLang(lang)), [lang])

  const slide = SLIDES[pos.index]

  const next = useCallback(() => {
    setPos((p) => {
      if (p.stage < SLIDES[p.index].stages - 1)
        return { ...p, stage: p.stage + 1, dir: 1 }
      if (p.index < last) return { index: p.index + 1, stage: 0, dir: 1 }
      return p
    })
  }, [])
  const prev = useCallback(() => {
    setPos((p) => {
      if (p.stage > 0) return { ...p, stage: p.stage - 1, dir: -1 }
      if (p.index > 0)
        return {
          index: p.index - 1,
          stage: SLIDES[p.index - 1].stages - 1,
          dir: -1,
        }
      return p
    })
  }, [])
  const goTo = useCallback((index: number, stage = 0) => {
    setPos((p) => {
      const i = clampIndex(index)
      if (i === p.index && stage === p.stage) return p
      return {
        index: i,
        stage,
        dir:
          i === p.index ? Math.sign(stage - p.stage) : Math.sign(i - p.index),
      }
    })
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen()
    else document.documentElement.requestFullscreen()
  }, [])

  // Hash <-> position.
  useEffect(() => {
    const target = `#/${pos.index + 1}`
    if (window.location.hash !== target)
      window.history.replaceState(null, "", target)
  }, [pos.index])
  useEffect(() => {
    const onHash = () => goTo(readHash())
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [goTo])

  // Keyboard.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (help || zoom || e.metaKey || e.ctrlKey || e.altKey) return
      // Menus and dialogs handle their own keys.
      if (
        e.target instanceof Element &&
        e.target.closest('[role="menu"],[role="dialog"]')
      )
        return
      const key = e.key
      if (overview) {
        if (key === "Escape" || key === "o" || key === "O") setOverview(false)
        return
      }
      if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(key))
        next()
      else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(key))
        prev()
      else if (key === "Home") goTo(0)
      else if (key === "End") goTo(last, SLIDES[last].stages - 1)
      else if (key === "o" || key === "O" || key === "Escape")
        setOverview(key !== "Escape")
      else if (key === "f" || key === "F") toggleFullscreen()
      else if (key === "?") setHelp(true)
      else if (key === "t" || key === "T")
        setTheme(nextTheme(theme), {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        })
      else if (key === "l" || key === "L") toggleLang()
      else return
      e.preventDefault()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [
    help,
    zoom,
    overview,
    next,
    prev,
    goTo,
    toggleFullscreen,
    theme,
    setTheme,
    toggleLang,
  ])

  // Toolbar and cursor hide after a short idle period.
  const idleTimer = useRef<number | undefined>(undefined)
  const wake = useCallback(() => {
    setIdle(false)
    window.clearTimeout(idleTimer.current)
    idleTimer.current = window.setTimeout(() => setIdle(true), 2600)
  }, [])
  useEffect(() => {
    idleTimer.current = window.setTimeout(() => setIdle(true), 2600)
    return () => window.clearTimeout(idleTimer.current)
  }, [])

  // Touch swipe.
  const touch = useRef<{ x: number; y: number } | null>(null)

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="fixed inset-0 overflow-hidden bg-canvas select-none"
        style={{ cursor: idle && !overview ? "none" : undefined }}
        onPointerMove={wake}
        onPointerDown={(e) => {
          wake()
          if (e.pointerType === "touch")
            touch.current = { x: e.clientX, y: e.clientY }
        }}
        onPointerUp={(e) => {
          const start = touch.current
          touch.current = null
          if (!start) return
          const dx = e.clientX - start.x
          const dy = e.clientY - start.y
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy))
            (dx < 0 ? next : prev)()
        }}
      >
        <div
          className="absolute top-1/2 left-1/2 overflow-hidden ring-1 ring-foreground/5"
          style={{
            width: CANVAS_W,
            height: CANVAS_H,
            transform: `translate(-50%, -50%) scale(${scale})`,
          }}
        >
          <DeckMotionContext.Provider value={{ dir: pos.dir, isStatic: false }}>
            <Backdrop index={pos.index} section={slide.section} />
            <Thread shape={slide.thread(pos.stage)} dir={pos.dir} />
            {/* Keyed by language too: switching re-runs the page's own exit/enter choreography. */}
            <ZoomContext.Provider value={setZoom}>
              <AnimatePresence>
                <motion.div
                  key={`${slide.id}-${lang}`}
                  data-slide-root=""
                  className="absolute inset-0"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <slide.Component stage={pos.stage} />
                </motion.div>
              </AnimatePresence>
            </ZoomContext.Provider>
            <SectionHeader section={slide.section} />
            <Footer
              index={pos.index}
              total={SLIDES.length}
              stage={pos.stage}
              stages={slide.stages}
            />
          </DeckMotionContext.Provider>
        </div>

        <Toolbar
          visible={!idle && !overview}
          index={pos.index}
          total={SLIDES.length}
          onPrev={prev}
          onNext={next}
          onOverview={() => setOverview(true)}
          onFullscreen={toggleFullscreen}
          help={help}
          onHelpChange={setHelp}
          theme={theme}
          onTheme={setTheme}
          onLang={toggleLang}
        />
        <Lightbox target={zoom} onClose={() => setZoom(null)} />
        <Overview
          open={overview}
          current={pos.index}
          onClose={() => setOverview(false)}
          onPick={(i) => {
            setOverview(false)
            goTo(i)
          }}
        />
      </div>
    </MotionConfig>
  )
}
