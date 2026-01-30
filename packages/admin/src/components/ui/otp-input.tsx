/**
 * OTP Input Component
 * Beautiful OTP input with 6 separate boxes and verification animation
 */

import { useRef, useState, useEffect } from 'react'
import type { KeyboardEvent, ClipboardEvent } from 'react'
import { cn } from '@/lib/utils'

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  isVerifying?: boolean
  className?: string
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  isVerifying = false,
  className,
}: OTPInputProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length)
  }, [length])

  // Auto-focus first input on mount
  useEffect(() => {
    if (!disabled && inputRefs.current[0]) {
      inputRefs.current[0]?.focus()
    }
  }, [disabled])

  // Handle value changes and completion
  useEffect(() => {
    if (value.length === length && onComplete && !isVerifying) {
      onComplete(value)
    }
  }, [value, length, onComplete, isVerifying])

  const handleChange = (index: number, inputValue: string) => {
    if (disabled || isVerifying) return

    // Only allow digits
    const digit = inputValue.replace(/[^0-9]/g, '')
    
    if (digit.length > 1) {
      // Handle paste of multiple digits
      handlePaste(index, digit)
      return
    }

    // Update value
    const newValue = value.split('')
    newValue[index] = digit
    const newOTP = newValue.join('').slice(0, length)
    onChange(newOTP)

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
      setActiveIndex(index + 1)
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled || isVerifying) return

    if (e.key === 'Backspace') {
      e.preventDefault()
      const newValue = value.split('')
      
      if (newValue[index]) {
        // Clear current box
        newValue[index] = ''
        onChange(newValue.join(''))
      } else if (index > 0) {
        // Move to previous box and clear it
        newValue[index - 1] = ''
        onChange(newValue.join(''))
        inputRefs.current[index - 1]?.focus()
        setActiveIndex(index - 1)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
      setActiveIndex(index - 1)
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
      setActiveIndex(index + 1)
    }
  }

  const handlePaste = (startIndex: number, pastedData: string) => {
    const digits = pastedData.replace(/[^0-9]/g, '').slice(0, length)
    const newValue = value.split('')
    
    for (let i = 0; i < digits.length && startIndex + i < length; i++) {
      newValue[startIndex + i] = digits[i]
    }
    
    const newOTP = newValue.join('')
    onChange(newOTP)
    
    // Focus last filled box or next empty box
    const nextIndex = Math.min(startIndex + digits.length, length - 1)
    inputRefs.current[nextIndex]?.focus()
    setActiveIndex(nextIndex)
  }

  const handlePasteEvent = (e: ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    handlePaste(index, pastedData)
  }

  return (
    <div className={cn('flex gap-2 justify-center', className)}>
      {Array.from({ length }, (_, index) => {
        const isActive = index === activeIndex && !disabled && !isVerifying
        const isFilled = !!value[index]
        const showAnimation = isVerifying && index <= value.length - 1
        
        return (
          <div
            key={index}
            className="relative"
            style={{
              animationDelay: isVerifying ? `${index * 100}ms` : '0ms',
            }}
          >
            <input
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={value[index] || ''}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={(e) => handlePasteEvent(e, index)}
              onFocus={() => setActiveIndex(index)}
              disabled={disabled || isVerifying}
              className={cn(
                'w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                isActive && 'border-primary ring-2 ring-primary ring-offset-2 scale-105',
                isFilled && !isActive && 'border-primary/50 bg-primary/5',
                !isFilled && !isActive && 'border-gray-300 hover:border-gray-400',
                disabled && 'bg-gray-100 cursor-not-allowed',
                isVerifying && 'border-green-500 bg-green-50',
                showAnimation && 'animate-pulse-success'
              )}
              aria-label={`OTP digit ${index + 1}`}
            />
            
            {/* Success checkmark animation */}
            {showAnimation && (
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none animate-scale-in"
                style={{
                  animationDelay: `${index * 100 + 200}ms`,
                }}
              >
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
