// File: components/resources/EquipmentTable.tsx
import React, { useState, useEffect } from "react";
import { Equipment } from "@/types/equipment";

interface EquipmentTableProps {
  equipment?: Equipment[];
  selectedIds: string[];
  onSelect: (id: string, checked: boolean) => void;
  counts?: Record<string, number>;
  onCountChange?: (id: string, count: number) => void;
  minCounts?: Record<string, number>;
  onMinQtyChange?: (id: string, count: number) => void;
  addNew?: boolean;
}

interface CountInputProps {
  id: string;
  count: number;
  minValue?: number;
  onCountChange: (id: string, newCount: number) => void;
}

const CountInput: React.FC<CountInputProps> = ({
  id,
  count,
  minValue = 1,
  onCountChange,
}) => {
  const [raw, setRaw] = useState<string>(count.toString());

  useEffect(() => {
    setRaw(count.toString());
  }, [count]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v === "") {
      setRaw("");
      return;
    }
    if (!/^\d+$/.test(v)) return;
    setRaw(v);
    const num = parseInt(v, 10);
    onCountChange(id, Math.max(minValue, num));
  };

  const handleBlur = () => {
    if (raw === "") {
      setRaw(minValue.toString());
      onCountChange(id, minValue);
    }
  };

  return (
    <input
      type="number"
      value={raw}
      onChange={handleChange}
      onBlur={handleBlur}
      style={{
        WebkitAppearance: "none",
        MozAppearance: "textfield",
        margin: 0,
      }}
      className="appearance-none w-16 text-center border rounded"
    />
  );
};

const EquipmentTable: React.FC<EquipmentTableProps> = ({
  equipment = [],
  selectedIds,
  onSelect,
  counts,
  onCountChange,
  minCounts,
  onMinQtyChange,
  addNew,
}) => {
  const [showNew, setShowNew] = useState(false);
  const newFieldsTemplate = {
    select: false,
    item: "",
    type: "",
    unit: "",
    qty: 1,
    minQty: 0,
    rate: "",
    ot: "",
    totalRate: "",
  };
  const [newRow, setNewRow] =
    useState<typeof newFieldsTemplate>(newFieldsTemplate);

  const totalSum = equipment.reduce(
    (sum, e) => sum + (parseFloat(String(e.totalAmount)) || 0),
    0
  );

  const handleNewChange = (
    field: keyof typeof newFieldsTemplate,
    value: string | number
  ) => {
    setNewRow((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      {addNew && (
        <div className="flex justify-end mb-2">
          <button
            className="px-5 py-2 rounded-md text-gray-100 bg-cyan-700 hover:bg-cyan-800"
            onClick={() => setShowNew((prev) => !prev)}
          >
            {showNew ? "Cancel" : "Add New"}
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <h3 className="text-lg font-semibold mb-2 text-center">Equipment</h3>
        <table className="min-w-full border-collapse border border-gray-200">
          <thead className="bg-cyan-700 text-white text-center">
            <tr>
              <th className="border px-3 py-2">Select</th>
              <th className="border px-3 py-2">No</th>
              <th className="border px-3 py-2">Equipment Name</th>
              <th className="border px-3 py-2">Type</th>
              <th className="border px-3 py-2">Unit</th>
              <th className="border px-3 py-2">Qty</th>
              <th className="border px-3 py-2">Min-Qty</th>
              <th className="border px-3 py-2">Rate</th>
              <th className="border px-3 py-2">OT</th>
              <th className="border px-3 py-2">Total Rate</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((e, idx) => {
              const checked = selectedIds.includes(e.id);
              const currentCount = counts?.[e.id] ?? 1;
              const currentMinCount = minCounts?.[e.id] ?? e.minQuantity ?? 0;
              return (
                <tr key={e.id} className="border-b text-center">
                  <td className="border px-3 py-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(ev) => onSelect(e.id, ev.target.checked)}
                    />
                  </td>
                  <td className="border px-3 py-2">{idx + 1}</td>
                  <td className="border px-3 py-2">{e.item}</td>
                  <td className="border px-3 py-2">{e.type}</td>
                  <td className="border px-3 py-2">{e.unit}</td>
                  <td className="border px-3 py-2">
                    {onCountChange ? (
                      <CountInput
                        id={e.id}
                        count={currentCount}
                        minValue={1}
                        onCountChange={onCountChange}
                      />
                    ) : (
                      e.quantity ?? 0
                    )}
                  </td>
                  <td className="border px-3 py-2">
                    {onMinQtyChange ? (
                      <CountInput
                        id={e.id}
                        count={currentMinCount}
                        minValue={0}
                        onCountChange={onMinQtyChange}
                      />
                    ) : (
                      e.minQuantity ?? 0
                    )}
                  </td>
                  <td className="border px-3 py-2">{e.rate ?? "-"}</td>
                  <td className="border px-3 py-2">{e.overTime}</td>
                  <td className="border px-3 py-2">{e.totalAmount}</td>
                </tr>
              );
            })}
            {showNew && (
              <tr className="bg-gray-50 text-center">
                <td className="border px-3 py-2">
                  <input type="checkbox" disabled checked={newRow.select} />
                </td>
                <td className="border px-3 py-2">{equipment.length + 1}</td>
                <td className="border px-3 py-2">
                  <input
                    type="text"
                    className="w-full border rounded px-1"
                    value={newRow.item}
                    onChange={(e) => handleNewChange("item", e.target.value)}
                  />
                </td>
                <td className="border px-3 py-2">
                  <input
                    type="text"
                    className="w-full border rounded px-1"
                    value={newRow.type}
                    onChange={(e) => handleNewChange("type", e.target.value)}
                  />
                </td>
                <td className="border px-3 py-2">
                  <input
                    type="text"
                    className="w-full border rounded px-1"
                    value={newRow.unit}
                    onChange={(e) => handleNewChange("unit", e.target.value)}
                  />
                </td>
                <td className="border px-3 py-2">
                  <CountInput
                    id="newQty"
                    count={newRow.qty}
                    minValue={1}
                    onCountChange={(_, val) => handleNewChange("qty", val)}
                  />
                </td>
                <td className="border px-3 py-2">
                  <CountInput
                    id="newMinQty"
                    count={newRow.minQty}
                    minValue={0}
                    onCountChange={(_, val) => handleNewChange("minQty", val)}
                  />
                </td>
                <td className="border px-3 py-2">
                  <input
                    type="text"
                    className="w-full border rounded px-1"
                    value={newRow.rate}
                    onChange={(e) => handleNewChange("rate", e.target.value)}
                  />
                </td>
                <td className="border px-3 py-2">
                  <input
                    type="text"
                    className="w-full border rounded px-1"
                    value={newRow.ot}
                    onChange={(e) => handleNewChange("ot", e.target.value)}
                  />
                </td>
                <td className="border px-3 py-2">
                  <input
                    type="text"
                    className="w-full border rounded px-1"
                    value={newRow.totalRate}
                    onChange={(e) =>
                      handleNewChange("totalRate", e.target.value)
                    }
                  />
                </td>
              </tr>
            )}
            {equipment.length === 0 && !showNew && (
              <tr>
                <td
                  colSpan={10}
                  className="border px-3 py-4 text-center text-gray-500"
                >
                  No equipment found.
                </td>
              </tr>
            )}
          </tbody>
          {equipment.length > 0 && (
            <tfoot className="bg-gray-100 font-semibold">
              <tr>
                <td colSpan={9} className="border px-3 py-2 text-right">
                  Total
                </td>
                <td className="border px-3 py-2 text-center">
                  {totalSum.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default EquipmentTable;
