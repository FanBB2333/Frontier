import { useState, type ReactNode } from "react"
import {
  ArrowCounterClockwiseIcon,
  GearSixIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
  type Icon,
} from "@phosphor-icons/react"
import { Button, Popover, Radio, Slider, Tabs } from "@cloudflare/kumo"

import {
  ACCENTS,
  CANVAS_MIN,
  MODES,
  NODE_WIDTH_RANGE,
  PANEL_WIDTH_MIN,
  useTheme,
  type Accent,
  type CardStyle,
  type Mode,
  type Radius,
  type Spacing,
} from "@/components/theme-provider"
import { Kbd } from "@/components/kbd"

const MODE_META: Record<Mode, { label: string; icon: Icon }> = {
  light: { label: "浅色", icon: SunIcon },
  dark: { label: "深色", icon: MoonIcon },
  system: { label: "跟随系统", icon: MonitorIcon },
}

// swatches repeat the light-mode brand colour of each theme in index.css
const ACCENT_META: Record<Accent, { label: string; swatch: string }> = {
  kumo: { label: "Kumo 蓝", swatch: "oklch(0.5772 0.2324 260)" },
  orange: { label: "Cloudflare 橙", swatch: "#c2410c" },
  green: { label: "森林绿", swatch: "#15803d" },
  violet: { label: "紫罗兰", swatch: "#6d28d9" },
}

const SHORTCUTS: [ReactNode, string][] = [
  [<Kbd>↑</Kbd>, "上一级"],
  [<Kbd>↓</Kbd>, "下一层"],
  [
    <>
      <Kbd>←</Kbd>
      <Kbd>→</Kbd>
    </>,
    "同级切换；汇报中翻页",
  ],
  [<Kbd>Enter</Kbd>, "展开 / 收起"],
  [<Kbd>/</Kbd>, "搜索"],
  [<Kbd>p</Kbd>, "汇报模式"],
  [<Kbd>Esc</Kbd>, "退出汇报"],
  [<Kbd>d</Kbd>, "浅色 / 深色"],
]

type Tab = "look" | "parts" | "keys"

// Page settings: colours, component style and the keyboard shortcuts. Every change
// applies at once and is remembered in the browser.
export function SettingsMenu() {
  const [tab, setTab] = useState<Tab>("look")
  return (
    <Popover.Root>
      <Popover.Trigger
        render={<Button shape="square" icon={GearSixIcon} aria-label="设置" />}
      />
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={6}>
          <Popover.Popup className="flex max-h-[calc(100svh-5rem)] w-96 max-w-[calc(100vw-2rem)] flex-col gap-3 overflow-y-auto p-4">
            <Popover.Title>设置</Popover.Title>
            <Tabs
              variant="underline"
              size="sm"
              value={tab}
              onValueChange={(v) => setTab(v as Tab)}
              tabs={[
                { value: "look", label: "外观" },
                { value: "parts", label: "组件" },
                { value: "keys", label: "快捷键" },
              ]}
            />
            {tab === "look" && <LookSettings />}
            {tab === "parts" && <PartSettings />}
            {tab === "keys" && <Shortcuts />}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

function LookSettings() {
  const { mode, accent, setMode, setAccent } = useTheme()
  return (
    <div className="flex flex-col gap-4">
      <Radio.Group
        appearance="segmented"
        legend="明暗"
        value={mode}
        onValueChange={(v) => setMode(v as Mode)}
      >
        {MODES.map((m) => {
          const I = MODE_META[m].icon
          return (
            <Radio.Item
              key={m}
              value={m}
              label={
                <span className="flex items-center gap-1.5">
                  <I />
                  {MODE_META[m].label}
                </span>
              }
            />
          )
        })}
      </Radio.Group>

      <Radio.Group
        appearance="card"
        orientation="horizontal"
        legend="主题色"
        value={accent}
        onValueChange={(v) => setAccent(v as Accent)}
      >
        {ACCENTS.map((a) => (
          <Radio.Item
            key={a}
            value={a}
            label={
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="size-3.5 shrink-0 rounded-full"
                  style={{ background: ACCENT_META[a].swatch }}
                />
                {ACCENT_META[a].label}
              </span>
            }
          />
        ))}
      </Radio.Group>
    </div>
  )
}

function Choice({
  legend,
  value,
  options,
  onChange,
}: {
  legend: string
  value: string
  options: [value: string, label: string][]
  onChange: (value: string) => void
}) {
  return (
    <Radio.Group
      appearance="segmented"
      legend={legend}
      value={value}
      onValueChange={(v) => onChange(v as string)}
    >
      {options.map(([v, label]) => (
        <Radio.Item key={v} value={v} label={label} />
      ))}
    </Radio.Group>
  )
}

function PartSettings() {
  const { style, setStyle, resetStyle } = useTheme()
  // the detail panel exists on wide screens only
  const wide = window.innerWidth >= 1024
  const panelMax = Math.max(PANEL_WIDTH_MIN, window.innerWidth - CANVAS_MIN)
  return (
    <div className="flex flex-col gap-4">
      <Slider
        label="节点宽度（px）"
        min={NODE_WIDTH_RANGE.min}
        max={NODE_WIDTH_RANGE.max}
        step={8}
        value={style.nodeWidth}
        onValueChange={(v) => setStyle({ nodeWidth: v })}
      />
      {wide && (
        <Slider
          label="详情面板宽度（px）"
          min={PANEL_WIDTH_MIN}
          max={panelMax}
          step={10}
          value={Math.min(style.panelWidth, panelMax)}
          onValueChange={(v) => setStyle({ panelWidth: v })}
        />
      )}
      <Choice
        legend="卡片样式"
        value={style.card}
        options={[
          ["layered", "分层"],
          ["flat", "简洁"],
        ]}
        onChange={(v) => setStyle({ card: v as CardStyle })}
      />
      <Choice
        legend="圆角"
        value={style.radius}
        options={[
          ["none", "直角"],
          ["small", "小"],
          ["large", "大"],
        ]}
        onChange={(v) => setStyle({ radius: v as Radius })}
      />
      <Choice
        legend="节点间距"
        value={style.spacing}
        options={[
          ["compact", "紧凑"],
          ["normal", "标准"],
          ["loose", "宽松"],
        ]}
        onChange={(v) => setStyle({ spacing: v as Spacing })}
      />
      <Choice
        legend="卡片摘要"
        value={String(style.clamp)}
        options={[
          ["2", "2 行"],
          ["3", "3 行"],
          ["0", "全部"],
        ]}
        onChange={(v) => setStyle({ clamp: Number(v) })}
      />
      <Choice
        legend="详情字号"
        value={String(style.detailScale)}
        options={[
          ["0.9", "小"],
          ["1", "标准"],
          ["1.15", "大"],
        ]}
        onChange={(v) => setStyle({ detailScale: Number(v) })}
      />
      <Button
        size="sm"
        icon={ArrowCounterClockwiseIcon}
        className="self-start"
        onClick={resetStyle}
      >
        恢复默认样式
      </Button>
    </div>
  )
}

function Shortcuts() {
  return (
    <div className="flex flex-col gap-2">
      <dl className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 text-xs">
        {SHORTCUTS.map(([keys, action]) => (
          <div key={action} className="contents">
            <dt className="flex gap-1">{keys}</dt>
            <dd className="text-kumo-subtle">{action}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-kumo-subtle">
        双击节点展开 / 收起，拖动空白处平移画布；触控板捏合或 Ctrl/⌘ +
        滚轮只缩放画布。
      </p>
    </div>
  )
}
