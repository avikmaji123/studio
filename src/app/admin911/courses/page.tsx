
'use client';

import {
    File,
    ListFilter,
    MoreHorizontal,
    PlusCircle,
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
  import Image from 'next/image'
  import { useCollection, useFirestore, useMemoFirebase } from '@/firebase'
  import { collection } from 'firebase/firestore'
  import { PlaceHolderImages } from '@/lib/placeholder-images'
  import { Skeleton } from '@/components/ui/skeleton'

export default function AdminCoursesPage() {
    const firestore = useFirestore();
    const coursesQuery = useMemoFirebase(() => collection(firestore, 'courses'), [firestore]);
    const { data: courses, isLoading } = useCollection(coursesQuery);

    const getImageForCourse = (imageId: string) => {
        return PlaceHolderImages.find(p => p.id === imageId);
    }
    
    return (
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="all">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Published</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="archived" className="hidden sm:flex">
                  Archived
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
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>
                      Published
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Archived
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" variant="outline" className="h-8 gap-1">
                  <File className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Export
                  </span>
                </Button>
                <Button size="sm" className="h-8 gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Course
                  </span>
                </Button>
              </div>
            </div>
            <TabsContent value="all">
              <Card x-chunk="dashboard-06-chunk-0">
                <CardHeader>
                  <CardTitle>Courses</CardTitle>
                  <CardDescription>
                    Manage your courses and view their sales performance.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="hidden w-[100px] sm:table-cell">
                          <span className="sr-only">Image</span>
                        </TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Price
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Enrollments
                        </TableHead>
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && Array.from({ length: 5 }).map((_, i) => (
                             <TableRow key={i}>
                                <TableCell><Skeleton className="h-16 w-16 rounded-md"/></TableCell>
                                <TableCell><Skeleton className="h-5 w-48"/></TableCell>
                                <TableCell><Skeleton className="h-5 w-20"/></TableCell>
                                <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-16"/></TableCell>
                                <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-12"/></TableCell>
                                <TableCell><Skeleton className="h-8 w-8"/></TableCell>
                            </TableRow>
                        ))}
                        {courses?.map(course => {
                            const image = getImageForCourse(course.imageId);
                            return (
                                <TableRow key={course.id}>
                                    <TableCell className="hidden sm:table-cell">
                                        <Image
                                        alt={course.title}
                                        className="aspect-square rounded-md object-cover"
                                        height="64"
                                        src={image?.imageUrl || '/placeholder.svg'}
                                        width="64"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{course.title}</TableCell>
                                    <TableCell>
                                        <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                                            {course.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">₹{parseInt(course.price.replace('₹', '')).toLocaleString('en-IN')}</TableCell>
                                    <TableCell className="hidden md:table-cell">{course.enrollmentCount}</TableCell>
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
                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                            <DropdownMenuItem>View Analytics</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
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
                    Showing <strong>{courses?.length || 0}</strong> of <strong>{courses?.length || 0}</strong>{' '}
                    products
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
    )
}
