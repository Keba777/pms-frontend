"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import avatar from "@/../public/images/user.png";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import {
  useDeleteUser,
  useUpdateUser,
  useUsers,
  useCreateUser,
  useImportUsers,
} from "@/hooks/useUsers";
import { useDepartments } from "@/hooks/useDepartments";
import { useRoles } from "@/hooks/useRoles";
import { useSites } from "@/hooks/useSites";
import { useAuthStore } from "@/store/authStore";
import MetricsCard from "@/components/users/MetricsCard";
import Link from "next/link";
import {
  Users as UsersIcon,
  CheckCircle as ActiveIcon,
  XCircle as InactiveIcon,
  Building2 as DepartmentsIcon,
  Shield as RolesIcon,
  ChevronDown,
  PlusIcon,
  LucideEdit2 as Edit2,
  MoreVertical,
  Briefcase,
  Layers,
  LayoutGrid,
} from "lucide-react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import AssignBadge from "@/components/users/AssignBadge";
import ConfirmModal from "@/components/common/ui/ConfirmModal";
import { UpdateUserInput, User } from "@/types/user";
import { useRouter } from "next/navigation";
import UserForm from "@/components/forms/UserForm";
import EditUserForm from "@/components/forms/EditUserForm";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import GenericImport, { ImportColumn } from "@/components/common/GenericImport";
import {
  FilterField,
  FilterValues,
  GenericFilter,
  Option,
} from "@/components/common/GenericFilter";
import { toast } from "react-toastify";
import SystemAdminUsersPage from "@/components/system-admin/AdminUsers";
import { ReusableTable, ColumnConfig } from "@/components/common/ReusableTable";

// === TEMPORARY TYPE FOR IMPORT (supports File or URL) ===
interface ImportUserRow {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role_name: string;
  department_name?: string;
  site_name: string;
  profile_picture?: string | File; // ← File or URL
  access?: "Low Access" | "Full Access" | "Average Access";
  status?: "Active" | "InActive";
  responsibilities?: string;
  username?: string;
  gender?: string;
  position?: string;
  terms?: string;
  joining_date?: string;
  est_salary?: number;
  ot?: number;
}

const UsersPage = () => {
  const { user: currentUser } = useAuthStore();
  const isSystemAdmin = currentUser?.role?.name?.toLowerCase() === "systemadmin";

  // === DATA ===
  const {
    data: users = [],
    isLoading: loadingUsers,
    isError: usersError,
  } = useUsers();
  const {
    data: departments = [],
    isLoading: loadingDepartments,
    isError: departmentsError,
  } = useDepartments();
  const {
    data: roles = [],
    isLoading: loadingRoles,
    isError: rolesError,
  } = useRoles();
  const {
    data: sites = [],
    isLoading: loadingSites,
    isError: sitesError,
  } = useSites();

  const error = usersError || departmentsError || rolesError || sitesError;
  const router = useRouter();

  const { mutate: deleteUser } = useDeleteUser();
  const { mutate: updateUser } = useUpdateUser();
  const { mutateAsync: createUser } = useCreateUser();
  const { mutateAsync: importUsers } = useImportUsers();

  // === UI STATE ===
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editingAccessUserId, setEditingAccessUserId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // === FILTERING ===
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((u) => {
      let ok = true;
      if (filterValues.name && typeof filterValues.name === "string") {
        const q = filterValues.name.toLowerCase();
        ok = ok && (
          `${u.first_name ?? ""} ${u.last_name ?? ""}`.toLowerCase().includes(q) ||
          (u.email ?? "").toLowerCase().includes(q)
        );
      }
      if (filterValues.role && typeof filterValues.role === "string") {
        ok = ok && (u.role?.name ?? "").toLowerCase() === filterValues.role.toLowerCase();
      }
      if (filterValues.department && typeof filterValues.department === "string") {
        ok = ok && (u.department?.name ?? "").toLowerCase().includes(filterValues.department.toLowerCase());
      }
      if (filterValues.status && typeof filterValues.status === "string") {
        ok = ok && (u.status ?? "Active").toLowerCase() === filterValues.status.toLowerCase();
      }
      if (filterValues.gender && typeof filterValues.gender === "string") {
        ok = ok && (u.gender ?? "Male") === filterValues.gender;
      }
      if (filterValues.terms && typeof filterValues.terms === "string") {
        ok = ok && (u.terms ?? "") === filterValues.terms;
      }
      return ok;
    });
  }, [users, filterValues]);

  // === METRICS ===
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status?.toLowerCase() === "active" || !u.status).length;
  const nonActiveUsers = totalUsers - activeUsers;
  const departmentCount = departments.length;
  const rolesCount = roles.length;

  const metrics = [
    { title: "Total Users", value: totalUsers, icon: <UsersIcon className="h-6 w-6 text-primary" /> },
    { title: "Active Users", value: activeUsers, icon: <ActiveIcon className="h-6 w-6 text-primary" /> },
    { title: "Non-Active Users", value: nonActiveUsers, icon: <InactiveIcon className="h-6 w-6 text-primary" /> },
    { title: "Departments", value: departmentCount, icon: <DepartmentsIcon className="h-6 w-6 text-primary" /> },
    { title: "Roles", value: rolesCount, icon: <RolesIcon className="h-6 w-6 text-primary" /> },
  ];

  // === ACTION HANDLERS ===
  const handleDeleteUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUser = () => {
    if (selectedUserId) {
      deleteUser(selectedUserId);
      setIsDeleteModalOpen(false);
    }
  };

  const handleEditClick = (user: User) => {
    setUserToEdit(user);
    setShowEditForm(true);
  }

  const handleUpdateUser = (data: UpdateUserInput) => {
    updateUser(data);
    setShowEditForm(false);
  };

  const handleAccessChange = (
    userId: string,
    newAccess: "Low Access" | "Full Access" | "Average Access"
  ) => {
    updateUser({ id: userId, access: newAccess });
    setEditingAccessUserId(null);
  };

  // === TABLE COLUMNS DEFINITION ===
  const columns: ColumnConfig<User>[] = useMemo(() => [
    {
      key: "id",
      label: "ID",
      render: (_, index) => <div className="text-center">{index + 1}</div>,
    },
    {
      key: "profile",
      label: "Profile",
      render: (user) => (
        <div className="flex justify-center">
          <Image
            src={user.profile_picture || avatar}
            alt="Profile"
            width={32}
            height={32}
            className="rounded-full"
          />
        </div>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (user) => (
        <div>
          <Link href={`/users/profile/${user.id}`} className="text-primary hover:text-cyan-900 font-medium whitespace-nowrap">
            {user.first_name} {user.last_name}
          </Link>
          <div className="text-xs text-gray-500">{user.email}</div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (user) => (
        <div className="whitespace-nowrap">{user.role?.name || "—"}</div>
      )
    },
    {
      key: "access",
      label: "Permission",
      render: (user) => (
        <div className="whitespace-nowrap">
          {editingAccessUserId === user.id ? (
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
              defaultValue={user.access ?? "Low Access"}
              onChange={(e) => handleAccessChange(user.id, e.target.value as any)}
              onBlur={() => setEditingAccessUserId(null)}
              autoFocus
            >
              <option>Low Access</option>
              <option>Average Access</option>
              <option>Full Access</option>
            </select>
          ) : (
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setEditingAccessUserId(user.id)}>
              <span>{user.access || "Low Access"}</span>
              <Edit2 className="w-3 h-3 text-gray-400 group-hover:text-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>
      )
    },
    {
      key: "department",
      label: "Department",
      render: (user) => <div className="whitespace-nowrap">{user.department?.name || "—"}</div>
    },
    {
      key: "site",
      label: "Site",
      render: (user) => <div className="whitespace-nowrap">{user.site?.name || "—"}</div>
    },
    {
      key: "phone",
      label: "Phone",
      render: (user) => <div className="whitespace-nowrap">{user.phone}</div>
    },
    {
      key: "status",
      label: "Status",
      render: (user) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {user.status || "Active"}
        </span>
      )
    },
    {
      key: "assigned",
      label: "Assigned",
      render: (user) => (
        <div className="flex space-x-2 justify-center">
          <AssignBadge name="Projects" count={user.projects?.length ?? 0} />
          <AssignBadge name="Tasks" count={user.tasks?.length ?? 0} />
          <AssignBadge name="Activities" count={user.activities?.length ?? 0} />
        </div>
      )
    },
    { key: "username", label: "Username", render: (u) => u.username || "—" },
    { key: "gender", label: "Gender", render: (u) => u.gender || "—" },
    { key: "position", label: "Position", render: (u) => u.position || "—" },
    { key: "terms", label: "Terms", render: (u) => u.terms || "—" },
    { key: "joining_date", label: "Joining Date", render: (u) => u.joiningDate ? new Date(u.joiningDate).toLocaleDateString() : "—" },
    { key: "est_salary", label: "Salary", render: (u) => u.estSalary || "—" },
    { key: "ot", label: "OT", render: (u) => u.ot || "—" },
    {
      key: "actions",
      label: "Actions",
      render: (user) => (
        <div className="flex items-center justify-center">
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
              <DropdownMenuItem
                onClick={() => handleEditClick(user)}
              >
                <FaEdit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteUserClick(user.id)}
              >
                <FaTrash className="mr-2 h-4 w-4 text-red-600" /> <span className="text-red-600">Delete</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/users/profile/${user.id}`)}
              >
                <FaEye className="mr-2 h-4 w-4" /> Quick View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ], [editingAccessUserId, users, handleAccessChange]); // re-memoize when these change

  // === DOWNLOAD COLUMNS (with real image URL) ===
  const downloadColumns: Column<User>[] = [
    { header: "ID", accessor: (_r, index) => `RC${String(index! + 1).padStart(3, "0")}` },
    { header: "Name", accessor: (r) => `${r.first_name} ${r.last_name}` },
    { header: "Email", accessor: "email" },
    { header: "Role", accessor: (r) => r.role?.name ?? "-" },
    { header: "Permission Level", accessor: (r) => r.access ?? "-" },
    { header: "Department", accessor: (r) => r.department?.name ?? "-" },
    { header: "Site", accessor: (r) => r.site?.name ?? "-" },
    { header: "Phone", accessor: "phone" },
    { header: "Status", accessor: (r) => r.status ?? "Active" },
    { header: "Projects Count", accessor: (r) => r.projects?.length ?? 0 },
    { header: "Tasks Count", accessor: (r) => r.tasks?.length ?? 0 },
    { header: "Activities Count", accessor: (r) => r.activities?.length ?? 0 },
    { header: "Profile Picture", accessor: (r) => r.profile_picture ?? "-" },
    { header: "Username", accessor: (r) => r.username ?? "-" },
    { header: "Gender", accessor: (r) => r.gender ?? "-" },
    { header: "Position", accessor: (r) => r.position ?? "-" },
    { header: "Terms", accessor: (r) => r.terms ?? "-" },
    { header: "Joining Date", accessor: (r) => r.joiningDate ? new Date(r.joiningDate).toISOString() : "-" },
    { header: "Est Salary", accessor: (r) => r.estSalary ?? "-" },
    { header: "OT", accessor: (r) => r.ot ?? "-" },
  ];

  // === IMPORT COLUMNS ===
  const importColumns: ImportColumn<ImportUserRow>[] = [
    { header: "First Name", accessor: "first_name", type: "string" },
    { header: "Last Name", accessor: "last_name", type: "string" },
    { header: "Email", accessor: "email", type: "string" },
    { header: "Phone", accessor: "phone", type: "string" },
    { header: "Role Name", accessor: "role_name", type: "string" },
    { header: "Department Name", accessor: "department_name", type: "string" },
    { header: "Site Name", accessor: "site_name", type: "string" },
    { header: "Profile Picture", accessor: "profile_picture", type: "file" },
    { header: "Permission Level", accessor: "access", type: "string" },
    { header: "Status", accessor: "status", type: "string" },
    { header: "Responsibilities", accessor: "responsibilities", type: "string" },
    { header: "Username", accessor: "username", type: "string" },
    { header: "Gender", accessor: "gender", type: "string" },
    { header: "Position", accessor: "position", type: "string" },
    { header: "Terms", accessor: "terms", type: "string" },
    { header: "Joining Date", accessor: "joining_date", type: "string" },
    { header: "Est Salary", accessor: "est_salary", type: "number" },
    { header: "OT", accessor: "ot", type: "number" },
  ];

  const requiredAccessors: (keyof ImportUserRow)[] = [
    "first_name",
    "last_name",
    "email",
    "phone",
  ];

  const handleImport = async (rows: ImportUserRow[]) => {
    if (rows.length === 0) return;

    try {
      setUploading(true);

      const roleMap = new Map(roles.map(r => [r.name.toLowerCase(), r.id]));
      const deptMap = new Map(departments.map(d => [d.name.toLowerCase(), d.id]));
      const siteMap = new Map(sites.map(s => [s.name.toLowerCase(), s.id]));

      const formData = new FormData();

      const usersJson = rows.map((r, index) => {
        let roleId = r.role_name ? roleMap.get(r.role_name.trim().toLowerCase()) : undefined;
        if (r.role_name && !roleId) throw new Error(`Row ${index + 2}: Role "${r.role_name}" not found`);

        const siteId = r.site_name ? siteMap.get(r.site_name.trim().toLowerCase()) : undefined;
        if (r.site_name && !siteId) throw new Error(`Row ${index + 2}: Site "${r.site_name}" not found`);

        const departmentId = r.department_name
          ? deptMap.get(r.department_name.trim().toLowerCase()) || undefined
          : undefined;

        const responsibilities = r.responsibilities
          ? r.responsibilities.split(",").map(s => s.trim()).filter(Boolean)
          : [];

        const userObj: any = {
          first_name: r.first_name,
          last_name: r.last_name,
          email: r.email,
          phone: r.phone,
          password: "123456",
          role_id: roleId,
          siteId: siteId,
          department_id: departmentId,
          access: r.access,
          status: r.status,
          responsiblities: responsibilities,
          username: r.username ? r.username.trim().toLowerCase() : undefined,
          gender: r.gender,
          position: r.position,
          terms: r.terms,
          joiningDate: r.joining_date ? new Date(r.joining_date) : undefined,
          estSalary: r.est_salary ? parseFloat(r.est_salary as any) : undefined,
          ot: r.ot ? parseFloat(r.ot as any) : undefined,
        };

        // Handle profile picture
        if (r.profile_picture instanceof File && r.profile_picture.size > 0) {
          formData.append("profile_picture", r.profile_picture);
        } else if (typeof r.profile_picture === "string" && r.profile_picture.startsWith("http")) {
          userObj.profile_picture = r.profile_picture;
        }

        return userObj;
      });

      // Append users as JSON string (or as individual fields)
      formData.append("users", JSON.stringify(usersJson));
      console.log("FormData entries:", Array.from(formData.entries()));

      await importUsers(formData);
      toast.success(`Imported ${rows.length} users successfully!`);
    } catch (err: any) {
      toast.error(err.message || "Import failed");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleError = (msg: string) => toast.error(msg);

  // === FILTER OPTIONS ===
  const roleOptions: Option<string>[] = useMemo(() => roles.map(r => ({ label: r.name, value: r.name })), [roles]);
  const departmentOptions: Option<string>[] = useMemo(() => departments.map(d => ({ label: d.name, value: d.name })), [departments]);

  const filterFields: FilterField<string>[] = useMemo(() => [
    { name: "name", label: "Name", type: "text", placeholder: "Search by name…" },
    { name: "role", label: "Role", type: "select", options: roleOptions, placeholder: "Filter by role" },
    { name: "department", label: "Department", type: "select", options: departmentOptions, placeholder: "Filter by department" },
    {
      name: "status", label: "Status", type: "select", options: [
        { label: "Active", value: "Active" },
        { label: "InActive", value: "InActive" },
      ], placeholder: "Filter by status"
    },
    {
      name: "gender", label: "Gender", type: "select", options: [
        { label: "Male", value: "Male" },
        { label: "Female", value: "Female" },
      ], placeholder: "Filter by gender"
    },
    {
      name: "terms", label: "Terms", type: "select", options: [
        { label: "Part Time", value: "Part Time" },
        { label: "Contract", value: "Contract" },
        { label: "Temporary", value: "Temporary" },
        { label: "Permanent", value: "Permanent" },
      ], placeholder: "Filter by terms"
    },
  ], [roleOptions, departmentOptions]);

  // Handle System Admin View
  if (isSystemAdmin) {
    // NOTE: SystemAdminUsersPage is a separate component, 
    // but if we need consistent styling we might need to update that component too
    // OR the user meant "when system admins view THIS list" 
    // logic for "colors" usually implies row colors or badge colors.
    // In the generic table above, we use standard tailwind classes.
    return <SystemAdminUsersPage />;
  }

  if (error) {
    return (
      <div className="text-red-600 text-center py-4">
        Failed to load data. Please try again.
      </div>
    );
  }

  const handleFilterChange = (vals: FilterValues) => {
    setFilterValues(prev => {
      const newState = { ...prev, ...vals };
      // Only update if actually different to prevent loops if GenericFilter fires redundantly
      if (JSON.stringify(newState) === JSON.stringify(prev)) return prev;
      return newState;
    });
  };

  return (
    <div className="p-6 bg-gray-50/30 min-h-screen">
      {/* Dynamic Header Section */}
      <div className="flex flex-col mb-8 gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Users Overview</h1>
            <p className="text-muted-foreground mt-1">Manage and track your team members and their assignments.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <GenericImport<ImportUserRow>
              expectedColumns={importColumns}
              requiredAccessors={requiredAccessors}
              onImport={handleImport}
              title="Import Users"
              onError={handleError}
            />
            <GenericDownloads
              data={filteredUsers}
              title="Export Data"
              columns={downloadColumns}
            />
            <Button
              onClick={() => setShowForm(true)}
              className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-md px-6"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add New User
            </Button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {metrics.map(({ title, value, icon }) => (
            <MetricsCard key={title} title={title} value={value} icon={icon} />
          ))}
        </div>
      </div>

      {/* Filters Section */}
      <div className="mt-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Filter Users</h3>
          <GenericFilter
            fields={filterFields.filter((f) => f.name !== "name")}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>

      {/* ReusableTable Implementation */}
      <div className="mt-10">
        <ReusableTable
          title="Available Users"
          data={filteredUsers}
          columns={columns}
          isLoading={loadingUsers}
          isError={!!error}
          errorMessage="Failed to load users"
          searchTerm={(filterValues.name as string) || ""}
          onSearchChange={(val) =>
            setFilterValues((prev) => ({ ...prev, name: val }))
          }
          hideTitle={false}
        />
      </div>

      {isDeleteModalOpen && (
        <ConfirmModal
          isVisible={isDeleteModalOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this user?"
          showInput={false}
          confirmText="DELETE"
          confirmButtonText="Delete"
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteUser}
        />
      )}
    </div>
  );
};

export default UsersPage;
