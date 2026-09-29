import { createContext, useContext, type ReactNode } from 'react'
import type { Chapter } from '../content/types'
import { useJourney } from '../store/useJourney'

interface ChapterContextValue {
  /** True while this chapter's content should be on screen. */
  readonly visible: boolean
}

export const ChapterContext = createContext<ChapterContextValue>({ visible: true })

export const useChapter = () => useContext(ChapterContext)

interface ChapterSectionProps {
  readonly chapter: Chapter
  readonly index: number
  readonly children: ReactNode
}

/** A tall scroll section whose content sticks to the viewport while its chapter is active. */
export function ChapterSection({ chapter, index, children }: ChapterSectionProps) {
  const visible = useJourney((s) => s.chapterIndex === index && !s.travelling)

  return (
    <section
      id={chapter.id}
      className="chapter"
      data-visible={visible}
      aria-labelledby={`${chapter.id}-title`}
      style={{ minHeight: `${chapter.heightVh}vh` }}
    >
      <ChapterContext.Provider value={{ visible }}>
        <div className="frame">{children}</div>
      </ChapterContext.Provider>
    </section>
  )
}
