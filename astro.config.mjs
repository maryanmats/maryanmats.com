// @ts-check

import { readFileSync, readdirSync } from 'node:fs';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

const BLOG_DIR = './src/content/blog';

// YAML reads a bare timestamp as UTC, but `new Date` reads it as local time.
// Without this the sitemap would disagree with the JSON-LD on the page itself.
/** @param {string} stamp */
function parseFrontmatterDate(stamp) {
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(stamp);
  return new Date(stamp.includes('T') && !hasZone ? `${stamp}Z` : stamp);
}

/** @type {Map<string, Date>} */
const postDates = new Map();

for (const file of readdirSync(BLOG_DIR)) {
  if (!/\.mdx?$/.test(file)) {
    continue;
  }
  const frontmatter =
    readFileSync(`${BLOG_DIR}/${file}`, 'utf8').split('---')[1] ?? '';
  const published = frontmatter.match(/^pubDate:\s*(.+)$/m)?.[1].trim();
  const updated = frontmatter.match(/^updatedDate:\s*(.+)$/m)?.[1].trim();
  const stamp = updated ?? published;
  if (!stamp) {
    continue;
  }
  const date = parseFrontmatterDate(stamp);
  if (!Number.isNaN(date.valueOf())) {
    postDates.set(`/blog/${file.replace(/\.mdx?$/, '')}/`, date);
  }
}

const newestPost = new Date(
  Math.max(...[...postDates.values()].map((date) => date.valueOf())),
);

// Only pages whose freshness is actually derivable get a lastmod. Stamping every
// URL with the build time would be a lie, and Google discounts lastmod it cannot trust.
/** @param {string} pathname */
function lastmodFor(pathname) {
  if (postDates.has(pathname)) {
    return postDates.get(pathname);
  }
  if (pathname === '/' || pathname === '/blog/') {
    return newestPost;
  }
  return undefined;
}

// https://astro.build/config
export default defineConfig({
  site: 'https://maryanmats.com',
  prefetch: true,
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/blog/tag/'),
      serialize: (item) => {
        const lastmod = lastmodFor(new URL(item.url).pathname);
        return lastmod ? { ...item, lastmod: lastmod.toISOString() } : item;
      },
    }),
  ],

  markdown: {
    shikiConfig: {
      themes: {
        light: 'min-light',
        dark: 'everforest-dark',
      },
      defaultColor: false,
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
