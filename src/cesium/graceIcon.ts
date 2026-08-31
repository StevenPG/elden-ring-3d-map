import { Color } from 'cesium'

const ICON_WIDTH = 96
const ICON_HEIGHT = 208
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
    { halfWidth: 11, alpha: 0.18, tint: color },
    { halfWidth: 6, alpha: 0.3, tint: color },
    { halfWidth: 3, alpha: 0.55, tint: lighten(color, 0.35) },
    { halfWidth: 1.25, alpha: 0.95, tint: core },
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
 * The cluster of golden strands the beam rises from: tapered curves fanning
 * out from the centre, each one brightest where it meets the beam.
 */
function drawStrands(ctx: CanvasRenderingContext2D, baseY: number, color: Color): void {
  const centerX = ICON_WIDTH / 2
  const strands = [
    { spread: -26, lift: -4, arc: 14 },
    { spread: -18, lift: -13, arc: 11 },
    { spread: -9, lift: -20, arc: 7 },
    { spread: 0, lift: -24, arc: 0 },
    { spread: 9, lift: -20, arc: -7 },
    { spread: 18, lift: -13, arc: -11 },
    { spread: 26, lift: -4, arc: -14 },
  ]

  ctx.lineCap = 'round'
  for (const strand of strands) {
    const tipX = centerX + strand.spread
    const tipY = baseY + strand.lift
    const controlX = centerX + strand.spread * 0.35 + strand.arc * 0.25
    const controlY = baseY + strand.lift * 1.5 - 6

    // Glow pass, then a thin bright pass on top of it.
    for (const pass of [
      { width: 5, alpha: 0.28, tint: color },
      { width: 2, alpha: 0.95, tint: lighten(color, 0.5) },
    ]) {
      ctx.strokeStyle = rgba(pass.tint, pass.alpha)
      ctx.lineWidth = pass.width
      ctx.beginPath()
      ctx.moveTo(centerX, baseY + 2)
      ctx.quadraticCurveTo(controlX, controlY, tipX, tipY)
      ctx.stroke()
    }

    drawBloom(ctx, tipX, tipY, 5, 5, lighten(color, 0.4), 0.7)
  }
}

/**
 * Builds a Site of Grace style billboard: a golden beam of light rising out of
 * a glowing cluster of strands. The returned canvas is anchored at the bottom
 * centre, so it should be drawn with VerticalOrigin.BOTTOM.
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
  const baseY = ICON_HEIGHT - 26

  // Ground bloom under the strands, then the beam, then the strands on top.
  drawBloom(ctx, ICON_WIDTH / 2, baseY + 6, 40, 14, color, 0.45)
  drawBeam(ctx, baseY, color)
  drawBloom(ctx, ICON_WIDTH / 2, baseY - 6, 22, 22, lighten(color, 0.3), 0.55)
  drawStrands(ctx, baseY, color)
  drawBloom(ctx, ICON_WIDTH / 2, baseY - 2, 9, 9, lighten(color, 0.85), 0.9)

  iconCache.set(cssColor, canvas)
  return canvas
}

export const GRACE_ICON_WIDTH = ICON_WIDTH
export const GRACE_ICON_HEIGHT = ICON_HEIGHT
