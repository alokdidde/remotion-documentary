#!/usr/bin/env npx tsx

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { config, validateConfig, ensureDir } from './config.js';

interface GenerateImageOptions {
  prompt: string;
  output: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
}

async function generateImage(options: GenerateImageOptions): Promise<string> {
  validateConfig();

  const { prompt, output, aspectRatio = '16:9' } = options;

  // Determine output path
  const outputPath = output.startsWith('public/')
    ? path.resolve(config.rootDir, output)
    : path.resolve(config.imagesDir, output);

  // Ensure output directory exists
  ensureDir(path.dirname(outputPath));

  console.log(`Generating image: "${prompt.substring(0, 50)}..."`);
  console.log(`Output: ${outputPath}`);

  const genAI = new GoogleGenAI({ apiKey: config.googleApiKey });

  try {
    const response = await genAI.models.generateContent({
      model: config.models.geminiImage,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Generate a cinematic, high-quality image for a documentary video.
Aspect ratio: ${aspectRatio} (${aspectRatio === '16:9' ? '1920x1080' : aspectRatio === '9:16' ? '1080x1920' : '1080x1080'})
Style: Documentary, historical, cinematic lighting, professional quality

Subject: ${prompt}`,
            },
          ],
        },
      ],
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });

    // Extract image data from response
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      throw new Error('No response parts received');
    }

    for (const part of parts) {
      if (part.inlineData?.data) {
        const imageData = part.inlineData.data;
        const mimeType = part.inlineData.mimeType || 'image/png';
        const extension = mimeType.split('/')[1] || 'png';

        // Ensure output has correct extension
        const finalPath = outputPath.endsWith(`.${extension}`)
          ? outputPath
          : `${outputPath.replace(/\.[^.]+$/, '')}.${extension}`;

        fs.writeFileSync(finalPath, Buffer.from(imageData, 'base64'));
        console.log(`Image saved to: ${finalPath}`);
        return finalPath;
      }
    }

    throw new Error('No image data in response');
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: npx tsx scripts/generate-image.ts --prompt "<description>" --output <path>

Options:
  --prompt, -p    Image description/prompt (required)
  --output, -o    Output file path relative to public/images/ (required)
  --aspect        Aspect ratio: 16:9, 9:16, or 1:1 (default: 16:9)
  --help, -h      Show this help message

Examples:
  npx tsx scripts/generate-image.ts --prompt "First train in India 1853" --output chapter1/first-train.png
  npx tsx scripts/generate-image.ts -p "Steam locomotive at station" -o chapter1/station.png --aspect 16:9
`);
    process.exit(0);
  }

  const promptIndex = args.findIndex((a) => a === '--prompt' || a === '-p');
  const outputIndex = args.findIndex((a) => a === '--output' || a === '-o');
  const aspectIndex = args.findIndex((a) => a === '--aspect');

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
  const aspectRatio = (
    aspectIndex !== -1 ? args[aspectIndex + 1] : '16:9'
  ) as GenerateImageOptions['aspectRatio'];

  try {
    await generateImage({ prompt, output, aspectRatio });
  } catch (error) {
    console.error('Failed to generate image');
    process.exit(1);
  }
}

// Only run main when executed directly
const isMainModule = import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`;
if (isMainModule) {
  main();
}

export { generateImage };
