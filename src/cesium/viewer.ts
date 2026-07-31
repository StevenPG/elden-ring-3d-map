import { Ion, Viewer } from 'cesium'

function createHiddenCreditContainer(): HTMLElement {
  const el = document.createElement('div')
  el.style.display = 'none'
  document.body.appendChild(el)
  return el
}

// `fullscreenElement` decides what the fullscreen button expands. It defaults
// to the Cesium container, which would hide any overlay rendered alongside it
// (the attribution box), so callers pass the wrapper element instead.
export function createViewer(containerId: string, fullscreenElement?: Element): Viewer {
  Ion.defaultAccessToken = ''

  return new Viewer(containerId, {
    creditContainer: createHiddenCreditContainer(),
    fullscreenElement,
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
