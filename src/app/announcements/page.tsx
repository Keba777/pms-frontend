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
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col transition-all hover:shadow-xl hover:shadow-cyan-100/50 hover:-translate-y-1 relative group overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-50 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-cyan-100 transition-colors" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-700 shadow-sm">
            <Bell className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight line-clamp-1">{a.title}</h3>
        </div>
        <button
          onClick={() => remove(a.id)}
          className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-grow mb-6 relative z-10">
        <p className="text-xs font-bold text-gray-500 leading-relaxed">{a.content}</p>
      </div>

      <div className="pt-4 border-t border-gray-50 flex items-center justify-between relative z-10">
        <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
          <span>{a.date}</span>
        </div>
        <div className="px-2 py-0.5 bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-tighter rounded-md">
          Important
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
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col gap-4 mb-8 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <nav className="mb-2" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <li><Link href="/" className="hover:text-cyan-700 transition-colors">Home</Link></li>
                  <li className="flex items-center space-x-2">
                    <span>/</span>
                    <span className="text-gray-900">Announcements</span>
                  </li>
                </ol>
              </nav>
              <h1 className="text-xl sm:text-2xl font-black text-cyan-800 uppercase tracking-tight">
                Project Updates
              </h1>
              <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mt-1">
                Manage and broadcast site announcements
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4 border-t border-gray-200/60 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
              <div className="lg:col-span-1">
                <label className="block text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-1.5 ml-1">Title</label>
                <input
                  type="text"
                  placeholder="Subject of update..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-11 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all outline-none"
                />
              </div>
              <div className="lg:col-span-1">
                <label className="block text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-1.5 ml-1">Pin Until</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-11 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all outline-none"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-2">
                <label className="block text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-1.5 ml-1">Detailed Content</label>
                <textarea
                  placeholder="Explain the update in detail..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full min-h-[44px] max-h-32 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-8 py-3 bg-cyan-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-800 transition-all shadow-lg shadow-cyan-100 active:scale-95 group"
              >
                <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                Post Announcement
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
            <div className="sm:col-span-2 lg:col-span-3 p-16 flex flex-col items-center justify-center text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-white rounded-[2.5rem] flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quiet on the front</p>
              <p className="text-xs font-bold text-gray-300 mt-2 max-w-[220px] leading-relaxed">No active announcements. Use the panel above to broadcast important updates.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
