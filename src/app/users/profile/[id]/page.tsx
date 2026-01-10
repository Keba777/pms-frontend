"use client";

import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Shield,
  Building2,
  MapPin,
  Calendar,
  User2,
  Briefcase,
  Layers,
  CircleDollarSign,
  Clock,
  ClipboardList,
  Activity,
  CheckCircle2
} from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { User } from "@/types/user";
import { useEffect } from "react";
import Image from "next/image";
import avatar from "@/../public/images/user.png";
import { formatDate } from "@/utils/dateUtils";

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const users = useUserStore((state) => state.users);
  const user = users.find((u: User) => u.id === userId);

  useEffect(() => {
    if (!user) {
      router.push("/users");
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading user profile...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Projects", count: user.projects?.length || 0, icon: Layers, color: "blue" },
    { label: "Total Tasks", count: user.tasks?.length || 0, icon: ClipboardList, color: "emerald" },
    { label: "Active Activities", count: user.activities?.length || 0, icon: Activity, color: "orange" },
    { label: "Total Requests", count: user.requests?.length || 0, icon: CheckCircle2, color: "purple" },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.push("/users")}
          className="group flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2 text-gray-500 group-hover:text-primary transition-colors" />
          <span className="text-sm font-semibold text-gray-700">Back to Users</span>
        </button>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
        {/* Profile Header Block */}
        <div className="relative h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-gray-100" />

        <div className="px-8 pb-8">
          <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 mb-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-gray-50">
                <Image
                  src={user.profile_picture || avatar}
                  alt={`${user.first_name} ${user.last_name}`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white shadow-lg ${user.status === "Active" ? "bg-green-500" : "bg-red-500"
                }`} />
            </div>

            <div className="flex-1 text-center md:text-left mb-2">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                {user.first_name} {user.last_name}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-sm font-bold rounded-lg uppercase tracking-wider">
                  <Shield className="w-4 h-4" />
                  {user.role?.name || "Member"}
                </span>
                <span className={`px-3 py-1 text-sm font-bold rounded-lg uppercase tracking-wider ${user.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
                  }`}>
                  {user.status || "Status Unknown"}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Summary Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {statCards.map((stat) => (
              <div key={stat.label} className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100 shadow-sm transition-hover hover:shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-5 h-5 text-${stat.color}-500 opacity-60`} />
                  <span className="text-2xl font-black text-gray-900">{stat.count}</span>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Detailed Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Personal & Contact */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <User2 className="w-5 h-5 text-primary" />
                  Profile Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                  <InfoItem label="Email Address" value={user.email} icon={Mail} />
                  <InfoItem label="Phone Number" value={user.phone} icon={Phone} />
                  <InfoItem label="Gender" value={user.gender} icon={User2} />
                  <InfoItem label="Username" value={user.username} icon={Briefcase} />
                  <InfoItem label="Permission Level" value={user.access || "Low Access"} icon={Shield} />
                  <InfoItem label="Position" value={user.position || "Staff"} icon={Layers} />
                </div>
              </div>

              {user.responsibilities && user.responsibilities.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    Responsibilities
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {user.responsibilities.map((r, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center bg-gray-50 text-gray-700 px-4 py-1.5 rounded-xl text-sm font-medium border border-gray-200"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Employment & Professional */}
            <div className="space-y-6">
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Professional
                </h2>

                <div className="space-y-6">
                  <InfoItem label="Department" value={user.department?.name || "N/A"} icon={Building2} />
                  <InfoItem label="Work Site" value={user.site?.name || "N/A"} icon={MapPin} />
                  <InfoItem label="Joining Date" value={formatDate(user.joiningDate ?? null)} icon={Calendar} />
                  <InfoItem label="Employment Terms" value={user.terms || "Permanent"} icon={Clock} />
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Estimated Salary</span>
                    <span className="text-gray-900 font-bold flex items-center gap-1.5">
                      <CircleDollarSign className="w-4 h-4 text-emerald-500" />
                      {user.estSalary ? `${user.estSalary.toLocaleString()} ETB` : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Base OT Rate</span>
                    <span className="text-gray-900 font-bold flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-500" />
                      {user.ot ? `${user.ot.toLocaleString()} ETB/hr` : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-bold text-gray-900">{value || "Not set"}</p>
      </div>
    </div>
  );
}

