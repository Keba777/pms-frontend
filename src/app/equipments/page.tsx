"use client";

import { useEquipments } from "@/hooks/useEquipments";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ChevronDown, Edit, Trash2 } from "lucide-react";

const EquipmentPage = () => {
  const { data: equipments, isLoading, error } = useEquipments();
  // const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    // TODO: open edit form/modal
    console.log("Edit equipment", id);
  };
  const handleDelete = (id: string) => {
    // TODO: confirm & delete
    console.log("Delete equipment", id);
  };

  if (isLoading) return <div>Loading equipment...</div>;
  if (error) return <div>Error loading equipment.</div>;

  const headers = [
    "#",
    "Equipment",
    "Unit",
    "Req Quantity",
    "Min Quantity",
    "Estimated Hour",
    "Rate",
    "Total",
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
          {equipments && equipments.length > 0 ? (
            equipments.map((eqp, idx) => (
              <tr key={`${eqp.activityId}-${eqp.requestId}-${idx}`}>
                <td className="px-4 py-2 border border-gray-200">{idx + 1}</td>
                <td className="px-4 py-2 border border-gray-200">{eqp.item}</td>
                <td className="px-4 py-2 border border-gray-200">{eqp.unit}</td>
                <td className="px-4 py-2 border border-gray-200">
                  {eqp.requestQuantity}
                </td>
                <td className="px-4 py-2 border border-gray-200">
                  {eqp.minQuantity}
                </td>
                <td className="px-4 py-2 border border-gray-200">
                  {eqp.estimatedHours}
                </td>
                <td className="px-4 py-2 border border-gray-200">{eqp.rate}</td>
                <td className="px-4 py-2 border border-gray-200">
                  {eqp.totalAmount}
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
                            onClick={() => handleEdit(eqp.id)}
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
                            onClick={() => handleDelete(eqp.id)}
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
                colSpan={9}
              >
                No equipment records available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EquipmentPage;
