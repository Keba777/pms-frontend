// BudgetsTable.tsx
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Link from "next/link";
import { Budget, UpdateBudgetInput } from "@/types/financial";
import { useRouter } from "next/navigation";
import { useDeleteBudget, useUpdateBudget } from "@/hooks/useFinancials";
import EditBudgetForm from "../forms/finance/EditBudgetForm";
import ConfirmModal from "../common/ui/ConfirmModal";

interface BudgetsTableProps {
  filteredBudgets: Budget[];
  selectedColumns: string[];
}

const BudgetsTable: React.FC<BudgetsTableProps> = ({
  filteredBudgets,
  selectedColumns,
}) => {
  const router = useRouter();
  const { mutate: deleteBudget } = useDeleteBudget();
  const { mutate: updateBudget } = useUpdateBudget();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);

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
            {selectedColumns.includes("total") && (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
                Total
              </th>
            )}
            {selectedColumns.includes("allocated") && (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
                Allocated
              </th>
            )}
            {selectedColumns.includes("spent") && (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
                Spent
              </th>
            )}
            {selectedColumns.includes("remaining") && (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
                Remaining
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
          {filteredBudgets.map((budget, idx) => (
            <tr key={budget.id}>
              <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                {idx + 1}
              </td>
              {selectedColumns.includes("project") && (
                <td className="px-4 py-2 text-bs-primary border border-gray-200 whitespace-nowrap">
                  <Link href={`/budgets/${budget.id}`} className="hover:underline">
                    {budget.project?.title || "-"}
                  </Link>
                </td>
              )}
              {selectedColumns.includes("total") && (
                <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                  {budget.total}
                </td>
              )}
              {selectedColumns.includes("allocated") && (
                <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                  {budget.allocated}
                </td>
              )}
              {selectedColumns.includes("spent") && (
                <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                  {budget.spent}
                </td>
              )}
              {selectedColumns.includes("remaining") && (
                <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                  {budget.remaining}
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
                            onClick={() => handleView(budget.id)}
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
                              setBudgetToEdit(budget);
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
                            onClick={() => handleDeleteClick(budget.id)}
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
          message="Are you sure you want to delete this budget?"
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