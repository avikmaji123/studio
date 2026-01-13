import Link from 'next/link';
import { Github, Send, Instagram, BookOpen } from 'lucide-react';

export default function Footer() {
  const navLinks = [
    { label: 'Courses', href: '/courses' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];
  const legalLinks = [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Admin', href: '/admin' },
  ];
  const socialLinks = [
    { icon: <Github />, href: 'https://github.com/alexavik', label: 'Github' },
    { icon: <Send />, href: 'https://t.me/Avikmaji122911', label: 'Telegram' },
    {
      icon: <Instagram />,
      href: 'https://instagram.com/avik_911',
      label: 'Instagram',
    },
  ];

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-7 w-7 text-primary" />
              <span className="text-lg font-bold">CourseVerse</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              A course distribution and access management platform.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {navLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              {legalLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0 sm:justify-self-end">
            {socialLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={link.label}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
        <div className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} CourseVerse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
