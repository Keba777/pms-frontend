"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Menu,
  Search,
  Bell,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import userAvatar from "@/../public/images/user.png";

import {
  useNotifications,
  useMarkAllAsRead,
  useMarkAsRead,
} from "@/hooks/useNotifications";
import { useNotificationStore } from "@/store/notificationStore";

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
  const [, setShowLanguage] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // refs for click‐outside behavior
  const notificationsRef = useRef<HTMLLIElement>(null);
  const languageRef = useRef<HTMLLIElement>(null);
  const userRef = useRef<HTMLLIElement>(null);

  // click outside to close any open dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        languageRef.current &&
        !languageRef.current.contains(e.target as Node)
      ) {
        setShowLanguage(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleToggleNotifications = () => {
    setShowNotifications((v) => !v);
  };

  return (
    <nav className="w-full bg-white/95 backdrop-blur-sm shadow-md rounded-md px-4 py-2">
      <div className="flex flex-col lg:flex-row items-center lg:justify-between w-full">
        {/* sidebar toggle + search */}
        <div className="flex items-center justify-between w-full lg:w-auto">
          <button className="p-2 lg:hidden" onClick={toggleSidebar}>
            <Menu className="w-6 h-6" />
          </button>
          <button className="p-2 lg:hidden">
            <Search className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* desktop search */}
        <div className="hidden lg:flex items-center space-x-2 mt-2 md:mt-0">
          <Search className="w-5 h-5 text-gray-600" />
          <input
            type="text"
            placeholder="Search"
            className="border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* right‐side icons */}
        <ul className="flex items-center space-x-4 ml-auto mt-2 lg:mt-0">
          {/* notifications */}
          <li ref={notificationsRef} className="relative">
            <button
              onClick={handleToggleNotifications}
              className="p-2 relative"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 rounded-full bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                {/* header */}
                <div className="flex justify-between items-center px-4 py-2 border-b">
                  <span className="font-semibold">Notifications</span>
                  <button
                    className="text-sm text-blue-600 hover:underline"
                    onClick={() => markAllAsReadMutation.mutate()}
                  >
                    Mark all read
                  </button>
                </div>

                {/* list */}
                <div className="max-h-64 overflow-y-auto">
                  {isLoading ? (
                    <p className="p-4 text-center">Loading…</p>
                  ) : notifications.length === 0 ? (
                    <p className="p-4 text-center">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <Link
                        key={n.id}
                        href="#"
                        onClick={() => markAsReadMutation.mutate(n.id!)}
                        className={`flex flex-col px-4 py-2 hover:bg-gray-100 ${
                          n.read ? "" : "bg-blue-50"
                        }`}
                      >
                        <span className="text-sm truncate">{n.type}</span>
                        <small className="text-xs text-gray-500">
                          {new Date(n.createdAt!).toLocaleString()}
                        </small>
                      </Link>
                    ))
                  )}
                </div>

                {/* footer */}
                <div className="border-t text-center">
                  <Link
                    href="/notifications"
                    className="block px-4 py-2 font-bold hover:bg-gray-100"
                  >
                    View All
                  </Link>
                </div>
              </div>
            )}
          </li>

          {/* … language & user dropdown as before … */}

          {/* user greeting */}
          {user && (
            <li className="hidden md:flex items-center">
              <p className="text-gray-700">Hi 👋 {user.first_name}</p>
            </li>
          )}

          {/* user avatar / menu */}
          <li ref={userRef} className="relative">
            <button
              onClick={() => setShowUserDropdown((v) => !v)}
              className="p-2"
            >
              <Image
                src={userAvatar}
                alt="User Avatar"
                width={40}
                height={40}
                className="rounded-full"
              />
            </button>
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                {/* your existing user menu… */}
                <button
                  onClick={handleLogout}
                  className="p-4 text-red-500 hover:text-red-700 flex items-center w-full text-left"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Header;
