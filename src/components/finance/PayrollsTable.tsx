// PayrollsTable.tsx
import React, { useState } from "react";
import { ChevronDown, Eye, Edit, Trash2, Wallet } from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Link from "next/link";
import { Payroll, UpdatePayrollInput } from "@/types/financial";
import { useRouter } from "next/navigation";
import { useDeletePayroll, useUpdatePayroll } from "@/hooks/useFinancials";
import EditPayrollForm from "../forms/finance/EditPayrollForm";
import ConfirmModal from "../common/ui/ConfirmModal";
import { ReusableTable, ColumnConfig } from "../common/ReusableTable";

const statusBadgeClasses: Record<string, string> = {
  "pending": "bg-amber-50 text-amber-700 border-amber-200",
  "paid": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

interface PayrollsTableProps {
  filteredPayrolls: Payroll[];
  selectedColumns: string[];
  isLoading?: boolean;
}

const PayrollsTable: React.FC<PayrollsTableProps> = ({
  filteredPayrolls,
  selectedColumns,
  isLoading = false,
}) => {
  const router = useRouter();
  const { mutate: deletePayroll } = useDeletePayroll();
  const { mutate: updatePayroll } = useUpdatePayroll();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPayrollId, setSelectedPayrollId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const columns: ColumnConfig<Payroll>[] = [
    {
      key: "index",
      label: "#",
      render: (_, idx) => idx + 1,
      isDefault: true,
      className: "w-12 text-center"
    },
    {
      key: "user",
      label: "Employee",
      render: (payroll) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{payroll.user?.first_name} {payroll.user?.last_name}</span>
          <span className="text-[10px] text-gray-500 uppercase tracking-tighter">{String(payroll.user?.role || "Staff")}</span>
        </div>
      ),
      isDefault: true
    },
    {
      key: "gross_salary",
      label: "Gross Salary",
      render: (payroll) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold">{(payroll.gross_salary).toLocaleString()}</span>
          <span className="text-[10px] text-gray-400">Basic: {payroll.basic_salary?.toLocaleString()}</span>
        </div>
      ),
      isDefault: true
    },
    {
      key: "deductions",
      label: "Deductions (Tax/Pen)",
      render: (payroll) => (
        <div className="text-[10px] space-y-0.5">
          <div className="text-rose-600">Tax: {payroll.income_tax?.toLocaleString()}</div>
          <div className="text-gray-500">Pension: {payroll.pension_employee?.toLocaleString()}</div>
        </div>
      ),
      isDefault: true
    },
    {
      key: "net_pay",
      label: "Net Pay",
      render: (payroll) => (
        <span className="font-mono font-bold text-emerald-600">
          {(payroll.net_pay).toLocaleString()} <small>ETB</small>
        </span>
      ),
      isDefault: true
    },
    {
      key: "pay_period",
      label: "Period",
      render: (payroll) => <span className="text-sm font-medium text-gray-600">{payroll.pay_period}</span>,
      isDefault: true
    },
    {
      key: "status",
      label: "Status",
      render: (payroll) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${statusBadgeClasses[payroll.status] || "bg-gray-50 text-gray-700 border-gray-200"
            }`}
        >
          {payroll.status}
        </span>
      ),
      isDefault: true
    },
    {
      key: "action",
      label: "Actions",
      render: (payroll) => (
        <Menu as="div" className="relative inline-block text-left">
          <MenuButton className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
            Actions <ChevronDown className="w-4 h-4" />
          </MenuButton>
          <MenuItems className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 divide-y divide-gray-50 rounded-xl shadow-xl z-50 overflow-hidden">
            <MenuItem>
              {({ active }) => (
                <button
                  onClick={() => handleView(payroll.id)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 ${active ? "bg-primary/5 text-primary" : "text-gray-700"}`}
                >
                  <Eye className="w-4 h-4" /> View Payslip
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ active }) => (
                <button
                  onClick={() => {
                    setPayrollToEdit(payroll as UpdatePayrollInput);
                    setShowEditForm(true);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 ${active ? "bg-blue-50 text-blue-700" : "text-gray-700"}`}
                >
                  <Edit className="w-4 h-4" /> Edit Salary
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ active }) => (
                <button
                  onClick={() => handleDeleteClick(payroll.id)}
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
        title="Employee Payroll History"
        data={filteredPayrolls}
        columns={columns}
        isLoading={isLoading}
        isError={false}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        pageSize={12}
        emptyMessage="No payroll records found."
      />

      {isDeleteModalOpen && (
        <ConfirmModal
          isVisible={isDeleteModalOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this payroll record? This will permanently remove the salary history for this employee."
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
