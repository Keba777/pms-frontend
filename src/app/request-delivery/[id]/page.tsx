// app/request-delivery/[id]/page.tsx
"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, User, DollarSign, MapPin, Clipboard, Clock, Hash, Package, CheckCircle, XCircle } from "lucide-react";
import { useRequestDelivery } from "@/hooks/useRequestDeliveries"; // Assuming a hook to fetch single request delivery by ID
import { formatDate as format } from "@/utils/dateUtils";

const RequestDeliveryDetailsPage = () => {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { data: delivery, isLoading, error } = useRequestDelivery(id);

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
            </div>
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !delivery) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error loading request delivery details.</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === "Delivered") return <CheckCircle className="h-5 w-5 text-green-700" />;
    if (status === "Pending") return <Clock className="h-5 w-5 text-yellow-700" />;
    if (status === "Cancelled") return <XCircle className="h-5 w-5 text-red-700" />;
    return <Clipboard className="h-5 w-5 text-cyan-700" />;
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
              Delivery Details
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
              <Hash className="w-3 h-3" />
              Reference: {delivery.refNumber || "N/A"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className={`w-full sm:w-auto text-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${delivery.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
              delivery.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                'bg-amber-100 text-amber-800'
            }`}>
            {delivery.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-600" />
              Delivery Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivered By</p>
                <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-500" />
                  {delivery.deliveredBy || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Received By</p>
                <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-500" />
                  {delivery.recievedBy || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity Received</p>
                <p className="text-lg font-black text-cyan-700 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {delivery.recievedQuantity || 0}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Site</p>
                <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  {delivery.site?.name || "N/A"}
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
                {delivery.remarks || "No remarks provided for this delivery."}
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
                    <Clock className="w-4 h-4 text-cyan-600" />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery Date</p>
                  <p className="text-sm font-bold text-gray-700">{format(delivery.deliveryDate)}</p>
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
                {delivery.approval?.request?.activity?.activity_name || "N/A"}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RequestDeliveryDetailsPage;
