"use client";

import { useLabors } from "@/hooks/useLabors";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ChevronDown, Edit, Trash2 } from "lucide-react";

const LaborPage = () => {
  const { data: labors, isLoading, error } = useLabors();

  const handleEdit = (id: string) => {
    console.log("Edit labor", id);
    // TODO: Implement edit logic/modal
  };

  const handleDelete = (id: string) => {
    console.log("Delete labor", id);
    // TODO: Implement confirm & delete logic
  };

  if (isLoading) return <div>Loading labors...</div>;
  if (error) return <div>Error loading labors.</div>;

  const headers = [
    "No",
    "Labor",
    "Unit",
    "Req Quantity",
    "Min Quantity",
    "Estimated Hour",
    "Rate",
    "Total Amount",
    "Actions",
  ];

  return (
    <div className="p-4 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {labors && labors.length > 0 ? (
            labors.map((lab, idx) => (
              <tr key={`${lab.activity_id}-${lab.requestId}-${idx}`}>
                <td className="px-4 py-2 border border-gray-200">{idx + 1}</td>
                <td className="px-4 py-2 border border-gray-200">{lab.role}</td>
                <td className="px-4 py-2 border border-gray-200">{lab.unit}</td>
                <td className="px-4 py-2 border border-gray-200">
                  {lab.requestQuantity}
                </td>
                <td className="px-4 py-2 border border-gray-200">
                  {lab.minQuantity}
                </td>
                <td className="px-4 py-2 border border-gray-200">
                  {lab.estimatedHours}
                </td>
                <td className="px-4 py-2 border border-gray-200">{lab.rate}</td>
                <td className="px-4 py-2 border border-gray-200">
                  {lab.totalAmount}
                </td>
                <td className="px-4 py-2 border border-gray-200">
                  <Menu as="div" className="relative inline-block text-left">
                    <MenuButton className="inline-flex justify-center items-center px-3 py-1 bg-cyan-700 text-white text-sm rounded hover:bg-cyan-800">
                      Actions <ChevronDown className="ml-1 w-4 h-4" />
                    </MenuButton>
                    <MenuItems className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-10">
                      <MenuItem>
                        {({ active }) => (
                          <button
                            onClick={() => handleEdit(lab.id)}
                            className={`flex items-center w-full px-4 py-2 text-sm ${
                              active ? "bg-gray-100" : ""
                            }`}
                          >
                            <Edit size={16} className="mr-2" />
                            Edit
                          </button>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ active }) => (
                          <button
                            onClick={() => handleDelete(lab.id)}
                            className={`flex items-center w-full px-4 py-2 text-sm text-red-600 ${
                              active ? "bg-gray-100" : ""
                            }`}
                          >
                            <Trash2 size={16} className="mr-2" />
                            Delete
                          </button>
                        )}
                      </MenuItem>
                    </MenuItems>
                  </Menu>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={9}
                className="px-4 py-2 text-center border border-gray-200"
              >
                No labor records available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LaborPage;
