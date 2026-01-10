"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { FaEdit, FaEye } from "react-icons/fa";
import {
  useActivities,
  useUpdateActivityActuals,
} from "@/hooks/useActivities";
import { Activity, Actuals } from "@/types/activity";
import { ReusableTable, ColumnConfig } from "../common/ReusableTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/dateUtils";
import Link from "next/link";
import { toast } from "react-toastify";

interface ActualActivityTableProps {
  taskId?: string;
}

interface ExtendedActivity extends Activity {
  actuals: Actuals;
}

const statusBadgeClasses: Record<string, string> = {
  "Not Started": "bg-gray-100 text-gray-800",
  Started: "bg-blue-100 text-blue-800",
  InProgress: "bg-yellow-100 text-yellow-800",
  Onhold: "bg-amber-100 text-amber-800",
  Canceled: "bg-red-100 text-red-800",
  Completed: "bg-green-100 text-green-800",
};

const ActualActivityTable: React.FC<ActualActivityTableProps> = ({ taskId }) => {
  const { data: activities, isLoading, isError } = useActivities();
  const { mutateAsync: updateActivityActuals } = useUpdateActivityActuals();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const defaultActuals: Actuals = {
    quantity: null,
    unit: null,
    start_date: null,
    end_date: null,
    progress: null,
    status: null,
    labor_cost: null,
    material_cost: null,
    equipment_cost: null,
    total_cost: null,
    work_force: null,
    machinery_list: null,
    materials_list: null,
  };

  const extendedActivities: ExtendedActivity[] = useMemo(() => {
    if (!activities) return [];
    const base = !taskId
      ? activities
      : activities.filter((a) => a.task_id === taskId);

    return base.map((act) => ({
      ...act,
      actuals: { ...defaultActuals, ...(act.actuals || {}) },
    }));
  }, [activities, taskId]);

  const sanitizeActualsForApi = (raw: any): Actuals => {
    const safe = { ...(raw || {}) } as any;
    const toIso = (v: any) => {
      if (!v && v !== 0) return null;
      try {
        const d = new Date(v);
        if (isNaN(d.getTime())) return null;
        return d.toISOString();
      } catch {
        return null;
      }
    };
    safe.start_date = toIso(safe.start_date);
    safe.end_date = toIso(safe.end_date);

    const toNumberOrNull = (v: any) => {
      if (v === null || v === undefined || v === "") return null;
      const n = Number(v);
      return isNaN(n) ? null : n;
    };
    safe.labor_cost = toNumberOrNull(safe.labor_cost);
    safe.material_cost = toNumberOrNull(safe.material_cost);
    safe.equipment_cost = toNumberOrNull(safe.equipment_cost);
    safe.total_cost = toNumberOrNull(safe.total_cost);
    safe.quantity = toNumberOrNull(safe.quantity);
    safe.progress = toNumberOrNull(safe.progress);
    safe.unit = safe.unit ?? null;
    safe.status = safe.status ?? null;
    return safe as Actuals;
  };

  const handleSaveActuals = async (activitiesToUpdate: ExtendedActivity[]) => {
    try {
      await Promise.all(
        activitiesToUpdate.map((act) => {
          const sanitized = sanitizeActualsForApi(act.actuals);
          return updateActivityActuals({ id: act.id, actuals: sanitized });
        })
      );
      toast.success("Activity actuals updated successfully");
    } catch (error) {
      console.error("Failed to update activity actuals:", error);
      toast.error("Failed to update activity actuals");
    }
  };

  const columns: ColumnConfig<ExtendedActivity>[] = [
    {
      key: "id",
      label: "ID",
      render: (_, index) => `RC${String(index + 1).padStart(3, "0")}`,
    },
    {
      key: "activity_name",
      label: "Activity",
      render: (act) => (
        <Link href={`/activities/${act.id}`} className="text-primary hover:underline font-medium">
          {act.activity_name}
        </Link>
      ),
    },
    {
      key: "actuals.unit",
      label: "Unit",
      editable: true,
      render: (act) => act.actuals?.unit || "---",
    },
    {
      key: "actuals.quantity",
      label: "Qty",
      editable: true,
      inputType: "number",
      render: (act) => act.actuals?.quantity ?? "---",
    },
    {
      key: "actuals.start_date",
      label: "Start Date",
      editable: true,
      inputType: "date",
      render: (act) => (act.actuals?.start_date ? formatDate(act.actuals.start_date) : "---"),
    },
    {
      key: "actuals.end_date",
      label: "End Date",
      editable: true,
      inputType: "date",
      render: (act) => (act.actuals?.end_date ? formatDate(act.actuals.end_date) : "---"),
    },
    {
      key: "duration",
      label: "Duration",
      render: (act) => {
        const start = act.actuals?.start_date;
        const end = act.actuals?.end_date;
        if (!start || !end) return "---";
        const diff = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 3600 * 24));
        return `${diff} Days`;
      },
    },
    {
      key: "actuals.progress",
      label: "Progress",
      editable: true,
      inputType: "number",
      render: (act) => (
        <div className="relative h-6 w-full bg-gray-200 rounded overflow-hidden text-center text-[10px] leading-6 font-bold">
          <div
            className="absolute h-full bg-primary flex items-center justify-center text-white transition-all"
            style={{ width: `${act.actuals?.progress || 0}%` }}
          >
            {act.actuals?.progress || 0}%
          </div>
          <span className="relative z-10">{act.actuals?.progress || 0}%</span>
        </div>
      ),
    },
    {
      key: "actuals.status",
      label: "Status",
      editable: true,
      inputType: "select",
      options: [
        { label: "Not Started", value: "Not Started" },
        { label: "Started", value: "Started" },
        { label: "InProgress", value: "InProgress" },
        { label: "Onhold", value: "Onhold" },
        { label: "Canceled", value: "Canceled" },
        { label: "Completed", value: "Completed" },
      ],
      render: (act) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusBadgeClasses[act.actuals?.status || ""] || "bg-gray-100 text-gray-800"}`}
        >
          {act.actuals?.status || "---"}
        </span>
      ),
    },
    {
      key: "actuals.material_cost",
      label: "Material",
      groupName: "Costs",
      editable: true,
      inputType: "number",
      render: (act) => act.actuals?.material_cost ?? "---",
    },
    {
      key: "material_diff",
      label: "+/-",
      groupName: "Costs",
      render: (act) => {
        const diff = (act.actuals?.material_cost || 0) - (act.material_cost || 0);
        return (
          <span className={diff > 0 ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
            {diff.toFixed(2)}
          </span>
        );
      },
    },
    {
      key: "actuals.equipment_cost",
      label: "Equipments",
      groupName: "Costs",
      editable: true,
      inputType: "number",
      render: (act) => act.actuals?.equipment_cost ?? "---",
    },
    {
      key: "equipment_diff",
      label: "+/-",
      groupName: "Costs",
      render: (act) => {
        const diff = (act.actuals?.equipment_cost || 0) - (act.equipment_cost || 0);
        return (
          <span className={diff > 0 ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
            {diff.toFixed(2)}
          </span>
        );
      },
    },
    {
      key: "actuals.labor_cost",
      label: "Labor",
      groupName: "Costs",
      editable: true,
      inputType: "number",
      render: (act) => act.actuals?.labor_cost ?? "---",
    },
    {
      key: "labor_diff",
      label: "+/-",
      groupName: "Costs",
      render: (act) => {
        const diff = (act.actuals?.labor_cost || 0) - (act.labor_cost || 0);
        return (
          <span className={diff > 0 ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
            {diff.toFixed(2)}
          </span>
        );
      },
    },
    {
      key: "total_cost",
      label: "Total Cost",
      render: (act) => {
        const total = (act.actuals?.labor_cost || 0) + (act.actuals?.material_cost || 0) + (act.actuals?.equipment_cost || 0);
        return total.toFixed(2);
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (act, _, { toggleEdit }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="bg-primary text-white hover:bg-primary/90 h-8 px-3 text-xs">
              Action <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toggleEdit()}>
              <FaEdit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/activities/${act.id}`)}>
              <FaEye className="mr-2 h-4 w-4" /> View
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <ReusableTable
      title="Actual Activities"
      data={extendedActivities}
      columns={columns}
      isLoading={isLoading}
      isError={isError}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      placeholder="Search activities..."
      isEditable={true}
      onSave={handleSaveActuals}
      onRowSave={async (act) => handleSaveActuals([act])}
    />
  );
};

export default ActualActivityTable;
