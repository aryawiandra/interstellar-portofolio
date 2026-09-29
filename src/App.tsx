import { lazy, Suspense, useEffect, useState } from 'react'
import { chapters } from './content/chapters'
import { detectHints, pickTier } from './lib/quality'
import { hasWebGL2 } from './lib/webgl'
import { useJourney } from './store/useJourney'
import { ChapterSection } from './ui/ChapterSection'
import { Fallback } from './ui/Fallback'
import { Loader } from './ui/Loader'
import { Nav } from './ui/Nav'
import { SceneBoundary } from './ui/SceneBoundary'
import { renderChapter } from './ui/sections/renderChapter'
import { useScrollDriver } from './ui/useScrollDriver'
import { Veil } from './ui/Veil'

const Experience = lazy(() => import('./scene/Experience'))

function useEnvironment(webgl: boolean) {
  useEffect(() => {
    const { setReducedMotion, setTier, setLoaded } = useJourney.getState()
    setTier(pickTier(detectHints()))
    if (!webgl) setLoaded(true)

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReducedMotion(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [webgl])
}

export function App() {
  const [webgl] = useState(hasWebGL2)
  useEnvironment(webgl)
  const navigate = useScrollDriver()

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Loader />
      <div className="stage" aria-hidden="true">
        {webgl ? (
          <SceneBoundary>
            <Suspense fallback={null}>
              <Experience />
            </Suspense>
          </SceneBoundary>
        ) : (
          <Fallback />
        )}
      </div>
      <Veil />
      <Nav onNavigate={navigate} />
      <main id="main">
        {chapters.map((c, i) => (
          <ChapterSection key={c.id} chapter={c} index={i}>
            {renderChapter(c.id)}
          </ChapterSection>
        ))}
      </main>
    </>
  )
}
