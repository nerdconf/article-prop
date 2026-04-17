import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_ORIGIN = 'https://proposal.nerdconf.com';

async function loadEnvFile(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');

    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
        continue;
      }

      const [key, ...rest] = trimmed.split('=');
      if (!key || process.env[key] !== undefined) {
        continue;
      }

      const joinedValue = rest.join('=').trim();
      process.env[key] = joinedValue.replace(/^['"]|['"]$/g, '');
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return;
    }
    throw error;
  }
}

function parseArgs(argv) {
  const args = {
    file: null,
    title: null,
    slug: null,
    cover: null,
    origin: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (!value.startsWith('--') && !args.file) {
      args.file = value;
      continue;
    }

    if (value.startsWith('--title=')) {
      args.title = value.slice('--title='.length);
      continue;
    }

    if (value === '--title') {
      args.title = argv[index + 1] || null;
      index += 1;
      continue;
    }

    if (value.startsWith('--slug=')) {
      args.slug = value.slice('--slug='.length);
      continue;
    }

    if (value === '--slug') {
      args.slug = argv[index + 1] || null;
      index += 1;
      continue;
    }

    if (value.startsWith('--cover=')) {
      args.cover = value.slice('--cover='.length);
      continue;
    }

    if (value === '--cover') {
      args.cover = argv[index + 1] || null;
      index += 1;
      continue;
    }

    if (value.startsWith('--origin=')) {
      args.origin = value.slice('--origin='.length);
      continue;
    }

    if (value === '--origin') {
      args.origin = argv[index + 1] || args.origin;
      index += 1;
      continue;
    }
  }

  return args;
}

function usage() {
  console.error('Usage: npm run publish:md -- <file.md> [--title "Tab Title"] [--slug slug] [--cover path-or-url] [--origin https://proposal.nerdconf.com]');
}

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function inferTitle(markdownContent, filePath) {
  const headingMatch = markdownContent.match(/^#\s+(.+)$/m);
  if (headingMatch?.[1]?.trim()) {
    return headingMatch[1].trim();
  }

  const baseName = path.basename(filePath, path.extname(filePath));
  return baseName
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferMimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    case '.avif':
      return 'image/avif';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

async function readCoverImage(coverArg) {
  if (!coverArg) {
    return null;
  }

  if (/^(https?:)?\/\//i.test(coverArg) || coverArg.startsWith('data:')) {
    return coverArg;
  }

  const fileBuffer = await fs.readFile(coverArg);
  const mimeType = inferMimeType(coverArg);
  return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
}

async function main() {
  await loadEnvFile(path.resolve('.env.local'));
  await loadEnvFile(path.resolve('.env'));

  const args = parseArgs(process.argv.slice(2));
  const token = process.env.PUBLISH_API_TOKEN;
  const defaultOrigin = process.env.PUBLISH_API_BASE_URL || DEFAULT_ORIGIN;
  if (!args.origin) {
    args.origin = defaultOrigin;
  }

  if (!args.file) {
    usage();
    process.exit(1);
  }

  if (!token) {
    console.error('PUBLISH_API_TOKEN is required in the environment.');
    process.exit(1);
  }

  const markdownContent = await fs.readFile(args.file, 'utf8');
  const title = (args.title || inferTitle(markdownContent, args.file)).trim();
  const slug = slugify(args.slug || title);
  const coverImage = await readCoverImage(args.cover);

  const response = await fetch(new URL('/api/publish-bot', args.origin), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title,
      slug,
      markdownContent,
      coverImage,
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.error || `Publish failed with status ${response.status}.`;
    throw new Error(message);
  }

  console.log(JSON.stringify(payload, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
