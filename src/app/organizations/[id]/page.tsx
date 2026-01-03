"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOrganization, useUpdateOrganization } from "@/hooks/useOrganizations";
import { useAuthStore } from "@/store/authStore";
import { useUsers } from "@/hooks/useUsers";
import { DEFAULT_THEME_COLORS } from "@/constants/branding";
import { Building, Upload, Save, ArrowLeft, UserPlus } from "lucide-react";
import Spinner from "@/components/common/ui/Spinner";
import Image from "next/image";
import Link from "next/link";
import SuperAdminForm from "@/components/forms/SuperAdminForm";

// Helpers for color conversion
const intToHex = (num: number | null | undefined) => {
    if (num == null) return "#000000";
    return `#${num.toString(16).padStart(6, "0")}`;
};

const hexToInt = (hex: string) => {
    return parseInt(hex.replace("#", ""), 16);
};

const OrganizationDetailPage = () => {
    const { id } = useParams() as { id: string };
    const { user } = useAuthStore();
    const router = useRouter();
    const { data: organization, isLoading, isError } = useOrganization(id);
    const { mutate: updateOrg, isPending: isUpdating } = useUpdateOrganization();

    // Fetch all users to filter Super Admins for this org
    // Note: This relies on the global user fetch. Ideally, we would have a specific endpoint or hook option.
    const { data: allUsers } = useUsers();

    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [faviconFile, setFaviconFile] = useState<File | null>(null);
    const [showSuperAdminForm, setShowSuperAdminForm] = useState(false);

    const isSystemAdmin = user?.role?.name?.toLowerCase() === "systemadmin";
    const canEdit = isSystemAdmin;

    // Find Super Admins for this organization
    const superAdmins = allUsers?.filter(u =>
        u.orgId === id && u.role?.name === 'SuperAdmin'
    ) || [];

    // Access Control: Only System Admin or Super Admin of this org can view
    useEffect(() => {
        if (!isLoading && user) {
            const isSystemAdmin = user.role?.name?.toLowerCase() === "systemadmin";
            // Allow if System Admin OR if user belongs to this org (checking both orgId and id match)
            // User requested: "for superadmin if it is organization level"
            // Actually, let's restrict to SystemAdmin AND SuperAdmin of this specific org.
            // Regular users of the org shouldn't see this page typically? "it is visible but says you can't change"
            // User said: "for other users it should not be shown even".
            const isOrgSuperAdmin = user.role?.name === 'SuperAdmin' && user.orgId === id;

            if (!isSystemAdmin && !isOrgSuperAdmin) {
                router.push("/"); // Redirect to dashboard
            }
        }
    }, [user, isLoading, id, router]);

    const [formState, setFormState] = useState({
        orgName: "",
        primaryColor: DEFAULT_THEME_COLORS.primaryColor.toString(16).padStart(6, '0'),
        backgroundColor: DEFAULT_THEME_COLORS.backgroundColor.toString(16).padStart(6, '0'),
        cardColor: DEFAULT_THEME_COLORS.cardColor.toString(16).padStart(6, '0'),
        borderColor: DEFAULT_THEME_COLORS.borderColor.toString(16).padStart(6, '0'),
        secondaryColor: DEFAULT_THEME_COLORS.secondaryColor.toString(16).padStart(6, '0'),
        mutedColor: DEFAULT_THEME_COLORS.mutedColor.toString(16).padStart(6, '0'),
        accentColor: DEFAULT_THEME_COLORS.accentColor.toString(16).padStart(6, '0'),
    });

    useEffect(() => {
        if (organization) {
            setFormState({
                orgName: organization.orgName || "",
                primaryColor: organization.primaryColor ? intToHex(organization.primaryColor).replace("#", "") : DEFAULT_THEME_COLORS.primaryColor.toString(16).padStart(6, '0'),
                backgroundColor: organization.backgroundColor ? intToHex(organization.backgroundColor).replace("#", "") : DEFAULT_THEME_COLORS.backgroundColor.toString(16).padStart(6, '0'),
                cardColor: organization.cardColor ? intToHex(organization.cardColor).replace("#", "") : DEFAULT_THEME_COLORS.cardColor.toString(16).padStart(6, '0'),
                borderColor: organization.borderColor ? intToHex(organization.borderColor).replace("#", "") : DEFAULT_THEME_COLORS.borderColor.toString(16).padStart(6, '0'),
                secondaryColor: organization.secondaryColor ? intToHex(organization.secondaryColor).replace("#", "") : DEFAULT_THEME_COLORS.secondaryColor.toString(16).padStart(6, '0'),
                mutedColor: organization.mutedColor ? intToHex(organization.mutedColor).replace("#", "") : DEFAULT_THEME_COLORS.mutedColor.toString(16).padStart(6, '0'),
                accentColor: organization.accentColor ? intToHex(organization.accentColor).replace("#", "") : DEFAULT_THEME_COLORS.accentColor.toString(16).padStart(6, '0'),
            });
            setLogoPreview(organization.logo || null);
            setFaviconPreview(organization.favicon || null);
        }
    }, [organization]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'logo') {
                    setLogoPreview(reader.result as string);
                    setLogoFile(file);
                } else {
                    setFaviconPreview(reader.result as string);
                    setFaviconFile(file);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRestoreDefaults = () => {
        if (!confirm("Are you sure you want to restore default branding colors? This will verify and update the database immediately.")) return;

        const defaultData = new FormData();
        defaultData.append("primaryColor", DEFAULT_THEME_COLORS.primaryColor.toString());
        defaultData.append("backgroundColor", DEFAULT_THEME_COLORS.backgroundColor.toString());
        defaultData.append("cardColor", DEFAULT_THEME_COLORS.cardColor.toString());
        defaultData.append("borderColor", DEFAULT_THEME_COLORS.borderColor.toString());
        defaultData.append("secondaryColor", DEFAULT_THEME_COLORS.secondaryColor.toString());
        defaultData.append("mutedColor", DEFAULT_THEME_COLORS.mutedColor.toString());
        defaultData.append("accentColor", DEFAULT_THEME_COLORS.accentColor.toString());

        // We update the local state to match defaults for visual feedback
        setFormState(prev => ({
            ...prev,
            primaryColor: DEFAULT_THEME_COLORS.primaryColor.toString(16).padStart(6, '0'),
            backgroundColor: DEFAULT_THEME_COLORS.backgroundColor.toString(16).padStart(6, '0'),
            cardColor: DEFAULT_THEME_COLORS.cardColor.toString(16).padStart(6, '0'),
            borderColor: DEFAULT_THEME_COLORS.borderColor.toString(16).padStart(6, '0'),
            secondaryColor: DEFAULT_THEME_COLORS.secondaryColor.toString(16).padStart(6, '0'),
            mutedColor: DEFAULT_THEME_COLORS.mutedColor.toString(16).padStart(6, '0'),
            accentColor: DEFAULT_THEME_COLORS.accentColor.toString(16).padStart(6, '0'),
        }));

        updateOrg({ id, data: defaultData });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canEdit) return;

        const formData = new FormData();
        formData.append("orgName", formState.orgName);
        formData.append("primaryColor", parseInt(formState.primaryColor, 16).toString());
        formData.append("backgroundColor", parseInt(formState.backgroundColor, 16).toString());
        formData.append("cardColor", parseInt(formState.cardColor, 16).toString());
        formData.append("borderColor", parseInt(formState.borderColor, 16).toString());
        formData.append("borderColor", parseInt(formState.borderColor, 16).toString());
        formData.append("secondaryColor", parseInt(formState.secondaryColor, 16).toString());
        formData.append("mutedColor", parseInt(formState.mutedColor, 16).toString());
        formData.append("accentColor", parseInt(formState.accentColor, 16).toString());

        if (logoFile) formData.append("logo", logoFile);
        if (faviconFile) formData.append("favicon", faviconFile);

        updateOrg({ id, data: formData });
    };

    if (isLoading) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    if (isError) return <div className="text-red-500 text-center p-12 text-lg">Error loading organization details.</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 border-b pb-4">
                <Link href="/organizations" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{organization?.orgName}</h1>
                    <p className="text-gray-500">Manage organization branding and administrators</p>
                </div>
            </div>

            {/* Super Admin Creation Modal */}
            {showSuperAdminForm && isSystemAdmin && organization && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <SuperAdminForm
                            organizationId={id}
                            organizationName={organization.orgName}
                            onClose={() => setShowSuperAdminForm(false)}
                        />
                    </div>
                </div>
            )}

            {!canEdit && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded text-amber-700 font-medium">
                    Only System Administrators can modify organization branding and settings.
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Branding Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Building className="text-cyan-600" size={20} />
                                Branding Settings
                            </h3>
                            {canEdit && (
                                <button
                                    type="button"
                                    onClick={handleRestoreDefaults}
                                    className="text-xs bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold px-3 py-1.5 rounded-md transition-colors flex items-center gap-1"
                                >
                                    Restore Defaults
                                </button>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Organization Name</label>
                                <input
                                    type="text"
                                    value={formState.orgName}
                                    onChange={(e) => setFormState({ ...formState, orgName: e.target.value })}
                                    disabled={!canEdit}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none disabled:bg-gray-50 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Logo</label>
                                    <div className="relative group border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center min-h-[160px] hover:border-cyan-500 hover:bg-cyan-50/30 transition-all bg-gray-50">
                                        {logoPreview ? (
                                            <Image src={logoPreview} alt="Logo Preview" width={120} height={120} className="w-auto h-24 object-contain" />
                                        ) : (
                                            <Building size={40} className="text-gray-300" />
                                        )}
                                        {canEdit && (
                                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 text-white font-medium cursor-pointer rounded-xl transition-opacity">
                                                <div className="flex items-center gap-2">
                                                    <Upload size={16} /> Change Logo
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Favicon</label>
                                    <div className="relative group border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center min-h-[160px] hover:border-cyan-500 hover:bg-cyan-50/30 transition-all bg-gray-50">
                                        {faviconPreview ? (
                                            <Image src={faviconPreview} alt="Favicon Preview" width={48} height={48} className="w-12 h-12 object-contain" />
                                        ) : (
                                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                                <Building size={20} className="text-gray-400" />
                                            </div>
                                        )}
                                        {canEdit && (
                                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 text-white font-medium cursor-pointer rounded-xl transition-opacity">
                                                <div className="flex items-center gap-2">
                                                    <Upload size={16} /> Change Favicon
                                                </div>
                                                <input type="file" className="hidden" accept="image/x-icon,image/png" onChange={(e) => handleFileChange(e, 'favicon')} />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Theme Configuration</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                            <ColorPicker
                                label="Primary Color"
                                value={`#${formState.primaryColor}`}
                                onChange={(val) => setFormState({ ...formState, primaryColor: val.replace("#", "") })}
                                disabled={!canEdit}
                                description="Buttons, links, and active states"
                            />
                            <ColorPicker
                                label="Secondary Color"
                                value={`#${formState.secondaryColor}`}
                                onChange={(val) => setFormState({ ...formState, secondaryColor: val.replace("#", "") })}
                                disabled={!canEdit}
                                description="Headings, sidebars, and accents"
                            />
                            <ColorPicker
                                label="Background Color"
                                value={`#${formState.backgroundColor}`}
                                onChange={(val) => setFormState({ ...formState, backgroundColor: val.replace("#", "") })}
                                disabled={!canEdit}
                                description="Main page background"
                            />
                            <ColorPicker
                                label="Card Background"
                                value={`#${formState.cardColor}`}
                                onChange={(val) => setFormState({ ...formState, cardColor: val.replace("#", "") })}
                                disabled={!canEdit}
                                description="Component backgrounds"
                            />
                            <ColorPicker
                                label="Border Color"
                                value={`#${formState.borderColor}`}
                                onChange={(val) => setFormState({ ...formState, borderColor: val.replace("#", "") })}
                                disabled={!canEdit}
                                description="Dividers and inputs"
                            />
                            <ColorPicker
                                label="Muted Color"
                                value={`#${formState.mutedColor}`}
                                onChange={(val) => setFormState({ ...formState, mutedColor: val.replace("#", "") })}
                                disabled={!canEdit}
                                description="Secondary text and backgrounds"
                            />
                            <ColorPicker
                                label="Accent Color"
                                value={`#${formState.accentColor}`}
                                onChange={(val) => setFormState({ ...formState, accentColor: val.replace("#", "") })}
                                disabled={!canEdit}
                                description="Hover states and highlights"
                            />
                        </div>

                        <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                            <h4 className="text-xs font-bold uppercase text-gray-400 mb-3 tracking-wider">Live Preview</h4>
                            <div
                                style={{ backgroundColor: `#${formState.backgroundColor}`, borderColor: `#${formState.borderColor}` }}
                                className="p-6 rounded-lg border transition-all duration-300"
                            >
                                <div
                                    style={{ backgroundColor: `#${formState.cardColor}`, borderColor: `#${formState.borderColor}` }}
                                    className="p-4 rounded-md border shadow-sm max-w-sm mx-auto"
                                >
                                    <h5 style={{ color: `#${formState.secondaryColor}` }} className="font-bold text-lg mb-2">My Organization</h5>
                                    <p className="text-gray-500 text-sm mb-4">This is how your components will look with the selected colors.</p>
                                    <div className="flex gap-2">
                                        <button
                                            style={{ backgroundColor: `#${formState.primaryColor}` }}
                                            className="text-white text-sm px-4 py-2 rounded font-medium shadow-sm hover:opacity-90 transition-opacity"
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            style={{ color: `#${formState.secondaryColor}`, borderColor: `#${formState.borderColor}` }}
                                            className="bg-transparent border text-sm px-4 py-2 rounded font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Super Admin Management */}
                <div className="space-y-6">
                    {/* Super Admin Table Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Super Admins</h3>
                                <p className="text-xs text-gray-500">Users with full access</p>
                            </div>
                            {canEdit && (
                                <button
                                    onClick={() => setShowSuperAdminForm(true)}
                                    className="bg-cyan-50 text-cyan-700 hover:bg-cyan-100 p-2 rounded-full transition-colors"
                                    title="Add Super Admin"
                                >
                                    <UserPlus size={18} />
                                </button>
                            )}
                        </div>

                        <div className="p-0 flex-1 overflow-y-auto max-h-[500px]">
                            {superAdmins.length > 0 ? (
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-xs">
                                        <tr>
                                            <th className="px-4 py-3">User</th>
                                            <th className="px-4 py-3 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {superAdmins.map((admin) => (
                                            <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900">{admin.first_name} {admin.last_name}</span>
                                                        <span className="text-gray-500 text-xs">{admin.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    <p className="mb-2 text-sm">No Super Admins found.</p>
                                    {canEdit && (
                                        <button
                                            onClick={() => setShowSuperAdminForm(true)}
                                            className="text-cyan-600 hover:underline text-sm font-medium"
                                        >
                                            Add one now
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Save Bar or Bottom Action */}
            {canEdit && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10 flex justify-end gap-4">
                    <button
                        onClick={handleSubmit}
                        disabled={isUpdating}
                        className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-3 px-8 rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50 transition-all text-sm md:text-base"
                    >
                        {isUpdating ? <Spinner /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    );
};

const ColorPicker = ({ label, value, onChange, disabled, description }: { label: string, value: string, onChange: (val: string) => void, disabled: boolean, description?: string }) => (
    <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
        <div className="flex items-center gap-3">
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="h-10 w-10 rounded-lg cursor-pointer border border-gray-200 p-1 bg-white disabled:opacity-50 transition-shadow hover:shadow-sm"
            />
            <div className="flex flex-col">
                <span className="text-sm font-mono text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">{value}</span>
                {description && <span className="text-xs text-gray-400 mt-0.5">{description}</span>}
            </div>
        </div>
    </div>
);

export default OrganizationDetailPage;
