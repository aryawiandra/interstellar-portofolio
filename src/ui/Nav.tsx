import { useState } from 'react'
import { profile } from '../content/profile'
import type { ChapterId } from '../content/types'
import { ChapterIndicator } from './ChapterIndicator'
import { MenuOverlay } from './MenuOverlay'

interface NavProps {
  readonly onNavigate: (id: ChapterId) => void
}

export function Nav({ onNavigate }: NavProps) {
  const [open, setOpen] = useState(false)

  const go = (id: ChapterId) => {
    setOpen(false)
    onNavigate(id)
  }

  return (
    <header className="nav">
      <a
        href="#gargantua"
        className="nav__brand"
        onClick={(e) => {
          e.preventDefault()
          go('gargantua')
        }}
      >
        {profile.shortName}
      </a>
      <ChapterIndicator />
      <div className="nav__actions">
        <button type="button" className="pill" onClick={() => go('horizon')}>
          Contact
        </button>
        <button
          type="button"
          className="nav__menu"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen(true)}
        >
          <span />
          <span />
        </button>
      </div>
      <MenuOverlay open={open} onClose={() => setOpen(false)} onNavigate={go} />
    </header>
  )
}
