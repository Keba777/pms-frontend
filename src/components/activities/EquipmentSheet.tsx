import React, { useState, ChangeEvent } from "react";
import {
  useEquipmentTimesheets,
  useCreateEquipmentTimesheet,
  useUpdateEquipmentTimesheet,
} from "@/hooks/useTimesheets";
import { useEquipments } from "@/hooks/useEquipments";
import {
  TimeSheetStatus,
  createEquipmentTimesheetInput,
  updateEquipmentTimesheetInput,
  EquipmentTimesheet,
} from "@/types/timesheet";

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

export const EquipmentSheet: React.FC = () => {
  // Fetch existing equipment timesheets
  const {
    data: equipmentTimesheets,
    isLoading: isLoadingTimes,
    isError: isErrorTimes,
    error: timesError,
  } = useEquipmentTimesheets();

  // Fetch all equipment for the "Equipment" select
  const {
    data: equipment,
    isLoading: isLoadingEquipment,
    isError: isErrorEquipment,
    error: equipmentError,
  } = useEquipments();

  // Mutation hooks
  const createMutation = useCreateEquipmentTimesheet();
  const updateMutation = useUpdateEquipmentTimesheet();

  // State to toggle “Add New” row
  const [isAdding, setIsAdding] = useState(false);

  // Local state for new-row inputs (including dt)
  const [newRow, setNewRow] = useState<{
    equipmentId: string;
    date: string;
    morningIn: string;
    morningOut: string;
    afternoonIn: string;
    afternoonOut: string;
    ot: string;
    dt: string;
    rate: string;
    status: TimeSheetStatus;
  }>({
    equipmentId: "",
    date: "",
    morningIn: "",
    morningOut: "",
    afternoonIn: "",
    afternoonOut: "",
    ot: "",
    dt: "",
    rate: "",
    status: TimeSheetStatus.Pending,
  });

  // State for editing existing rows (including dt)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<EquipmentTimesheet>>(
    {}
  );

  const columns = [
    "#",
    "Equipment",
    "Date",
    "Morning In",
    "Morning Out",
    "Morning Hrs",
    "Break Time",
    "Afternoon In",
    "Afternoon Out",
    "Afternoon Hrs",
    "OT",
    "DT",
    "Rate",
    "Total Cost",
    "Status",
  ];

  // Helper function to calculate hours from time strings
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

  // Calculate break time between morningOut and afternoonIn
  const calculateBreak = (morningOut: string, afternoonIn: string): number => {
    if (!morningOut || !afternoonIn) return 0;
    return calculateHours(morningOut, afternoonIn);
  };

  // Handler for input/select changes in the “Add New” row
  const handleChange = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewRow((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for input/select changes in the editing row
  const handleEditChange = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditingData((prev) => ({ ...prev, [name]: value }));
  };

  // Compute and submit new row data
  const handleSubmit = () => {
    if (!newRow.equipmentId || !newRow.date) return; // minimal validation

    const mornHrs = calculateHours(newRow.morningIn, newRow.morningOut);
    const aftHrs = calculateHours(newRow.afternoonIn, newRow.afternoonOut);
    const breakTime = calculateBreak(newRow.morningOut, newRow.afternoonIn);
    const ot = Number(newRow.ot) || 0;
    const dt = Number(newRow.dt) || 0;
    const rate = Number(newRow.rate) || 0;
    const totalCost = (mornHrs + aftHrs + dt) * rate + ot;

    const input: createEquipmentTimesheetInput = {
      equipmentId: newRow.equipmentId,
      date: new Date(newRow.date),
      morningIn: newRow.morningIn,
      morningOut: newRow.morningOut,
      mornHrs,
      bt: breakTime,
      afternoonIn: newRow.afternoonIn,
      afternoonOut: newRow.afternoonOut,
      aftHrs,
      ot,
      dt,
      rate,
      totalPay: totalCost,
      status: newRow.status,
    };

    createMutation.mutate(input, {
      onSuccess: () => {
        setIsAdding(false);
        setNewRow({
          equipmentId: "",
          date: "",
          morningIn: "",
          morningOut: "",
          afternoonIn: "",
          afternoonOut: "",
          ot: "",
          dt: "",
          rate: "",
          status: TimeSheetStatus.Pending,
        });
      },
    });
  };

  // Start editing a row
  const handleEdit = (row: EquipmentTimesheet) => {
    setEditingId(row.id);
    setEditingData(row);
  };

  // Save edited row data
  const handleSave = () => {
    if (!editingId || !editingData) return;

    const morningIn = editingData.morningIn || "";
    const morningOut = editingData.morningOut || "";
    const afternoonIn = editingData.afternoonIn || "";
    const afternoonOut = editingData.afternoonOut || "";

    const mornHrs = calculateHours(morningIn, morningOut);
    const aftHrs = calculateHours(afternoonIn, afternoonOut);
    const breakTime = calculateBreak(morningOut, afternoonIn);
    const ot = Number(editingData.ot) || 0;
    const dt = Number(editingData.dt) || 0;
    const rate = Number(editingData.rate) || 0;
    const totalCost = (mornHrs + aftHrs + dt) * rate + ot;

    const updatedData: updateEquipmentTimesheetInput & { id: string } = {
      id: editingId,
      morningIn,
      morningOut,
      mornHrs,
      bt: breakTime,
      afternoonIn,
      afternoonOut,
      aftHrs,
      ot,
      dt,
      rate,
      totalPay: totalCost,
      status: editingData.status,
    };

    updateMutation.mutate(updatedData, {
      onSuccess: () => {
        setEditingId(null);
        setEditingData({});
      },
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData({});
  };

  if (isLoadingTimes || isLoadingEquipment) {
    return <p className="p-4">Loading equipment timesheets or equipment...</p>;
  }

  if (isErrorTimes) {
    return (
      <p className="p-4 text-red-600">
        Error loading equipment timesheets: {timesError?.message}
      </p>
    );
  }

  if (isErrorEquipment) {
    return (
      <p className="p-4 text-red-600">
        Error loading equipment: {equipmentError?.message}
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
          {equipmentTimesheets?.map((row, idx) => {
            const isEditing = editingId === row.id;
            const equipmentName = Array.isArray(equipment)
              ? equipment.find((e) => e.id === row.equipmentId)?.item ||
                row.equipmentId
              : row.equipmentId;

            return (
              <tr key={row.id} className="bg-white even:bg-gray-100">
                <td className="px-4 py-2 border">{idx + 1}</td>
                <td className="px-4 py-2 border">
                  {isEditing ? (
                    <select
                      name="equipmentId"
                      value={editingData.equipmentId || ""}
                      onChange={handleEditChange}
                      className="w-full border px-2 py-1"
                    >
                      <option value="">Select equipment</option>
                      {(Array.isArray(equipment) ? equipment : []).map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.item}
                        </option>
                      ))}
                    </select>
                  ) : (
                    equipmentName
                  )}
                </td>
                <td className="px-4 py-2 border">
                  {isEditing ? (
                    <input
                      type="date"
                      name="date"
                      value={
                        editingData.date
                          ? new Date(editingData.date)
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

                {/* Morning In */}
                <td className="px-4 py-2 border">
                  {isEditing ? (
                    <input
                      type="time"
                      name="morningIn"
                      value={editingData.morningIn || ""}
                      onChange={handleEditChange}
                      className="w-full border px-2 py-1"
                    />
                  ) : (
                    row.morningIn
                  )}
                </td>

                {/* Morning Out */}
                <td className="px-4 py-2 border">
                  {isEditing ? (
                    <input
                      type="time"
                      name="morningOut"
                      value={editingData.morningOut || ""}
                      onChange={handleEditChange}
                      className="w-full border px-2 py-1"
                    />
                  ) : (
                    row.morningOut
                  )}
                </td>

                {/* Morning Hrs (calculated) */}
                <td className="px-4 py-2 border">
                  {isEditing
                    ? editingData.morningIn && editingData.morningOut
                      ? calculateHours(
                          editingData.morningIn!,
                          editingData.morningOut!
                        ).toFixed(2)
                      : "0.00"
                    : row.mornHrs.toFixed(2)}
                </td>

                {/* Break Time (calculated) */}
                <td className="px-4 py-2 border">
                  {isEditing
                    ? editingData.morningOut && editingData.afternoonIn
                      ? calculateBreak(
                          editingData.morningOut!,
                          editingData.afternoonIn!
                        ).toFixed(2)
                      : "0.00"
                    : row.bt.toFixed(2)}
                </td>

                {/* Afternoon In */}
                <td className="px-4 py-2 border">
                  {isEditing ? (
                    <input
                      type="time"
                      name="afternoonIn"
                      value={editingData.afternoonIn || ""}
                      onChange={handleEditChange}
                      className="w-full border px-2 py-1"
                    />
                  ) : (
                    row.afternoonIn
                  )}
                </td>

                {/* Afternoon Out */}
                <td className="px-4 py-2 border">
                  {isEditing ? (
                    <input
                      type="time"
                      name="afternoonOut"
                      value={editingData.afternoonOut || ""}
                      onChange={handleEditChange}
                      className="w-full border px-2 py-1"
                    />
                  ) : (
                    row.afternoonOut
                  )}
                </td>

                {/* Afternoon Hrs (calculated) */}
                <td className="px-4 py-2 border">
                  {isEditing
                    ? editingData.afternoonIn && editingData.afternoonOut
                      ? calculateHours(
                          editingData.afternoonIn!,
                          editingData.afternoonOut!
                        ).toFixed(2)
                      : "0.00"
                    : row.aftHrs.toFixed(2)}
                </td>

                {/* OT */}
                <td className="px-4 py-2 border">
                  {isEditing ? (
                    <input
                      type="number"
                      name="ot"
                      step="0.01"
                      value={editingData.ot || ""}
                      onChange={handleEditChange}
                      className="w-full border px-2 py-1"
                    />
                  ) : (
                    row.ot.toFixed(2)
                  )}
                </td>

                {/* DT */}
                <td className="px-4 py-2 border">
                  {isEditing ? (
                    <input
                      type="number"
                      name="dt"
                      step="0.01"
                      value={editingData.dt || ""}
                      onChange={handleEditChange}
                      className="w-full border px-2 py-1"
                    />
                  ) : (
                    row.dt.toFixed(2)
                  )}
                </td>

                {/* Rate */}
                <td className="px-4 py-2 border">
                  {isEditing ? (
                    <input
                      type="number"
                      name="rate"
                      step="0.01"
                      value={editingData.rate || ""}
                      onChange={handleEditChange}
                      className="w-full border px-2 py-1"
                    />
                  ) : (
                    row.rate.toFixed(2)
                  )}
                </td>

                {/* Total Cost (calculated) */}
                <td className="px-4 py-2 border">
                  {isEditing
                    ? (() => {
                        const mIn = editingData.morningIn || "";
                        const mOut = editingData.morningOut || "";
                        const aIn = editingData.afternoonIn || "";
                        const aOut = editingData.afternoonOut || "";
                        const mornH =
                          mIn && mOut ? calculateHours(mIn, mOut) : 0;
                        const aftH =
                          aIn && aOut ? calculateHours(aIn, aOut) : 0;
                        const ovrTime = Number(editingData.ot) || 0;
                        const downTime = Number(editingData.dt) || 0;
                        const rt = Number(editingData.rate) || 0;
                        return (
                          (mornH + aftH + downTime) * rt +
                          ovrTime
                        ).toFixed(2);
                      })()
                    : row.totalPay.toFixed(2)}
                </td>

                {/* Status */}
                <td className="px-4 py-2 border">
                  {isEditing ? (
                    <select
                      name="status"
                      value={editingData.status || ""}
                      onChange={handleEditChange}
                      className="w-full border px-2 py-1"
                    >
                      {Object.values(TimeSheetStatus).map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  ) : (
                    row.status
                  )}
                </td>

                {/* Action */}
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

          {/* “Add New” input row */}
          {isAdding && (
            <tr className="bg-yellow-50">
              <td className="px-4 py-2 border">
                {equipmentTimesheets ? equipmentTimesheets.length + 1 : 1}
              </td>

              {/* Equipment select */}
              <td className="px-4 py-2 border">
                <select
                  name="equipmentId"
                  value={newRow.equipmentId}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                >
                  <option value="">Select equipment</option>
                  {(Array.isArray(equipment) ? equipment : []).map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.item}
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

              {/* Morning In */}
              <td className="px-4 py-2 border">
                <input
                  type="time"
                  name="morningIn"
                  value={newRow.morningIn}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                />
              </td>

              {/* Morning Out */}
              <td className="px-4 py-2 border">
                <input
                  type="time"
                  name="morningOut"
                  value={newRow.morningOut}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                />
              </td>

              {/* Morning Hrs (calculated) */}
              <td className="px-4 py-2 border">
                {newRow.morningIn && newRow.morningOut
                  ? calculateHours(newRow.morningIn, newRow.morningOut).toFixed(
                      2
                    )
                  : "0.00"}
              </td>

              {/* Break Time (calculated) */}
              <td className="px-4 py-2 border">
                {newRow.morningOut && newRow.afternoonIn
                  ? calculateBreak(
                      newRow.morningOut,
                      newRow.afternoonIn
                    ).toFixed(2)
                  : "0.00"}
              </td>

              {/* Afternoon In */}
              <td className="px-4 py-2 border">
                <input
                  type="time"
                  name="afternoonIn"
                  value={newRow.afternoonIn}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                />
              </td>

              {/* Afternoon Out */}
              <td className="px-4 py-2 border">
                <input
                  type="time"
                  name="afternoonOut"
                  value={newRow.afternoonOut}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                />
              </td>

              {/* Afternoon Hrs (calculated) */}
              <td className="px-4 py-2 border">
                {newRow.afternoonIn && newRow.afternoonOut
                  ? calculateHours(
                      newRow.afternoonIn,
                      newRow.afternoonOut
                    ).toFixed(2)
                  : "0.00"}
              </td>

              {/* OT */}
              <td className="px-4 py-2 border">
                <input
                  type="number"
                  name="ot"
                  step="0.01"
                  value={newRow.ot}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                />
              </td>

              {/* DT */}
              <td className="px-4 py-2 border">
                <input
                  type="number"
                  name="dt"
                  step="0.01"
                  value={newRow.dt}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                />
              </td>

              {/* Rate */}
              <td className="px-4 py-2 border">
                <input
                  type="number"
                  name="rate"
                  step="0.01"
                  value={newRow.rate}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                />
              </td>

              {/* Total Cost (calculated) */}
              <td className="px-4 py-2 border">
                {(() => {
                  const mornHrs =
                    newRow.morningIn && newRow.morningOut
                      ? calculateHours(newRow.morningIn, newRow.morningOut)
                      : 0;
                  const aftHrs =
                    newRow.afternoonIn && newRow.afternoonOut
                      ? calculateHours(newRow.afternoonIn, newRow.afternoonOut)
                      : 0;
                  const ot = Number(newRow.ot) || 0;
                  const dt = Number(newRow.dt) || 0;
                  const rate = Number(newRow.rate) || 0;
                  return ((mornHrs + aftHrs + dt) * rate + ot).toFixed(2);
                })()}
              </td>

              {/* Status */}
              <td className="px-4 py-2 border">
                <select
                  name="status"
                  value={newRow.status}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                >
                  {Object.values(TimeSheetStatus).map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </td>

              {/* Submit / Cancel buttons */}
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
