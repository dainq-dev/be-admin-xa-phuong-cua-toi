import { DndContext, type DragEndEvent, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Smartphone, Monitor, Tablet, Save, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEditorStore } from '../stores/editorStore'
import { SortableBlock } from './SortableBlock'
import { HeadingBlock } from '../blocks/HeadingBlock'
import { TextBlock } from '../blocks/TextBlock'
import { ImageBlock } from '../blocks/ImageBlock'
import { YoutubeBlock } from '../blocks/YoutubeBlock'
import { DividerBlock } from '../blocks/DividerBlock'
import { QuoteBlock } from '../blocks/QuoteBlock'
import { QrCodeBlock } from '../blocks/QrCodeBlock'
import { IconBlock } from '../blocks/IconBlock'
import { CollapseBlock } from '../blocks/CollapseBlock'

export function EditorCanvas() {
  const { blocks, selectedBlockId, viewMode, setViewMode, reorderBlocks } = useEditorStore()

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id)
      const newIndex = blocks.findIndex((b) => b.id === over.id)
      reorderBlocks(oldIndex, newIndex)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-900 overflow-hidden relative">
      {/* Toolbar */}
      <div className="h-12 border-b bg-background flex items-center justify-between px-4">
         <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
            <Button 
              variant={viewMode === 'desktop' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('desktop')}
              title="Desktop"
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode.includes('ipad') ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('ipad-portrait')}
              title="Tablet"
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode.includes('iphone') ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('iphone-portrait')}
              title="Mobile"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
         </div>
         <div className="flex items-center gap-2">

            <Button size="sm" className="gap-2">
              <Eye className="h-4 w-4" /> Xem trước
            </Button>
            <Button size="sm" className="gap-2">
              <Save className="h-4 w-4" /> Lưu
            </Button>
         </div>
      </div>

      {/* Viewport */}
      <div className="flex-1 overflow-auto p-8 flex justify-center">
          <div 
            className={cn(
              "bg-background shadow-xl transition-all duration-300 min-h-[500px] border p-8 overflow-scroll scrollbar-hide",
              viewMode === 'desktop' && "w-full max-w-4xl",
              viewMode === 'ipad-portrait' && "w-[768px]",
              viewMode === 'iphone-portrait' && "w-[375px]",
            )}
          >
            {/* DROPPABLE AREA */}
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={blocks} strategy={verticalListSortingStrategy}>
                 <div className="space-y-4">
                    {blocks.length === 0 && (
                      <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
                        Kéo thả hoặc nhấn vào công cụ bên trái để thêm nội dung
                      </div>
                    )}
                    
                    {blocks.map((block) => {
                      const isSelected = selectedBlockId === block.id
                      
                      return (
                        <SortableBlock key={block.id} id={block.id} isSelected={isSelected}>
                            {block.type === 'heading' && <HeadingBlock block={block as any} />}
                            {block.type === 'text' && <TextBlock block={block as any} />}
                            {block.type === 'image' && <ImageBlock block={block as any} />}
                            {block.type === 'youtube' && <YoutubeBlock block={block as any} />}
                            {block.type === 'carousel' && <div className="p-4 bg-muted rounded text-center">Carousel (Coming soon)</div>}
                            {block.type === 'divider' && <DividerBlock block={block as any} />}
                            {block.type === 'quote' && <QuoteBlock block={block as any} />}
                            {block.type === 'qr-code' && <QrCodeBlock block={block as any} />}
                            {block.type === 'icon' && <IconBlock block={block as any} />}
                            {block.type === 'collapse' && <CollapseBlock block={block as any} />}
                        </SortableBlock>
                      )
                    })}
                 </div>
              </SortableContext>
            </DndContext>
          </div>
      </div>
    </div>
  )
}
