// PaymentsTable.tsx
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Link from "next/link";
import { Payment, UpdatePaymentInput } from "@/types/financial";
import { useRouter } from "next/navigation";
import { useDeletePayment, useUpdatePayment } from "@/hooks/useFinancials";
import EditPaymentForm from "../forms/finance/EditPaymentForm";
import ConfirmModal from "../common/ui/ConfirmModal";
import { formatDate as format } from "@/utils/dateUtils";

interface PaymentsTableProps {
  filteredPayments: Payment[];
  selectedColumns: string[];
}

const PaymentsTable: React.FC<PaymentsTableProps> = ({
  filteredPayments,
  selectedColumns,
}) => {

  const router = useRouter();
  const { mutate: deletePayment } = useDeletePayment();
  const { mutate: updatePayment } = useUpdatePayment();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  // Edit modal
  const [showEditForm, setShowEditForm] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState<UpdatePaymentInput | null>(null);

  const handleDeleteClick = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setIsDeleteModalOpen(true);
  };
  const handleDeleteConfirm = () => {
    if (selectedPaymentId) deletePayment(selectedPaymentId);
    setIsDeleteModalOpen(false);
  };

  const handleView = (id: string) => {
    router.push(`/payments/${id}`);
  };

  const handleEditSubmit = (data: UpdatePaymentInput) => {
    updatePayment(data);
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
            {selectedColumns.includes("project") && (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
                Project
              </th>
            )}
            {selectedColumns.includes("amount") && (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
                Amount
              </th>
            )}
            {selectedColumns.includes("date") && (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
                Date
              </th>
            )}
            {selectedColumns.includes("method") && (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
                Method
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
          {filteredPayments.map((payment, idx) => (
            <tr key={payment.id}>
              <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                {idx + 1}
              </td>
              {selectedColumns.includes("project") && (
                <td className="px-4 py-2 text-bs-primary border border-gray-200 whitespace-nowrap">
                  <Link href={`/payments/${payment.id}`} className="hover:underline">
                    {payment.project?.title || "-"}
                  </Link>
                </td>
              )}
              {selectedColumns.includes("amount") && (
                <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                  {payment.amount}
                </td>
              )}
              {selectedColumns.includes("date") && (
                <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                  {payment.date
                    ? format(payment.date)
                    : "-"}
                </td>
              )}
              {selectedColumns.includes("method") && (
                <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                  {payment.method}
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
                            onClick={() => handleView(payment.id)}
                            className={`w-full text-left px-3 py-2 text-sm ${active ? "bg-gray-100" : ""
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
                              setPaymentToEdit(payment);
                              setShowEditForm(true);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm ${active ? "bg-gray-100" : ""
                              }`}
                          >
                            Edit
                          </button>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ active }) => (
                          <button
                            onClick={() => handleDeleteClick(payment.id)}
                            className={`w-full text-left px-3 py-2 text-sm text-red-600 ${active ? "bg-gray-100" : ""
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
          message="Are you sure you want to delete this payment?"
          showInput={false}
          confirmText="DELETE"
          confirmButtonText="Delete"
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* Edit Payment Modal */}
      {showEditForm && paymentToEdit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EditPaymentForm
              onClose={() => setShowEditForm(false)}
              onSubmit={handleEditSubmit}
              payment={paymentToEdit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsTable;
