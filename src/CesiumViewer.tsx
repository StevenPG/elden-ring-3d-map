import { useEffect, useRef, useState } from 'react'
import { Viewer } from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { initCesium } from './cesium/init'

export default function CesiumViewer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return

    initCesium('cesiumContainer')
      .then((viewer) => { viewerRef.current = viewer })
      .catch((err: Error) => setError(err.message))

    return () => {
      viewerRef.current?.destroy()
      viewerRef.current = null
    }
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div id="cesiumContainer" ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {error && (
        <pre style={{
          position: 'absolute', top: 16, left: 16,
          background: 'rgba(0,0,0,0.8)', color: '#ff6b6b',
          padding: '12px 16px', borderRadius: 6, maxWidth: '80%',
          whiteSpace: 'pre-wrap', fontSize: 13,
        }}>
          Failed to load tileset: {error}
          {'\n\nMake sure tiles are served over HTTP, e.g.:\n  npm run dev'}
        </pre>
      )}
    </div>
  )
}
