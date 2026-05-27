import {
  Cartesian3,
  Cesium3DTileset,
  Color,
  ColorGeometryInstanceAttribute,
  GeometryInstance,
  Matrix4,
  PerInstanceColorAppearance,
  PlaneGeometry,
  Primitive,
  Scene,
  Transforms,
} from 'cesium'
import config from '../config.json'
import { TILESET_LOCAL_CENTER } from './tileset'

export function addGroundPlane(scene: Scene, tileset: Cesium3DTileset): void {
  const { localZ, color } = config.groundPlane

  // Transform the local-space ground point to world space using the tileset's
  // model matrix. localZ=0 sits just below the lowest visible terrain (~Z 25-90
  // in local coords); raise or lower via config.groundPlane.localZ.
  const localGroundPos = new Cartesian3(TILESET_LOCAL_CENTER.x, TILESET_LOCAL_CENTER.y, localZ)
  const worldGroundPos = Matrix4.multiplyByPoint(tileset.modelMatrix, localGroundPos, new Cartesian3())

  // ENU frame gives a horizontal XY plane; scale to cover the tileset footprint.
  const modelMatrix = Matrix4.multiplyByUniformScale(
    Transforms.eastNorthUpToFixedFrame(worldGroundPos),
    tileset.boundingSphere.radius * 2.2,
    new Matrix4()
  )

  // translucent: false keeps this in the opaque pass so it writes to the depth
  // buffer — that's what lets Cesium's camera controller pick a finite zoom target.
  scene.primitives.add(
    new Primitive({
      geometryInstances: new GeometryInstance({
        geometry: new PlaneGeometry(),
        modelMatrix,
        attributes: {
          color: ColorGeometryInstanceAttribute.fromColor(Color.fromCssColorString(color)),
        },
      }),
      appearance: new PerInstanceColorAppearance({ flat: true, translucent: false }),
      asynchronous: false,
    })
  )
}
