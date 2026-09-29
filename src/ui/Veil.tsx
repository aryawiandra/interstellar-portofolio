import { useEffect, useRef } from 'react'
import { journey, useJourney } from '../store/useJourney'

/** Full-screen covers for camera jumps: a black fade, a wormhole flare, and a navigation blackout. */
export function Veil() {
  const fadeRef = useRef<HTMLDivElement>(null)
  const wormRef = useRef<HTMLDivElement>(null)
  const blackout = useJourney((s) => s.blackout)

  useEffect(() => {
    let raf = requestAnimationFrame(function loop() {
      const fade = journey.veilStyle === 'fade' ? journey.veil : 0
      const worm = journey.veilStyle === 'wormhole' ? journey.veil : 0
      if (fadeRef.current) fadeRef.current.style.opacity = String(fade)
      if (wormRef.current) {
        wormRef.current.style.opacity = String(Math.min(1, worm * 1.15))
        wormRef.current.style.setProperty('--warp', String(worm))
      }
      raf = requestAnimationFrame(loop)
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <>
      <div ref={fadeRef} className="veil veil--fade" aria-hidden="true" />
      <div ref={wormRef} className="veil veil--wormhole" aria-hidden="true" />
      <div className="veil veil--blackout" data-on={blackout} aria-hidden="true" />
    </>
  )
}
