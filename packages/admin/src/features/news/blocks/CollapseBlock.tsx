import type { CollapseBlock as CollapseBlockType } from '@phuong-xa/shared'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface CollapseBlockProps {
  block: CollapseBlockType
}

export function CollapseBlock({ block }: CollapseBlockProps) {
  const { title, content, settings } = block
  // Use local state for preview interaction, initial state from settings
  const [isOpen, setIsOpen] = useState(settings?.isOpen ?? false)

  return (
    <div className="border rounded-md overflow-hidden bg-white shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-medium text-gray-900">{title || 'Tiêu đề mục'}</span>
        {isOpen ? <ChevronDown className="h-5 w-5 text-gray-500" /> : <ChevronRight className="h-5 w-5 text-gray-500" />}
      </button>
      
      {isOpen && (
        <div className="p-4 border-t bg-white prose max-w-none">
           {content ? (
             <div dangerouslySetInnerHTML={{ __html: content }} />
           ) : (
             <p className="text-gray-400 italic">Nội dung chi tiết...</p>
           )}
        </div>
      )}
    </div>
  )
}
