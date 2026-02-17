---
name: pexels
description: Search and download stock photos and videos from Pexels for documentary footage
---

# Pexels — Stock Photo & Video Search + Download

Search for and download stock photos and videos from Pexels for your documentary.

## Prerequisites

Ensure `PEXELS_API_KEY` is set in your `.env` file.

## Usage

### Search & download photos
```bash
npx tsx scripts/pexels-download.ts --query="SEARCH_TERM" --type=photo --count=5 --prefix=CHAPTER_PREFIX
```

### Search & download videos
```bash
npx tsx scripts/pexels-download.ts --query="SEARCH_TERM" --type=video --count=5 --prefix=CHAPTER_PREFIX
```

### With orientation filter
```bash
npx tsx scripts/pexels-download.ts --query="nature landscape" --type=photo --count=10 --orientation=landscape --prefix=ch1
```

## Options

- `--query` - Search term (required)
- `--type` - `photo` or `video` (required)
- `--count` - Number of results (default: 5)
- `--orientation` - `landscape`, `portrait`, or `square`
- `--prefix` - Filename prefix (e.g., ch1, ch2)

## Output

- **Photos**: `public/images/{prefix}-pexels-{id}.{ext}`
- **Videos**: `public/video/{prefix}-pexels-{id}.{ext}`
- Attribution files are automatically created alongside downloads

## Quality

- **Photos**: `large2x` quality (1920px width) for HD video
- **Videos**: Highest available at 720p+ (HD/4K preferred)

## Selection Criteria

### Photos
1. **Relevance** — Does it match the chapter theme?
2. **Quality** — Minimum 1920px width for HD video
3. **Composition** — Cinematic look suitable for video backgrounds
4. **Color** — Match chapter color scheme

### Videos
1. **Relevance** — Match the scene description
2. **Quality** — HD (1920x1080) or 4K preferred
3. **Duration** — 10-60 seconds for editing flexibility
4. **Stability** — Smooth footage preferred
5. **Audio** — Clean audio or silence

## Integration with Remotion

```tsx
import { Img, staticFile } from 'remotion';
// Photo
<Img src={staticFile('images/ch1-pexels-12345.jpg')} />
// Video
<OffthreadVideo src={staticFile('video/ch1-pexels-67890.mp4')} />
```

## Notes

- API rate limit: 200 requests/hour
- Already downloaded files are skipped
- Videos without 720p+ are skipped
