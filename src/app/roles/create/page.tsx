"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateRole } from "@/hooks/useRoles";
import { useRouter } from "next/navigation";
import { permissionTable } from "@/constants/permissionTable";

type PermissionActions = "create" | "manage" | "update" | "delete";
const actions: PermissionActions[] = ["create", "manage", "update", "delete"];

interface FormData {
  name: string;
  permissions: Record<string, string[]>;
}

const CreateRolePage = () => {
  const router = useRouter();
  const { mutate: createRole, isPending: isCreating } = useCreateRole(() => {
    router.push("/settings/permission");
  });

  const { register, handleSubmit, watch, setValue } = useForm<FormData>({
    defaultValues: {
      name: "",
      permissions: permissionTable.reduce((acc, t) => {
        acc[t.key] = [];
        return acc;
      }, {} as Record<string, string[]>),
    },
  });

  const permissions = watch("permissions");
  const [selectAll, setSelectAll] = useState(false);

  const handlePermissionChange = (
    tableKey: string,
    action: PermissionActions
  ) => {
    const current = permissions[tableKey] || [];
    const updated = current.includes(action)
      ? current.filter((a) => a !== action)
      : [...current, action];
    setValue(`permissions.${tableKey}`, updated);
  };

  const handleSelectAllChange = () => {
    const allChecked = !selectAll;
    setSelectAll(allChecked);
    const updated: Record<string, string[]> = {};
    permissionTable.forEach(({ key }) => {
      updated[key] = allChecked ? [...actions] : [];
    });
    setValue("permissions", updated);
  };

  const onSubmit = (data: FormData) => {
    const formatted: Record<string, Record<PermissionActions, boolean>> = {};
    Object.entries(data.permissions).forEach(([table, acts]) => {
      const perms: Record<PermissionActions, boolean> = {
        create: false,
        manage: false,
        update: false,
        delete: false,
      };
      acts.forEach((a) => (perms[a as PermissionActions] = true));
      formatted[table] = perms;
    });
    createRole({ name: data.name, permissions: formatted });
  };

  const checkboxClass =
    "h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 p-6 bg-white mt-10 rounded-xl shadow-md"
    >
      {/* Role Name */}
      <div>
        <label className="block text-xs font-semibold">Name</label>
        <input
          {...register("name")}
          disabled={isCreating}
          className="mt-1 block w-full rounded-md border p-2 shadow-sm border-gray-300 focus:border-cyan-700 focus:ring-cyan-700 focus:outline-none disabled:opacity-50"
        />
      </div>

      {/* Permissions Table */}
      <div className="border-t mt-2 pt-6">
        <label className="flex items-center space-x-2 mb-4">
          <input
            type="checkbox"
            className={checkboxClass}
            checked={selectAll}
            onChange={handleSelectAllChange}
            disabled={isCreating}
          />
          <span className="text-xs font-bold uppercase text-gray-600">
            Select All
          </span>
        </label>

        <table className="w-full table-auto">
          <tbody>
            {permissionTable.map(({ key, label }) => {
              const allSelected = permissions[key]?.length === actions.length;
              return (
                <tr key={key} className="border-t border-gray-200">
                  <td className="px-4 py-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className={checkboxClass}
                        checked={allSelected}
                        onChange={() =>
                          setValue(
                            `permissions.${key}`,
                            allSelected ? [] : [...actions]
                          )
                        }
                        disabled={isCreating}
                      />
                      <span className="font-medium">{label}</span>
                    </label>
                  </td>
                  {actions.map((action) => (
                    <td key={action} className="px-4 py-3 text-center">
                      <label className="inline-flex items-center space-x-1">
                        <input
                          type="checkbox"
                          className={checkboxClass}
                          checked={permissions[key]?.includes(action)}
                          onChange={() => handlePermissionChange(key, action)}
                          disabled={isCreating}
                        />
                        <span className="capitalize">{action}</span>
                      </label>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create Button */}
      <div className="pt-6">
        <button
          type="submit"
          disabled={isCreating}
          className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-5 rounded disabled:opacity-50"
        >
          {isCreating ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
};

export default CreateRolePage;
