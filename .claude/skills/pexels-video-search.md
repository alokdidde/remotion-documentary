---
name: pexels-video-search
description: Search and select stock videos from Pexels based on scene requirements
---

# Pexels Video Search

Search for stock video footage on Pexels for your documentary.

## Usage

```bash
npx tsx scripts/pexels-download.ts --query="<search term>" --type=video --count=5 --orientation=landscape
```

## Options

- `--query` - Search term (required)
- `--type=video` - Search for videos
- `--count` - Number of results (default: 5)
- `--orientation` - landscape, portrait, or square
- `--prefix` - Filename prefix

## Selection Criteria

1. **Relevance**: Match the scene description
2. **Quality**: HD (1920x1080) or 4K preferred
3. **Duration**: 10-60 seconds for editing flexibility
4. **Stability**: Smooth footage preferred
5. **Audio**: Clean audio or silence

## Notes

- API rate limit: 200 requests/hour
- HD/4K quality selected automatically
- Videos without 720p+ are skipped
