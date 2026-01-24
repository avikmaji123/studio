
'use client';

import { useMemo, useState } from 'react';
import { MoreHorizontal, PlusCircle, Star, Sparkles, Check, X, Trash2 } from 'lucide-react';
import { doc, updateDoc, deleteDoc, collection, query, orderBy, setDoc } from 'firebase/firestore';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { createLogEntry } from '@/lib/actions';
import type { Review } from '@/lib/types';
import { StarRating } from '@/components/app/star-rating';
import { useSiteSettings } from '@/hooks/use-settings';

export default function AdminReviewsPage() {
    const firestore = useFirestore();
    const { user: adminUser } = useUser();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('pending');
    const [dialogState, setDialogState] = useState({ open: false, review: null as Review | null, action: '' });

    const { settings } = useSiteSettings();

    const reviewsQuery = useMemoFirebase(() => query(collection(firestore, 'reviews'), orderBy('createdAt', 'desc')), [firestore]);
    const { data: reviews, isLoading } = useCollection<Review>(reviewsQuery);

    const filteredReviews = useMemo(() => {
        if (!reviews) return [];
        if (activeTab === 'all') return reviews;
        return reviews.filter(r => r.status === activeTab);
    }, [reviews, activeTab]);
    
    const counts = useMemo(() => {
        if (!reviews) return { all: 0, pending: 0, approved: 0, rejected: 0 };
        return {
            all: reviews.length,
            pending: reviews.filter(r => r.status === 'pending').length,
            approved: reviews.filter(r => r.status === 'approved').length,
            rejected: reviews.filter(r => r.status === 'rejected').length,
        };
    }, [reviews]);
    
    const handleAction = async () => {
        const { review, action } = dialogState;
        if (!review || !action || !firestore || !adminUser) return;

        const reviewRef = doc(firestore, 'reviews', review.id);
        const settingsRef = doc(firestore, 'settings', 'global');

        try {
            let currentFeatured: Review[] = settings.featuredReviews || [];

            if (action === 'delete') {
                await deleteDoc(reviewRef);
                currentFeatured = currentFeatured.filter(r => r.id !== review.id);
                toast({ title: "Review Deleted", description: "The review has been permanently removed." });
                 await createLogEntry({ source: 'admin', severity: 'warning', message: `Review deleted for course: ${review.courseName}`, metadata: { userId: adminUser.uid, reviewId: review.id } });
            } else {
                await updateDoc(reviewRef, { status: action });
                
                if (action === 'approved') {
                    if (!currentFeatured.some(r => r.id === review.id)) {
                        const newFeatured = [{...review, status: 'approved'}, ...currentFeatured];
                        currentFeatured = newFeatured.sort((a, b) => {
                            const dateA = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt.toDate();
                            const dateB = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt.toDate();
                            return dateB.getTime() - dateA.getTime();
                        }).slice(0, 9);
                    }
                } else { // 'rejected' or 'pending'
                    currentFeatured = currentFeatured.filter(r => r.id !== review.id);
                }

                toast({ title: "Review Updated", description: `The review has been ${action}.` });
                await createLogEntry({ source: 'admin', severity: 'info', message: `Review status changed to ${action}`, metadata: { userId: adminUser.uid, reviewId: review.id } });
            }
            
            await setDoc(settingsRef, { featuredReviews: currentFeatured }, { merge: true });

        } catch (error: any) {
            toast({ variant: 'destructive', title: "Action Failed", description: error.message });
        } finally {
            setDialogState({ open: false, review: null, action: '' });
        }
    };
    
    const openDialog = (review: Review, action: string) => {
        setDialogState({ open: true, review, action });
    };

    const getStatusBadge = (status: Review['status']) => {
        switch (status) {
            case 'approved': return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Approved</Badge>;
            case 'pending': return <Badge variant="secondary">Pending</Badge>;
            case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };
    
    return (
        <>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Tabs defaultValue="pending" onValueChange={setActiveTab}>
                    <div className="flex items-center">
                        <TabsList>
                            <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
                            <TabsTrigger value="approved">Approved ({counts.approved})</TabsTrigger>
                            <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
                            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
                        </TabsList>
                        <div className="ml-auto flex items-center gap-2">
                             <Button size="sm" variant="outline" className="h-8 gap-1" asChild>
                                <Link href="/admin911/reviews/new">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Generate Reviews</span>
                                </Link>
                            </Button>
                        </div>
                    </div>
                    <TabsContent value={activeTab}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Reviews</CardTitle>
                                <CardDescription>Moderate and manage all user-submitted reviews.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Author</TableHead>
                                            <TableHead>Review</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead><span className="sr-only">Actions</span></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading && Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4 mt-2" /></TableCell>
                                                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                                            </TableRow>
                                        ))}
                                        {filteredReviews.map(review => (
                                            <TableRow key={review.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-9 w-9 hidden sm:flex">
                                                            <AvatarImage src={review.userAvatar} />
                                                            <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">{review.userName}</div>
                                                            <div className="text-xs text-muted-foreground line-clamp-1">{review.courseName}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <StarRating rating={review.rating} />
                                                        <p className="font-semibold line-clamp-1">{review.title}</p>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{review.text}</p>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(review.status)}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {review.createdAt ? formatDistanceToNow(typeof review.createdAt === 'string' ? new Date(review.createdAt) : review.createdAt.toDate(), { addSuffix: true }) : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Actions</span></Button></DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            {review.status !== 'approved' && <DropdownMenuItem onClick={() => openDialog(review, 'approved')}><Check className="mr-2 h-4 w-4" />Approve</DropdownMenuItem>}
                                                            {review.status !== 'rejected' && <DropdownMenuItem onClick={() => openDialog(review, 'rejected')}><X className="mr-2 h-4 w-4" />Reject</DropdownMenuItem>}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive" onClick={() => openDialog(review, 'delete')}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {!isLoading && filteredReviews.length === 0 && (
                                            <TableRow><TableCell colSpan={5} className="h-24 text-center">No reviews in this category.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
            <AlertDialog open={dialogState.open} onOpenChange={(open) => !open && setDialogState({ open: false, review: null, action: '' })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to <span className="font-bold uppercase">{dialogState.action}</span> this review. This action can be changed later, except for deletion.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleAction} className={dialogState.action === 'delete' ? buttonVariants({ variant: "destructive" }) : ''}>
                            Yes, {dialogState.action}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

    