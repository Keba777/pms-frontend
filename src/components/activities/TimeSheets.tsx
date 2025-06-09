// File: pages/Timesheet.tsx
import React, { useState } from "react";
import { LaborSheet } from "./LaborSheet";
import { EquipmentSheet } from "./EquipmentSheet";
import { MaterialSheet } from "./MaterialSheet";

export default function Timesheet() {
  const tabs = [
    "Labor Timesheet",
    "Equipment Timesheet",
    "Material Balance Sheet",
  ];
  const [active, setActive] = useState<string>(tabs[0]);

  const renderSheet = () => {
    switch (active) {
      case tabs[0]:
        return <LaborSheet />;
      case tabs[1]:
        return <EquipmentSheet />;
      case tabs[2]:
        return <MaterialSheet />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <nav className="flex border-b border-gray-300 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-4 py-2 -mb-px font-semibold ${
              active === tab
                ? "border-b-2 border-cyan-700 text-cyan-700"
                : "text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>
      <div>{renderSheet()}</div>
    </div>
  );
}
