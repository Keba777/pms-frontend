"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMeetingStore } from "@/store/meetingStore";
import { Trash2 } from "lucide-react";

const MeetingsPage = () => {
  const { meetings, addMeeting, removeMeeting } = useMeetingStore();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleAdd = () => {
    if (!title || !date || !time) return;
    addMeeting({ title, date, time });
    setTitle("");
    setDate("");
    setTime("");
  };

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col gap-4 mb-8 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <nav className="mb-2" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <li><Link href="/" className="hover:text-cyan-700 transition-colors">Home</Link></li>
                  <li className="flex items-center space-x-2">
                    <span>/</span>
                    <span className="text-gray-900">Meetings</span>
                  </li>
                </ol>
              </nav>
              <h1 className="text-xl sm:text-2xl font-black text-cyan-800 uppercase tracking-tight">
                Project Meetings
              </h1>
              <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mt-1">
                Schedule and manage team synchronize sessions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200/60 items-end">
            <div className="lg:col-span-1">
              <label className="block text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-1.5 ml-1">Meeting Title</label>
              <input
                type="text"
                placeholder="Brief description..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-11 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-1.5 ml-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-11 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-1.5 ml-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-11 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all outline-none"
              />
            </div>
            <button
              onClick={handleAdd}
              className="h-11 flex items-center justify-center gap-2 px-6 bg-cyan-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-800 transition-all shadow-lg shadow-cyan-100 active:scale-95"
            >
              Add Meeting
            </button>
          </div>
        </div>

        {/* Meeting List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Upcoming Sessions</h3>
            <span className="px-2.5 py-1 bg-cyan-50 text-cyan-700 rounded-lg text-[10px] font-black">{meetings.length} Scheduled</span>
          </div>

          <div className="divide-y divide-gray-50">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex flex-col items-center justify-center border border-gray-100 group-hover:bg-white group-hover:border-cyan-100 transition-colors">
                    <span className="text-[10px] font-black text-cyan-700 uppercase leading-none">{new Date(meeting.date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-lg font-black text-gray-800 leading-tight">{new Date(meeting.date).getDate()}</span>
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-gray-900 group-hover:text-cyan-800 transition-colors">{meeting.title}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {meeting.time}
                      </p>
                      <span className="text-gray-200">•</span>
                      <p className="text-[10px] font-black text-cyan-600/60 uppercase tracking-widest">Team Sync</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => removeMeeting(meeting.id)}
                    className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                    title="Remove Meeting"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
            {meetings.length === 0 && (
              <div className="p-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mb-4 border border-gray-100">
                  <span className="text-2xl text-gray-300">📅</span>
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No meetings scheduled.</p>
                <p className="text-xs font-bold text-gray-300 mt-2 max-w-[180px]">Fill the form above to add a new team session.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingsPage;
