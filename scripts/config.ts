import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  // API Keys
  googleApiKey: process.env.GOOGLE_API_KEY || '',
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY || '',
  pexelsApiKey: process.env.PEXELS_API_KEY || '',

  // Output directories
  rootDir: path.resolve(__dirname, '..'),
  publicDir: path.resolve(__dirname, '..', 'public'),
  imagesDir: path.resolve(__dirname, '..', 'public', 'images'),
  audioDir: path.resolve(__dirname, '..', 'public', 'audio'),
  videoDir: path.resolve(__dirname, '..', 'public', 'video'),

  // Audio subdirectories
  narrationDir: path.resolve(__dirname, '..', 'public', 'audio', 'narration'),
  sfxDir: path.resolve(__dirname, '..', 'public', 'audio', 'sfx'),
  musicDir: path.resolve(__dirname, '..', 'public', 'audio', 'music'),

  // ElevenLabs voice IDs (Hindi voices)
  voices: {
    hindiMale: 'pFZP5JQG7iQjIQuC4Bku', // Raj - Hindi male voice
    hindiMaleAlt: 'TX3LPaxmHKxFdv7VOQHJ', // Liam - can work for Hindi
    hindiNarrator: 'N2lVS1w4EtoT3dr4eOWO', // Callum - deep narrator voice
  },

  // Model configurations
  models: {
    geminiImage: 'gemini-3-pro-image-preview',
    elevenLabsTTS: 'eleven_multilingual_v2',
  },

  // Default settings
  defaults: {
    imageWidth: 1920,
    imageHeight: 1080,
    videoDuration: 5,
    sfxDuration: 3,
    musicDuration: 30,
  },
};

export function validateConfig(): void {
  const missing: string[] = [];

  if (!config.googleApiKey) {
    missing.push('GOOGLE_API_KEY');
  }
  if (!config.elevenLabsApiKey) {
    missing.push('ELEVENLABS_API_KEY');
  }

  if (missing.length > 0) {
    console.error('Missing required environment variables:');
    missing.forEach((key) => console.error(`  - ${key}`));
    console.error('\nPlease create a .env file with these variables.');
    process.exit(1);
  }
}

export function ensureDir(dir: string): void {
  import('fs').then((fs) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}
