import React from "react";
import { ChevronLeft } from "lucide-react";
import WorkspaceDropdown from "@/components/ui/WorkspaceDropdown";
import MenuItem from "@/components/ui/MenuItem";
import menuItems from "./menuItems";
import Link from "next/link";
import Image from "next/image";

const Sidebar = () => {
  return (
    <aside
      id="layout-menu"
      className="hidden md:fixed md:top-0 md:bottom-0 md:left-0 md:block md:w-64 bg-white text-gray-700 shadow-md transition-all duration-300 overflow-y-auto"
    >
      {/* Header with logo and toggle */}
      <div className="flex items-center justify-between p-4 border-b">
        <Link href="/home" className="flex items-center">
          <Image
            src="https://raycon.oasismgmt2.com/storage/logos/IjqxLcdGRYJsQ2ilNZec5tzOwriycUuY0ug2ZOgQ.jpg"
            alt="Logo"
            width={200}
            height={50}
          />
        </Link>
        <button className="xl:hidden">
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>
      {/* Workspace Dropdown */}
      <WorkspaceDropdown />
      {/* Menu List */}
      <ul className="py-1 px-2">
        {menuItems.map((item, index) => (
          <MenuItem key={index} item={item} />
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
