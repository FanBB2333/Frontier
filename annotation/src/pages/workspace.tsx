import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { InboxIcon } from "lucide-react"
import { api, type SampleResponse, type TasksResponse } from "@/lib/api"
import { buildNav, SampleEditor } from "@/components/sample-editor"
import { TaskList, type TaskFilter } from "@/components/task-list"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"

/** Always refetched on open, so the editor starts from the latest saved version. */
export function useSample(id: string | undefined) {
  return useQuery({
    queryKey: ["sample", id],
    queryFn: () => api<SampleResponse>(`samples/${encodeURIComponent(id!)}`),
    enabled: Boolean(id),
    staleTime: 0,
  })
}

export function EditorSkeleton() {
  return (
    <div className="grid gap-4 p-4 xl:grid-cols-[5fr_6fr]">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-64" />
        <Skeleton className="h-32" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-48" />
        <Skeleton className="h-40" />
        <Skeleton className="h-24" />
      </div>
    </div>
  )
}

export function WorkspacePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<TaskFilter>("all")
  const [query, setQuery] = useState("")
  const tasks = useQuery({
    queryKey: ["tasks"],
    queryFn: () => api<TasksResponse>("tasks"),
  })
  const items = useMemo(() => tasks.data?.items ?? [], [tasks.data])
  const sample = useSample(id)

  useEffect(() => {
    if (!id && items.length) {
      const first =
        items.find((t) => t.status === "todo" || t.status === "in_progress") ??
        items[0]
      navigate(`/tasks/${encodeURIComponent(first.id)}`, { replace: true })
    }
  }, [id, items, navigate])

  if (tasks.isSuccess && items.length === 0) {
    return (
      <Empty className="h-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <InboxIcon />
          </EmptyMedia>
          <EmptyTitle>还没有分配给你的样本</EmptyTitle>
          <EmptyDescription>请联系管理员为你分配检查任务。</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex h-full">
      <TaskList
        items={items}
        activeId={id}
        filter={filter}
        onFilter={setFilter}
        query={query}
        onQuery={setQuery}
        basePath="/tasks"
      />
      <main className="min-w-0 flex-1 overflow-y-auto">
        {sample.isError ? (
          <div className="p-4">
            <Alert variant="destructive">
              <AlertTitle>无法载入样本</AlertTitle>
              <AlertDescription>
                {(sample.error as Error).message}
              </AlertDescription>
            </Alert>
          </div>
        ) : sample.data && sample.isFetchedAfterMount && id ? (
          <SampleEditor
            key={id}
            resp={sample.data}
            nav={buildNav(items, id, "/tasks")}
          />
        ) : (
          <EditorSkeleton />
        )}
      </main>
    </div>
  )
}
