import { useState, type FormEvent } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"
import { api, type Role, type User } from "@/lib/api"
import { ROLES, formatTime } from "@/lib/labels"
import { useCurrentUser } from "@/hooks/use-auth"
import { useOverview } from "@/pages/admin/layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const ROLE_ITEMS = (Object.keys(ROLES) as Role[]).map((r) => ({
  value: r,
  label: ROLES[r],
}))

function RoleSelect({
  value,
  onChange,
  disabled,
  id,
}: {
  value: Role
  onChange: (r: Role) => void
  disabled?: boolean
  id?: string
}) {
  return (
    <Select
      items={ROLE_ITEMS}
      value={value}
      disabled={disabled}
      onValueChange={(v) => onChange(v as Role)}
    >
      <SelectTrigger id={id} size="sm" className="w-28" aria-label="角色">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {ROLE_ITEMS.map((r) => (
            <SelectItem key={r.value} value={r.value}>
              {r.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

function CreateUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const qc = useQueryClient()
  const [role, setRole] = useState<Role>("annotator")
  const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setBusy(true)
    try {
      const user = await api<User>("admin/users", {
        method: "POST",
        json: {
          username: fd.get("username"),
          password: fd.get("password"),
          role,
        },
      })
      toast.success(`已创建 ${user.username}`)
      await qc.invalidateQueries({ queryKey: ["admin"] })
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
            <DialogTitle>新建用户</DialogTitle>
            <DialogDescription>
              把初始密码告诉对方，登录后可自行修改。
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="new-username">用户名</FieldLabel>
              <Input
                id="new-username"
                name="username"
                autoComplete="off"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="new-password">初始密码</FieldLabel>
              <Input
                id="new-password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="new-role">角色</FieldLabel>
              <RoleSelect id="new-role" value={role} onChange={setRole} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={busy}>
              创建
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function AdminUsersPage() {
  const me = useCurrentUser()
  const qc = useQueryClient()
  const { data } = useOverview()
  const [open, setOpen] = useState(false)
  const patch = useMutation({
    mutationFn: ({
      id,
      ...json
    }: {
      id: number
      disabled?: boolean
      role?: Role
    }) => api<User>(`admin/users/${id}`, { method: "PATCH", json }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
    onError: (e) => toast.error((e as Error).message),
  })
  if (!data) return <Skeleton className="m-6 h-96" />

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 p-6">
      <Card className="pb-0">
        <CardHeader>
          <CardTitle>用户</CardTitle>
          <CardDescription>
            停用的账号无法登录，已保存的标注保留。
          </CardDescription>
          <CardAction>
            <Button size="sm" onClick={() => setOpen(true)}>
              <PlusIcon data-icon="inline-start" />
              新建用户
            </Button>
          </CardAction>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">用户名</TableHead>
              <TableHead>角色</TableHead>
              <TableHead className="text-right">已分配</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>最近在线</TableHead>
              <TableHead className="pr-4 text-right">启用</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.users.map((u) => {
              const self = u.id === me.id
              return (
                <TableRow key={u.id}>
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{u.username}</span>
                      {self && <Badge variant="secondary">你</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <RoleSelect
                      value={u.role}
                      disabled={self}
                      onChange={(role) => patch.mutate({ id: u.id, role })}
                    />
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {u.assigned}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatTime(u.created_at)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatTime(u.last_seen_at)}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <Switch
                      checked={!u.disabled}
                      disabled={self}
                      onCheckedChange={(on) =>
                        patch.mutate({ id: u.id, disabled: !on })
                      }
                      aria-label={`启用 ${u.username}`}
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
      <CreateUserDialog key={String(open)} open={open} onOpenChange={setOpen} />
    </div>
  )
}
