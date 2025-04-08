"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

interface MenuItemProps {
  item: {
    submenu?: MenuItemProps["item"][];
    icon?: React.ComponentType<{ className?: string }>;
    link?: string;
    title: string;
    badge?: number;
    iconColor?: string;
  };
}

const MenuItem: React.FC<MenuItemProps> = ({ item }) => {
  const pathname = usePathname();
  const isActive = item.link ? pathname === item.link : false;
  const [open, setOpen] = useState(false);
  const hasSubmenu = item.submenu && item.submenu.length > 0;
  const Icon = item.icon;

  useEffect(() => {
    if (isActive) {
      setOpen(true); // Expand submenu if active
    }
  }, [isActive]);

  return (
    <li className="my-1">
      <Link
        href={item.link || "#"}
        onClick={(e) => {
          if (hasSubmenu) {
            e.preventDefault();
            setOpen(!open);
          }
        }}
        className={`flex items-center py-2 px-4 rounded transition-colors ${
          isActive ? "bg-gray-200 text-blue-600 font-semibold" : "hover:bg-gray-100"
        }`}
      >
        {Icon && <Icon className={`w-5 h-5 mr-2 ${item.iconColor}`} />}
        <span>{item.title}</span>
        {item.badge !== undefined && (
          <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {item.badge}
          </span>
        )}
        {hasSubmenu && (
          <ChevronDown
            className={`ml-auto w-4 h-4 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        )}
      </Link>
      {hasSubmenu && open && (
        <ul className="pl-4">
          {item.submenu?.map((sub, index) => (
            <MenuItem key={index} item={sub} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default MenuItem;
