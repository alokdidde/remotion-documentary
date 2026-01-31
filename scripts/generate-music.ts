/**
 * Background Music Generator for Documentary
 * Uses ElevenLabs Music Generation API
 */

import fs from 'fs';
import path from 'path';
import { config } from './config';

interface MusicGenerationParams {
  id: string;
  prompt: string;
  durationMs: number;
}

// Define music generation prompts for each chapter
// Customize these prompts to match your documentary's mood
const musicPrompts: MusicGenerationParams[] = [
  // Add your chapter music prompts here:
  // {
  //   id: "ch1-background",
  //   prompt: `Instrumental cinematic ambient music for a documentary...`,
  //   durationMs: 120000,
  // },
];

async function generateMusic(params: MusicGenerationParams): Promise<void> {
  const outputPath = path.join(config.musicDir, `${params.id}.mp3`);

  console.log(`\nGenerating: ${params.id}`);
  console.log(`  Duration: ${params.durationMs / 1000}s`);
  console.log(`  Output: ${outputPath}`);

  if (fs.existsSync(outputPath)) {
    console.log('  Already exists, skipping...');
    return;
  }

  if (!config.elevenLabsApiKey) {
    console.error('  Error: ELEVENLABS_API_KEY not configured');
    return;
  }

  try {
    console.log('  Calling ElevenLabs Music API...');

    const response = await fetch('https://api.elevenlabs.io/v1/music/compose', {
      method: 'POST',
      headers: {
        'xi-api-key': config.elevenLabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: params.prompt,
        music_length_ms: params.durationMs,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      if (errorData.detail?.status === 'bad_prompt' && errorData.detail?.suggested_prompt) {
        console.log('  Prompt rejected, retrying with suggested prompt...');
        const retryResponse = await fetch('https://api.elevenlabs.io/v1/music/compose', {
          method: 'POST',
          headers: {
            'xi-api-key': config.elevenLabsApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: errorData.detail.suggested_prompt,
            music_length_ms: params.durationMs,
          }),
        });

        if (retryResponse.ok) {
          const audioBuffer = Buffer.from(await retryResponse.arrayBuffer());
          fs.writeFileSync(outputPath, audioBuffer);
          console.log(`  Saved: ${outputPath}`);
          return;
        }
      }

      throw new Error(`ElevenLabs API error ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(outputPath, audioBuffer);
    console.log(`  Saved: ${outputPath}`);

  } catch (error) {
    console.error(`  Error generating ${params.id}:`, error);
  }
}

async function main() {
  console.log('========================================');
  console.log('Documentary - Music Generator');
  console.log('Using ElevenLabs Music API');
  console.log('========================================');

  if (!fs.existsSync(config.musicDir)) {
    fs.mkdirSync(config.musicDir, { recursive: true });
  }

  const args = process.argv.slice(2);
  const chapterArg = args.find(a => a.startsWith('--chapter='))?.split('=')[1];

  let prompts = musicPrompts;

  if (chapterArg) {
    prompts = musicPrompts.filter(p => p.id.includes(chapterArg));
    if (prompts.length === 0) {
      console.error(`Chapter not found: ${chapterArg}`);
      console.log('Available chapters:', musicPrompts.map(p => p.id).join(', '));
      return;
    }
  }

  if (prompts.length === 0) {
    console.log('\nNo music prompts defined. Edit scripts/generate-music.ts to add prompts.');
    return;
  }

  console.log(`\nGenerating ${prompts.length} music track(s)...`);

  const startTime = Date.now();

  for (const params of prompts) {
    await generateMusic(params);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n========================================');
  console.log('Music Generation Complete');
  console.log(`Total Time: ${elapsed}s`);
  console.log('========================================');
}

main().catch(console.error);
