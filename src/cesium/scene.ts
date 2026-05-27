import { Cartesian3, Color, DirectionalLight, Scene } from 'cesium'
import { applySkyBox } from './skybox'
import config from '../config.json'

export function configureScene(scene: Scene): void {
  scene.backgroundColor = new Color(0.05, 0.05, 0.08, 1.0)
  applySkyBox(scene)

  const { direction: d, intensity } = config.light
  scene.light = new DirectionalLight({
    direction: Cartesian3.normalize(new Cartesian3(d.x, d.y, d.z), new Cartesian3()),
    intensity,
  })

  // Allow camera inside the bounding geometry (no globe collision)
  scene.screenSpaceCameraController.enableCollisionDetection = false
}
