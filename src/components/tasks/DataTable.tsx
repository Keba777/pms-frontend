import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ChevronDown, RefreshCw, Trash2, Search } from "lucide-react";
import React from "react";
import { useTaskStore } from "@/store/taskStore";
import Link from "next/link";

const DataTable = () => {
  const tasks = useTaskStore((state) => state.tasks);
  const isLoading = !tasks; // Check if tasks are loaded
  const error = !tasks ? "Error fetching tasks." : null;

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  if (error) {
    return <div>Error fetching tasks.</div>;
  }

  // Helper function to format dates as dd-MM-yyyy
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Helper function to calculate duration in days
  const getDuration = (start: Date | string, end: Date | string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
    return `${diffDays} D`;
  };

  return (
    <div className="rounded-lg border border-gray-200">
      <div className="flex items-center justify-between p-4">
        <div className="flex gap-4">
          <button className="flex items-center px-4 py-2 rounded-lg gap-2 text-red-600 hover:text-gray-100 hover:bg-red-600 border border-red-600">
            <Trash2 size={18} /> Delete Selected
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search"
              className="pl-10 pr-4 py-2 border rounded"
            />
          </div>

          <Menu>
            <MenuButton className="flex text-gray-100 items-center gap-16 px-4 py-3 bg-bs-gray-dark rounded">
              <button onClick={() => console.log("Fetch")} className="rounded">
                <RefreshCw size={14} />
              </button>
              <ChevronDown size={14} />
            </MenuButton>
            <MenuItems className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
              <MenuItem>
                {({ focus }) => (
                  <label
                    className={`flex items-center px-4 py-2 whitespace-nowrap ${
                      focus ? "bg-blue-100" : ""
                    }`}
                  >
                    <input type="checkbox" className="mr-2" checked readOnly />{" "}
                    Task
                  </label>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <label
                    className={`flex items-center px-4 py-2 whitespace-nowrap ${
                      focus ? "bg-blue-100" : ""
                    }`}
                  >
                    <input type="checkbox" className="mr-2" checked readOnly />{" "}
                    Priority
                  </label>
                )}
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      </div>

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
            {tasks && tasks.length > 0 ? (
              tasks.map((task) => (
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
                    {/* Wrap the menu in a relatively positioned container */}
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

      {/* Pagination - adjust as needed */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">
            Showing {tasks?.length || 0} rows
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
  );
};

export default DataTable;
