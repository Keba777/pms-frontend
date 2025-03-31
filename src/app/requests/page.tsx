"use client";

import RequestCard from "@/components/requests/RequestCard";
import { useActivities } from "@/hooks/useActivities";
import { Activity } from "@/types/activity";

const RequestPage = () => {
  const { data: activities, isLoading, error } = useActivities();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading activities.</p>;

  const requestData =
    activities?.flatMap((activity: Activity) => {
      const requestCards: {
        activity: string;
        type: string;
        date: Date;
        financeStatus: string;
      }[] = [];

      if (activity.materials?.length) {
        activity.materials.forEach((material) => {
          requestCards.push({
            activity: activity.activity_name,
            type: "Material",
            date: material.updatedAt || new Date(),
            financeStatus: material.financial_status || "Pending",
          });
        });
      }

      if (activity.equipment?.length) {
        activity.equipment.forEach((equipment) => {
          requestCards.push({
            activity: activity.activity_name,
            type: "Equipment",
            date: equipment.updatedAt || new Date(),
            financeStatus: equipment.financial_status || "Pending",
          });
        });
      }

      if (activity.labors?.length) {
        activity.labors.forEach((labor) => {
          requestCards.push({
            activity: activity.activity_name,
            type: "Labor",
            date: labor.updatedAt || new Date(),
            financeStatus: labor.financial_status || "Pending",
          });
        });
      }

      return requestCards;
    }) || [];

  return (
    <div className="mt-12 p-4 bg-transparent shadow-lg rounded-lg">
      <h1 className="text-4xl text-center text-bs-green font-bold mb-6">
        Incoming Requests
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {requestData.map((request, index) => (
          <RequestCard
            key={index}
            activity={request.activity}
            type={request.type}
            date={request.date}
            financeStatus={request.financeStatus}
          />
        ))}
      </div>
    </div>
  );
};

export default RequestPage;
