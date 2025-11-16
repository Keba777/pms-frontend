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
    <div className="container mx-auto p-4 max-w-4xl">
      <Button
        variant="ghost"
        className="mb-4 text-cyan-700 hover:text-cyan-800 flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Request Deliveries
      </Button>

      <Card className="shadow-lg border-gray-200 overflow-hidden">
        <CardHeader className="bg-cyan-700 text-white py-4">
          <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <Package className="h-6 w-6" />
            Request Delivery Details - {delivery.refNumber || "N/A"}
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
              <p className="flex items-center gap-1"><span className="font-medium">Activity:</span> {delivery.approval?.request?.activity?.activity_name || "N/A"}</p>
              <p className="flex items-center gap-1"><span className="font-medium">Reference Number:</span> {delivery.refNumber || "N/A"}</p>
            </div>
          </section>

          {/* Parties Involved */}
          <section className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
              <User className="h-5 w-5 text-cyan-700" />
              Parties Involved
            </h3>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
              <p className="flex items-center gap-1"><User className="h-4 w-4 text-cyan-700" /><span className="font-medium ml-1">Delivered By:</span> {delivery.deliveredBy || "N/A"}</p>
              <p className="flex items-center gap-1"><User className="h-4 w-4 text-cyan-700" /><span className="font-medium ml-1">Received By:</span> {delivery.recievedBy || "N/A"}</p>
            </div>
          </section>

          {/* Delivery Details */}
          <section className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
              <Package className="h-5 w-5 text-cyan-700" />
              Delivery Details
            </h3>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
              <p className="flex items-center gap-1"><Clock className="h-4 w-4 text-cyan-700" /><span className="font-medium ml-1">Delivery Date:</span> {new Date(delivery.deliveryDate).toLocaleString()}</p>
              <p className="flex items-center gap-1"><Package className="h-4 w-4 text-cyan-700" /><span className="font-medium ml-1">Received Quantity:</span> {delivery.recievedQuantity}</p>
              <p className="flex items-center gap-1"><Badge className={`ml-1 ${getStatusColor(delivery.status)}`}>{delivery.status}</Badge></p>
            </div>
          </section>

          {/* Site */}
          <section className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-cyan-700" />
              Site
            </h3>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
              <p className="flex items-center gap-1"><MapPin className="h-4 w-4 text-cyan-700" /><span className="font-medium ml-1">Site Name:</span> {delivery.site?.name || "N/A"}</p>
            </div>
          </section>

          {/* Remarks */}
          <section className="sm:col-span-2 lg:col-span-3 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
              <Clipboard className="h-5 w-5 text-cyan-700" />
              Remarks
            </h3>
            <p className="text-xs sm:text-sm bg-gray-100 p-4 rounded-md text-gray-700 whitespace-pre-wrap">{delivery.remarks || "No remarks provided."}</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestDeliveryDetailsPage;
