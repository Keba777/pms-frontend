"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { X, UserPlus, Mail, Phone, User, Lock, Shield } from "lucide-react";
import { toast } from "react-toastify";
import apiClient from "@/services/api-client";
import { useQueryClient } from "@tanstack/react-query";

interface SuperAdminFormProps {
    organizationId: string;
    organizationName: string;
    onClose: () => void;
}

interface SuperAdminFormData {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password?: string;
}

const SuperAdminForm: React.FC<SuperAdminFormProps> = ({ organizationId, organizationName, onClose }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SuperAdminFormData>();

    const onSubmit = async (data: SuperAdminFormData) => {
        setIsSubmitting(true);
        try {
            await apiClient.post(`/organizations/${organizationId}/create-superadmin`, data);
            toast.success(`Super Admin created successfully for ${organizationName}!`);
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["organizations"] });
            onClose();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to create Super Admin";

            // Show more specific error messages
            if (errorMessage.includes("already exists")) {
                toast.error(`❌ ${errorMessage}. Please use a different email address.`);
            } else if (errorMessage.includes("required")) {
                toast.error("⚠️ Please fill in all required fields");
            } else {
                toast.error(`❌ ${errorMessage}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-cyan-100">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-cyan-500 to-cyan-700 p-3 rounded-xl shadow-lg">
                        <Shield className="text-white" size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Create Super Admin</h2>
                        <p className="text-sm text-gray-600">for {organizationName}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
                    type="button"
                >
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Info Banner */}
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-l-4 border-cyan-500 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                        <Shield className="text-cyan-600 flex-shrink-0 mt-0.5" size={20} />
                        <div className="text-sm text-gray-700">
                            <p className="font-semibold text-cyan-900 mb-1">Super Admin Privileges</p>
                            <p>This user will have full administrative access to manage <span className="font-semibold">{organizationName}</span> including users, projects, and settings.</p>
                        </div>
                    </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <User size={16} className="text-cyan-600" />
                            First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register("first_name", { required: "First name is required" })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter first name"
                        />
                        {errors.first_name && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <span>⚠</span> {errors.first_name.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <User size={16} className="text-cyan-600" />
                            Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register("last_name", { required: "Last name is required" })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter last name"
                        />
                        {errors.last_name && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <span>⚠</span> {errors.last_name.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Mail size={16} className="text-cyan-600" />
                        Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Invalid email address"
                            }
                        })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                        placeholder="superadmin@example.com"
                    />
                    {errors.email && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <span>⚠</span> {errors.email.message}
                        </p>
                    )}
                </div>

                {/* Phone */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Phone size={16} className="text-cyan-600" />
                        Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        {...register("phone", { required: "Phone number is required" })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                        placeholder="+1 (555) 000-0000"
                    />
                    {errors.phone && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <span>⚠</span> {errors.phone.message}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Lock size={16} className="text-cyan-600" />
                        Password <span className="text-gray-400 text-xs font-normal">(Optional - defaults to 123456)</span>
                    </label>
                    <input
                        type="password"
                        {...register("password")}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                        placeholder="Leave blank for default password"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        💡 User will be prompted to change password on first login
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t-2 border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-all duration-200 hover:shadow-md"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-lg hover:from-cyan-700 hover:to-cyan-800 font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                Creating...
                            </>
                        ) : (
                            <>
                                <UserPlus size={18} />
                                Create Super Admin
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SuperAdminForm;
