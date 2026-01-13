import { Button } from "@/components/ui/button";

export default function AffiliatesPage() {
  return (
    <div className="container mx-auto px-4 py-16 sm:py-24 text-center">
      <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">Join Our Affiliate Program</h1>
      <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground">
        Love CourseVerse? Spread the word and earn commissions! Our affiliate program is a great way to partner with us and generate revenue by promoting our courses.
      </p>
      <div className="mt-10">
        <Button size="lg">Become an Affiliate</Button>
      </div>
      <div className="mt-16 grid md:grid-cols-3 gap-8 text-left">
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-xl font-bold mb-2">Competitive Commissions</h3>
          <p className="text-muted-foreground">Earn a generous commission for every new student you refer to our platform.</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-xl font-bold mb-2">Promotional Resources</h3>
          <p className="text-muted-foreground">Get access to a library of marketing materials to help you succeed.</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-xl font-bold mb-2">Real-Time Tracking</h3>
          <p className="text-muted-foreground">Our affiliate dashboard provides detailed analytics and tracks your earnings.</p>
        </div>
      </div>
    </div>
  );
}
