"use client";

import { useState } from "react";
import {
  ArrowRight,
  ClipboardList,
  Home,
  ChevronRight,
} from "lucide-react";
import { useActivity } from "@/hooks/useActivities";
import { useTask } from "@/hooks/useTasks";
import { useProject } from "@/hooks/useProjects";
import { useMaterials } from "@/hooks/useMaterials";
import { useEquipments } from "@/hooks/useEquipments";
import { useLabors } from "@/hooks/useLabors";
import { useDepartments } from "@/hooks/useDepartments";
import Select, { GroupBase } from "react-select";
import MaterialsTable from "@/components/resources/MaterialsTable";
import EquipmentTable from "@/components/resources/EquipmentTable";
import LaborTable from "@/components/resources/LaborTable";
import LoadingSkeleton from "./loading";
import { formatDate } from "@/utils/helper";
import Link from "next/link";
import { CreateRequestInput } from "@/types/request";
import { useCreateRequest } from "@/hooks/useRequests";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

interface ClientActivityResourcesPageProps {
  activityId: string;
}

// Generic option type for react-select
interface SelectOption {
  value: string;
  label: string;
}

export default function ClientActivityResourcesPage({
  activityId,
}: ClientActivityResourcesPageProps) {
  const router = useRouter();

  const { data: activity, isLoading: isActivityLoading } =
    useActivity(activityId);
  const taskId = activity?.task_id ?? "";
  const { data: task, isLoading: isTaskLoading } = useTask(taskId);
  const projectId = task?.project_id ?? "";
  const { data: project, isLoading: isProjectLoading } = useProject(projectId);

  // Auth
  const user = useAuthStore((state) => state.user);
  const userId = user?.id ?? "";

  // Fetch departments
  const {
    data: departments = [],
    isLoading: isDeptLoading,
    error: deptError,
  } = useDepartments();
  const departmentOptions: SelectOption[] = departments.map((dep) => ({
    value: dep.id,
    label: dep.name,
  }));
  const [selectedDept, setSelectedDept] = useState<string>(
    departments[0]?.id || ""
  );

  // Fetch all resources
  const { data: materials = [], isLoading: isMaterialsLoading } =
    useMaterials();
  const { data: equipments = [], isLoading: isEquipmentsLoading } =
    useEquipments();
  const { data: labors = [], isLoading: isLaborsLoading } = useLabors();

  const isLoading =
    isActivityLoading ||
    isTaskLoading ||
    isProjectLoading ||
    isDeptLoading ||
    isMaterialsLoading ||
    isEquipmentsLoading ||
    isLaborsLoading;

  // Selection and quantities
  const [selMats, setSelMats] = useState<string[]>([]);
  const [matCounts, setMatCounts] = useState<Record<string, number>>({});
  const [selEquips, setSelEquips] = useState<string[]>([]);
  const [equipCounts, setEquipCounts] = useState<Record<string, number>>({});
  const [selLabors, setSelLabors] = useState<string[]>([]);
  const [laborCounts, setLaborCounts] = useState<Record<string, number>>({});

  const handleSelect =
    (setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    (id: string, checked: boolean) => {
      setter((prev) =>
        checked ? [...prev, id] : prev.filter((x) => x !== id)
      );
    };

  const handleCount =
    (setter: React.Dispatch<React.SetStateAction<Record<string, number>>>) =>
    (id: string, count: number) =>
      setter((prev) => ({ ...prev, [id]: count }));

  // Request mutation
  const { mutate: createReq, isPending: isReqLoading } = useCreateRequest();

  const handleRequest = () => {
    if (!activity) return;
    const payload: CreateRequestInput = {
      userId,
      departmentId: selectedDept,
      materialIds: selMats,
      equipmentIds: selEquips,
      laborIds: selLabors,
      materialCount: selMats.length,
      equipmentCount: selEquips.length,
      laborCount: selLabors.length,
      status: "Pending",
      activityId: activity.id,
    };
    createReq(payload, {
      onSuccess: () => {
        router.push("/resource-requests");
      },
    });
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-4">
        <ol className="inline-flex items-center space-x-2">
          <li>
            <Link
              href="/"
              className="inline-flex items-center hover:text-gray-700"
            >
              <Home className="w-4 h-4 mr-1" /> Home
            </Link>
          </li>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <li className="font-medium text-gray-700">Create Request</li>
        </ol>
      </nav>

      <div className="bg-white shadow-lg rounded-2xl p-6 space-y-6">
        {/* Activity header */}
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-600 to-blue-500 text-white rounded-lg">
          <ClipboardList size={28} />
          <h2 className="text-2xl font-bold">{activity?.activity_name}</h2>
        </div>

        {/* Project & Task */}
        <div className="mt-4 flex flex-col md:flex-row md:gap-10">
          {project ? (
            <div className="flex-1 p-4 bg-white shadow rounded-xl">
              <p className="text-cyan-700 font-bold">Project</p>
              <p className="text-gray-800 text-lg font-medium">
                {project.title}
              </p>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                {formatDate(project.start_date)}
                <ArrowRight size={16} />
                {formatDate(project.end_date)}
              </div>
            </div>
          ) : (
            <p className="text-red-500">Project not found.</p>
          )}

          {task ? (
            <div className="flex-1 p-4 bg-white shadow rounded-xl">
              <p className="text-blue-700 font-bold">Task</p>
              <p className="text-gray-800 text-lg font-medium">
                {task.task_name}
              </p>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                {formatDate(task.start_date)}
                <ArrowRight size={16} />
                {formatDate(task.end_date)}
              </div>
            </div>
          ) : (
            <p className="text-red-500">Task not found.</p>
          )}
        </div>

        {/* Department select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <Select<SelectOption, false, GroupBase<SelectOption>>
            options={departmentOptions}
            isLoading={isDeptLoading}
            value={
              departmentOptions.find((opt) => opt.value === selectedDept) ||
              null
            }
            onChange={(opt) => setSelectedDept(opt?.value || "")}
            placeholder="Select Department"
            className="w-full"
          />
          {deptError && (
            <p className="text-red-500 text-sm mt-1">
              Error loading departments
            </p>
          )}
        </div>

        {/* Tables */}
        <div className="mt-6 space-y-6">
          <MaterialsTable
            materials={materials}
            selectedIds={selMats}
            counts={matCounts}
            onSelect={handleSelect(setSelMats)}
            onCount={handleCount(setMatCounts)}
          />

          <EquipmentTable
            equipment={equipments}
            selectedIds={selEquips}
            counts={equipCounts}
            onSelect={handleSelect(setSelEquips)}
            onCount={handleCount(setEquipCounts)}
          />

          <LaborTable
            labor={labors}
            selectedIds={selLabors}
            counts={laborCounts}
            onSelect={handleSelect(setSelLabors)}
            onCount={handleCount(setLaborCounts)}
          />
        </div>

        {/* Request Button */}
        <div className="flex justify-end mt-4">
          <button
            disabled={isReqLoading}
            onClick={handleRequest}
            className="px-6 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800 disabled:opacity-50"
          >
            {isReqLoading ? "Requesting…" : "Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
