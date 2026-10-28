import { useState } from "react"
import {
  ArrowRightIcon,
  LanguagesIcon,
  MoonIcon,
  NetworkIcon,
  PanelsTopLeftIcon,
  PresentationIcon,
  ScaleIcon,
  SquareCheckBigIcon,
  SunIcon,
  SunMoonIcon,
  TriangleAlertIcon,
  ZapIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { REPO_URL } from "@/lib/app"
import { otherLang, setLang, useLang, useT } from "@/lib/i18n"
import { originOf, useTheme } from "@/hooks/use-theme"
import {
  BASELINE,
  BRAND,
  COMPARE,
  CTA,
  FOOTER,
  HERO,
  LIMITS,
  NAV,
  QUICK_START,
  TEMPLATES,
  TERMINAL,
  UI,
  type TemplateId,
} from "./content"
import {
  Card,
  Chip,
  CodePanel,
  GithubIcon,
  LogoMark,
  Section,
  SectionHead,
  Wrap,
} from "./parts"

const TEMPLATE_ICONS = {
  annotation: SquareCheckBigIcon,
  slides: PresentationIcon,
  landing: PanelsTopLeftIcon,
  report: NetworkIcon,
}
const FACT_ICONS = [ScaleIcon, ZapIcon, SunMoonIcon]

const pillButton =
  "inline-flex items-center gap-2.5 rounded-full font-semibold tracking-[-0.005em] transition-[transform,background-color,box-shadow,border-color]"

export function Nav() {
  const t = useT()
  const lang = useLang()
  const { resolved, setTheme } = useTheme()
  return (
    <header className="sticky top-0 z-50 border-b bg-(--nav) backdrop-blur-[14px] backdrop-saturate-[1.4]">
      <Wrap className="flex h-[62px] items-center gap-6">
        <a
          href="#top"
          className="flex items-center gap-2.5 font-serif text-[19px] leading-none font-semibold tracking-[-0.01em]"
        >
          <LogoMark />
          {BRAND}
        </a>
        <nav aria-label="Primary" className="ml-auto hidden gap-0.5 md:flex">
          {NAV.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-[11px] py-1.5 text-sm text-body transition-colors hover:bg-hover hover:text-foreground"
            >
              {t(l.label)}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <button
            type="button"
            onClick={() => setLang(otherLang(lang))}
            aria-label={t(UI.lang)}
            title={t(UI.lang)}
            className="inline-flex h-[38px] items-center gap-1.5 rounded-full border border-border-strong bg-card px-3 text-[13px] font-medium text-body transition-colors hover:bg-muted hover:text-foreground"
          >
            <LanguagesIcon className="size-4" />
            {t(UI.langShort)}
          </button>
          <button
            type="button"
            onClick={(e) =>
              setTheme(
                resolved.mode === "dark" ? "light" : "dark",
                originOf(e.currentTarget)
              )
            }
            aria-label={t(UI.theme)}
            title={t(UI.theme)}
            className="inline-grid size-[38px] place-items-center rounded-full border border-border-strong bg-card text-body transition-colors hover:bg-muted hover:text-foreground"
          >
            {/* Icons switch by CSS so the prerendered markup matches any saved theme. */}
            <MoonIcon className="size-[17px] dark:hidden" />
            <SunIcon className="hidden size-[17px] dark:block" />
          </button>
          <a
            href={REPO_URL}
            className="hidden items-center gap-2 rounded-full border border-border-strong bg-card px-3.5 py-2 text-sm font-[550] transition-colors hover:bg-muted sm:inline-flex"
          >
            <GithubIcon />
            {t(UI.github)}
          </a>
        </div>
      </Wrap>
    </header>
  )
}

function Terminal() {
  const [tab, setTab] = useState<TemplateId>("slides")
  const lines = TERMINAL[tab]
  return (
    <figure
      className="relative mx-auto mt-14 max-w-[880px] overflow-hidden rounded-2xl border bg-card text-left shadow-lift"
      aria-label="Terminal"
    >
      <div className="flex items-center gap-2 border-b bg-well px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#d9a296]" />
        <span className="size-2.5 rounded-full bg-[#d8c49a]" />
        <span className="size-2.5 rounded-full bg-[#a9c2a4]" />
        <div role="tablist" className="ml-4 flex gap-1">
          {(Object.keys(TERMINAL) as TemplateId[]).map((id) => (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                "rounded-md px-2.5 py-1 font-mono text-[12.5px] text-muted-foreground transition-colors hover:text-foreground",
                tab === id && "bg-card text-foreground shadow-soft"
              )}
            >
              {id}/
            </button>
          ))}
        </div>
      </div>
      <pre
        key={tab}
        className="min-h-[214px] overflow-x-auto px-5 py-4 font-mono text-[13.5px] leading-[1.85] text-code"
      >
        {lines.map((l, i) => (
          <span key={i} className="block">
            <span
              className="block term-line"
              style={{ "--i": i * 2 } as React.CSSProperties}
            >
              <span className="text-primary select-none">~ $ </span>
              {l.cmd}
            </span>
            {l.out && (
              <span
                className="block term-line text-muted-foreground"
                style={{ "--i": i * 2 + 1 } as React.CSSProperties}
              >
                {l.out}
              </span>
            )}
          </span>
        ))}
        <span
          className="block term-line"
          style={{ "--i": lines.length * 2 } as React.CSSProperties}
        >
          <span className="text-primary select-none">~ $ </span>
          <span className="inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] caret bg-foreground/70" />
        </span>
      </pre>
    </figure>
  )
}

export function Hero() {
  const t = useT()
  return (
    <section className="relative overflow-hidden border-b pt-14 pb-14 md:pt-[84px] md:pb-[72px]">
      <div
        className="pointer-events-none absolute inset-0 gridlines"
        aria-hidden="true"
      />
      <Wrap>
        <div className="relative mx-auto max-w-[880px] text-center">
          <a
            href="#templates"
            className="inline-flex items-center gap-2.5 rounded-full border border-border-strong bg-card py-1.5 pr-3.5 pl-[7px] text-[13px] text-body shadow-soft transition-colors hover:border-primary-fill"
          >
            <span className="rounded-full bg-primary px-[9px] py-1 text-[11.5px] leading-none font-semibold text-primary-foreground">
              {HERO.pill.count}
            </span>
            {t(HERO.pill.text)}
            <span className="text-muted-foreground" aria-hidden="true">
              →
            </span>
          </a>
          <h1 className="mt-[26px] font-serif text-[clamp(64px,11vw,128px)] leading-[0.95] font-normal tracking-[-0.03em]">
            <span>{HERO.title[0]}</span>
            <span className="text-primary">{HERO.title[1]}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[800px] font-serif text-[clamp(20px,2.4vw,27px)] leading-[1.36] tracking-[-0.01em]">
            {t(HERO.tagline)}
          </p>
          <p className="mx-auto mt-[18px] max-w-[680px] text-body">
            {t(HERO.lead)}
          </p>
          <div className="mt-[30px] flex flex-wrap justify-center gap-3">
            <a
              href="#templates"
              className={cn(
                pillButton,
                "group h-12 bg-primary px-[22px] text-[15px] text-primary-foreground shadow-card hover:-translate-y-px hover:shadow-lift"
              )}
            >
              {t(UI.browse)}
              <ArrowRightIcon className="size-[17px] transition-transform group-hover:translate-x-[3px]" />
            </a>
            <a
              href={REPO_URL}
              className={cn(
                pillButton,
                "h-12 border border-border-strong bg-card px-[22px] text-[15px] shadow-soft hover:-translate-y-px hover:bg-muted"
              )}
            >
              <GithubIcon className="size-[17px]" />
              {t(UI.viewGithub)}
            </a>
          </div>
          <ul
            className="mt-7 flex flex-wrap justify-center"
            aria-label="Project facts"
          >
            {HERO.facts.map((f, i) => {
              const Icon = FACT_ICONS[i]
              return (
                <li
                  key={i}
                  className="flex items-center gap-2.5 px-3 py-0.5 text-left leading-tight not-first:border-l not-first:border-border-strong sm:px-[22px]"
                >
                  <Icon className="size-5 shrink-0 text-muted-foreground" />
                  <span className="flex flex-col">
                    <b className="text-sm font-semibold">
                      {typeof f.value === "string" ? f.value : t(f.value)}
                    </b>
                    <small className="mt-[3px] text-[11.5px] text-muted-foreground">
                      {t(f.label)}
                    </small>
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
        <Terminal />
      </Wrap>
    </section>
  )
}

export function Templates() {
  const t = useT()
  return (
    <Section id="templates">
      <SectionHead
        eyebrow={{ en: "Templates", zh: "模板" }}
        title={{ en: "Four templates,", zh: "四个模板，" }}
        dim={{ en: "one for each kind of page.", zh: "各对应一类页面。" }}
      />
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {TEMPLATES.map((tpl, i) => {
          const Icon = TEMPLATE_ICONS[tpl.id]
          return (
            <Card key={tpl.id} className="group flex flex-col">
              <span className="absolute top-6 right-6 font-serif text-[15px] text-muted-foreground italic">
                0{i + 1}
              </span>
              <div className="grid size-[42px] place-items-center rounded-lg border bg-muted text-body transition-colors group-hover:text-primary">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-5 font-serif text-xl leading-tight font-semibold">
                {t(tpl.name)}
              </h3>
              <p className="mt-2.5 text-[15px] text-body">{t(tpl.body)}</p>
              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {tpl.stack.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border bg-muted px-2.5 py-1 text-[12px] text-body"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-auto pt-5">
                <div className="flex items-center justify-between rounded-lg border bg-well px-3 py-2.5 font-mono text-[12.5px]">
                  <span>
                    <span className="text-muted-foreground">{tpl.id}/ $ </span>
                    {tpl.entry}
                  </span>
                  <a
                    href={`${REPO_URL}/tree/main/${tpl.id}`}
                    className="inline-flex items-center gap-1 font-sans text-[13px] font-semibold text-primary hover:underline"
                  >
                    {t(UI.source)}
                    <ArrowRightIcon className="size-3.5" />
                  </a>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </Section>
  )
}

export function Baseline() {
  const t = useT()
  return (
    <Section id="baseline">
      <SectionHead
        eyebrow={BASELINE.eyebrow}
        title={BASELINE.title}
        dim={BASELINE.dim}
      />
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {BASELINE.cards.map((c, i) => (
          <Card
            key={i}
            className={cn(
              "flex flex-col",
              c.span === "s4"
                ? "sm:col-span-2 lg:col-span-4 lg:row-span-2"
                : "lg:col-span-2"
            )}
          >
            <span className="font-serif text-[15px] text-muted-foreground italic">
              0{i + 1}
            </span>
            <h3 className="mt-3 font-serif text-xl leading-tight font-semibold">
              {t(c.title)}
            </h3>
            <p className="mt-2 text-[14.5px] text-body">{t(c.body)}</p>
            {c.snippet && (
              <pre className="mt-4 overflow-x-auto rounded-lg border bg-well px-3 py-2.5 font-mono text-[12.5px] leading-[1.6] text-code">
                <code>{c.snippet}</code>
              </pre>
            )}
            <div className="mt-auto flex flex-wrap gap-1.5 pt-[18px]">
              {c.chips.map((chip) => (
                <Chip key={chip}>{chip}</Chip>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </Section>
  )
}

export function QuickStart() {
  const t = useT()
  return (
    <Section id="quick-start">
      <SectionHead
        eyebrow={QUICK_START.eyebrow}
        title={QUICK_START.title}
        dim={QUICK_START.dim}
      />
      <div className="mt-12 grid gap-4">
        {QUICK_START.steps.map((s, i) => (
          <Card
            key={i}
            className="grid items-start gap-4 md:grid-cols-[4fr_7fr] md:gap-7"
          >
            <div>
              <span className="inline-grid size-[30px] place-items-center rounded-full bg-primary font-serif text-base text-primary-foreground">
                {i + 1}
              </span>
              <h3 className="mt-3.5 font-serif text-xl leading-tight font-semibold">
                {t(s.title)}
              </h3>
              <p className="mt-2 text-[15px] text-body">{t(s.body)}</p>
            </div>
            <CodePanel code={s.code} />
          </Card>
        ))}
      </div>
    </Section>
  )
}

export function Compare() {
  const t = useT()
  return (
    <Section id="compare">
      <SectionHead
        eyebrow={COMPARE.eyebrow}
        title={COMPARE.title}
        dim={COMPARE.dim}
      />
      <div
        data-reveal=""
        className="mt-12 grid grid-cols-2 overflow-hidden rounded-xl border bg-card shadow-soft md:grid-cols-4"
      >
        {COMPARE.facts.map((f, i) => (
          <div
            key={i}
            className={cn(
              "p-4 md:px-[22px] md:py-5",
              i > 0 && "md:border-l",
              i % 2 === 1 && "border-l",
              i > 1 && "border-t md:border-t-0"
            )}
          >
            <div className="font-serif text-[32px] leading-none tracking-[-0.02em] md:text-[40px]">
              {f.value}
            </div>
            <div className="mt-2 text-[13.5px] leading-snug text-body">
              {t(f.label)}
            </div>
          </div>
        ))}
      </div>
      <div
        data-reveal=""
        className="mt-6 overflow-x-auto rounded-xl border bg-card shadow-soft"
      >
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr>
              {COMPARE.head.map((h, i) => (
                <th
                  key={i}
                  className="border-b bg-well px-[18px] py-3.5 text-left text-[11.5px] font-semibold tracking-[0.08em] text-muted-foreground uppercase"
                >
                  {t(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE.rows.map((row, i) => (
              <tr key={i} className="transition-colors hover:bg-hover">
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={cn(
                      "border-b px-[18px] py-3.5 align-top",
                      i === COMPARE.rows.length - 1 && "border-b-0",
                      j === 0 ? "font-[550] text-foreground" : "text-body"
                    )}
                  >
                    {t(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

export function Limits() {
  const t = useT()
  return (
    <Section id="limits">
      <SectionHead
        eyebrow={LIMITS.eyebrow}
        title={LIMITS.title}
        dim={LIMITS.dim}
      />
      <div
        data-reveal=""
        className="mt-12 grid gap-7 rounded-xl border border-warn/35 bg-warn/8 p-[22px] md:grid-cols-[5fr_7fr] md:p-8"
      >
        <div className="flex items-start gap-3.5">
          <div className="grid size-[42px] shrink-0 place-items-center rounded-lg border border-warn/45 bg-warn/14 text-warn">
            <TriangleAlertIcon className="size-5" />
          </div>
          <p className="font-serif text-lg leading-[1.55]">{t(LIMITS.lead)}</p>
        </div>
        <ul className="grid gap-3">
          {LIMITS.items.map((item, i) => (
            <li
              key={i}
              className="flex gap-3 border-b border-warn/25 pb-3 text-[15px] text-body last:border-b-0 last:pb-0"
            >
              <ArrowRightIcon className="mt-1 size-4 shrink-0 text-warn" />
              {t(item)}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}

export function CtaBand() {
  const t = useT()
  return (
    <section className="relative overflow-hidden border-b py-24 text-center">
      <div
        className="pointer-events-none absolute inset-0 gridlines [mask-image:radial-gradient(ellipse_60%_80%_at_50%_100%,#000_20%,transparent_75%)]"
        aria-hidden="true"
      />
      <Wrap>
        <SectionHead
          eyebrow={CTA.eyebrow}
          title={CTA.title}
          dim={CTA.dim}
          center
        />
        <div className="relative mx-auto mt-7 inline-flex max-w-full items-center gap-3 overflow-x-auto rounded-[14px] border border-border-strong bg-card px-[18px] py-3 font-mono text-[13.5px] shadow-soft">
          <span className="text-primary select-none">$</span>
          <code className="border-0 bg-transparent p-0 whitespace-nowrap">
            {CTA.command}
          </code>
        </div>
        <p className="relative mx-auto mt-4 max-w-[560px] text-body">
          {t(CTA.sub)}
        </p>
        <div className="relative mt-[30px] flex flex-wrap justify-center gap-3">
          <a
            href="#quick-start"
            className={cn(
              pillButton,
              "group h-12 bg-primary px-[22px] text-[15px] text-primary-foreground shadow-card hover:-translate-y-px hover:shadow-lift"
            )}
          >
            {t(QUICK_START.eyebrow)}
            <ArrowRightIcon className="size-[17px] transition-transform group-hover:translate-x-[3px]" />
          </a>
          <a
            href={REPO_URL}
            className={cn(
              pillButton,
              "h-12 border border-border-strong bg-card px-[22px] text-[15px] shadow-soft hover:-translate-y-px hover:bg-muted"
            )}
          >
            {t(UI.viewGithub)}
          </a>
        </div>
      </Wrap>
    </section>
  )
}

export function Footer() {
  const t = useT()
  return (
    <footer className="pt-16 pb-10 text-sm text-body">
      <Wrap>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <a
              href="#top"
              className="flex items-center gap-2.5 font-serif text-[19px] leading-none font-semibold text-foreground"
            >
              <LogoMark />
              {BRAND}
            </a>
            <p className="mt-3.5 max-w-[340px]">{t(FOOTER.blurb)}</p>
          </div>
          {FOOTER.columns.map((col, i) => (
            <div key={i}>
              <p className="mb-3.5 text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                {t(col.title)}
              </p>
              <ul className="grid gap-[9px]">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      className="transition-colors hover:text-foreground"
                    >
                      {t(l.label)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap justify-between gap-x-6 gap-y-2.5 border-t pt-[22px] text-[13px] text-muted-foreground">
          <span>{t(FOOTER.bottom)}</span>
          <span>© 2026 {BRAND}</span>
        </div>
      </Wrap>
    </footer>
  )
}
