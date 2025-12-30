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
    <div className="container mx-auto p-4 max-w-4xl">
      <Button
        variant="ghost"
        className="mb-4 text-cyan-700 hover:text-cyan-800 flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dispatches
      </Button>

      <Card className="shadow-lg border-gray-200 overflow-hidden">
        <CardHeader className="bg-cyan-700 text-white py-4">
          <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <Clipboard className="h-6 w-6" />
            Dispatch Details - {dispatch.refNumber || "N/A"}
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
              <p className="flex items-center gap-1"><span className="font-medium">Activity:</span> {dispatch.approval?.request?.activity?.activity_name || "N/A"}</p>
              <p className="flex items-center gap-1"><span className="font-medium">Reference Number:</span> {dispatch.refNumber || "N/A"}</p>
            </div>
          </section>

          {/* Vehicle Info */}
          <section className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
              {getDispatchedByIcon(dispatch.dispatchedBy)}
              Vehicle & Driver
            </h3>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
              <p className="flex items-center gap-1"><User className="h-4 w-4 text-cyan-700" /><span className="font-medium ml-1">Driver Name:</span> {dispatch.driverName || "N/A"}</p>
              <p className="flex items-center gap-1"><Truck className="h-4 w-4 text-cyan-700" /><span className="font-medium ml-1">Vehicle Number:</span> {dispatch.vehicleNumber || "N/A"}</p>
              <p className="flex items-center gap-1"><Truck className="h-4 w-4 text-cyan-700" /><span className="font-medium ml-1">Vehicle Type:</span> {dispatch.vehicleType || "N/A"}</p>
              <p className="flex items-center gap-1">{getDispatchedByIcon(dispatch.dispatchedBy)}<span className="font-medium ml-1">Dispatched By:</span> {dispatch.dispatchedBy || "N/A"}</p>
            </div>
          </section>

          {/* Dates */}
          <section className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-cyan-700" />
              Timeline
            </h3>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
              <p className="flex items-center gap-1"><Clock className="h-4 w-4 text-cyan-700" /><span className="font-medium ml-1">Dispatched Date:</span> {format(dispatch.dispatchedDate)}</p>
              <p className="flex items-center gap-1"><Clock className="h-4 w-4 text-cyan-700" /><span className="font-medium ml-1">Estimated Arrival:</span> {format(dispatch.estArrivalTime)}</p>
            </div>
          </section>

          {/* Sites */}
          <section className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 sm:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-cyan-700" />
              Locations
            </h3>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
              <p className="flex items-center gap-1"><MapPin className="h-4 w-4 text-cyan-700" /><span className="font-medium ml-1">Departure Site:</span> {dispatch.depatureSite?.name || "N/A"}</p>
              <p className="flex items-center gap-1"><MapPin className="h-4 w-4 text-cyan-700" /><span className="font-medium ml-1">Arrival Site:</span> {dispatch.arrivalSite?.name || "N/A"}</p>
            </div>
          </section>

          {/* Cost and Status */}
          <section className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-cyan-700" />
              Financial & Status
            </h3>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
              <p className="flex items-center gap-1"><DollarSign className="h-4 w-4 text-cyan-700" /><span className="font-medium ml-1">Total Transport Cost:</span> ${dispatch.totalTransportCost.toFixed(2)}</p>
              <p className="flex items-center gap-1"><Badge className={`ml-1 ${getStatusColor(dispatch.status)}`}>{dispatch.status}</Badge></p>
            </div>
          </section>

          {/* Remarks */}
          <section className="sm:col-span-2 lg:col-span-3 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
              <Clipboard className="h-5 w-5 text-cyan-700" />
              Remarks
            </h3>
            <p className="text-xs sm:text-sm bg-gray-100 p-4 rounded-md text-gray-700 whitespace-pre-wrap">{dispatch.remarks || "No remarks provided."}</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default DispatchDetailsPage;