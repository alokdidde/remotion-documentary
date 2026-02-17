#!/usr/bin/env npx tsx

/**
 * YouTube Video Search
 * Searches YouTube via yt-dlp and displays results
 *
 * Prerequisites: Install yt-dlp (https://github.com/yt-dlp/yt-dlp)
 *   - Windows: winget install yt-dlp
 *   - macOS: brew install yt-dlp
 *   - Linux: pip install yt-dlp
 *
 * Usage:
 *   npx tsx scripts/youtube-search.ts --query "documentary b-roll" --max-results 5
 *   npx tsx scripts/youtube-search.ts -q "indian railway footage" -n 10
 */

import { execSync, spawnSync } from 'child_process';

interface SearchResult {
  id: string;
  title: string;
  url: string;
  duration: string;
  channel: string;
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

async function searchYouTube(query: string, maxResults: number = 5): Promise<SearchResult[]> {
  console.log(`\nSearching YouTube for: "${query}"`);
  console.log(`Max results: ${maxResults}\n`);

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

    console.log(`Found ${results.length} results:\n`);
    results.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.title}`);
      console.log(`     Channel: ${r.channel} | Duration: ${r.duration}`);
      console.log(`     URL: ${r.url}`);
      console.log('');
    });

    if (results.length > 0) {
      console.log('To download, run:');
      console.log(`  npx tsx scripts/youtube-download.ts --url "${results[0].url}" --output "my-clip"`);
    }

    return results;
  } catch (error) {
    console.error('Error searching YouTube:', error);
    return [];
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
YouTube Video Search
Search YouTube for videos via yt-dlp.

Usage:
  npx tsx scripts/youtube-search.ts --query "<search term>" [options]

Options:
  --query, -q           Search query (required)
  --max-results, -n     Number of results (default: 5)

Examples:
  npx tsx scripts/youtube-search.ts --query "documentary b-roll nature" --max-results 5
  npx tsx scripts/youtube-search.ts -q "indian railway footage" -n 10

To download a result, use youtube-download.ts:
  npx tsx scripts/youtube-download.ts --url "https://youtube.com/watch?v=..." --output "my-clip"

Prerequisites:
  Install yt-dlp: https://github.com/yt-dlp/yt-dlp
    Windows: winget install yt-dlp
    macOS:   brew install yt-dlp
    Linux:   pip install yt-dlp
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

  const query = getArg(args, ['--query', '-q', '--search', '-s']);
  if (!query) {
    console.error('Error: --query is required');
    process.exit(1);
  }

  const maxResults = parseInt(getArg(args, ['--max-results', '-n']) || '5', 10);
  await searchYouTube(query, maxResults);
}

main().catch(console.error);
