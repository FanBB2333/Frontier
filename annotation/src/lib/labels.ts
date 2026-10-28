import type { Role, TaskStatus } from "@/lib/api"

export const STATUS: Record<TaskStatus | "unassigned", string> = {
  todo: "未开始",
  in_progress: "进行中",
  done: "已完成",
  discarded: "已丢弃",
  unassigned: "未分配",
}

export const ROLES: Record<Role, string> = {
  admin: "管理员",
  annotator: "标注员",
}

export function formatTime(iso: string | null | undefined) {
  if (!iso) return "—"
  const d = new Date(iso)
  return d.toLocaleString("zh-CN", {
    hour12: false,
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const padIdx = (idx: number) => `#${String(idx).padStart(4, "0")}`
