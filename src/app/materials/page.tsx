"use client";

import { useMaterials } from "@/hooks/useMaterials";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ChevronDown, Edit, Trash2 } from "lucide-react";

const MaterialsPage = () => {
  const { data: materials, isLoading, error } = useMaterials();

  const handleEdit = (id: string) => {
    // TODO: open edit form/modal
    console.log("Edit material", id);
  };

  const handleDelete = (id: string) => {
    // TODO: confirm & delete
    console.log("Delete material", id);
  };

  if (isLoading) return <div>Loading materials...</div>;
  if (error) return <div>Error loading materials.</div>;

  const headers = [
    "No",
    "Materials",
    "Unit",
    "Req Quantity",
    "Min Quantity",
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
          {materials && materials.length > 0 ? (
            materials.map((mat, idx) => (
              <tr key={`${mat.activityId}-${mat.requestId}-${idx}`}>
                <td className="px-4 py-2 border border-gray-200">{idx + 1}</td>
                <td className="px-4 py-2 border border-gray-200">{mat.item}</td>
                <td className="px-4 py-2 border border-gray-200">{mat.unit}</td>
                <td className="px-4 py-2 border border-gray-200">
                  {mat.requestQuantity}
                </td>
                <td className="px-4 py-2 border border-gray-200">
                  {mat.minQuantity}
                </td>
                <td className="px-4 py-2 border border-gray-200">{mat.rate}</td>
                <td className="px-4 py-2 border border-gray-200">
                  {mat.totalAmount}
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
                            onClick={() => handleEdit(mat.id)}
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
                            onClick={() => handleDelete(mat.id)}
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
                className="px-4 py-2 text-center border border-gray-200"
                colSpan={8}
              >
                No materials available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MaterialsPage;
