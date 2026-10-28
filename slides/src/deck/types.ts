import type { ComponentType } from "react"
import type { Text } from "@/lib/i18n"
import type { ThreadShape } from "./shapes"

/** A run of pages sharing one header: an optional marker ("1.") and a title. */
export type Section = { marker: string | null; title: Text }

export type SlideDef = {
  id: string
  /** Key into `DeckDef.sections`; null for pages without a section header (title, closing). */
  section: string | null
  /** In-page steps; next/previous walk through them before changing page. */
  stages: number
  /** Name in the overview for pages without a section. */
  label?: Text
  Component: ComponentType<{ stage: number }>
  /** Outline the thread morphs into on this page, per stage. */
  thread: (stage: number) => ThreadShape
}

export type DeckDef = {
  /** Shown in the footer of every page. */
  title: string
  sections: Record<string, Section>
  slides: SlideDef[]
}
