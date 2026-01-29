/**
 * Validators
 * Shared validation utilities
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate Vietnamese phone number
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')

  // Vietnamese phone numbers: 10-11 digits, starts with 0
  return /^0\d{9,10}$/.test(cleaned)
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate date range
 */
export function isDateInRange(
  date: Date | string,
  startDate: Date | string,
  endDate: Date | string
): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate

  return d >= start && d <= end
}

/**
 * Validate string length
 */
export function isValidLength(
  text: string,
  min: number,
  max: number
): boolean {
  return text.length >= min && text.length <= max
}

/**
 * Check if string contains only digits
 */
export function isNumeric(text: string): boolean {
  return /^\d+$/.test(text)
}

/**
 * Check if string is empty or whitespace only
 */
export function isEmpty(text: string): boolean {
  return text.trim().length === 0
}

/**
 * Sanitize HTML (basic - remove script tags)
 */
export function sanitizeHtml(html: string): string {
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}

/**
 * Validate Vietnamese National ID (CMND/CCCD)
 */
export function isValidNationalId(id: string): boolean {
  // Remove all non-digit characters
  const cleaned = id.replace(/\D/g, '')

  // CMND: 9 or 12 digits
  // CCCD: 12 digits
  return /^\d{9}$/.test(cleaned) || /^\d{12}$/.test(cleaned)
}

/**
 * Validate password strength
 */
export function isStrongPassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Mật khẩu phải có ít nhất 8 ký tự')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ hoa')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ thường')
  }

  if (!/\d/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 số')
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate coordinate (latitude/longitude)
 */
export function isValidCoordinate(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return d < new Date()
}

/**
 * Check if date is in the future
 */
export function isFutureDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return d > new Date()
}
