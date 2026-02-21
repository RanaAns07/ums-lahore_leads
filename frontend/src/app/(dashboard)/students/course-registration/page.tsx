"use client";

import { useState } from "react";
import { useEnrollments, useRegisterForCourse, useDropCourse } from "@/hooks/use-students";
import { useCourseOfferings } from "@/hooks/use-academic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, Plus, Minus } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { PermissionGate } from "@/components/shared/PermissionGate";

export default function CourseRegistrationPage() {
    const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>("");

    const { data: enrollments = [], isLoading: loadingEnrollments } = useEnrollments();

    const selectedEnrollment = enrollments.find(e => e.id === selectedEnrollmentId);

    const { data: offerings = [], isLoading: loadingOfferings } = useCourseOfferings(
        selectedEnrollment?.semester_id ? { semester_id: selectedEnrollment.semester_id } : undefined
    );

    const registerCourse = useRegisterForCourse();
    const dropCourse = useDropCourse();

    // Since we don't have course_registrations populated in the type, we assume the user just clicks Register
    // Ideally, we'd check if `selectedEnrollment.course_registrations` contains the offering to toggle Drop.

    return (
        <div className="space-y-6 h-full flex flex-col pb-8">
            <div>
                <h3 className="text-2xl font-bold tracking-tight text-[#002147]">Course Registration</h3>
                <p className="text-muted-foreground">Enroll students into active courses for their current semester.</p>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader className="bg-slate-50/50 border-b pb-4">
                    <CardTitle className="flex items-center gap-2 text-[#002147]">
                        <BookOpen className="w-5 h-5 text-[#FFD700]" />
                        Select Student & Semester
                    </CardTitle>
                    <CardDescription>Choose an active enrollment to manage its registered courses.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div className="max-w-md space-y-2">
                        <Select value={selectedEnrollmentId} onValueChange={setSelectedEnrollmentId} disabled={loadingEnrollments}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Student Enrollment" />
                            </SelectTrigger>
                            <SelectContent>
                                {enrollments.map(e => (
                                    <SelectItem key={e.id} value={e.id}>
                                        {e.student_profile?.person?.legal_name || e.student_profile?.student_id_number} - {e.program?.code} ({e.semester?.name})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedEnrollment && (
                        <div className="grid grid-cols-3 gap-4 p-4 mt-4 bg-slate-50 rounded-lg border">
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold">Program</p>
                                <p className="text-sm font-medium">{selectedEnrollment.program?.name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold">Semester</p>
                                <p className="text-sm font-medium">{selectedEnrollment.semester?.name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold">Status</p>
                                <Badge variant="outline" className="bg-white">{selectedEnrollment.status}</Badge>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedEnrollmentId && (
                <Card className="border-none shadow-sm flex-1">
                    <CardHeader className="bg-white border-b pb-4">
                        <CardTitle className="text-lg text-[#002147]">Available Course Offerings</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Course Code</th>
                                        <th className="px-6 py-4 font-semibold">Course Name</th>
                                        <th className="px-6 py-4 font-semibold">Credits</th>
                                        <th className="px-6 py-4 font-semibold text-center">Section</th>
                                        <th className="px-6 py-4 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingOfferings ? (
                                        <tr><td colSpan={5} className="text-center py-8">Loading available courses...</td></tr>
                                    ) : offerings.length === 0 ? (
                                        <tr>
                                            <td colSpan={5}>
                                                <EmptyState title="No courses available" description="No active course offerings found for this semester." />
                                            </td>
                                        </tr>
                                    ) : (
                                        offerings.map((offering) => (
                                            <tr key={offering.id} className="bg-white border-b hover:bg-slate-50">
                                                <td className="px-6 py-4 font-mono text-[#002147] font-semibold">{offering.course?.code}</td>
                                                <td className="px-6 py-4 font-medium text-slate-900">{offering.course?.name}</td>
                                                <td className="px-6 py-4 text-slate-600">{offering.course?.credit_hours} CH</td>
                                                <td className="px-6 py-4 font-mono text-center text-slate-500">{offering.section_code}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <PermissionGate permission="academic.write">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-[#002147] hover:bg-slate-100"
                                                                onClick={() => registerCourse.mutate({ enrollmentId: selectedEnrollmentId, courseOfferingId: offering.id })}
                                                                disabled={registerCourse.isPending}
                                                            >
                                                                {registerCourse.isPending ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
                                                                Register
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-red-600 hover:bg-red-50"
                                                                onClick={() => dropCourse.mutate({ enrollmentId: selectedEnrollmentId, courseOfferingId: offering.id })}
                                                                disabled={dropCourse.isPending}
                                                            >
                                                                <Minus className="w-3.5 h-3.5 mr-1" /> Drop
                                                            </Button>
                                                        </div>
                                                    </PermissionGate>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
