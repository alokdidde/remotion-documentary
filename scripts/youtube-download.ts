#!/usr/bin/env npx tsx

/**
 * YouTube Video Downloader
 * Uses yt-dlp CLI for searching and downloading YouTube videos
 *
 * Prerequisites: Install yt-dlp (https://github.com/yt-dlp/yt-dlp)
 *   - Windows: winget install yt-dlp
 *   - macOS: brew install yt-dlp
 *   - Linux: pip install yt-dlp
 *
 * Usage:
 *   npx tsx scripts/youtube-download.ts --search "query" --max-results 5
 *   npx tsx scripts/youtube-download.ts --url "https://youtube.com/..." --output "filename"
 */

import { execSync, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.resolve(__dirname, '..', 'public', 'video', 'youtube');

interface SearchResult {
  id: string;
  title: string;
  url: string;
  duration: string;
  channel: string;
}

interface DownloadOptions {
  url: string;
  output?: string;
  outputDir?: string;
  resolution?: '720' | '1080';
  maxDuration?: number;
  sections?: string; // e.g. "10-120" or "1:58-3:00"
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function checkYtDlp(): boolean {
  try {
    execSync('yt-dlp --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

async function searchYouTube(query: string, maxResults: number = 5): Promise<SearchResult[]> {
  console.log(`\nSearching YouTube for: "${query}"`);
  console.log(`Max results: ${maxResults}`);

  try {
    const result = spawnSync('yt-dlp', [
      `ytsearch${maxResults}:${query}`,
      '--print', '%(id)s\t%(title)s\t%(webpage_url)s\t%(duration_string)s\t%(channel)s',
      '--no-download',
      '--no-warnings',
    ], {
      encoding: 'utf-8',
      timeout: 30000,
    });

    if (result.error) {
      throw result.error;
    }

    const lines = result.stdout.trim().split('\n').filter(Boolean);
    const results: SearchResult[] = lines.map(line => {
      const [id, title, url, duration, channel] = line.split('\t');
      return { id, title, url, duration, channel };
    });

    console.log(`\nFound ${results.length} results:\n`);
    results.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.title}`);
      console.log(`     Channel: ${r.channel} | Duration: ${r.duration}`);
      console.log(`     URL: ${r.url}`);
      console.log('');
    });

    return results;
  } catch (error) {
    console.error('Error searching YouTube:', error);
    return [];
  }
}

async function downloadVideo(options: DownloadOptions): Promise<string | null> {
  const { url, output, outputDir, resolution = '1080', maxDuration, sections } = options;
  const targetDir = outputDir ? path.resolve(outputDir) : OUTPUT_DIR;
  ensureDir(targetDir);

  // Determine output filename
  const outputTemplate = output
    ? path.join(targetDir, output.replace(/\.[^.]+$/, ''))
    : path.join(targetDir, '%(title)s-%(id)s');

  console.log(`\nDownloading: ${url}`);
  console.log(`Resolution: ${resolution}p`);
  console.log(`Output: ${outputTemplate}.mp4`);

  const args = [
    url,
    '-f', `bestvideo[height<=${resolution}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${resolution}][ext=mp4]/best`,
    '--merge-output-format', 'mp4',
    '-o', `${outputTemplate}.%(ext)s`,
    '--no-playlist',
    '--no-warnings',
  ];

  if (sections) {
    args.push('--download-sections', `*${sections}`);
  }

  if (maxDuration) {
    args.push('--match-filter', `duration<=${maxDuration}`);
  }

  try {
    const result = spawnSync('yt-dlp', args, {
      encoding: 'utf-8',
      stdio: 'inherit',
      timeout: 300000, // 5 minute timeout
    });

    if (result.error) {
      throw result.error;
    }

    if (result.status !== 0) {
      console.error('yt-dlp exited with error');
      return null;
    }

    // Find the downloaded file
    const outputFile = output
      ? path.join(OUTPUT_DIR, output.endsWith('.mp4') ? output : `${output}.mp4`)
      : null;

    // Write metadata/attribution file
    const metadataPath = `${outputTemplate}.meta.json`;
    const metadata = {
      url,
      downloadedAt: new Date().toISOString(),
      resolution: `${resolution}p`,
      note: 'Downloaded for documentary use. Ensure compliance with fair use guidelines.',
    };

    // Try to get video info for metadata
    try {
      const infoResult = spawnSync('yt-dlp', [
        url,
        '--print', '%(title)s\t%(channel)s\t%(upload_date)s\t%(duration_string)s\t%(license)s',
        '--no-download',
      ], {
        encoding: 'utf-8',
        timeout: 15000,
      });

      if (infoResult.stdout) {
        const [title, channel, uploadDate, duration, license] = infoResult.stdout.trim().split('\t');
        Object.assign(metadata, { title, channel, uploadDate, duration, license });
      }
    } catch {
      // Metadata enrichment is best-effort
    }

    fs.writeFileSync(metadataPath + '.json', JSON.stringify(metadata, null, 2));
    console.log(`\nMetadata saved to: ${metadataPath}.json`);
    console.log('Download complete!');

    return outputFile;
  } catch (error) {
    console.error('Error downloading video:', error);
    return null;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
YouTube Video Downloader for Documentary Projects
Uses yt-dlp for searching and downloading.

Usage:
  npx tsx scripts/youtube-download.ts --search "<query>" [options]
  npx tsx scripts/youtube-download.ts --url "<url>" [options]

Search Options:
  --search, -s        Search query (required for search mode)
  --max-results, -n   Number of search results (default: 5)

Download Options:
  --url, -u           YouTube URL to download (required for download mode)
  --output, -o        Output filename (without extension)
  --output-dir, -d    Output directory (default: public/video/youtube/)
  --resolution, -r    Video resolution: 720 or 1080 (default: 1080)
  --sections          Time range to download, e.g. "10-120" or "1:58-3:00"
  --max-duration      Maximum video duration in seconds

Examples:
  npx tsx scripts/youtube-download.ts --search "documentary b-roll nature" --max-results 5
  npx tsx scripts/youtube-download.ts --url "https://youtube.com/watch?v=..." --output "nature-clip"
  npx tsx scripts/youtube-download.ts -u "https://youtu.be/..." -o "clip" -d public/video/p01-bullet-train/ --sections "10-120"
  npx tsx scripts/youtube-download.ts -u "https://youtu.be/..." -o "seg1" --sections "1:58-3:00" -d public/video/p05-samruddhi/

Prerequisites:
  Install yt-dlp: https://github.com/yt-dlp/yt-dlp
    Windows: winget install yt-dlp
    macOS:   brew install yt-dlp
    Linux:   pip install yt-dlp

Notes:
  - Downloaded videos are saved to public/video/youtube/
  - Metadata/attribution files are created alongside downloads
  - Ensure compliance with YouTube's terms and fair use guidelines
  - For documentary use, keep clips short and transformative
`);
    process.exit(0);
  }

  // Check yt-dlp is installed
  if (!checkYtDlp()) {
    console.error('Error: yt-dlp is not installed.');
    console.error('Install it from: https://github.com/yt-dlp/yt-dlp');
    console.error('  Windows: winget install yt-dlp');
    console.error('  macOS:   brew install yt-dlp');
    console.error('  Linux:   pip install yt-dlp');
    process.exit(1);
  }

  const searchIndex = args.findIndex(a => a === '--search' || a === '-s');
  const urlIndex = args.findIndex(a => a === '--url' || a === '-u');
  const maxResultsIndex = args.findIndex(a => a === '--max-results' || a === '-n');
  const outputIndex = args.findIndex(a => a === '--output' || a === '-o');
  const resolutionIndex = args.findIndex(a => a === '--resolution' || a === '-r');
  const outputDirIndex = args.findIndex(a => a === '--output-dir' || a === '-d');
  const sectionsIndex = args.findIndex(a => a === '--sections');
  const maxDurationIndex = args.findIndex(a => a === '--max-duration');

  if (searchIndex !== -1 && args[searchIndex + 1]) {
    const query = args[searchIndex + 1];
    const maxResults = maxResultsIndex !== -1 ? parseInt(args[maxResultsIndex + 1], 10) : 5;
    await searchYouTube(query, maxResults);
  } else if (urlIndex !== -1 && args[urlIndex + 1]) {
    const url = args[urlIndex + 1];
    const output = outputIndex !== -1 ? args[outputIndex + 1] : undefined;
    const outputDir = outputDirIndex !== -1 ? args[outputDirIndex + 1] : undefined;
    const resolution = (resolutionIndex !== -1 ? args[resolutionIndex + 1] : '1080') as '720' | '1080';
    const sections = sectionsIndex !== -1 ? args[sectionsIndex + 1] : undefined;
    const maxDuration = maxDurationIndex !== -1 ? parseInt(args[maxDurationIndex + 1], 10) : undefined;

    await downloadVideo({ url, output, outputDir, resolution, sections, maxDuration });
  } else {
    console.error('Error: Specify --search "<query>" or --url "<url>"');
    process.exit(1);
  }
}

main().catch(console.error);
