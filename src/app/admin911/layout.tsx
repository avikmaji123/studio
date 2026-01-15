
'use client';

import Link from 'next/link';
import {
  Bell,
  Book,
  CircleUser,
  Download,
  Home,
  DatabaseZap,
  Menu,
  Package,
  Package2,
  Search,
  Settings,
  ShoppingCart,
  Users,
  CreditCard,
  ListOrdered,
  BookOpen,
  FileText,
  LogOut,
  Loader2,
} from 'lucide-react';
import { ReactNode, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { usePathname, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { createLogEntry } from '@/lib/actions';

function AdminSidebar() {
    const auth = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();
    const { user } = useUser();

    const handleLogout = async () => {
        if (!auth || !user) return;
        const userId = user.uid;
        try {
            await signOut(auth);
            await createLogEntry({
                source: 'admin',
                severity: 'info',
                message: 'Admin logged out.',
                metadata: { userId },
            });
            toast({
                title: 'Logged Out',
                description: 'You have been successfully logged out.',
            });
            router.push('/admin911/login');
        } catch (error: any) {
            console.error('Logout Error:', error);
            await createLogEntry({
                source: 'admin',
                severity: 'critical',
                message: 'Admin logout failed.',
                metadata: { userId, error: error.message },
            });
            toast({
                variant: 'destructive',
                title: 'Logout Failed',
                description:
                error.message || 'An unexpected error occurred during logout.',
            });
        }
    };

    const navItems = [
        { href: '/admin911', icon: <Home className="h-4 w-4" />, label: 'Dashboard' },
        { href: '/admin911/courses', icon: <Book className="h-4 w-4" />, label: 'Courses' },
        { href: '/admin911/payments', icon: <CreditCard className="h-4 w-4" />, label: 'Payments' },
        { href: '/admin911/users', icon: <Users className="h-4 w-4" />, label: 'Users' },
        { href: '/admin911/downloads', icon: <Download className="h-4 w-4" />, label: 'Downloads' },
        { href: '/admin911/settings', icon: <Settings className="h-4 w-4" />, label: 'Site Settings' },
        { href: '/admin911/logs', icon: <FileText className="h-4 w-4" />, label: 'Logs' },
    ];

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/admin911" className="flex items-center gap-2 font-semibold">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="">CourseVerse</span>
          </Link>
          <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => {
                const isActive = (item.href === '/admin911' && pathname === item.href) || 
                                 (item.href !== '/admin911' && pathname.startsWith(item.href));
                return (
                     <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                            isActive && "bg-muted text-primary"
                        )}
                    >
                        {item.icon}
                        {item.label}
                    </Link>
                )
            })}
          </nav>
        </div>
        <div className="mt-auto p-4">
           <Button asChild size="sm" variant="ghost" className="w-full justify-start">
             <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Site
              </Link>
           </Button>
           <Button onClick={handleLogout} size="sm" variant="destructive" className="w-full justify-start mt-2">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
           </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, profile, isUserLoading, isProfileLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const isLoading = isUserLoading || isProfileLoading;
  const isLoginPage = pathname === '/admin911/login';
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    // If we're done loading, not on the login page, and the user is not an admin,
    // redirect them to the admin login page.
    if (!isLoading && !isLoginPage && !isAdmin) {
      createLogEntry({
          source: 'system',
          severity: 'warning',
          message: 'Unauthorized access attempt to admin area.',
          metadata: { userId: user?.uid || 'anonymous' },
      });
      router.replace('/admin911/login');
    }
  }, [isLoading, isLoginPage, isAdmin, router, user]);

  // If we are on a protected admin page and still loading, show a spinner.
  if (!isLoginPage && isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background dark">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If the user is a confirmed admin, show the admin layout.
  // We also check !isLoading to be sure before rendering.
  if (!isLoading && isAdmin) {
     return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] dark bg-background text-foreground">
        <AdminSidebar />
        <div className="flex flex-col">
            {children}
        </div>
        </div>
    );
  }
  
  // If it's the login page, render it directly without the main admin layout.
  if (isLoginPage) {
      return <>{children}</>;
  }

  // If none of the above, it means we are waiting for the redirect to happen or still loading.
  // Render a full-page loading state.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background dark">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
