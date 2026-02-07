---
name: generate-maps
description: Generate map images using Mapbox Static Images API
---

# Generate Maps

Generate dark-themed map images with markers and route lines via Mapbox Static Images API.

## Prerequisites

Add `MAPBOX_API_KEY` to your `.env` file.

## Usage

### Quick single map
```bash
npx tsx scripts/generate-maps.ts --center "78.96,20.59" --zoom 4 --output "india-map.png"
```

### With pin markers
```bash
npx tsx scripts/generate-maps.ts --center "78.96,20.59" --zoom 4 --pins "72.87,19.07,red,harbor;45.07,23.88,blue,fuel" --output "india-routes.png"
```

### With GeoJSON route overlay
```bash
npx tsx scripts/generate-maps.ts --center "20,25" --zoom 1.5 --geojson routes.geojson --output "world-routes.png"
```

### Batch from config file
```bash
npx tsx scripts/generate-maps.ts --config maps.json
```

## Options

| Flag | Short | Description | Default |
|------|-------|-------------|---------|
| `--center` | `-c` | Center coordinates "lon,lat" | |
| `--zoom` | `-z` | Zoom level (0-22) | 4 |
| `--width` | `-w` | Image width | 1280 |
| `--height` | | Image height | 720 |
| `--style` | | Mapbox style | dark-v11 |
| `--pins` | `-p` | Pin markers "lon,lat,color,label;..." | |
| `--geojson` | `-g` | GeoJSON file for route overlays | |
| `--output` | `-o` | Output filename | map.png |
| `--output-dir` | `-d` | Output directory | public/images/generated/ |
| `--config` | | JSON config file with map definitions | |

## Output

- PNG images at 2x resolution (2560x1440 from 1280x720)
- Saved to `public/images/generated/` by default

## Notes

- URL max length: 8192 characters (Mapbox limit)
- Available styles: dark-v11, light-v11, streets-v12, satellite-v9, outdoors-v12
