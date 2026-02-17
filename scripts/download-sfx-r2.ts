/**
 * Download missing SFX MP3s from Cloudflare R2.
 * Reads metadata.json files to know what should exist locally.
 *
 * Usage:
 *   npx tsx scripts/download-sfx-r2.ts              # download all missing
 *   npx tsx scripts/download-sfx-r2.ts --name whoosh # one folder only
 *   npx tsx scripts/download-sfx-r2.ts --force       # re-download all
 *
 * Runs automatically as postinstall hook.
 */
import fs from 'fs';
import path from 'path';
import { config } from './config.js';

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const force = args.includes('--force');
const nameIdx = args.indexOf('--name');
const nameFilter = nameIdx !== -1 ? args[nameIdx + 1] : undefined;

// ---------------------------------------------------------------------------
// Determine download method
// ---------------------------------------------------------------------------
const { accountId, accessKeyId, secretAccessKey, bucket, publicUrl } =
  config.r2;

type DownloadMethod = 'public' | 's3' | 'none';

function getMethod(): DownloadMethod {
  if (publicUrl) return 'public';
  if (accountId && accessKeyId && secretAccessKey) return 's3';
  return 'none';
}

const method = getMethod();

// ---------------------------------------------------------------------------
// Lazy-load S3 client only when needed
// ---------------------------------------------------------------------------
async function getS3() {
  const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3');
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return { client, GetObjectCommand };
}

// ---------------------------------------------------------------------------
// Collect missing files from metadata.json
// ---------------------------------------------------------------------------
interface DownloadJob {
  localPath: string;
  key: string;
}

const sfxRoot = config.sfxDir;

function collectJobs(): DownloadJob[] {
  if (!fs.existsSync(sfxRoot)) return [];

  const folders = fs
    .readdirSync(sfxRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .filter((d) => !nameFilter || d.name === nameFilter);

  const jobs: DownloadJob[] = [];

  for (const folder of folders) {
    const metaPath = path.join(sfxRoot, folder.name, 'metadata.json');
    if (!fs.existsSync(metaPath)) continue;

    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    const files: { file: string }[] = meta.files || [];

    for (const entry of files) {
      const localPath = path.join(sfxRoot, folder.name, entry.file);
      const key = `${folder.name}/${entry.file}`;

      if (!force && fs.existsSync(localPath)) continue;

      jobs.push({ localPath, key });
    }
  }

  return jobs;
}

const jobs = collectJobs();

if (jobs.length === 0) {
  console.log('SFX: all MP3s present, nothing to download.');
  process.exit(0);
}

if (method === 'none') {
  console.warn(
    `SFX: ${jobs.length} MP3(s) missing but no R2 credentials or public URL configured. ` +
      'Set CLOUDFLARE_R2_PUBLIC_URL or R2 access keys in .env to enable downloads.',
  );
  process.exit(0);
}

console.log(
  `SFX: downloading ${jobs.length} missing MP3(s) via ${method === 'public' ? 'public URL' : 'S3 API'}...`,
);

// ---------------------------------------------------------------------------
// Download (parallel with concurrency limit)
// ---------------------------------------------------------------------------
const CONCURRENCY = 20;
let downloaded = 0;
let errors = 0;

async function downloadPublic(job: DownloadJob): Promise<void> {
  const url = `${publicUrl.replace(/\/$/, '')}/${job.key}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(job.localPath), { recursive: true });
  fs.writeFileSync(job.localPath, buffer);
}

async function downloadS3(
  job: DownloadJob,
  s3Client: Awaited<ReturnType<typeof getS3>>,
): Promise<void> {
  const cmd = new s3Client.GetObjectCommand({
    Bucket: bucket,
    Key: job.key,
  });
  const res = await s3Client.client.send(cmd);
  const chunks: Buffer[] = [];
  const stream = res.Body as NodeJS.ReadableStream;
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  fs.mkdirSync(path.dirname(job.localPath), { recursive: true });
  fs.writeFileSync(job.localPath, Buffer.concat(chunks));
}

async function processJob(
  job: DownloadJob,
  index: number,
  s3Client: Awaited<ReturnType<typeof getS3>> | null,
): Promise<void> {
  try {
    if (method === 'public') {
      await downloadPublic(job);
    } else {
      await downloadS3(job, s3Client!);
    }
    downloaded++;
    if (downloaded % 50 === 0 || downloaded === jobs.length) {
      console.log(`  [${downloaded}/${jobs.length}] ${path.basename(job.key)}`);
    }
  } catch (err) {
    errors++;
    console.error(`  FAILED [${index + 1}/${jobs.length}] ${path.basename(job.key)}: ${err}`);
  }
}

async function run() {
  const s3Client = method === 's3' ? await getS3() : null;

  // Process jobs in batches of CONCURRENCY
  for (let i = 0; i < jobs.length; i += CONCURRENCY) {
    const batch = jobs.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map((job, j) => processJob(job, i + j, s3Client)),
    );
  }

  console.log(`SFX: done. Downloaded: ${downloaded}, Errors: ${errors}`);
  if (errors > 0) process.exit(1);
}

run();
