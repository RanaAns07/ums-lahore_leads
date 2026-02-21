"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { financeApi } from "@/lib/api/finance";

// ============================================
// FINANCE QUERY HOOKS
// ============================================

export function useInvoices(params?: { status?: string }) {
    return useQuery({
        queryKey: ["invoices", params],
        queryFn: () => financeApi.getInvoices(params),
    });
}

export function useInvoice(id: string) {
    return useQuery({
        queryKey: ["invoice", id],
        queryFn: () => financeApi.getInvoice(id),
        enabled: !!id,
    });
}

export function usePaymentsByInvoice(invoiceId: string) {
    return useQuery({
        queryKey: ["invoice-payments", invoiceId],
        queryFn: () => financeApi.getPaymentsByInvoice(invoiceId),
        enabled: !!invoiceId,
    });
}

export function useRecordPayment() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({
            invoiceId,
            data,
        }: {
            invoiceId: string;
            data: { amount_paid: number; payment_method: string; transaction_reference?: string; notes?: string };
        }) => financeApi.recordPayment(invoiceId, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            queryClient.invalidateQueries({ queryKey: ["invoice", variables.invoiceId] });
            queryClient.invalidateQueries({ queryKey: ["invoice-payments", variables.invoiceId] });
            queryClient.invalidateQueries({ queryKey: ["fund-balances"] });
            queryClient.invalidateQueries({ queryKey: ["financial-summary"] });
            toast({ title: "Payment Recorded", description: "Payment has been recorded successfully." });
        },
        onError: (err: unknown) => {
            const errorObj = err as { response?: { data?: { message?: string } } };
            toast({
                title: "Payment Failed",
                description: errorObj?.response?.data?.message || "Failed to record payment.",
                variant: "destructive",
            });
        },
    });
}

export function useFundBalances() {
    return useQuery({
        queryKey: ["fund-balances"],
        queryFn: () => financeApi.getFundBalances(),
    });
}

export function useFinancialSummary(params?: { start_date?: string; end_date?: string }) {
    return useQuery({
        queryKey: ["financial-summary", params],
        queryFn: () => financeApi.getFinancialSummary(params),
    });
}

export function useGeneralLedger(params?: { start_date?: string; end_date?: string; fund_id?: string }) {
    return useQuery({
        queryKey: ["general-ledger", params],
        queryFn: () => financeApi.getGeneralLedger(params),
    });
}
