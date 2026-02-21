"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DepartmentsManager } from "@/components/academic/DepartmentsManager";
import { ProgramsManager } from "@/components/academic/ProgramsManager";
import { CoursesManager } from "@/components/academic/CoursesManager";
import { CourseOfferingsManager } from "@/components/academic/CourseOfferingsManager";

export default function AcademicCatalogPage() {
    return (
        <div className="space-y-6 h-full flex flex-col pb-8">
            <div>
                <h3 className="text-2xl font-bold tracking-tight text-[#002147]">Academic Catalog</h3>
                <p className="text-muted-foreground">Manage organizational departments, academic programs, courses, and offerings.</p>
            </div>

            <Tabs defaultValue="departments" className="w-full">
                <TabsList className="grid w-full md:w-[600px] grid-cols-4 bg-slate-100">
                    <TabsTrigger value="departments" className="data-[state=active]:bg-[#002147] data-[state=active]:text-white">Departments</TabsTrigger>
                    <TabsTrigger value="programs" className="data-[state=active]:bg-[#002147] data-[state=active]:text-white">Programs</TabsTrigger>
                    <TabsTrigger value="courses" className="data-[state=active]:bg-[#002147] data-[state=active]:text-white">Courses</TabsTrigger>
                    <TabsTrigger value="offerings" className="data-[state=active]:bg-[#002147] data-[state=active]:text-white">Offerings</TabsTrigger>
                </TabsList>

                <TabsContent value="departments" className="mt-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <DepartmentsManager />
                    </div>
                </TabsContent>

                <TabsContent value="programs" className="mt-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <ProgramsManager />
                    </div>
                </TabsContent>

                <TabsContent value="courses" className="mt-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <CoursesManager />
                    </div>
                </TabsContent>

                <TabsContent value="offerings" className="mt-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <CourseOfferingsManager />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
