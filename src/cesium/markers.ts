import {
  BillboardCollection,
  Cartesian2,
  Cartesian3,
  Cesium3DTileset,
  Color,
  DistanceDisplayCondition,
  HorizontalOrigin,
  LabelCollection,
  LabelStyle,
  Matrix4,
  PinBuilder,
  VerticalOrigin,
  Viewer,
} from 'cesium'
import markersData from '../markers.json'
import config from '../config.json'

const pinBuilder = new PinBuilder()
const pinCache = new Map<string, HTMLCanvasElement>()

function getPin(color: string): HTMLCanvasElement {
  if (!pinCache.has(color)) {
    pinCache.set(color, pinBuilder.fromColor(Color.fromCssColorString(color), 48))
  }
  return pinCache.get(color)!
}

export function loadMarkers(viewer: Viewer, tileset: Cesium3DTileset): void {
  const billboards = new BillboardCollection({ scene: viewer.scene })
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

    billboards.add({
      position: worldPos,
      image: getPin(color),
      verticalOrigin: VerticalOrigin.BOTTOM,
      horizontalOrigin: HorizontalOrigin.CENTER,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      distanceDisplayCondition: displayCondition,
    })

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
      pixelOffset: new Cartesian2(0, -56),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      distanceDisplayCondition: displayCondition,
    })
  }
}
