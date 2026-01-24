'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { UserNav } from './user-nav';
import { BookOpen } from 'lucide-react';
import { MobileNav } from './mobile-nav';
import { navConfig } from '@/lib/nav-config';
import { useSiteSettings } from '@/hooks/use-settings';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function Header() {
  const { settings, isLoading } = useSiteSettings();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
        "sticky top-0 z-50 w-full border-b border-transparent transition-all duration-300",
        isScrolled ? "navbar-scrolled" : "bg-transparent"
    )}>
      <div className="container flex h-16 items-center">
        <div className="mr-4 md:hidden">
          <MobileNav />
        </div>
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">{isLoading ? 'CourseVerse' : settings.siteName}</span>
        </Link>
        <nav className="hidden flex-1 items-center gap-6 text-sm md:flex">
          {navConfig.mainNav.map(item => (
            <Link
              key={item.href}
              href={item.href!}
              className="text-foreground/60 transition-colors hover:text-foreground/80 font-medium"
            >
              {item.title}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
