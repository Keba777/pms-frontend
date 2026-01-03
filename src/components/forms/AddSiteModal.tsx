import React from "react";
import { useForm } from "react-hook-form";
import { CreateSiteInput, Site } from "@/types/site";
import { useCreateSite } from "@/hooks/useSites";

interface AddSiteModalProps {
    onClose: () => void;
    onSuccess: (site: Site) => void;
}

const AddSiteModal: React.FC<AddSiteModalProps> = ({ onClose, onSuccess }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateSiteInput>();

    const { mutate: createSite, isPending } = useCreateSite(onSuccess);

    const onSubmit = (data: CreateSiteInput) => {
        createSite(data);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-xl font-semibold text-gray-800">Add New Site</h3>
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
                            Site Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register("name", { required: "Site name is required" })}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                            placeholder="Enter site name"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.name.message}
                            </p>
                        )}
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
                            {isPending ? "Creating..." : "Create Site"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSiteModal;
