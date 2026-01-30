import type { FC } from "react";
import { useAuthStore } from "../stores/auth.store";
import { LogOut } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Header: FC = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    logout();
  };

  return (
    <header className="flex items-center justify-between h-15 px-[20px_30px] bg-[#1b263b] sticky top-0 z-40">
      {/* Left */}
      <div className="flex items-center gap-4"></div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* User Menu */}
        <div className="flex items-center gap-8">
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-md text-white">
              Xin chào,
              <strong className="ml-3 text-red-700">
                {user?.name || "Admin"}
              </strong>
            </span>
          </div>
          <Tooltip>
            <TooltipTrigger>
              <button
                onClick={handleLogout}
                className="px-4 py-1 text-sm text-white"
              >
                <LogOut />
              </button>
            </TooltipTrigger>
            <TooltipContent>Đăng xuất</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
};
