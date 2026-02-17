/**
 * Upload SFX MP3s from public/audio/sfx/ to Cloudflare R2.
 *
 * Usage:
 *   npx tsx scripts/upload-sfx-r2.ts              # upload all
 *   npx tsx scripts/upload-sfx-r2.ts --name whoosh # upload one folder
 *   npx tsx scripts/upload-sfx-r2.ts --dry-run     # preview only
 *   npx tsx scripts/upload-sfx-r2.ts --force       # re-upload even if exists
 */
import fs from 'fs';
import path from 'path';
import {
  S3Client,
  HeadObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { config } from './config.js';

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const nameIdx = args.indexOf('--name');
const nameFilter = nameIdx !== -1 ? args[nameIdx + 1] : undefined;

// ---------------------------------------------------------------------------
// Validate credentials
// ---------------------------------------------------------------------------
const { accountId, accessKeyId, secretAccessKey, bucket } = config.r2;
if (!accountId || !accessKeyId || !secretAccessKey) {
  console.error(
    'Missing R2 credentials. Set CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, and CLOUDFLARE_R2_SECRET_ACCESS_KEY in .env',
  );
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

// ---------------------------------------------------------------------------
// Collect MP3 files
// ---------------------------------------------------------------------------
const sfxRoot = config.sfxDir;
const folders = fs
  .readdirSync(sfxRoot, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .filter((d) => !nameFilter || d.name === nameFilter)
  .map((d) => d.name);

if (nameFilter && folders.length === 0) {
  console.error(`No SFX folder found matching --name "${nameFilter}"`);
  process.exit(1);
}

interface FileJob {
  localPath: string;
  key: string;
}

const jobs: FileJob[] = [];
for (const folder of folders) {
  const dir = path.join(sfxRoot, folder);
  const mp3s = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mp3'));
  for (const mp3 of mp3s) {
    jobs.push({
      localPath: path.join(dir, mp3),
      key: `${folder}/${mp3}`,
    });
  }
}

console.log(
  `Found ${jobs.length} MP3s in ${folders.length} folder(s)${dryRun ? ' (dry run)' : ''}`,
);

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------
let uploaded = 0;
let skipped = 0;
let errors = 0;

async function exists(key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function run() {
  for (let i = 0; i < jobs.length; i++) {
    const { localPath, key } = jobs[i];
    const label = `[${i + 1}/${jobs.length}] ${key}`;

    if (!force) {
      const alreadyExists = await exists(key);
      if (alreadyExists) {
        skipped++;
        continue;
      }
    }

    if (dryRun) {
      console.log(`  would upload ${label}`);
      uploaded++;
      continue;
    }

    try {
      const body = fs.readFileSync(localPath);
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: 'audio/mpeg',
        }),
      );
      uploaded++;
      console.log(`  uploaded ${label}`);
    } catch (err) {
      errors++;
      console.error(`  FAILED  ${label}: ${err}`);
    }
  }

  console.log(
    `\nDone. Uploaded: ${uploaded}, Skipped: ${skipped}, Errors: ${errors}`,
  );
  if (errors > 0) process.exit(1);
}

run();
