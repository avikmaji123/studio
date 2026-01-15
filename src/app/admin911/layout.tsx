
'use client';

import Link from 'next/link';
import {
  Bell,
  Book,
  CircleUser,
  Download,
  Home,
  LineChart,
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

function AdminSidebar() {
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
        router.push('/admin911/login');
        } catch (error: any) {
        console.error('Logout Error:', error);
        toast({
            variant: 'destructive',
            title: 'Logout Failed',
            description:
            error.message || 'An unexpected error occurred during logout.',
        });
        }
    };
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
            <Link
              href="/admin911"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/admin911/courses"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <Book className="h-4 w-4" />
              Courses
            </Link>
            <Link
              href="/admin911/payments"
              className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
            >
              <CreditCard className="h-4 w-4" />
              Payments
            </Link>
            <Link
              href="/admin911/users"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <Users className="h-4 w-4" />
              Users
            </Link>
             <Link
              href="/admin911/downloads"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <Download className="h-4 w-4" />
              Downloads
            </Link>
            <Link
              href="/admin911/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <Settings className="h-4 w-4" />
              Site Settings
            </Link>
             <Link
              href="/admin911/logs"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <FileText className="h-4 w-4" />
              Logs
            </Link>
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
  const isAdmin = profile?.role === 'admin';
  const isLoginPage = pathname === '/admin911/login';

  useEffect(() => {
    // If we're not loading and the user is NOT an admin,
    // and we are NOT on the login page, then redirect to login.
    if (!isLoading && !isAdmin && !isLoginPage) {
      router.replace('/admin911/login');
    }
  }, [isLoading, isAdmin, router, isLoginPage]);

  // If we are trying to access a protected admin page, show loading spinner until auth check is complete.
  if (isLoading && !isLoginPage) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background dark">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // If user is not an admin and not on the login page, render nothing until redirect happens.
  if (!isAdmin && !isLoginPage) {
     return (
      <div className="flex h-screen w-full items-center justify-center bg-background dark">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If user IS an admin, show the protected layout with the content.
  if (isAdmin) {
    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] dark bg-background text-foreground">
        <AdminSidebar />
        <div className="flex flex-col">
            {children}
        </div>
        </div>
    );
  }

  // If it's the login page, just render the children (the login form).
  return <>{children}</>;
}
