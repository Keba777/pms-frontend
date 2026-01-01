"use client";

import { useState, useEffect } from "react";
import {
  useWarehouses,
  useDeleteWarehouse,
  useUpdateWarehouse,
} from "@/hooks/useWarehouses";
import { Warehouse } from "@/types/warehouse";
import WarehouseTable from "@/components/warehouse/WarehouseTable";
import ConfirmModal from "@/components/common/ui/ConfirmModal";
import WarehouseForm from "@/components/forms/WarehouseForm";
import EditWarehouseForm from "@/components/forms/EditWarehouseForm";
import { PlusIcon } from "lucide-react";

const WarehousePage = () => {
  const {
    data: warehouses,
    isLoading: loadingWarehouses,
    error: warehousesError,
  } = useWarehouses();

  const deleteMutation = useDeleteWarehouse();
  const updateMutation = useUpdateWarehouse();

  const [localWarehouses, setLocalWarehouses] = useState<Warehouse[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState<Warehouse | null>(
    null
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(
    null
  );

  useEffect(() => {
    if (warehouses) setLocalWarehouses(warehouses);
  }, [warehouses]);

  const handleOpenDelete = (warehouse: Warehouse) => {
    setWarehouseToDelete(warehouse);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setWarehouseToDelete(null);
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = () => {
    if (warehouseToDelete) {
      deleteMutation.mutate(warehouseToDelete.id, {
        onSuccess: () => {
          setShowDeleteModal(false);
          setWarehouseToDelete(null);
        },
      });
    }
  };

  const handleEdit = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setShowEditModal(true);
  };

  const handleEditSubmit = (data: Warehouse) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        setShowEditModal(false);
        setSelectedWarehouse(null);
      },
    });
  };

  const handleQuickView = (warehouse: Warehouse) => {
    alert(JSON.stringify(warehouse, null, 2));
  };

  if (loadingWarehouses) return <div>Loading...</div>;
  if (warehousesError)
    return <div>Error loading warehouses: {warehousesError.message}</div>;

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-cyan-800 uppercase tracking-tight">
            Registered Warehouses
          </h1>
          <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mt-1">
            Comprehensive list of all registered warehouses
          </p>
        </div>
        <button
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest bg-cyan-700 text-white rounded-xl hover:bg-cyan-800 transition-all shadow-md shadow-cyan-200"
          onClick={() => setShowAddModal(true)}
        >
          <PlusIcon className="w-4 h-4" />
          Add Warehouse
        </button>
      </div>

      <WarehouseTable
        warehouses={localWarehouses}
        onEdit={handleEdit}
        onDelete={handleOpenDelete}
        onQuickView={handleQuickView}
      />

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <WarehouseForm onClose={() => setShowAddModal(false)} />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedWarehouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <EditWarehouseForm
              warehouse={selectedWarehouse}
              onClose={() => setShowEditModal(false)}
              onSubmit={handleEditSubmit}
            />
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isVisible={showDeleteModal}
        title="Confirm Delete"
        message={
          warehouseToDelete
            ? `Type DELETE to confirm deletion of warehouse ${warehouseToDelete.id}`
            : ""
        }
        showInput={true}
        confirmText="DELETE"
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default WarehousePage;
