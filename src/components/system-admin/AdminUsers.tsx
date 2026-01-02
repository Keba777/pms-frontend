"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
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
import { useOrganizations } from "@/hooks/useOrganizations";
import { useAuthStore } from "@/store/authStore";
import Spinner from "@/components/common/ui/Spinner";
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
    Building,
    MoreHorizontal,
    Trash2,
    Filter,
    Search,
} from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";

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

const SystemAdminUsersPage = () => {
    const { user: currentUser } = useAuthStore();

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
    const { data: organizations = [] } = useOrganizations();

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

    // === COLUMN CUSTOMIZATION ===
    const columnOptions: Record<string, string> = {
        id: "ID",
        organization: "Organization", // Always visible for System Admin
        profile: "Profile",
        name: "Name",
        role: "Role",
        access: "Permission Level",
        department: "Department",
        site: "Site",
        phone: "Phone",
        status: "Status",
        assigned: "Assigned",
        actions: "Actions",
        username: "Username",
        gender: "Gender",
        position: "Position",
        terms: "Terms",
        joiningDate: "Joining Date",
        estSalary: "Est Salary",
        ot: "OT",
    };

    const [selectedColumns, setSelectedColumns] = useState<string[]>(Object.keys(columnOptions));
    const [showColumnMenu, setShowColumnMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowColumnMenu(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

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
            if (filterValues.organization && typeof filterValues.organization === "string") {
                ok = ok && (u.organization?.orgName ?? "").toLowerCase().includes(filterValues.organization.toLowerCase());
            }
            return ok;
        });
    }, [users, filterValues]);

    if (error) {
        return (
            <div className="text-red-600 text-center py-4">
                Failed to load data. Please try again.
            </div>
        );
    }

    // === METRICS ===
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status?.toLowerCase() === "active" || !u.status).length;
    const nonActiveUsers = totalUsers - activeUsers;
    const departmentCount = departments.length;
    const rolesCount = roles.length;

    const metrics = [
        { title: "Total Users", value: totalUsers, icon: <UsersIcon className="h-6 w-6 text-cyan-700" /> },
        { title: "Active Users", value: activeUsers, icon: <ActiveIcon className="h-6 w-6 text-cyan-700" /> },
        { title: "Non-Active Users", value: nonActiveUsers, icon: <InactiveIcon className="h-6 w-6 text-cyan-700" /> },
        { title: "Departments", value: departmentCount, icon: <DepartmentsIcon className="h-6 w-6 text-cyan-700" /> },
        { title: "Roles", value: rolesCount, icon: <RolesIcon className="h-6 w-6 text-cyan-700" /> },
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

    const handleViewUser = (userId: string) => {
        router.push(`/users/profile/${userId}`);
    };

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

    // === DOWNLOAD COLUMNS (with real image URL) ===
    const downloadColumns: Column<User>[] = [
        { header: "ID", accessor: (_r, index) => `RC${String(index! + 1).padStart(3, "0")}` },
        { header: "Organization", accessor: (r) => r.organization?.orgName ?? "Global" },
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
    const roleOptions: Option<string>[] = roles.map(r => ({ label: r.name, value: r.name }));
    const departmentOptions: Option<string>[] = departments.map(d => ({ label: d.name, value: d.name }));
    const statusOptions: Option<string>[] = [
        { label: "Active", value: "Active" },
        { label: "InActive", value: "InActive" },
    ];
    const genderOptions: Option<string>[] = [
        { label: "Male", value: "Male" },
        { label: "Female", value: "Female" },
    ];
    const termsOptions: Option<string>[] = [
        { label: "Part Time", value: "Part Time" },
        { label: "Contract", value: "Contract" },
        { label: "Temporary", value: "Temporary" },
        { label: "Permanent", value: "Permanent" },
    ];
    const organizationOptions: Option<string>[] = organizations.map(o => ({ label: o.orgName, value: o.orgName }));

    const filterFields: FilterField<string>[] = [
        // Prominent Organization Filter at the top (implemented as first item)
        { name: "organization", label: "Filter by Organization", type: "select", options: organizationOptions, placeholder: "Select Organization" },
        { name: "name", label: "Name", type: "text", placeholder: "Search by name…" },
        { name: "role", label: "Role", type: "select", options: roleOptions, placeholder: "Filter by role" },
        { name: "department", label: "Department", type: "select", options: departmentOptions, placeholder: "Filter by department" },
        { name: "status", label: "Status", type: "select", options: statusOptions, placeholder: "Filter by status" },
        { name: "gender", label: "Gender", type: "select", options: genderOptions, placeholder: "Filter by gender" },
        { name: "terms", label: "Terms", type: "select", options: termsOptions, placeholder: "Filter by terms" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Global Users Management</h1>
                <div className="flex items-center gap-3">
                    <GenericDownloads data={filteredUsers} title="Global_Users_List" columns={downloadColumns} />
                    <button
                        className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-3 rounded text-sm flex items-center gap-2"
                        onClick={() => setShowForm(true)}
                    >
                        <PlusIcon width={15} height={15} /> Add User
                    </button>
                </div>
            </div>

            {/* Import Button */}
            <div className="flex justify-end mb-4">
                <GenericImport<ImportUserRow>
                    expectedColumns={importColumns}
                    requiredAccessors={requiredAccessors}
                    onImport={handleImport}
                    title="Users"
                    onError={handleError}
                />
            </div>


            {/* Modals */}
            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <UserForm onClose={() => setShowForm(false)} />
                    </div>
                </div>
            )}
            {showEditForm && userToEdit && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <EditUserForm
                            user={userToEdit}
                            onClose={() => setShowEditForm(false)}
                            onSubmit={handleUpdateUser}
                        />
                    </div>
                </div>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {metrics.map(({ title, value, icon }) => (
                    <MetricsCard key={title} title={title} value={value} icon={icon} />
                ))}
            </div>

            {/* Filters + Columns */}
            <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Filters take up more space */}
                <div className="flex-1">
                    <GenericFilter fields={filterFields} onFilterChange={setFilterValues} />
                </div>

                <div ref={menuRef} className="relative mt-1">
                    <button
                        onClick={() => setShowColumnMenu(prev => !prev)}
                        className="flex items-center gap-1 px-4 py-2 text-sm bg-gray-100 text-gray-700 border hover:bg-gray-200 rounded"
                    >
                        Columns <ChevronDown className="w-4 h-4" />
                    </button>
                    {showColumnMenu && (
                        <div className="absolute right-0 mt-1 w-48 bg-white border rounded shadow-lg z-10 max-h-80 overflow-y-auto">
                            {Object.entries(columnOptions).map(([key, label]) => (
                                <label key={key} className="flex items-center w-full px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedColumns.includes(key)}
                                        onChange={() => setSelectedColumns(prev =>
                                            prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
                                        )}
                                        className="mr-2"
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
                <table className="min-w-max w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {selectedColumns.includes("id") && <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>}
                            {selectedColumns.includes("profile") && <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>}
                            {selectedColumns.includes("name") && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>}
                            {selectedColumns.includes("role") && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>}
                            {selectedColumns.includes("organization") && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>}
                            {/* Organization near the start for visibility */}
                            {selectedColumns.includes("access") && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permission</th>}
                            {selectedColumns.includes("department") && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>}
                            {selectedColumns.includes("site") && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site</th>}
                            {selectedColumns.includes("phone") && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>}
                            {selectedColumns.includes("status") && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>}
                            {selectedColumns.includes("assigned") && <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>}
                            {selectedColumns.includes("username") && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>}
                            {selectedColumns.includes("gender") && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>}

                            {selectedColumns.includes("position") && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>}
                            {selectedColumns.includes("terms") && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terms</th>}
                            {selectedColumns.includes("joiningDate") && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>}
                            {selectedColumns.includes("estSalary") && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>}
                            {selectedColumns.includes("ot") && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OT</th>}
                            {selectedColumns.includes("actions") && <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loadingUsers ? (
                            Array.from({ length: 5 }).map((_, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    {selectedColumns.map((col) => (
                                        <td key={col} className="px-4 py-2">
                                            <Skeleton className="h-4 w-full" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            filteredUsers.map((user, idx) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    {selectedColumns.includes("id") && <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">{idx + 1}</td>}
                                    {selectedColumns.includes("profile") && (
                                        <td className="px-4 py-4 whitespace-nowrap text-center">
                                            <Image src={user.profile_picture || avatar} alt="Profile" width={32} height={32} className="rounded-full inline-block" />
                                        </td>
                                    )}
                                    {selectedColumns.includes("name") && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link href={`/users/profile/${user.id}`} className="text-cyan-700 hover:text-cyan-900 font-medium">
                                                {user.first_name} {user.last_name}
                                            </Link>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </td>
                                    )}
                                    {selectedColumns.includes("role") && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.role?.name || "—"}</td>}
                                    {selectedColumns.includes("organization") && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {user.organization?.logo ? (
                                                    <Image src={user.organization.logo} alt="org" width={20} height={20} className="rounded" />
                                                ) : (
                                                    <Building className="w-4 h-4 text-gray-400" />
                                                )}
                                                <span className="text-sm font-medium text-gray-900">{user.organization?.orgName || "Global"}</span>
                                            </div>
                                        </td>
                                    )}
                                    {selectedColumns.includes("access") && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
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
                                        </td>
                                    )}
                                    {selectedColumns.includes("department") && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.department?.name || "—"}</td>}
                                    {selectedColumns.includes("site") && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.site?.name || "—"}</td>}
                                    {selectedColumns.includes("phone") && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.phone}</td>}
                                    {selectedColumns.includes("status") && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {user.status || "Active"}
                                            </span>
                                        </td>
                                    )}
                                    {selectedColumns.includes("assigned") && (
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex space-x-2 justify-center">
                                                <AssignBadge name="Projects" count={user.projects?.length ?? 0} />
                                                <AssignBadge name="Tasks" count={user.tasks?.length ?? 0} />
                                                <AssignBadge name="Activities" count={user.activities?.length ?? 0} />
                                            </div>
                                        </td>
                                    )}
                                    {selectedColumns.includes("username") && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.username || "—"}</td>}
                                    {selectedColumns.includes("gender") && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.gender || "—"}</td>}

                                    {selectedColumns.includes("position") && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.position || "—"}</td>}
                                    {selectedColumns.includes("terms") && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.terms || "—"}</td>}
                                    {selectedColumns.includes("joiningDate") && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : "—"}</td>}
                                    {selectedColumns.includes("estSalary") && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.estSalary || "—"}</td>}
                                    {selectedColumns.includes("ot") && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.ot || "—"}</td>}
                                    {selectedColumns.includes("actions") && (
                                        <td className="px-4 py-4 whitespace-nowrap text-center">
                                            <Menu as="div" className="relative inline-block text-left">
                                                <MenuButton className="inline-flex justify-center w-full px-2 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </MenuButton>
                                                <MenuItems className="absolute right-0 mt-2 w-48 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                                    <div className="px-1 py-1 ">
                                                        <MenuItem>
                                                            {({ active }) => (
                                                                <button
                                                                    className={`${active ? "bg-cyan-700 text-white" : "text-gray-900"
                                                                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                                                    onClick={() => { setUserToEdit(user); setShowEditForm(true); }}
                                                                >
                                                                    <Edit2 className="w-4 h-4 mr-2" /> Update
                                                                </button>
                                                            )}
                                                        </MenuItem>
                                                        <MenuItem>
                                                            {({ active }) => (
                                                                <button
                                                                    className={`${active ? "bg-red-600 text-white" : "text-gray-900"
                                                                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                                                    onClick={() => handleDeleteUserClick(user.id)}
                                                                >
                                                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                                </button>
                                                            )}
                                                        </MenuItem>
                                                    </div>
                                                </MenuItems>
                                            </Menu>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
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

export default SystemAdminUsersPage;
