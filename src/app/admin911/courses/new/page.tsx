
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';
import Image from 'next/image';

import { useFirestore, useUser, useStorage } from '@/firebase';
import { addDoc, collection, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { createLogEntry } from '@/lib/actions';
import { generateCourseOutline } from '@/ai/flows/generate-course-outline';
import { slugify } from '@/lib/utils';
import type { Course } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';


const courseSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters long'),
    tagline: z.string().optional(),
    shortDescription: z.string().min(10, 'Short description is required').max(200),
    description: z.string().min(20, 'A detailed description is required'),
    category: z.string().min(1, 'Category is required'),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
    language: z.string().min(1, 'Language is required'),
    totalModules: z.coerce.number().optional(),
    totalLessons: z.coerce.number().optional(),
    estimatedDuration: z.string().optional(),
    courseFormat: z.enum(['Recorded', 'Live', 'Mixed']),
    courseType: z.enum(['Free', 'Paid']),
    price: z.string().optional(),
    discountPrice: z.string().optional(),
    offerEndDate: z.date().optional().nullable(),
    accessValidity: z.string().min(1, 'Access validity is required'),
    status: z.enum(['draft', 'published', 'unpublished']),
    visibility: z.enum(['public', 'private', 'hidden']),
    certificateEnabled: z.boolean(),
    quizRequired: z.boolean(),
    imageUrl: z.string().url('Must be a valid URL').optional(),
    downloadUrl: z.string().url('Must be a valid URL').optional(),
    downloadPassword: z.string().optional(),
}).refine(data => {
    if (data.courseType === 'Paid' && !data.price) {
        return false;
    }
    return true;
}, {
    message: "Price is required for paid courses",
    path: ["price"],
});

type CourseFormValues = z.infer<typeof courseSchema>;

export default function NewCoursePage() {
    const router = useRouter();
    const firestore = useFirestore();
    const storage = useStorage();
    const { user } = useUser();
    const { toast } = useToast();

    const [isSaving, setIsSaving] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiRawText, setAiRawText] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const form = useForm<CourseFormValues>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            title: '',
            tagline: '',
            shortDescription: '',
            description: '',
            category: '',
            level: 'Beginner',
            language: 'English',
            courseFormat: 'Recorded',
            courseType: 'Paid',
            price: '499',
            discountPrice: '',
            offerEndDate: null,
            accessValidity: 'Lifetime',
            status: 'draft',
            visibility: 'public',
            certificateEnabled: true,
            quizRequired: true,
            imageUrl: '',
            downloadUrl: '',
            downloadPassword: '',
        },
    });

    const watchCourseType = form.watch('courseType');

    const handleGenerateWithAI = async () => {
        if (!aiRawText.trim()) {
            toast({ variant: 'destructive', title: 'AI Assistant', description: 'Please provide some course details first.' });
            return;
        }
        setIsAiLoading(true);
        try {
            const result = await generateCourseOutline({ courseIdea: aiRawText });
            
            form.reset({
                ...form.getValues(),
                title: result.title,
                tagline: result.tagline,
                shortDescription: result.shortDescription,
                description: result.description,
                category: result.category,
                level: result.level,
                estimatedDuration: result.estimatedDuration,
                totalModules: result.totalModules,
                totalLessons: result.totalLessons,
            });
            // These fields are not on the form, so we just log them for now
            console.log("AI Generated Highlights:", result.highlights);
            console.log("AI Generated Audience:", result.whoIsThisFor);
            console.log("AI Generated FAQs:", result.courseFaqs);


            toast({ title: 'AI Assistant', description: 'Course details have been pre-filled. Please review and complete the form.' });
        } catch (error) {
            console.error("AI Generation Error:", error);
            toast({ variant: 'destructive', title: 'AI Assistant Failed', description: 'Could not generate course details. Please try again.' });
        } finally {
            setIsAiLoading(false);
        }
    };
    
    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
            form.setValue('imageUrl', ''); // Clear URL field if file is chosen
        }
    };

    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        form.setValue('imageUrl', url);
        setImagePreview(url);
        setImageFile(null); // Clear file if URL is entered
    };

    const onSubmit = async (data: CourseFormValues) => {
        if (!firestore || !user) {
            toast({ variant: 'destructive', title: 'Error', description: 'User or database not available.' });
            return;
        }
        setIsSaving(true);
        
        let finalImageUrl = data.imageUrl || '';

        try {
            if (imageFile) {
                toast({ title: "Uploading image..." });
                const storageRef = ref(storage, `course-images/${uuidv4()}-${imageFile.name}`);
                const uploadTask = uploadBytesResumable(storageRef, imageFile);
                finalImageUrl = await getDownloadURL((await uploadTask).ref);
            }
            
            const newCourseSlug = slugify(data.title);

            const coursePayload: Omit<Course, 'id' | 'lessons'> = {
                slug: newCourseSlug,
                title: data.title,
                tagline: data.tagline,
                shortDescription: data.shortDescription,
                description: data.description,
                category: data.category,
                level: data.level,
                language: data.language,
                totalModules: data.totalModules,
                totalLessons: data.totalLessons,
                estimatedDuration: data.estimatedDuration,
                courseFormat: data.courseFormat,
                courseType: data.courseType,
                price: data.courseType === 'Free' ? 'Free' : `₹${data.price || 0}`,
                discountPrice: data.discountPrice ? `₹${data.discountPrice}` : '',
                offerEndDate: data.offerEndDate ? Timestamp.fromDate(data.offerEndDate) : null,
                accessValidity: data.accessValidity,
                status: data.status,
                visibility: data.visibility,
                imageUrl: finalImageUrl,
                downloadUrl: data.downloadUrl,
                downloadPassword: data.downloadPassword,
                enrollmentCount: Math.floor(Math.random() * (250 - 50 + 1)) + 50,
                rating: 4.5,
                isNew: true,
                certificateSettings: {
                    quizEnabled: data.certificateEnabled,
                    quizRequired: data.quizRequired,
                    countdownDays: 7, // Default
                }
            };
            
            const docRef = await addDoc(collection(firestore, 'courses'), coursePayload);
            await updateDoc(doc(firestore, 'courses', docRef.id), { id: docRef.id });

            await createLogEntry({
                source: 'admin',
                severity: 'info',
                message: `New course created: ${data.title}`,
                metadata: { userId: user.uid, courseId: docRef.id },
            });

            toast({ title: 'Course Created Successfully!', description: 'Redirecting to edit page...' });
            router.push(`/admin911/courses/edit/${docRef.id}`);

        } catch (error: any) {
            console.error("Error creating course:", error);
            toast({ variant: 'destructive', title: 'Error Creating Course', description: error.message });
            setIsSaving(false);
        }
    };
    
    return (
         <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex items-center gap-4 mb-8">
                        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
                            <Link href="/admin911/courses">
                                <ArrowLeft className="h-4 w-4" />
                                <span className="sr-only">Back</span>
                            </Link>
                        </Button>
                        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                            Add New Course
                        </h1>
                        <div className="hidden items-center gap-2 md:ml-auto md:flex">
                            <Button variant="outline" size="sm" type="button" onClick={() => router.push('/admin911/courses')}>Cancel</Button>
                            <Button size="sm" type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save and Continue
                            </Button>
                        </div>
                    </div>
                    
                    <div className="grid gap-8">
                        <Card>
                            <CardHeader><CardTitle>AI Course Assistant</CardTitle><CardDescription>Paste a course idea, syllabus, or raw details, and let AI pre-fill the form for you.</CardDescription></CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea placeholder="e.g., A comprehensive course on ethical hacking for beginners, covering topics like network scanning, vulnerability analysis, and penetration testing..." value={aiRawText} onChange={(e) => setAiRawText(e.target.value)} rows={5}/>
                                <Button type="button" onClick={handleGenerateWithAI} disabled={isAiLoading}>
                                    {isAiLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate with AI</>}
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 grid gap-8 auto-rows-max">
                                 <Card>
                                    <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Course Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="tagline" render={({ field }) => (<FormItem><FormLabel>Tagline</FormLabel><FormControl><Input placeholder="e.g., Become a certified ethical hacker in 12 weeks." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="shortDescription" render={({ field }) => (<FormItem><FormLabel>Short Description</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Full Description (Markdown supported)</FormLabel><FormControl><Textarea {...field} rows={6} /></FormControl><FormMessage /></FormItem>)} />
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader><CardTitle>Course Content & Structure</CardTitle></CardHeader>
                                    <CardContent className="grid md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="totalModules" render={({ field }) => (<FormItem><FormLabel>Total Modules</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="totalLessons" render={({ field }) => (<FormItem><FormLabel>Total Lessons</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="estimatedDuration" render={({ field }) => (<FormItem><FormLabel>Estimated Duration</FormLabel><FormControl><Input placeholder="e.g. 8 hours" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="courseFormat" render={({ field }) => (<FormItem><FormLabel>Format</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Recorded">Recorded</SelectItem><SelectItem value="Live">Live</SelectItem><SelectItem value="Mixed">Mixed</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader><CardTitle>Delivery Settings</CardTitle><CardDescription>Provide the link for course asset downloads.</CardDescription></CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField control={form.control} name="downloadUrl" render={({ field }) => (<FormItem><FormLabel>Download URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="downloadPassword" render={({ field }) => (<FormItem><FormLabel>Download Password (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="space-y-8 auto-rows-max">
                                <Card>
                                    <CardHeader><CardTitle>Categorization</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><FormControl><Input placeholder="e.g. Cyber Security" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="level" render={({ field }) => (<FormItem><FormLabel>Level</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Beginner">Beginner</SelectItem><SelectItem value="Intermediate">Intermediate</SelectItem><SelectItem value="Advanced">Advanced</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="language" render={({ field }) => (<FormItem><FormLabel>Language</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    </CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader><CardTitle>Pricing & Offers</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField control={form.control} name="courseType" render={({ field }) => (<FormItem><FormLabel>Type</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4 mt-2"><FormItem><FormControl><RadioGroupItem value="Paid" id="paid" /></FormControl><FormLabel htmlFor="paid">Paid</FormLabel></FormItem><FormItem><FormControl><RadioGroupItem value="Free" id="free" /></FormControl><FormLabel htmlFor="free">Free</FormLabel></FormItem></RadioGroup></FormControl></FormItem>)}/>
                                        {watchCourseType === 'Paid' && (
                                            <>
                                            <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Price (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="discountPrice" render={({ field }) => (<FormItem><FormLabel>Discount Price (₹, Optional)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                             <FormField control={form.control} name="offerEndDate" render={({ field }) => (
                                                <FormItem className="flex flex-col"><FormLabel>Offer End Date</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                            {field.value ? (new Date(field.value).toLocaleDateString()) : (<span>Pick a date</span>)}
                                                            </Button>
                                                        </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <DatePicker selected={field.value || undefined} onSelect={field.onChange} />
                                                        </PopoverContent>
                                                    </Popover>
                                                <FormMessage />
                                                </FormItem>
                                            )} />
                                            </>
                                        )}
                                        <FormField control={form.control} name="accessValidity" render={({ field }) => (<FormItem><FormLabel>Access Validity</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Lifetime">Lifetime</SelectItem><SelectItem value="12 Months">12 Months</SelectItem><SelectItem value="6 Months">6 Months</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                    </CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader><CardTitle>Publishing</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                         <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="unpublished">Unpublished</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="visibility" render={({ field }) => (<FormItem><FormLabel>Visibility</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4 mt-2"><FormItem><FormControl><RadioGroupItem value="public" id="public" /></FormControl><FormLabel htmlFor="public">Public</FormLabel></FormItem><FormItem><FormControl><RadioGroupItem value="private" id="private" /></FormControl><FormLabel htmlFor="private">Private</FormLabel></FormItem><FormItem><FormControl><RadioGroupItem value="hidden" id="hidden" /></FormControl><FormLabel htmlFor="hidden">Hidden</FormLabel></FormItem></RadioGroup></FormControl></FormItem>)} />
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader><CardTitle>Certificate</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField control={form.control} name="certificateEnabled" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Enable Certificate</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)}/>
                                        <FormField control={form.control} name="quizRequired" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Require Quiz</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={!form.watch('certificateEnabled')} /></FormControl></FormItem>)}/>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader><CardTitle>Thumbnail Image</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        {imagePreview && <div className="relative aspect-video"><Image src={imagePreview} alt="Preview" fill className="object-cover rounded-md" /></div>}
                                        <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://..." value={form.watch('imageUrl')} onChange={handleImageUrlChange} /></FormControl><FormMessage /></FormItem>
                                        <div className="text-center my-2 text-xs text-muted-foreground">OR</div>
                                        <FormItem><FormLabel>Upload Image</FormLabel><FormControl><Input type="file" accept="image/*" onChange={handleImageFileChange} /></FormControl></FormItem>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                     <div className="flex items-center justify-center gap-2 md:hidden mt-6">
                        <Button variant="outline" size="sm" type="button" onClick={() => router.push('/admin911/courses')}>Cancel</Button>
                        <Button size="sm" type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save and Continue
                        </Button>
                    </div>
                </form>
            </Form>
         </main>
    );
}
