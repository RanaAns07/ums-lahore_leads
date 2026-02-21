import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AcademicPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-2xl font-bold tracking-tight text-primary">Academic Catalog</h3>
                <p className="text-muted-foreground">Manage programs, courses, and semesters.</p>
            </div>

            <Card className="border-dashed bg-slate-50/50">
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        Program and Course management with semester activation toggles will be implemented here.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
