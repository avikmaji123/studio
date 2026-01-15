
'use client';

import {
    File,
    ListFilter,
    MoreHorizontal,
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
  import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
  import { useCollection, useFirestore, useMemoFirebase } from '@/firebase'
  import { collection } from 'firebase/firestore'
  import { Skeleton } from '@/components/ui/skeleton'

export default function AdminUsersPage() {
    const firestore = useFirestore();
    
    const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
    const { data: users, isLoading } = useCollection(usersQuery);

    const getRoleBadge = (role: string) => {
        switch(role) {
            case 'admin': return <Badge variant="destructive">Admin</Badge>;
            case 'affiliate': return <Badge variant="secondary">Affiliate</Badge>;
            default: return <Badge variant="outline">Student</Badge>;
        }
    }
    
    return (
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Tabs defaultValue="all">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="suspended">Suspended</TabsTrigger>
                <TabsTrigger value="admins" className="hidden sm:flex">
                  Admins
                </TabsTrigger>
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
                    <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>
                      Student
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Affiliate</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Admin</DropdownMenuCheckboxItem>
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
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    View, manage, and take action on user accounts.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Courses
                        </TableHead>
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && Array.from({ length: 5 }).map((_, i) => (
                             <TableRow key={i}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-9 w-9 rounded-full" />
                                        <div>
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-3 w-32 mt-1" />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-4" /></TableCell>
                                <TableCell>
                                    <Skeleton className="h-8 w-8" />
                                </TableCell>
                             </TableRow>
                        ))}
                        {users?.map(user => (
                             <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={user.profilePicture || ''} alt={user.firstName} />
                                            <AvatarFallback>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {getRoleBadge(user.role)}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={!user.suspended ? 'outline' : 'destructive'}>
                                        {user.suspended ? 'Suspended' : 'Active'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    {/* This would require another query */}
                                    0
                                </TableCell>
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
                                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                                        <DropdownMenuItem>Manage Courses</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive">Suspend User</DropdownMenuItem>
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
                    Showing <strong>1-{users?.length || 0}</strong> of <strong>{users?.length || 0}</strong> users
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
    )
}
