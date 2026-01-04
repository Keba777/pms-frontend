// BudgetsTable.tsx
import React, { useState } from "react";
import { ChevronDown, Eye, Edit, Trash2, PieChart } from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Link from "next/link";
import { Budget, UpdateBudgetInput } from "@/types/financial";
import { useRouter } from "next/navigation";
import { useDeleteBudget, useUpdateBudget } from "@/hooks/useFinancials";
import EditBudgetForm from "../forms/finance/EditBudgetForm";
import ConfirmModal from "../common/ui/ConfirmModal";
import { ReusableTable, ColumnConfig } from "../common/ReusableTable";

const statusBadgeClasses: Record<string, string> = {
  "planned": "bg-blue-50 text-blue-700 border-blue-200",
  "active": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "closed": "bg-gray-50 text-gray-700 border-gray-200",
};

interface BudgetsTableProps {
  filteredBudgets: Budget[];
  selectedColumns: string[];
  isLoading?: boolean;
}

const BudgetsTable: React.FC<BudgetsTableProps> = ({
  filteredBudgets,
  selectedColumns,
  isLoading = false,
}) => {
  const router = useRouter();
  const { mutate: deleteBudget } = useDeleteBudget();
  const { mutate: updateBudget } = useUpdateBudget();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Edit modal
  const [showEditForm, setShowEditForm] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<UpdateBudgetInput | null>(null);

  const handleDeleteClick = (budgetId: string) => {
    setSelectedBudgetId(budgetId);
    setIsDeleteModalOpen(true);
  };
  const handleDeleteConfirm = () => {
    if (selectedBudgetId) deleteBudget(selectedBudgetId);
    setIsDeleteModalOpen(false);
  };

  const handleView = (id: string) => {
    router.push(`/budgets/${id}`);
  };

  const handleEditSubmit = (data: UpdateBudgetInput) => {
    updateBudget(data);
    setShowEditForm(false);
  };

  const columns: ColumnConfig<Budget>[] = [
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
      render: (budget) => (
        <Link href={`/budgets/${budget.id}`} className="font-semibold text-primary hover:underline">
          {budget.project?.title || "-"}
        </Link>
      ),
      isDefault: true
    },
    {
      key: "allocated_amount",
      label: "Total Budget",
      render: (budget) => <span className="font-mono font-bold">{budget.allocated_amount.toLocaleString()}</span>,
      isDefault: true
    },
    {
      key: "spent_amount",
      label: "Spent",
      render: (budget) => <span className="font-mono text-rose-600">{budget.spent_amount.toLocaleString()}</span>,
      isDefault: true
    },
    {
      key: "remaining_amount",
      label: "Remaining",
      render: (budget) => (
        <span className={`font-mono font-bold ${budget.remaining_amount < budget.allocated_amount * 0.1 ? 'text-rose-600' : 'text-emerald-600'}`}>
          {budget.remaining_amount.toLocaleString()}
        </span>
      ),
      isDefault: true
    },
    {
      key: "status",
      label: "Status",
      render: (budget) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${statusBadgeClasses[budget.status] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
          {budget.status}
        </span>
      ),
      isDefault: true
    },
    {
      key: "action",
      label: "Actions",
      render: (budget) => (
        <Menu as="div" className="relative inline-block text-left">
          <MenuButton className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
            Actions <ChevronDown className="w-4 h-4" />
          </MenuButton>
          <MenuItems className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 divide-y divide-gray-50 rounded-xl shadow-xl z-50 overflow-hidden">
            <MenuItem>
              {({ active }) => (
                <button
                  onClick={() => handleView(budget.id)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 ${active ? "bg-primary/5 text-primary" : "text-gray-700"}`}
                >
                  <PieChart className="w-4 h-4" /> View Analysis
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ active }) => (
                <button
                  onClick={() => {
                    setBudgetToEdit(budget);
                    setShowEditForm(true);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 ${active ? "bg-blue-50 text-blue-700" : "text-gray-700"}`}
                >
                  <Edit className="w-4 h-4" /> Edit Allocation
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ active }) => (
                <button
                  onClick={() => handleDeleteClick(budget.id)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 text-red-600 ${active ? "bg-red-50" : ""}`}
                >
                  <Trash2 className="w-4 h-4" /> Delete Budget
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
        title="Project Budget Overview"
        data={filteredBudgets}
        columns={columns}
        isLoading={isLoading}
        isError={false}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        pageSize={10}
        emptyMessage="No project budgets found."
      />

      {isDeleteModalOpen && (
        <ConfirmModal
          isVisible={isDeleteModalOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this project budget? This will remove all associated allocation data."
          showInput={false}
          confirmText="DELETE"
          confirmButtonText="Delete"
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* Edit Budget Modal */}
      {showEditForm && budgetToEdit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EditBudgetForm
              onClose={() => setShowEditForm(false)}
              onSubmit={handleEditSubmit}
              budget={budgetToEdit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetsTable;