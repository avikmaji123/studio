'use client';

import Link from 'next/link';
import { Github, Send, Instagram, BookOpen } from 'lucide-react';
import { useSiteSettings } from '@/hooks/use-settings';
import { Skeleton } from '@/components/ui/skeleton';

const socialIcons = {
  github: <Github />,
  telegram: <Send />,
  instagram: <Instagram />,
};

export default function Footer() {
  const { settings, isLoading } = useSiteSettings();

  const navLinks = [
    { label: 'Courses', href: '/courses' },
    { label: 'News', href: '/news' },
    { label: 'Downloads', href: '/downloads' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];
  const legalLinks = [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
  ];
  
  const visibleSocialLinks = settings.socialLinks.filter(link => link.visible);

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid gap-8 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 col-span-2 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-7 w-7 text-primary" />
              {isLoading ? (
                <Skeleton className="h-6 w-32" />
              ) : (
                <span className="text-lg font-bold">{settings.siteName}</span>
              )}
            </Link>
            {isLoading ? (
              <Skeleton className="h-4 w-48" />
            ) : (
              <p className="text-sm text-muted-foreground max-w-xs">
                {settings.tagline}
              </p>
            )}
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
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
             <h3 className="text-sm font-semibold mb-3">Connect</h3>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                {isLoading ? (
                  <div className="flex space-x-4"><Skeleton className="h-6 w-6" /><Skeleton className="h-6 w-6" /><Skeleton className="h-6 w-6" /></div>
                ) : (
                  visibleSocialLinks.map(link => (
                    <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label={link.name}
                    >
                        {socialIcons[link.id as keyof typeof socialIcons]}
                    </a>
                  ))
                )}
            </div>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
          {isLoading ? (
            <Skeleton className="h-4 w-64 mx-auto" />
          ) : (
            <p>
              {settings.footerText}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
