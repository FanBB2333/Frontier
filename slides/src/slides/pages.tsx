import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { COLON, useT, type Text } from "@/lib/i18n"
import {
  Emphasis,
  ExternalLink,
  HighlightText,
  Lead,
  Reveal,
  RevealImage,
  useDeckMotion,
  useRevealVariants,
} from "@/deck/motion"
import {
  ANATOMY,
  CHART,
  EXPORT,
  MOTION_RULES,
  REFERENCES,
  REGISTRY,
  SHORTCUTS,
  STEPS,
  THANKS,
  TITLE,
} from "./content"
import {
  ANATOMY_IMAGE,
  CODE_CARD,
  EXPORT_CARD,
  PLOT,
  PLOT_MAX,
  REF_ROWS,
  RULES_RING,
  SHORTCUT_TABLE,
  STEP_BOXES,
} from "./layout"

const Bullet = () => (
  <span className="mt-[0.66em] size-[11px] shrink-0 rotate-45 rounded-[2px] bg-signal" />
)

/** Inline `code` spans inside a translated sentence. */
function Code({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/).map((part, i) =>
        part.startsWith("`") ? (
          <code
            key={i}
            className="rounded-md bg-foreground/7 px-[0.3em] py-[0.05em] font-mono text-[0.86em]"
          >
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        )
      )}
    </>
  )
}

function Points({
  points,
  top,
  width,
  i0 = 1,
}: {
  points: { lead: Text; rest: Text }[]
  top: number
  width: number
  i0?: number
}) {
  const t = useT()
  return (
    <div
      role="list"
      className="absolute left-[128px] flex flex-col gap-10"
      style={{ top, width }}
    >
      {points.map((p, k) => (
        <Reveal key={k} i={i0 + k}>
          <div
            role="listitem"
            className="flex gap-6 text-[34px] leading-[1.55]"
          >
            <Bullet />
            <span>
              <Emphasis>{t(p.lead)}</Emphasis>
              <span className="text-foreground/72">
                <Code text={t(p.rest)} />
              </span>
            </span>
          </div>
        </Reveal>
      ))}
    </div>
  )
}

export function TitleSlide() {
  const t = useT()
  return (
    <>
      <Reveal
        i={0}
        className="absolute top-[260px] left-[132px] font-mono text-[36px] tracking-[0.12em] text-signal"
      >
        {t(TITLE.eyebrow)}
      </Reveal>
      {TITLE.lines.map((line, i) => (
        <Reveal
          key={i}
          i={i + 1}
          className="absolute left-[116px] text-[100px] leading-none font-semibold tracking-[-0.045em]"
          style={{ top: 340 + i * 140 }}
        >
          {t(line)}
        </Reveal>
      ))}
      <Reveal
        i={3}
        className="absolute top-[660px] left-[132px] text-[30px] text-muted-foreground"
      >
        {t(TITLE.sub)}
      </Reveal>
    </>
  )
}

export function AnatomySlide() {
  const t = useT()
  return (
    <>
      <Reveal
        i={0}
        className="absolute top-[222px] left-[128px] text-[44px] font-medium tracking-[-0.01em]"
      >
        {t(ANATOMY.heading)}
      </Reveal>
      <Points points={ANATOMY.points} top={330} width={820} />
      <RevealImage
        src={ANATOMY.image.src}
        rect={ANATOMY_IMAGE}
        alt={t(ANATOMY.alt)}
        i={1}
      />
    </>
  )
}

export function RegistrySlide() {
  const t = useT()
  return (
    <>
      <Reveal
        i={0}
        className="absolute top-[222px] left-[128px] text-[44px] font-medium tracking-[-0.01em]"
      >
        {t(REGISTRY.heading)}
      </Reveal>
      <Points points={REGISTRY.points} top={330} width={800} />
      <Reveal
        i={2}
        className="absolute overflow-hidden rounded-[18px] border border-foreground/10 bg-card/80 px-10 py-9 font-mono text-[25px] leading-[1.62] shadow-(--image-shadow) backdrop-blur"
        style={{
          left: CODE_CARD.x,
          top: CODE_CARD.y,
          width: CODE_CARD.w,
          height: CODE_CARD.h,
        }}
      >
        {REGISTRY.code.map((line, k) => (
          <div
            key={k}
            className={
              line.trimStart().startsWith("//")
                ? "text-muted-foreground"
                : "whitespace-pre"
            }
          >
            {line.includes('"')
              ? line.split(/("[^"]*")/).map((part, j) =>
                  part.startsWith('"') ? (
                    <span key={j} className="text-signal">
                      {part}
                    </span>
                  ) : (
                    part
                  )
                )
              : line}
          </div>
        ))}
      </Reveal>
    </>
  )
}

export function StepsSlide({ stage }: { stage: number }) {
  const t = useT()
  const { isStatic } = useDeckMotion()
  const variants = useRevealVariants()
  return (
    <>
      <Reveal
        i={0}
        className="absolute top-[222px] left-[128px] text-[44px] font-medium tracking-[-0.01em]"
      >
        {t(STEPS.heading)}
      </Reveal>
      <Reveal
        i={1}
        className="absolute top-[300px] left-[128px] w-[1500px] text-[32px] leading-[1.5] text-foreground/72"
      >
        {t(STEPS.lead)}
      </Reveal>
      <AnimatePresence>
        {STEPS.boxes.slice(0, stage + 1).map((box, k) => (
          <motion.div
            key={k}
            custom={k}
            variants={variants}
            initial={isStatic ? false : "enter"}
            animate="center"
            exit="exit"
            className="absolute flex items-center gap-6 rounded-[22px] border border-foreground/10 bg-card/70 px-8 text-[28px] leading-[1.4] shadow-(--image-shadow) backdrop-blur"
            style={{
              left: STEP_BOXES[k].x,
              top: STEP_BOXES[k].y,
              width: STEP_BOXES[k].w,
              height: STEP_BOXES[k].h,
            }}
          >
            <span className="font-mono text-[44px] font-semibold text-signal">
              {k + 1}
            </span>
            <span>
              <Code text={t(box)} />
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  )
}

export function MotionSlide() {
  const t = useT()
  const ring = RULES_RING
  return (
    <>
      <div className="absolute top-[222px] left-[128px] flex w-[1060px] flex-col">
        <Reveal
          i={0}
          className="text-[58px] leading-[1.2] font-semibold tracking-[-0.02em]"
        >
          <HighlightText
            text={t(MOTION_RULES.claim)}
            phrase={t(MOTION_RULES.phrase)}
          />
        </Reveal>
        <div className="mt-12 flex gap-8">
          {[MOTION_RULES.do, MOTION_RULES.avoid].map((card, k) => (
            <Reveal
              key={k}
              i={1 + k}
              className="flex w-[500px] flex-col gap-4 rounded-[22px] border border-foreground/10 bg-card/70 p-8 backdrop-blur"
            >
              <span
                className={
                  k === 0
                    ? "text-[30px] font-semibold text-signal"
                    : "text-[30px] font-semibold text-signal-2"
                }
              >
                {t(card.title)}
              </span>
              {card.items.map((item, j) => (
                <span key={j} className="flex gap-4 text-[26px] leading-[1.45]">
                  <span
                    className={
                      k === 0
                        ? "mt-[0.6em] h-[4px] w-6 shrink-0 rounded-full bg-signal"
                        : "mt-[0.6em] h-[4px] w-6 shrink-0 rounded-full bg-signal-2"
                    }
                  />
                  {t(item)}
                </span>
              ))}
            </Reveal>
          ))}
        </div>
      </div>
      <Reveal
        i={3}
        className="absolute flex items-center justify-center text-center text-[40px] leading-[1.25] font-semibold tracking-[-0.01em]"
        style={{
          left: ring.cx - ring.r + 50,
          top: ring.cy - ring.r + 50,
          width: (ring.r - 50) * 2,
          height: (ring.r - 50) * 2,
        }}
      >
        {t(MOTION_RULES.ring)}
      </Reveal>
    </>
  )
}

export function ChartSlide() {
  const t = useT()
  const { isStatic } = useDeckMotion()
  const [hover, setHover] = useState<number | null>(null)
  const band = (PLOT.x1 - PLOT.x0) / CHART.bars.length
  const barW = 56
  const y = (v: number) => PLOT.y1 - (v / PLOT_MAX) * (PLOT.y1 - PLOT.y0)
  const maxIndex = CHART.bars.reduce(
    (m, b, i, all) => (b.value > all[m].value ? i : m),
    0
  )
  const ticks = Array.from({ length: PLOT_MAX / 5 + 1 }, (_, i) => i * 5)
  return (
    <>
      <Reveal
        i={0}
        className="absolute top-[222px] left-[128px] text-[44px] font-medium tracking-[-0.01em]"
      >
        {t(CHART.heading)}
      </Reveal>
      <Reveal
        i={0}
        className="absolute top-[236px] right-[128px] text-[24px] text-muted-foreground"
      >
        {t(CHART.caption)}
      </Reveal>
      {ticks.map((v) => (
        <Reveal key={v} i={1} className="absolute" style={{ left: 0, top: 0 }}>
          {v > 0 && (
            <div
              className="absolute h-px bg-foreground/8"
              style={{ left: PLOT.x0, top: y(v), width: PLOT.x1 - PLOT.x0 }}
            />
          )}
          <span
            className="absolute w-[90px] text-right font-mono text-[22px] text-muted-foreground"
            style={{ left: PLOT.x0 - 110, top: y(v) - 15 }}
          >
            {v}
          </span>
        </Reveal>
      ))}
      <div
        role="img"
        aria-label={CHART.bars
          .map((b) => `${t(b.label)}${t(COLON)}${b.value}`)
          .join(", ")}
      >
        {CHART.bars.map((b, k) => {
          const cx = PLOT.x0 + band * (k + 0.5)
          const labeled = hover === null ? k === maxIndex : hover === k
          return (
            <div
              key={k}
              className="absolute"
              style={{
                left: cx - band / 2,
                top: PLOT.y0,
                width: band,
                height: PLOT.y1 - PLOT.y0,
              }}
              onPointerEnter={() => setHover(k)}
              onPointerLeave={() => setHover(null)}
            >
              <motion.div
                className="absolute bottom-0 origin-bottom rounded-t-[6px] bg-signal"
                style={{
                  left: band / 2 - barW / 2,
                  width: barW,
                  height: PLOT.y1 - y(b.value),
                  opacity: hover === null || hover === k ? 1 : 0.4,
                }}
                initial={isStatic ? false : { scaleY: 0 }}
                animate={{
                  scaleY: 1,
                  transition: {
                    delay: 0.5 + k * 0.08,
                    duration: 0.9,
                    ease: [0.22, 1, 0.36, 1],
                  },
                }}
              />
              {labeled && (
                <span
                  className="absolute w-full text-center font-mono text-[28px] font-semibold"
                  style={{ top: y(b.value) - PLOT.y0 - 46 }}
                >
                  {b.value}
                </span>
              )}
              <span
                className="absolute w-full text-center text-[24px] text-muted-foreground"
                style={{ top: PLOT.y1 - PLOT.y0 + 18 }}
              >
                {t(b.label)}
              </span>
            </div>
          )
        })}
      </div>
    </>
  )
}

export function ShortcutsSlide() {
  const t = useT()
  const tb = SHORTCUT_TABLE
  return (
    <>
      <Reveal
        i={0}
        className="absolute top-[222px] right-[128px] w-[560px] text-right text-[44px] leading-[1.25] font-medium tracking-[-0.01em]"
      >
        {t(SHORTCUTS.heading)}
      </Reveal>
      {SHORTCUTS.rows.map((row, k) => (
        <Reveal
          key={k}
          i={1 + k}
          className="absolute flex items-center"
          style={{
            left: tb.x,
            top: tb.y + 40 + k * tb.rowH,
            width: tb.w,
            height: tb.rowH,
          }}
        >
          <span className="flex gap-3" style={{ width: tb.keyColW - 40 }}>
            {row.keys.map((key) => (
              <kbd
                key={key}
                className="min-w-[64px] rounded-[12px] border border-b-4 border-foreground/15 bg-card px-4 py-1 text-center font-mono text-[28px] font-medium"
              >
                {key}
              </kbd>
            ))}
          </span>
          <span className="pl-10 text-[34px]">{t(row.label)}</span>
        </Reveal>
      ))}
    </>
  )
}

export function ExportSlide() {
  const t = useT()
  const card = EXPORT_CARD
  return (
    <>
      <Reveal
        i={0}
        className="absolute top-[222px] left-[128px] text-[44px] font-medium tracking-[-0.01em]"
      >
        {t(EXPORT.heading)}
      </Reveal>
      <Reveal
        i={1}
        className="absolute flex flex-col justify-center gap-5 rounded-[18px] border border-foreground/10 bg-card/80 px-12 font-mono shadow-(--image-shadow) backdrop-blur"
        style={{ left: card.x, top: card.y, width: card.w, height: card.h }}
      >
        <span className="text-[40px]">
          <span className="text-muted-foreground">$ </span>
          {EXPORT.command}
        </span>
        <span className="text-[28px] text-muted-foreground">
          → <span className="text-link">{EXPORT.output}</span>
        </span>
      </Reveal>
      <div
        role="list"
        className="absolute top-[610px] left-[128px] flex w-[1500px] flex-col gap-6"
      >
        {EXPORT.points.map((p, k) => (
          <Reveal key={k} i={2 + k}>
            <div
              role="listitem"
              className="flex gap-6 text-[32px] leading-[1.5]"
            >
              <Bullet />
              <Lead lead={t(p)} />
            </div>
          </Reveal>
        ))}
      </div>
    </>
  )
}

export function ReferencesSlide() {
  const t = useT()
  return (
    <>
      {REFERENCES.map((ref, k) => (
        <Reveal
          key={ref.url}
          i={k}
          className="absolute left-[236px] flex flex-col gap-3"
          style={{ top: REF_ROWS.top + k * REF_ROWS.step }}
        >
          <span className="text-[42px] leading-[56px] font-medium tracking-[-0.01em]">
            {t(ref.label)}
          </span>
          <ExternalLink href={ref.url} className="w-fit text-[22px]" />
        </Reveal>
      ))}
    </>
  )
}

export function ThanksSlide() {
  const t = useT()
  return (
    <>
      <Reveal
        i={0}
        className="absolute top-[260px] left-[132px] font-mono text-[36px] tracking-[0.12em] text-signal"
      >
        {t(THANKS.eyebrow)}
      </Reveal>
      <Reveal
        i={1}
        className="absolute top-[384px] left-[116px] text-[200px] leading-none font-semibold tracking-[-0.05em]"
      >
        {t(THANKS.word)}
        <span className="text-signal">.</span>
      </Reveal>
    </>
  )
}
