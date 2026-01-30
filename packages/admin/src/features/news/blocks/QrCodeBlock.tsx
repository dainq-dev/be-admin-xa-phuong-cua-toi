import type { QrCodeBlock as QrCodeBlockType } from '@phuong-xa/shared'
import { QrCode } from 'lucide-react'

interface QrCodeBlockProps {
  block: QrCodeBlockType
}

export function QrCodeBlock({ block }: QrCodeBlockProps) {
  const { value, settings } = block
  const size = settings?.size || 128
  const level = settings?.level || 'M'

  return (
    <div className="flex flex-col items-center justify-center p-4 border rounded bg-white">
      {/* Real QR Code generation is complex to include without a library like 'react-qr-code' or 'qrcode.react' */}
      {/* Using a placeholder for now as per instructions */}
      <div 
        style={{ width: size, height: size }} 
        className="bg-gray-100 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded"
      >
         <QrCode className="h-10 w-10 text-gray-400 mb-2" />
         <span className="text-xs text-gray-500">QR Code</span>
         <span className="text-[10px] text-gray-400 mt-1">{level} Level</span>
      </div>
      <div className="mt-2 text-sm text-gray-600 font-mono break-all max-w-[200px] text-center">
        {value || 'Chưa có dữ liệu'}
      </div>
    </div>
  )
}
