// InvoicesTable.tsx
import React, { useState } from "react";
import { ChevronDown, Eye, Edit, Trash2, FileCheck } from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Link from "next/link";
import { Invoice, UpdateInvoiceInput } from "@/types/financial";
import { useRouter } from "next/navigation";
import { useDeleteInvoice, useUpdateInvoice } from "@/hooks/useFinancials";
import EditInvoiceForm from "../forms/finance/EditInvoiceForm";
import ConfirmModal from "../common/ui/ConfirmModal";
import { formatDate as format } from "@/utils/dateUtils";
import { ReusableTable, ColumnConfig } from "../common/ReusableTable";

const statusBadgeClasses: Record<string, string> = {
  "pending": "bg-amber-50 text-amber-700 border-amber-200",
  "paid": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "overdue": "bg-rose-50 text-rose-700 border-rose-200",
};

interface InvoicesTableProps {
  filteredInvoices: Invoice[];
  selectedColumns: string[];
  isLoading?: boolean;
}

const InvoicesTable: React.FC<InvoicesTableProps> = ({
  filteredInvoices,
  selectedColumns,
  isLoading = false,
}) => {
  const router = useRouter();
  const { mutate: deleteInvoice } = useDeleteInvoice();
  const { mutate: updateInvoice } = useUpdateInvoice();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const columns: ColumnConfig<Invoice>[] = [
    {
      key: "index",
      label: "#",
      render: (_, idx) => idx + 1,
      isDefault: true,
      className: "w-12 text-center"
    },
    {
      key: "project",
      label: "Project",
      render: (invoice) => (
        <Link href={`/invoices/${invoice.id}`} className="font-semibold text-primary hover:underline">
          {invoice.project?.title || "-"}
        </Link>
      ),
      isDefault: true
    },
    {
      key: "gross_amount",
      label: "Gross",
      render: (invoice) => <span className="font-mono text-gray-500">{(invoice.gross_amount || 0).toLocaleString()}</span>,
      isDefault: true
    },
    {
      key: "taxes",
      label: "Taxes/Ded.",
      render: (invoice) => (
        <div className="text-[10px] space-y-0.5 whitespace-nowrap">
          {invoice.vat_amount > 0 && <div className="text-blue-600">VAT: {invoice.vat_amount.toLocaleString()}</div>}
          {invoice.withholding_amount > 0 && <div className="text-orange-600">WH: {invoice.withholding_amount.toLocaleString()}</div>}
          {invoice.retention_amount > 0 && <div className="text-purple-600">Ret: {invoice.retention_amount.toLocaleString()}</div>}
        </div>
      ),
      isDefault: true
    },
    {
      key: "net_amount",
      label: "Net Pay",
      render: (invoice) => (
        <span className="font-mono font-bold text-primary">
          {(invoice.net_amount || invoice.amount).toLocaleString()} <small>ETB</small>
        </span>
      ),
      isDefault: true
    },
    {
      key: "due_date",
      label: "Due Date",
      render: (invoice) => format(invoice.due_date),
      isDefault: true
    },
    {
      key: "status",
      label: "Status",
      render: (invoice) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${statusBadgeClasses[invoice.status] || "bg-gray-50 text-gray-700 border-gray-200"
            }`}
        >
          {invoice.status}
        </span>
      ),
      isDefault: true
    },
    {
      key: "action",
      label: "Actions",
      render: (invoice) => (
        <Menu as="div" className="relative inline-block text-left">
          <MenuButton className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
            Actions <ChevronDown className="w-4 h-4" />
          </MenuButton>
          <MenuItems className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 divide-y divide-gray-50 rounded-xl shadow-xl z-50 overflow-hidden">
            <MenuItem>
              {({ active }) => (
                <button
                  onClick={() => handleView(invoice.id)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 ${active ? "bg-primary/5 text-primary" : "text-gray-700"}`}
                >
                  <Eye className="w-4 h-4" /> View IPC Details
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
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 ${active ? "bg-blue-50 text-blue-700" : "text-gray-700"}`}
                >
                  <Edit className="w-4 h-4" /> Edit Invoice
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ active }) => (
                <button
                  onClick={() => handleDeleteClick(invoice.id)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 text-red-600 ${active ? "bg-red-50" : ""}`}
                >
                  <Trash2 className="w-4 h-4" /> Delete Invoice
                </button>
              )}
            </MenuItem>
          </MenuItems>
        </Menu>
      ),
      isDefault: true
    }
  ];

  return (
    <div className="w-full">
      <ReusableTable
        title="Interim Payment Certificates (IPC)"
        data={filteredInvoices}
        columns={columns}
        isLoading={isLoading}
        isError={false}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        pageSize={10}
        emptyMessage="No invoices or IPCs found."
      />

      {isDeleteModalOpen && (
        <ConfirmModal
          isVisible={isDeleteModalOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this invoice record? This may affect project budget tracking."
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