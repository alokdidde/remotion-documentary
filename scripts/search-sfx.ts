/**
 * SFX Search Script
 *
 * Searches Pixabay (via API) and Freesound for each SFX in the catalog.
 * Saves results to scripts/sfx-search-results.json.
 *
 * Usage:
 *   npx tsx scripts/search-sfx.ts                    # Search all SFX
 *   npx tsx scripts/search-sfx.ts --limit 5          # Search first 5 SFX
 *   npx tsx scripts/search-sfx.ts --name whoosh_soft  # Search specific SFX
 *   npx tsx scripts/search-sfx.ts --category "Nature" # Search by category substring
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium, type Browser, type Page } from 'playwright';
import { sfxCatalog, type SfxEntry } from './sfx-catalog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS_FILE = path.join(__dirname, 'sfx-search-results.json');

const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY || '';
const FREESOUND_API_KEY = process.env.FREESOUND_API_KEY || '';

interface PixabayResult {
  title: string;
  url: string;
  duration: number;
  downloadUrl: string;
  id: number;
}

interface FreesoundResult {
  id: number;
  name: string;
  duration: number;
  previewUrl: string;
  tags: string[];
  rating: number;
}

interface SfxSearchResult {
  description: string;
  category: string;
  pixabay: PixabayResult[];
  freesound: FreesoundResult[];
  selected: { source: 'pixabay' | 'freesound'; index: number } | null;
  downloaded: boolean;
}

type SearchResults = Record<string, SfxSearchResult>;

// ── Pixabay API Search ──

async function searchPixabayApi(query: string): Promise<PixabayResult[]> {
  if (!PIXABAY_API_KEY) {
    console.warn('  [pixabay] No API key, skipping');
    return [];
  }

  const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&lang=en&per_page=5`;

  try {
    // Pixabay's main API is for images/video; sound effects use a different endpoint
    // Try the audio search via their undocumented sound effects path
    const sfxUrl = `https://pixabay.com/api/videos/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&per_page=3`;
    // Pixabay doesn't have a public audio API, so we'll use Playwright for that
    return [];
  } catch (err) {
    console.warn(`  [pixabay-api] Error: ${err}`);
    return [];
  }
}

// ── Pixabay Playwright Search ──

async function searchPixabayBrowser(
  page: Page,
  query: string,
): Promise<PixabayResult[]> {
  const results: PixabayResult[] = [];
  const searchUrl = `https://pixabay.com/sound-effects/search/${encodeURIComponent(query)}/`;

  try {
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Wait for results or "no results" to appear
    await page.waitForTimeout(2000);

    // Check for no results
    const noResults = await page.$('div.noResults, .no-results, [data-testid="no-results"]');
    if (noResults) {
      return [];
    }

    // Extract audio items from the search results
    // Pixabay sound effects page lists items with audio players
    const items = await page.$$eval(
      'div.container--HcTw2 div.row--Kxyh9 div.item--TDMFi, div[class*="item"] audio, .audio-row, [class*="soundEffect"], div.results div[class*="row"] > div',
      (elements) => {
        const found: Array<{ title: string; url: string; duration: number; downloadUrl: string; id: number }> = [];
        // Try multiple selectors since Pixabay changes their classes
        const audioElements = document.querySelectorAll('audio[src], source[src]');
        audioElements.forEach((el, i) => {
          if (i >= 5) return;
          const src = el.getAttribute('src') || '';
          const parent = el.closest('[class*="item"], [class*="row"], div');
          const title = parent?.querySelector('[class*="title"], a, span')?.textContent?.trim() || `Result ${i + 1}`;
          found.push({
            title,
            url: window.location.href,
            duration: 0,
            downloadUrl: src,
            id: i,
          });
        });
        return found;
      },
    );

    if (items.length > 0) {
      results.push(...items);
    } else {
      // Fallback: try to get links to individual sound effect pages
      const links = await page.$$eval(
        'a[href*="/sound-effects/"]',
        (anchors) => {
          const seen = new Set<string>();
          return anchors
            .filter((a) => {
              const href = a.getAttribute('href') || '';
              // Only individual sound effect pages (not search pages)
              if (href.includes('/search/') || seen.has(href)) return false;
              seen.add(href);
              return href.match(/\/sound-effects\/[^/]+-\d+\//);
            })
            .slice(0, 5)
            .map((a) => ({
              title: a.textContent?.trim() || '',
              url: `https://pixabay.com${a.getAttribute('href')}`,
              href: a.getAttribute('href') || '',
            }));
        },
      );

      // Visit each individual page to get the download URL
      for (const link of links.slice(0, 3)) {
        try {
          await page.goto(link.url, { waitUntil: 'domcontentloaded', timeout: 10000 });
          await page.waitForTimeout(1000);

          const audioSrc = await page.$$eval('audio source, audio[src]', (els) => {
            for (const el of els) {
              const src = el.getAttribute('src');
              if (src) return src;
            }
            return '';
          });

          const title = await page.$eval(
            'h1, [class*="title"]',
            (el) => el.textContent?.trim() || '',
          ).catch(() => link.title);

          if (audioSrc) {
            results.push({
              title: title || link.title,
              url: link.url,
              duration: 0,
              downloadUrl: audioSrc.startsWith('http') ? audioSrc : `https://pixabay.com${audioSrc}`,
              id: results.length,
            });
          }
        } catch {
          // Skip this link
        }
      }
    }
  } catch (err) {
    console.warn(`  [pixabay] Browser error for "${query}": ${err instanceof Error ? err.message : err}`);
  }

  return results;
}

// ── Freesound API Search ──

async function searchFreesound(query: string): Promise<FreesoundResult[]> {
  if (!FREESOUND_API_KEY) {
    console.warn('  [freesound] No API key, skipping');
    return [];
  }

  const results: FreesoundResult[] = [];
  const searchUrl = `https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(query)}&fields=id,name,duration,previews,tags,avg_rating&page_size=5&token=${FREESOUND_API_KEY}`;

  try {
    const resp = await fetch(searchUrl);

    if (!resp.ok) {
      // If text search fails (known Solr issue), try fetching by browsing
      console.warn(`  [freesound] Search API returned ${resp.status}, trying fallback`);
      return await searchFreesoundFallback(query);
    }

    const data = await resp.json();

    if (data.results) {
      for (const sound of data.results.slice(0, 5)) {
        const previewUrl =
          sound.previews?.['preview-hq-mp3'] ||
          sound.previews?.['preview-lq-mp3'] ||
          '';

        results.push({
          id: sound.id,
          name: sound.name,
          duration: sound.duration || 0,
          previewUrl,
          tags: sound.tags || [],
          rating: sound.avg_rating || 0,
        });
      }
    }
  } catch (err) {
    console.warn(`  [freesound] Error: ${err instanceof Error ? err.message : err}`);
  }

  return results;
}

async function searchFreesoundFallback(query: string): Promise<FreesoundResult[]> {
  // Use the autocomplete or similar endpoint as fallback
  try {
    const url = `https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(query)}&fields=id,name,duration,previews,tags,avg_rating&page_size=3&sort=rating_desc&token=${FREESOUND_API_KEY}`;
    const resp = await fetch(url);
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data.results || []).slice(0, 3).map((sound: any) => ({
      id: sound.id,
      name: sound.name,
      duration: sound.duration || 0,
      previewUrl: sound.previews?.['preview-hq-mp3'] || sound.previews?.['preview-lq-mp3'] || '',
      tags: sound.tags || [],
      rating: sound.avg_rating || 0,
    }));
  } catch {
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

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--name' && args[i + 1]) {
      name = args[i + 1];
      i++;
    } else if (args[i] === '--category' && args[i + 1]) {
      category = args[i + 1];
      i++;
    } else if (args[i] === '--skip-existing') {
      skipExisting = true;
    }
  }

  return { limit, name, category, skipExisting };
}

async function main() {
  const { limit, name, category, skipExisting } = parseArgs();

  // Filter catalog based on args
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

  console.log(`\nSearching for ${entries.length} SFX...\n`);

  // Load existing results
  const results = loadExistingResults();

  // Skip already-searched entries if flag is set
  if (skipExisting) {
    entries = entries.filter((e) => !results[e.name] || (results[e.name].pixabay.length === 0 && results[e.name].freesound.length === 0));
    console.log(`  (${sfxCatalog.length - entries.length} already searched, ${entries.length} remaining)\n`);
  }

  // Launch browser for Pixabay
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    console.log('Launching browser for Pixabay search...');
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    page = await context.newPage();
    console.log('Browser ready.\n');
  } catch (err) {
    console.warn(`Could not launch browser: ${err instanceof Error ? err.message : err}`);
    console.warn('Will search Freesound only.\n');
  }

  let searched = 0;
  let failed = 0;

  for (const entry of entries) {
    searched++;
    const pct = ((searched / entries.length) * 100).toFixed(0);
    console.log(`[${pct}%] (${searched}/${entries.length}) Searching: ${entry.name} — "${entry.description}"`);

    // Initialize result if not exists
    if (!results[entry.name]) {
      results[entry.name] = {
        description: entry.description,
        category: entry.category,
        pixabay: [],
        freesound: [],
        selected: null,
        downloaded: false,
      };
    }

    // Search each term until we get results
    let pixabayResults: PixabayResult[] = [];
    let freesoundResults: FreesoundResult[] = [];

    for (const term of entry.searchTerms) {
      // Pixabay browser search
      if (page && pixabayResults.length === 0) {
        console.log(`  [pixabay] Searching: "${term}"`);
        pixabayResults = await searchPixabayBrowser(page, term);
        if (pixabayResults.length > 0) {
          console.log(`  [pixabay] Found ${pixabayResults.length} results`);
        }
        // Rate limit - be polite
        await new Promise((r) => setTimeout(r, 1500));
      }

      // Freesound API search
      if (freesoundResults.length === 0) {
        console.log(`  [freesound] Searching: "${term}"`);
        freesoundResults = await searchFreesound(term);
        if (freesoundResults.length > 0) {
          console.log(`  [freesound] Found ${freesoundResults.length} results`);
        }
        // Rate limit
        await new Promise((r) => setTimeout(r, 500));
      }

      // Stop searching more terms if we have results from both
      if (pixabayResults.length > 0 && freesoundResults.length > 0) {
        break;
      }
    }

    if (pixabayResults.length === 0 && freesoundResults.length === 0) {
      console.log(`  ⚠ No results found for "${entry.name}"`);
      failed++;
    }

    results[entry.name].pixabay = pixabayResults;
    results[entry.name].freesound = freesoundResults;

    // Save after each SFX (in case of interruption)
    saveResults(results);
  }

  // Cleanup
  if (browser) {
    await browser.close();
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`Search complete!`);
  console.log(`  Searched: ${searched}`);
  console.log(`  No results: ${failed}`);
  console.log(`  Results saved to: ${RESULTS_FILE}`);

  const totalPixabay = Object.values(results).filter((r) => r.pixabay.length > 0).length;
  const totalFreesound = Object.values(results).filter((r) => r.freesound.length > 0).length;
  console.log(`  With Pixabay results: ${totalPixabay}`);
  console.log(`  With Freesound results: ${totalFreesound}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
