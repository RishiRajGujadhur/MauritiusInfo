'use client';

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button, Link, Select, Switch, Table, TextField, Theme } from '@radix-ui/themes';
import { ArrowLeftIcon, ArrowRightIcon, ExternalLinkIcon, InfoCircledIcon, MagnifyingGlassIcon, MoonIcon, GlobeIcon, ResetIcon, SunIcon } from '@radix-ui/react-icons';
import { DATASETS, filterRecords, normalize, paginate, parseCSV } from '../../data-core.mjs';

import { ReportBadge } from './ui';

const PlaceDetails = dynamic(() => import('./place-details'), { ssr: false });

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '/MauritiusInfo';
const EMPTY_FILTERS = { search: '', area: '', category: '', access: '', parking: '', dataset: '', sort: 'name' };
const REPORT_OPTIONS = [['positive', 'Positive report'], ['limited', 'Limited / partial'], ['negative', 'Negative report'], ['unknown', 'Unknown']];

function FilterSelect({ label, value, onChange, options, placeholder, allowAll = true }) {
  return <label className="filter-label"><span>{label}</span><Select.Root value={value || 'all'} onValueChange={next => onChange(next === 'all' ? '' : next)}>
    <Select.Trigger aria-label={label} />
    <Select.Content position="popper">{allowAll && <Select.Item value="all">{placeholder}</Select.Item>}{options.map(([key, text]) => <Select.Item key={key} value={key}>{text}</Select.Item>)}</Select.Content>
  </Select.Root></label>;
}

export default function Explorer() {
  const [appearance, setAppearance] = useState('dark');
  const [themeReady, setThemeReady] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failures, setFailures] = useState([]);
  const [retry, setRetry] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [ready, setReady] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const detailTrigger = useRef(null);
  const deferredFilters = useDeferredValue(filters);

  useEffect(() => {
    let saved;
    try { saved = localStorage.getItem('mu-theme-v2'); } catch {}
    setAppearance(['light', 'dark'].includes(saved) ? saved : 'dark');
    setThemeReady(true);
    const query = new URLSearchParams(location.search);
    const initial = { ...EMPTY_FILTERS };
    for (const key of Object.keys(initial)) initial[key] = query.get(key) ?? initial[key];
    setFilters(initial);
    setPage(Math.max(1, Number(query.get('page')) || 1));
    const size = Number(query.get('size'));
    setPageSize([25, 50, 100].includes(size) ? size : 25);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    document.documentElement.dataset.theme = appearance;
    try { localStorage.setItem('mu-theme-v2', appearance); } catch {}
  }, [appearance, themeReady]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    async function load() {
      const results = await Promise.allSettled(DATASETS.map(async dataset => {
        const response = await fetch(`${BASE_PATH}/${dataset.path}`, { signal: controller.signal, cache: retry ? 'reload' : 'default' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return parseCSV(await response.text()).map((row, index) => normalize(row, dataset, index));
      }));
      if (controller.signal.aborted) return;
      setRecords(results.flatMap(result => result.status === 'fulfilled' ? result.value : []));
      setFailures(results.flatMap((result, index) => result.status === 'rejected' ? [DATASETS[index].name] : []));
      setLoading(false);
    }
    load();
    return () => controller.abort();
  }, [retry]);

  const areas = useMemo(() => [...new Set(records.map(record => record.area))].sort(), [records]);
  const categories = useMemo(() => [...new Set(records.map(record => record.category))].sort(), [records]);
  const matches = useMemo(() => filterRecords(records, deferredFilters), [records, deferredFilters]);
  const view = paginate(matches, page, pageSize);

  useEffect(() => {
    if (!ready || loading) return;
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value && !(key === 'sort' && value === 'name')) query.set(key, value);
    }
    if (view.page > 1) query.set('page', String(view.page));
    if (pageSize !== 25) query.set('size', String(pageSize));
    history.replaceState(null, '', location.pathname + (query.size ? `?${query}` : '') + location.hash);
  }, [filters, view.page, pageSize, ready, loading]);

  function updateFilter(key, value) {
    setFilters(current => ({ ...current, [key]: value }));
    setPage(1);
  }
  function reset() { setFilters(EMPTY_FILTERS); setPage(1); }

  return <Theme className="app-theme" appearance={appearance} accentColor="blue" grayColor="slate" radius="large" scaling="100%">
    <Link className="skip-link" href="#results">Skip to places</Link>
    <header className="site-header"><div className="container header-inner">
      <Link className="brand" href={`${BASE_PATH}/`}><GlobeIcon className="brand-pin" width="30" height="30" />Access Mauritius</Link>
      <div className="header-actions"><Link className="data-link" href="https://github.com/RishiRajGujadhur/MauritiusInfo">Data <ExternalLinkIcon /></Link><label className="theme-switch">{appearance === 'dark' ? <MoonIcon /> : <SunIcon />}<span>Dark mode</span><Switch aria-label="Dark mode" checked={appearance === 'dark'} onCheckedChange={checked => setAppearance(checked ? 'dark' : 'light')} /></label></div>
    </div></header>
    <main className="container">
      <section className="intro"><h1>Find a place.</h1><p>Wheelchair access and parking across Mauritius.</p></section>
      <div className="access-note"><InfoCircledIcon /><span>Access can change. Check with the venue before visiting.</span></div>
      <section className="filter-panel" aria-label="Search and filters">
        <div className="search-row"><TextField.Root aria-label="Search places" type="search" size="3" placeholder="Search a place, town or address…" value={filters.search} onChange={event => updateFilter('search', event.target.value)}><TextField.Slot><MagnifyingGlassIcon height="19" width="19" /></TextField.Slot></TextField.Root><Button variant="ghost" color="gray" onClick={reset}><ResetIcon />Reset</Button></div>
        <div className="filter-grid">
          <FilterSelect label="Area" value={filters.area} onChange={value => updateFilter('area', value)} options={areas.map(area => [area, area])} placeholder="All areas" />
          <FilterSelect label="Category" value={filters.category} onChange={value => updateFilter('category', value)} options={categories.map(category => [category, category])} placeholder="All categories" />
          <FilterSelect label="Wheelchair access" value={filters.access} onChange={value => updateFilter('access', value)} options={REPORT_OPTIONS} placeholder="All reports" />
          <FilterSelect label="Wheelchair parking" value={filters.parking} onChange={value => updateFilter('parking', value)} options={REPORT_OPTIONS} placeholder="All reports" />
          <FilterSelect label="Dataset" value={filters.dataset} onChange={value => updateFilter('dataset', value)} options={DATASETS.map(dataset => [dataset.id, dataset.name])} placeholder="All datasets" />
        </div>
      </section>
      {failures.length > 0 && <div role="alert" className="error">Couldn’t load {failures.join(', ')}. Results are incomplete. <Button size="1" variant="soft" onClick={() => setRetry(value => value + 1)}>Retry</Button></div>}
      <section id="results" aria-label="Places" tabIndex={-1}>
        <div className="results-toolbar"><p role="status" aria-live="polite">{loading ? 'Loading places…' : `${matches.length.toLocaleString()} results · ${records.length.toLocaleString()} source records`}</p><div className="result-controls"><FilterSelect label="Sort" value={filters.sort} onChange={value => updateFilter('sort', value || 'name')} options={[['name', 'Name A–Z'], ['area', 'Area A–Z']]} placeholder="Default" allowAll={false} /><FilterSelect label="Per page" value={String(pageSize)} onChange={value => { setPageSize(Number(value) || 25); setPage(1); }} options={['25', '50', '100'].map(value => [value, value])} placeholder="25" allowAll={false} /></div></div>
        <Table.Root variant="surface" className="places-table"><Table.Header><Table.Row><Table.ColumnHeaderCell>Place</Table.ColumnHeaderCell><Table.ColumnHeaderCell>Area</Table.ColumnHeaderCell><Table.ColumnHeaderCell>Wheelchair access</Table.ColumnHeaderCell><Table.ColumnHeaderCell>Wheelchair parking</Table.ColumnHeaderCell><Table.ColumnHeaderCell>Dataset</Table.ColumnHeaderCell></Table.Row></Table.Header><Table.Body>
          {view.items.map(record => <Table.Row key={record.key}><Table.RowHeaderCell><Button className="place-name" variant="ghost" onClick={event => { detailTrigger.current = event.currentTarget; setSelectedRecord(record); }}>{record.name}</Button><span className="subtext">{record.category}{record.type && record.type !== record.category ? ` · ${record.type}` : ''}</span></Table.RowHeaderCell><Table.Cell data-label="Area">{record.area}<span className="subtext">{record.address}</span></Table.Cell><Table.Cell data-label="Wheelchair access"><ReportBadge value={record.access} /></Table.Cell><Table.Cell data-label="Wheelchair parking"><ReportBadge value={record.parking} /></Table.Cell><Table.Cell className="dataset-name">{record.dataset.name}</Table.Cell></Table.Row>)}
        </Table.Body></Table.Root>
        {!loading && !matches.length && <div className="empty"><MagnifyingGlassIcon width="28" height="28" /><h2>No places found</h2><Button onClick={reset} variant="soft">Reset filters</Button></div>}
        <nav className="pagination" aria-label="Results pages"><span>{matches.length ? `${view.start + 1}–${view.start + view.items.length} of ${matches.length.toLocaleString()}` : '0 results'}</span><div><Button variant="soft" color="gray" disabled={loading || view.page === 1} onClick={() => setPage(view.page - 1)}><ArrowLeftIcon />Previous</Button><label className="page-input">Page <TextField.Root size="2" aria-label="Page number" type="number" min="1" max={view.pages} value={view.page} onChange={event => setPage(Number(event.target.value) || 1)} /></label><span>of {view.pages}</span><Button variant="soft" color="gray" disabled={loading || view.page >= view.pages} onClick={() => setPage(view.page + 1)}>Next<ArrowRightIcon /></Button></div></nav>
      </section>
    </main>
    {selectedRecord && <PlaceDetails record={selectedRecord} onClose={() => setSelectedRecord(null)} triggerRef={detailTrigger} />}
    <footer className="container"><p>Sources may overlap. Unknown means access details are missing.</p><p><Link href="https://github.com/RishiRajGujadhur/MauritiusInfo#readme">Sources & licences <ExternalLinkIcon /></Link></p><p>© OpenStreetMap contributors · <Link href="https://opendatacommons.org/licenses/odbl/1-0/">ODbL</Link>. Open Data Mauritius via cyber.mu · <Link href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</Link>.</p></footer>
  </Theme>;
}
