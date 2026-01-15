
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu'

export default function AdminDownloadsPage() {

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Download Management</h1>
                    <p className="text-muted-foreground">
                        Manage course assets and downloadable files.
                    </p>
                </div>
                 <Button className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Add New File
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Downloadable Files</CardTitle>
                    <CardDescription>View, edit, or remove files available for download.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>File Name</TableHead>
                                <TableHead>Associated Course</TableHead>
                                <TableHead>Total Downloads</TableHead>
                                <TableHead>File Size</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Live data will be populated here */}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    )
}
