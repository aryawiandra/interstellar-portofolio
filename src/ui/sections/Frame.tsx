import type { CSSProperties, ReactNode } from 'react'
import type { ChapterId } from '../../content/types'
import { Telemetry } from '../hud/Telemetry'

interface FrameProps {
  readonly id: ChapterId
  readonly eyebrow: string
  readonly title: string
  readonly titleLevel?: 1 | 2
  readonly hud: readonly string[]
  /** Bottom-left content. */
  readonly children?: ReactNode
  /** Right-column content above the HUD. */
  readonly aside?: ReactNode
  /** Absolutely positioned decorations over the scene (detection boxes). */
  readonly overlay?: ReactNode
  readonly variant?: 'default' | 'split'
}

/** Stagger index for reveal animations. */
export const rv = (i: number): CSSProperties => ({ ['--i' as string]: i })

export function Frame({ id, eyebrow, title, titleLevel = 2, hud, children, aside, overlay, variant = 'default' }: FrameProps) {
  const Heading = titleLevel === 1 ? 'h1' : 'h2'
  return (
    <div className="layout" data-variant={variant}>
      {overlay && <div className="layout__overlay">{overlay}</div>}
      <div className="layout__top">
        <p className="eyebrow rv" style={rv(0)}>
          {eyebrow}
        </p>
        <Heading id={`${id}-title`} className={`title title--${Heading} rv`} style={rv(1)}>
          {title}
        </Heading>
      </div>
      {children && <div className="layout__body">{children}</div>}
      {aside && <div className="layout__aside">{aside}</div>}
      <aside className="layout__hud rv" style={rv(6)} aria-label="Telemetry">
        <Telemetry lines={hud} />
      </aside>
    </div>
  )
}
