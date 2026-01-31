#!/usr/bin/env npx tsx

import fs from 'fs';
import path from 'path';
import { config, validateConfig, ensureDir } from './config.js';

interface GenerateVideoOptions {
  prompt: string;
  output: string;
  duration?: number;
  sourceImage?: string;
}

async function generateVideo(options: GenerateVideoOptions): Promise<string> {
  validateConfig();

  const { prompt, output, duration = config.defaults.videoDuration, sourceImage } = options;

  // Determine output path
  const outputPath = output.startsWith('public/')
    ? path.resolve(config.rootDir, output)
    : path.resolve(config.videoDir, output);

  // Ensure output directory exists
  ensureDir(path.dirname(outputPath));

  console.log(`Generating video: "${prompt.substring(0, 50)}..."`);
  console.log(`Duration: ${duration}s`);
  console.log(`Output: ${outputPath}`);

  if (sourceImage) {
    console.log(`Source image: ${sourceImage}`);
  }

  // Google Veo API endpoint (via Vertex AI)
  // Note: Veo requires Vertex AI setup - this is a placeholder for the actual implementation
  const VERTEX_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
  const VERTEX_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

  if (!VERTEX_PROJECT) {
    console.warn('Warning: GOOGLE_CLOUD_PROJECT not set. Veo API requires Vertex AI.');
    console.warn('For now, creating a placeholder implementation.');
    console.warn('');
    console.warn('To enable Veo:');
    console.warn('1. Set up Google Cloud project with Vertex AI enabled');
    console.warn('2. Add GOOGLE_CLOUD_PROJECT to your .env file');
    console.warn('3. Authenticate with: gcloud auth application-default login');

    // Create placeholder video info file
    const infoPath = outputPath.replace(/\.[^.]+$/, '.pending.json');
    fs.writeFileSync(
      infoPath,
      JSON.stringify(
        {
          status: 'pending',
          prompt,
          duration,
          sourceImage: sourceImage || null,
          createdAt: new Date().toISOString(),
          note: 'Veo API requires Vertex AI setup',
        },
        null,
        2
      )
    );
    console.log(`Created pending video request: ${infoPath}`);
    return infoPath;
  }

  try {
    // Veo API implementation using Vertex AI
    const endpoint = `https://${VERTEX_LOCATION}-aiplatform.googleapis.com/v1/projects/${VERTEX_PROJECT}/locations/${VERTEX_LOCATION}/publishers/google/models/veo-001:generateVideo`;

    const requestBody: Record<string, unknown> = {
      instances: [
        {
          prompt: `Cinematic documentary footage for documentary video: ${prompt}`,
        },
      ],
      parameters: {
        sampleCount: 1,
        durationSeconds: duration,
        aspectRatio: '16:9',
      },
    };

    // If source image provided, add it as image-to-video input
    if (sourceImage) {
      const imagePath = path.resolve(config.imagesDir, sourceImage);
      if (fs.existsSync(imagePath)) {
        const imageData = fs.readFileSync(imagePath).toString('base64');
        requestBody.instances = [
          {
            prompt: `Animate this image with cinematic motion: ${prompt}`,
            image: {
              bytesBase64Encoded: imageData,
            },
          },
        ];
      }
    }

    // Get access token (requires gcloud auth)
    const { execSync } = await import('child_process');
    const accessToken = execSync('gcloud auth application-default print-access-token', {
      encoding: 'utf-8',
    }).trim();

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Veo API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    // Veo returns a long-running operation - poll for completion
    const operationName = result.name;
    console.log(`Video generation started: ${operationName}`);
    console.log('Polling for completion...');

    // Poll operation status
    let videoData: string | null = null;
    for (let i = 0; i < 60; i++) {
      await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds

      const statusResponse = await fetch(
        `https://${VERTEX_LOCATION}-aiplatform.googleapis.com/v1/${operationName}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const status = await statusResponse.json();

      if (status.done) {
        if (status.error) {
          throw new Error(`Video generation failed: ${status.error.message}`);
        }
        videoData = status.response?.generatedSamples?.[0]?.video?.bytesBase64Encoded;
        break;
      }

      console.log(`Still processing... (${i + 1}/60)`);
    }

    if (!videoData) {
      throw new Error('Video generation timed out');
    }

    // Save video
    const finalPath = outputPath.endsWith('.mp4') ? outputPath : `${outputPath}.mp4`;
    fs.writeFileSync(finalPath, Buffer.from(videoData, 'base64'));
    console.log(`Video saved to: ${finalPath}`);
    return finalPath;
  } catch (error) {
    console.error('Error generating video:', error);
    throw error;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: npx tsx scripts/generate-video.ts --prompt "<description>" --output <path>

Options:
  --prompt, -p      Video description/prompt (required)
  --output, -o      Output file path relative to public/video/ (required)
  --duration, -d    Duration in seconds (default: 5)
  --source-image    Source image for image-to-video generation
  --help, -h        Show this help message

Examples:
  npx tsx scripts/generate-video.ts --prompt "Train departing station" --output chapter1/departure.mp4
  npx tsx scripts/generate-video.ts -p "Steam locomotive" -o train.mp4 --duration 8
  npx tsx scripts/generate-video.ts -p "Animate train" -o animated.mp4 --source-image chapter1/train.png

Note: Requires Vertex AI setup with GOOGLE_CLOUD_PROJECT environment variable.
`);
    process.exit(0);
  }

  const promptIndex = args.findIndex((a) => a === '--prompt' || a === '-p');
  const outputIndex = args.findIndex((a) => a === '--output' || a === '-o');
  const durationIndex = args.findIndex((a) => a === '--duration' || a === '-d');
  const sourceImageIndex = args.findIndex((a) => a === '--source-image');

  if (promptIndex === -1 || !args[promptIndex + 1]) {
    console.error('Error: --prompt is required');
    process.exit(1);
  }

  if (outputIndex === -1 || !args[outputIndex + 1]) {
    console.error('Error: --output is required');
    process.exit(1);
  }

  const prompt = args[promptIndex + 1];
  const output = args[outputIndex + 1];
  const duration = durationIndex !== -1 ? parseInt(args[durationIndex + 1], 10) : undefined;
  const sourceImage = sourceImageIndex !== -1 ? args[sourceImageIndex + 1] : undefined;

  try {
    await generateVideo({ prompt, output, duration, sourceImage });
  } catch (error) {
    console.error('Failed to generate video');
    process.exit(1);
  }
}

// Only run main when executed directly
const isMainModule = import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`;
if (isMainModule) {
  main();
}

export { generateVideo };
