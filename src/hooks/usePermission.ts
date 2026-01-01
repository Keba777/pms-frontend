import { useAuthStore } from "@/store/authStore";

/**
 * Custom hook to check if the current user has permission for a specific resource and action.
 * Wraps the authStore's hasPermission method.
 * 
 * @param {string} resource - The resource identifier (e.g., 'projects', 'users')
 * @param {string} action - The action identifier (e.g., 'create', 'view')
 * @returns {boolean} - True if user has permission, false otherwise.
 */
export const usePermission = (resource: string, action: string = 'view') => {
    const hasPermission = useAuthStore((state) => state.hasPermission);

    // Cast action to PermissionAction if needed, or update store type to accept string
    // For now, assuming store handles it or we cast it.
    // The store expects PermissionAction ("create" | "edit" | "delete" | "manage")
    // But our default permissions have 'view', so we might need to update PermissionAction type in store too.
    return hasPermission(resource, action as any);
};
