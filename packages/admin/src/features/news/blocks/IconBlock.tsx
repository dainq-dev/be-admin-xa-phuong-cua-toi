import type { IconBlock as IconBlockType } from '@phuong-xa/shared'
import { icons } from 'lucide-react'

interface IconBlockProps {
  block: IconBlockType
}

export function IconBlock({ block }: IconBlockProps) {
  const { iconName, settings } = block
  const size = settings?.size || 48
  const color = settings?.color || 'currentColor'
  const align = settings?.align || 'center'
  
  // Dynamic icon rendering
  const IconComponent = (icons as any)[iconName] || (icons as any)['CircleHelp']

  return (
    <div style={{ display: 'flex', justifyContent: align, padding: '1rem' }}>
       <div style={{ color }}>
          <IconComponent size={size} />
       </div>
    </div>
  )
}
