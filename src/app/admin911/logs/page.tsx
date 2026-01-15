
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminLogsPage() {
    const logs = [
        { id: 1, adminId: 'admin@courseverse.com', action: 'Approved payment', entity: 'PaymentTransaction', entityId: 'txn_12345', timestamp: '2024-07-29 10:45:12' },
        { id: 2, adminId: 'admin@courseverse.com', action: 'Suspended user', entity: 'User', entityId: 'user_abcde', timestamp: '2024-07-29 09:30:05' },
        { id: 3, adminId: 'system', action: 'AI Verified payment', entity: 'PaymentTransaction', entityId: 'txn_67890', timestamp: '2024-07-29 08:15:44' },
        { id: 4, adminId: 'admin@courseverse.com', action: 'Updated course price', entity: 'Course', entityId: 'cyber-2', timestamp: '2024-07-28 18:05:21' },
        { id: 5, adminId: 'admin@courseverse.com', action: 'Admin Login', entity: 'System', entityId: '192.168.1.1', timestamp: '2024-07-28 18:00:10' },
    ];

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
                            {logs.map(log => (
                                <TableRow key={log.id}>
                                    <TableCell>{log.timestamp}</TableCell>
                                    <TableCell><Badge variant="secondary">{log.adminId}</Badge></TableCell>
                                    <TableCell>
                                        <Badge variant={getBadgeVariant(log.action)}>{log.action}</Badge>
                                    </TableCell>
                                    <TableCell>{log.entity}</TableCell>
                                    <TableCell className="font-mono text-xs">{log.entityId}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    )
}
