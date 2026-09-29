/** Static CSS rendition of Gargantua for browsers without WebGL2. */
export function Fallback() {
  return (
    <div className="fallback" aria-hidden="true">
      <div className="fallback__stars" />
      <div className="fallback__hole">
        <span className="fallback__halo" />
        <span className="fallback__shadow" />
        <span className="fallback__disk" />
      </div>
    </div>
  )
}
