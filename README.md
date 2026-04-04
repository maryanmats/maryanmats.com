# maryanmats.com

Personal blog and portfolio of Maryan Mats — Software Engineer, TypeScript enthusiast, and web craftsman.

**Live:** [maryanmats.com](https://maryanmats.com)

## Stack

- [Astro 6](https://astro.build) — static site generator
- [Tailwind CSS 4](https://tailwindcss.com) — styling
- [MDX](https://mdxjs.com) — articles with components
- [TypeScript](https://www.typescriptlang.org) — type safety everywhere
- [Manrope](https://manropefont.com) + [JetBrains Mono](https://www.jetbrains.com/lp/mono/) — typography
- [Cloudflare Pages](https://pages.cloudflare.com) — hosting

## Features

- Dark / light theme with system preference detection
- Interactive 3D wireframe character (Canvas API)
- Breadcrumbs with JSON-LD structured data
- SEO: Open Graph, Twitter cards, sitemap, RSS, canonical URLs, robots.txt
- Skip-to-content, ARIA labels, semantic HTML
- Reading progress bar on articles
- Table of contents with scroll tracking
- Zero unused code — every component, utility, and asset is active

## Project Structure

```
src/
├── components/        # Reusable UI (Icon, Breadcrumbs, ContactLinks, etc.)
├── content/blog/      # MDX articles
├── data/              # Static data (projects)
├── layouts/           # BaseLayout, BlogPost
├── pages/             # Routes (/, /blog, /projects, /about, /404)
├── styles/            # global.css (Tailwind + design tokens)
└── utils/             # Helpers (reading-time, posts)
public/
├── favicon.svg        # Adaptive dark/light favicon
├── og.png             # Open Graph social image (1200×630)
├── robots.txt         # Crawl rules + sitemap link
└── site.webmanifest   # PWA manifest
```

## Development

```sh
npm install
npm run dev       # → localhost:4321
```

## Build

```sh
npm run build     # → dist/
npm run preview   # preview locally
```

## Writing Articles

Create a `.mdx` file in `src/content/blog/`:

```mdx
---
title: 'Article Title'
description: 'A short description for SEO.'
pubDate: 'Apr 04 2026'
tags: ['typescript', 'react']
---

Your content here.
```

The filename becomes the URL slug: `my-article.mdx` → `/blog/my-article/`

## Deploy

Connected to Cloudflare Pages via GitHub. Push to `main` → auto-deploy.

Build settings:
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Node.js version:** `22`

## License

Code is open source. Content (articles) is copyrighted.
