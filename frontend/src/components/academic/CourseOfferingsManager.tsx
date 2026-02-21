"use client";

import { useState } from "react";
import { useCourseOfferings, useCreateCourseOffering, useCourses, useSemesters } from "@/hooks/use-academic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, CalendarRange } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { PermissionGate } from "@/components/shared/PermissionGate";

export function CourseOfferingsManager() {
    const { data: offerings = [], isLoading } = useCourseOfferings();
    const { data: courses = [] } = useCourses();
    const { data: semesters = [] } = useSemesters();
    const createOffering = useCreateCourseOffering();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [formData, setFormData] = useState({
        course_id: "",
        semester_id: "",
        section_code: "",
        capacity: 30
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createOffering.mutate(formData, {
            onSuccess: () => {
                setIsCreateOpen(false);
                setFormData({ course_id: "", semester_id: "", section_code: "", capacity: 30 });
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-[#002147]">
                    <CalendarRange className="w-5 h-5 text-[#FFD700]" />
                    <h3 className="text-lg font-semibold">Course Offerings</h3>
                </div>
                <PermissionGate permission="academic.write">
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-[#002147] hover:bg-[#002147]/90">
                                <Plus className="w-4 h-4 mr-2" /> Add Offering
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={handleSubmit}>
                                <DialogHeader>
                                    <DialogTitle>Add Course Offering</DialogTitle>
                                    <DialogDescription>Open a given course for registration in a semester.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Course</Label>
                                        <Select required value={formData.course_id} onValueChange={(val) => setFormData({ ...formData, course_id: val })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Course" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>)}
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
                                            <Label htmlFor="sec">Section Code</Label>
                                            <Input id="sec" required value={formData.section_code} onChange={e => setFormData({ ...formData, section_code: e.target.value })} placeholder="e.g. A" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cap">Capacity</Label>
                                            <Input id="cap" type="number" required min={1} max={200} value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 30 })} />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={createOffering.isPending} className="bg-[#002147] hover:bg-[#002147]/90 text-white">
                                        {createOffering.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving... </> : "Save Offering"}
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
                            <th className="px-6 py-4 font-semibold">Course</th>
                            <th className="px-6 py-4 font-semibold">Semester</th>
                            <th className="px-6 py-4 font-semibold">Section</th>
                            <th className="px-6 py-4 font-semibold text-center">Capacity</th>
                            <th className="px-6 py-4 font-semibold">Instructor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={5} className="text-center py-8">Loading offerings...</td></tr>
                        ) : offerings.length === 0 ? (
                            <tr><td colSpan={5}><EmptyState title="No offerings found" description="Get started by opening a course for offering." /></td></tr>
                        ) : (
                            offerings.map((off) => (
                                <tr key={off.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{off.course?.code} - {off.course?.name}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className={off.semester?.is_active ? "bg-green-50 text-green-700 border-green-200" : ""}>
                                            {off.semester?.name}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-500">Section {off.section_code}</td>
                                    <td className="px-6 py-4 text-center">{off.capacity} seats</td>
                                    <td className="px-6 py-4 text-slate-700">
                                        {off.instructor ? off.instructor.legal_name : <span className="text-muted-foreground italic">TBA</span>}
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
