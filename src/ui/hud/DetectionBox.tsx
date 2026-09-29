export interface DetectionSlot {
  /** Position of the box's top-left corner, in % of the viewport. */
  readonly left: number
  readonly top: number
  /** Box edge length in vmin. */
  readonly size: number
}

interface DetectionBoxProps {
  readonly label: string
  readonly slot: DetectionSlot
  readonly index: number
}

export function DetectionBox({ label, slot, index }: DetectionBoxProps) {
  return (
    <div
      className="detect"
      aria-hidden="true"
      style={{
        left: `${slot.left}%`,
        top: `${slot.top}%`,
        width: `${slot.size}vmin`,
        height: `${slot.size}vmin`,
        ['--i' as string]: index,
      }}
    >
      <span className="detect__label">{label}</span>
    </div>
  )
}
