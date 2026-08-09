import './Disclaimer.css'

// Non-affiliation notice for the deployed site. The README carries the same
// text, but visitors never see the README — this is the copy a rights holder
// landing on the live map would actually read.
export default function Disclaimer() {
  return (
    <details className="disclaimer">
      <summary className="disclaimer__summary">
        <span className="disclaimer__caret" aria-hidden="true">
          ▸
        </span>
        <span>Unofficial fan project — not affiliated with FromSoftware</span>
      </summary>
      <div className="disclaimer__body">
        <p>
          Elden Ring and all related assets, map geometry, and intellectual property are the
          property of FromSoftware and Bandai Namco.
        </p>
        <p className="disclaimer__note">
          This is an unofficial, non-commercial fan project. It is not affiliated with, sponsored
          by, or endorsed by either company.
        </p>
      </div>
    </details>
  )
}
