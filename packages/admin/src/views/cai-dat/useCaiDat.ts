/**
 * useCaiDat Hook
 * Custom hook for Settings page - handles all business logic & state management
 * Including ward info, user settings, notifications, and feature flags
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { WardController } from '@/domains/ward/controllers/ward.controller'
import { AuthController } from '@/domains/auth/controllers/auth.controller'
import type { UpdateSettingsRequest, UserSettings, ThemeType, LanguageType } from '@phuong-xa/shared'
import { toast } from '@/components/ui/toast'

// ============================================
// TYPES
// ============================================

interface Ward {
  id: string
  name: string
  code: string
  districtName?: string
  provinceName?: string
  population?: number
  createdAt?: string
}

interface Feature {
  key: string
  name: string
  description: string
  isEnabled: boolean
}

// ============================================
// HOOK
// ============================================

export function useCaiDat() {
  const { user } = useAuthStore()
  const wardController = useMemo(() => new WardController(), [])
  const authController = useMemo(() => new AuthController(), [])

  // State
  const [ward, setWard] = useState<Ward | null>(null)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [features, setFeatures] = useState<Feature[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Settings form
  const [settingsForm, setSettingsForm] = useState<UpdateSettingsRequest>({
    theme: 'system',
    language: 'vi',
    notificationsEnabled: true,
    feedbackUpdates: true,
    newsAlerts: true,
    emergencyAlerts: true,
  })

  // Load data
  const loadData = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)

    try {
      // Load ward info if user has wardId
      if (user.wardId) {
        try {
          const wardData = await wardController.getWard(user.wardId)
          setWard(wardData)
        } catch {
          // Ward info is optional
        }

        // Load features
        try {
          const featuresData = await wardController.getFeatures(user.wardId)
          setFeatures(featuresData.features || [])
        } catch {
          // Features are optional
        }
      }

      // Load user settings
      try {
        const settingsData = await authController.getSettings()
        setSettings(settingsData)
        setSettingsForm({
          theme: settingsData.theme,
          language: settingsData.language,
          notificationsEnabled: settingsData.notificationsEnabled,
          feedbackUpdates: settingsData.feedbackUpdates,
          newsAlerts: settingsData.newsAlerts,
          emergencyAlerts: settingsData.emergencyAlerts,
        })
      } catch {
        // Settings might not exist yet, use defaults
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải cài đặt')
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: err.message || 'Không thể tải cài đặt',
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, wardController, authController])

  // Auto-load data
  useEffect(() => {
    loadData()
  }, [loadData])

  // Save settings
  const handleSaveSettings = useCallback(async () => {
    setIsSaving(true)
    setError(null)

    try {
      await authController.updateSettings(settingsForm)
      toast({
        variant: 'success',
        title: 'Thành công',
        description: 'Đã lưu cài đặt thành công!',
      })
    } catch (err: any) {
      setError(err.message || 'Không thể lưu cài đặt')
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: err.message || 'Không thể lưu cài đặt',
      })
    } finally {
      setIsSaving(false)
    }
  }, [authController, settingsForm])

  // Toggle feature
  const handleToggleFeature = useCallback(async (featureKey: string, isEnabled: boolean) => {
    if (!user?.wardId) return

    try {
      await wardController.updateFeature(user.wardId, {
        featureKey,
        isEnabled,
      })
      setFeatures(features.map(f =>
        f.key === featureKey ? { ...f, isEnabled } : f
      ))
      toast({
        variant: 'success',
        title: 'Thành công',
        description: `Đã ${isEnabled ? 'bật' : 'tắt'} tính năng`,
      })
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật tính năng')
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: err.message || 'Không thể cập nhật tính năng',
      })
    }
  }, [user?.wardId, wardController, features])

  // Form change handlers
  const handleThemeChange = useCallback((theme: ThemeType) => {
    setSettingsForm(prev => ({ ...prev, theme }))
  }, [])

  const handleLanguageChange = useCallback((language: LanguageType) => {
    setSettingsForm(prev => ({ ...prev, language }))
  }, [])

  const handleNotificationToggle = useCallback((field: keyof UpdateSettingsRequest, value: boolean) => {
    setSettingsForm(prev => ({ ...prev, [field]: value }))
  }, [])

  return {
    // State
    user,
    ward,
    settings,
    features,
    isLoading,
    isSaving,
    error,
    settingsForm,

    // Actions
    loadData,
    handleSaveSettings,
    handleToggleFeature,
    handleThemeChange,
    handleLanguageChange,
    handleNotificationToggle,
  }
}

// Export types
export type { Ward, Feature }
