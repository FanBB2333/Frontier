import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react"
import { Button, LayerCard } from "@cloudflare/kumo"

import type { ReportNode } from "@/report/types"
import type { TreeIndex } from "@/report/tree"
import { StatusDot } from "@/report/status"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

export interface TreeViewProps {
  root: ReportNode
  index: TreeIndex
  levels: string[]
  expanded: Set<string>
  selected: string
  // nodes to emphasise; null means no filter is active
  highlight: Set<string> | null
  onSelect: (id: string) => void
  onToggle: (id: string) => void
}

export function levelName(levels: string[], depth: number) {
  return depth === 0 ? "总览" : (levels[depth - 1] ?? `第 ${depth} 层`)
}

// Layout: the root on top, the first level side by side, and every deeper level hanging
// down inside its first-level column, so the width stays at one column per topic.
export function TreeView(props: TreeViewProps) {
  const { root, expanded, index, selected } = props
  const onPath = new Set(index.get(selected)?.path ?? [])
  const kids = root.children ?? []
  return (
    <div className="org w-max px-2 pt-2 pb-6" role="tree" aria-label="汇报树">
      <ul>
        <li role="none">
          <NodeCard {...props} node={root} depth={0} pill="center" />
          {expanded.has(root.id) && kids.length > 0 && (
            <ul role="group">
              {kids.map((c) => (
                <li
                  key={c.id}
                  role="none"
                  className={cn(onPath.has(c.id) && "on-path")}
                >
                  <div className="flex w-(--node-width) flex-col">
                    <NodeCard {...props} node={c} depth={1} pill="left" />
                    {expanded.has(c.id) && c.children?.length ? (
                      <VList
                        {...props}
                        nodes={c.children}
                        depth={2}
                        onPath={onPath}
                      />
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </li>
      </ul>
    </div>
  )
}

function VList(
  props: TreeViewProps & {
    nodes: ReportNode[]
    depth: number
    onPath: Set<string>
  }
) {
  const { nodes, depth, expanded, onPath } = props
  return (
    <div className="vtree" role="group">
      {nodes.map((n) => (
        <div
          key={n.id}
          role="none"
          className={cn("vnode", onPath.has(n.id) && "on-path")}
        >
          <NodeCard {...props} node={n} depth={depth} pill="left" />
          {expanded.has(n.id) && n.children?.length ? (
            <VList {...props} nodes={n.children} depth={depth + 1} />
          ) : null}
        </div>
      ))}
    </div>
  )
}

const CLAMP: Record<number, string> = { 2: "line-clamp-2", 3: "line-clamp-3" }

function NodeCard(
  props: TreeViewProps & {
    node: ReportNode
    depth: number
    pill: "center" | "left"
  }
) {
  const {
    node,
    depth,
    pill,
    expanded,
    selected,
    highlight,
    onSelect,
    onToggle,
    levels,
  } = props
  const { card, clamp } = useTheme().style
  const kids = node.children ?? []
  const open = expanded.has(node.id) && kids.length > 0
  const isRoot = depth === 0
  const dim = highlight !== null && !highlight.has(node.id)
  const pad = depth <= 1 ? "p-3" : "p-2.5"

  const level = (
    <>
      <StatusDot status={node.status} />
      {levelName(levels, depth)}
    </>
  )
  const text = (
    <>
      <span
        className={cn(
          "leading-snug font-medium",
          isRoot
            ? "text-lg"
            : depth === 1
              ? "text-base text-kumo-strong"
              : "text-sm text-kumo-strong"
        )}
      >
        {node.title}
      </span>
      <span
        className={cn(
          "text-xs leading-relaxed",
          isRoot ? "text-white/85" : cn("text-kumo-subtle", CLAMP[clamp])
        )}
      >
        {node.summary}
      </span>
    </>
  )

  return (
    // the column sets the first-level width; deeper cards fill what is left after the indentation
    <div
      className={cn(
        "relative",
        isRoot ? "w-[max(20rem,var(--node-width))]" : "w-full"
      )}
    >
      <LayerCard
        render={<button type="button" />}
        role="treeitem"
        aria-selected={selected === node.id}
        aria-expanded={kids.length ? open : undefined}
        data-node-id={node.id}
        onClick={() => onSelect(node.id)}
        onDoubleClick={() => kids.length && onToggle(node.id)}
        className={cn(
          "rounded-(--card-radius) text-left shadow-xs transition-[opacity,box-shadow,transform] outline-none hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-kumo-focus",
          card === "flat" && cn("flex flex-col gap-1", pad),
          card === "flat" && isRoot && "bg-kumo-brand text-white ring-0",
          selected === node.id && "ring-2 ring-kumo-brand",
          dim && "opacity-35"
        )}
      >
        {card === "layered" ? (
          <>
            <LayerCard.Secondary className="my-0 gap-1.5 px-3 py-1.5 text-xs font-normal">
              {level}
            </LayerCard.Secondary>
            <LayerCard.Primary
              className={cn(
                "gap-1 rounded-(--card-radius)",
                pad,
                isRoot && "bg-kumo-brand text-white ring-0"
              )}
            >
              {text}
            </LayerCard.Primary>
          </>
        ) : (
          <>
            <span
              className={cn(
                "flex items-center gap-1.5 text-[11px]",
                isRoot ? "text-white/75" : "text-kumo-subtle"
              )}
            >
              {level}
            </span>
            {text}
          </>
        )}
      </LayerCard>
      {kids.length > 0 && (
        <Button
          size="xs"
          variant="secondary"
          icon={open ? CaretUpIcon : CaretDownIcon}
          onClick={() => onToggle(node.id)}
          aria-label={open ? `收起 ${node.title}` : `展开 ${node.title}`}
          className={cn(
            "absolute -bottom-2.5 z-10 rounded-full shadow-xs",
            pill === "center" ? "left-1/2 -translate-x-1/2" : "left-1.5"
          )}
        >
          {open ? "收起" : `${kids.length} 项`}
        </Button>
      )}
    </div>
  )
}
