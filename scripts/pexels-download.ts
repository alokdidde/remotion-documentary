/**
 * Pexels Media Downloader
 * Downloads photos and videos from Pexels by ID or search query
 *
 * Usage:
 *   npx tsx scripts/pexels-download.ts --id 12345 --type photo --prefix chapter1
 *   npx tsx scripts/pexels-download.ts --id 67890 --type video --prefix chapter1
 *   npx tsx scripts/pexels-download.ts --query "indian train" --type photo --count 3 --prefix chapter1
 *   npx tsx scripts/pexels-download.ts --query "railway station" --type video --count 2 --output public/video/ch1/
 */

import fs from 'fs';
import path from 'path';
import { config } from './config';

const PEXELS_API_KEY = config.pexelsApiKey;
const PEXELS_API_BASE = 'https://api.pexels.com';

if (!PEXELS_API_KEY) {
  console.error('Error: PEXELS_API_KEY is not set in .env file');
  console.error('Please add PEXELS_API_KEY=your-api-key to your .env file');
  process.exit(1);
}

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
}

interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  url: string;
  duration: number;
  user: {
    name: string;
    url: string;
  };
  video_files: {
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    link: string;
  }[];
  video_pictures: {
    id: number;
    picture: string;
  }[];
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function fetchPhotoById(id: number): Promise<PexelsPhoto> {
  const response = await fetch(`${PEXELS_API_BASE}/v1/photos/${id}`, {
    headers: { 'Authorization': PEXELS_API_KEY },
  });
  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function fetchVideoById(id: number): Promise<PexelsVideo> {
  const response = await fetch(`${PEXELS_API_BASE}/videos/videos/${id}`, {
    headers: { 'Authorization': PEXELS_API_KEY },
  });
  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function searchPhotos(query: string, count: number, orientation?: string): Promise<PexelsPhoto[]> {
  const params = new URLSearchParams({ query, per_page: String(count) });
  if (orientation) params.append('orientation', orientation);

  const response = await fetch(`${PEXELS_API_BASE}/v1/search?${params}`, {
    headers: { 'Authorization': PEXELS_API_KEY },
  });
  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.photos || [];
}

async function searchVideos(query: string, count: number, orientation?: string): Promise<PexelsVideo[]> {
  const params = new URLSearchParams({ query, per_page: String(count) });
  if (orientation) params.append('orientation', orientation);

  const response = await fetch(`${PEXELS_API_BASE}/videos/search?${params}`, {
    headers: { 'Authorization': PEXELS_API_KEY },
  });
  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.videos || [];
}

async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
}

async function downloadPhoto(photo: PexelsPhoto, outputDir: string, prefix: string = ''): Promise<string> {
  const url = photo.src.large2x || photo.src.original;
  const ext = 'jpg';
  const filename = `${prefix}${prefix ? '-' : ''}pexels-${photo.id}.${ext}`;
  const outputPath = path.join(outputDir, filename);

  if (fs.existsSync(outputPath)) {
    console.log(`  Already exists: ${filename}`);
    return outputPath;
  }

  console.log(`  Downloading: ${filename}`);
  console.log(`    Photographer: ${photo.photographer}`);
  console.log(`    Size: ${photo.width}x${photo.height}`);

  await downloadFile(url, outputPath);

  const attrPath = path.join(outputDir, `${filename}.txt`);
  fs.writeFileSync(attrPath, `Photo by ${photo.photographer} on Pexels\n${photo.url}\nDownloaded from: ${url}`);

  const sizeKB = Math.round(fs.statSync(outputPath).size / 1024);
  console.log(`    Saved: ${outputPath} (${sizeKB} KB)`);

  return outputPath;
}

async function downloadVideo(video: PexelsVideo, outputDir: string, prefix: string = ''): Promise<string> {
  const videoFile = video.video_files
    .filter(f => f.width >= 720)
    .sort((a, b) => (b.width * b.height) - (a.width * a.height))[0]
    || video.video_files.sort((a, b) => (b.width * b.height) - (a.width * a.height))[0];

  if (!videoFile) {
    throw new Error(`No video files found for video ${video.id}`);
  }

  const ext = videoFile.file_type.split('/')[1] || 'mp4';
  const filename = `${prefix}${prefix ? '-' : ''}pexels-${video.id}.${ext}`;
  const outputPath = path.join(outputDir, filename);

  if (fs.existsSync(outputPath)) {
    console.log(`  Already exists: ${filename}`);
    return outputPath;
  }

  console.log(`  Downloading: ${filename}`);
  console.log(`    Creator: ${video.user.name}`);
  console.log(`    Duration: ${video.duration}s`);
  console.log(`    Quality: ${videoFile.quality} (${videoFile.width}x${videoFile.height})`);

  await downloadFile(videoFile.link, outputPath);

  const attrPath = path.join(outputDir, `${filename}.txt`);
  fs.writeFileSync(attrPath, `Video by ${video.user.name} on Pexels\n${video.url}\nDownloaded from: ${videoFile.link}`);

  const sizeMB = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(1);
  console.log(`    Saved: ${outputPath} (${sizeMB} MB)`);

  return outputPath;
}

async function main() {
  console.log('========================================');
  console.log('Pexels Media Downloader');
  console.log('========================================');

  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage:
  npx tsx scripts/pexels-download.ts --id <ID> --type <photo|video> [options]
  npx tsx scripts/pexels-download.ts --query "search term" --type <photo|video> [options]

Download by ID:
  --id                  Pexels media ID (required for ID mode)
  --type, -t            photo or video (required)

Download by search:
  --query, -q           Search query (required for search mode)
  --type, -t            photo or video (default: photo)
  --count, -n           Number to download (default: 5)
  --orientation         landscape, portrait, or square

Common Options:
  --prefix              Filename prefix (e.g., ch1, intro)
  --output, -o          Output directory (default: public/images/ or public/video/)

Examples:
  npx tsx scripts/pexels-download.ts --id 12345 --type photo --prefix chapter1
  npx tsx scripts/pexels-download.ts --id 67890 --type video --prefix chapter1 --output public/video/ch1/
  npx tsx scripts/pexels-download.ts --query "indian train" --type photo --count 3 --prefix ch1
  npx tsx scripts/pexels-download.ts --query "railway station" --type video --count 2 --orientation landscape

Search first with pexels-search.ts:
  npx tsx scripts/pexels-search.ts --query "indian train" --type photo --count 10
`);
    return;
  }

  // Parse arguments
  const getArg = (flags: string[]): string | undefined => {
    for (const flag of flags) {
      const eqIdx = args.findIndex(a => a.startsWith(`${flag}=`));
      if (eqIdx !== -1) return args[eqIdx].split('=').slice(1).join('=');
      const spIdx = args.findIndex(a => a === flag);
      if (spIdx !== -1 && args[spIdx + 1]) return args[spIdx + 1];
    }
    return undefined;
  };

  const id = getArg(['--id']);
  const query = getArg(['--query', '-q']);
  const type = (getArg(['--type', '-t']) || 'photo') as 'photo' | 'video';
  const count = parseInt(getArg(['--count', '-n']) || '5', 10);
  const orientation = getArg(['--orientation']) as 'landscape' | 'portrait' | 'square' | undefined;
  const prefix = getArg(['--prefix']) || '';
  const outputArg = getArg(['--output', '-o']);
  const outputDir = outputArg || (type === 'photo' ? config.imagesDir : config.videoDir);

  ensureDir(outputDir);

  if (id) {
    // Download by ID
    const mediaId = parseInt(id, 10);
    console.log(`\nDownloading ${type} ID: ${mediaId}\n`);

    try {
      if (type === 'photo') {
        const photo = await fetchPhotoById(mediaId);
        await downloadPhoto(photo, outputDir, prefix);
      } else {
        const video = await fetchVideoById(mediaId);
        await downloadVideo(video, outputDir, prefix);
      }
    } catch (error) {
      console.error(`Error downloading ${type} ${mediaId}:`, error);
      process.exit(1);
    }
  } else if (query) {
    // Search and download
    console.log(`\nSearching Pexels for: "${query}"`);
    console.log(`Type: ${type}, Count: ${count}`);
    if (orientation) console.log(`Orientation: ${orientation}`);
    console.log('');

    let downloaded = 0;
    try {
      if (type === 'photo') {
        const photos = await searchPhotos(query, count, orientation);
        console.log(`Found ${photos.length} photos\n`);
        for (const photo of photos.slice(0, count)) {
          try {
            await downloadPhoto(photo, outputDir, prefix);
            downloaded++;
          } catch (error) {
            console.error(`  Error downloading photo ${photo.id}:`, error);
          }
        }
      } else {
        const videos = await searchVideos(query, count, orientation);
        console.log(`Found ${videos.length} videos\n`);
        for (const video of videos.slice(0, count)) {
          try {
            await downloadVideo(video, outputDir, prefix);
            downloaded++;
          } catch (error) {
            console.error(`  Error downloading video ${video.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }

    console.log(`\n========================================`);
    console.log(`Downloaded ${downloaded} files`);
    console.log('========================================');
  } else {
    console.error('Error: Specify --id <ID> or --query "search term"');
    process.exit(1);
  }
}

main().catch(console.error);
