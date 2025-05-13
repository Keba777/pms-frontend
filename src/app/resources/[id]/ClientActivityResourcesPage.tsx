"use client";

import { useState, useEffect } from "react";
import { ArrowRight, ClipboardList, Home, ChevronRight } from "lucide-react";
import Select from "react-select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActivity } from "@/hooks/useActivities";
import { useTask } from "@/hooks/useTasks";
import { useProject } from "@/hooks/useProjects";
import { useMaterials } from "@/hooks/useMaterials";
import { useEquipments } from "@/hooks/useEquipments";
import { useLabors } from "@/hooks/useLabors";
import { useDepartments } from "@/hooks/useDepartments";
import { useSites } from "@/hooks/useSites";
import { useCreateRequest } from "@/hooks/useRequests";
import { useAuthStore } from "@/store/authStore";
import MaterialsTable from "@/components/resources/MaterialsTable";
import EquipmentTable from "@/components/resources/EquipmentTable";
import LaborTable from "@/components/resources/LaborTable";
import LoadingSkeleton from "./loading";
import { formatDate } from "@/utils/helper";
import { CreateRequestInput } from "@/types/request";

interface ClientActivityResourcesPageProps {
  activityId: string;
}

interface SelectedItem {
  type: "Material" | "Equipment" | "Labor";
  id: string;
  name: string;
  count: number;
}

export default function ClientActivityResourcesPage({
  activityId,
}: ClientActivityResourcesPageProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  // Fetch data hooks
  const { data: activity, isLoading: isActivityLoading } =
    useActivity(activityId);
  const taskId = activity?.task_id ?? "";
  const { data: task, isLoading: isTaskLoading } = useTask(taskId);
  const projectId = task?.project_id ?? "";
  const { data: project, isLoading: isProjectLoading } = useProject(projectId);
  const { data: departments = [], isLoading: isDeptLoading } = useDepartments();
  const { data: sites = [], isLoading: isSitesLoading } = useSites();
  const { data: materials = [], isLoading: isMaterialsLoading } =
    useMaterials();
  const { data: equipments = [], isLoading: isEquipmentsLoading } =
    useEquipments();
  const { data: labors = [], isLoading: isLaborsLoading } = useLabors();

  // State management
  const [selMats, setSelMats] = useState<string[]>([]);
  const [matCounts, setMatCounts] = useState<Record<string, number>>({});
  const [selEquips, setSelEquips] = useState<string[]>([]);
  const [equipCounts, setEquipCounts] = useState<Record<string, number>>({});
  const [selLabors, setSelLabors] = useState<string[]>([]);
  const [labCounts, setLabCounts] = useState<Record<string, number>>({});
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedSite, setSelectedSite] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "materials" | "equipment" | "labor"
  >("materials");

  // Handle selection with default count
  const handleSelect =
    (
      setSelected: React.Dispatch<React.SetStateAction<string[]>>,
      setCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>
    ) =>
    (id: string, checked: boolean) => {
      setSelected((prev) =>
        checked ? [...prev, id] : prev.filter((x) => x !== id)
      );
      setCounts((prev) => ({ ...prev, [id]: checked ? 1 : 0 }));
    };

  // Prepare selected items for step 2
  const selectedItems: SelectedItem[] = [
    ...selMats.map((id) => ({
      type: "Material" as const,
      id,
      name: materials.find((m) => m.id === id)?.item || "",
      count: matCounts[id] || 1,
    })),
    ...selEquips.map((id) => ({
      type: "Equipment" as const,
      id,
      name: equipments.find((e) => e.id === id)?.item || "",
      count: equipCounts[id] || 1,
    })),
    ...selLabors.map((id) => ({
      type: "Labor" as const,
      id,
      name: labors.find((l) => l.id === id)?.role || "",
      count: labCounts[id] || 1,
    })),
  ];

  // Handle count changes in step 2
  const handleCountChange = (
    id: string,
    type: SelectedItem["type"],
    value: number
  ) => {
    const setters = {
      Material: setMatCounts,
      Equipment: setEquipCounts,
      Labor: setLabCounts,
    };
    const numericValue = Math.max(1, Number(value));
    setters[type]((prev) => ({ ...prev, [id]: numericValue }));
  };

  // Handle request submission
  const { mutate: createReq, isPending: isReqLoading } = useCreateRequest();
  const handleRequest = () => {
    if (!activity) return;

    // Convert counts to numbers
    const materialCounts = Object.values(matCounts).reduce((a, b) => a + b, 0);
    const equipmentCounts = Object.values(equipCounts).reduce(
      (a, b) => a + b,
      0
    );
    const laborCounts = Object.values(labCounts).reduce((a, b) => a + b, 0);

    const payload: CreateRequestInput = {
      userId: useAuthStore.getState().user?.id || "",
      siteId: selectedSite,
      departmentId: selectedDept,
      materialIds: selMats,
      equipmentIds: selEquips,
      laborIds: selLabors,
      materialCount: materialCounts,
      equipmentCount: equipmentCounts,
      laborCount: laborCounts,
      status: "Pending",
      activityId: activity.id,
    };

    createReq(payload, {
      onSuccess: () => router.push("/resource-requests"),
    });
  };

  // Set initial site selection
  useEffect(() => {
    if (sites.length > 0 && !selectedSite) {
      setSelectedSite(sites[0].id);
    }
  }, [sites, selectedSite]);

  // Set initial department selection
  useEffect(() => {
    if (departments.length > 0 && !selectedDept) {
      setSelectedDept(departments[0].id);
    }
  }, [departments, selectedDept]);

  // Loading state
  const isLoading = [
    isActivityLoading,
    isTaskLoading,
    isProjectLoading,
    isDeptLoading,
    isSitesLoading,
    isMaterialsLoading,
    isEquipmentsLoading,
    isLaborsLoading,
  ].some(Boolean);

  if (isLoading) return <LoadingSkeleton />;

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
          <h2 className="text-2xl font-bold">
            {activity?.activity_name || "Activity Name Unavailable"}
          </h2>
        </div>

        {/* Project & Task Cards */}
        <div className="mt-4 flex flex-col md:flex-row md:gap-10">
          {project && (
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
          )}
          {task && (
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
          )}
        </div>

        {/* Step 1: Resource Selection */}
        {step === 1 && (
          <>
            <div className="mt-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {["materials", "equipment", "labor"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() =>
                      setActiveTab(tab as "materials" | "equipment" | "labor")
                    }
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab
                        ? "border-cyan-500 text-cyan-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            <div className="mt-6">
              {activeTab === "materials" && (
                <MaterialsTable
                  materials={materials}
                  selectedIds={selMats}
                  onSelect={handleSelect(setSelMats, setMatCounts)}
                />
              )}
              {activeTab === "equipment" && (
                <EquipmentTable
                  equipment={equipments}
                  selectedIds={selEquips}
                  onSelect={handleSelect(setSelEquips, setEquipCounts)}
                />
              )}
              {activeTab === "labor" && (
                <LaborTable
                  labor={labors}
                  selectedIds={selLabors}
                  onSelect={handleSelect(setSelLabors, setLabCounts)}
                />
              )}
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800"
                disabled={!selectedItems.length}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 2: Review and Approval */}
        {step === 2 && (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Request Summary</h3>
              <table className="min-w-full border-collapse border border-gray-200">
                <thead className="bg-cyan-700 text-white text-center">
                  <tr>
                    <th className="border px-3 py-2">Type</th>
                    <th className="border px-3 py-2">Item</th>
                    <th className="border px-3 py-2">Req Qty</th>
                    <th className="border px-3 py-2">Min Qty</th>
                  
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.map((item) => (
                    <tr
                      key={`${item.type}-${item.id}`}
                      className="border-b text-center"
                    >
                      <td className="border px-3 py-2">{item.type}</td>
                      <td className="border px-3 py-2">{item.name}</td>
                      <td className="border px-3 py-2">
                        <input
                          type="number"
                          min="1"
                          value={item.count}
                          onChange={(e) =>
                            handleCountChange(
                              item.id,
                              item.type,
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-20 px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="border px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          className="w-20 px-2 py-1 border rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Site and Department Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Site</label>
                <Select
                  options={sites.map((s) => ({ value: s.id, label: s.name }))}
                  value={
                    sites.find((s) => s.id === selectedSite)
                      ? {
                          value: selectedSite,
                          label: sites.find((s) => s.id === selectedSite)?.name,
                        }
                      : null
                  }
                  onChange={(option) => setSelectedSite(option?.value || "")}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Department
                </label>
                <Select
                  options={departments.map((d) => ({
                    value: d.id,
                    label: d.name,
                  }))}
                  value={
                    departments.find((d) => d.id === selectedDept)
                      ? {
                          value: selectedDept,
                          label: departments.find((d) => d.id === selectedDept)
                            ?.name,
                        }
                      : null
                  }
                  onChange={(option) => setSelectedDept(option?.value || "")}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Back
              </button>
              <button
                onClick={handleRequest}
                className="px-6 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800"
                disabled={isReqLoading || !selectedSite || !selectedDept}
              >
                {isReqLoading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
