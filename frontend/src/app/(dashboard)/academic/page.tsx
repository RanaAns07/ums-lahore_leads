"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, GraduationCap, Building2 } from "lucide-react";

interface Department {
    id: string;
    code: string;
    name: string;
    description: string;
    head?: {
        person?: {
            first_name: string;
            last_name: string;
        }
    }
}

interface Program {
    id: string;
    code: string;
    name: string;
    duration_semesters: number;
    total_credits: number;
    department?: {
        name: string;
    }
}

interface Course {
    id: string;
    code: string;
    name: string;
    credits: number;
    department?: {
        name: string;
    };
    prerequisites?: {
        prerequisite: {
            code: string;
            name: string;
        }
    }[]
}

export default function AcademicCatalogPage() {
    const { data: departments = [], isLoading: depsLoading } = useQuery<Department[]>({
        queryKey: ["departments"],
        queryFn: async () => {
            const res = await api.get("/academic/departments");
            return res.data;
        },
    });

    const { data: programs = [], isLoading: progsLoading } = useQuery<Program[]>({
        queryKey: ["programs"],
        queryFn: async () => {
            const res = await api.get("/academic/programs");
            return res.data;
        },
    });

    const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
        queryKey: ["courses"],
        queryFn: async () => {
            const res = await api.get("/academic/courses");
            return res.data;
        },
    });

    if (depsLoading || progsLoading || coursesLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                </div>
                <div className="h-10 bg-slate-100 rounded-lg w-1/2 animate-pulse mt-8"></div>
                <div className="h-96 bg-slate-50 border rounded-xl animate-pulse mt-4"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 h-full flex flex-col pb-8">
            <div>
                <h3 className="text-2xl font-bold tracking-tight text-[#002147]">Academic Catalog</h3>
                <p className="text-muted-foreground">Manage organizational departments, academic programs, and courses.</p>
            </div>

            <Tabs defaultValue="departments" className="w-full">
                <TabsList className="grid w-full md:w-[400px] grid-cols-3 bg-slate-100">
                    <TabsTrigger value="departments" className="data-[state=active]:bg-[#002147] data-[state=active]:text-white">Departments</TabsTrigger>
                    <TabsTrigger value="programs" className="data-[state=active]:bg-[#002147] data-[state=active]:text-white">Programs</TabsTrigger>
                    <TabsTrigger value="courses" className="data-[state=active]:bg-[#002147] data-[state=active]:text-white">Courses</TabsTrigger>
                </TabsList>

                {/* Departments Tab */}
                <TabsContent value="departments" className="mt-6">
                    <Card className="border-none shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b pb-4">
                            <CardTitle className="flex items-center gap-2 text-[#002147]">
                                <Building2 className="w-5 h-5 text-[#FFD700]" />
                                University Departments
                            </CardTitle>
                            <CardDescription>Academic faculties and leadership directories.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Code</th>
                                            <th className="px-6 py-4 font-semibold">Department Name</th>
                                            <th className="px-6 py-4 font-semibold">Head of Department (HOD)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {departments.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">No departments configured.</td>
                                            </tr>
                                        ) : (
                                            departments.map((dept) => (
                                                <tr key={dept.id} className="bg-white border-b hover:bg-slate-50">
                                                    <td className="px-6 py-4 font-mono text-slate-500 font-medium">{dept.code}</td>
                                                    <td className="px-6 py-4 font-medium text-slate-900">{dept.name}</td>
                                                    <td className="px-6 py-4 text-slate-700">
                                                        {dept.head?.person ? `${dept.head.person.first_name} ${dept.head.person.last_name}` : "Not Assigned"}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Programs Tab */}
                <TabsContent value="programs" className="mt-6">
                    <Card className="border-none shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b pb-4">
                            <CardTitle className="flex items-center gap-2 text-[#002147]">
                                <GraduationCap className="w-5 h-5 text-[#FFD700]" />
                                Degree Programs
                            </CardTitle>
                            <CardDescription>Available academic degrees and duration tracks.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
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
                                        {programs.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No programs configured.</td>
                                            </tr>
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
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Courses Tab */}
                <TabsContent value="courses" className="mt-6">
                    <Card className="border-none shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b pb-4">
                            <CardTitle className="flex items-center gap-2 text-[#002147]">
                                <BookOpen className="w-5 h-5 text-[#FFD700]" />
                                Course Directory
                            </CardTitle>
                            <CardDescription>Full listing of curriculum courses and prerequisite mapping.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Course Code</th>
                                            <th className="px-6 py-4 font-semibold">Name</th>
                                            <th className="px-6 py-4 font-semibold">Credits</th>
                                            <th className="px-6 py-4 font-semibold">Prerequisites</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {courses.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No courses configured.</td>
                                            </tr>
                                        ) : (
                                            courses.map((course) => (
                                                <tr key={course.id} className="bg-white border-b hover:bg-slate-50">
                                                    <td className="px-6 py-4 font-mono text-[#002147] font-semibold">{course.code}</td>
                                                    <td className="px-6 py-4 font-medium text-slate-900">{course.name}</td>
                                                    <td className="px-6 py-4 text-slate-700">
                                                        <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none">
                                                            {course.credits} CH
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {course.prerequisites && course.prerequisites.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {course.prerequisites.map((p, i) => (
                                                                    <Badge key={i} variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                                                                        {p.prerequisite.code}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-slate-400">None</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
