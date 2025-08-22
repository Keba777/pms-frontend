"use client";

import { usePathname, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { ToastContainer } from "react-toastify";
import Footer from "@/components/layout/Footer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState, useRef } from "react";

const queryClient = new QueryClient();

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, expiresAt, logout, _hasHydrated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const logoutTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (user && (!expiresAt || Date.now() >= expiresAt)) {
      logout();
      router.push("/login");
      return;
    }

    // if user exists and expiresAt is in the future, schedule a timeout
    if (user && expiresAt) {
      const msUntilExpiry = expiresAt - Date.now();
      logoutTimer.current = window.setTimeout(() => {
        logout();
        router.push("/login");
      }, msUntilExpiry);
    }

    // cleanup on unmount or when user changes
    return () => {
      if (logoutTimer.current) {
        clearTimeout(logoutTimer.current);
        logoutTimer.current = null;
      }
    };
  }, [_hasHydrated, user, expiresAt, logout, router]);

  // existing auth redirection & loading logic
  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user && pathname !== "/login") {
      router.push("/login");
    } else if (user && pathname === "/login") {
      router.push("/");
    }
    if (isLoading) {
      setIsLoading(false);
    }
  }, [user, pathname, router, _hasHydrated, isLoading]);

  if (!_hasHydrated || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
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
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:ml-64 overflow-x-hidden">
          <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          {children}
        </main>
      </div>
      <Footer />
    </QueryClientProvider>
  );
}