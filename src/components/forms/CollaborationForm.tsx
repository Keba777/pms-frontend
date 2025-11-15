"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  useCreateDiscussion,
  useUpdateDiscussion,
  useCreateNotification,
  useUpdateNotification,
  useCreateActivity,
  useUpdateActivity,
} from "@/hooks/useCollaborations";

import { useUsers } from "@/hooks/useUsers";

type ResourceType = "project" | "task" | "activity" | "todo";

type Mode = "discussion" | "notification" | "activity";

interface DiscussionFormValues {
  subject: string;
  body: string;
  isPrivate?: boolean;
  participants?: string[]; // user ids
  pinned?: boolean;
  lastMessageAt?: string | null;
}

/* ---------------------------- Notification Types --------------------------- */

interface NotificationFormValues {
  title?: string;
  message: string;
  recipient: string; // user id
  meta?: string; // string input (optional)
}

/* ------------------------------ Activity Types ----------------------------- */

interface ActivityFormValues {
  action: string;
  actor?: string;
  details?: string; // string
  parentActivityId?: string | null;
}

/* -------------------------------------------------------------------------- */
/*                             Shared Component Props                          */
/* -------------------------------------------------------------------------- */

interface CollaborationFormProps {
  onClose: () => void;
  mode: Mode;
  type: ResourceType;
  referenceId: string;
  /**
   * If provided, the forms will act as "edit" forms and will call the update hook.
   * - For discussions: supply the existing object with `id`, and matching fields.
   * - For notifications & activities: supply `id` and fields as needed.
   */
  initialData?: any;
}

/* -------------------------------------------------------------------------- */
/*                              Discussion Form                                */
/* -------------------------------------------------------------------------- */

export const DiscussionForm: React.FC<{
  onClose: () => void;
  type: ResourceType;
  referenceId: string;
  initialData?: any;
}> = ({ onClose, type, referenceId, initialData }) => {
  const { data: users } = useUsers();
  const createDiscussion = useCreateDiscussion();
  const updateDiscussion = useUpdateDiscussion();

  const { register, handleSubmit, reset, setValue } =
    useForm<DiscussionFormValues>({
      defaultValues: {
        subject: "",
        body: "",
        isPrivate: false,
        participants: [],
        pinned: false,
        lastMessageAt: null,
      },
    });

  useEffect(() => {
    if (initialData) {
      setValue("subject", initialData.subject ?? "");
      setValue("body", initialData.body ?? "");
      setValue("isPrivate", !!initialData.isPrivate);
      setValue("participants", initialData.participants ?? []);
      setValue("pinned", !!initialData.pinned);
      setValue("lastMessageAt", initialData.lastMessageAt ?? null);
    }
  }, [initialData, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (initialData && initialData.id) {
        // Update flow
        await updateDiscussion.mutateAsync({
          id: initialData.id,
          subject: data.subject,
          body: data.body,
          isPrivate: data.isPrivate,
          participants: data.participants,
          pinned: data.pinned,
          lastMessageAt: data.lastMessageAt,
        });
        toast.success("Discussion updated successfully");
      } else {
        // Create flow
        await createDiscussion.mutateAsync({
          subject: data.subject,
          body: data.body,
          type,
          referenceId,
          isPrivate: data.isPrivate ?? false,
          participants: data.participants ?? [],
        });
        toast.success("Discussion created successfully");
      }

      reset();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save discussion");
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6 w-full max-w-lg mx-auto"
    >
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-xl font-semibold text-gray-800">
          {initialData ? "Edit Discussion" : "New Discussion"}
        </h3>
        <button
          type="button"
          className="text-2xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subject
        </label>
        <input
          {...register("subject", { required: true })}
          type="text"
          placeholder="Enter subject"
          className="w-full border rounded-md p-2 text-sm focus:ring-cyan-600 focus:border-cyan-600"
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Body
        </label>
        <textarea
          {...register("body", { required: true })}
          placeholder="Write your message..."
          rows={5}
          className="w-full border rounded-md p-2 text-sm focus:ring-cyan-600 focus:border-cyan-600"
        />
      </div>

      {/* Participants & options */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Participants
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
            {users?.map((u: any) => (
              <label key={u.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  value={u.id}
                  {...register("participants")}
                />
                {u.first_name} {u.last_name}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Options
          </label>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <input {...register("isPrivate")} type="checkbox" />
              <span>Private</span>
            </label>

            <label className="inline-flex items-center gap-2 text-sm">
              <input {...register("pinned")} type="checkbox" />
              <span>Pinned</span>
            </label>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-4 mt-4">
        <button
          type="button"
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
          onClick={onClose}
        >
          Close
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800"
          disabled={createDiscussion.isPending || updateDiscussion.isPending}
        >
          {initialData ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

/* -------------------------------------------------------------------------- */
/*                              Notification Form                              */
/* -------------------------------------------------------------------------- */

export const NotificationForm: React.FC<{
  onClose: () => void;
  type: ResourceType;
  referenceId: string;
  initialData?: any;
}> = ({ onClose, type, referenceId, initialData }) => {
  const { data: users } = useUsers();
  const createNotification = useCreateNotification();
  const updateNotification = useUpdateNotification();

  const { register, handleSubmit, reset, setValue } =
    useForm<NotificationFormValues>({
      defaultValues: {
        title: "",
        message: "",
        recipient: "",
        meta: "",
      },
    });

  useEffect(() => {
    if (initialData) {
      setValue("title", initialData.title ?? "");
      setValue("message", initialData.message ?? "");
      setValue("recipient", initialData.recipient ?? "");
      setValue("meta", initialData.meta ?? "");
    }
  }, [initialData, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (initialData && initialData.id) {
        await updateNotification.mutateAsync({
          id: initialData.id,
          title: data.title,
          message: data.message,
          read: initialData.read ?? false,
          meta: data.meta || null,
        });
        toast.success("Notification updated successfully");
      } else {
        await createNotification.mutateAsync({
          title: data.title,
          message: data.message,
          recipient: data.recipient,
          type,
          referenceId,
          meta: data.meta || null,
        });
        toast.success("Notification created successfully");
      }

      reset();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save notification");
    }
  });

  const userOptions = users?.map((u: any) => (
    <option key={u.id} value={u.id}>
      {u.first_name} {u.last_name}
    </option>
  ));

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6 w-full max-w-lg mx-auto"
    >
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-xl font-semibold text-gray-800">
          {initialData ? "Edit Notification" : "New Notification"}
        </h3>
        <button
          type="button"
          className="text-2xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title (optional)
        </label>
        <input
          {...register("title")}
          type="text"
          placeholder="Notification title"
          className="w-full border rounded-md p-2 text-sm focus:ring-cyan-600 focus:border-cyan-600"
        />
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message
        </label>
        <textarea
          {...register("message", { required: true })}
          placeholder="Notification message"
          rows={4}
          className="w-full border rounded-md p-2 text-sm focus:ring-cyan-600 focus:border-cyan-600"
        />
      </div>

      {/* Recipient */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Recipient
        </label>
        <select
          {...register("recipient", { required: true })}
          className="w-full border rounded-md p-2 text-sm focus:ring-cyan-600 focus:border-cyan-600"
        >
          <option value="">Select user</option>
          {userOptions}
        </select>
      </div>

      {/* Additional Information */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Information (optional)
        </label>
        <textarea
          {...register("meta")}
          placeholder="Enter any additional details here..."
          rows={3}
          className="w-full border rounded-md p-2 text-sm focus:ring-cyan-600 focus:border-cyan-600"
        />
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-4 mt-4">
        <button
          type="button"
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
          onClick={onClose}
        >
          Close
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800"
          disabled={
            createNotification.isPending || updateNotification.isPending
          }
        >
          {initialData ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

/* -------------------------------------------------------------------------- */
/*                                 Activity Form                               */
/* -------------------------------------------------------------------------- */

export const ActivityForm: React.FC<{
  onClose: () => void;
  type: ResourceType;
  referenceId: string;
  initialData?: any;
}> = ({ onClose, type, referenceId, initialData }) => {
  const { data: users } = useUsers();
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();

  const { register, handleSubmit, reset, setValue } =
    useForm<ActivityFormValues>({
      defaultValues: {
        action: "",
        actor: "",
        details: "",
        parentActivityId: null,
      },
    });

  useEffect(() => {
    if (initialData) {
      setValue("action", initialData.action ?? "");
      setValue("actor", initialData.actor ?? "");
      setValue("details", initialData.details ?? "");
      setValue("parentActivityId", initialData.parentActivityId?.toString() ?? "");
    }
  }, [initialData, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const parentId = data.parentActivityId ? Number(data.parentActivityId) : null;
      if (parentId !== null && isNaN(parentId)) {
        toast.error("Invalid parent activity ID");
        return;
      }
      const actor = data.actor === '' ? undefined : data.actor;

      if (initialData && initialData.id) {
        await updateActivity.mutateAsync({
          id: initialData.id,
          action: data.action,
          details: data.details || null,
          parentActivityId: parentId,
        });
        toast.success("Activity updated successfully");
      } else {
        await createActivity.mutateAsync({
          action: data.action,
          actor,
          type,
          referenceId,
          details: data.details || null,
          parentActivityId: parentId,
        });
        toast.success("Activity created successfully");
      }

      reset();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save activity");
    }
  });

  const userOptions = users?.map((u: any) => (
    <option key={u.id} value={u.id}>
      {u.first_name} {u.last_name}
    </option>
  ));

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6 w-full max-w-lg mx-auto"
    >
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-xl font-semibold text-gray-800">
          {initialData ? "Edit Activity" : "New Activity"}
        </h3>
        <button
          type="button"
          className="text-2xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      {/* Action */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Action
        </label>
        <input
          {...register("action", { required: true })}
          type="text"
          placeholder='e.g. "created", "updated", "deleted"'
          className="w-full border rounded-md p-2 text-sm focus:ring-cyan-600 focus:border-cyan-600"
        />
      </div>

      {/* Actor & parent */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Performed by (optional)
          </label>
          <select
            {...register("actor")}
            className="w-full border rounded-md p-2 text-sm focus:ring-cyan-600 focus:border-cyan-600"
          >
            <option value="">(system)</option>
            {userOptions}
          </select>
        </div>

      </div>

      {/* Details */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Information (optional)
        </label>
        <textarea
          {...register("details")}
          placeholder="Enter any additional details here..."
          rows={4}
          className="w-full border rounded-md p-2 text-sm focus:ring-cyan-600 focus:border-cyan-600"
        />
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-4 mt-4">
        <button
          type="button"
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
          onClick={onClose}
        >
          Close
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800"
          disabled={createActivity.isPending || updateActivity.isPending}
        >
          {initialData ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

/* -------------------------------------------------------------------------- */
/*                           CollaborationForm Wrapper                         */
/*   Renders the proper form based on `mode` prop. Useful for modal content.   */
/* -------------------------------------------------------------------------- */

const CollaborationForm: React.FC<CollaborationFormProps> = ({
  onClose,
  mode,
  type,
  referenceId,
  initialData,
}) => {
  if (mode === "discussion") {
    return (
      <DiscussionForm
        onClose={onClose}
        type={type}
        referenceId={referenceId}
        initialData={initialData}
      />
    );
  }

  if (mode === "notification") {
    return (
      <NotificationForm
        onClose={onClose}
        type={type}
        referenceId={referenceId}
        initialData={initialData}
      />
    );
  }

  return (
    <ActivityForm
      onClose={onClose}
      type={type}
      referenceId={referenceId}
      initialData={initialData}
    />
  );
};

export default CollaborationForm;