export const BASE = import.meta.env.BASE_URL // always ends with "/" (or is "./")

/** On by default (see .env): every call is answered in the browser by src/lib/mock.ts. */
export const USE_MOCK = import.meta.env.VITE_API_MOCK !== "false"

export class ApiError extends Error {
  status: number
  body: unknown
  constructor(status: number, message: string, body: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

export type ApiInit = RequestInit & { json?: unknown }

export async function api<T>(path: string, init: ApiInit = {}): Promise<T> {
  if (USE_MOCK) {
    const { mockApi } = await import("@/lib/mock")
    return mockApi<T>(path, init)
  }
  const { json, headers, ...rest } = init
  const res = await fetch(BASE + "api/" + path, {
    credentials: "same-origin",
    ...rest,
    headers: {
      "X-Requested-With": "frontier",
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  })
  const text = await res.text()
  let body: unknown
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = text
  }
  if (!res.ok) {
    const msg =
      (body as { error?: string })?.error ?? `请求失败（${res.status}）`
    throw new ApiError(res.status, msg, body)
  }
  return body as T
}

// ---------- types ----------

export type Role = "admin" | "annotator"

export interface User {
  id: number
  username: string
  role: Role
  disabled: boolean
  created_at: string
  last_seen_at: string | null
}

export interface UserRef {
  id: number
  username: string
}

export type TaskStatus = "todo" | "in_progress" | "done" | "discarded"

export interface TaskItem {
  id: string
  idx: number
  title: string
  category: string
  status: TaskStatus | "unassigned"
  changes: number
  issues: number
  updated_at: string | null
  assignee_id?: number
}

export interface Fact {
  label: string
  value: string
}

export interface Message {
  role: "user" | "assistant"
  text: string
}

/** An editable field; `value` is the delivered original the annotator may correct. */
export interface FieldDef {
  key: string
  label: string
  value: string
  options?: string[]
  multiline?: boolean
  hint?: string
}

/** A single-choice question; answers listed in `issues` mark the sample as having a problem. */
export interface CheckDef {
  id: string
  label: string
  hint?: string
  options: { value: string; label: string }[]
  issues: string[]
}

export interface SampleView {
  id: string
  idx: number
  title: string
  category: string
  badges: string[]
  facts: Fact[]
  conversation: Message[]
  fields: FieldDef[]
  checks: CheckDef[]
}

export interface EditState {
  fields: Record<string, string>
  checks: Record<string, string>
  note: string
}

export interface Annotation {
  sample_id: string
  user_id: number
  status: "in_progress" | "done"
  discarded: boolean
  discard_reason: string
  state: EditState
  changes: number
  issues: number
  version: number
  updated_at: string
}

export interface SampleResponse {
  sample: SampleView
  annotation: Annotation | null
  assignee: UserRef | null
  readonly: boolean
}

export interface TasksResponse {
  items: TaskItem[]
}

export interface SaveResponse {
  annotation: Annotation
  task: TaskItem
}

export interface UserStats extends User {
  assigned: number
  todo: number
  in_progress: number
  done: number
  discarded: number
  modified: number
  issues: number
  last_update: string | null
}

export interface Overview {
  total: number
  assigned: number
  unassigned: number
  status_counts: Record<TaskStatus, number>
  modified: number
  issues: number
  users: UserStats[]
  /** Samples finished per day over the last two weeks, oldest first. */
  daily: { date: string; done: number }[]
}
