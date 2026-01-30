import { Routes, Route } from 'react-router-dom'
import { Suspense } from 'react'
import RootLayout from './layouts'
import { CaiDat, DangNhap, GopY, KhongTimThayTrang, NguoiDung, TaiLieu, TinTuc, TinTucEditor, TrangChu } from './views'
import { PrivateRoute } from './components/PrivateRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Toaster } from './components/ui/toaster'
import { Loader2 } from 'lucide-react'
import { useAuthInit } from './hooks/useAuthInit'

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
)

function App() {
  // Initialize auth state on mount
  useAuthInit()
  
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes - No layout */}
          <Route path="/dang-nhap" element={<DangNhap />} />

          {/* Protected routes - With layout */}
          <Route element={ <PrivateRoute> <RootLayout /> </PrivateRoute> } >
            <Route path="/" element={<TrangChu />} />
            <Route path="/tin-tuc" element={<TinTuc />} />
            <Route path="/tin-tuc/tao-moi" element={<TinTucEditor />} />
            <Route path="/tin-tuc/chinh-sua/:id" element={<TinTucEditor />} />
            <Route path="/tai-lieu" element={<TaiLieu />} />
            <Route path="/gop-y" element={<GopY />} />
            <Route path="/nguoi-dung" element={<NguoiDung />} />
            <Route path="/cai-dat" element={<CaiDat />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<KhongTimThayTrang />} />
        </Routes>
      </Suspense>
      <Toaster />
    </ErrorBoundary>
  )
}

export default App
