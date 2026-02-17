/**
 * SFX Download Script — Freesound only
 *
 * Reads sfx-search-results.json, downloads ALL found results per SFX,
 * and generates a per-sound metadata file in each subfolder:
 *   public/audio/sfx/{sfx_name}/metadata.json
 *
 * Each SFX gets a subfolder: public/audio/sfx/{sfx_name}/
 *   containing multiple MP3s named {sfx_name}_{freesound_id}.mp3
 *
 * Usage:
 *   npx tsx scripts/download-sfx.ts                              # Download all
 *   npx tsx scripts/download-sfx.ts --limit 5                    # First 5 SFX
 *   npx tsx scripts/download-sfx.ts --name whoosh_soft            # Specific SFX
 *   npx tsx scripts/download-sfx.ts --category "Nature"           # By category
 *   npx tsx scripts/download-sfx.ts --skip-downloaded             # Resume interrupted run
 *   npx tsx scripts/download-sfx.ts --dry-run                     # Preview without downloading
 *   npx tsx scripts/download-sfx.ts --flat                        # Flat dir (best match only as {name}.mp3)
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS_FILE = path.join(__dirname, 'sfx-search-results.json');
const SFX_DIR = config.sfxDir;

interface FreesoundResult {
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

interface SfxSearchResult {
  description: string;
  category: string;
  results: FreesoundResult[];
  searchTermUsed: string;
  downloaded: boolean;
}

type SearchResults = Record<string, SfxSearchResult>;

interface SfxFileMetadata {
  file: string;
  freesoundId: number;
  freesoundName: string;
  description: string;
  duration: number;
  tags: string[];
  rating: number;
  license: string;
  author: string;
  fileSizeKB: number;
}

interface SfxSoundMetadata {
  sfxName: string;
  catalogDescription: string;
  category: string;
  files: SfxFileMetadata[];
}

function parseArgs() {
  const args = process.argv.slice(2);
  let limit = 0;
  let name = '';
  let category = '';
  let skipDownloaded = false;
  let dryRun = false;
  let flat = false;

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
      case '--skip-downloaded':
        skipDownloaded = true;
        break;
      case '--dry-run':
        dryRun = true;
        break;
      case '--flat':
        flat = true;
        break;
    }
  }

  return { limit, name, category, skipDownloaded, dryRun, flat };
}

async function downloadFile(
  url: string,
  outputPath: string,
): Promise<number> {
  const resp = await fetch(url, { redirect: 'follow' });

  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}`);
  }

  const buffer = Buffer.from(await resp.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
  return buffer.length;
}

function loadSoundMetadata(sfxDir: string): SfxSoundMetadata | null {
  const metaPath = path.join(sfxDir, 'metadata.json');
  if (fs.existsSync(metaPath)) {
    return JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  }
  return null;
}

function saveSoundMetadata(sfxDir: string, metadata: SfxSoundMetadata): void {
  fs.writeFileSync(
    path.join(sfxDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2),
  );
}

async function main() {
  const { limit, name, category, skipDownloaded, dryRun, flat } = parseArgs();

  if (!fs.existsSync(RESULTS_FILE)) {
    console.error(`No search results found. Run search-sfx.ts first.`);
    process.exit(1);
  }

  const results: SearchResults = JSON.parse(
    fs.readFileSync(RESULTS_FILE, 'utf-8'),
  );

  // Ensure base output dir
  if (!fs.existsSync(SFX_DIR)) {
    fs.mkdirSync(SFX_DIR, { recursive: true });
  }

  // Filter entries
  let entries = Object.entries(results);

  if (name) {
    entries = entries.filter(([k]) => k === name);
    if (entries.length === 0) {
      console.error(`SFX "${name}" not found in search results`);
      process.exit(1);
    }
  }

  if (category) {
    entries = entries.filter(([, v]) =>
      v.category.toLowerCase().includes(category.toLowerCase()),
    );
  }

  if (skipDownloaded) {
    entries = entries.filter(([, v]) => !v.downloaded);
  }

  if (limit > 0) {
    entries = entries.slice(0, limit);
  }

  const totalFiles = entries.reduce((s, [, v]) => s + v.results.length, 0);
  console.log(
    `\nDownloading ${entries.length} SFX (${totalFiles} files total) to ${SFX_DIR}`,
  );
  console.log(`Mode: ${flat ? 'flat (best match only)' : 'multi-file (all results)'}\n`);

  let downloadedFiles = 0;
  let skippedSfx = 0;
  let failedFiles = 0;

  for (const [sfxName, result] of entries) {
    if (result.results.length === 0) {
      console.log(`[SKIP] ${sfxName} — no search results`);
      skippedSfx++;
      continue;
    }

    // Determine which results to download
    const toDownload = flat ? [result.results[0]] : result.results;

    // Create subfolder (unless flat mode)
    const sfxDir = flat ? SFX_DIR : path.join(SFX_DIR, sfxName);
    if (!flat && !dryRun && !fs.existsSync(sfxDir)) {
      fs.mkdirSync(sfxDir, { recursive: true });
    }

    // Load or init per-sound metadata
    const meta: SfxSoundMetadata = (!flat && loadSoundMetadata(sfxDir)) || {
      sfxName,
      catalogDescription: result.description,
      category: result.category,
      files: [],
    };

    console.log(
      `[${sfxName}] ${result.description} (${toDownload.length} file${toDownload.length > 1 ? 's' : ''})`,
    );

    for (const sound of toDownload) {
      if (!sound.previewUrl) {
        console.log(`  - ${sound.name}: no preview URL, skipping`);
        continue;
      }

      const fileName = flat
        ? `${sfxName}.mp3`
        : `${sfxName}_${sound.id}.mp3`;
      const filePath = path.join(sfxDir, fileName);

      // Skip if already exists
      if (fs.existsSync(filePath)) {
        console.log(`  - ${fileName}: already exists, skipping`);
        downloadedFiles++;
        continue;
      }

      if (dryRun) {
        console.log(
          `  - [DRY] ${fileName} <- "${sound.name}" (${sound.duration.toFixed(1)}s)`,
        );
        downloadedFiles++;
        continue;
      }

      try {
        const bytes = await downloadFile(sound.previewUrl, filePath);
        const sizeKB = +(bytes / 1024).toFixed(1);
        console.log(
          `  - ${fileName} (${sizeKB} KB, ${sound.duration.toFixed(1)}s)`,
        );

        // Add to per-sound metadata
        const existing = meta.files.findIndex(
          (f) => f.freesoundId === sound.id,
        );
        const fileEntry: SfxFileMetadata = {
          file: fileName,
          freesoundId: sound.id,
          freesoundName: sound.name,
          description: sound.description,
          duration: sound.duration,
          tags: sound.tags,
          rating: sound.rating,
          license: sound.license,
          author: sound.username,
          fileSizeKB: sizeKB,
        };
        if (existing >= 0) {
          meta.files[existing] = fileEntry;
        } else {
          meta.files.push(fileEntry);
        }

        downloadedFiles++;
      } catch (err) {
        console.log(
          `  - ${fileName}: FAILED (${err instanceof Error ? err.message : err})`,
        );
        failedFiles++;
      }

      // Rate limit
      await new Promise((r) => setTimeout(r, 300));
    }

    // Save per-sound metadata.json inside the subfolder
    if (!flat && !dryRun) {
      saveSoundMetadata(sfxDir, meta);
    }

    // Mark as downloaded in search results
    result.downloaded = true;
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('Download complete!');
  console.log(`  SFX processed: ${entries.length - skippedSfx}`);
  console.log(`  SFX skipped (no results): ${skippedSfx}`);
  console.log(`  Files downloaded: ${downloadedFiles}`);
  console.log(`  Files failed: ${failedFiles}`);

  // Overall
  const totalDl = Object.values(results).filter((r) => r.downloaded).length;
  console.log(
    `\nOverall: ${totalDl}/${Object.keys(results).length} SFX downloaded`,
  );
  console.log(`Each subfolder contains its own metadata.json`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
