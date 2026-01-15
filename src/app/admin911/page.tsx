
'use client';

import {
  Activity,
  ArrowUpRight,
  CircleUser,
  CreditCard,
  DollarSign,
  Menu,
  BookOpen,
  Search,
  Users,
  Download,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { collection, collectionGroup, getDocs, query, where } from 'firebase/firestore';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { courses } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users, isLoading: usersLoading } = useCollection(usersQuery);
  
  // Note: collectionGroup queries require an index in Firestore. 
  // This would need to be created in the Firebase console.
  const paymentsQuery = useMemoFirebase(() => collectionGroup(firestore, 'paymentTransactions'), [firestore]);
  const { data: payments, isLoading: paymentsLoading } = useCollection(paymentsQuery);
  
  const { totalSales, pendingVerifications, recentTransactions } = useMemo(() => {
    if (!payments) {
      return { totalSales: 0, pendingVerifications: 0, recentTransactions: [] };
    }
    
    const approved = payments.filter(p => p.status === 'AI-Approved' || p.status === 'approved');
    const total = approved.reduce((acc, p) => acc + p.amount, 0);
    const pending = payments.filter(p => p.status === 'Pending').length;

    const sorted = [...payments].sort((a, b) => b.transactionDate.toDate() - a.transactionDate.toDate());
    
    return { 
      totalSales: total, 
      pendingVerifications: pending,
      recentTransactions: sorted.slice(0, 5)
    };
  }, [payments]);

  const isLoading = usersLoading || paymentsLoading;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AI-Approved':
        return <Badge variant="default">AI-Approved</Badge>;
      case 'Pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const findUserByTx = (userId: string) => users?.find(u => u.id === userId);


  return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <header className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Welcome to the CourseVerse Command Center.</p>
            </div>
            <div className="flex items-center gap-4">
                <form>
                    <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                    />
                    </div>
                </form>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full">
                        <CircleUser className="h-5 w-5" />
                        <span className="sr-only">Toggle user menu</span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem>Support</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Verified Purchases
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">₹{totalSales.toLocaleString('en-IN')}</div>}
              <p className="text-xs text-muted-foreground">
                Lifetime sales
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">+{users?.length || 0}</div> }
              <p className="text-xs text-muted-foreground">
                Total registered users
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{courses.length}</div>
              <p className="text-xs text-muted-foreground">
                All courses published
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">+{pendingVerifications}</div>}
              <p className="text-xs text-muted-foreground">
                Manual review may be required
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Recent user purchases and their verification status.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/admin911/payments">
                  Review Payments
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden xl:table-column">
                      Date
                    </TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && Array.from({length: 5}).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-32"/></TableCell>
                      <TableCell><Skeleton className="h-5 w-20"/></TableCell>
                      <TableCell className="hidden xl:table-column"><Skeleton className="h-5 w-24"/></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto"/></TableCell>
                    </TableRow>
                  ))}
                  {recentTransactions.map(tx => {
                    const user = findUserByTx(tx.userId);
                    return (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                          <div className="hidden text-sm text-muted-foreground md:inline">
                            {user?.email}
                          </div>
                        </TableCell>
                        <TableCell>
                           {getStatusBadge(tx.status)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell lg:hidden xl:table-column">
                          {tx.transactionDate.toDate().toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">₹{tx.amount.toLocaleString('en-IN')}</TableCell>
                      </TableRow>
                    )
                  })}

                </TableBody>
              </Table>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Perform common admin tasks quickly.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
                <Button>Add New Course</Button>
                <Button variant="outline">Manage Site Settings</Button>
                <Button variant="destructive">Suspend a User</Button>
            </CardContent>
          </Card>
        </div>
      </main>
  );
}
