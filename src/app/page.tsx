
'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Library,
  ShieldCheck,
  TrendingUp,
  Download,
  LayoutGrid,
  Lock,
  Star,
  CheckCircle,
  Search,
  Loader2,
} from 'lucide-react';
import { useMemo, useState, useTransition, useEffect, useRef } from 'react';
import { collection, query, where, limit, orderBy } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CourseCard } from '@/components/app/course-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import type { Course, Certificate, Enrollment, Review } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { faqAssistant, type FaqAssistantOutput } from '@/ai/flows/faq-assistant';
import { ReviewCard } from '@/components/app/review-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useSiteSettings } from '@/hooks/use-settings';

// Custom hook for scroll-reveal animations
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.fade-in-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => elements.forEach((el) => observer.unobserve(el));
  }, []);
}

function HeroSection() {
  const { user } = useUser();
  return (
    <section className="relative w-full overflow-hidden bg-transparent pt-16 md:pt-24 lg:pt-32 fade-in-on-scroll">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 grid grid-cols-2 -space-x-52 opacity-20 dark:opacity-20"
      >
        <div className="h-56 bg-gradient-to-br from-primary to-purple-400 blur-[106px] dark:from-blue-700"></div>
        <div className="h-32 bg-gradient-to-r from-cyan-400 to-sky-300 blur-[106px] dark:to-indigo-600"></div>
      </div>
       <div className="hero-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl max-w-4xl gradient-text animate-fade-in-up">
            Unlock Your Potential with CourseVerse
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            A course distribution and access management platform. My role is
            limited to platform administration, content distribution, and
            access control.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {user ? (
              <Button asChild size="lg">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link href="/login">
                  Sign In to Enroll <ArrowRight className="ml-2" />
                </Link>
              </Button>
            )}
            <Button asChild variant="glass" size="lg">
              <Link href="/courses">Explore All</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <Library className="h-8 w-8 text-primary" />,
      title: 'Licensed Content',
      description:
        'Access a curated library of high-quality, licensed courses from trusted creators.',
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: 'Secure Access',
      description:
        'Your learning environment is protected with secure account management and access controls.',
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: 'Track Your Progress',
      description:
        'Stay motivated with our intuitive progress tracking system for every course.',
    },
    {
      icon: <Download className="h-8 w-8 text-primary" />,
      title: 'Offline-Friendly Access',
      description:
        'Download course materials to learn on the go, anytime, anywhere.',
    },
    {
      icon: <LayoutGrid className="h-8 w-8 text-primary" />,
      title: 'Clean Dashboard',
      description:
        'A beautifully designed, clutter-free dashboard to manage your learning journey.',
    },
    {
      icon: <Lock className="h-8 w-8 text-primary" />,
      title: 'Verified Certificates',
      description:
        'Earn verifiable certificates to showcase your skills and accomplishments.',
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-24 fade-in-on-scroll">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl gradient-text">
            A Better Way to Learn
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            We provide the tools and high-quality licensed content you need to
            succeed, without the noise.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="glass-card text-center rounded-xl shadow-ambient transition-all duration-300 hover:shadow-glow hover:-translate-y-1.5 group"
            >
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 transition-colors">
                  {feature.icon}
                </div>
                <CardTitle className="font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedCoursesSection() {
  const firestore = useFirestore();
  const { user } = useUser();

  const coursesQuery = useMemoFirebase(
    () =>
      query(
        collection(firestore, 'courses'),
        where('status', '==', 'published'),
        limit(6)
      ),
    [firestore]
  );

  const { data: courses, isLoading } = useCollection<Course>(coursesQuery);

  const enrollmentsQuery = useMemoFirebase(
    () =>
      user ? collection(firestore, 'users', user.uid, 'enrollments') : null,
    [firestore, user]
  );
  const { data: enrollments } = useCollection<Enrollment>(enrollmentsQuery);
  
  const certificatesQuery = useMemoFirebase(
    () =>
      user ? collection(firestore, 'users', user.uid, 'certificates') : null,
    [firestore, user]
  );
  const { data: certificates } = useCollection<Certificate>(certificatesQuery);
  
  const userReviewsQuery = useMemoFirebase(
    () => (user ? query(collection(firestore, 'reviews'), where('userId', '==', user.uid)) : null),
    [firestore, user]
  );
  const { data: userReviews } = useCollection<Review>(userReviewsQuery);

  const enrolledCourseIds = useMemo(() => {
    if (!enrollments) return [];
    return enrollments.map(e => e.courseId);
  }, [enrollments]);

  return (
    <section id="courses" className="bg-background/50 py-16 sm:py-24 fade-in-on-scroll">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl gradient-text">
            Featured Courses
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Handpicked courses to kickstart your learning adventure.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[400px] w-full rounded-xl skeleton-shimmer" />
              ))
            : courses?.map(course => {
                const certificate = certificates?.find(c => c.courseId === course.id);
                const enrollment = enrollments?.find(e => e.courseId === course.id);
                const hasReviewed = userReviews?.some(r => r.courseId === course.id);
                return (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isEnrolled={enrolledCourseIds.includes(course.id)}
                    certificate={certificate}
                    enrollment={enrollment}
                    hasReviewed={hasReviewed}
                  />
                )
            })}
        </div>
        <div className="mt-12 text-center">
          <Button asChild variant="outline">
            <Link href="/courses">View All Courses</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function ReviewsSection() {
    const { settings, isLoading } = useSiteSettings();
    const sortedReviews = settings.featuredReviews || [];

    return (
        <section id="reviews" className="py-16 sm:py-24 fade-in-on-scroll">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-12 text-center max-w-3xl mx-auto">
                    <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl gradient-text">
                        What Our Students Say
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Real stories from users who transformed their careers with courses from CourseVerse.
                    </p>
                </div>
                {isLoading ? (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl skeleton-shimmer" />)}
                    </div>
                ) : sortedReviews.length > 0 ? (
                    <Carousel
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-4">
                            {sortedReviews.map((review) => (
                                <CarouselItem key={review.id} className="md:basis-1/2 lg:basis-1/3 pl-4">
                                    <div className="p-1 h-full">
                                        <ReviewCard review={review} />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="hidden sm:flex" />
                        <CarouselNext className="hidden sm:flex" />
                    </Carousel>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        No reviews yet. Be the first to leave one!
                    </div>
                )}
            </div>
        </section>
    );
}

const faqData = [
    {
      id: 'what-is-courseverse',
      question: 'What is CourseVerse and how does it work?',
      answer:
        'CourseVerse is a distribution platform for high-quality, licensed educational content. As the administrator, I manage the platform and ensure access to courses created by trusted third-party experts. It is not a marketplace for instructors to upload their own content.',
    },
    {
      id: 'are-courses-licensed',
      question: 'Are CourseVerse courses officially licensed?',
      answer:
        'Yes. Every course available on CourseVerse is officially licensed from its original creator. We believe in ethical content distribution and compensating creators for their work.',
    },
    {
      id: 'lifetime-access',
      question: 'Do I get lifetime access after purchase?',
      answer:
        'Yes, once a course is purchased, you have lifetime access to its downloadable materials through your dashboard. You can download them as many times as you like.',
    },
    {
      id: 'payment-verification',
      question: 'How does the payment and verification process work?',
      answer:
        'You pay the specified amount via UPI. After payment, you submit the transaction ID (UTR) and a screenshot on the payment page. Our automated system, enhanced with AI, verifies the payment. For valid payments, course access is granted instantly.',
    },
    {
      id: 'after-purchase',
      question: 'What happens after I buy a course?',
      answer:
        'Once your payment is verified, the course is immediately added to your account. You will have access to download all the course materials, including videos and project files, directly from your dashboard.',
    },
    {
      id: 'where-to-download',
      question: 'Where can I download my purchased courses?',
      answer:
        'All your purchased courses and their downloadable assets are available in the "My Downloads" section of your personal dashboard. You must be logged in to access this page.',
    },
    {
      id: 'are-certificates-provided',
      question: 'Are certificates provided?',
      answer:
        'Yes, upon successful completion of a course, you will be issued a verifiable certificate which you can find in your dashboard.',
    },
    {
      id: 'payment-issue',
      question: 'What should I do if I face a payment issue?',
      answer:
        'If your payment is successful but verification fails, or if you encounter any other issues, please contact us through the contact page. We will manually review your transaction and resolve the issue as quickly as possible.',
    },
     {
      id: 'login-required',
      question: 'Is login required to access downloads?',
      answer:
        'Yes, you must be logged into your CourseVerse account to access the "My Downloads" page and download your purchased course materials. This ensures secure access to your content.',
    },
  ];

function AiFaqSection() {
    const [isPending, startTransition] = useTransition();
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<FaqAssistantOutput | null>(null);
    const [activeAccordionItem, setActiveAccordionItem] = useState<string | null>(null);
    
    const allFaqs = faqData;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        startTransition(async () => {
            const res = await faqAssistant({ userQuestion: query });
            setResult(res);
            if (res.bestMatchId) {
                setActiveAccordionItem(`item-${res.bestMatchId}`);
            } else {
                setActiveAccordionItem(null); 
            }
        });
    };

    return (
        <section id="faq" className="py-16 sm:py-24 bg-background/50 fade-in-on-scroll">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-12 text-center max-w-3xl mx-auto">
                    <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl gradient-text">
                        Frequently Asked Questions
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Clear answers, powered by smart assistance.
                    </p>
                </div>
                
                <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-8">
                     <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Ask a question..." 
                            className="pl-12 h-14 text-lg rounded-full focus:ring-primary/50 shadow-ambient"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {isPending && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />}
                    </div>
                </form>

                {result && result.isGenerated && (
                    <Card className="glass-card max-w-3xl mx-auto mb-8 rounded-xl shadow-ambient">
                        <CardHeader>
                            <CardTitle className="gradient-text">AI Generated Answer</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <p className="text-muted-foreground">{result.answer}</p>
                        </CardContent>
                    </Card>
                )}

                <Accordion 
                    type="single" 
                    collapsible 
                    className="w-full max-w-3xl mx-auto space-y-3"
                    value={activeAccordionItem || ''}
                    onValueChange={setActiveAccordionItem}
                >
                    {allFaqs.map((faq) => (
                        <AccordionItem key={faq.id} value={`item-${faq.id}`} className="glass-card rounded-xl border-none shadow-ambient transition-colors data-[state=open]:bg-card/80">
                            <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline px-6">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground px-6">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}


export default function Home() {
  useScrollReveal();
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <FeaturedCoursesSection />
      <ReviewsSection />
      <AiFaqSection />
    </>
  );
}

