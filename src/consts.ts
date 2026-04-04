export const SITE_TITLE = 'Maryan Mats';
export const SITE_DESCRIPTION =
  'Creative Engineer & TypeScript Devotee. I craft web interfaces with obsessive attention to detail and write about what I learn.';
export const SITE_AUTHOR = 'Maryan Mats';
export const SITE_EMAIL = 'matsmaryan@gmail.com';

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
] as const;

export const SOCIAL_LINKS = [
  {
    href: 'https://github.com/maryanmats',
    label: 'GitHub',
    shortLabel: 'github.com/maryanmats',
    icon: 'github' as const,
  },
  {
    href: 'https://linkedin.com/in/maryan-mats',
    label: 'LinkedIn',
    shortLabel: 'linkedin.com/in/maryan-mats',
    icon: 'linkedin' as const,
  },
  {
    href: 'https://t.me/maryanmats',
    label: 'Telegram',
    shortLabel: 't.me/maryanmats',
    icon: 'telegram' as const,
  },
] as const;

export const TECH_STACK = [
  'TypeScript',
  'React',
  'Next.js',
  'Astro',
  'Tailwind CSS',
  'Zustand',
  'Node.js',
] as const;
