// Schema of a tree report. A report is one tree: the top levels hold plain-language
// concepts, deeper levels hold specifics (numbers, file paths, decisions).
// Inline text may use **bold** and `code`.

export type Status = "done" | "doing" | "decision" | "risk" | "info"

export interface Metric {
  label: string
  value: string
  note?: string
}

export interface DataTable {
  caption?: string
  columns: string[]
  rows: string[][]
  // row indices to emphasise (e.g. "ours")
  highlight?: number[]
}

export interface ReportNode {
  id: string
  title: string
  // one line shown on the node card
  summary: string
  status?: Status
  body?: string[]
  points?: string[]
  metrics?: Metric[]
  table?: DataTable
  // file paths, commits, slide pages
  sources?: string[]
  children?: ReportNode[]
}

export interface Report {
  id: string
  title: string
  subtitle?: string
  // ISO date of the snapshot
  date: string
  // names of the levels below the root, from plain to specific
  levels: string[]
  root: ReportNode
}
