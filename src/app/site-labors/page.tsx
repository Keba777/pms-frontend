"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import avatar from "@/../public/images/user.png";
import { Plus, ChevronDown } from "lucide-react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { useLabors, useImportLabors, useDeleteLaborInformation } from "@/hooks/useLabors";
import { useSites } from "@/hooks/useSites";
import Link from "next/link";
import { Labor, LooseLaborInput } from "@/types/labor";
import LaborForm from "@/components/forms/LaborInformationForm";
import { useAuthStore } from "@/store/authStore";
import GenericDownloads, { Column as DownloadColumn } from "@/components/common/GenericDownloads";
import {
  FilterField,
  FilterValues,
  GenericFilter,
  Option,
} from "@/components/common/GenericFilter";
import GenericImport, { ImportColumn } from "@/components/common/GenericImport";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { LaborInformation } from "@/types/laborInformation";
import { ReusableTable, ColumnConfig } from "@/components/common/ReusableTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import ConfirmModal from "@/components/common/ui/ConfirmModal";
import { formatDate } from "@/utils/dateUtils";

interface ImportLaborRow extends LooseLaborInput {
  firstName?: string;
  lastName?: string;
  startsAt?: string;
  endsAt?: string;
  profile_picture?: File | string;
  infoStatus?: "Allocated" | "Unallocated";
}

const LaborsPage = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const siteId = user!.siteId;

  const { data: labors, isLoading: labLoading, error: labError } = useLabors();
  const { data: sites, isLoading: siteLoading, error: siteError } = useSites();
  const { mutateAsync: deleteLaborInfo } = useDeleteLaborInformation();

  const [showForm, setShowForm] = useState(false);
  const [editingLabor, setEditingLabor] = useState<any | null>(null);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLaborId, setSelectedLaborId] = useState<string | null>(null);

  const { mutateAsync: importLabors } = useImportLabors();

  const canCreate = hasPermission("labors", "create");
  const canManage = hasPermission("labors", "manage");

  const siteLabors = useMemo(
    () => labors?.filter((l) => l.siteId === siteId) ?? [],
    [labors, siteId]
  );

  const filteredLabors = useMemo(() => {
    return siteLabors
      .map((labor) => {
        let filteredInfos = labor.laborInformations || [];

        if (filterValues.role) {
          if (
            !labor.role
              .toLowerCase()
              .includes((filterValues.role as string).toLowerCase())
          ) {
            return null;
          }
        }

        if (filterValues.allocationStatus) {
          filteredInfos = filteredInfos.filter(
            (info) => info.status === filterValues.allocationStatus
          );
        }

        if (fromDate) {
          filteredInfos = filteredInfos.filter(
            (info) => info.startsAt && new Date(info.startsAt) >= fromDate
          );
        }

        if (toDate) {
          filteredInfos = filteredInfos.filter(
            (info) => info.endsAt && new Date(info.endsAt) <= toDate
          );
        }

        if (filteredInfos.length === 0) return null;

        return { ...labor, laborInformations: filteredInfos } as Labor & {
          laborInformations: LaborInformation[];
        };
      })
      .filter(
        (l): l is Labor & { laborInformations: LaborInformation[] } =>
          l !== null
      );
  }, [siteLabors, filterValues, fromDate, toDate]);

  // Flatten for Table Display (and Download - they share structure)
  const flattenedData = useMemo(() => {
    return filteredLabors.flatMap((l) => {
      return l.laborInformations.map((info) => ({
        id: info.id,
        laborId: l.id,
        role: l.role ?? "-",
        unit: l.unit ?? "-",
        quantity: l.quantity ?? "-",
        minQuantity: l.minQuantity ?? "-",
        responsiblePerson: l.responsiblePerson ?? "-",
        estimatedHours: info.estimatedHours ?? "-",
        rate: info.rate ?? "-",
        overtimeRate: info.overtimeRate ?? "-",
        totalAmount: info.totalAmount ?? "-",
        allocationStatus: info.status ?? "-",
        firstName: info.firstName ?? "-",
        lastName: info.lastName ?? "-",
        position: info.position ?? "-",
        sex: info.sex ?? "-",
        terms: info.terms ?? "-",
        estSalary: info.estSalary ?? "-",
        educationLevel: info.educationLevel ?? "-",
        startsAt: info.startsAt
          ? new Date(info.startsAt).toISOString().split("T")[0]
          : "-",
        endsAt: info.endsAt
          ? new Date(info.endsAt).toISOString().split("T")[0]
          : "-",
        profile_picture: (info as any).profile_picture ?? "-",
        infoStatus: info.status ?? "-",
        phone: (info as any).phone ?? "-",
        skill_level: (info as any).skill_level ?? "-",
        utilization_factor: (info as any).utilization_factor ?? "-",
        totalTime: (info as any).totalTime ?? "-",
        shiftingDate: (info as any).shiftingDate
          ? new Date((info as any).shiftingDate).toISOString().split("T")[0]
          : "-",
      }));
    });
  }, [filteredLabors]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return flattenedData;
    const lower = searchTerm.toLowerCase();
    return flattenedData.filter((item) =>
      (item.firstName && item.firstName.toLowerCase().includes(lower)) ||
      (item.lastName && item.lastName.toLowerCase().includes(lower)) ||
      (item.role && item.role.toLowerCase().includes(lower)) ||
      (item.position && item.position.toLowerCase().includes(lower))
    );
  }, [flattenedData, searchTerm]);

  const handleEdit = (row: any) => {
    setEditingLabor(row);
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedLaborId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedLaborId) {
      try {
        await deleteLaborInfo(selectedLaborId);
        toast.success("Labor information deleted successfully!");
      } catch (error) {
        // Toast handled in hook usually, but good fallback
      } finally {
        setIsDeleteModalOpen(false);
        setSelectedLaborId(null);
      }
    }
  };

  // Table Columns
  const tableColumns: ColumnConfig<any>[] = [
    {
      label: "Employee",
      key: "firstName",
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-100 flex-shrink-0">
            <Image
              src={row.profile_picture !== "-" ? row.profile_picture : avatar}
              alt={row.firstName}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <Link href={`/site-labors/${row.id}`} className="hover:underline">
              <span className="font-bold text-gray-900">{row.firstName} {row.lastName}</span>
            </Link>
            <span className="text-[10px] text-gray-500">{row.position}</span>
          </div>
        </div>
      )
    },
    { label: "Role", key: "role" },
    { label: "Unit", key: "unit" },
    { label: "Phone", key: "phone" },
    { label: "Sex", key: "sex" },
    { label: "Education", key: "educationLevel" },
    { label: "Terms", key: "terms" },
    { label: "Est Salary", key: "estSalary", render: (row: any) => <span>{row.estSalary !== '-' ? `ETB ${Number(row.estSalary).toLocaleString()}` : '-'}</span> },
    { label: "Rate", key: "rate", render: (row: any) => <span>{row.rate !== '-' ? `ETB ${Number(row.rate).toLocaleString()}` : '-'}</span> },
    { label: "OT Rate", key: "overtimeRate", render: (row: any) => <span>{row.overtimeRate !== '-' ? `ETB ${Number(row.overtimeRate).toLocaleString()}` : '-'}</span> },
    { label: "Total", key: "totalAmount", render: (row: any) => <span className="font-bold text-gray-900">{row.totalAmount !== '-' ? `ETB ${Number(row.totalAmount).toLocaleString()}` : '-'}</span> },
    { label: "Est Hours", key: "estimatedHours" },
    { label: "Total Time", key: "totalTime" },
    { label: "Utilization", key: "utilization_factor" },
    { label: "Skill Level", key: "skill_level" },
    { label: "Start Date", key: "startsAt" },
    { label: "End Date", key: "endsAt" },
    { label: "Shifting Date", key: "shiftingDate" },
    { label: "Responsible", key: "responsiblePerson" },
    { label: "Qty", key: "quantity" },
    { label: "Min Qty", key: "minQuantity" },
    {
      label: "Status", key: "allocationStatus", render: (row: any) => (
        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${row.allocationStatus === 'Allocated' ? 'bg-emerald-100 text-emerald-800' :
          row.allocationStatus === 'Unallocated' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
          }`}>
          {row.allocationStatus}
        </span>
      )
    },
    {
      label: "Actions",
      key: "id",
      render: (row: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="text-primary-foreground p-0 bg-primary hover:bg-primary/90 h-8 px-2"
            >
              Action
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEdit(row)}>
              <FaEdit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteClick(row.id)}>
              <FaTrash className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
            {/* View Action - Navigates to details page */}
            <DropdownMenuItem onClick={() => router.push(`/site-labors/${row.id}`)}>
              <FaEye className="mr-2 h-4 w-4" /> View
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  // Download columns - EXACT MATCH with Import Columns
  const downloadColumns: DownloadColumn<any>[] = [
    { header: "Role", accessor: "role" },
    { header: "Unit", accessor: "unit" },
    { header: "Qty", accessor: "quantity" },
    { header: "Min Qty", accessor: "minQuantity" },
    { header: "Responsible Person", accessor: "responsiblePerson" },
    { header: "Est Hours", accessor: "estimatedHours" },
    { header: "Rate", accessor: "rate" },
    { header: "OT Rate", accessor: "overtimeRate" },
    { header: "Total Amount", accessor: "totalAmount" },
    { header: "Allocation Status", accessor: "allocationStatus" },
    { header: "First Name", accessor: "firstName" },
    { header: "Last Name", accessor: "lastName" },
    { header: "Position", accessor: "position" },
    { header: "Sex", accessor: "sex" },
    { header: "Terms", accessor: "terms" },
    { header: "Est Salary", accessor: "estSalary" },
    { header: "Education Level", accessor: "educationLevel" },
    { header: "Info Starts At", accessor: "startsAt" },
    { header: "Info Ends At", accessor: "endsAt" },
    { header: "Profile Picture", accessor: "profile_picture" },
    { header: "Info Status", accessor: "infoStatus" },
  ];

  // Import columns definition
  const importColumns: ImportColumn<ImportLaborRow>[] = [
    { header: "Role", accessor: "role", type: "string" },
    { header: "Unit", accessor: "unit", type: "string" },
    { header: "Qty", accessor: "quantity", type: "string" },
    { header: "Min Qty", accessor: "minQuantity", type: "string" },
    { header: "Responsible Person", accessor: "responsiblePerson", type: "string" },
    { header: "Est Hours", accessor: "estimatedHours", type: "string" },
    { header: "Rate", accessor: "rate", type: "string" },
    { header: "OT Rate", accessor: "overtimeRate", type: "string" },
    { header: "Total Amount", accessor: "totalAmount", type: "string" },
    { header: "Allocation Status", accessor: "allocationStatus", type: "string" },
    { header: "First Name", accessor: "firstName", type: "string" },
    { header: "Last Name", accessor: "lastName", type: "string" },
    { header: "Position", accessor: "position", type: "string" },
    { header: "Sex", accessor: "sex", type: "string" },
    { header: "Terms", accessor: "terms", type: "string" },
    { header: "Est Salary", accessor: "estSalary", type: "string" },
    { header: "Education Level", accessor: "educationLevel", type: "string" },
    { header: "Info Starts At", accessor: "startsAt", type: "string" },
    { header: "Info Ends At", accessor: "endsAt", type: "string" },
    { header: "Profile Picture", accessor: "profile_picture", type: "file" },
    { header: "Info Status", accessor: "infoStatus", type: "string" },
  ];

  const requiredAccessors: (keyof LooseLaborInput)[] = ["role", "unit"];
  const allocationOptions: Option<string>[] = [
    { label: "Allocated", value: "Allocated" },
    { label: "Unallocated", value: "Unallocated" },
    { label: "On Leave", value: "OnLeave" },
  ];
  const filterFields: FilterField<string>[] = [
    { name: "role", label: "Role", type: "text", placeholder: "Search by role…" },
    { name: "allocationStatus", label: "Status", type: "select", options: allocationOptions },
  ];

  const handleImport = async (rows: ImportLaborRow[]) => {
    if (rows.length === 0) return;
    try {
      setUploading(true);
      const formData = new FormData();
      const filesToAppend: File[] = [];

      const laborsPayload = rows.map((r, idx) => {
        if (!r.role || !r.unit) throw new Error(`Row ${idx + 2}: Missing required field 'role' or 'unit'`);

        const laborObj: any = { role: (r.role || "").trim(), siteId };

        const numberFields = ["quantity", "minQuantity", "estimatedHours", "rate", "overtimeRate", "totalAmount"];
        numberFields.forEach((nf) => {
          const val = (r as any)[nf];
          if (val !== "-" && val !== "" && val != null) {
            const num = Number(val);
            if (!isNaN(num)) laborObj[nf] = num;
          }
        });

        if (r.allocationStatus) laborObj.allocationStatus = r.allocationStatus;
        if (r.unit) laborObj.unit = r.unit;
        if (r.responsiblePerson) laborObj.responsiblePerson = r.responsiblePerson;
        if (r.estimatedHours === "-") delete laborObj.estimatedHours;

        const info: any = {};
        if (r.firstName) info.firstName = r.firstName;
        if (r.lastName) info.lastName = r.lastName;
        if (r.position) info.position = r.position;
        if (r.sex) info.sex = r.sex;
        if (r.terms) info.terms = r.terms;
        if (r.estSalary && Number(r.estSalary)) info.estSalary = Number(r.estSalary);
        if (r.educationLevel) info.educationLevel = r.educationLevel;
        if (r.startsAt && r.startsAt !== "-" && r.startsAt !== "") {
          const d = new Date(r.startsAt);
          if (!isNaN(d.getTime())) info.startsAt = d.toISOString();
        }
        if (r.endsAt && r.endsAt !== "-" && r.endsAt !== "") {
          const d = new Date(r.endsAt);
          if (!isNaN(d.getTime())) info.endsAt = d.toISOString();
        }
        if (r.infoStatus) info.status = r.infoStatus;

        if (r.profile_picture instanceof File) {
          filesToAppend.push(r.profile_picture);
          info.fileName = (r.profile_picture as File).name;
        } else if (typeof r.profile_picture === "string" && r.profile_picture.startsWith("http")) {
          info.profile_picture = r.profile_picture;
        }

        if (Object.keys(info).length > 0) laborObj.laborInformations = [info];
        return laborObj;
      });

      formData.append("labors", JSON.stringify(laborsPayload));
      filesToAppend.forEach((f) => formData.append("files", f));

      await importLabors(formData);
      toast.success(`Imported ${rows.length} labors successfully!`);
    } catch (err: any) {
      console.error("Import error:", err);
      toast.error(err.message || "Import failed");
    } finally {
      setUploading(false);
    }
  };

  const handleError = (error: string) => toast.error(error);

  const totalWorkforce = siteLabors.reduce((acc, l) => acc + (l.laborInformations?.length || 0), 0);
  const allocated = siteLabors.reduce((acc, l) => acc + (l.laborInformations?.filter(i => i.status === 'Allocated').length || 0), 0);
  const unallocated = siteLabors.reduce((acc, l) => acc + (l.laborInformations?.filter(i => i.status === 'Unallocated').length || 0), 0);

  // Moved loading state down to ReusableTable
  const site = sites?.find((s) => s.id === siteId);

  // Use optional chaining for site.name in case site is undefined during loading
  const siteName = site?.name || "Loading...";

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <div className="flex flex-col gap-4 mb-8 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <nav className="mb-2" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <li><Link href="/" className="hover:text-cyan-700 transition-colors">Home</Link></li>
                <li className="flex items-center space-x-2">
                  <span>/</span>
                  <span className="text-gray-900">Labors</span>
                </li>
              </ol>
            </nav>
            <h1 className="text-xl sm:text-2xl font-black text-cyan-800 uppercase tracking-tight">Labor at &quot;{siteName}&quot;</h1>
            <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Workforce management and allocation for site labors</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && (
              <button
                type="button"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest bg-cyan-700 text-white rounded-xl hover:bg-cyan-800 transition-all shadow-md shadow-cyan-200"
                onClick={() => { setEditingLabor(null); setShowForm(true); }}
              >
                <Plus className="w-4 h-4" />
                Add New
              </button>
            )}
            {canManage && (
              <div className="flex-1 sm:flex-none">
                <GenericDownloads data={flattenedData} title={`Labors_${siteName}`} columns={downloadColumns} />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pt-4 border-t border-gray-200/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:max-w-4xl">
            <div className="sm:col-span-2">
              <GenericFilter fields={filterFields} onFilterChange={setFilterValues} />
            </div>
            <div className="relative group">
              <label className="absolute -top-2 left-3 px-1 bg-gray-50 text-[10px] font-black text-cyan-700 uppercase tracking-widest z-10">From</label>
              <DatePicker selected={fromDate} onChange={setFromDate} placeholderText="From Date" className="w-full h-11 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all outline-none" dateFormat="yyyy-MM-dd" />
            </div>
            <div className="relative group">
              <label className="absolute -top-2 left-3 px-1 bg-gray-50 text-[10px] font-black text-cyan-700 uppercase tracking-widest z-10">To</label>
              <DatePicker selected={toDate} onChange={setToDate} placeholderText="To Date" className="w-full h-11 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all outline-none" dateFormat="yyyy-MM-dd" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            {canManage && (
              <GenericImport<ImportLaborRow> expectedColumns={importColumns} requiredAccessors={requiredAccessors} onImport={handleImport} title="Labors" onError={handleError} />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Workforce", value: totalWorkforce, color: "text-cyan-700", bg: "bg-cyan-50" },
          { label: "Allocated", value: allocated, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Unallocated", value: unallocated, color: "text-rose-700", bg: "bg-rose-50" },
        ].map((item) => (
          <div key={item.label} className={`${item.bg} p-4 rounded-2xl border border-white shadow-sm transition-transform hover:scale-[1.02]`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{item.label}</p>
            <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <ReusableTable
          columns={tableColumns}
          data={filteredData}
          title="Site Labors"
          emptyMessage="No labor entries match your search."
          isLoading={labLoading || siteLoading}
          isError={!!labError || !!siteError}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>

      {showForm && canCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <LaborForm
                siteId={siteId as string}
                onClose={() => { setShowForm(false); setEditingLabor(null); }}
                initialData={editingLabor}
                isEditMode={!!editingLabor}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <ConfirmModal
          isVisible={isDeleteModalOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this labor information?"
          showInput={false}
          confirmText="DELETE"
          confirmButtonText="Delete"
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
};

export default LaborsPage;
