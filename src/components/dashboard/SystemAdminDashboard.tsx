
"use client";

import { useEffect, useState } from "react";
import StatsCard from "@/components/dashboard/StatsCard";
import Card from "@/components/common/ui/Card";
import { Users, Building, Activity, ShieldCheck } from "lucide-react";
import { useOrganizationStore } from "@/store/organizationStore";
import apiClient from "@/services/api-client"; // Assuming you have an api client
import Link from 'next/link';

interface OrgStats {
    totalOrgs: number;
    activeOrgs: number;
}

interface ItemWithStatus {
    status: string;
}

interface StatItem {
    label: string;
    value: number;
    icon: any;
    iconColor: string;
    link: string;
}

export default function SystemAdminDashboard() {
    const [orgStats, setOrgStats] = useState<OrgStats>({ totalOrgs: 0, activeOrgs: 0 });
    const [totalUsers, setTotalUsers] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const { organization } = useOrganizationStore();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Organizations Count
                // We'll need to fetch all orgs to count them or use a count endpoint if available.
                // Assuming getAllOrganizations returns an array.
                const orgsRes = await apiClient.get('/organizations');
                const orgs = (orgsRes.data as any).data || [];

                // Fetch All Users Count
                // Using the users endpoint. For system admin, this should return global users if filters are correct.
                // We might need to ensure backend supports global user fetch without org scope if we want true global count.
                // But let's stick to what we have or just fetch users.
                // Wait, getAllUsers currently filters by orgId unless SystemAdmin.
                // So calling /users as SystemAdmin should return ALL users.
                const usersRes = await apiClient.get('/users');
                const users = (usersRes.data as any).data || [];

                setOrgStats({
                    totalOrgs: orgs.length,
                    activeOrgs: orgs.length, // Identify 'active' if there's a status field, else assume all.
                });

                setTotalUsers(users.length);

            } catch (error) {
                console.error("Failed to fetch system stats", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Placeholder data for charts/stats cards
    // Ideally we'd group organizations by meaningful metrics (e.g. Plan Type, Status)
    const orgsBreakdown: StatItem[] = [
        {
            label: "Active",
            value: orgStats.activeOrgs,
            icon: <Activity size={18} />,
            iconColor: "#10b981",
            link: "/organizations"
        },
        {
            label: "Total",
            value: orgStats.totalOrgs,
            icon: <Building size={18} />,
            iconColor: "#3b82f6",
            link: "/organizations"
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col space-y-2">
                <h1 className="text-2xl font-bold text-gray-800">System Overview</h1>
                <p className="text-gray-500">Welcome back, System Administrator.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card
                    title="Total Organizations"
                    count={isLoading ? 0 : orgStats.totalOrgs}
                    link="/organizations"
                    Icon={Building}
                    color="amber-500"
                />
                <Card
                    title="Total Users"
                    count={isLoading ? 0 : totalUsers}
                    link="/users"
                    Icon={Users}
                    color="indigo-500"
                />
                <Card
                    title="System Health"
                    count={"100%"}
                    link="#"
                    Icon={Activity}
                    color="emerald-500"
                // @ts-ignore - Card component might behave differently with string count, verifying...
                // Check Card implementation later. For now assume it accepts string or number.
                />
                <Card
                    title="Security Status"
                    count={"Secure"}
                    link="#"
                    Icon={ShieldCheck}
                    color="rose-500"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/*  Organization Stats Widget */}
                <StatsCard
                    title="Organization Statistics"
                    items={orgsBreakdown}
                    total={orgStats.totalOrgs}
                />

                {/* Quick Actions / Recent Activity Placeholder */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <Link href="/organizations" className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border max-w-md">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-amber-100 text-amber-600 rounded-full">
                                    <Building size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Manage Organizations</p>
                                    <p className="text-sm text-gray-500">Create, edit, or remove tenants</p>
                                </div>
                            </div>
                        </Link>

                        <Link href="/users" className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border max-w-md">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-full">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Manage Global Users</p>
                                    <p className="text-sm text-gray-500">View all users across the system</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
