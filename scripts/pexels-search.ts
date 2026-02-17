/**
 * Pexels Media Search
 * Searches for photos and videos on Pexels and displays results
 *
 * Usage:
 *   npx tsx scripts/pexels-search.ts --query "indian train" --type photo --count 10
 *   npx tsx scripts/pexels-search.ts --query "railway station india" --type video --count 5
 *   npx tsx scripts/pexels-search.ts --query "steam locomotive" --type photo --orientation landscape
 */

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
  minDuration?: number;
  maxDuration?: number;
  page?: number;
}

async function searchPhotos(query: string, options: Partial<SearchOptions> = {}): Promise<PexelsPhoto[]> {
  const params = new URLSearchParams({
    query,
    per_page: String(options.count || 15),
  });

  if (options.orientation) params.append('orientation', options.orientation);
  if (options.size) params.append('size', options.size);
  if (options.color) params.append('color', options.color);
  if (options.page) params.append('page', String(options.page));

  const response = await fetch(`${PEXELS_API_BASE}/v1/search?${params}`, {
    headers: { 'Authorization': PEXELS_API_KEY },
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
  if (options.page) params.append('page', String(options.page));

  const response = await fetch(`${PEXELS_API_BASE}/videos/search?${params}`, {
    headers: { 'Authorization': PEXELS_API_KEY },
  });

  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.videos || [];
}

function displayPhotoResults(photos: PexelsPhoto[]): void {
  photos.forEach((photo, i) => {
    console.log(`  ${i + 1}. [ID: ${photo.id}] ${photo.alt || '(no description)'}`);
    console.log(`     Photographer: ${photo.photographer}`);
    console.log(`     Size: ${photo.width}x${photo.height} | Color: ${photo.avg_color}`);
    console.log(`     URL: ${photo.url}`);
    console.log(`     Preview: ${photo.src.medium}`);
    console.log('');
  });
}

function displayVideoResults(videos: PexelsVideo[]): void {
  videos.forEach((video, i) => {
    const bestFile = video.video_files
      .sort((a, b) => (b.width * b.height) - (a.width * a.height))[0];
    console.log(`  ${i + 1}. [ID: ${video.id}] ${video.duration}s`);
    console.log(`     Creator: ${video.user.name}`);
    console.log(`     Size: ${video.width}x${video.height} | Duration: ${video.duration}s`);
    if (bestFile) {
      console.log(`     Best quality: ${bestFile.quality} (${bestFile.width}x${bestFile.height})`);
    }
    console.log(`     URL: ${video.url}`);
    console.log('');
  });
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Pexels Media Search
Search for stock photos and videos on Pexels.

Usage:
  npx tsx scripts/pexels-search.ts --query "search term" [options]

Options:
  --query, -q           Search query (required)
  --type, -t            photo or video (default: photo)
  --count, -n           Number of results (default: 10)
  --orientation, -o     landscape, portrait, or square
  --size                large, medium, or small (photos only)
  --color               Color filter (photos only)
  --min-duration        Minimum duration in seconds (videos only)
  --max-duration        Maximum duration in seconds (videos only)
  --page, -p            Page number for pagination (default: 1)

Examples:
  npx tsx scripts/pexels-search.ts --query "indian train" --type photo --count 10
  npx tsx scripts/pexels-search.ts -q "railway station" -t video --orientation landscape
  npx tsx scripts/pexels-search.ts --query "ocean" --type video --min-duration 10 --max-duration 60

To download a result, use pexels-download.ts:
  npx tsx scripts/pexels-download.ts --id 12345 --type photo --prefix chapter1
  npx tsx scripts/pexels-download.ts --id 67890 --type video --output public/video/
`);
    process.exit(0);
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

  const query = getArg(['--query', '-q']);
  if (!query) {
    console.error('Error: --query is required');
    process.exit(1);
  }

  const type = (getArg(['--type', '-t']) || 'photo') as 'photo' | 'video';
  const count = parseInt(getArg(['--count', '-n']) || '10', 10);
  const orientation = getArg(['--orientation', '-o']) as 'landscape' | 'portrait' | 'square' | undefined;
  const size = getArg(['--size']) as 'large' | 'medium' | 'small' | undefined;
  const color = getArg(['--color']);
  const minDuration = getArg(['--min-duration']) ? parseInt(getArg(['--min-duration'])!, 10) : undefined;
  const maxDuration = getArg(['--max-duration']) ? parseInt(getArg(['--max-duration'])!, 10) : undefined;
  const page = parseInt(getArg(['--page', '-p']) || '1', 10);

  console.log(`\nSearching Pexels for: "${query}"`);
  console.log(`Type: ${type} | Count: ${count}${orientation ? ` | Orientation: ${orientation}` : ''}`);
  console.log('');

  try {
    if (type === 'photo') {
      const photos = await searchPhotos(query, { count, orientation, size, color, page });
      console.log(`Found ${photos.length} photos:\n`);
      displayPhotoResults(photos);
      if (photos.length > 0) {
        console.log('To download, run:');
        console.log(`  npx tsx scripts/pexels-download.ts --id ${photos[0].id} --type photo --prefix my-prefix`);
      }
    } else {
      const videos = await searchVideos(query, { count, orientation, minDuration, maxDuration, page });
      console.log(`Found ${videos.length} videos:\n`);
      displayVideoResults(videos);
      if (videos.length > 0) {
        console.log('To download, run:');
        console.log(`  npx tsx scripts/pexels-download.ts --id ${videos[0].id} --type video --prefix my-prefix`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main().catch(console.error);
