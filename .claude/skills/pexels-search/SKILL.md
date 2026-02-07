---
name: pexels-search
description: Search for stock photos and videos on Pexels
---

# Pexels Search

Search for stock photos and videos on Pexels and browse results before downloading.

## Prerequisites

Ensure `PEXELS_API_KEY` is set in your `.env` file.

## Usage

### Search for photos
```bash
npx tsx scripts/pexels-search.ts --query "indian train" --type photo --count 10
```

### Search for videos
```bash
npx tsx scripts/pexels-search.ts --query "railway station india" --type video --count 5
```

### With filters
```bash
npx tsx scripts/pexels-search.ts --query "ocean sunset" --type photo --orientation landscape --count 15
npx tsx scripts/pexels-search.ts --query "city traffic" --type video --min-duration 10 --max-duration 60
```

## Options

| Flag | Short | Description | Default |
|------|-------|-------------|---------|
| `--query` | `-q` | Search query | (required) |
| `--type` | `-t` | photo or video | photo |
| `--count` | `-n` | Number of results | 10 |
| `--orientation` | `-o` | landscape, portrait, or square | |
| `--size` | | large, medium, or small (photos) | |
| `--color` | | Color filter (photos) | |
| `--min-duration` | | Min duration in seconds (videos) | |
| `--max-duration` | | Max duration in seconds (videos) | |
| `--page` | `-p` | Page number for pagination | 1 |

## Output

Displays results with IDs, dimensions, photographer/creator info, and preview URLs.

## Next Step

Download a result using `pexels-download.ts`:
```bash
npx tsx scripts/pexels-download.ts --id 12345 --type photo --prefix chapter1
```

## Notes

- API rate limit: 200 requests/hour
- Results include Pexels IDs for targeted downloading
