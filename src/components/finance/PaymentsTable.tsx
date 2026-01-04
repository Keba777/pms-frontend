// PaymentsTable.tsx
import React, { useState, useMemo } from "react";
import { ChevronDown, FileText, Download, Edit, Trash2, Eye } from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Link from "next/link";
import { Payment, UpdatePaymentInput } from "@/types/financial";
import { useRouter } from "next/navigation";
import { useDeletePayment, useUpdatePayment } from "@/hooks/useFinancials";
import EditPaymentForm from "../forms/finance/EditPaymentForm";
import ConfirmModal from "../common/ui/ConfirmModal";
import { formatDate as format } from "@/utils/dateUtils";
import { ReusableTable, ColumnConfig } from "../common/ReusableTable";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface PaymentsTableProps {
  filteredPayments: Payment[];
  selectedColumns: string[];
  isLoading?: boolean;
}

const PaymentsTable: React.FC<PaymentsTableProps> = ({
  filteredPayments,
  selectedColumns,
  isLoading = false,
}) => {
  const router = useRouter();
  const { mutate: deletePayment } = useDeletePayment();
  const { mutate: updatePayment } = useUpdatePayment();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const downloadReceipt = (payment: Payment) => {
    const doc = new jsPDF();

    // Receipt Header
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129); // Emerald-600
    doc.text("PAYMENT RECEIPT", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Receipt No: ${payment.id.substring(0, 8).toUpperCase()}`, 20, 40);
    doc.text(`Date: ${format(payment.payment_date)}`, 150, 40);

    doc.setDrawColor(200);
    doc.line(20, 45, 190, 45);

    // Project Info
    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.text("Project Information", 20, 55);
    doc.setFontSize(12);
    doc.text(`Project Name: ${payment.invoice?.project?.title || "N/A"}`, 20, 65);

    // Payment Details
    doc.setFontSize(14);
    doc.text("Payment Details", 20, 85);

    autoTable(doc, {
      startY: 90,
      head: [['Description', 'Method', 'Total Amount']],
      body: [
        [
          payment.reason || "Monthly Progress Payment",
          payment.method,
          `${payment.amount_paid.toLocaleString()} ETB`
        ]
      ],
      headStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50], fontStyle: 'bold' },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;

    doc.setFontSize(10);
    doc.text("Thank you for your payment.", 105, finalY, { align: "center" });
    doc.text("This is a computer-generated receipt.", 105, finalY + 5, { align: "center" });

    doc.save(`Receipt_${payment.id.substring(0, 8)}.pdf`);
  };

  const columns: ColumnConfig<Payment>[] = [
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
      render: (payment) => (
        <Link href={`/payments/${payment.id}`} className="font-semibold text-primary hover:underline">
          {payment.invoice?.project?.title || "-"}
        </Link>
      ),
      isDefault: true
    },
    {
      key: "reason",
      label: "Reason",
      render: (payment) => <span className="text-gray-600 line-clamp-1">{payment.reason || "N/A"}</span>,
      isDefault: true
    },
    {
      key: "amount",
      label: "Amount",
      render: (payment) => (
        <span className="font-mono font-bold text-emerald-600">
          {payment.amount_paid.toLocaleString()} <small>ETB</small>
        </span>
      ),
      isDefault: true
    },
    {
      key: "date",
      label: "Date",
      render: (payment) => format(payment.payment_date),
      isDefault: true
    },
    {
      key: "method",
      label: "Method",
      render: (payment) => (
        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium uppercase tracking-wider">
          {payment.method.replace('_', ' ')}
        </span>
      ),
      isDefault: true
    },
    {
      key: "action",
      label: "Actions",
      render: (payment) => (
        <Menu as="div" className="relative inline-block text-left">
          <MenuButton className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
            Actions <ChevronDown className="w-4 h-4" />
          </MenuButton>
          <MenuItems className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 divide-y divide-gray-50 rounded-xl shadow-xl z-50 overflow-hidden">
            <MenuItem>
              {({ active }) => (
                <button
                  onClick={() => handleView(payment.id)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 ${active ? "bg-emerald-50 text-emerald-700" : "text-gray-700"}`}
                >
                  <Eye className="w-4 h-4" /> View Details
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ active }) => (
                <button
                  onClick={() => downloadReceipt(payment)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 ${active ? "bg-emerald-50 text-emerald-700" : "text-gray-700"}`}
                >
                  <Download className="w-4 h-4" /> Download Receipt
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
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 ${active ? "bg-blue-50 text-blue-700" : "text-gray-700"}`}
                >
                  <Edit className="w-4 h-4" /> Edit Payment
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ active }) => (
                <button
                  onClick={() => handleDeleteClick(payment.id)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 text-red-600 ${active ? "bg-red-50" : ""}`}
                >
                  <Trash2 className="w-4 h-4" /> Delete Records
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
        title="Payment Transactions"
        data={filteredPayments}
        columns={columns}
        isLoading={isLoading}
        isError={false}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        pageSize={10}
        emptyMessage="No payments found for your search."
      />

      {isDeleteModalOpen && (
        <ConfirmModal
          isVisible={isDeleteModalOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this payment record? This action cannot be undone."
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
