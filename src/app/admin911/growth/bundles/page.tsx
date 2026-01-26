
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle } from "lucide-react";

export default function BundlesPage() {
    // This would come from your useCollection hook
    const bundles = [
        { id: '1', name: 'Cybersecurity Starter Pack', courses: 3, price: 999, status: 'Active' },
        { id: '2', name: 'Advanced Pentesting Bundle', courses: 2, price: 1499, status: 'Active' },
        { id: '3', name: 'The Complete Web Developer Kit', courses: 5, price: 2499, status: 'Draft' },
    ];

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                    <h1 className="text-3xl font-bold tracking-tight">Course Bundles</h1>
                    <p className="text-muted-foreground">
                        Group courses together and sell them at a special price.
                    </p>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Bundle
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Manage Bundles</CardTitle>
                    <CardDescription>
                        Create, edit, and manage your course bundles.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Bundle Name</TableHead>
                                <TableHead>Courses</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bundles.map(bundle => (
                                <TableRow key={bundle.id}>
                                    <TableCell className="font-medium">{bundle.name}</TableCell>
                                    <TableCell>{bundle.courses}</TableCell>
                                    <TableCell>₹{bundle.price.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={bundle.status === 'Active' ? 'default' : 'secondary'}>{bundle.status}</Badge>
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
