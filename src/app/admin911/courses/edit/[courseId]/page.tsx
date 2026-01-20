
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';
import Image from 'next/image';
import { collection, query } from 'firebase/firestore';

import { useFirestore, useMemoFirebase, useStorage, useCollection } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2, Sparkles, Upload, X, Tag } from 'lucide-react';
import type { Course } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from '@/components/ui/progress';
import { refineText, type RefineTextInput } from '@/ai/flows/refine-text';
import { generateTags } from '@/ai/flows/generate-tags';
import { createLogEntry } from '@/lib/actions';
import { useUser } from '@/firebase';


export default function EditCoursePage() {
    const { courseId } = useParams();
    const router = useRouter();
    const firestore = useFirestore();
    const storage = useStorage();
    const { toast } = useToast();
    const { user } = useUser();
    
    const courseCategoriesQuery = useMemoFirebase(() => query(collection(firestore, 'courses')), [firestore]);
    const { data: allCourses } = useCollection(courseCategoriesQuery);
    const courseCategories = useMemo(() => {
        if (!allCourses) return [];
        const categories = allCourses.map(c => c.category).filter(Boolean);
        return Array.from(new Set(categories));
    }, [allCourses]);

    const courseLevels = ['Beginner', 'Intermediate', 'Advanced'];
    const courseFormats = ['Recorded', 'Live', 'Mixed'];
    const accessOptions = ['Lifetime', '12 Months', '6 Months', '3 Months'];

    const courseRef = useMemoFirebase(() => doc(firestore, 'courses', courseId as string), [firestore, courseId]);
    
    const [course, setCourse] = useState<Course | null>(null);
    const [isCourseLoading, setIsCourseLoading] = useState(true);

    // Form state
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<'draft' | 'published' | 'unpublished'>('draft');
    const [category, setCategory] = useState('');
    const [level, setLevel] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState('');
    const [learningOutcomes, setLearningOutcomes] = useState<string[]>(['']);
    const [prerequisites, setPrerequisites] = useState('');
    
    // Image state
    const [imagePreview, setImagePreview] = useState('');
    const [finalImageUrl, setFinalImageUrl] = useState('');

    const [visibility, setVisibility] = useState<'public' | 'private' | 'hidden'>('public');

    // New Fields
    const [language, setLanguage] = useState('English');
    const [totalModules, setTotalModules] = useState('');
    const [totalLessons, setTotalLessons] = useState('');
    const [estimatedDuration, setEstimatedDuration] = useState('');
    const [courseFormat, setCourseFormat] = useState('');
    const [courseType, setCourseType] = useState<'Free' | 'Paid'>('Paid');
    const [price, setPrice] = useState('');
    const [discountPrice, setDiscountPrice] = useState('');
    const [accessValidity, setAccessValidity] = useState('Lifetime');
    const [isCertificateEnabled, setIsCertificateEnabled] = useState(true);
    const [isQuizRequired, setIsQuizRequired] = useState(true);
    const [downloadUrl, setDownloadUrl] = useState('');
    const [downloadPassword, setDownloadPassword] = useState('');
    
    const [isSaving, setIsSaving] = useState(false);

    // AI State
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [originalText, setOriginalText] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isTagGenerationLoading, setIsTagGenerationLoading] = useState(false);
    const [aiDialogField, setAiDialogField] = useState<keyof Omit<Course, 'id'|'slug'|'price'|'lessons'|'imageId'|'isNew'|'isBestseller'|'hasPreview'|'enrollmentCount'|'status'|'category'|'level'|'tags'|'learningOutcomes'|'prerequisites'|'imageUrl'|'downloadUrl'|'downloadPassword'> | null>(null);

    // Upload state
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        const fetchCourse = async () => {
            if (!courseRef) return;
            setIsCourseLoading(true);
            try {
                const docSnap = await getDoc(courseRef);
                if (docSnap.exists()) {
                    const courseData = docSnap.data() as Course;
                    setCourse(courseData);
                    setTitle(courseData.title || '');
                    setSlug(courseData.slug || '');
                    setDescription(courseData.description || '');
                    setShortDescription(courseData.shortDescription || '');
                    setStatus(courseData.status || 'draft');
                    setCategory(courseData.category || '');
                    setLevel(courseData.level || 'Beginner');
                    setTags(courseData.tags || []);
                    setLearningOutcomes(courseData.learningOutcomes?.length ? courseData.learningOutcomes : ['']);
                    setPrerequisites(courseData.prerequisites || '');
                    setImagePreview(courseData.imageUrl || '');
                    setFinalImageUrl(courseData.imageUrl || '');
                    setVisibility(courseData.visibility || 'public');
                    setLanguage(courseData.language || 'English');
                    setTotalModules(courseData.totalModules?.toString() || '');
                    setTotalLessons(courseData.totalLessons?.toString() || '');
                    setEstimatedDuration(courseData.estimatedDuration || '');
                    setCourseFormat(courseData.courseFormat || 'Recorded');
                    setCourseType(courseData.courseType || 'Paid');
                    setPrice(courseData.price?.replace('₹', '') || '');
                    setDiscountPrice(courseData.discountPrice?.replace('₹', '') || '');
                    setAccessValidity(courseData.accessValidity || 'Lifetime');
                    setIsCertificateEnabled(courseData.certificateSettings?.quizEnabled !== false);
                    setIsQuizRequired(courseData.certificateSettings?.quizRequired !== false);
                    setDownloadUrl(courseData.downloadUrl || '');
                    setDownloadPassword(courseData.downloadPassword || '');
                } else {
                    toast({ variant: 'destructive', title: 'Course not found' });
                }
            } catch (error) {
                console.error("Error fetching course: ", error);
                toast({ variant: 'destructive', title: 'Error loading course' });
            } finally {
                setIsCourseLoading(false);
            }
        };
        fetchCourse();
    }, [courseRef, toast]);
    

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            await updateDoc(courseRef, {
                title,
                description,
                shortDescription,
                status,
                category,
                level,
                tags,
                learningOutcomes: learningOutcomes.filter(o => o.trim() !== ''),
                prerequisites,
                imageUrl: finalImageUrl,
                visibility,
                language,
                totalModules: totalModules ? parseInt(totalModules) : 0,
                totalLessons: totalLessons ? parseInt(totalLessons) : 0,
                estimatedDuration,
                courseFormat,
                courseType,
                price: courseType === 'Free' ? 'Free' : `₹${price}`,
                discountPrice: discountPrice ? `₹${discountPrice}` : '',
                accessValidity,
                'certificateSettings.quizEnabled': isCertificateEnabled,
                'certificateSettings.quizRequired': isQuizRequired,
                downloadUrl,
                downloadPassword,
                // Slug is not updated to prevent breaking URLs
            });

            await createLogEntry({
                source: 'admin',
                severity: 'info',
                message: `Course updated: ${title}`,
                metadata: {
                    userId: user?.uid,
                    courseId: courseId as string,
                }
            });

            toast({
                title: "Course Updated",
                description: "The course details have been successfully saved.",
            });
            router.push('/admin911/courses');
        } catch (error: any) {
             await createLogEntry({
                source: 'system',
                severity: 'critical',
                message: `Failed to update course: ${title}`,
                metadata: {
                    userId: user?.uid,
                    courseId: courseId as string,
                    error: error.message
                }
            });
            toast({
                variant: 'destructive',
                title: 'Error Saving Course',
                description: error.message || 'An unexpected error occurred.',
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    // Tag management
    const addTag = () => {
        if (currentTag && !tags.includes(currentTag)) {
            setTags([...tags, currentTag]);
            setCurrentTag('');
        }
    };
    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    // Learning outcomes management
    const handleOutcomeChange = (index: number, value: string) => {
        const newOutcomes = [...learningOutcomes];
        newOutcomes[index] = value;
        setLearningOutcomes(newOutcomes);
    };
    const addOutcome = () => setLearningOutcomes([...learningOutcomes, '']);
    const removeOutcome = (index: number) => {
        if (learningOutcomes.length > 1) {
            setLearningOutcomes(learningOutcomes.filter((_, i) => i !== index));
        }
    };

    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setImagePreview(url);
        setFinalImageUrl(url);
    };

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !storage) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        const storageRef = ref(storage, `course-images/${uuidv4()}-${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        setIsUploading(true);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload error:", error);
                toast({ variant: "destructive", title: "Upload Failed", description: error.message });
                setIsUploading(false);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setFinalImageUrl(downloadURL);
                    toast({ title: "Upload Complete", description: "Image is ready to be saved." });
                    setTimeout(() => setIsUploading(false), 1000); // Close dialog after a short delay
                });
            }
        );
    };


    // AI Handlers
    const handleAiRefine = async (field: keyof Omit<Course, 'id'|'slug'|'price'|'lessons'|'imageId'|'isNew'|'isBestseller'|'hasPreview'|'enrollmentCount'|'status'|'category'|'level'|'tags'|'learningOutcomes'|'prerequisites'|'imageUrl'|'downloadUrl'|'downloadPassword'>, fieldType: RefineTextInput['fieldType']) => {
        let textToRefine = '';
        switch (field) {
            case 'title': textToRefine = title; break;
            case 'shortDescription': textToRefine = shortDescription; break;
            case 'description': textToRefine = description; break;
            default: return;
        }

        setAiDialogField(field);
        setOriginalText(textToRefine);
        setIsAiLoading(true);

        try {
            const result = await refineText({ text: textToRefine, fieldType });
            setAiSuggestion(result.refinedText);
        } catch (error) {
            console.error("AI refinement error:", error);
            toast({ variant: 'destructive', title: 'AI Refinement Failed' });
            setAiDialogField(null); // Close dialog on error
        } finally {
            setIsAiLoading(false);
        }
    };

     const handleGenerateTags = async () => {
        setIsTagGenerationLoading(true);
        try {
            const result = await generateTags({ title, description });
            const newTags = result.tags;
            // Merge with existing tags, avoiding duplicates
            setTags(prevTags => [...new Set([...prevTags, ...newTags])]);
            toast({ title: "AI Tags Generated", description: "New tags have been added." });
        } catch (error) {
            console.error("AI tag generation error:", error);
            toast({ variant: 'destructive', title: 'AI Tag Generation Failed' });
        } finally {
            setIsTagGenerationLoading(false);
        }
    };

    const applyAiSuggestion = () => {
        if (!aiDialogField) return;
        switch (aiDialogField) {
            case 'title': setTitle(aiSuggestion); break;
            case 'shortDescription': setShortDescription(aiSuggestion); break;
            case 'description': setDescription(aiSuggestion); break;
        }
        closeAiDialog();
    };

    const closeAiDialog = () => {
        setAiDialogField(null);
        setAiSuggestion('');
        setOriginalText('');
    };


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
                            <CardDescription>Update the core information for your course.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <div className="flex gap-2">
                                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="flex-grow"/>
                                <Button variant="outline" size="icon" onClick={() => handleAiRefine('title', 'title')}><Sparkles className="h-4 w-4" /></Button>
                                </div>
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="slug">URL Slug</Label>
                                <Input id="slug" value={slug} disabled className="bg-muted"/>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="short-description">Short Description (for cards)</Label>
                                 <div className="flex gap-2">
                                <Textarea id="short-description" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={2} className="flex-grow"/>
                                <Button variant="outline" size="icon" onClick={() => handleAiRefine('shortDescription', 'short-description')}><Sparkles className="h-4 w-4" /></Button>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Full Course Description</Label>
                                <div className="flex gap-2">
                                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className="flex-grow"/>
                                 <Button variant="outline" size="icon" onClick={() => handleAiRefine('description', 'description')}><Sparkles className="h-4 w-4" /></Button>
                                 </div>
                            </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                                        <SelectContent>
                                            {courseCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="level">Difficulty Level</Label>
                                    <Select value={level} onValueChange={setLevel}>
                                        <SelectTrigger><SelectValue placeholder="Select a level" /></SelectTrigger>
                                        <SelectContent>
                                            {courseLevels.map(lvl => <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="tags">Tags / Keywords</Label>
                                <div className="flex items-center gap-2">
                                    <Input id="tags" placeholder="e.g., react, javascript" value={currentTag} onChange={(e) => setCurrentTag(e.target.value)} 
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                                    <Button type="button" variant="outline" onClick={addTag}>Add Tag</Button>
                                    <Button type="button" variant="outline" size="icon" onClick={handleGenerateTags} disabled={isTagGenerationLoading}>
                                        {isTagGenerationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {tags.map(tag => (
                                        <Badge key={tag} variant="secondary">
                                            {tag} <button onClick={() => removeTag(tag)} className="ml-2 rounded-full hover:bg-background/50"><X className="h-3 w-3"/></button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Course Content & Structure</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label htmlFor="language">Language</Label><Input id="language" value={language} onChange={e => setLanguage(e.target.value)} /></div>
                                <div><Label htmlFor="courseFormat">Format</Label><Select value={courseFormat} onValueChange={(v) => setCourseFormat(v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{courseFormats.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent></Select></div>
                            </div>
                             <div className="grid grid-cols-3 gap-4">
                                <div><Label htmlFor="totalModules">Total Modules</Label><Input type="number" id="totalModules" value={totalModules} onChange={e => setTotalModules(e.target.value)} /></div>
                                <div><Label htmlFor="totalLessons">Total Lessons</Label><Input type="number" id="totalLessons" value={totalLessons} onChange={e => setTotalLessons(e.target.value)} /></div>
                                <div><Label htmlFor="estimatedDuration">Duration</Label><Input id="estimatedDuration" value={estimatedDuration} onChange={e => setEstimatedDuration(e.target.value)} placeholder="e.g., 8 hours"/></div>
                            </div>
                            <div className="grid gap-3">
                                <Label>Learning Outcomes</Label>
                                {learningOutcomes.map((outcome, index) => (
                                     <div key={index} className="flex items-center gap-2">
                                        <Input value={outcome} onChange={(e) => handleOutcomeChange(index, e.target.value)} placeholder={`Outcome #${index + 1}`}/>
                                        <Button variant="ghost" size="icon" onClick={() => removeOutcome(index)} disabled={learningOutcomes.length === 1}><X className="h-4 w-4 text-muted-foreground"/></Button>
                                     </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={addOutcome} className="mt-2">Add Outcome</Button>
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="prerequisites">Prerequisites</Label>
                                <Textarea id="prerequisites" value={prerequisites} onChange={(e) => setPrerequisites(e.target.value)} rows={3} placeholder="e.g., Basic knowledge of HTML & CSS"/>
                            </div>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle>Delivery Settings</CardTitle>
                            <CardDescription>Manage downloadable assets for this course.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="grid gap-2">
                                <Label htmlFor="download-url">Download ZIP Link</Label>
                                <Input id="download-url" placeholder="https://..." value={downloadUrl} onChange={(e) => setDownloadUrl(e.target.value)} />
                             </div>
                              <div className="grid gap-2">
                                <Label htmlFor="download-password">Download Password (Optional)</Label>
                                <Input id="download-password" value={downloadPassword} onChange={(e) => setDownloadPassword(e.target.value)} />
                             </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>Publishing</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid gap-2">
                                <Label>Status</Label>
                                <Select value={status} onValueChange={(value) => setStatus(value as 'draft' | 'published' | 'unpublished')}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="unpublished">Unpublished</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                 <Label>Visibility</Label>
                                 <RadioGroup value={visibility} onValueChange={(v) => setVisibility(v as 'public' | 'private')}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="public" id="v-public" />
                                        <Label htmlFor="v-public">Public</Label>
                                    </div>
                                     <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="private" id="v-private" />
                                        <Label htmlFor="v-private">Private</Label>
                                    </div>
                                 </RadioGroup>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing & Access</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div><Label>Course Type</Label><RadioGroup value={courseType} onValueChange={(v) => setCourseType(v as 'Free' | 'Paid')} className="mt-2"><div className="flex items-center space-x-2"><RadioGroupItem value="Paid" id="p-paid" /><Label htmlFor="p-paid">Paid</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="Free" id="p-free" /><Label htmlFor="p-free">Free</Label></div></RadioGroup></div>
                             {courseType === 'Paid' && (
                                <>
                                <div className="grid gap-2"><Label htmlFor="price">Price (INR)</Label><Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
                                <div className="grid gap-2"><Label htmlFor="discountPrice">Discount Price (Optional)</Label><Input id="discountPrice" type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} /></div>
                                </>
                             )}
                            <div><Label>Access Validity</Label><Select value={accessValidity} onValueChange={setAccessValidity}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{accessOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Certificate</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2"><Switch id="cert-enabled" checked={isCertificateEnabled} onCheckedChange={setIsCertificateEnabled}/><Label htmlFor="cert-enabled">Certificate Enabled</Label></div>
                            <div className="flex items-center space-x-2"><Switch id="quiz-required" checked={isQuizRequired} onCheckedChange={setIsQuizRequired} disabled={!isCertificateEnabled}/><Label htmlFor="quiz-required">Quiz Required</Label></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Image</CardTitle>
                            <CardDescription>The thumbnail displayed on the site.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="relative aspect-video w-full">
                                {imagePreview ? (
                                    <Image 
                                        src={imagePreview}
                                        alt="Course preview"
                                        fill
                                        className="rounded-md object-cover"
                                    />
                                ) : <Skeleton className="h-full w-full rounded-md" />}
                            </div>

                             <div className="grid gap-2">
                                <Label htmlFor="image-url">Image URL</Label>
                                <Input id="image-url" type="url" placeholder="https://..." value={finalImageUrl} onChange={handleImageUrlChange} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="image-file">Or Upload Image</Label>
                                <Input id="image-file" type="file" accept="image/*" onChange={handleImageFileChange} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
             <div className="flex items-center justify-center gap-2 md:hidden mt-6">
                <Button variant="outline" size="sm">
                    Discard
                </Button>
                <Button size="sm" onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Product
                </Button>
            </div>
            
            <AlertDialog open={isUploading}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Uploading Image</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please wait while your image is being uploaded.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                        <Progress value={uploadProgress} />
                        <p className="text-sm text-muted-foreground text-center">{Math.round(uploadProgress)}%</p>
                    </div>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!aiDialogField} onOpenChange={closeAiDialog}>
                <AlertDialogContent className="max-w-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Refine with AI</AlertDialogTitle>
                        <AlertDialogDescription>
                            Here is the AI's suggestion. You can apply it or cancel.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {isAiLoading ? (
                        <div className="flex items-center justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto">
                            <div>
                                <Label className="text-muted-foreground">Before</Label>
                                <div className="mt-2 rounded-md border p-3 bg-muted/50 h-full">
                                    <p className="text-sm whitespace-pre-wrap">{originalText}</p>
                                </div>
                            </div>
                            <div>
                                <Label className="text-green-600">AI Suggestion</Label>
                                <div className="mt-2 rounded-md border p-3 border-green-500/50 bg-green-500/10 h-full">
                                    <p className="text-sm text-green-900 dark:text-green-200 whitespace-pre-wrap">{aiSuggestion}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={closeAiDialog}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={applyAiSuggestion} disabled={isAiLoading}>Apply Suggestion</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </main>
    )
}
