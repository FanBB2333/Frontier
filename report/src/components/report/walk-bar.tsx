import {
  CaretLeftIcon,
  CaretRightIcon,
  FileTextIcon,
  XIcon,
} from "@phosphor-icons/react"
import { Button, LayerCard, Meter, Switch } from "@cloudflare/kumo"

import type { TreeIndex } from "@/report/tree"
import { StatusDot } from "@/report/status"
import { levelName } from "@/components/report/tree-view"
import { Kbd } from "@/components/kbd"

export interface WalkBarProps {
  index: TreeIndex
  levels: string[]
  order: string[]
  step: number
  focus: boolean
  onFocusChange: (v: boolean) => void
  onStep: (i: number) => void
  onExit: () => void
  // narrow screens: open the detail sheet
  onDetail?: () => void
}

// Controls of the top-down walk: one node per step, in depth-first order.
export function WalkBar({
  index,
  levels,
  order,
  step,
  focus,
  onFocusChange,
  onStep,
  onExit,
  onDetail,
}: WalkBarProps) {
  const entry = index.get(order[step])
  if (!entry) return null
  const { node, depth } = entry
  return (
    <LayerCard className="pointer-events-auto mx-auto flex w-full max-w-2xl flex-col gap-2 p-3 shadow-lg">
      <div className="flex items-center gap-2 text-xs text-kumo-subtle">
        <span className="font-medium text-kumo-strong">汇报模式</span>
        <span>{levelName(levels, depth)}</span>
        <span className="ml-auto hidden items-center gap-1 sm:flex">
          <Kbd>←</Kbd>
          <Kbd>→</Kbd>
          翻页
          <Kbd>Esc</Kbd>
          退出
        </span>
      </div>
      <Meter
        label="汇报进度"
        value={((step + 1) / order.length) * 100}
        customValue={`第 ${step + 1} / ${order.length} 步`}
      />
      <div className="flex items-start gap-2">
        <StatusDot status={node.status} className="mt-1.5" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm font-medium text-kumo-strong">
            {node.title}
          </span>
          <span className="line-clamp-2 text-xs text-kumo-subtle">
            {node.summary}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            icon={CaretLeftIcon}
            disabled={step === 0}
            onClick={() => onStep(step - 1)}
          >
            上一步
          </Button>
          <Button
            size="sm"
            variant="primary"
            disabled={step === order.length - 1}
            onClick={() => onStep(step + 1)}
          >
            下一步
            <CaretRightIcon />
          </Button>
        </div>
        <Switch
          size="sm"
          label="只展开当前分支"
          checked={focus}
          onCheckedChange={onFocusChange}
        />
        {onDetail && (
          <Button size="sm" icon={FileTextIcon} onClick={onDetail}>
            详情
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          icon={XIcon}
          className="ml-auto"
          onClick={onExit}
        >
          退出
        </Button>
      </div>
    </LayerCard>
  )
}
