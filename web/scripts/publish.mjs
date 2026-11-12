import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = fileURLToPath(new URL('../out/', import.meta.url));

// Exported assets are committed alongside the CSVs for main/root Pages hosting.
await mkdir(root, { recursive: true });
await rm(new URL('../../_next/', import.meta.url), { recursive: true, force: true });
await cp(output, root, { recursive: true });
await writeFile(new URL('../../.nojekyll', import.meta.url), '');
console.log('Static export copied to repository root. Commit the source and export together.');
