import { useCallback, useEffect, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  api,
  ApiError,
  type Annotation,
  type EditState,
  type SampleResponse,
  type SaveResponse,
  type TasksResponse,
} from "@/lib/api"
import { completenessError, initialState, loadState } from "@/lib/annotation"

export type DraftStatus = "todo" | "in_progress" | "done"

export interface Draft {
  state: EditState
  discarded: boolean
  discard_reason: string
  status: DraftStatus
}

export type SaveState =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "saving" }
  | { kind: "saved"; at: string }
  | { kind: "error"; message: string }

const AUTOSAVE_MS = 800

export function fromAnnotation(r: SampleResponse, a: Annotation | null): Draft {
  return a
    ? {
        state: loadState(r.sample, a.state),
        discarded: a.discarded,
        discard_reason: a.discard_reason,
        status: a.status,
      }
    : {
        state: initialState(r.sample),
        discarded: false,
        discard_reason: "",
        status: "todo",
      }
}

/**
 * Local working copy of one sample's annotation with debounced autosave.
 * Saves are serialized; edits made while a save is in flight trigger one more save.
 */
export function useDraft(resp: SampleResponse) {
  const qc = useQueryClient()
  const id = resp.sample.id
  const endpoint = `samples/${encodeURIComponent(id)}/annotation`
  const [draft, setDraftState] = useState<Draft>(() =>
    fromAnnotation(resp, resp.annotation)
  )
  const [save, setSave] = useState<SaveState>(
    resp.annotation
      ? { kind: "saved", at: resp.annotation.updated_at }
      : { kind: "idle" }
  )
  const draftRef = useRef(draft)
  const version = useRef(resp.annotation?.version ?? 0)
  const timer = useRef<number | undefined>(undefined)
  const inflight = useRef<Promise<boolean> | null>(null)
  const dirty = useRef(false)
  const sendRef = useRef<(keepalive?: boolean) => Promise<boolean>>(
    async () => true
  )

  const schedule = useCallback(() => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => void sendRef.current(), AUTOSAVE_MS)
  }, [])

  const replace = useCallback((d: Draft) => {
    draftRef.current = d
    setDraftState(d)
  }, [])

  const send = useCallback(
    async (keepalive = false): Promise<boolean> => {
      window.clearTimeout(timer.current)
      if (inflight.current) {
        await inflight.current
        if (!dirty.current) return true
      }
      dirty.current = false
      const d = draftRef.current
      const payload = {
        base_version: version.current,
        state: d.state,
        discarded: d.discarded,
        discard_reason: d.discard_reason,
        status: d.status === "todo" ? "in_progress" : d.status,
      }
      setSave({ kind: "saving" })
      const run = (async () => {
        try {
          const res = await api<SaveResponse>(endpoint, {
            method: "PUT",
            json: payload,
            keepalive,
          })
          version.current = res.annotation.version
          // Keep the cached sample and the task list in sync with what was saved.
          qc.setQueryData<SampleResponse>(
            ["sample", id],
            (old) => old && { ...old, annotation: res.annotation }
          )
          qc.setQueryData<TasksResponse>(
            ["tasks"],
            (old) =>
              old && {
                ...old,
                items: old.items.map((t) =>
                  t.id === id ? { ...t, ...res.task } : t
                ),
              }
          )
          void qc.invalidateQueries({ queryKey: ["admin"] })
          if (draftRef.current.status === "todo")
            replace({ ...draftRef.current, status: "in_progress" })
          setSave(
            dirty.current
              ? { kind: "pending" }
              : { kind: "saved", at: res.annotation.updated_at }
          )
          return true
        } catch (e) {
          const err = e as ApiError
          if (err.status === 409) {
            const cur = (err.body as { annotation: Annotation | null })
              .annotation
            version.current = cur?.version ?? 0
            replace(fromAnnotation(resp, cur))
            toast.warning(err.message)
            setSave(
              cur ? { kind: "saved", at: cur.updated_at } : { kind: "idle" }
            )
            return false
          }
          if (err.status === 422 && draftRef.current.status === "done") {
            toast.error(err.message)
            replace({ ...draftRef.current, status: "in_progress" })
            dirty.current = true
            schedule()
            return false
          }
          dirty.current = true
          setSave({ kind: "error", message: err.message || "保存失败" })
          return false
        } finally {
          inflight.current = null
        }
      })()
      inflight.current = run
      const ok = await run
      if (ok && dirty.current) schedule()
      return ok
    },
    [id, endpoint, qc, replace, schedule, resp]
  )

  useEffect(() => {
    sendRef.current = send
  }, [send])

  /** Applies an edit; `immediate` saves now instead of after the debounce. */
  const update = useCallback(
    (
      fn: (d: Draft) => Draft,
      immediate = false
    ): Promise<boolean> | undefined => {
      let next = fn(draftRef.current)
      if (
        next.status === "done" &&
        !next.discarded &&
        completenessError(resp.sample, next.state)
      ) {
        next = { ...next, status: "in_progress" }
        toast.info("内容不完整，已改回「进行中」", { id: "auto-reopen" })
      }
      replace(next)
      dirty.current = true
      setSave({ kind: "pending" })
      window.clearTimeout(timer.current)
      if (immediate) return send()
      schedule()
      return undefined
    },
    [replace, send, schedule, resp.sample]
  )

  const flush = useCallback(
    () =>
      dirty.current ? send() : (inflight.current ?? Promise.resolve(true)),
    [send]
  )

  // Save on tab close and when the editor unmounts (switching samples).
  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => {
      if (dirty.current || inflight.current) {
        void send(true)
        e.preventDefault()
      }
    }
    window.addEventListener("beforeunload", onUnload)
    return () => {
      window.removeEventListener("beforeunload", onUnload)
      if (dirty.current) void send(true)
    }
  }, [send])

  return { draft, save, update, flush }
}
