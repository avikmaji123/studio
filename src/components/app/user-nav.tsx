
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';


export function UserNav() {
  const { user, profile, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/');
    } catch (error: any) {
      console.error("Logout Error:", error);
       toast({
        variant: "destructive",
        title: "Logout Failed",
        description: error.message || "An unexpected error occurred during logout.",
      });
    }
  };
  
  if (isUserLoading) {
    return <Loader2 className="h-6 w-6 animate-spin" />;
  }

  if (user) {
    const displayName = profile?.firstName ? `${profile.firstName} ${profile.lastName}` : user.displayName;
    const fallback = (profile?.firstName?.charAt(0) || '') + (profile?.lastName?.charAt(0) || '') || user.email?.charAt(0) || 'U';
    const isAdmin = profile?.role === 'admin';

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL || ''} alt={displayName || 'User'} />
              <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName || 'User'}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/downloads">My Downloads</Link>
            </DropdownMenuItem>
             {isAdmin && (
                <DropdownMenuItem asChild>
                    <Link href="/admin911">Admin Panel</Link>
                </DropdownMenuItem>
             )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button asChild>
      <Link href="/login">Login</Link>
    </Button>
  );
}
