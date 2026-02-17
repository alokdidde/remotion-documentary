/**
 * SFX Search Script — Freesound only
 *
 * Searches Freesound for each SFX in the catalog.
 * Saves results to scripts/sfx-search-results.json.
 *
 * Usage:
 *   npx tsx scripts/search-sfx.ts                    # Search all SFX
 *   npx tsx scripts/search-sfx.ts --limit 5          # Search first 5 SFX
 *   npx tsx scripts/search-sfx.ts --name whoosh_soft  # Search specific SFX
 *   npx tsx scripts/search-sfx.ts --category "Nature" # Search by category substring
 *   npx tsx scripts/search-sfx.ts --skip-existing     # Skip already-searched SFX
 *   npx tsx scripts/search-sfx.ts --max-results 10    # Max results per SFX (default 5)
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sfxCatalog, type SfxEntry } from './sfx-catalog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS_FILE = path.join(__dirname, 'sfx-search-results.json');

const FREESOUND_API_KEY = process.env.FREESOUND_API_KEY || '';

export interface FreesoundResult {
  id: number;
  name: string;
  description: string;
  duration: number;
  previewUrl: string;
  tags: string[];
  rating: number;
  license: string;
  username: string;
}

export interface SfxSearchResult {
  description: string;
  category: string;
  results: FreesoundResult[];
  searchTermUsed: string;
  downloaded: boolean;
}

export type SearchResults = Record<string, SfxSearchResult>;

// ── Freesound API Search ──

async function searchFreesound(
  query: string,
  maxResults: number,
): Promise<FreesoundResult[]> {
  if (!FREESOUND_API_KEY) {
    console.error('FREESOUND_API_KEY not set in .env');
    process.exit(1);
  }

  const pageSize = Math.min(maxResults, 15);
  const url =
    `https://freesound.org/apiv2/search/text/` +
    `?query=${encodeURIComponent(query)}` +
    `&fields=id,name,description,duration,previews,tags,avg_rating,license,username` +
    `&page_size=${pageSize}` +
    `&sort=score` +
    `&token=${FREESOUND_API_KEY}`;

  try {
    const resp = await fetch(url);

    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      console.warn(`  API ${resp.status}: ${body.slice(0, 200)}`);
      return [];
    }

    const data = await resp.json();

    return (data.results || []).slice(0, maxResults).map((s: any) => ({
      id: s.id,
      name: s.name,
      description: (s.description || '').replace(/<[^>]*>/g, '').slice(0, 300),
      duration: s.duration || 0,
      previewUrl:
        s.previews?.['preview-hq-mp3'] ||
        s.previews?.['preview-lq-mp3'] ||
        '',
      tags: s.tags || [],
      rating: s.avg_rating || 0,
      license: s.license || '',
      username: s.username || '',
    }));
  } catch (err) {
    console.warn(`  Error: ${err instanceof Error ? err.message : err}`);
    return [];
  }
}

// ── Main ──

function loadExistingResults(): SearchResults {
  if (fs.existsSync(RESULTS_FILE)) {
    return JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8'));
  }
  return {};
}

function saveResults(results: SearchResults): void {
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
}

function parseArgs() {
  const args = process.argv.slice(2);
  let limit = 0;
  let name = '';
  let category = '';
  let skipExisting = false;
  let maxResults = 5;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--limit':
        limit = parseInt(args[++i] || '0', 10);
        break;
      case '--name':
        name = args[++i] || '';
        break;
      case '--category':
        category = args[++i] || '';
        break;
      case '--skip-existing':
        skipExisting = true;
        break;
      case '--max-results':
        maxResults = parseInt(args[++i] || '5', 10);
        break;
    }
  }

  return { limit, name, category, skipExisting, maxResults };
}

async function main() {
  const { limit, name, category, skipExisting, maxResults } = parseArgs();

  let entries: SfxEntry[] = [...sfxCatalog];

  if (name) {
    entries = entries.filter((e) => e.name === name);
    if (entries.length === 0) {
      console.error(`SFX "${name}" not found in catalog`);
      process.exit(1);
    }
  }

  if (category) {
    entries = entries.filter((e) =>
      e.category.toLowerCase().includes(category.toLowerCase()),
    );
  }

  if (limit > 0) {
    entries = entries.slice(0, limit);
  }

  const results = loadExistingResults();

  if (skipExisting) {
    const before = entries.length;
    entries = entries.filter(
      (e) => !results[e.name] || results[e.name].results.length === 0,
    );
    console.log(`Skipping ${before - entries.length} already-searched SFX`);
  }

  console.log(`\nSearching Freesound for ${entries.length} SFX (max ${maxResults} results each)...\n`);

  let searched = 0;
  let withResults = 0;
  let noResults = 0;

  for (const entry of entries) {
    searched++;
    const pct = ((searched / entries.length) * 100).toFixed(0);
    console.log(
      `[${pct}%] (${searched}/${entries.length}) ${entry.name} — "${entry.description}"`,
    );

    let bestResults: FreesoundResult[] = [];
    let bestTerm = '';

    // Try each search term, keep the one with most results
    for (const term of entry.searchTerms) {
      console.log(`  Searching: "${term}"`);
      const found = await searchFreesound(term, maxResults);

      if (found.length > bestResults.length) {
        bestResults = found;
        bestTerm = term;
      }

      // If we already have enough, stop
      if (bestResults.length >= maxResults) break;

      // Rate limit: ~2 req/s to be polite
      await new Promise((r) => setTimeout(r, 500));
    }

    if (bestResults.length > 0) {
      console.log(
        `  Found ${bestResults.length} results (via "${bestTerm}")`,
      );
      withResults++;
    } else {
      console.log(`  No results found`);
      noResults++;
    }

    results[entry.name] = {
      description: entry.description,
      category: entry.category,
      results: bestResults,
      searchTermUsed: bestTerm,
      downloaded: results[entry.name]?.downloaded || false,
    };

    // Save after each (resume-safe)
    saveResults(results);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('Search complete!');
  console.log(`  Searched: ${searched}`);
  console.log(`  With results: ${withResults}`);
  console.log(`  No results: ${noResults}`);
  console.log(`  Results file: ${RESULTS_FILE}`);

  const totalResults = Object.values(results).reduce(
    (sum, r) => sum + r.results.length,
    0,
  );
  console.log(
    `  Total sound options: ${totalResults} across ${Object.keys(results).length} SFX`,
  );
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
