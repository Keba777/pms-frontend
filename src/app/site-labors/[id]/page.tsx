"use client";

import React from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import avatar from "@/../public/images/user.png";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, Hash, Clipboard } from "lucide-react";
import { useLabors } from "@/hooks/useLabors";
import { getDuration } from "@/utils/helper";
import { LaborInformation } from "@/types/laborInformation";

// Client-side Labor Details page using next/navigation router & shadcn/ui components
// Route expectation: /site-labors/[id]

export default function LaborDetailsPageClient() {
  const params = useParams();
  const laborId = params?.id as string | undefined;
  const router = useRouter();

  const { data: labors, isLoading, error } = useLabors();

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-5xl">
        <Skeleton className="h-10 w-32 mb-4" />
        <Card className="shadow-lg border-gray-200">
          <CardHeader className="bg-cyan-700 text-white">
            <Skeleton className="h-8 w-64" />
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
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return <div className="flex justify-center items-center h-48 text-red-500">Error loading labor details.</div>;
  }

  const labor = labors?.find((l) => String(l.id) === String(laborId));

  if (!labor) {
    return <div className="container mx-auto p-4 text-gray-700">Labor not found.</div>;
  }

  // Helper for badge color
  const statusClass = (s?: string) =>
    s === "Allocated" ? "bg-cyan-700 text-white" : "bg-gray-100 text-gray-800";

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="mb-4">
        <Button variant="ghost" className="text-cyan-700 hover:text-cyan-800 flex items-center gap-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      <Card className="overflow-hidden shadow">
        <CardHeader className="bg-cyan-700 text-white py-4 px-6">
          <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
            <Hash className="h-5 w-5" />
            {labor.role} — Details
          </CardTitle>
        </CardHeader>

        <CardContent className="bg-gray-100 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Role summary */}
            <section className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-50 ring-2 ring-cyan-700">
                  <Image src={labor.laborInformations?.[0]?.profile_picture || avatar} alt={labor.role} width={80} height={80} className="object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{labor.role}</h3>
                  <p className="text-sm text-gray-600 mt-1">Unit: <span className="font-medium">{labor.unit || '-'}</span></p>
                  <div className="mt-2">
                    <Badge className={statusClass(labor.allocationStatus)}>{labor.allocationStatus || 'Unallocated'}</Badge>
                  </div>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-700">
                <div>
                  <dt className="text-xs text-gray-500">Quantity</dt>
                  <dd className="font-medium">{labor.quantity}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Min Qty</dt>
                  <dd className="font-medium">{labor.minQuantity}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Est Hours</dt>
                  <dd className="font-medium">{labor.estimatedHours ?? '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Rate</dt>
                  <dd className="font-medium">{labor.rate ?? '-'}</dd>
                </div>
              </dl>
            </section>

            {/* Middle: Allocation list */}
            <section className="lg:col-span-2">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
                <h4 className="text-base font-semibold text-gray-800 flex items-center gap-2"><Clipboard className="h-5 w-5 text-cyan-700" /> Allocations</h4>

                <div className="mt-3 space-y-3">
                  {(labor.laborInformations || []).map((info: LaborInformation) => (
                    <div key={info.id} className="flex items-center justify-between p-3 rounded-md border border-gray-100 bg-white">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-50">
                          <Image src={(info as any).profile_picture || avatar} alt={`${info.firstName} ${info.lastName}`} width={48} height={48} className="object-cover" />
                        </div>
                        <div>
                          {/* Use router.push on click and include laborInformation id in path.
                              Link text shows labor role + labour person's name as requested. */}
                          <button onClick={() => router.push(`/site-labors/${labor.id}/info/${info.id}`)} className="text-left">
                            <div className="text-sm font-semibold text-gray-800">{labor.role} — {info.firstName} {info.lastName}</div>
                            <div className="text-xs text-gray-500">{info.position || '-'} • {info.terms || '-'}</div>
                          </button>
                        </div>
                      </div>

                      <div className="text-right text-sm text-gray-600">
                        <div>{info.startsAt ? new Date(info.startsAt).toLocaleDateString() : '-'}</div>
                        <div className="mt-1 text-xs text-gray-500">{info.endsAt ? new Date(info.endsAt).toLocaleDateString() : '-'}</div>
                        <div className="mt-2">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${info.status === 'Allocated' ? 'bg-cyan-700 text-white' : 'bg-gray-100 text-gray-800'}`}>
                            {info.status || 'Unallocated'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h4 className="text-base font-semibold text-gray-800 mb-2">Timeline</h4>
                <ol className="space-y-3">
                  {(labor.laborInformations || []).map((info: LaborInformation, idx: number) => (
                    <li key={info.id} className="flex items-start gap-3">
                      <div className={`flex-none w-8 h-8 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-cyan-700 text-white' : 'bg-gray-200 text-gray-700'}`}>{idx + 1}</div>
                      <div className="flex-1 text-sm text-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{info.firstName} {info.lastName}</div>
                          <div className="text-xs text-gray-500">{info.startsAt ? new Date(info.startsAt).toLocaleDateString() : '-'} — {info.endsAt ? new Date(info.endsAt).toLocaleDateString() : '-'}</div>
                        </div>
                        <div className="mt-1 text-xs text-gray-600">Duration: {info.startsAt && info.endsAt ? getDuration(info.startsAt, info.endsAt) : '-'}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
