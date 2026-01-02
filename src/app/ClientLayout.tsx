"use client";

import { usePathname, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { ToastContainer } from "react-toastify";
import Footer from "@/components/layout/Footer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useOrganizationStore } from "@/store/organizationStore";
import { useEffect, useState, useRef, useMemo } from "react";
import { ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';

const queryClient = new QueryClient();

// Helper to convert decimal/hex color to CSS variable compatible string
const formatColor = (color: number | string | null | undefined) => {
  if (!color) return null;
  if (typeof color === "number") {
    return `#${color.toString(16).padStart(6, "0")}`;
  }
  return color;
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, expiresAt, logout, _hasHydrated } = useAuthStore();
  const { organization, fetchOrganization, clearOrganization } = useOrganizationStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const logoutTimer = useRef<number | null>(null);

  const publicPaths = ["/login", "/reset-password"];

  // Register AG Grid modules globally
  useEffect(() => {
    ModuleRegistry.registerModules([AllCommunityModule]);
  }, []);

  // Fetch organization details when user changes
  useEffect(() => {
    if (_hasHydrated && user?.orgId) {
      if (!organization || organization.id !== user.orgId) {
        fetchOrganization(user.orgId);
      }
    } else if (_hasHydrated && !user) {
      clearOrganization();
    }
  }, [_hasHydrated, user, organization, fetchOrganization, clearOrganization]);

  // Apply dynamic theme
  useEffect(() => {
    if (organization) {
      const root = document.documentElement;

      const themeColors = {
        "--primary": formatColor(organization.primaryColor),
        "--background": formatColor(organization.backgroundColor),
        "--secondary": formatColor(organization.secondaryColor),
        "--accent": formatColor(organization.accentColor),
        "--destructive": formatColor(organization.destructiveColor),
        "--card": formatColor(organization.cardColor),
        "--border": formatColor(organization.borderColor),
      };

      Object.entries(themeColors).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(key, value as string);
        }
      });

      // Update document title if needed (optional)
      // document.title = organization.orgName || "pms";
    }
  }, [organization]);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (user && (!expiresAt || Date.now() >= expiresAt)) {
      logout();
      router.push("/login");
      return;
    }

    // If user exists and expiresAt is in the future, schedule a timeout
    if (user && expiresAt) {
      const msUntilExpiry = expiresAt - Date.now();
      logoutTimer.current = window.setTimeout(() => {
        logout();
        router.push("/login");
      }, msUntilExpiry);
    }

    // Cleanup on unmount or when user changes
    return () => {
      if (logoutTimer.current) {
        clearTimeout(logoutTimer.current);
        logoutTimer.current = null;
      }
    };
  }, [_hasHydrated, user, expiresAt, logout, router]);

  // Auth redirection & loading logic
  useEffect(() => {
    if (!_hasHydrated) return;

    // Redirect unauthenticated users to login, except for public paths
    if (!user && !publicPaths.includes(pathname)) {
      router.push("/login");
    }
    else if (user && publicPaths.includes(pathname)) {
      // If authenticated, redirect away from public paths to dashboard
      router.push("/");
    }

    if (isLoading) {
      setIsLoading(false);
    }
  }, [user, pathname, router, _hasHydrated, isLoading, publicPaths]);

  if (!_hasHydrated || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  // For public paths, render children without layout wrapper
  if (publicPaths.includes(pathname)) {
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
      <div className="flex min-h-screen bg-gray-50">
        {/* Mobile Backdrop Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(false)}
        />

        <div className="flex flex-col flex-1 min-w-0 lg:pl-64">
          <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

          <main className="flex-1 p-4 sm:p-6 md:p-8 w-full max-w-7xl 2xl:max-w-[1600px] mx-auto">
            {children}
          </main>

        </div>
      </div>
    </QueryClientProvider>
  );
}