import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function PricingPage() {
    const plans = [
        {
            name: "Basic",
            price: "Free",
            description: "Get started with our basic features.",
            features: ["Access to 3 courses", "Community support", "Progress tracking"],
            cta: "Get Started"
        },
        {
            name: "Pro",
            price: "₹999/mo",
            description: "Unlock all courses and premium features.",
            features: ["Unlimited course access", "Completion certificates", "Project reviews", "Priority support"],
            cta: "Upgrade to Pro",
            popular: true,
        },
        {
            name: "Team",
            price: "Custom",
            description: "For organizations and teams.",
            features: ["All Pro features", "Team management dashboard", "Dedicated account manager"],
            cta: "Contact Sales"
        }
    ];
  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">Our Pricing Plans</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Choose the plan that's right for you and your learning goals.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map(plan => (
            <Card key={plan.name} className={`flex flex-col ${plan.popular ? 'border-primary' : ''}`}>
                <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="text-4xl font-bold pt-4">{plan.price}</div>
                </CardHeader>
                <CardContent className="flex-grow">
                    <ul className="space-y-3">
                        {plan.features.map(feature => (
                            <li key={feature} className="flex items-center">
                                <Check className="w-5 h-5 text-green-500 mr-2" />
                                <span className="text-muted-foreground">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>{plan.cta}</Button>
                </CardFooter>
            </Card>
        ))}
      </div>
    </div>
  );
}
