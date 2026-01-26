
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";

export default function AffiliatesPage() {
    // This would come from your useCollection hook
    const affiliates = [
        { id: '1', name: 'John Doe', email: 'john@example.com', referrals: 25, earnings: 1250 },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', referrals: 10, earnings: 500 },
    ];

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                    <h1 className="text-3xl font-bold tracking-tight">Affiliate Program</h1>
                    <p className="text-muted-foreground">
                        Manage your affiliate partners, track their performance, and set commissions.
                    </p>
                </div>
                <Button>Configure Settings</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader><CardTitle>Total Affiliates</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">12</p></CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Total Referrals</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">152</p></CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Total Commissions Paid</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">₹8,750</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Conversion Rate</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">8.5%</p></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Affiliate Partners</CardTitle>
                    <CardDescription>
                        Approve new requests and manage existing affiliates.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Referrals</TableHead>
                                <TableHead>Total Earnings</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {affiliates.map(affiliate => (
                                <TableRow key={affiliate.id}>
                                    <TableCell>
                                        <div className="font-medium">{affiliate.name}</div>
                                        <div className="text-sm text-muted-foreground">{affiliate.email}</div>
                                    </TableCell>
                                    <TableCell><Badge>Active</Badge></TableCell>
                                    <TableCell>{affiliate.referrals}</TableCell>
                                    <TableCell>₹{affiliate.earnings.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    );
}
