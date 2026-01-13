import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AboutPage() {
    const aboutImage = PlaceHolderImages.find(p => p.id === 'hero-image');
  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">About CourseVerse</h1>
          <p className="mt-6 text-lg text-muted-foreground">
            CourseVerse was founded with a simple mission: to make high-quality education accessible to everyone, everywhere. We believe that learning should be a lifelong adventure, and we're here to provide you with the tools and knowledge to unlock your full potential.
          </p>
          <p className="mt-4 text-lg text-muted-foreground">
            Our platform features a curated selection of courses taught by industry experts, designed to be engaging, practical, and effective. Whether you're looking to switch careers, upskill in your current role, or simply explore a new passion, CourseVerse is your partner in learning.
          </p>
        </div>
        <div className="relative h-96">
            {aboutImage && (
                <Image
                    src={aboutImage.imageUrl}
                    alt="Team working together"
                    data-ai-hint="team collaboration"
                    fill
                    className="rounded-xl object-cover shadow-2xl"
                />
            )}
        </div>
      </div>
    </div>
  );
}
