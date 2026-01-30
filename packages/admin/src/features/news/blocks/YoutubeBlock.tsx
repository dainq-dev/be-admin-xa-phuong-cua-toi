import type { YoutubeBlock as YoutubeBlockType } from '@phuong-xa/shared'

interface YoutubeBlockProps {
  block: YoutubeBlockType
}

export function YoutubeBlock({ block }: YoutubeBlockProps) {
  const { videoId, settings: _settings } = block
  
  if (!videoId) {
     return (
        <div className="w-full bg-red-50 dark:bg-red-950/20 border-2 border-dashed border-red-200 rounded-lg h-48 flex flex-col items-center justify-center text-red-500 gap-2">
           <span className="text-4xl">📺</span>
           <span>Chưa nhập video ID</span>
        </div>
     )
  }

  return (
    <div className="w-full rounded-lg overflow-hidden relative" style={{ paddingBottom: '56.25%' /* 16:9 Aspect Ratio */ }}>
       <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
       ></iframe>
    </div>
  )
}
