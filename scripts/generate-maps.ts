#!/usr/bin/env npx tsx

/**
 * Mapbox Static Map Generator
 * Generates map images using Mapbox Static Images API
 *
 * Usage:
 *   npx tsx scripts/generate-maps.ts --config maps.json
 *   npx tsx scripts/generate-maps.ts --center "78.96,20.59" --zoom 4 --output "india-map.png"
 *   npx tsx scripts/generate-maps.ts --center "78.96,20.59" --zoom 4 --pins "72.87,19.07,red,harbor;45.07,23.88,blue,fuel" --output "india-routes.png"
 */

import fs from 'fs';
import path from 'path';
import { config, ensureDir } from './config.js';
import 'dotenv/config';

// ── GeoJSON Helpers ────────────────────────────────────────────
interface Coord {
  lon: number;
  lat: number;
}

export function makeLineFeature(
  points: Coord[],
  color: string,
  strokeWidth: number = 2,
): object {
  return {
    type: 'Feature',
    properties: {
      stroke: color,
      'stroke-width': strokeWidth,
      'stroke-opacity': 0.85,
    },
    geometry: {
      type: 'LineString',
      coordinates: points.map((p) => [p.lon, p.lat]),
    },
  };
}

export function makeFeatureCollection(features: object[]): object {
  return { type: 'FeatureCollection', features };
}

// ── Pin marker string for Mapbox Static API ────────────────────
function pin(coord: Coord, color: string, label: string): string {
  const cleanColor = color.replace('#', '');
  return `pin-s-${label}+${cleanColor}(${coord.lon},${coord.lat})`;
}

// ── Map Definition ────────────────────────────────────────────
interface MapDefinition {
  filename: string;
  description: string;
  center: { lon: number; lat: number };
  zoom: number;
  width: number;
  height: number;
  style?: string;
  bearing?: number;
  pitch?: number;
  pins: string[];
  geojson: object | null;
}

// ── URL Builder ────────────────────────────────────────────────
function buildMapboxUrl(map: MapDefinition, apiKey: string): string {
  const style = `mapbox/${map.style || 'dark-v11'}`;
  const position = `${map.center.lon},${map.center.lat},${map.zoom}`;
  const size = `${map.width}x${map.height}@2x`;

  // Build overlay parts
  const overlayParts: string[] = [];

  // Add GeoJSON overlay (URL-encoded)
  if (map.geojson) {
    const geojsonStr = JSON.stringify(map.geojson);
    overlayParts.push(`geojson(${encodeURIComponent(geojsonStr)})`);
  }

  // Add pin markers
  overlayParts.push(...map.pins);

  const overlays = overlayParts.join(',');
  const url = `https://api.mapbox.com/styles/v1/${style}/static/${overlays}/${position}/${size}?access_token=${apiKey}&logo=false&attribution=false`;

  return url;
}

// ── Download a single map ─────────────────────────────────────
async function downloadMap(map: MapDefinition, apiKey: string, outputDir: string): Promise<void> {
  const url = buildMapboxUrl(map, apiKey);

  // Check URL length (Mapbox limit: 8192 chars)
  if (url.length > 8192) {
    console.warn(`Warning: URL for ${map.filename} is ${url.length} chars (max 8192). May fail.`);
  }

  console.log(`Downloading: ${map.filename}`);
  if (map.description) {
    console.log(`  Description: ${map.description}`);
  }
  console.log(`  URL length: ${url.length} chars`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const outputPath = path.join(outputDir, map.filename);
    fs.writeFileSync(outputPath, buffer);

    const sizeKB = Math.round(buffer.length / 1024);
    console.log(`  Saved: ${outputPath} (${sizeKB} KB)\n`);

    if (sizeKB < 100) {
      console.warn(`  Warning: File seems small (${sizeKB} KB) — may not be a real map image`);
    }
  } catch (error) {
    console.error(`  Error downloading ${map.filename}:`, error);
  }
}

// ── Parse CLI pins string ─────────────────────────────────────
// Format: "lon,lat,color,label;lon,lat,color,label;..."
function parsePins(pinsStr: string): string[] {
  return pinsStr.split(';').filter(Boolean).map((entry) => {
    const [lon, lat, color, label] = entry.split(',').map((s) => s.trim());
    return pin({ lon: parseFloat(lon), lat: parseFloat(lat) }, color, label);
  });
}

// ── CLI argument parser ───────────────────────────────────────
function getArg(args: string[], flags: string[]): string | undefined {
  for (const flag of flags) {
    const idx = args.indexOf(flag);
    if (idx !== -1 && args[idx + 1]) {
      return args[idx + 1];
    }
  }
  return undefined;
}

function hasFlag(args: string[], flags: string[]): boolean {
  return flags.some((f) => args.includes(f));
}

// ── Main ───────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || hasFlag(args, ['--help', '-h'])) {
    console.log(`
Mapbox Static Map Generator
Generate map images using Mapbox Static Images API.

Usage:
  npx tsx scripts/generate-maps.ts --config maps.json
  npx tsx scripts/generate-maps.ts --center "lon,lat" [options]

Modes:
  Config file mode:
    --config <file>       JSON file with array of map definitions

  CLI mode:
    --center, -c          Center coordinates "lon,lat" (required)
    --zoom, -z            Zoom level 0-22 (default: 4)
    --width, -w           Image width (default: 1280)
    --height              Image height (default: 720)
    --style               Mapbox style (default: dark-v11)
    --pins, -p            Pin markers "lon,lat,color,label;..."
    --geojson, -g         GeoJSON file for route overlays
    --output, -o          Output filename (default: map.png)
    --output-dir, -d      Output directory (default: public/images/generated/)

Examples:
  npx tsx scripts/generate-maps.ts --center "78.96,20.59" --zoom 4 --output "india-map.png"
  npx tsx scripts/generate-maps.ts -c "78.96,20.59" -z 4 -p "72.87,19.07,red,harbor;45.07,23.88,blue,fuel" -o "routes.png"
  npx tsx scripts/generate-maps.ts --config maps.json

Available styles: dark-v11, light-v11, streets-v12, satellite-v9, outdoors-v12
`);
    process.exit(0);
  }

  const apiKey = config.mapboxApiKey;
  if (!apiKey) {
    console.error('Error: MAPBOX_API_KEY not set in .env');
    process.exit(1);
  }

  const outputDirArg = getArg(args, ['--output-dir', '-d']);
  const outputDir = outputDirArg
    ? path.resolve(outputDirArg)
    : path.resolve(config.imagesDir, 'generated');
  ensureDir(outputDir);
  // Small delay for ensureDir (async)
  await new Promise((r) => setTimeout(r, 200));

  const configFile = getArg(args, ['--config']);

  if (configFile) {
    // ── Config file mode ──────────────────────────────────────
    const configPath = path.resolve(configFile);
    if (!fs.existsSync(configPath)) {
      console.error(`Error: Config file not found: ${configPath}`);
      process.exit(1);
    }

    const maps: MapDefinition[] = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    console.log(`Generating ${maps.length} maps from ${configFile}...\n`);

    for (const map of maps) {
      // Apply defaults for missing fields
      map.width = map.width || 1280;
      map.height = map.height || 720;
      map.style = map.style || 'dark-v11';
      map.pins = map.pins || [];
      map.geojson = map.geojson || null;

      await downloadMap(map, apiKey, outputDir);
    }
  } else {
    // ── CLI mode ──────────────────────────────────────────────
    const centerStr = getArg(args, ['--center', '-c']);
    if (!centerStr) {
      console.error('Error: --center "lon,lat" is required in CLI mode');
      process.exit(1);
    }

    const [lon, lat] = centerStr.split(',').map((s) => parseFloat(s.trim()));
    if (isNaN(lon) || isNaN(lat)) {
      console.error('Error: Invalid center coordinates. Use format: "lon,lat"');
      process.exit(1);
    }

    const zoom = parseFloat(getArg(args, ['--zoom', '-z']) || '4');
    const width = parseInt(getArg(args, ['--width', '-w']) || '1280', 10);
    const height = parseInt(getArg(args, ['--height']) || '720', 10);
    const style = getArg(args, ['--style']) || 'dark-v11';
    const output = getArg(args, ['--output', '-o']) || 'map.png';
    const pinsStr = getArg(args, ['--pins', '-p']);
    const geojsonFile = getArg(args, ['--geojson', '-g']);

    // Parse pins
    const pins = pinsStr ? parsePins(pinsStr) : [];

    // Load GeoJSON if provided
    let geojson: object | null = null;
    if (geojsonFile) {
      const geojsonPath = path.resolve(geojsonFile);
      if (!fs.existsSync(geojsonPath)) {
        console.error(`Error: GeoJSON file not found: ${geojsonPath}`);
        process.exit(1);
      }
      geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf-8'));
    }

    const filename = output.endsWith('.png') ? output : `${output}.png`;

    const map: MapDefinition = {
      filename,
      description: '',
      center: { lon, lat },
      zoom,
      width,
      height,
      style,
      pins,
      geojson,
    };

    console.log('Generating Mapbox map...\n');
    await downloadMap(map, apiKey, outputDir);
  }

  console.log('Done!');
}

main().catch(console.error);
