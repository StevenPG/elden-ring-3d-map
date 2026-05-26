import { useEffect, useRef } from 'react'
import { Viewer, Ion } from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN ?? ''

export default function CesiumViewer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return

    viewerRef.current = new Viewer(containerRef.current, {
      timeline: false,
      animation: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
    })

    return () => {
      viewerRef.current?.destroy()
      viewerRef.current = null
    }
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
