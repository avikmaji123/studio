'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function AboutPage() {
  const creatorImage = PlaceHolderImages.find(p => p.id === 'creator-avik');

  const trustFactors = [
    'Carefully designed courses for practical skills.',
    'Transparent, points-based pricing system.',
    'Real progress tracking to see your growth.',
    'Verified completion certificates.',
    'Built and maintained by a real, passionate creator.',
    'Continuous updates and improvements.'
  ];

  return (
    <div className="bg-background text-foreground">
      {/* Section 1: Hero / Intro */}
      <section className="py-20 md:py-32 text-center bg-muted/30">
        <div className="container mx-auto px-4">
          <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight">
            About Course Verse
          </h1>
          <p className="mt-4 md:mt-6 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
            A learning platform built with care, for those who are serious about growth.
          </p>
        </div>
      </section>

      {/* Section 2: What is Course Verse */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-4 text-lg">
                <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">What is Course Verse?</h2>
                <p>
                Course Verse was born from a simple idea: online education should be about long-term value, not just a transaction. It’s a place for practical learning and structured growth, designed to solve the problem of low-quality, mass-produced online courses that often leave learners with more questions than answers.
                </p>
                <p>
                Unlike other platforms, every course here is carefully structured to provide honest, effective education. We focus on real-world skills that you can apply immediately, ensuring that your investment of time and effort translates into meaningful progress.
                </p>
            </div>
            <div className="relative h-80 hidden md:block">
                 <Image
                    src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHx3b3Jrc3BhY2V8ZW58MHx8fHwxNzY4Mjk5NTM5fDA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Modern workspace"
                    data-ai-hint="modern workspace"
                    fill
                    className="rounded-xl object-cover shadow-lg"
                />
            </div>
        </div>
      </section>
      
      {/* Section 3: About the Creator */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              {creatorImage && (
                <Image
                  src={creatorImage.imageUrl}
                  alt={creatorImage.description}
                  width={300}
                  height={300}
                  className="rounded-full shadow-2xl object-cover w-[250px] h-[250px] md:w-[300px] md:h-[300px]"
                />
              )}
            </div>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-4 text-lg">
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">About the Creator</h2>
              <p>
                I'm Avik, a full-stack developer with a deep passion for technology and education. I created Course Verse because I believe everyone deserves access to high-quality learning materials without the noise and false promises common in the online course world.
              </p>
              <p>
                This platform is my personal commitment to that belief. I oversee every detail to ensure a learning-first experience. My goal is to build a platform that genuinely helps you grow your skills, with a transparent and honest approach.
              </p>
               <Link href="https://AvikSec.xo.je" target="_blank" className="text-primary hover:underline transition-colors no-underline">
                View Creator Portfolio
              </Link>
            </div>
          </div>
        </div>
      </section>

       {/* Section 4: Vision & Mission */}
      <section className="py-16 md:py-24 text-center">
        <div className="container mx-auto px-4 max-w-4xl">
           <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">Our Vision & Mission</h2>
            <p className="mt-4 text-lg text-muted-foreground">
                Our mission is to build a trusted, community-driven platform where learners can achieve their goals through clear, practical, and high-quality education. We are committed to continuous improvement, ensuring Course Verse evolves with the needs of our students.
            </p>
        </div>
      </section>

       {/* Section 5: Why Trust Course Verse */}
       <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">Why Trust Course Verse?</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    We believe in transparency and quality. Here’s our commitment to you.
                </p>
            </div>
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {trustFactors.map((factor, index) => (
                    <div key={index} className="flex items-start space-x-3">
                        <CheckCircle className="h-6 w-6 text-green-500 mt-1 shrink-0" />
                        <p className="text-lg text-muted-foreground">{factor}</p>
                    </div>
                ))}
            </div>
        </div>
       </section>

      {/* Section 6: Call to Action */}
      <section className="py-20 md:py-32 text-center">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Join the Course Verse Journey
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Ready to take the next step in your learning adventure? Explore our courses and find the perfect fit for you.
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/courses">Explore Courses</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}