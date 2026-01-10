"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback, JSX } from "react";
import { Search, MessageSquare, Send, Plus, Trash2, UserX, Mic, Paperclip, ChevronLeft, File, FileText, Presentation, BarChart, Smile, X } from "lucide-react";
import EmojiPicker from 'emoji-picker-react';
import Image from "next/image";
import { useChatRooms, useCreateIndividualChatRoom, useCreateGroupChatRoom, useUpdateGroupChatRoom, useDeleteGroupChatRoom, useAddMembersToGroup, useRemoveMemberFromGroup, useChatRoom, useChatMessages, useSendChatMessage, useDeleteChatMessage } from "@/hooks/useChats"; // Adjust path as needed
import { useUsers } from "@/hooks/useUsers"; // Assume this hook exists, fetching User[]
import { useAuthStore } from "@/store/authStore"; // Assume this exists for current user
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/utils/helper"; // Assume exists for formatting dates
import { toast } from "react-toastify";
import { User } from "@/types/user";
import { ChatRoom, ChatMessage } from "@/types/chat";

const ChatPage: React.FC = () => {
  const { data: rooms = [], isLoading: loadingRooms } = useChatRooms();
  const { data: allUsers = [] } = useUsers();
  const currentUser = useAuthStore((state) => state.user) as User | null; // Allow null for safety
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(""); // Main search for sidebar
  const [groupSearchQuery, setGroupSearchQuery] = useState(""); // Separate search for group dialog to avoid re-render loops
  const [isMobileViewChat, setIsMobileViewChat] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createIndividualMutation = useCreateIndividualChatRoom((room) => {
    setSelectedRoom(room);
    setIsMobileViewChat(true);
  });
  const createGroupMutation = useCreateGroupChatRoom((room) => {
    setSelectedRoom(room);
    setIsCreatingGroup(false);
    setNewGroupName("");
    setSelectedUsers([]);
    setGroupSearchQuery(""); // Reset dialog search
    setIsMobileViewChat(true);
  });
  const updateGroupMutation = useUpdateGroupChatRoom();
  const deleteGroupMutation = useDeleteGroupChatRoom();
  const addMembersMutation = useAddMembersToGroup();
  const removeMemberMutation = useRemoveMemberFromGroup();
  const { data: roomData, isLoading: loadingRoom } = useChatRoom(selectedRoom?.id || "");
  const { data: messagesData = [], isLoading: loadingMessages } = useChatMessages(selectedRoom?.id || "");
  const sendMessageMutation = useSendChatMessage(selectedRoom?.id || "");
  const deleteMessageMutation = useDeleteChatMessage(selectedRoom?.id || "");

  // Memoize filtered data to prevent re-computation on every render
  const filteredUsers = useMemo(() =>
    allUsers.filter((u) =>
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    ), [allUsers, searchQuery]);

  const filteredRooms = useMemo(() =>
    rooms.filter((r) => {
      const member = r.members?.find((m) => m.id !== currentUser?.id);
      const name = r.is_group ? r.name : (member ? `${member.first_name} ${member.last_name}` : "");
      return name?.toLowerCase().includes(searchQuery.toLowerCase());
    }), [rooms, searchQuery, currentUser]);

  const groupFilteredUsers = useMemo(() =>
    allUsers.filter((u) =>
      u.id !== currentUser?.id &&
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(groupSearchQuery.toLowerCase())
    ), [allUsers, groupSearchQuery, currentUser]);

  useEffect(() => {
    if (roomData) {
      setSelectedRoom(roomData);
    }
  }, [roomData]);

  // Scroll to bottom logic
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  useEffect(() => {
    const timeout = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeout);
  }, [messagesData, selectedRoom]); // Scroll when data changes or room changes

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks: Blob[] = []; // Reset chunks for each recording
      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = () => setAudioBlob(new Blob(chunks, { type: "audio/m4a" }));
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      toast.error("Failed to access microphone");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  useEffect(() => {
    if (audioBlob && selectedRoom) {
      sendMessageMutation.mutate({ room_id: selectedRoom.id, type: "voice", file: audioBlob });
      setAudioBlob(null);
    }
  }, [audioBlob, selectedRoom, sendMessageMutation]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedRoom) {
      sendMessageMutation.mutate({ room_id: selectedRoom.id, type: "file", file });
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [selectedRoom, sendMessageMutation]);

  const sendTextMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedRoom) {
      sendMessageMutation.mutate({ room_id: selectedRoom.id, type: "text", content: newMessage.trim() });
      setNewMessage("");
    }
  }, [newMessage, selectedRoom, sendMessageMutation]);

  const toggleUserSelection = useCallback((userId: string) => {
    setSelectedUsers((prev) => prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]);
  }, []);

  const createNewGroup = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim() && selectedUsers.length > 0) {
      createGroupMutation.mutate({ name: newGroupName, memberIds: selectedUsers });
    }
  }, [newGroupName, selectedUsers, createGroupMutation]);

  const createIndividualChat = useCallback((otherUserId: string) => {
    createIndividualMutation.mutate({ otherUserId });
  }, [createIndividualMutation]);

  const deleteGroup = useCallback(() => {
    if (selectedRoom?.is_group && confirm("Are you sure you want to delete this group?")) {
      deleteGroupMutation.mutate(selectedRoom.id);
      setSelectedRoom(null);
      setIsMobileViewChat(false);
    }
  }, [selectedRoom, deleteGroupMutation]);

  const removeMember = useCallback((userId: string) => {
    if (selectedRoom?.is_group) {
      removeMemberMutation.mutate({ id: selectedRoom.id, userId });
    }
  }, [selectedRoom, removeMemberMutation]);

  const deleteMessage = useCallback((id: string) => {
    if (confirm("Delete message?")) {
      deleteMessageMutation.mutate(id);
    }
  }, [deleteMessageMutation]);

  // Group messages with date separators
  const groupedMessages = useMemo(() => {
    return messagesData.reduce((acc: JSX.Element[], msg: ChatMessage, index: number) => {
      const msgDate = new Date(msg.createdAt).toDateString();
      const prevMsgDate = index > 0 ? new Date(messagesData[index - 1].createdAt).toDateString() : null;

      if (index === 0 || msgDate !== prevMsgDate) {
        acc.push(
          <div key={msgDate} className="text-center text-gray-500 my-4">
            <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">{new Date(msg.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        );
      }

      acc.push(
        <MessageItem
          key={msg.id}
          msg={msg}
          currentUser={currentUser!}
          deleteMessage={deleteMessage}
        />
      );

      return acc;
    }, []);
  }, [messagesData, currentUser, deleteMessage]);

  // Safe current user check
  if (!currentUser) {
    return <div>Loading user...</div>; // Or redirect to login
  }

  return (
    <div className="flex bg-gray-50 text-gray-900 h-[calc(100vh-theme(spacing.28))] rounded-lg overflow-hidden border border-border shadow-sm">
      {/* Sidebar */}
      <aside className={`w-full lg:w-80 border-r bg-white p-4 flex flex-col ${isMobileViewChat ? "hidden" : "block"} lg:flex`}>
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h2 className="text-2xl font-bold text-primary">Chats</h2>
          <Button onClick={() => setIsCreatingGroup(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" /> New Group
          </Button>
        </div>
        <div className="relative mb-4 shrink-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10 border-input focus:border-primary"
            placeholder="Search chats or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
          {loadingRooms ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            filteredUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
                onClick={() => {
                  createIndividualChat(u.id);
                  setSearchQuery("");
                }}
              >
                <UserAvatar user={u} />
                <div className="ml-3">
                  <p className="font-medium text-foreground">{u.first_name} {u.last_name}</p>
                  <p className="text-sm text-muted-foreground">Start a new chat</p>
                </div>
              </div>
            ))
          ) : (
            filteredRooms.map((room) => {
              const otherMember = room.members?.find((m) => m.id !== currentUser?.id);
              const lastMsg = room.messages?.[0];
              const previewText = lastMsg
                ? lastMsg.type === "text"
                  ? lastMsg.content
                  : lastMsg.type === "voice"
                    ? "Voice message"
                    : `File: ${lastMsg.filename || "file"}`
                : "No messages yet";
              return (
                <div
                  key={room.id}
                  className={`flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors ${selectedRoom?.id === room.id ? "bg-muted" : ""}`}
                  onClick={() => {
                    setSelectedRoom(room);
                    setIsMobileViewChat(true);
                  }}
                >
                  <div className="flex items-center">
                    {room.is_group ? (
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                        {room.name?.[0] || "G"}
                      </div>
                    ) : otherMember ? (
                      <UserAvatar user={otherMember} />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                        U
                      </div>
                    )}
                    <div className="ml-3">
                      <p className="font-medium text-foreground">
                        {room.is_group ? room.name : otherMember ? `${otherMember.first_name} ${otherMember.last_name}` : "Unknown User"}
                      </p>
                      <p className="text-sm text-muted-foreground truncate w-48">{previewText}</p>
                    </div>
                  </div>
                  {room.is_group && room.owner_id === currentUser?.id && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Owner</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Chat Area */}
      <main className={`flex-1 flex flex-col ${isMobileViewChat ? "block" : "hidden lg:flex"} bg-[#ffffff] relative`}>
        {selectedRoom ? (
          <>
            <header className="flex items-center justify-between p-4 border-b bg-white">
              <div className="flex items-center">
                <Button variant="ghost" className="lg:hidden" onClick={() => setIsMobileViewChat(false)}>
                  <ChevronLeft className="h-6 w-6 text-primary" />
                </Button>
                <h3 className="ml-2 text-lg font-semibold text-foreground">
                  {selectedRoom?.is_group ? selectedRoom.name : selectedRoom?.members?.find((m) => m.id !== currentUser?.id)?.first_name + " " + selectedRoom?.members?.find((m) => m.id !== currentUser?.id)?.last_name || "Chat"}
                </h3>
              </div>
              {selectedRoom?.is_group && selectedRoom.owner_id === currentUser?.id && (
                <Button variant="destructive" size="sm" onClick={deleteGroup} className="bg-red-600 hover:bg-red-700">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              )}
            </header>
            <ChatMembersComponent
              room={selectedRoom}
              currentUser={currentUser!}
              removeMember={removeMember}
              allUsers={allUsers}
              addMembersMutation={addMembersMutation}
            />
            <div id="messages-container" className="flex-1 overflow-y-auto p-4 bg-gray-50/50 custom-scrollbar">
              {loadingMessages || loadingRoom ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`mb-4 max-w-[80%] ${i % 2 === 0 ? "ml-auto" : ""}`}>
                      <Skeleton className="h-12 w-[200px] rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {groupedMessages}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
            <form onSubmit={sendTextMessage} className="p-3 border-t bg-white flex items-end gap-2 relative">
              {showEmojiPicker && (
                <div className="absolute bottom-16 left-0 z-10">
                  <EmojiPicker onEmojiClick={(emoji) => setNewMessage(prev => prev + emoji.emoji)} />
                </div>
              )}

              <Button type="button" variant="ghost" size="icon" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-muted-foreground hover:text-primary mb-1">
                <Smile className="h-6 w-6" />
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="text-muted-foreground hover:text-primary mb-1">
                <Paperclip className="h-6 w-6" />
              </Button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden />

              <div className="flex-1 bg-muted/30 rounded-2xl flex items-center px-4 py-2 min-h-[44px]">
                <Textarea
                  rows={1}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendTextMessage(e);
                    }
                  }}
                  placeholder="Message..."
                  className="flex-1 bg-transparent border-0 focus-visible:ring-0 p-0 resize-none max-h-32 text-sm"
                />
              </div>

              {newMessage.trim() ? (
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-10 h-10 p-0 flex items-center justify-center mb-1 transition-all">
                  <Send className="h-5 w-5 ml-0.5" />
                </Button>
              ) : (
                <Button type="button" variant="ghost" size="icon" onClick={isRecording ? stopRecording : startRecording} className={`mb-1 ${isRecording ? "text-red-500 animate-pulse" : "text-muted-foreground hover:text-primary"}`}>
                  <Mic className="h-6 w-6" />
                </Button>
              )}
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center flex-col text-gray-500">
            <MessageSquare className="h-12 w-12 mb-4" />
            <p className="text-xl">Select a chat to start messaging</p>
          </div>
        )}
      </main>

      {/* Create Group Dialog */}
      <Dialog open={isCreatingGroup} onOpenChange={setIsCreatingGroup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-cyan-700">Create New Group</DialogTitle>
          </DialogHeader>
          <form onSubmit={createNewGroup} className="space-y-4">
            <Input
              placeholder="Group Name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="border-cyan-300 focus:border-cyan-500"
            />
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                className="pl-10 border-cyan-300 focus:border-cyan-500"
                placeholder="Search users to add..."
                value={groupSearchQuery}
                onChange={(e) => setGroupSearchQuery(e.target.value)}
              />
            </div>
            <ScrollArea className="h-48 border border-cyan-200 rounded-md p-2 pr-4"> {/* Add padding-right */}
              {groupFilteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center space-x-2 p-2 hover:bg-cyan-50 rounded-md"
                >
                  <Checkbox
                    checked={selectedUsers.includes(u.id)}
                    onCheckedChange={() => toggleUserSelection(u.id)}
                    className="border-cyan-500"
                  />
                  <UserAvatar user={u} />
                  <span className="text-cyan-800">{u.first_name} {u.last_name}</span>
                </div>
              ))}
            </ScrollArea>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsCreatingGroup(false)} className="border-cyan-300 text-cyan-700">
                Cancel
              </Button>
              <Button type="submit" disabled={!newGroupName.trim() || selectedUsers.length === 0} className="bg-cyan-700 hover:bg-cyan-600 text-white">
                Create Group
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface ChatMembersProps {
  room: ChatRoom;
  currentUser: User;
  removeMember: (userId: string) => void;
  allUsers: User[];
  addMembersMutation: ReturnType<typeof useAddMembersToGroup>;
}

const ChatMembersComponent: React.FC<ChatMembersProps> = React.memo(({ room, currentUser, removeMember, allUsers, addMembersMutation }) => {
  const [showMembers, setShowMembers] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [searchAdd, setSearchAdd] = useState("");
  const [selectedAdd, setSelectedAdd] = useState<string[]>([]);

  const filteredAdd = useMemo(() =>
    allUsers.filter((u) =>
      !room.members?.some((m) => m.id === u.id) &&
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchAdd.toLowerCase())
    ), [allUsers, room.members, searchAdd]);

  const handleAdd = useCallback(() => {
    if (selectedAdd.length > 0) {
      addMembersMutation.mutate({ id: room.id, memberIds: selectedAdd });
      setSelectedAdd([]);
      setAddMode(false);
    }
  }, [selectedAdd, room.id, addMembersMutation]);

  if (!room.is_group) return null;

  return (
    <div className="p-4 border-b bg-cyan-50">
      <div className="flex items-center justify-between mb-4">
        <Button variant="link" onClick={() => setShowMembers(!showMembers)} className="text-cyan-700 p-0">
          {showMembers ? "Hide" : "Show"} Members ({room.members?.length || 0})
        </Button>
        {room.owner_id === currentUser.id && (
          <Button onClick={() => setAddMode(true)} className="bg-cyan-700 hover:bg-cyan-600 text-white">
            <Plus className="mr-2 h-4 w-4" /> Add Members
          </Button>
        )}
      </div>
      {showMembers && (
        <ScrollArea className="mt-4 max-h-64">
          <div className="flex flex-col gap-2">
            {room.members?.map((member, index) => (
              <div
                key={member.id}
                className={`flex items-center justify-between p-3 bg-white rounded-lg shadow-sm ${index < (room.members?.length || 0) - 1 ? "border-b border-gray-200" : ""}`}
              >
                <div className="flex items-center">
                  <UserAvatar user={member} />
                  <div className="ml-4">
                    <span className="text-cyan-800 font-medium">{member.first_name} {member.last_name}</span>
                    {member.id === room.owner_id && (
                      <span className="ml-2 text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full">Admin</span>
                    )}
                  </div>
                </div>
                {currentUser.id === room.owner_id && member.id !== currentUser.id && (
                  <Button variant="ghost" size="icon" onClick={() => removeMember(member.id)} className="text-red-500">
                    <UserX className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
      <Dialog open={addMode} onOpenChange={setAddMode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-cyan-700">Add Members</DialogTitle>
          </DialogHeader>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              className="pl-10 border-cyan-300 focus:border-cyan-500"
              placeholder="Search users..."
              value={searchAdd}
              onChange={(e) => setSearchAdd(e.target.value)}
            />
          </div>
          <ScrollArea className="h-48 mt-2 border border-cyan-200 rounded-md p-2 pr-4"> {/* Add padding-right */}
            {filteredAdd.map((u, index) => (
              <div
                key={u.id}
                className={`flex items-center space-x-4 p-3 hover:bg-cyan-50 rounded-md ${index < filteredAdd.length - 1 ? "border-b border-gray-200" : ""}`}
              >
                <Checkbox
                  checked={selectedAdd.includes(u.id)}
                  onCheckedChange={() => setSelectedAdd((prev) => prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id])}
                  className="border-cyan-500"
                />
                <UserAvatar user={u} />
                <span className="text-cyan-800">{u.first_name} {u.last_name}</span>
              </div>
            ))}
          </ScrollArea>
          <div className="flex justify-end mt-4 space-x-2">
            <Button onClick={() => setAddMode(false)} variant="outline" className="border-cyan-300 text-cyan-700">
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={selectedAdd.length === 0} className="bg-cyan-700 hover:bg-cyan-600 text-white">
              Add Selected
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

interface MessageItemProps {
  msg: ChatMessage;
  currentUser: User;
  deleteMessage: (id: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = React.memo(({ msg, currentUser, deleteMessage }) => {
  let fileContent = null;
  if (msg.type === "file" && msg.media_url) {
    const mime = msg.mime_type || '';
    const isImage = mime.startsWith("image/");
    const isVideo = mime.startsWith("video/");
    const isPdf = mime === "application/pdf";
    const filename = msg.filename || "File";
    const ext = filename.toLowerCase().split('.').pop() || '';

    let Icon = File;
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) {
      Icon = FileText;
    } else if (['xls', 'xlsx', 'csv'].includes(ext)) {
      Icon = BarChart;
    } else if (['ppt', 'pptx'].includes(ext)) {
      Icon = Presentation;
    }

    if (isImage) {
      fileContent = (
        <a href={msg.media_url} target="_blank" rel="noopener noreferrer" className="block">
          <img src={msg.media_url} alt={filename} className="max-w-full rounded-lg" />
        </a>
      );
    } else if (isVideo) {
      fileContent = (
        <video controls src={msg.media_url} className="max-w-full rounded-lg" />
      );
    } else if (isPdf) {
      const previewUrl = msg.media_url.replace('/raw/upload/', '/image/upload/pg_1/w_300,c_scale/');
      fileContent = (
        <a href={msg.media_url} target="_blank" rel="noopener noreferrer" className="block">
          <img src={previewUrl} alt={filename} className="max-w-full rounded-lg" />
          <p className="text-center mt-2 text-cyan-500 hover:underline">{filename}</p>
        </a>
      );
    } else {
      fileContent = (
        <a href={msg.media_url} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline flex items-center">
          <Icon className="mr-1 h-4 w-4" /> {filename}
        </a>
      );
    }
  }

  return (
    <div className={`mb-4 max-w-[80%] ${msg.sender_id === currentUser.id ? "ml-auto" : ""}`}>
      <div className={`p-3 rounded-lg ${msg.sender_id === currentUser.id ? "bg-cyan-500 text-white" : "bg-white shadow-sm"}`}>
        {msg.sender_id !== currentUser.id && msg.sender && (
          <p className="font-semibold text-cyan-700 mb-1">{msg.sender.first_name} {msg.sender.last_name}</p>
        )}
        {msg.type === "text" && <p>{msg.content}</p>}
        {msg.type === "voice" && msg.media_url && <audio controls src={msg.media_url} className="w-full" />}
        {msg.type === "file" && fileContent}
      </div>
      <div className={`flex ${msg.sender_id === currentUser.id ? "justify-end" : "justify-start"} items-center mt-1 text-xs text-gray-500`}>
        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        {msg.sender_id === currentUser.id && (
          <Button variant="ghost" size="icon" onClick={() => deleteMessage(msg.id)} className="ml-2 text-red-500">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
});

interface UserAvatarProps {
  user: User | undefined; // Allow undefined for safety
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user }) => {
  if (!user) {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
        U
      </div>
    );
  }

  return (
    <div className="relative">
      {user.profile_picture ? (
        <Image
          src={user.profile_picture}
          alt={`${user.first_name} ${user.last_name}`}
          width={40}
          height={40}
          className="rounded-full"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-cyan-200 flex items-center justify-center text-cyan-700 font-bold">
          {user.first_name[0]}{user.last_name[0]}
        </div>
      )}
    </div>
  );
};

export default ChatPage;
