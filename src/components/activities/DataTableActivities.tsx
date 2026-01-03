"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useActivities,
  useDeleteActivity,
  useUpdateActivity,
} from "@/hooks/useActivities";
import { Activity, UpdateActivityInput } from "@/types/activity";
import { getDuration } from "@/utils/helper";
import { formatDate as format } from "@/utils/dateUtils";
import EditActivityForm from "../forms/EditActivityForm";
import ConfirmModal from "../common/ui/ConfirmModal";
import ManageActivityForm from "../forms/ManageActivityForm";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaEdit, FaTrash, FaEye, FaTasks } from "react-icons/fa";
import ProfileAvatar from "../common/ProfileAvatar";
import { useUsers } from "@/hooks/useUsers";
import { ReusableTable, ColumnConfig } from "../common/ReusableTable";
import { GenericFilter, FilterField } from "../common/GenericFilter";

const priorityBadgeClasses: Record<Activity["priority"], string> = {
  Critical: "bg-destructive/10 text-destructive",
  High: "bg-orange-100 text-orange-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-primary/10 text-primary",
};
const statusBadgeClasses: Record<Activity["status"], string> = {
  "Not Started": "bg-muted text-muted-foreground",
  Started: "bg-primary/10 text-primary",
  InProgress: "bg-yellow-100 text-yellow-800",
  Canceled: "bg-destructive/10 text-destructive",
  Onhold: "bg-amber-100 text-amber-800",
  Completed: "bg-primary/20 text-primary",
};

interface DataTableActivitiesProps {
  externalFilters?: Record<string, any>;
}

const DataTableActivities: React.FC<DataTableActivitiesProps> = ({ externalFilters }) => {
  const { data: activities = [], isLoading, isError } = useActivities();
  const { mutate: deleteActivity } = useDeleteActivity();
  const { mutate: updateActivity } = useUpdateActivity();
  const { data: users } = useUsers();
  const router = useRouter();

  // Modal state
  const [showEditForm, setShowEditForm] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);
  const [showManageForm, setShowManageForm] = useState(false);
  const [activityToManage, setActivityToManage] = useState<UpdateActivityInput | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleDeleteActivityClick = (id: string) => {
    setSelectedActivityId(id);
    setIsDeleteModalOpen(true);
  };
  const handleDeleteActivity = () => {
    if (selectedActivityId) {
      deleteActivity(selectedActivityId);
      setIsDeleteModalOpen(false);
    }
  };
  const handleViewActivity = (id: string) => router.push(`/activities/${id}`);
  const handleEditClick = (activity: Activity) => {
    setActivityToEdit(activity);
    setShowEditForm(true);
  };
  const handleEditSubmit = (data: UpdateActivityInput | FormData) => {
    updateActivity(data);
    setShowEditForm(false);
  };
  const handleManageClick = (activity: Activity) => {
    setActivityToManage(activity as any);
    setShowManageForm(true);
  };

  const filtered = activities.filter((activity) => {
    // Local search
    const matchesSearch =
      !searchTerm ||
      activity.activity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.task?.project?.clientInfo?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.task?.project?.projectSite?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!externalFilters) return matchesSearch;

    // External filters logic
    const matchesAdvancedStatus =
      !externalFilters.status ||
      externalFilters.status.length === 0 ||
      externalFilters.status.includes(activity.status);

    const matchesAdvancedPriority =
      !externalFilters.priority ||
      externalFilters.priority.length === 0 ||
      externalFilters.priority.includes(activity.priority);

    const matchesDateRange = (() => {
      if (!externalFilters.dateRange?.from) return true;
      const actStart = new Date(activity.start_date);
      const actEnd = new Date(activity.end_date);
      const filterStart = new Date(externalFilters.dateRange.from);
      const filterEnd = externalFilters.dateRange.to ? new Date(externalFilters.dateRange.to) : filterStart;

      // Activity overlaps with filter range
      return (actStart <= filterEnd && actEnd >= filterStart);
    })();

    return matchesSearch && matchesAdvancedStatus && matchesAdvancedPriority && matchesDateRange;
  });

  const columns: ColumnConfig<Activity>[] = [
    { key: "no", label: "No", render: (_, index) => index + 1, className: "text-sm text-gray-500 border-r border-gray-100" },
    {
      key: "activity_name",
      label: "Activity",
      className: "font-medium text-primary border-r border-gray-100",
      render: (activity) => (
        <Link href={`/activities/${activity.id}`} className="hover:underline">
          {activity.activity_name.charAt(0).toUpperCase() + activity.activity_name.slice(1)}
        </Link>
      ),
    },
    {
      key: "assignedUsers",
      label: "Assigned To",
      className: "border-r border-gray-100",
      render: (activity) => (
        activity.assignedUsers?.length ? (
          <div className="flex -space-x-2">
            {activity.assignedUsers.map((u) => (
              <ProfileAvatar key={u.id} user={u} />
            ))}
          </div>
        ) : (
          <span className="text-gray-400">N/A</span>
        )
      ),
    },
    {
      key: "priority",
      label: "Priority",
      className: "border-r border-gray-100",
      render: (activity) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${priorityBadgeClasses[activity.priority]}`}>
          {activity.priority}
        </span>
      ),
    },
    { key: "quantity", label: "Quantity", className: "text-sm text-gray-600 border-r border-gray-100 font-medium", render: (a) => a.quantity ?? "–" },
    { key: "unit", label: "Unit", className: "text-sm text-gray-600 border-r border-gray-100 font-medium" },
    { key: "start_date", label: "Start Date", className: "text-sm text-gray-500 border-r border-gray-100", render: (a) => format(a.start_date) },
    { key: "end_date", label: "End Date", className: "text-sm text-gray-500 border-r border-gray-100", render: (a) => format(a.end_date) },
    { key: "duration", label: "Duration", className: "text-sm text-gray-500 border-r border-gray-100 italic", render: (a) => getDuration(a.start_date, a.end_date) },
    {
      key: "progress",
      label: "Progress",
      className: "border-r border-gray-100",
      render: (activity) => (
        <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden w-24">
          <div className="absolute h-full bg-primary transition-all duration-500" style={{ width: `${activity.progress}%` }} />
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-gray-700 drop-shadow-sm">
            {activity.progress}%
          </span>
        </div>
      ),
    },
    {
      key: "materials",
      label: "Materials",
      colSpan: 1, // Will be handled by ReusableTable special resources cost logic
      className: "text-sm font-semibold text-primary border-r border-gray-100",
      render: (a) => a.requests?.reduce((sum, req) => sum + (req.materialCount || 0), 0) || 0,
    },
    {
      key: "equipments",
      label: "Equipments",
      colSpan: 1,
      className: "text-sm font-semibold text-primary border-r border-gray-100",
      render: (a) => a.requests?.reduce((sum, req) => sum + (req.equipmentCount || 0), 0) || 0,
    },
    {
      key: "labors",
      label: "Labors",
      colSpan: 1,
      className: "text-sm font-semibold text-primary border-r border-gray-100",
      render: (a) => a.requests?.reduce((sum, req) => sum + (req.laborCount || 0), 0) || 0,
    },
    {
      key: "request",
      label: "Request Resource",
      className: "border-r border-gray-100",
      render: (activity) => (
        <Link href={`/resources/${activity.id}`} className="inline-flex items-center text-white bg-emerald-600 px-3 py-1 rounded text-[10px] font-bold uppercase hover:bg-emerald-700 transition-colors shadow-sm">
          Request
        </Link>
      ),
    },
    {
      key: "status",
      label: "Status",
      className: "border-r border-gray-100",
      render: (activity) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusBadgeClasses[activity.status]}`}>
          {activity.status}
        </span>
      ),
    },
    { key: "approvalStatus", label: "Approval", className: "text-sm font-medium text-gray-600 border-r border-gray-100" },
    {
      key: "actions",
      label: "Actions",
      render: (activity) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-primary-foreground p-0 bg-primary hover:bg-primary/90 h-8 px-3">
              Action <ChevronDown className="ml-1 w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewActivity(activity.id)}>
              <FaEye className="mr-2 h-4 w-4" /> Quick View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditClick(activity)}>
              <FaEdit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteActivityClick(activity.id)}>
              <FaTrash className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleManageClick(activity)}>
              <FaTasks className="mr-2 h-4 w-4" /> Manage
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];


  return (
    <>
      <ReusableTable
        title="Planned Activities"
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        searchTerm=""
        onSearchChange={() => { }}
        emptyMessage="No activities found."
        hideTitle
        hideControls
      />

      {showEditForm && activityToEdit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EditActivityForm
              onClose={() => setShowEditForm(false)}
              onSubmit={handleEditSubmit}
              activity={activityToEdit}
              users={users}
            />
          </div>
        </div>
      )}
      {showManageForm && activityToManage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ManageActivityForm
              onClose={() => setShowManageForm(false)}
              activity={activityToManage}
            />
          </div>
        </div>
      )}
      {isDeleteModalOpen && (
        <ConfirmModal
          isVisible={isDeleteModalOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this activity?"
          showInput={false}
          confirmText="DELETE"
          confirmButtonText="Delete"
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteActivity}
        />
      )}
    </>
  );
};

export default DataTableActivities;
