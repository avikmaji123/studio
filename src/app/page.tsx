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

const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');
const testimonialImages = {
  'testimonial-1': PlaceHolderImages.find(p => p.id === 'testimonial-1'),
  'testimonial-2': PlaceHolderImages.find(p => p.id === 'testimonial-2'),
  'testimonial-3': PlaceHolderImages.find(p => p.id === 'testimonial-3'),
  'testimonial-4': PlaceHolderImages.find(p => p.id === 'testimonial-4'),
};

function HeroSection() {
  const { user } = useUser();
  return (
    <section className="relative w-full overflow-hidden bg-background pt-16 md:pt-24 lg:pt-32">
      <div
        aria-hidden="true"
        className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20"
      >
        <div className="h-56 bg-gradient-to-br from-primary to-purple-400 blur-[106px] dark:from-blue-700"></div>
        <div className="h-32 bg-gradient-to-r from-cyan-400 to-sky-300 blur-[106px] dark:to-indigo-600"></div>
      </div>
      <div className="container relative mx-auto px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 md:gap-16">
          <div className="flex flex-col justify-center space-y-6">
            <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Unlock Your Potential with CourseVerse
            </h1>
            <p className="max-w-[600px] text-lg text-muted-foreground">
              A course distribution and access management platform. My role is
              limited to platform administration, content distribution, and
              access control.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
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
              <Button asChild variant="secondary" size="lg">
                <Link href="/courses">Explore All</Link>
              </Button>
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                data-ai-hint={heroImage.imageHint}
                width={600}
                height={400}
                className="rounded-xl object-cover shadow-2xl"
              />
            )}
            <div className="absolute -bottom-8 -right-8 z-10 hidden lg:block">
              <div className="rounded-lg bg-card p-4 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {Object.values(testimonialImages).map(
                      (img, i) =>
                        img && (
                          <Avatar key={i}>
                            <AvatarImage
                              src={img.imageUrl}
                              alt={img.description}
                            />
                            <AvatarFallback>U{i + 1}</AvatarFallback>
                          </Avatar>
                        )
                    )}
                  </div>
                  <div>
                    <p className="font-bold">+10k</p>
                    <p className="text-sm text-muted-foreground">
                      Happy Students
                    </p>
                  </div>
                </div>
              </div>
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
    <section id="features" className="py-16 sm:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
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
              className="text-center transition-transform hover:scale-105 hover:shadow-lg"
            >
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
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
    <section id="courses" className="bg-muted/50 py-16 sm:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
            Featured Courses
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Handpicked courses to kickstart your learning adventure.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
          <Button asChild variant="outline">
            <Link href="/courses">View All Courses</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-16 sm:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
            What Our Students Say
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Real stories from users who transformed their careers with courses
            from CourseVerse.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {testimonials.map(testimonial => (
            <Card
              key={testimonial.id}
              className="flex flex-col transition-transform transform hover:-translate-y-1 hover:shadow-xl"
            >
              <CardContent className="flex-grow p-6 space-y-4">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonial.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-muted-foreground/50'
                      }`}
                    />
                  ))}
                </div>
                <blockquote className="text-base text-foreground/90 italic">
                  "{testimonial.quote}"
                </blockquote>
              </CardContent>
              <CardHeader className="pt-0 p-6 flex flex-row items-center gap-4">
                {testimonialImages[
                  testimonial.imageId as keyof typeof testimonialImages
                ] && (
                  <Avatar>
                    <AvatarImage
                      src={
                        testimonialImages[
                          testimonial.imageId as keyof typeof testimonialImages
                        ]?.imageUrl
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
              </CardHeader>
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
