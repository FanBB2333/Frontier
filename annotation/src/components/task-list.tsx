import { useEffect, useMemo, useRef } from "react"
import { NavLink } from "react-router"
import { SearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TaskItem, TaskStatus } from "@/lib/api"
import { STATUS, padIdx } from "@/lib/labels"
import { StatusIcon } from "@/components/status"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export type TaskFilter = "all" | TaskStatus

interface TaskListProps {
  items: TaskItem[]
  activeId?: string
  filter: TaskFilter
  onFilter: (f: TaskFilter) => void
  query: string
  onQuery: (q: string) => void
  basePath: string
}

export function TaskList({
  items,
  activeId,
  filter,
  onFilter,
  query,
  onQuery,
  basePath,
}: TaskListProps) {
  const counts = useMemo(() => {
    const c: Record<TaskFilter, number> = {
      all: items.length,
      todo: 0,
      in_progress: 0,
      done: 0,
      discarded: 0,
    }
    for (const t of items) if (t.status !== "unassigned") c[t.status]++
    return c
  }, [items])
  const finished = counts.done + counts.discarded
  const q = query.trim().toLowerCase()
  const shown = items.filter(
    (t) =>
      (filter === "all" || t.status === filter) &&
      (!q ||
        `${t.idx} ${t.id} ${t.title} ${t.category}`.toLowerCase().includes(q))
  )
  const activeRef = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" })
  }, [activeId])

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-r bg-card">
      <div className="flex flex-col gap-3 border-b p-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium">我的任务</span>
          <span className="font-mono text-xs text-muted-foreground">
            {finished} / {items.length} 已完成
          </span>
        </div>
        <Progress value={items.length ? (100 * finished) / items.length : 0} />
        <ToggleGroup
          size="sm"
          variant="outline"
          spacing={0}
          value={[filter]}
          onValueChange={(v) => v[0] && onFilter(v[0] as TaskFilter)}
          className="w-full"
        >
          {(["all", "todo", "in_progress", "done", "discarded"] as const).map(
            (f) => (
              <ToggleGroupItem
                key={f}
                value={f}
                className="flex-1 flex-col gap-0 px-1 py-1 text-[11px] leading-tight data-[size=sm]:h-auto"
              >
                <span>{f === "all" ? "全部" : STATUS[f]}</span>
                <span className="font-mono text-muted-foreground">
                  {counts[f]}
                </span>
              </ToggleGroupItem>
            )
          )}
        </ToggleGroup>
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="搜索序号、ID 或标题"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
          />
        </InputGroup>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <ul className="flex flex-col py-1">
          {shown.map((t) => {
            const active = t.id === activeId
            return (
              <li
                key={t.id}
                className="[contain-intrinsic-size:auto_68px] [content-visibility:auto]"
              >
                <NavLink
                  ref={active ? activeRef : undefined}
                  to={`${basePath}/${encodeURIComponent(t.id)}`}
                  className={cn(
                    "flex gap-2.5 border-l-2 border-transparent px-3 py-2 transition-colors hover:bg-muted",
                    active && "border-primary bg-accent hover:bg-accent"
                  )}
                >
                  <StatusIcon status={t.status} className="mt-0.5" />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="font-mono text-foreground">
                        {padIdx(t.idx)}
                      </span>
                      <span className="shrink-0 text-brand">{t.category}</span>
                      <span className="ml-auto flex shrink-0 items-center gap-1.5 font-mono">
                        {t.issues > 0 && t.status !== "discarded" && (
                          <span className="text-warning">⚑{t.issues}</span>
                        )}
                        {t.changes > 0 && t.status !== "discarded" && (
                          <span className="text-edited">✎{t.changes}</span>
                        )}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "line-clamp-2 text-[13px] leading-snug",
                        active ? "text-foreground" : "text-foreground/85"
                      )}
                    >
                      {t.title}
                    </p>
                  </div>
                </NavLink>
              </li>
            )
          })}
          {shown.length === 0 && (
            <li className="px-3 py-8 text-center text-sm text-muted-foreground">
              没有匹配的任务
            </li>
          )}
        </ul>
      </ScrollArea>
    </aside>
  )
}
