'use client';
import { useMemo, useState } from 'react';
import {
    MoreHorizontal,
    PlusCircle,
    Award
  } from 'lucide-react'
  import { doc, updateDoc } from 'firebase/firestore';

  import { Badge } from '@/components/ui/badge'
  import { Button } from '@/components/ui/button'
  import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card'
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu'
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table'
  import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from '@/components/ui/tabs'
  import { useCollection, useFirestore, useMemoFirebase } from '@/firebase'
  import { collection } from 'firebase/firestore'
  import { Skeleton } from '@/components/ui/skeleton'
  import Link from 'next/link'
  import type { Certificate } from '@/lib/types';
  import { format } from 'date-fns';
  import { useToast } from '@/hooks/use-toast';
  import { createLogEntry } from '@/lib/actions';
  import { useUser } from '@/firebase';

export default function AdminCertificatesPage() {
    const firestore = useFirestore();
    const { user: adminUser } = useUser();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('all');

    const certificatesQuery = useMemoFirebase(() => collection(firestore, 'certificates'), [firestore]);
    const { data: certificates, isLoading: certsLoading } = useCollection<Certificate>(certificatesQuery);
    
    const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
    const { data: users, isLoading: usersLoading } = useCollection(usersQuery);

    const isLoading = certsLoading || usersLoading;

    const filteredCerts = useMemo(() => {
        if (!certificates) return [];
        if (activeTab === 'all') return certificates;
        return certificates.filter(c => c.status === activeTab);
    }, [certificates, activeTab]);

    const counts = useMemo(() => {
        if (!certificates) return { all: 0, valid: 0, revoked: 0 };
        return {
            all: certificates.length,
            valid: certificates.filter(c => c.status === 'valid').length,
            revoked: certificates.filter(c => c.status === 'revoked').length,
        };
    }, [certificates]);

    const getUserForCertificate = (userId: string) => users?.find(u => u.id === userId);

    const handleUpdateStatus = async (certificate: Certificate, newStatus: 'valid' | 'revoked') => {
        if (!firestore || !adminUser) return;
        
        try {
            // Update public record
            const publicRef = doc(firestore, 'certificates', certificate.certificateCode);
            await updateDoc(publicRef, { status: newStatus });
            
            // Update user's private record
            const userCertRef = doc(firestore, 'users', certificate.userId, 'certificates', certificate.courseId);
            await updateDoc(userCertRef, { status: newStatus });

            await createLogEntry({
                source: 'admin',
                severity: 'info',
                message: `Certificate status changed to ${newStatus} for ${certificate.studentName}`,
                metadata: { userId: adminUser.uid, certificateCode: certificate.certificateCode }
            });

            toast({ title: "Status Updated", description: `Certificate is now ${newStatus}.`});

        } catch (error: any) {
             toast({ variant: 'destructive', title: "Update Failed", description: error.message });
        }
    };
    
    return (
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
                <TabsTrigger value="valid">Active ({counts.valid})</TabsTrigger>
                <TabsTrigger value="revoked">Revoked ({counts.revoked})</TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                <Button size="sm" className="h-8 gap-1" asChild>
                  <Link href="/admin911/certificates/new">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Issue Certificate
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
            <TabsContent value={activeTab}>
              <Card>
                <CardHeader>
                  <CardTitle>Certificate Registry</CardTitle>
                  <CardDescription>
                    Manage all certificates issued on the platform.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Type</TableHead>
                        <TableHead className="hidden md:table-cell">Issued On</TableHead>
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && Array.from({ length: 5 }).map((_, i) => (
                             <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-32"/></TableCell>
                                <TableCell><Skeleton className="h-5 w-48"/></TableCell>
                                <TableCell><Skeleton className="h-5 w-24"/></TableCell>
                                <TableCell><Skeleton className="h-6 w-20"/></TableCell>
                                <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-16"/></TableCell>
                                <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24"/></TableCell>
                                <TableCell><Skeleton className="h-8 w-8"/></TableCell>
                            </TableRow>
                        ))}
                        {filteredCerts?.map(cert => {
                            const user = getUserForCertificate(cert.userId);
                            return (
                                <TableRow key={cert.id}>
                                    <TableCell>
                                        <div className="font-medium">{cert.studentName}</div>
                                        <div className="text-sm text-muted-foreground">{user?.email}</div>
                                    </TableCell>
                                    <TableCell>{cert.courseName}</TableCell>
                                    <TableCell className="font-mono text-xs">{cert.certificateCode}</TableCell>
                                    <TableCell>
                                        <Badge variant={cert.status === 'valid' ? 'default' : 'secondary'} className={cert.status === 'revoked' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500/50' : ''}>
                                            {cert.status === 'valid' ? 'Active' : 'Revoked'}
                                        </Badge>
                                    </TableCell>
                                     <TableCell className="hidden md:table-cell capitalize">
                                        <Badge variant={cert.creationMethod === 'manual' ? 'secondary' : 'outline'}>
                                            {cert.creationMethod || 'Auto'}
                                        </Badge>
                                     </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {cert.issueDate ? format(cert.issueDate.toDate(), 'MMM d, yyyy') : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem asChild><Link href={`/certificate/${cert.certificateCode}`} target="_blank">View Certificate</Link></DropdownMenuItem>
                                            <DropdownMenuItem asChild><Link href={`/dashboard/profile?userId=${cert.userId}`} target="_blank">View User Profile</Link></DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            {cert.status === 'valid' ? (
                                                 <DropdownMenuItem onClick={() => handleUpdateStatus(cert, 'revoked')} className="text-amber-600 focus:bg-amber-100 focus:text-amber-800">Revoke</DropdownMenuItem>
                                            ) : (
                                                 <DropdownMenuItem onClick={() => handleUpdateStatus(cert, 'valid')} className="text-green-600 focus:bg-green-100 focus:text-green-800">Restore</DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem className="text-destructive focus:bg-destructive/10">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                         {!isLoading && filteredCerts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                No certificates found for this filter.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <div className="text-xs text-muted-foreground">
                    Showing <strong>{filteredCerts?.length || 0}</strong> of <strong>{certificates?.length || 0}</strong>{' '}
                    certificates
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
    )
}
