"use client";

import React, { useEffect } from "react";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/hooks/useNotifications";
import { Bell } from "lucide-react";

const NotificationPage = () => {
  const { data: notifications = [], isLoading, error } = useNotifications();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  useEffect(() => {
    if (error) {
      console.error("Failed to load notifications:", error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-card shadow-2xl shadow-black/5 rounded-[2.5rem] border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-10 py-8 bg-primary/5 border-b border-border">
          <div>
            <h1 className="text-3xl font-black text-primary uppercase tracking-tighter">Signal Intake</h1>
            <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mt-1">Intelligence feed & alerts</p>
          </div>
          <button
            onClick={() => markAllAsReadMutation.mutate()}
            className="px-6 py-2.5 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            Clear All
          </button>
        </div>

        {/* List */}
        <div className="divide-y divide-border">
          {isLoading ? (
            <div className="p-20 text-center">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Synchronizing signals...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-muted/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl border border-border">
                <Bell className="text-primary/20" size={40} />
              </div>
              <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">Channel silent</p>
              <p className="text-xs font-bold text-muted-foreground/20 mt-4 italic">No active priority signals detected.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`flex justify-between items-center px-10 py-6 transition-colors hover:bg-primary/5 group ${n.read ? "bg-card" : "bg-primary/5 active-signal"
                  }`}
              >
                <div className="flex items-start gap-6">
                  <div className={`mt-1 h-3 w-3 rounded-full transition-all ${!n.read ? "bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]" : "bg-muted/30"}`} />
                  <div>
                    <h2 className="text-sm font-black text-foreground uppercase tracking-tight mb-1">{n.type}</h2>
                    {n.data && (
                      <p className="text-xs font-bold text-muted-foreground/60 line-clamp-2 max-w-xl">
                        {typeof n.data === 'string' ? n.data : JSON.stringify(n.data)}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest">
                        {new Date(n.createdAt!).toLocaleString()}
                      </span>
                      <span className="w-1 h-1 bg-muted/20 rounded-full" />
                      <span className="text-[8px] font-black text-primary/40 uppercase tracking-widest">Protocol V7</span>
                    </div>
                  </div>
                </div>
                {!n.read && (
                  <button
                    onClick={() => markAsReadMutation.mutate(n.id!)}
                    className="px-6 py-2 bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 opacity-0 group-hover:opacity-100"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
