---
name: pexels-download
description: Download selected photos or videos from Pexels to the project's public directory with proper attribution
---

# Pexels Download Skill

Download selected photos or videos from Pexels to the project's public directory with proper attribution.

## Prerequisites

Ensure `PEXELS_API_KEY` is set in your `.env` file.

## Download Methods

### Search and Download

For photos:
```bash
npx tsx scripts/pexels-download.ts --query="SEARCH_TERM" --type=photo --count=1 --prefix=CHAPTER_PREFIX
```

For videos:
```bash
npx tsx scripts/pexels-download.ts --query="SEARCH_TERM" --type=video --count=1 --prefix=CHAPTER_PREFIX
```

## File Naming

Files are named: `{prefix}-pexels-{id}.{ext}`

## Output Directories

- **Photos**: `public/images/`
- **Videos**: `public/video/`

## Attribution

Attribution files are automatically created alongside downloads.

## Quality

- **Photos**: `large2x` quality (1920px width)
- **Videos**: Highest available at 720p+

## Integration with Remotion

```tsx
import { Img, staticFile } from 'remotion';
<Img src={staticFile('images/ch1-pexels-12345.jpg')} />
```

## Notes

- API rate limit: 200 requests/hour
- Already downloaded files are skipped
