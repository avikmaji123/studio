'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';
import {
  collection,
  doc,
  setDoc,
  Timestamp,
  query,
} from 'firebase/firestore';

import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { createLogEntry } from '@/lib/actions';
import type { Course, Certificate } from '@/lib/types';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DatePicker } from '@/components/ui/date-picker';


const certificateSchema = z.object({
  userId: z.string({ required_error: 'Please select a user.' }),
  courseId: z.string({ required_error: 'Please select a course.' }),
  studentName: z.string().min(1, 'Student name is required.'),
  courseLevel: z.enum(['Beginner', 'Intermediate', 'Advanced', 'All Levels']),
  issueDate: z.date(),
  status: z.enum(['valid', 'revoked']),
});

type CertificateFormValues = z.infer<typeof certificateSchema>;

export default function NewCertificatePage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user: adminUser } = useUser();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const usersQuery = useMemoFirebase(() => query(collection(firestore, 'users')), [firestore]);
  const { data: users, isLoading: usersLoading } = useCollection(usersQuery);
  
  const coursesQuery = useMemoFirebase(() => query(collection(firestore, 'courses')), [firestore]);
  const { data: courses, isLoading: coursesLoading } = useCollection<Course>(coursesQuery);

  const form = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      issueDate: new Date(),
      status: 'valid',
      courseLevel: 'All Levels',
    },
  });

  const selectedUserId = form.watch('userId');
  const selectedCourseId = form.watch('courseId');

  useEffect(() => {
    if (selectedUserId) {
        const selectedUser = users?.find(u => u.id === selectedUserId);
        if (selectedUser) {
            form.setValue('studentName', `${selectedUser.firstName} ${selectedUser.lastName}`);
        }
    }
  }, [selectedUserId, users, form]);
  
  useEffect(() => {
      if(selectedCourseId) {
          const selectedCourse = courses?.find(c => c.id === selectedCourseId);
          if (selectedCourse && selectedCourse.level) {
              form.setValue('courseLevel', selectedCourse.level);
          }
      }
  }, [selectedCourseId, courses, form]);

  const onSubmit = async (data: CertificateFormValues) => {
    if (!firestore || !adminUser) return;
    setIsSaving(true);
    
    const selectedCourse = courses?.find(c => c.id === data.courseId);
    if (!selectedCourse) {
        toast({ variant: 'destructive', title: 'Error', description: 'Selected course not found.' });
        setIsSaving(false);
        return;
    }

    try {
        const certificateCode = `CV-MAN-${uuidv4().substring(0, 8).toUpperCase()}`;
        const issueTimestamp = Timestamp.fromDate(data.issueDate);

        const certificateData: Omit<Certificate, 'id'> & {creationMethod: 'manual'} = {
            userId: data.userId,
            courseId: data.courseId,
            studentName: data.studentName,
            courseName: selectedCourse.title,
            courseLevel: data.courseLevel,
            issueDate: issueTimestamp,
            certificateCode: certificateCode,
            status: data.status,
            creationMethod: 'manual',
        };

        // Create user's private certificate record
        const userCertRef = doc(firestore, 'users', data.userId, 'certificates', data.courseId);
        await setDoc(userCertRef, { ...certificateData, id: data.courseId });
        
        // Create public verification record
        const publicCertRef = doc(firestore, 'certificates', certificateCode);
        await setDoc(publicCertRef, { ...certificateData, id: certificateCode });
        
        await createLogEntry({
            source: 'admin',
            severity: 'info',
            message: `Manually issued certificate for ${data.studentName}.`,
            metadata: { userId: adminUser.uid, courseId: data.courseId, certificateCode: certificateCode }
        });

        toast({ title: 'Certificate Issued Successfully!', description: `Code: ${certificateCode}` });
        router.push('/admin911/certificates');

    } catch (error: any) {
        console.error("Error creating certificate:", error);
        toast({ variant: 'destructive', title: 'Error Creating Certificate', description: error.message });
        setIsSaving(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="icon" className="h-7 w-7" asChild>
              <Link href="/admin911/certificates">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              Issue New Certificate
            </h1>
            <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <Button variant="outline" size="sm" type="button" onClick={() => router.push('/admin911/certificates')}>
                Cancel
              </Button>
              <Button size="sm" type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Issue Certificate
              </Button>
            </div>
          </div>
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Certificate Details</CardTitle>
              <CardDescription>Manually create and issue a new certificate for a user.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>User</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value
                                    ? users?.find((user) => user.id === field.value)?.email
                                    : "Select user"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Search users..." />
                                <CommandEmpty>No user found.</CommandEmpty>
                                <CommandGroup>
                                {users?.map((user) => (
                                    <CommandItem
                                    value={user.email}
                                    key={user.id}
                                    onSelect={() => {
                                        form.setValue("userId", user.id)
                                    }}
                                    >
                                    <Check
                                        className={cn(
                                        "mr-2 h-4 w-4",
                                        user.id === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                    />
                                    {user.email}
                                    </CommandItem>
                                ))}
                                </CommandGroup>
                            </Command>
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="courseId"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Course</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value
                                    ? courses?.find((course) => course.id === field.value)?.title
                                    : "Select course"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Search courses..." />
                                <CommandEmpty>No course found.</CommandEmpty>
                                <CommandGroup>
                                {courses?.map((course) => (
                                    <CommandItem
                                    value={course.title}
                                    key={course.id}
                                    onSelect={() => {
                                        form.setValue("courseId", course.id)
                                    }}
                                    >
                                    <Check
                                        className={cn(
                                        "mr-2 h-4 w-4",
                                        course.id === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                    />
                                    {course.title}
                                    </CommandItem>
                                ))}
                                </CommandGroup>
                            </Command>
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField control={form.control} name="studentName" render={({ field }) => (<FormItem><FormLabel>Certificate Holder Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="courseLevel" render={({ field }) => (<FormItem><FormLabel>Course Level</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Beginner">Beginner</SelectItem><SelectItem value="Intermediate">Intermediate</SelectItem><SelectItem value="Advanced">Advanced</SelectItem><SelectItem value="All Levels">All Levels</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="issueDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Issue Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? (new Date(field.value).toLocaleDateString()) : (<span>Pick a date</span>)}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><DatePicker selected={field.value} onSelect={field.onChange} disabled={(date) =>date > new Date() || date < new Date("1900-01-01")}/></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                </div>
                 <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4 mt-2"><FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="valid" /></FormControl><FormLabel className="font-normal">Active</FormLabel></FormItem><FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="revoked" /></FormControl><FormLabel className="font-normal">Revoked</FormLabel></FormItem></RadioGroup></FormControl></FormItem>)} />
            </CardContent>
          </Card>
        </form>
      </Form>
    </main>
  );
}
