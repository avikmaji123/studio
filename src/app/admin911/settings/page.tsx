
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStorage } from '@/firebase';
import { useSiteSettings, defaultSettings } from '@/hooks/use-settings';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { SiteSettings, SocialLink } from '@/lib/types';


export default function AdminSettingsPage() {
    const { settings: initialSettings, isLoading: isLoadingSettings } = useSiteSettings();
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadStates, setUploadStates] = useState({
        logo: { progress: 0, isUploading: false },
        favicon: { progress: 0, isUploading: false },
        qrCode: { progress: 0, isUploading: false },
    });
    
    const storage = useStorage();
    const firestore = useFirestore();
    const { toast } = useToast();

    useEffect(() => {
        if (initialSettings) {
            // Merge initial settings with defaults to ensure all fields are present
            const mergedSettings = { ...defaultSettings, ...initialSettings };
            setSettings(mergedSettings);
        }
    }, [initialSettings]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setSettings(prev => ({ ...prev, [id]: value }));
        setIsDirty(true);
    };

    const handleSwitchChange = (id: keyof SiteSettings, checked: boolean) => {
        setSettings(prev => ({ ...prev, [id]: checked }));
        setIsDirty(true);
    };

    const handleSocialLinkChange = (id: SocialLink['id'], key: 'url' | 'visible', value: string | boolean) => {
        setSettings(prev => ({
            ...prev,
            socialLinks: prev.socialLinks.map(link => 
                link.id === id ? { ...link, [key]: value } : link
            )
        }));
        setIsDirty(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'faviconUrl' | 'qrCodeUrl') => {
        const file = e.target.files?.[0];
        if (!file || !storage) return;

        const uploadKey = field === 'logoUrl' ? 'logo' : field === 'faviconUrl' ? 'favicon' : 'qrCode';

        setUploadStates(prev => ({ ...prev, [uploadKey]: { progress: 0, isUploading: true } }));

        const storageRef = ref(storage, `site-assets/${uuidv4()}-${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadStates(prev => ({ ...prev, [uploadKey]: { ...prev[uploadKey], progress } }));
            },
            (error) => {
                console.error("Upload error:", error);
                toast({ variant: "destructive", title: "Upload Failed", description: error.message });
                setUploadStates(prev => ({ ...prev, [uploadKey]: { ...prev[uploadKey], isUploading: false } }));
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setSettings(prev => ({ ...prev, [field]: downloadURL }));
                    setIsDirty(true);
                    toast({ title: "Upload Complete" });
                    setUploadStates(prev => ({ ...prev, [uploadKey]: { ...prev[uploadKey], isUploading: false } }));
                });
            }
        );
    };

    const handleSaveChanges = async () => {
        if (!firestore) return;
        setIsSaving(true);
        try {
            const settingsRef = doc(firestore, 'settings', 'global');
            await setDoc(settingsRef, settings, { merge: true });
            toast({ title: 'Settings Saved', description: 'Your changes are now live.' });
            setIsDirty(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error Saving', description: error.message });
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isLoadingSettings) {
        return (
             <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
                    <Skeleton className="h-48 w-full" />
                    <div className="grid gap-6">
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </main>
        )
    }

  return (
    <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-3xl font-semibold">Settings</h1>
      </div>
      <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
        <nav
          className="grid gap-4 text-sm text-muted-foreground"
        >
          <Link href="#general" className="font-semibold text-primary">General</Link>
          <Link href="#auth">Authentication</Link>
          <Link href="#payments">Payments</Link>
          <Link href="#socials">Social Links</Link>
        </nav>
        <div className="grid gap-6">
          <Card id="general">
            <CardHeader>
              <CardTitle>General Site Settings</CardTitle>
              <CardDescription>Manage the basic identity and branding of your website.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="siteName">Site Name</Label>
                        <Input id="siteName" value={settings.siteName} onChange={handleInputChange} />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="tagline">Tagline</Label>
                        <Input id="tagline" value={settings.tagline} onChange={handleInputChange} />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="description">Site Description (for SEO)</Label>
                    <Textarea id="description" value={settings.description} onChange={handleInputChange} />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="footerText">Footer Text</Label>
                    <Input id="footerText" value={settings.footerText} onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-2 gap-4 items-end">
                    <div className="grid gap-2">
                        <Label>Logo</Label>
                        <div className="flex items-center gap-4">
                            {settings.logoUrl && <Image src={settings.logoUrl} alt="logo" width={40} height={40} className="rounded-md" />}
                             <Input id="logo-file" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logoUrl')} />
                        </div>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Switch id="maintenanceMode" checked={settings.maintenanceMode} onCheckedChange={(c) => handleSwitchChange('maintenanceMode', c)} />
                        <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    </div>
                </div>
            </CardContent>
          </Card>
          
           <Card id="auth">
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>Configure how users can sign in to your site.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                 <div className="flex items-center space-x-2">
                    <Switch id="enableGoogleLogin" checked={settings.enableGoogleLogin} onCheckedChange={(c) => handleSwitchChange('enableGoogleLogin', c)} />
                    <Label htmlFor="enableGoogleLogin">Enable Google Login</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Switch id="enableEmailLogin" checked={settings.enableEmailLogin} onCheckedChange={(c) => handleSwitchChange('enableEmailLogin', c)} />
                    <Label htmlFor="enableEmailLogin">Enable Email & Password Login</Label>
                </div>
            </CardContent>
          </Card>

          <Card id="payments">
             <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure UPI ID, QR code, and other payment options.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                 <div className="grid md:grid-cols-2 gap-4">
                     <div className="grid gap-2">
                        <Label htmlFor="upiId">UPI ID</Label>
                        <Input id="upiId" value={settings.upiId} onChange={handleInputChange} />
                     </div>
                      <div className="grid gap-2">
                        <Label htmlFor="receiverName">Receiver Name</Label>
                        <Input id="receiverName" value={settings.receiverName} onChange={handleInputChange} />
                     </div>
                 </div>
                 <div className="grid gap-2">
                    <Label htmlFor="paymentInstructions">Payment Instructions</Label>
                    <Textarea id="paymentInstructions" value={settings.paymentInstructions} onChange={handleInputChange} />
                </div>
                 <div className="grid grid-cols-2 gap-4 items-end">
                    <div className="grid gap-2">
                        <Label>QR Code</Label>
                        <div className="flex items-center gap-4">
                            {settings.qrCodeUrl && <Image src={settings.qrCodeUrl} alt="QR Code" width={80} height={80} className="rounded-md border p-1" />}
                            <Input id="qr-code-file" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'qrCodeUrl')} />
                        </div>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Switch id="disablePurchases" checked={settings.disablePurchases} onCheckedChange={(c) => handleSwitchChange('disablePurchases', c)} />
                        <Label htmlFor="disablePurchases">Disable All Purchases</Label>
                    </div>
                 </div>
            </CardContent>
          </Card>

          <Card id="socials">
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>Update the social media and portfolio links for the site footer.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {settings.socialLinks.map((link) => (
                <div key={link.id} className="grid grid-cols-[1fr_auto] items-center gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor={`social-${link.id}`}>{link.name}</Label>
                        <Input id={`social-${link.id}`} value={link.url} onChange={(e) => handleSocialLinkChange(link.id, 'url', e.target.value)} />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                        <Switch id={`social-visible-${link.id}`} checked={link.visible} onCheckedChange={(c) => handleSocialLinkChange(link.id, 'visible', c)} />
                        <Label htmlFor={`social-visible-${link.id}`}>Visible</Label>
                    </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      {isDirty && (
        <div className="sticky bottom-0 left-0 right-0 mt-4 border-t bg-background p-4 z-10">
            <div className="max-w-6xl mx-auto flex justify-end">
                <Button onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </div>
      )}
    </main>
  );
}
