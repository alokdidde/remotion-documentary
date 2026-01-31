---
name: generate-image
description: Generate an image for the documentary using Google Gemini API
---

# Generate Image

Generate high-quality images using Google Gemini's image generation.

## Usage

```bash
npx tsx scripts/generate-image.ts --prompt "<description>" --output <path>
```

## Options

- `--prompt, -p` - Image description (required)
- `--output, -o` - Output path relative to public/images/ (required)
- `--aspect` - Aspect ratio: 16:9, 9:16, or 1:1 (default: 16:9)

## Notes

- Requires GOOGLE_API_KEY in .env
- Default aspect ratio: 16:9 (1920x1080)
- Output saved to public/images/
