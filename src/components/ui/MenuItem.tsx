import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

interface MenuItemProps {
  item: {
    active?: boolean;
    submenu?: MenuItemProps["item"][];
    icon?: React.ComponentType<{ className?: string }>;
    link?: string;
    title: string;
    badge?: number;
    iconColor?: string;
  };
}

const MenuItem: React.FC<MenuItemProps> = ({ item }) => {
  const [open, setOpen] = useState(item.active || false);
  const hasSubmenu = item.submenu && item.submenu.length > 0;
  const Icon = item.icon;

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
        className={`flex items-center p-2 hover:bg-gray-100 rounded ${
          item.active ? "bg-gray-200" : ""
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
