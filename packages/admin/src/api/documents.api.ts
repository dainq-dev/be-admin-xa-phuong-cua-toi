/**
 * Documents API Endpoints
 */

import apiClient from './client'

export interface ListDocumentsParams {
  limit?: number
  offset?: number
  category?: string
  search?: string
}

export interface CreateDocumentRequest {
  title: string
  description?: string
  category: string
  department?: string
  processingTime?: string
  fee?: string
  steps?: Array<{
    title: string
    description?: string
    location?: string
    estimatedTime?: string
  }>
  requiredDocs?: Array<{
    name: string
    isRequired: boolean
    notes?: string
  }>
}

export interface UpdateDocumentRequest extends Partial<CreateDocumentRequest> {}

export const DocumentsAPI = {
  /**
   * List documents with pagination and filters
   */
  async listDocuments(params?: ListDocumentsParams): Promise<any> {
    return apiClient.get('/documents', { params })
  },

  /**
   * Get document by ID or slug
   */
  async getDocument(idOrSlug: string): Promise<any> {
    return apiClient.get(`/documents/${idOrSlug}`)
  },

  /**
   * Create new document
   */
  async createDocument(data: CreateDocumentRequest): Promise<any> {
    return apiClient.post('/documents', data)
  },

  /**
   * Update existing document
   */
  async updateDocument(id: string, data: UpdateDocumentRequest): Promise<any> {
    return apiClient.patch(`/documents/${id}`, data)
  },

  /**
   * Delete document
   */
  async deleteDocument(id: string): Promise<void> {
    await apiClient.delete(`/documents/${id}`)
  },
}
