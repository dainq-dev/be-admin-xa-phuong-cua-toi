import type { QuoteBlock as QuoteBlockType } from '@phuong-xa/shared'
import { Quote } from 'lucide-react'

interface QuoteBlockProps {
  block: QuoteBlockType
}

export function QuoteBlock({ block }: QuoteBlockProps) {
  const { content, author, settings } = block
  const align = settings?.align || 'left'
  const backgroundColor = settings?.backgroundColor || '#f9fafb' // gray-50

  return (
    <div 
      className="p-6 rounded-lg border-l-4 border-primary relative"
      style={{ 
        backgroundColor,
        textAlign: align 
      }}
    >
      <Quote className="absolute top-4 left-4 h-6 w-6 text-primary/20" />
      <div className="relative z-10">
        <p className="text-lg italic text-gray-800 mb-2">"{content || 'Nhập nội dung trích dẫn...'}"</p>
        <footer className="text-sm font-medium text-gray-600">— {author || 'Tác giả'}</footer>
      </div>
    </div>
  )
}
