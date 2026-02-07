---
name: youtube-search
description: Search YouTube for videos via yt-dlp
---

# YouTube Search

Search YouTube for relevant footage via yt-dlp.

## Prerequisites

Install yt-dlp:
- Windows: `winget install yt-dlp`
- macOS: `brew install yt-dlp`
- Linux: `pip install yt-dlp`

## Usage

### Basic search
```bash
npx tsx scripts/youtube-search.ts --query "documentary b-roll nature" --max-results 5
```

### More results
```bash
npx tsx scripts/youtube-search.ts -q "indian railway footage" -n 10
```

## Options

| Flag | Short | Description | Default |
|------|-------|-------------|---------|
| `--query` | `-q` | Search query | (required) |
| `--max-results` | `-n` | Number of results | 5 |

## Output

Displays results with title, channel, duration, and URL.

## Next Step

Download a result using `youtube-download.ts`:
```bash
npx tsx scripts/youtube-download.ts --url "https://youtube.com/watch?v=..." --output "my-clip"
```

## Notes

- Requires yt-dlp installed on the system
- Results include YouTube URLs for targeted downloading
