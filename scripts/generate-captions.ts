#!/usr/bin/env npx tsx

/**
 * Generate word-level captions using ElevenLabs Speech-to-Text (Scribe v2) API
 *
 * Usage:
 *   # Single file:
 *   npx tsx scripts/generate-captions.ts --input audio.mp3 --output captions.json
 *
 *   # Directory (transcribes all .mp3 files):
 *   npx tsx scripts/generate-captions.ts --input public/audio/narration/ --output public/captions.json
 *
 *   # Defaults (all narration files → public/captions.json):
 *   npx tsx scripts/generate-captions.ts
 */

import fs from "fs";
import path from "path";
import { config, validateConfig } from "./config.js";

interface Word {
  text: string;
  start: number;
  end: number;
}

interface SegmentCaptions {
  id: string;
  words: Word[];
}

function parseArgs() {
  const args = process.argv.slice(2);
  let input: string | undefined;
  let output: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if ((args[i] === "--input" || args[i] === "-i") && args[i + 1]) {
      input = args[++i];
    } else if ((args[i] === "--output" || args[i] === "-o") && args[i + 1]) {
      output = args[++i];
    } else if (args[i] === "--help" || args[i] === "-h") {
      console.log(`Usage: npx tsx scripts/generate-captions.ts [options]

Options:
  -i, --input   Input audio file or directory of .mp3 files
  -o, --output  Output JSON file path
  -h, --help    Show this help

Defaults:
  --input  public/audio/narration/
  --output public/captions.json`);
      process.exit(0);
    }
  }

  return {
    input: input ? path.resolve(input) : path.resolve(config.narrationDir),
    output: output ? path.resolve(output) : path.resolve(config.publicDir, "captions.json"),
  };
}

async function transcribeFile(filePath: string): Promise<Word[]> {
  const formData = new FormData();
  formData.append("model_id", "scribe_v2");
  formData.append("timestamps_granularity", "word");
  formData.append("file", new Blob([fs.readFileSync(filePath)]), path.basename(filePath));

  const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: {
      "xi-api-key": config.elevenLabsApiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs STT error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return (data.words || [])
    .filter((w: any) => w.type === "word")
    .map((w: any) => ({
      text: w.text,
      start: w.start,
      end: w.end,
    }));
}

async function main() {
  validateConfig();

  const { input, output } = parseArgs();

  const stat = fs.statSync(input);
  const files: { id: string; filePath: string }[] = [];

  if (stat.isDirectory()) {
    const entries = fs.readdirSync(input).filter((f) => f.endsWith(".mp3")).sort();
    for (const f of entries) {
      files.push({ id: f.replace(".mp3", ""), filePath: path.join(input, f) });
    }
    console.log(`Found ${files.length} audio files in ${input}\n`);
  } else {
    files.push({ id: path.basename(input).replace(/\.[^.]+$/, ""), filePath: input });
    console.log(`Transcribing single file: ${input}\n`);
  }

  const allCaptions: SegmentCaptions[] = [];

  for (const { id, filePath } of files) {
    console.log(`Transcribing: ${id}...`);
    try {
      const words = await transcribeFile(filePath);
      allCaptions.push({ id, words });
      console.log(`  → ${words.length} words`);
    } catch (err) {
      console.error(`  ✗ Failed: ${err}`);
      allCaptions.push({ id, words: [] });
    }
  }

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(allCaptions, null, 2));
  console.log(`\nCaptions saved to: ${output}`);
}

main();
