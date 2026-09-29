import { useEffect, useRef, type KeyboardEvent } from 'react'
import { chapters } from '../content/chapters'
import type { ChapterId } from '../content/types'

interface MenuOverlayProps {
  readonly open: boolean
  readonly onClose: () => void
  readonly onNavigate: (id: ChapterId) => void
}

const FOCUSABLE = 'a[href], button:not([disabled])'

export function MenuOverlay({ open, onClose, onNavigate }: MenuOverlayProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  if (!open) return null

  const trapFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }
    if (event.key !== 'Tab' || !dialogRef.current) return
    const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
    const first = items[0]
    const last = items.at(-1)
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  return (
    <div
      ref={dialogRef}
      id="site-menu"
      className="menu"
      role="dialog"
      aria-modal="true"
      aria-label="Chapters"
      onKeyDown={trapFocus}
    >
      <button ref={closeRef} type="button" className="menu__close pill" onClick={onClose} aria-label="Close menu">
        Close
      </button>
      <ol className="menu__list">
        {chapters.map((c, i) => (
          <li key={c.id}>
            <a
              href={`#${c.id}`}
              className="menu__link"
              onClick={(e) => {
                e.preventDefault()
                onNavigate(c.id)
              }}
            >
              <span className="menu__num">{String(i + 1).padStart(2, '0')}</span>
              <span className="menu__label">{c.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  )
}
