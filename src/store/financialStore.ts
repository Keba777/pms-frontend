import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";
import { Invoice, Payment, Budget, Payroll } from "@/types/financial";

// =======================
// Custom Storage Wrapper
// =======================
const createStorage = <T>(name: string): PersistStorage<T> => ({

    getItem: (key: string): StorageValue<T> | null => {
        console.log("Accessing storage for:", name)
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    },
    setItem: (key: string, value: StorageValue<T>): void => {
        localStorage.setItem(key, JSON.stringify(value));
    },
    removeItem: (key: string): void => {
        localStorage.removeItem(key);
    },
});

// =======================
// Invoice Store
// =======================
interface InvoiceStore {
    invoices: Invoice[];
    setInvoices: (invoices: Invoice[]) => void;
    addInvoice: (invoice: Invoice) => void;
    updateInvoice: (updated: Invoice) => void;
    deleteInvoice: (id: string) => void;
}

export const useInvoiceStore = create<InvoiceStore>()(
    persist(
        (set) => ({
            invoices: [],
            setInvoices: (invoices) => set({ invoices }),
            addInvoice: (invoice) =>
                set((state) => ({ invoices: [...state.invoices, invoice] })),
            updateInvoice: (updated) =>
                set((state) => ({
                    invoices: state.invoices.map((i) =>
                        i.id === updated.id ? updated : i
                    ),
                })),
            deleteInvoice: (id) =>
                set((state) => ({
                    invoices: state.invoices.filter((i) => i.id !== id),
                })),
        }),
        { name: "invoice-store", storage: createStorage<InvoiceStore>("invoice-store") }
    )
);

// =======================
// Payment Store
// =======================
interface PaymentStore {
    payments: Payment[];
    setPayments: (payments: Payment[]) => void;
    addPayment: (payment: Payment) => void;
    updatePayment: (updated: Payment) => void;
    deletePayment: (id: string) => void;
}

export const usePaymentStore = create<PaymentStore>()(
    persist(
        (set) => ({
            payments: [],
            setPayments: (payments) => set({ payments }),
            addPayment: (payment) =>
                set((state) => ({ payments: [...state.payments, payment] })),
            updatePayment: (updated) =>
                set((state) => ({
                    payments: state.payments.map((p) =>
                        p.id === updated.id ? updated : p
                    ),
                })),
            deletePayment: (id) =>
                set((state) => ({
                    payments: state.payments.filter((p) => p.id !== id),
                })),
        }),
        { name: "payment-store", storage: createStorage<PaymentStore>("payment-store") }
    )
);

// =======================
// Budget Store
// =======================
interface BudgetStore {
    budgets: Budget[];
    setBudgets: (budgets: Budget[]) => void;
    addBudget: (budget: Budget) => void;
    updateBudget: (updated: Budget) => void;
    deleteBudget: (id: string) => void;
}

export const useBudgetStore = create<BudgetStore>()(
    persist(
        (set) => ({
            budgets: [],
            setBudgets: (budgets) => set({ budgets }),
            addBudget: (budget) =>
                set((state) => ({ budgets: [...state.budgets, budget] })),
            updateBudget: (updated) =>
                set((state) => ({
                    budgets: state.budgets.map((b) =>
                        b.id === updated.id ? updated : b
                    ),
                })),
            deleteBudget: (id) =>
                set((state) => ({
                    budgets: state.budgets.filter((b) => b.id !== id),
                })),
        }),
        { name: "budget-store", storage: createStorage<BudgetStore>("budget-store") }
    )
);

// =======================
// Payroll Store
// =======================
interface PayrollStore {
    payrolls: Payroll[];
    setPayrolls: (payrolls: Payroll[]) => void;
    addPayroll: (payroll: Payroll) => void;
    updatePayroll: (updated: Payroll) => void;
    deletePayroll: (id: string) => void;
}

export const usePayrollStore = create<PayrollStore>()(
    persist(
        (set) => ({
            payrolls: [],
            setPayrolls: (payrolls) => set({ payrolls }),
            addPayroll: (payroll) =>
                set((state) => ({ payrolls: [...state.payrolls, payroll] })),
            updatePayroll: (updated) =>
                set((state) => ({
                    payrolls: state.payrolls.map((p) =>
                        p.id === updated.id ? updated : p
                    ),
                })),
            deletePayroll: (id) =>
                set((state) => ({
                    payrolls: state.payrolls.filter((p) => p.id !== id),
                })),
        }),
        { name: "payroll-store", storage: createStorage<PayrollStore>("payroll-store") }
    )
);
