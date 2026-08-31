import {
  BillboardCollection,
  BlendOption,
  Cartesian2,
  Cartesian3,
  Cesium3DTileset,
  Color,
  DistanceDisplayCondition,
  HorizontalOrigin,
  LabelCollection,
  LabelStyle,
  Matrix4,
  NearFarScalar,
  VerticalOrigin,
  Viewer,
} from 'cesium'
import markersData from '../markers.json'
import config from '../config.json'
import { buildGraceIcon, GRACE_ICON_HEIGHT, GRACE_ICON_WIDTH } from './graceIcon'

const ICON_SCALE = 0.6
const ICON_PIXEL_WIDTH = GRACE_ICON_WIDTH * ICON_SCALE
const ICON_PIXEL_HEIGHT = GRACE_ICON_HEIGHT * ICON_SCALE

export function loadMarkers(viewer: Viewer, tileset: Cesium3DTileset): void {
  // Every grace icon is a soft glow, so skip the opaque rendering pass.
  const billboards = new BillboardCollection({
    scene: viewer.scene,
    blendOption: BlendOption.TRANSLUCENT,
  })
  const labels = new LabelCollection({ scene: viewer.scene })
  viewer.scene.primitives.add(billboards)
  viewer.scene.primitives.add(labels)

  const { minVisibilityDistance, maxVisibilityDistance } = config.markers
  const displayCondition = new DistanceDisplayCondition(minVisibilityDistance, maxVisibilityDistance)

  for (const marker of markersData.markers) {
    const { x, y, z } = marker.localPosition
    const heightOffset = marker.heightOffset ?? 0
    const color = marker.color ?? '#ffffff'

    const lifted = new Cartesian3(x, y, z + heightOffset)
    const worldPos = Matrix4.multiplyByPoint(tileset.modelMatrix, lifted, new Cartesian3())

    const billboard = billboards.add({
      id: marker.id,
      position: worldPos,
      width: ICON_PIXEL_WIDTH,
      height: ICON_PIXEL_HEIGHT,
      verticalOrigin: VerticalOrigin.BOTTOM,
      horizontalOrigin: HorizontalOrigin.CENTER,
      // Shrink a little with distance so dense areas stay readable.
      scaleByDistance: new NearFarScalar(200, 1.0, maxVisibilityDistance, 0.6),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      distanceDisplayCondition: displayCondition,
    })
    // Keyed by color so all graces of a color share one atlas entry.
    billboard.setImage(`grace-${color}`, buildGraceIcon(color))

    labels.add({
      position: worldPos,
      text: marker.label,
      font: '14px sans-serif',
      fillColor: Color.WHITE,
      outlineColor: Color.BLACK,
      outlineWidth: 2,
      style: LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: VerticalOrigin.BOTTOM,
      horizontalOrigin: HorizontalOrigin.CENTER,
      // Sit just below the faded top of the beam rather than clear of it.
      pixelOffset: new Cartesian2(0, -ICON_PIXEL_HEIGHT + 8),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      distanceDisplayCondition: displayCondition,
    })
  }
}
