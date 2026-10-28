import { useQuery, useQueryClient } from "@tanstack/react-query"
import { api, ApiError, type User } from "@/lib/api"

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () =>
      api<User>("me").catch((e) => {
        if (e instanceof ApiError && e.status === 401) return null
        throw e
      }),
    staleTime: 5 * 60_000,
    retry: false,
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return async () => {
    await api("logout", { method: "POST" }).catch(() => {})
    qc.clear()
    qc.setQueryData(["me"], null)
  }
}

/** For pages rendered inside the authenticated shell, where the user is always loaded. */
export function useCurrentUser(): User {
  const { data } = useMe()
  return data!
}
