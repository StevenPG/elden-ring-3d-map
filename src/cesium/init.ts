import { Viewer } from 'cesium'
import { createViewer } from './viewer'
import { configureScene } from './scene'
import { loadTileset } from './tileset'
import { configureCameraLimits, constrainCameraPosition, positionCamera, wireHomeButton } from './camera'
import { loadMarkers } from './markers'
import { addGroundPlane } from './groundPlane'
import { addDebugEntities } from './debug'
import { addDebugPanel } from './debugPanel'

export async function initCesium(containerId: string): Promise<Viewer> {
  const viewer = createViewer(containerId)
  configureScene(viewer.scene)

  const tileset = await loadTileset(viewer.scene)
  addGroundPlane(viewer.scene, tileset)
  configureCameraLimits(viewer, tileset)
  constrainCameraPosition(viewer, tileset)
  wireHomeButton(viewer, tileset)
  await positionCamera(viewer, tileset)

  loadMarkers(viewer, tileset)

  if (import.meta.env.DEV) {
    addDebugEntities(viewer, tileset)
    addDebugPanel(viewer, tileset)
  }

  return viewer
}
