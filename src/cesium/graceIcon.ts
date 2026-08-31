import { Color } from 'cesium'

const ICON_WIDTH = 48
const ICON_HEIGHT = 104
const SUPERSAMPLE = 2

const iconCache = new Map<string, HTMLCanvasElement>()

function rgba(color: Color, alpha: number): string {
  const r = Math.round(color.red * 255)
  const g = Math.round(color.green * 255)
  const b = Math.round(color.blue * 255)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** Mixes a color toward white, used for the hot core of the beam. */
function lighten(color: Color, amount: number): Color {
  return new Color(
    color.red + (1 - color.red) * amount,
    color.green + (1 - color.green) * amount,
    color.blue + (1 - color.blue) * amount,
    1,
  )
}

/** Soft elliptical bloom, drawn as a squashed radial gradient. */
function drawBloom(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  color: Color,
  alpha: number,
): void {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(1, radiusY / radiusX)
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radiusX)
  gradient.addColorStop(0, rgba(color, alpha))
  gradient.addColorStop(0.45, rgba(color, alpha * 0.35))
  gradient.addColorStop(1, rgba(color, 0))
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(0, 0, radiusX, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

/**
 * A column of light that is brightest just above the ground and fades out
 * toward the top of the icon. Drawn as stacked, narrowing bands so the beam
 * reads as a soft glow wrapped around a hot core.
 */
function drawBeam(ctx: CanvasRenderingContext2D, baseY: number, color: Color): void {
  const centerX = ICON_WIDTH / 2
  const core = lighten(color, 0.75)
  const bands: Array<{ halfWidth: number; alpha: number; tint: Color }> = [
    { halfWidth: 7, alpha: 0.22, tint: color },
    { halfWidth: 3.5, alpha: 0.45, tint: color },
    { halfWidth: 2, alpha: 0.75, tint: lighten(color, 0.35) },
    { halfWidth: 1, alpha: 1, tint: core },
  ]

  for (const band of bands) {
    const gradient = ctx.createLinearGradient(0, baseY, 0, 0)
    gradient.addColorStop(0, rgba(band.tint, 0))
    gradient.addColorStop(0.08, rgba(band.tint, band.alpha))
    gradient.addColorStop(0.45, rgba(band.tint, band.alpha * 0.7))
    gradient.addColorStop(1, rgba(band.tint, 0))
    ctx.fillStyle = gradient
    ctx.fillRect(centerX - band.halfWidth, 0, band.halfWidth * 2, baseY)
  }
}

/**
 * Builds a Site of Grace style billboard: a golden beam of light rising from
 * the ground. The returned canvas is anchored at the bottom centre, so it
 * should be drawn with VerticalOrigin.BOTTOM.
 */
export function buildGraceIcon(cssColor: string): HTMLCanvasElement {
  const cached = iconCache.get(cssColor)
  if (cached) {
    return cached
  }

  const canvas = document.createElement('canvas')
  canvas.width = ICON_WIDTH * SUPERSAMPLE
  canvas.height = ICON_HEIGHT * SUPERSAMPLE
  const ctx = canvas.getContext('2d')!
  ctx.scale(SUPERSAMPLE, SUPERSAMPLE)

  const color = Color.fromCssColorString(cssColor)
  const baseY = ICON_HEIGHT - 4

  // A bloom where the beam meets the ground, then the beam over it.
  drawBloom(ctx, ICON_WIDTH / 2, baseY, 16, 8, color, 0.6)
  drawBeam(ctx, baseY, color)
  drawBloom(ctx, ICON_WIDTH / 2, baseY - 4, 6, 6, lighten(color, 0.7), 0.85)

  iconCache.set(cssColor, canvas)
  return canvas
}

export const GRACE_ICON_WIDTH = ICON_WIDTH
export const GRACE_ICON_HEIGHT = ICON_HEIGHT
