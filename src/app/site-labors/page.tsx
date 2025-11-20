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

  const { mutateAsync: createLaborAsync } = useCreateLabor(() => {});
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

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <nav className="hidden md:block" aria-label="breadcrumb">
          <ol className="flex space-x-2 text-sm sm:text-base">
            <li>
              <Link href="/" className="text-blue-600 hover:underline">
                Home
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 font-semibold">Labors</li>
          </ol>
        </nav>

        <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
          {canCreate && (
            <button
              type="button"
              className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 flex items-center gap-1"
              onClick={() => setShowForm(true)}
              title="Create Labor"
            >
              <span className="md:hidden">Add New</span>
              <Plus className="w-4 h-4 hidden md:inline" />
            </button>
          )}
          {canManage && (
            <div className="w-full md:w-auto mt-2 md:mt-0">
              <GenericDownloads
                data={flattenedForDownload}
                title={`Labors_${site.name}`}
                columns={downloadColumns}
              />
            </div>
          )}
        </div>
      </div>

      {/* Import */}
      <div className="flex justify-end mb-4">
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

      {/* Create/Edit Modal */}
      {showForm && canCreate && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6">
            <LaborForm siteId={siteId} onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <GenericFilter fields={filterFields} onFilterChange={setFilterValues} />
        <DatePicker
          selected={fromDate}
          onChange={setFromDate}
          placeholderText="From Date"
          className="rounded border border-gray-300 p-2 focus:outline-none focus:border-blue-500 w-full sm:w-auto"
          dateFormat="yyyy-MM-dd"
        />
        <DatePicker
          selected={toDate}
          onChange={setToDate}
          placeholderText="To Date"
          className="rounded border border-gray-300 p-2 focus:outline-none focus:border-blue-500 w-full sm:w-auto"
          dateFormat="yyyy-MM-dd"
        />
      </div>

      <h1 className="text-4xl font-bold text-cyan-800 mb-4">
        Labor at &quot;{site.name}&quot;
      </h1>

      {filteredLabors.length === 0 ? (
        <p className="text-gray-600">No labor entries match your search.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 table-auto">
            <thead className="bg-cyan-700">
              <tr>
                {[
                  "#",
                  "First Name",
                  "Last Name",
                  "Position",
                  "Sex",
                  "Terms",
                  "Est Salary",
                  "Education Level",
                  "Role",
                  "Unit",
                  "Est-Hrs",
                  "Rate",
                  "OT",
                  "Total Amount",
                  "Starting Date",
                  "Due Date",
                  "Duration",
                  "Status",
                  "Profile",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLabors.flatMap((l, laborIndex) => {
                return l.laborInformations.map((info, infoIndex) => (
                  <tr key={`${l.id}-${info.id}`}>
                    <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                      {laborIndex + 1}.{infoIndex + 1}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                      <Link
                        href={`/site-labors/${info.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {info.firstName}
                      </Link>
                    </td>
                    <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                      {info.lastName}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                      {info.position ?? "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                      {info.sex ?? "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                      {info.terms ?? "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                      {info.estSalary ?? "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                      {info.educationLevel ?? "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                      {l.role}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                      {l.unit}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                      {l.estimatedHours ?? "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                      {l.rate ?? "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                      {l.overtimeRate ?? "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                      {l.totalAmount ?? "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                      {info.startsAt
                        ? new Date(info.startsAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                      {info.endsAt
                        ? new Date(info.endsAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                      {info.startsAt && info.endsAt
                        ? getDuration(info.startsAt, info.endsAt)
                        : "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                      {info.status ?? "-"}
                    </td>

                    {/* PROFILE PICTURE - last column (avatar like users table) */}
                    <td className="px-4 py-2 border border-gray-200 text-center">
                      <Image
                        src={(info as any).profile_picture || avatar}
                        alt={`${info.firstName ?? ""} ${info.lastName ?? ""}`}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                      />
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LaborsPage;
