import React, { useState, ChangeEvent } from "react";
import {
  useLaborTimesheets,
  useCreateLaborTimesheet,
  useUpdateLaborTimesheet,
} from "@/hooks/useTimesheets";
import { useUsers } from "@/hooks/useUsers";
import {
  TimeSheetStatus,
  createLaborTimesheetInput,
  updateLaborTimesheetInput,
  LaborTimesheet,
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

// interface LaborSheetProps {
//   users: User[]
// }

export const LaborSheet: React.FC = () => {
  const {
    data: laborTimesheets,
    isLoading: isLoadingTimes,
    isError: isErrorTimes,
    error: timesError,
  } = useLaborTimesheets();

  const { data: users } = useUsers();

  const createMutation = useCreateLaborTimesheet();
  const updateMutation = useUpdateLaborTimesheet();

  const [isAdding, setIsAdding] = useState(false);

  const [newRow, setNewRow] = useState<{
    userId: string;
    date: string;
    morningIn: string;
    morningOut: string;
    afternoonIn: string;
    afternoonOut: string;
    ot: string;
    rate: string;
    status: TimeSheetStatus;
    utilization_factor: string;
    totalTime: string;
    startingDate: string;
    dueDate: string;
    shiftingDate: string;
  }>({
    userId: "",
    date: "",
    morningIn: "",
    morningOut: "",
    afternoonIn: "",
    afternoonOut: "",
    ot: "",
    rate: "",
    status: TimeSheetStatus.Pending,
    utilization_factor: "",
    totalTime: "",
    startingDate: "",
    dueDate: "",
    shiftingDate: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<LaborTimesheet>>({});

  const columns = [
    "#",
    "User",
    "Date",
    "Morning In",
    "Morning Out",
    "Morning Hrs",
    "Break Time",
    "Afternoon In",
    "Afternoon Out",
    "Afternoon Hrs",
    "OT",
    "Rate",
    "Total Pay",
    "Status",
  ];

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

  const handleChange = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewRow((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!newRow.userId || !newRow.date) return;

    const mornHrs = calculateHours(newRow.morningIn, newRow.morningOut);
    const aftHrs = calculateHours(newRow.afternoonIn, newRow.afternoonOut);
    const breakTime = calculateBreak(newRow.morningOut, newRow.afternoonIn);
    const ot = Number(newRow.ot) || 0;
    const rate = Number(newRow.rate) || 0;
    const totalPay = (mornHrs + aftHrs) * rate + ot;

    const input: createLaborTimesheetInput = {
      userId: newRow.userId,
      date: new Date(newRow.date),
      morningIn: newRow.morningIn,
      morningOut: newRow.morningOut,
      mornHrs,
      bt: breakTime,
      afternoonIn: newRow.afternoonIn,
      afternoonOut: newRow.afternoonOut,
      aftHrs,
      ot,
      dt: 0,
      rate,
      totalPay,
      status: newRow.status,
    };

    createMutation.mutate(input, {
      onSuccess: () => {
        setIsAdding(false);
        setNewRow({
          userId: "",
          date: "",
          morningIn: "",
          morningOut: "",
          afternoonIn: "",
          afternoonOut: "",
          ot: "",
          rate: "",
          status: TimeSheetStatus.Pending,
          utilization_factor: "",
          totalTime: "",
          startingDate: "",
          dueDate: "",
          shiftingDate: "",
        });
      },
    });
  };

  const handleEdit = (row: LaborTimesheet) => {
    setEditingId(row.id);
    setEditingData(row);
  };

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
    const rate = Number(editingData.rate) || 0;
    const totalPay = (mornHrs + aftHrs) * rate + ot;

    const updatedData: updateLaborTimesheetInput & { id: string } = {
      id: editingId,
      morningIn,
      morningOut,
      mornHrs,
      bt: breakTime,
      afternoonIn,
      afternoonOut,
      aftHrs,
      ot,
      dt: 0,
      rate,
      totalPay,
      status: editingData.status,
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

  if (isLoadingTimes) {
    return <p className="p-4">Loading labor timesheets or users...</p>;
  }

  if (isErrorTimes) {
    return (
      <p className="p-4 text-red-600">
        Error loading labor timesheets: {timesError?.message}
      </p>
    );
  }

  return (
    <div>
      <Button
        onClick={() => setIsAdding(true)}
        className="mb-2 bg-cyan-700 text-white"
        disabled={isAdding}
      >
        Add New
      </Button>

      <div className="overflow-x-auto">
        <Table className="min-w-full bg-gray-100">
          <TableHeader>
            <TableRow className="bg-cyan-700 hover:bg-cyan-700 ">
              {columns.map((col) => (
                <TableHead key={col} className="text-white">
                  {col}
                </TableHead>
              ))}
              <TableHead className="text-white">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {laborTimesheets?.map((row, idx) => {
              const isEditing = editingId === row.id;
              const user = users?.find((u) => u.id === row.userId);
              const userName = user
                ? `${user.first_name} ${user.last_name}`
                : row.userId;

              return (
                <TableRow key={row.id} className="even:bg-gray-100">
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{userName}</TableCell>
                  <TableCell>
                    {new Date(row.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="time"
                        name="morningIn"
                        value={editingData.morningIn || ""}
                        onChange={handleEditChange}
                      />
                    ) : (
                      row.morningIn
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="time"
                        name="morningOut"
                        value={editingData.morningOut || ""}
                        onChange={handleEditChange}
                      />
                    ) : (
                      row.morningOut
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing
                      ? editingData.morningIn && editingData.morningOut
                        ? calculateHours(
                            editingData.morningIn!,
                            editingData.morningOut!
                          ).toFixed(2)
                        : "0.00"
                      : row.mornHrs.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {isEditing
                      ? editingData.morningOut && editingData.afternoonIn
                        ? calculateBreak(
                            editingData.morningOut!,
                            editingData.afternoonIn!
                          ).toFixed(2)
                        : "0.00"
                      : row.bt.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="time"
                        name="afternoonIn"
                        value={editingData.afternoonIn || ""}
                        onChange={handleEditChange}
                      />
                    ) : (
                      row.afternoonIn
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="time"
                        name="afternoonOut"
                        value={editingData.afternoonOut || ""}
                        onChange={handleEditChange}
                      />
                    ) : (
                      row.afternoonOut
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing
                      ? editingData.afternoonIn && editingData.afternoonOut
                        ? calculateHours(
                            editingData.afternoonIn!,
                            editingData.afternoonOut!
                          ).toFixed(2)
                        : "0.00"
                      : row.aftHrs.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        name="ot"
                        step="0.01"
                        value={editingData.ot || ""}
                        onChange={handleEditChange}
                        className="appearance-none  [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    ) : (
                      row.ot.toFixed(2)
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        name="rate"
                        step="0.01"
                        value={editingData.rate || ""}
                        onChange={handleEditChange}
                        className="appearance-none  [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    ) : (
                      row.rate.toFixed(2)
                    )}
                  </TableCell>
                  <TableCell>
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
                          const rt = Number(editingData.rate) || 0;
                          return ((mornH + aftH) * rt + ovrTime).toFixed(2);
                        })()
                      : row.totalPay.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Select
                        name="status"
                        value={editingData.status || ""}
                        onValueChange={(value) =>
                          handleEditChange({
                            target: { name: "status", value },
                          } as ChangeEvent<HTMLSelectElement>)
                        }
                      >
                        <SelectTrigger>
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
                  {laborTimesheets ? laborTimesheets.length + 1 : 1}
                </TableCell>
                <TableCell>
                  <Select
                    name="userId"
                    value={newRow.userId}
                    onValueChange={(value) =>
                      handleChange({
                        target: { name: "userId", value },
                      } as ChangeEvent<HTMLSelectElement>)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.first_name} {" "} {u.last_name}
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
                    type="time"
                    name="morningIn"
                    value={newRow.morningIn}
                    onChange={handleChange}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="time"
                    name="morningOut"
                    value={newRow.morningOut}
                    onChange={handleChange}
                  />
                </TableCell>
                <TableCell>
                  {newRow.morningIn && newRow.morningOut
                    ? calculateHours(
                        newRow.morningIn,
                        newRow.morningOut
                      ).toFixed(2)
                    : "0.00"}
                </TableCell>
                <TableCell>
                  {newRow.morningOut && newRow.afternoonIn
                    ? calculateBreak(
                        newRow.morningOut,
                        newRow.afternoonIn
                      ).toFixed(2)
                    : "0.00"}
                </TableCell>
                <TableCell>
                  <Input
                    type="time"
                    name="afternoonIn"
                    value={newRow.afternoonIn}
                    onChange={handleChange}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="time"
                    name="afternoonOut"
                    value={newRow.afternoonOut}
                    onChange={handleChange}
                  />
                </TableCell>
                <TableCell>
                  {newRow.afternoonIn && newRow.afternoonOut
                    ? calculateHours(
                        newRow.afternoonIn,
                        newRow.afternoonOut
                      ).toFixed(2)
                    : "0.00"}
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    name="ot"
                    step="0.01"
                    value={newRow.ot}
                    onChange={handleChange}
                    className="appearance-none  [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    name="rate"
                    step="0.01"
                    value={newRow.rate}
                    onChange={handleChange}
                    className="appearance-none  [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </TableCell>
                <TableCell>
                  {(() => {
                    const mornHrs =
                      newRow.morningIn && newRow.morningOut
                        ? calculateHours(newRow.morningIn, newRow.morningOut)
                        : 0;
                    const aftHrs =
                      newRow.afternoonIn && newRow.afternoonOut
                        ? calculateHours(
                            newRow.afternoonIn,
                            newRow.afternoonOut
                          )
                        : 0;
                    const ot = Number(newRow.ot) || 0;
                    const rate = Number(newRow.rate) || 0;
                    return ((mornHrs + aftHrs) * rate + ot).toFixed(2);
                  })()}
                </TableCell>
                <TableCell>
                  <Select
                    name="status"
                    value={newRow.status}
                    onValueChange={(value) =>
                      handleChange({
                        target: { name: "status", value },
                      } as ChangeEvent<HTMLSelectElement>)
                    }
                  >
                    <SelectTrigger>
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
                </TableCell>
                <TableCell className="space-x-2">
                  <Button
                    onClick={handleSubmit}
                    className="bg-cyan-700 text-white"
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
