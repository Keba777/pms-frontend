"use client";
import { UpdateProjectInput } from "@/types/project";
import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { createPortal } from "react-dom";
import { useUpdateProjectProgress } from "@/hooks/useProjects";
import { toast } from "react-toastify";
import { ProgressUpdateItem } from "@/types/activity";
import { useSettingsStore } from "@/store/settingsStore";
import { normalizeDatePickerValue } from "@/utils/datePicker";
/**
 * popper container matching the expected signature:
 * React.ComponentType<{ children?: React.ReactNode }>
 */
const PopperContainer: React.ComponentType<{ children?: React.ReactNode }> = ({
  children,
}) => {
  if (typeof document === "undefined") return null;
  if (!children) return null;
  return createPortal(children, document.body);
};
type Row = {
  // UI id separate from backend id
  uiId: string;
  backendId?: string;
  dateTime: string;
  fromProgress?: number | null;
  progress: number;
  remark?: string;
  status?: string;
  checkedBy?: string;
  approvedBy?: string;
  summaryReport?: string;
  comment?: string;
  approvedDate?: string | null;
  userId?: string;
  isNew?: boolean;
};
const ManageProjectForm: React.FC<{
  onClose: () => void;
  project: UpdateProjectInput & { id: string; name?: string; progressUpdates?: ProgressUpdateItem[] | null };
}> = ({ onClose, project }) => {
  const { useEthiopianDate } = useSettingsStore();
  const { handleSubmit, control, setValue } = useForm<UpdateProjectInput>({
    defaultValues: project,
  });
  const [rows, setRows] = useState<Row[]>([]);
  const [newRow, setNewRow] = useState<Row | null>(null);
  const updateProgressMutation = useUpdateProjectProgress();
  const currentFromProgress = rows.length ? rows[rows.length - 1].progress : project.progress ?? 0;
  // Convert incoming project.progressUpdates to rows (read-only)
  useEffect(() => {
    const pu = project.progressUpdates ?? [];
    // compute fromProgress for each entry as the previous progress value if available
    const mapped: Row[] = pu.map((item, idx) => {
      const prev = idx > 0 ? pu[idx - 1].progress ?? null : item.fromProgress ?? null;
      return {
        uiId: item.id ?? `existing-${idx}`,
        backendId: item.id,
        dateTime: item.dateTime,
        fromProgress: item.fromProgress ?? prev ?? null,
        progress: item.progress ?? 0,
        remark: item.remark ?? "",
        status: item.status ?? "",
        checkedBy: item.checkedBy ?? "",
        approvedBy: item.approvedBy ?? "",
        summaryReport: item.summaryReport ?? "",
        comment: item.comment ?? "",
        approvedDate: item.approvedDate ?? null,
        userId: item.userId ?? undefined,
        isNew: false,
      };
    });
    setRows(mapped);
  }, [project.progressUpdates]);
  // Auto add new row on mount
  useEffect(() => {
    addRow();
  }, []);
  // helpers
  const getProgressColor = (value: number): string => {
    if (value <= 25) return "#EF4444"; // red-500
    if (value <= 50) return "#F97316"; // orange-500
    if (value <= 75) return "#EAB308"; // yellow-500
    return "#22C55E"; // green-500
  };
  const uniqueUiId = () => `new-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const addRow = (): void => {
    // enforce single new row
    if (newRow) {
      return;
    }
    const defaultRow: Row = {
      uiId: uniqueUiId(),
      dateTime: new Date().toISOString(),
      fromProgress: currentFromProgress,
      progress: currentFromProgress,
      remark: "",
      status: "",
      checkedBy: "",
      approvedBy: "",
      summaryReport: "",
      comment: "",
      approvedDate: null,
      userId: undefined,
      isNew: true,
    };
    setNewRow(defaultRow);
  };
  const updateNewRowField = <K extends keyof Row>(field: K, value: Row[K]) => {
    if (!newRow) return;
    if (field === "progress") {
      const numValue = Number(value);
      setValue("progress", numValue);
      setNewRow({ ...newRow, [field]: numValue });
    } else {
      setNewRow({ ...newRow, [field]: value });
    }
  };
  const deleteNewRow = () => {
    setNewRow(null);
  };
  const clampProgress = () => {
    if (!newRow) return;
    let clamped = newRow.progress;
    const min = newRow.fromProgress ?? 0;
    if (clamped < min) clamped = min;
    if (clamped > 100) clamped = 100;
    if (clamped !== newRow.progress) {
      updateNewRowField("progress", clamped);
    }
  };
  const onSubmit = async () => {
    if (!newRow) {
      toast.error("Add a new progress row before submitting.");
      return;
    }
    if (newRow.progress <= newRow.fromProgress!) {
      toast.error("Progress must be increased.");
      return;
    }
    // build payload matching UpdateProjectProgressPayload expected by your API
    const payload = {
      projectId: project.id,
      progress: Number(newRow.progress ?? 0),
      remark: newRow.remark,
      status: newRow.status || null,
      checkedBy: newRow.checkedBy,
      approvedBy: newRow.approvedBy,
      summaryReport: newRow.summaryReport,
      comment: newRow.comment,
      approvedDate: newRow.approvedDate ? new Date(newRow.approvedDate).toISOString() : null,
      dateTime: newRow.dateTime,
      userId: newRow.userId,
      // fromProgress can be optionally sent if the backend needs it
      fromProgress: newRow.fromProgress ?? undefined,
    } as any;
    try {
      const updatedProject = await updateProgressMutation.mutateAsync(payload);
      toast.success("Progress updated successfully.");
      // If backend returns updated project.progressUpdates, refresh UI from it
      const updatedProgressUpdates = (updatedProject.progressUpdates ?? []) as ProgressUpdateItem[];
      const mapped: Row[] = updatedProgressUpdates.map((item, idx) => {
        const prev = idx > 0 ? updatedProgressUpdates[idx - 1].progress ?? null : item.fromProgress ?? null;
        return {
          uiId: item.id ?? `existing-${idx}`,
          backendId: item.id,
          dateTime: item.dateTime,
          fromProgress: item.fromProgress ?? prev ?? null,
          progress: item.progress ?? 0,
          remark: item.remark ?? "",
          status: item.status ?? "",
          checkedBy: item.checkedBy ?? "",
          approvedBy: item.approvedBy ?? "",
          summaryReport: item.summaryReport ?? "",
          comment: item.comment ?? "",
          approvedDate: item.approvedDate ?? null,
          userId: item.userId ?? undefined,
          isNew: false,
        };
      });
      setRows(mapped);
      setNewRow(null);
      // also update the local form's progress value to reflect current project progress returned
      if (typeof updatedProject.progress === "number") {
        setValue("progress", updatedProject.progress);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update progress.");
    }
  };
  // Render
  return (
    <form className="bg-white rounded-lg shadow-xl p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      {/* Ensure datepicker popper appears above all */}
      <style>{`
        .react-datepicker-popper {
          z-index: 9999 !important;
        }
        .react-datepicker {
          z-index: 9999 !important;
        }
        [data-radix-popper-content-wrapper] {
          z-index: 9999 !important;
        }
      `}</style>
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Manage {project.name ?? "Project"} Progress</h3>
        <Button
          type="button"
          variant="ghost"
          className="text-3xl text-red-500 hover:text-red-600 p-0"
          onClick={onClose}
        >
          ×
        </Button>
      </div>
      {/* Keep the overall project progress control (optional) */}
      <div className="flex items-center space-x-4 my-4">
        <Label className="w-32 text-sm font-medium text-gray-700">Project Progress:</Label>
        <Controller
          name="progress"
          control={control}
          render={({ field }) => {
            const color = getProgressColor(field.value ?? 0);
            const minProgress = newRow?.fromProgress ?? 0;
            return (
              <div className="flex-1 flex flex-col space-y-2">
                <div className="relative flex items-center">
                  <input
                    type="range"
                    min={minProgress}
                    max={100}
                    step={1}
                    {...field}
                    className="w-full h-1 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${color} ${((field.value ?? 0) - minProgress) / (100 - minProgress) * 100}%, #E5E7EB ${((field.value ?? 0) - minProgress) / (100 - minProgress) * 100}%)`,
                    }}
                    onChange={(e) => {
                      const newValue = parseInt(e.target.value, 10);
                      if (newValue < minProgress) return;
                      field.onChange(newValue);
                      if (newRow) {
                        updateNewRowField("progress", newValue);
                      }
                    }}
                  />
                  <span
                    className="absolute text-sm font-bold text-black"
                    style={{
                      left: `${((field.value ?? 0) - minProgress) / (100 - minProgress) * 100}%`,
                      transform: "translateX(-50%)",
                      top: "-1.5rem",
                    }}
                  >
                    {field.value}%
                  </span>
                </div>
                <div className="relative flex justify-between -mt-2">
                  {[0, 25, 50, 75, 100].map((mark) => (
                    <span
                      key={mark}
                      className="text-xs text-gray-800"
                      style={{
                        position: "absolute",
                        left: `${(mark - minProgress) / (100 - minProgress) * 100}%`,
                        transform: "translateX(-50%)",
                      }}
                    >
                      {mark}
                    </span>
                  ))}
                </div>
              </div>
            );
          }}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-cyan-700 hover:bg-cyan-800">
            <TableHead className="text-gray-50 px-4 py-3 text-left text-sm font-medium">#</TableHead>
            <TableHead className="text-gray-50 px-4 py-3 text-left text-sm font-medium">Date & Time</TableHead>
            <TableHead className="text-gray-50 px-4 py-3 text-left text-sm font-medium">From</TableHead>
            <TableHead className="text-gray-50 px-4 py-3 text-left text-sm font-medium">Progress%</TableHead>
            <TableHead className="text-gray-50 px-4 py-3 text-left text-sm font-medium">Status</TableHead>
            <TableHead className="text-gray-50 px-4 py-3 text-left text-sm font-medium">Checked By</TableHead>
            <TableHead className="text-gray-50 px-4 py-3 text-left text-sm font-medium">Approved By</TableHead>
            <TableHead className="text-gray-50 px-4 py-3 text-left text-sm font-medium">Approved Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* existing (read-only) rows */}
          {rows.map((row, idx) => (
            <TableRow key={row.uiId} className="bg-white even:bg-gray-100">
              <TableCell>{idx + 1}</TableCell>
              <TableCell>
                <div>{row.dateTime ? new Date(row.dateTime).toLocaleString() : "-"}</div>
              </TableCell>
              <TableCell>{row.fromProgress ?? "-"}</TableCell>
              <TableCell>{row.progress ?? 0}%</TableCell>
              <TableCell>{row.status ?? "-"}</TableCell>
              <TableCell>{row.checkedBy ?? "-"}</TableCell>
              <TableCell>{row.approvedBy ?? "-"}</TableCell>
              <TableCell>{row.approvedDate ? new Date(row.approvedDate).toLocaleString() : "-"}</TableCell>
            </TableRow>
          ))}
          {/* new editable row (only one allowed) */}
          {newRow && (
            <TableRow key={newRow.uiId} className="bg-sky-50">
              <TableCell>{rows.length + 1}</TableCell>
              <TableCell>
                <ReactDatePicker
                  showFullMonthYearPicker
                  showYearDropdown
                  selected={newRow.dateTime ? new Date(newRow.dateTime) : null}
                  onChange={(value) => {
                    const nextDate = normalizeDatePickerValue(value);
                    updateNewRowField("dateTime", nextDate ? nextDate.toISOString() : "");
                  }}
                  showTimeSelect
                  timeIntervals={15}
                  timeFormat="h:mm aa"
                  dateFormat="MM/dd/yyyy h:mm aa"
                  className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
                  placeholderText="Select date & time"
                  popperContainer={PopperContainer}
                  popperPlacement="bottom-start"
                />
              </TableCell>
              <TableCell>{newRow.fromProgress ?? "-"}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={newRow.progress}
                  min={newRow.fromProgress ?? 0}
                  max={100}
                  step={1}
                  onChange={(e) => {
                    const value = parseInt(e.target.value || "0", 10);
                    updateNewRowField("progress", value);
                  }}
                  onFocus={(e) => e.target.select()}
                  onBlur={clampProgress}
                  className="border-gray-300 focus:ring-cyan-700 w-20"
                />
              </TableCell>
              <TableCell>
                <Select value={newRow.status ?? ""} onValueChange={(v) => updateNewRowField("status", v)}>
                  <SelectTrigger className="border-gray-300 focus:ring-cyan-700">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Not Started", "Started", "InProgress", "Canceled", "Onhold", "Completed"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  value={newRow.checkedBy}
                  onChange={(e) => updateNewRowField("checkedBy", e.target.value)}
                  className="border-gray-300 focus:ring-cyan-700"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={newRow.approvedBy}
                  onChange={(e) => updateNewRowField("approvedBy", e.target.value)}
                  className="border-gray-300 focus:ring-cyan-700"
                />
              </TableCell>
              <TableCell>
                <ReactDatePicker
                  showFullMonthYearPicker
                  showYearDropdown
                  selected={newRow.approvedDate ? new Date(newRow.approvedDate) : null}
                  onChange={(value) => {
                    const nextDate = normalizeDatePickerValue(value);
                    updateNewRowField("approvedDate", nextDate ? nextDate.toISOString() : null);
                  }}
                  showTimeSelect
                  timeIntervals={15}
                  timeFormat="h:mm aa"
                  dateFormat="MM/dd/yyyy h:mm aa"
                  className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
                  placeholderText="Approved date"
                  popperContainer={PopperContainer}
                  popperPlacement="bottom-start"
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {newRow && (
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="remark">Remark</Label>
            <Input
              id="remark"
              value={newRow.remark}
              onChange={(e) => updateNewRowField("remark", e.target.value)}
              className="border-gray-300 focus:ring-cyan-700"
            />
          </div>
          <div>
            <Label htmlFor="summaryReport">Summary Report</Label>
            <Textarea
              id="summaryReport"
              value={newRow.summaryReport}
              onChange={(e) => updateNewRowField("summaryReport", e.target.value)}
              className="border-gray-300 focus:ring-cyan-700"
            />
          </div>
          <div>
            <Label htmlFor="comment">Comment</Label>
            <Input
              id="comment"
              value={newRow.comment}
              onChange={(e) => updateNewRowField("comment", e.target.value)}
              className="border-gray-300 focus:ring-cyan-700"
            />
          </div>
        </div>
      )}
      <div className="flex items-center space-x-2 mt-4">
        <Button
          type="button"
          onClick={() => onSubmit()}
          disabled={!newRow || newRow.progress <= (newRow.fromProgress ?? 0) || updateProgressMutation.isPending}
          className="bg-cyan-700 text-white hover:bg-cyan-800"
        >
          Update Progress
        </Button>
        <Button type="button" variant="outline" onClick={deleteNewRow}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ManageProjectForm;
