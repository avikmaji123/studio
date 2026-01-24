
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";

export default function BundlesPage() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="space-y-1.5">
                <h1 className="text-3xl font-bold tracking-tight">Course Bundles</h1>
                <p className="text-muted-foreground">
                    This feature is currently under construction.
                </p>
            </div>

            <Card className="flex flex-col items-center justify-center text-center py-20">
                <CardHeader>
                    <div className="mx-auto bg-muted rounded-full p-4">
                        <Construction className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <CardTitle className="mt-4">Coming Soon!</CardTitle>
                    <CardDescription>
                        Create manual bundles and review AI-suggested course groupings.
                    </CardDescription>
                </CardHeader>
                 <CardContent>
                    <Button variant="outline" disabled>Create New Bundle</Button>
                </CardContent>
            </Card>
        </main>
    );
}
