import type { FC } from 'react'
import { NavLink } from 'react-router-dom'
import { useUIStore } from '../stores/ui.store'
import { ChartPie, Globe, ListIndentDecrease, ListIndentIncrease, MessageCircle, Paperclip, Settings, UserRound } from 'lucide-react'

interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { path: "/", label: "Dashboard", icon: <ChartPie /> },
  { path: "/tin-tuc", label: "Tin tức", icon: <Globe /> },
  { path: "/tai-lieu", label: "Tài liệu", icon: <Paperclip /> },
  { path: "/gop-y", label: "Phản hồi", icon: <MessageCircle /> },
  { path: "/nguoi-dung", label: "Người dùng", icon: <UserRound /> },
  { path: "/cai-dat", label: "Cài đặt", icon: <Settings /> },
];

export const Sidebar: FC = () => {
  const { sidebarOpen, toggleSidebar } = useUIStore()

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-[#1b263b] text-gray-100 flex flex-col z-50 transition-all duration-300 ${
        sidebarOpen ? "w-65" : "w-17.5"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 h-15">
        <h1 className="text-lg font-bold whitespace-nowrap overflow-hidden">
          {sidebarOpen ? "Phường Xã Admin" : ""}
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-primary text-white"
                      : "hover:bg-white/10 text-gray-300 hover:text-white"
                  }`
                }
              >
                <span className="text-xl w-6 text-center">{item.icon}</span>
                {sidebarOpen && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className='h-15 flex justify-center items-center'>
        <button
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? "Thu gọn sidebar" : "Mở rộng sidebar"}
        >
          {sidebarOpen ? <ListIndentDecrease /> : <ListIndentIncrease />}
        </button>
      </div>
    </aside>
  );
}
