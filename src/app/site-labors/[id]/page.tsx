"use client";

import React from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import avatar from "@/../public/images/user.png";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Phone,
  User,
  Briefcase,
  DollarSign,
  Calendar,
  GraduationCap,
  TrendingUp,
  Clock,
  ShieldCheck,
  MapPin
} from "lucide-react";
import { useLaborInformation, useLabors } from "@/hooks/useLabors";
import { formatDate } from "@/utils/dateUtils";

export default function LaborDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const { data: info, isLoading: isInfoLoading, error: infoError } = useLaborInformation(id);
  const { data: labors, isLoading: isLaborsLoading } = useLabors();

  const labor = labors?.find((l) => String(l.id) === String(info?.laborId));

  const isLoading = isInfoLoading || isLaborsLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-8 animate-pulse">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <Skeleton className="h-48 w-48 rounded-2xl" />
          <div className="space-y-4 flex-1">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-6 w-1/4" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (infoError || !info) {
    return (
      <div className="container mx-auto p-12 text-center space-y-4">
        <div className="text-red-500 text-6xl">?</div>
        <h2 className="text-2xl font-bold text-gray-800">Labor Information Not Found</h2>
        <p className="text-gray-500 text-lg">The record you are looking for does not exist or has been removed.</p>
        <Button onClick={() => router.push("/site-labors")} variant="outline" className="mt-4">
          Return to Labors list
        </Button>
      </div>
    );
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Allocated": return "bg-green-100 text-green-700 border-green-200";
      case "Unallocated": return "bg-amber-100 text-amber-700 border-amber-200";
      case "OnLeave": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const DetailItem = ({ icon: Icon, label, value, colorClass = "text-primary" }: any) => (
    <div className="flex items-start gap-3 group">
      <div className={`mt-1 p-2 rounded-lg bg-gray-50 group-hover:bg-white border border-transparent group-hover:border-gray-100 transition-all ${colorClass}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold text-gray-800 break-words">{value || "---"}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header / Navigation */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Back</span>
          </Button>
          <div className="flex items-center gap-3">
            <Badge className={`px-4 py-1.5 rounded-full border shadow-sm flex items-center gap-2 ${getStatusColor(info.status)}`}>
              <div className={`h-2 w-2 rounded-full animate-pulse ${info.status === 'Allocated' ? 'bg-green-500' : 'bg-amber-500'}`} />
              {info.status || "Status Unknown"}
            </Badge>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-10 space-y-10">
        {/* Profile Hero section */}
        <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-primary/20 to-purple-400/20 rounded-[2rem] blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative h-48 w-48 rounded-[1.8rem] overflow-hidden bg-white ring-4 ring-white shadow-xl">
              <Image
                src={info.profile_picture || avatar}
                alt={`${info.firstName} ${info.lastName}`}
                fill
                className="object-cover group-hover:scale-110 transition duration-700"
              />
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#1E293B] tracking-tight">
                {info.firstName} {info.lastName}
              </h1>
              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4 text-lg text-gray-600 font-medium">
                <span className="flex items-center gap-2 bg-primary/5 text-primary px-3 py-1 rounded-lg">
                  <Briefcase size={20} />
                  {info.position || "Position not set"}
                </span>
                <span className="flex items-center gap-2 bg-purple-50 text-purple-600 px-3 py-1 rounded-lg">
                  <ShieldCheck size={20} />
                  {labor?.role || "Role not defined"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-8 border-t pt-6">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center md:text-left">Employee ID</p>
                <p className="text-xl font-black text-gray-800">{info.id.slice(-8).toUpperCase()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center md:text-left">Phone Number</p>
                <p className="text-xl font-black text-gray-800">{info.phone || "---"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center md:text-left">Work Unit</p>
                <p className="text-xl font-black text-gray-800">{labor?.unit || "---"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Card: Personal Info */}
          <Card className="rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="p-1 px-8 py-6 bg-gradient-to-r from-blue-500/10 to-transparent border-b border-blue-100 flex items-center gap-3">
              <div className="p-2 bg-blue-500 text-white rounded-xl"><User size={20} /></div>
              <h3 className="text-lg font-bold text-gray-800">Personal Data</h3>
            </div>
            <CardContent className="p-8 space-y-6">
              <DetailItem icon={User} label="Gender" value={info.sex} colorClass="text-blue-500" />
              <DetailItem icon={Phone} label="Contact" value={info.phone} colorClass="text-blue-500" />
              <DetailItem icon={GraduationCap} label="Education" value={info.educationLevel} colorClass="text-blue-500" />
            </CardContent>
          </Card>

          {/* Card: Employment Details */}
          <Card className="rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="p-1 px-8 py-6 bg-gradient-to-r from-emerald-500/10 to-transparent border-b border-emerald-100 flex items-center gap-3">
              <div className="p-2 bg-emerald-500 text-white rounded-xl"><Briefcase size={20} /></div>
              <h3 className="text-lg font-bold text-gray-800">Employment</h3>
            </div>
            <CardContent className="p-8 space-y-6">
              <DetailItem icon={ShieldCheck} label="Terms" value={info.terms} colorClass="text-emerald-500" />
              <DetailItem icon={TrendingUp} label="Skill Level" value={info.skill_level} colorClass="text-emerald-500" />
              <DetailItem icon={MapPin} label="Position" value={info.position} colorClass="text-emerald-500" />
            </CardContent>
          </Card>

          {/* Card: Financial Summary */}
          <Card className="rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="p-1 px-8 py-6 bg-gradient-to-r from-amber-500/10 to-transparent border-b border-amber-100 flex items-center gap-3">
              <div className="p-2 bg-amber-500 text-white rounded-xl"><DollarSign size={20} /></div>
              <h3 className="text-lg font-bold text-gray-800">Financials</h3>
            </div>
            <CardContent className="p-8 space-y-6">
              <DetailItem icon={DollarSign} label="Est. Salary" value={info.estSalary ? `ETB ${info.estSalary?.toLocaleString()}` : "---"} colorClass="text-amber-500" />
              <DetailItem icon={DollarSign} label="Labor Rate" value={info.rate ? `ETB ${info.rate} / ${labor?.unit}` : "---"} colorClass="text-amber-500" />
              <DetailItem icon={DollarSign} label="Total Amount" value={info.totalAmount ? `ETB ${info.totalAmount?.toLocaleString()}` : "---"} colorClass="text-amber-600 font-black" />
            </CardContent>
          </Card>

          {/* Card: Schedule & Planning */}
          <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="p-1 px-8 py-6 bg-gradient-to-r from-purple-500/10 to-transparent border-b border-purple-100 flex items-center gap-3">
              <div className="p-2 bg-purple-500 text-white rounded-xl"><Calendar size={20} /></div>
              <h3 className="text-lg font-bold text-gray-800">Work Schedule & Planning</h3>
            </div>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                <DetailItem icon={Calendar} label="Date Starts" value={formatDate(info.startsAt)} colorClass="text-purple-500" />
                <DetailItem icon={Calendar} label="Date Ends" value={formatDate(info.endsAt)} colorClass="text-purple-500" />
                <DetailItem icon={Clock} label="Estimated Hours" value={info.estimatedHours ? `${info.estimatedHours} hrs` : "---"} colorClass="text-purple-500" />
                <DetailItem icon={Clock} label="Total Time" value={info.totalTime ? `${info.totalTime} hrs` : "---"} colorClass="text-purple-500" />
                <DetailItem icon={TrendingUp} label="Utilization" value={info.utilization_factor ? `${(info.utilization_factor * 100).toFixed(1)}%` : "---"} colorClass="text-purple-500" />
                <DetailItem icon={Calendar} label="Shifting Date" value={formatDate(info.shiftingDate ?? null)} colorClass="text-purple-500" />
              </div>
            </CardContent>
          </Card>

          {/* Card: Responsible Person (Small Sidebar) */}
          <Card className="rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="p-1 px-8 py-6 bg-gradient-to-r from-rose-500/10 to-transparent border-b border-rose-100 flex items-center gap-3">
              <div className="p-2 bg-rose-500 text-white rounded-xl"><User size={20} /></div>
              <h3 className="text-lg font-bold text-gray-800">Management</h3>
            </div>
            <CardContent className="p-8 space-y-6">
              <DetailItem icon={User} label="Responsible Person" value={labor?.responsiblePerson} colorClass="text-rose-500" />
              <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-100 space-y-2">
                <p className="text-xs font-bold text-rose-800 uppercase tracking-tighter">Quick Note</p>
                <p className="text-xs text-rose-600 leading-relaxed italic">
                  Managing responsibility for "{labor?.role}" allocation within the {labor?.unit} framework.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer / Legal */}
      <footer className="container mx-auto px-6 py-12 text-center">
        <p className="text-gray-400 text-sm">PMS © {new Date().getFullYear()} — Site Labor Management System</p>
        <p className="text-gray-300 text-[10px] mt-2 tracking-widest uppercase">System Reference: {info.id}</p>
      </footer>
    </div>
  );
}

