import {
  createContext,
  useContext,
  useMemo,
  type CSSProperties,
  type ReactNode,
} from "react"
import { motion, type Variants } from "motion/react"
import { cn } from "@/lib/utils"
import type { Rect } from "./canvas"

export type Bezier = [number, number, number, number]
export const EASE_OUT: Bezier = [0.22, 1, 0.36, 1]
export const EASE_IN_OUT: Bezier = [0.65, 0, 0.35, 1]

/** Delay before incoming content starts, so it lands after the thread has begun to morph. */
export const ENTER_DELAY = 0.32

type DeckMotion = { dir: number; isStatic: boolean }
export const DeckMotionContext = createContext<DeckMotion>({
  dir: 1,
  isStatic: false,
})
export const useDeckMotion = () => useContext(DeckMotionContext)

/** Variants shared by every revealed element; `custom` is the element's order on the page. */
export function useRevealVariants(distance = 28): Variants {
  const { dir } = useDeckMotion()
  const d = dir === 0 ? 1 : dir
  return useMemo<Variants>(
    () => ({
      enter: { opacity: 0, y: distance * d, filter: "blur(10px)" },
      center: (i: number) => ({
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
          delay: ENTER_DELAY + i * 0.07,
          duration: 0.8,
          ease: EASE_OUT,
        },
      }),
      exit: (i: number) => ({
        opacity: 0,
        y: -16 * d,
        filter: "blur(8px)",
        transition: { delay: i * 0.02, duration: 0.3, ease: "easeIn" },
      }),
    }),
    [d, distance]
  )
}

export function Reveal({
  i = 0,
  className,
  style,
  children,
}: {
  i?: number
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  const variants = useRevealVariants()
  return (
    <motion.div
      className={className}
      style={style}
      custom={i}
      variants={variants}
    >
      {children}
    </motion.div>
  )
}

/** Opens an image in the full-size viewer (the Deck owns the viewer). */
export type ZoomTarget = { src: string; alt: string }
export const ZoomContext = createContext<((target: ZoomTarget) => void) | null>(
  null
)

/** An image that opens from its centre while the thread draws its frame. */
export function RevealImage({
  src,
  rect,
  i = 0,
  alt = "",
}: {
  src: string
  rect: Rect
  i?: number
  alt?: string
}) {
  const zoom = useContext(ZoomContext)
  const frame: Variants = {
    enter: { clipPath: "inset(46% 46% 46% 46% round 28px)", opacity: 0 },
    center: {
      clipPath: "inset(0% 0% 0% 0% round 18px)",
      opacity: 1,
      transition: { delay: 0.5 + i * 0.06, duration: 1.05, ease: EASE_OUT },
    },
    exit: {
      clipPath: "inset(46% 46% 46% 46% round 28px)",
      opacity: 0,
      transition: { duration: 0.4, ease: EASE_IN_OUT },
    },
  }
  const settle: Variants = {
    enter: { scale: 1.14 },
    center: {
      scale: 1,
      transition: { delay: 0.5 + i * 0.06, duration: 1.4, ease: EASE_OUT },
    },
    exit: { scale: 1.06, transition: { duration: 0.4 } },
  }
  return (
    <motion.div
      className={cn(
        "absolute overflow-hidden rounded-[18px] bg-white shadow-(--image-shadow) ring-1 ring-foreground/8",
        zoom && "cursor-zoom-in"
      )}
      style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
      variants={frame}
      onClick={zoom ? () => zoom({ src, alt }) : undefined}
    >
      <motion.img
        src={src}
        alt={alt}
        draggable={false}
        className="size-full object-contain"
        variants={settle}
      />
    </motion.div>
  )
}

/** Text with an emphasised lead and the remainder of the sentence, both verbatim. */
export function Lead({
  lead,
  rest,
  className,
}: {
  lead: string
  rest?: string
  className?: string
}) {
  return (
    <span className={className}>
      <Emphasis>{lead}</Emphasis>
      {rest ? <span className="text-foreground/72">{rest}</span> : null}
    </span>
  )
}

/** A restrained highlight that follows the active deck theme. */
export function Emphasis({ children }: { children: ReactNode }) {
  return (
    <strong className="font-bold text-foreground underline decoration-signal/70 decoration-[0.09em] underline-offset-[0.2em]">
      {children}
    </strong>
  )
}

/** Emphasise one selected phrase without changing the surrounding text. */
export function HighlightText({
  text,
  phrase,
}: {
  text: string
  phrase: string
}) {
  const index = text.indexOf(phrase)
  if (index < 0 || !phrase) return <>{text}</>
  return (
    <>
      {text.slice(0, index)}
      <Emphasis>{phrase}</Emphasis>
      {text.slice(index + phrase.length)}
    </>
  )
}

export function ExternalLink({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children?: ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "font-mono text-link underline decoration-link/35 underline-offset-[6px] transition-colors hover:decoration-link",
        className
      )}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {children ?? href}
    </a>
  )
}
