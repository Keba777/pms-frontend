"use client";

import React from "react";
import { useEquipments } from "@/hooks/useEquipments";
import { useLabors } from "@/hooks/useLabors";
import { useMaterials } from "@/hooks/useMaterials";

import EquipmentTable from "@/components/resources/EquipmentTable";
import LaborTable from "@/components/resources/LaborTable";
import MaterialsTable from "@/components/resources/MaterialsTable";

const ResourcesPage = () => {
  const {
    data: equipmentData,
    isLoading: isLoadingEquipment,
    isError: isErrorEquipment,
  } = useEquipments();
  const {
    data: laborData,
    isLoading: isLoadingLabor,
    isError: isErrorLabor,
  } = useLabors();
  const {
    data: materialsData,
    isLoading: isLoadingMaterials,
    isError: isErrorMaterials,
  } = useMaterials();

  if (isLoadingEquipment || isLoadingLabor || isLoadingMaterials) {
    return <div>Loading...</div>;
  }

  if (isErrorEquipment || isErrorLabor || isErrorMaterials) {
    return <div>Error fetching data. Please try again later.</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold">Resources</h1>

      <section>
        <h2 className="text-lg font-semibold">Equipment</h2>
        <EquipmentTable equipment={equipmentData} />
      </section>

      <section>
        <h2 className="text-lg font-semibold">Labor</h2>
        <LaborTable labor={laborData} />
      </section>

      <section>
        <h2 className="text-lg font-semibold">Materials</h2>
        <MaterialsTable materials={materialsData} />
      </section>
    </div>
  );
};

export default ResourcesPage;
