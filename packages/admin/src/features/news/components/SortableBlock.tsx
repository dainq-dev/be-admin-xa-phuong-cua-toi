import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { GripVertical, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '../stores/editorStore'

interface SortableBlockProps {
  id: string
  isSelected: boolean
  children: React.ReactNode
}

export function SortableBlock({ id, isSelected, children }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const { selectBlock, removeBlock } = useEditorStore()

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group border rounded-lg transition-all",
        isSelected ? "ring-2 ring-primary border-transparent" : "border-border hover:border-primary/50",
        isDragging && "opacity-50 shadow-lg"
      )}
      onClick={(e) => {
        e.stopPropagation()
        selectBlock(id)
      }}
    >
      {/* Drag Handle - Only visible on hover or selected */}
      <div 
        className={cn(
          "absolute left-2 top-1/2 -translate-y-1/2 p-1 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity z-10",
          isSelected && "opacity-100"
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Content */}
      <div className="pl-10 p-4 min-h-[50px]">
        {children}
      </div>

      {/* Actions */}
      <div 
         className={cn(
            "absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-1",
            isSelected && "opacity-100"
         )}
      >
         <Button 
            variant="destructive" 
            size="icon" 
            className="h-6 w-6"
            onClick={(e) => {
               e.stopPropagation()
               removeBlock(id)
            }}
         >
            <Trash2 className="h-3 w-3" />
         </Button>
      </div>
    </div>
  )
}
