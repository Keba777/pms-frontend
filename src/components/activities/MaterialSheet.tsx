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

// Reusable table wrapper and header (local copy)
const TableWrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-gray-100 border border-gray-300">
      {children}
    </table>
  </div>
);

interface TableHeaderProps {
  columns: string[];
}

const TableHeader: React.FC<TableHeaderProps> = ({ columns }) => (
  <thead className="bg-cyan-700 text-white">
    <tr>
      {columns.map((col) => (
        <th key={col} className="px-4 py-2 border">
          {col}
        </th>
      ))}
      <th className="px-4 py-2 border">Action</th>
    </tr>
  </thead>
);

export const MaterialSheet: React.FC = () => {
  // Fetch existing material sheets
  const {
    data: materialSheets,
    isLoading: sheetsLoading,
    isError: sheetsError,
    error: sheetsErrorObj,
  } = useMaterialSheets();

  // Fetch master list of materials
  const {
    data: materials,
    isLoading: materialsLoading,
    isError: materialsError,
    error: materialsErrorObj,
  } = useMaterials();

  // Mutation hooks
  const createMutation = useCreateMaterialSheet();
  const updateMutation = useUpdateMaterialSheet();

  // State to toggle “Add New” row
  const [isAdding, setIsAdding] = useState(false);

  // Local state for new-row inputs
  const [newRow, setNewRow] = useState<{
    materialId: string;
    date: string;
    receivedQty: string;
    utilizedQty: string;
    assignedTo: string;
    remark: string;
    status: string;
  }>({
    materialId: "",
    date: "",
    receivedQty: "",
    utilizedQty: "",
    assignedTo: "",
    remark: "",
    status: "",
  });

  // State for editing existing rows
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<
    Partial<MaterialBalanceSheet>
  >({});

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

  // Helper to calculate balance = receivedQty - utilizedQty
  const calculateBalance = (received: string, utilized: string): number => {
    const r = Number(received) || 0;
    const u = Number(utilized) || 0;
    return r - u;
  };

  // Generic change handler
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewRow((prev) => ({ ...prev, [name]: value }));
  };

  // Change handler for edit mode
  const handleEditChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditingData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit new row
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
        });
      },
    });
  };

  // Start editing
  const handleEdit = (row: MaterialBalanceSheet) => {
    setEditingId(row.id);
    setEditingData(row);
  };

  // Save edits
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
      <button
        onClick={() => setIsAdding(true)}
        className="mb-2 px-4 py-2 bg-green-600 text-white rounded"
        disabled={isAdding}
      >
        Add New
      </button>

      <TableWrapper>
        <TableHeader columns={columns} />
        <tbody>
          {/* Existing rows */}
          {materialSheets?.map((row, idx) => {
            const isEditing = editingId === row.id;
            // find material name
            const mat = materials?.find((m) => m.id === row.materialId);

            return (
              <tr key={row.id} className="bg-white even:bg-gray-100">
                <td className="px-4 py-2 border">{idx + 1}</td>

                {/* Material */}
                <td className="px-4 py-2 border">
                  {isEditing ? (
                    <select
                      name="materialId"
                      value={editingData.materialId}
                      onChange={handleEditChange}
                      className="w-full border px-2 py-1"
                    >
                      <option value="">Select...</option>
                      {(materials ?? []).map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.item}
                        </option>
                      ))}
                    </select>
                  ) : (
                    mat?.item || row.materialId
                  )}
                </td>

                {/* Date */}
                <td className="px-4 py-2 border">
                  {isEditing ? (
                    <input
                      type="date"
                      name="date"
                      value={
                        editingData.date
                          ? new Date(
                              editingData.date as unknown as string
                            )
                              .toISOString()
                              .slice(0, 10)
                          : ""
                      }
                      onChange={handleEditChange}
                      className="w-full border px-2 py-1"
                    />
                  ) : (
                    new Date(row.date).toLocaleDateString()
                  )}
                </td>

                {/* Received Qty */}
                <td className="px-4 py-2 border">
                  {isEditing ? (
                    <input
                      type="number"
                      name="receivedQty"
                      step="1"
                      value={editingData.receivedQty?.toString() || ""}
                      onChange={handleEditChange}
                      className="w-full border px-2 py-1"
                    />
                  ) : (
                    row.receivedQty
                  )}
                </td>

                {/* Utilized Qty */}
                <td className="px-4 py-2 border">
                  {isEditing ? (
                    <input
                      type="number"
                      name="utilizedQty"
                      step="1"
                      value={editingData.utilizedQty?.toString() || ""}
                      onChange={handleEditChange}
                      className="w-full border px-2 py-1"
                    />
                  ) : (
                    row.utilizedQty
                  )}
                </td>

                {/* Balance */}
                <td className="px-4 py-2 border">
                  {isEditing
                    ? calculateBalance(
                        editingData.receivedQty?.toString() || "0",
                        editingData.utilizedQty?.toString() || "0"
                      ).toFixed(0)
                    : row.balance}
                </td>

                {/* Assigned To */}
                <td className="px-4 py-2 border">
                  {isEditing ? (
                    <input
                      type="text"
                      name="assignedTo"
                      value={editingData.assignedTo || ""}
                      onChange={handleEditChange}
                      className="w-full border px-2 py-1"
                    />
                  ) : (
                    row.assignedTo
                  )}
                </td>

                {/* Remark */}
                <td className="px-4 py-2 border">
                  {isEditing ? (
                    <input
                      type="text"
                      name="remark"
                      value={editingData.remark || ""}
                      onChange={handleEditChange}
                      className="w-full border px-2 py-1"
                    />
                  ) : (
                    row.remark || "–"
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-2 border">
                  {isEditing ? (
                    <input
                      type="text"
                      name="status"
                      value={editingData.status || ""}
                      onChange={handleEditChange}
                      className="w-full border px-2 py-1"
                    />
                  ) : (
                    row.status
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-2 border space-x-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="px-2 py-1 bg-blue-600 text-white rounded"
                        disabled={updateMutation.isPending}
                      >
                        {updateMutation.isPending ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-2 py-1 bg-gray-400 text-white rounded"
                        disabled={updateMutation.isPending}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEdit(row)}
                      className="px-2 py-1 bg-cyan-700 text-white rounded"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            );
          })}

          {/* “Add New” row */}
          {isAdding && (
            <tr className="bg-yellow-50">
              <td className="px-4 py-2 border">
                {materialSheets ? materialSheets.length + 1 : 1}
              </td>

              {/* Material selector */}
              <td className="px-4 py-2 border">
                <select
                  name="materialId"
                  value={newRow.materialId}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                >
                  <option value="">Select...</option>
                  {(materials ?? []).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.item}
                    </option>
                  ))}
                </select>
              </td>

              {/* Date */}
              <td className="px-4 py-2 border">
                <input
                  type="date"
                  name="date"
                  value={newRow.date}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                />
              </td>

              {/* Received Qty */}
              <td className="px-4 py-2 border">
                <input
                  type="number"
                  name="receivedQty"
                  step="1"
                  value={newRow.receivedQty}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                />
              </td>

              {/* Utilized Qty */}
              <td className="px-4 py-2 border">
                <input
                  type="number"
                  name="utilizedQty"
                  step="1"
                  value={newRow.utilizedQty}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                />
              </td>

              {/* Balance */}
              <td className="px-4 py-2 border">
                {calculateBalance(newRow.receivedQty, newRow.utilizedQty).toFixed(
                  0
                )}
              </td>

              {/* Assigned To */}
              <td className="px-4 py-2 border">
                <input
                  type="text"
                  name="assignedTo"
                  value={newRow.assignedTo}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                />
              </td>

              {/* Remark */}
              <td className="px-4 py-2 border">
                <input
                  type="text"
                  name="remark"
                  value={newRow.remark}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                />
              </td>

              {/* Status */}
              <td className="px-4 py-2 border">
                <input
                  type="text"
                  name="status"
                  value={newRow.status}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                />
              </td>

              {/* Submit / Cancel */}
              <td className="px-4 py-2 border space-x-2">
                <button
                  onClick={handleSubmit}
                  className="px-2 py-1 bg-blue-600 text-white rounded"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Saving..." : "Submit"}
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-2 py-1 bg-gray-400 text-white rounded"
                  disabled={createMutation.isPending}
                >
                  Cancel
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </TableWrapper>
    </div>
  );
};
