"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useUsers } from "@/hooks/useUsers";
import { Search, MessageSquare, Send } from "lucide-react";

interface Message {
  message_id: string;
  conversation_id: string | null;
  sender_id: string;
  receiver_id: string;
  message_text: string;
  timestamp: string;
  is_read: boolean;
  sender_name: string;
}

interface ConversationMeta {
  user_id: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

/**
 * This represents the raw row from Supabase
 * before we inject the `sender_name` field.
 */
interface SupaMessageRow {
  message_id: string;
  conversation_id: string | null;
  sender_id: string;
  receiver_id: string;
  message_text: string;
  timestamp: string;
  is_read: boolean;
  sender?: {
    first_name: string;
    last_name: string;
  };
}

export default function ProfessionalMessages() {
  const user = useAuthStore((state) => state.user);
  const { data: users, isLoading: loadingUsers } = useUsers();

  const [conversations, setConversations] = useState<
    Record<string, ConversationMeta>
  >({});
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // 1) Load conversation metadata
  const loadConversationsMeta = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("messages")
      .select("sender_id, receiver_id, message_text, timestamp, is_read")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Error loading conversations:", error);
      return;
    }

    const metaMap: Record<string, ConversationMeta> = {};
    data?.forEach((msg) => {
      const partnerId =
        msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

      if (!metaMap[partnerId]) {
        metaMap[partnerId] = {
          user_id: partnerId,
          last_message: msg.message_text,
          last_message_time: msg.timestamp,
          unread_count: msg.receiver_id === user.id && !msg.is_read ? 1 : 0,
        };
      } else if (msg.receiver_id === user.id && !msg.is_read) {
        metaMap[partnerId].unread_count += 1;
      }
    });

    setConversations(metaMap);
  }, [user]);

  useEffect(() => {
    if (user) loadConversationsMeta();
  }, [user, loadConversationsMeta]);

  // 2) Load messages for a given partner
  const loadMessages = useCallback(
    async (partnerId: string) => {
      if (!user) return;
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("messages")
          .select(
            `
            *,
            sender:users!messages_sender_id_fkey(first_name, last_name)
          `
          )
          .or(
            `and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`
          )
          .order("timestamp", { ascending: true });

        if (error) throw error;

        // map with correct typing
        const formatted: Message[] =
          data?.map((row: SupaMessageRow) => ({
            message_id: row.message_id,
            conversation_id: row.conversation_id,
            sender_id: row.sender_id,
            receiver_id: row.receiver_id,
            message_text: row.message_text,
            timestamp: row.timestamp,
            is_read: row.is_read,
            sender_name: row.sender
              ? `${row.sender.first_name} ${row.sender.last_name}`
              : "Unknown",
          })) || [];

        setMessages(formatted);

        // Mark unread as read
        await supabase
          .from("messages")
          .update({ is_read: true })
          .eq("sender_id", partnerId)
          .eq("receiver_id", user.id);

        // Refresh conversation badges
        loadConversationsMeta();
      } catch (err) {
        console.error("Error loading messages:", err);
      } finally {
        setLoading(false);
      }
    },
    [user, loadConversationsMeta]
  );

  useEffect(() => {
    if (selectedConversation) loadMessages(selectedConversation);
  }, [selectedConversation, loadMessages]);

  // 3) Send message with robust conversation upsert/select
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedConversation || !newMessage.trim()) return;

    const [user_min, user_max] = [user.id, selectedConversation].sort();

    let conversation_id: string;
    const { data: upserted, error: upsertErr } = await supabase
      .from("conversations")
      .upsert(
        { user_a: user.id, user_b: selectedConversation },
        { onConflict: "user_min,user_max" }
      )
      .select("conversation_id")
      .single();

    if (upsertErr) {
      const { data: existing, error: selErr } = await supabase
        .from("conversations")
        .select("conversation_id")
        .eq("user_min", user_min)
        .eq("user_max", user_max)
        .single();

      if (selErr || !existing)
        throw selErr || new Error("Could not find conversation");

      conversation_id = existing.conversation_id;
    } else {
      conversation_id = upserted.conversation_id;
    }

    const { error: msgErr } = await supabase.from("messages").insert({
      conversation_id,
      sender_id: user.id,
      receiver_id: selectedConversation,
      message_text: newMessage.trim(),
      is_read: false,
    });
    if (msgErr) throw msgErr;

    setNewMessage("");
    await loadMessages(selectedConversation);

    setTimeout(() => {
      const c = document.querySelector(".messages-container");
      if (c) c.scrollTop = c.scrollHeight;
    }, 50);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const filteredUsers = users
    ? users
        .filter((u) =>
          `${u.first_name} ${u.last_name}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        )
        .sort((a, b) =>
          `${a.first_name} ${a.last_name}`.localeCompare(
            `${b.first_name} ${b.last_name}`
          )
        )
    : [];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-1/4 border-r p-4 bg-white">
        <h2 className="text-xl font-semibold mb-4">Contacts</h2>
        <div className="flex items-center mb-4">
          <Search className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none"
          />
        </div>
        {loadingUsers && (
          <p className="text-center py-4">Loading contacts...</p>
        )}

        <ul className="max-h-[60vh] overflow-y-auto">
          {filteredUsers.map((u) => {
            const m = conversations[u.id];
            return (
              <li
                key={u.id}
                onClick={() => setSelectedConversation(u.id)}
                className={`flex justify-between p-3 mb-2 rounded-lg cursor-pointer hover:bg-gray-100 ${
                  selectedConversation === u.id ? "bg-blue-50" : "bg-white"
                }`}
              >
                <div>
                  <p className="font-medium">
                    {u.first_name} {u.last_name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {m?.last_message || "No messages yet"}
                  </p>
                </div>
                {m?.unread_count ? (
                  <span className="inline-block text-xs bg-blue-500 text-white rounded-full px-2">
                    {m.unread_count}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Chat area */}
      <main className="flex-1 flex flex-col bg-gray-50">
        {selectedConversation ? (
          <>
            <header className="flex items-center justify-between p-4 bg-white border-b">
              <button
                onClick={() => setSelectedConversation(null)}
                className="text-blue-500"
              >
                ← Back
              </button>
              <h3 className="text-lg font-semibold">
                {users?.find((u) => u.id === selectedConversation)?.first_name}{" "}
                {users?.find((u) => u.id === selectedConversation)?.last_name}
              </h3>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 messages-container">
              {loading && <p className="text-center py-4">Loading messages…</p>}
              {!loading && messages.length === 0 && (
                <p className="text-center py-4 text-gray-500">
                  No messages yet.
                </p>
              )}
              {messages.map((m) => {
                const isMine = m.sender_id === user?.id;
                return (
                  <div
                    key={m.message_id}
                    className={`max-w-md p-3 rounded-lg ${
                      isMine
                        ? "ml-auto bg-blue-500 text-white"
                        : "mr-auto bg-white"
                    }`}
                  >
                    {!isMine && (
                      <p className="text-xs font-semibold mb-1">
                        {m.sender_name}
                      </p>
                    )}
                    <p>{m.message_text}</p>
                    <span className="block text-xs opacity-80 mt-1 text-right">
                      {new Date(m.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>

            <form
              onSubmit={sendMessage}
              className="p-4 bg-white border-t flex items-center"
            >
              <textarea
                rows={1}
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none resize-none"
                placeholder="Type a message…"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className={`ml-3 p-2 rounded-full ${
                  newMessage.trim()
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <MessageSquare size={48} />
            <p className="mt-4 text-lg">No conversation selected</p>
            <p>Select a contact to start chatting.</p>
          </div>
        )}
      </main>
    </div>
  );
}
