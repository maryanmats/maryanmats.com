#!/usr/bin/env node
// Google Search Console deep audit. Zero dependencies (Node >= 18).
// Usage: GSC_KEY=/path/to/service-account.json node gsc-audit.mjs [siteUrl]

import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';

const KEY_PATH = process.env.GSC_KEY;
if (!KEY_PATH) {
  console.error('Set GSC_KEY=/path/to/service-account.json');
  process.exit(1);
}

const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const key = JSON.parse(readFileSync(KEY_PATH, 'utf8'));

const b64 = (obj) =>
  Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

async function getToken() {
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: key.client_email,
    scope: SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64(claim)}`;
  const sig = createSign('RSA-SHA256')
    .update(unsigned)
    .sign(key.private_key, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${sig}`,
    }),
  });
  const json = await res.json();
  if (!json.access_token) {
    throw new Error(`Token failed: ${JSON.stringify(json)}`);
  }
  return json.access_token;
}

let TOKEN;
async function api(url, body) {
  const res = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: {
      authorization: `Bearer ${TOKEN}`,
      'content-type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${res.status} ${url}\n${JSON.stringify(json, null, 2)}`);
  }
  return json;
}

const WM = 'https://www.googleapis.com/webmasters/v3';
const day = (offset) =>
  new Date(Date.now() - offset * 864e5).toISOString().slice(0, 10);

async function searchAnalytics(site, dims, rowLimit = 100, days = 28) {
  const r = await api(
    `${WM}/sites/${encodeURIComponent(site)}/searchAnalytics/query`,
    {
      startDate: day(days + 3),
      endDate: day(3),
      dimensions: dims,
      rowLimit,
      dataState: 'all',
    },
  );
  return r.rows ?? [];
}

async function inspect(site, url) {
  const r = await api(
    'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
    { inspectionUrl: url, siteUrl: site, languageCode: 'en-US' },
  );
  return r.inspectionResult ?? {};
}

async function pool(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        try {
          out[idx] = await fn(items[idx]);
        } catch (e) {
          out[idx] = { __error: e.message };
        }
      }
    }),
  );
  return out;
}

async function sitemapUrls(origin) {
  const idx = await fetch(`${origin}/sitemap-index.xml`).then((r) => r.text());
  const children = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const urls = new Set();
  for (const child of children) {
    const xml = await fetch(child).then((r) => r.text());
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      urls.add(m[1]);
    }
  }
  return [...urls];
}

const H = (s) => `\n${'='.repeat(70)}\n${s}\n${'='.repeat(70)}`;

async function main() {
  TOKEN = await getToken();

  const sites = await api(`${WM}/sites`);
  console.log(H('PROPERTIES VISIBLE TO THIS SERVICE ACCOUNT'));
  for (const s of sites.siteEntry ?? []) {
    console.log(`  ${s.siteUrl}  [${s.permissionLevel}]`);
  }
  if (!sites.siteEntry?.length) {
    console.log('  NONE — add the service account as a user in GSC first.');
    return;
  }

  const site =
    process.argv[2] ??
    sites.siteEntry.find((s) => s.siteUrl.includes('maryanmats'))?.siteUrl ??
    sites.siteEntry[0].siteUrl;
  console.log(`\nAuditing: ${site}`);

  // --- Sitemaps ---
  console.log(H('SITEMAPS'));
  const sm = await api(`${WM}/sites/${encodeURIComponent(site)}/sitemaps`);
  if (!sm.sitemap?.length) {
    console.log('  NO SITEMAP SUBMITTED — this alone suppresses discovery.');
  }
  for (const s of sm.sitemap ?? []) {
    const c = s.contents?.[0] ?? {};
    console.log(
      `  ${s.path}\n    submitted=${s.lastSubmitted ?? '—'} downloaded=${s.lastDownloaded ?? '—'}\n    errors=${s.errors ?? 0} warnings=${s.warnings ?? 0} pending=${s.isPending} submittedUrls=${c.submitted ?? '—'} indexedUrls=${c.indexed ?? '—'}`,
    );
  }

  // --- Search performance ---
  console.log(H('SEARCH PERFORMANCE — last 28 days'));
  const totals = await searchAnalytics(site, [], 1);
  const t = totals[0];
  console.log(
    t
      ? `  clicks=${t.clicks} impressions=${t.impressions} ctr=${(t.ctr * 100).toFixed(2)}% avgPos=${t.position.toFixed(1)}`
      : '  NO DATA — property may be new or unverified.',
  );

  const pages = await searchAnalytics(site, ['page'], 200);
  console.log(`\n  Pages with ANY impressions: ${pages.length}`);
  console.log('\n  TOP 15 PAGES BY IMPRESSIONS:');
  for (const r of pages.slice(0, 15)) {
    console.log(
      `    ${String(r.impressions).padStart(6)} imp ${String(r.clicks).padStart(4)} clk pos ${r.position.toFixed(1).padStart(5)}  ${r.keys[0]}`,
    );
  }

  const queries = await searchAnalytics(site, ['query'], 50);
  console.log('\n  TOP 20 QUERIES:');
  for (const r of queries.slice(0, 20)) {
    console.log(
      `    ${String(r.impressions).padStart(6)} imp ${String(r.clicks).padStart(4)} clk pos ${r.position.toFixed(1).padStart(5)}  ${r.keys[0]}`,
    );
  }

  const striking = queries.filter((r) => r.position > 8 && r.position < 25);
  console.log(`\n  STRIKING DISTANCE (pos 8-25, ${striking.length}):`);
  for (const r of striking.slice(0, 15)) {
    console.log(
      `    pos ${r.position.toFixed(1).padStart(5)} ${String(r.impressions).padStart(5)} imp  ${r.keys[0]}`,
    );
  }

  // --- URL inspection across the whole sitemap ---
  const origin = site.startsWith('sc-domain:')
    ? `https://${site.slice(10)}`
    : site.replace(/\/$/, '');
  const urls = await sitemapUrls(origin);
  console.log(H(`URL INSPECTION — ${urls.length} URLs from sitemap`));
  console.log('  (2000/day quota; this run uses ' + urls.length + ')\n');

  const results = await pool(urls, 5, async (u) => ({
    url: u,
    r: await inspect(site, u),
  }));

  const buckets = new Map();
  const rows = [];
  for (const item of results) {
    if (item?.__error) {
      console.log(`  ERROR ${item.__error.split('\n')[0]}`);
      continue;
    }
    const i = item.r.indexStatusResult ?? {};
    const state = i.coverageState ?? 'UNKNOWN';
    buckets.set(state, (buckets.get(state) ?? 0) + 1);
    rows.push({
      url: item.url,
      verdict: i.verdict ?? '?',
      state,
      robots: i.robotsTxtState ?? '?',
      fetch: i.pageFetchState ?? '?',
      googleCanonical: i.googleCanonical ?? '',
      userCanonical: i.userCanonical ?? '',
      lastCrawl: i.lastCrawlTime ?? '',
    });
  }

  console.log('  COVERAGE SUMMARY:');
  for (const [k, v] of [...buckets].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${String(v).padStart(3)}  ${k}`);
  }

  const bad = rows.filter((r) => r.verdict !== 'PASS');
  console.log(`\n  NOT INDEXED / FAILING (${bad.length}):`);
  for (const r of bad) {
    console.log(`    [${r.verdict}] ${r.state}`);
    console.log(`       ${r.url}`);
    if (r.googleCanonical && r.googleCanonical !== r.url) {
      console.log(`       google picked canonical: ${r.googleCanonical}`);
    }
    if (r.fetch !== 'SUCCESSFUL') {
      console.log(`       fetch: ${r.fetch}`);
    }
    if (r.robots !== 'ALLOWED') {
      console.log(`       robots: ${r.robots}`);
    }
  }

  const mismatch = rows.filter(
    (r) =>
      r.googleCanonical &&
      r.userCanonical &&
      r.googleCanonical !== r.userCanonical,
  );
  console.log(`\n  CANONICAL MISMATCHES (${mismatch.length}):`);
  for (const r of mismatch) {
    console.log(
      `    ${r.url}\n      you=${r.userCanonical}\n      google=${r.googleCanonical}`,
    );
  }

  const never = rows.filter((r) => !r.lastCrawl);
  console.log(`\n  NEVER CRAWLED (${never.length}):`);
  for (const r of never) {
    console.log(`    ${r.url}`);
  }

  // --- Cross-reference: indexed but zero impressions ---
  const impressionUrls = new Set(
    pages.map((p) => p.keys[0].replace(/\/$/, '')),
  );
  const silent = rows
    .filter((r) => r.verdict === 'PASS')
    .filter((r) => !impressionUrls.has(r.url.replace(/\/$/, '')));
  console.log(H(`INDEXED BUT ZERO IMPRESSIONS IN 28d (${silent.length})`));
  for (const r of silent) {
    console.log(`    ${r.url}`);
  }
}

main().catch((e) => {
  console.error('\nFAILED:', e.message);
  process.exit(1);
});
