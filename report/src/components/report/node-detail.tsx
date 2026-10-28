import { Fragment, type MouseEvent } from "react"
import {
  ArrowUpIcon,
  CaretRightIcon,
  CrosshairIcon,
  FileTextIcon,
} from "@phosphor-icons/react"
import { Breadcrumbs, Button, LayerCard, Table, Text } from "@cloudflare/kumo"

import type { TreeIndex } from "@/report/tree"
import { RichText } from "@/report/rich-text"
import { StatusBadge, StatusDot } from "@/report/status"
import { levelName } from "@/components/report/tree-view"

export interface NodeDetailProps {
  index: TreeIndex
  levels: string[]
  id: string
  onSelect: (id: string) => void
  onLocate: (id: string) => void
}

export function NodeDetail({
  index,
  levels,
  id,
  onSelect,
  onLocate,
}: NodeDetailProps) {
  const entry = index.get(id)
  if (!entry) return null
  const { node, depth, path, parent } = entry
  const kids = node.children ?? []

  // Kumo's breadcrumb links are anchors; a click on one selects that node instead of navigating
  const onCrumb = (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest("a[href^='#']")
    if (!a) return
    e.preventDefault()
    onSelect(decodeURIComponent(a.getAttribute("href")!.slice(1)))
  }

  return (
    <article className="flex flex-col gap-4 p-4">
      {path.length > 1 && (
        <nav aria-label="所在位置" onClick={onCrumb}>
          <Breadcrumbs size="sm">
            {path.map((pid, i) => {
              const p = index.get(pid)!.node
              const last = i === path.length - 1
              return (
                <Fragment key={pid}>
                  {last ? (
                    <Breadcrumbs.Current>{p.title}</Breadcrumbs.Current>
                  ) : (
                    <>
                      <Breadcrumbs.Link href={`#${encodeURIComponent(pid)}`}>
                        {p.title}
                      </Breadcrumbs.Link>
                      <Breadcrumbs.Separator />
                    </>
                  )}
                </Fragment>
              )
            })}
          </Breadcrumbs>
        </nav>
      )}

      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-kumo-subtle">
          <StatusBadge status={node.status} />
          <span>{levelName(levels, depth)}</span>
        </div>
        <Text variant="heading" as="h2">
          {node.title}
        </Text>
        <p className="text-sm leading-relaxed text-kumo-subtle">
          <RichText text={node.summary} />
        </p>
      </header>

      <hr className="border-kumo-hairline" />

      {node.body?.map((t, i) => (
        <p key={i} className="text-sm leading-relaxed">
          <RichText text={t} />
        </p>
      ))}

      {node.points && (
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed marker:text-kumo-subtle">
          {node.points.map((t, i) => (
            <li key={i}>
              <RichText text={t} />
            </li>
          ))}
        </ul>
      )}

      {node.metrics && (
        <div className="grid grid-cols-2 gap-2">
          {node.metrics.map((m) => (
            <LayerCard key={m.label} className="rounded-(--card-radius)">
              <LayerCard.Secondary className="my-0 px-3 py-1.5 text-xs font-normal">
                {m.label}
              </LayerCard.Secondary>
              <LayerCard.Primary className="gap-0.5 rounded-(--card-radius) p-3">
                <span className="text-lg font-semibold text-kumo-strong tabular-nums">
                  {m.value}
                </span>
                {m.note && (
                  <span className="text-xs text-kumo-subtle">{m.note}</span>
                )}
              </LayerCard.Primary>
            </LayerCard>
          ))}
        </div>
      )}

      {node.table && (
        <figure className="flex flex-col gap-2">
          <LayerCard className="overflow-x-auto rounded-(--card-radius)">
            <Table className="text-xs [&_td]:px-2 [&_td]:py-1.5 [&_th]:px-2 [&_th]:py-2 [&_th]:text-xs">
              <Table.Header>
                <Table.Row>
                  {node.table.columns.map((c, i) => (
                    <Table.Head key={i}>{c}</Table.Head>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {node.table.rows.map((r, i) => (
                  <Table.Row
                    key={i}
                    variant={
                      node.table?.highlight?.includes(i)
                        ? "selected"
                        : "default"
                    }
                  >
                    {r.map((c, j) => (
                      <Table.Cell key={j}>{c}</Table.Cell>
                    ))}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </LayerCard>
          {node.table.caption && (
            <figcaption className="text-xs text-kumo-subtle">
              {node.table.caption}
            </figcaption>
          )}
        </figure>
      )}

      {kids.length > 0 && (
        <section className="flex flex-col gap-1.5">
          <h3 className="text-xs font-medium text-kumo-subtle">
            下一层：{levelName(levels, depth + 1)}
          </h3>
          {kids.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className="flex items-start gap-2 rounded-(--card-radius) bg-kumo-base px-3 py-2 text-left ring ring-kumo-hairline hover:bg-kumo-tint"
            >
              <StatusDot status={c.status} className="mt-1.5" />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-medium text-kumo-strong">
                  {c.title}
                </span>
                <span className="text-xs text-kumo-subtle">{c.summary}</span>
              </span>
              <CaretRightIcon className="mt-1 size-4 shrink-0 text-kumo-subtle" />
            </button>
          ))}
        </section>
      )}

      {node.sources && (
        <section className="flex flex-col gap-1.5">
          <h3 className="text-xs font-medium text-kumo-subtle">出处</h3>
          <ul className="flex flex-col gap-1">
            {node.sources.map((s) => (
              <li key={s} className="flex items-start gap-1.5 text-xs">
                <FileTextIcon className="mt-0.5 size-3.5 shrink-0 text-kumo-subtle" />
                <code className="font-mono break-all">{s}</code>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        {parent && (
          <Button size="sm" icon={ArrowUpIcon} onClick={() => onSelect(parent)}>
            上一级
          </Button>
        )}
        <Button size="sm" icon={CrosshairIcon} onClick={() => onLocate(id)}>
          在图中定位
        </Button>
      </div>
    </article>
  )
}
