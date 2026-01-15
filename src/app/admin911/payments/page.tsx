
'use client';

import {
  File,
  ListFilter,
  MoreHorizontal,
  Search,
} from 'lucide-react'

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

export default function AdminPaymentsPage() {

    const payments = [
        {
            id: 'txn_123',
            user: 'Liam Johnson',
            email: 'liam@example.com',
            course: 'Website Hacking',
            amount: '₹799',
            status: 'AI-Approved',
            date: '2023-06-23',
            utr: '417682249123'
        },
        {
            id: 'txn_124',
            user: 'Olivia Smith',
            email: 'olivia@example.com',
            course: 'Kali Linux & Pentesting Basics',
            amount: '₹599',
            status: 'Pending',
            date: '2023-06-24',
            utr: '417682249999'
        },
         {
            id: 'txn_125',
            user: 'Noah Williams',
            email: 'noah@example.com',
            course: 'Advanced Social Engineering',
            amount: '₹749',
            status: 'Rejected',
            date: '2023-06-25',
            utr: '417682248888'
        },
        {
            id: 'txn_126',
            user: 'Emma Brown',
            email: 'emma@example.com',
            course: 'Bug Hunting A–Z',
            amount: '₹199',
            status: 'AI-Approved',
            date: '2023-06-26',
            utr: '417682247777'
        },
    ]

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'AI-Approved': return <Badge variant="default">AI-Approved</Badge>;
            case 'Pending': return <Badge variant="secondary">Pending</Badge>;
            case 'Rejected': return <Badge variant="destructive">Rejected</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    }

    return (
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Tabs defaultValue="all">
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
            <TabsContent value="all">
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
                      {payments.map(payment => (
                        <TableRow key={payment.id}>
                            <TableCell>
                                <div className="font-medium">{payment.user}</div>
                                <div className="hidden text-sm text-muted-foreground md:inline">
                                {payment.email}
                                </div>
                            </TableCell>
                             <TableCell>{payment.course}</TableCell>
                            <TableCell>
                                {getStatusBadge(payment.status)}
                            </TableCell>
                            <TableCell className="hidden md:table-cell font-mono text-xs">{payment.utr}</TableCell>
                            <TableCell className="hidden md:table-cell">{payment.date}</TableCell>
                            <TableCell className="text-right">{payment.amount}</TableCell>
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
                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                    <DropdownMenuItem>Approve Manually</DropdownMenuItem>
                                    <DropdownMenuItem>Reject</DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <div className="text-xs text-muted-foreground">
                    Showing <strong>1-10</strong> of <strong>32</strong> transactions
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
    )
}
