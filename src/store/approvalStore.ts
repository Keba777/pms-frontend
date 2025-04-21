// store/approvalStore.ts
import { Approval } from "@/types/approval";
import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

interface ApprovalStore {
    approvals: Approval[];
    setApprovals: (approvals: Approval[]) => void;
    addApproval: (approval: Approval) => void;
    updateApproval: (updatedApproval: Approval) => void;
    deleteApproval: (approvalId: string) => void;
}

export const useApprovalStore = create<ApprovalStore>()(
    persist(
        (set) => ({
            approvals: [],
            setApprovals: (approvals) => set({ approvals }),
            addApproval: (approval) =>
                set((state) => ({ approvals: [...state.approvals, approval] })),
            updateApproval: (updatedApproval) =>
                set((state) => ({
                    approvals: state.approvals.map((approval) =>
                        approval.id === updatedApproval.id ? updatedApproval : approval
                    ),
                })),
            deleteApproval: (approvalId) =>
                set((state) => ({
                    approvals: state.approvals.filter(
                        (approval) => approval.id !== approvalId
                    ),
                })),
        }),
        {
            name: "approval-store",
            storage: {
                getItem: (name: string): StorageValue<ApprovalStore> | null => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name: string, value: StorageValue<ApprovalStore>): void => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name: string): void => {
                    localStorage.removeItem(name);
                },
            } as PersistStorage<ApprovalStore>,
        }
    )
);