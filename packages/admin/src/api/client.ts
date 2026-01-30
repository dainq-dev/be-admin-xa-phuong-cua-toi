/**
 * API Client with Token Management (Fetch-based)
 * Features:
 * - Automatic Authorization header injection
 * - 401 interceptor with token refresh
 * - Retry failed requests after refresh
 * - Automatic logout on refresh failure
 */

import { TokenStorage } from '@/utils/token'

/**
 * API base URL - defaults to /api which proxies to backend via Vite
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * Flag to prevent multiple simultaneous refresh attempts
 */
let isRefreshing = false

/**
 * Queue of failed requests waiting for token refresh
 */
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (error?: unknown) => void
}> = []

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve(token)
    }
  })

  failedQueue = []
}

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  status: number
  statusText: string
  data: any

  constructor(
    status: number,
    statusText: string,
    data: any,
    message?: string
  ) {
    super(message || `API Error: ${status} ${statusText}`)
    this.name = 'APIError'
    this.status = status
    this.statusText = statusText
    this.data = data
  }
}

/**
 * API Client Request Options
 */
export interface APIClientOptions extends RequestInit {
  params?: Record<string, any>
  _retry?: boolean
}

/**
 * Enhanced fetch with automatic token injection and retry logic
 */
async function apiFetch<T = any>(
  endpoint: string,
  options: APIClientOptions = {}
): Promise<T> {
  const { params, _retry, ...fetchOptions } = options

  // Build URL with query params
  let url = `${API_BASE_URL}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  // Add default headers
  const headers = new Headers(fetchOptions.headers)
  if (!headers.has('Content-Type') && fetchOptions.body) {
    headers.set('Content-Type', 'application/json')
  }

  // Add Authorization header
  const token = TokenStorage.getAccessToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  // Make request
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  })

  // Handle 401 Unauthorized
  if (response.status === 401 && !_retry) {
    // If this is a refresh token request that failed, logout
    if (endpoint.includes('/auth/refresh')) {
      TokenStorage.clearTokens()
      window.location.href = '/dang-nhap'
      throw new APIError(401, 'Unauthorized', null, 'Session expired')
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then(() => {
          // Retry with new token
          return apiFetch<T>(endpoint, { ...options, _retry: true })
        })
        .catch((err) => {
          throw err
        })
    }

    // Start refresh process
    isRefreshing = true

    const refreshToken = TokenStorage.getRefreshToken()

    if (!refreshToken) {
      TokenStorage.clearTokens()
      window.location.href = '/dang-nhap'
      throw new APIError(401, 'Unauthorized', null, 'No refresh token')
    }

    try {
      // Call refresh token endpoint
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (!refreshResponse.ok) {
        throw new Error('Refresh failed')
      }

      const refreshData = await refreshResponse.json()
      const { accessToken, refreshToken: newRefreshToken } = refreshData

      // Save new tokens
      TokenStorage.setTokens(accessToken, newRefreshToken)

      // Process queued requests
      processQueue(null, accessToken)

      // Retry original request
      return apiFetch<T>(endpoint, { ...options, _retry: true })
    } catch (refreshError) {
      // Refresh failed - logout
      processQueue(refreshError as Error, null)
      TokenStorage.clearTokens()
      window.location.href = '/dang-nhap'
      throw refreshError
    } finally {
      isRefreshing = false
    }
  }

  // Handle other error responses
  if (!response.ok) {
    let errorData: any
    try {
      errorData = await response.json()
    } catch {
      errorData = { error: response.statusText }
    }

    throw new APIError(
      response.status,
      response.statusText,
      errorData,
      errorData?.error || errorData?.message
    )
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T
  }

  // Parse JSON response
  try {
    return await response.json()
  } catch {
    return undefined as T
  }
}

/**
 * HTTP Client methods
 */
export const apiClient = {
  get: <T = any>(endpoint: string, options: APIClientOptions = {}) => {
    return apiFetch<T>(endpoint, { ...options, method: 'GET' })
  },

  post: <T = any>(endpoint: string, data?: any, options: APIClientOptions = {}) => {
    return apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  patch: <T = any>(endpoint: string, data?: any, options: APIClientOptions = {}) => {
    return apiFetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  put: <T = any>(endpoint: string, data?: any, options: APIClientOptions = {}) => {
    return apiFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  delete: <T = any>(endpoint: string, options: APIClientOptions = {}) => {
    return apiFetch<T>(endpoint, { ...options, method: 'DELETE' })
  },
}

export default apiClient
