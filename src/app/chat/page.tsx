"use client";

import { RealtimeChat } from "@/components/realtime-chat";
import { useAuthStore } from "@/store/authStore";

export default function ChatPage() {
  const { user } = useAuthStore();

  return (
    <RealtimeChat
      roomName="my-chat-room"
      username={user?.first_name || "Guest"}
    />
  );
}
