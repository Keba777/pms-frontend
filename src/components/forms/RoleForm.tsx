"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { useCreateRole, useRoles } from "@/hooks/useRoles";
import { CreateRoleInput } from "@/types/user";

interface RoleFormProps {
    onClose: () => void;
}

const DEFAULT_PERMISSIONS_LIST = [
    "projects",
    "tasks",
    "activities",
    "todos",
    "chat",
    "group-chat",
    "issues",
    "requests",
    "allocation",
];

const RoleForm: React.FC<RoleFormProps> = ({ onClose }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<{ name: string }>();

    const { mutate: createRole, isPending } = useCreateRole((role) => {
        onClose();
    });

    const { data: existingRoles } = useRoles();

    const onSubmit = (data: { name: string }) => {
        const trimmedName = data.name.trim();

        // 1. Uniqueness Check
        const isDuplicate = existingRoles?.some(
            (r) => r.name.toLowerCase() === trimmedName.toLowerCase()
        );

        if (isDuplicate) {
            setError("name", {
                type: "manual",
                message: "Role name must be unique",
            });
            return;
        }

        // 2. Construct Payload with Default Permissions
        const permissions: any = {};
        DEFAULT_PERMISSIONS_LIST.forEach((resource) => {
            permissions[resource] = { view: true };
        });

        const payload: CreateRoleInput = {
            name: trimmedName,
            permissions,
        };

        createRole(payload);
    };

    return (
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center pb-4 border-b">
                <h3 className="text-lg font-semibold text-gray-800">Create New Role</h3>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                >
                    ✕
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        {...register("name", { required: "Role name is required" })}
                        placeholder="e.g. Project Manager"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                </div>

                <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-sm text-blue-800">
                    <p className="font-semibold mb-1">Default Access:</p>
                    <p className="opacity-80">
                        Allows view access to: Dashboard, Projects, Tasks, Activities, Todos,
                        Chats, Issues, Requests, Allocations.
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? "Creating..." : "Create Role"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RoleForm;
