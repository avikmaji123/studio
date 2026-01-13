import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { UserNav } from './user-nav';
import { BookOpen } from 'lucide-react';

export default function Header() {
  const navItems = [
    { label: 'Courses', href: '/courses' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Affiliates', href: '/affiliates' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="font-bold">CourseVerse</span>
        </Link>
        <nav className="hidden flex-1 items-center gap-6 text-sm md:flex">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="text-foreground/60 transition-colors hover:text-foreground/80"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
