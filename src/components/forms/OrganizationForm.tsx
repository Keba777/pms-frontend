"use client";

import React, { useState } from "react";
import { useCreateOrganization } from "@/hooks/useOrganizations";
import { X } from "lucide-react";
import { toast } from "react-toastify";

interface OrganizationFormProps {
    onClose: () => void;
}

const OrganizationForm: React.FC<OrganizationFormProps> = ({ onClose }) => {
    const [formData, setFormData] = useState({
        orgName: "",
        logo: null as File | null,
        favicon: null as File | null,
    });

    const { mutate: createOrganization, isPending } = useCreateOrganization();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.orgName.trim()) {
            toast.error("Organization name is required");
            return;
        }

        const submitData = new FormData();
        submitData.append("orgName", formData.orgName);

        if (formData.logo) {
            submitData.append("logo", formData.logo);
        }
        if (formData.favicon) {
            submitData.append("favicon", formData.favicon);
        }

        createOrganization(submitData as any, {
            onSuccess: () => {
                toast.success("Organization created successfully!");
                onClose();
            },
            onError: (error: any) => {
                toast.error(error?.response?.data?.message || "Failed to create organization");
            },
        });
    };

    return (
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create New Organization</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    type="button"
                >
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.orgName}
                        onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="Enter organization name"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo (Optional)
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFormData({ ...formData, logo: e.target.files?.[0] || null })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Recommended: PNG or SVG, max 2MB</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Favicon (Optional)
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFormData({ ...formData, favicon: e.target.files?.[0] || null })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Recommended: ICO or PNG, 32x32px</p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        disabled={isPending}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isPending}
                    >
                        {isPending ? "Creating..." : "Create Organization"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default OrganizationForm;
