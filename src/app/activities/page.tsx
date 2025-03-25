"use client";

import DataTableActivities from "@/components/activities/DataTableActivities";
import Link from "next/link";
import React from "react";

const ActivitiesPage = () => {
  return (
    <div>
      <div className="mb-5 mt-8">
        <nav aria-label="breadcrumb">
          <ol className="flex space-x-2 text-sm font-semibold ">
            <li>
              <Link href="/home" className="hover:underline flex items-center">
                Home
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-800">Activities</li>
          </ol>
        </nav>
      </div>
      <DataTableActivities />
    </div>
  );
};

export default ActivitiesPage;
