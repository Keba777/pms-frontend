import React, { useState, useEffect } from "react";
import { Labor } from "@/types/labor";

interface LaborTableProps {
  labor?: Labor[];
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

const LaborTable: React.FC<LaborTableProps> = ({
  labor = [],
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
    role: "",
    unit: "",
    qty: 1,
    minQty: 0,
    rate: "",
    ot: "",
    total: "",
  };
  const [newRow, setNewRow] =
    useState<typeof newFieldsTemplate>(newFieldsTemplate);

  const totalAmountSum = labor.reduce((sum, l) => {
    const info = l.laborInformations?.[0];
    const amt = parseFloat(String(info?.totalAmount)) || 0;
    return sum + amt;
  }, 0);

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
        <h3 className="text-lg font-semibold mb-2 text-center">Labor</h3>
        <table className="min-w-full border-collapse border border-gray-200">
          <thead className="bg-cyan-700 text-white text-center">
            <tr>
              <th className="border px-3 py-2">Select</th>
              <th className="border px-3 py-2">No</th>
              <th className="border px-3 py-2">Role</th>
              <th className="border px-3 py-2">Unit</th>
              <th className="border px-3 py-2">Qty</th>
              <th className="border px-3 py-2">Min-Qty</th>
              <th className="border px-3 py-2">Rate</th>
              <th className="border px-3 py-2">OT</th>
              <th className="border px-3 py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {labor.map((l, idx) => {
              const checked = selectedIds.includes(l.id);
              const currentCount = counts?.[l.id] ?? 1;
              const currentMinCount = minCounts?.[l.id] ?? l.minQuantity ?? 0;
              return (
                <tr key={l.id} className="border-b text-center">
                  <td className="border px-3 py-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(ev) => onSelect(l.id, ev.target.checked)}
                    />
                  </td>
                  <td className="border px-3 py-2">{idx + 1}</td>
                  <td className="border px-3 py-2">{l.role}</td>
                  <td className="border px-3 py-2">{l.unit}</td>
                  <td className="border px-3 py-2">
                    {onCountChange ? (
                      <CountInput
                        id={l.id}
                        count={currentCount}
                        minValue={1}
                        onCountChange={onCountChange}
                      />
                    ) : (
                      l.quantity ?? 0
                    )}
                  </td>
                  <td className="border px-3 py-2">
                    {onMinQtyChange ? (
                      <CountInput
                        id={l.id}
                        count={currentMinCount}
                        minValue={0}
                        onCountChange={onMinQtyChange}
                      />
                    ) : (
                      l.minQuantity ?? 0
                    )}
                  </td>
                  <td className="border px-3 py-2">{l.laborInformations?.[0]?.rate ?? "-"}</td>
                  <td className="border px-3 py-2">{l.laborInformations?.[0]?.overtimeRate}</td>
                  <td className="border px-3 py-2">{l.laborInformations?.[0]?.totalAmount}</td>
                </tr>
              );
            })}
            {showNew && (
              <tr className="bg-gray-50 text-center">
                <td className="border px-3 py-2">
                  <input type="checkbox" disabled checked={newRow.select} />
                </td>
                <td className="border px-3 py-2">{labor.length + 1}</td>
                <td className="border px-3 py-2">
                  <input
                    type="text"
                    className="w-full border rounded px-1"
                    value={newRow.role}
                    onChange={(e) => handleNewChange("role", e.target.value)}
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
                    value={newRow.total}
                    onChange={(e) => handleNewChange("total", e.target.value)}
                  />
                </td>
              </tr>
            )}
            {labor.length === 0 && !showNew && (
              <tr>
                <td
                  colSpan={9}
                  className="border px-3 py-4 text-center text-gray-500"
                >
                  No labor records found.
                </td>
              </tr>
            )}
          </tbody>
          {labor.length > 0 && (
            <tfoot className="bg-gray-100 font-semibold">
              <tr>
                <td colSpan={8} className="border px-3 py-2 text-right">
                  Total
                </td>
                <td className="border px-3 py-2 text-center">
                  {totalAmountSum.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default LaborTable;
