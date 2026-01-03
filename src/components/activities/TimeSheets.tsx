// File: pages/Timesheet.tsx
"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { LaborSheet } from "./LaborSheet";
import { EquipmentSheet } from "./EquipmentSheet";
import { MaterialSheet } from "./MaterialSheet";

const Timesheet: React.FC = () => {
  return (
    <div className="w-full px-2 sm:px-4 py-3 sm:py-6">
      <Card className="shadow-lg rounded-2xl w-full">
        <CardContent className="px-2 py-3 sm:px-6 sm:py-6">
          <Tabs defaultValue="labor" className="w-full">
            {/* Tabs header */}
            <TabsList className="flex w-full overflow-x-auto sm:overflow-visible gap-1 sm:gap-4 border-b border-border pb-1 sm:pb-2 no-scrollbar">
              <TabsTrigger
                value="labor"
                className="flex-shrink-0 text-xs sm:text-base px-2 sm:px-4 py-1.5 sm:py-2"
              >
                <span className="sm:hidden">Labor</span>
                <span className="hidden sm:inline">Labor Timesheet</span>
              </TabsTrigger>
              <TabsTrigger
                value="equipment"
                className="flex-shrink-0 text-xs sm:text-base px-2 sm:px-4 py-1.5 sm:py-2"
              >
                <span className="sm:hidden">Equip.</span>
                <span className="hidden sm:inline">Equipment Timesheet</span>
              </TabsTrigger>
              <TabsTrigger
                value="material"
                className="flex-shrink-0 text-xs sm:text-base px-2 sm:px-4 py-1.5 sm:py-2"
              >
                <span className="sm:hidden">Material</span>
                <span className="hidden sm:inline">Material Balance Sheet</span>
              </TabsTrigger>
            </TabsList>

            {/* Tabs content */}
            <div className="mt-3 sm:mt-6">
              <TabsContent value="labor">
                <LaborSheet />
              </TabsContent>
              <TabsContent value="equipment">
                <EquipmentSheet />
              </TabsContent>
              <TabsContent value="material">
                <MaterialSheet />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Timesheet;
