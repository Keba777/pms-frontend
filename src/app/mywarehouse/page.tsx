"use client";

import { useWarehouses } from "@/hooks/useWarehouses";
import { useEquipments } from "@/hooks/useEquipments";
import WarehouseTable from "@/components/warehouse/WarehouseTable";

const WarehousePage = () => {
  const {
    data: warehouses,
    isLoading: loadingWarehouses,
    error: warehousesError,
  } = useWarehouses();
  const {
    data: equipments,
    isLoading: loadingEquipments,
    error: equipmentsError,
  } = useEquipments();

  if (loadingWarehouses || loadingEquipments) return <div>Loading...</div>;
  if (warehousesError)
    return <div>Error loading warehouses: {warehousesError.message}</div>;
  if (equipmentsError)
    return <div>Error loading equipments: {equipmentsError.message}</div>;

  return (
    <div>
      <div className="my-6 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-semibold text-center mb-4">
          Registered Equipments
        </h1>
        <p>
          A comprehensive list of all the registered equipment in our system.
        </p>
      </div>
      <WarehouseTable warehouses={warehouses} equipments={equipments} />
    </div>
  );
};

export default WarehousePage;
