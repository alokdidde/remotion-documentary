/**
 * SFX Download Script
 *
 * Reads sfx-search-results.json and downloads the best match for each SFX.
 *
 * Usage:
 *   npx tsx scripts/download-sfx.ts --auto                          # Auto-select & download all
 *   npx tsx scripts/download-sfx.ts --auto --limit 5                # Download first 5
 *   npx tsx scripts/download-sfx.ts --name whoosh_soft               # Download specific SFX
 *   npx tsx scripts/download-sfx.ts --source freesound --auto        # Prefer freesound
 *   npx tsx scripts/download-sfx.ts --auto --skip-downloaded         # Skip already downloaded
 *   npx tsx scripts/download-sfx.ts --dry-run --auto                 # Show what would be downloaded
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS_FILE = path.join(__dirname, 'sfx-search-results.json');
const SFX_DIR = config.sfxDir;

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

function parseArgs() {
  const args = process.argv.slice(2);
  let auto = false;
  let name = '';
  let source: 'pixabay' | 'freesound' | '' = '';
  let limit = 0;
  let skipDownloaded = false;
  let dryRun = false;
  let category = '';

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--auto':
        auto = true;
        break;
      case '--name':
        name = args[++i] || '';
        break;
      case '--source':
        source = (args[++i] || '') as 'pixabay' | 'freesound';
        break;
      case '--limit':
        limit = parseInt(args[++i] || '0', 10);
        break;
      case '--skip-downloaded':
        skipDownloaded = true;
        break;
      case '--dry-run':
        dryRun = true;
        break;
      case '--category':
        category = args[++i] || '';
        break;
    }
  }

  return { auto, name, source, limit, skipDownloaded, dryRun, category };
}

function autoSelect(
  result: SfxSearchResult,
  preferSource: 'pixabay' | 'freesound' | '',
): { source: 'pixabay' | 'freesound'; index: number } | null {
  const hasPixabay = result.pixabay.length > 0;
  const hasFreesound = result.freesound.length > 0;

  if (!hasPixabay && !hasFreesound) return null;

  // If a preferred source is specified, try it first
  if (preferSource === 'pixabay' && hasPixabay) {
    return { source: 'pixabay', index: selectBestPixabay(result.pixabay) };
  }
  if (preferSource === 'freesound' && hasFreesound) {
    return { source: 'freesound', index: selectBestFreesound(result.freesound) };
  }

  // Default priority: Freesound (has rating data, reliable previews) > Pixabay
  if (hasFreesound) {
    return { source: 'freesound', index: selectBestFreesound(result.freesound) };
  }
  if (hasPixabay) {
    return { source: 'pixabay', index: selectBestPixabay(result.pixabay) };
  }

  return null;
}

function selectBestPixabay(results: PixabayResult[]): number {
  // Prefer shorter duration (SFX should be brief), first result as tiebreaker
  let bestIdx = 0;
  let bestScore = Infinity;

  for (let i = 0; i < results.length; i++) {
    const dur = results[i].duration || 10; // Default high if unknown
    if (dur < bestScore) {
      bestScore = dur;
      bestIdx = i;
    }
  }

  return bestIdx;
}

function selectBestFreesound(results: FreesoundResult[]): number {
  // Score: prefer short duration (< 10s) and high rating
  let bestIdx = 0;
  let bestScore = -Infinity;

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const durScore = r.duration <= 5 ? 3 : r.duration <= 10 ? 2 : r.duration <= 30 ? 1 : 0;
    const ratingScore = r.rating || 0;
    const score = durScore * 2 + ratingScore;

    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }

  return bestIdx;
}

async function downloadFile(url: string, outputPath: string): Promise<boolean> {
  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      redirect: 'follow',
    });

    if (!resp.ok) {
      console.error(`    HTTP ${resp.status} for ${url}`);
      return false;
    }

    const buffer = Buffer.from(await resp.arrayBuffer());

    // Sanity check: file should be at least 1KB
    if (buffer.length < 1024) {
      console.warn(`    Warning: File is very small (${buffer.length} bytes), may be corrupt`);
    }

    fs.writeFileSync(outputPath, buffer);
    return true;
  } catch (err) {
    console.error(`    Download error: ${err instanceof Error ? err.message : err}`);
    return false;
  }
}

async function main() {
  const { auto, name, source, limit, skipDownloaded, dryRun, category } = parseArgs();

  if (!auto && !name) {
    console.log('Usage: npx tsx scripts/download-sfx.ts --auto [--limit N] [--source pixabay|freesound]');
    console.log('       npx tsx scripts/download-sfx.ts --name <sfx_name>');
    process.exit(1);
  }

  // Load search results
  if (!fs.existsSync(RESULTS_FILE)) {
    console.error(`No search results found at ${RESULTS_FILE}`);
    console.error('Run search-sfx.ts first to populate search results.');
    process.exit(1);
  }

  const results: SearchResults = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8'));

  // Ensure output directory exists
  if (!fs.existsSync(SFX_DIR)) {
    fs.mkdirSync(SFX_DIR, { recursive: true });
  }

  // Filter entries
  let entries = Object.entries(results);

  if (name) {
    entries = entries.filter(([key]) => key === name);
    if (entries.length === 0) {
      console.error(`SFX "${name}" not found in search results`);
      process.exit(1);
    }
  }

  if (category) {
    entries = entries.filter(([, val]) =>
      val.category.toLowerCase().includes(category.toLowerCase()),
    );
  }

  if (skipDownloaded) {
    entries = entries.filter(([, val]) => !val.downloaded);
  }

  if (limit > 0) {
    entries = entries.slice(0, limit);
  }

  console.log(`\nDownloading ${entries.length} SFX to ${SFX_DIR}\n`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const [sfxName, result] of entries) {
    const outputPath = path.join(SFX_DIR, `${sfxName}.mp3`);

    // Skip if already downloaded and file exists
    if (result.downloaded && fs.existsSync(outputPath) && skipDownloaded) {
      skipped++;
      continue;
    }

    // Auto-select or use existing selection
    let selection = result.selected;
    if (auto && !selection) {
      selection = autoSelect(result, source);
    }

    if (!selection) {
      console.log(`[SKIP] ${sfxName} — no results available`);
      skipped++;
      continue;
    }

    // Get the download URL
    let downloadUrl = '';
    let sourceLabel = '';

    if (selection.source === 'pixabay') {
      const item = result.pixabay[selection.index];
      if (item) {
        downloadUrl = item.downloadUrl;
        sourceLabel = `pixabay: "${item.title}"`;
      }
    } else if (selection.source === 'freesound') {
      const item = result.freesound[selection.index];
      if (item) {
        downloadUrl = item.previewUrl;
        sourceLabel = `freesound: "${item.name}" (${item.duration.toFixed(1)}s, rating: ${item.rating})`;
      }
    }

    if (!downloadUrl) {
      console.log(`[SKIP] ${sfxName} — no download URL`);
      skipped++;
      continue;
    }

    if (dryRun) {
      console.log(`[DRY] ${sfxName} ← ${sourceLabel}`);
      console.log(`      URL: ${downloadUrl}`);
      downloaded++;
      continue;
    }

    console.log(`[DL] ${sfxName} ← ${sourceLabel}`);

    const success = await downloadFile(downloadUrl, outputPath);

    if (success) {
      const stats = fs.statSync(outputPath);
      console.log(`     ✓ Saved (${(stats.size / 1024).toFixed(1)} KB)`);
      downloaded++;

      // Update results
      result.selected = selection;
      result.downloaded = true;
      fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
    } else {
      console.log(`     ✗ Failed`);
      failed++;
    }

    // Rate limit
    await new Promise((r) => setTimeout(r, 500));
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('Download complete!');
  console.log(`  Downloaded: ${downloaded}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Failed: ${failed}`);

  // Overall progress
  const totalInCatalog = Object.keys(results).length;
  const totalDownloaded = Object.values(results).filter((r) => r.downloaded).length;
  console.log(`\nOverall progress: ${totalDownloaded}/${totalInCatalog} SFX downloaded`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
