import React from "react";
import { useForm, Controller } from "react-hook-form";
import {
  updateMaterialBalanceSheetInput,
  MaterialBalanceSheet,
} from "@/types/timesheet";
import { useMaterials } from "@/hooks/useMaterials";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface EditMaterialSheetFormProps {
  onClose: () => void;
  mode: "edit" | "view";
  initialData?: Partial<MaterialBalanceSheet>;
  onSubmit: (data: updateMaterialBalanceSheetInput) => void;
}

const EditMaterialSheetForm: React.FC<EditMaterialSheetFormProps> = ({
  onClose,
  mode,
  initialData,
  onSubmit,
}) => {
  const { data: materials } = useMaterials();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<updateMaterialBalanceSheetInput>({
    defaultValues: {
      ...initialData,
      date: initialData?.date ? new Date(initialData.date) : undefined,
    },
  });

  const calculateBalance = (received: number, utilized: number): number => {
    return received - utilized;
  };

  const receivedQty = watch("receivedQty");
  const utilizedQty = watch("utilizedQty");
  const balance = calculateBalance(receivedQty ?? 0, utilizedQty ?? 0);

  const isReadOnly = mode === "view";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-4"
    >
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {mode.charAt(0).toUpperCase() + mode.slice(1)} Material Balance Sheet
        </h3>
        <button
          type="button"
          className="text-3xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <Label className="w-32 text-sm font-medium text-gray-700">
          Material{!isReadOnly && <span className="text-red-500">*</span>}
        </Label>
        <Controller
          name="materialId"
          control={control}
          rules={{ required: !isReadOnly ? "Material is required" : false }}
          render={({ field }) => (
            <Select
              disabled={isReadOnly}
              onValueChange={field.onChange}
              value={field.value || ""}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                {materials?.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      {errors.materialId && (
        <p className="text-red-500 text-sm ml-32">
          {errors.materialId.message}
        </p>
      )}

      <div className="flex items-center space-x-4">
        <Label className="w-32 text-sm font-medium text-gray-700">
          Date{!isReadOnly && <span className="text-red-500">*</span>}
        </Label>
        <Input
          type="date"
          disabled={isReadOnly}
          {...register("date", {
            required: !isReadOnly ? "Date is required" : false,
          })}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
        />
      </div>
      {errors.date && (
        <p className="text-red-500 text-sm ml-32">{errors.date.message}</p>
      )}

      <div className="flex items-center space-x-4">
        <Label className="w-32 text-sm font-medium text-gray-700">
          Received Qty
        </Label>
        <Input
          type="number"
          step="1"
          disabled={isReadOnly}
          {...register("receivedQty")}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      <div className="flex items-center space-x-4">
        <Label className="w-32 text-sm font-medium text-gray-700">
          Utilized Qty
        </Label>
        <Input
          type="number"
          step="1"
          disabled={isReadOnly}
          {...register("utilizedQty")}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      <div className="flex items-center space-x-4">
        <Label className="w-32 text-sm font-medium text-gray-700">
          Balance
        </Label>
        <p className="flex-1 p-2 bg-gray-100 rounded-md">
          {balance.toFixed(0)}
        </p>
      </div>

      <div className="flex items-center space-x-4">
        <Label className="w-32 text-sm font-medium text-gray-700">
          Assigned To
        </Label>
        <Input
          type="text"
          disabled={isReadOnly}
          {...register("assignedTo")}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
        />
      </div>

      <div className="flex items-center space-x-4">
        <Label className="w-32 text-sm font-medium text-gray-700">Remark</Label>
        <Input
          type="text"
          disabled={isReadOnly}
          {...register("remark")}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
        />
      </div>

      <div className="flex items-center space-x-4">
        <Label className="w-32 text-sm font-medium text-gray-700">Status</Label>
        <Input
          type="text"
          disabled={isReadOnly}
          {...register("status")}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
        />
      </div>

      <div className="flex items-center space-x-4">
        <Label className="w-32 text-sm font-medium text-gray-700">
          Utilization Factor
        </Label>
        <Input
          type="number"
          disabled={isReadOnly}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
        />
      </div>

      <div className="flex items-center space-x-4">
        <Label className="w-32 text-sm font-medium text-gray-700">
          Total Time
        </Label>
        <Input
          type="number"
          disabled={isReadOnly}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
        />
      </div>

      <div className="flex items-center space-x-4">
        <Label className="w-32 text-sm font-medium text-gray-700">
          Starting Date
        </Label>
        <Input
          type="date"
          disabled={isReadOnly}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
        />
      </div>

      <div className="flex items-center space-x-4">
        <Label className="w-32 text-sm font-medium text-gray-700">
          Due Date
        </Label>
        <Input
          type="date"
          disabled={isReadOnly}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
        />
      </div>

      <div className="flex items-center space-x-4">
        <Label className="w-32 text-sm font-medium text-gray-700">
          Shifting Date
        </Label>
        <Input
          type="date"
          disabled={isReadOnly}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
        />
      </div>

      <div className="flex justify-end space-x-4 mt-4">
        <Button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          Close
        </Button>
        {!isReadOnly && (
          <Button
            type="submit"
            className="px-4 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800"
          >
            Update
          </Button>
        )}
      </div>
    </form>
  );
};

export default EditMaterialSheetForm;
