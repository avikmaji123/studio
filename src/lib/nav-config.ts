export type NavItem = {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  label?: string;
};

export type MainNavItem = NavItem;

type NavConfig = {
  mainNav: MainNavItem[];
  sidebarNav: NavItem[];
};

export const navConfig: NavConfig = {
  mainNav: [
    {
      title: 'Courses',
      href: '/courses',
    },
    {
      title: 'Downloads',
      href: '/downloads',
    },
     {
      title: 'About',
      href: '/about',
    },
    {
      title: 'Contact',
      href: '/contact',
    },
  ],
  sidebarNav: [
    {
      title: 'Home',
      href: '/',
    },
    {
      title: 'Courses',
      href: '/courses',
    },
     {
      title: 'Downloads',
      href: '/downloads',
    },
    {
      title: 'About',
      href: '/about',
    },
    {
      title: 'Contact',
      href: '/contact',
    },
     {
      title: 'Privacy Policy',
      href: '/privacy',
    },
    {
      title: 'Terms & Conditions',
      href: '/terms',
    },
  ],
};
