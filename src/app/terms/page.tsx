export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-16 sm:py-24 max-w-4xl">
      <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl mb-8">Terms of Service</h1>
      <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-6">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <h2 className="text-2xl font-bold text-foreground">1. Agreement to Terms</h2>
        <p>
          By using our services, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use our services.
        </p>
        <h2 className="text-2xl font-bold text-foreground">2. Use of Services</h2>
        <p>
          You may use our services only for lawful purposes and in accordance with these Terms. You agree not to use the services:
        </p>
        <ul>
          <li>In any way that violates any applicable federal, state, local, or international law or regulation.</li>
          <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way by exposing them to inappropriate content, asking for personally identifiable information, or otherwise.</li>
          <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation.</li>
        </ul>
        <h2 className="text-2xl font-bold text-foreground">3. Intellectual Property</h2>
        <p>
          The service and its original content, features, and functionality are and will remain the exclusive property of CourseVerse and its licensors.
        </p>
        <h2 className="text-2xl font-bold text-foreground">4. Termination</h2>
        <p>
          We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
        </p>
        <h2 className="text-2xl font-bold text-foreground">5. Governing Law</h2>
        <p>
          These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which our company is established, without regard to its conflict of law provisions.
        </p>
        <h2 className="text-2xl font-bold text-foreground">6. Changes to Terms</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect.
        </p>
        <h2 className="text-2xl font-bold text-foreground">Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at: terms@courseverse.com.
        </p>
      </div>
    </div>
  );
}
