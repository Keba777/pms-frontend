"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useOrganizations } from "@/hooks/useOrganizations";
import { Building, Plus, Settings } from "lucide-react";
import Spinner from "@/components/common/ui/Spinner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MetricsCard from "@/components/users/MetricsCard";
import SystemAdminOrganizationsPage from "@/components/system-admin/AdminOrganizations";

const OrganizationsPage = () => {
    const { user } = useAuthStore();
    const router = useRouter();
    const { data: organizations = [], isLoading, isError } = useOrganizations();

    const isSystemAdmin = user?.role?.name?.toLowerCase() === "systemadmin";
    const isSuperAdmin = user?.role?.name?.toLowerCase() === "superadmin";

    // Redirect SuperAdmin to their own organization detail
    React.useEffect(() => {
        if (isSuperAdmin && user?.orgId) {
            router.push(`/organizations/${user.orgId}`);
        }
    }, [isSuperAdmin, user, router]);

    const metrics = useMemo(() => [
        { title: "Total Organizations", value: organizations.length, icon: <Building className="h-6 w-6 text-cyan-700" /> },
    ], [organizations]);

    // Use the admin component if System Admin
    if (isSystemAdmin) {
        return <SystemAdminOrganizationsPage />;
    }

    // Redirect unauthorized users (Not System Admin AND Not Super Admin)
    React.useEffect(() => {
        if (!isSystemAdmin && !isSuperAdmin) {
            router.push("/");
        }
    }, [isSystemAdmin, isSuperAdmin, router]);

    if (!isSystemAdmin && !isSuperAdmin) {
        return null; // Don't render anything while redirecting
    }

    if (isLoading) return <div className="flex justify-center p-12"><Spinner /></div>;
    if (isError) return <div className="text-red-600 text-center p-12">Error loading organizations</div>;

    // Existing View for others (likely unreachable if strictly protected, but keeping for safety)
    return (
        <div className="p-4 space-y-6">
            {/* ... existing content potentially ... */}
            <div className="p-8 text-center text-gray-500">
                Redirecting...
            </div>
        </div>
    );
};

export default OrganizationsPage;
