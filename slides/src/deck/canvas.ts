// Every slide is laid out on a fixed 1920×1080 canvas that is scaled to fit the window,
// so slides use absolute pixel positions and look the same on any screen.

export const CANVAS_W = 1920
export const CANVAS_H = 1080
/** Default left/right margin of slide content. */
export const PAD_X = 128

export type Rect = { x: number; y: number; w: number; h: number }

/** A rect of width `w` at (x, y) with an image's aspect ratio. */
export const byWidth = (
  x: number,
  y: number,
  w: number,
  img: { width: number; height: number }
): Rect => ({
  x,
  y,
  w,
  h: Math.round((w * img.height) / img.width),
})

/** A rect of height `h` at (x, y) with an image's aspect ratio. */
export const byHeight = (
  x: number,
  y: number,
  h: number,
  img: { width: number; height: number }
): Rect => ({
  x,
  y,
  w: Math.round((h * img.width) / img.height),
  h,
})
