import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FiSearch,
  FiBell,
  FiGlobe,
  FiCheckSquare,
  FiSquare,
  FiUser,
  FiLogOut,
} from "react-icons/fi";

const Navbar = () => {
  const languages = [
    {
      code: "en",
      name: "English",
      url: "/settings/languages/switch/en",
      primary: true,
    },
    { code: "hn", name: "Hindi", url: "/settings/languages/switch/hn" },
    // Add other languages as needed...
  ];

  return (
    <div className="flex items-center gap-4 w-full justify-between">
      {/* Search */}
      <div className="relative w-full max-w-[200px]">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" />
        <div className="w-full">
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
          />
        </div>
      </div>

      {/* Notifications */}
      <ul className="flex items-center gap-4">
        <li className="relative group">
          <Link href="#" className="p-2 relative inline-block">
            <FiBell className="text-lg" />
            <span className="absolute -top-1 -right-1 bg-bs-danger text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
              0
            </span>
          </Link>
          <ul className="absolute hidden group-hover:block right-0 mt-2 w-64 bg-white shadow-lg rounded-lg p-2">
            <li className="flex items-center p-3 border-b">
              <FiBell className="text-lg mr-2" /> Notifications
            </li>
            <li className="p-5 text-center">No Unread Notifications!</li>
            <li className="flex justify-between border-t">
              <Link href="/notifications" className="p-3 font-bold text-sm">
                View All
              </Link>
              <Link href="#" className="p-3 font-bold text-sm">
                Mark All as Read
              </Link>
            </li>
          </ul>
        </li>

        {/* Language Selector */}
        <li className="relative group">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg">
            <FiGlobe /> <span>English</span>
          </button>
          <ul className="absolute hidden group-hover:block right-0 mt-2 w-48 bg-white shadow-lg rounded-lg p-2">
            {languages.map((lang) => (
              <li key={lang.code} className="hover:bg-gray-100 rounded">
                <Link href={lang.url} className="flex items-center p-2">
                  {lang.primary ? (
                    <FiCheckSquare className="mr-2" />
                  ) : (
                    <FiSquare className="mr-2" />
                  )}
                  {lang.name}
                </Link>
              </li>
            ))}
          </ul>
        </li>

        {/* User Profile */}
        <li className="relative group">
          <Link href="#" className="inline-block">
            <Image
              src="https://example.com/avatar.png"
              width={40}
              height={40}
              className="rounded-full"
              alt="Profile"
            />
          </Link>
          <ul className="absolute hidden group-hover:block right-0 mt-2 w-48 bg-white shadow-lg rounded-lg p-2">
            <li>
              <div className="flex items-center p-3 border-b">
                <Image
                  src="https://example.com/avatar.png"
                  width={40}
                  height={40}
                  className="rounded-full"
                  alt="Profile"
                />
                <div className="ml-3">
                  <span className="font-semibold block">John Doe</span>
                  <small className="text-muted text-sm">Admin</small>
                </div>
              </div>
            </li>
            <li className="border-t mt-2">
              <Link
                href="/profile"
                className="flex items-center p-2 hover:bg-gray-100 rounded"
              >
                <FiUser className="mr-2" /> My Profile
              </Link>
            </li>
            <li className="border-t">
              <form className="p-2">
                <button className="w-full text-left flex items-center hover:bg-gray-100 rounded p-2">
                  <FiLogOut className="mr-2" /> Logout
                </button>
              </form>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
