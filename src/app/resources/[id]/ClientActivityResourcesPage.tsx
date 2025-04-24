import React from "react";

interface ClientActivityResourcesPageProps {
  activityId: string;
}

const ClientActivityResourcesPage = ({
  activityId,
}: ClientActivityResourcesPageProps) => {
  return <div>{activityId}</div>;
};

export default ClientActivityResourcesPage;

// "use client";

// import { useState } from "react";
// import {
//   Package,
//   Hammer,
//   Users,
//   ArrowRight,
//   ClipboardList,
// } from "lucide-react";
// import { useActivity } from "@/hooks/useActivities";
// import { useTask } from "@/hooks/useTasks";
// import { useProject } from "@/hooks/useProjects";
// import MaterialsTable from "@/components/resources/MaterialsTable";
// import EquipmentTable from "@/components/resources/EquipmentTable";
// import LaborTable from "@/components/resources/LaborTable";
// import { formatDate } from "@/utils/helper";

// interface ClientActivityResourcesPageProps {
//   activityId: string;
// }

// export default function ClientActivityResourcesPage({
//   activityId,
// }: ClientActivityResourcesPageProps) {
//   const { data: activity, isLoading: isActivityLoading } =
//     useActivity(activityId);
//   const [activeTab, setActiveTab] = useState<
//     "materials" | "equipment" | "labor"
//   >("materials");

//   const taskId = activity?.task_id ?? "";
//   const { data: task, isLoading: isTaskLoading } = useTask(taskId);
//   const projectId = task?.project_id ?? "";
//   const { data: project, isLoading: isProjectLoading } = useProject(projectId);

//   if (isActivityLoading) {
//     return <div className="text-center text-gray-600">Loading activity...</div>;
//   }

//   if (!activity) {
//     return (
//       <div className="text-center text-red-500 mt-10">Activity not found.</div>
//     );
//   }

//   const { materials, equipment, labors: labor } = activity;

//   const renderContent = () => {
//     switch (activeTab) {
//       case "materials":
//         return <MaterialsTable materials={materials} />;
//       case "equipment":
//         return <EquipmentTable equipment={equipment} />;
//       case "labor":
//         return <LaborTable labor={labor} />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="p-6">
//       {/* Breadcrumb */}
//       <div className="mb-4">
//         <p className="text-gray-500 text-sm">Home</p>
//       </div>

//       {/* Header */}
//       <div className="p-6 bg-white shadow-lg rounded-2xl">
//         <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-600 to-blue-500 text-white rounded-lg shadow-md">
//           <ClipboardList size={28} className="text-white" />
//           <h2 className="text-2xl font-bold">{activity.activity_name}</h2>
//         </div>

//         {/* Project & Task Info */}
//         <div className="mt-6 flex flex-col md:flex-row md:items-center md:gap-10">
//           {/* Project Info */}
//           {isProjectLoading ? (
//             <p className="text-gray-600 mt-2">Loading project...</p>
//           ) : project ? (
//             <div className="flex-1 p-4 bg-white shadow rounded-xl">
//               <p className="text-cyan-700 font-bold">Project</p>
//               <p className="text-gray-800 text-lg font-medium">
//                 {project.title}
//               </p>
//               <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
//                 <span>{formatDate(project.start_date)}</span>
//                 <ArrowRight size={16} />
//                 <span>{formatDate(project.end_date)}</span>
//               </div>
//             </div>
//           ) : (
//             <p className="text-red-500 mt-2">Project not found.</p>
//           )}

//           {/* Task Info */}
//           {isTaskLoading ? (
//             <p className="text-gray-600 mt-2">Loading task...</p>
//           ) : task ? (
//             <div className="flex-1 p-4 bg-white shadow rounded-xl">
//               <p className="text-blue-700 font-bold">Task</p>
//               <p className="text-gray-800 text-lg font-medium">
//                 {task.task_name}
//               </p>
//               <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
//                 <span>{formatDate(task.start_date)}</span>
//                 <ArrowRight size={16} />
//                 <span>{formatDate(task.end_date)}</span>
//               </div>
//             </div>
//           ) : (
//             <p className="text-red-500 mt-2">Task not found.</p>
//           )}
//         </div>

//         {/* Tabs */}
//         <div className="flex justify-start mt-6 ">
//           {[
//             {
//               name: "Materials",
//               icon: <Package size={20} />,
//               key: "materials",
//               color: "text-red-500",
//             },
//             {
//               name: "Equipment",
//               icon: <Hammer size={20} />,
//               key: "equipment",
//               color: "text-green-500",
//             },
//             {
//               name: "Labor",
//               icon: <Users size={20} />,
//               key: "labor",
//               color: "text-blue-500",
//             },
//           ].map((tab) => (
//             <button
//               key={tab.key}
//               className={`flex items-center gap-4 mr-2 px-4 py-2 text-sm font-medium focus:outline-none transition-all ${
//                 activeTab === tab.key
//                   ? " border-gray-800 text-gray-800"
//                   : "text-gray-500 hover:text-gray-700 bg-gray-200"
//               }`}
//               onClick={() =>
//                 setActiveTab(tab.key as "materials" | "equipment" | "labor")
//               }
//             >
//               <span className={tab.color}>{tab.icon}</span>
//               {tab.name}
//             </button>
//           ))}
//         </div>

//         {/* Tab Content */}
//         <div className="p-4">{renderContent()}</div>
//       </div>
//     </div>
//   );
// }
