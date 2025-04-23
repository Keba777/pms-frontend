"use client";

import { useState, useEffect } from "react";
import {
  useWarehouses,
  useDeleteWarehouse,
  useUpdateWarehouse,
} from "@/hooks/useWarehouses";
import { Warehouse } from "@/types/warehouse";
import WarehouseTable from "@/components/warehouse/WarehouseTable";
import ConfirmModal from "@/components/ui/ConfirmModal";
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
    <div>
      <div className="my-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Registered Warehouses</h1>
          <p className="text-gray-600">
            A comprehensive list of all the registered warehouses in our system.
          </p>
        </div>
        <button
          className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-4 rounded"
          onClick={() => setShowAddModal(true)}
        >
          <PlusIcon className="inline-block mr-1" size={16} />
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
        <div className="modal-overlay">
          <div className="modal-content">
            <WarehouseForm onClose={() => setShowAddModal(false)} />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedWarehouse && (
        <div className="modal-overlay">
          <div className="modal-content">
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
