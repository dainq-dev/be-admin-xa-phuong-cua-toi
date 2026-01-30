/**
 * Users Management Page
 * List, search, filter and view user details
 */

import { useEffect, useState, useMemo } from 'react'
import { UserController } from '@/domains/user/controllers/user.controller'
import type { ListUsersParams, UpdateUserRequest } from '@/api/user.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  Calendar,
  MapPin,
  Edit,
  RefreshCw,
} from 'lucide-react'
import { TableSkeleton } from '@/components/ui/skeleton'

// ============================================
// TYPES
// ============================================

interface User {
  id: string
  name: string
  email: string | null
  phoneNumber: string | null
  avatarUrl: string | null
  role: 'admin' | 'staff' | 'citizen'
  isActive: boolean
  wardId: string | null
  ward?: {
    id: string
    name: string
    code: string
  } | null
  createdAt: string
  updatedAt: string
}

interface UsersResponse {
  items: User[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

type UserRole = 'all' | 'admin' | 'staff' | 'citizen'

// ============================================
// CONSTANTS
// ============================================

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'all', label: 'Tất cả vai trò' },
  { value: 'admin', label: 'Quản trị viên' },
  { value: 'staff', label: 'Cán bộ' },
  { value: 'citizen', label: 'Công dân' },
]

const ROLE_BADGES: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  admin: { label: 'Quản trị viên', variant: 'destructive' },
  staff: { label: 'Cán bộ', variant: 'default' },
  citizen: { label: 'Công dân', variant: 'secondary' },
}

const PAGE_SIZE = 10

// ============================================
// COMPONENT
// ============================================

export default function NguoiDung() {
  const controller = useMemo(() => new UserController(), [])

  // State
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<UserRole>('all')
  const [page, setPage] = useState(1)

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Detail dialog
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Edit dialog
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editForm, setEditForm] = useState<UpdateUserRequest>({})
  const [isUpdating, setIsUpdating] = useState(false)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Load users
  useEffect(() => {
    loadUsers()
  }, [debouncedSearch, role, page])

  const loadUsers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params: ListUsersParams = {
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      }
      if (debouncedSearch) params.search = debouncedSearch
      if (role !== 'all') params.role = role

      const response: UsersResponse = await controller.listUsers(params)
      setUsers(response.items || [])
      setTotal(response.total || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách người dùng')
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetail = (user: User) => {
    setSelectedUser(user)
    setIsDetailOpen(true)
  }

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user)
    setEditForm({
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      phoneNumber: user.phoneNumber || undefined,
    })
    setIsEditOpen(true)
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return
    setIsUpdating(true)
    try {
      await controller.updateUser(selectedUser.id, editForm)
      setIsEditOpen(false)
      loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật người dùng')
    } finally {
      setIsUpdating(false)
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Xem và quản lý thông tin người dùng trong hệ thống
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadUsers} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, email, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={role} onValueChange={(v) => { setRole(v as UserRole); setPage(1) }}>
          <SelectTrigger className="w-45">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Email / SĐT</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="w-24 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton rows={5} columns={7} />
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  Không tìm thấy người dùng nào
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, index) => (
                <TableRow key={user.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleViewDetail(user)}>
                  <TableCell className="text-muted-foreground">
                    {(page - 1) * PAGE_SIZE + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {user.email && <div>{user.email}</div>}
                      {user.phoneNumber && (
                        <div className="text-muted-foreground">{user.phoneNumber}</div>
                      )}
                      {!user.email && !user.phoneNumber && (
                        <span className="text-muted-foreground italic">Chưa cập nhật</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ROLE_BADGES[user.role]?.variant || 'outline'}>
                      {ROLE_BADGES[user.role]?.label || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenEdit(user)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-sm text-muted-foreground">
              Hiển thị {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, total)} / {total} người dùng
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm min-w-20 text-center">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isLoading}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Thông tin người dùng</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              {/* Avatar & Name */}
              <div className="flex items-center gap-4">
                {selectedUser.avatarUrl ? (
                  <img
                    src={selectedUser.avatarUrl}
                    alt={selectedUser.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-primary" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                  <Badge variant={ROLE_BADGES[selectedUser.role]?.variant || 'outline'}>
                    {ROLE_BADGES[selectedUser.role]?.label || selectedUser.role}
                  </Badge>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid gap-3">
                {selectedUser.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedUser.email}</span>
                  </div>
                )}
                {selectedUser.phoneNumber && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedUser.phoneNumber}</span>
                  </div>
                )}
                {selectedUser.ward && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedUser.ward.name} ({selectedUser.ward.code})</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <Badge variant={selectedUser.isActive ? 'default' : 'secondary'}>
                    {selectedUser.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Tham gia: {formatDate(selectedUser.createdAt)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Đóng
            </Button>
            <Button onClick={() => {
              setIsDetailOpen(false)
              if (selectedUser) handleOpenEdit(selectedUser)
            }}>
              <Edit className="w-4 h-4 mr-1" />
              Chỉnh sửa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tên</Label>
              <Input
                id="edit-name"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Số điện thoại</Label>
              <Input
                id="edit-phone"
                value={editForm.phoneNumber || ''}
                onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Vai trò</Label>
              <Select
                value={editForm.role}
                onValueChange={(v) => setEditForm({ ...editForm, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Quản trị viên</SelectItem>
                  <SelectItem value="staff">Cán bộ</SelectItem>
                  <SelectItem value="citizen">Công dân</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-active"
                checked={editForm.isActive ?? true}
                onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="edit-active" className="cursor-pointer">
                Tài khoản đang hoạt động
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateUser} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
