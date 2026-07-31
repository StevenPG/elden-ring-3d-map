import './Attribution.css'

// Credit for the source 3D model this project's tileset was derived from.
// CC BY-NC 4.0 requires title, author, source and license to travel with the
// work, plus an indication that it was modified — keep all five here.
const MODEL = {
  title: 'Elden Ring Map',
  author: 'JaseWorthing',
  sourceUrl: 'https://www.printables.com/model/1690105-elden-ring-map',
  licenseName: 'CC BY-NC 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-nc/4.0/',
}

export default function Attribution() {
  return (
    <details className="attribution">
      <summary className="attribution__summary">
        <span className="attribution__caret" aria-hidden="true">
          ▸
        </span>
        <span>
          3D model: “{MODEL.title}” by {MODEL.author} · {MODEL.licenseName}
        </span>
      </summary>
      <div className="attribution__body">
        <p>
          <a
            className="attribution__link"
            href={MODEL.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            “{MODEL.title}”
          </a>{' '}
          by {MODEL.author}, licensed under{' '}
          <a
            className="attribution__link"
            href={MODEL.licenseUrl}
            target="_blank"
            rel="license noopener noreferrer"
          >
            {MODEL.licenseName}
          </a>
          .
        </p>
        <p>
          <strong>Modified:</strong> the original model was converted into a Cesium 3D Tiles
          tileset for rendering in the browser. Markers, lighting, and skyboxes were added; the
          geometry is otherwise unchanged.
        </p>
        <p className="attribution__note">
          This site is a non-commercial fan project. Elden Ring and its assets belong to
          FromSoftware and Bandai Namco, who are not affiliated with this project.
        </p>
      </div>
    </details>
  )
}
