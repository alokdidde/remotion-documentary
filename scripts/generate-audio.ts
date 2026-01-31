#!/usr/bin/env npx tsx

import fs from 'fs';
import path from 'path';
import { config, validateConfig, ensureDir } from './config.js';

type AudioType = 'tts' | 'sfx' | 'music';

interface TTSOptions {
  text: string;
  output: string;
  voice?: 'hindi-male' | 'hindi-narrator' | string;
}

interface SFXOptions {
  prompt: string;
  output: string;
  duration?: number;
}

interface MusicOptions {
  prompt: string;
  output: string;
  duration?: number;
}

function getVoiceId(voice: string): string {
  switch (voice) {
    case 'hindi-male':
      return config.voices.hindiMale;
    case 'hindi-narrator':
      return config.voices.hindiNarrator;
    default:
      // Allow custom voice IDs
      return voice.length > 15 ? voice : config.voices.hindiMale;
  }
}

async function generateTTS(options: TTSOptions): Promise<string> {
  validateConfig();

  const { text, output, voice = 'hindi-male' } = options;

  const outputPath = output.startsWith('public/')
    ? path.resolve(config.rootDir, output)
    : path.resolve(config.narrationDir, output);

  ensureDir(path.dirname(outputPath));

  const voiceId = getVoiceId(voice);

  console.log(`Generating TTS narration...`);
  console.log(`Text: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
  console.log(`Voice: ${voice} (${voiceId})`);
  console.log(`Output: ${outputPath}`);

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': config.elevenLabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: config.models.elevenLabsTTS,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs TTS error: ${response.status} - ${errorText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const finalPath = outputPath.endsWith('.mp3') ? outputPath : `${outputPath}.mp3`;
    fs.writeFileSync(finalPath, Buffer.from(audioBuffer));
    console.log(`Audio saved to: ${finalPath}`);
    return finalPath;
  } catch (error) {
    console.error('Error generating TTS:', error);
    throw error;
  }
}

async function generateSFX(options: SFXOptions): Promise<string> {
  validateConfig();

  const { prompt, output, duration = config.defaults.sfxDuration } = options;

  const outputPath = output.startsWith('public/')
    ? path.resolve(config.rootDir, output)
    : path.resolve(config.sfxDir, output);

  ensureDir(path.dirname(outputPath));

  console.log(`Generating sound effect...`);
  console.log(`Prompt: "${prompt}"`);
  console.log(`Duration: ${duration}s`);
  console.log(`Output: ${outputPath}`);

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
      method: 'POST',
      headers: {
        'xi-api-key': config.elevenLabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: prompt,
        duration_seconds: duration,
        prompt_influence: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs SFX error: ${response.status} - ${errorText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const finalPath = outputPath.endsWith('.mp3') ? outputPath : `${outputPath}.mp3`;
    fs.writeFileSync(finalPath, Buffer.from(audioBuffer));
    console.log(`SFX saved to: ${finalPath}`);
    return finalPath;
  } catch (error) {
    console.error('Error generating SFX:', error);
    throw error;
  }
}

async function generateMusic(options: MusicOptions): Promise<string> {
  validateConfig();

  const { prompt, output, duration = config.defaults.musicDuration } = options;

  const outputPath = output.startsWith('public/')
    ? path.resolve(config.rootDir, output)
    : path.resolve(config.musicDir, output);

  ensureDir(path.dirname(outputPath));

  console.log(`Generating background music...`);
  console.log(`Prompt: "${prompt}"`);
  console.log(`Duration: ${duration}s`);
  console.log(`Output: ${outputPath}`);

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
      method: 'POST',
      headers: {
        'xi-api-key': config.elevenLabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: `Background music: ${prompt}`,
        duration_seconds: Math.min(duration, 22), // ElevenLabs limit
        prompt_influence: 0.5,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs Music error: ${response.status} - ${errorText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const finalPath = outputPath.endsWith('.mp3') ? outputPath : `${outputPath}.mp3`;
    fs.writeFileSync(finalPath, Buffer.from(audioBuffer));
    console.log(`Music saved to: ${finalPath}`);
    return finalPath;
  } catch (error) {
    console.error('Error generating music:', error);
    throw error;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: npx tsx scripts/generate-audio.ts <type> [options]

Types:
  tts     Generate text-to-speech narration
  sfx     Generate sound effects
  music   Generate background music

TTS Options:
  --text, -t      Text to convert to speech (required)
  --output, -o    Output file path (required)
  --voice, -v     Voice: hindi-male, hindi-narrator, or voice ID (default: hindi-male)

SFX Options:
  --prompt, -p    Sound effect description (required)
  --output, -o    Output file path (required)
  --duration, -d  Duration in seconds (default: 3, max: 22)

Music Options:
  --prompt, -p    Music description (required)
  --output, -o    Output file path (required)
  --duration, -d  Duration in seconds (default: 30, max: 22)

Examples:
  npx tsx scripts/generate-audio.ts tts --text "भारतीय रेलवे का इतिहास" --output chapter1-intro.mp3
  npx tsx scripts/generate-audio.ts sfx --prompt "Steam train whistle" --duration 3 --output train-whistle.mp3
  npx tsx scripts/generate-audio.ts music --prompt "Epic documentary, Indian classical" --output chapter1-bg.mp3
`);
    process.exit(0);
  }

  const type = args[0] as AudioType;

  if (!['tts', 'sfx', 'music'].includes(type)) {
    console.error(`Error: Unknown type "${type}". Use tts, sfx, or music.`);
    process.exit(1);
  }

  const textIndex = args.findIndex((a) => a === '--text' || a === '-t');
  const promptIndex = args.findIndex((a) => a === '--prompt' || a === '-p');
  const outputIndex = args.findIndex((a) => a === '--output' || a === '-o');
  const durationIndex = args.findIndex((a) => a === '--duration' || a === '-d');
  const voiceIndex = args.findIndex((a) => a === '--voice' || a === '-v');

  if (outputIndex === -1 || !args[outputIndex + 1]) {
    console.error('Error: --output is required');
    process.exit(1);
  }

  const output = args[outputIndex + 1];

  try {
    switch (type) {
      case 'tts': {
        if (textIndex === -1 || !args[textIndex + 1]) {
          console.error('Error: --text is required for TTS');
          process.exit(1);
        }
        const text = args[textIndex + 1];
        const voice = voiceIndex !== -1 ? args[voiceIndex + 1] : undefined;
        await generateTTS({ text, output, voice });
        break;
      }
      case 'sfx': {
        if (promptIndex === -1 || !args[promptIndex + 1]) {
          console.error('Error: --prompt is required for SFX');
          process.exit(1);
        }
        const prompt = args[promptIndex + 1];
        const duration = durationIndex !== -1 ? parseInt(args[durationIndex + 1], 10) : undefined;
        await generateSFX({ prompt, output, duration });
        break;
      }
      case 'music': {
        if (promptIndex === -1 || !args[promptIndex + 1]) {
          console.error('Error: --prompt is required for Music');
          process.exit(1);
        }
        const prompt = args[promptIndex + 1];
        const duration = durationIndex !== -1 ? parseInt(args[durationIndex + 1], 10) : undefined;
        await generateMusic({ prompt, output, duration });
        break;
      }
    }
  } catch (error) {
    console.error('Failed to generate audio');
    process.exit(1);
  }
}

// Only run main when executed directly
const isMainModule = import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`;
if (isMainModule) {
  main();
}

export { generateTTS, generateSFX, generateMusic };
