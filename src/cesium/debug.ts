import {
  Cartesian2,
  Cartesian3,
  Cesium3DTileset,
  Color,
  LabelStyle,
  Matrix4,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  VerticalOrigin,
  Viewer,
} from 'cesium'

function addOriginMarker(viewer: Viewer): void {
  viewer.entities.add({
    position: Cartesian3.fromDegrees(0, 0, 0),
    point: {
      pixelSize: 12,
      color: Color.RED,
      outlineColor: Color.WHITE,
      outlineWidth: 2,
    },
    label: {
      text: 'Origin (0, 0, 0)',
      font: '14px sans-serif',
      fillColor: Color.WHITE,
      style: LabelStyle.FILL_AND_OUTLINE,
      outlineWidth: 2,
      verticalOrigin: VerticalOrigin.BOTTOM,
      pixelOffset: { x: 0, y: -16 } as never,
    },
  })
}

function createPickHint(): HTMLElement {
  const el = document.createElement('div')
  Object.assign(el.style, {
    position: 'absolute',
    bottom: '16px',
    left: '16px',
    margin: '0',
    padding: '6px 10px',
    background: 'rgba(0,0,0,0.6)',
    color: '#aaaaaa',
    font: '11px/1.4 monospace',
    borderRadius: '4px',
    pointerEvents: 'none',
  })
  el.textContent = 'Click the tileset to pick a point'
  document.body.appendChild(el)
  return el
}

function createPickOverlay(): HTMLElement {
  const el = document.createElement('pre')
  Object.assign(el.style, {
    position: 'absolute',
    bottom: '48px',
    left: '16px',
    margin: '0',
    padding: '8px 12px',
    background: 'rgba(0,0,0,0.75)',
    color: '#00ff99',
    font: '12px/1.6 monospace',
    borderRadius: '4px',
    pointerEvents: 'none',
    whiteSpace: 'pre',
    display: 'none',
  })
  document.body.appendChild(el)
  return el
}

function fmt(n: number): string {
  return n.toFixed(2).padStart(12)
}

function enablePickDebug(viewer: Viewer, tileset: Cesium3DTileset): void {
  const hint = createPickHint()
  const overlay = createPickOverlay()
  const inverseModelMatrix = Matrix4.inverse(tileset.modelMatrix, new Matrix4())

  const handler = new ScreenSpaceEventHandler(viewer.scene.canvas)
  handler.setInputAction((e: { position: Cartesian2 }) => {
    hint.style.display = 'none'
    overlay.style.display = 'block'

    const ray = viewer.camera.getPickRay(e.position)
    if (!ray) {
      overlay.textContent = 'No ray'
      return
    }

    const hit = viewer.scene.pick(e.position)
    const world = viewer.scene.pickPosition(e.position)

    if (!world) {
      overlay.textContent = `Screen  x:${fmt(e.position.x)}  y:${fmt(e.position.y)}\nNo tileset hit`
      return
    }

    const rayDir = ray.direction
    const local = Matrix4.multiplyByPoint(inverseModelMatrix, world, new Cartesian3())

    overlay.textContent = [
      `Screen   x:${fmt(e.position.x)}  y:${fmt(e.position.y)}`,
      `Ray dir  x:${fmt(rayDir.x)}  y:${fmt(rayDir.y)}  z:${fmt(rayDir.z)}`,
      `World    x:${fmt(world.x)}  y:${fmt(world.y)}  z:${fmt(world.z)}`,
      `Local    x:${fmt(local.x)}  y:${fmt(local.y)}  z:${fmt(local.z)}`,
      `Hit      ${hit ? hit.constructor?.name ?? 'object' : 'none'}`,
    ].join('\n')
  }, ScreenSpaceEventType.LEFT_CLICK)
}

export function addDebugEntities(viewer: Viewer, tileset: Cesium3DTileset): void {
  addOriginMarker(viewer)
  enablePickDebug(viewer, tileset)
}
