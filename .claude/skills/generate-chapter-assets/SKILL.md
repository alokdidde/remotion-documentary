---
name: generate-chapter-assets
description: Batch generate all assets (images, audio, video) for a chapter of the documentary
---

# Generate Chapter Assets

Batch generate all pending assets for a chapter or the entire documentary.

## Usage

```bash
npx tsx scripts/generate-all-chapter-assets.ts [options]
```

## Options

- `--chapter, -c` - Chapter number
- `--all` - Generate all pending assets
- `--type` - Asset type: images, audio, video, or all (default: all)
- `--dry-run` - Preview without generating
- `--delay` - Delay between API calls in ms (default: 2000)

## Asset Manifest

```bash
npx tsx scripts/asset-manifest.ts init     # Initialize manifest
npx tsx scripts/asset-manifest.ts stats    # View statistics
npx tsx scripts/asset-manifest.ts list pending  # List pending
```
