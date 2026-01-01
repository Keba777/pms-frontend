"use client";

import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Clipboard, Hash, Ruler, MessageSquare, Clock } from "lucide-react";
import { useStoreRequisition } from "@/hooks/useStoreRequisition";
import { formatDate as format } from "@/utils/dateUtils";


const StoreRequisitionDetailsPage = () => {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { data: requisition, isLoading, error } = useStoreRequisition(id);

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

  if (error || !requisition) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error loading store requisition details.</div>;
  }

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
              Requisition Details
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
              <Hash className="w-3 h-3" />
              ID: {requisition.id}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Clipboard className="w-4 h-4 text-cyan-600" />
              Item Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</p>
                <p className="text-sm font-bold text-gray-700">{requisition.description || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Unit of Measure</p>
                <p className="text-sm font-bold text-gray-700 italic">{requisition.unitOfMeasure || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity</p>
                <p className="text-lg font-black text-cyan-700">{requisition.quantity || 0}</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-600" />
              Remarks
            </h2>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-600 italic whitespace-pre-wrap leading-relaxed">
                {requisition.remarks || "No remarks provided."}
              </p>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-600" />
              Timestamps
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Created At</p>
                  <p className="text-sm font-bold text-gray-700">{format(requisition.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Updated At</p>
                  <p className="text-sm font-bold text-gray-700">{format(requisition.updatedAt)}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Hash className="w-4 h-4 text-cyan-600" />
              Linked Activity
            </h2>
            <div className="p-4 bg-cyan-50/50 rounded-xl border border-cyan-100/50">
              <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-1">Activity Name</p>
              <p className="text-sm font-bold text-cyan-900 leading-tight">
                {requisition.approval?.request?.activity?.activity_name || "N/A"}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default StoreRequisitionDetailsPage;
