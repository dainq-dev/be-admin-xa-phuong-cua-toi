import type { TextBlock as TextBlockType } from '@phuong-xa/shared'

interface TextBlockProps {
  block: TextBlockType
  preview?: boolean
}

export function TextBlock({ block, preview: _preview }: TextBlockProps) {
  const { content, settings } = block
  
  // Convert settings to styles/classes if needed
  const style = {
    color: settings.color,
    fontSize: settings.fontSize ? `${settings.fontSize}px` : undefined,
    textAlign: settings.align,
  }

  return (
    <div style={style} className="prose max-w-none dark:prose-invert">
       {/* In real editor, this could be a Rich Text Editor like Tiptap */}
       {content || <span className="text-muted-foreground italic">Trống...</span>}
    </div>
  )
}
