import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router"
import { useQueryClient } from "@tanstack/react-query"
import { CircleAlertIcon, InfoIcon } from "lucide-react"
import { APP_NAME } from "@/lib/app"
import { api, USE_MOCK, type User } from "@/lib/api"
import { LogoMark } from "@/components/app-shell"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

export function LoginPage() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setBusy(true)
    setError("")
    try {
      const user = await api<User>("login", {
        method: "POST",
        json: { username: fd.get("username"), password: fd.get("password") },
      })
      qc.setQueryData(["me"], user)
      navigate("/tasks", { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-6 py-12">
      <main className="grid w-full max-w-4xl items-center gap-10 md:grid-cols-[1fr_380px] md:gap-16">
        <div className="flex flex-col gap-5">
          <LogoMark className="size-10 rounded-lg text-xl" />
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {APP_NAME}
            </h1>
            <p className="text-muted-foreground md:text-lg">
              逐条检查模型回复：修改字段、回答检查项、记录问题，进度自动保存。
            </p>
          </div>
        </div>
        <Card>
          <CardContent>
            <form onSubmit={submit} className="flex flex-col gap-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="username">用户名</FieldLabel>
                  <Input
                    id="username"
                    name="username"
                    autoComplete="username"
                    autoFocus
                    required
                    defaultValue={USE_MOCK ? "admin" : undefined}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">密码</FieldLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    defaultValue={USE_MOCK ? "admin" : undefined}
                  />
                </Field>
              </FieldGroup>
              {error && (
                <Alert variant="destructive">
                  <CircleAlertIcon />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {USE_MOCK && (
                <Alert>
                  <InfoIcon />
                  <AlertDescription>
                    演示模式：admin / alice / bob / carol，密码与用户名相同。
                  </AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                size="lg"
                disabled={busy}
                className="w-full"
              >
                {busy && <Spinner data-icon="inline-start" />}
                登录
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
