'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  ShieldCheck,
  TrendingUp,
  Download,
  LayoutGrid,
  Lock,
  Star,
} from 'lucide-react';
import { useMemo } from 'react';
import { collection, query, where, limit } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CourseCard } from '@/components/app/course-card';
import { testimonials } from '@/lib/testimonials';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import type { Course } from '@/lib/types';

function HeroSection() {
  const { user } = useUser();
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              data-ai-hint={heroImage.imageHint}
              width={600}
              height={400}
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
            />
          )}
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Unlock Your Potential with CourseVerse
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                A course distribution and access management platform. My goal is
                to build a platform that focuses on long-term value, content
                distribution, and access control.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              {user ? (
                <Button asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/login">Sign In to Enroll</Link>
                </Button>
              )}
              <Button asChild variant="secondary">
                <Link href="/courses">Explore All</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: 'Licensed Content',
      description:
        'Access a licensed library of high-quality licensed courses from trusted creators.',
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: 'Secure Access',
      description:
        'Your data is yours, protected with secure authentication and access controls.',
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: 'Track Your Progress',
      description:
        'Our dashboard helps you track your progress, stay on track, and reach your goals.',
    },
    {
      icon: <Download className="h-8 w-8" />,
      title: 'Offline-Friendly Access',
      description:
        'Take your learning with you, with courses available for offline viewing.',
    },
    {
      icon: <LayoutGrid className="h-8 w-8" />,
      title: 'Clean Dashboard',
      description:
        'A thoughtfully designed dashboard makes it easy to manage your learning journey.',
    },
    {
      icon: <ShieldCheck className="h-8 w-8" />,
      title: 'Verified Certificates',
      description:
        'Receive a verified certificate upon course completion to showcase your new skills.',
    },
  ];

  return (
    <section id="features" className="py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            A Better Way to Learn
          </h2>
          <p className="mt-2 text-muted-foreground md:text-xl/relaxed">
            We provide the best and high-quality licensed content you need to
            succeed in your career.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {feature.icon}
                </div>
                <CardTitle>{feature.title}</CardTitle>
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
  const { data: enrollments } = useCollection(enrollmentsQuery);

  const enrolledCourseIds = useMemo(() => {
    if (!enrollments) return [];
    return enrollments.map(e => e.id);
  }, [enrollments]);

  return (
    <section id="courses" className="py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            Featured Courses
          </h2>
          <p className="mt-2 text-muted-foreground md:text-xl/relaxed">
            Our most popular courses to get you started on your journey.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[350px] w-full" />
              ))
            : courses?.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isEnrolled={enrolledCourseIds.includes(course.id)}
                />
              ))}
        </div>
        <div className="mt-12 text-center">
          <Button asChild>
            <Link href="/courses">
              View All Courses <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            What Our Students Say
          </h2>
          <p className="mt-2 text-muted-foreground md:text-xl/relaxed">
            Real stories from people who have transformed their careers with
            CourseVerse.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {testimonials.map(testimonial => (
            <Card key={testimonial.id}>
              <CardContent className="p-6">
                <div className="flex mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonial.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                <blockquote className="text-lg font-semibold leading-snug">
                  "{testimonial.quote}"
                </blockquote>
                <div className="mt-4 flex items-center gap-4">
                  {PlaceHolderImages.find(p => p.id === testimonial.imageId) && (
                    <Avatar>
                      <AvatarImage
                        src={
                          PlaceHolderImages.find(
                            p => p.id === testimonial.imageId
                          )?.imageUrl
                        }
                        alt={testimonial.name}
                      />
                      <AvatarFallback>
                        {testimonial.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.title}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <FeaturedCoursesSection />
      <TestimonialsSection />
    </>
  );
}
