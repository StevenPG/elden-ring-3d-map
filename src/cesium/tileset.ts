import {
  Cartesian3,
  Cesium3DTileset,
  Matrix4,
  Scene,
  Transforms,
} from 'cesium'

// The tileset's bounding-box center in its local coordinate system.
// Used to re-center the geometry before applying the ENU transform.
const TILESET_LOCAL_CENTER = new Cartesian3(
  1462.1036376953125,
  3558.612060546875,
  2077.026123046875
)

// Place the tileset at (0°, 0°) on the Earth's surface using an East-North-Up
// frame so the tileset's Z axis aligns with ECEF up. Without this, Cesium
// positions the local-coordinate tileset near the Earth's center where ECEF
// "up" is undefined, leaving the camera below the terrain.
function buildModelMatrix(): Matrix4 {
  const enuTransform = Transforms.eastNorthUpToFixedFrame(
    Cartesian3.fromDegrees(0, 0, 0)
  )
  const centerToOrigin = Matrix4.fromTranslation(
    Cartesian3.negate(TILESET_LOCAL_CENTER, new Cartesian3())
  )
  return Matrix4.multiply(enuTransform, centerToOrigin, new Matrix4())
}

export async function loadTileset(scene: Scene): Promise<Cesium3DTileset> {
  const tileset = await Cesium3DTileset.fromUrl(
    './overworld_3dtiles/tileset.json',
    // Raise the error threshold so tiles don't vanish when zooming out
    { maximumScreenSpaceError: 64 }
  )

  tileset.modelMatrix = buildModelMatrix()
  scene.primitives.add(tileset)

  return tileset
}
