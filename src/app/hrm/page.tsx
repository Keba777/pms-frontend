"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Users, Download, FileText } from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import { useUsers } from "@/hooks/useUsers";
import {
  useLaborTimesheets,
  useEquipmentTimesheets,
  useMaterialSheets,
} from "@/hooks/useTimesheets";
import { useLaborInformations } from "@/hooks/useLaborInformations";

// shadcn UI components (adjust paths if needed)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

const COLORS = [
  "#06b6d4", // cyan
  "#7c3aed", // purple
  "#f97316", // orange
  "#ef4444", // red
  "#10b981", // green
  "#0891b2", // deep cyan
  "#0ea5a4", // teal
];

export default function HRDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  React.useEffect(() => {
    if (user?.role?.name !== "HR Manager") {
      router.push("/");
    }
  }, [user, router]);

  if (user?.role?.name !== "HR Manager") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        Access Denied: HR Role Required
      </div>
    );
  }

  // --- data hooks ---
  const usersQuery = useUsers();
  const laborTimesheetsQuery = useLaborTimesheets();
  const equipmentTimesheetsQuery = useEquipmentTimesheets();
  const materialSheetsQuery = useMaterialSheets();
  const laborInfosQuery = useLaborInformations();

  const users = usersQuery.data ?? [];
  const laborTimesheets = laborTimesheetsQuery.data ?? [];
  const equipmentTimesheets = equipmentTimesheetsQuery.data ?? [];
  const materialSheets = materialSheetsQuery.data ?? [];
  const laborInfos = laborInfosQuery.data ?? [];

  // UI state
  const [search, setSearch] = useState("");
  const [selectedSite, setSelectedSite] = useState<string>("all");

  // pagination
  const PAGE_SIZE = 10;
  const [sitePage, setSitePage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [laborPage, setLaborPage] = useState(1);

  // derive sites
  const sites = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    users.forEach((u: any) => {
      const siteName =
        (u.site && (u.site.name ?? u.site.title)) || u.siteId || "Unassigned";
      const siteId =
        (u.site && (u.site.id ?? u.siteId)) || (u.siteId ?? siteName);
      if (!map.has(siteId)) map.set(siteId, { id: siteId, name: siteName });
    });
    return [
      { id: "all", name: "All Sites" },
      ...Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name)),
    ];
  }, [users]);

  // users by site
  const usersBySite = useMemo(() => {
    const grouped = new Map<string, any[]>();
    users.forEach((u: any) => {
      const siteId =
        (u.site && (u.site.id ?? u.siteId)) || u.siteId || "unassigned";
      const arr = grouped.get(siteId) ?? [];
      arr.push(u);
      grouped.set(siteId, arr);
    });
    return grouped;
  }, [users]);

  // compute compliance
  const computeCompliance = (userIds: string[]) => {
    if (!userIds || userIds.length === 0) return 100;
    const allTS = laborTimesheets.filter((t: any) =>
      userIds.includes(String(t.userId))
    );
    if (allTS.length === 0) return 100;
    const approved = allTS.filter((t: any) => {
      const status = t.status ?? (t as any).Status;
      return (
        status === "Approved" || status === "approved" || t.submitted === true
      );
    }).length;
    return Math.round((approved / allTS.length) * 100);
  };

  // site summaries for chart
  const siteSummaries = useMemo(() => {
    const summaries: any[] = [];
    for (const s of sites.filter((s) => s.id !== "all")) {
      const siteUsers = usersBySite.get(s.id) ?? [];
      const userIds = siteUsers.map((u) => String(u.id));
      const compliance = computeCompliance(userIds);
      const offenders = (laborTimesheets ?? [])
        .filter((t: any) => userIds.includes(String(t.userId)))
        .filter(
          (t: any) =>
            !(
              t.status === "Approved" ||
              t.status === "approved" ||
              t.submitted === true
            )
        )
        .map((t: any) => ({
          userId: t.userId,
          userName: t.userName || `User ${t.userId}`,
          lastDate: t.date ? new Date(t.date).toLocaleDateString() : "-",
        }));

      summaries.push({
        siteId: s.id,
        siteName: s.name,
        headcount: siteUsers.length,
        compliance,
        missingCount: offenders.length,
        topOffenders: offenders.slice(0, 5),
      });
    }
    return summaries.sort((a, b) => b.headcount - a.headcount);
  }, [sites, usersBySite, laborTimesheets]);

  // timesheet statuses for pie
  const timesheetStatusCounts = useMemo(() => {
    const map = new Map<string, number>();
    const all = [...laborTimesheets, ...equipmentTimesheets, ...materialSheets];
    all.forEach((t: any) => {
      const status = (t.status ?? t.Status ?? "Unknown").toString();
      map.set(status, (map.get(status) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [laborTimesheets, equipmentTimesheets, materialSheets]);

  // chart data includes missingCount & compliance
  const chartData = useMemo(() => {
    return siteSummaries.map((s, i) => ({
      name: s.siteName,
      headcount: s.headcount,
      missing: s.missingCount,
      compliance: s.compliance,
      color: COLORS[i % COLORS.length],
    }));
  }, [siteSummaries]);

  // filter directory
  const filteredDirectory = useMemo(() => {
    let list = users.slice();
    if (selectedSite && selectedSite !== "all") {
      list = list.filter((u: any) => {
        const siteId =
          (u.site && (u.site.id ?? u.siteId)) ||
          u.siteId ||
          ((u.site && u.site.name) ?? "Unassigned");
        return String(siteId) === String(selectedSite);
      });
    }
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter((u: any) => {
      const first = (u.first_name ?? u.firstName ?? "").toLowerCase();
      const last = (u.last_name ?? u.lastName ?? "").toLowerCase();
      const dept = (u.department && (u.department as any).name) || "";
      const siteName =
        (u.site && (u.site.name ?? u.site.title)) || u.siteId || "Unassigned";
      return (
        first.includes(q) ||
        last.includes(q) ||
        (u.email ?? "").toLowerCase().includes(q) ||
        String(u.phone ?? "").includes(q) ||
        dept.toLowerCase().includes(q) ||
        siteName.toLowerCase().includes(q)
      );
    });
  }, [users, search, selectedSite]);

  // labor infos filtered by site if possible
  const filteredLaborInfos = useMemo(() => {
    if (!selectedSite || selectedSite === "all") return laborInfos ?? [];
    return (laborInfos ?? []).filter((li: any) => {
      const laborSiteId = li.siteId ?? (li.labor && li.labor.siteId) ?? null;
      if (!laborSiteId) return true;
      return String(laborSiteId) === String(selectedSite);
    });
  }, [laborInfos, selectedSite]);

  // pagination helpers
  const totalPages = (len: number) => Math.max(1, Math.ceil(len / PAGE_SIZE));
  const paginate = <T,>(arr: T[], page: number) => {
    const start = (page - 1) * PAGE_SIZE;
    return arr.slice(start, start + PAGE_SIZE);
  };

  const pagedUsers = paginate(filteredDirectory, usersPage);
  const pagedLabor = paginate(filteredLaborInfos, laborPage);
  const pagedSites = paginate(siteSummaries, sitePage);

  // CSV export (users)
  const exportCSV = () => {
    const rows = filteredDirectory.map((u: any) => ({
      first_name: u.first_name ?? u.firstName ?? "",
      last_name: u.last_name ?? u.lastName ?? "",
      email: u.email ?? "",
      phone: u.phone ?? "",
      site:
        (u.site && (u.site.name ?? u.site.title)) || u.siteId || "Unassigned",
      department: (u.department && (u.department as any).name) || "",
    }));
    if (rows.length === 0) return;
    const csv = [
      Object.keys(rows[0]).join(","),
      ...rows
        .map((r) =>
          Object.values(r)
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n"),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `employees-${selectedSite ?? "all"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // replace your existing renderPageNumbers(...) with this function:
  const renderPageNumbers = (
    current: number,
    total: number,
    onPageChange: (p: number) => void
  ) => {
    const items: React.ReactNode[] = [];

    const pushPage = (p: number) => {
      const isActive = p === current;
      items.push(
        <PaginationItem key={`p-${p}`}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (!isActive) onPageChange(p);
            }}
            isActive={isActive}
            aria-current={isActive ? "page" : undefined}
            // style: active = cyan-700, non-active hover = cyan-800
            className={cn(
              // small padding and rounded
              "px-3 py-1",
              isActive
                ? "bg-cyan-700 text-white hover:bg-cyan-700"
                : "hover:bg-cyan-800 hover:text-white"
            )}
          >
            {p}
          </PaginationLink>
        </PaginationItem>
      );
    };

    if (total <= 7) {
      for (let p = 1; p <= total; p++) pushPage(p);
    } else {
      // always show first, last, current +/-1 and ellipses
      pushPage(1);
      if (current > 4)
        items.push(
          <PaginationEllipsis key="e-left" className="text-slate-400" />
        );
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let p = start; p <= end; p++) pushPage(p);
      if (current < total - 3)
        items.push(
          <PaginationEllipsis key="e-right" className="text-slate-400" />
        );
      pushPage(total);
    }
    // replace your existing renderPageNumbers(...) with this function:
    const renderPageNumbers = (
      current: number,
      total: number,
      onPageChange: (p: number) => void
    ) => {
      const items: React.ReactNode[] = [];

      const pushPage = (p: number) => {
        const isActive = p === current;
        items.push(
          <PaginationItem key={`p-${p}`}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (!isActive) onPageChange(p);
              }}
              isActive={isActive}
              aria-current={isActive ? "page" : undefined}
              // style: active = cyan-700, non-active hover = cyan-800
              className={cn(
                // small padding and rounded
                "px-3 py-1",
                isActive
                  ? "bg-cyan-700 text-white hover:bg-cyan-700"
                  : "hover:bg-cyan-800 hover:text-white"
              )}
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        );
      };

      if (total <= 7) {
        for (let p = 1; p <= total; p++) pushPage(p);
      } else {
        // always show first, last, current +/-1 and ellipses
        pushPage(1);
        if (current > 4)
          items.push(
            <PaginationEllipsis key="e-left" className="text-slate-400" />
          );
        const start = Math.max(2, current - 1);
        const end = Math.min(total - 1, current + 1);
        for (let p = start; p <= end; p++) pushPage(p);
        if (current < total - 3)
          items.push(
            <PaginationEllipsis key="e-right" className="text-slate-400" />
          );
        pushPage(total);
      }

      return items;
    };

    return items;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans antialiased">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 p-3 shadow-lg">
            <Users className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              HR Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Sites, people and labor allocations — with clear visual insights
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={exportCSV} className="px-4 py-2">
            <Download className="mr-2" /> Export CSV
          </Button>
        </div>
      </header>

      <main className="space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-white shadow border border-slate-100">
            <div className="text-sm text-slate-500">Total employees</div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {users.length}
            </div>
            <div className="text-xs text-slate-400 mt-1">Across all sites</div>
          </div>

          <div className="p-5 rounded-2xl bg-white shadow border border-slate-100">
            <div className="text-sm text-slate-500">Sites</div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {sites.length - 1}
            </div>
            <div className="text-xs text-slate-400 mt-1">Active sites</div>
          </div>

          <div className="p-5 rounded-2xl bg-white shadow border border-slate-100">
            <div className="text-sm text-slate-500">Pending timesheets</div>
            <div className="mt-2 text-2xl font-bold text-amber-600">
              {Math.max(
                0,
                (laborTimesheets ?? []).length -
                  (laborTimesheets ?? []).filter(
                    (t: any) => t.status === "Approved"
                  ).length
              )}
            </div>
            <div className="text-xs text-slate-400 mt-1">Requires action</div>
          </div>

          <div className="p-5 rounded-2xl bg-white shadow border border-slate-100">
            <div className="text-sm text-slate-500">Overall compliance</div>
            <div className="mt-2 text-2xl font-bold text-emerald-600">
              {`${Math.round(
                (siteSummaries.reduce((s, a) => s + a.compliance, 0) || 100) /
                  Math.max(1, siteSummaries.length || 1)
              )}%`}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Average across sites
            </div>
          </div>
        </div>

        {/* charts: composed chart for site overview + pie */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 bg-white rounded-2xl shadow border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Site Overview — Headcount · Compliance · Missing Timesheets
              </h3>
              <div className="text-sm text-slate-400">Top sites</div>
            </div>

            <div style={{ height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 10, right: 40, bottom: 80, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    yAxisId="left"
                    label={{
                      value: "Count",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    label={{
                      value: "Compliance %",
                      angle: 90,
                      position: "insideRight",
                    }}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => {
                      if (name === "compliance")
                        return [`${value}%`, "Compliance"];
                      return [
                        value,
                        name.charAt(0).toUpperCase() + name.slice(1),
                      ];
                    }}
                  />
                  <Legend verticalAlign="top" />
                  <Bar
                    yAxisId="left"
                    dataKey="headcount"
                    name="Headcount"
                    barSize={22}
                  >
                    {chartData.map((entry: any, idx: number) => (
                      <Cell key={`hc-${idx}`} fill={entry.color} />
                    ))}
                  </Bar>
                  <Bar
                    yAxisId="left"
                    dataKey="missing"
                    name="Missing timesheets"
                    barSize={12}
                    fill="#f97316"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="compliance"
                    name="Compliance (%)"
                    stroke="#0891b2"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Timesheet statuses</h3>
              <div className="text-sm text-slate-400">All categories</div>
            </div>

            <div
              style={{ height: 320 }}
              className="flex items-center justify-center"
            >
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={timesheetStatusCounts}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    label={(entry) => entry.name}
                  >
                    {timesheetStatusCounts.map((entry: any, idx: number) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={COLORS[idx % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Controls (moved below main) */}
        <div className="p-4 bg-white rounded-2xl shadow border border-slate-100">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 justify-between">
            <div className="flex gap-3 w-full lg:w-auto">
              <Select
                value={selectedSite}
                onValueChange={(v: any) => {
                  setSelectedSite(v);
                  setUsersPage(1);
                  setLaborPage(1);
                }}
              >
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Search first, last, email, phone or department..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setUsersPage(1);
                }}
                className="w-full lg:w-96"
              />
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <Button
                onClick={() => {
                  setSearch("");
                  setSelectedSite("all");
                  setUsersPage(1);
                  setLaborPage(1);
                  setSitePage(1);
                }}
              >
                Reset
              </Button>
              <Button onClick={exportCSV} variant="secondary">
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Employee Directory */}
        <div className="p-4 bg-white rounded-2xl shadow border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Employee Directory — Active Staff
            </h3>
            <div className="text-sm text-slate-400">
              Showing {filteredDirectory.length} of {users.length}
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-cyan-700 hover:bg-cyan-800">
                  <TableHead className="text-white px-4 py-3">
                    First name
                  </TableHead>
                  <TableHead className="text-white px-4 py-3">
                    Last name
                  </TableHead>
                  <TableHead className="text-white px-4 py-3">Email</TableHead>
                  <TableHead className="text-white px-4 py-3">Phone</TableHead>
                  <TableHead className="text-white px-4 py-3">Site</TableHead>
                  <TableHead className="text-white px-4 py-3">
                    Department
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {pagedUsers.length > 0 ? (
                  pagedUsers.map((emp: any, idx: number) => {
                    const first = emp.first_name ?? emp.firstName ?? "";
                    const last = emp.last_name ?? emp.lastName ?? "";
                    const email = emp.email ?? "";
                    const phone = emp.phone ?? "";
                    const siteName =
                      (emp.site && (emp.site.name ?? emp.site.title)) ||
                      emp.siteId ||
                      "Unassigned";
                    const dept =
                      (emp.department && (emp.department as any).name) || "";
                    return (
                      <TableRow
                        key={emp.id ?? idx}
                        className="hover:bg-gray-50"
                      >
                        <TableCell className="px-4 py-3">{first}</TableCell>
                        <TableCell className="px-4 py-3">{last}</TableCell>
                        <TableCell className="px-4 py-3">{email}</TableCell>
                        <TableCell className="px-4 py-3">{phone}</TableCell>
                        <TableCell className="px-4 py-3">{siteName}</TableCell>
                        <TableCell className="px-4 py-3">{dept}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-slate-500"
                    >
                      No employees found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Users pagination using shadcn primitives */}
          <div className="mt-4 flex items-center justify-end">
            <Pagination>
              <PaginationContent>
                <PaginationPrevious
                  onClick={(e: any) => {
                    e.preventDefault();
                    setUsersPage((p) => Math.max(1, p - 1));
                  }}
                />
                {renderPageNumbers(
                  usersPage,
                  totalPages(filteredDirectory.length),
                  (p: number) => setUsersPage(p)
                )}
                <PaginationNext
                  onClick={(e: any) => {
                    e.preventDefault();
                    setUsersPage((p) =>
                      Math.min(totalPages(filteredDirectory.length), p + 1)
                    );
                  }}
                />
              </PaginationContent>
            </Pagination>
          </div>
        </div>

        {/* Labor Information */}
        <div className="p-4 bg-white rounded-2xl shadow border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Labor Information — Allocations
            </h3>
            <div className="text-sm text-slate-400">
              Showing {filteredLaborInfos.length} records
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-cyan-700 hover:bg-cyan-800">
                  <TableHead className="text-white px-4 py-3">
                    First name
                  </TableHead>
                  <TableHead className="text-white px-4 py-3">
                    Last name
                  </TableHead>
                  <TableHead className="text-white px-4 py-3">
                    Starts at
                  </TableHead>
                  <TableHead className="text-white px-4 py-3">
                    Ends at
                  </TableHead>
                  <TableHead className="text-white px-4 py-3">Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {pagedLabor.length > 0 ? (
                  pagedLabor.map((li: any, idx: number) => {
                    const first = li.firstName ?? li.first_name ?? "";
                    const last = li.lastName ?? li.last_name ?? "";

                    const starts = li.startsAt
                      ? new Date(li.startsAt).toLocaleDateString()
                      : "-";
                    const ends = li.endsAt
                      ? new Date(li.endsAt).toLocaleDateString()
                      : "-";
                    const status = li.status ?? "-";
                    return (
                      <TableRow key={li.id ?? idx} className="hover:bg-gray-50">
                        <TableCell className="px-4 py-3">{first}</TableCell>
                        <TableCell className="px-4 py-3">{last}</TableCell>

                        <TableCell className="px-4 py-3">{starts}</TableCell>
                        <TableCell className="px-4 py-3">{ends}</TableCell>
                        <TableCell className="px-4 py-3">{status}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-slate-500"
                    >
                      No labor information found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Labor pagination using shadcn primitives */}
          <div className="mt-4 flex items-center justify-end">
            <Pagination>
              <PaginationContent>
                <PaginationPrevious
                  onClick={(e: any) => {
                    e.preventDefault();
                    setLaborPage((p) => Math.max(1, p - 1));
                  }}
                />
                {renderPageNumbers(
                  laborPage,
                  totalPages(filteredLaborInfos.length),
                  (p: number) => setLaborPage(p)
                )}
                <PaginationNext
                  onClick={(e: any) => {
                    e.preventDefault();
                    setLaborPage((p) =>
                      Math.min(totalPages(filteredLaborInfos.length), p + 1)
                    );
                  }}
                />
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </main>
    </div>
  );
}
