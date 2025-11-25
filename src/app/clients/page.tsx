"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { Project } from "@/types/project";
import { Button } from "@/components/ui/button";
import { formatDate as format, getDateDuration } from "@/utils/dateUtils";
import { useSettingsStore } from "@/store/settingsStore";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import { useProjectStore } from "@/store/projectStore";
import { useAuthStore } from "@/store/authStore";
import {
  FilterField,
  FilterValues,
  GenericFilter,
  Option,
} from "@/components/common/GenericFilter";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Link from "next/link";

const ClientsPage: React.FC = () => {
  const { useEthiopianDate } = useSettingsStore();
  const { data: projects, isLoading, isError } = useProjects();
  const { projects: storeProjects } = useProjectStore();

  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const canManage = hasPermission("projects", "manage");

  const columnOptions = [
    { value: "id", label: "ID" },
    { value: "client", label: "Client Name" },
    { value: "title", label: "Project Name" },
    { value: "site", label: "Site" },
    { value: "start_date", label: "Start Date" },
    { value: "end_date", label: "End Date" },
    { value: "duration", label: "Duration" },
  ];

  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    columnOptions.map((col) => col.value)
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const columns: Column<Project>[] = [
    { header: "Client Name", accessor: "client" },
    { header: "Project Name", accessor: "title" },
    { header: "Site", accessor: "site" },
    { header: "Start Date", accessor: "start_date" },
    { header: "End Date", accessor: "end_date" },
  ];

  const statusOptions: Option<string>[] = [
    { label: "Not Started", value: "Not Started" },
    { label: "Started", value: "Started" },
    { label: "InProgress", value: "InProgress" },
    { label: "Canceled", value: "Canceled" },
    { label: "Onhold", value: "Onhold" },
    { label: "Completed", value: "Completed" },
  ];

  const filterFields: FilterField<string>[] = [
    {
      name: "title",
      label: "Project Name",
      type: "text",
      placeholder: "Search by project name…",
    },
    {
      name: "client",
      label: "Client Name",
      type: "text",
      placeholder: "Search by client…",
    },
    {
      name: "status",
      label: "All Statuses",
      type: "select",
      options: statusOptions,
    },
  ];

  const filtered =
    projects?.filter(
      (p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.site?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  if (isLoading)
    return (
      <div className="text-center py-8 text-gray-600">Loading clients...</div>
    );
  if (isError)
    return (
      <div className="text-center py-8 text-red-600">
        Error loading clients.
      </div>
    );

  const finalFiltered = filtered.filter((project) => {
    return (
      Object.entries(filterValues).every(([key, value]) => {
        if (!value) return true;
        if (key === "status") {
          return project.status === value;
        }
        if (key === "title" || key === "client") {
          return project[key]
            ?.toLowerCase()
            .includes((value as string).toLowerCase());
        }
        return true;
      }) &&
      (fromDate ? new Date(project.start_date) >= fromDate : true) &&
      (toDate ? new Date(project.end_date) <= toDate : true)
    );
  });

  return (
    <div className="p-4">
      <div className="flex flex-wrap justify-between items-center mb-4 mt-4 gap-2">
        <nav className="hidden md:block" aria-label="breadcrumb">
          <ol className="flex space-x-2 text-sm sm:text-base">
            <li>
              <Link href="/" className="text-blue-600 hover:underline">
                Home
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 font-semibold">Clients</li>
          </ol>
        </nav>

        {/* Button group */}
        <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
          {/* GenericDownloads: full width on small, inline on md+ */}
          {canManage && (
            <div className="w-full md:w-auto mt-2 md:mt-0">
              <GenericDownloads
                data={storeProjects}
                title="Clients Export"
                columns={columns}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
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

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Customize Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-2">
              {columnOptions.map((col) => (
                <div key={col.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={col.value}
                    checked={selectedColumns.includes(col.value)}
                    onCheckedChange={() => toggleColumn(col.value)}
                  />
                  <label htmlFor={col.value} className="">
                    {col.label}
                  </label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Input
          placeholder="Search clients/projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64"
        />
      </div>

      <div className="overflow-x-auto rounded-md border mt-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-cyan-700 hover:bg-cyan-700">
              {columnOptions
                .filter((col) => selectedColumns.includes(col.value))
                .map((col) => (
                  <TableHead
                    key={col.value}
                    className="text-gray-50 font-medium px-4 py-4"
                  >
                    {col.label}
                  </TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {finalFiltered.length > 0 ? (
              finalFiltered.map((project, idx) => {
                const duration = getDateDuration(
                  project.start_date,
                  project.end_date
                );
                return (
                  <TableRow key={project.id} className="hover:bg-gray-50">
                    {selectedColumns.includes("id") && (
                      <TableCell className="px-4 py-2">{idx + 1}</TableCell>
                    )}
                    {selectedColumns.includes("client") && (
                      <TableCell className="px-4 py-2 font-medium">
                        {project.client}
                      </TableCell>
                    )}
                    {selectedColumns.includes("title") && (
                      <TableCell className="px-4 py-2">
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-cyan-700 hover:underline font-medium"
                        >
                          {project.title}
                        </Link>
                      </TableCell>
                    )}

                    {selectedColumns.includes("site") && (
                      <TableCell className="px-4 py-2">
                        {project.projectSite?.name || "N/A"}
                      </TableCell>
                    )}
                    {selectedColumns.includes("start_date") && (
                      <TableCell className="px-4 py-2">
                        {format(project.start_date, useEthiopianDate)}
                      </TableCell>
                    )}
                    {selectedColumns.includes("end_date") && (
                      <TableCell className="px-4 py-2">
                        {format(project.end_date, useEthiopianDate)}
                      </TableCell>
                    )}
                    {selectedColumns.includes("duration") && (
                      <TableCell className="px-4 py-2">{duration}</TableCell>
                    )}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={selectedColumns.length}
                  className="text-center py-8 text-gray-500"
                >
                  No clients/projects found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ClientsPage;
