import {
  Cesium3DTileset,
  Viewer,
  viewerCesium3DTilesInspectorMixin,
  viewerCesiumInspectorMixin,
  viewerPerformanceWatchdogMixin,
} from 'cesium'

// Cesium attaches these widgets to the viewer when the matching mixin is
// applied. They aren't in the typed Viewer surface, so reach them through a
// narrow structural type.
interface MixinWidgets {
  cesium3DTilesInspector?: { container: HTMLElement }
  cesiumInspector?: { container: HTMLElement }
  performanceWatchdog?: { container: HTMLElement }
}

type ToggleFn = (enabled: boolean) => void

const STORAGE_PREFIX = 'erm-debug:'

// A mixin can only be applied once and can't be removed, so apply it lazily on
// first enable and afterwards just show/hide the widget's container.
function mixinToggle(extend: () => HTMLElement | undefined): ToggleFn {
  let applied = false
  let container: HTMLElement | undefined

  return (enabled) => {
    if (enabled && !applied) {
      container = extend()
      applied = true
    }
    if (container) container.style.display = enabled ? '' : 'none'
  }
}

function createPanel(): { panel: HTMLElement; body: HTMLElement } {
  const panel = document.createElement('div')
  Object.assign(panel.style, {
    position: 'absolute',
    top: '8px',
    left: '8px',
    zIndex: '1000',
    background: 'rgba(0,0,0,0.78)',
    color: '#dddddd',
    font: '12px/1.5 monospace',
    borderRadius: '4px',
    padding: '6px 8px',
    userSelect: 'none',
    minWidth: '170px',
  })

  const header = document.createElement('div')
  Object.assign(header.style, {
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#00ff99',
    marginBottom: '4px',
  })

  const body = document.createElement('div')

  const collapsedKey = `${STORAGE_PREFIX}collapsed`
  let collapsed = localStorage.getItem(collapsedKey) === '1'
  const render = () => {
    header.textContent = `${collapsed ? '▸' : '▾'} Debug`
    body.style.display = collapsed ? 'none' : 'block'
  }
  header.addEventListener('click', () => {
    collapsed = !collapsed
    localStorage.setItem(collapsedKey, collapsed ? '1' : '0')
    render()
  })
  render()

  panel.append(header, body)
  document.body.appendChild(panel)
  return { panel, body }
}

function addToggle(body: HTMLElement, key: string, label: string, apply: ToggleFn): void {
  const storageKey = `${STORAGE_PREFIX}${key}`
  const row = document.createElement('label')
  Object.assign(row.style, {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    cursor: 'pointer',
  })

  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox'

  const text = document.createElement('span')
  text.textContent = label

  row.append(checkbox, text)
  body.appendChild(row)

  const sync = (persist: boolean) => {
    if (persist) localStorage.setItem(storageKey, checkbox.checked ? '1' : '0')
    apply(checkbox.checked)
  }

  checkbox.addEventListener('change', () => sync(true))

  // Restore previous session's state.
  if (localStorage.getItem(storageKey) === '1') {
    checkbox.checked = true
    sync(false)
  }
}

export function addDebugPanel(viewer: Viewer, tileset: Cesium3DTileset): void {
  const { body } = createPanel()
  const widgets = viewer as unknown as MixinWidgets

  // Inspector mixins — applied lazily, then shown/hidden.
  addToggle(
    body,
    'tiles-inspector',
    '3D Tiles Inspector',
    mixinToggle(() => {
      viewer.extend(viewerCesium3DTilesInspectorMixin)
      return widgets.cesium3DTilesInspector?.container
    })
  )
  addToggle(
    body,
    'cesium-inspector',
    'Cesium Inspector',
    mixinToggle(() => {
      viewer.extend(viewerCesiumInspectorMixin)
      return widgets.cesiumInspector?.container
    })
  )
  addToggle(
    body,
    'perf-watchdog',
    'Performance Watchdog',
    mixinToggle(() => {
      viewer.extend(viewerPerformanceWatchdogMixin)
      return widgets.performanceWatchdog?.container
    })
  )

  // Scene debug flags.
  addToggle(body, 'fps', 'FPS counter', (on) => {
    viewer.scene.debugShowFramesPerSecond = on
  })
  addToggle(body, 'frustums', 'Frustums', (on) => {
    viewer.scene.debugShowFrustums = on
  })

  // Tileset debug flags.
  addToggle(body, 'bounding-volumes', 'Tile bounding volumes', (on) => {
    tileset.debugShowBoundingVolume = on
  })
  addToggle(body, 'wireframe', 'Wireframe', (on) => {
    tileset.debugWireframe = on
  })
  addToggle(body, 'geometric-error', 'Geometric error', (on) => {
    tileset.debugShowGeometricError = on
  })
  addToggle(body, 'render-stats', 'Rendering stats', (on) => {
    tileset.debugShowRenderingStatistics = on
  })
}
