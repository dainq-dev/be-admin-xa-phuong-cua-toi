import { Button } from '@/components/ui/button'
import { useEditorStore } from '../stores/editorStore'
import type { NewsBlockType } from '@phuong-xa/shared'
import { Heading, ALargeSmall, Image, Film, BookOpen, Laugh, Quote, SquareSplitHorizontal, QrCode } from 'lucide-react';

interface ToolItem {
  id: NewsBlockType;
  icon: React.ReactNode; //lucide icon JSX
  label: string;
  isBold?: boolean;
}

const TOOLS: ToolItem[] = [
  { id: 'heading', icon: <Heading />, label: 'Tiêu đề', isBold: true },
  { id: 'text', icon: <ALargeSmall />, label: 'Văn bản' },
  { id: 'image', icon: <Image />, label: 'Hình ảnh' },
  { id: 'youtube', icon: <Film />, label: 'Youtube' },
  { id: 'carousel', icon: <Heading />, label: 'Thư viện ảnh', isBold: true },
  { id: 'collapse', icon: <BookOpen />, label: 'Thu gọn' },
  { id: 'qr-code', icon: <QrCode />, label: 'QR Code' },
  { id: 'divider', icon: <SquareSplitHorizontal />, label: 'Phân cách' },
  { id: 'quote', icon: <Quote />, label: 'Trích dẫn' },
]

export function Toolbox() {
  const { addBlock } = useEditorStore()

  return (
    <div className="w-64 border-r px-2 py-4 overflow-y-auto bg-muted/20">
      <h3 className="font-semibold mb-4 text-sm uppercase text-muted-foreground">Công cụ</h3>
      <div className="grid grid-cols-2 gap-2">
         {TOOLS.map((tool) => (
           <Button 
             key={tool.id}
             variant="outline" 
             className="justify-start h-auto py-3 flex flex-col items-center gap-x-2 gap-y-4" 
             onClick={() => addBlock(tool.id)}
           >
              <span className={`text-2xl ${tool.isBold ? 'font-bold' : ''}`}>{tool.icon}</span>
              <span className="text-xs">{tool.label}</span>
           </Button>
         ))}
      </div>
    </div>
  )
}
