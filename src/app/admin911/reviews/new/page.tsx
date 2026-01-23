'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';

import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { createLogEntry } from '@/lib/actions';
import { generateReviews } from '@/ai/flows/generate-reviews';
import type { Course, Review } from '@/lib/types';

const generateSchema = z.object({
  courseId: z.string().min(1, 'Please select a course.'),
  count: z.number().min(1).max(5),
});

type GenerateFormValues = z.infer<typeof generateSchema>;

export default function GenerateReviewsPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user: adminUser } = useUser();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const coursesQuery = useMemoFirebase(() => collection(firestore, 'courses'), [firestore]);
  const { data: courses, isLoading: coursesLoading } = useCollection<Course>(coursesQuery);

  const form = useForm<GenerateFormValues>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      courseId: '',
      count: 3,
    },
  });

  const onSubmit = async (data: GenerateFormValues) => {
    if (!firestore || !adminUser) return;
    setIsGenerating(true);

    const selectedCourse = courses?.find(c => c.id === data.courseId);
    if (!selectedCourse) {
      toast({ variant: 'destructive', title: 'Error', description: 'Selected course not found.' });
      setIsGenerating(false);
      return;
    }

    try {
      const result = await generateReviews({
        courseTitle: selectedCourse.title,
        courseDescription: selectedCourse.description,
        count: data.count,
      });

      const reviewPromises = result.reviews.map(reviewData => {
        const reviewPayload: Omit<Review, 'id'> = {
          userId: adminUser.uid,
          courseId: selectedCourse.id,
          courseName: selectedCourse.title,
          userName: reviewData.userName,
          userAvatar: `https://i.pravatar.cc/150?u=${reviewData.userName}`,
          rating: reviewData.rating,
          title: reviewData.title,
          text: reviewData.text,
          status: 'approved',
          createdAt: serverTimestamp(),
          isVerifiedPurchase: false, // AI-generated are not verified
          source: 'ai_generated',
        };
        return addDoc(collection(firestore, 'reviews'), reviewPayload);
      });
      
      await Promise.all(reviewPromises);

      await createLogEntry({
        source: 'admin',
        severity: 'info',
        message: `Generated ${data.count} reviews for course: ${selectedCourse.title}`,
        metadata: { userId: adminUser.uid, courseId: selectedCourse.id },
      });

      toast({ title: 'Reviews Generated!', description: `${data.count} new reviews have been created and approved.` });
      router.push('/admin911/reviews');
    } catch (error: any) {
      console.error("Error generating reviews:", error);
      toast({ variant: 'destructive', title: 'Error Generating Reviews', description: error.message });
      setIsGenerating(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="icon" className="h-7 w-7" asChild>
              <Link href="/admin911/reviews">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              Generate Showcase Reviews
            </h1>
            <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <Button variant="outline" size="sm" type="button" onClick={() => router.push('/admin911/reviews')}>
                Cancel
              </Button>
              <Button size="sm" type="submit" disabled={isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate
              </Button>
            </div>
          </div>
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>AI Review Generator</CardTitle>
              <CardDescription>
                Select a course and the number of reviews to generate. The AI will create realistic, positive reviews for showcase purposes.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={coursesLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course to review..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses?.map(course => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Reviews to Generate: {field.value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
           <div className="flex items-center justify-center gap-2 md:hidden mt-6">
              <Button variant="outline" size="sm" type="button" onClick={() => router.push('/admin911/reviews')}>Cancel</Button>
              <Button size="sm" type="submit" disabled={isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate
              </Button>
            </div>
        </form>
      </Form>
    </main>
  );
}

    