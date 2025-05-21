import React, { useState, useEffect } from "react";
import { Material } from "@/types/material";

interface MaterialsTableProps {
  materials?: Material[];
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

const MaterialsTable: React.FC<MaterialsTableProps> = ({
  materials = [],
  selectedIds,
  onSelect,
  counts,
  onCountChange,
  minCounts,
  onMinQtyChange,
  addNew,
}) => {
  const [showNew, setShowNew] = useState(false);
  const [additionalMaterials, setAdditionalMaterials] = useState<Material[]>(
    []
  );

  const newFieldsTemplate = {
    select: false,
    item: "",
    type: "",
    unit: "",
    qty: 1,
    minQty: 0,
    rate: "",
    total: "",
    shelfNo: "",
    status: "",
  };
  const [newRow, setNewRow] =
    useState<typeof newFieldsTemplate>(newFieldsTemplate);

  const totalCost = materials.concat(additionalMaterials).reduce((sum, m) => {
    const price = parseFloat(String((m as Material).totalPrice)) || 0;
    return sum + price;
  }, 0);

  const handleNewChange = (
    field: keyof typeof newFieldsTemplate,
    value: string | number
  ) => {
    setNewRow((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const id = Date.now().toString();
    const newMaterial: Material = {
      id,
      item: newRow.item,
      type: newRow.type,
      unit: newRow.unit,
      quantity: newRow.qty,
      minQuantity: newRow.minQty,
      rate: parseFloat(newRow.rate) || 0,
      totalPrice: parseFloat(newRow.total) || 0,
      shelfNo: newRow.shelfNo,
      status:
        newRow.status === "Active" || newRow.status === "Inactive"
          ? newRow.status
          : undefined,
    };
    setAdditionalMaterials((prev) => [...prev, newMaterial]);
    setNewRow(newFieldsTemplate);
    setShowNew(false);
  };

  const allMaterials = materials.concat(additionalMaterials);

  return (
    <div>
      {addNew && (
        <div className="flex justify-end">
          <button
            className="px-5 py-2 rounded-md text-gray-100 bg-cyan-700 hover:bg-cyan-800 mb-2"
            onClick={() => setShowNew((prev) => !prev)}
          >
            {showNew ? "Cancel" : "Add New"}
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <h3 className="text-lg font-semibold mb-2">Materials</h3>
        <table className="min-w-full border-collapse border border-gray-200">
          <thead className="bg-cyan-700 text-white">
            <tr>
              <th className="border px-3 py-2">Select</th>
              <th className="border px-3 py-2">No</th>
              <th className="border px-3 py-2">Item Name</th>
              <th className="border px-3 py-2">Type</th>
              <th className="border px-3 py-2">Unit</th>
              <th className="border px-3 py-2">Qty</th>
              <th className="border px-3 py-2">Min-Qty</th>
              <th className="border px-3 py-2">Rate</th>
              <th className="border px-3 py-2">Total</th>
              <th className="border px-3 py-2">Shelf No</th>
              <th className="border px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {allMaterials.map((m, idx) => {
              const checked = selectedIds.includes(m.id);
              const currentCount = counts?.[m.id] ?? 1;
              const currentMinCount = minCounts?.[m.id] ?? m.minQuantity ?? 0;
              return (
                <tr key={m.id} className="border-b">
                  <td className="border px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => onSelect(m.id, e.target.checked)}
                    />
                  </td>
                  <td className="border px-3 py-2 text-center">{idx + 1}</td>
                  <td className="border px-3 py-2 text-center">{m.item}</td>
                  <td className="border px-3 py-2 text-center">{m.type}</td>
                  <td className="border px-3 py-2 text-center">{m.unit}</td>
                  <td className="border px-3 py-2 text-center">
                    {onCountChange ? (
                      <CountInput
                        id={m.id}
                        count={currentCount}
                        minValue={1}
                        onCountChange={onCountChange}
                      />
                    ) : (
                      m.quantity ?? 0
                    )}
                  </td>
                  <td className="border px-3 py-2 text-center">
                    {onMinQtyChange ? (
                      <CountInput
                        id={m.id}
                        count={currentMinCount}
                        minValue={0}
                        onCountChange={onMinQtyChange}
                      />
                    ) : (
                      m.minQuantity ?? 0
                    )}
                  </td>
                  <td className="border px-3 py-2 text-center">
                    {m.rate ?? "-"}
                  </td>
                  <td className="border px-3 py-2 text-center">
                    {m.totalPrice}
                  </td>
                  <td className="border px-3 py-2 text-center">{m.shelfNo}</td>
                  <td className="border px-3 py-2 text-center">{m.status}</td>
                </tr>
              );
            })}
            {showNew && (
              <>
                <tr className="bg-gray-50">
                  <td className="border px-3 py-2 text-center">
                    <input type="checkbox" disabled checked={newRow.select} />
                  </td>
                  <td className="border px-3 py-2 text-center">
                    {allMaterials.length + 1}
                  </td>
                  <td className="border px-3 py-2 text-center">
                    <input
                      type="text"
                      className="w-full border rounded px-1"
                      value={newRow.item}
                      onChange={(e) => handleNewChange("item", e.target.value)}
                    />
                  </td>
                  <td className="border px-3 py-2 text-center">
                    <input
                      type="text"
                      className="w-full border rounded px-1"
                      value={newRow.type}
                      onChange={(e) => handleNewChange("type", e.target.value)}
                    />
                  </td>
                  <td className="border px-3 py-2 text-center">
                    <input
                      type="text"
                      className="w-full border rounded px-1"
                      value={newRow.unit}
                      onChange={(e) => handleNewChange("unit", e.target.value)}
                    />
                  </td>
                  <td className="border px-3 py-2 text-center">
                    <input
                      type="number"
                      className="appearance-none w-16 text-center border rounded"
                      value={newRow.qty}
                      onChange={(e) =>
                        handleNewChange("qty", parseInt(e.target.value) || 0)
                      }
                    />
                  </td>
                  <td className="border px-3 py-2 text-center">
                    <input
                      type="number"
                      className="appearance-none w-16 text-center border rounded"
                      value={newRow.minQty}
                      onChange={(e) =>
                        handleNewChange("minQty", parseInt(e.target.value) || 0)
                      }
                    />
                  </td>
                  <td className="border px-3 py-2 text-center">
                    <input
                      type="text"
                      className="w-full border rounded px-1"
                      value={newRow.rate}
                      onChange={(e) => handleNewChange("rate", e.target.value)}
                    />
                  </td>
                  <td className="border px-3 py-2 text-center">
                    <input
                      type="text"
                      className="w-full border rounded px-1"
                      value={newRow.total}
                      onChange={(e) => handleNewChange("total", e.target.value)}
                    />
                  </td>
                  <td className="border px-3 py-2 text-center">
                    <input
                      type="text"
                      className="w-full border rounded px-1"
                      value={newRow.shelfNo}
                      onChange={(e) =>
                        handleNewChange("shelfNo", e.target.value)
                      }
                    />
                  </td>
                  <td className="border px-3 py-2 text-center">
                    <input
                      type="text"
                      className="w-full border rounded px-1"
                      value={newRow.status}
                      onChange={(e) =>
                        handleNewChange("status", e.target.value)
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td colSpan={11} className="border px-3 py-2 text-right">
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      onClick={handleSave}
                    >
                      Save
                    </button>
                  </td>
                </tr>
              </>
            )}
            {allMaterials.length === 0 && !showNew && (
              <tr>
                <td
                  colSpan={11}
                  className="border px-3 py-4 text-center text-gray-500"
                >
                  No materials found.
                </td>
              </tr>
            )}
          </tbody>
          {allMaterials.length > 0 && (
            <tfoot className="bg-gray-100 font-semibold">
              <tr>
                <td colSpan={8} className="border px-3 py-2 text-right">
                  Total Cost
                </td>
                <td className="border px-3 py-2 text-center">
                  {totalCost.toFixed(2)}
                </td>
                <td colSpan={2} className="border px-3 py-2"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default MaterialsTable;
