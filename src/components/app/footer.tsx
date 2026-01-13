import Link from 'next/link';
import { Github, Instagram, Send, BookOpen } from 'lucide-react';

export default function Footer() {
  const navLinks = [
    { label: 'Courses', href: '/courses' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
  ];
  const socialLinks = [
    { icon: <Github />, href: 'https://github.com/alexavik', label: 'Github' },
    { icon: <Send />, href: 'https://t.me/Avikmaji122911', label: 'Telegram' },
    { icon: <Instagram />, href: 'https://instagram.com/avik_911', label: 'Instagram' },
  ];
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">CourseVerse</span>
            </Link>
            <p className="text-muted-foreground">
              Your universe of knowledge.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {navLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              {socialLinks.map(link => (
                 <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label={link.label}>
                    {link.icon}
                 </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CourseVerse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
