"use client";

import { usePathname, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { ToastContainer } from "react-toastify";
import Footer from "@/components/layout/Footer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useRoleStore } from "@/store/roleStore";
import { usePermissionsStore } from "@/store/permissionsStore";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { user, _hasHydrated } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Retrieve roles from the role store.
  const { roles } = useRoleStore();
  // Get the function to update the current role in our permission store.
  const setPermissionRole = usePermissionsStore((state) => state.setRole);

  useEffect(() => {
    if (!_hasHydrated) return;

    // Authentication redirects
    if (!user && pathname !== "/login") {
      router.push("/login");
    } else if (user && pathname === "/login") {
      router.push("/");
    }

    // When a user exists, retrieve their role from the role store using user.role_id.
    if (user) {
      const roleFromStore = roles.find((role) => role.id === user.role_id);
      if (roleFromStore) {
        setPermissionRole(roleFromStore.name as string);
      }
    }

    if (isLoading) {
      setIsLoading(false);
    }
  }, [
    user,
    pathname,
    router,
    _hasHydrated,
    isLoading,
    roles,
    setPermissionRole,
  ]);

  if (!_hasHydrated || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (pathname === "/login") {
    return (
      <QueryClientProvider client={queryClient}>
        <ToastContainer />
        {children}
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer />
      <div className="flex">
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 p-4 ml-0 lg:ml-64 overflow-x-hidden">
          <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          {children}
        </main>
      </div>
      <Footer />
    </QueryClientProvider>
  );
}
