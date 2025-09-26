import React from "react";
import { useForm, Controller } from "react-hook-form";
import { updateLaborTimesheetInput, LaborTimesheet } from "@/types/timesheet";
import { useUsers } from "@/hooks/useUsers";
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
import { TimeSheetStatus } from "@/types/timesheet";

interface EditLaborTimesheetFormProps {
  onClose: () => void;
  mode: "edit" | "view";
  initialData?: Partial<LaborTimesheet>;
  onSubmit: (data: updateLaborTimesheetInput) => void;
}

const EditLaborTimesheetForm: React.FC<EditLaborTimesheetFormProps> = ({
  onClose,
  mode,
  initialData,
  onSubmit,
}) => {
  const { data: users } = useUsers();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<updateLaborTimesheetInput>({
    defaultValues: {
      ...initialData,
      date: initialData?.date ? new Date(initialData.date) : undefined,
    },
  });

  const calculateHours = (inTime: string, outTime: string): number => {
    if (!inTime || !outTime) return 0;
    const [inHour, inMinute] = inTime.split(":").map(Number);
    const [outHour, outMinute] = outTime.split(":").map(Number);
    const inDate = new Date(0, 0, 0, inHour, inMinute);
    const outDate = new Date(0, 0, 0, outHour, outMinute);
    const diffMs = outDate.getTime() - inDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours > 0 ? diffHours : 0;
  };

  const calculateBreak = (morningOut: string, afternoonIn: string): number => {
    if (!morningOut || !afternoonIn) return 0;
    return calculateHours(morningOut, afternoonIn);
  };

  const morningIn = watch("morningIn");
  const morningOut = watch("morningOut");
  const afternoonIn = watch("afternoonIn");
  const afternoonOut = watch("afternoonOut");
  const ot = watch("ot");
  const rate = watch("rate");

  const mornHrs = calculateHours(morningIn ?? "", morningOut ?? "");
  const aftHrs = calculateHours(afternoonIn ?? "", afternoonOut ?? "");
  const breakTime = calculateBreak(morningOut ?? "", afternoonIn ?? "");
  const totalPay = (mornHrs + aftHrs) * Number(rate || 0) + Number(ot || 0);

  const isReadOnly = mode === "view";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-4"
    >
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {mode.charAt(0).toUpperCase() + mode.slice(1)} Labor Timesheet
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
          User{!isReadOnly && <span className="text-red-500">*</span>}
        </Label>
        <Controller
          name="userId"
          control={control}
          rules={{ required: !isReadOnly ? "User is required" : false }}
          render={({ field }) => (
            <Select
              disabled={isReadOnly}
              onValueChange={field.onChange}
              value={field.value}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {users?.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.first_name} {u.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      {errors.userId && (
        <p className="text-red-500 text-sm ml-32">{errors.userId.message}</p>
      )}

      <div className="flex items-center space-x-4">
        <Label className="w-32 text-sm font-medium text-gray-700">
          Date{!isReadOnly && <span className="text-red-500">*</span>}
        </Label>
        <Input
          type="date"
          disabled={isReadOnly}
          {...register("date", { required: !isReadOnly ? "Date is required" : false })}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
        />
      </div>
      {errors.date && (
        <p className="text-red-500 text-sm ml-32">{errors.date.message}</p>
      )}

      <div className="flex items-center space-x-4">
        <Label className="w-32 text-sm font-medium text-gray-700">
          Morning In
        </Label>
        <Input
          type="time"
          disabled={isReadOnly}
          {...register("morningIn")}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
        />
      </div>

      <div className="flex items-center space-x-4">
        <Label className="w-32 text-sm font-medium text-gray-700">
          Morning Out
        </Label>
        <Input
          type="time"
          disabled={isReadOnly}
          {...register("morningOut")}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
        />
      </div>

      <div className="flex items-center space-x-4">
        <Label className="w-32 text-sm font-medium text-gray-700">
          Morning Hrs
        </Label>
        <p className="flex-1 p-2 bg-gray-100 rounded-md">{mornHrs.toFixed(2)}</p>
      </div>

      <div className="flex items-center space-x-4">
        <Label className="w-32 text-sm font-medium text-gray-700">
          Break Time
        </Label>
        <p className="flex-1 p-2 bg-gray-100 rounded-md">{breakTime.toFixed(2)}</p>
      </div>

      <div className="flex items-center space-x-4">
        <Label className="w-32 text-sm font-medium text-gray-700">
          Afternoon In
        </Label>
        <Input
          type="time"
          disabled={isReadOnly}
          {...register("afternoonIn")}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
        />
      </div>

      <div className="flex items-center space-x-4">
        <Label className="w-32 text-sm font-medium text-gray-700">
          Afternoon Out
        </Label>
        <Input
          type="time"
          disabled={isReadOnly}
          {...register("afternoonOut")}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
        />
      </div>

      <div className="flex items-center space-x-4">
        <Label className="w-32 text-sm font-medium text-gray-700">
          Afternoon Hrs
        </Label>
        <p className="flex-1 p-2 bg-gray-100 rounded-md">{aftHrs.toFixed(2)}</p>
      </div>

      <div className="flex items-center space-x-4">
        <Label className="w-32 text-sm font-medium text-gray-700">
          OT
        </Label>
        <Input
          type="number"
          step="0.01"
          disabled={isReadOnly}
          {...register("ot")}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      <div className="flex items-center space-x-4">
        <Label className="w-32 text-sm font-medium text-gray-700">
          Rate
        </Label>
        <Input
          type="number"
          step="0.01"
          disabled={isReadOnly}
          {...register("rate")}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      <div className="flex items-center space-x-4">
        <Label className="w-32 text-sm font-medium text-gray-700">
          Total Pay
        </Label>
        <p className="flex-1 p-2 bg-gray-100 rounded-md">{totalPay.toFixed(2)}</p>
      </div>

      <div className="flex items-center space-x-4">
        <Label className="w-32 text-sm font-medium text-gray-700">
          Status
        </Label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              disabled={isReadOnly}
              onValueChange={field.onChange}
              value={field.value}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(TimeSheetStatus).map((st) => (
                  <SelectItem key={st} value={st}>
                    {st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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

export default EditLaborTimesheetForm;