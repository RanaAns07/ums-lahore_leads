"use client";

import { useState } from "react";
import { usePrograms, useCreateProgram, useDepartments } from "@/hooks/use-academic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { PermissionGate } from "@/components/shared/PermissionGate";

export function ProgramsManager() {
    const { data: programs = [], isLoading } = usePrograms();
    const { data: departments = [] } = useDepartments();
    const createProgram = useCreateProgram();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        duration_semesters: 8,
        department_id: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createProgram.mutate(formData, {
            onSuccess: () => {
                setIsCreateOpen(false);
                setFormData({ name: "", code: "", duration_semesters: 8, department_id: "" });
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-[#002147]">
                    <GraduationCap className="w-5 h-5 text-[#FFD700]" />
                    <h3 className="text-lg font-semibold">Degree Programs</h3>
                </div>
                <PermissionGate permission="academic.write">
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-[#002147] hover:bg-[#002147]/90">
                                <Plus className="w-4 h-4 mr-2" /> Add Program
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={handleSubmit}>
                                <DialogHeader>
                                    <DialogTitle>Add New Program</DialogTitle>
                                    <DialogDescription>Create a new degree program under a department.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Program Name</Label>
                                        <Input id="name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Bachelor of Science in CS" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="code">Program Code</Label>
                                            <Input id="code" required value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} placeholder="e.g. BSCS" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="duration">Semesters</Label>
                                            <Input id="duration" type="number" required min={1} max={12} value={formData.duration_semesters} onChange={e => setFormData({ ...formData, duration_semesters: parseInt(e.target.value) || 8 })} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Department</Label>
                                        <Select required value={formData.department_id} onValueChange={(val) => setFormData({ ...formData, department_id: val })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={createProgram.isPending} className="bg-[#002147] hover:bg-[#002147]/90 text-white">
                                        {createProgram.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving... </> : "Save Program"}
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
                            <th className="px-6 py-4 font-semibold">Program Name</th>
                            <th className="px-6 py-4 font-semibold">Department</th>
                            <th className="px-6 py-4 font-semibold text-center">Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={4} className="text-center py-8">Loading programs...</td></tr>
                        ) : programs.length === 0 ? (
                            <tr><td colSpan={4}><EmptyState title="No programs found" description="Get started by adding a degree program." /></td></tr>
                        ) : (
                            programs.map((prog) => (
                                <tr key={prog.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono text-slate-500 font-medium">{prog.code}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{prog.name}</td>
                                    <td className="px-6 py-4 text-slate-700">{prog.department?.name || "N/A"}</td>
                                    <td className="px-6 py-4 text-center">
                                        <Badge variant="outline" className="bg-slate-50">
                                            {prog.duration_semesters} Semesters
                                        </Badge>
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
