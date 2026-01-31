#!/usr/bin/env npx tsx

import fs from 'fs';
import path from 'path';
import { config } from './config.js';

type AssetStatus = 'pending' | 'generated' | 'failed';

interface ImageAsset {
  id: string;
  chapter: number;
  prompt: string;
  filename: string;
  status: AssetStatus;
}

interface AudioAsset {
  id: string;
  type: 'narration' | 'sfx' | 'music';
  chapter: number;
  prompt: string;
  filename: string;
  status: AssetStatus;
  voice?: string;
  duration?: number;
}

interface VideoAsset {
  id: string;
  chapter: number;
  prompt: string;
  filename: string;
  status: AssetStatus;
  duration?: number;
  sourceImage?: string;
}

export interface AssetManifest {
  version: string;
  lastUpdated: string;
  images: ImageAsset[];
  audio: AudioAsset[];
  video: VideoAsset[];
}

const MANIFEST_PATH = path.resolve(config.rootDir, 'asset-manifest.json');

// Default manifest with empty arrays - populate as needed
const defaultManifest: AssetManifest = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  images: [],
  audio: [],
  video: [],
};

export function loadManifest(): AssetManifest {
  if (fs.existsSync(MANIFEST_PATH)) {
    const data = fs.readFileSync(MANIFEST_PATH, 'utf-8');
    return JSON.parse(data) as AssetManifest;
  }
  return defaultManifest;
}

export function saveManifest(manifest: AssetManifest): void {
  manifest.lastUpdated = new Date().toISOString();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

export function updateAssetStatus(
  assetId: string,
  status: AssetStatus,
  type: 'images' | 'audio' | 'video'
): void {
  const manifest = loadManifest();
  const asset = manifest[type].find((a) => a.id === assetId);
  if (asset) {
    asset.status = status;
    saveManifest(manifest);
  }
}

export function getAssetsByChapter(chapter: number): {
  images: ImageAsset[];
  audio: AudioAsset[];
  video: VideoAsset[];
} {
  const manifest = loadManifest();
  return {
    images: manifest.images.filter((a) => a.chapter === chapter),
    audio: manifest.audio.filter((a) => a.chapter === chapter || a.chapter === 0),
    video: manifest.video.filter((a) => a.chapter === chapter),
  };
}

export function getPendingAssets(): {
  images: ImageAsset[];
  audio: AudioAsset[];
  video: VideoAsset[];
} {
  const manifest = loadManifest();
  return {
    images: manifest.images.filter((a) => a.status === 'pending'),
    audio: manifest.audio.filter((a) => a.status === 'pending'),
    video: manifest.video.filter((a) => a.status === 'pending'),
  };
}

export function getManifestStats(): {
  total: number;
  pending: number;
  generated: number;
  failed: number;
} {
  const manifest = loadManifest();
  const allAssets = [...manifest.images, ...manifest.audio, ...manifest.video];

  return {
    total: allAssets.length,
    pending: allAssets.filter((a) => a.status === 'pending').length,
    generated: allAssets.filter((a) => a.status === 'generated').length,
    failed: allAssets.filter((a) => a.status === 'failed').length,
  };
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'init': {
      saveManifest(defaultManifest);
      console.log('Manifest initialized with default assets');
      console.log(`Saved to: ${MANIFEST_PATH}`);
      break;
    }
    case 'stats': {
      const stats = getManifestStats();
      console.log('Asset Manifest Statistics:');
      console.log(`  Total assets:     ${stats.total}`);
      console.log(`  Pending:          ${stats.pending}`);
      console.log(`  Generated:        ${stats.generated}`);
      console.log(`  Failed:           ${stats.failed}`);
      break;
    }
    case 'list': {
      const manifest = loadManifest();
      const filter = args[1]; // 'pending', 'generated', 'failed', or chapter number

      let images = manifest.images;
      let audio = manifest.audio;
      let video = manifest.video;

      if (filter) {
        if (['pending', 'generated', 'failed'].includes(filter)) {
          images = images.filter((a) => a.status === filter);
          audio = audio.filter((a) => a.status === filter);
          video = video.filter((a) => a.status === filter);
        } else if (!isNaN(parseInt(filter))) {
          const chapter = parseInt(filter);
          images = images.filter((a) => a.chapter === chapter);
          audio = audio.filter((a) => a.chapter === chapter || a.chapter === 0);
          video = video.filter((a) => a.chapter === chapter);
        }
      }

      console.log('\nImages:');
      images.forEach((a) => console.log(`  [${a.status}] ${a.id}: ${a.filename}`));

      console.log('\nAudio:');
      audio.forEach((a) => console.log(`  [${a.status}] ${a.id} (${a.type}): ${a.filename}`));

      console.log('\nVideo:');
      video.forEach((a) => console.log(`  [${a.status}] ${a.id}: ${a.filename}`));
      break;
    }
    default: {
      console.log(`
Usage: npx tsx scripts/asset-manifest.ts <command>

Commands:
  init              Initialize manifest with default assets
  stats             Show asset statistics
  list [filter]     List assets (filter: pending, generated, failed, or chapter number)

Examples:
  npx tsx scripts/asset-manifest.ts init
  npx tsx scripts/asset-manifest.ts stats
  npx tsx scripts/asset-manifest.ts list pending
  npx tsx scripts/asset-manifest.ts list 1
`);
    }
  }
}

// Only run main when executed directly
const isMainModule = import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`;
if (isMainModule) {
  main();
}
