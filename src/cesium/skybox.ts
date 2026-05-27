import { Scene, SkyBox } from 'cesium'

const SKYBOXES = [
  'gravesite_plain',
  'siofra_river',
  'cerulean_coast',
  'divine_tower',
  'scadu_altus',
  'limgrave_sunset',
] as const

type SkyboxName = typeof SKYBOXES[number]

function pickRandom(): SkyboxName {
  return SKYBOXES[Math.floor(Math.random() * SKYBOXES.length)]
}

function buildSkyBox(name: SkyboxName): SkyBox {
  const base = `${import.meta.env.BASE_URL}skyboxes/${name}/cubemap/cubemap`
  return new SkyBox({
    sources: {
      positiveX: `${base}_0.png`,
      negativeX: `${base}_1.png`,
      positiveY: `${base}_2.png`,
      negativeY: `${base}_3.png`,
      positiveZ: `${base}_4.png`,
      negativeZ: `${base}_5.png`,
    },
  })
}

export function applySkyBox(scene: Scene): void {
  scene.skyBox = buildSkyBox(pickRandom())
}
