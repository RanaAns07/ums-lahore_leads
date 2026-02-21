"use client";

import { useParams, useRouter } from "next/navigation";
import { useInvoice, usePaymentsByInvoice, useRecordPayment } from "@/hooks/use-finance";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Receipt, CreditCard, DollarSign, Clock, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const paymentSchema = z.object({
    amount_paid: z.coerce.number().min(0.01, "Amount must be greater than 0"),
    payment_method: z.string().min(1, "Payment method is required"),
    transaction_reference: z.string().optional(),
    notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function InvoiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: invoice, isLoading: invLoading } = useInvoice(id);
    const { data: payments = [], isLoading: paysLoading } = usePaymentsByInvoice(id);
    const recordPayment = useRecordPayment();

    const form = useForm<PaymentFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(paymentSchema) as any,
        defaultValues: { amount_paid: 0, payment_method: "", transaction_reference: "", notes: "" },
    });

    const onSubmitPayment = (data: PaymentFormValues) => {
        recordPayment.mutate(
            { invoiceId: id, data },
            { onSuccess: () => form.reset() }
        );
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

    if (invLoading) return <LoadingSkeleton rows={8} columns={3} />;
    if (!invoice) return <div className="p-8 text-center text-muted-foreground">Invoice not found.</div>;

    const totalAmount = Number(invoice.total_amount);
    const paidAmount = Number(invoice.paid_amount);
    const remaining = totalAmount - paidAmount;
    const paidPercent = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/finance")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h3 className="text-2xl font-bold tracking-tight text-[#002147]">Invoice Detail</h3>
                    <p className="text-muted-foreground font-mono text-sm">{id}</p>
                </div>
                <StatusBadge status={invoice.status} />
            </div>

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#002147]">{formatCurrency(totalAmount)}</div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Paid</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                        <DollarSign className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{formatCurrency(remaining)}</div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Due Date</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#002147]">{new Date(invoice.due_date).toLocaleDateString()}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Progress Bar */}
            <div>
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Payment Progress</span>
                    <span className="font-medium">{paidPercent.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                    <div
                        className={`h-3 rounded-full transition-all ${paidPercent >= 100 ? "bg-green-500" : paidPercent > 0 ? "bg-amber-400" : "bg-slate-200"}`}
                        style={{ width: `${Math.min(paidPercent, 100)}%` }}
                    />
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-7">
                {/* Invoice Items */}
                <Card className="lg:col-span-4 shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-base">Fee Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">Fee Type</th>
                                    <th className="px-4 py-3 text-left font-semibold">Description</th>
                                    <th className="px-4 py-3 text-right font-semibold">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items && invoice.items.length > 0 ? (
                                    invoice.items.map((item) => (
                                        <tr key={item.id} className="border-b last:border-0 hover:bg-slate-50/50">
                                            <td className="px-4 py-3 font-medium">{item.fee_type}</td>
                                            <td className="px-4 py-3 text-slate-600">{item.description}</td>
                                            <td className="px-4 py-3 text-right font-medium">{formatCurrency(Number(item.amount))}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">No line items.</td>
                                    </tr>
                                )}
                                <tr className="bg-slate-50 font-semibold">
                                    <td className="px-4 py-3" colSpan={2}>Total</td>
                                    <td className="px-4 py-3 text-right">{formatCurrency(totalAmount)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* Record Payment Form */}
                <Card className="lg:col-span-3 shadow-sm border-slate-200 bg-slate-50/30">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-[#FFD700]" /> Record Payment
                        </CardTitle>
                        <CardDescription>Record a payment for this invoice.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PermissionGate
                            permission="finance.write"
                            fallback={<p className="text-sm text-muted-foreground">No write permission.</p>}
                        >
                            {invoice.status === "PAID" ? (
                                <div className="text-center py-6">
                                    <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                                    <p className="font-medium text-green-700">Fully Paid</p>
                                    <p className="text-xs text-muted-foreground mt-1">No further payments needed.</p>
                                </div>
                            ) : (
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmitPayment)} className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="amount_paid"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Amount</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" step="0.01" className="bg-white" placeholder={`Max: ${remaining}`} {...field} />
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
                                                    <FormLabel>Payment Method</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-white">
                                                                <SelectValue placeholder="Select method" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="CASH">Cash</SelectItem>
                                                            <SelectItem value="CARD">Card</SelectItem>
                                                            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                                            <SelectItem value="ONLINE">Online</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="transaction_reference"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Reference (Optional)</FormLabel>
                                                    <FormControl>
                                                        <Input className="bg-white" placeholder="Receipt #" {...field} />
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
                                                        <Input className="bg-white" placeholder="Payment notes" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                type="submit"
                                                className="flex-1 bg-[#FFD700] hover:bg-[#e6c200] text-[#002147] font-semibold"
                                                disabled={recordPayment.isPending}
                                            >
                                                {recordPayment.isPending ? "Recording..." : "Record Payment"}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    form.setValue("amount_paid", remaining);
                                                }}
                                                className="text-xs"
                                                disabled={remaining <= 0}
                                            >
                                                Pay Full
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            )}
                        </PermissionGate>
                    </CardContent>
                </Card>
            </div>

            {/* Payment History */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader>
                    <CardTitle className="text-base">Payment History</CardTitle>
                    <CardDescription>{payments.length} payment(s) recorded</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {paysLoading ? (
                        <div className="p-4 animate-pulse space-y-3">
                            {[1, 2].map((i) => <div key={i} className="h-12 bg-slate-100 rounded" />)}
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">No payments recorded yet.</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                                    <th className="px-4 py-3 text-left font-semibold">Method</th>
                                    <th className="px-4 py-3 text-left font-semibold">Reference</th>
                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                    <th className="px-4 py-3 text-right font-semibold">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((pay) => (
                                    <tr key={pay.id} className="border-b last:border-0 hover:bg-slate-50/50">
                                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{new Date(pay.created_at).toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{pay.payment_method}</span>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{pay.transaction_reference || "—"}</td>
                                        <td className="px-4 py-3"><StatusBadge status={pay.status} /></td>
                                        <td className="px-4 py-3 text-right font-medium text-green-600">+{formatCurrency(Number(pay.amount_paid))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
