/**
 * Settings Page
 * Ward info, user profile, and theme customization
 *
 * Note: Business logic has been extracted to useCaiDat.ts hook
 * This component only handles UI rendering
 */

import type { ThemeType, LanguageType } from '@phuong-xa/shared'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Settings,
  Palette,
  Globe,
  Bell,
  Shield,
  Save,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { CardSkeleton } from '@/components/ui/skeleton'
import { useCaiDat } from './useCaiDat'

// ============================================
// CONSTANTS
// ============================================

const THEMES: { value: ThemeType; label: string }[] = [
  { value: 'light', label: 'Sáng' },
  { value: 'dark', label: 'Tối' },
  { value: 'system', label: 'Theo hệ thống' },
]

const LANGUAGES: { value: LanguageType; label: string }[] = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'English' },
]

const ROLE_LABELS: Record<string, string> = {
  admin: 'Quản trị viên',
  staff: 'Cán bộ',
  citizen: 'Công dân',
}

// ============================================
// COMPONENT
// ============================================

export default function CaiDat() {
  // Get all state and actions from custom hook
  const {
    user,
    ward,
    features,
    isLoading,
    isSaving,
    error,
    settingsForm,
    loadData,
    handleSaveSettings,
    handleToggleFeature,
    handleThemeChange,
    handleLanguageChange,
    handleNotificationToggle,
  } = useCaiDat()

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-muted animate-pulse rounded-md" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded-md" />
        </div>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cài đặt</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý thông tin và tùy chỉnh hệ thống
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {/* Ward Info */}
        {(user?.ward || ward) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Thông tin đơn vị
              </CardTitle>
              <CardDescription>
                Thông tin phường/xã bạn đang quản lý
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Tên đơn vị</Label>
                  <p className="font-medium">{user?.ward?.name || ward?.name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Mã đơn vị</Label>
                  <p className="font-medium">{user?.ward?.code || ward?.code}</p>
                </div>
                {ward?.districtName && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Quận/Huyện</Label>
                    <p className="font-medium">{ward.districtName}</p>
                  </div>
                )}
                {ward?.provinceName && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Tỉnh/Thành phố</Label>
                    <p className="font-medium">{ward.provinceName}</p>
                  </div>
                )}
                {ward?.population && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Dân số</Label>
                    <p className="font-medium">{ward.population.toLocaleString('vi-VN')} người</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Thông tin tài khoản
            </CardTitle>
            <CardDescription>
              Thông tin cá nhân của bạn trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
              )}
              <div className="flex-1 grid gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg">{user?.name}</p>
                    <Badge variant="secondary">
                      {ROLE_LABELS[user?.role || ''] || user?.role}
                    </Badge>
                  </div>
                </div>
                <div className="grid gap-2 text-sm">
                  {user?.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                  )}
                  {user?.phoneNumber && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{user.phoneNumber}</span>
                    </div>
                  )}
                  {user?.ward && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{user.ward.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Giao diện
            </CardTitle>
            <CardDescription>
              Tùy chỉnh giao diện và ngôn ngữ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Chủ đề</Label>
                <Select
                  value={settingsForm.theme}
                  onValueChange={(v) => handleThemeChange(v as ThemeType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {THEMES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ngôn ngữ</Label>
                <Select
                  value={settingsForm.language}
                  onValueChange={(v) => handleLanguageChange(v as LanguageType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Thông báo
            </CardTitle>
            <CardDescription>
              Quản lý các loại thông báo nhận được
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Thông báo chung</p>
                    <p className="text-xs text-muted-foreground">Nhận tất cả thông báo từ hệ thống</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.notificationsEnabled}
                  onChange={(e) => handleNotificationToggle('notificationsEnabled', e.target.checked)}
                  className="rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Cập nhật góp ý</p>
                    <p className="text-xs text-muted-foreground">Thông báo khi có góp ý mới hoặc cập nhật</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.feedbackUpdates}
                  onChange={(e) => handleNotificationToggle('feedbackUpdates', e.target.checked)}
                  className="rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Tin tức mới</p>
                    <p className="text-xs text-muted-foreground">Thông báo khi có bài viết mới</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.newsAlerts}
                  onChange={(e) => handleNotificationToggle('newsAlerts', e.target.checked)}
                  className="rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-red-500" />
                  <div>
                    <p className="font-medium text-sm">Cảnh báo khẩn cấp</p>
                    <p className="text-xs text-muted-foreground">Thông báo về các tình huống khẩn cấp</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.emergencyAlerts}
                  onChange={(e) => handleNotificationToggle('emergencyAlerts', e.target.checked)}
                  className="rounded"
                />
              </label>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1" />
                    Lưu cài đặt
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feature Flags (Admin only) */}
        {user?.role === 'admin' && features.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Tính năng hệ thống
              </CardTitle>
              <CardDescription>
                Bật/tắt các tính năng cho đơn vị của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {features.map((feature) => (
                <label
                  key={feature.key}
                  className="flex items-center justify-between cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{feature.name}</p>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={feature.isEnabled}
                    onChange={(e) => handleToggleFeature(feature.key, e.target.checked)}
                    className="rounded"
                  />
                </label>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
