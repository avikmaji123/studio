'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, BookOpen, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { navConfig } from '@/lib/nav-config';
import { cn } from '@/lib/utils';
import { useAuth, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      setOpen(false);
      router.push('/');
    } catch (error: any) {
      console.error('Logout Error:', error);
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: error.message || 'An unexpected error occurred during logout.',
      });
    }
  };

  const authNavLinks = user
    ? [{ title: 'My Downloads', href: '/downloads' }]
    : [
        { title: 'Login', href: '/login' },
        { title: 'Sign Up', href: '/signup' },
      ];

  // Filter out the duplicate /downloads link if the user is logged in
  const uniqueMainNavs = user
    ? navConfig.mainNav.filter(item => item.href !== '/downloads')
    : navConfig.mainNav;

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
        <SheetHeader>
          <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
            <BookOpen className="h-6 w-6 mr-2 text-primary" />
            <span className="font-bold">CourseVerse</span>
          </Link>
           <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        </SheetHeader>

        <div className="my-8 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            {[...uniqueMainNavs, ...authNavLinks].map(item =>
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
            {user && (
              <button
                onClick={handleLogout}
                className={cn(
                  'text-lg font-medium transition-colors hover:text-primary text-left flex items-center',
                  'text-foreground/60'
                )}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
