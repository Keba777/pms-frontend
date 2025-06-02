// store/issueStore.ts
import { Issue } from "@/types/issue";
import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

interface IssueStore {
    issues: Issue[];
    setIssues: (issues: Issue[]) => void;
    addIssue: (issue: Issue) => void;
    updateIssue: (updatedIssue: Issue) => void;
    deleteIssue: (issueId: string) => void;
}

export const useIssueStore = create<IssueStore>()(
    persist(
        (set) => ({
            issues: [],
            setIssues: (issues) => set({ issues }),
            addIssue: (issue) =>
                set((state) => ({ issues: [...state.issues, issue] })),
            updateIssue: (updatedIssue) =>
                set((state) => ({
                    issues: state.issues.map((issue) =>
                        issue.id === updatedIssue.id ? updatedIssue : issue
                    ),
                })),
            deleteIssue: (issueId) =>
                set((state) => ({
                    issues: state.issues.filter((issue) => issue.id !== issueId),
                })),
        }),
        {
            name: "issue-store",
            storage: {
                getItem: (name: string): StorageValue<IssueStore> | null => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name: string, value: StorageValue<IssueStore>): void => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name: string): void => {
                    localStorage.removeItem(name);
                },
            } as PersistStorage<IssueStore>,
        }
    )
);
