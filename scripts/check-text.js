// Fails the lint step when repo text contains an em dash; the project writes with hyphens and commas instead.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['src', 'README.md', 'RELEASING.md'];
const EM_DASH = '—';

function collect(path, out) {
  let stats;
  try {
    stats = statSync(path);
  } catch {
    return;
  }
  if (stats.isDirectory()) {
    for (const entry of readdirSync(path)) {
      collect(join(path, entry), out);
    }
  } else if (/\.(ts|js|md|json)$/.test(path)) {
    out.push(path);
  }
}

const files = [];
for (const root of ROOTS) {
  collect(root, files);
}

let failures = 0;
for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, index) => {
    if (line.includes(EM_DASH)) {
      failures += 1;
      console.error(`${file}:${index + 1}: em dash is not allowed`);
    }
  });
}

if (failures > 0) {
  process.exit(1);
}
console.log(`check-text: ${files.length} files clean`);
