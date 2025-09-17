"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "react-toastify";
import apiClient from "@/services/api-client";

import {
    Invoice,
    CreateInvoiceInput,
    UpdateInvoiceInput,
    Payment,
    CreatePaymentInput,
    UpdatePaymentInput,
    Budget,
    CreateBudgetInput,
    UpdateBudgetInput,
    Payroll,
    CreatePayrollInput,
    UpdatePayrollInput,
} from "@/types/financial";

import {
    useInvoiceStore,
    usePaymentStore,
    useBudgetStore,
    usePayrollStore,
} from "@/store/financialStore";

// ----------------------------
// Shared API Response Type
// ----------------------------
interface ApiResponse<T> {
    success: boolean;
    data: T;
}

/* ======================================================
   INVOICES
====================================================== */
const fetchInvoices = async (): Promise<Invoice[]> => {
    const response = await apiClient.get<ApiResponse<Invoice[]>>("/invoices");
    return response.data.data;
};

const fetchInvoiceById = async (id: string): Promise<Invoice | null> => {
    try {
        const response = await apiClient.get<ApiResponse<Invoice>>(`/invoices/${id}`);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching invoice:", error);
        return null;
    }
};

const createInvoice = async (data: CreateInvoiceInput): Promise<Invoice> => {
    const response = await apiClient.post<ApiResponse<Invoice>>("/invoices", data);
    return response.data.data;
};

const updateInvoice = async (data: UpdateInvoiceInput): Promise<Invoice> => {
    const response = await apiClient.put<ApiResponse<Invoice>>(`/invoices/${data.id}`, data);
    return response.data.data;
};

const deleteInvoice = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/invoices/${id}`);
    return response.data.data;
};

// React Query Hooks for Invoices
export const useInvoices = () => {
    const setInvoices = useInvoiceStore((s) => s.setInvoices);

    const query = useQuery<Invoice[], Error>({
        queryKey: ["invoices"],
        queryFn: fetchInvoices,
    });

    useEffect(() => {
        if (query.data) setInvoices(query.data);
    }, [query.data, setInvoices]);

    return query;
};

export const useInvoice = (id: string) =>
    useQuery<Invoice | null, Error>({
        queryKey: ["invoice", id],
        queryFn: () => fetchInvoiceById(id),
        enabled: !!id,
    });

export const useCreateInvoice = (onSuccess?: (invoice: Invoice) => void) => {
    const queryClient = useQueryClient();
    const addInvoice = useInvoiceStore((s) => s.addInvoice);

    return useMutation({
        mutationFn: createInvoice,
        onSuccess: (invoice) => {
            toast.success("Invoice created successfully!");
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            addInvoice(invoice);
            if (onSuccess) onSuccess(invoice);
        },
        onError: () => toast.error("Failed to create invoice"),
    });
};

export const useUpdateInvoice = () => {
    const queryClient = useQueryClient();
    const updateInvoiceStore = useInvoiceStore((s) => s.updateInvoice);

    return useMutation({
        mutationFn: updateInvoice,
        onSuccess: (invoice) => {
            toast.success("Invoice updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            updateInvoiceStore(invoice);
        },
        onError: () => toast.error("Failed to update invoice"),
    });
};

export const useDeleteInvoice = () => {
    const queryClient = useQueryClient();
    const deleteInvoiceStore = useInvoiceStore((s) => s.deleteInvoice);

    return useMutation({
        mutationFn: deleteInvoice,
        onSuccess: (_, id) => {
            toast.success("Invoice deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            deleteInvoiceStore(id);
        },
        onError: () => toast.error("Failed to delete invoice"),
    });
};

/* ======================================================
   PAYMENTS
====================================================== */
const fetchPayments = async (): Promise<Payment[]> => {
    const response = await apiClient.get<ApiResponse<Payment[]>>("/payments");
    return response.data.data;
};

const fetchPaymentById = async (id: string): Promise<Payment | null> => {
    try {
        const response = await apiClient.get<ApiResponse<Payment>>(`/payments/${id}`);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching payment:", error);
        return null;
    }
};

const createPayment = async (data: CreatePaymentInput): Promise<Payment> => {
    const response = await apiClient.post<ApiResponse<Payment>>("/payments", data);
    return response.data.data;
};

const updatePayment = async (data: UpdatePaymentInput): Promise<Payment> => {
    const response = await apiClient.put<ApiResponse<Payment>>(`/payments/${data.id}`, data);
    return response.data.data;
};

const deletePayment = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/payments/${id}`);
    return response.data.data;
};

// React Query Hooks for Payments
export const usePayments = () => {
    const setPayments = usePaymentStore((s) => s.setPayments);

    const query = useQuery<Payment[], Error>({
        queryKey: ["payments"],
        queryFn: fetchPayments,
    });

    useEffect(() => {
        if (query.data) setPayments(query.data);
    }, [query.data, setPayments]);

    return query;
};

export const usePayment = (id: string) =>
    useQuery<Payment | null, Error>({
        queryKey: ["payment", id],
        queryFn: () => fetchPaymentById(id),
        enabled: !!id,
    });

export const useCreatePayment = (onSuccess?: (payment: Payment) => void) => {
    const queryClient = useQueryClient();
    const addPayment = usePaymentStore((s) => s.addPayment);

    return useMutation({
        mutationFn: createPayment,
        onSuccess: (payment) => {
            toast.success("Payment created successfully!");
            queryClient.invalidateQueries({ queryKey: ["payments"] });
            addPayment(payment);
            if (onSuccess) onSuccess(payment);
        },
        onError: () => toast.error("Failed to create payment"),
    });
};

export const useUpdatePayment = () => {
    const queryClient = useQueryClient();
    const updatePaymentStore = usePaymentStore((s) => s.updatePayment);

    return useMutation({
        mutationFn: updatePayment,
        onSuccess: (payment) => {
            toast.success("Payment updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["payments"] });
            updatePaymentStore(payment);
        },
        onError: () => toast.error("Failed to update payment"),
    });
};

export const useDeletePayment = () => {
    const queryClient = useQueryClient();
    const deletePaymentStore = usePaymentStore((s) => s.deletePayment);

    return useMutation({
        mutationFn: deletePayment,
        onSuccess: (_, id) => {
            toast.success("Payment deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["payments"] });
            deletePaymentStore(id);
        },
        onError: () => toast.error("Failed to delete payment"),
    });
};

/* ======================================================
   BUDGETS
====================================================== */
const fetchBudgets = async (): Promise<Budget[]> => {
    const response = await apiClient.get<ApiResponse<Budget[]>>("/budgets");
    return response.data.data;
};

const fetchBudgetById = async (id: string): Promise<Budget | null> => {
    try {
        const response = await apiClient.get<ApiResponse<Budget>>(`/budgets/${id}`);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching budget:", error);
        return null;
    }
};

const createBudget = async (data: CreateBudgetInput): Promise<Budget> => {
    const response = await apiClient.post<ApiResponse<Budget>>("/budgets", data);
    return response.data.data;
};

const updateBudget = async (data: UpdateBudgetInput): Promise<Budget> => {
    const response = await apiClient.put<ApiResponse<Budget>>(`/budgets/${data.id}`, data);
    return response.data.data;
};

const deleteBudget = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/budgets/${id}`);
    return response.data.data;
};

// React Query Hooks for Budgets
export const useBudgets = () => {
    const setBudgets = useBudgetStore((s) => s.setBudgets);

    const query = useQuery<Budget[], Error>({
        queryKey: ["budgets"],
        queryFn: fetchBudgets,
    });

    useEffect(() => {
        if (query.data) setBudgets(query.data);
    }, [query.data, setBudgets]);

    return query;
};

export const useBudget = (id: string) =>
    useQuery<Budget | null, Error>({
        queryKey: ["budget", id],
        queryFn: () => fetchBudgetById(id),
        enabled: !!id,
    });

export const useCreateBudget = (onSuccess?: (budget: Budget) => void) => {
    const queryClient = useQueryClient();
    const addBudget = useBudgetStore((s) => s.addBudget);

    return useMutation({
        mutationFn: createBudget,
        onSuccess: (budget) => {
            toast.success("Budget created successfully!");
            queryClient.invalidateQueries({ queryKey: ["budgets"] });
            addBudget(budget);
            if (onSuccess) onSuccess(budget);
        },
        onError: () => toast.error("Failed to create budget"),
    });
};

export const useUpdateBudget = () => {
    const queryClient = useQueryClient();
    const updateBudgetStore = useBudgetStore((s) => s.updateBudget);

    return useMutation({
        mutationFn: updateBudget,
        onSuccess: (budget) => {
            toast.success("Budget updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["budgets"] });
            updateBudgetStore(budget);
        },
        onError: () => toast.error("Failed to update budget"),
    });
};

export const useDeleteBudget = () => {
    const queryClient = useQueryClient();
    const deleteBudgetStore = useBudgetStore((s) => s.deleteBudget);

    return useMutation({
        mutationFn: deleteBudget,
        onSuccess: (_, id) => {
            toast.success("Budget deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["budgets"] });
            deleteBudgetStore(id);
        },
        onError: () => toast.error("Failed to delete budget"),
    });
};

/* ======================================================
   PAYROLLS
====================================================== */
const fetchPayrolls = async (): Promise<Payroll[]> => {
    const response = await apiClient.get<ApiResponse<Payroll[]>>("/payrolls");
    return response.data.data;
};

const fetchPayrollById = async (id: string): Promise<Payroll | null> => {
    try {
        const response = await apiClient.get<ApiResponse<Payroll>>(`/payrolls/${id}`);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching payroll:", error);
        return null;
    }
};

const createPayroll = async (data: CreatePayrollInput): Promise<Payroll> => {
    const response = await apiClient.post<ApiResponse<Payroll>>("/payrolls", data);
    return response.data.data;
};

const updatePayroll = async (data: UpdatePayrollInput): Promise<Payroll> => {
    const response = await apiClient.put<ApiResponse<Payroll>>(`/payrolls/${data.id}`, data);
    return response.data.data;
};

const deletePayroll = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/payrolls/${id}`);
    return response.data.data;
};

// React Query Hooks for Payrolls
export const usePayrolls = () => {
    const setPayrolls = usePayrollStore((s) => s.setPayrolls);

    const query = useQuery<Payroll[], Error>({
        queryKey: ["payrolls"],
        queryFn: fetchPayrolls,
    });

    useEffect(() => {
        if (query.data) setPayrolls(query.data);
    }, [query.data, setPayrolls]);

    return query;
};

export const usePayroll = (id: string) =>
    useQuery<Payroll | null, Error>({
        queryKey: ["payroll", id],
        queryFn: () => fetchPayrollById(id),
        enabled: !!id,
    });

export const useCreatePayroll = (onSuccess?: (payroll: Payroll) => void) => {
    const queryClient = useQueryClient();
    const addPayroll = usePayrollStore((s) => s.addPayroll);

    return useMutation({
        mutationFn: createPayroll,
        onSuccess: (payroll) => {
            toast.success("Payroll created successfully!");
            queryClient.invalidateQueries({ queryKey: ["payrolls"] });
            addPayroll(payroll);
            if (onSuccess) onSuccess(payroll);
        },
        onError: () => toast.error("Failed to create payroll"),
    });
};

export const useUpdatePayroll = () => {
    const queryClient = useQueryClient();
    const updatePayrollStore = usePayrollStore((s) => s.updatePayroll);

    return useMutation({
        mutationFn: updatePayroll,
        onSuccess: (payroll) => {
            toast.success("Payroll updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["payrolls"] });
            updatePayrollStore(payroll);
        },
        onError: () => toast.error("Failed to update payroll"),
    });
};

export const useDeletePayroll = () => {
    const queryClient = useQueryClient();
    const deletePayrollStore = usePayrollStore((s) => s.deletePayroll);

    return useMutation({
        mutationFn: deletePayroll,
        onSuccess: (_, id) => {
            toast.success("Payroll deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["payrolls"] });
            deletePayrollStore(id);
        },
        onError: () => toast.error("Failed to delete payroll"),
    });
};
