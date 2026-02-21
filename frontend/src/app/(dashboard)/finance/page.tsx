"use client";

import { useState } from "react";
import Link from "next/link";
import { useInvoices, useFundBalances, useGeneralLedger } from "@/hooks/use-finance";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, ArrowDownRight, Eye, CreditCard, Receipt, Wallet } from "lucide-react";

const INVOICE_STATUSES = ["UNPAID", "PARTIAL", "PAID", "VOID"];

export default function FinancePage() {
    const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>("ALL");

    const { data: invoices = [], isLoading: invoicesLoading } = useInvoices(
        invoiceStatusFilter !== "ALL" ? { status: invoiceStatusFilter } : undefined
    );
    const { data: fundBalances = [], isLoading: fundsLoading } = useFundBalances();
    const { data: ledger = [], isLoading: ledgerLoading } = useGeneralLedger();

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

    const totalFunds = fundBalances.reduce((acc, f) => acc + Number(f.balance), 0);
    const totalInvoiced = invoices.reduce((acc, i) => acc + Number(i.total_amount), 0);
    const totalCollected = invoices.reduce((acc, i) => acc + Number(i.paid_amount), 0);
    const totalOutstanding = totalInvoiced - totalCollected;

    if (invoicesLoading || fundsLoading || ledgerLoading) return <LoadingSkeleton rows={8} columns={4} />;

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <div>
                <h3 className="text-2xl font-bold tracking-tight text-[#002147]">Finance Overview</h3>
                <p className="text-muted-foreground">Fund balances, invoices, and transaction history.</p>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Total Fund Balance" value={formatCurrency(totalFunds)} icon={Wallet} iconColor="text-[#002147]" />
                <StatsCard title="Total Invoiced" value={formatCurrency(totalInvoiced)} icon={Receipt} iconColor="text-blue-500" description={`${invoices.length} invoices`} />
                <StatsCard title="Total Collected" value={formatCurrency(totalCollected)} icon={CreditCard} iconColor="text-green-500" />
                <StatsCard title="Outstanding" value={formatCurrency(totalOutstanding)} icon={DollarSign} iconColor="text-amber-500" />
            </div>

            {/* Fund Balances */}
            {fundBalances.length > 0 && (
                <div>
                    <h4 className="text-base font-semibold text-[#002147] mb-3">Fund Accounts</h4>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {fundBalances.map((fund) => (
                            <Card key={fund.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{fund.name.replace(/_/g, " ")}</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-[#002147]">{formatCurrency(Number(fund.balance))}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-7">
                {/* Invoice List */}
                <Card className="lg:col-span-4 shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Invoices</CardTitle>
                            <CardDescription>Student billing records.</CardDescription>
                        </div>
                        <Select value={invoiceStatusFilter} onValueChange={setInvoiceStatusFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Filter" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All</SelectItem>
                                {INVOICE_STATUSES.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Invoice</th>
                                        <th className="px-4 py-3 font-semibold">Due Date</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold text-right">Amount</th>
                                        <th className="px-4 py-3 font-semibold text-right">Paid</th>
                                        <th className="px-4 py-3 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.length === 0 ? (
                                        <tr>
                                            <td colSpan={6}>
                                                <EmptyState title="No invoices" description="No invoices match the filter." />
                                            </td>
                                        </tr>
                                    ) : (
                                        invoices.slice(0, 30).map((inv) => (
                                            <tr key={inv.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-3 font-mono text-xs text-slate-500">{inv.id.slice(0, 8)}...</td>
                                                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{new Date(inv.due_date).toLocaleDateString()}</td>
                                                <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                                                <td className="px-4 py-3 text-right font-medium">{formatCurrency(Number(inv.total_amount))}</td>
                                                <td className="px-4 py-3 text-right text-green-600">{formatCurrency(Number(inv.paid_amount))}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button size="sm" variant="ghost" asChild>
                                                        <Link href={`/finance/invoices/${inv.id}`}>
                                                            <Eye className="w-3.5 h-3.5 mr-1" /> View
                                                        </Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* General Ledger */}
                <Card className="lg:col-span-3 shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle>General Ledger</CardTitle>
                        <CardDescription>Recent financial transactions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b sticky top-0">
                                    <tr>
                                        <th className="px-3 py-2 font-semibold">Date</th>
                                        <th className="px-3 py-2 font-semibold">Type</th>
                                        <th className="px-3 py-2 font-semibold text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ledger.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-3 py-8 text-center text-muted-foreground">No transactions.</td>
                                        </tr>
                                    ) : (
                                        ledger.slice(0, 30).map((entry) => {
                                            const isInflow = entry.type === "INFLOW";
                                            return (
                                                <tr key={entry.id} className="border-b last:border-0 hover:bg-slate-50/50">
                                                    <td className="px-3 py-2 text-xs text-slate-500 whitespace-nowrap">{new Date(entry.created_at).toLocaleDateString()}</td>
                                                    <td className="px-3 py-2">
                                                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${isInflow ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                            {isInflow ? <TrendingUp className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                            {entry.type}
                                                        </span>
                                                    </td>
                                                    <td className={`px-3 py-2 text-right font-medium text-xs ${isInflow ? "text-green-600" : "text-red-700"}`}>
                                                        {isInflow ? "+" : "-"}{formatCurrency(Math.abs(Number(entry.amount)))}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
