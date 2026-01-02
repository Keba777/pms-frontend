"use client";

import { useEffect, useState } from "react";
import DashboardStats from "@/components/dashboard/DashboardStats";
import TabNavigation from "@/components/dashboard/TabNavigation";
import { useAuthStore } from "@/store/authStore";
import Spinner from "@/components/common/ui/Spinner";
import AdminDashboard from "@/components/system-admin/AdminDashboard";

export default function Home() {
  const { user, _hasHydrated } = useAuthStore();
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);

  useEffect(() => {
    if (_hasHydrated && user?.role?.name?.toLowerCase() === "systemadmin") {
      setIsSystemAdmin(true);
    } else {
      setIsSystemAdmin(false);
    }
  }, [user, _hasHydrated]);

  if (!_hasHydrated) {
    return <div className="flex h-screen items-center justify-center"><Spinner /></div>;
  }

  if (isSystemAdmin) {
    return <AdminDashboard />;
  }

  return (
    <div>
      <DashboardStats />
      <TabNavigation />
    </div>
  );
}
