"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";

const paymentSchema = z.object({
    invoiceId: z.string().min(1, "Invoice is required"),
    amount_paid: z.coerce.number().min(1, "Amount must be greater than 0"),
    payment_method: z.string().min(1, "Payment method is required"),
    transaction_reference: z.string().optional(),
    notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface FundBalance {
    id: string;
    name: string;
    balance: number;
}

interface LedgerEntry {
    id: string;
    transaction_type: string;
    amount: number;
    description: string;
    created_at: string;
}

interface Invoice {
    id: string;
    status: string;
    total_amount: number;
    amount_paid: number;
    enrollment: {
        student_profile: {
            first_name: string;
            last_name: string;
        };
    };
}

export default function FinancePage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            invoiceId: "",
            amount_paid: 0,
            payment_method: "BANK_TRANSFER",
            transaction_reference: "",
            notes: "",
        },
    });

    // Queries
    const { data: fundBalances = [], isLoading: fundsLoading } = useQuery<FundBalance[]>({
        queryKey: ["fund-balances"],
        queryFn: async () => {
            const res = await api.get("/finance/reports/fund-balances");
            return res.data;
        },
    });

    const { data: ledger = [], isLoading: ledgerLoading } = useQuery<LedgerEntry[]>({
        queryKey: ["general-ledger"],
        queryFn: async () => {
            const res = await api.get("/finance/reports/general-ledger");
            return res.data;
        },
    });

    const { data: invoices = [], isLoading: invoicesLoading } = useQuery<Invoice[]>({
        queryKey: ["invoices"],
        queryFn: async () => {
            const res = await api.get("/finance/billing/invoices?status=PENDING"); // Only pending
            // If endpoint doesn't support status query, we can filter in the frontend MVP
            return res.data.filter ? res.data.filter((inv: Invoice) => inv.status !== 'PAID') : res.data;
        },
    });

    // Mutation
    const recordPayment = useMutation({
        mutationFn: async (data: PaymentFormValues) => {
            await api.post(`/finance/payments/invoices/${data.invoiceId}/pay`, {
                amount_paid: data.amount_paid,
                payment_method: data.payment_method,
                transaction_reference: data.transaction_reference,
                notes: data.notes,
            });
        },
        onSuccess: () => {
            toast({ title: "Payment Recorded", description: "Successfully applied payment to invoice." });
            queryClient.invalidateQueries({ queryKey: ["fund-balances"] });
            queryClient.invalidateQueries({ queryKey: ["general-ledger"] });
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            form.reset();
        },
        onError: () => {
            toast({ title: "Payment Failed", description: "There was an error recording this payment.", variant: "destructive" });
        },
    });

    const onSubmit = (data: PaymentFormValues) => {
        recordPayment.mutate(data);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
    };

    if (fundsLoading || ledgerLoading || invoicesLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse"></div>)}
                </div>
                <div className="h-96 bg-slate-100 rounded-xl animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            <div>
                <h3 className="text-2xl font-bold tracking-tight text-[#002147]">Finance Ledger</h3>
                <p className="text-muted-foreground">View fund balances, invoices, and record payments.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {fundBalances.map((fund) => (
                    <Card key={fund.id} className="border-slate-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{fund.name}</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#002147]">{formatCurrency(fund.balance)}</div>
                        </CardContent>
                    </Card>
                ))}
                {fundBalances.length === 0 && (
                    <Card className="border-dashed bg-slate-50 col-span-full">
                        <CardContent className="pt-6 text-center text-muted-foreground">
                            No active funds found.
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                <Card className="md:col-span-4 shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle>General Ledger</CardTitle>
                        <CardDescription>Recent financial transactions across all accounts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Date</th>
                                        <th className="px-4 py-3 font-semibold">Type</th>
                                        <th className="px-4 py-3 font-semibold">Description</th>
                                        <th className="px-4 py-3 font-semibold text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ledger.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                                No transactions found.
                                            </td>
                                        </tr>
                                    ) : (
                                        ledger.map((entry) => (
                                            <tr key={entry.id} className="border-b last:border-0 hover:bg-slate-50/50">
                                                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                                    {new Date(entry.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${entry.amount >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {entry.amount >= 0 ? <TrendingUp className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                        {entry.transaction_type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-700">{entry.description}</td>
                                                <td className={`px-4 py-3 text-right font-medium ${entry.amount >= 0 ? 'text-green-600' : 'text-slate-900'}`}>
                                                    {entry.amount >= 0 ? '+' : ''}{formatCurrency(entry.amount)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-3 shadow-sm border-slate-200 bg-slate-50/30">
                    <CardHeader>
                        <CardTitle>Record Payment</CardTitle>
                        <CardDescription>Process an incoming payment for an invoice.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="invoiceId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Invoice</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-white">
                                                        <SelectValue placeholder="Select a pending invoice" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {invoices.map((inv) => (
                                                        <SelectItem key={inv.id} value={inv.id}>
                                                            {inv.id.substring(0, 8).toUpperCase()} - {inv.enrollment?.student_profile?.first_name || 'Student'} ({formatCurrency(inv.total_amount - inv.amount_paid)} due)
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="amount_paid"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Amount Paid</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" className="bg-white" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="payment_method"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Method</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white">
                                                            <SelectValue placeholder="Select method" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                                        <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                                                        <SelectItem value="CASH">Cash</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="transaction_reference"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reference (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Receipt or Tx ID" className="bg-white" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notes (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Extra details..." className="bg-white" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full bg-[#002147] hover:bg-[#002147]/90 text-white" disabled={recordPayment.isPending}>
                                    {recordPayment.isPending ? "Recording..." : "Record Payment"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
