---
name: pexels-video-search
description: Search for stock videos on Pexels
---

# Pexels Video Search

Search for stock video footage on Pexels for your documentary.

## Usage

```bash
npx tsx scripts/pexels-search.ts --query "<search term>" --type video --count 5 --orientation landscape
```

## Options

| Flag | Short | Description | Default |
|------|-------|-------------|---------|
| `--query` | `-q` | Search query | (required) |
| `--type` | `-t` | Must be `video` | video |
| `--count` | `-n` | Number of results | 10 |
| `--orientation` | `-o` | landscape, portrait, or square | |
| `--min-duration` | | Minimum duration in seconds | |
| `--max-duration` | | Maximum duration in seconds | |

## Selection Criteria

1. **Relevance**: Match the scene description
2. **Quality**: HD (1920x1080) or 4K preferred
3. **Duration**: 10-60 seconds for editing flexibility
4. **Stability**: Smooth footage preferred
5. **Audio**: Clean audio or silence

## Download a Result

```bash
npx tsx scripts/pexels-download.ts --id <ID> --type video --prefix chapter1
```

## Notes

- API rate limit: 200 requests/hour
- HD/4K quality selected automatically on download
- Videos without 720p+ are skipped
