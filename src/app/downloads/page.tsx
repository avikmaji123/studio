import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileWarning } from "lucide-react";
import Link from "next/link";

export default function DownloadsPage() {
  // In a real application, you would fetch the user's purchased courses.
  const purchasedCourses: any[] = [];

  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl mb-8">
          My Downloads
        </h1>
        
        {purchasedCourses.length > 0 ? (
           <div className="grid gap-6">
            {/* This part would be populated dynamically */}
           </div>
        ) : (
          <Card className="text-center py-16">
            <CardHeader>
                <div className="mx-auto bg-secondary w-16 h-16 rounded-full flex items-center justify-center">
                    <FileWarning className="h-8 w-8 text-muted-foreground" />
                </div>
              <CardTitle className="mt-4">No Courses Purchased Yet</CardTitle>
              <CardDescription>
                Your purchased courses will appear here once you enroll.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/courses">Browse Available Courses</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
