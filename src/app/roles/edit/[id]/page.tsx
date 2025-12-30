"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRole, useUpdateRole } from "@/hooks/useRoles";
import { useRouter, useParams } from "next/navigation";
import { permissionTable } from "@/constants/permissionTable";

type PermissionActions = "create" | "manage" | "update" | "delete";

interface FormData {
  name: string;
  permissions: Record<string, string[]>;
}

const actions: PermissionActions[] = ["create", "manage", "update", "delete"];

const EditRolePage = () => {
  const params = useParams();
  const roleId = params.id as string;
  const { data: role, isLoading } = useRole(roleId);
  const { mutate: updateRole, isPending: isUpdating } = useUpdateRole();
  const router = useRouter();

  const { register, handleSubmit, setValue, watch } = useForm<FormData>({
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

  useEffect(() => {
    if (!role) return;
    setValue("name", role.name);

    const initial: Record<string, string[]> = {};
    permissionTable.forEach(({ key }) => {
      const p = role.permissions?.[key];
      if (Array.isArray(p)) initial[key] = p;
      else if (p && typeof p === "object")
        initial[key] = Object.entries(p)
          .filter(([, ok]) => ok)
          .map(([act]) => act);
      else initial[key] = [];
    });
    setValue("permissions", initial);
  }, [role, setValue]);

  const handlePermissionChange = (
    tableKey: string,
    action: PermissionActions
  ) => {
    const curr = permissions[tableKey] || [];
    const updated = curr.includes(action)
      ? curr.filter((a) => a !== action)
      : [...curr, action];
    setValue(`permissions.${tableKey}`, updated);
  };

  const handleSelectAllChange = () => {
    const all = !selectAll;
    setSelectAll(all);
    const updated: Record<string, string[]> = {};
    permissionTable.forEach(({ key }) => {
      updated[key] = all ? [...actions] : [];
    });
    setValue("permissions", updated);
  };

  const onSubmit = (data: FormData) => {
    const converted: Record<string, Record<PermissionActions, boolean>> = {};
    Object.entries(data.permissions).forEach(([tab, acts]) => {
      const obj: Record<PermissionActions, boolean> = {
        create: false,
        manage: false,
        update: false,
        delete: false,
      };
      acts.forEach((a) => (obj[a as PermissionActions] = true));
      converted[tab] = obj;
    });

    updateRole(
      { id: roleId, name: data.name, permissions: converted },
      {
        onSuccess: () => {
          router.push("/settings/permission");
        },
        onError: (error) => {
          console.error("Failed to update role:", error);
        },
      }
    );
  };

  if (isLoading) return <div>Loading…</div>;

  const checkboxClass =
    "h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 p-6 bg-white mt-10 rounded-xl shadow-md"
    >
      {/* Role Name */}
      <div>
        <label className="block text-xs font-semibold ">Name</label>
        <input
          {...register("name")}
          disabled={isUpdating}
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
            disabled={isUpdating}
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
                        disabled={isUpdating}
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
                          disabled={isUpdating}
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

      {/* Save */}
      <div className="pt-6">
        <button
          type="submit"
          disabled={isUpdating}
          className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-5 rounded disabled:opacity-50"
        >
          {isUpdating ? "Updating..." : "Update"}
        </button>
      </div>
    </form>
  );
};

export default EditRolePage;
