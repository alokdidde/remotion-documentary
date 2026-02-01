---
name: pexels-image-search
description: Search and select stock photos from Pexels based on description and requirements
---

# Pexels Image Search

Search for stock photos on Pexels for your documentary.

## Usage

```bash
npx tsx scripts/pexels-download.ts --query="<search term>" --type=photo --count=10 --orientation=landscape
```

## Options

- `--query` - Search term (required)
- `--type=photo` - Search for photos
- `--count` - Number of results (default: 5)
- `--orientation` - landscape, portrait, or square
- `--prefix` - Filename prefix (e.g., ch1, ch2)

## Selection Criteria

1. **Relevance**: Does it match the chapter theme?
2. **Quality**: Minimum 1920px width for HD video
3. **Composition**: Cinematic look suitable for video backgrounds
4. **Color**: Match chapter color scheme

## Notes

- API rate limit: 200 requests/hour
- Attribution saved automatically
- Use `large2x` quality for HD video (1920px)
