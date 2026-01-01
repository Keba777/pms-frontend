"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useActivityStore } from "@/store/activityStore";
import { Activity } from "@/types/activity";
import TimeSheets from "@/components/activities/TimeSheets";
import KpiTable from "@/components/activities/KpiTable";
import { useKpis } from "@/hooks/useKpis";

export default function ActivityPage() {
  const router = useRouter();
  const params = useParams();
  const activityId = params.id as string;
  const activities = useActivityStore((state) => state.activities);
  const activity = activities.find((a: Activity) => a.id === activityId);
  const { data: kpis } = useKpis();

  if (!activity) {
    return (
      <div className="text-center text-red-500 mt-10">Activity not found.</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-white shadow-lg rounded-lg mt-6">
      {/* Back Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <button
          className="text-gray-600 hover:text-gray-900 flex items-center p-2 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          onClick={() => router.push("/activities")}
        >
          <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-200 transform hover:translate-x-2" />
          <span className="text-base sm:text-lg font-semibold transition-all duration-300">
            Back to Activities
          </span>
        </button>
      </div>

      <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-cyan-800 mt-4 break-words">
        {activity.activity_name}
      </h1>
      {activity.description && (
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          {activity.description}
        </p>
      )}

      <div className="mt-4">
        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
          {activity.status}
        </span>
      </div>

      <div className="mt-8">
        <div className="w-full bg-gray-50 p-5 sm:p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center lg:text-left border-b border-gray-200 pb-4">
            Activity Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Priority</span>
              <span className={`text-sm font-semibold px-2 py-0.5 rounded w-fit ${activity.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                activity.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>{activity.priority}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Start Date</span>
              <span className="text-gray-900 font-semibold">{new Date(activity.start_date).toLocaleDateString()}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">End Date</span>
              <span className="text-gray-900 font-semibold">{new Date(activity.end_date).toLocaleDateString()}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Unit</span>
              <span className="text-gray-900 font-semibold">{activity.unit || "N/A"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Approval Status</span>
              <span className="text-gray-900 font-semibold">{activity.approvalStatus}</span>
            </div>
            {activity.progress !== undefined && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Overall Progress</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-600 rounded-full" style={{ width: `${activity.progress}%` }} />
                  </div>
                  <span className="text-sm font-bold text-cyan-700">{activity.progress}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Attachments Section */}
          {(activity.attachments && activity.attachments.length > 0) && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Attachments</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activity.attachments.map((url, index) => {
                  const fileName = url.split("/").pop() || `Attachment ${index + 1}`;
                  const cleanFileName = decodeURIComponent(fileName);
                  return (
                    <li key={index} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <span className="mr-3 text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </span>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline truncate flex-1">
                        {cleanFileName}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <TimeSheets />
      </div>

      {activity.requests && (
        <div className="mt-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
            Approved Requests
          </h2>

          {activity.requests
            .filter((req) =>
              req.approvals?.some(
                (approval) =>
                  approval.finalDepartment === true &&
                  approval.status === "Approved"
              )
            )
            .map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 rounded-lg shadow p-4 mb-6"
              >
                <p className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">
                  Requested by: {request.user?.first_name}
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Materials Table */}
                  {Array.isArray(request.materialIds) &&
                    request.materialIds?.length > 0 && (
                      <div className="overflow-x-auto">
                        <h3 className="text-lg font-bold mb-2">Materials</h3>
                        <table className="min-w-full table-auto text-xs sm:text-sm border border-gray-300">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border p-2">Name</th>
                              <th className="border p-2">Qty</th>
                              <th className="border p-2">Rate</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activity.materials_list?.map((mat, idx) => (
                              <tr key={idx}>
                                <td className="border p-2">{mat.material}</td>
                                <td className="border p-2">{mat.qty}</td>
                                <td className="border p-2">{mat.rate}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                  {/* Equipment Table */}
                  {Array.isArray(request.equipmentIds) &&
                    request.equipmentIds?.length > 0 && (
                      <div className="overflow-x-auto">
                        <h3 className="text-lg font-bold mb-2">Equipment</h3>
                        <table className="min-w-full table-auto text-xs sm:text-sm border border-gray-300">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border p-2">Name</th>
                              <th className="border p-2">Qty</th>
                              <th className="border p-2">Rate</th>
                              <th className="border p-2">Est. Hrs</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activity.machinery_list?.map((eq, idx) => (
                              <tr key={idx}>
                                <td className="border p-2">{eq.equipment}</td>
                                <td className="border p-2">{eq.qty}</td>
                                <td className="border p-2">{eq.rate}</td>
                                <td className="border p-2">{eq.est_hrs}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                  {/* Labor Table */}
                  {Array.isArray(request.laborIds) &&
                    request.laborIds.length > 0 && (
                      <div className="overflow-x-auto">
                        <h3 className="text-lg font-bold mb-2">Labor</h3>
                        <table className="min-w-full table-auto text-xs sm:text-sm border border-gray-300">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border p-2">Role</th>
                              <th className="border p-2">Qty</th>
                              <th className="border p-2">Rate</th>
                              <th className="border p-2">Est. Hrs</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activity.work_force?.map((lab, idx) => (
                              <tr key={idx}>
                                <td className="border p-2">{lab.man_power}</td>
                                <td className="border p-2">{lab.qty}</td>
                                <td className="border p-2">{lab.rate}</td>
                                <td className="border p-2">{lab.est_hrs}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                </div>
              </div>
            ))}
        </div>
      )}
      <KpiTable kpis={kpis} />
    </div>
  );
}
