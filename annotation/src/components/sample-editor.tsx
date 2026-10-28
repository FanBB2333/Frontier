import { useEffect, useState, type ReactNode } from "react"
import { useNavigate } from "react-router"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BotIcon,
  CheckIcon,
  CircleAlertIcon,
  CloudCheckIcon,
  CloudUploadIcon,
  RotateCcwIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { CheckDef, FieldDef, SampleResponse, TaskItem } from "@/lib/api"
import { completenessError } from "@/lib/annotation"
import { formatTime, padIdx } from "@/lib/labels"
import {
  fromAnnotation,
  useDraft,
  type Draft,
  type SaveState,
} from "@/hooks/use-draft"
import { EditableText, type ViewMode } from "@/components/editable-text"
import { StatusBadge } from "@/components/status"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Kbd } from "@/components/ui/kbd"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export interface Nav {
  position: number
  total: number
  prev?: string
  next?: string
  nextUnfinished?: string
  basePath: string
}

function isEditable(t: EventTarget | null) {
  return (
    t instanceof HTMLElement &&
    (t.isContentEditable ||
      !!t.closest(
        "input, textarea, select, [contenteditable='true'], [role='dialog'], [role='menu']"
      ))
  )
}

export function buildNav(items: TaskItem[], id: string, basePath: string): Nav {
  const i = items.findIndex((t) => t.id === id)
  const open = (t: TaskItem) =>
    t.status === "todo" || t.status === "in_progress"
  const after = [...items.slice(i + 1), ...items.slice(0, Math.max(i, 0))].find(
    open
  )
  return {
    position: i + 1,
    total: items.length,
    prev: i > 0 ? items[i - 1].id : undefined,
    next: i >= 0 && i < items.length - 1 ? items[i + 1].id : undefined,
    nextUnfinished: after?.id,
    basePath,
  }
}

export function SampleEditor({
  resp,
  nav,
}: {
  resp: SampleResponse
  nav: Nav
}) {
  if (resp.readonly)
    return (
      <SampleBody
        resp={resp}
        draft={fromAnnotation(resp, resp.annotation)}
        nav={nav}
      />
    )
  return <EditableSample resp={resp} nav={nav} />
}

function EditableSample({ resp, nav }: { resp: SampleResponse; nav: Nav }) {
  const { draft, save, update, flush } = useDraft(resp)
  return (
    <SampleBody
      resp={resp}
      draft={draft}
      nav={nav}
      edit={{ save, update, flush }}
    />
  )
}

interface EditApi {
  save: SaveState
  update: ReturnType<typeof useDraft>["update"]
  flush: () => Promise<boolean>
}

function SaveIndicator({
  save,
  onRetry,
}: {
  save: SaveState
  onRetry: () => void
}) {
  switch (save.kind) {
    case "pending":
    case "saving":
      return (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {save.kind === "saving" ? (
            <Spinner className="size-3.5" />
          ) : (
            <CloudUploadIcon className="size-3.5" />
          )}
          {save.kind === "saving" ? "保存中…" : "等待自动保存"}
        </span>
      )
    case "saved":
      return (
        <span className="flex items-center gap-1.5 text-xs text-success">
          <CloudCheckIcon className="size-3.5" />
          已自动保存 · {formatTime(save.at)}
        </span>
      )
    case "error":
      return (
        <span className="flex items-center gap-1.5 text-xs text-destructive">
          <CircleAlertIcon className="size-3.5" />
          保存失败：{save.message}
          <Button variant="link" size="xs" onClick={onRetry}>
            重试
          </Button>
        </span>
      )
    default:
      return (
        <span className="text-xs text-muted-foreground">
          尚未开始 · 操作后自动保存
        </span>
      )
  }
}

function Pairs({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-1.5 text-sm">
      {rows.map((r, i) => (
        <div key={i} className="contents">
          <dt className="text-xs leading-5 text-muted-foreground">{r.label}</dt>
          <dd className="leading-5 break-words">{r.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function Conversation({ resp }: { resp: SampleResponse }) {
  return (
    <div className="flex flex-col gap-3">
      {resp.sample.conversation.map((m, i) => {
        const user = m.role === "user"
        const Icon = user ? UserIcon : BotIcon
        return (
          <div
            key={i}
            className={cn("flex gap-2.5", user && "flex-row-reverse")}
          >
            <span
              className={cn(
                "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                user
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Icon className="size-3.5" />
            </span>
            <div
              className={cn(
                "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed break-words whitespace-pre-wrap",
                user
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted/60 ring-1 ring-border"
              )}
            >
              {m.text}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ChoiceField({
  field,
  value,
  readOnly,
  onChange,
}: {
  field: FieldDef
  value: string
  readOnly: boolean
  onChange: (v: string) => void
}) {
  const modified = value !== field.value
  const items = field.options!.map((o) => ({ label: o, value: o }))
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border-l-2 border-transparent py-0.5 pl-2",
        modified && "border-edited bg-edited-muted"
      )}
    >
      <Select
        items={items}
        value={value}
        disabled={readOnly}
        onValueChange={(v) => onChange(v as string)}
      >
        <SelectTrigger className="w-40 bg-card" aria-label={field.label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((i) => (
              <SelectItem key={i.value} value={i.value}>
                {i.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {modified && (
        <>
          <span className="text-xs text-muted-foreground">
            原为「{field.value}」
          </span>
          {!readOnly && (
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="恢复原值"
              onClick={() => onChange(field.value)}
            >
              <RotateCcwIcon />
            </Button>
          )}
        </>
      )}
    </div>
  )
}

function CheckList({
  checks,
  answers,
  readOnly,
  onChange,
}: {
  checks: CheckDef[]
  answers: Record<string, string>
  readOnly: boolean
  onChange: (id: string, v: string) => void
}) {
  return (
    <ul className="flex flex-col divide-y">
      {checks.map((c) => {
        const issue = c.issues.includes(answers[c.id] ?? "")
        return (
          <li
            key={c.id}
            className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2 first:pt-0 last:pb-0"
          >
            <div className="flex min-w-0 flex-1 basis-48 flex-col">
              <span className={cn("text-sm", !answers[c.id] && "font-medium")}>
                {c.label}
                {!answers[c.id] && (
                  <span
                    className="ml-1.5 inline-block size-1.5 rounded-full bg-brand align-middle"
                    aria-label="待作答"
                  />
                )}
              </span>
              {c.hint && (
                <span className="text-xs text-muted-foreground">{c.hint}</span>
              )}
            </div>
            <ToggleGroup
              size="sm"
              variant="outline"
              spacing={0}
              value={answers[c.id] ? [answers[c.id]] : []}
              disabled={readOnly}
              onValueChange={(v) => onChange(c.id, v[0] ?? "")}
            >
              {c.options.map((o) => (
                <ToggleGroupItem
                  key={o.value}
                  value={o.value}
                  className={cn(
                    "px-2.5 aria-pressed:font-medium",
                    issue && answers[c.id] === o.value
                      ? "aria-pressed:bg-warning-muted aria-pressed:text-warning"
                      : "aria-pressed:bg-accent aria-pressed:text-accent-foreground"
                  )}
                >
                  {o.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </li>
        )
      })}
    </ul>
  )
}

function DiscardDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onConfirm: (reason: string) => void
}) {
  const [reason, setReason] = useState("")
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>丢弃这条样本？</DialogTitle>
          <DialogDescription>
            丢弃的样本不进入导出结果，之后仍可恢复。
          </DialogDescription>
        </DialogHeader>
        <Textarea
          autoFocus
          placeholder="丢弃原因，例如：问题含糊、与任务无关、重复样本"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            variant="destructive"
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason.trim())}
          >
            丢弃
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SampleBody({
  resp,
  draft,
  nav,
  edit,
}: {
  resp: SampleResponse
  draft: Draft
  nav: Nav
  edit?: EditApi
}) {
  const s = resp.sample
  const navigate = useNavigate()
  const readOnly = !edit || draft.discarded
  const [viewMode, setViewMode] = useState<ViewMode>("final")
  const [discardOpen, setDiscardOpen] = useState(false)
  const status = draft.discarded ? "discarded" : draft.status
  const missing = completenessError(s, draft.state)

  const go = async (id?: string) => {
    if (!id) return
    await edit?.flush()
    navigate(`${nav.basePath}/${encodeURIComponent(id)}`)
  }

  const markDone = async () => {
    if (!edit) return
    if (missing) return void toast.error(missing)
    const ok = await edit.update((d) => ({ ...d, status: "done" }), true)
    if (ok) {
      toast.success(`${padIdx(s.idx)} 已完成`)
      if (nav.nextUnfinished) void go(nav.nextUnfinished)
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault()
        if (!readOnly && draft.status !== "done") void markDone()
        return
      }
      if (e.metaKey || e.ctrlKey || e.altKey || isEditable(e.target)) return
      if (e.key === "ArrowLeft") void go(nav.prev)
      else if (e.key === "ArrowRight") void go(nav.next)
      else return
      e.preventDefault()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  const setField = (key: string, value: string) =>
    edit?.update((d) => ({
      ...d,
      state: { ...d.state, fields: { ...d.state.fields, [key]: value } },
    }))
  const setCheck = (id: string, value: string) =>
    edit?.update((d) => ({
      ...d,
      state: { ...d.state, checks: { ...d.state.checks, [id]: value } },
    }))

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 flex flex-col gap-1.5 border-b bg-background/95 px-4 py-2.5 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono text-sm font-medium text-foreground">
            {padIdx(s.idx)}
          </span>
          <span className="text-brand">{s.category}</span>
          {s.badges.map((b) => (
            <Badge key={b} variant="outline">
              {b}
            </Badge>
          ))}
          <StatusBadge status={status} />
          {resp.readonly && resp.assignee && (
            <span>只读 · 分配给 {resp.assignee.username}</span>
          )}
          <span className="ml-auto">
            {edit ? (
              <SaveIndicator
                save={edit.save}
                onRetry={() => void edit.flush()}
              />
            ) : null}
          </span>
        </div>
        <div className="flex items-start gap-3">
          <h1 className="line-clamp-2 min-w-0 flex-1 text-base font-semibold">
            {s.title}
          </h1>
          <ToggleGroup
            size="sm"
            variant="outline"
            spacing={0}
            value={[viewMode]}
            onValueChange={(v) => v[0] && setViewMode(v[0] as ViewMode)}
          >
            <ToggleGroupItem value="final">最终</ToggleGroupItem>
            <ToggleGroupItem value="diff">对比</ToggleGroupItem>
            <ToggleGroupItem value="original">原文</ToggleGroupItem>
          </ToggleGroup>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="上一条"
              disabled={!nav.prev}
              onClick={() => void go(nav.prev)}
            >
              <ArrowLeftIcon />
            </Button>
            <span className="min-w-14 text-center font-mono text-xs text-muted-foreground">
              {nav.position} / {nav.total}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="下一条"
              disabled={!nav.next}
              onClick={() => void go(nav.next)}
            >
              <ArrowRightIcon />
            </Button>
          </div>
        </div>
      </header>

      {draft.discarded && (
        <div className="px-4 pt-4">
          <Alert variant="destructive">
            <Trash2Icon />
            <AlertTitle>已丢弃</AlertTitle>
            <AlertDescription>
              {draft.discard_reason || "未填写原因"}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="grid flex-1 gap-4 p-4 xl:grid-cols-[5fr_6fr]">
        <div className="flex flex-col gap-4">
          <Card size="sm">
            <CardHeader>
              <CardTitle>对话</CardTitle>
              <CardDescription>需要检查的是助手的最后一条回复</CardDescription>
            </CardHeader>
            <CardContent>
              <Conversation resp={resp} />
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle>样本信息</CardTitle>
            </CardHeader>
            <CardContent>
              <Pairs
                rows={[
                  {
                    label: "样本 ID",
                    value: <span className="font-mono">{s.id}</span>,
                  },
                  ...s.facts,
                ]}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card size="sm">
            <CardHeader>
              <CardTitle>字段</CardTitle>
              <CardDescription>
                点击文字直接修改；橙色边表示与原始交付不同
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {s.fields.map((f) => (
                <div key={f.key} className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {f.label}
                  </span>
                  {f.options ? (
                    <ChoiceField
                      field={f}
                      value={draft.state.fields[f.key] ?? f.value}
                      readOnly={readOnly}
                      onChange={(v) => setField(f.key, v)}
                    />
                  ) : (
                    <EditableText
                      label={f.label}
                      value={draft.state.fields[f.key] ?? f.value}
                      original={f.value}
                      viewMode={viewMode}
                      onChange={
                        readOnly ? undefined : (v) => setField(f.key, v)
                      }
                      textClassName="text-sm leading-relaxed"
                    />
                  )}
                  {f.hint && (
                    <span className="text-xs text-muted-foreground">
                      {f.hint}
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle>检查项</CardTitle>
              <CardDescription>全部作答后才能标记完成</CardDescription>
            </CardHeader>
            <CardContent>
              <CheckList
                checks={s.checks}
                answers={draft.state.checks}
                readOnly={readOnly}
                onChange={setCheck}
              />
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle>备注</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                aria-label="备注"
                placeholder="发现的问题、修改理由或需要讨论的地方"
                value={draft.state.note}
                readOnly={readOnly}
                onChange={(e) =>
                  edit?.update((d) => ({
                    ...d,
                    state: { ...d.state, note: e.target.value },
                  }))
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {edit && (
        <footer className="sticky bottom-0 flex flex-wrap items-center gap-2 border-t bg-background/95 px-4 py-2.5 backdrop-blur">
          <span className="hidden items-center gap-1 text-xs text-muted-foreground lg:flex">
            <Kbd>←</Kbd>
            <Kbd>→</Kbd> 切换样本 · <Kbd>⌘/Ctrl</Kbd>
            <Kbd>Enter</Kbd> 完成并下一条
          </span>
          <div className="ml-auto flex items-center gap-2">
            {draft.discarded ? (
              <Button
                variant="outline"
                onClick={() =>
                  edit.update(
                    (d) => ({ ...d, discarded: false, discard_reason: "" }),
                    true
                  )
                }
              >
                <RotateCcwIcon data-icon="inline-start" />
                恢复样本
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => setDiscardOpen(true)}
                >
                  <Trash2Icon data-icon="inline-start" />
                  丢弃
                </Button>
                {draft.status === "done" ? (
                  <Button
                    variant="outline"
                    onClick={() =>
                      edit.update(
                        (d) => ({ ...d, status: "in_progress" }),
                        true
                      )
                    }
                  >
                    <RotateCcwIcon data-icon="inline-start" />
                    重新打开
                  </Button>
                ) : (
                  <Button onClick={() => void markDone()}>
                    <CheckIcon data-icon="inline-start" />
                    标记完成
                  </Button>
                )}
              </>
            )}
          </div>
          <DiscardDialog
            key={String(discardOpen)}
            open={discardOpen}
            onOpenChange={setDiscardOpen}
            onConfirm={(reason) => {
              setDiscardOpen(false)
              edit.update(
                (d) => ({ ...d, discarded: true, discard_reason: reason }),
                true
              )
            }}
          />
        </footer>
      )}
    </div>
  )
}
