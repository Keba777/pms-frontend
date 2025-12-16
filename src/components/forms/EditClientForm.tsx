"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { UpdateClientData, IClient } from "@/types/client";
import { useUpdateClient } from "@/hooks/useClients";

interface EditClientFormProps {
    client: IClient;
    onClose: () => void;
}

interface SelectOption {
    value: string;
    label: string;
}

const EditClientForm: React.FC<EditClientFormProps> = ({ client, onClose }) => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        setValue,
        watch,
    } = useForm<UpdateClientData>({
        defaultValues: {
            companyName: client.companyName,
            responsiblePerson: client.responsiblePerson,
            description: client.description,
            status: client.status,
            attachments: client.attachments || [],
        },
    });

    const { mutate: updateClient, isPending } = useUpdateClient();
    const [attachmentInput, setAttachmentInput] = useState("");
    const attachments = watch("attachments");

    const statusOptions: SelectOption[] = [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
    ];

    const addAttachment = () => {
        if (attachmentInput.trim() !== "") {
            const updated = [...(attachments || []), attachmentInput.trim()];
            setValue("attachments", updated);
            setAttachmentInput("");
        }
    };

    const removeAttachment = (index: number) => {
        const updated = [...(attachments || [])];
        updated.splice(index, 1);
        setValue("attachments", updated);
    };

    const onSubmit = (data: UpdateClientData) => {
        updateClient(
            { ...data, id: client.id },
            {
                onSuccess: () => {
                    onClose();
                },
            }
        );
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-lg shadow-xl p-6 space-y-6"
        >
            <div className="flex justify-between items-center pb-4 border-b">
                <h3 className="text-lg font-semibold text-gray-800">Edit Client</h3>
                <button
                    type="button"
                    className="text-3xl text-red-500 hover:text-red-600"
                    onClick={onClose}
                >
                    &times;
                </button>
            </div>

            <div className="space-y-4">
                {/* Company Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        {...register("companyName", { required: "Company Name is required" })}
                        placeholder="Enter company name"
                        className="w-full px-3 py-2 border rounded-md"
                    />
                    {errors.companyName && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.companyName.message}
                        </p>
                    )}
                </div>

                {/* Responsible Person */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Responsible Person
                    </label>
                    <input
                        type="text"
                        {...register("responsiblePerson")}
                        placeholder="Enter responsible person"
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        {...register("description")}
                        placeholder="Enter description"
                        className="w-full px-3 py-2 border rounded-md"
                        rows={3}
                    />
                </div>

                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="status"
                        control={control}
                        rules={{ required: "Status is required" }}
                        render={({ field }) => (
                            <Select
                                options={statusOptions}
                                onChange={(opt) => field.onChange(opt?.value)}
                                value={statusOptions.find((opt) => opt.value === field.value) || null}
                            />
                        )}
                    />
                    {errors.status && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.status.message}
                        </p>
                    )}
                </div>

                {/* Attachments (Text URLs for now) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Attachments (URLs)
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={attachmentInput}
                            onChange={(e) => setAttachmentInput(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="Enter attachment URL"
                        />
                        <button
                            type="button"
                            onClick={addAttachment}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md"
                        >
                            Add
                        </button>
                    </div>
                    {attachments && attachments.length > 0 && (
                        <ul className="mt-2 space-y-1">
                            {attachments.map((item, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-center justify-between bg-gray-100 p-2 rounded"
                                >
                                    <a href={item} target="_blank" rel="noreferrer" className="text-blue-600 truncate max-w-xs">{item}</a>
                                    <button
                                        type="button"
                                        className="text-red-500"
                                        onClick={() => removeAttachment(idx)}
                                    >
                                        &times;
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                    type="button"
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                    onClick={onClose}
                >
                    Close
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    disabled={isPending}
                >
                    {isPending ? "Updating..." : "Update"}
                </button>
            </div>
        </form>
    );
};

export default EditClientForm;
