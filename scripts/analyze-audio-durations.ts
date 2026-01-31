#!/usr/bin/env npx tsx

/**
 * Analyze audio file durations and compare with video frame durations
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { narrationScript } from './narration-script.js';

const AUDIO_DIR = path.resolve(__dirname, '..', 'public', 'audio', 'narration');
const FPS = 30; // Video frames per second

interface AudioAnalysis {
  id: string;
  chapter: number;
  scene: string;
  audioFile: string;
  audioDurationSec: number;
  audioDurationFrames: number;
  currentFrames: number;
  difference: number;
  needsUpdate: boolean;
}

function getAudioDuration(filePath: string): number {
  try {
    // Use ffprobe to get duration
    const result = execSync(
      `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${filePath}"`,
      { encoding: 'utf-8' }
    );
    return parseFloat(result.trim());
  } catch (error) {
    // Fallback: estimate from file size (rough estimate for MP3 at ~128kbps)
    const stats = fs.statSync(filePath);
    const fileSizeKB = stats.size / 1024;
    // Rough estimate: 128kbps = 16KB per second
    return fileSizeKB / 16;
  }
}

function analyzeAll(): AudioAnalysis[] {
  const results: AudioAnalysis[] = [];

  for (const entry of narrationScript) {
    const audioFile = path.join(AUDIO_DIR, `${entry.id}.mp3`);

    if (!fs.existsSync(audioFile)) {
      console.warn(`Audio file not found: ${audioFile}`);
      continue;
    }

    const audioDurationSec = getAudioDuration(audioFile);
    const audioDurationFrames = Math.ceil(audioDurationSec * FPS);
    const difference = audioDurationFrames - entry.durationFrames;

    results.push({
      id: entry.id,
      chapter: entry.chapter,
      scene: entry.scene,
      audioFile: path.basename(audioFile),
      audioDurationSec: Math.round(audioDurationSec * 100) / 100,
      audioDurationFrames,
      currentFrames: entry.durationFrames,
      difference,
      needsUpdate: difference > 0, // Audio is longer than video
    });
  }

  return results;
}

function generateReport(results: AudioAnalysis[]): void {
  console.log('\n========================================');
  console.log('Audio Duration Analysis Report');
  console.log('========================================\n');

  const needsUpdate = results.filter(r => r.needsUpdate);
  const okCount = results.length - needsUpdate.length;

  console.log(`Total entries: ${results.length}`);
  console.log(`OK (audio fits): ${okCount}`);
  console.log(`Needs update (audio longer): ${needsUpdate.length}\n`);

  // Group by chapter
  for (let ch = 1; ch <= 7; ch++) {
    const chapterResults = results.filter(r => r.chapter === ch);
    console.log(`\n--- Chapter ${ch} ---`);

    for (const r of chapterResults) {
      const status = r.needsUpdate ? '❌ NEEDS UPDATE' : '✓ OK';
      const diffStr = r.difference > 0 ? `+${r.difference}` : `${r.difference}`;
      console.log(
        `  ${r.id.padEnd(25)} | Audio: ${r.audioDurationSec.toFixed(1)}s (${r.audioDurationFrames} frames) | Current: ${r.currentFrames} frames | Diff: ${diffStr.padStart(4)} | ${status}`
      );
    }
  }

  // Generate update recommendations
  if (needsUpdate.length > 0) {
    console.log('\n\n========================================');
    console.log('Required Updates');
    console.log('========================================\n');

    for (const r of needsUpdate) {
      console.log(`${r.id}: Change durationInFrames from ${r.currentFrames} to ${r.audioDurationFrames} (+${r.difference} frames, +${(r.difference / FPS).toFixed(1)}s)`);
    }
  }

  // Export as JSON for automated updates
  const updateData = results.map(r => ({
    id: r.id,
    chapter: r.chapter,
    scene: r.scene,
    recommendedFrames: r.audioDurationFrames,
    currentFrames: r.currentFrames,
    audioDurationSec: r.audioDurationSec,
    needsUpdate: r.needsUpdate,
  }));

  const outputPath = path.join(AUDIO_DIR, 'duration-analysis.json');
  fs.writeFileSync(outputPath, JSON.stringify(updateData, null, 2));
  console.log(`\nAnalysis saved to: ${outputPath}`);
}

// Run analysis
const results = analyzeAll();
generateReport(results);
