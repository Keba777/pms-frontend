"use client";

import React, { useState } from "react";
import { useMeetingStore } from "@/store/meetingStore";

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
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold text-cyan-700 mb-4 text-center">
          My Meetings
        </h1>

        <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-3">
          <input
            type="text"
            placeholder="Meeting Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border px-3 py-2 rounded-md border-cyan-700"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border px-3 py-2 rounded-md border-cyan-700"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="border px-3 py-2 rounded-md border-cyan-700"
          />
        </div>

        <button
          onClick={handleAdd}
          className="w-full bg-cyan-700 text-white py-2 rounded-md hover:bg-cyan-800 mb-4"
        >
          Add Meeting
        </button>

        <ul className="space-y-3">
          {meetings.map((meeting) => (
            <li
              key={meeting.id}
              className="bg-gray-100 p-3 rounded-md flex justify-between items-center border border-gray-200"
            >
              <div>
                <h2 className="font-semibold">{meeting.title}</h2>
                <p className="text-sm text-gray-600">
                  {meeting.date} at {meeting.time}
                </p>
              </div>
              <button
                onClick={() => removeMeeting(meeting.id)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </li>
          ))}
          {meetings.length === 0 && (
            <p className="text-center text-gray-400">No meetings scheduled.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default MeetingsPage;
