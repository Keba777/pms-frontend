import { User } from "./user";
import { Project } from "./project";

// =======================
// Invoice Interfaces
// =======================
export interface Invoice {
    id: string;
    projectId: string;
    project?: Project;
    amount: number;
    dueDate: Date;
    status: "Pending" | "Paid" | "Overdue";
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateInvoiceInput {
    projectId: string;
    amount: number;
    dueDate: Date;
    status?: "Pending" | "Paid" | "Overdue";
}

export interface UpdateInvoiceInput {
    id?: string;
    projectId?: string;
    amount?: number;
    dueDate?: Date;
    status?: "Pending" | "Paid" | "Overdue";
}

// =======================
// Payment Interfaces
// =======================
export interface Payment {
    id: string;
    projectId: string;
    project?: Project;
    amount: number;
    method: "Cash" | "Bank Transfer" | "Credit Card" | "Mobile Money";
    date: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreatePaymentInput {
    projectId: string;
    amount: number;
    method: "Cash" | "Bank Transfer" | "Credit Card" | "Mobile Money";
    date: Date;
}

export interface UpdatePaymentInput {
    id?: string;
    projectId?: string;
    amount?: number;
    method?: "Cash" | "Bank Transfer" | "Credit Card" | "Mobile Money";
    date?: Date;
}

// =======================
// Budget Interfaces
// =======================
export interface Budget {
    id: string;
    projectId: string;
    project?: Project;
    total: number;
    allocated: number;
    spent: number;
    remaining: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateBudgetInput {
    projectId: string;
    total: number;
    allocated: number;
    spent: number;
    remaining: number;
}

export interface UpdateBudgetInput {
    id?: string;
    projectId?: string;
    total?: number;
    allocated?: number;
    spent?: number;
    remaining?: number;
}

// =======================
// Payroll Interfaces
// =======================
export interface Payroll {
    id: string;
    userId: string;
    user?: User;
    salary: number;
    month: string; // e.g. "2025-09"
    status: "Pending" | "Paid";
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreatePayrollInput {
    userId: string;
    salary: number;
    month: string;
    status?: "Pending" | "Paid";
}

export interface UpdatePayrollInput {
    id?: string;
    userId?: string;
    salary?: number;
    month?: string;
    status?: "Pending" | "Paid";
}
