
'use client';

import {
  File,
  ListFilter,
  MoreHorizontal,
} from 'lucide-react'
import { useMemo, useState } from 'react';

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
  DropdownMenuCheckboxItem,
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
import { collection, collectionGroup, query } from 'firebase/firestore'
import { Skeleton } from '@/components/ui/skeleton'
import type { Course } from '@/lib/types';


export default function AdminPaymentsPage() {
    const firestore = useFirestore();
    const [activeTab, setActiveTab] = useState('all');

    const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
    const { data: users, isLoading: usersLoading } = useCollection(usersQuery);

    const paymentsQuery = useMemoFirebase(() => collectionGroup(firestore, 'paymentTransactions'), [firestore]);
    const { data: payments, isLoading: paymentsLoading } = useCollection(paymentsQuery);
    
    const coursesQuery = useMemoFirebase(() => query(collection(firestore, 'courses')), [firestore]);
    const { data: courses, isLoading: coursesLoading } = useCollection<Course>(coursesQuery);

    const filteredPayments = useMemo(() => {
        if (!payments) return [];
        if (activeTab === 'all') return payments;
        if (activeTab === 'approved') return payments.filter(p => p.status === 'AI-Approved' || p.status === 'approved');
        return payments.filter(p => p.status.toLowerCase() === activeTab);
    }, [payments, activeTab]);

    const isLoading = usersLoading || paymentsLoading || coursesLoading;

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'AI-Approved': return <Badge variant="default">AI-Approved</Badge>;
            case 'approved': return <Badge variant="default">Approved</Badge>;
            case 'Pending': return <Badge variant="secondary">Pending</Badge>;
            case 'Rejected': return <Badge variant="destructive">Rejected</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    }
    
    const getUserForPayment = (userId: string) => users?.find(u => u.id === userId);
    const getCourseForPayment = (courseId: string) => courses?.find(c => c.id === courseId);


    return (
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <ListFilter className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filter
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>
                      AI-Approved
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Manual</DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" variant="outline" className="h-8 gap-1">
                  <File className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Export
                  </span>
                </Button>
              </div>
            </div>
            <TabsContent value={activeTab}>
              <Card x-chunk="dashboard-06-chunk-0">
                <CardHeader>
                  <CardTitle>Payment Transactions</CardTitle>
                  <CardDescription>
                    Review and manage all payment transactions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">UTR</TableHead>
                        <TableHead className="hidden md:table-cell">Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && Array.from({length: 5}).map((_, i) => (
                             <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-24"/></TableCell>
                                <TableCell><Skeleton className="h-5 w-32"/></TableCell>
                                <TableCell><Skeleton className="h-5 w-20"/></TableCell>
                                <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-28"/></TableCell>
                                <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24"/></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto"/></TableCell>
                                <TableCell><Skeleton className="h-8 w-8"/></TableCell>
                             </TableRow>
                        ))}
                        {filteredPayments.map(payment => {
                            const user = getUserForPayment(payment.userId);
                            const course = getCourseForPayment(payment.courseId);
                            return (
                                <TableRow key={payment.id}>
                                    <TableCell>
                                        <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                                        <div className="text-sm text-muted-foreground">{user?.email}</div>
                                    </TableCell>
                                    <TableCell>{course?.title || 'Unknown Course'}</TableCell>
                                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                    <TableCell className="hidden md:table-cell">{payment.upiTransactionReference}</TableCell>
                                    <TableCell className="hidden md:table-cell">{payment.transactionDate.toDate().toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">₹{payment.amount.toLocaleString('en-IN')}</TableCell>
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
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem>Approve</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Reject</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <div className="text-xs text-muted-foreground">
                    Showing <strong>{filteredPayments.length}</strong> of <strong>{payments?.length || 0}</strong> transactions
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
    )
}
