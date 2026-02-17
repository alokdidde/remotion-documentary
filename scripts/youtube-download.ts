#!/usr/bin/env npx tsx

/**
 * YouTube Video Downloader
 * Downloads YouTube videos via yt-dlp by URL
 *
 * Prerequisites: Install yt-dlp (https://github.com/yt-dlp/yt-dlp)
 *   - Windows: winget install yt-dlp
 *   - macOS: brew install yt-dlp
 *   - Linux: pip install yt-dlp
 *
 * Usage:
 *   npx tsx scripts/youtube-download.ts --url "https://youtube.com/watch?v=..." --output "my-clip"
 *   npx tsx scripts/youtube-download.ts --url "https://youtu.be/..." --output "seg1" --sections "1:58-3:00"
 */

import { execSync, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.resolve(__dirname, '..', 'public', 'video', 'youtube');

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

function getArg(args: string[], flags: string[]): string | undefined {
  for (const flag of flags) {
    const idx = args.indexOf(flag);
    if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  }
  return undefined;
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
      ? path.join(targetDir, output.endsWith('.mp4') ? output : `${output}.mp4`)
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

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
YouTube Video Downloader
Download YouTube videos via yt-dlp.

Usage:
  npx tsx scripts/youtube-download.ts --url "<url>" [options]

Options:
  --url, -u             YouTube URL to download (required)
  --output, -o          Output filename (without extension)
  --output-dir, -d      Output directory (default: public/video/youtube/)
  --resolution, -r      Video resolution: 720 or 1080 (default: 1080)
  --sections            Time range to download, e.g. "10-120" or "1:58-3:00"
  --max-duration        Maximum video duration in seconds

Examples:
  npx tsx scripts/youtube-download.ts --url "https://youtube.com/watch?v=..." --output "nature-clip"
  npx tsx scripts/youtube-download.ts -u "https://youtu.be/..." -o "clip" --sections "10-120"
  npx tsx scripts/youtube-download.ts -u "https://youtu.be/..." -o "seg1" --sections "1:58-3:00" -d public/video/ch1/

Search first with youtube-search.ts:
  npx tsx scripts/youtube-search.ts --query "documentary b-roll nature" --max-results 5

Prerequisites:
  Install yt-dlp: https://github.com/yt-dlp/yt-dlp
    Windows: winget install yt-dlp
    macOS:   brew install yt-dlp
    Linux:   pip install yt-dlp

Notes:
  - Downloaded videos are saved to public/video/youtube/ by default
  - Metadata/attribution files are created alongside downloads
  - Ensure compliance with YouTube's terms and fair use guidelines
  - For documentary use, keep clips short and transformative
`);
    process.exit(0);
  }

  if (!checkYtDlp()) {
    console.error('Error: yt-dlp is not installed.');
    console.error('Install it from: https://github.com/yt-dlp/yt-dlp');
    console.error('  Windows: winget install yt-dlp');
    console.error('  macOS:   brew install yt-dlp');
    console.error('  Linux:   pip install yt-dlp');
    process.exit(1);
  }

  const url = getArg(args, ['--url', '-u']);
  if (!url) {
    console.error('Error: --url is required');
    console.error('Use youtube-search.ts to find videos first:');
    console.error('  npx tsx scripts/youtube-search.ts --query "your search"');
    process.exit(1);
  }

  const output = getArg(args, ['--output', '-o']);
  const outputDir = getArg(args, ['--output-dir', '-d']);
  const resolution = (getArg(args, ['--resolution', '-r']) || '1080') as '720' | '1080';
  const sections = getArg(args, ['--sections']);
  const maxDurationStr = getArg(args, ['--max-duration']);
  const maxDuration = maxDurationStr ? parseInt(maxDurationStr, 10) : undefined;

  await downloadVideo({ url, output, outputDir, resolution, sections, maxDuration });
}

main().catch(console.error);
