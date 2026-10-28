import type { ReportNode, Status } from "@/report/types"

export interface Indexed {
  node: ReportNode
  depth: number
  parent: string | null
  // ids from the root down to this node, inclusive
  path: string[]
}

export type TreeIndex = Map<string, Indexed>

export function indexTree(root: ReportNode): TreeIndex {
  const index: TreeIndex = new Map()
  const walk = (
    node: ReportNode,
    depth: number,
    parent: string | null,
    path: string[]
  ) => {
    if (index.has(node.id)) throw new Error(`duplicate node id: ${node.id}`)
    const here = [...path, node.id]
    index.set(node.id, { node, depth, parent, path: here })
    node.children?.forEach((c) => walk(c, depth + 1, node.id, here))
  }
  walk(root, 0, null, [])
  return index
}

// Depth-first pre-order: the order of a top-down walk through the report.
export function preorder(root: ReportNode, maxDepth = Infinity): string[] {
  const out: string[] = []
  const walk = (node: ReportNode, depth: number) => {
    if (depth > maxDepth) return
    out.push(node.id)
    node.children?.forEach((c) => walk(c, depth + 1))
  }
  walk(root, 0)
  return out
}

export function maxDepthOf(index: TreeIndex): number {
  let d = 0
  index.forEach((v) => (d = Math.max(d, v.depth)))
  return d
}

// ids of nodes that have children and lie above the given depth
export function expandedToDepth(index: TreeIndex, depth: number): Set<string> {
  const s = new Set<string>()
  index.forEach((v, id) => {
    if (v.depth < depth && v.node.children?.length) s.add(id)
  })
  return s
}

// all strict ancestors of the given ids
export function ancestorsOf(
  index: TreeIndex,
  ids: Iterable<string>
): Set<string> {
  const s = new Set<string>()
  for (const id of ids)
    index
      .get(id)
      ?.path.slice(0, -1)
      .forEach((a) => s.add(a))
  return s
}

// counts the leaves only: inner nodes summarise their children and would be counted twice
export function statusCounts(index: TreeIndex): Record<Status, number> {
  const c: Record<Status, number> = {
    done: 0,
    doing: 0,
    decision: 0,
    risk: 0,
    info: 0,
  }
  index.forEach((v) => {
    if (v.depth > 0 && !v.node.children?.length && v.node.status)
      c[v.node.status]++
  })
  return c
}

function nodeText(n: ReportNode): string {
  return [
    n.title,
    n.summary,
    ...(n.body ?? []),
    ...(n.points ?? []),
    ...(n.metrics ?? []).flatMap((m) => [m.label, m.value, m.note ?? ""]),
    ...(n.table
      ? [n.table.caption ?? "", ...n.table.columns, ...n.table.rows.flat()]
      : []),
    ...(n.sources ?? []),
  ]
    .join("\n")
    .toLowerCase()
}

export function search(
  index: TreeIndex,
  order: string[],
  query: string
): string[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return order.filter((id) => nodeText(index.get(id)!.node).includes(q))
}
