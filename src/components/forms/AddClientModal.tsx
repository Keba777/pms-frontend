import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { CreateClientData, IClient } from "@/types/client";
import { useCreateClient } from "@/hooks/useClients";

interface AddClientModalProps {
    onClose: () => void;
    onSuccess: (client: IClient) => void;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ onClose, onSuccess }) => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<CreateClientData>({
        defaultValues: {
            status: "Active",
        },
    });

    const { mutate: createClient, isPending } = useCreateClient(onSuccess);

    const onSubmit = (data: CreateClientData) => {
        createClient(data);
    };

    const statusOptions = [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
    ];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-xl font-semibold text-gray-800">Add New Client</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-red-500 text-2xl"
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register("companyName", { required: "Company Name is required" })}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                            placeholder="Enter company name"
                        />
                        {errors.companyName && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.companyName.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Responsible Person
                        </label>
                        <input
                            type="text"
                            {...register("responsiblePerson")}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                            placeholder="Enter responsible person"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    options={statusOptions}
                                    className="w-full text-sm"
                                    onChange={(option) => field.onChange(option?.value)}
                                    value={statusOptions.find((o) => o.value === field.value)}
                                />
                            )}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            {...register("description")}
                            rows={3}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                            placeholder="Enter description"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 h-10 border rounded-md hover:bg-gray-50 text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 h-10 bg-bs-primary text-white rounded-md hover:bg-bs-primary/90 text-sm font-medium flex items-center"
                        >
                            {isPending ? "Creating..." : "Create Client"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddClientModal;
