"use client";

import { useState } from "react";
import { useDepartments, useCreateDepartment } from "@/hooks/use-academic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { PermissionGate } from "@/components/shared/PermissionGate";

export function DepartmentsManager() {
    const { data: departments = [], isLoading } = useDepartments();
    const createDepartment = useCreateDepartment();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", code: "" });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createDepartment.mutate(formData, {
            onSuccess: () => {
                setIsCreateOpen(false);
                setFormData({ name: "", code: "" });
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-[#002147]">
                    <Building2 className="w-5 h-5 text-[#FFD700]" />
                    <h3 className="text-lg font-semibold">University Departments</h3>
                </div>
                <PermissionGate permission="academic.write">
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-[#002147] hover:bg-[#002147]/90">
                                <Plus className="w-4 h-4 mr-2" /> Add Department
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={handleSubmit}>
                                <DialogHeader>
                                    <DialogTitle>Add New Department</DialogTitle>
                                    <DialogDescription>Create a new academic department in the university.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Department Name</Label>
                                        <Input id="name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Computer Science" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="code">Department Code</Label>
                                        <Input id="code" required value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} placeholder="e.g. CS" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={createDepartment.isPending} className="bg-[#002147] hover:bg-[#002147]/90 text-white">
                                        {createDepartment.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving... </> : "Save Department"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </PermissionGate>
            </div>

            <div className="rounded-md border">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Code</th>
                            <th className="px-6 py-4 font-semibold">Department Name</th>
                            <th className="px-6 py-4 font-semibold">Head of Department (HOD)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={3} className="text-center py-8">Loading departments...</td></tr>
                        ) : departments.length === 0 ? (
                            <tr><td colSpan={3}><EmptyState title="No departments found" description="Get started by adding a curriculum department." /></td></tr>
                        ) : (
                            departments.map((dept) => (
                                <tr key={dept.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono text-slate-500 font-medium">{dept.code}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{dept.name}</td>
                                    <td className="px-6 py-4 text-slate-700">
                                        {dept.head_of_dept ? `${dept.head_of_dept.legal_name}` : "Not Assigned"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
