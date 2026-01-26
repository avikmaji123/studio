
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import Link from 'next/link';

import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { createLogEntry } from '@/lib/actions';
import type { Course, Coupon } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, Loader2, CalendarIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const couponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').max(20),
  type: z.enum(['percentage', 'fixed']),
  value: z.coerce.number().min(1, 'Value must be greater than 0'),
  status: z.enum(['active', 'inactive']),
  usageLimit: z.coerce.number().min(0).optional().default(0),
  expiresAt: z.date(),
  isGlobal: z.boolean().default(true),
  applicableCourseIds: z.array(z.string()),
}).refine(data => !data.isGlobal ? data.applicableCourseIds.length > 0 : true, {
  message: 'Please select at least one course if the coupon is not global.',
  path: ['applicableCourseIds'],
});

type CouponFormValues = z.infer<typeof couponSchema>;

export default function NewCouponPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user: adminUser } = useUser();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const coursesQuery = useMemoFirebase(() => collection(firestore, 'courses'), [firestore]);
  const { data: courses, isLoading: coursesLoading } = useCollection<Course>(coursesQuery);

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: '',
      type: 'percentage',
      value: 10,
      status: 'active',
      usageLimit: 0,
      expiresAt: new Date(new Date().setDate(new Date().getDate() + 30)),
      isGlobal: true,
      applicableCourseIds: [],
    },
  });

  const watchIsGlobal = form.watch('isGlobal');

  const onSubmit = async (data: CouponFormValues) => {
    if (!firestore || !adminUser) return;
    setIsSaving(true);
    
    try {
      const couponPayload = {
        ...data,
        code: data.code.toUpperCase(),
        expiresAt: Timestamp.fromDate(data.expiresAt),
        usageCount: 0,
        applicableCourseIds: data.isGlobal ? [] : data.applicableCourseIds,
      };
      
      await addDoc(collection(firestore, 'coupons'), couponPayload);

      await createLogEntry({
        source: 'admin',
        severity: 'info',
        message: `New coupon created: ${data.code.toUpperCase()}`,
        metadata: { userId: adminUser.uid },
      });

      toast({ title: 'Coupon Created', description: `Coupon "${data.code.toUpperCase()}" has been successfully created.` });
      router.push('/admin911/growth/coupons');

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error Creating Coupon', description: error.message });
      setIsSaving(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="icon" className="h-7 w-7" asChild>
              <Link href="/admin911/growth/coupons">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              Create New Coupon
            </h1>
            <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <Button variant="outline" size="sm" type="button" onClick={() => router.push('/admin911/growth/coupons')}>
                Cancel
              </Button>
              <Button size="sm" type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Coupon
              </Button>
            </div>
          </div>
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Coupon Details</CardTitle>
              <CardDescription>Fill out the form to create a new discount coupon.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <FormField control={form.control} name="code" render={({ field }) => (<FormItem><FormLabel>Coupon Code</FormLabel><FormControl><Input {...field} placeholder="e.g. SUMMER20" /></FormControl><FormDescription>Users will enter this code at checkout. It will be converted to uppercase.</FormDescription><FormMessage /></FormItem>)} />
              <div className="grid md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>Discount Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="percentage">Percentage</SelectItem><SelectItem value="fixed">Fixed Amount</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="value" render={({ field }) => (<FormItem><FormLabel>Value</FormLabel><FormControl><Input type="number" {...field} placeholder="e.g. 10 or 500" /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="usageLimit" render={({ field }) => (<FormItem><FormLabel>Usage Limit</FormLabel><FormControl><Input type="number" {...field} placeholder="0 for unlimited" /></FormControl><FormDescription>Total number of times this coupon can be used.</FormDescription><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="expiresAt" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Expires At</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : (<span>Pick a date</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
              </div>
               <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4 pt-2"><FormItem><RadioGroupItem value="active" id="active" /><Label htmlFor="active" className="font-normal">Active</Label></FormItem><FormItem><RadioGroupItem value="inactive" id="inactive" /><Label htmlFor="inactive" className="font-normal">Inactive</Label></FormItem></RadioGroup></FormControl></FormItem>)} />
                <div>
                    <FormField control={form.control} name="isGlobal" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Apply to all courses</FormLabel><FormDescription>If unchecked, you must select specific courses below.</FormDescription></div></FormItem>)} />
                    {!watchIsGlobal && (
                        <FormField
                            control={form.control}
                            name="applicableCourseIds"
                            render={({ field }) => (
                                <FormItem className="mt-4">
                                    <FormLabel>Applicable Courses</FormLabel>
                                    <div className="relative max-h-60 overflow-auto rounded-md border p-4 space-y-2">
                                        {coursesLoading && <p>Loading courses...</p>}
                                        {courses?.map((course) => (
                                            <FormField
                                                key={course.id}
                                                control={form.control}
                                                name="applicableCourseIds"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(course.id)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                    ? field.onChange([...field.value, course.id])
                                                                    : field.onChange(field.value?.filter((value) => value !== course.id))
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">{course.title}</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-center gap-2 md:hidden mt-6">
            <Button variant="outline" size="sm" type="button" onClick={() => router.push('/admin911/growth/coupons')}>Cancel</Button>
            <Button size="sm" type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Coupon
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
}
