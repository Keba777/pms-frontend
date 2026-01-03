"use client";

import React, { useState, useRef, useMemo } from "react";
import { ChevronDown, Eye, Edit, Trash2, Plus as PlusIcon, ExternalLink, Search } from "lucide-react";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [searchTerm, setSearchTerm] = useState("");

  const columnOptions = [
    { value: "id", label: "ID" },
    { value: "subject", label: "Subject" },
    { value: "createdBy", label: "Created By" },
    { value: "participants", label: "Participants" },
    { value: "lastMsg", label: "Last Msg" },
    { value: "pinned", label: "Pinned" },
    { value: "actions", label: "Actions" },
  ];

  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    columnOptions.map((col) => col.value)
  );

  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const getUserName = (id: string) => {
    const user = users?.find((u: any) => String(u.id) === String(id));
    return user ? `${user.first_name} ${user.last_name}` : id;
  };

  const items = useMemo(() => {
    const filtered = (discussions ?? []).filter(
      (d) => d.type === type && String(d.referenceId) === String(referenceId)
    );
    if (!searchTerm) return filtered;
    return filtered.filter((d) =>
      d.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.createdByUser?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.createdByUser?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [discussions, type, referenceId, searchTerm]);

  if (error) return <div className="text-red-500 py-4">Error loading discussions</div>;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Skeleton className="h-10 w-48" />
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto order-2 sm:order-1">
              <Skeleton className="h-10 w-full sm:w-24" />
              <Skeleton className="h-10 w-full sm:w-32" />
            </div>
            <div className="w-full sm:w-auto order-1 sm:order-2">
              <Skeleton className="h-10 w-full sm:w-48" />
            </div>
          </div>
        </div>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-primary">
              <TableRow>
                {columnOptions.map((col) => (
                  <TableHead key={col.value} className="text-white">
                    <Skeleton className="h-4 w-16 bg-primary/50" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  {columnOptions.map((col) => (
                    <TableCell key={col.value}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (d: AppDiscussion) => {
    setEditing(d);
    setShowForm(true);
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Delete this discussion?")) return;
    try {
      await deleteDiscussion.mutateAsync(id as any);
      toast.success("Discussion deleted");
    } catch {
      toast.error("Failed to delete discussion");
    }
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
        <h2 className="text-2xl font-bold text-gray-800">Discussions</h2>
        <span className="text-sm text-gray-400 font-medium">({items.length} total)</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="w-full sm:w-auto order-1 sm:order-2">
            <GenericDownloads
              data={items}
              title="Discussions"
              columns={downloadColumns}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto order-2 sm:order-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 w-full sm:w-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="start">
                <div className="space-y-1">
                  {columnOptions.map((col) => (
                    <div key={col.value} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded">
                      <Checkbox
                        id={`col-${col.value}`}
                        checked={selectedColumns.includes(col.value)}
                        onCheckedChange={() => toggleColumn(col.value)}
                      />
                      <label htmlFor={`col-${col.value}`} className="text-sm cursor-pointer flex-1">
                        {col.label}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Button
              size="sm"
              className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
              onClick={openCreate}
            >
              <PlusIcon className="mr-2 h-4 w-4" /> New
            </Button>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search discussions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 w-full"
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

      <div className="overflow-x-auto rounded-md border shadow-sm">
        <Table>
          <TableHeader className="bg-primary">
            <TableRow className="hover:bg-primary/90">
              {columnOptions
                .filter((col) => selectedColumns.includes(col.value))
                .map((col) => (
                  <TableHead key={col.value} className="text-white font-semibold whitespace-nowrap px-4 py-3">
                    {col.label}
                  </TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? (
              items.map((d, idx) => (
                <TableRow key={d.id} className="hover:bg-gray-50">
                  {selectedColumns.includes("id") && (
                    <TableCell className="px-4 py-3 text-gray-500">{idx + 1}</TableCell>
                  )}
                  {selectedColumns.includes("subject") && (
                    <TableCell className="px-4 py-3 font-medium text-gray-900">{d.subject}</TableCell>
                  )}
                  {selectedColumns.includes("createdBy") && (
                    <TableCell className="px-4 py-3">
                      {d.createdByUser?.first_name} {d.createdByUser?.last_name}
                    </TableCell>
                  )}
                  {selectedColumns.includes("participants") && (
                    <TableCell className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {(d.participants ?? [])
                        .map(getUserName)
                        .slice(0, 3)
                        .join(", ") || "-"}
                      {(d.participants?.length ?? 0) > 3 && " ..."}
                    </TableCell>
                  )}
                  {selectedColumns.includes("lastMsg") && (
                    <TableCell className="px-4 py-3 text-sm">
                      {formatDate(d.lastMessageAt)}
                    </TableCell>
                  )}
                  {selectedColumns.includes("pinned") && (
                    <TableCell className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${d.pinned ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                        }`}>
                        {d.pinned ? "Pinned" : "No"}
                      </span>
                    </TableCell>
                  )}
                  {selectedColumns.includes("actions") && (
                    <TableCell className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 px-2 bg-primary text-primary-foreground hover:bg-primary/90">
                            Action <ChevronDown className="ml-1 h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => toast.info("Open discussion view")}>
                            <ExternalLink className="mr-2 h-4 w-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(d)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(d.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={selectedColumns.length}
                  className="h-24 text-center text-gray-500"
                >
                  No discussions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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

export function NotificationTable({ type, referenceId }: NotificationTableProps) {
  const { data: notifications, isLoading, error } = useNotifications();
  const deleteNotification = useDeleteNotification();
  const { data: users } = useUsers();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AppNotification | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const columnOptions = [
    { value: "id", label: "ID" },
    { value: "date", label: "Date" },
    { value: "title", label: "Title" },
    { value: "message", label: "Message" },
    { value: "recipient", label: "Recipient" },
    { value: "read", label: "Read" },
    { value: "actions", label: "Actions" },
  ];

  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    columnOptions.map((col) => col.value)
  );

  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const items = useMemo(() => {
    const filtered = (notifications ?? []).filter(
      (n) => n.type === type && String(n.referenceId) === String(referenceId)
    );
    if (!searchTerm) return filtered;
    return filtered.filter((n) =>
      n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.recipientUser?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.recipientUser?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [notifications, type, referenceId, searchTerm]);

  if (error) return <div className="text-red-500 py-4">Error loading notifications</div>;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Skeleton className="h-10 w-48" />
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto order-2 sm:order-1">
              <Skeleton className="h-10 w-full sm:w-24" />
              <Skeleton className="h-10 w-full sm:h-9" />
            </div>
            <div className="w-full sm:w-auto order-1 sm:order-2">
              <Skeleton className="h-10 w-full sm:w-48" />
            </div>
          </div>
        </div>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-primary">
              <TableRow>
                {columnOptions.map((col) => (
                  <TableHead key={col.value} className="text-white">
                    <Skeleton className="h-4 w-16 bg-primary/50" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  {columnOptions.map((col) => (
                    <TableCell key={col.value}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (n: AppNotification) => {
    setEditing(n);
    setShowForm(true);
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Delete this notification?")) return;
    try {
      await deleteNotification.mutateAsync(id as any);
      toast.success("Notification deleted");
    } catch {
      toast.error("Failed to delete notification");
    }
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
        <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
        <span className="text-sm text-gray-400 font-medium">({items.length} total)</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="w-full sm:w-auto order-1 sm:order-2">
            <GenericDownloads
              data={items}
              title="Notifications"
              columns={downloadColumns}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto order-2 sm:order-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 w-full sm:w-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="start">
                <div className="space-y-1">
                  {columnOptions.map((col) => (
                    <div key={col.value} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded">
                      <Checkbox
                        id={`col-notif-${col.value}`}
                        checked={selectedColumns.includes(col.value)}
                        onCheckedChange={() => toggleColumn(col.value)}
                      />
                      <label htmlFor={`col-notif-${col.value}`} className="text-sm cursor-pointer flex-1">
                        {col.label}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Button
              size="sm"
              className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
              onClick={openCreate}
            >
              <PlusIcon className="mr-2 h-4 w-4" /> New
            </Button>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 w-full"
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

      <div className="overflow-x-auto rounded-md border shadow-sm">
        <Table>
          <TableHeader className="bg-primary">
            <TableRow className="hover:bg-primary/90">
              {columnOptions
                .filter((col) => selectedColumns.includes(col.value))
                .map((col) => (
                  <TableHead key={col.value} className="text-white font-semibold whitespace-nowrap px-4 py-3">
                    {col.label}
                  </TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? (
              items.map((n, idx) => (
                <TableRow key={n.id} className="hover:bg-gray-50">
                  {selectedColumns.includes("id") && (
                    <TableCell className="px-4 py-3 text-gray-500">{idx + 1}</TableCell>
                  )}
                  {selectedColumns.includes("date") && (
                    <TableCell className="px-4 py-3 text-sm">{formatDate(n.date)}</TableCell>
                  )}
                  {selectedColumns.includes("title") && (
                    <TableCell className="px-4 py-3 font-medium text-gray-900">{n.title || "-"}</TableCell>
                  )}
                  {selectedColumns.includes("message") && (
                    <TableCell className="px-4 py-3 text-sm text-gray-600 max-w-sm truncate">{n.message}</TableCell>
                  )}
                  {selectedColumns.includes("recipient") && (
                    <TableCell className="px-4 py-3 text-sm">
                      {n.recipientUser?.first_name} {n.recipientUser?.last_name}
                    </TableCell>
                  )}
                  {selectedColumns.includes("read") && (
                    <TableCell className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${n.read ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                        }`}>
                        {n.read ? "Read" : "Unread"}
                      </span>
                    </TableCell>
                  )}
                  {selectedColumns.includes("actions") && (
                    <TableCell className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 px-2 bg-primary text-primary-foreground hover:bg-primary/90">
                            Action <ChevronDown className="ml-1 h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => toast.info(n.message)}>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(n)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(n.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={selectedColumns.length}
                  className="h-24 text-center text-gray-500"
                >
                  No notifications found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
  const [searchTerm, setSearchTerm] = useState("");

  const columnOptions = [
    { value: "id", label: "ID" },
    { value: "date", label: "Date" },
    { value: "action", label: "Action" },
    { value: "actor", label: "Actor" },
    { value: "details", label: "Details" },
    { value: "parent", label: "Parent" },
    { value: "actions", label: "Actions" },
  ];

  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    columnOptions.map((col) => col.value)
  );

  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const items = useMemo(() => {
    const filtered = (activities ?? []).filter(
      (a) => a.type === type && String(a.referenceId) === String(referenceId)
    );
    if (!searchTerm) return filtered;
    return filtered.filter((a) =>
      a.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.actorUser?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.actorUser?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activities, type, referenceId, searchTerm]);

  if (error) return <div className="text-red-500 py-4">Error loading activities</div>;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Skeleton className="h-10 w-48" />
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto order-2 sm:order-1">
              <Skeleton className="h-10 w-full sm:w-24" />
              <Skeleton className="h-10 w-full sm:w-32" />
            </div>
            <div className="w-full sm:w-auto order-1 sm:order-2">
              <Skeleton className="h-10 w-full sm:w-48" />
            </div>
          </div>
        </div>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-primary">
              <TableRow>
                {columnOptions.map((col) => (
                  <TableHead key={col.value} className="text-white">
                    <Skeleton className="h-4 w-16 bg-primary/50" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  {columnOptions.map((col) => (
                    <TableCell key={col.value}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (a: AppActivity) => {
    setEditing(a);
    setShowForm(true);
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Delete this activity log?")) return;
    try {
      await deleteActivity.mutateAsync(id as any);
      toast.success("Activity deleted");
    } catch {
      toast.error("Failed to delete activity");
    }
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
        <h2 className="text-2xl font-bold text-gray-800">Activity Logs</h2>
        <span className="text-sm text-gray-400 font-medium">({items.length} total)</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="w-full sm:w-auto order-1 sm:order-2">
            <GenericDownloads
              data={items}
              title="Activity_Logs"
              columns={downloadColumns}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto order-2 sm:order-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 w-full sm:w-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="start">
                <div className="space-y-1">
                  {columnOptions.map((col) => (
                    <div key={col.value} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded">
                      <Checkbox
                        id={`col-act-${col.value}`}
                        checked={selectedColumns.includes(col.value)}
                        onCheckedChange={() => toggleColumn(col.value)}
                      />
                      <label htmlFor={`col-act-${col.value}`} className="text-sm cursor-pointer flex-1">
                        {col.label}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Button
              size="sm"
              className="h-9 bg-cyan-700 hover:bg-cyan-800 w-full sm:w-auto"
              onClick={openCreate}
            >
              <PlusIcon className="mr-2 h-4 w-4" /> New
            </Button>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search activity logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 w-full"
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

      <div className="overflow-x-auto rounded-md border shadow-sm">
        <Table>
          <TableHeader className="bg-primary">
            <TableRow className="hover:bg-primary/90">
              {columnOptions
                .filter((col) => selectedColumns.includes(col.value))
                .map((col) => (
                  <TableHead key={col.value} className="text-white font-semibold whitespace-nowrap px-4 py-3">
                    {col.label}
                  </TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? (
              items.map((a, idx) => (
                <TableRow key={a.id} className="hover:bg-gray-50">
                  {selectedColumns.includes("id") && (
                    <TableCell className="px-4 py-3 text-gray-500">{idx + 1}</TableCell>
                  )}
                  {selectedColumns.includes("date") && (
                    <TableCell className="px-4 py-3 text-sm">{formatDate(a.date)}</TableCell>
                  )}
                  {selectedColumns.includes("action") && (
                    <TableCell className="px-4 py-3 font-medium text-gray-900">{a.action}</TableCell>
                  )}
                  {selectedColumns.includes("actor") && (
                    <TableCell className="px-4 py-3 text-sm">
                      {a.actorUser?.first_name} {a.actorUser?.last_name}
                    </TableCell>
                  )}
                  {selectedColumns.includes("details") && (
                    <TableCell className="px-4 py-3 text-sm text-gray-600 max-w-sm truncate">
                      {a.details ?? "-"}
                    </TableCell>
                  )}
                  {selectedColumns.includes("parent") && (
                    <TableCell className="px-4 py-3 text-sm text-gray-500">
                      {a.parentActivityId ?? "-"}
                    </TableCell>
                  )}
                  {selectedColumns.includes("actions") && (
                    <TableCell className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 px-2 bg-cyan-700 text-white hover:bg-cyan-800">
                            Action <ChevronDown className="ml-1 h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => toast.info(a.action)}>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(a)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(a.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={selectedColumns.length}
                  className="h-24 text-center text-gray-500"
                >
                  No activity logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
