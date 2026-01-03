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
    <div className="p-4 sm:p-8 bg-background min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col gap-6 mb-8 bg-card p-6 sm:p-10 rounded-[2.5rem] border border-border shadow-xl shadow-black/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div>
              <nav className="mb-4" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                  <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                  <li className="flex items-center space-x-2">
                    <span className="opacity-20">/</span>
                    <span className="text-foreground">Meetings</span>
                  </li>
                </ol>
              </nav>
              <h1 className="text-3xl sm:text-4xl font-black text-primary uppercase tracking-tighter">
                Strategic Synclog
              </h1>
              <p className="text-[10px] sm:text-xs font-black text-muted-foreground/60 uppercase tracking-widest mt-2 flex items-center gap-2">
                <span className="w-8 h-px bg-primary/30" /> Schedule and coordinate operational team sessions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-border relative z-10 items-end">
            <div className="lg:col-span-1">
              <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-2 ml-1">Session Protocol</label>
              <input
                type="text"
                placeholder="Mission parameters..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-12 px-5 py-2 bg-muted/10 border border-primary/10 rounded-xl text-xs font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all underline-offset-4 outline-none placeholder:text-muted-foreground/30"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-2 ml-1">Deployment Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-12 px-5 py-2 bg-muted/10 border border-primary/10 rounded-xl text-xs font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-2 ml-1">Time Marker</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-12 px-5 py-2 bg-muted/10 border border-primary/10 rounded-xl text-xs font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none"
              />
            </div>
            <button
              onClick={handleAdd}
              className="h-12 flex items-center justify-center gap-2 px-8 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95"
            >
              Add Mission
            </button>
          </div>
        </div>

        {/* Meeting List */}
        <div className="bg-card rounded-[2.5rem] border border-border shadow-xl shadow-black/5 overflow-hidden">
          <div className="p-8 pb-4 border-b border-border flex items-center justify-between">
            <h3 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Deployment Queue</h3>
            <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm">
              {meetings.length} SESSIONS ACTIVE
            </span>
          </div>

          <div className="divide-y divide-border">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="py-6 px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-primary/5 transition-all group relative border-l-4 border-transparent hover:border-primary active:scale-[0.995]"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-muted/20 rounded-2xl flex flex-col items-center justify-center border border-border group-hover:bg-card group-hover:border-primary/20 transition-all shadow-inner">
                    <span className="text-[10px] font-black text-primary uppercase leading-none tracking-tighter">{new Date(meeting.date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-2xl font-black text-foreground leading-tight mt-0.5">{new Date(meeting.date).getDate()}</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-foreground group-hover:text-primary transition-colors tracking-tight">{meeting.title}</h2>
                    <div className="flex items-center gap-3 mt-1.5 px-0.5">
                      <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                        {meeting.time}
                      </p>
                      <span className="w-1 h-1 bg-primary/30 rounded-full" />
                      <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Operational Sync</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => removeMeeting(meeting.id)}
                    className="p-3 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all active:scale-90 border border-transparent hover:border-destructive/20"
                    title="Terminate Session"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
            {meetings.length === 0 && (
              <div className="p-24 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-muted/20 rounded-[2.5rem] flex items-center justify-center mb-6 border border-border shadow-xl shadow-black/5">
                  <span className="text-4xl filter grayscale opacity-40">📅</span>
                </div>
                <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.25em]">No Missions Scheduled</p>
                <p className="text-xs font-bold text-muted-foreground/20 mt-3 max-w-[220px] italic">Utilize the protocol interface above to schedule new team synchronization operations.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingsPage;
