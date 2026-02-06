#!/usr/bin/env npx tsx

/**
 * Generate all narration audio files for the documentary
 * Uses ElevenLabs TTS with the specified voice ID
 */

import fs from 'fs';
import path from 'path';
import { config, validateConfig, ensureDir } from './config.js';
import { narrationScript, NarrationEntry } from './narration-script.js';

const VOICE_ID = config.voiceId;
const OUTPUT_DIR = path.resolve(config.narrationDir);

interface GenerationResult {
  id: string;
  success: boolean;
  outputPath?: string;
  error?: string;
}

async function generateNarration(entry: NarrationEntry): Promise<GenerationResult> {
  const outputPath = path.join(OUTPUT_DIR, `${entry.id}.mp3`);

  console.log(`\nGenerating: ${entry.id}`);
  console.log(`  Chapter: ${entry.chapter}`);
  console.log(`  Scene: ${entry.scene}`);
  console.log(`  Text: "${entry.text.substring(0, 60)}..."`);

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': config.elevenLabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: entry.text,
        model_id: config.models.elevenLabsTTS,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.4,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(audioBuffer));
    console.log(`  Saved: ${outputPath}`);

    return { id: entry.id, success: true, outputPath };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`  ERROR: ${errorMessage}`);
    return { id: entry.id, success: false, error: errorMessage };
  }
}

async function generateAllNarration(options: {
  chapter?: number;
  dryRun?: boolean;
  sequential?: boolean;
  concurrency?: number;
}): Promise<void> {
  validateConfig();
  ensureDir(OUTPUT_DIR);

  let entries = narrationScript;

  // Filter by chapter if specified
  if (options.chapter !== undefined) {
    entries = entries.filter(e => e.chapter === options.chapter);
    console.log(`Filtered to Chapter ${options.chapter}: ${entries.length} entries`);
  }

  console.log(`\n========================================`);
  console.log(`Documentary - Narration Generation`);
  console.log(`========================================`);
  console.log(`Voice ID: ${VOICE_ID}`);
  console.log(`Output Directory: ${OUTPUT_DIR}`);
  console.log(`Total Entries: ${entries.length}`);
  console.log(`Mode: ${options.dryRun ? 'DRY RUN' : options.sequential ? 'Sequential' : `Parallel (${options.concurrency || 3} concurrent)`}`);
  console.log(`========================================\n`);

  if (options.dryRun) {
    console.log('DRY RUN - Would generate:');
    entries.forEach(entry => {
      console.log(`  - ${entry.id}: "${entry.text.substring(0, 50)}..."`);
    });
    return;
  }

  const results: GenerationResult[] = [];
  const startTime = Date.now();

  if (options.sequential) {
    // Sequential generation (safer, uses less API quota at once)
    for (const entry of entries) {
      const result = await generateNarration(entry);
      results.push(result);
      // Small delay between requests to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } else {
    // Parallel generation with concurrency limit
    const concurrency = options.concurrency || 3;
    for (let i = 0; i < entries.length; i += concurrency) {
      const batch = entries.slice(i, i + concurrency);
      const batchResults = await Promise.all(batch.map(generateNarration));
      results.push(...batchResults);
      // Small delay between batches
      if (i + concurrency < entries.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`\n========================================`);
  console.log(`Generation Complete`);
  console.log(`========================================`);
  console.log(`Total Time: ${elapsed}s`);
  console.log(`Successful: ${successful}/${entries.length}`);
  console.log(`Failed: ${failed}/${entries.length}`);

  if (failed > 0) {
    console.log(`\nFailed entries:`);
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.id}: ${r.error}`);
    });
  }

  // Generate manifest file
  const manifest = {
    generatedAt: new Date().toISOString(),
    voiceId: VOICE_ID,
    totalEntries: entries.length,
    successful,
    failed,
    files: results.filter(r => r.success).map(r => ({
      id: r.id,
      path: r.outputPath,
    })),
  };

  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest saved: ${manifestPath}`);
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: npx tsx scripts/generate-all-narration.ts [options]

Options:
  --chapter, -c <num>   Generate only for specific chapter (1-7)
  --dry-run             Show what would be generated without making API calls
  --sequential          Generate one at a time (slower but safer)
  --concurrency <num>   Number of parallel requests (default: 3)
  --help, -h            Show this help message

Examples:
  npx tsx scripts/generate-all-narration.ts                    # Generate all
  npx tsx scripts/generate-all-narration.ts --chapter 1        # Generate Chapter 1 only
  npx tsx scripts/generate-all-narration.ts --dry-run          # Preview without generating
  npx tsx scripts/generate-all-narration.ts --sequential       # Generate one at a time
`);
    process.exit(0);
  }

  const chapterIndex = args.findIndex(a => a === '--chapter' || a === '-c');
  const concurrencyIndex = args.findIndex(a => a === '--concurrency');

  const options = {
    chapter: chapterIndex !== -1 ? parseInt(args[chapterIndex + 1], 10) : undefined,
    dryRun: args.includes('--dry-run'),
    sequential: args.includes('--sequential'),
    concurrency: concurrencyIndex !== -1 ? parseInt(args[concurrencyIndex + 1], 10) : 3,
  };

  try {
    await generateAllNarration(options);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
