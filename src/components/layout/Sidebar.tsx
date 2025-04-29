import React from "react";
import WorkspaceDropdown from "@/components/ui/WorkspaceDropdown";
import MenuItem from "@/components/ui/MenuItem";
import menuItems from "./menuItems";
import Link from "next/link";
import Image from "next/image";
import { FiX } from "react-icons/fi";
import logo from "@/../public/images/logo.jpg";
import { useAuthStore } from "@/store/authStore";

const Sidebar = ({
  isOpen,
  toggleSidebar,
}: {
  isOpen: boolean;
  toggleSidebar: () => void;
}) => {
  const { hasPermission } = useAuthStore();

  // Filter menu items based on permissions
  const filteredMenuItems = menuItems.filter((item) => {
    // Always show dashboard
    if (item.link === "/") return true;

    // Check if the item has submenu
    if (item.submenu) {
      // Filter submenu items first
      const filteredSubmenu = item.submenu.filter((subItem) => {
        const resource = subItem.link?.split("/")[1]; // Get resource from link
        return resource
          ? hasPermission(resource, "manage") ||
              hasPermission(resource, "delete") ||
              hasPermission(resource, "edit") ||
              hasPermission(resource, "create")
          : true;
      });

      // Only show the parent item if there are visible subitems
      return filteredSubmenu.length > 0;
    }

    // For regular items, check permission based on the link
    const resource = item.link?.split("/")[1]; // Get resource from link
    return resource
      ? hasPermission(resource, "manage") ||
          hasPermission(resource, "delete") ||
          hasPermission(resource, "edit") ||
          hasPermission(resource, "create")
      : true;
  });

  return (
    <aside
      id="layout-menu"
      className={`${
        isOpen ? "fixed top-0 bottom-0 z-50" : "hidden"
      } lg:fixed lg:top-0 lg:bottom-0 lg:left-0 lg:block lg:w-64 font-medium bg-white  shadow-md transition-all duration-300 overflow-y-auto`}
    >
      <button
        onClick={toggleSidebar}
        className="lg:hidden absolute top-4 right-4 text-primary"
      >
        <FiX size={24} />
      </button>
      {/* Header with logo and toggle */}
      <div className="flex items-center justify-center">
        <Link href="/" className="flex items-center">
          <Image
            src={logo}
            alt="Logo"
            width={200}
            height={50}
            className="w-24"
          />
        </Link>
      </div>
      {/* Workspace Dropdown */}
      <WorkspaceDropdown />
      {/* Menu List */}
      <ul className="py-1 px-3">
        {filteredMenuItems.map((item, index) => (
          <MenuItem key={index} item={item} />
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
