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

import { BrandingProvider, useBranding } from "@/context/BrandingContext";
import { ThemeColors } from "@/utils/theme-utils";

// Helper to safely parse color from string or number
const parseColor = (val: number | string | null | undefined, defaultVal: number): number => {
  if (val === null || val === undefined) return defaultVal;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseInt(val.replace('#', ''), 16);
  return defaultVal;
};

// Component to sync organization store with branding context
const BrandingSync = () => {
  const { organization } = useOrganizationStore();
  const { setBranding } = useBranding();

  useEffect(() => {
    if (organization) {
      const branding: ThemeColors = {
        primaryColor: parseColor(organization.primaryColor as any, 0x0e7490),
        backgroundColor: parseColor(organization.backgroundColor as any, 0xffffff),
        secondaryColor: parseColor(organization.secondaryColor as any, 0x374151),
        cardColor: parseColor(organization.cardColor as any, 0xffffff),
        cardForegroundColor: parseColor(organization.cardForegroundColor as any, 0x1a1a1a),
        popoverColor: parseColor(organization.popoverColor as any, 0xffffff),
        popoverForegroundColor: parseColor(organization.popoverForegroundColor as any, 0x1a1a1a),
        primaryForegroundColor: parseColor(organization.primaryForegroundColor as any, 0xffffff),
        secondaryForegroundColor: parseColor(organization.secondaryForegroundColor as any, 0xffffff),
        mutedColor: parseColor(organization.mutedColor as any, 0xf3f4f6),
        mutedForegroundColor: parseColor(organization.mutedForegroundColor as any, 0x6b7280),
        accentColor: parseColor(organization.accentColor as any, 0xf3f4f6),
        accentForegroundColor: parseColor(organization.accentForegroundColor as any, 0x1a1a1a),
        destructiveColor: parseColor(organization.destructiveColor as any, 0xdc3545),
        destructiveForegroundColor: parseColor(organization.destructiveForegroundColor as any, 0xffffff),
        borderColor: parseColor(organization.borderColor as any, 0xe5e7eb),
      };
      setBranding(branding);
    } else {
      // Reset to defaults if no organization (e.g. System Admin or logged out)
      // We import DEFAULT_THEME_COLORS safely or reconstruct logic?
      // Since we can't easily import from here without context, let's use the hardcoded defaults matching branding.ts
      // Actually, BrandingProvider initializes with defaults. We just need to RE-apply them.
      // The cleanest way is to import DEFAULT_THEME_COLORS. Let's check imports.
      // ClientLayout imports `ThemeColors` from `utils`, but NOT constants.
      // I'll add the import first if needed, or just hardcode the reset.
      // Hardcoding is fail-safe here to avoid import issues in this large file context.
      const defaultBranding: ThemeColors = {
        primaryColor: 0x0e7490,
        backgroundColor: 0xffffff,
        cardColor: 0xffffff,
        cardForegroundColor: 0x1a1a1a,
        popoverColor: 0xffffff,
        popoverForegroundColor: 0x1a1a1a,
        primaryForegroundColor: 0xffffff,
        secondaryColor: 0x374151,
        secondaryForegroundColor: 0xffffff,
        mutedColor: 0xf3f4f6,
        mutedForegroundColor: 0x6b7280,
        accentColor: 0xf3f4f6,
        accentForegroundColor: 0x1a1a1a,
        destructiveColor: 0xdc3545,
        destructiveForegroundColor: 0xffffff,
        borderColor: 0xe5e7eb,
      };
      setBranding(defaultBranding);
    }
  }, [organization, setBranding]);

  return null;
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

  // Fetch organization details when user changes or valid session exists
  // We fetch indiscriminately on orgId validity to ensure branding is always up to date (syncing with any DB changes)
  useEffect(() => {
    if (_hasHydrated && user?.orgId) {
      fetchOrganization(user.orgId);
    } else if (_hasHydrated && !user) {
      clearOrganization();
    }
  }, [_hasHydrated, user?.orgId, fetchOrganization, clearOrganization]);

  // Auth redirection & loading logic (existing)
  useEffect(() => {
    if (!_hasHydrated) return;

    if (user && (!expiresAt || Date.now() >= expiresAt)) {
      logout();
      router.push("/login");
      return;
    }

    if (user && expiresAt) {
      const msUntilExpiry = expiresAt - Date.now();
      logoutTimer.current = window.setTimeout(() => {
        logout();
        router.push("/login");
      }, msUntilExpiry);
    }

    return () => {
      if (logoutTimer.current) {
        clearTimeout(logoutTimer.current);
        logoutTimer.current = null;
      }
    };
  }, [_hasHydrated, user, expiresAt, logout, router]);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!user && !publicPaths.includes(pathname)) {
      router.push("/login");
    }
    else if (user && publicPaths.includes(pathname)) {
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

  if (publicPaths.includes(pathname)) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrandingProvider>
          <ToastContainer />
          <BrandingSync />
          {children}
        </BrandingProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrandingProvider>
        <ToastContainer />
        <BrandingSync />
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
      </BrandingProvider>
    </QueryClientProvider>
  );
}