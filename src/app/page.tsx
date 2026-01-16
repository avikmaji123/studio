
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
import { useMemo, useState, useRef, useEffect } from 'react';
import { collection, query, where, limit } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CourseCard } from '@/components/app/course-card';
import { testimonials } from '@/lib/testimonials';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Course } from '@/lib/types';


const testimonialImages = {
  'testimonial-1': PlaceHolderImages.find(p => p.id === 'testimonial-1'),
  'testimonial-2': PlaceHolderImages.find(p => p.id === 'testimonial-2'),
  'testimonial-3': PlaceHolderImages.find(p => p.id === 'testimonial-3'),
  'testimonial-4': PlaceHolderImages.find(p => p.id === 'testimonial-4'),
};

function HeroSection() {
  const { user } = useUser();
  const firestore = useFirestore();

  const featuredCourseQuery = useMemoFirebase(() => query(
    collection(firestore, 'courses'), 
    where('status', '==', 'published'),
    limit(1)
  ), [firestore]);
  const { data: featuredCourses, isLoading } = useCollection<Course>(featuredCourseQuery);
  const course = featuredCourses?.[0];

  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    const maxRotate = 8;
    setRotation({
      x: yPct * -maxRotate,
      y: xPct * maxRotate,
    });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };
  
  return (
    <section className="relative w-full overflow-hidden bg-background pt-16 md:pt-24 lg:pt-32 pb-12">
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 opacity-50 dark:opacity-60"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 left-[-20%] right-[-20%] top-[20%] rounded-full bg-gradient-to-br from-primary/5 via-secondary/5 to-secondary/10 blur-3xl"></div>
        <div className="absolute right-[20%] top-[5%] h-32 w-32 rounded-full bg-primary/10 blur-3xl"></div>
      </div>
      <div className="container relative mx-auto px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center space-y-6">
            <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Level Up Your Skills with CourseVerse
            </h1>
            <p className="max-w-[600px] text-lg text-muted-foreground">
              A premium learning management platform for course creation,
              distribution, and access.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              {user ? (
                 <Button asChild size="lg">
                    <Link href="/dashboard">Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
              ) : (
                <Button asChild size="lg">
                  <Link href="/courses">
                    Explore Courses <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
          <div 
            className="relative flex items-center justify-center [perspective:1000px]"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {isLoading ? (
                <Skeleton className="h-[450px] w-full max-w-sm rounded-3xl" />
            ) : course ? (
              <div 
                ref={cardRef}
                className="group relative h-[450px] w-full max-w-sm rounded-3xl transition-all duration-300 ease-out [transform-style:preserve-3d] animate-float md:animate-none"
                style={{
                  transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                }}
              >
                {/* 3D Base Layer */}
                <div className="absolute inset-x-4 top-8 h-full rounded-3xl bg-black/40 blur-xl transition-all duration-300 group-hover:inset-x-2 group-hover:top-6"></div>

                {/* Card Itself */}
                <div className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/20 text-white shadow-2xl shadow-primary/20 backdrop-blur-lg [transform-style:preserve-3d] [transform:translateZ(20px)]">
                    <Image
                        src={course.imageUrl || ''}
                        alt={course.title}
                        fill
                        className="absolute inset-0 -z-10 object-cover opacity-20 transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 -z-20 bg-gradient-to-b from-primary/20 via-black/80 to-black"></div>

                    <div className="flex-grow p-6">
                        <h3 className="font-headline text-2xl font-bold tracking-tight">{course.title}</h3>
                        <p className="mt-2 max-w-[90%] text-sm text-white/70">{course.shortDescription}</p>
                    </div>

                    <div className="flex items-center justify-between p-6 pt-0">
                      <Button asChild variant="outline" className="bg-white/10 text-white backdrop-blur-md hover:bg-white/20">
                          <Link href={`/courses/${course.slug}`}>View Course</Link>
                      </Button>
                      <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-md">
                          {course.price}
                      </span>
                    </div>
                </div>
              </div>
            ) : null}
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
      description: 'Stay motivated with our intuitive progress tracking system for every course.',
    },
     {
      icon: <Download className="h-8 w-8 text-primary" />,
      title: 'Offline-Friendly Access',
      description: 'Download course materials to learn on the go, anytime, anywhere.',
    },
    {
      icon: <LayoutGrid className="h-8 w-8 text-primary" />,
      title: 'Clean Dashboard',
      description: 'A beautifully designed, clutter-free dashboard to manage your learning journey.',
    },
    {
      icon: <Lock className="h-8 w-8 text-primary" />,
      title: 'Verified Certificates',
      description: 'Earn verifiable certificates to showcase your skills and accomplishments.',
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
  const coursesQuery = useMemoFirebase(() => query(
    collection(firestore, 'courses'), 
    where('status', '==', 'published'),
    limit(6)
  ), [firestore]);
  const { data: featuredCourses, isLoading } = useCollection<Course>(coursesQuery);

  const enrollmentsQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'enrollments') : null),
    [firestore, user]
  );
  const { data: enrollments, isLoading: enrollmentsLoading } = useCollection(enrollmentsQuery);

  const enrolledCourseIds = useMemo(() => enrollments?.map(e => e.id) || [], [enrollments]);

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
           {(isLoading || enrollmentsLoading) ? (
             Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[420px] w-full" />
             ))
           ) : (
            featuredCourses?.map(course => (
              <CourseCard key={course.id} course={course} isEnrolled={enrolledCourseIds.includes(course.id)} />
            ))
           )}
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
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
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
