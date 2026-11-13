import { DATASETS, normalize, parseCSV } from '../../data-core.mjs';
import { attachEvidence } from '../../place-tools.mjs';

self.onmessage = async ({ data: { base, reload } }) => {
  const evidenceFailures = [];
  async function csv(path) {
    const response = await fetch(`${base}${path}`, { cache: reload ? 'reload' : 'default', signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return parseCSV(await response.text());
  }
  async function json(path) {
    const response = await fetch(new URL(path, base), { cache: reload ? 'reload' : 'default', signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
  const enrichmentPromise = Promise.allSettled([json('data/planning/records.json').then(data => { if (!data?.records || typeof data.records !== 'object' || Array.isArray(data.records)) throw new Error('Invalid planning table'); return data; }), json('data/planning/reports.json').then(data => { if (!Array.isArray(data?.reports)) throw new Error('Invalid reports table'); return data; })]);
  const results = await Promise.allSettled(DATASETS.map(async dataset => {
    const rows = await csv(dataset.path);
    let observations = [], sources = [];
    if (!['osm', 'directory', 'health', 'official'].includes(dataset.id)) {
      const directory = dataset.path.slice(0, dataset.path.lastIndexOf('/'));
      const evidence = await Promise.allSettled([csv(`${directory}/accessibility_observations.csv`), csv(`${directory}/sources.csv`)]);
      if (evidence.some(result => result.status === 'rejected')) evidenceFailures.push(dataset.name);
      observations = evidence[0].status === 'fulfilled' ? evidence[0].value : [];
      sources = evidence[1].status === 'fulfilled' ? evidence[1].value : [];
    }
    const enrichment = await enrichmentPromise;
    const planning = enrichment[0].status === 'fulfilled' ? enrichment[0].value.records : {};
    const reports = enrichment[1].status === 'fulfilled' ? enrichment[1].value.reports : [];
    return rows.map((row, index) => {
      const record = attachEvidence(normalize(row, dataset, index), observations, sources);
      record.planning = planning[record.key] || null;
      record.reports = reports.filter(report => report.record_key === record.key);
      if (evidenceFailures.includes(dataset.name)) record.evidenceIncomplete = true;
      return record;
    });
  }));
  const enrichment = await enrichmentPromise;
  if (enrichment[0].status === 'rejected') evidenceFailures.push('Visit planning');
  if (enrichment[1].status === 'rejected') evidenceFailures.push('Visitor reports');
  self.postMessage({
    records: results.flatMap(result => result.status === 'fulfilled' ? result.value : []),
    evidenceFailures,
    failures: results.flatMap((result, index) => result.status === 'rejected' ? [DATASETS[index].name] : []),
  });
};
