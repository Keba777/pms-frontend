"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOrganization, useUpdateOrganization } from "@/hooks/useOrganizations";
import { useAuthStore } from "@/store/authStore";
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

    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [faviconFile, setFaviconFile] = useState<File | null>(null);
    const [showSuperAdminForm, setShowSuperAdminForm] = useState(false);

    const isSystemAdmin = user?.role?.name?.toLowerCase() === "systemadmin";
    const isSuperAdmin = user?.role?.name?.toLowerCase() === "superadmin";
    const canEdit = isSystemAdmin; // Strictly SystemAdmin as per user request

    const [formState, setFormState] = useState({
        orgName: "",
        primaryColor: "#000000",
        backgroundColor: "#ffffff",
        cardColor: "#ffffff",
        borderColor: "#e5e7eb",
        secondaryColor: "#000000",
    });

    useEffect(() => {
        if (organization) {
            setFormState({
                orgName: organization.orgName || "",
                primaryColor: intToHex(organization.primaryColor),
                backgroundColor: intToHex(organization.backgroundColor),
                cardColor: intToHex(organization.cardColor),
                borderColor: intToHex(organization.borderColor),
                secondaryColor: intToHex(organization.secondaryColor),
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canEdit) return;

        const formData = new FormData();
        formData.append("orgName", formState.orgName);
        formData.append("primaryColor", hexToInt(formState.primaryColor).toString());
        formData.append("backgroundColor", hexToInt(formState.backgroundColor).toString());
        formData.append("cardColor", hexToInt(formState.cardColor).toString());
        formData.append("borderColor", hexToInt(formState.borderColor).toString());
        formData.append("secondaryColor", hexToInt(formState.secondaryColor).toString());

        if (logoFile) formData.append("logo", logoFile);
        if (faviconFile) formData.append("favicon", faviconFile);

        updateOrg({ id, data: formData });
    };

    if (isLoading) return <div className="flex justify-center p-12"><Spinner /></div>;
    if (isError) return <div className="text-red-600 text-center p-12">Error loading organization</div>;

    return (
        <div className="p-4 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/organizations" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Organization Branding</h1>
                </div>
                {canEdit && (
                    <button
                        onClick={handleSubmit}
                        disabled={isUpdating}
                        className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-6 rounded shadow flex items-center gap-2 disabled:opacity-50 transition-all"
                    >
                        {isUpdating ? <Spinner /> : <Save size={18} />} Save Changes
                    </button>
                )}
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
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 text-amber-700 text-sm">
                    Only System Administrators can modify organization branding and settings.
                </div>
            )}

            {/* Create Super Admin Button - Only for System Admins */}
            {isSystemAdmin && (
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-br from-cyan-500 to-cyan-700 p-4 rounded-xl shadow-md">
                                <UserPlus className="text-white" size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Create Super Admin</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Add a Super Admin user to manage this organization
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowSuperAdminForm(true)}
                            className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                        >
                            <UserPlus size={20} />
                            Create Super Admin
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="bg-white p-6 rounded-lg shadow space-y-4">
                    <h3 className="font-semibold text-gray-800 border-b pb-2">General Settings</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                        <input
                            type="text"
                            value={formState.orgName}
                            onChange={(e) => setFormState({ ...formState, orgName: e.target.value })}
                            disabled={!canEdit}
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-cyan-500 outline-none disabled:bg-gray-50"
                        />
                    </div>

                    <div className="flex gap-6 pt-4">
                        <div className="flex-1 space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Logo</label>
                            <div className="relative group border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center min-h-[150px] hover:border-cyan-500 transition-colors">
                                {logoPreview ? (
                                    <Image src={logoPreview} alt="Logo Preview" width={100} height={100} className="max-h-24 object-contain" />
                                ) : (
                                    <Building size={48} className="text-gray-300" />
                                )}
                                {canEdit && (
                                    <label className="mt-2 text-xs text-cyan-700 cursor-pointer font-semibold hover:underline flex items-center gap-1">
                                        <Upload size={14} /> Upload Logo
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="w-1/3 space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Favicon</label>
                            <div className="relative group border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center min-h-[150px] hover:border-cyan-500 transition-colors">
                                {faviconPreview ? (
                                    <Image src={faviconPreview} alt="Favicon Preview" width={32} height={32} className="object-contain" />
                                ) : (
                                    <Building size={24} className="text-gray-300" />
                                )}
                                {canEdit && (
                                    <label className="mt-4 text-xs text-cyan-700 cursor-pointer font-semibold hover:underline flex items-center gap-1">
                                        <Upload size={14} /> Favicon
                                        <input type="file" className="hidden" accept="image/x-icon,image/png" onChange={(e) => handleFileChange(e, 'favicon')} />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Colors */}
                <div className="bg-white p-6 rounded-lg shadow space-y-4">
                    <h3 className="font-semibold text-gray-800 border-b pb-2">Theme Colors</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <ColorPicker
                            label="Primary Color"
                            value={formState.primaryColor}
                            onChange={(val) => setFormState({ ...formState, primaryColor: val })}
                            disabled={!canEdit}
                        />
                        <ColorPicker
                            label="Secondary Color"
                            value={formState.secondaryColor}
                            onChange={(val) => setFormState({ ...formState, secondaryColor: val })}
                            disabled={!canEdit}
                        />
                        <ColorPicker
                            label="Background"
                            value={formState.backgroundColor}
                            onChange={(val) => setFormState({ ...formState, backgroundColor: val })}
                            disabled={!canEdit}
                        />
                        <ColorPicker
                            label="Card Background"
                            value={formState.cardColor}
                            onChange={(val) => setFormState({ ...formState, cardColor: val })}
                            disabled={!canEdit}
                        />
                        <ColorPicker
                            label="Border Color"
                            value={formState.borderColor}
                            onChange={(val) => setFormState({ ...formState, borderColor: val })}
                            disabled={!canEdit}
                        />
                    </div>

                    <div className="mt-8 p-4 bg-gray-50 rounded border border-gray-200">
                        <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Live Preview</h4>
                        <div style={{ backgroundColor: formState.backgroundColor }} className="p-4 rounded border" border-style="solid" data-style-border={formState.borderColor}>
                            <div style={{ backgroundColor: formState.cardColor, borderColor: formState.borderColor }} className="p-3 rounded border shadow-sm">
                                <p style={{ color: formState.secondaryColor }} className="text-xs font-bold mb-1">SAMPLE CARD</p>
                                <button style={{ backgroundColor: formState.primaryColor }} className="text-white text-[10px] px-2 py-1 rounded">
                                    Primary Action
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ColorPicker = ({ label, value, onChange, disabled }: { label: string, value: string, onChange: (val: string) => void, disabled: boolean }) => (
    <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-600">{label}</label>
        <div className="flex items-center gap-2">
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="h-8 w-8 rounded cursor-pointer border-none p-0 bg-transparent disabled:opacity-50"
            />
            <span className="text-sm font-mono text-gray-500 uppercase">{value}</span>
        </div>
    </div>
);

export default OrganizationDetailPage;
