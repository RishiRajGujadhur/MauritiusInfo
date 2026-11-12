import { DATASETS, normalize, parseCSV } from '../../data-core.mjs';

self.onmessage = async ({ data: { base, reload } }) => {
  const results = await Promise.allSettled(DATASETS.map(async dataset => {
    const response = await fetch(`${base}${dataset.path}`, { cache: reload ? 'reload' : 'default' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return parseCSV(await response.text()).map((row, index) => normalize(row, dataset, index));
  }));
  self.postMessage({
    records: results.flatMap(result => result.status === 'fulfilled' ? result.value : []),
    failures: results.flatMap((result, index) => result.status === 'rejected' ? [DATASETS[index].name] : []),
  });
};
