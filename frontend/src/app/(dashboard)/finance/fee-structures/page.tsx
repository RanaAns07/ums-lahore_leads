"use client";

import { useState } from "react";
import { useFeeStructures, useCreateFeeStructure } from "@/hooks/use-finance";
import { usePrograms, useSemesters } from "@/hooks/use-academic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { PermissionGate } from "@/components/shared/PermissionGate";

const FEE_TYPES = ["TUITION", "LAB", "ADMISSION", "LIBRARY", "SPORTS", "EXAMINATION", "HOSTEL", "TRANSPORTATION", "MISCELLANEOUS"];

export default function FeeStructuresPage() {
    const { data: feeStructures = [], isLoading } = useFeeStructures();
    const { data: programs = [] } = usePrograms();
    const { data: semesters = [] } = useSemesters();
    const createFeeStructure = useCreateFeeStructure();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [formData, setFormData] = useState({
        program_id: "",
        semester_id: "",
        fee_type: "",
        amount: 0,
        description: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createFeeStructure.mutate(formData, {
            onSuccess: () => {
                setIsCreateOpen(false);
                setFormData({ program_id: "", semester_id: "", fee_type: "", amount: 0, description: "" });
            }
        });
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

    return (
        <div className="space-y-6 h-full flex flex-col pb-8">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-bold tracking-tight text-[#002147]">Fee Structures</h3>
                    <p className="text-muted-foreground">Define fees by program, semester, and type.</p>
                </div>
                <PermissionGate permission="finance.write">
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#002147] hover:bg-[#002147]/90 text-white">
                                <Plus className="w-4 h-4 mr-2" /> Add Fee Structure
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={handleSubmit}>
                                <DialogHeader>
                                    <DialogTitle>Add Fee Structure</DialogTitle>
                                    <DialogDescription>Create a new fee configuration.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Program</Label>
                                        <Select required value={formData.program_id} onValueChange={(val) => setFormData({ ...formData, program_id: val })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Program" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {programs.map(p => <SelectItem key={p.id} value={p.id}>{p.code} - {p.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Semester</Label>
                                        <Select required value={formData.semester_id} onValueChange={(val) => setFormData({ ...formData, semester_id: val })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Semester" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {semesters.map(s => <SelectItem key={s.id} value={s.id}>{s.name} {s.is_active ? "(Active)" : ""}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Fee Type</Label>
                                            <Select required value={formData.fee_type} onValueChange={(val) => setFormData({ ...formData, fee_type: val })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {FEE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="amount">Amount ($)</Label>
                                            <Input id="amount" type="number" required min={0} step={0.01} value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="desc">Description</Label>
                                        <Input id="desc" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Optional notes" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={createFeeStructure.isPending} className="bg-[#002147] hover:bg-[#002147]/90 text-white">
                                        {createFeeStructure.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving... </> : "Save"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </PermissionGate>
            </div>

            <Card className="border-none shadow-sm flex-1">
                <CardHeader className="bg-white border-b pb-4">
                    <CardTitle className="text-lg text-[#002147]">Configurations</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Program</th>
                                    <th className="px-6 py-4 font-semibold">Semester</th>
                                    <th className="px-6 py-4 font-semibold">Fee Type</th>
                                    <th className="px-6 py-4 font-semibold text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={4} className="text-center py-8">Loading fee structures...</td></tr>
                                ) : feeStructures.length === 0 ? (
                                    <tr>
                                        <td colSpan={4}>
                                            <EmptyState title="No fee structures found" description="Create one to ensure billing works correctly." />
                                        </td>
                                    </tr>
                                ) : (
                                    feeStructures.map((fs: any) => (
                                        <tr key={fs.id} className="bg-white border-b hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-900">{fs.program?.name}</td>
                                            <td className="px-6 py-4 text-slate-600">{fs.semester?.name}</td>
                                            <td className="px-6 py-4 font-mono text-slate-500">{fs.fee_type}</td>
                                            <td className="px-6 py-4 text-right font-semibold text-[#002147]">{formatCurrency(Number(fs.amount))}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
