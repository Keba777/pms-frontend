"use client";

import { usePathname, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { ToastContainer } from "react-toastify";
import Footer from "@/components/layout/Footer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import RoleLayout from "./RoleLayout";

const queryClient = new QueryClient();

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();

  // Local loading state for the layout.
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  // Handle authentication redirection.
  useEffect(() => {
    if (!_hasHydrated) return;

    if (!user && pathname !== "/login") {
      router.push("/login");
    } else if (user && pathname === "/login") {
      router.push("/");
    }

    // Mark loading complete once authentication logic has run.
    if (isLoading) {
      setIsLoading(false);
    }
  }, [user, pathname, router, _hasHydrated, isLoading]);

  // Show a loading spinner if authentication state is not ready.
  if (!_hasHydrated || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  // For the login page, we do not need the sidebar and header.
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
          <RoleLayout>{children}</RoleLayout>
        </main>
      </div>
      <Footer />
    </QueryClientProvider>
  );
}
