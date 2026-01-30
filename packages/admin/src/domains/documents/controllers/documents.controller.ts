/**
 * Documents Controller
 * Handles logic for administrative documents and procedures
 */

import { DocumentsAPI, type ListDocumentsParams, type CreateDocumentRequest, type UpdateDocumentRequest } from '@/api/documents.api'
import { APIError } from '@/api/client'

export class DocumentsController {
  /**
   * List documents
   */
  async listDocuments(params?: ListDocumentsParams): Promise<any> {
    try {
      return await DocumentsAPI.listDocuments(params)
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể tải danh sách tài liệu')
      }
      throw new Error('Không thể tải danh sách tài liệu')
    }
  }

  /**
   * Get document details
   */
  async getDocument(idOrSlug: string): Promise<any> {
    try {
      return await DocumentsAPI.getDocument(idOrSlug)
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể tải chi tiết tài liệu')
      }
      throw new Error('Không thể tải chi tiết tài liệu')
    }
  }

  /**
   * Create document
   */
  async createDocument(data: CreateDocumentRequest): Promise<any> {
    try {
      return await DocumentsAPI.createDocument(data)
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể tạo tài liệu')
      }
      throw new Error('Không thể tạo tài liệu')
    }
  }

  /**
   * Update document
   */
  async updateDocument(id: string, data: UpdateDocumentRequest): Promise<any> {
    try {
      return await DocumentsAPI.updateDocument(id, data)
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể cập nhật tài liệu')
      }
      throw new Error('Không thể cập nhật tài liệu')
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(id: string): Promise<void> {
    try {
      await DocumentsAPI.deleteDocument(id)
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể xóa tài liệu')
      }
      throw new Error('Không thể xóa tài liệu')
    }
  }
}
