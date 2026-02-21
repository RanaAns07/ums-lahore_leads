"use client";

import { useState } from "react";
import Link from "next/link";
import { usePersons } from "@/hooks/use-students";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, GraduationCap, User } from "lucide-react";

export default function StudentsPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const { data: persons = [], isLoading } = usePersons({ take: 200 });

    // Client-side search (backend has no search endpoint)
    const filtered = persons.filter((p) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return p.legal_name.toLowerCase().includes(q);
    });

    if (isLoading) return <LoadingSkeleton rows={8} columns={4} />;

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Header */}
            <div>
                <h3 className="text-2xl font-bold tracking-tight text-[#002147]">Student Records</h3>
                <p className="text-muted-foreground">Search and view student profiles and financial records.</p>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-lg">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search students by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-11"
                    />
                </div>
                <div className="text-sm text-muted-foreground">
                    {filtered.length} record{filtered.length !== 1 ? "s" : ""} found
                </div>
            </div>

            {/* Results */}
            <Card className="border-none shadow-sm flex-1">
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Name</th>
                                <th className="px-6 py-4 font-semibold">Date of Birth</th>
                                <th className="px-6 py-4 font-semibold">Gender</th>
                                <th className="px-6 py-4 font-semibold">Nationality</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5}>
                                        <EmptyState
                                            title="No students found"
                                            description={searchQuery ? "Try a different search term." : "No person records exist yet."}
                                            icon={<GraduationCap className="h-8 w-8 text-slate-400" />}
                                        />
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((person) => (
                                    <tr key={person.id} className="bg-white border-b hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-full bg-[#002147]/10 p-2">
                                                    <User className="w-4 h-4 text-[#002147]" />
                                                </div>
                                                <span className="font-medium text-slate-900">{person.legal_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {person.date_of_birth ? new Date(person.date_of_birth).toLocaleDateString() : "—"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                                                {person.gender?.replace(/_/g, " ") || "—"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{person.nationality || "—"}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Button size="sm" className="bg-[#002147] hover:bg-[#002147]/90 text-white" asChild>
                                                <Link href={`/students/${person.id}`}>
                                                    <Eye className="w-3.5 h-3.5 mr-1" /> View Profile
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
