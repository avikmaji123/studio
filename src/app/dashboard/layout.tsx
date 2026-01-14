'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/firebase';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  Home,
  LayoutDashboard,
  BookCopy,
  Download,
  Newspaper,
  User,
  Settings,
  LogOut,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

function DashboardSidebar() {
  const { user, profile, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/');
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

  const displayName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName}`
    : user?.displayName;
  const fallback =
    (profile?.firstName?.charAt(0) || '') +
      (profile?.lastName?.charAt(0) || '') ||
    user?.email?.charAt(0) ||
    'U';

  return (
    <Sidebar
      collapsible="icon"
      className="border-r"
      variant="sidebar"
    >
      <SidebarHeader className="h-16 justify-center">
        {isUserLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.photoURL || ''} alt={displayName || 'User'} />
              <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold group-data-[collapsible=icon]:hidden">
              {displayName}
            </span>
          </>
        )}
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton href="/" tooltip="Homepage">
              <Home />
              <span>Home</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu className="mt-4">
          <SidebarMenuItem>
            <SidebarMenuButton href="/dashboard" tooltip="Dashboard">
              <LayoutDashboard />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/dashboard/courses" tooltip="My Courses">
              <BookCopy />
              <span>My Courses</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/dashboard/downloads" tooltip="Downloads">
              <Download />
              <span>Downloads</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/news" tooltip="News">
              <Newspaper />
              <span>News</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
         <SidebarMenu className="mt-auto">
           <SidebarMenuItem>
              <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href="/courses">
                    <BookOpen />
                    <span className="group-data-[collapsible=icon]:hidden">Explore Courses</span>
                  </Link>
              </Button>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton href="/dashboard/profile" tooltip="Profile">
              <User />
              <span>Profile</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/dashboard/settings" tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-red-500 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400 dark:hover:text-red-400"
              tooltip="Log Out"
            >
              <LogOut />
              <span>Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <DashboardSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center border-b px-4 md:hidden">
          <SidebarTrigger />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
