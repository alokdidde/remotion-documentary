---
name: image-search
description: "Search and download reference images of real people, places, and things from Wikimedia Commons (+ Google Images fallback)"
---

# Image Search — Real Reference Images

Search for and download images of real people, places, and things. Uses Wikimedia Commons first (free, no key needed), falls back to Google Images for broader coverage.

## When to Use This vs. generate-image

| Subject | Use |
|---------|-----|
| Real person (Nikola Tesla, Marie Curie) | **image-search** |
| Real place (Chernobyl, Great Wall of China) | **image-search** |
| Historical event (Apollo 11, D-Day) | **image-search** |
| Real object/artifact (Rosetta Stone, Model T) | **image-search** |
| Abstract concept (loneliness, progress) | **generate-image** |
| Imaginary/fictional scene | **generate-image** |
| Stylized artistic interpretation | **generate-image** |
| Composite/impossible scene | **generate-image** |

## Sources

| Source | API Key | Coverage | License |
|--------|---------|----------|---------|
| Wikimedia Commons (default) | None needed | Notable subjects, historical | CC / Public Domain |
| Google Images (fallback) | `GOOGLE_API_KEY` + `GOOGLE_CSE_ID` | Broadest coverage | CC-filtered |

**Auto mode** (default): Searches Wikimedia first. If not enough results, automatically falls back to Google Images (if configured).

## Usage

```bash
npx tsx scripts/image-search.ts --query "<subject>" [options]
```

## Options

- `--query` - The real subject to search for (required)
- `--count` - Number of images to download (default: 5)
- `--prefix` - Filename prefix, e.g. `ch1`, `ch2` (default: none)
- `--size` - `medium`, `large`, or `original` (default: large)
- `--min-width` - Minimum image width in pixels (default: 800)
- `--output` - Output directory (default: `public/images/`)
- `--source` - `auto`, `wikimedia`, or `google` (default: auto)

## Examples

```bash
# Auto mode: Wikimedia first, Google fallback
npx tsx scripts/image-search.ts --query="Nikola Tesla" --count=3 --prefix=ch2

# Force Google for harder-to-find subjects
npx tsx scripts/image-search.ts --query="rare artifact name" --source=google --count=3

# Wikimedia only (no Google)
npx tsx scripts/image-search.ts --query="Chernobyl reactor" --source=wikimedia --count=5
```

## Google Images Setup

To enable Google Images fallback:

1. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Create a search engine with "Search the entire web" enabled
3. Enable "Image search" in the search engine settings
4. Copy the Search Engine ID
5. Add to `.env`:
   ```
   GOOGLE_CSE_ID=your-search-engine-id
   ```
   (`GOOGLE_API_KEY` is already set for Gemini)

## Output

- Wikimedia images: `{prefix}-wiki-{slug}-{n}.{ext}`
- Google images: `{prefix}-gimg-{slug}-{n}.{ext}`
- Attribution `.txt` file saved alongside each image

## Integration with Remotion

```tsx
import { Img, staticFile } from 'remotion';
<Img src={staticFile('images/ch2-wiki-nikola-tesla-1.jpg')} />
```
