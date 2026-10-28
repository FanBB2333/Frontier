import { PencilIcon, RotateCcwIcon } from "lucide-react"
import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { cn } from "@/lib/utils"
import { DiffText } from "@/components/diff-text"
import { Textarea } from "@/components/ui/textarea"
import { Kbd } from "@/components/ui/kbd"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type ViewMode = "final" | "diff" | "original"

interface EditableTextProps {
  value: string
  /** Original text from the delivery package; undefined for newly added content. */
  original?: string
  onChange?: (value: string) => void
  viewMode: ViewMode
  placeholder?: string
  label: string
  className?: string
  textClassName?: string
  autoEdit?: boolean
}

/**
 * Text that highlights on hover and turns into a textarea on click. Modified text
 * carries an orange edge; in "对比" mode the inline diff shows exactly what changed.
 */
export function EditableText({
  value,
  original,
  onChange,
  viewMode,
  placeholder,
  label,
  className,
  textClassName,
  autoEdit,
}: EditableTextProps) {
  const [editing, setEditing] = useState(Boolean(autoEdit && onChange))
  const startValue = useRef(value)
  const ref = useRef<HTMLTextAreaElement>(null)
  const editable = Boolean(onChange)
  const modified = original !== undefined && value !== original

  useEffect(() => {
    if (editing && ref.current) {
      const el = ref.current
      el.focus()
      el.setSelectionRange(el.value.length, el.value.length)
    }
  }, [editing])

  const start = () => {
    if (!editable) return
    startValue.current = value
    setEditing(true)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation()
    if (e.key === "Escape") {
      onChange?.(startValue.current)
      setEditing(false)
    } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        <Textarea
          ref={ref}
          aria-label={label}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => setEditing(false)}
          className={cn("min-h-9 bg-card", textClassName)}
        />
        {modified && (
          <div className="rounded-md border border-dashed bg-muted/50 px-2 py-1.5 text-xs leading-relaxed">
            <span className="mr-1.5 font-medium text-muted-foreground">
              对比原文
            </span>
            <DiffText before={original ?? ""} after={value} />
          </div>
        )}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Kbd>⌘/Ctrl</Kbd>
          <Kbd>Enter</Kbd>
          <span className="mr-2">完成</span>
          <Kbd>Esc</Kbd>
          <span>撤销本次编辑</span>
        </div>
      </div>
    )
  }

  let content: React.ReactNode = value
  if (viewMode === "diff" && modified)
    content = <DiffText before={original ?? ""} after={value} />
  if (viewMode === "original" && original !== undefined) content = original
  const empty = !(viewMode === "original" ? (original ?? value) : value)

  return (
    <div
      role={editable ? "button" : undefined}
      tabIndex={editable ? 0 : undefined}
      aria-label={editable ? `编辑${label}` : undefined}
      onClick={start}
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target === e.currentTarget) {
          e.preventDefault()
          start()
        }
      }}
      data-modified={modified || undefined}
      className={cn(
        "group/edit relative -mx-2 rounded-md border-l-2 border-transparent px-2 py-1 transition-colors",
        editable &&
          "cursor-text hover:bg-accent hover:ring-1 hover:ring-primary/25 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
        modified && "border-edited bg-edited-muted",
        className
      )}
    >
      <div
        className={cn(
          "pr-6 break-words whitespace-pre-wrap",
          empty && "text-muted-foreground italic",
          textClassName
        )}
      >
        {empty ? (placeholder ?? "（空）") : content}
      </div>
      {editable && (
        <PencilIcon className="pointer-events-none absolute top-1.5 right-1.5 size-3.5 text-primary opacity-0 transition-opacity group-hover/edit:opacity-100" />
      )}
      {editable && modified && (
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                aria-label="恢复原文"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange?.(original ?? "")
                }}
                className="absolute right-1 bottom-1 rounded-sm p-0.5 text-edited opacity-70 hover:bg-card hover:opacity-100"
              />
            }
          >
            <RotateCcwIcon className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>恢复原文</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
