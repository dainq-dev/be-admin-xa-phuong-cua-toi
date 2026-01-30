import type { ImageBlock as ImageBlockType } from '@phuong-xa/shared'


interface ImageBlockProps {
  block: ImageBlockType
}

export function ImageBlock({ block }: ImageBlockProps) {
  const { src, alt, settings } = block

  if (!src) {
    return (
      <div className="w-full bg-muted/50 border-2 border-dashed border-muted-foreground/20 rounded-lg h-48 flex flex-col items-center justify-center text-muted-foreground gap-2">
         <span className="text-4xl">🖼️</span>
         <span>Chưa chọn hình ảnh</span>
      </div>
    )
  }

  const style = {
    width: settings.width || '100%',
    height: settings.height,
    objectFit: settings.objectFit || 'cover',
  } as React.CSSProperties

  return (
    <div className="flex justify-center">
      <img 
        src={src} 
        alt={alt || 'Image'} 
        className="rounded-lg max-w-full"
        style={style}
      />
    </div>
  )
}
