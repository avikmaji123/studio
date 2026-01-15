
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminLogsPage() {

    const getBadgeVariant = (action: string) => {
        if (action.includes('Approved') || action.includes('Verified')) return 'default';
        if (action.includes('Suspended') || action.includes('Delete')) return 'destructive';
        if (action.includes('Update') || action.includes('Edit')) return 'secondary';
        return 'outline';
    }

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <h1 className="text-3xl font-bold">System & Audit Logs</h1>
            <p className="text-muted-foreground">
                View critical system events and administrator actions.
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>Admin Action Logs</CardTitle>
                    <CardDescription>A read-only log of all actions performed by administrators and the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Admin/System</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Entity</TableHead>
                                <TableHead>Entity ID</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {/* Live logs will be populated here */}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    )
}
