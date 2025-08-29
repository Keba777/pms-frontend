"use client";

import { UpdateActivityInput } from "@/types/activity";
import React, { useState } from "react";
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

const ManageActivityForm: React.FC<{
  onSubmit: (data: UpdateActivityInput) => void;
  onClose: () => void;
  activity: UpdateActivityInput;
}> = ({ onSubmit, onClose, activity }) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateActivityInput>({
    defaultValues: activity,
  });

  const [checkedBy, setCheckedBy] = useState("");
  const [checkedDate, setCheckedDate] = useState("");
  const [approvedBy, setApprovedBy] = useState("");
  const [comment, setComment] = useState("");
  const [approvedDate, setApprovedDate] = useState("");
  const [summaryReport, setSummaryReport] = useState("");

  interface Row {
    id: number;
    dateTime: string;
    progress: number;
    remark: string;
    status: string;
    checkedBy: string;
    approvedBy: string;
    action?: string;
  }

  const [rows, setRows] = useState<Row[]>([]);
  const [nextId, setNextId] = useState(1);

  const getProgressColor = (value: number) => {
    if (value <= 25) return "#EF4444"; // red-500
    if (value <= 50) return "#F97316"; // orange-500
    if (value <= 75) return "#EAB308"; // yellow-500
    return "#22C55E"; // green-500
  };

  const addRow = () => {
    const newRow: Row = {
      id: nextId,
      dateTime: new Date().toISOString(),
      progress: 0,
      remark: "",
      status: "",
      checkedBy: checkedBy,
      approvedBy: approvedBy,
    };
    setRows([...rows, newRow]);
    setNextId(nextId + 1);
  };

  const updateRow = (id: number, field: keyof Row, value: string | number) => {
    setRows(
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const deleteRow = (id: number) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-4"
    >
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Manage Progress</h3>
        <Button
          type="button"
          variant="ghost"
          className="text-3xl text-red-500 hover:text-red-600 p-0"
          onClick={onClose}
        >
          ×
        </Button>
      </div>

      <div className="flex items-center space-x-4 my-10">
        <Label className="w-32 text-sm font-medium text-gray-700">
          Progress (%):
        </Label>
        <Controller
          name="progress"
          control={control}
          render={({ field }) => {
            const color = getProgressColor(field.value ?? 0);
            return (
              <div className="flex-1 flex flex-col space-y-2">
                <div className="relative flex items-center">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    {...field}
                    className="w-full h-1 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${color} ${
                        field.value ?? 0
                      }%, #E5E7EB ${field.value ?? 0}%)`,
                    }}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value, 10))
                    }
                  />
                  <span
                    className="absolute text-sm font-bold text-black"
                    style={{
                      left: `${field.value}%`,
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
                        left: `${mark}%`,
                        transform: "translateX(-50%)",
                      }}
                    >
                      {mark}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-800 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            );
          }}
        />
      </div>
      {errors.progress && (
        <p className="text-red-500 text-sm ml-32">{errors.progress.message}</p>
      )}

      <div className="flex items-center space-x-4">
        <Label
          htmlFor="checkedBy"
          className="text-sm font-medium text-gray-700"
        >
          Checked by:
        </Label>
        <Input
          type="text"
          id="checkedBy"
          value={checkedBy}
          onChange={(e) => setCheckedBy(e.target.value)}
          className="border-gray-300 focus:ring-cyan-700"
        />
        <Input
          type="date"
          id="checkedDate"
          value={checkedDate}
          onChange={(e) => setCheckedDate(e.target.value)}
          className="border-gray-300 focus:ring-cyan-700"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-cyan-700">
            <TableHead className="text-gray-50 px-4 py-3 text-left text-sm font-medium">
              #
            </TableHead>
            <TableHead className="text-gray-50 px-4 py-3 text-left text-sm font-medium">
              Date & Time
            </TableHead>
            <TableHead className="text-gray-50 px-4 py-3 text-left text-sm font-medium">
              Progress%
            </TableHead>
            <TableHead className="text-gray-50 px-4 py-3 text-left text-sm font-medium">
              Remark
            </TableHead>
            <TableHead className="text-gray-50 px-4 py-3 text-left text-sm font-medium">
              Status
            </TableHead>
            <TableHead className="text-gray-50 px-4 py-3 text-left text-sm font-medium">
              Checked By
            </TableHead>
            <TableHead className="text-gray-50 px-4 py-3 text-left text-sm font-medium">
              Approved By
            </TableHead>
            <TableHead className="text-gray-50 px-4 py-3 text-left text-sm font-medium">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} className="bg-white even:bg-gray-100">
              <TableCell>{row.id}</TableCell>
              <TableCell>
                <Input
                  value={row.dateTime}
                  onChange={(e) =>
                    updateRow(row.id, "dateTime", e.target.value)
                  }
                  className="border-gray-300 focus:ring-cyan-700"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={row.progress}
                  onChange={(e) =>
                    updateRow(row.id, "progress", parseInt(e.target.value))
                  }
                  className="border-gray-300 focus:ring-cyan-700"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={row.remark}
                  onChange={(e) => updateRow(row.id, "remark", e.target.value)}
                  className="border-gray-300 focus:ring-cyan-700"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={row.status}
                  onChange={(e) => updateRow(row.id, "status", e.target.value)}
                  className="border-gray-300 focus:ring-cyan-700"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={row.checkedBy}
                  onChange={(e) =>
                    updateRow(row.id, "checkedBy", e.target.value)
                  }
                  className="border-gray-300 focus:ring-cyan-700"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={row.approvedBy}
                  onChange={(e) =>
                    updateRow(row.id, "approvedBy", e.target.value)
                  }
                  className="border-gray-300 focus:ring-cyan-700"
                />
              </TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => deleteRow(row.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        type="button"
        onClick={addRow}
        className="bg-cyan-700 text-white hover:bg-cyan-800"
      >
        Add Row
      </Button>

      <h1 className="underline font-semibold text-gray-800">Summary Report</h1>
      <Textarea
        value={summaryReport}
        onChange={(e) => setSummaryReport(e.target.value)}
        className="border-gray-300 focus:ring-cyan-700"
      />

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium text-gray-700">
            Checked By:
          </Label>
          <Input
            value={checkedBy}
            onChange={(e) => setCheckedBy(e.target.value)}
            className="border-gray-300 focus:ring-cyan-700"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium text-gray-700">
            Approved By:
          </Label>
          <Input
            value={approvedBy}
            onChange={(e) => setApprovedBy(e.target.value)}
            className="border-gray-300 focus:ring-cyan-700"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium text-gray-700">Comment:</Label>
          <Input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="border-gray-300 focus:ring-cyan-700"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium text-gray-700">
            Approved Date:
          </Label>
          <Input
            type="date"
            value={approvedDate}
            onChange={(e) => setApprovedDate(e.target.value)}
            className="border-gray-300 focus:ring-cyan-700"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-4">
        <Button
          type="submit"
          className="bg-cyan-700 text-white hover:bg-cyan-800"
        >
          Update Progress
        </Button>
      </div>
    </form>
  );
};

export default ManageActivityForm;
