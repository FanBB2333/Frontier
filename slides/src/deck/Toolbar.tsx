import { useRef, useState, type ReactNode } from "react"
import { motion } from "motion/react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  KeyboardIcon,
  LanguagesIcon,
  LayoutGridIcon,
  MaximizeIcon,
  PaletteIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useT, type Text } from "@/lib/i18n"
import { THEMES, type ThemeDef, type ThemeId } from "@/lib/theme"
import { originOf, type Origin } from "@/hooks/use-theme"

const UI = {
  prev: { en: "Previous", zh: "上一页" },
  next: { en: "Next", zh: "下一页" },
  overview: { en: "Overview", zh: "页面总览" },
  theme: { en: "Theme", zh: "主题" },
  language: { en: "Switch to Chinese · 中文", zh: "切换到英文 · English" },
  fullscreen: { en: "Fullscreen", zh: "全屏" },
  shortcuts: { en: "Shortcuts", zh: "快捷键" },
  helpTitle: { en: "Keyboard shortcuts", zh: "快捷键" },
  helpBody: {
    en: "Turn pages with the keyboard, a left/right swipe on touch screens, or the toolbar at the bottom. Click an image to enlarge it.",
    zh: "键盘、触屏左右滑动或底部工具栏都可以翻页。点击图片可放大查看。",
  },
} satisfies Record<string, Text>

const THEME_NAMES: Record<ThemeId, Text> = {
  morandi: { en: "Morandi · Mist", zh: "莫兰迪 · 雾霭" },
  celadon: { en: "Morandi · Celadon", zh: "莫兰迪 · 青瓷" },
  dusk: { en: "Morandi · Dusk", zh: "莫兰迪 · 暮色" },
  midnight: { en: "Midnight", zh: "夜幕" },
}

const SHORTCUTS: { label: Text; keys: string[] }[] = [
  {
    label: { en: "Next step / page", zh: "下一步 / 下一页" },
    keys: ["→", "↓", "Space", "PageDown"],
  },
  {
    label: { en: "Previous step / page", zh: "上一步 / 上一页" },
    keys: ["←", "↑", "PageUp"],
  },
  {
    label: { en: "First / last page", zh: "第一页 / 最后一页" },
    keys: ["Home", "End"],
  },
  { label: UI.overview, keys: ["O"] },
  { label: { en: "Switch theme", zh: "切换主题" }, keys: ["T"] },
  { label: { en: "Switch language", zh: "切换语言" }, keys: ["L"] },
  { label: UI.fullscreen, keys: ["F"] },
  { label: UI.shortcuts, keys: ["?"] },
]

function Hint({ label, keys }: { label: string; keys: string[] }) {
  return (
    <TooltipContent side="top" sideOffset={8}>
      {label}
      <KbdGroup>
        {keys.map((k) => (
          <Kbd key={k}>{k}</Kbd>
        ))}
      </KbdGroup>
    </TooltipContent>
  )
}

function ToolButton({
  label,
  keys,
  onClick,
  children,
}: {
  label: string
  keys: string[]
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label={label}
            onClick={onClick}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <Hint label={label} keys={keys} />
    </Tooltip>
  )
}

function Swatch({ theme }: { theme: ThemeDef }) {
  const [bg, a, b] = theme.swatch ?? ["", "", ""]
  return (
    <span
      className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full ring-1 ring-foreground/15"
      style={{ background: bg }}
    >
      <span
        className="absolute left-1.5 size-3 rounded-full"
        style={{ background: a }}
      />
      <span
        className="absolute left-4 size-3 rounded-full"
        style={{ background: b }}
      />
    </span>
  )
}

function ThemeMenu({
  theme,
  onTheme,
  onOpenChange,
}: {
  theme: ThemeId
  onTheme: (id: ThemeId, origin?: Origin) => void
  onOpenChange: (open: boolean) => void
}) {
  const t = useT()
  const trigger = useRef<HTMLButtonElement>(null)
  const pick = (id: string) => onTheme(id as ThemeId, originOf(trigger.current))
  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={
                <Button
                  ref={trigger}
                  variant="ghost"
                  size="icon-lg"
                  aria-label={t(UI.theme)}
                />
              }
            />
          }
        >
          <PaletteIcon />
        </TooltipTrigger>
        <Hint label={t(UI.theme)} keys={["T"]} />
      </Tooltip>
      <DropdownMenuContent
        side="top"
        align="center"
        sideOffset={10}
        className="w-52"
        finalFocus={false}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t(UI.theme)}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={theme} onValueChange={pick}>
            {THEMES.map((th) => (
              <DropdownMenuRadioItem key={th.id} value={th.id}>
                <Swatch theme={th} />
                {t(THEME_NAMES[th.id])}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Toolbar({
  visible,
  index,
  total,
  onPrev,
  onNext,
  onOverview,
  onFullscreen,
  help,
  onHelpChange,
  theme,
  onTheme,
  onLang,
}: {
  visible: boolean
  index: number
  total: number
  onPrev: () => void
  onNext: () => void
  onOverview: () => void
  onFullscreen: () => void
  help: boolean
  onHelpChange: (open: boolean) => void
  theme: ThemeId
  onTheme: (id: ThemeId, origin?: Origin) => void
  onLang: () => void
}) {
  const t = useT()
  const [menuOpen, setMenuOpen] = useState(false)
  const shown = visible || menuOpen
  return (
    <>
      <motion.div
        className="fixed bottom-5 left-1/2 flex items-center gap-1 rounded-2xl border bg-popover/80 p-1.5 shadow-2xl backdrop-blur-xl"
        initial={false}
        animate={
          shown
            ? { opacity: 1, y: 0, x: "-50%" }
            : { opacity: 0, y: 16, x: "-50%" }
        }
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
        style={{ pointerEvents: shown ? "auto" : "none" }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <ToolButton label={t(UI.prev)} keys={["←"]} onClick={onPrev}>
          <ChevronLeftIcon />
        </ToolButton>
        <span className="min-w-14 text-center font-mono text-sm text-muted-foreground tabular-nums">
          {index + 1} / {total}
        </span>
        <ToolButton label={t(UI.next)} keys={["→"]} onClick={onNext}>
          <ChevronRightIcon />
        </ToolButton>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <ToolButton label={t(UI.overview)} keys={["O"]} onClick={onOverview}>
          <LayoutGridIcon />
        </ToolButton>
        <ThemeMenu theme={theme} onTheme={onTheme} onOpenChange={setMenuOpen} />
        <ToolButton label={t(UI.language)} keys={["L"]} onClick={onLang}>
          <LanguagesIcon />
        </ToolButton>
        <ToolButton
          label={t(UI.fullscreen)}
          keys={["F"]}
          onClick={onFullscreen}
        >
          <MaximizeIcon />
        </ToolButton>
        <ToolButton
          label={t(UI.shortcuts)}
          keys={["?"]}
          onClick={() => onHelpChange(true)}
        >
          <KeyboardIcon />
        </ToolButton>
      </motion.div>

      <Dialog open={help} onOpenChange={onHelpChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t(UI.helpTitle)}</DialogTitle>
            <DialogDescription>{t(UI.helpBody)}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            {SHORTCUTS.map((s) => (
              <div
                key={s.label.en}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <span className="text-muted-foreground">{t(s.label)}</span>
                <KbdGroup>
                  {s.keys.map((k) => (
                    <Kbd key={k}>{k}</Kbd>
                  ))}
                </KbdGroup>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
