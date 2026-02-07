---
name: pexels-download
description: Download photos or videos from Pexels by ID or search query
---

# Pexels Download

Download photos or videos from Pexels to the project's public directory with proper attribution.

## Prerequisites

Ensure `PEXELS_API_KEY` is set in your `.env` file.

## Usage

### Download by ID (recommended after searching)
```bash
npx tsx scripts/pexels-download.ts --id 12345 --type photo --prefix chapter1
npx tsx scripts/pexels-download.ts --id 67890 --type video --prefix chapter1
```

### Download by search query
```bash
npx tsx scripts/pexels-download.ts --query "indian train" --type photo --count 3 --prefix ch1
npx tsx scripts/pexels-download.ts --query "railway station" --type video --count 2 --orientation landscape
```

### Custom output directory
```bash
npx tsx scripts/pexels-download.ts --id 12345 --type video --prefix ch1 --output public/video/ch1/
```

## Options

| Flag | Short | Description | Default |
|------|-------|-------------|---------|
| `--id` | | Pexels media ID | |
| `--query` | `-q` | Search query (search & download) | |
| `--type` | `-t` | photo or video | photo |
| `--count` | `-n` | Number to download (query mode) | 5 |
| `--orientation` | | landscape, portrait, or square | |
| `--prefix` | | Filename prefix (e.g., ch1, intro) | |
| `--output` | `-o` | Output directory | auto |

## File Naming

Files are named: `{prefix}-pexels-{id}.{ext}`

## Output Directories

- **Photos**: `public/images/` (default)
- **Videos**: `public/video/` (default)

## Quality

- **Photos**: `large2x` quality (1920px width)
- **Videos**: Highest available at 720p+

## Attribution

Attribution files are automatically created alongside downloads.

## Search First

Use `pexels-search.ts` to browse results before downloading:
```bash
npx tsx scripts/pexels-search.ts --query "indian train" --type photo --count 10
```

## Notes

- API rate limit: 200 requests/hour
- Already downloaded files are skipped
