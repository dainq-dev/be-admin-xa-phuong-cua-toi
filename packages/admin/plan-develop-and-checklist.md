# Kế Hoạch Phát Triển Admin Panel - Phường Xã Của Tôi

**Ngày tạo:** 31/01/2026
**Cập nhật lần cuối:** 31/01/2026
**Trạng thái hiện tại:** ~85% hoàn thành (Phase 1, 2 & 3 Done)
**Mục tiêu:** 100% production-ready

---

## Tổng Quan So Sánh 2 Ý Kiến

| Tiêu chí | Ý kiến 1 | Ý kiến 2 | Phương án chọn |
|----------|----------|----------|----------------|
| Tiến độ đánh giá | 70% | 45% | **55%** (realistic) |
| Timeline | 10-13 ngày | 8-10 tuần | **3-4 tuần** (focused) |
| Ưu tiên React 19 | Cao (refactor ngay) | Thấp (sau CRUD) | **Sau khi hoàn thiện core** |
| Focus chính | Patterns & UX | CRUD functionality | **CRUD + Security trước** |

### Quyết định tối ưu:
1. **Ưu tiên Security trước** (Route Guards) - Critical
2. **Hoàn thiện CRUD** trước khi optimize - Practical
3. **React 19 features** là nice-to-have, không blocking
4. **Không thêm dependencies mới** (TanStack Query) - giữ simple

---

## Checklist Phát Triển

### Phase 1: Critical Security & Core ⚡ ✅ HOÀN THÀNH

#### 1.1 Route Guards & Authentication
- [x] Tạo `src/components/PrivateRoute.tsx`
- [x] Wrap protected routes trong `App.tsx`
- [x] Implement redirect logic khi chưa đăng nhập
- [ ] Test auth flow: login → protected → logout → redirect

#### 1.2 Login Form Hoàn Thiện
- [x] Fix tên function `views/dang-nhap/index.tsx` (TrangChu → DangNhap)
- [x] Integrate với `useAuthViewModel`
- [x] Implement OTP request form
- [x] Implement OTP verify form
- [x] Add countdown timer cho resend OTP
- [x] Add error handling & validation
- [ ] Test full login flow end-to-end

#### 1.3 Sidebar Navigation Fix
- [x] `layouts/Sidebar.tsx` đã có paths đúng (Vietnamese URLs)
  - `/` → Dashboard ✓
  - `/tin-tuc` → Tin tức ✓
  - `/tai-lieu` → Tài liệu ✓
  - `/gop-y` → Phản hồi ✓
  - `/nguoi-dung` → Người dùng ✓
  - `/cai-dat` → Cài đặt ✓
- [x] Navigation links hoạt động

#### 1.4 Error Boundaries
- [x] Tạo `src/components/ErrorBoundary.tsx`
- [x] Tạo `src/components/ErrorFallback.tsx`
- [x] Wrap routes với Error Boundaries trong `App.tsx`

**Files đã tạo:**
- ✅ `src/components/PrivateRoute.tsx`
- ✅ `src/components/ErrorBoundary.tsx`
- ✅ `src/components/ErrorFallback.tsx`

**Files đã sửa:**
- ✅ `src/App.tsx` - Route guards + Error boundary
- ✅ `src/views/dang-nhap/index.tsx` - Full OTP login flow

---

### Phase 2: News Module Completion 📰 ✅ HOÀN THÀNH

#### 2.1 News Editor Integration
- [x] Load article data khi edit mode (check route param `:id`)
- [x] Save blocks JSON khi create
- [x] Update blocks JSON khi edit
- [x] Handle create vs update mode

#### 2.2 Metadata Form
- [x] Tạo metadata form component (integrated in editor.tsx)
- [x] Fields: title, summary, category, status, imageUrl, isFeatured, isPinned
- [x] Connect với editor store

#### 2.3 News List Improvements
- [x] Add pagination controls
- [x] Add search input (với debounce)
- [x] Add category filter
- [x] Add status filter

#### 2.4 Image Upload (nếu backend support)
- [ ] Check backend upload capability
- [ ] Implement upload component
- [ ] Integrate với News Editor ImageBlock

**Files đã sửa:**
- ✅ `src/views/tin-tuc/index.tsx` - Pagination, search, filters
- ✅ `src/views/tin-tuc/editor.tsx` - Full editor với metadata form
- ✅ `src/api/news.api.ts` - Updated types cho blocks
- ✅ `packages/shared/src/types/news.types.ts` - Added missing fields

---

### Phase 3: Complete CRUD Modules 📋 ✅ HOÀN THÀNH

#### 3.1 Documents Module ✅
- [x] Hoàn thiện `views/tai-lieu/index.tsx`
- [x] Document list với pagination, search, category filter
- [x] Create/Edit dialog với form
- [x] Detail dialog với download link
- [x] Implement delete confirmation
- [x] Connect buttons với actions

#### 3.2 Feedback Module ✅
- [x] Hoàn thiện `views/gop-y/index.tsx` với stats cards
- [x] Stats summary (total, pending, in_progress, resolved, rejected)
- [x] Detail dialog với status update
- [x] Add filter by category
- [x] Add filter by status
- [x] Pagination và search

#### 3.3 Contacts Module
- [ ] Tạo `views/lien-he/index.tsx`
- [ ] Contact list với department filter
- [ ] Emergency contacts section
- [ ] Add/Edit contact modal
- [ ] Delete confirmation
> **Note:** Skipped - không có trong routes hiện tại

#### 3.4 Users Module ✅
- [x] Hoàn thiện `views/nguoi-dung/index.tsx`
- [x] Fix tên function (TrangChu → NguoiDung)
- [x] User list với pagination
- [x] Search by name/email/phone
- [x] Filter by role (admin, staff, citizen)
- [x] User detail modal
- [x] Edit user modal
- [x] Role badge display với colors

#### 3.5 Settings Module ✅
- [x] Tạo `views/cai-dat/index.tsx`
- [x] Ward info display (Card component)
- [x] User profile display
- [x] Theme customization (light/dark/system)
- [x] Language selection (vi/en)
- [x] Notification settings toggles
- [x] Feature flags toggle (admin only)

**Files đã tạo:**
- ✅ `src/views/cai-dat/index.tsx`

**Files đã sửa:**
- ✅ `src/views/tai-lieu/index.tsx` - Full CRUD
- ✅ `src/views/gop-y/index.tsx` - Stats, filters, detail dialog
- ✅ `src/views/nguoi-dung/index.tsx` - Full list với pagination, search, role filter
- ✅ `src/api/auth.api.ts` - Added getSettings, updateSettings
- ✅ `src/domains/auth/controllers/auth.controller.ts` - Added settings methods

---

### Phase 4: UX & Polish ✨ ✅ HOÀN THÀNH

#### 4.1 Loading States ✅
- [x] Tạo `src/components/ui/skeleton.tsx` (table, card, form)
- [x] Apply skeletons cho tất cả list views (tin-tuc, tai-lieu, gop-y, nguoi-dung)
- [x] Add loading skeletons cho Settings cards

#### 4.2 Notifications ✅
- [x] Add toast notifications cho success/error
- [x] Thay thế alert() và window.confirm() bằng toast trong views chính
- [x] Consistent error messages với toast

#### 4.3 Responsive & Dark Mode ⚠️ Partial
- [x] Dark mode CSS variables hoàn chỉnh (đã có sẵn)
- [x] Theme toggle persistence (Settings page đã có)
- [ ] Test responsive trên mobile/tablet (cần test thủ công)

**Files đã tạo:**
- ✅ `src/components/ui/skeleton.tsx`
- ✅ `src/components/ui/toast.tsx`
- ✅ `src/components/ui/toaster.tsx`

**Files đã sửa:**
- ✅ `src/App.tsx` - Added Toaster component
- ✅ `src/views/tin-tuc/index.tsx` - TableSkeleton + toast notifications
- ✅ `src/views/tai-lieu/index.tsx` - TableSkeleton + toast notifications  
- ✅ `src/views/gop-y/index.tsx` - TableSkeleton
- ✅ `src/views/nguoi-dung/index.tsx` - TableSkeleton
- ✅ `src/views/cai-dat/index.tsx` - CardSkeleton

---

### Phase 5: Optimization (Nice to have) 🚀

#### 5.1 Tối ưu code của các trang hiện tại
- [ ] Tach logic & UI ra, các state sẽ lấy từ hook/eventstore
- [ ] Ở UI chỉ xử lí các side effect, call hàm từ hook/eventstore render UI (tạo file hook ngay cạnh file index.tsx của trang đó)

#### 5.2 React 19 Features
- [ ] Refactor data fetching với `use()` hook
- [ ] Add `useOptimistic()` cho delete/update actions
- [ ] Add `useFormStatus()` cho submit buttons
- [ ] Wrap routes với `<Suspense>` boundaries

#### 5.3 Build Optimization
- [ ] Add manual chunks trong `vite.config.ts`
- [ ] Remove duplicate animation library (`tw-animate-css`)
- [ ] Code splitting với `React.lazy()`

#### 5.4 Testing (nếu có thời gian)
- [ ] Setup Vitest
- [ ] Unit tests cho controllers
- [ ] Integration tests cho auth flow

---

## Files Tổng Hợp

### Đã Tạo Mới (4/10 files)
```
✅ src/components/PrivateRoute.tsx
✅ src/components/ErrorBoundary.tsx
✅ src/components/ErrorFallback.tsx
✅ src/views/cai-dat/index.tsx
⬜ src/components/ui/skeleton.tsx
⬜ src/views/lien-he/index.tsx (skipped)
⬜ src/views/lien-he/ContactForm.tsx (skipped)
⬜ src/views/gop-y/detail.tsx (integrated in index)
⬜ src/features/news/components/MetadataForm.tsx (integrated in editor)
```

### Đã Sửa (10/12 files)
```
✅ src/App.tsx
✅ src/views/dang-nhap/index.tsx
✅ src/views/tin-tuc/index.tsx
✅ src/views/tin-tuc/editor.tsx
✅ src/views/tai-lieu/index.tsx
✅ src/views/gop-y/index.tsx
✅ src/views/nguoi-dung/index.tsx
✅ src/api/news.api.ts
✅ src/api/auth.api.ts
✅ src/domains/auth/controllers/auth.controller.ts
⬜ src/components/layout/Sidebar.tsx (không cần sửa - đã đúng)
⬜ vite.config.ts (Phase 5)
⬜ package.json (Phase 5)
```

---

## Verification Checklist

### Authentication Flow
- [ ] Login với email + OTP hoạt động
- [ ] Redirect về trang trước đó sau login
- [ ] Token refresh tự động
- [ ] Logout clear tất cả state
- [ ] Protected routes không truy cập được khi chưa login

### Module Functionality
- [x] News CRUD hoạt động (create, read, update, delete)
- [x] News Editor save/load blocks
- [x] Feedback list và update status
- [x] Documents CRUD
- [ ] Contacts list và CRUD (skipped)
- [x] Users list
- [x] Settings hiển thị

### UX
- [x] Loading states hiển thị đúng (Loader2 spinner)
- [x] Error messages hiển thị
- [x] Navigation hoạt động đúng
- [ ] Responsive trên mobile (cần test)

---

## Progress Log

| Ngày | Phase | Tasks Completed | Notes |
|------|-------|-----------------|-------|
| 31/01/2026 | Planning | Tạo kế hoạch | So sánh 2 ý kiến, chọn phương án tối ưu |
| 31/01/2026 | Phase 1 | PrivateRoute, ErrorBoundary, ErrorFallback | Security components |
| 31/01/2026 | Phase 1 | App.tsx route guards | Wrap protected routes |
| 31/01/2026 | Phase 1 | Login form OTP flow | Full integration với viewmodel |
| 31/01/2026 | Phase 2 | News Editor save/load | Load article, save blocks |
| 31/01/2026 | Phase 2 | Metadata form | Title, summary, category, status |
| 31/01/2026 | Phase 2 | News list improvements | Pagination, search, filters |
| 31/01/2026 | Phase 3 | Documents Module | Full CRUD với dialog forms |
| 31/01/2026 | Phase 3 | Feedback Module | Stats cards, filters, status update |
| 31/01/2026 | Phase 3 | Users Module | List, search, role filter, edit |
| 31/01/2026 | Phase 3 | Settings Module | Ward info, profile, notifications |
| | | | |

---

## Ghi Chú
- **Ưu tiên:** Phase 1 ✅ > Phase 2 ✅ > Phase 3 ✅ > Phase 4 > Phase 5
- **Không skip:** Phase 1 (Security) ✅ DONE
- **Có thể skip:** Phase 5 nếu thời gian hạn chế
- **Contacts Module:** Skipped vì không có route `/lien-he` trong App.tsx

---

## Tiếp Theo (Next Session)

Bắt đầu từ **Phase 4 - UX & Polish**:
1. Skeleton loading components
2. Toast notifications
3. Dark mode completion
4. Responsive testing

Hoặc **Phase 5 - Optimization** nếu ưu tiên performance:
1. React 19 features (use, useOptimistic)
2. Code splitting
3. Build optimization
