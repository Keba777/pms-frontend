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
  "hsl(var(--primary))",
  "hsl(var(--primary) / 0.8)",
  "hsl(var(--primary) / 0.6)",
  "hsl(var(--primary) / 0.4)",
  "hsl(var(--primary) / 0.2)",
  "hsl(var(--muted))",
  "hsl(var(--muted-foreground))",
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
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="p-8 bg-destructive/5 border border-destructive/20 rounded-3xl text-center max-w-sm">
          <p className="text-destructive font-black uppercase tracking-widest text-[10px]">Access Denied</p>
          <p className="text-foreground mt-2 font-bold">HR Authorization Protocol Required</p>
        </div>
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
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              isActive
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:bg-primary/10 hover:text-primary border border-transparent"
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
      pushPage(1);
      if (current > 4)
        items.push(
          <PaginationEllipsis key="e-left" className="text-muted-foreground/30" />
        );
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let p = start; p <= end; p++) pushPage(p);
      if (current < total - 3)
        items.push(
          <PaginationEllipsis key="e-right" className="text-muted-foreground/30" />
        );
      pushPage(total);
    }
    return items;
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 font-sans antialiased">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col gap-6 bg-card p-6 sm:p-12 rounded-[3.5rem] border border-border shadow-2xl shadow-black/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-[100px] pointer-events-none" />
          <div className="flex items-center justify-between relative z-10 w-full">
            <div className="flex items-center gap-8">
              <div className="rounded-[2.5rem] bg-primary/10 p-6 shadow-xl border border-primary/20">
                <Users className="text-primary" size={40} />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-black text-primary uppercase tracking-tighter">
                  Personnel Command
                </h1>
                <p className="text-[10px] sm:text-xs font-black text-muted-foreground/60 uppercase tracking-[0.3em] mt-3 flex items-center gap-3">
                  <span className="w-12 h-px bg-primary/30" /> Sites, allocations and labor orchestration
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-4">
              <Button onClick={exportCSV} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl px-8 py-6 text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/20">
                <Download className="mr-3" size={16} /> Export Intelligence
              </Button>
            </div>
          </div>
        </header>

        <main className="space-y-6">
          {/* KPI row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 rounded-[2.5rem] bg-card shadow-2xl shadow-black/5 border border-border group hover:bg-primary/5 transition-all">
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-3">Total Manifest</div>
              <div className="text-4xl font-black text-primary tracking-tighter">
                {String(users.length).padStart(2, '0')}
              </div>
              <div className="text-[8px] font-black text-primary/40 uppercase tracking-widest mt-4">Synced across all sectors</div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-card shadow-2xl shadow-black/5 border border-border group hover:bg-primary/5 transition-all">
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-3">Active Hubs</div>
              <div className="text-4xl font-black text-primary tracking-tighter">
                {String(sites.length - 1).padStart(2, '0')}
              </div>
              <div className="text-[8px] font-black text-primary/40 uppercase tracking-widest mt-4">Operational sites detected</div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-card shadow-2xl shadow-black/5 border border-border group hover:bg-primary/5 transition-all">
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-3">Pending Sync</div>
              <div className="text-4xl font-black text-destructive tracking-tighter">
                {String(Math.max(
                  0,
                  (laborTimesheets ?? []).length -
                  (laborTimesheets ?? []).filter(
                    (t: any) => t.status === "Approved"
                  ).length
                )).padStart(2, '0')}
              </div>
              <div className="text-[8px] font-black text-destructive/40 uppercase tracking-widest mt-4">Review protocol required</div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-card shadow-2xl shadow-black/5 border border-border group hover:bg-primary/5 transition-all">
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-3">System Compliance</div>
              <div className="text-4xl font-black text-primary tracking-tighter">
                {`${Math.round(
                  (siteSummaries.reduce((s, a) => s + a.compliance, 0) || 100) /
                  Math.max(1, siteSummaries.length || 1)
                )}%`}
              </div>
              <div className="text-[8px] font-black text-primary/40 uppercase tracking-widest mt-4">Aggregate efficiency rating</div>
            </div>
          </div>

          {/* charts: composed chart for site overview + pie */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 p-8 bg-card rounded-[2.5rem] shadow-2xl shadow-black/5 border border-border">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-primary uppercase tracking-widest">
                  Sector Metrics — Matrix Overview
                </h3>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">Top operational sectors</div>
              </div>

              <div style={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 10, right: 40, bottom: 80, left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={80}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: "bold" }}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: "bold" }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 100]}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: "bold" }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "1rem" }}
                      itemStyle={{ fontSize: "10px", fontWeight: "black", textTransform: "uppercase" }}
                      formatter={(value: any, name: any) => {
                        if (name === "compliance")
                          return [`${value}%`, "Compliance rating"];
                        return [
                          value,
                          name.charAt(0).toUpperCase() + name.slice(1),
                        ];
                      }}
                    />
                    <Legend verticalAlign="top" wrapperStyle={{ fontSize: "10px", fontWeight: "black", textTransform: "uppercase", paddingBottom: "20px" }} />
                    <Bar
                      yAxisId="left"
                      dataKey="headcount"
                      name="Manifest Count"
                      barSize={32}
                      radius={[8, 8, 0, 0]}
                    >
                      {chartData.map((entry: any, idx: number) => (
                        <Cell key={`hc-${idx}`} fill={entry.color} />
                      ))}
                    </Bar>
                    <Bar
                      yAxisId="left"
                      dataKey="missing"
                      name="Missing Syncs"
                      barSize={16}
                      fill="hsl(var(--destructive))"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="compliance"
                      name="Sync Integrity (%)"
                      stroke="hsl(var(--primary))"
                      strokeWidth={4}
                      dot={{ r: 6, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-8 bg-card rounded-[2.5rem] shadow-2xl shadow-black/5 border border-border">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-primary uppercase tracking-widest">Log Status</h3>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">All signal channels</div>
              </div>

              <div
                style={{ height: 320 }}
                className="flex items-center justify-center"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={timesheetStatusCounts}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={8}
                      cornerRadius={8}
                      stroke="none"
                    >
                      {timesheetStatusCounts.map((entry: any, idx: number) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={COLORS[idx % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "1rem" }}
                      itemStyle={{ fontSize: "10px", fontWeight: "black", textTransform: "uppercase" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "10px", fontWeight: "black", textTransform: "uppercase" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Controls (moved below main) */}
          {/* Controls */}
          <div className="p-8 bg-card rounded-[2.5rem] shadow-2xl shadow-black/5 border border-border">
            <div className="flex flex-col lg:flex-row items-center gap-6 justify-between">
              <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                <Select
                  value={selectedSite}
                  onValueChange={(v: any) => {
                    setSelectedSite(v);
                    setUsersPage(1);
                    setLaborPage(1);
                  }}
                >
                  <SelectTrigger className="w-64 bg-background border-border rounded-2xl px-6 py-6 text-[10px] font-black uppercase tracking-widest text-primary focus:ring-4 focus:ring-primary/10 transition-all">
                    <SelectValue placeholder="Select Sector" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-2xl">
                    {sites.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
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
                  className="w-full lg:w-[32rem] bg-background border-border rounded-2xl px-8 py-6 text-[10px] font-black uppercase tracking-widest text-foreground focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/30"
                />
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0">
                <Button
                  onClick={() => {
                    setSearch("");
                    setSelectedSite("all");
                    setUsersPage(1);
                    setLaborPage(1);
                    setSitePage(1);
                  }}
                  className="flex-1 lg:flex-none bg-muted/20 text-muted-foreground hover:bg-muted/30 border-none rounded-2xl px-8 py-6 text-[10px] font-black uppercase tracking-widest"
                >
                  Reset Matrix
                </Button>
              </div>
            </div>
          </div>

          {/* Employee Directory */}
          <div className="p-8 bg-card rounded-[2.5rem] shadow-2xl shadow-black/5 border border-border">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-primary uppercase tracking-widest">
                Personnel Directory — Active Manifest
              </h3>
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
                Tracking {filteredDirectory.length} of {users.length} units
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/5 hover:bg-primary/5 border-b border-border">
                    <TableHead className="text-primary text-[10px] font-black uppercase tracking-widest px-8 py-5">
                      First ID
                    </TableHead>
                    <TableHead className="text-primary text-[10px] font-black uppercase tracking-widest px-8 py-5">
                      Last ID
                    </TableHead>
                    <TableHead className="text-primary text-[10px] font-black uppercase tracking-widest px-8 py-5">Communication</TableHead>
                    <TableHead className="text-primary text-[10px] font-black uppercase tracking-widest px-8 py-5">Signal</TableHead>
                    <TableHead className="text-primary text-[10px] font-black uppercase tracking-widest px-8 py-5">Primary Hub</TableHead>
                    <TableHead className="text-primary text-[10px] font-black uppercase tracking-widest px-8 py-5">
                      Sector
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-border/50">
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
                          className="hover:bg-primary/5 transition-all group border-b border-border/50"
                        >
                          <TableCell className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">{first}</TableCell>
                          <TableCell className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">{last}</TableCell>
                          <TableCell className="px-8 py-6 text-[10px] font-bold text-muted-foreground/60">{email}</TableCell>
                          <TableCell className="px-8 py-6 text-[10px] font-bold text-muted-foreground/60">{phone}</TableCell>
                          <TableCell className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-primary/80">{siteName}</TableCell>
                          <TableCell className="px-8 py-6 text-[10px] font-bold text-muted-foreground/40">{dept}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-20 text-muted-foreground/20 text-[10px] font-black uppercase tracking-[0.3em]"
                      >
                        No manifest detected
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Users pagination using shadcn primitives */}
            <div className="mt-8 flex items-center justify-center sm:justify-end">
              <Pagination className="justify-center sm:justify-end">
                <PaginationContent className="gap-2">
                  <PaginationPrevious
                    onClick={(e: any) => {
                      e.preventDefault();
                      setUsersPage((p) => Math.max(1, p - 1));
                    }}
                    className="rounded-xl px-6 py-6 text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
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
                    className="rounded-xl px-6 py-6 text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
                  />
                </PaginationContent>
              </Pagination>
            </div>
          </div>

          {/* Labor Information */}
          <div className="p-8 bg-card rounded-[2.5rem] shadow-2xl shadow-black/5 border border-border">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-primary uppercase tracking-widest">
                Labor Information — Allocation Matrix
              </h3>
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
                {filteredLaborInfos.length} operational records detected
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/5 hover:bg-primary/5 border-b border-border">
                    <TableHead className="text-primary text-[10px] font-black uppercase tracking-widest px-8 py-5">
                      First ID
                    </TableHead>
                    <TableHead className="text-primary text-[10px] font-black uppercase tracking-widest px-8 py-5">
                      Last ID
                    </TableHead>
                    <TableHead className="text-primary text-[10px] font-black uppercase tracking-widest px-8 py-5"> Commencement</TableHead>
                    <TableHead className="text-primary text-[10px] font-black uppercase tracking-widest px-8 py-5"> Termination</TableHead>
                    <TableHead className="text-primary text-[10px] font-black uppercase tracking-widest px-8 py-5">Duty State</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-border/50">
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
                        <TableRow key={li.id ?? idx} className="hover:bg-primary/5 transition-all group border-b border-border/50">
                          <TableCell className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">{first}</TableCell>
                          <TableCell className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">{last}</TableCell>
                          <TableCell className="px-8 py-6 text-[10px] font-bold text-muted-foreground/60">{starts}</TableCell>
                          <TableCell className="px-8 py-6 text-[10px] font-bold text-muted-foreground/60">{ends}</TableCell>
                          <TableCell className="px-8 py-6">
                            <span className="px-3 py-1 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/20">
                              {status}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-20 text-muted-foreground/20 text-[10px] font-black uppercase tracking-[0.3em]"
                      >
                        No operational telemetry detected
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Labor pagination using shadcn primitives */}
            <div className="mt-8 flex items-center justify-center sm:justify-end">
              <Pagination className="justify-center sm:justify-end">
                <PaginationContent className="gap-2">
                  <PaginationPrevious
                    onClick={(e: any) => {
                      e.preventDefault();
                      setLaborPage((p) => Math.max(1, p - 1));
                    }}
                    className="rounded-xl px-6 py-6 text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
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
                    className="rounded-xl px-6 py-6 text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
                  />
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
