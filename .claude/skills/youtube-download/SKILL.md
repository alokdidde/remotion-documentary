---
name: youtube-download
description: Search and download YouTube videos via yt-dlp for documentary footage
---

# YouTube Download Skill

Search YouTube for relevant footage and download clips for use in your documentary.

## Prerequisites

Install yt-dlp:
- Windows: `winget install yt-dlp`
- macOS: `brew install yt-dlp`
- Linux: `pip install yt-dlp`

## Usage

### Search for videos
```bash
npx tsx scripts/youtube-download.ts --search "documentary b-roll nature" --max-results 5
```

### Download a specific video
```bash
npx tsx scripts/youtube-download.ts --url "https://youtube.com/watch?v=..." --output "nature-clip"
```

### Download a specific time range
```bash
npx tsx scripts/youtube-download.ts --url "https://youtube.com/watch?v=..." --output "seg1" --sections "1:58-3:00" --output-dir public/video/p05-samruddhi/
```

### With options
```bash
npx tsx scripts/youtube-download.ts --url "https://youtu.be/..." --output "clip" --resolution 1080 --sections "10-120" -d public/video/p01-bullet-train/
```

## Options

| Flag | Short | Description | Default |
|------|-------|-------------|---------|
| `--search` | `-s` | Search query | |
| `--max-results` | `-n` | Number of search results | 5 |
| `--url` | `-u` | YouTube URL to download | |
| `--output` | `-o` | Output filename (without extension) | |
| `--output-dir` | `-d` | Output directory | `public/video/youtube/` |
| `--resolution` | `-r` | 720 or 1080 | 1080 |
| `--sections` | | Time range, e.g. `10-120` or `1:58-3:00` | |
| `--max-duration` | | Max duration in seconds | |

## Output

- Videos saved to specified `--output-dir` or `public/video/youtube/`
- Metadata files created alongside downloads

## Fair Use Guidelines

- Keep clips short (under 30 seconds recommended)
- Use clips in a transformative context (commentary, criticism, education)
- Always provide attribution
- Prefer Creative Commons licensed content
- Never use full videos or substantial portions
