"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useImportLabors, useUpdateLaborInformation } from "@/hooks/useLabors";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import ReactDatePicker from "react-datepicker";

interface LaborFormProps {
  siteId: string;
  onClose: () => void;
  initialData?: any; // Flattened row data for editing
  isEditMode?: boolean;
}

type FormData = {
  role?: string;
  unit?: string;
  quantity?: number;
  minQuantity?: number;
  estimatedHours?: number;
  rate?: number;
  overtimeRate?: number;
  totalAmount?: number;
  skill_level?: string;
  allocationStatus?: "Allocated" | "Unallocated" | "OnLeave";
  status?: "Active" | "InActive";
  responsiblePerson?: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  sex?: string;
  terms?: string;
  estSalary?: number;
  educationLevel?: string;
  startsAt?: string;
  endsAt?: string;
  infoStatus?: "Allocated" | "Unallocated" | "OnLeave";
  phone?: string;
};

const LaborForm: React.FC<LaborFormProps> = ({ siteId, onClose, initialData, isEditMode }) => {

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: initialData ? {
      role: initialData.role,
      unit: initialData.unit,
      quantity: initialData.quantity,
      minQuantity: initialData.minQuantity,
      responsiblePerson: initialData.responsiblePerson,
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      position: initialData.position,
      sex: initialData.sex,
      terms: initialData.terms,
      estSalary: initialData.estSalary,
      educationLevel: initialData.educationLevel,
      startsAt: initialData.startsAt,
      endsAt: initialData.endsAt,
      infoStatus: initialData.infoStatus || initialData.allocationStatus,
      estimatedHours: initialData.estimatedHours,
      rate: initialData.rate,
      overtimeRate: initialData.overtimeRate,
      skill_level: initialData.skill_level, // Ensure simple mapping
      phone: initialData.phone,
    } : undefined
  });

  const { mutateAsync: importLabors, isPending: isCreating } = useImportLabors();
  const { mutateAsync: updateLaborInfo, isPending: isUpdating } = useUpdateLaborInformation();
  const isPending = isCreating || isUpdating;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialData) {
      // Ensure date fields are properly set if they come as strings
      if (initialData.startsAt) setValue("startsAt", initialData.startsAt);
      if (initialData.endsAt) setValue("endsAt", initialData.endsAt);
      // Trigger recalc of total if needed, or set it directly
      const total = (Number(initialData.rate) || 0) * (Number(initialData.estimatedHours) || 0) + (Number(initialData.overtimeRate) || 0);
      setValue("totalAmount", total);
    }
  }, [initialData, setValue]);



  const estimatedHours = watch("estimatedHours");
  const rate = watch("rate");
  const overtimeRate = watch("overtimeRate");

  useEffect(() => {
    const total = (Number(rate) || 0) * (Number(estimatedHours) || 0) + (Number(overtimeRate) || 0);
    setValue("totalAmount", total);
  }, [rate, estimatedHours, overtimeRate, setValue]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setSelectedFile(file);
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditMode && initialData?.id) {
        // EDIT MODE
        const updatePayload: any = {};
        updatePayload.firstName = data.firstName;
        updatePayload.lastName = data.lastName;
        updatePayload.position = data.position;
        updatePayload.sex = data.sex;
        updatePayload.terms = data.terms;
        updatePayload.estSalary = data.estSalary;
        updatePayload.educationLevel = data.educationLevel;
        updatePayload.startsAt = data.startsAt;
        updatePayload.endsAt = data.endsAt;
        updatePayload.status = data.infoStatus;
        updatePayload.estimatedHours = data.estimatedHours;
        updatePayload.rate = data.rate;
        updatePayload.overtimeRate = data.overtimeRate;
        updatePayload.totalAmount = data.totalAmount;
        updatePayload.skill_level = data.skill_level;
        updatePayload.phone = data.phone;

        let finalPayload: any = updatePayload;

        if (selectedFile) {
          const fd = new FormData();
          Object.keys(updatePayload).forEach(key => {
            if (updatePayload[key] !== undefined && updatePayload[key] !== null) {
              fd.append(key, updatePayload[key].toString());
            }
          });
          fd.append("profile_picture", selectedFile);
          finalPayload = fd;
        }

        await updateLaborInfo({ id: initialData.id, data: finalPayload });
        onClose();

      } else {
        // CREATE MODE
        const formData = new FormData();

        const laborObj: any = {
          role: (data.role || "").trim(),
          unit: data.unit,
          siteId,
        };

        const numberFields = [
          "quantity",
          "minQuantity",
          "estimatedHours",
          "rate",
          "overtimeRate",
          "totalAmount",
        ];
        numberFields.forEach((nf) => {
          const val = data[nf as keyof FormData];
          if (val !== undefined && val !== null && val !== "") {
            const num = Number(val);
            if (!isNaN(num)) laborObj[nf] = num;
          }
        });

        if (data.responsiblePerson) {
          laborObj.responsiblePerson = data.responsiblePerson;
        }

        if (data.allocationStatus) laborObj.allocationStatus = data.allocationStatus;

        const info: any = {};
        if (data.firstName) info.firstName = data.firstName;
        if (data.lastName) info.lastName = data.lastName;
        if (data.position) info.position = data.position;
        if (data.sex) info.sex = data.sex;
        if (data.terms) info.terms = data.terms;
        if (data.estSalary !== undefined && data.estSalary !== null) {
          const num = Number(data.estSalary);
          if (!isNaN(num)) info.estSalary = num;
        }
        if (data.educationLevel) info.educationLevel = data.educationLevel;
        if (data.startsAt) {
          info.startsAt = data.startsAt;
        }
        if (data.endsAt) {
          info.endsAt = data.endsAt;
        }
        if (data.infoStatus) info.status = data.infoStatus;
        if (data.phone) info.phone = data.phone;

        if (selectedFile) {
          formData.append("profile_picture", selectedFile);
          info.fileName = selectedFile.name;
        }

        if (Object.keys(info).length > 0) {
          laborObj.laborInformations = [info];
        }

        formData.append("labors", JSON.stringify([laborObj]));

        await importLabors(formData);
        toast.success("Labor created successfully!");
        onClose();
      }
    } catch (err: any) {
      console.error("Submit error:", err);
      toast.error(err.message || "Operation failed");
    }
  };

  const inputClass = "w-full px-3 py-2 border border-primary/40 rounded-md focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6"
    >
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">{isEditMode ? "Edit Labor" : "Create Labor"}</h3>
        <button
          type="button"
          className="text-3xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      <div className="space-y-4">
        <h4 className="text-md font-semibold text-gray-800">Labor Details</h4>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("role", { required: "Role is required" })}
            placeholder="Enter Role"
            className={inputClass}
          />
          {errors.role && (
            <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unit <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("unit", { required: "Unit is required" })}
            placeholder="Enter Unit (e.g., hrs)"
            className={inputClass}
          />
          {errors.unit && (
            <p className="text-red-500 text-sm mt-1">{errors.unit.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity
          </label>
          <input
            type="number"
            {...register("quantity", { valueAsNumber: true })}
            placeholder="Enter Quantity"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Quantity
            </label>
            <input
              type="number"
              {...register("minQuantity", {
                valueAsNumber: true,
              })}
              placeholder="Enter Min Quantity"
              className={inputClass}
            />
            {errors.minQuantity && (
              <p className="text-red-500 text-sm mt-1">
                {errors.minQuantity.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Responsible Person
            </label>
            <input
              type="text"
              {...register("responsiblePerson")}
              placeholder="Enter Responsible Person"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-md font-semibold text-gray-800">Labor Information</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              {...register("firstName")}
              placeholder="Enter First Name"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              {...register("lastName")}
              placeholder="Enter Last Name"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="text"
              {...register("phone")}
              placeholder="Enter Phone Number"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position
            </label>
            <input
              type="text"
              {...register("position")}
              placeholder="Enter Position"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sex
            </label>
            <select
              {...register("sex")}
              className={inputClass}
            >
              <option value="">Select Sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terms
            </label>
            <select
              {...register("terms")}
              className={inputClass}
            >
              <option value="">Select Terms</option>
              <option value="Part Time">Part Time</option>
              <option value="Contract">Contract</option>
              <option value="Temporary">Temporary</option>
              <option value="Permanent">Permanent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Salary
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 text-gray-500">
                ETB
              </span>
              <input
                type="number"
                {...register("estSalary", { valueAsNumber: true })}
                placeholder="Enter Estimated Salary"
                className={`flex-1 px-3 py-2 border border-primary/40 rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Hours
            </label>
            <input
              type="number"
              {...register("estimatedHours", { valueAsNumber: true })}
              placeholder="Enter Estimated Hours"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rate
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 text-gray-500">
                ETB
              </span>
              <input
                type="number"
                {...register("rate", { valueAsNumber: true })}
                placeholder="Enter Rate"
                className={`flex-1 px-3 py-2 border border-primary/40 rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overtime Rate
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 text-gray-500">
                ETB
              </span>
              <input
                type="number"
                {...register("overtimeRate", { valueAsNumber: true })}
                placeholder="Enter Overtime Rate"
                className={`flex-1 px-3 py-2 border border-primary/40 rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Amount
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 text-gray-500">
                ETB
              </span>
              <input
                type="number"
                {...register("totalAmount", { valueAsNumber: true })}
                placeholder="Calculated Amount"
                readOnly
                className="flex-1 px-3 py-2 border rounded-r-md bg-gray-50 text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skill Level
          </label>
          <input
            type="text"
            {...register("skill_level")}
            placeholder="Enter Skill Level"
            className={inputClass}
          />
        </div>



        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Education Level
            </label>
            <input
              type="text"
              {...register("educationLevel")}
              placeholder="Enter Education Level"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Info Status
            </label>
            <select
              {...register("infoStatus")}
              className={inputClass}
            >
              <option value="">Select Info Status</option>
              <option value="Allocated">Allocated</option>
              <option value="Unallocated">Unallocated</option>
              <option value="OnLeave">On Leave</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Starts At
            </label>
            <Controller
              name="startsAt"
              control={control}
              render={({ field }) => (
                <>
                  <ReactDatePicker
                    showFullMonthYearPicker
                    showYearDropdown
                    selected={field.value ? new Date(field.value) : undefined}
                    onChange={(date: any, event?: any) => {
                      const d = Array.isArray(date) ? date[0] : date;
                      field.onChange(d ? d.toISOString() : undefined);
                    }}
                    placeholderText="Enter Starts At"
                    className={inputClass}
                  />
                </>
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ends At
            </label>
            <Controller
              name="endsAt"
              control={control}
              render={({ field }) => (
                <>
                  <ReactDatePicker
                    showFullMonthYearPicker
                    showYearDropdown
                    selected={field.value ? new Date(field.value) : undefined}
                    onChange={(date: any, event?: any) => {
                      const d = Array.isArray(date) ? date[0] : date;
                      field.onChange(d ? d.toISOString() : undefined);
                    }}
                    placeholderText="Enter Ends At"
                    className={inputClass}
                  />
                </>
              )}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className={inputClass}
          />
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-500">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
            </p>
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
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

export default LaborForm;