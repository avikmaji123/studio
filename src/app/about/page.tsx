'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function AboutPage() {
  const creatorImage = PlaceHolderImages.find(p => p.id === 'creator-avik');

  const trustFactors = [
    'Carefully selected courses for practical skills.',
    'Transparent, points-based pricing system.',
    'Access to high-quality, licensed third-party content.',
    'Verified completion certificates.',
    'Platform managed by a dedicated administrator.',
    'Continuous platform updates and improvements.'
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
            A premium platform for accessing high-quality, licensed course content.
          </p>
        </div>
      </section>

      {/* Section 2: What is Course Verse */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-4 text-lg">
                <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">What is Course Verse?</h2>
                <p>
                Course Verse is a course distribution and access management platform. It was born from a simple idea: online education should be about long-term value, not just a transaction. It’s a place for practical learning and structured growth, designed to solve the problem of low-quality, mass-produced online courses.
                </p>
                <p>
                Unlike other platforms, every course here is carefully selected and licensed from trusted third-party creators to provide honest, effective education. We focus on delivering courses that teach real-world skills, ensuring that your investment translates into meaningful progress.
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
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">About the Platform Administrator</h2>
               <p>
                I'm Avik, a full-stack developer with a passion for technology and building great user experiences. I created Course Verse as a high-quality distribution platform for licensed educational content.
              </p>
              <p>
                My role is limited to platform administration, content distribution, and access control. I do NOT teach students and I am NOT an instructor. I manage the technology and curate the course catalog to ensure a reliable and effective content delivery system for our users. My goal is to build a platform that genuinely helps you access the skills you need, with a transparent and honest approach.
              </p>
               <Link href="https://AvikSec.xo.je" target="_blank" className="text-primary hover:underline transition-colors no-underline">
                View Administrator's Portfolio
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
                Our mission is to build a trusted, community-driven content delivery platform where users can achieve their goals through clear, practical, and high-quality licensed courses. We are committed to continuous improvement, ensuring Course Verse evolves with the needs of our users.
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
            Ready to find the right course for your learning adventure? Explore our catalog of licensed content.
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
