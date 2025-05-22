"use client";

import { useState, useEffect } from "react";
import { ClipboardList, Home, ChevronRight, ArrowRight } from "lucide-react";
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
import { CreateRequestInput } from "@/types/request";
import { formatDate } from "@/utils/helper";

interface ClientActivityResourcesPageProps {
  activityId: string;
}

export default function ClientActivityResourcesPage({
  activityId,
}: ClientActivityResourcesPageProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [activeTab, setActiveTab] = useState<
    "materials" | "equipment" | "labor"
  >("materials");
  const [requestType, setRequestType] = useState<
    "materials" | "equipment" | "labor"
  >("materials");

  // Data hooks
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

  // Selection
  const [selMats, setSelMats] = useState<string[]>([]);
  const [selEquips, setSelEquips] = useState<string[]>([]);
  const [selLabors, setSelLabors] = useState<string[]>([]);

  const [selectedSite, setSelectedSite] = useState<string>("");
  const [selectedDept, setSelectedDept] = useState<string>("");

  // Search term
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Counts for step 2
  const [materialCounts, setMaterialCounts] = useState<Record<string, number>>(
    {}
  );
  const [equipmentCounts, setEquipmentCounts] = useState<
    Record<string, number>
  >({});
  const [laborCounts, setLaborCounts] = useState<Record<string, number>>({});

  // Initialize counts when entering step 2
  useEffect(() => {
    if (step === 2) {
      if (requestType === "materials") {
        const init: Record<string, number> = {};
        selMats.forEach((id) => (init[id] = 1));
        setMaterialCounts(init);
      }
      if (requestType === "equipment") {
        const init: Record<string, number> = {};
        selEquips.forEach((id) => (init[id] = 1));
        setEquipmentCounts(init);
      }
      if (requestType === "labor") {
        const init: Record<string, number> = {};
        selLabors.forEach((id) => (init[id] = 1));
        setLaborCounts(init);
      }
    }
  }, [step, requestType, selMats, selEquips, selLabors]);

  // Selection handler
  const handleSelect =
    (setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    (id: string, checked: boolean) => {
      setter((prev) =>
        checked ? [...prev, id] : prev.filter((x) => x !== id)
      );
    };

  // Create Request
  const { mutate: createReq, isPending: isReqLoading } = useCreateRequest();
  const handleRequest = () => {
    if (!activity) return;
    const sum = (counts: Record<string, number>) =>
      Object.values(counts).reduce((a, b) => a + b, 0);

    const payload: CreateRequestInput = {
      userId: useAuthStore.getState().user?.id || "",
      siteId: selectedSite,
      departmentId: selectedDept,
      materialIds: requestType === "materials" ? selMats : [],
      equipmentIds: requestType === "equipment" ? selEquips : [],
      laborIds: requestType === "labor" ? selLabors : [],
      materialCount: sum(materialCounts),
      equipmentCount: sum(equipmentCounts),
      laborCount: sum(laborCounts),
      status: "Pending",
      activityId: activity.id,
    };
    createReq(payload, { onSuccess: () => router.push("/activities") });
  };

  useEffect(() => {
    if (sites.length > 0 && !selectedSite) {
      const hq = sites.find(
        (s) => s.id === "3269c7c0-a303-438e-bee4-71f5bdec22b2"
      );
      setSelectedSite(hq?.id ?? sites[0].id);
    }
  }, [sites, selectedSite]);
  useEffect(() => {
    if (departments.length > 0 && !selectedDept)
      setSelectedDept(departments[0].id);
  }, [departments, selectedDept]);

  // Loading guard
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

  // ——— No useMemo: just derive it here ———
  const currentSite = sites.find((s) => s.id === selectedSite);
  const warehouseIds = currentSite?.warehouses?.map((w) => w.id) ?? [];

  // Step-1 filters
  const filteredMaterials = materials
    .filter((m) => m.warehouseId && warehouseIds.includes(m.warehouseId))
    .filter((m) => m.item.toLowerCase().includes(searchTerm.toLowerCase()));

  const filteredEquipments = equipments
    .filter((e) => e.siteId === selectedSite)
    .filter((e) => e.item.toLowerCase().includes(searchTerm.toLowerCase()));

  const filteredLabors = labors
    .filter((l) => l.siteId === selectedSite)
    .filter((l) => l.role.toLowerCase().includes(searchTerm.toLowerCase()));

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

      {/* Site selector */}
      <div className="my-4">
        <label className="block text-cyan-700 text-sm font-semibold mb-2">
          Select Site
        </label>
        <Select
          options={sites.map((s) => ({ value: s.id, label: s.name }))}
          value={{
            value: selectedSite,
            label: currentSite?.name || "—",
          }}
          onChange={(opt) => setSelectedSite(opt?.value || "")}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      <div className="bg-white shadow-lg rounded-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-600 to-blue-500 text-white rounded-lg">
          <ClipboardList size={28} />
          <h2 className="text-2xl font-bold">{activity?.activity_name}</h2>
        </div>

        {/* Project & Task */}
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

        {/* Step 1 */}
        {step === 1 && (
          <>
            {/* Tabs */}
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {["materials", "equipment", "labor"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab as "materials" | "equipment" | "labor");
                    setSearchTerm("");
                  }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? "border-cyan-500 text-cyan-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>

            {/* Search */}
            <div className="flex justify-end mb-4">
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border rounded-md w-1/3"
              />
            </div>

            {/* Tables */}
            <div>
              {activeTab === "materials" && (
                <MaterialsTable
                  materials={filteredMaterials}
                  selectedIds={selMats}
                  onSelect={handleSelect(setSelMats)}
                />
              )}
              {activeTab === "equipment" && (
                <EquipmentTable
                  equipment={filteredEquipments}
                  selectedIds={selEquips}
                  onSelect={handleSelect(setSelEquips)}
                />
              )}
              {activeTab === "labor" && (
                <LaborTable
                  labor={filteredLabors}
                  selectedIds={selLabors}
                  onSelect={handleSelect(setSelLabors)}
                />
              )}
            </div>

            {/* Next */}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setRequestType(activeTab);
                  setStep(2);
                }}
                disabled={
                  !(selMats.length || selEquips.length || selLabors.length)
                }
                className="px-6 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            <h3 className="text-lg font-semibold mb-4">Request Summary</h3>
            {requestType === "materials" && (
              <MaterialsTable
                materials={materials.filter((m) => selMats.includes(m.id))}
                selectedIds={selMats}
                onSelect={() => {}}
                counts={materialCounts}
                onCountChange={(id, cnt) =>
                  setMaterialCounts((c) => ({ ...c, [id]: cnt }))
                }
                addNew
              />
            )}
            {requestType === "equipment" && (
              <EquipmentTable
                equipment={equipments.filter((e) => selEquips.includes(e.id))}
                selectedIds={selEquips}
                onSelect={() => {}}
                counts={equipmentCounts}
                onCountChange={(id, cnt) =>
                  setEquipmentCounts((c) => ({ ...c, [id]: cnt }))
                }
                addNew
              />
            )}
            {requestType === "labor" && (
              <LaborTable
                labor={labors.filter((l) => selLabors.includes(l.id))}
                selectedIds={selLabors}
                onSelect={() => {}}
                counts={laborCounts}
                onCountChange={(id, cnt) =>
                  setLaborCounts((c) => ({ ...c, [id]: cnt }))
                }
                addNew
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Department
                </label>
                <Select
                  options={departments.map((d) => ({
                    value: d.id,
                    label: d.name,
                  }))}
                  value={{
                    value: selectedDept,
                    label:
                      departments.find((d) => d.id === selectedDept)?.name ||
                      "—",
                  }}
                  onChange={(opt) => setSelectedDept(opt?.value || "")}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Back
              </button>
              <button
                onClick={handleRequest}
                disabled={isReqLoading || !selectedSite || !selectedDept}
                className="px-6 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800"
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
