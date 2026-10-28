import {
  BrowserRouter,
  HashRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router"
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { ApiError, BASE } from "@/lib/api"
import { useCurrentUser, useMe } from "@/hooks/use-auth"
import { AppShell } from "@/components/app-shell"
import { Toaster } from "@/components/ui/sonner"
import { Spinner } from "@/components/ui/spinner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { LoginPage } from "@/pages/login"
import { WorkspacePage } from "@/pages/workspace"
import { AdminLayout } from "@/pages/admin/layout"
import { AdminOverviewPage } from "@/pages/admin/overview"
import { AdminUsersPage } from "@/pages/admin/users"

// Static hosts without SPA fallback (GitHub Pages, file://) build with VITE_ROUTER=hash.
const Router =
  import.meta.env.VITE_ROUTER === "hash" ? HashRouter : BrowserRouter
const basename =
  import.meta.env.VITE_ROUTER === "hash"
    ? undefined
    : BASE.replace(/\/$/, "") || "/"

const onAuthError = (e: unknown) => {
  if (e instanceof ApiError && e.status === 401)
    queryClient.setQueryData(["me"], null)
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: onAuthError }),
  mutationCache: new MutationCache({ onError: onAuthError }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (n, e) => !(e instanceof ApiError && e.status < 500) && n < 2,
    },
  },
})

function FullScreenSpinner() {
  return (
    <div className="flex h-svh items-center justify-center">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  )
}

function Shell() {
  const { data: me, isPending } = useMe()
  if (isPending) return <FullScreenSpinner />
  if (!me) return <Navigate to="/" replace />
  return (
    <AppShell user={me}>
      <Outlet />
    </AppShell>
  )
}

function Landing() {
  const { data: me, isPending } = useMe()
  if (isPending) return <FullScreenSpinner />
  if (me) return <Navigate to="/tasks" replace />
  return <LoginPage />
}

function AdminGate() {
  const me = useCurrentUser()
  return me.role === "admin" ? (
    <AdminLayout />
  ) : (
    <Navigate to="/tasks" replace />
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router basename={basename}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Landing />} />
            <Route element={<Shell />}>
              <Route path="/tasks/:id?" element={<WorkspacePage />} />
              <Route path="/admin" element={<AdminGate />}>
                <Route index element={<AdminOverviewPage />} />
                <Route path="users" element={<AdminUsersPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <Toaster position="top-center" />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
