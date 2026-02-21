"use client";

import { useState } from "react";
import { useCourses, useCreateCourse, useDepartments, useAddPrerequisite, useRemovePrerequisite, useCourse } from "@/hooks/use-academic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Plus, Loader2, Settings2, Trash2, Link as LinkIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { PermissionGate } from "@/components/shared/PermissionGate";

export function CoursesManager() {
    const { data: courses = [], isLoading } = useCourses();
    const { data: departments = [] } = useDepartments();
    const createCourse = useCreateCourse();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        credit_hours: 3,
        department_id: ""
    });

    const [prereqCourseId, setPrereqCourseId] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createCourse.mutate(formData, {
            onSuccess: () => {
                setIsCreateOpen(false);
                setFormData({ name: "", code: "", credit_hours: 3, department_id: "" });
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-[#002147]">
                    <BookOpen className="w-5 h-5 text-[#FFD700]" />
                    <h3 className="text-lg font-semibold">Course Directory</h3>
                </div>
                <PermissionGate permission="academic.write">
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-[#002147] hover:bg-[#002147]/90">
                                <Plus className="w-4 h-4 mr-2" /> Add Course
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={handleSubmit}>
                                <DialogHeader>
                                    <DialogTitle>Add New Course</DialogTitle>
                                    <DialogDescription>Add a course to the university catalog.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="c_name">Course Name</Label>
                                        <Input id="c_name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Intro to Programming" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="c_code">Course Code</Label>
                                            <Input id="c_code" required value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} placeholder="e.g. CS101" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="credits">Credit Hours</Label>
                                            <Input id="credits" type="number" required min={1} max={6} value={formData.credit_hours} onChange={e => setFormData({ ...formData, credit_hours: parseInt(e.target.value) || 3 })} />
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
                                    <Button type="submit" disabled={createCourse.isPending} className="bg-[#002147] hover:bg-[#002147]/90 text-white">
                                        {createCourse.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving... </> : "Save Course"}
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
                            <th className="px-6 py-4 font-semibold">Course Code</th>
                            <th className="px-6 py-4 font-semibold">Name</th>
                            <th className="px-6 py-4 font-semibold">Credits</th>
                            <th className="px-6 py-4 font-semibold">Prerequisites</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={5} className="text-center py-8">Loading courses...</td></tr>
                        ) : courses.length === 0 ? (
                            <tr><td colSpan={5}><EmptyState title="No courses found" description="Get started by adding a new course." /></td></tr>
                        ) : (
                            courses.map((course) => (
                                <tr key={course.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono text-[#002147] font-semibold">{course.code}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{course.name}</td>
                                    <td className="px-6 py-4 text-slate-700">
                                        <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none">
                                            {course.credit_hours} CH
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        {course.prerequisites && course.prerequisites.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {course.prerequisites.map((p, i) => (
                                                    <Badge key={i} variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                                                        {p.prerequisite_course?.code || "Unknown"}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400">None</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <PermissionGate permission="academic.write">
                                            <Button size="sm" variant="outline" onClick={() => setPrereqCourseId(course.id)}>
                                                <Settings2 className="w-4 h-4 mr-1" /> Prereqs
                                            </Button>
                                        </PermissionGate>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ManagePrerequisitesModal
                courseId={prereqCourseId}
                onClose={() => setPrereqCourseId(null)}
                allCourses={courses}
            />
        </div>
    );
}

function ManagePrerequisitesModal({ courseId, onClose, allCourses }: { courseId: string | null; onClose: () => void; allCourses: any[] }) {
    const { data: course } = useCourse(courseId || "");
    const addPrerequisite = useAddPrerequisite();
    const removePrerequisite = useRemovePrerequisite();
    const [selectedPrereq, setSelectedPrereq] = useState("");

    const handleAdd = () => {
        if (courseId && selectedPrereq) {
            addPrerequisite.mutate({ courseId, prerequisiteCourseId: selectedPrereq }, {
                onSuccess: () => setSelectedPrereq("")
            });
        }
    };

    return (
        <Dialog open={!!courseId} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manage Prerequisites</DialogTitle>
                    <DialogDescription>
                        Set prerequisite rules for {course?.code || "this course"}.
                        The system checks for circular dependencies.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex items-end gap-2">
                        <div className="flex-1 space-y-2">
                            <Label>Add Prerequisite</Label>
                            <Select value={selectedPrereq} onValueChange={setSelectedPrereq}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allCourses.filter(c => c.id !== courseId).map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            className="bg-[#002147] hover:bg-[#002147]/90"
                            disabled={!selectedPrereq || addPrerequisite.isPending}
                            onClick={handleAdd}
                        >
                            {addPrerequisite.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                            Add
                        </Button>
                    </div>

                    <div className="mt-6 border rounded-md divide-y">
                        {course?.prerequisites?.length === 0 && (
                            <div className="p-4 text-center text-sm text-muted-foreground">No prerequisites set.</div>
                        )}
                        {course?.prerequisites?.map((p: any) => (
                            <div key={p.prerequisite_course_id} className="p-3 flex items-center justify-between bg-slate-50">
                                <div>
                                    <p className="text-sm font-semibold">{p.prerequisite_course?.code}</p>
                                    <p className="text-xs text-muted-foreground">{p.prerequisite_course?.name}</p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-500 hover:bg-red-100 hover:text-red-600"
                                    onClick={() => {
                                        if (courseId) removePrerequisite.mutate({ courseId, prerequisiteCourseId: p.prerequisite_course_id });
                                    }}
                                    disabled={removePrerequisite.isPending}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
