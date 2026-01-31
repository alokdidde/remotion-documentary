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

### With options
```bash
npx tsx scripts/youtube-download.ts --url "https://youtu.be/..." --output "clip" --resolution 1080 --max-duration 60
```

## Options

- `--search, -s` - Search query
- `--max-results, -n` - Number of results (default: 5)
- `--url, -u` - YouTube URL to download
- `--output, -o` - Output filename (without extension)
- `--resolution, -r` - 720 or 1080 (default: 720)
- `--max-duration` - Max duration in seconds

## Output

- Videos saved to: `public/video/youtube/`
- Metadata files created alongside downloads

## Fair Use Guidelines

- Keep clips short (under 30 seconds recommended)
- Use clips in a transformative context (commentary, criticism, education)
- Always provide attribution
- Prefer Creative Commons licensed content
- Never use full videos or substantial portions
