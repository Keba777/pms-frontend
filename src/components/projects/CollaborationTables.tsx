"use client";

import React, { useState, useRef } from "react";
import { ChevronDown, Eye, Edit, Trash2, PlusIcon, ExternalLink } from "lucide-react";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";

import CollaborationForm from "@/components/forms/CollaborationForm";
import { useUsers } from "@/hooks/useUsers";

import {
  useDiscussions,
  useCreateDiscussion,
  useUpdateDiscussion,
  useDeleteDiscussion,
  useNotifications,
  useDeleteNotification,
  useActivities,
  useDeleteActivity,
} from "@/hooks/useCollaborations";
import {
  AppDiscussion,
  AppNotification,
  AppActivity,
} from "@/types/collaboration";

/**
 * Helper: format date safely
 */
const formatDate = (date?: string | Date | null) => {
  if (!date) return "-";
  try {
    const d = new Date(date);
    return d.toLocaleString();
  } catch {
    return String(date);
  }
};

/* ===========================================================================
   DISCUSSION TABLE
   =========================================================================== */

interface DiscussionTableProps {
  type: "project" | "task" | "activity" | "todo";
  referenceId: string;
}

export function DiscussionTable({ type, referenceId }: DiscussionTableProps) {
  const { data: discussions, isLoading, error } = useDiscussions();
  const createDiscussion = useCreateDiscussion();
  const updateDiscussion = useUpdateDiscussion();
  const deleteDiscussion = useDeleteDiscussion();
  const { data: users } = useUsers();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AppDiscussion | null>(null);
  const [dropdownId, setDropdownId] = useState<number | string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  if (error) return <div>Error loading discussions</div>;

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
      </div>
    );
  }

  const items = (discussions ?? []).filter(
    (d) => d.type === type && String(d.referenceId) === String(referenceId)
  );

  const getUserName = (id: string) => {
    const user = users?.find((u: any) => String(u.id) === String(id));
    return user ? `${user.first_name} ${user.last_name}` : id;
  };

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (d: AppDiscussion) => {
    setEditing(d);
    setShowForm(true);
    setDropdownId(null);
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Delete this discussion?")) return;
    try {
      await deleteDiscussion.mutateAsync(id as any);
      toast.success("Discussion deleted");
    } catch {
      toast.error("Failed to delete discussion");
    } finally {
      setDropdownId(null);
    }
  };

  const handleView = (d: AppDiscussion) => {
    // simple view: open a new window with a discussion detail route if you have one,
    // or show modal - for now we'll open a quick window placeholder
    toast.info("Open discussion view");
    setDropdownId(null);
  };

  const downloadColumns: Column<any>[] = [
    { header: "No", accessor: (_d, index) => index! + 1 },
    { header: "Subject", accessor: (d: any) => d.subject || "N/A" },
    { header: "Created By", accessor: (d: any) => `${d.createdByUser?.first_name} ${d.createdByUser?.last_name}` || "N/A" },
    { header: "Participants", accessor: (d: any) => (d.participants ?? []).map(getUserName).join(", ") || "-" },
    { header: "Last Message", accessor: (d: any) => formatDate(d.lastMessageAt) },
    { header: "Pinned", accessor: (d: any) => d.pinned ? "Yes" : "No" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="my-6 text-3xl font-bold text-gray-800">Discussions</h1>
        <div className="flex items-center gap-4">
          <button
            className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-3 rounded text-sm flex items-center gap-2"
            onClick={openCreate}
          >
            <PlusIcon width={15} height={12} /> New
          </button>
          <GenericDownloads
            data={items}
            title="Discussions"
            columns={downloadColumns}
          />
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <CollaborationForm
              onClose={() => setShowForm(false)}
              mode="discussion"
              type={type}
              referenceId={referenceId}
              initialData={editing ?? undefined}
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto border rounded shadow-sm">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-cyan-700 text-gray-100">
            <tr>
              <th className="px-3 py-2 border text-left">#</th>
              <th className="px-3 py-2 border text-left">Subject</th>
              <th className="px-3 py-2 border text-left">Created By</th>
              <th className="px-3 py-2 border text-left">Participants</th>
              <th className="px-3 py-2 border text-left">Last Msg</th>
              <th className="px-3 py-2 border text-left">Pinned</th>
              <th className="px-3 py-2 border text-left">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {items.length > 0 ? (
              items.map((d, idx) => (
                <tr
                  key={d.id}
                  className="hover:bg-gray-50 relative"
                  onClick={() => setDropdownId(null)}
                >
                  <td className="border px-3 py-2 text-center">{idx + 1}</td>
                  <td className="border px-3 py-2 font-medium">{d.subject}</td>
                  <td className="border px-3 py-2">
                    {d.createdByUser?.first_name} {d.createdByUser?.last_name}
                  </td>
                  <td className="border px-3 py-2 text-sm">
                    {(d.participants ?? [])
                      .map(getUserName)
                      .slice(0, 3)
                      .join(", ") || "-"}
                  </td>
                  <td className="border px-3 py-2">
                    {formatDate(d.lastMessageAt)}
                  </td>
                  <td className="border px-3 py-2">
                    {d.pinned ? "Yes" : "No"}
                  </td>
                  <td className="border px-3 py-2">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownId(dropdownId === d.id ? null : d.id);
                        }}
                        className="flex items-center justify-between gap-1 px-3 py-1 bg-cyan-700 text-white rounded w-full hover:bg-cyan-800"
                      >
                        Actions
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {dropdownId === d.id && (
                        <div
                          ref={dropdownRef}
                          className="absolute left-0 top-full mt-1 w-44 bg-white border rounded shadow-lg z-50"
                        >
                          <button
                            onClick={() => handleView(d)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" /> View
                          </button>

                          <button
                            onClick={() => openEdit(d)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" /> Edit
                          </button>

                          <button
                            onClick={() => handleDelete(d.id)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 text-red-600 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="border px-3 py-2 text-center text-gray-500"
                >
                  No discussions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===========================================================================
   NOTIFICATION TABLE
   =========================================================================== */

interface NotificationTableProps {
  type: "project" | "task" | "activity" | "todo";
  referenceId: string;
}

export function NotificationTable({
  type,
  referenceId,
}: NotificationTableProps) {
  const { data: notifications, isLoading, error } = useNotifications();
  const deleteNotification = useDeleteNotification();
  const { data: users } = useUsers();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AppNotification | null>(null);
  const [dropdownId, setDropdownId] = useState<number | string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  if (error) return <div>Error loading notifications</div>;

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
      </div>
    );
  }

  const items = (notifications ?? []).filter(
    (n) => n.type === type && String(n.referenceId) === String(referenceId)
  );

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (n: AppNotification) => {
    setEditing(n);
    setShowForm(true);
    setDropdownId(null);
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Delete this notification?")) return;
    try {
      await deleteNotification.mutateAsync(id as any);
      toast.success("Notification deleted");
    } catch {
      toast.error("Failed to delete notification");
    } finally {
      setDropdownId(null);
    }
  };

  const handleView = (n: AppNotification) => {
    toast.info(n.message);
    setDropdownId(null);
  };

  const downloadColumns: Column<any>[] = [
    { header: "No", accessor: (_n, index) => index! + 1 },
    { header: "Date", accessor: (n: any) => formatDate(n.date) },
    { header: "Title", accessor: (n: any) => n.title ?? "-" },
    { header: "Message", accessor: (n: any) => n.message || "N/A" },
    { header: "Recipient", accessor: (n: any) => `${n.recipientUser?.first_name} ${n.recipientUser?.last_name}` || "N/A" },
    { header: "Read", accessor: (n: any) => n.read ? "Yes" : "No" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="my-6 text-3xl font-bold text-gray-800">Notifications</h1>
        <div className="flex items-center gap-4">
          <button
            className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-3 rounded text-sm flex items-center gap-2"
            onClick={openCreate}
          >
            <PlusIcon width={15} height={12} /> New
          </button>
          <GenericDownloads
            data={items}
            title="Notifications"
            columns={downloadColumns}
          />
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <CollaborationForm
              onClose={() => setShowForm(false)}
              mode="notification"
              type={type}
              referenceId={referenceId}
              initialData={editing ?? undefined}
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto border rounded shadow-sm">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-cyan-700 text-gray-100">
            <tr>
              <th className="px-3 py-2 border text-left">#</th>
              <th className="px-3 py-2 border text-left">Date</th>
              <th className="px-3 py-2 border text-left">Title</th>
              <th className="px-3 py-2 border text-left">Message</th>
              <th className="px-3 py-2 border text-left">Recipient</th>
              <th className="px-3 py-2 border text-left">Read</th>
              <th className="px-3 py-2 border text-left">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {items.length > 0 ? (
              items.map((n, idx) => (
                <tr
                  key={n.id}
                  className="hover:bg-gray-50 relative"
                  onClick={() => setDropdownId(null)}
                >
                  <td className="border px-3 py-2 text-center">{idx + 1}</td>
                  <td className="border px-3 py-2">{formatDate(n.date)}</td>
                  <td className="border px-3 py-2 font-medium">
                    {n.title ?? "-"}
                  </td>
                  <td className="border px-3 py-2 text-sm">{n.message}</td>
                  <td className="border px-3 py-2">
                    {n.recipientUser?.first_name} {n.recipientUser?.last_name}
                  </td>
                  <td className="border px-3 py-2">{n.read ? "Yes" : "No"}</td>
                  <td className="border px-3 py-2">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownId(dropdownId === n.id ? null : n.id);
                        }}
                        className="flex items-center justify-between gap-1 px-3 py-1 bg-cyan-700 text-white rounded w-full hover:bg-cyan-800"
                      >
                        Actions
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {dropdownId === n.id && (
                        <div
                          ref={dropdownRef}
                          className="absolute left-0 top-full mt-1 w-44 bg-white border rounded shadow-lg z-50"
                        >
                          <button
                            onClick={() => handleView(n)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" /> View
                          </button>

                          <button
                            onClick={() => openEdit(n)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" /> Edit
                          </button>

                          <button
                            onClick={() => handleDelete(n.id)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 text-red-600 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="border px-3 py-2 text-center text-gray-500"
                >
                  No notifications found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===========================================================================
   ACTIVITY LOG TABLE
   =========================================================================== */

interface ActivityLogTableProps {
  type: "project" | "task" | "activity" | "todo";
  referenceId: string;
}

export function ActivityLogTable({ type, referenceId }: ActivityLogTableProps) {
  const { data: activities, isLoading, error } = useActivities();
  const deleteActivity = useDeleteActivity();
  const { data: users } = useUsers();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AppActivity | null>(null);
  const [dropdownId, setDropdownId] = useState<number | string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  if (error) return <div>Error loading activities</div>;

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
      </div>
    );
  }

  const items = (activities ?? []).filter(
    (a) => a.type === type && String(a.referenceId) === String(referenceId)
  );

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (a: AppActivity) => {
    setEditing(a);
    setShowForm(true);
    setDropdownId(null);
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Delete this activity log?")) return;
    try {
      await deleteActivity.mutateAsync(id as any);
      toast.success("Activity deleted");
    } catch {
      toast.error("Failed to delete activity");
    } finally {
      setDropdownId(null);
    }
  };

  const handleView = (a: AppActivity) => {
    toast.info(a.action);
    setDropdownId(null);
  };

  const downloadColumns: Column<any>[] = [
    { header: "No", accessor: (_a, index) => index! + 1 },
    { header: "Date", accessor: (a: any) => formatDate(a.date) },
    { header: "Action", accessor: (a: any) => a.action || "N/A" },
    { header: "Actor", accessor: (a: any) => `${a.actorUser?.first_name} ${a.actorUser?.last_name}` || "N/A" },
    { header: "Details", accessor: (a: any) => a.details ?? "-" },
    { header: "Parent", accessor: (a: any) => a.parentActivityId ?? "-" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="my-6 text-3xl font-bold text-gray-800">Activity Logs</h1>
        <div className="flex items-center gap-4">
          <button
            className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-3 rounded text-sm flex items-center gap-2"
            onClick={openCreate}
          >
            <PlusIcon width={15} height={12} /> New
          </button>
          <GenericDownloads
            data={items}
            title="Activity_Logs"
            columns={downloadColumns}
          />
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <CollaborationForm
              onClose={() => setShowForm(false)}
              mode="activity"
              type={type}
              referenceId={referenceId}
              initialData={editing ?? undefined}
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto border rounded shadow-sm">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-cyan-700 text-gray-100">
            <tr>
              <th className="px-3 py-2 border text-left">#</th>
              <th className="px-3 py-2 border text-left">Date</th>
              <th className="px-3 py-2 border text-left">Action</th>
              <th className="px-3 py-2 border text-left">Actor</th>
              <th className="px-3 py-2 border text-left">Details</th>
              <th className="px-3 py-2 border text-left">Parent</th>
              <th className="px-3 py-2 border text-left">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {items.length > 0 ? (
              items.map((a, idx) => (
                <tr
                  key={a.id}
                  className="hover:bg-gray-50 relative"
                  onClick={() => setDropdownId(null)}
                >
                  <td className="border px-3 py-2 text-center">{idx + 1}</td>
                  <td className="border px-3 py-2">{formatDate(a.date)}</td>
                  <td className="border px-3 py-2 font-medium">{a.action}</td>
                  <td className="border px-3 py-2">
                    {a.actorUser?.first_name} {a.actorUser?.last_name}
                  </td>
                  <td className="border px-3 py-2 text-sm">
                    {a.details ?? "-"}
                  </td>
                  <td className="border px-3 py-2">
                    {a.parentActivityId ?? "-"}
                  </td>
                  <td className="border px-3 py-2">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownId(dropdownId === a.id ? null : a.id);
                        }}
                        className="flex items-center justify-between gap-1 px-3 py-1 bg-cyan-700 text-white rounded w-full hover:bg-cyan-800"
                      >
                        Actions
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {dropdownId === a.id && (
                        <div
                          ref={dropdownRef}
                          className="absolute left-0 top-full mt-1 w-44 bg-white border rounded shadow-lg z-50"
                        >
                          <button
                            onClick={() => handleView(a)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" /> View
                          </button>

                          <button
                            onClick={() => openEdit(a)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" /> Edit
                          </button>

                          <button
                            onClick={() => handleDelete(a.id)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 text-red-600 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="border px-3 py-2 text-center text-gray-500"
                >
                  No activity logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
