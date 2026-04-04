export interface Project {
  title: string;
  description: string;
  tech: string[];
  href: string;
  status: 'Live' | 'WIP';
  year: string;
}

export const projects: Project[] = [
  {
    title: 'WeSendit',
    description:
      "Secure Swiss file transfer and decentralized Web3 storage platform. The world's first gateway to decentralized storage networks — serving 3.6M+ active users across 180+ countries. Features encrypted file transfer, Web3 storage integration via Storj, and token-based reward system.",
    tech: [
      'React',
      'TypeScript',
      'Web3',
      'Blockchain',
      'Node.js',
      'Cloudflare',
    ],
    href: 'https://www.wesendit.com',
    status: 'Live',
    year: '2024',
  },
  {
    title: 'Personal Blog',
    description:
      'Personal blog built from scratch with Astro, Tailwind CSS 4, and Canvas API. Features a 3D wireframe character, dark/light themes, editorial typography, and perfect Lighthouse scores.',
    tech: ['Astro', 'TypeScript', 'Tailwind CSS', 'Canvas API'],
    href: 'https://github.com/maryanmats/maryanmats.com',
    status: 'Live',
    year: '2026',
  },
];
