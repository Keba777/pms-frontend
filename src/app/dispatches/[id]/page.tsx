"use client";

import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Truck, User, DollarSign, MapPin, Clipboard, Clock, Hash, Plane, ShieldCheck, Activity } from "lucide-react";
import { useDispatch } from "@/hooks/useDispatches";
import { formatDate as format } from "@/utils/dateUtils";

const DispatchDetailsPage = () => {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { data: dispatch, isLoading, error } = useDispatch(id);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-8 bg-background min-h-screen">
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-10 w-32 rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-[3.5rem]" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Skeleton className="h-48 rounded-[2.5rem]" />
            <Skeleton className="h-48 rounded-[2.5rem]" />
            <Skeleton className="h-48 rounded-[2.5rem]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !dispatch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-destructive p-12 text-center flex-col gap-4">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck size={32} />
        </div>
        <p className="font-black uppercase tracking-widest">Protocol Sync Failure</p>
        <p className="text-muted-foreground max-w-xs">The requested dispatch unit could not be located in the central registry.</p>
        <Button onClick={() => router.back()} className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl px-8 py-6 text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/20">
          Return to Registry
        </Button>
      </div>
    );
  }

  const getDispatchedByIcon = (mode: string | undefined) => {
    if (mode === "Plane") return <Plane className="h-6 w-6 text-primary" />;
    return <Truck className="h-6 w-6 text-primary" />;
  };

  return (
    <div className="p-4 sm:p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-card p-6 sm:p-12 rounded-[3.5rem] border border-border shadow-2xl shadow-black/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-[100px] pointer-events-none" />
          <div className="flex items-center gap-8 relative z-10 w-full sm:w-auto">
            <button
              onClick={() => router.back()}
              className="p-4 bg-muted/20 hover:bg-muted/30 rounded-2xl transition-all border border-border text-muted-foreground hover:text-primary shadow-sm group"
            >
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-primary uppercase tracking-tighter">
                Dispatch Protocol
              </h1>
              <p className="text-[10px] sm:text-xs font-black text-muted-foreground/60 uppercase tracking-[0.3em] mt-3 flex items-center gap-3">
                <Hash className="w-4 h-4 text-primary/40" />
                Ref: {dispatch.refNumber || "UNIT-N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 relative z-10 w-full sm:w-auto justify-end">
            <Badge className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-xl ${dispatch.status === 'Delivered' ? 'bg-primary/10 text-primary border-primary/20' :
                dispatch.status === 'Cancelled' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                  dispatch.status === 'In Transit' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                    'bg-amber-500/10 text-amber-500 border-amber-500/20'
              }`}>
              {dispatch.status} Protocol
            </Badge>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section className="bg-card rounded-[3.5rem] border border-border p-8 sm:p-12 shadow-2xl shadow-black/5">
              <h2 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
                <Truck className="w-4 h-4 text-primary" />
                Transport Vector Analysis
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest pl-2">Assigned Operator</p>
                  <div className="flex items-center gap-4 bg-muted/10 p-6 rounded-2xl border border-border">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-xl shadow-inner">
                      {dispatch.driverName?.[0] || '?'}
                    </div>
                    <p className="text-sm font-black text-foreground uppercase tracking-tight">
                      {dispatch.driverName || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest pl-2">Vehicle Core ID</p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-muted/10 p-6 rounded-2xl border border-border">
                      <Hash className="w-6 h-6 text-primary/40" />
                      <p className="text-sm font-black text-foreground uppercase tracking-tight">{dispatch.vehicleNumber || "N/A"}</p>
                    </div>
                    <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] flex items-center gap-2 pl-4">
                      <Truck size={14} /> {dispatch.vehicleType || "GENERIC UNIT"}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest pl-2">Transport Mode</p>
                  <div className="flex items-center gap-4 bg-muted/10 p-6 rounded-2xl border border-border">
                    {getDispatchedByIcon(dispatch.dispatchedBy)}
                    <p className="text-sm font-black text-foreground uppercase tracking-tight">{dispatch.dispatchedBy || "N/A"}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest pl-2">Quantum Transport Cost</p>
                  <div className="flex items-center justify-center bg-primary/5 p-8 rounded-[2rem] border border-primary/10 shadow-inner group">
                    <span className="text-4xl font-black text-primary tracking-tighter group-hover:scale-110 transition-transform">
                      ${dispatch.totalTransportCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-card rounded-[3.5rem] border border-border p-8 sm:p-12 shadow-2xl shadow-black/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <MapPin size={120} />
              </div>
              <h2 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary" />
                Geospatial Route
              </h2>
              <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative">
                <div className="w-full md:w-1/2 space-y-4 border-l-4 border-primary/20 pl-8">
                  <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Departure Node</p>
                  <p className="text-xl font-black text-foreground uppercase tracking-tighter">
                    {dispatch.depatureSite?.name || "N/A"}
                  </p>
                </div>
                <div className="hidden md:flex flex-1 items-center justify-center">
                  <div className="w-full h-px bg-border relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-background border border-border rounded-full shadow-inner animate-pulse">
                      <Truck className="text-primary w-6 h-6" />
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-1/2 space-y-4 border-r-4 border-primary/20 pr-8 text-right flex flex-col items-end">
                  <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Arrival Target</p>
                  <p className="text-xl font-black text-primary uppercase tracking-tighter">
                    {dispatch.arrivalSite?.name || "N/A"}
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-card rounded-[3.5rem] border border-border p-8 sm:p-12 shadow-2xl shadow-black/5">
              <h2 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                <Clipboard className="w-4 h-4 text-primary" />
                Dispatch Narrative
              </h2>
              <div className="bg-muted/10 p-10 rounded-[2.5rem] border border-border shadow-inner">
                <p className="text-sm text-foreground/80 leading-relaxed italic whitespace-pre-wrap font-medium">
                  "{dispatch.remarks || "No supplementary telemetry data provided for this unit."}"
                </p>
              </div>
            </section>
          </div>

          <div className="space-y-12">
            <section className="bg-card rounded-[3.5rem] border border-border p-10 shadow-2xl shadow-black/5">
              <h2 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
                <Calendar className="w-4 h-4 text-primary" />
                Temporal Workflow
              </h2>
              <div className="space-y-12 relative px-4">
                <div className="absolute left-9 top-4 bottom-4 w-px bg-border/50" />

                <div className="flex gap-8 relative z-10 group">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-xl">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1">Instantiation</p>
                    <p className="text-sm font-black text-foreground uppercase">{format(dispatch.dispatchedDate)}</p>
                  </div>
                </div>

                <div className="flex gap-8 relative z-10 group">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-xl">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1">Target Sync</p>
                    <p className="text-sm font-black text-primary uppercase tracking-tight">{format(dispatch.estArrivalTime)}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-card rounded-[3.5rem] border border-border p-10 shadow-2xl shadow-black/5 group hover:border-primary/30 transition-all">
              <h2 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                <Activity className="w-4 h-4 text-primary" />
                Associated Protocol
              </h2>
              <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 shadow-inner group-hover:bg-primary/10 transition-colors">
                <p className="text-[8px] font-black text-primary/40 uppercase tracking-[0.3em] mb-4">Activity Stream</p>
                <p className="text-sm font-black text-primary leading-relaxed uppercase tracking-tight">
                  {dispatch.approval?.request?.activity?.activity_name || "NOT_RESTRICTED_UNIT"}
                </p>
              </div>
            </section>

            <div className="p-10 bg-primary rounded-[3rem] text-primary-foreground shadow-2xl shadow-primary/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none group-hover:bg-white/20 transition-all" />
              <Truck className="w-16 h-16 text-white/10 mb-6 relative z-10" />
              <h3 className="text-2xl font-black uppercase tracking-tight mb-4 relative z-10">Unit Summary</h3>
              <p className="text-xs text-white/70 leading-relaxed mb-8 relative z-10 font-medium">
                The logistical telemetry for this dispatch unit has been verified across multiple secure channels and target sites.
              </p>
              <div className="flex items-center gap-3 px-6 py-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 relative z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground animate-pulse shadow-[0_0_10px_white]"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary-foreground">Status: Synchronized</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispatchDetailsPage;