import type { DividerBlock as DividerBlockType } from '@phuong-xa/shared'

interface DividerBlockProps {
  block: DividerBlockType
}

export function DividerBlock({ block }: DividerBlockProps) {
  const { settings } = block
  const style = settings?.style || 'solid'
  const color = settings?.color || '#e5e7eb' // gray-200
  const paddingTop = settings?.paddingTop || '1rem'
  const paddingBottom = settings?.paddingBottom || '1rem'

  return (
    <div style={{ paddingTop, paddingBottom }}>
      <hr style={{ borderTopWidth: 1, borderTopStyle: style, borderTopColor: color }} />
    </div>
  )
}
