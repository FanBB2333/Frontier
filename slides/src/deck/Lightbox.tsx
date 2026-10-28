import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import type { ZoomTarget } from "./motion"

/** Full-size view of a slide image; tall images scroll inside the dialog. */
export function Lightbox({
  target,
  onClose,
}: {
  target: ZoomTarget | null
  onClose: () => void
}) {
  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[94vh] w-[min(94vw,1600px)] max-w-none overflow-y-auto p-2 sm:max-w-none">
        <DialogTitle className="sr-only">{target?.alt || "Image"}</DialogTitle>
        {target ? (
          <img
            src={target.src}
            alt={target.alt}
            className="h-auto w-full rounded-lg"
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
