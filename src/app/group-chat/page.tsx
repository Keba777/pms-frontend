"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { User } from "@/types/user";
import { Search, MessageSquare, Send, Plus, Trash2, UserX } from "lucide-react";
import Image from "next/image";

interface Group {
  id: string;
  name: string;
  owner_id: string;
  last_message?: string;
  last_message_time?: string;
}

type GroupMember = Pick<
  User,
  "id" | "first_name" | "last_name" | "profile_picture"
>;

interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  message_text: string;
  created_at: string;
  sender: GroupMember;
}

export default function GroupChat() {
  const user = useAuthStore((state) => state.user);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [creatingNewGroup, setCreatingNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<GroupMember[]>([]);

  // Load all users
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, first_name, last_name, profile_picture");

      if (!error && data) {
        setAllUsers(data as GroupMember[]);
      }
    };

    fetchUsers();
  }, []);

  // FIXED: Correctly load user's groups without duplicates
  const loadUserGroups = useCallback(async () => {
    if (!user) return;

    // First get distinct group IDs the user belongs to
    const { data: membershipData, error: membershipError } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user.id);

    if (membershipError || !membershipData) {
      console.error("Error loading group memberships:", membershipError);
      setGroups([]);
      return;
    }

    const groupIds = membershipData.map((m) => m.group_id);
    if (groupIds.length === 0) {
      setGroups([]);
      return;
    }

    // Then get the groups
    const { data: groupsData, error: groupsError } = await supabase
      .from("groups")
      .select("id, name, owner_id")
      .in("id", groupIds);

    if (groupsError || !groupsData) {
      console.error("Error loading groups:", groupsError);
      setGroups([]);
      return;
    }

    // Get last messages for these groups
    const { data: lastMessages } = await supabase
      .from("group_messages")
      .select("group_id, message_text, created_at")
      .in("group_id", groupIds)
      .order("created_at", { ascending: false });

    const lastMessageMap = new Map<
      string,
      { message_text: string; created_at: string }
    >();
    lastMessages?.forEach((msg) => {
      if (msg.group_id && !lastMessageMap.has(msg.group_id)) {
        lastMessageMap.set(msg.group_id, {
          message_text: msg.message_text || "",
          created_at: msg.created_at,
        });
      }
    });

    // Map groups with their last message
    const groupsWithMessages: Group[] = groupsData.map((group) => ({
      id: group.id,
      name: group.name,
      owner_id: group.owner_id,
      last_message: lastMessageMap.get(group.id)?.message_text,
      last_message_time: lastMessageMap.get(group.id)?.created_at,
    }));

    setGroups(groupsWithMessages);
  }, [user]);

  useEffect(() => {
    if (user) loadUserGroups();
  }, [user, loadUserGroups]);

  // Load group members
  const loadGroupMembers = useCallback(async (groupId: string) => {
    const { data, error } = await supabase
      .from("group_members")
      .select("user_id, users(id, first_name, last_name, profile_picture)")
      .eq("group_id", groupId);

    if (error) {
      console.error("Error loading group members:", error);
      return;
    }

    const members: GroupMember[] = data.map((m) => {
      const userObj = Array.isArray(m.users) ? m.users[0] : m.users;
      return {
        id: m.user_id,
        first_name: userObj?.first_name || "",
        last_name: userObj?.last_name || "",
        profile_picture: userObj?.profile_picture || "",
      };
    });

    setGroupMembers(members);
  }, []);

  // Load group messages
  const loadGroupMessages = useCallback(async (groupId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("group_messages")
        .select(
          `
          id,
          group_id,
          sender_id,
          message_text,
          created_at,
          users!group_messages_sender_id_fkey(id, first_name, last_name, profile_picture)
        `
        )
        .eq("group_id", groupId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const formatted: GroupMessage[] = data.map((msg) => {
        const msgObj = Array.isArray(msg.users) ? msg.users[0] : msg.users;
        return {
          id: msg.id,
          group_id: msg.group_id,
          sender_id: msg.sender_id,
          message_text: msg.message_text,
          created_at: msg.created_at,
          sender: {
            id: msgObj?.id || "",
            first_name: msgObj?.first_name || "Unknown",
            last_name: msgObj?.last_name || "",
            profile_picture: msgObj?.profile_picture || "",
          },
        };
      });

      setMessages(formatted);
    } catch (err) {
      console.error("Error loading group messages:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle group selection
  useEffect(() => {
    if (selectedGroup) {
      loadGroupMembers(selectedGroup.id);
      loadGroupMessages(selectedGroup.id);
    } else {
      setMessages([]);
      setGroupMembers([]);
    }
  }, [selectedGroup, loadGroupMembers, loadGroupMessages]);

  // Send message to group
  const sendGroupMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedGroup || !newMessage.trim()) return;

    const { error } = await supabase.from("group_messages").insert({
      group_id: selectedGroup.id,
      sender_id: user.id,
      message_text: newMessage.trim(),
    });

    if (error) {
      console.error("Error sending message:", error);
      return;
    }

    setNewMessage("");
    await loadGroupMessages(selectedGroup.id);
    await loadUserGroups();

    // Scroll to bottom
    setTimeout(() => {
      const container = document.querySelector(".messages-container");
      if (container) container.scrollTop = container.scrollHeight;
    }, 100);
  };

  // Create new group
  const createNewGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newGroupName.trim() || selectedUsers.length === 0) return;

    // Create group with creator as owner
    const { data: groupData, error: groupError } = await supabase
      .from("groups")
      .insert({
        name: newGroupName.trim(),
        owner_id: user.id,
      })
      .select("id")
      .single();

    if (groupError) {
      console.error("Error creating group:", groupError);
      return;
    }

    // Add members (including owner)
    const membersToAdd = [...selectedUsers, user.id];
    const { error: membersError } = await supabase.from("group_members").insert(
      membersToAdd.map((user_id) => ({
        group_id: groupData.id,
        user_id,
      }))
    );

    if (membersError) {
      console.error("Error adding members:", membersError);
      return;
    }

    // Reset form
    setCreatingNewGroup(false);
    setNewGroupName("");
    setSelectedUsers([]);

    // Set and load the new group
    const newGroup: Group = {
      id: groupData.id,
      name: newGroupName.trim(),
      owner_id: user.id,
    };

    setSelectedGroup(newGroup);
    await loadUserGroups();
  };

  // Remove user from group
  const removeUserFromGroup = async (userId: string) => {
    if (!selectedGroup || user?.id !== selectedGroup.owner_id) return;

    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", selectedGroup.id)
      .eq("user_id", userId);

    if (error) {
      console.error("Error removing user:", error);
      return;
    }

    await loadGroupMembers(selectedGroup.id);
  };

  // Delete entire group with cleanup
  const deleteGroup = async () => {
    if (!selectedGroup || user?.id !== selectedGroup.owner_id) return;
    if (
      !confirm(
        "Are you sure you want to delete this group? All messages will be permanently deleted."
      )
    )
      return;

    // Delete group messages first
    await supabase
      .from("group_messages")
      .delete()
      .eq("group_id", selectedGroup.id);

    // Delete group members
    await supabase
      .from("group_members")
      .delete()
      .eq("group_id", selectedGroup.id);

    // Finally delete the group
    const { error } = await supabase
      .from("groups")
      .delete()
      .eq("id", selectedGroup.id);

    if (error) {
      console.error("Error deleting group:", error);
      return;
    }

    setSelectedGroup(null);
    await loadUserGroups();
  };

  // Toggle user selection for new group
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Filter users for search
  const filteredUsers = allUsers.filter((u) =>
    `${u.first_name} ${u.last_name}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-1/4 border-r bg-white p-4 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Group Chats</h2>
          <button
            onClick={() => setCreatingNewGroup(true)}
            className="flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-2 text-sm text-white hover:bg-blue-600"
          >
            <Plus size={16} /> New Group
          </button>
        </div>

        {groups.length === 0 && !creatingNewGroup ? (
          <div className="py-8 text-center">
            <MessageSquare className="mx-auto mb-3 text-gray-400" size={40} />
            <p className="mb-4 text-gray-500">
              You don&apos;t have any groups yet
            </p>
            <button
              onClick={() => setCreatingNewGroup(true)}
              className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Create Your First Group
            </button>
          </div>
        ) : creatingNewGroup ? (
          <div className="animate-fadeIn">
            <h3 className="mb-4 text-lg font-semibold">Create New Group</h3>
            <form onSubmit={createNewGroup}>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">
                  Group Name
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full rounded-lg border p-2"
                  placeholder="Enter group name"
                  required
                />
              </div>

              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium">
                    Add Members
                  </label>
                  <span className="text-xs text-gray-500">
                    {selectedUsers.length} selected
                  </span>
                </div>
                <div className="relative mb-2">
                  <Search
                    className="absolute left-2 top-2.5 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border py-2 pl-8 pr-3"
                    placeholder="Search users..."
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {filteredUsers
                    .filter((u) => u.id !== user?.id)
                    .map((u) => (
                      <div
                        key={u.id}
                        onClick={() => toggleUserSelection(u.id)}
                        className={`flex cursor-pointer items-center rounded-lg p-2 hover:bg-gray-100 ${
                          selectedUsers.includes(u.id) ? "bg-blue-50" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(u.id)}
                          className="mr-2"
                          readOnly
                        />
                        {u.profile_picture ? (
                          <Image
                            src={u.profile_picture}
                            alt={`${u.first_name} ${u.last_name}`}
                            className="w-8 h-8 rounded-full mr-2"
                            width={400}
                            height={400}
                          />
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 mr-2" />
                        )}
                        <span>
                          {u.first_name} {u.last_name}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCreatingNewGroup(false);
                    setSelectedUsers([]);
                  }}
                  className="flex-1 rounded-lg border px-4 py-2 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedUsers.length === 0}
                  className={`flex-1 rounded-lg px-4 py-2 text-white ${
                    selectedUsers.length === 0
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <div className="mb-3 flex items-center">
              <Search className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search groups..."
                className="flex-1 rounded-lg border px-3 py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <ul className="space-y-2">
              {groups
                .filter((g) =>
                  g.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((group) => (
                  <li
                    key={group.id}
                    onClick={() => setSelectedGroup(group)}
                    className={`flex cursor-pointer items-center justify-between rounded-lg p-3 hover:bg-gray-100 ${
                      selectedGroup?.id === group.id
                        ? "bg-blue-50 border border-blue-200"
                        : ""
                    }`}
                  >
                    <div>
                      <p className="font-medium">{group.name}</p>
                      <p className="truncate text-sm text-gray-500">
                        {group.last_message || "No messages yet"}
                      </p>
                    </div>
                    {group.owner_id === user?.id && (
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                        Owner
                      </span>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {selectedGroup ? (
          <>
            <header className="flex items-center justify-between border-b bg-white p-4">
              <div className="flex items-center">
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="mr-4 text-blue-500 hover:text-blue-700"
                >
                  ← Back
                </button>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedGroup.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {groupMembers.length} member
                    {groupMembers.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {user?.id === selectedGroup.owner_id && (
                <div className="flex gap-2">
                  <button
                    onClick={deleteGroup}
                    className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 text-sm text-red-600 hover:bg-red-200"
                  >
                    <Trash2 size={16} /> Delete Group
                  </button>
                </div>
              )}
            </header>

            {/* Member list dropdown */}
            <details className="group mx-4 mt-2 border-b pb-2">
              <summary className="flex cursor-pointer items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Group Members
                </span>
                <span className="text-xs text-gray-500">▼</span>
              </summary>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {groupMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-2"
                  >
                    <div className="flex items-center">
                      {member.profile_picture ? (
                        <Image
                          src={member.profile_picture}
                          alt={`${member.first_name} ${member.last_name}`}
                          className="w-8 h-8 rounded-full mr-2"
                          width={400}
                          height={400}
                        />
                      ) : (
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 mr-2" />
                      )}
                      <span>
                        {member.first_name} {member.last_name}
                        {member.id === selectedGroup.owner_id && (
                          <span className="ml-1 text-xs text-blue-500">
                            (owner)
                          </span>
                        )}
                      </span>
                    </div>

                    {user?.id === selectedGroup.owner_id &&
                      member.id !== user.id && (
                        <button
                          onClick={() => removeUserFromGroup(member.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Remove user"
                        >
                          <UserX size={16} />
                        </button>
                      )}
                  </div>
                ))}
              </div>
            </details>

            {/* Messages container */}
            <div className="messages-container flex-1 overflow-y-auto p-4">
              {loading ? (
                <p className="py-4 text-center text-gray-500">
                  Loading messages...
                </p>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MessageSquare className="mx-auto mb-2" size={40} />
                    <p>No messages yet</p>
                    <p className="mt-1 text-sm">
                      Send a message to start the conversation
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 max-w-[80%] ${
                      message.sender_id === user?.id ? "ml-auto" : "mr-auto"
                    }`}
                  >
                    <div
                      className={`rounded-xl p-3 ${
                        message.sender_id === user?.id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      {message.sender_id !== user?.id && (
                        <div className="flex items-center mb-1">
                          {message.sender.profile_picture ? (
                            <Image
                              src={message.sender.profile_picture}
                              alt={message.sender.first_name}
                              className="w-6 h-6 rounded-full mr-2"
                              width={400}
                              height={400}
                            />
                          ) : (
                            <div className="bg-gray-300 w-6 h-6 rounded-full mr-2" />
                          )}
                          <p className="font-semibold">
                            {message.sender.first_name}{" "}
                            {message.sender.last_name}
                          </p>
                        </div>
                      )}
                      <p>{message.message_text}</p>
                    </div>
                    <p
                      className={`mt-1 text-xs ${
                        message.sender_id === user?.id
                          ? "text-right"
                          : "text-left"
                      } text-gray-500`}
                    >
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Message input */}
            <form onSubmit={sendGroupMessage} className="border-t bg-white p-4">
              <div className="flex items-start gap-2">
                <textarea
                  rows={2}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 resize-none rounded-xl border p-3"
                  placeholder="Type a message..."
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`mt-2 h-10 w-10 rounded-full p-1 ${
                    newMessage.trim()
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-gray-500">
            <MessageSquare className="mb-4" size={48} />
            <p className="text-xl">No group selected</p>
            <p className="mt-2">
              {groups.length > 0
                ? "Select a group from the sidebar"
                : "Create a new group to get started"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
