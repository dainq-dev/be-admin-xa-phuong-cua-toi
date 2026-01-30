import { useEditorStore } from '../stores/editorStore'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'


export function SettingsPanel() {
  const { blocks, selectedBlockId, updateBlock } = useEditorStore()
  
  const selectedBlock = blocks.find(b => b.id === selectedBlockId)

  if (!selectedBlock) {
    return (
      <div className="w-80 border-l bg-background p-4 flex flex-col items-center justify-center text-muted-foreground h-full">
         <p>Chọn một block để chỉnh sửa</p>
      </div>
    )
  }

  const { type, settings } = selectedBlock

  const handleChange = (key: string, value: any) => {
    updateBlock(selectedBlock.id, {
      settings: { ...settings, [key]: value } as any
    })
  }
  
  const handleContentChange = (value: string) => {
     updateBlock(selectedBlock.id, {
        content: value
     } as any)
  }

  return (
    <div className="w-80 border-l bg-background flex flex-col h-full">
      <div className="p-4 border-b">
         <h3 className="font-semibold text-sm uppercase">Cài đặt {type}</h3>
      </div>
      
      <div className="p-4 space-y-6 overflow-y-auto flex-1">
         {/* Common Content Fields */}
         {(type === 'text' || type === 'heading') && (
            <div className="space-y-2">
               <Label>Nội dung</Label>
               {type === 'heading' ? (
                 <Input 
                    value={(selectedBlock as any).content || ''} 
                    onChange={(e) => handleContentChange(e.target.value)} 
                 />
               ) : (
                 <Input // Should be Textarea
                    value={(selectedBlock as any).content || ''} 
                    onChange={(e) => handleContentChange(e.target.value)} 
                 />
               )}
            </div>
         )}

         {/* Type Specific Fields */}
         {type === 'heading' && (
            <div className="space-y-2">
               <Label>Level</Label>
               <Select 
                  value={String((selectedBlock as any).level || 2)} 
                  onValueChange={(v) => updateBlock(selectedBlock.id, { level: Number(v) } as any)}
               >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                     {[1, 2, 3, 4, 5, 6].map(l => (
                        <SelectItem key={l} value={String(l)}>Heading {l}</SelectItem>
                     ))}
                  </SelectContent>
               </Select>
            </div>
         )}
         
         {type === 'youtube' && (
             <div className="space-y-2">
                <Label>Youtube Video ID</Label>
                <Input 
                   value={(selectedBlock as any).videoId || ''} 
                   onChange={(e) => updateBlock(selectedBlock.id, { videoId: e.target.value } as any)} 
                   placeholder="ex: dQw4w9WgXcQ"
                />
             </div>
         )}
         
         {type === 'image' && (
             <div className="space-y-4">
                <div className="space-y-2">
                   <Label>URL Hình ảnh</Label>
                   <Input 
                      value={(selectedBlock as any).src || ''} 
                      onChange={(e) => updateBlock(selectedBlock.id, { src: e.target.value } as any)} 
                   />
                </div>
                <div className="space-y-2">
                   <Label>Chiều rộng</Label>
                   <Input 
                      value={settings.width || '100%'} 
                      onChange={(e) => handleChange('width', e.target.value)} 
                   />
                </div>
             </div>
         )}

         <Separator />
         
         {/* Common Style Fields */}
         <div className="space-y-4">
            <h4 className="font-medium text-sm">Giao diện</h4>
            
            {(type === 'text' || type === 'heading') && (
               <>
                  <div className="space-y-2">
                     <Label>Căn lề</Label>
                     <Select 
                        value={settings.align || 'left'} 
                        onValueChange={(v) => handleChange('align', v)}
                     >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                           <SelectItem value="left">Trái</SelectItem>
                           <SelectItem value="center">Giữa</SelectItem>
                           <SelectItem value="right">Phải</SelectItem>
                           <SelectItem value="justify">Đều</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
                  
                  <div className="space-y-2">
                     <Label>Màu sắc</Label>
                     <div className="flex gap-2">
                        <Input 
                           type="color" 
                           className="w-12 h-10 p-1"
                           value={settings.color || '#000000'}
                           onChange={(e) => handleChange('color', e.target.value)}
                        />
                        <Input 
                           value={settings.color || ''}
                           onChange={(e) => handleChange('color', e.target.value)}
                           placeholder="#000000"
                        />
                     </div>
                  </div>
               </>
            )}
         </div>
      </div>
    </div>
  )
}
