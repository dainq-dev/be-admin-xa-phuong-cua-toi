/**
 * ErrorFallback Component
 * Displays a user-friendly error message when something goes wrong
 */

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorFallbackProps {
  error?: Error | null
  onReset?: () => void
}

export function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Đã xảy ra lỗi
      </h2>
      <p className="text-gray-500 text-center mb-4 max-w-md">
        Có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu lỗi vẫn tiếp tục.
      </p>
      {error && (
        <pre className="bg-gray-100 p-3 rounded-md text-sm text-red-600 mb-4 max-w-md overflow-auto">
          {error.message}
        </pre>
      )}
      <div className="flex gap-3">
        {onReset && (
          <Button variant="outline" onClick={onReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Thử lại
          </Button>
        )}
        <Button variant="default" onClick={() => window.location.href = '/'}>
          Về trang chủ
        </Button>
      </div>
    </div>
  )
}
