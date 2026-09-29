import type { SpecRow } from '../content/types'

export function SpecTable({ rows }: { readonly rows: readonly SpecRow[] }) {
  if (rows.length === 0) return null
  return (
    <dl className="spec">
      {rows.map((r) => (
        <div className="spec__row" key={r.key}>
          <dt>{r.key}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  )
}
