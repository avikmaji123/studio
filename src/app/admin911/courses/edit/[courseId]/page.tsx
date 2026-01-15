
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';

import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Course } from '@/lib/data';

export default function EditCoursePage() {
    const { courseId } = useParams();
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();

    const courseRef = useMemoFirebase(() => doc(firestore, 'courses', courseId as string), [firestore, courseId]);
    const { data: course, isLoading: isCourseLoading } = useDoc<Course>(courseRef);
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [status, setStatus] = useState<'draft' | 'published'>('draft');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (course) {
            setTitle(course.title);
            setDescription(course.description);
            setPrice(course.price.replace('₹', ''));
            setStatus(course.status as 'draft' | 'published' || 'draft');
        }
    }, [course]);

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            await updateDoc(courseRef, {
                title,
                description,
                price: `₹${price}`,
                status,
            });
            toast({
                title: "Course Updated",
                description: "The course details have been successfully saved.",
            });
            router.push('/admin911/courses');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error Saving Course',
                description: error.message || 'An unexpected error occurred.',
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    const courseImage = course ? PlaceHolderImages.find(p => p.id === course.imageId) : null;

    if (isCourseLoading) {
        return (
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Skeleton className="h-8 w-48" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-10 w-1/2" />
                        <Skeleton className="h-10 w-1/2" />
                    </CardContent>
                </Card>
            </main>
        )
    }

    if (!course) {
        return (
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 text-center">
                <h1 className="text-2xl font-bold">Course not found</h1>
                <p>The course you are trying to edit does not exist.</p>
                <Button asChild>
                    <Link href="/admin911/courses">Go Back to Courses</Link>
                </Button>
            </main>
        )
    }
    
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-7 w-7" asChild>
                    <Link href="/admin911/courses">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Link>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    Edit Course
                </h1>
                <div className="hidden items-center gap-2 md:ml-auto md:flex">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin911/courses">Cancel</Link>
                    </Button>
                    <Button size="sm" onClick={handleSaveChanges} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
                <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Details</CardTitle>
                            <CardDescription>Update the title, description, and price of your course.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="price">Price (INR)</Label>
                                <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select value={status} onValueChange={(value) => setStatus(value as 'draft' | 'published')}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Image</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {courseImage && (
                                <Image 
                                    src={courseImage.imageUrl}
                                    alt={course.title}
                                    width={300}
                                    height={169}
                                    className="rounded-md object-cover"
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
             <div className="flex items-center justify-center gap-2 md:hidden">
                <Button variant="outline" size="sm">
                    Discard
                </Button>
                <Button size="sm" onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Product
                </Button>
            </div>
        </main>
    )
}
