"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Bell, Calendar, XCircle, PlusCircle } from "lucide-react";

// Announcement type
// Using numeric IDs for compatibility
type Announcement = {
  id: number;
  title: string;
  date: string;
  content: string;
  createdAt: number;
};

// Zustand store for announcements with persistence
interface AnnouncementState {
  announcements: Announcement[];
  addAnnouncement: (title: string, date: string, content: string) => void;
  removeAnnouncement: (id: number) => void;
  clearExpired: () => void;
  loadDummy: () => void;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const useAnnouncementStore = create<AnnouncementState>()(
  persist(
    (set, get) => ({
      announcements: [],
      addAnnouncement: (title, date, content) => {
        const newId = get().announcements.length
          ? Math.max(...get().announcements.map((a) => a.id)) + 1
          : 1;
        const a: Announcement = {
          id: newId,
          title,
          date,
          content,
          createdAt: Date.now(),
        };
        set((state) => ({ announcements: [a, ...state.announcements] }));
      },
      removeAnnouncement: (id) =>
        set((state) => ({
          announcements: state.announcements.filter((a) => a.id !== id),
        })),
      clearExpired: () => {
        const now = Date.now();
        set((state) => ({
          announcements: state.announcements.filter(
            (a) => now - a.createdAt <= SEVEN_DAYS_MS
          ),
        }));
      },
      loadDummy: () => {
        const now = Date.now();
        set({
          announcements: [
            {
              id: 1,
              title: "Safety Drill Scheduled",
              date: "2025-05-12",
              content:
                "All site workers assemble at 9:00 AM for a mandatory safety drill.",
              createdAt: now,
            },
            {
              id: 2,
              title: "Material Delivery",
              date: "2025-05-10",
              content: "300 bags of cement arrive onsite by 4:00 PM today.",
              createdAt: now - 2 * 24 * 60 * 60 * 1000,
            },
            {
              id: 3,
              title: "Team Meeting",
              date: "2025-05-08",
              content:
                "Project leads meeting at HQ conference room at 2:00 PM.",
              createdAt: now - 4 * 24 * 60 * 60 * 1000,
            },
          ],
        });
      },
    }),
    { name: "announcements-storage" }
  )
);

// Announcement Card
const AnnouncementCard: React.FC<{ a: Announcement }> = ({ a }) => {
  const remove = useAnnouncementStore((state) => state.removeAnnouncement);

  return (
    <div className="bg-card rounded-[2.5rem] border border-border p-8 flex flex-col transition-all hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 relative group overflow-hidden active:scale-[0.98]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-[1.25rem] flex items-center justify-center text-primary shadow-sm border border-primary/20">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-foreground uppercase tracking-tight line-clamp-1">{a.title}</h3>
        </div>
        <button
          onClick={() => remove(a.id)}
          className="p-3 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all active:scale-90 border border-transparent hover:border-destructive/20"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-grow mb-8 relative z-10">
        <p className="text-sm font-bold text-muted-foreground/60 leading-relaxed">{a.content}</p>
      </div>

      <div className="pt-6 border-t border-border flex items-center justify-between relative z-10">
        <div className="flex items-center text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
          < Calendar className="w-3.5 h-3.5 mr-2 text-primary/40" />
          <span>{a.date}</span>
        </div>
        <div className="px-3 py-1 bg-muted/20 text-[8px] font-black text-primary border border-primary/10 uppercase tracking-widest rounded-full shadow-inner">
          IMPORTANT CORE
        </div>
      </div>
    </div>
  );
};

// Announcements Page
export default function AnnouncementsPage() {
  const { announcements, loadDummy, clearExpired, addAnnouncement } =
    useAnnouncementStore();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    loadDummy();
    clearExpired();
  }, [loadDummy, clearExpired]);

  const handleAdd = () => {
    if (!title || !date || !content) return;
    addAnnouncement(title, date, content);
    setTitle("");
    setDate("");
    setContent("");
  };

  return (
    <div className="p-4 sm:p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col gap-6 mb-12 bg-card p-6 sm:p-12 rounded-[3.5rem] border border-border shadow-2xl shadow-black/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-[100px] pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div>
              <nav className="mb-6" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                  <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                  <li className="flex items-center space-x-2">
                    <span className="opacity-20">/</span>
                    <span className="text-foreground">Announcements</span>
                  </li>
                </ol>
              </nav>
              <h1 className="text-4xl sm:text-5xl font-black text-primary uppercase tracking-tighter">
                Global Directives
              </h1>
              <p className="text-[10px] sm:text-xs font-black text-muted-foreground/60 uppercase tracking-[0.3em] mt-3 flex items-center gap-3">
                <span className="w-12 h-px bg-primary/30" /> Command and control site communications
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-8 pt-10 border-t border-border relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
              <div className="lg:col-span-1">
                <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-3 ml-1">Subject Label</label>
                <input
                  type="text"
                  placeholder="Primary update identifier..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-14 px-6 py-2 bg-muted/10 border border-primary/10 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none placeholder:text-muted-foreground/30"
                />
              </div>
              <div className="lg:col-span-1">
                <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-3 ml-1">Status Duration</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-14 px-6 py-2 bg-muted/10 border border-primary/10 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-2">
                <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-3 ml-1">Mission Intelligence</label>
                <textarea
                  placeholder="Elaborate on the directive protocols..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full min-h-[56px] h-14 max-h-40 px-6 py-4 bg-muted/10 border border-primary/10 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none resize-none placeholder:text-muted-foreground/30"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleAdd}
                className="flex items-center gap-3 px-12 py-4 bg-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20 active:scale-95 group"
              >
                <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                Broadcast Directive
              </button>
            </div>
          </div>
        </div>

        {/* Announcement Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((a) => (
            <AnnouncementCard key={a.id} a={a} />
          ))}
          {announcements.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3 py-32 flex flex-col items-center justify-center text-center bg-muted/5 rounded-[4rem] border border-dashed border-border/40">
              <div className="w-24 h-24 bg-card rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-black/5 border border-border">
                <Bell className="w-10 h-10 text-primary/20" />
              </div>
              <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">Quiet on the communication front</p>
              <p className="text-xs font-bold text-muted-foreground/20 mt-4 max-w-[280px] leading-relaxed italic">No active directives found. Use the override panel above to broadcast critical operational intelligence.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
