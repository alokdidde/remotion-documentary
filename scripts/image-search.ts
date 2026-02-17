/**
 * Image Search & Download — Real People, Places, and Things
 *
 * Sources (in priority order):
 *   1. Wikimedia Commons — free, CC-licensed, no API key needed
 *   2. Google Images (fallback) — broader coverage, requires GOOGLE_API_KEY + GOOGLE_CSE_ID
 *
 * Usage:
 *   npx tsx scripts/image-search.ts --query "Nikola Tesla" --count 3 --prefix ch2
 *   npx tsx scripts/image-search.ts --query "Chernobyl reactor" --count 5 --prefix ch3
 *   npx tsx scripts/image-search.ts --query "Great Wall of China" --count 2 --size large
 *   npx tsx scripts/image-search.ts --query "rare subject" --source google --count 3
 */

import fs from 'fs';
import path from 'path';
import { config } from './config';

const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const GOOGLE_CSE_API = 'https://www.googleapis.com/customsearch/v1';

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

interface ImageResult {
  title: string;
  url: string;
  thumbUrl: string;
  pageUrl: string;
  width: number;
  height: number;
  mime: string;
  source: 'wikimedia' | 'google';
  artist?: string;
  license?: string;
  description?: string;
}

interface SearchOptions {
  query: string;
  count: number;
  prefix: string;
  size: 'medium' | 'large' | 'original';
  minWidth: number;
  outputDir: string;
  source: 'auto' | 'wikimedia' | 'google';
}

// ---------------------------------------------------------------------------
// Wikimedia Commons
// ---------------------------------------------------------------------------

async function searchWikimediaCommons(query: string, count: number): Promise<ImageResult[]> {
  const searchParams = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: '6',
    gsrlimit: String(Math.min(count * 3, 50)),
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    iiurlwidth: '1920',
    origin: '*',
  });

  const response = await fetch(`${COMMONS_API}?${searchParams}`);
  if (!response.ok) {
    throw new Error(`Wikimedia API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const pages = data.query?.pages;
  if (!pages) return [];

  const images: ImageResult[] = [];

  for (const page of Object.values(pages) as any[]) {
    const info = page.imageinfo?.[0];
    if (!info) continue;
    if (!info.mime?.startsWith('image/')) continue;
    if (info.mime === 'image/svg+xml') continue;

    const ext = info.extmetadata || {};

    images.push({
      title: page.title?.replace('File:', '') || 'Unknown',
      url: info.url,
      thumbUrl: info.thumburl || info.url,
      pageUrl: info.descriptionurl || '',
      width: info.width,
      height: info.height,
      mime: info.mime,
      source: 'wikimedia',
      artist: stripHtml(ext.Artist?.value || ''),
      license: ext.LicenseShortName?.value || ext.License?.value || 'Unknown',
      description: stripHtml(ext.ImageDescription?.value || ''),
    });
  }

  images.sort((a, b) => (b.width * b.height) - (a.width * a.height));
  return images;
}

// ---------------------------------------------------------------------------
// Google Custom Search (Image)
// ---------------------------------------------------------------------------

function isGoogleAvailable(): boolean {
  return !!(config.googleApiKey && config.googleCseId);
}

async function searchGoogleImages(query: string, count: number): Promise<ImageResult[]> {
  if (!config.googleApiKey || !config.googleCseId) {
    console.warn('  Google fallback skipped: GOOGLE_API_KEY or GOOGLE_CSE_ID not set');
    return [];
  }

  const images: ImageResult[] = [];
  // Google CSE returns max 10 per request, paginate if needed
  const pages = Math.ceil(Math.min(count * 2, 30) / 10);

  for (let page = 0; page < pages; page++) {
    const params = new URLSearchParams({
      key: config.googleApiKey,
      cx: config.googleCseId,
      q: query,
      searchType: 'image',
      num: String(Math.min(10, count * 2 - page * 10)),
      start: String(page * 10 + 1),
      imgSize: 'xlarge',
      imgType: 'photo',
      safe: 'active',
      rights: 'cc_publicdomain|cc_attribute|cc_sharealike',
    });

    try {
      const response = await fetch(`${GOOGLE_CSE_API}?${params}`);
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`  Google API error: ${response.status} — ${errorBody.slice(0, 200)}`);
        break;
      }

      const data = await response.json();
      const items = data.items || [];

      for (const item of items) {
        const img = item.image || {};
        images.push({
          title: item.title || 'Untitled',
          url: item.link,
          thumbUrl: img.thumbnailLink || item.link,
          pageUrl: item.image?.contextLink || '',
          width: img.width || 0,
          height: img.height || 0,
          mime: item.mime || 'image/jpeg',
          source: 'google',
          description: item.snippet || '',
        });
      }

      // Stop if fewer results than requested (no more pages)
      if (items.length < 10) break;
    } catch (error) {
      console.error(`  Google search error:`, error);
      break;
    }
  }

  images.sort((a, b) => (b.width * b.height) - (a.width * a.height));
  return images;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function getExtension(mime: string, url: string): string {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/tiff': 'tiff',
  };
  if (mimeMap[mime]) return mimeMap[mime];

  const urlExt = url.split('.').pop()?.split('?')[0]?.toLowerCase();
  if (urlExt && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(urlExt)) {
    return urlExt === 'jpeg' ? 'jpg' : urlExt;
  }
  return 'jpg';
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

// ---------------------------------------------------------------------------
// Download
// ---------------------------------------------------------------------------

async function downloadImage(
  image: ImageResult,
  outputDir: string,
  prefix: string,
  size: 'medium' | 'large' | 'original',
  index: number,
): Promise<string | null> {
  let downloadUrl: string;
  if (image.source === 'wikimedia') {
    downloadUrl = (size === 'original' || image.width <= 1920) ? image.url : image.thumbUrl;
  } else {
    downloadUrl = image.url;
  }

  const ext = getExtension(image.mime, image.url);
  const tag = image.source === 'wikimedia' ? 'wiki' : 'gimg';
  const slug = sanitizeFilename(image.title);
  const filename = `${prefix}${prefix ? '-' : ''}${tag}-${slug}-${index + 1}.${ext}`;
  const outputPath = path.join(outputDir, filename);

  if (fs.existsSync(outputPath)) {
    console.log(`  Already exists: ${filename}`);
    return outputPath;
  }

  console.log(`  Downloading: ${filename}`);
  console.log(`    Title: ${image.title}`);
  console.log(`    Size: ${image.width}x${image.height}`);
  console.log(`    Source: ${image.source === 'wikimedia' ? 'Wikimedia Commons' : 'Google Images'}`);
  if (image.artist) console.log(`    Artist: ${image.artist}`);
  if (image.license) console.log(`    License: ${image.license}`);

  try {
    const response = await fetch(downloadUrl, {
      headers: {
        'User-Agent': 'TimbreDocumentary/1.0 (documentary production tool)',
      },
    });

    if (!response.ok) {
      console.error(`    Download failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);

    // Save attribution file
    const attrPath = path.join(outputDir, `${filename}.txt`);
    const attribution = [
      `Title: ${image.title}`,
      `Source: ${image.source === 'wikimedia' ? 'Wikimedia Commons' : 'Google Images'}`,
      image.artist ? `Artist: ${image.artist}` : null,
      image.license ? `License: ${image.license}` : null,
      image.description ? `Description: ${image.description}` : null,
      `Original URL: ${image.url}`,
      `Page: ${image.pageUrl}`,
      `Downloaded: ${new Date().toISOString()}`,
    ].filter(Boolean).join('\n');
    fs.writeFileSync(attrPath, attribution);

    return outputPath;
  } catch (error) {
    console.error(`    Download error:`, error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('========================================');
  console.log('Image Search — Real People, Places & Things');
  console.log('Sources: Wikimedia Commons + Google Images');
  console.log('========================================');

  const args = process.argv.slice(2);

  const query = args.find(a => a.startsWith('--query='))?.split('=').slice(1).join('=') ||
                args.find((a, i) => args[i - 1] === '--query');
  const count = parseInt(
    args.find(a => a.startsWith('--count='))?.split('=')[1] ||
    args.find((a, i) => args[i - 1] === '--count') || '5'
  );
  const prefix = args.find(a => a.startsWith('--prefix='))?.split('=')[1] ||
                 args.find((a, i) => args[i - 1] === '--prefix') || '';
  const size = (args.find(a => a.startsWith('--size='))?.split('=')[1] || 'large') as SearchOptions['size'];
  const minWidth = parseInt(
    args.find(a => a.startsWith('--min-width='))?.split('=')[1] || '800'
  );
  const outputDir = args.find(a => a.startsWith('--output='))?.split('=')[1] || config.imagesDir;
  const source = (args.find(a => a.startsWith('--source='))?.split('=')[1] || 'auto') as SearchOptions['source'];

  if (!query) {
    console.log(`
Usage:
  npx tsx scripts/image-search.ts --query "<subject>" [options]

Options:
  --query=<term>        Search term — a real person, place, or thing (required)
  --count=<n>           Number of images to download (default: 5)
  --prefix=<string>     Filename prefix, e.g. ch1, ch2 (default: none)
  --size=<size>         medium, large, or original (default: large)
  --min-width=<px>      Minimum image width in pixels (default: 800)
  --output=<dir>        Output directory (default: public/images/)
  --source=<src>        auto, wikimedia, or google (default: auto)
                        auto = Wikimedia first, Google fallback if not enough results

Sources:
  Wikimedia Commons — free, CC-licensed, no API key needed
  Google Images    — broader coverage, needs GOOGLE_API_KEY + GOOGLE_CSE_ID
                     Setup: https://programmablesearchengine.google.com/

Examples:
  npx tsx scripts/image-search.ts --query="Nikola Tesla" --count=3 --prefix=ch2
  npx tsx scripts/image-search.ts --query="Chernobyl reactor" --count=5
  npx tsx scripts/image-search.ts --query="rare artifact" --source=google --count=3
  npx tsx scripts/image-search.ts --query="Great Wall of China" --size=original

When to use this vs. generate-image:
  - REAL subject (person, place, event) → use this script (reference image)
  - IMAGINARY/abstract concept         → use generate-image.ts (AI generation)
`);
    return;
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`\nSearching for: "${query}"`);
  console.log(`Count: ${count}, Size: ${size}, Min width: ${minWidth}px`);
  console.log(`Source: ${source}${source === 'auto' ? ' (Wikimedia → Google fallback)' : ''}`);
  if (prefix) console.log(`Prefix: ${prefix}`);
  console.log('');

  try {
    let allImages: ImageResult[] = [];

    // --- Source selection ---
    if (source === 'wikimedia' || source === 'auto') {
      console.log('[1/2] Searching Wikimedia Commons...');
      const wikiImages = await searchWikimediaCommons(query, count);
      const wikiFiltered = wikiImages.filter(img => img.width >= minWidth);
      console.log(`  Found ${wikiImages.length} images (${wikiFiltered.length} meet ${minWidth}px min width)`);
      allImages.push(...wikiFiltered);
    }

    if (source === 'google' || (source === 'auto' && allImages.length < count)) {
      if (source === 'auto') {
        console.log(`\n  Only ${allImages.length}/${count} from Wikimedia — trying Google fallback...`);
      }

      if (isGoogleAvailable()) {
        console.log(`${source === 'google' ? '[1/1]' : '[2/2]'} Searching Google Images...`);
        const googleImages = await searchGoogleImages(query, count);
        const googleFiltered = googleImages.filter(img => img.width >= minWidth);
        console.log(`  Found ${googleImages.length} images (${googleFiltered.length} meet ${minWidth}px min width)`);

        // Deduplicate by URL
        const existingUrls = new Set(allImages.map(img => img.url));
        const newImages = googleFiltered.filter(img => !existingUrls.has(img.url));
        allImages.push(...newImages);
      } else if (source === 'google') {
        console.error('Error: Google search requires GOOGLE_API_KEY and GOOGLE_CSE_ID in .env');
        console.error('Setup: https://programmablesearchengine.google.com/');
        return;
      } else {
        console.log('  Google fallback unavailable (GOOGLE_CSE_ID not set). Using Wikimedia results only.');
      }
    }

    if (allImages.length === 0) {
      console.log('\nNo images found from any source. Tips:');
      console.log('  - Use the subject\'s full name ("Nikola Tesla" not "Tesla")');
      console.log('  - Add context ("Chernobyl nuclear power plant")');
      console.log('  - Try --source=google for broader coverage');
      console.log('  - Set up GOOGLE_CSE_ID for Google Images fallback');
      return;
    }

    console.log(`\nTotal: ${allImages.length} images available\n`);

    const toDownload = allImages.slice(0, count);
    const downloaded: string[] = [];

    for (let i = 0; i < toDownload.length; i++) {
      const result = await downloadImage(toDownload[i], outputDir, prefix, size, i);
      if (result) downloaded.push(result);

      if (i < toDownload.length - 1) {
        await new Promise(r => setTimeout(r, 300));
      }
    }

    console.log(`\n========================================`);
    console.log(`Downloaded ${downloaded.length} of ${toDownload.length} images`);
    if (downloaded.length > 0) {
      console.log(`\nFiles saved to: ${outputDir}`);
      downloaded.forEach(f => console.log(`  ${path.basename(f)}`));
    }
    console.log('========================================');
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);
