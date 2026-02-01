---
name: generate-video
description: Generate a video clip for the documentary using Google Veo API
---

# Generate Video

Generate video clips using Google Veo API.

## Usage

```bash
npx tsx scripts/generate-video.ts --prompt "<description>" --output <path>
```

## Options

- `--prompt, -p` - Video description (required)
- `--output, -o` - Output path relative to public/video/ (required)
- `--duration, -d` - Duration in seconds (default: 5)
- `--source-image` - Source image for image-to-video generation

## Requirements

Requires Vertex AI setup:
1. Google Cloud project with Vertex AI enabled
2. GOOGLE_CLOUD_PROJECT in .env
3. `gcloud auth application-default login`

## Notes

- Without Vertex AI, creates a .pending.json placeholder
- Default duration: 5 seconds
