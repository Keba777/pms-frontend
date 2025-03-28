import React, { useState } from "react";
import Link from "next/link";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { formatDate, getDuration } from "@/utils/helper";
import DataTableToolbar from "./DataTableToolbar";
import Filters from "@/components/common/Filters";
import GenericDownloads from "@/components/common/GenericDownloads";
import { Task } from "@/types/task";

const DataTable = () => {
  // Assume tasks is of type Task[]
  const tasks = useTaskStore((state) => state.tasks) as Task[];
  const isLoading = !tasks;
  const error = !tasks ? "Error fetching tasks." : null;
  const [search, setSearch] = useState("");

  const onRefresh = () => {
    console.log("Fetch");
    // Optionally implement your refresh logic here
  };

  // Filter tasks based on the search value (adjust as needed)
  const filteredTasks = tasks.filter((task) =>
    task.task_name.toLowerCase().includes(search.toLowerCase())
  );

  // Column definitions typed for Task
  const columns = [
    { header: "Task", accessor: (task: Task) => task.task_name },
    { header: "Priority", accessor: (task: Task) => task.priority },
    {
      header: "Start Date",
      accessor: (task: Task) => formatDate(task.start_date),
    },
    { header: "End Date", accessor: (task: Task) => formatDate(task.end_date) },
    {
      header: "Duration",
      accessor: (task: Task) => getDuration(task.start_date, task.end_date),
    },
    { header: "Progress", accessor: (task: Task) => task.progress },
    { header: "Status", accessor: (task: Task) => task.status },
    { header: "Approval", accessor: (task: Task) => task.approvalStatus },
    { header: "Assigned To", accessor: (task: Task) => task.assignedTo },
  ];

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <div className="mt-6">
        <Filters />
        <GenericDownloads<Task>
          data={filteredTasks}
          title="Task Report"
          columns={columns}
        />
      </div>
      <div className="rounded-lg border border-gray-200">
        <DataTableToolbar
          onRefresh={onRefresh}
          searchValue={search}
          onSearchChange={setSearch}
        />

        {/* Table wrapper with horizontal scroll */}
        <div className="overflow-x-auto">
          <table className="min-w-max divide-y divide-gray-200">
            <thead className="bg-cyan-700">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                  Task
                </th>
                <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                  Priority
                </th>
                <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                  Start Date
                </th>
                <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                  End Date
                </th>
                <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                  Duration
                </th>
                <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                  Progress
                </th>
                <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                  Status
                </th>
                <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                  Approval
                </th>
                <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                  Assigned To
                </th>
                <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks && filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <Link
                        href={`/tasks/${task.id}`}
                        className="text-bs-primary hover:underline font-medium"
                      >
                        {task.task_name}
                      </Link>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span
                        className={`badge ${
                          task.priority === "Critical"
                            ? "text-red-600"
                            : task.priority === "High"
                            ? "text-orange-500"
                            : task.priority === "Medium"
                            ? "text-yellow-500"
                            : "text-green-500"
                        } bg-gray-100 px-2 py-1 rounded`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {formatDate(task.start_date)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {formatDate(task.end_date)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {getDuration(task.start_date, task.end_date)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="relative h-5 bg-gray-200 rounded">
                        <div
                          className="absolute h-full bg-blue-600 rounded"
                          style={{ width: `${task.progress ?? 0}%` }}
                        >
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                            {task.progress ?? 0}%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className="badge bg-label-secondary">
                        {task.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {task.approvalStatus}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {task.assignedTo || "Not Assigned"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="relative inline-block">
                        <Menu>
                          <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800">
                            Action <ChevronDown className="w-4 h-4" />
                          </MenuButton>
                          <MenuItems className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                            <MenuItem>
                              {({ focus }) => (
                                <button
                                  className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
                                    focus ? "bg-blue-100" : ""
                                  }`}
                                >
                                  Update
                                </button>
                              )}
                            </MenuItem>
                            <MenuItem>
                              {({ focus }) => (
                                <button
                                  className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
                                    focus ? "bg-blue-100" : ""
                                  }`}
                                >
                                  Delete
                                </button>
                              )}
                            </MenuItem>
                            <MenuItem>
                              {({ focus }) => (
                                <button
                                  className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
                                    focus ? "bg-blue-100" : ""
                                  }`}
                                >
                                  Duplicate
                                </button>
                              )}
                            </MenuItem>
                            <MenuItem>
                              {({ focus }) => (
                                <button
                                  className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
                                    focus ? "bg-blue-100" : ""
                                  }`}
                                >
                                  Quick View
                                </button>
                              )}
                            </MenuItem>
                          </MenuItems>
                        </Menu>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="px-4 py-2 text-center">
                    No tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              Showing {filteredTasks.length} rows
            </span>
            <select className="rounded border-gray-300 text-sm">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded border hover:bg-gray-50">
              &lsaquo;
            </button>
            <button className="px-3 py-1 rounded border bg-gray-100">1</button>
            <button className="px-3 py-1 rounded border hover:bg-gray-50">
              &rsaquo;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
