"use client";

import { useEffect } from "react";
import { useRoles } from "@/hooks/useRoles";
import { usePermissionsStore } from "@/store/permissionsStore";
import { useAuthStore } from "@/store/authStore";

interface RoleLayoutProps {
  children: React.ReactNode;
}

export default function RoleLayout({ children }: RoleLayoutProps) {
  const { user } = useAuthStore();
  const { data: rolesData, isLoading: rolesLoading } = useRoles();
  const setPermissionRole = usePermissionsStore((state) => state.setRole);

  // Update permissions store based on the fetched role
  useEffect(() => {
    if (user && rolesData && rolesData.length > 0) {
      const roleFromData = rolesData.find((role) => role.id === user.role_id);
      if (roleFromData) {
        setPermissionRole(roleFromData.name);
      } else {
        console.warn("No matching role found for user role ID:", user.role_id);
      }
    }
  }, [user, rolesData, setPermissionRole]);

  // Optionally, display a loading state while roles are being fetched.
  if (rolesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return <>{children}</>;
}
