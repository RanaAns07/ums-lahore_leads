"use client";

import { useState } from "react";
import { useRecordPayment } from "@/hooks/use-finance";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, DollarSign } from "lucide-react";
import { PermissionGate } from "@/components/shared/PermissionGate";

interface RecordPaymentModalProps {
    invoiceId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    maxAmount: number;
}

export function RecordPaymentModal({ invoiceId, open, onOpenChange, maxAmount }: RecordPaymentModalProps) {
    const recordPayment = useRecordPayment();

    const [formData, setFormData] = useState({
        amount_paid: maxAmount,
        payment_method: "BANK_TRANSFER",
        transaction_reference: "",
        notes: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        recordPayment.mutate({ invoiceId, data: formData }, {
            onSuccess: () => {
                onOpenChange(false);
                setFormData(prev => ({ ...prev, amount_paid: maxAmount, transaction_reference: "", notes: "" }));
            }
        });
    };

    return (
        <PermissionGate permission="finance.write">
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Record Payment</DialogTitle>
                            <DialogDescription>Process a payment for this invoice.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount Due: <span className="font-semibold text-red-600">${maxAmount.toFixed(2)}</span></Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="amount"
                                        type="number"
                                        required
                                        min={0.01}
                                        max={maxAmount}
                                        step={0.01}
                                        className="pl-9"
                                        value={formData.amount_paid}
                                        onChange={e => setFormData({ ...formData, amount_paid: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Payment Method</Label>
                                <Select required value={formData.payment_method} onValueChange={(val) => setFormData({ ...formData, payment_method: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                        <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                                        <SelectItem value="CASH">Cash</SelectItem>
                                        <SelectItem value="CHECK">Check</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ref">Transaction Reference</Label>
                                <Input id="ref" value={formData.transaction_reference} onChange={e => setFormData({ ...formData, transaction_reference: e.target.value })} placeholder="e.g. TXN-12345" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Input id="notes" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Optional notes" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={recordPayment.isPending} className="bg-green-600 hover:bg-green-700 text-white">
                                {recordPayment.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing... </> : "Process Payment"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </PermissionGate>
    );
}
