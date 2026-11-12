import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
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
