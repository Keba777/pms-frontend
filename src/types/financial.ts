import { User } from "./user";
import { Project } from "./project";

// =======================
// Invoice Interfaces
// =======================
export interface Invoice {
    id: string;
    project_id: string;
    project?: Project;
    created_by: string;
    user?: User;
    type: "income" | "expense";
    amount: number;
    due_date: Date;
    status: "pending" | "paid" | "overdue";
    description?: string;
    gross_amount: number;
    vat_amount: number;
    withholding_amount: number;
    retention_amount: number;
    advance_recovery_amount: number;
    net_amount: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateInvoiceInput {
    project_id: string;
    created_by: string;
    type: "income" | "expense";
    amount: number;
    due_date: Date;
    status?: "pending" | "paid" | "overdue";
    description?: string;
    gross_amount: number;
    vat_amount?: number;
    withholding_amount?: number;
    retention_amount?: number;
    advance_recovery_amount?: number;
    net_amount: number;
}

export interface UpdateInvoiceInput {
    id?: string;
    project_id?: string;
    created_by?: string;
    type?: "income" | "expense";
    amount?: number;
    due_date?: Date;
    status?: "pending" | "paid" | "overdue";
    description?: string;
    gross_amount?: number;
    vat_amount?: number;
    withholding_amount?: number;
    retention_amount?: number;
    advance_recovery_amount?: number;
    net_amount?: number;
}

// =======================
// Payment Interfaces
// =======================
export interface Payment {
    id: string;
    invoice_id: string;
    invoice?: Invoice;
    recorded_by: string;
    user?: User;
    amount_paid: number;
    payment_date: Date;
    method: "cash" | "bank_transfer" | "check" | "mobile_money";
    reference_number?: string;
    reason?: string;
    vat_amount?: number;
    withholding_amount?: number;
    attachment_url?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreatePaymentInput {
    invoice_id: string;
    recorded_by: string;
    amount_paid: number;
    payment_date: Date;
    method: "cash" | "bank_transfer" | "check" | "mobile_money";
    reference_number?: string;
    reason?: string;
    vat_amount?: number;
    withholding_amount?: number;
    attachment_url?: string;
}

export interface UpdatePaymentInput {
    id?: string;
    invoice_id?: string;
    recorded_by?: string;
    amount_paid?: number;
    payment_date?: Date;
    method?: "cash" | "bank_transfer" | "check" | "mobile_money";
    reference_number?: string;
    reason?: string;
    vat_amount?: number;
    withholding_amount?: number;
    attachment_url?: string;
}

// =======================
// Budget Interfaces
// =======================
export interface Budget {
    id: string;
    project_id: string;
    project?: Project;
    allocated_amount: number;
    spent_amount: number;
    remaining_amount: number;
    description?: string;
    status: "planned" | "active" | "closed";
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateBudgetInput {
    project_id: string;
    allocated_amount: number;
    spent_amount: number;
    remaining_amount: number;
    description?: string;
    status?: "planned" | "active" | "closed";
}

export interface UpdateBudgetInput {
    id?: string;
    project_id?: string;
    allocated_amount?: number;
    spent_amount?: number;
    remaining_amount?: number;
    description?: string;
    status?: "planned" | "active" | "closed";
}

// =======================
// Payroll Interfaces
// =======================
export interface Payroll {
    id: string;
    project_id: string;
    project?: Project; // Project model type
    user_id: string;
    user?: User; // User model type
    amount: number;
    pay_period: string;
    status: "pending" | "paid";
    basic_salary: number;
    allowances: number;
    gross_salary: number;
    income_tax: number;
    pension_employee: number;
    pension_employer: number;
    net_pay: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreatePayrollInput {
    project_id: string;
    user_id: string;
    amount: number;
    pay_period: string;
    status?: "pending" | "paid";
    basic_salary: number;
    allowances: number;
    gross_salary: number;
    income_tax: number;
    pension_employee: number;
    pension_employer: number;
    net_pay: number;
}

export interface UpdatePayrollInput {
    id?: string;
    project_id?: string;
    user_id?: string;
    amount?: number;
    pay_period?: string;
    status?: "pending" | "paid";
    basic_salary?: number;
    allowances?: number;
    gross_salary?: number;
    income_tax?: number;
    pension_employee?: number;
    pension_employer?: number;
    net_pay?: number;
}
