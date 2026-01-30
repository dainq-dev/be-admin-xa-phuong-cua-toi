import type { HeadingBlock as HeadingBlockType } from '@phuong-xa/shared'
import { cn } from '@/lib/utils'

interface HeadingBlockProps {
  block: HeadingBlockType
}

export function HeadingBlock({ block }: HeadingBlockProps) {
  const { content, level, settings } = block
  
  // Explicitly map levels to elements for better type safety
  const Component = ({
     1: 'h1',
     2: 'h2',
     3: 'h3',
     4: 'h4',
     5: 'h5',
     6: 'h6'
  }[level] || 'h2') as any
  
  const alignClass = {
     left: 'text-left',
     center: 'text-center',
     right: 'text-right'
  }[settings.align || 'left']

  // Size mapping (Tailwind)
  const sizeClass = {
    1: 'text-4xl font-extrabold',
    2: 'text-3xl font-bold',
    3: 'text-2xl font-bold',
    4: 'text-xl font-semibold',
    5: 'text-lg font-semibold',
    6: 'text-base font-medium',
  }[level]

  return (
    <Component className={cn(sizeClass, alignClass)} style={{ color: settings.color }}>
       {content}
    </Component>
  )
}
