import { NavLink, Outlet } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { api, type Overview } from "@/lib/api"

export function useOverview() {
  return useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => api<Overview>("admin/overview"),
    refetchInterval: 30_000,
  })
}

const TABS = [
  { to: "/admin", label: "概览", end: true },
  { to: "/admin/users", label: "用户" },
]

export function AdminLayout() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b bg-card px-6">
        <nav className="mx-auto flex max-w-6xl gap-1 text-sm">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                cn(
                  "border-b-2 border-transparent px-3 py-2.5 text-muted-foreground hover:text-foreground",
                  isActive && "border-primary font-medium text-foreground"
                )
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
}
