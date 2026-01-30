import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-50 w-64 bg-sidebar">
        <Sidebar className="w-full border-r-0" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300">
        <Header />
        <main className="flex-1 p-6 overflow-x-hidden">
          <div className="mx-auto max-w-7xl animate-in fade-in zoom-in duration-300">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
