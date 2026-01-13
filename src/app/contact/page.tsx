import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">Contact Us</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Have a question or feedback? We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
        </p>
      </div>
      <form className="mt-12 max-w-xl mx-auto">
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
          <div>
            <Label htmlFor="first-name">First name</Label>
            <div className="mt-1">
              <Input type="text" name="first-name" id="first-name" autoComplete="given-name" />
            </div>
          </div>
          <div>
            <Label htmlFor="last-name">Last name</Label>
            <div className="mt-1">
              <Input type="text" name="last-name" id="last-name" autoComplete="family-name" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="email">Email</Label>
            <div className="mt-1">
              <Input id="email" name="email" type="email" autoComplete="email" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="message">Message</Label>
            <div className="mt-1">
              <Textarea id="message" name="message" rows={4} />
            </div>
          </div>
        </div>
        <div className="mt-8">
          <Button type="submit" className="w-full">
            Send Message
          </Button>
        </div>
      </form>
    </div>
  );
}
