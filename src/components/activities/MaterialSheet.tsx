// File: components/MaterialSheet.tsx
import React, { useState, ChangeEvent } from "react";
import {
  useMaterialSheets,
  useCreateMaterialSheet,
  useUpdateMaterialSheet,
} from "@/hooks/useTimesheets";
import { useMaterials } from "@/hooks/useMaterials";
import {
  createMaterialBalanceSheetInput,
  updateMaterialBalanceSheetInput,
  MaterialBalanceSheet,
} from "@/types/timesheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const MaterialSheet: React.FC = () => {
  const {
    data: materialSheets,
    isLoading: sheetsLoading,
    isError: sheetsError,
    error: sheetsErrorObj,
  } = useMaterialSheets();

  const {
    data: materials,
    isLoading: materialsLoading,
    isError: materialsError,
    error: materialsErrorObj,
  } = useMaterials();

  const createMutation = useCreateMaterialSheet();
  const updateMutation = useUpdateMaterialSheet();

  const [isAdding, setIsAdding] = useState(false);

  const [newRow, setNewRow] = useState<{
    materialId: string;
    date: string;
    receivedQty: string;
    utilizedQty: string;
    assignedTo: string;
    remark: string;
    status: string;
    utilization_factor: string;
    totalTime: string;
    startingDate: string;
    dueDate: string;
    shiftingDate: string;
  }>({
    materialId: "",
    date: "",
    receivedQty: "",
    utilizedQty: "",
    assignedTo: "",
    remark: "",
    status: "",
    utilization_factor: "",
    totalTime: "",
    startingDate: "",
    dueDate: "",
    shiftingDate: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<MaterialBalanceSheet>>(
    {}
  );

  const columns = [
    "#",
    "Material",
    "Date",
    "Received Qty",
    "Utilized Qty",
    "Balance",
    "Assigned To",
    "Remark",
    "Status",
  ];

  const calculateBalance = (received: string, utilized: string): number => {
    const r = Number(received) || 0;
    const u = Number(utilized) || 0;
    return r - u;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewRow((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!newRow.materialId || !newRow.date) return;

    const receivedQty = Number(newRow.receivedQty) || 0;
    const utilizedQty = Number(newRow.utilizedQty) || 0;
    const balance = receivedQty - utilizedQty;

    const input: createMaterialBalanceSheetInput = {
      materialId: newRow.materialId,
      date: new Date(newRow.date),
      receivedQty,
      utilizedQty,
      balance,
      assignedTo: newRow.assignedTo,
      remark: newRow.remark || "",
      status: newRow.status,
    };

    createMutation.mutate(input, {
      onSuccess: () => {
        setIsAdding(false);
        setNewRow({
          materialId: "",
          date: "",
          receivedQty: "",
          utilizedQty: "",
          assignedTo: "",
          remark: "",
          status: "",
          utilization_factor: "",
          totalTime: "",
          startingDate: "",
          dueDate: "",
          shiftingDate: "",
        });
      },
    });
  };

  const handleEdit = (row: MaterialBalanceSheet) => {
    setEditingId(row.id);
    setEditingData(row);
  };

  const handleSave = () => {
    if (!editingId) return;

    const receivedQty = Number(editingData.receivedQty) || 0;
    const utilizedQty = Number(editingData.utilizedQty) || 0;
    const balance = receivedQty - utilizedQty;

    const updatedData: updateMaterialBalanceSheetInput & { id: string } = {
      id: editingId,
      materialId: editingData.materialId as string,
      date: new Date(editingData.date as unknown as string),
      receivedQty,
      utilizedQty,
      balance,
      assignedTo: editingData.assignedTo || "",
      remark: editingData.remark || "",
      status: editingData.status || "",
    };

    updateMutation.mutate(updatedData, {
      onSuccess: () => {
        setEditingId(null);
        setEditingData({});
      },
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData({});
  };

  if (sheetsLoading || materialsLoading) {
    return <p className="p-4">Loading...</p>;
  }
  if (sheetsError) {
    return (
      <p className="p-4 text-red-600">
        Error loading sheets: {sheetsErrorObj?.message}
      </p>
    );
  }
  if (materialsError) {
    return (
      <p className="p-4 text-red-600">
        Error loading materials: {materialsErrorObj?.message}
      </p>
    );
  }

  return (
    <div>
      <Button
        onClick={() => setIsAdding(true)}
        className="mb-2 bg-cyan-700 hover:bg-cyan-800 text-white"
        disabled={isAdding}
      >
        Add New
      </Button>

      <div className="overflow-x-auto">
        <Table className="min-w-full bg-gray-100">
          <TableHeader>
            <TableRow className="bg-cyan-700 hover:bg-cyan-700 text-white">
              {columns.map((col) => (
                <TableHead className="text-white" key={col}>
                  {col}
                </TableHead>
              ))}
              <TableHead className="text-white">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materialSheets?.map((row, idx) => {
              const isEditing = editingId === row.id;
              const mat = materials?.find((m) => m.id === row.materialId);

              return (
                <TableRow key={row.id} className="even:bg-gray-100">
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Select
                        name="materialId"
                        value={editingData.materialId}
                        onValueChange={(value) =>
                          handleEditChange({
                            target: { name: "materialId", value },
                          } as ChangeEvent<HTMLSelectElement>)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {(materials ?? []).map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      mat?.item || row.materialId
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="date"
                        name="date"
                        value={
                          editingData.date
                            ? new Date(editingData.date as unknown as string)
                                .toISOString()
                                .slice(0, 10)
                            : ""
                        }
                        onChange={handleEditChange}
                      />
                    ) : (
                      new Date(row.date).toLocaleDateString()
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        name="receivedQty"
                        step="1"
                        value={editingData.receivedQty?.toString() || ""}
                        onChange={handleEditChange}
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    ) : (
                      row.receivedQty
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        name="utilizedQty"
                        step="1"
                        value={editingData.utilizedQty?.toString() || ""}
                        onChange={handleEditChange}
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    ) : (
                      row.utilizedQty
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing
                      ? calculateBalance(
                          editingData.receivedQty?.toString() || "0",
                          editingData.utilizedQty?.toString() || "0"
                        ).toFixed(0)
                      : row.balance}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="text"
                        name="assignedTo"
                        value={editingData.assignedTo || ""}
                        onChange={handleEditChange}
                      />
                    ) : (
                      row.assignedTo
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="text"
                        name="remark"
                        value={editingData.remark || ""}
                        onChange={handleEditChange}
                      />
                    ) : (
                      row.remark || "–"
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="text"
                        name="status"
                        value={editingData.status || ""}
                        onChange={handleEditChange}
                      />
                    ) : (
                      row.status
                    )}
                  </TableCell>
                  <TableCell className="space-x-2">
                    {isEditing ? (
                      <>
                        <Button
                          onClick={handleSave}
                          className="bg-cyan-700 text-white"
                          disabled={updateMutation.isPending}
                        >
                          {updateMutation.isPending ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          className="bg-gray-400 text-white"
                          disabled={updateMutation.isPending}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => handleEdit(row)}
                        className="bg-cyan-700 text-white"
                      >
                        Edit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}

            {isAdding && (
              <TableRow className="bg-gray-100">
                <TableCell>
                  {materialSheets ? materialSheets.length + 1 : 1}
                </TableCell>
                <TableCell>
                  <Select
                    name="materialId"
                    value={newRow.materialId}
                    onValueChange={(value) =>
                      handleChange({
                        target: { name: "materialId", value },
                      } as ChangeEvent<HTMLSelectElement>)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(materials ?? []).map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    type="date"
                    name="date"
                    value={newRow.date}
                    onChange={handleChange}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    name="receivedQty"
                    step="1"
                    value={newRow.receivedQty}
                    onChange={handleChange}
                    className="appearance-none  [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    name="utilizedQty"
                    step="1"
                    value={newRow.utilizedQty}
                    onChange={handleChange}
                    className="appearance-none  [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </TableCell>
                <TableCell>
                  {calculateBalance(
                    newRow.receivedQty,
                    newRow.utilizedQty
                  ).toFixed(0)}
                </TableCell>
                <TableCell>
                  <Input
                    type="text"
                    name="assignedTo"
                    value={newRow.assignedTo}
                    onChange={handleChange}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="text"
                    name="remark"
                    value={newRow.remark}
                    onChange={handleChange}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="text"
                    name="status"
                    value={newRow.status}
                    onChange={handleChange}
                  />
                </TableCell>
                <TableCell className="space-x-2">
                  <Button
                    onClick={handleSubmit}
                    className="bg-cyan-700 hover:bg-cyan-800 text-white"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Saving..." : "Submit"}
                  </Button>
                  <Button
                    onClick={() => setIsAdding(false)}
                    className="bg-gray-400 text-white"
                    disabled={createMutation.isPending}
                  >
                    Cancel
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {isAdding && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="utilization_factor">Utilization Factor</Label>
            <Input
              id="utilization_factor"
              type="number"
              name="utilization_factor"
              value={newRow.utilization_factor}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="totalTime">Total Time</Label>
            <Input
              id="totalTime"
              type="number"
              name="totalTime"
              value={newRow.totalTime}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="startingDate">Starting Date</Label>
            <Input
              id="startingDate"
              type="date"
              name="startingDate"
              value={newRow.startingDate}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              name="dueDate"
              value={newRow.dueDate}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="shiftingDate">Shifting Date</Label>
            <Input
              id="shiftingDate"
              type="date"
              name="shiftingDate"
              value={newRow.shiftingDate}
              onChange={handleChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};
