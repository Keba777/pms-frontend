"use client";

import React, { useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import { useOrganizations } from "@/hooks/useOrganizations";
import { useUsers } from "@/hooks/useUsers";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useActivities } from "@/hooks/useActivities";
import { Building, Users, Activity, CheckSquare, Grid, ShieldCheck, AlertTriangle, ArrowUpRight, Plus, ExternalLink } from "lucide-react";
import Spinner from "@/components/common/ui/Spinner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie } from 'recharts';
import { useAdminStats } from "@/hooks/useAdminStats";
import Link from "next/link";

const ADMIN_COLORS = {
    cyan: {
        primary: "#0e7490", // cyan-700
        light: "#ecfeff",   // cyan-50
        gradient: ["#0891b2", "#0e7490"]
    },
    emerald: {
        primary: "#059669", // emerald-600
        light: "#ecfdf5",   // emerald-50
        gradient: ["#10b981", "#059669"]
    },
    amber: {
        primary: "#d97706", // amber-600
        light: "#fffbeb",   // amber-50
        gradient: ["#f59e0b", "#d97706"]
    },
    violet: {
        primary: "#7c3aed", // violet-600
        light: "#f5f3ff",   // violet-50
        gradient: ["#8b5cf6", "#7c3aed"]
    }
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/80 backdrop-blur-md border border-gray-100 p-4 rounded-2xl shadow-xl shadow-gray-200/50">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 mb-1">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                        <span className="text-sm font-black text-gray-700">{entry.name}:</span>
                        <span className="text-sm font-black text-primary">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

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
                label: "Enterprises",
                count: organizations.length,
                icon: Building,
                color: ADMIN_COLORS.cyan,
                link: "/organizations"
            },
            {
                label: "Global Users",
                count: users.length,
                icon: Users,
                color: ADMIN_COLORS.emerald,
                link: "/users"
            },
            {
                label: "Active Projects",
                count: projects.length,
                icon: Grid,
                color: ADMIN_COLORS.violet,
                link: "/projects"
            },
            {
                label: "System Tasks",
                count: tasks.length,
                icon: CheckSquare,
                color: ADMIN_COLORS.amber,
                link: "/tasks"
            }
        ];
    }, [organizations, users, projects, tasks]);

    const chartData = useMemo(() => {
        return [
            { name: 'Projects', value: projects.length, color: ADMIN_COLORS.violet.primary },
            { name: 'Tasks', value: tasks.length, color: ADMIN_COLORS.amber.primary },
            { name: 'Activities', value: activities.length, color: ADMIN_COLORS.emerald.primary },
            { name: 'Users', value: users.length, color: ADMIN_COLORS.cyan.primary },
            { name: 'Orgs', value: organizations.length, color: "#6366f1" }
        ];
    }, [projects, tasks, activities, users, organizations]);

    if (orgsLoading || usersLoading || projectsLoading || tasksLoading || activitiesLoading || statsLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
                <Spinner />
                <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] animate-pulse">Initializing System View</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 p-4 sm:p-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-1 bg-cyan-600 rounded-full" />
                        <span className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em]">Management Console</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                        System Executive <span className="text-gray-300">/</span> Dashboard
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/organizations" className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-gray-200">
                        <Plus size={16} /> New Organization
                    </Link>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Link key={stat.label} href={stat.link} className="group relative bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden">
                        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 transition-all duration-500 opacity-5 group-hover:opacity-10`} style={{ backgroundColor: stat.color.primary }} />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`p-4 rounded-2xl shadow-xl transition-all duration-500 group-hover:scale-110`} style={{ backgroundColor: stat.color.light, color: stat.color.primary }}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <ArrowUpRight className="h-5 w-5 text-gray-300 group-hover:text-gray-900 transition-colors" />
                            </div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.15em] mb-1">{stat.label}</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-gray-900">{stat.count}</span>
                                <span className="text-[10px] font-bold text-emerald-600">+12%</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* System Overview Chart */}
                <div className="lg:col-span-2 bg-white/50 backdrop-blur-sm p-8 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">System Distribution</h2>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Resource allocation across architecture</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl">
                                {['Daily', 'Weekly', 'Monthly'].map(period => (
                                    <button key={period} className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${period === 'Weekly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                                        {period}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    {chartData.map((entry, index) => (
                                        <linearGradient key={`v-grad-${index}`} id={`v-grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={entry.color} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={entry.color} stopOpacity={0.1} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                                <Bar
                                    dataKey="value"
                                    radius={[12, 12, 4, 4]}
                                    barSize={60}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`url(#v-grad-${index})`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* System Health Column */}
                <div className="space-y-8">
                    {/* API Health */}
                    <div className="bg-gray-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />

                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-cyan-500/20 rounded-2xl">
                                <ShieldCheck className="h-6 w-6 text-cyan-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tight">System Vitality</h3>
                                <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Real-time status</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {[
                                { label: "API Cluster", status: adminStats?.health.apiStatus || "Stable", color: "text-emerald-400", bg: "bg-emerald-400/10" },
                                { label: "Database", status: adminStats?.health.dbStatus || "Optimized", color: "text-emerald-400", bg: "bg-emerald-400/10" },
                                { label: "Core Services", status: "Running", color: "text-cyan-400", bg: "bg-cyan-400/10" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">{item.label}</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${item.color} ${item.bg} px-3 py-1 rounded-full`}>
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Global Uptime</span>
                            <span className="text-xl font-black text-emerald-400">99.98%</span>
                        </div>
                    </div>

                    {/* Security Overview */}
                    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm group">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-amber-50 rounded-2xl group-hover:scale-110 transition-transform">
                                <AlertTriangle className="h-6 w-6 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Vulnerability Monitor</h3>
                        </div>

                        <div className="space-y-5">
                            {[
                                { label: "Approval Required", count: adminStats?.security.pendingApprovals || 0, color: "text-amber-600" },
                                { label: "Auth Failures", count: adminStats?.security.failedLogins || 0, color: "text-rose-600" },
                                { label: "Active Sessions", count: adminStats?.security.activeSessions || 0, color: "text-blue-600" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-500">{item.label}</span>
                                    <span className={`text-sm font-black ${item.color}`}>{item.count}</span>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-8 py-3 rounded-2xl border border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-all flex items-center justify-center gap-2">
                            Full Audit Log <ArrowUpRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
