import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Overview } from "@/lib/api"
import { ROLES, formatTime } from "@/lib/labels"
import { useOverview } from "@/pages/admin/layout"

function Stat({
  label,
  value,
  note,
}: {
  label: string
  value: number | string
  note?: string
}) {
  return (
    <div className="flex flex-col gap-1 p-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-2xl font-semibold tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
      {note && <span className="text-xs text-muted-foreground">{note}</span>}
    </div>
  )
}

const dayLabel = (iso: string) => {
  const d = new Date(iso + "T00:00:00")
  return `${d.getMonth() + 1}/${d.getDate()}`
}

/** One column per day; the hovered day's count shows above the plot, the latest day is labeled. */
function DailyChart({ daily }: { daily: Overview["daily"] }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(1, ...daily.map((d) => d.done))
  const shown = hover ?? daily.length - 1
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2 text-sm">
        <span className="font-mono text-lg font-semibold tabular-nums">
          {daily[shown]?.done ?? 0}
        </span>
        <span className="text-muted-foreground">
          {hover === null ? "今天" : dayLabel(daily[shown].date)} 完成
        </span>
      </div>
      <div
        className="relative h-36 border-b"
        role="img"
        aria-label={`近 14 天每日完成数：${daily.map((d) => `${dayLabel(d.date)} ${d.done}`).join("，")}`}
      >
        <div className="absolute inset-0 flex items-end gap-[2px]">
          {daily.map((d, i) => (
            <div
              key={d.date}
              className="flex h-full flex-1 cursor-default items-end justify-center"
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
            >
              <div
                className="w-full max-w-6 rounded-t-[4px] bg-chart-1 transition-opacity"
                style={{
                  height: `${(100 * d.done) / max}%`,
                  minHeight: d.done ? 2 : 0,
                  opacity: hover === null || hover === i ? 1 : 0.35,
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
        <span>{daily[0] && dayLabel(daily[0].date)}</span>
        <span>{daily.at(-1) && dayLabel(daily.at(-1)!.date)}</span>
      </div>
    </div>
  )
}

export function AdminOverviewPage() {
  const { data } = useOverview()
  if (!data) return <Skeleton className="m-6 h-96" />
  const c = data.status_counts
  const finished = c.done + c.discarded

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 p-6">
      <div>
        <h1 className="text-xl font-semibold">标注进度</h1>
        <p className="text-sm text-muted-foreground">
          共 {data.total} 条样本 · 每 30 秒自动刷新
        </p>
      </div>
      <Card className="gap-0 py-0">
        <div className="grid grid-cols-2 divide-x divide-y sm:grid-cols-4 lg:grid-cols-7 lg:divide-y-0">
          <Stat label="样本总数" value={data.total} />
          <Stat
            label="已分配"
            value={data.assigned}
            note={`未分配 ${data.unassigned}`}
          />
          <Stat
            label="已完成"
            value={c.done}
            note={`完成率 ${data.assigned ? ((100 * finished) / data.assigned).toFixed(1) : 0}%`}
          />
          <Stat
            label="进行中"
            value={c.in_progress}
            note={`未开始 ${c.todo}`}
          />
          <Stat label="已丢弃" value={c.discarded} />
          <Stat
            label="有问题样本"
            value={data.issues}
            note="至少一个检查项不通过"
          />
          <Stat label="有字段修改" value={data.modified} note="不含丢弃" />
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-[2fr_3fr]">
        <Card>
          <CardHeader>
            <CardTitle>近 14 天每日完成</CardTitle>
            <CardDescription>按最后保存时间统计</CardDescription>
          </CardHeader>
          <CardContent>
            <DailyChart daily={data.daily} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>整体进度</CardTitle>
            <CardDescription>已完成与已丢弃都计入完成</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {(
              [
                ["done", "已完成", "bg-success"],
                ["in_progress", "进行中", "bg-warning"],
                ["todo", "未开始", "bg-muted-foreground/40"],
                ["discarded", "已丢弃", "bg-destructive"],
              ] as const
            ).map(([k, label, tone]) => (
              <div key={k} className="flex items-center gap-3 text-sm">
                <span className={`size-2.5 shrink-0 rounded-sm ${tone}`} />
                <span className="w-14 shrink-0">{label}</span>
                <Progress
                  value={data.assigned ? (100 * c[k]) / data.assigned : 0}
                  className="flex-1"
                />
                <span className="w-10 text-right font-mono text-xs text-muted-foreground">
                  {c[k]}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="pb-0">
        <CardHeader>
          <CardTitle>标注员</CardTitle>
          <CardDescription>每位成员的分配量与完成情况</CardDescription>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">用户</TableHead>
              <TableHead className="text-right">已分配</TableHead>
              <TableHead className="w-48">进度</TableHead>
              <TableHead className="text-right">进行中</TableHead>
              <TableHead className="text-right">丢弃</TableHead>
              <TableHead className="text-right">有问题</TableHead>
              <TableHead className="text-right">有修改</TableHead>
              <TableHead className="pr-4">最近保存</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.users.map((u) => {
              const fin = u.done + u.discarded
              return (
                <TableRow key={u.id}>
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{u.username}</span>
                      {u.role === "admin" && (
                        <Badge variant="secondary">{ROLES.admin}</Badge>
                      )}
                      {u.disabled && (
                        <Badge variant="destructive">已停用</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {u.assigned}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={u.assigned ? (100 * fin) / u.assigned : 0}
                        className="flex-1"
                      />
                      <span className="w-12 text-right font-mono text-xs">
                        {fin}/{u.assigned}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {u.in_progress}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {u.discarded}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {u.issues}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {u.modified}
                  </TableCell>
                  <TableCell className="pr-4 text-xs text-muted-foreground">
                    {formatTime(u.last_update)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
