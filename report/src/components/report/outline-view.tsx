import { CaretRightIcon } from "@phosphor-icons/react"

import type { ReportNode } from "@/report/types"
import { StatusDot } from "@/report/status"
import { levelName, type TreeViewProps } from "@/components/report/tree-view"
import { cn } from "@/lib/utils"

// Indented list of the same tree, for narrow screens and quick scanning.
export function OutlineView(props: TreeViewProps) {
  return (
    <div
      className="mx-auto w-full max-w-3xl px-3 pt-3 pb-24 sm:px-6"
      role="tree"
      aria-label="汇报大纲"
    >
      <Row {...props} node={props.root} depth={0} />
    </div>
  )
}

function Row(props: TreeViewProps & { node: ReportNode; depth: number }) {
  const {
    node,
    depth,
    expanded,
    selected,
    highlight,
    onSelect,
    onToggle,
    levels,
  } = props
  const kids = node.children ?? []
  const open = expanded.has(node.id) && kids.length > 0
  const dim = highlight !== null && !highlight.has(node.id)
  return (
    <div
      role="none"
      className={cn(depth > 0 && "border-l border-(--tree-line) pl-2 sm:pl-3")}
    >
      <div
        className={cn(
          "flex items-start gap-1 rounded-lg transition-opacity",
          dim && "opacity-35"
        )}
      >
        <button
          type="button"
          onClick={() => kids.length && onToggle(node.id)}
          aria-label={open ? `收起 ${node.title}` : `展开 ${node.title}`}
          disabled={!kids.length}
          className="mt-2 flex size-6 shrink-0 items-center justify-center rounded-md text-kumo-subtle hover:bg-kumo-tint disabled:invisible"
        >
          <CaretRightIcon
            className={cn("size-4 transition-transform", open && "rotate-90")}
          />
        </button>
        <button
          type="button"
          role="treeitem"
          aria-selected={selected === node.id}
          aria-expanded={kids.length ? open : undefined}
          data-node-id={node.id}
          onClick={() => onSelect(node.id)}
          onDoubleClick={() => kids.length && onToggle(node.id)}
          className={cn(
            "flex min-w-0 flex-1 flex-col gap-0.5 rounded-lg px-2 py-1.5 text-left outline-none hover:bg-kumo-tint focus-visible:ring-2 focus-visible:ring-kumo-focus",
            selected === node.id && "bg-kumo-tint ring-1 ring-kumo-brand"
          )}
        >
          <span className="flex items-center gap-2">
            <StatusDot status={node.status} />
            <span
              className={cn(
                "min-w-0 font-medium text-kumo-strong",
                depth === 0 ? "text-base" : "text-sm"
              )}
            >
              {node.title}
            </span>
            <span className="ml-auto shrink-0 text-[11px] text-kumo-subtle">
              {levelName(levels, depth)}
              {kids.length > 0 && ` · ${kids.length} 项`}
            </span>
          </span>
          <span className="text-xs leading-relaxed text-kumo-subtle">
            {node.summary}
          </span>
        </button>
      </div>
      {open && (
        <div role="group" className="mt-0.5 ml-3 flex flex-col gap-0.5">
          {kids.map((c) => (
            <Row key={c.id} {...props} node={c} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
