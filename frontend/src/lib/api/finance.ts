import api from '@/lib/api';
import type {
    Invoice,
    Payment,
    Fund,
    FinancialTransaction,
    FinancialSummary,
} from '@/types';

// ============================================
// FINANCE API SERVICE LAYER
// ============================================

export const financeApi = {
    // ---- Fee Structures ----
    getFeeStructures: (params?: { program_id?: string; semester_id?: string }) =>
        api.get<any[]>('/finance/billing/fee-structures', { params }).then((r) => r.data),

    createFeeStructure: (data: any) =>
        api.post<any>('/finance/billing/fee-structures', data).then((r) => r.data),
    // ---- Billing / Invoices ----

    getInvoices: (params?: { status?: string }) =>
        api.get<Invoice[]>('/finance/billing/invoices', { params }).then((r) => r.data),

    getInvoice: (id: string) =>
        api.get<Invoice>(`/finance/billing/invoices/${id}`).then((r) => r.data),

    getInvoicesByEnrollment: (enrollmentId: string) =>
        api.get<Invoice[]>(`/finance/billing/enrollments/${enrollmentId}/invoices`).then((r) => r.data),

    // ---- Payments ----

    recordPayment: (
        invoiceId: string,
        data: { amount_paid: number; payment_method: string; transaction_reference?: string; notes?: string }
    ) => api.post<Payment>(`/finance/payments/invoices/${invoiceId}/pay`, data).then((r) => r.data),

    getPayments: (params?: { status?: string }) =>
        api.get<Payment[]>('/finance/payments', { params }).then((r) => r.data),

    getPaymentsByInvoice: (invoiceId: string) =>
        api.get<Payment[]>(`/finance/payments/invoices/${invoiceId}/payments`).then((r) => r.data),

    // ---- Reports ----

    getFundBalances: () =>
        api.get<Fund[]>('/finance/reports/fund-balances').then((r) => r.data),

    getFinancialSummary: (params?: { start_date?: string; end_date?: string }) =>
        api.get<FinancialSummary>('/finance/reports/summary', { params }).then((r) => r.data),

    getGeneralLedger: (params?: { start_date?: string; end_date?: string; fund_id?: string }) =>
        api.get<FinancialTransaction[]>('/finance/reports/general-ledger', { params }).then((r) => r.data),
};
