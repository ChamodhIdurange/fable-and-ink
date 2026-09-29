/**
 * The drifting colour field behind hero sections. Four blurred blobs on
 * independent, non-harmonic periods so the loop never becomes visible; blend
 * mode flips from multiply to screen in dark mode (see .fi-aurora__blob).
 */
export default function Aurora() {
  return (
    <div className="fi-aurora" aria-hidden="true">
      <span className="fi-aurora__blob fi-aurora__blob--1" />
      <span className="fi-aurora__blob fi-aurora__blob--2" />
      <span className="fi-aurora__blob fi-aurora__blob--3" />
      <span className="fi-aurora__blob fi-aurora__blob--4" />
    </div>
  )
}
