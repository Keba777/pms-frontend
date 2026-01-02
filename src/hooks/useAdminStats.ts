import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api-client";

interface AdminStats {
    health: {
        apiStatus: string;
        dbStatus: string;
        lastBackup: string;
    };
    security: {
        pendingApprovals: number;
        failedLogins: number;
        activeSessions: number;
    };
}

export const useAdminStats = () => {
    return useQuery<AdminStats>({
        queryKey: ["adminStats"],
        queryFn: async () => {
            const { data } = await apiClient.get<{ data: AdminStats }>("/admin/stats");
            return data.data;
        },
        refetchInterval: 30000, // Refresh every 30 seconds
    });
};
