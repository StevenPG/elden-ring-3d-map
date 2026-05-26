import { Cartesian3, Color, DirectionalLight, Scene } from 'cesium'
import { applySkyBox } from './skybox'

export function configureScene(scene: Scene): void {
  scene.backgroundColor = new Color(0.05, 0.05, 0.08, 1.0)
  applySkyBox(scene)

  // Directional light from above-left so terrain features read clearly
  scene.light = new DirectionalLight({
    direction: Cartesian3.normalize(
      new Cartesian3(-0.5, -0.5, -1.0),
      new Cartesian3()
    ),
    intensity: 1.5,
  })

  // Allow camera inside the bounding geometry (no globe collision)
  scene.screenSpaceCameraController.enableCollisionDetection = false
}
