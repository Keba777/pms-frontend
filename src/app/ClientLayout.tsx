"use client";

import { usePathname, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { ToastContainer } from "react-toastify";
import Footer from "@/components/layout/Footer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
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
          <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}/>
          {children}
        </main>
      </div>
      <Footer />
    </QueryClientProvider>
  );
}
