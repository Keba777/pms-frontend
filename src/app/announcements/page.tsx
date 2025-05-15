"use client";

import React, { useState, useEffect } from "react";
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
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 flex flex-col transition hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-cyan-700">
          <Bell className="w-6 h-6" />
          <h3 className="text-lg font-semibold">{a.title}</h3>
        </div>
        <button
          onClick={() => remove(a.id)}
          className="text-gray-400 hover:text-red-500"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-3 flex-grow">{a.content}</p>
      <div className="mt-auto flex items-center text-gray-500 text-xs">
        <Calendar className="w-4 h-4 mr-1" />
        <span>{a.date}</span>
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-cyan-700">
            Raycon - Announcements
          </h1>
          <p className="text-gray-600 mt-1">Manage and post project updates</p>
        </header>

        {/* Add Announcement Form */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold text-cyan-700 mb-4 flex items-center gap-2">
            <PlusCircle className="w-6 h-6" /> Add Announcement
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-gray-300 p-2 rounded"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 p-2 rounded"
            />
            <textarea
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="border border-gray-300 p-2 rounded md:col-span-3"
            />
          </div>
          <button
            onClick={handleAdd}
            className="mt-4 px-6 py-2 bg-cyan-700 text-white rounded-lg hover:bg-cyan-800"
          >
            Post
          </button>
        </div>

        {/* Announcement Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((a) => (
            <AnnouncementCard key={a.id} a={a} />
          ))}
        </div>
      </div>
    </div>
  );
}
