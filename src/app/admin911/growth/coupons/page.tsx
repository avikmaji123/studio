
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle } from "lucide-react";

export default function CouponsPage() {
    // This would come from your useCollection hook
    const coupons = [
        { id: '1', code: 'WELCOME10', type: 'Percentage', value: '10%', usage: '52/100', status: 'Active' },
        { id: '2', code: 'CYBER500', type: 'Fixed', value: '₹500', usage: '15/50', status: 'Active' },
        { id: '3', code: 'EXPIRED20', type: 'Percentage', value: '20%', usage: '20/20', status: 'Expired' },
    ];

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                    <h1 className="text-3xl font-bold tracking-tight">Coupon Management</h1>
                    <p className="text-muted-foreground">
                        Create and manage discount codes for your courses.
                    </p>
                </div>
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Coupon
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Manage Coupons</CardTitle>
                    <CardDescription>
                        View, edit, and track the performance of your coupon codes.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Usage</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coupons.map(coupon => (
                                <TableRow key={coupon.id}>
                                    <TableCell className="font-mono">{coupon.code}</TableCell>
                                    <TableCell>{coupon.type}</TableCell>
                                    <TableCell>{coupon.value}</TableCell>
                                    <TableCell>{coupon.usage}</TableCell>
                                    <TableCell>
                                        <Badge variant={coupon.status === 'Active' ? 'default' : 'secondary'}>{coupon.status}</Badge>
                                    </TableCell>
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
