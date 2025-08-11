// TodosPage.tsx
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Grid, List, PlusIcon } from "lucide-react";
import { useTodos } from "@/hooks/useTodos";
import { useDepartments } from "@/hooks/useDepartments";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import { Todo } from "@/types/todo";
import {
  FilterField,
  FilterValues,
  GenericFilter,
  Option,
} from "@/components/common/GenericFilter";
import TodoForm from "@/components/forms/TodoForm";
import TodosTable from "@/components/todos/TodosTable";
import TodoCard from "@/components/todos/TodoCard";

const columnOptions: Record<string, string> = {
  task: "Task",
  type: "Type",
  priority: "Priority",
  assignedBy: "Assigned By",
  assignedUsers: "Assigned Users",
  target: "Target",
  dueDate: "Due Date",
  kpi: "KPI",
  department: "Department",
  status: "Status",
  progress: "Progress",
  action: "Action",
};

const TodosPage = () => {
  const { data: todos, isLoading: todoLoading, error: todoError } = useTodos();
  const {
    data: departments,
    isLoading: deptLoading,
    error: deptError,
  } = useDepartments();

  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    Object.keys(columnOptions)
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isListView, setIsListView] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close column menu when clicking outside
  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };
  useEffect(() => {
    document.addEventListener("mousedown", (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
    });
    return () => document.removeEventListener("mousedown", () => {});
  }, []);

  // Compute filteredTodos using useMemo, with a fallback for when todos is undefined
  const filteredTodos = useMemo(() => {
    if (!todos) return [];
    return todos.filter((t: Todo) => {
      let matches = true;
      if (filterValues.task) {
        matches =
          matches &&
          t.task
            .toLowerCase()
            .includes((filterValues.task as string).toLowerCase());
      }
      if (filterValues.priority) {
        matches = matches && t.priority === filterValues.priority;
      }
      if (filterValues.status) {
        matches = matches && t.status === filterValues.status;
      }
      return matches;
    });
  }, [filterValues, todos]);

  // Combine loading and error states
  const isLoading = todoLoading || deptLoading;
  const isError = todoError || deptError;

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div className="text-red-500">Error loading data.</div>;

  // Status summary values based on full todos list
  const total = todos?.length ?? 0;
  const notStartedCount =
    todos?.filter((t) => t.status === "Not Started").length ?? 0;
  const inProgressCount =
    todos?.filter((t) => t.status === "In progress").length ?? 0;
  const pendingCount = todos?.filter((t) => t.status === "Pending").length ?? 0;
  const completedCount =
    todos?.filter((t) => t.status === "Completed").length ?? 0;

  // Define download columns
  const columns: Column<Todo>[] = [
    { header: "Task", accessor: "task" },
    { header: "Type", accessor: "type" },
    {
      header: "Priority",
      accessor: (row: Todo) => row.priority || "-",
    },
    {
      header: "Assigned By",
      accessor: (row: Todo) => row.assignedBy?.first_name || "-",
    },
    {
      header: "Assigned Users",
      accessor: (row: Todo) =>
        row.assignedUsers?.map((u) => u.first_name).join(", ") || "-",
    },
    {
      header: "Target",
      accessor: (row: Todo) =>
        row.target ? new Date(row.target).toISOString().split("T")[0] : "-",
    },
    {
      header: "Due Date",
      accessor: (row: Todo) =>
        row.dueDate ? new Date(row.dueDate).toISOString().split("T")[0] : "-",
    },
    {
      header: "KPI",
      accessor: (row: Todo) => row.kpi?.score || row.kpiId || "-",
    },
    {
      header: "Department",
      accessor: (row: Todo) =>
        row.department?.name ||
        departments?.find((d) => d.id === row.departmentId)?.name ||
        "-",
    },
    { header: "Status", accessor: "status" },
    { header: "Progress", accessor: "progress" },
  ];

  // Filter options
  const priorityOptions: Option<string>[] = [
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "High", value: "High" },
    { label: "Urgent", value: "Urgent" },
  ];
  const statusOptions: Option<string>[] = [
    { label: "Not Started", value: "Not Started" },
    { label: "In progress", value: "In progress" },
    { label: "Pending", value: "Pending" },
    { label: "Completed", value: "Completed" },
  ];

  // Filter fields
  const filterFields: FilterField<string>[] = [
    {
      name: "task",
      label: "Task",
      type: "text",
      placeholder: "Search by task…",
    },
    {
      name: "priority",
      label: "Priority",
      type: "select",
      options: priorityOptions,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: statusOptions,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <div className="flex flex-wrap gap-4 mb-10">
        {[
          { label: "Total", value: total },
          { label: "Not Started", value: notStartedCount },
          { label: "In Progress", value: inProgressCount },
          { label: "Pending", value: pendingCount },
          { label: "Completed", value: completedCount },
        ].map((item) => (
          <div
            key={item.label}
            className="flex font-2xl font-semibold bg-white p-4 rounded-lg shadow-md"
          >
            <h2 className="mr-2">{item.label} =</h2>
            <span className="text-cyan-700 font-stretch-semi-condensed font-semibold">
              {item.value}
            </span>
          </div>
        ))}
      </div>
      {/* Top Actions */}
      <div className="flex justify-end space-x-4 mb-8">
        <div className="flex space-x-4">
          <button
            className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-3 rounded text-sm"
            onClick={() => setIsListView((prev) => !prev)}
          >
            {isListView ? (
              <Grid width={15} height={12} />
            ) : (
              <List width={15} height={12} />
            )}
          </button>
          <button
            className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-3 rounded text-sm"
            onClick={() => setShowForm(true)}
          >
            <PlusIcon width={15} height={12} />
          </button>
        </div>
        <GenericDownloads
          data={filteredTodos}
          title="Todos_List"
          columns={columns}
        />
      </div>
      <div className="flex justify-between items-center mb-4">
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowColumnMenu((prev) => !prev)}
            className="flex items-center gap-1 px-4 py-2 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800"
          >
            Customize Columns <ChevronDown className="w-4 h-4" />
          </button>
          {showColumnMenu && (
            <div className="absolute left-0 mt-1 w-48 bg-white border rounded shadow-lg z-10">
              {Object.entries(columnOptions).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center w-full px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(key)}
                    onChange={() => toggleColumn(key)}
                    className="mr-2"
                  />
                  {label || <span>&nbsp;</span>}
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-4">
          <GenericFilter
            fields={filterFields}
            onFilterChange={setFilterValues}
          />
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <TodoForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      <h1 className="text-4xl font-bold text-cyan-800 mb-4">Todos</h1>

      {isListView ? (
        <TodosTable
          filteredTodos={filteredTodos}
          selectedColumns={selectedColumns}
          departments={departments || []}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(filteredTodos || []).map((todo: Todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              departments={departments || []}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TodosPage;
