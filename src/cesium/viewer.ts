import { Ion, Viewer } from 'cesium'

function createHiddenCreditContainer(): HTMLElement {
  const el = document.createElement('div')
  el.style.display = 'none'
  document.body.appendChild(el)
  return el
}

export function createViewer(containerId: string): Viewer {
  Ion.defaultAccessToken = ''

  return new Viewer(containerId, {
    creditContainer: createHiddenCreditContainer(),
    globe: false,
    skyBox: false,
    skyAtmosphere: false,
    baseLayer: false,
    baseLayerPicker: false,
    geocoder: false,
    homeButton: true,
    sceneModePicker: false,
    navigationHelpButton: false,
    animation: false,
    timeline: false,
    fullscreenButton: true,
    infoBox: false,
    selectionIndicator: false,
  })
}
