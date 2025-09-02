"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useUsers } from "@/hooks/useUsers";
import { Search, MessageSquare, Send, Paperclip } from "lucide-react";

interface Message {
  message_id: string;
  conversation_id: string | null;
  sender_id: string;
  receiver_id: string;
  message_text: string;
  timestamp: string;
  is_read: boolean;
  sender_name: string;
  attachment_path: string | null;
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
  attachment_path: string | null;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1) Load conversation metadata
  const loadConversationsMeta = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("messages")
      .select("sender_id, receiver_id, message_text, timestamp, is_read, attachment_path")
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
          last_message: msg.message_text || (msg.attachment_path ? "Attachment" : ""),
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
            attachment_path: row.attachment_path,
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
    if (!user || !selectedConversation || (!newMessage.trim() && !selectedFile)) return;

    let conversation_id: string;

    // First, try to find existing conversation
    const { data: existing, error: selErr } = await supabase
      .from("conversations")
      .select("conversation_id")
      .or(
        `and(user_a.eq.${user.id},user_b.eq.${selectedConversation}),and(user_a.eq.${selectedConversation},user_b.eq.${user.id})`
      );

    if (selErr) {
      console.error("Error selecting conversation:", selErr);
      return;
    }

    if (existing && existing.length > 0) {
      conversation_id = existing[0].conversation_id;
    } else {
      // Insert new conversation with authenticated user as user_a
      const { data: inserted, error: insErr } = await supabase
        .from("conversations")
        .insert({
          user_a: user.id,
          user_b: selectedConversation,
        })
        .select("conversation_id")
        .single();

      if (insErr) {
        console.error("Error inserting conversation:", insErr);
        return;
      }

      conversation_id = inserted.conversation_id;
    }

    let attachment_path: string | null = null;
    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop() || '';
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, selectedFile);

      if (uploadErr) {
        console.error("Error uploading file:", uploadErr);
        return;
      }
      attachment_path = uploadData.path;
    }

    const { error: msgErr } = await supabase.from("messages").insert({
      conversation_id,
      sender_id: user.id,
      receiver_id: selectedConversation,
      message_text: newMessage.trim() || '', // Ensure message_text is not null
      is_read: false,
      attachment_path,
    });
    if (msgErr) {
      console.error("Error sending message:", msgErr);
      return;
    }

    setNewMessage("");
    setSelectedFile(null);
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
                const attachmentUrl = m.attachment_path
                  ? supabase.storage.from('chat-attachments').getPublicUrl(m.attachment_path).data.publicUrl
                  : null;
                const isImage = attachmentUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(m.attachment_path ?? "");
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
                    {m.message_text && <p>{m.message_text}</p>}
                    {attachmentUrl && (
                      <>
                        {isImage ? (
                          <img
                            src={attachmentUrl}
                            alt="Attachment"
                            className="max-w-full rounded mt-2"
                          />
                        ) : (
                          <a
                            href={attachmentUrl}
                            download
                            className="text-blue-300 underline mt-2 block"
                          >
                            Download attachment: {m.attachment_path? m.attachment_path.split('/').pop(): ""}
                          </a>
                        )}
                      </>
                    )}
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
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mr-2 p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
              >
                <Paperclip size={18} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="hidden"
              />
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
                disabled={!newMessage.trim() && !selectedFile}
                className={`ml-3 p-2 rounded-full ${
                  newMessage.trim() || selectedFile
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