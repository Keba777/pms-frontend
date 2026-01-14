import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import apiClient from "@/services/api-client";

interface CheckInInput {
    resourceId: string;
    type: "User" | "Labor";
    session: "Morning" | "Afternoon";
}

interface CheckOutInput {
    resourceId: string;
    type: "User" | "Labor";
    session: "Morning" | "Afternoon";
}

export const useCheckIn = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CheckInInput) => {
            const response = await apiClient.post("/attendance/check-in", data);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Checked in successfully");
            queryClient.invalidateQueries({ queryKey: ["laborTimesheets"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Check-in failed");
        },
    });
};

export const useCheckOut = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CheckOutInput) => {
            const response = await apiClient.post("/attendance/check-out", data);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Checked out successfully");
            queryClient.invalidateQueries({ queryKey: ["laborTimesheets"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Check-out failed");
        },
    });
};
