"use client";

import DashboardStats from "@/components/dashboard/DashboardStats";
import TabNavigation from "@/components/dashboard/TabNavigation";

export default function Home() {
  return (
    <div>
      <DashboardStats />
      <TabNavigation />
    </div>
  );
}
