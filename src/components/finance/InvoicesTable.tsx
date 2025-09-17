// InvoicesTable.tsx
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Link from "next/link";
import { Invoice, UpdateInvoiceInput } from "@/types/financial";
import { useRouter } from "next/navigation";
import { useDeleteInvoice, useUpdateInvoice } from "@/hooks/useFinancials";
import EditInvoiceForm from "../forms/finance/EditInvoiceForm";
import ConfirmModal from "../common/ui/ConfirmModal";

const statusBadgeClasses: Record<Invoice["status"], string> = {
  "Pending": "bg-yellow-100 text-yellow-800",
  "Paid": "bg-green-100 text-green-800",
  "Overdue": "bg-red-100 text-red-800",
};

interface InvoicesTableProps {
  filteredInvoices: Invoice[];
  selectedColumns: string[];
}

const InvoicesTable: React.FC<InvoicesTableProps> = ({
  filteredInvoices,
  selectedColumns,
}) => {
  const router = useRouter();
  const { mutate: deleteInvoice } = useDeleteInvoice();
  const { mutate: updateInvoice } = useUpdateInvoice();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  // Edit modal
  const [showEditForm, setShowEditForm] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState<UpdateInvoiceInput | null>(null);

  const handleDeleteClick = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setIsDeleteModalOpen(true);
  };
  const handleDeleteConfirm = () => {
    if (selectedInvoiceId) deleteInvoice(selectedInvoiceId);
    setIsDeleteModalOpen(false);
  };

  const handleView = (id: string) => {
    router.push(`/invoices/${id}`);
  };

  const handleEditSubmit = (data: UpdateInvoiceInput) => {
    updateInvoice(data);
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
            {selectedColumns.includes("dueDate") && (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
                Due Date
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
          {filteredInvoices.map((invoice, idx) => (
            <tr key={invoice.id}>
              <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                {idx + 1}
              </td>
              {selectedColumns.includes("project") && (
                <td className="px-4 py-2 text-bs-primary border border-gray-200 whitespace-nowrap">
                  <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                    {invoice.project?.title || "-"}
                  </Link>
                </td>
              )}
              {selectedColumns.includes("amount") && (
                <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                  {invoice.amount}
                </td>
              )}
              {selectedColumns.includes("dueDate") && (
                <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                  {invoice.dueDate
                    ? new Date(invoice.dueDate).toLocaleDateString()
                    : "-"}
                </td>
              )}
              {selectedColumns.includes("status") && (
                <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-medium ${
                      statusBadgeClasses[invoice.status]
                    }`}
                  >
                    {invoice.status}
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
                            onClick={() => handleView(invoice.id)}
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
                              setInvoiceToEdit(invoice);
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
                            onClick={() => handleDeleteClick(invoice.id)}
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
          message="Are you sure you want to delete this invoice?"
          showInput={false}
          confirmText="DELETE"
          confirmButtonText="Delete"
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* Edit Invoice Modal */}
      {showEditForm && invoiceToEdit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EditInvoiceForm
              onClose={() => setShowEditForm(false)}
              onSubmit={handleEditSubmit}
              invoice={invoiceToEdit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesTable;