import {
  CircleCheckIcon,
  CircleDashedIcon,
  CircleIcon,
  CircleMinusIcon,
  CircleSlashIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { TaskStatus } from "@/lib/api"
import { STATUS } from "@/lib/labels"
import { Badge } from "@/components/ui/badge"

type S = TaskStatus | "unassigned"

const ICONS = {
  todo: CircleIcon,
  in_progress: CircleDashedIcon,
  done: CircleCheckIcon,
  discarded: CircleSlashIcon,
  unassigned: CircleMinusIcon,
}

const TONE: Record<S, string> = {
  todo: "text-muted-foreground",
  in_progress: "text-warning",
  done: "text-success",
  discarded: "text-destructive",
  unassigned: "text-muted-foreground/60",
}

const BADGE_TONE: Record<S, string> = {
  todo: "bg-muted text-muted-foreground",
  in_progress: "bg-warning-muted text-warning",
  done: "bg-success-muted text-success",
  discarded: "bg-destructive/10 text-destructive",
  unassigned: "bg-muted text-muted-foreground",
}

export function StatusIcon({
  status,
  className,
}: {
  status: S
  className?: string
}) {
  const Icon = ICONS[status]
  return (
    <Icon
      aria-label={STATUS[status]}
      className={cn("size-4 shrink-0", TONE[status], className)}
    />
  )
}

export function StatusBadge({ status }: { status: S }) {
  return (
    <Badge variant="secondary" className={BADGE_TONE[status]}>
      {STATUS[status]}
    </Badge>
  )
}
