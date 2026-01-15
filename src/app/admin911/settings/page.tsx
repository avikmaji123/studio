
'use client';

import Link from 'next/link';
import { CircleUser, Menu, Package2, Search, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AdminSettingsPage() {

    const qrCodeImage = PlaceHolderImages.find(p => p.id === 'payment-qr-code');

  return (
    <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-3xl font-semibold">Settings</h1>
      </div>
      <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
        <nav
          className="grid gap-4 text-sm text-muted-foreground"
          x-chunk="dashboard-04-chunk-0"
        >
          <Link href="#" className="font-semibold text-primary">
            General
          </Link>
          <Link href="#">Payments</Link>
          <Link href="#">Integrations</Link>
          <Link href="#">Support</Link>
          <Link href="#">Advanced</Link>
        </nav>
        <div className="grid gap-6">
          <Card x-chunk="dashboard-04-chunk-1">
            <CardHeader>
              <CardTitle>Site Details</CardTitle>
              <CardDescription>
                Manage the basic information for your website.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4">
                <Input placeholder="Site Name" defaultValue="CourseVerse" />
                <Input
                  placeholder="Tagline"
                  defaultValue="Your universe for high-quality licensed courses."
                />
                 <Textarea
                  placeholder="Footer Text"
                  defaultValue="© 2024 CourseVerse. A premium distribution platform for licensed educational content. All rights reserved."
                />
              </form>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button>Save</Button>
            </CardFooter>
          </Card>

          <Card>
             <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>
                Configure UPI ID and QR code for payments.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                 <div className="grid md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="upi-id">UPI ID</Label>
                        <Input id="upi-id" placeholder="your-upi-id@okhdfcbank" defaultValue="avik911@fam" />
                     </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency Symbol</Label>
                        <Input id="currency" placeholder="e.g., ₹, $" defaultValue="₹" />
                     </div>
                 </div>
                 <div className="space-y-2">
                    <Label>QR Code</Label>
                    <div className="flex items-center gap-4">
                        {qrCodeImage && 
                            <Image 
                                src={qrCodeImage.imageUrl} 
                                alt="Current QR Code" 
                                width={80} 
                                height={80}
                                className="rounded-md border p-1"
                            />
                        }
                        <Input id="qr-code-file" type="file" />
                    </div>
                 </div>
            </CardContent>
             <CardFooter className="border-t px-6 py-4">
              <Button>Save Payment Settings</Button>
            </CardFooter>
          </Card>

          <Card x-chunk="dashboard-04-chunk-2">
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>
                Update the social media and portfolio links for the site footer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-4">
                <Input
                  placeholder="GitHub URL"
                  defaultValue="https://github.com/alexavik"
                />
                <Input
                  placeholder="Telegram URL"
                  defaultValue="https://t.me/Avikmaji122911"
                />
                <Input
                  placeholder="Instagram URL"
                  defaultValue="https://instagram.com/avik_911"
                />
              </form>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button>Save</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}
