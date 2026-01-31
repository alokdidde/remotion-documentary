/**
 * Pexels Media Downloader
 * Downloads photos and videos from Pexels for the documentary project
 *
 * Usage:
 *   npx tsx scripts/pexels-download.ts --query "indian train" --type photo --count 5
 *   npx tsx scripts/pexels-download.ts --query "railway station india" --type video --count 3
 *   npx tsx scripts/pexels-download.ts --query "steam locomotive" --type photo --orientation landscape
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

interface SearchOptions {
  query: string;
  type: 'photo' | 'video';
  count: number;
  orientation?: 'landscape' | 'portrait' | 'square';
  size?: 'large' | 'medium' | 'small';
  color?: string;
  minWidth?: number;
  minHeight?: number;
  minDuration?: number;
  maxDuration?: number;
  outputDir?: string;
  prefix?: string;
}

async function searchPhotos(query: string, options: Partial<SearchOptions> = {}): Promise<PexelsPhoto[]> {
  const params = new URLSearchParams({
    query,
    per_page: String(options.count || 15),
  });

  if (options.orientation) params.append('orientation', options.orientation);
  if (options.size) params.append('size', options.size);
  if (options.color) params.append('color', options.color);

  const response = await fetch(`${PEXELS_API_BASE}/v1/search?${params}`, {
    headers: {
      'Authorization': PEXELS_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.photos || [];
}

async function searchVideos(query: string, options: Partial<SearchOptions> = {}): Promise<PexelsVideo[]> {
  const params = new URLSearchParams({
    query,
    per_page: String(options.count || 15),
  });

  if (options.orientation) params.append('orientation', options.orientation);
  if (options.size) params.append('size', options.size);
  if (options.minDuration) params.append('min_duration', String(options.minDuration));
  if (options.maxDuration) params.append('max_duration', String(options.maxDuration));

  const response = await fetch(`${PEXELS_API_BASE}/videos/search?${params}`, {
    headers: {
      'Authorization': PEXELS_API_KEY,
    },
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
  // Use large2x for best quality at 1920px width
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

  // Save attribution info
  const attrPath = path.join(outputDir, `${filename}.txt`);
  fs.writeFileSync(attrPath, `Photo by ${photo.photographer} on Pexels\n${photo.url}\nDownloaded from: ${url}`);

  return outputPath;
}

async function downloadVideo(video: PexelsVideo, outputDir: string, prefix: string = ''): Promise<string> {
  // Find best quality video file (sort by resolution, prefer HD/Full HD)
  const videoFile = video.video_files
    .filter(f => f.width >= 720) // At least 720p
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

  // Save attribution info
  const attrPath = path.join(outputDir, `${filename}.txt`);
  fs.writeFileSync(attrPath, `Video by ${video.user.name} on Pexels\n${video.url}\nDownloaded from: ${videoFile.link}`);

  return outputPath;
}

async function searchAndDownload(options: SearchOptions): Promise<string[]> {
  const outputDir = options.outputDir || (options.type === 'photo' ? config.imagesDir : config.videoDir);

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`\nSearching Pexels for: "${options.query}"`);
  console.log(`Type: ${options.type}, Count: ${options.count}`);
  if (options.orientation) console.log(`Orientation: ${options.orientation}`);

  const downloadedFiles: string[] = [];

  if (options.type === 'photo') {
    const photos = await searchPhotos(options.query, options);
    console.log(`Found ${photos.length} photos\n`);

    for (const photo of photos.slice(0, options.count)) {
      try {
        const filePath = await downloadPhoto(photo, outputDir, options.prefix);
        downloadedFiles.push(filePath);
      } catch (error) {
        console.error(`  Error downloading photo ${photo.id}:`, error);
      }
    }
  } else {
    const videos = await searchVideos(options.query, options);
    console.log(`Found ${videos.length} videos\n`);

    for (const video of videos.slice(0, options.count)) {
      try {
        const filePath = await downloadVideo(video, outputDir, options.prefix);
        downloadedFiles.push(filePath);
      } catch (error) {
        console.error(`  Error downloading video ${video.id}:`, error);
      }
    }
  }

  return downloadedFiles;
}

// Pre-defined searches for the documentary
const documentarySearches: SearchOptions[] = [];

async function main() {
  console.log('========================================');
  console.log('Pexels Media Downloader');
  console.log('========================================');

  const args = process.argv.slice(2);

  // Check for --all flag to download all documentary assets
  if (args.includes('--all')) {
    console.log('\nDownloading all documentary assets...');
    console.log(`Total searches: ${documentarySearches.length}\n`);

    let totalDownloaded = 0;
    for (const search of documentarySearches) {
      try {
        const files = await searchAndDownload(search);
        totalDownloaded += files.length;
        // Small delay to respect rate limits
        await new Promise(r => setTimeout(r, 500));
      } catch (error) {
        console.error(`Error with search "${search.query}":`, error);
      }
    }

    console.log(`\n========================================`);
    console.log(`Total files downloaded: ${totalDownloaded}`);
    console.log('========================================');
    return;
  }

  // Parse command line arguments
  const query = args.find(a => a.startsWith('--query='))?.split('=').slice(1).join('=') ||
                args.find((a, i) => args[i-1] === '--query');
  const type = (args.find(a => a.startsWith('--type='))?.split('=')[1] ||
               args.find((a, i) => args[i-1] === '--type') || 'photo') as 'photo' | 'video';
  const count = parseInt(args.find(a => a.startsWith('--count='))?.split('=')[1] ||
                        args.find((a, i) => args[i-1] === '--count') || '5');
  const orientation = args.find(a => a.startsWith('--orientation='))?.split('=')[1] as 'landscape' | 'portrait' | 'square' | undefined;
  const prefix = args.find(a => a.startsWith('--prefix='))?.split('=')[1] || '';
  const outputDir = args.find(a => a.startsWith('--output='))?.split('=')[1];

  if (!query) {
    console.log(`
Usage:
  npx tsx scripts/pexels-download.ts --query "search term" [options]

Options:
  --query=<term>        Search query (required)
  --type=<photo|video>  Media type (default: photo)
  --count=<n>           Number of items to download (default: 5)
  --orientation=<type>  landscape, portrait, or square
  --prefix=<string>     Filename prefix
  --output=<dir>        Output directory
  --all                 Download all pre-defined documentary assets

Examples:
  npx tsx scripts/pexels-download.ts --query="indian train" --type=photo --count=10
  npx tsx scripts/pexels-download.ts --query="railway station" --type=video --orientation=landscape
  npx tsx scripts/pexels-download.ts --all
`);
    return;
  }

  const options: SearchOptions = {
    query,
    type,
    count,
    orientation,
    prefix,
    outputDir,
  };

  try {
    const files = await searchAndDownload(options);
    console.log(`\n========================================`);
    console.log(`Downloaded ${files.length} files`);
    console.log('========================================');
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);
