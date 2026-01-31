# Documentary Creation Guide

Step-by-step process for creating a documentary video using this template.

## Step 1: Write the Script

Start with the narration script. This is the backbone of the documentary — everything else is built around it.

- Write the script yourself, or ask Claude to generate one based on a topic
- Break it into chapters and segments (each segment becomes a narration audio clip)
- Define the script in `scripts/narration-script.ts`

Each segment should map to a scene in the timeline with a clear visual direction (what the viewer should see while this narration plays).

## Step 2: Generate Narration Audio

Once the script is finalized, generate TTS audio for each segment:

```bash
# Generate a single narration segment
npx tsx scripts/generate-audio.ts --type tts --text "Your narration text" --output narration/segment-01.mp3

# Or batch generate all narration
npx tsx scripts/generate-all-narration.ts
```

After generation, analyze durations to plan your timeline:

```bash
npx tsx scripts/analyze-audio-durations.ts
```

This tells you how many frames each segment needs, which drives the timing of your chapter components.

## Step 3: Source B-Roll from Stock Footage

With the narration timed out, search for visuals that match each segment. Prefer stock footage over AI generation — it's faster and usually higher quality.

### Pexels (photos and videos)

```bash
# Search for videos
npx tsx scripts/pexels-download.ts --query "railway station india" --type video --count 3

# Search for photos
npx tsx scripts/pexels-download.ts --query "steam locomotive" --type photo --orientation landscape --count 5

# Use a prefix to organize by chapter
npx tsx scripts/pexels-download.ts --query "city skyline" --type video --prefix ch1
```

Photos are saved to `public/images/`, videos to `public/video/`. Attribution files are created automatically.

### YouTube (via yt-dlp)

Requires [yt-dlp](https://github.com/yt-dlp/yt-dlp) installed (`winget install yt-dlp`).

```bash
# Search first (doesn't download)
npx tsx scripts/youtube-download.ts --search "documentary b-roll nature" --max-results 5

# Download a specific video
npx tsx scripts/youtube-download.ts --url "https://youtube.com/watch?v=..." --output "nature-clip" --resolution 1080

# Limit duration for short clips
npx tsx scripts/youtube-download.ts --url "https://youtu.be/..." --output "clip-name" --max-duration 60
```

Videos are saved to `public/video/youtube/`. Metadata files are created alongside.

## Step 4: Fill Gaps with AI Generation (Fallback)

If stock footage doesn't cover a segment, generate images or video with AI:

```bash
# Generate an image with Gemini
npx tsx scripts/generate-image.ts --prompt "A bustling 1920s train station, cinematic" --output ch1-station.png

# Generate a video clip with Veo
npx tsx scripts/generate-video.ts --prompt "Aerial view of a winding mountain railway" --output ch2-aerial.mp4

# Generate sound effects
npx tsx scripts/generate-audio.ts --type sfx --prompt "Train whistle echoing" --output sfx/train-whistle.mp3

# Generate background music
npx tsx scripts/generate-audio.ts --type music --prompt "Gentle cinematic underscore, documentary feel" --output music/chapter1-bg.mp3
```

## Step 5: Build Chapter Components

Edit the chapter files in `src/chapters/` to compose the timeline:

- Replace `PlaceholderImage` with `BackgroundVideo` or `BackgroundImage`
- Add `Narration` segments with frame-based timing (from Step 2 analysis)
- Add data visualizations (`StatCard`, `BarChart`, `AnimatedCounter`, `Timeline`)
- Add `Quote` and `Subtitle` overlays
- Arrange scenes in `<Sequence>` blocks with frame offsets

Reference media using the filenames from Steps 3-4:

```tsx
<BackgroundVideo src="pexels-12345.mp4" />
<BackgroundVideo src="youtube/nature-clip.mp4" />
<BackgroundImage src="ch1-station.png" animation="zoomIn" />
```

## Step 6: Preview

```bash
npm run dev
```

Opens Remotion Studio at localhost:3000. Select the "Documentary" composition to preview. Use individual chapter compositions for faster iteration.

## Step 7: Render

```bash
npm run build
```

Outputs the final 1920x1080 MP4 at 30fps.

## Tips

- Keep narration segments short (10-30 seconds each) for easier timing
- Use `BackgroundVideo` with `loop` and `durationInFrames` props when a video clip is shorter than the scene
- Use Ken Burns effects (`BackgroundImage` with `animation` prop) to make static images feel dynamic
- Layer components: background media + overlay + text/data viz
- Use the `ChapterTransition` or fade transitions between chapters (handled in `Video.tsx`)
