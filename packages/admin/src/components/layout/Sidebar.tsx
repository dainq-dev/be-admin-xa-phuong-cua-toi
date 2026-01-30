import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Newspaper,
  Users,
  Settings,
  FileText,
  MessageSquare,
  BarChart,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { label: 'Tổng quan', icon: LayoutDashboard, href: '/' },
  { label: 'Tin tức', icon: Newspaper, href: '/news' },
  { label: 'Văn bản', icon: FileText, href: '/documents' },
  { label: 'Công dân', icon: Users, href: '/citizens' },
  { label: 'Phản ánh', icon: MessageSquare, href: '/feedback' },
  { label: 'Thống kê', icon: BarChart, href: '/analytics' },
  { label: 'Cài đặt', icon: Settings, href: '/settings' },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation()

  return (
    <div className={cn('pb-12 h-screen border-r bg-sidebar text-sidebar-foreground w-64 flex flex-col', className)}>
      <div className="space-y-4 py-4 flex-1">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-white flex items-center gap-2">
            <span className="bg-primary text-white p-1 rounded">PX</span>
            Admin Phường Xã
          </h2>
          <div className="space-y-1 mt-6">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href))
              return (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-2',
                      isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/80 hover:text-white hover:bg-sidebar-accent/50'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-3 py-2 border-t border-sidebar-border">
         <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground/80 hover:text-red-400 hover:bg-sidebar-accent/50">
            <LogOut className="h-4 w-4" />
            Đăng xuất
         </Button>
      </div>
    </div>
  )
}
