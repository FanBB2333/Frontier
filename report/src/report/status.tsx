import {
  CheckCircleIcon,
  CircleDashedIcon,
  InfoIcon,
  QuestionIcon,
  WarningIcon,
  type Icon,
} from "@phosphor-icons/react"
import { Badge, type BadgeVariant } from "@cloudflare/kumo"

import type { Status } from "@/report/types"
import { cn } from "@/lib/utils"

export const STATUS_ORDER: Status[] = [
  "done",
  "doing",
  "decision",
  "risk",
  "info",
]

export const STATUS: Record<
  Status,
  { label: string; icon: Icon; dot: string; badge: BadgeVariant }
> = {
  done: {
    label: "已完成",
    icon: CheckCircleIcon,
    dot: "bg-kumo-success",
    badge: "success",
  },
  doing: {
    label: "进行中",
    icon: CircleDashedIcon,
    dot: "bg-kumo-info",
    badge: "info",
  },
  decision: {
    label: "待你决定",
    icon: QuestionIcon,
    dot: "bg-kumo-warning",
    badge: "warning",
  },
  risk: {
    label: "风险 / 不占优",
    icon: WarningIcon,
    dot: "bg-kumo-danger",
    badge: "error",
  },
  info: {
    label: "说明",
    icon: InfoIcon,
    dot: "bg-kumo-badge-neutral",
    badge: "secondary",
  },
}

export function StatusDot({
  status,
  className,
}: {
  status?: Status
  className?: string
}) {
  if (!status) return null
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-2 shrink-0 rounded-full",
        STATUS[status].dot,
        className
      )}
    />
  )
}

export function StatusBadge({ status }: { status?: Status }) {
  if (!status) return null
  return (
    <Badge variant={STATUS[status].badge} icon={STATUS[status].icon}>
      {STATUS[status].label}
    </Badge>
  )
}
