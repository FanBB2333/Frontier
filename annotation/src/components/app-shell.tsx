import { useState, type FormEvent, type ReactNode } from "react"
import { NavLink, useNavigate } from "react-router"
import { useQueryClient } from "@tanstack/react-query"
import {
  ChevronDownIcon,
  DatabaseBackupIcon,
  KeyRoundIcon,
  LogOutIcon,
  PaletteIcon,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { APP_NAME } from "@/lib/app"
import { api, USE_MOCK, type User } from "@/lib/api"
import { ROLES } from "@/lib/labels"
import type { ThemeChoice } from "@/lib/theme"
import { useLogout } from "@/hooks/use-auth"
import { useTheme } from "@/hooks/use-theme"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-6 items-center justify-center rounded-md bg-brand text-[13px] font-bold text-brand-foreground",
        className
      )}
    >
      F
    </span>
  )
}

export function Logo({ className }: { className?: string }) {
  const [name, ...rest] = APP_NAME.split(" ")
  return (
    <span
      className={cn(
        "flex items-center gap-2 font-semibold tracking-tight",
        className
      )}
    >
      <LogoMark />
      <span>
        {name}{" "}
        <span className="font-normal text-muted-foreground">
          {rest.join(" ")}
        </span>
      </span>
    </span>
  )
}

const THEME_LABELS: Record<ThemeChoice, string> = {
  light: "浅色",
  dark: "深色",
  system: "跟随系统",
}

function PasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    if (fd.get("new") !== fd.get("confirm"))
      return toast.error("两次输入的新密码不一致")
    setBusy(true)
    try {
      await api("me/password", {
        method: "POST",
        json: { old_password: fd.get("old"), new_password: fd.get("new") },
      })
      toast.success("密码已更新")
      onOpenChange(false)
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>修改密码</DialogTitle>
            <DialogDescription>新密码至少 8 位。</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="pw-old">当前密码</FieldLabel>
              <Input
                id="pw-old"
                name="old"
                type="password"
                autoComplete="current-password"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="pw-new">新密码</FieldLabel>
              <Input
                id="pw-new"
                name="new"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="pw-confirm">确认新密码</FieldLabel>
              <Input
                id="pw-confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={busy}>
              保存
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function AppShell({
  user,
  children,
}: {
  user: User
  children: ReactNode
}) {
  const logout = useLogout()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { theme, setTheme } = useTheme()
  const [pwOpen, setPwOpen] = useState(false)
  const links = [
    { to: "/tasks", label: "标注工作台" },
    ...(user.role === "admin" ? [{ to: "/admin", label: "管理" }] : []),
  ]

  const resetDemo = async () => {
    const { resetMockData } = await import("@/lib/mock")
    resetMockData()
    await qc.invalidateQueries()
    navigate("/tasks", { replace: true })
    toast.success("已恢复为初始样例数据")
  }

  return (
    <div className="flex h-svh flex-col">
      <header className="flex h-12 shrink-0 items-center gap-6 border-b bg-card px-4">
        <NavLink to="/tasks">
          <Logo className="text-sm" />
        </NavLink>
        <nav className="flex h-full items-stretch gap-1 text-sm">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center border-b-2 border-transparent px-2.5 text-muted-foreground transition-colors hover:text-foreground",
                  isActive && "border-primary font-medium text-foreground"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {USE_MOCK && (
            <Badge
              variant="outline"
              className="hidden text-muted-foreground sm:inline-flex"
            >
              演示数据
            </Badge>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
              {user.username}
              <ChevronDownIcon data-icon="inline-end" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  {user.username}
                  <div className="text-xs font-normal text-muted-foreground">
                    {ROLES[user.role]}
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setPwOpen(true)}>
                  <KeyRoundIcon />
                  修改密码
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <PaletteIcon />
                    主题
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={theme}
                      onValueChange={(v) => setTheme(v as ThemeChoice)}
                    >
                      {(Object.keys(THEME_LABELS) as ThemeChoice[]).map((t) => (
                        <DropdownMenuRadioItem key={t} value={t}>
                          {THEME_LABELS[t]}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                {USE_MOCK && (
                  <DropdownMenuItem onClick={resetDemo}>
                    <DatabaseBackupIcon />
                    重置演示数据
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={async () => {
                    await logout()
                    navigate("/", { replace: true })
                  }}
                >
                  <LogOutIcon />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="min-h-0 flex-1">{children}</div>
      <PasswordDialog open={pwOpen} onOpenChange={setPwOpen} />
    </div>
  )
}
