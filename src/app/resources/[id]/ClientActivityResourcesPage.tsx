"use client";

import { useState } from "react";
import {
  Package,
  Hammer,
  Users,
  ArrowRight,
  ClipboardList,
  Home,
  ChevronRight,
} from "lucide-react";
import { useActivity } from "@/hooks/useActivities";
import { useTask } from "@/hooks/useTasks";
import { useProject } from "@/hooks/useProjects";
import { useRequests } from "@/hooks/useRequests";
import { useQueries } from "@tanstack/react-query";
import { fetchMaterialById } from "@/hooks/useMaterials";
import { fetchEquipmentById } from "@/hooks/useEquipments";
import { fetchLaborById } from "@/hooks/useLabors";
import MaterialsTable from "@/components/resources/MaterialsTable";
import EquipmentTable from "@/components/resources/EquipmentTable";
import LaborTable from "@/components/resources/LaborTable";
import LoadingSkeleton from "./loading";
import { formatDate } from "@/utils/helper";
import { Material } from "@/types/material";
import { Equipment } from "@/types/equipment";
import { Labor } from "@/types/labor";
import Link from "next/link";

interface ClientActivityResourcesPageProps {
  activityId: string;
}

export default function ClientActivityResourcesPage({
  activityId,
}: ClientActivityResourcesPageProps) {
  // Fetch core data
  const { data: activity, isLoading: isActivityLoading } =
    useActivity(activityId);
  const taskId = activity?.task_id ?? "";
  const { data: task, isLoading: isTaskLoading } = useTask(taskId);
  const projectId = task?.project_id ?? "";
  const { data: project, isLoading: isProjectLoading } = useProject(projectId);
  const {
    data: requests = [],
    isLoading: isRequestsLoading,
    error: requestsError,
  } = useRequests();

  // Flatten IDs
  const materialIds = requests.flatMap((r) => r.materialIds ?? []);
  const equipmentIds = requests.flatMap((r) => r.equipmentIds ?? []);
  const laborIds = requests.flatMap((r) => r.laborIds ?? []);

  // Batch-fetch resources
  const materialQueries = useQueries({
    queries: materialIds.map((id) => ({
      queryKey: ["material", id],
      queryFn: () => fetchMaterialById(id),
      enabled: !!id,
    })),
  });
  const equipmentQueries = useQueries({
    queries: equipmentIds.map((id) => ({
      queryKey: ["equipment", id],
      queryFn: () => fetchEquipmentById(id),
      enabled: !!id,
    })),
  });
  const laborQueries = useQueries({
    queries: laborIds.map((id) => ({
      queryKey: ["labor", id],
      queryFn: () => fetchLaborById(id),
      enabled: !!id,
    })),
  });

  // Extract data + loading flags
  const materials = materialQueries
    .map((q) => q.data)
    .filter((m): m is Material => !!m);
  const isMaterialsLoading = materialQueries.some((q) => q.isLoading);

  const equipments = equipmentQueries
    .map((q) => q.data)
    .filter((e): e is Equipment => !!e);
  const isEquipmentsLoading = equipmentQueries.some((q) => q.isLoading);

  const labors = laborQueries.map((q) => q.data).filter((l): l is Labor => !!l);
  const isLaborsLoading = laborQueries.some((q) => q.isLoading);

  // Combined loading
  const isLoading =
    isActivityLoading ||
    isRequestsLoading ||
    isMaterialsLoading ||
    isEquipmentsLoading ||
    isLaborsLoading;

  // Tabs
  const [activeTab, setActiveTab] = useState<
    "materials" | "equipment" | "labor"
  >("materials");
  // Error & missing-data
  if (requestsError)
    return (
      <div className="p-6">
        <div className="mb-4">
          <p className="text-gray-500 text-sm">Home</p>
        </div>
        <div className="text-center text-red-500 mt-10">
          Error loading requests: {requestsError.message}
        </div>
      </div>
    );
  if (!activity)
    return (
      <div className="p-6">
        <div className="mb-4">
          <p className="text-gray-500 text-sm">Home</p>
        </div>
        <div className="text-center text-red-500 mt-10">
          Activity not found.
        </div>
      </div>
    );

  const renderContent = () => {
    switch (activeTab) {
      case "materials":
        return <MaterialsTable materials={materials} />;
      case "equipment":
        return <EquipmentTable equipment={equipments} />;
      case "labor":
        return <LaborTable labor={labors} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <nav
        className="flex items-center text-sm text-gray-500 mb-4"
        aria-label="Breadcrumb"
      >
        <ol className="inline-flex items-center space-x-2">
          <li>
            <Link
              href="/"
              className="inline-flex items-center hover:text-gray-700"
            >
              <Home className="w-4 h-4 mr-1" />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </li>
          <li aria-current="page">
            <span className="inline-flex items-center font-medium text-gray-700">
              Resources
            </span>
          </li>
        </ol>
      </nav>

      <div className="p-6 bg-white shadow-lg rounded-2xl">
        {/* Show skeleton if loading, else actual UI */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-600 to-blue-500 text-white rounded-lg shadow-md">
              <ClipboardList size={28} className="text-white" />
              <h2 className="text-2xl font-bold">{activity.activity_name}</h2>
            </div>

            {/* Project & Task Info */}
            <div className="mt-6 flex flex-col md:flex-row md:items-center md:gap-10">
              {isProjectLoading ? (
                <p className="text-gray-600 mt-2">Loading project...</p>
              ) : project ? (
                <div className="flex-1 p-4 bg-white shadow rounded-xl">
                  <p className="text-cyan-700 font-bold">Project</p>
                  <p className="text-gray-800 text-lg font-medium">
                    {project.title}
                  </p>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                    <span>{formatDate(project.start_date)}</span>
                    <ArrowRight size={16} />
                    <span>{formatDate(project.end_date)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-red-500 mt-2">Project not found.</p>
              )}

              {isTaskLoading ? (
                <p className="text-gray-600 mt-2">Loading task...</p>
              ) : task ? (
                <div className="flex-1 p-4 bg-white shadow rounded-xl">
                  <p className="text-blue-700 font-bold">Task</p>
                  <p className="text-gray-800 text-lg font-medium">
                    {task.task_name}
                  </p>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                    <span>{formatDate(task.start_date)}</span>
                    <ArrowRight size={16} />
                    <span>{formatDate(task.end_date)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-red-500 mt-2">Task not found.</p>
              )}
            </div>

            {/* Tabs */}
            <div className="flex justify-start mt-6">
              {[
                {
                  name: "Materials",
                  icon: <Package size={20} />,
                  key: "materials",
                  color: "text-red-500",
                },
                {
                  name: "Equipment",
                  icon: <Hammer size={20} />,
                  key: "equipment",
                  color: "text-green-500",
                },
                {
                  name: "Labor",
                  icon: <Users size={20} />,
                  key: "labor",
                  color: "text-blue-500",
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`flex items-center gap-4 mr-2 px-4 py-2 text-sm font-medium focus:outline-none transition-all ${
                    activeTab === tab.key
                      ? "border-gray-800 text-gray-800"
                      : "text-gray-500 hover:text-gray-700 bg-gray-200"
                  }`}
                  onClick={() => setActiveTab(tab.key as "equipment" | "labor" | "materials")}
                >
                  <span className={tab.color}>{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-4">{renderContent()}</div>
          </>
        )}
      </div>
    </div>
  );
}
