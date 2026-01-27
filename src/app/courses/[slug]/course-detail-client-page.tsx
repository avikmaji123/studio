
'use client';

import Image from 'next/image';
import {
  Clock, BarChart, Star, CheckCircle, Download, BookCopy, ShieldCheck, Zap, Layers, Target, Info, Package, Award, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { Course } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { CountdownTimer } from '@/components/app/countdown-timer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { StarRating } from '@/components/app/star-rating';
import { cn } from '@/lib/utils';

function CourseDetailSkeleton() {
  return (
    <div className="bg-background">
      <header className="relative h-96 bg-muted">
        <Skeleton className="h-full w-full" />
      </header>
      <div className="container mx-auto -mt-32 px-4 md:px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="sticky top-24 h-96 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

function PurchaseCard({ course, className }: { course: Course, className?: string }) {
  const isOfferActive = course.discountPrice && course.offerEndDate && course.offerEndDate.toDate() > new Date();
  const displayPrice = isOfferActive ? course.discountPrice : course.price;
  const originalPrice = isOfferActive ? course.price : null;

  return (
    <Card className={cn("rounded-2xl shadow-premium-light dark:shadow-lg", className)}>
      <CardHeader>
        <div className="flex justify-center items-baseline gap-2">
          {originalPrice && <span className="text-2xl text-muted-foreground line-through">{originalPrice}</span>}
          <Badge variant="secondary" className="text-3xl font-bold w-full justify-center py-2">{displayPrice}</Badge>
        </div>
        {isOfferActive && course.offerEndDate && (
          <div className="mt-4 flex justify-center">
            <CountdownTimer endDate={course.offerEndDate.toDate()} />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <Button asChild className="w-full" size="lg">
          <Link href={`/courses/${course.slug}/payment`}>Buy Course</Link>
        </Button>
        <div className="space-y-3 text-sm text-muted-foreground pt-4 border-t">
          <h3 className="font-semibold text-foreground">What's included:</h3>
          <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> {course.estimatedDuration || 'Self-paced study'}</p>
          <p className="flex items-center gap-2"><Package className="w-4 h-4 text-primary" /> {course.totalLessons || 'Multiple'} hands-on labs & projects</p>
          <p className="flex items-center gap-2"><BookCopy className="w-4 h-4 text-primary" /> Lifetime access to materials</p>
          <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> Certificate of completion</p>
        </div>
        <div className="flex items-center justify-center gap-2 pt-4 text-xs text-muted-foreground border-t">
          <ShieldCheck className="h-4 w-4" /> Secure Payment
        </div>
      </CardContent>
    </Card>
  )
}

function HeroSection({ course }: { course: Course }) {
  return (
    <header className="relative overflow-hidden bg-background">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image src={course.imageUrl || ''} alt={course.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent dark:from-slate-950 dark:via-slate-950/80" />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6 pt-24 pb-12">
        <div className="max-w-3xl space-y-4 text-left">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Badge variant="outline" className="border-primary text-primary">{course.category}</Badge>
            <Badge variant="secondary">{course.level}</Badge>
          </div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight animated-headline">{course.title}</h1>
          <p className="text-lg md:text-xl text-muted-foreground">{course.tagline || course.shortDescription}</p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <StarRating rating={course.rating || 4.5} className="text-yellow-400" />
              <span className="text-muted-foreground font-medium">({course.rating || 4.5} / 5)</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="font-medium">{course.enrollmentCount || 0} students</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

const Section = ({ id, title, icon: Icon, children }: { id: string, title: string, icon: React.ElementType, children: React.ReactNode }) => (
  <section id={id} className="scroll-mt-20">
    <div className="flex items-center gap-3 mb-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
    </div>
    <div className="pl-4 border-l-2 border-primary/20 ml-5">{children}</div>
  </section>
)

export default function CourseDetailClientPage({ course }: { course: Course | null }) {
  if (!course) {
    return <CourseDetailSkeleton />;
  }

  return (
    <div className="bg-background dark:bg-slate-950/70">
      <HeroSection course={course} />
      
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-16">
            <Section id="overview" title="Course Overview" icon={Info}>
              <div className="prose dark:prose-invert max-w-none text-muted-foreground text-lg" dangerouslySetInnerHTML={{ __html: course.description.replace(/\n/g, '<br />') }} />
            </Section>
            
            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
              <Section id="outcomes" title="What You'll Learn" icon={Zap}>
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-lg">
                  {course.learningOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {course.highlights && course.highlights.length > 0 && (
               <Section id="highlights" title="Course Highlights" icon={Layers}>
                <div className="grid sm:grid-cols-2 gap-4">
                  {course.highlights.map((highlight, index) => (
                    <Card key={index} className="bg-muted/50 dark:bg-slate-800/50">
                      <CardContent className="p-4 flex items-center gap-4">
                        <CheckCircle className="h-6 w-6 text-primary" />
                        <p className="font-medium">{highlight}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </Section>
            )}
            
            {course.whoIsThisFor && course.whoIsThisFor.length > 0 && (
              <Section id="audience" title="Who This Course Is For" icon={Target}>
                 <ul className="space-y-3 text-lg">
                  {course.whoIsThisFor.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
            
            {course.prerequisites && course.prerequisites.length > 0 && (
              <Section id="prerequisites" title="Prerequisites" icon={Package}>
                <ul className="space-y-3 text-lg">
                  {(Array.isArray(course.prerequisites) ? course.prerequisites : [course.prerequisites])
                    .flatMap(req => typeof req === 'string' ? req.split('\n') : [])
                    .filter(line => line.trim())
                    .map((req, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                  ))}
                </ul>
              </Section>
            )}

            <Section id="certificate" title="Get Certified" icon={Award}>
               <p className="text-lg text-muted-foreground">
                Upon successful completion of this course, you will receive a verifiable Certificate of Completion from CourseVerse to showcase your new skills on your resume, LinkedIn profile, or portfolio.
              </p>
            </Section>

            {course.courseFaqs && course.courseFaqs.length > 0 && (
              <Section id="faq" title="Frequently Asked Questions" icon={Info}>
                <Accordion type="single" collapsible className="w-full">
                  {course.courseFaqs.map((faq, index) => (
                    <AccordionItem key={faq.id || index} value={`item-${index}`} className="border-b-border/50">
                      <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-base text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Section>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <PurchaseCard course={course} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
