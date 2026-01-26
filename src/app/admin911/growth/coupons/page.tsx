
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';

import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { createLogEntry } from '@/lib/actions';
import type { Coupon } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function CouponsPage() {
  const firestore = useFirestore();
  const { user: adminUser } = useUser();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [couponToAction, setCouponToAction] = useState<Coupon | null>(null);
  const [actionType, setActionType] = useState<'delete' | 'deactivate' | 'activate' | ''>('');

  const couponsQuery = useMemoFirebase(() => collection(firestore, 'coupons'), [firestore]);
  const { data: coupons, isLoading } = useCollection<Coupon>(couponsQuery);

  const getStatus = (coupon: Coupon): { text: string; variant: 'default' | 'secondary' | 'destructive' } => {
    if (coupon.status === 'inactive') {
      return { text: 'Inactive', variant: 'secondary' };
    }
    if (coupon.expiresAt.toDate() < new Date()) {
      return { text: 'Expired', variant: 'secondary' };
    }
    if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
      return { text: 'Used Up', variant: 'secondary' };
    }
    return { text: 'Active', variant: 'default' };
  };

  const handleActionClick = (coupon: Coupon, action: typeof actionType) => {
    setCouponToAction(coupon);
    setActionType(action);
    setIsDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!couponToAction || !actionType || !firestore || !adminUser) return;

    const couponRef = doc(firestore, 'coupons', couponToAction.id);
    let successTitle = '';
    let successDescription = '';

    try {
      if (actionType === 'delete') {
        await deleteDoc(couponRef);
        successTitle = 'Coupon Deleted';
        successDescription = `Coupon "${couponToAction.code}" has been permanently removed.`;
        await createLogEntry({ source: 'admin', severity: 'warning', message: `Coupon deleted: ${couponToAction.code}`, metadata: { userId: adminUser.uid, couponId: couponToAction.id } });
      } else {
        const newStatus = actionType === 'activate' ? 'active' : 'inactive';
        await updateDoc(couponRef, { status: newStatus });
        successTitle = `Coupon ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`;
        successDescription = `Coupon "${couponToAction.code}" is now ${newStatus}.`;
        await createLogEntry({ source: 'admin', severity: 'info', message: `Coupon status changed: ${couponToAction.code} to ${newStatus}`, metadata: { userId: adminUser.uid, couponId: couponToAction.id } });
      }
      toast({ title: successTitle, description: successDescription });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Action Failed', description: error.message });
      console.error(`Failed to ${actionType} coupon:`, error);
    } finally {
      setIsDialogOpen(false);
      setCouponToAction(null);
      setActionType('');
    }
  };

  const dialogContent = useMemo(() => {
    if (!couponToAction) return { title: '', description: '' };
    switch (actionType) {
      case 'delete':
        return {
          title: 'Are you absolutely sure?',
          description: `This action cannot be undone. This will permanently delete the coupon code "${couponToAction.code}".`,
        };
      case 'deactivate':
        return {
          title: 'Deactivate Coupon?',
          description: `This will make the coupon "${couponToAction.code}" unusable until it's activated again.`,
        };
      case 'activate':
        return {
          title: 'Activate Coupon?',
          description: `This will make the coupon "${couponToAction.code}" available for use immediately.`,
        };
      default:
        return { title: '', description: '' };
    }
  }, [couponToAction, actionType]);

  return (
    <>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight">Coupon Management</h1>
            <p className="text-muted-foreground">
              Create and manage discount codes for your courses.
            </p>
          </div>
          <Button asChild>
            <Link href="/admin911/growth/coupons/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Coupon
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Manage Coupons</CardTitle>
            <CardDescription>
              View, edit, and track the performance of your coupon codes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))}
                {!isLoading && coupons?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No coupons found. Create one to get started.
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && coupons?.map(coupon => {
                  const status = getStatus(coupon);
                  return (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                      <TableCell className="capitalize">{coupon.type}</TableCell>
                      <TableCell>
                        {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                      </TableCell>
                      <TableCell>
                        {coupon.usageLimit > 0 ? `${coupon.usageCount} / ${coupon.usageLimit}` : coupon.usageCount}
                      </TableCell>
                       <TableCell>{format(coupon.expiresAt.toDate(), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.text}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                           <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild><Link href={`/admin911/growth/coupons/edit/${coupon.id}`}>Edit</Link></DropdownMenuItem>
                            {coupon.status === 'active' ? (
                               <DropdownMenuItem onClick={() => handleActionClick(coupon, 'deactivate')}>Deactivate</DropdownMenuItem>
                            ) : (
                               <DropdownMenuItem onClick={() => handleActionClick(coupon, 'activate')}>Activate</DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleActionClick(coupon, 'delete')}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={actionType === 'delete' ? buttonVariants({ variant: 'destructive' }) : ''}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
