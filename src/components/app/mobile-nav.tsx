'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, BookOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { navConfig } from '@/lib/nav-config';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/lib/nav-config';

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Placeholder for user auth state
  const isSignedIn = false;

  const allNavLinks = [
    ...navConfig.sidebarNav,
    ...(isSignedIn
      ? [
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Logout', href: '/logout' },
        ]
      : [
          { title: 'Login', href: '/login' },
          { title: 'Register', href: '/signup' },
        ]),
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
          <BookOpen className="h-6 w-6 mr-2 text-primary" />
          <span className="font-bold">CourseVerse</span>
        </Link>
        <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            {allNavLinks.map(
              (item) =>
                item.href && (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'text-lg font-medium transition-colors hover:text-primary',
                      pathname === item.href ? 'text-primary' : 'text-foreground/60'
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {item.title}
                  </Link>
                )
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
