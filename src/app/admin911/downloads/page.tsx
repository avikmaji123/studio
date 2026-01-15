
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
    
    const downloadableFiles = [
        { id: '1', name: 'Web Dev Bootcamp Resources.zip', course: 'Website Hacking', downloads: 1203, size: '2.1 GB' },
        { id: '2', name: 'Android Hacking Tools.zip', course: 'Android Hacking', downloads: 845, size: '890 MB' },
        { id: '3', name: 'C2 Development Kit.zip', course: 'Enterprise Attacker Emulation', downloads: 451, size: '1.2 GB' },
    ];

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
                            {downloadableFiles.map(file => (
                                <TableRow key={file.id}>
                                    <TableCell className="font-medium">{file.name}</TableCell>
                                    <TableCell>{file.course}</TableCell>
                                    <TableCell>{file.downloads.toLocaleString()}</TableCell>
                                    <TableCell>{file.size}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                aria-haspopup="true"
                                                size="icon"
                                                variant="ghost"
                                                >
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>Edit Details</DropdownMenuItem>
                                                <DropdownMenuItem>Replace File</DropdownMenuItem>
                                                <DropdownMenuItem>Reset Download Count</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive">Delete File</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    )
}
