// PayrollsTable.tsx
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Link from "next/link";
import { Payroll, UpdatePayrollInput } from "@/types/financial";
import { useRouter } from "next/navigation";
import { useDeletePayroll, useUpdatePayroll } from "@/hooks/useFinancials";
import EditPayrollForm from "../forms/finance/EditPayrollForm";
import ConfirmModal from "../common/ui/ConfirmModal";

const statusBadgeClasses: Record<Payroll["status"], string> = {
  "Pending": "bg-yellow-100 text-yellow-800",
  "Paid": "bg-green-100 text-green-800",
};

interface PayrollsTableProps {
  filteredPayrolls: Payroll[];
  selectedColumns: string[];
}

const PayrollsTable: React.FC<PayrollsTableProps> = ({
  filteredPayrolls,
  selectedColumns,
}) => {
  const router = useRouter();
  const { mutate: deletePayroll } = useDeletePayroll();
  const { mutate: updatePayroll } = useUpdatePayroll();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPayrollId, setSelectedPayrollId] = useState<string | null>(null);

  // Edit modal
  const [showEditForm, setShowEditForm] = useState(false);
  const [payrollToEdit, setPayrollToEdit] = useState<UpdatePayrollInput | null>(null);

  const handleDeleteClick = (payrollId: string) => {
    setSelectedPayrollId(payrollId);
    setIsDeleteModalOpen(true);
  };
  const handleDeleteConfirm = () => {
    if (selectedPayrollId) deletePayroll(selectedPayrollId);
    setIsDeleteModalOpen(false);
  };

  const handleView = (id: string) => {
    router.push(`/payrolls/${id}`);
  };

  const handleEditSubmit = (data: UpdatePayrollInput) => {
    updatePayroll(data);
    setShowEditForm(false);
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-[1400px] divide-y divide-gray-200 border border-gray-200 table-auto">
        <thead className="bg-cyan-700">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
              #
            </th>
            {selectedColumns.includes("user") && (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
                User
              </th>
            )}
            {selectedColumns.includes("salary") && (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
                Salary
              </th>
            )}
            {selectedColumns.includes("month") && (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
                Month
              </th>
            )}
            {selectedColumns.includes("status") && (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
                Status
              </th>
            )}
            {selectedColumns.includes("action") && (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
                Action
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredPayrolls.map((payroll, idx) => (
            <tr key={payroll.id}>
              <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                {idx + 1}
              </td>
              {selectedColumns.includes("user") && (
                <td className="px-4 py-2 text-bs-primary border border-gray-200 whitespace-nowrap">
                  <Link href={`/payrolls/${payroll.id}`} className="hover:underline">
                    {payroll.user?.first_name || "-"}
                  </Link>
                </td>
              )}
              {selectedColumns.includes("salary") && (
                <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                  {payroll.salary}
                </td>
              )}
              {selectedColumns.includes("month") && (
                <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                  {payroll.month}
                </td>
              )}
              {selectedColumns.includes("status") && (
                <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-medium ${
                      statusBadgeClasses[payroll.status]
                    }`}
                  >
                    {payroll.status}
                  </span>
                </td>
              )}
              {selectedColumns.includes("action") && (
                <td className="px-4 py-2 border border-gray-200">
                  <Menu as="div" className="relative inline-block text-left">
                    <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800 w-full">
                      Action <ChevronDown className="w-4 h-4" />
                    </MenuButton>
                    <MenuItems className="absolute left-0 mt-2 w-40 bg-white border divide-y divide-gray-100 rounded-md shadow-lg z-50">
                      <MenuItem>
                        {({ active }) => (
                          <button
                            onClick={() => handleView(payroll.id)}
                            className={`w-full text-left px-3 py-2 text-sm ${
                              active ? "bg-gray-100" : ""
                            }`}
                          >
                            View
                          </button>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ active }) => (
                          <button
                            onClick={() => {
                              setPayrollToEdit(payroll);
                              setShowEditForm(true);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm ${
                              active ? "bg-gray-100" : ""
                            }`}
                          >
                            Edit
                          </button>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ active }) => (
                          <button
                            onClick={() => handleDeleteClick(payroll.id)}
                            className={`w-full text-left px-3 py-2 text-sm text-red-600 ${
                              active ? "bg-gray-100" : ""
                            }`}
                          >
                            Delete
                          </button>
                        )}
                      </MenuItem>
                    </MenuItems>
                  </Menu>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {isDeleteModalOpen && (
        <ConfirmModal
          isVisible={isDeleteModalOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this payroll?"
          showInput={false}
          confirmText="DELETE"
          confirmButtonText="Delete"
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* Edit Payroll Modal */}
      {showEditForm && payrollToEdit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EditPayrollForm
              onClose={() => setShowEditForm(false)}
              onSubmit={handleEditSubmit}
              payroll={payrollToEdit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollsTable;
