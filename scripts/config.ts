import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  // API Keys
  googleApiKey: process.env.GOOGLE_API_KEY || '',
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY || '',
  pexelsApiKey: process.env.PEXELS_API_KEY || '',
  pixabayApiKey: process.env.PIXABAY_API_KEY || '',
  freesoundApiKey: process.env.FREESOUND_API_KEY || '',
  freesoundClientId: process.env.FREESOUND_CLIENT_ID || '',
  googleCseId: process.env.GOOGLE_CSE_ID || '',
  mapboxApiKey: process.env.MAPBOX_API_KEY || '',

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

  // Pipeline directories
  assetsDir: path.resolve(__dirname, '..', 'assets'),
  actsDir: path.resolve(__dirname, '..', 'acts'),
  compiledDir: path.resolve(__dirname, '..', 'compiled'),

  // ElevenLabs voice ID
  voiceId: 'jmz2hUrAWEIhZkD3LXpt',

  // Model configurations
  models: {
    geminiImage: 'gemini-3-pro-image-preview',
    elevenLabsTTS: 'eleven_v3',
  },

  // Cloudflare R2 (S3-compatible storage for SFX library)
  r2: {
    accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID || '',
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
    bucket: process.env.CLOUDFLARE_R2_BUCKET || 'sfx',
    publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL || '',
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
