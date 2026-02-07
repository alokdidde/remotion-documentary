---
name: youtube-download
description: Download YouTube videos via yt-dlp by URL
---

# YouTube Download

Download YouTube videos via yt-dlp for use in your documentary.

## Prerequisites

Install yt-dlp:
- Windows: `winget install yt-dlp`
- macOS: `brew install yt-dlp`
- Linux: `pip install yt-dlp`

## Usage

### Download a video
```bash
npx tsx scripts/youtube-download.ts --url "https://youtube.com/watch?v=..." --output "nature-clip"
```

### Download a specific time range
```bash
npx tsx scripts/youtube-download.ts --url "https://youtube.com/watch?v=..." --output "seg1" --sections "1:58-3:00"
```

### Custom output directory and resolution
```bash
npx tsx scripts/youtube-download.ts -u "https://youtu.be/..." -o "clip" --sections "10-120" -d public/video/ch1/ -r 720
```

## Options

| Flag | Short | Description | Default |
|------|-------|-------------|---------|
| `--url` | `-u` | YouTube URL to download | (required) |
| `--output` | `-o` | Output filename (without extension) | |
| `--output-dir` | `-d` | Output directory | `public/video/youtube/` |
| `--resolution` | `-r` | 720 or 1080 | 1080 |
| `--sections` | | Time range, e.g. `10-120` or `1:58-3:00` | |
| `--max-duration` | | Max duration in seconds | |

## Output

- Videos saved to specified `--output-dir` or `public/video/youtube/`
- Metadata files created alongside downloads

## Search First

Use `youtube-search.ts` to find videos:
```bash
npx tsx scripts/youtube-search.ts --query "documentary b-roll nature" --max-results 5
```

## Fair Use Guidelines

- Keep clips short (under 30 seconds recommended)
- Use clips in a transformative context (commentary, criticism, education)
- Always provide attribution
- Prefer Creative Commons licensed content
- Never use full videos or substantial portions
