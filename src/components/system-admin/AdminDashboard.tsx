"use client";

import React, { useMemo } from "react";

import { useAuthStore } from "@/store/authStore";
import { useOrganizations } from "@/hooks/useOrganizations";
import { useUsers } from "@/hooks/useUsers";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useActivities } from "@/hooks/useActivities";
import { Building, Users, Activity, CheckSquare, Grid, ShieldCheck, AlertTriangle } from "lucide-react";
import Spinner from "@/components/common/ui/Spinner";
import Card from "@/components/common/ui/Card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { useAdminStats } from "@/hooks/useAdminStats";

const AdminDashboard = () => {
    const { user } = useAuthStore();

    const { data: organizations = [], isLoading: orgsLoading } = useOrganizations();
    const { data: users = [], isLoading: usersLoading } = useUsers();
    const { data: projects = [], isLoading: projectsLoading } = useProjects();
    const { data: tasks = [], isLoading: tasksLoading } = useTasks();
    const { data: activities = [], isLoading: activitiesLoading } = useActivities();
    const { data: adminStats, isLoading: statsLoading } = useAdminStats();

    const stats = useMemo(() => {
        return [
            {
                label: "Total Organizations",
                count: organizations.length,
                icon: Building,
                color: "bg-blue-500",
                change: "+1 new this month" // Placeholder for now
            },
            {
                label: "Total Users",
                count: users.length,
                icon: Users,
                color: "bg-green-500",
                change: "Active users across system"
            },
            {
                label: "Total Projects",
                count: projects.length,
                icon: Grid,
                color: "bg-indigo-500",
                change: "Managed projects"
            },
            {
                label: "Total Tasks",
                count: tasks.length,
                icon: CheckSquare,
                color: "bg-orange-500",
                change: "Tasks assigned"
            }
        ];
    }, [organizations, users, projects, tasks]);

    const chartData = useMemo(() => {
        return [
            {
                name: 'System Overview',
                Projects: projects.length,
                Tasks: tasks.length,
                Activities: activities.length,
                Users: users.length,
                Organizations: organizations.length
            }
        ];
    }, [projects, tasks, activities, users, organizations]);

    // Group projects by status for a detailed chart
    const projectStatusData = useMemo(() => {
        const statusCounts: Record<string, number> = {};
        projects.forEach(p => {
            const status = p.status || 'Unknown';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        return Object.keys(statusCounts).map(key => ({ name: key, count: statusCounts[key] }));
    }, [projects]);


    if (orgsLoading || usersLoading || projectsLoading || tasksLoading || activitiesLoading) {
        return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    }

    if (user?.role?.name?.toLowerCase() !== "systemadmin") {
        return <div className="p-8 text-center text-red-600">Access Denied</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">System Administrator Dashboard</h1>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card
                        key={stat.label}
                        title={stat.label}
                        count={stat.count}
                        Icon={stat.icon}
                        color={stat.color.replace("bg-", "text-")} // Card uses text-{color} logic internally for icon
                        link={
                            stat.label === "Total Organizations" ? "/organizations" :
                                stat.label === "Total Users" ? "/users" :
                                    "#"
                        }
                    />
                ))}
            </div>

            {/* System Health & Security */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-full">
                            <ShieldCheck className="h-6 w-6 text-green-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-gray-600">API Status</span>
                            <span className="text-green-600 font-medium">{adminStats?.health.apiStatus ?? "Checking..."}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-gray-600">Database Connection</span>
                            <span className={`font-medium ${adminStats?.health.dbStatus === 'Connected' ? 'text-green-600' : 'text-red-600'}`}>
                                {adminStats?.health.dbStatus ?? "Checking..."}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Last Backup</span>
                            <span className="text-gray-900">{adminStats?.health.lastBackup ?? "Checking..."}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-100 rounded-full">
                            <AlertTriangle className="h-6 w-6 text-amber-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Security Overview</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-gray-600">Pending Approvals</span>
                            <span className="text-amber-600 font-medium">{adminStats?.security.pendingApprovals ?? 0}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-gray-600">Failed Login Attempts</span>
                            <span className="text-gray-900 font-medium">{adminStats?.security.failedLogins ?? 0} (Last 24h)</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Active Sessions</span>
                            <span className="text-blue-600 font-medium">{adminStats?.security.activeSessions ?? 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Data Overview Chart */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">System Data Overview</h2>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Projects" fill="#6366f1" />
                                <Bar dataKey="Tasks" fill="#f97316" />
                                <Bar dataKey="Activities" fill="#ec4899" />
                                <Bar dataKey="Users" fill="#22c55e" />
                                <Bar dataKey="Organizations" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Project Status Chart - Placeholder using dummy mapping logic since API status might be strings */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Projects by Status</h2>
                    <div className="h-80 w-full flex items-center justify-center text-gray-500">
                        {projectStatusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={projectStatusData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#8b5cf6" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p>No project data available</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
