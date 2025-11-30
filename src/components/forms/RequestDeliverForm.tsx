import { useApprovals } from "@/hooks/useApprovals";
import { useSites } from "@/hooks/useSites";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import { Approval } from "@/types/approval";
import { Site } from "@/types/site";
import { CreateRequestDeliveryInput } from "@/types/requestDelivery";
import { Controller, useForm } from "react-hook-form";
import { useCreateRequestDelivery } from "@/hooks/useRequestDeliveries";
import { useSettingsStore } from "@/store/settingsStore";
import EtDatePicker from "habesha-datepicker"; 
import ReactDatePicker from "react-datepicker";

const RequestDeliveryForm: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const { useEthiopianDate } = useSettingsStore();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateRequestDeliveryInput>({
    defaultValues: {
      approvalId: "",
      refNumber: "",
      recievedQuantity: 0,
      deliveredBy: "",
      recievedBy: "",
      deliveryDate: new Date(),
      siteId: "",
      remarks: "",
      status: "Pending",
    },
  });
  const { mutate: createRequestDelivery, isPending } =
    useCreateRequestDelivery();
  const {
    data: approvals,
    isLoading: approvalsLoading,
    error: approvalsError,
  } = useApprovals();
  const {
    data: sites,
    isLoading: sitesLoading,
    error: sitesError,
  } = useSites();
  const onSubmit = (data: CreateRequestDeliveryInput) => {
    console.log("Submitting request delivery:", data);
    createRequestDelivery(data, {
      onSuccess: () => {
        onClose();
      },
      onError: (error) => {
        console.error("Failed to create request delivery:", error);
        alert("Failed to create request delivery: " + error.message);
      },
    });
  };
  const approvalOptions =
    approvals?.map((approval: Approval) => ({
      value: approval.id,
      label: approval.request?.activity?.activity_name || `${approval.id}`,
    })) || [];
  const siteOptions =
    sites?.map((site: Site) => ({
      value: site.id,
      label: site.name || `Site ${site.id}`,
    })) || [];
  const statusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Delivered", label: "Delivered" },
    { value: "Cancelled", label: "Cancelled" },
  ];
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6 max-w-md"
    >
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-xl font-semibold text-gray-800">
          Create Request Delivery
        </h3>
        <button
          type="button"
          className="text-3xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Activity <span className="text-red-500">*</span>
          </label>
          <Controller
            name="approvalId"
            control={control}
            rules={{ required: "Approval is required" }}
            render={({ field }) => (
              <Select
                {...field}
                options={approvalOptions}
                isLoading={approvalsLoading}
                className="w-full"
                onChange={(selectedOption) =>
                  field.onChange(selectedOption?.value)
                }
                value={approvalOptions.find(
                  (option) => option.value === field.value
                )}
                placeholder="Select activity..."
              />
            )}
          />
          {errors.approvalId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.approvalId.message}
            </p>
          )}
          {approvalsError && (
            <p className="text-red-500 text-sm mt-1">Error loading approvals</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reference Number
          </label>
          <input
            type="text"
            {...register("refNumber")}
            placeholder="Enter Reference Number"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Received Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            {...register("recievedQuantity", {
              required: "Received Quantity is required",
              min: { value: 1, message: "Quantity must be at least 1" },
            })}
            placeholder="Enter received quantity"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
          />
          {errors.recievedQuantity && (
            <p className="text-red-500 text-sm mt-1">
              {errors.recievedQuantity.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivered By <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("deliveredBy", {
              required: "Delivered By is required",
            })}
            placeholder="Enter deliverer name"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
          />
          {errors.deliveredBy && (
            <p className="text-red-500 text-sm mt-1">
              {errors.deliveredBy.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Received By <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("recievedBy", {
              required: "Received By is required",
            })}
            placeholder="Enter receiver name"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
          />
          {errors.recievedBy && (
            <p className="text-red-500 text-sm mt-1">
              {errors.recievedBy.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Date <span className="text-red-500">*</span>
          </label>
          <Controller
            name="deliveryDate"
            control={control}
            rules={{ required: "Delivery date is required" }}
            render={({ field }) => (
              <>
                {useEthiopianDate ? (
                  <EtDatePicker
                    value={field.value ? new Date(field.value) : undefined}
                    onChange={(date: any, event?: any) => {
                      const d = Array.isArray(date) ? date[0] : date;
                      field.onChange(d ? d.toISOString() : undefined);
                    }}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
                    isRange={false}
                  />
                ) : (
                  <ReactDatePicker
                    showFullMonthYearPicker
                    showYearDropdown
                    selected={field.value ? new Date(field.value) : undefined}
                    onChange={(date: any, event?: any) => {
                      const d = Array.isArray(date) ? date[0] : date;
                      field.onChange(d ? d.toISOString() : undefined);
                    }}
                    placeholderText="Enter Delivery Date"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
                  />
                )}
              </>
            )}
          />
          {errors.deliveryDate && (
            <p className="text-red-500 text-sm mt-1">
              {errors.deliveryDate.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site <span className="text-red-500">*</span>
          </label>
          <Controller
            name="siteId"
            control={control}
            rules={{ required: "Site is required" }}
            render={({ field }) => (
              <Select
                {...field}
                options={siteOptions}
                isLoading={sitesLoading}
                className="w-full"
                onChange={(selectedOption) =>
                  field.onChange(selectedOption?.value)
                }
                value={siteOptions.find(
                  (option) => option.value === field.value
                )}
                placeholder="Select site..."
              />
            )}
          />
          {errors.siteId && (
            <p className="text-red-500 text-sm mt-1">{errors.siteId.message}</p>
          )}
          {sitesError && (
            <p className="text-red-500 text-sm mt-1">Error loading sites</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Remarks
          </label>
          <textarea
            {...register("remarks")}
            placeholder="Enter remarks..."
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status <span className="text-red-500">*</span>
          </label>
          <Controller
            name="status"
            control={control}
            rules={{ required: "Status is required" }}
            render={({ field }) => (
              <Select
                {...field}
                options={statusOptions}
                className="w-full"
                onChange={(selectedOption) =>
                  field.onChange(selectedOption?.value)
                }
                value={statusOptions.find(
                  (option) => option.value === field.value
                )}
                placeholder="Select status..."
              />
            )}
          />
          {errors.status && (
            <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
          )}
        </div>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800"
            disabled={isPending}
          >
            {isPending ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default RequestDeliveryForm;
