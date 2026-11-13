import { cp, mkdir, rm, writeFile, readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = fileURLToPath(new URL('../dist/', import.meta.url));

// Exported assets are committed alongside the CSVs for main/root Pages hosting.
await mkdir(root, { recursive: true });
for (const path of ['_next', 'assets', '_not-found', '404', '404.html', 'index.txt', '__next.__PAGE__.txt', '__next._full.txt', '__next._tree.txt']) {
  await rm(new URL('../../' + path, import.meta.url), { recursive: true, force: true });
}
await cp(output, root, { recursive: true });
await writeFile(new URL('../../.nojekyll', import.meta.url), '');
console.log('Static export copied to repository root. Commit the source and export together.');

const assets = (await readdir(new URL('../../assets/', import.meta.url))).sort().map(name => 'assets/' + name);
const version = createHash('sha256').update(await readFile(new URL('../../index.html', import.meta.url))).digest('hex').slice(0, 16);
await writeFile(new URL('../../offline-manifest.json', import.meta.url), JSON.stringify({ version, files:['index.html', ...assets] }) + '\n');
