import fs from 'node:fs';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

const execFileAsync = promisify(execFile);
const CHROME_BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function usage() {
  console.error('Usage: npm run export:pdf -- <url> [--output /absolute/path/file.pdf]');
}

function parseArgs(argv) {
  const parsed = {
    url: null,
    output: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (!value.startsWith('--') && !parsed.url) {
      parsed.url = value;
      continue;
    }

    if (value.startsWith('--output=')) {
      parsed.output = value.slice('--output='.length);
      continue;
    }

    if (value === '--output') {
      parsed.output = argv[index + 1] || null;
      index += 1;
    }
  }

  return parsed;
}

function inferOutputPath(urlString) {
  const url = new URL(urlString);
  const slug = url.pathname.replace(/^\/+|\/+$/g, '') || 'proposal';
  return path.resolve(process.cwd(), `${slug}.pdf`);
}

async function main() {
  const {url, output} = parseArgs(process.argv.slice(2));

  if (!url) {
    usage();
    process.exit(1);
  }

  if (!fs.existsSync(CHROME_BIN)) {
    throw new Error('Google Chrome.app is not installed at /Applications.');
  }

  const outputPath = output ? path.resolve(output) : inferOutputPath(url);

  await execFileAsync(CHROME_BIN, [
    '--headless=new',
    '--disable-gpu',
    '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=12000',
    '--no-pdf-header-footer',
    `--print-to-pdf=${outputPath}`,
    url,
  ]);

  console.log(
    JSON.stringify(
      {
        url,
        outputPath,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

