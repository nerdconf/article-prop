import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [, , targetArg, ...restArgs] = process.argv;

if (!targetArg) {
  console.error('Usage: npm run bench:public -- <url> [--samples=N] [--save=label]');
  process.exit(1);
}

const samplesArg = restArgs.find((arg) => arg.startsWith('--samples='));
const saveArg = restArgs.find((arg) => arg.startsWith('--save='));
const sampleCount = Number.parseInt(samplesArg?.split('=')[1] || '5', 10);
const saveLabel = saveArg?.split('=')[1];

if (!Number.isFinite(sampleCount) || sampleCount < 1) {
  console.error('Invalid --samples value.');
  process.exit(1);
}

function runCurl(url) {
  const output = execFileSync(
    'curl',
    [
      '-sS',
      '-o',
      '/dev/null',
      '-w',
      '%{time_starttransfer} %{time_total} %{size_download} %{http_code} %{content_type}',
      url,
    ],
    {encoding: 'utf8'}
  ).trim();

  const [timeStartTransfer, timeTotal, sizeDownload, statusCode, ...contentTypeParts] = output.split(' ');

  return {
    url,
    timeStartTransferMs: Number.parseFloat(timeStartTransfer) * 1000,
    timeTotalMs: Number.parseFloat(timeTotal) * 1000,
    sizeDownloadBytes: Number.parseInt(sizeDownload, 10),
    statusCode: Number.parseInt(statusCode, 10),
    contentType: contentTypeParts.join(' '),
  };
}

function summarize(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((acc, value) => acc + value, 0);
  const p50 = sorted[Math.floor((sorted.length - 1) * 0.5)];

  return {
    min: sorted[0],
    avg: sum / values.length,
    p50,
    max: sorted[sorted.length - 1],
  };
}

const runs = [];

for (let index = 0; index < sampleCount; index += 1) {
  runs.push(runCurl(targetArg));
}

const timeStartTransferStats = summarize(runs.map((run) => run.timeStartTransferMs));
const timeTotalStats = summarize(runs.map((run) => run.timeTotalMs));
const sizeStats = summarize(runs.map((run) => run.sizeDownloadBytes));

const report = {
  target: targetArg,
  samples: sampleCount,
  generatedAt: new Date().toISOString(),
  statusCodes: [...new Set(runs.map((run) => run.statusCode))],
  contentTypes: [...new Set(runs.map((run) => run.contentType))],
  timeStartTransferMs: timeStartTransferStats,
  timeTotalMs: timeTotalStats,
  sizeDownloadBytes: sizeStats,
  runs,
};

console.log(JSON.stringify(report, null, 2));

if (saveLabel) {
  const outputDir = path.resolve('perf-results');
  fs.mkdirSync(outputDir, {recursive: true});
  const outputPath = path.join(
    outputDir,
    `${saveLabel}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  );
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.error(`Saved benchmark to ${outputPath}`);
}
