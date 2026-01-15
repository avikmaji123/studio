
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

export default function AdminUsersPage() {
    
    const users = [
        { id: '1', name: 'Liam Johnson', email: 'liam@example.com', role: 'Student', status: 'Active', courses: 5, photo: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f' },
        { id: '2', name: 'Olivia Smith', email: 'olivia@example.com', role: 'Student', status: 'Active', courses: 2, photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80' },
        { id: '3', name: 'Noah Williams', email: 'noah@example.com', role: 'Student', status: 'Suspended', courses: 8, photo: 'https://images.unsplash.com/photo-1523287281576-5b596107a6ae' },
        { id: '4', name: 'Emma Brown', email: 'emma@example.com', role: 'Affiliate', status: 'Active', courses: 1, photo: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5' },
        { id: '5', name: 'Admin User', email: 'admin@courseverse.com', role: 'Admin', status: 'Active', courses: 10, photo: 'https://i.ibb.co/W4WtfC39/1763449062738.png' },
    ]

    const getRoleBadge = (role: string) => {
        switch(role) {
            case 'Admin': return <Badge variant="destructive">{role}</Badge>;
            case 'Affiliate': return <Badge variant="secondary">{role}</Badge>;
            default: return <Badge variant="outline">{role}</Badge>;
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
                        {users.map(user => (
                             <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={user.photo} alt={user.name} />
                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {getRoleBadge(user.role)}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.status === 'Active' ? 'outline' : 'destructive'}>
                                        {user.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    {user.courses}
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
                    Showing <strong>1-10</strong> of <strong>124</strong> users
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
    )
}
