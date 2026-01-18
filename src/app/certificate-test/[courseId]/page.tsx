'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import type { Course } from '@/lib/types';
import { generateQuiz, type GenerateQuizOutput } from '@/ai/flows/generate-quiz';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { createLogEntry } from '@/lib/actions';

type AnswerState = { [questionIndex: number]: string };

export default function CertificateTestPage() {
    const { courseId } = useParams();
    const router = useRouter();
    const { user, profile } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [course, setCourse] = useState<Course | null>(null);
    const [quiz, setQuiz] = useState<GenerateQuizOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [answers, setAnswers] = useState<AnswerState>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const courseRef = useMemoFirebase(() => doc(firestore, 'courses', courseId as string), [firestore, courseId]);

    useEffect(() => {
        if (!courseRef || !user) return;

        const fetchCourseAndGenerateQuiz = async () => {
            try {
                const docSnap = await getDoc(courseRef);
                if (!docSnap.exists()) {
                    toast({ variant: 'destructive', title: 'Error', description: 'Course not found.' });
                    router.push('/dashboard/courses');
                    return;
                }
                const courseData = docSnap.data() as Course;
                setCourse(courseData);

                const quizData = await generateQuiz({
                    courseTitle: courseData.title,
                    courseDescription: courseData.description,
                });
                setQuiz(quizData);

            } catch (error) {
                console.error("Error setting up quiz:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate the quiz. Please try again later.' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourseAndGenerateQuiz();
    }, [courseRef, user, router, toast]);

    const handleAnswerChange = (questionIndex: number, value: string) => {
        setAnswers(prev => ({...prev, [questionIndex]: value}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!quiz || !user || !profile || !firestore || !course) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not submit quiz. Missing context.' });
            setIsSubmitting(false);
            return;
        }

        let score = 0;
        quiz.questions.forEach((q, index) => {
            if (answers[index] === q.correctAnswer) {
                score++;
            }
        });

        const passingScore = 6;
        if (score >= passingScore) {
            // Passed the quiz
            try {
                // Check if certificate already exists
                const certRef = doc(firestore, 'users', user.uid, 'certificates', course.id);
                const certSnap = await getDoc(certRef);

                if (certSnap.exists()) {
                    // Already issued, redirect to success page.
                    router.push(`/certificate-issued/${course.id}`);
                    return;
                }

                const certificateCode = `CV-${course.category.substring(0, 3).toUpperCase()}-${course.id.substring(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
                const issueDate = Timestamp.now();
                const studentName = `${profile.firstName} ${profile.lastName}`.trim();
                
                const certificateData = {
                    id: course.id, // Using courseId as document ID in subcollection
                    userId: user.uid,
                    courseId: course.id,
                    studentName: studentName,
                    courseName: course.title,
                    courseLevel: course.level || 'Beginner',
                    issueDate: issueDate,
                    certificateCode: certificateCode,
                    status: 'valid' as const,
                };

                // Create user's private certificate record (doc ID is course ID for uniqueness)
                await setDoc(certRef, certificateData);
                
                // Create public verification record (doc ID is the unique code)
                const publicCertRef = doc(firestore, 'certificates', certificateCode);
                await setDoc(publicCertRef, { ...certificateData, id: certificateCode }); // Here, id is the certificate code
                
                await createLogEntry({
                    source: 'system',
                    severity: 'info',
                    message: 'Certificate issued after passing quiz.',
                    metadata: { userId: user.uid, courseId: course.id, certificateCode: certificateCode }
                });

                toast({ title: "Quiz Passed!", description: "Congratulations! Your certificate has been issued." });
                router.push(`/certificate-issued/${course.id}`);

            } catch (error: any) {
                console.error("Certificate issuance error:", error);
                toast({ variant: 'destructive', title: 'Error Issuing Certificate', description: error.message });
                setIsSubmitting(false);
            }
        } else {
            // Failed the quiz
            toast({
                variant: "destructive",
                title: "Quiz Failed",
                description: `You scored ${score} out of ${quiz.questions.length}. A minimum of ${passingScore} is required. Please review the course material and try again.`,
                duration: 9000,
            });
            // TODO: Add logic for retry attempts
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Preparing your certification test...</p>
            </div>
        );
    }

    if (!course || !quiz) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p className="text-destructive">Failed to load the quiz. Please try again later.</p>
                <Button asChild>
                    <Link href="/dashboard/courses">Go Back</Link>
                </Button>
            </div>
        );
    }
    
    const allQuestionsAnswered = Object.keys(answers).length === quiz.questions.length;

    return (
        <main className="container mx-auto px-4 py-12 max-w-3xl">
            <div className="mb-8">
                <Button asChild variant="ghost">
                    <Link href="/dashboard/courses">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to My Courses
                    </Link>
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Certificate Test: {course.title}</CardTitle>
                    <CardDescription>Answer all questions to the best of your ability to earn your certificate.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {quiz.questions.map((q, qIndex) => (
                            <div key={qIndex} className="p-4 border rounded-lg bg-muted/20">
                                <p className="font-semibold mb-4">{qIndex + 1}. {q.questionText}</p>
                                <RadioGroup 
                                    value={answers[qIndex]}
                                    onValueChange={(value) => handleAnswerChange(qIndex, value)}
                                    className="space-y-2"
                                >
                                    {q.options.map((option, oIndex) => (
                                        <div key={oIndex} className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
                                            <RadioGroupItem value={option} id={`q${qIndex}o${oIndex}`} />
                                            <Label htmlFor={`q${qIndex}o${oIndex}`} className="cursor-pointer w-full">{option}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                        ))}

                        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || !allQuestionsAnswered}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit & Get Certificate
                        </Button>
                         {!allQuestionsAnswered && <p className="text-center text-sm text-muted-foreground">Please answer all questions to submit.</p>}
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}
