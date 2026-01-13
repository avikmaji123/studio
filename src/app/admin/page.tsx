'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminPage() {
  // In a real application, you would fetch this data and have a form handler.
  const platformInfo = {
    ownerName: 'Avik',
    contactEmail: 'avikmaji911@gmail.com',
    supportEmail: 'support@courseverse.com',
    description: 'Course Verse is a course distribution and access management platform. It was born from a simple idea: online education should be about long-term value, not just a transaction. It’s a place for practical learning and structured growth, designed to solve the problem of low-quality, mass-produced online courses.'
  };

  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl mb-8">
          Admin Panel
        </h1>
        <Card>
          <CardHeader>
            <CardTitle>Platform Information</CardTitle>
            <CardDescription>
              Update the core administrative details for Course Verse.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ownerName">Platform Owner Name</Label>
                <Input id="ownerName" defaultValue={platformInfo.ownerName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input id="contactEmail" type="email" defaultValue={platformInfo.contactEmail} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="supportEmail">Public Support Email</Label>
                <Input id="supportEmail" type="email" defaultValue={platformInfo.supportEmail} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Platform Description</Label>
                <Textarea
                  id="description"
                  defaultValue={platformInfo.description}
                  rows={5}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}