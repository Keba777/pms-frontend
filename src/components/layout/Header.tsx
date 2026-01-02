// components/layout/Header.tsx
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { MenuIcon, Search, Bell, LogOut, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import userAvatar from "@/../public/images/user.png";

import {
  useNotifications,
  useMarkAllAsRead,
  useMarkAsRead,
} from "@/hooks/useNotifications";
import { useSearchStore } from "@/store/searchStore";
import { useNotificationStore } from "@/store/notificationStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const router = useRouter();
  const authState = useAuthStore();
  const { user, logout } = useMemo(
    () => ({
      user: authState.user,
      logout: authState.logout,
    }),
    [authState.user, authState.logout]
  );

  // notification hooks & store
  const { data: notifications = [], isLoading } = useNotifications();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markAllAsReadMutation = useMarkAllAsRead();
  const markAsReadMutation = useMarkAsRead();

  // dropdown visibility
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { searchQuery, setSearchQuery } = useSearchStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="w-full bg-white/95 backdrop-blur-sm shadow-sm rounded-lg px-4 py-3 sm:py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Menu toggle + Logo/Brand on mobile */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="p-2 lg:hidden"
            onClick={toggleSidebar}
          >
            <MenuIcon className="w-10 h-10 text-gray-600" />
          </Button>
          <span className="text-lg font-semibold text-gray-800 hidden sm:block">
            Dashboard
          </span>
        </div>

        {/* Center: Search - hidden on mobile, toggleable */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 px-4 text-sm border-gray-200 focus:border-blue-500"
          />
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mobile search toggle */}
          <Button
            variant="ghost"
            className="p-2 md:hidden"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search className="w-6 h-6 text-gray-600" />
          </Button>

          {/* Notifications */}
          <DropdownMenu
            open={showNotifications}
            onOpenChange={setShowNotifications}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-2 relative">
                <Bell className="w-8 h-8 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <DropdownMenuLabel className="flex justify-between items-center px-4 py-2">
                Notifications
                <Button
                  variant="link"
                  className="text-sm text-blue-600"
                  onClick={() => markAllAsReadMutation.mutate()}
                >
                  Mark all as read
                </Button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-64 overflow-y-auto">
                {isLoading ? (
                  <p className="p-4 text-center text-sm text-gray-500">
                    Loading...
                  </p>
                ) : notifications.length === 0 ? (
                  <p className="p-4 text-center text-sm text-gray-500">
                    No notifications
                  </p>
                ) : (
                  notifications.map((n) => (
                    <DropdownMenuItem
                      key={n.id}
                      className={`flex flex-col px-4 py-2 text-sm cursor-pointer ${n.read ? "" : "bg-blue-50"
                        }`}
                      onClick={() => markAsReadMutation.mutate(n.id!)}
                    >
                      <span className="truncate">{n.type}</span>
                      <small className="text-xs text-gray-500">
                        {new Date(n.createdAt!).toLocaleString()}
                      </small>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/notifications"
                  className="px-4 py-2 text-center font-medium"
                >
                  View All
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 rounded-full border-2 border-gray-100 hover:border-blue-100 transition-colors">
                <Image
                  src={
                    user?.profile_picture ? user.profile_picture : userAvatar
                  }
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="rounded-full object-cover w-10 h-10"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Hi, {user?.first_name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile search input */}
      {searchOpen && (
        <div className="mt-3 md:hidden">
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 px-4 text-sm border-gray-200 focus:border-blue-500"
          />
        </div>
      )}
    </nav>
  );
};

export default Header;
