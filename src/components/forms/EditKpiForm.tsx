// components/forms/EditKpiForm.tsx
"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { UpdateKpiInput } from "@/types/kpi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsers } from "@/hooks/useUsers";
import { useLaborInformations } from "@/hooks/useLaborInformations";
import { useEquipments } from "@/hooks/useEquipments";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EditKpiFormProps {
  kpi: UpdateKpiInput & { id: string };
  onSubmit: (data: UpdateKpiInput & { id: string }) => void;
  onClose: () => void;
  isPending?: boolean;
}

const EditKpiForm: React.FC<EditKpiFormProps> = ({
  kpi,
  onSubmit,
  onClose,
  isPending = false,
}) => {
  const { data: users } = useUsers();
  const { data: laborInformations } = useLaborInformations();
  const { data: equipments } = useEquipments();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateKpiInput & { id: string }>({
    defaultValues: kpi,
  });

  const handleFormSubmit = (data: UpdateKpiInput & { id: string }) => {
    onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6 max-w-2xl mx-auto"
    >
      <div className="flex justify-between items-center border-b pb-4">
        <h3 className="text-xl font-bold text-gray-800">Edit KPI</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-3xl text-red-600 hover:text-red-700"
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Score */}
        <div>
          <Label>Score <span className="text-red-500">*</span></Label>
          <Input
            type="number"
            {...register("score", { required: "Score is required" })}
            className="mt-1"
          />
          {errors.score && <p className="text-red-500 text-sm mt-1">{errors.score.message}</p>}
        </div>

        {/* Status */}
        <div>
          <Label>Status <span className="text-red-500">*</span></Label>
          <Controller
            name="status"
            control={control}
            rules={{ required: "Status is required" }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bad">Bad</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="V.Good">V.Good</SelectItem>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
        </div>

        {/* User / Labor / Equipment */}
        {kpi.userLaborId && (
          <div>
            <Label>Select User</Label>
            <Controller
              name="userLaborId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.first_name} {u.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        )}

        {kpi.laborInfoId && (
          <div>
            <Label>Select Labor</Label>
            <Controller
              name="laborInfoId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select labor" />
                  </SelectTrigger>
                  <SelectContent>
                    {laborInformations?.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.firstName} {l.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        )}

        {kpi.equipmentId && (
          <div>
            <Label>Select Equipment</Label>
            <Controller
              name="equipmentId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipments?.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        )}

        {/* Target */}
        <div>
          <Label>Target</Label>
          <Input
            type="number"
            {...register("target")}
            placeholder="Optional target"
            className="mt-1"
          />
        </div>
      </div>

      {/* Remark */}
      <div>
        <Label>Remark</Label>
        <Textarea
          {...register("remark")}
          placeholder="Add remarks..."
          rows={4}
          className="mt-1"
        />
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Updating..." : "Update KPI"}
        </Button>
      </div>
    </form>
  );
};

export default EditKpiForm;