---
name: pexels-image-search
description: Search for stock photos on Pexels
---

# Pexels Image Search

Search for stock photos on Pexels for your documentary.

## Usage

```bash
npx tsx scripts/pexels-search.ts --query "<search term>" --type photo --count 10 --orientation landscape
```

## Options

| Flag | Short | Description | Default |
|------|-------|-------------|---------|
| `--query` | `-q` | Search query | (required) |
| `--type` | `-t` | Must be `photo` | photo |
| `--count` | `-n` | Number of results | 10 |
| `--orientation` | `-o` | landscape, portrait, or square | |
| `--size` | | large, medium, or small | |
| `--color` | | Color filter | |

## Selection Criteria

1. **Relevance**: Does it match the chapter theme?
2. **Quality**: Minimum 1920px width for HD video
3. **Composition**: Cinematic look suitable for video backgrounds
4. **Color**: Match chapter color scheme

## Download a Result

```bash
npx tsx scripts/pexels-download.ts --id <ID> --type photo --prefix chapter1
```

## Notes

- API rate limit: 200 requests/hour
- Attribution saved automatically on download
- Use `large2x` quality for HD video (1920px)
