import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-2xl font-bold tracking-tight text-primary">Admin Command Center</h3>
                <p className="text-muted-foreground">Manage user roles, permissions, and audit logs.</p>
            </div>

            <Card className="border-dashed bg-slate-50/50">
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        The User Management, Role/Permission Matrix, and Audit Log explorer are under development.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
