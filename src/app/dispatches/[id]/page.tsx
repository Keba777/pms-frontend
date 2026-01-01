"use client";

import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Truck, User, DollarSign, MapPin, Clipboard, Clock, Hash, Plane } from "lucide-react";
import { useDispatch } from "@/hooks/useDispatches";
import { formatDate as format } from "@/utils/dateUtils";

const DispatchDetailsPage = () => {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { data: dispatch, isLoading, error } = useDispatch(id);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Skeleton className="h-10 w-32 mb-4" /> {/* Back button skeleton */}
        <Card className="shadow-lg border-gray-200">
          <CardHeader className="bg-cyan-700 text-white">
            <Skeleton className="h-8 w-64" /> {/* Title skeleton */}
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-4 sm:col-span-2 lg:col-span-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !dispatch) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error loading dispatch details.</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered": return "bg-green-100 text-green-800";
      case "In Transit": return "bg-blue-100 text-blue-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDispatchedByIcon = (mode: string | undefined) => {
    if (mode === "Plane") return <Plane className="h-5 w-5 text-cyan-700" />;
    if (mode === "Truck") return <Truck className="h-5 w-5 text-cyan-700" />;
    return <Truck className="h-5 w-5 text-cyan-700" />;
  };

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200 text-gray-400 hover:text-cyan-700 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-cyan-800 uppercase tracking-tight">
              Dispatch Details
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
              <Hash className="w-3 h-3" />
              Reference: {dispatch.refNumber || "N/A"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className={`w-full sm:w-auto text-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${dispatch.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
              dispatch.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                dispatch.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                  'bg-amber-100 text-amber-800'
            }`}>
            {dispatch.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Truck className="w-4 h-4 text-cyan-600" />
              Transport Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Driver Name</p>
                <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-500" />
                  {dispatch.driverName || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vehicle Details</p>
                <div className="space-y-2">
                  <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-cyan-500" />
                    {dispatch.vehicleNumber || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500 italic flex items-center gap-2">
                    <Truck className="w-4 h-4 text-gray-300" />
                    {dispatch.vehicleType || "N/A"}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transport Mode</p>
                <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  {getDispatchedByIcon(dispatch.dispatchedBy)}
                  {dispatch.dispatchedBy || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transport Cost</p>
                <p className="text-lg font-black text-cyan-700 flex items-center gap-1">
                  <DollarSign className="w-5 h-5" />
                  {dispatch.totalTransportCost.toLocaleString()}
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-600" />
              Route Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative">
              <div className="absolute hidden sm:block top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                <ArrowLeft className="w-4 h-4 text-gray-300 rotate-180" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Departure</p>
                <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  {dispatch.depatureSite?.name || "N/A"}
                </p>
              </div>
              <div className="space-y-1 sm:text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Arrival</p>
                <p className="text-sm font-bold text-gray-700 flex items-center gap-2 sm:justify-end">
                  {dispatch.arrivalSite?.name || "N/A"}
                  <MapPin className="w-4 h-4 text-emerald-500" />
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Clipboard className="w-4 h-4 text-cyan-600" />
              Remarks
            </h2>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-600 italic whitespace-pre-wrap leading-relaxed">
                {dispatch.remarks || "No remarks provided for this dispatch."}
              </p>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-600" />
              Timeline
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-cyan-50 border border-cyan-100 flex items-center justify-center">
                    <Truck className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div className="w-px h-full bg-gray-100"></div>
                </div>
                <div className="pb-6">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dispatched</p>
                  <p className="text-sm font-bold text-gray-700">{format(dispatch.dispatchedDate)}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Est. Arrival</p>
                  <p className="text-sm font-bold text-gray-700">{format(dispatch.estArrivalTime)}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Clipboard className="w-4 h-4 text-cyan-600" />
              Linked Activity
            </h2>
            <div className="p-4 bg-cyan-50/50 rounded-xl border border-cyan-100/50">
              <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-1">Activity Name</p>
              <p className="text-sm font-bold text-cyan-900 leading-tight">
                {dispatch.approval?.request?.activity?.activity_name || "N/A"}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DispatchDetailsPage;