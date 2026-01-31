#!/usr/bin/env npx tsx

import {
  loadManifest,
  updateAssetStatus,
  getAssetsByChapter,
  getPendingAssets,
  getManifestStats,
  type AssetManifest,
} from './asset-manifest.js';
import { generateImage } from './generate-image.js';
import { generateTTS, generateSFX, generateMusic } from './generate-audio.js';
import { generateVideo } from './generate-video.js';
import { config, validateConfig } from './config.js';

interface GenerationOptions {
  chapter?: number;
  all?: boolean;
  type?: 'images' | 'audio' | 'video' | 'all';
  dryRun?: boolean;
  delay?: number;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateChapterAssets(options: GenerationOptions): Promise<void> {
  validateConfig();

  const { chapter, all = false, type = 'all', dryRun = false, delay = 2000 } = options;

  console.log('\n========================================');
  console.log('  Indian Railways Asset Generator');
  console.log('========================================\n');

  // Get assets to generate
  let assets;
  if (all) {
    assets = getPendingAssets();
    console.log('Generating ALL pending assets...\n');
  } else if (chapter !== undefined) {
    assets = getAssetsByChapter(chapter);
    // Filter to only pending
    assets.images = assets.images.filter((a) => a.status === 'pending');
    assets.audio = assets.audio.filter((a) => a.status === 'pending');
    assets.video = assets.video.filter((a) => a.status === 'pending');
    console.log(`Generating pending assets for Chapter ${chapter}...\n`);
  } else {
    console.error('Error: Specify --chapter <num> or --all');
    process.exit(1);
  }

  // Calculate totals
  const totalImages = type === 'all' || type === 'images' ? assets.images.length : 0;
  const totalAudio = type === 'all' || type === 'audio' ? assets.audio.length : 0;
  const totalVideo = type === 'all' || type === 'video' ? assets.video.length : 0;
  const total = totalImages + totalAudio + totalVideo;

  console.log(`Assets to generate:`);
  console.log(`  Images: ${totalImages}`);
  console.log(`  Audio:  ${totalAudio}`);
  console.log(`  Video:  ${totalVideo}`);
  console.log(`  Total:  ${total}\n`);

  if (total === 0) {
    console.log('No pending assets to generate!');
    return;
  }

  if (dryRun) {
    console.log('[DRY RUN] Would generate the following assets:\n');

    if (totalImages > 0) {
      console.log('Images:');
      assets.images.forEach((a) => console.log(`  - ${a.id}: ${a.filename}`));
    }
    if (totalAudio > 0) {
      console.log('\nAudio:');
      assets.audio.forEach((a) => console.log(`  - ${a.id} (${a.type}): ${a.filename}`));
    }
    if (totalVideo > 0) {
      console.log('\nVideo:');
      assets.video.forEach((a) => console.log(`  - ${a.id}: ${a.filename}`));
    }
    return;
  }

  let completed = 0;
  let failed = 0;

  // Generate Images
  if (type === 'all' || type === 'images') {
    console.log('\n--- Generating Images ---\n');

    for (const asset of assets.images) {
      try {
        console.log(`[${completed + 1}/${total}] Generating: ${asset.id}`);
        await generateImage({
          prompt: asset.prompt,
          output: asset.filename,
        });
        updateAssetStatus(asset.id, 'generated', 'images');
        completed++;
        console.log(`✓ Completed: ${asset.filename}\n`);
      } catch (error) {
        console.error(`✗ Failed: ${asset.id} - ${error}`);
        updateAssetStatus(asset.id, 'failed', 'images');
        failed++;
      }

      // Rate limiting delay
      if (assets.images.indexOf(asset) < assets.images.length - 1) {
        await sleep(delay);
      }
    }
  }

  // Generate Audio
  if (type === 'all' || type === 'audio') {
    console.log('\n--- Generating Audio ---\n');

    for (const asset of assets.audio) {
      try {
        console.log(`[${completed + 1}/${total}] Generating: ${asset.id} (${asset.type})`);

        switch (asset.type) {
          case 'narration':
            await generateTTS({
              text: asset.prompt,
              output: asset.filename,
              voice: asset.voice,
            });
            break;
          case 'sfx':
            await generateSFX({
              prompt: asset.prompt,
              output: asset.filename,
              duration: asset.duration,
            });
            break;
          case 'music':
            await generateMusic({
              prompt: asset.prompt,
              output: asset.filename,
              duration: asset.duration,
            });
            break;
        }

        updateAssetStatus(asset.id, 'generated', 'audio');
        completed++;
        console.log(`✓ Completed: ${asset.filename}\n`);
      } catch (error) {
        console.error(`✗ Failed: ${asset.id} - ${error}`);
        updateAssetStatus(asset.id, 'failed', 'audio');
        failed++;
      }

      // Rate limiting delay
      if (assets.audio.indexOf(asset) < assets.audio.length - 1) {
        await sleep(delay);
      }
    }
  }

  // Generate Video
  if (type === 'all' || type === 'video') {
    console.log('\n--- Generating Video ---\n');

    for (const asset of assets.video) {
      try {
        console.log(`[${completed + 1}/${total}] Generating: ${asset.id}`);
        await generateVideo({
          prompt: asset.prompt,
          output: asset.filename,
          duration: asset.duration,
          sourceImage: asset.sourceImage,
        });
        updateAssetStatus(asset.id, 'generated', 'video');
        completed++;
        console.log(`✓ Completed: ${asset.filename}\n`);
      } catch (error) {
        console.error(`✗ Failed: ${asset.id} - ${error}`);
        updateAssetStatus(asset.id, 'failed', 'video');
        failed++;
      }

      // Rate limiting delay
      if (assets.video.indexOf(asset) < assets.video.length - 1) {
        await sleep(delay);
      }
    }
  }

  // Summary
  console.log('\n========================================');
  console.log('  Generation Complete');
  console.log('========================================');
  console.log(`  Completed: ${completed}`);
  console.log(`  Failed:    ${failed}`);
  console.log(`  Total:     ${total}`);

  const stats = getManifestStats();
  console.log('\nOverall Progress:');
  console.log(`  Generated: ${stats.generated}/${stats.total}`);
  console.log(`  Pending:   ${stats.pending}`);
  console.log(`  Failed:    ${stats.failed}`);
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: npx tsx scripts/generate-all-chapter-assets.ts [options]

Options:
  --chapter, -c   Chapter number to generate assets for
  --all           Generate all pending assets
  --type          Asset type: images, audio, video, or all (default: all)
  --dry-run       Show what would be generated without actually generating
  --delay         Delay between API calls in ms (default: 2000)
  --help, -h      Show this help message

Examples:
  npx tsx scripts/generate-all-chapter-assets.ts --chapter 1
  npx tsx scripts/generate-all-chapter-assets.ts --all
  npx tsx scripts/generate-all-chapter-assets.ts --chapter 1 --type images
  npx tsx scripts/generate-all-chapter-assets.ts --all --dry-run
`);
    process.exit(0);
  }

  const chapterIndex = args.findIndex((a) => a === '--chapter' || a === '-c');
  const allFlag = args.includes('--all');
  const typeIndex = args.findIndex((a) => a === '--type');
  const dryRun = args.includes('--dry-run');
  const delayIndex = args.findIndex((a) => a === '--delay');

  const chapter = chapterIndex !== -1 ? parseInt(args[chapterIndex + 1], 10) : undefined;
  const type = typeIndex !== -1 ? (args[typeIndex + 1] as GenerationOptions['type']) : 'all';
  const delay = delayIndex !== -1 ? parseInt(args[delayIndex + 1], 10) : 2000;

  if (!allFlag && chapter === undefined) {
    console.error('Error: Specify --chapter <num> or --all');
    process.exit(1);
  }

  try {
    await generateChapterAssets({
      chapter,
      all: allFlag,
      type,
      dryRun,
      delay,
    });
  } catch (error) {
    console.error('Generation failed:', error);
    process.exit(1);
  }
}

main();
