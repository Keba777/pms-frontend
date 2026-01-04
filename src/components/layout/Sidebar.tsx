"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiX } from "react-icons/fi";
import MenuItem from "@/components/common/ui/MenuItem";
import menuItems, { systemAdminMenuItems, superAdminMenuItems } from "./menuItems";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";
import logo from "@/../public/images/logo.svg";
import { useOrganizationStore } from "@/store/organizationStore";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const user = useAuthStore((state) => state.user);
  const { hasPermission } = useAuthStore();

  // VERIFICATION LOG: Check this in your browser console


  const [chatBadge, setChatBadge] = useState(0);
  const [groupChatBadge, setGroupChatBadge] = useState(0);

  // Determine if current user is HR (case-insensitive, includes "hr")
  const isHR = Boolean(
    user?.role?.name && user.role.name.toLowerCase().includes("hr")
  );

  const isSystemAdmin = user?.role?.name?.toLowerCase() === "systemadmin";
  const isSuperAdmin = user?.role?.name?.toLowerCase() === "superadmin";

  // Fetch unread message count for “Chat” badge
  useEffect(() => {
    if (!user) {
      setChatBadge(0);
      setGroupChatBadge(0);
      return;
    }

    // supabase
    //   .from("messages")
    //   .select("*", { count: "exact", head: true })
    //   .eq("receiver_id", user.id)
    //   .eq("is_read", false)
    //   .then(({ count, error }) => {
    //     if (error) {
    //       console.error("Error fetching unread count:", error);
    //     } else {
    //       setChatBadge(count ?? 0);
    //     }
    //   });

    // supabase
    //   .from("group_messages")
    //   .select("id", { count: "exact" })
    //   .not("readers", "cs", `{"${user.id}"}`)
    //   .then(({ count, error }) => {
    //     if (error) console.error("Error fetching group unread count:", error);
    //     else setGroupChatBadge(count ?? 0);
    //   });
  }, [user]);

  // Determine which menu to show based on role
  const itemsToRender = isSystemAdmin
    ? systemAdminMenuItems
    : isSuperAdmin
      ? superAdminMenuItems
      : menuItems;

  const menuItemsWithBadge = itemsToRender.map((item) => {
    if (item.title === "Chat") return { ...item, badge: chatBadge };
    if (item.title === "Team Chats") return { ...item, badge: groupChatBadge };
    return item;
  });

  // Apply your existing permission-based filtering
  const filteredMenuItems = menuItemsWithBadge.filter((item) => {
    // If System Admin or Super Admin, assume access to all items in their specific menu
    if (isSystemAdmin || isSuperAdmin) {
      return true;
    }

    // HR-only dashboard item (renamed to Dashboard, identified by link)
    if (item.link === "/hrm") {
      return user?.role?.name === "HR Manager" || isHR;
    }

    // Exclude the root "/" menu item for HR users
    if (item.link === "/") {
      return !isHR;
    }

    if (item.submenu) {
      const filteredSub = item.submenu.filter((s) => {
        const resource = s.link?.split("/")[1];
        return resource
          ? hasPermission(resource, "manage") ||
          hasPermission(resource, "delete") ||
          hasPermission(resource, "edit") ||
          hasPermission(resource, "create") ||
          hasPermission(resource, "view")
          : true;
      });
      // Try to keep the item if it has visible children, OR if the item itself has a link that is permitted?
      // Usually if it has a submenu, we only care if children are visible. 
      // But let's stick to the previous logic: return true if filteredSub has length.
      // Wait, if filteredSub is empty, we hide the parent? Yes.
      return filteredSub.length > 0;
    }

    const resource = item.link?.split("/")[1];
    return resource
      ? hasPermission(resource, "manage") ||
      hasPermission(resource, "delete") ||
      hasPermission(resource, "edit") ||
      hasPermission(resource, "create") ||
      hasPermission(resource, "view")
      : true;
  });

  const { organization } = useOrganizationStore();

  return (
    <aside
      id="layout-menu"
      className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-y-auto font-medium
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
    >
      <button
        onClick={toggleSidebar}
        className="lg:hidden absolute top-4 right-4 text-primary"
      >
        <FiX size={24} />
      </button>

      <div className="flex items-center justify-center py-4">
        {/* Logo: send HR users to /hrm, others to / */}
        <Link href={isHR ? "/hrm" : "/"} className="flex items-center" onClick={toggleSidebar}>
          <Image
            src={organization?.logo || logo}
            alt="Logo"
            width={200}
            height={50}
            className="w-32 h-auto object-contain"
            unoptimized={!!organization?.logo}
          />
        </Link>
      </div>

      <div className="px-2">
        <h2 className="w-full bg-primary hover:opacity-90 text-white px-4 py-2 rounded inline-flex items-center justify-center font-bold uppercase tracking-wider">
          {organization?.orgName || "pms"}
        </h2>
      </div>

      <ul className="py-1 px-3">
        {filteredMenuItems.map((item, idx) => (
          <MenuItem key={idx} item={item} onItemClick={toggleSidebar} />
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
