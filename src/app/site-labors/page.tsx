"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import avatar from "@/../public/images/user.png";
import { Plus } from "lucide-react";
import { useLabors, useImportLabors } from "@/hooks/useLabors";
import { useCreateLabor } from "@/hooks/useLabors";
import { useSites } from "@/hooks/useSites";
import Link from "next/link";
import { Labor, CreateLaborInput, LooseLaborInput } from "@/types/labor";
import { getDuration } from "@/utils/helper";
import { formatDate as format } from "@/utils/dateUtils";
import LaborForm from "@/components/forms/LaborInformationForm";
import { useAuthStore } from "@/store/authStore";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
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

interface ImportLaborRow extends LooseLaborInput {
  // laborInformation columns per row (single info record)
  firstName?: string;
  lastName?: string;
  startsAt?: string; // date string
  endsAt?: string; // date string
  profile_picture?: File | string; // File (from import) or URL
  // optional allocation/status override for the laborInformation
  infoStatus?: "Allocated" | "Unallocated";
}

const LaborsPage = () => {
  const { user } = useAuthStore();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const siteId = user!.siteId;

  const { data: labors, isLoading: labLoading, error: labError } = useLabors();
  const { data: sites, isLoading: siteLoading, error: siteError } = useSites();

  const [showForm, setShowForm] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [uploading, setUploading] = useState(false);

  const { mutateAsync: createLaborAsync } = useCreateLabor(() => { });
  const { mutateAsync: importLabors } = useImportLabors();

  const canCreate = hasPermission("labors", "create");
  const canManage = hasPermission("labors", "manage");

  // Filter labors by site with memoization to prevent unnecessary recalculations
  const siteLabors = useMemo(
    () => labors?.filter((l) => l.siteId === siteId) ?? [],
    [labors, siteId]
  );

  // Filtered list based on filters and dates (adjusted for laborInformations)
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

  // Flattened data for download — MATCHES import columns exactly
  // Fields: role, unit, quantity, minQuantity, estimatedHours, rate, overtimeRate, totalAmount,
  // startingDate, dueDate, allocationStatus, firstName, lastName, startsAt, endsAt, profile_picture, infoStatus
  const flattenedForDownload = useMemo(() => {
    return filteredLabors.flatMap((l) => {
      return l.laborInformations.map((info) => ({
        role: l.role ?? "-",
        unit: l.unit ?? "-",
        quantity: l.quantity ?? "-",
        minQuantity: l.minQuantity ?? "-",
        estimatedHours: l.estimatedHours ?? "-",
        rate: l.rate ?? "-",
        overtimeRate: l.overtimeRate ?? "-",
        totalAmount: l.totalAmount ?? "-",
        startingDate: l.startingDate
          ? new Date(l.startingDate).toISOString().split("T")[0]
          : "-",
        dueDate: l.dueDate
          ? new Date(l.dueDate).toISOString().split("T")[0]
          : "-",
        allocationStatus: l.allocationStatus ?? "-",
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
        profile_picture: (info as any).profile_picture ?? "-", // might be URL string
        infoStatus: info.status ?? "-",
      }));
    });
  }, [filteredLabors]);

  // Loading / error guards
  if (labLoading || siteLoading) return <div>Loading...</div>;
  if (labError || siteError)
    return <div className="text-red-500">Error loading data.</div>;

  const site = sites?.find((s) => s.id === siteId);
  if (!site) {
    return (
      <div className="text-center text-red-500 mt-10">Site not found.</div>
    );
  }

  // -----------------------
  // DOWNLOAD COLUMNS (exact same as import columns)
  // -----------------------
  const downloadColumns: Column<any>[] = [
    { header: "Role", accessor: "role" },
    { header: "Unit", accessor: "unit" },
    { header: "Qty", accessor: "quantity" },
    { header: "Min Qty", accessor: "minQuantity" },
    { header: "Est Hours", accessor: "estimatedHours" },
    { header: "Rate", accessor: "rate" },
    { header: "OT Rate", accessor: "overtimeRate" },
    { header: "Total Amount", accessor: "totalAmount" },
    { header: "Starting Date", accessor: "startingDate" },
    { header: "Due Date", accessor: "dueDate" },
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
    { header: "Info Profile Picture", accessor: "profile_picture" },
    { header: "Info Status", accessor: "infoStatus" },
  ];

  // -----------------------
  // IMPORT COLUMNS (include laborInformation columns)
  // -----------------------
  const importColumns: ImportColumn<ImportLaborRow>[] = [
    { header: "Role", accessor: "role", type: "string" },
    { header: "Unit", accessor: "unit", type: "string" },
    { header: "Qty", accessor: "quantity", type: "string" },
    { header: "Min Qty", accessor: "minQuantity", type: "string" },
    { header: "Est Hours", accessor: "estimatedHours", type: "string" },
    { header: "Rate", accessor: "rate", type: "string" },
    { header: "OT Rate", accessor: "overtimeRate", type: "string" },
    { header: "Total Amount", accessor: "totalAmount", type: "string" },
    { header: "Starting Date", accessor: "startingDate", type: "string" },
    { header: "Due Date", accessor: "dueDate", type: "string" },
    {
      header: "Allocation Status",
      accessor: "allocationStatus",
      type: "string",
    },
    // laborInformation fields (one info per import row)
    { header: "First Name", accessor: "firstName", type: "string" },
    { header: "Last Name", accessor: "lastName", type: "string" },
    { header: "Position", accessor: "position", type: "string" },
    { header: "Sex", accessor: "sex", type: "string" },
    { header: "Terms", accessor: "terms", type: "string" },
    { header: "Est Salary", accessor: "estSalary", type: "string" },
    { header: "Education Level", accessor: "educationLevel", type: "string" },
    { header: "Info Starts At", accessor: "startsAt", type: "string" },
    { header: "Info Ends At", accessor: "endsAt", type: "string" },
    {
      header: "Info Profile Picture",
      accessor: "profile_picture",
      type: "file",
    },
    { header: "Info Status", accessor: "infoStatus", type: "string" },
  ];

  const requiredAccessors: (keyof LooseLaborInput)[] = ["role", "unit"];

  const allocationOptions: Option<string>[] = [
    { label: "Allocated", value: "Allocated" },
    { label: "Unallocated", value: "Unallocated" },
    { label: "On Leave", value: "OnLeave" },
  ];

  const filterFields: FilterField<string>[] = [
    {
      name: "role",
      label: "Role",
      type: "text",
      placeholder: "Search by role…",
    },
    {
      name: "allocationStatus",
      label: "All Statuses",
      type: "select",
      options: allocationOptions,
    },
  ];

  // Transform CSV/imported strings to correct CreateLaborInput numeric/date types
  const processLaborData = (data: LooseLaborInput[]): CreateLaborInput[] => {
    return data.map((laborRow) => {
      const processed: Record<string, unknown> = { ...laborRow, siteId };

      const numberFields: (keyof CreateLaborInput)[] = [
        "quantity",
        "minQuantity",
        "estimatedHours",
        "rate",
        "overtimeRate",
        "totalAmount",
      ];
      numberFields.forEach((field) => {
        const val = processed[field];
        if (val === "-" || val === "" || val == null) {
          processed[field] = undefined;
        } else {
          const num = Number(val);
          processed[field] = isNaN(num) ? undefined : num;
        }
      });

      if (processed.quantity === undefined) {
        processed.quantity = 1;
      }

      if (processed.minQuantity === undefined) {
        processed.minQuantity = 1;
      }

      const dateFields: (keyof CreateLaborInput)[] = [
        "startingDate",
        "dueDate",
      ];
      dateFields.forEach((field) => {
        const val = processed[field];
        if (val === "-" || val === "" || val == null) {
          processed[field] = undefined;
        } else {
          const date = new Date(String(val));
          processed[field] = isNaN(date.getTime()) ? undefined : date;
        }
      });

      return processed as unknown as CreateLaborInput;
    });
  };

  // -----------------------
  // IMPORT HANDLER
  // -----------------------
  const handleImport = async (rows: ImportLaborRow[]) => {
    if (rows.length === 0) return;

    try {
      setUploading(true);

      // Build files + labors payload; server expects:
      // formData: { labors: JSON.stringify([...]), files: File[] }
      const formData = new FormData();
      const filesToAppend: File[] = [];

      const laborsPayload = rows.map((r, idx) => {
        // required checks
        if (!r.role || !r.unit) {
          throw new Error(
            `Row ${idx + 2}: Missing required field 'role' or 'unit'`
          );
        }

        // process numeric fields (keep same basic logic as processLaborData)
        const numberFields = [
          "quantity",
          "minQuantity",
          "estimatedHours",
          "rate",
          "overtimeRate",
          "totalAmount",
        ];
        const laborObj: any = {
          role: (r.role || "").trim(),
          siteId,
        };

        numberFields.forEach((nf) => {
          const val = (r as any)[nf];
          if (val === "-" || val === "" || val == null) {
            // skip
          } else {
            const num = Number(val);
            if (!isNaN(num)) laborObj[nf] = num;
          }
        });

        // optional simple fields
        if (r.allocationStatus) laborObj.allocationStatus = r.allocationStatus;
        if (r.unit) laborObj.unit = r.unit;
        if (r.estimatedHours === "-") delete laborObj.estimatedHours;

        // parse starting/ending dates at labor level if provided (string)
        if (r.startingDate && r.startingDate !== "-" && r.startingDate !== "") {
          const d = new Date(r.startingDate);
          if (!isNaN(d.getTime())) laborObj.startingDate = d.toISOString();
        }
        if (r.dueDate && r.dueDate !== "-" && r.dueDate !== "") {
          const d = new Date(r.dueDate);
          if (!isNaN(d.getTime())) laborObj.dueDate = d.toISOString();
        }

        // LABOR INFORMATION (single info per row) — only include when firstName/lastName present
        const info: any = {};
        if (r.firstName) info.firstName = r.firstName;
        if (r.lastName) info.lastName = r.lastName;
        if (r.position) info.position = r.position;
        if (r.sex) info.sex = r.sex;
        if (r.terms) info.terms = r.terms;
        if (
          r.estSalary !== undefined &&
          r.estSalary !== null &&
          r.estSalary !== 0
        ) {
          const num = Number(r.estSalary);
          if (!isNaN(num)) info.estSalary = num;
        }
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

        // Handle profile picture for the info:
        // - If File: append to files and set fileName in the info object
        // - If URL string starting with http: add directly to info.profile_picture
        if (r.profile_picture instanceof File) {
          filesToAppend.push(r.profile_picture);
          info.fileName = (r.profile_picture as File).name;
        } else if (
          typeof r.profile_picture === "string" &&
          r.profile_picture.startsWith("http")
        ) {
          info.profile_picture = r.profile_picture;
        }

        // Only attach laborInformations if we have some info data
        if (Object.keys(info).length > 0) {
          laborObj.laborInformations = [info];
        }

        return laborObj;
      });

      // Append labors JSON
      formData.append("labors", JSON.stringify(laborsPayload));

      // Append files (if any) under 'files' key (multer().array("files") will pick them)
      filesToAppend.forEach((f) => {
        formData.append("files", f);
      });

      await importLabors(formData);
      toast.success(`Imported ${rows.length} labors successfully!`);
    } catch (err: any) {
      console.error("Import error:", err);
      toast.error(err.message || "Import failed");
    } finally {
      setUploading(false);
    }
  };

  const handleError = (error: string) => {
    toast.error(error);
  };

  // status summary values
  const totalLabors = siteLabors.length;
  const allocated = siteLabors.filter(l => l.allocationStatus === 'Allocated').length;
  const unallocated = siteLabors.filter(l => l.allocationStatus === 'Unallocated').length;

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      {/* Header Section */}
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
            <h1 className="text-xl sm:text-2xl font-black text-cyan-800 uppercase tracking-tight">
              Labor at &quot;{site.name}&quot;
            </h1>
            <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mt-1">
              Workforce management and allocation for site labors
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && (
              <button
                type="button"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest bg-cyan-700 text-white rounded-xl hover:bg-cyan-800 transition-all shadow-md shadow-cyan-200"
                onClick={() => setShowForm(true)}
              >
                <Plus className="w-4 h-4" />
                Add New
              </button>
            )}
            {canManage && (
              <div className="flex-1 sm:flex-none">
                <GenericDownloads
                  data={flattenedForDownload}
                  title={`Labors_${site.name}`}
                  columns={downloadColumns}
                />
              </div>
            )}
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pt-4 border-t border-gray-200/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:max-w-4xl">
            <div className="sm:col-span-2">
              <GenericFilter fields={filterFields} onFilterChange={setFilterValues} />
            </div>
            <div className="relative group">
              <label className="absolute -top-2 left-3 px-1 bg-gray-50 text-[10px] font-black text-cyan-700 uppercase tracking-widest z-10">From</label>
              <DatePicker
                selected={fromDate}
                onChange={setFromDate}
                placeholderText="From Date"
                className="w-full h-11 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all outline-none"
                dateFormat="yyyy-MM-dd"
              />
            </div>
            <div className="relative group">
              <label className="absolute -top-2 left-3 px-1 bg-gray-50 text-[10px] font-black text-cyan-700 uppercase tracking-widest z-10">To</label>
              <DatePicker
                selected={toDate}
                onChange={setToDate}
                placeholderText="To Date"
                className="w-full h-11 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all outline-none"
                dateFormat="yyyy-MM-dd"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            {canManage && (
              <GenericImport<ImportLaborRow>
                expectedColumns={importColumns}
                requiredAccessors={requiredAccessors}
                onImport={handleImport}
                title="Labors"
                onError={handleError}
              />
            )}
          </div>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Workforce", value: totalLabors, color: "text-cyan-700", bg: "bg-cyan-50" },
          { label: "Allocated", value: allocated, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Unallocated", value: unallocated, color: "text-rose-700", bg: "bg-rose-50" },
        ].map((item) => (
          <div key={item.label} className={`${item.bg} p-4 rounded-2xl border border-white shadow-sm transition-transform hover:scale-[1.02]`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{item.label}</p>
            <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Labors Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredLabors.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No labor entries match your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "#", "First Name", "Last Name", "Position", "Sex", "Terms", "Salary", "Education",
                    "Role", "Unit", "Hrs", "Rate", "OT", "Total", "Starts", "Ends", "Days", "Status", "Profile"
                  ].map((head) => (
                    <th key={head} className="px-4 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {filteredLabors.flatMap((l, laborIndex) => {
                  return l.laborInformations.map((info, infoIndex) => (
                    <tr key={`${l.id}-${info.id}`} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4 text-sm font-black text-gray-300">
                        {String(laborIndex + 1).padStart(2, '0')}.{String(infoIndex + 1).padStart(2, '0')}
                      </td>
                      <td className="px-4 py-4">
                        <Link href={`/site-labors/${info.id}`} className="text-sm font-black text-cyan-700 hover:text-cyan-800 transition-colors whitespace-nowrap">
                          {info.firstName}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 font-bold whitespace-nowrap">{info.lastName}</td>
                      <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">{info.position ?? "-"}</td>
                      <td className="px-4 py-4 text-sm text-gray-400 uppercase font-black">{info.sex ?? "-"}</td>
                      <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">{info.terms ?? "-"}</td>
                      <td className="px-4 py-4 text-sm font-black text-gray-900 font-mono">${(info.estSalary ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-gray-500 italic whitespace-nowrap">{info.educationLevel ?? "-"}</td>
                      <td className="px-4 py-4 text-sm font-bold text-gray-700 whitespace-nowrap uppercase tracking-tighter">{l.role}</td>
                      <td className="px-4 py-4 text-sm text-gray-400">{l.unit}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{l.estimatedHours ?? "-"}</td>
                      <td className="px-4 py-4 text-sm text-gray-500 font-mono">${l.rate ?? "-"}</td>
                      <td className="px-4 py-4 text-sm text-gray-500 font-mono">${l.overtimeRate ?? "-"}</td>
                      <td className="px-4 py-4 text-sm font-black text-gray-900 font-mono">${(l.totalAmount ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-gray-400 italic whitespace-nowrap">{info.startsAt ? format(info.startsAt) : "-"}</td>
                      <td className="px-4 py-4 text-sm text-gray-400 italic whitespace-nowrap">{info.endsAt ? format(info.endsAt) : "-"}</td>
                      <td className="px-4 py-4 text-sm text-gray-500 font-medium">
                        {info.startsAt && info.endsAt ? `${getDuration(info.startsAt, info.endsAt)}d` : "-"}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${info.status === 'Allocated' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                          {info.status ?? "-"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100">
                          <Image
                            src={(info as any).profile_picture || avatar}
                            alt={`${info.firstName ?? ""} ${info.lastName ?? ""}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && canCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
              <h3 className="text-lg sm:text-xl font-black text-cyan-800 uppercase tracking-tight">Add New Labor</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <LaborForm siteId={siteId as string} onClose={() => setShowForm(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaborsPage;
