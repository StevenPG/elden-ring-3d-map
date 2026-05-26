import { Cartesian3, Cesium3DTileset, HeadingPitchRange, Math as CesiumMath, Matrix4, Viewer } from 'cesium'
import config from '../config.json'

export function configureCameraLimits(viewer: Viewer, tileset: Cesium3DTileset): void {
  const radius = tileset.boundingSphere.radius
  const { minZoomMultiplier, maxZoomMultiplier } = config.camera.limits
  const controller = viewer.scene.screenSpaceCameraController

  controller.minimumZoomDistance = radius * minZoomMultiplier
  controller.maximumZoomDistance = radius * maxZoomMultiplier
}

// Cesium has no built-in max translation distance, so we enforce it each frame.
// If the camera drifts further than maxDistance from the tileset center, snap
// it back to the boundary along the same direction.
// Each intermediate value gets its own Cartesian3 — reusing a scratch across
// chained calls corrupts results since some calls write into their result arg.
export function constrainCameraPosition(viewer: Viewer, tileset: Cesium3DTileset): void {
  const center = tileset.boundingSphere.center
  const maxDistance = tileset.boundingSphere.radius * config.camera.limits.maxTranslationMultiplier

  viewer.scene.postRender.addEventListener(() => {
    const camera = viewer.camera
    if (Cartesian3.distance(camera.position, center) <= maxDistance) return

    const offset = Cartesian3.subtract(camera.position, center, new Cartesian3())
    const direction = Cartesian3.normalize(offset, new Cartesian3())
    const clamped = Cartesian3.add(
      center,
      Cartesian3.multiplyByScalar(direction, maxDistance, new Cartesian3()),
      new Cartesian3()
    )
    camera.position = clamped
  })
}

// Override the home button so it flies back to the tileset instead of the default
// Earth-from-space view, which is useless without a globe.
export function wireHomeButton(viewer: Viewer, tileset: Cesium3DTileset): void {
  viewer.homeButton.viewModel.command.beforeExecute.addEventListener((e) => {
    e.cancel = true
    positionCamera(viewer, tileset)
  })
}

export async function positionCamera(viewer: Viewer, tileset: Cesium3DTileset): Promise<void> {
  const { headingDeg, pitchDeg, rangeMultiplier, target } = config.camera.home
  const offset = new HeadingPitchRange(
    CesiumMath.toRadians(headingDeg),
    CesiumMath.toRadians(pitchDeg),
    tileset.boundingSphere.radius * rangeMultiplier
  )

  if (target) {
    const localPos = new Cartesian3(target.x, target.y, target.z)
    const worldPos = Matrix4.multiplyByPoint(tileset.modelMatrix, localPos, new Cartesian3())
    viewer.camera.lookAt(worldPos, offset)
    viewer.camera.lookAtTransform(Matrix4.IDENTITY)
  } else {
    await viewer.zoomTo(tileset, offset)
  }
}
