#!/usr/bin/env node
// Wraps an npm script, compacts its output, and forwards the exit code.
// Usage: node scripts/compact-output.js <npm-script-name>
// Strips npm noise lines, truncates deep stack traces, and compresses identical adjacent lines.
import { spawn } from 'node:child_process';

const ANSI_RE = /\x1B\[[0-9;]*[mGKHF]/g;
const NPM_NOISE_RE = /^npm (warn|WARN|notice|timing)\b/i;
const STACK_FRAME_RE = /^\s+at /;
const MAX_STACK_FRAMES = 5;

function stripAnsi(line) {
  return line.replace(ANSI_RE, '');
}

function compact(lines) {
  const filtered = lines.map(stripAnsi).filter(l => !NPM_NOISE_RE.test(l));

  const stackCompacted = [];
  let frameCount = 0;
  let skipped = 0;

  for (const line of filtered) {
    if (STACK_FRAME_RE.test(line)) {
      frameCount++;
      if (frameCount <= MAX_STACK_FRAMES) {
        stackCompacted.push(line);
      } else {
        skipped++;
      }
    } else {
      if (skipped > 0) {
        stackCompacted.push(`    ... (${skipped} more frame${skipped > 1 ? 's' : ''})`);
        skipped = 0;
      }
      frameCount = 0;
      stackCompacted.push(line);
    }
  }
  if (skipped > 0) {
    stackCompacted.push(`    ... (${skipped} more frame${skipped > 1 ? 's' : ''})`);
  }

  const result = [];
  let i = 0;
  while (i < stackCompacted.length) {
    const line = stackCompacted[i];
    let run = 1;
    while (i + run < stackCompacted.length && stackCompacted[i + run] === line) run++;
    result.push(line);
    if (run > 1) result.push(`  (${run - 1} more identical line${run > 2 ? 's' : ''})`);
    i += run;
  }

  return result;
}

const script = process.argv[2];
if (!script) {
  process.stderr.write('Usage: node scripts/compact-output.js <npm-script-name>\n');
  process.exit(1);
}

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const child = spawn(npm, ['run', script], { stdio: ['inherit', 'pipe', 'pipe'] });

let buf = '';
const lines = [];

function onChunk(chunk) {
  buf += chunk.toString();
  const parts = buf.split('\n');
  buf = parts.pop() ?? '';
  lines.push(...parts);
}

child.stdout.on('data', onChunk);
child.stderr.on('data', onChunk);

child.on('close', code => {
  if (buf.length > 0) lines.push(buf);
  const out = compact(lines);
  if (out.length > 0) process.stdout.write(out.join('\n') + '\n');
  process.exit(code ?? 0);
});
