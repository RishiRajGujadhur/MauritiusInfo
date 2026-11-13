import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Exercise the actual worker entry point against the published CSV tables.
// Node runs each test file in isolation; no real network requests are made.
globalThis.self = {};
await import('../web/src/data-worker.js');
const originalFetch = globalThis.fetch;

async function load(failPath = '', reload = false) {
  let result;
  self.postMessage = value => { result = value; };
  globalThis.fetch = async (url, options) => {
    assert(options.signal instanceof AbortSignal, 'Every request has a timeout');
    assert.equal(options.cache, reload ? 'reload' : 'default');
    const path = new URL(url).pathname.slice('/MauritiusInfo/'.length);
    if (path === failPath) return new Response('', { status: 503 });
    return new Response(await readFile(new URL(`../${path}`, import.meta.url)));
  };
  try { await self.onmessage({ data: { base: 'https://example.org/MauritiusInfo/', reload } }); }
  finally { globalThis.fetch = originalFetch; }
  return result;
}

test('worker loads all records and joins evidence using absolute Pages URLs', async () => {
  const result = await load();
  assert.equal(result.records.length, 8548);
  assert.deepEqual(result.failures, []);
  assert.deepEqual(result.evidenceFailures, []);
});

test('failed dataset preserves successful records and supports cache-bypassing retry', async () => {
  const result = await load('data/osm/places.csv', true);
  assert.equal(result.records.length, 1583);
  assert.deepEqual(result.failures, ['Community map']);
});

test('failed evidence is disclosed without dropping places or claiming complete evidence', async () => {
  const result = await load('data/shops/accessibility_observations.csv');
  assert.equal(result.records.length, 8548);
  assert.deepEqual(result.evidenceFailures, ['Shop research']);
  assert(result.records.filter(r => r.dataset.id === 'shops').every(r => r.evidenceIncomplete));
});
