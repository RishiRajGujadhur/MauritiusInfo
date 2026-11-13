import { DATASETS, normalize, parseCSV } from '../../data-core.mjs';
import { attachEvidence } from '../../place-tools.mjs';

self.onmessage = async ({ data: { base, reload } }) => {
  const evidenceFailures = [];
  async function csv(path) {
    const response = await fetch(`${base}${path}`, { cache: reload ? 'reload' : 'default' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return parseCSV(await response.text());
  }
  const results = await Promise.allSettled(DATASETS.map(async dataset => {
    const rows = await csv(dataset.path);
    let observations = [], sources = [];
    if (!['osm', 'directory', 'health'].includes(dataset.id)) {
      const directory = dataset.path.slice(0, dataset.path.lastIndexOf('/'));
      const evidence = await Promise.allSettled([csv(`${directory}/accessibility_observations.csv`), csv(`${directory}/sources.csv`)]);
      if (evidence.some(result => result.status === 'rejected')) evidenceFailures.push(dataset.name);
      observations = evidence[0].status === 'fulfilled' ? evidence[0].value : [];
      sources = evidence[1].status === 'fulfilled' ? evidence[1].value : [];
    }
    return rows.map((row, index) => {
      const record = attachEvidence(normalize(row, dataset, index), observations, sources);
      if (evidenceFailures.includes(dataset.name)) record.evidenceIncomplete = true;
      return record;
    });
  }));
  self.postMessage({
    records: results.flatMap(result => result.status === 'fulfilled' ? result.value : []),
    evidenceFailures,
    failures: results.flatMap((result, index) => result.status === 'rejected' ? [DATASETS[index].name] : []),
  });
};
