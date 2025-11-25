"use client";

import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Clipboard, Hash, Ruler, MessageSquare, Clock } from "lucide-react";
import { useStoreRequisition } from "@/hooks/useStoreRequisition";
import { formatDate as format } from "@/utils/dateUtils";
import { useSettingsStore } from "@/store/settingsStore"; 

const StoreRequisitionDetailsPage = () => {
  const { useEthiopianDate } = useSettingsStore();
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
    <div className="container mx-auto p-4 max-w-4xl">
      <Button
        variant="ghost"
        className="mb-4 text-cyan-700 hover:text-cyan-800 flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Store Requisitions
      </Button>

      <Card className="shadow-lg border-gray-200 overflow-hidden">
        <CardHeader className="bg-cyan-700 text-white py-4">
          <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <Clipboard className="h-6 w-6" />
            Store Requisition Details - ID: {requisition.id}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* ID and Approval */}
          <section className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
              <Hash className="h-5 w-5 text-cyan-700" />
              Identification
            </h3>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
              <p className="flex items-center gap-1"><span className="font-medium">Activity:</span> {requisition.approval?.request?.activity?.activity_name || "N/A"}</p>
            </div>
          </section>

          {/* Item Details */}
          <section className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
              <Ruler className="h-5 w-5 text-cyan-700" />
              Item Details
            </h3>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
              <p className="flex items-center gap-1"><Clipboard className="h-4 w-4 text-cyan-700" /><span className="font-medium ml-1">Description:</span> {requisition.description || "N/A"}</p>
              <p className="flex items-center gap-1"><Ruler className="h-4 w-4 text-cyan-700" /><span className="font-medium ml-1">Unit of Measure:</span> {requisition.unitOfMeasure || "N/A"}</p>
              <p className="flex items-center gap-1"><Clipboard className="h-4 w-4 text-cyan-700" /><span className="font-medium ml-1">Quantity:</span> {requisition.quantity}</p>
            </div>
          </section>

          {/* Timestamps */}
          <section className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-cyan-700" />
              Timestamps
            </h3>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
              <p className="flex items-center gap-1"><Clock className="h-4 w-4 text-cyan-700" /><span className="font-medium ml-1">Created At:</span> {format(requisition.createdAt, useEthiopianDate)}</p>
              <p className="flex items-center gap-1"><Clock className="h-4 w-4 text-cyan-700" /><span className="font-medium ml-1">Updated At:</span> {format(requisition.updatedAt, useEthiopianDate)}</p>
            </div>
          </section>

          {/* Remarks */}
          <section className="sm:col-span-2 lg:col-span-3 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-cyan-700" />
              Remarks
            </h3>
            <p className="text-xs sm:text-sm bg-gray-100 p-4 rounded-md text-gray-700 whitespace-pre-wrap">{requisition.remarks || "No remarks provided."}</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreRequisitionDetailsPage;
