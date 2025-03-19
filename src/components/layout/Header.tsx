import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  Search,
  Bell,
  Globe,
  CheckSquare,
  Square,
  User,
  LogOut,
} from "lucide-react";
import Image from "next/image";
const userAvatar =
  "https://raycon.oasismgmt2.com/storage/photos/VoJMiw0IUaj4sLv6KDNAMonMk8bS9hMbJ36igmnd.png";

const Header = () => {
  // Dropdown states
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Refs for click outside detection
  const notificationsRef = useRef<HTMLLIElement>(null);
  const languageRef = useRef<HTMLLIElement>(null);
  const userRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        languageRef.current &&
        !languageRef.current.contains(event.target as Node)
      ) {
        setShowLanguage(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // List of additional languages (adjust as needed)
  const languages = [
    "Hindi",
    "Amharic",
    "Korean",
    "Vietnamese",
    "Portuguese",
    "Español",
    "Français",
    "Arabic",
    "Dutch",
    "Turkish",
    "Indonesia",
    "Thai",
    "Hrvatski",
    "Italian",
  ];

  return (
    <nav className="w-full bg-white/95 backdrop-blur-sm shadow-md rounded-md px-4 py-2">
      <div className="flex flex-col md:flex-row items-center md:justify-between w-full">
        <div className="flex items-center justify-between w-full md:w-auto">
          <button className="p-2 md:hidden">
            <Menu className="w-6 h-6" />
          </button>
          <button className="p-2 md:hidden">
            <Search className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <div
          className="hidden md:flex items-center space-x-2 mt-2 md:mt-0"
          suppressHydrationWarning={true}
        >
          <Search className="w-5 h-5 text-gray-600" />
          <input
            type="text"
            placeholder="Search"
            className="border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            suppressHydrationWarning={true}
          />
        </div>
        <ul className="flex items-center space-x-4 ml-auto mt-2 md:mt-0">
          <li className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 relative"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 rounded-full bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center">
                0
              </span>
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="p-4 text-center">
                  <span>No Unread Notifications!</span>
                </div>
                <div className="flex justify-between border-t border-gray-200">
                  <Link href="/notifications" className="p-3 font-bold">
                    View All
                  </Link>
                  <button className="p-3 font-bold">Mark All as Read</button>
                </div>
              </div>
            )}
          </li>
          <li className="relative" ref={languageRef}>
            <button
              onClick={() => setShowLanguage(!showLanguage)}
              className="flex items-center p-2 border border-blue-500 rounded-md hover:bg-blue-50"
              suppressHydrationWarning={true}
            >
              <Globe className="w-5 h-5 mr-1" />
              <span className="mr-1">English</span>
            </button>
            {showLanguage && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <ul>
                  <li>
                    <Link
                      href="#"
                      className="flex items-center p-2 hover:bg-gray-100"
                    >
                      <CheckSquare className="w-5 h-5 text-blue-500 mr-2" />
                      English
                    </Link>
                  </li>
                  {languages.map((lang, index) => (
                    <li key={index}>
                      <Link
                        href="#"
                        className="flex items-center p-2 hover:bg-gray-100"
                      >
                        <Square className="w-5 h-5 text-gray-500 mr-2" />
                        {lang}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
          <li className="hidden md:flex items-center">
            <p className="text-gray-700">Hi👋 ossis</p>
          </li>
          <li className="relative" ref={userRef}>
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="p-2"
              suppressHydrationWarning={true}
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
                <Link
                  href="#"
                  className="flex items-center p-4 hover:bg-gray-100"
                >
                  <Image
                    src={userAvatar}
                    alt="User Avatar"
                    width={40}
                    height={40}
                    className="rounded-full mr-3"
                  />
                  <div>
                    <span className="font-semibold">ossis ossis</span>
                    <small className="block text-gray-500">admin</small>
                  </div>
                </Link>
                <div className="border-t border-gray-200"></div>
                <Link
                  href="/account/2"
                  className="flex items-center p-4 hover:bg-gray-100"
                >
                  <User className="w-5 h-5 mr-2" />
                  <span>My Profile</span>
                </Link>
                <div className="border-t border-gray-200"></div>
                <button className="p-4 text-red-500 hover:text-red-700 flex items-center">
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
