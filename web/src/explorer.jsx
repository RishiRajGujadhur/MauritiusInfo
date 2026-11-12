import React, { lazy, Suspense, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Dialog, IconButton, Link, SegmentedControl, Skeleton, Switch, Table, TextField, Theme, Tooltip } from '@radix-ui/themes';
import { AccessibilityIcon, ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, CaretSortIcon, ChevronRightIcon, Cross2Icon, DashboardIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon, DownloadIcon, DrawingPinIcon, ExternalLinkIcon, GlobeIcon, InfoCircledIcon, LayersIcon, MagnifyingGlassIcon, MixIcon, MoonIcon, ResetIcon, RowsIcon, SizeIcon, SunIcon, TableIcon } from '@radix-ui/react-icons';
import { flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { DATASETS, filterRecords } from '../../data-core.mjs';
import SearchSelect from './search-select';
import { getCategoryIcon } from './category-icons';
import { ReportBadge } from './ui';

const PlaceDetails = lazy(() => import('./place-details'));
const BASE = import.meta.env.BASE_URL;
const DEFAULT_FILTERS = { search: '', area: '', category: '', access: '', parking: '', dataset: '' };
const REPORTS = [['positive', 'Reported yes'], ['limited', 'Limited / partial'], ['negative', 'Reported no'], ['unknown', 'Unknown']];
const FILTERS = [
  { key: 'area', label: 'Area', icon: DrawingPinIcon, placeholder: 'All areas' },
  { key: 'category', label: 'Category', icon: MixIcon, placeholder: 'All categories' },
  { key: 'access', label: 'Access', icon: AccessibilityIcon, placeholder: 'Any access' },
  { key: 'parking', label: 'Parking', icon: DashboardIcon, placeholder: 'Any parking' },
  { key: 'dataset', label: 'Source', icon: LayersIcon, placeholder: 'All sources' },
];
const COLUMN_LABELS = { name: 'Place', category: 'Category', area: 'Area', access: 'Access', parking: 'Parking', dataset: 'Source' };
const COLUMN_ICONS = { name: DrawingPinIcon, category: MixIcon, area: GlobeIcon, access: AccessibilityIcon, parking: DashboardIcon, dataset: LayersIcon };
const REPORT_RANK = { positive: 0, limited: 1, negative: 2, unknown: 3 };

function readInitial() {
  const query = new URLSearchParams(location.search);
  const filters = Object.fromEntries(Object.entries(DEFAULT_FILTERS).map(([key, value]) => [key, query.get(key) ?? value]));
  const sorting = (query.get('sort') || 'name:asc').split(',').map(value => {
    const [id, direction] = value.split(':');
    return { id, desc: direction === 'desc' };
  }).filter(value => Object.hasOwn(COLUMN_LABELS, value.id));
  const size = Number(query.get('size'));
  return { filters, sorting: sorting.length ? sorting : [{ id: 'name', desc: false }], pageIndex: Math.max(0, Number(query.get('page')) - 1 || 0), pageSize: [25, 50, 100].includes(size) ? size : 25, record: query.get('record') };
}

function storedValue(key, fallback) {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}

function downloadRows(rows) {
  const headers = ['record_id', 'place_name', 'category', 'area', 'address', 'wheelchair_access', 'wheelchair_parking', 'dataset'];
  const values = rows.map(({ original: record }) => [record.id, record.name, record.category, record.area, record.address, record.access.raw, record.parking.raw, record.dataset.name]);
  const csv = [headers, ...values].map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'access-mauritius-results.csv';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Explorer() {
  const [initial] = useState(readInitial);
  const [filters, setFilters] = useState(initial.filters);
  const [sorting, setSorting] = useState(initial.sorting);
  const [pagination, setPagination] = useState({ pageIndex: initial.pageIndex, pageSize: initial.pageSize });
  const [appearance, setAppearance] = useState(() => storedValue('mu-theme-v2', 'dark') === 'light' ? 'light' : 'dark');
  const [density, setDensity] = useState(() => storedValue('mu-density', 'compact'));
  const [records, setRecords] = useState([]);
  const [failures, setFailures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const [selectedKey, setSelectedKey] = useState(initial.record);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(initial.filters.search);
  const mobileSearchInput = useRef(null);
  const mobileFilterStrip = useRef(null);
  const deferredSearchDraft = useDeferredValue(searchDraft);
  const detailTrigger = useRef(null);
  const searchInput = useRef(null);
  const deferredFilters = useDeferredValue(filters);

  useEffect(() => {
    document.documentElement.dataset.theme = appearance;
    try { localStorage.setItem('mu-theme-v2', appearance); } catch {}
  }, [appearance]);

  useEffect(() => {
    try { localStorage.setItem('mu-density', density); } catch {}
  }, [density]);

  useEffect(() => {
    function focusSearch(event) {
      const editing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
      if (event.key === '/' && !editing && !document.querySelector('[role="dialog"]')) {
        event.preventDefault();
        if (matchMedia('(max-width: 700px)').matches) {
          setSearchDraft(filters.search);
          setMobileSearchOpen(true);
        } else searchInput.current?.focus();
      }
    }
    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, [filters.search]);

  useEffect(() => {
    setLoading(true);
    const worker = new Worker(new URL('./data-worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }) => {
      setRecords(data.records);
      setFailures(data.failures);
      setLoading(false);
    };
    worker.onerror = () => {
      setFailures(DATASETS.map(dataset => dataset.name));
      setLoading(false);
    };
    worker.postMessage({ base: BASE, reload: retry > 0 });
    return () => worker.terminate();
  }, [retry]);

  const areas = useMemo(() => [...new Set(records.map(record => record.area))].sort().map(value => [value, value]), [records]);
  const categories = useMemo(() => [...new Set(records.map(record => record.category))].sort().map(value => [value, value]), [records]);
  const sourceOptions = useMemo(() => DATASETS.map(dataset => [dataset.id, dataset.name]), []);
  const options = { area: areas, category: categories, access: REPORTS, parking: REPORTS, dataset: sourceOptions };
  const matches = useMemo(() => filterRecords(records, deferredFilters), [records, deferredFilters]);
  const draftCount = useMemo(() => mobileSearchOpen ? filterRecords(records, { ...filters, search: deferredSearchDraft }).length : 0, [records, filters, deferredSearchDraft, mobileSearchOpen]);
  const columns = useMemo(() => [
    { accessorKey: 'name', header: 'Place', sortingFn: 'alphanumeric' },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'area', header: 'Area' },
    { id: 'access', accessorFn: record => REPORT_RANK[record.access.group], header: 'Access' },
    { id: 'parking', accessorFn: record => REPORT_RANK[record.parking.group], header: 'Parking' },
    { id: 'dataset', accessorFn: record => record.dataset.name, header: 'Source' },
  ], []);
  const table = useReactTable({
    data: matches,
    columns,
    state: { sorting, pagination },
    getRowId: record => record.key,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: update => {
      setSorting(update);
      setPagination(current => ({ ...current, pageIndex: 0 }));
    },
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
    sortDescFirst: false,
  });
  const pageCount = Math.max(1, table.getPageCount());
  const pageIndex = Math.min(pagination.pageIndex, pageCount - 1);

  useEffect(() => {
    if (!loading && pagination.pageIndex !== pageIndex) setPagination(current => ({ ...current, pageIndex }));
  }, [loading, pageIndex, pagination.pageIndex]);

  useEffect(() => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) if (value) query.set(key, value);
    const sortText = sorting.map(value => `${value.id}:${value.desc ? 'desc' : 'asc'}`).join(',');
    if (sortText !== 'name:asc') query.set('sort', sortText);
    if (pageIndex) query.set('page', String(pageIndex + 1));
    if (pagination.pageSize !== 25) query.set('size', String(pagination.pageSize));
    if (selectedKey) query.set('record', selectedKey);
    history.replaceState(null, '', location.pathname + (query.size ? `?${query}` : ''));
  }, [filters, sorting, pageIndex, pagination.pageSize, selectedKey]);

  function scrollToResults() {
    if (matchMedia('(max-width: 700px)').matches) {
      document.getElementById('results')?.scrollIntoView({ block: 'start' });
    } else {
      document.querySelector('.grid-scroll')?.scrollTo({ top: 0 });
    }
  }
  function goToPage(index) {
    table.setPageIndex(index);
    scrollToResults();
  }
  function updateFilter(key, value) {
    setFilters(current => ({ ...current, [key]: value }));
    setPagination(current => ({ ...current, pageIndex: 0 }));
  }
  function changeMobileSearchOpen(open) {
    if (open) setSearchDraft(filters.search);
    setMobileSearchOpen(open);
  }
  function reset() {
    mobileFilterStrip.current?.scrollTo({ left: 0 });
    setFilters(DEFAULT_FILTERS);
    setPagination(current => ({ ...current, pageIndex: 0 }));
  }
  function openDetails(record, event) {
    detailTrigger.current = event.currentTarget;
    setSelectedKey(record.key);
  }
  function cellContent(record, column) {
    if (column === 'name') return <Button variant="ghost" className="place-name" onClick={event => openDetails(record, event)}><DrawingPinIcon /><span>{record.name}</span><ExternalLinkIcon className="row-open-icon" /></Button>;
    if (column === 'category') {
      const CategoryIcon = getCategoryIcon(record.category);
      return <span className="muted"><span className="category-label"><CategoryIcon aria-hidden="true" />{record.category}</span><small>{record.type !== record.category ? record.type : ''}</small></span>;
    }
    if (column === 'area') return <span>{record.area}<small>{record.address}</small></span>;
    if (column === 'access' || column === 'parking') return <ReportBadge value={record[column]} />;
    return <span className="muted source-name">{record.dataset.name}</span>;
  }
  const selectedRecord = records.find(record => record.key === selectedKey);
  const activeFilters = FILTERS.filter(filter => filters[filter.key]);
  const visibleRows = table.getRowModel().rows;
  const start = matches.length ? pageIndex * pagination.pageSize + 1 : 0;
  function filterControls() {
    return FILTERS.map(filter => <SearchSelect key={filter.key} {...filter} getOptionIcon={filter.key === 'category' ? getCategoryIcon : undefined} value={filters[filter.key]} options={options[filter.key]} onChange={value => updateFilter(filter.key, value)} />);
  }
  const mobileSortOptions = Object.entries(COLUMN_LABELS).flatMap(([key, label]) => [[`${key}:asc`, `${label} · ascending`], [`${key}:desc`, `${label} · descending`]]);

  return <Theme className="app-theme" appearance={appearance} accentColor="blue" grayColor="slate" radius="medium">
    <Link className="skip-link" href="#results">Skip to places</Link>
    <header className="site-header"><div className="shell header-inner">
      <Link href={BASE} className="brand"><GlobeIcon className="brand-icon" width="23" height="23" /><span className="desktop-brand">Access Mauritius</span><span className="mobile-brand">Places</span></Link>
      <div className="header-actions">{(activeFilters.length > 0 || filters.search) && <IconButton className="mobile-clear-all" variant="ghost" color="gray" aria-label="Clear all filters" onClick={reset}><ResetIcon /></IconButton>}<Link href="https://github.com/RishiRajGujadhur/MauritiusInfo" className="data-link"><LayersIcon />Data<ExternalLinkIcon /></Link><label className="theme-switch"><span className="sr-only">Dark mode</span>{appearance === 'dark' ? <MoonIcon /> : <SunIcon />}<Switch size="1" aria-label="Dark mode" checked={appearance === 'dark'} onCheckedChange={checked => setAppearance(checked ? 'dark' : 'light')} /></label></div>
    </div></header>
    <main className="shell">
      <section className="workspace" aria-label="Find places">
        <div className="search-toolbar"><h1><DrawingPinIcon />Find a place</h1><TextField.Root ref={searchInput} aria-label="Search places" type="search" className="main-search" size="3" placeholder="Place, town or address" value={filters.search} onChange={event => updateFilter('search', event.target.value)}>
          <TextField.Slot><MagnifyingGlassIcon width="19" height="19" /></TextField.Slot><TextField.Slot side="right">{filters.search ? <IconButton size="1" variant="ghost" color="gray" aria-label="Clear search" onClick={() => { updateFilter('search', ''); searchInput.current?.focus(); }}><Cross2Icon /></IconButton> : <kbd>/</kbd>}</TextField.Slot>
        </TextField.Root><Tooltip content="Access can change. Confirm the facilities you need with the venue before visiting."><IconButton variant="ghost" color="gray" aria-label="About access reports"><InfoCircledIcon width="18" height="18" /></IconButton></Tooltip></div>
        <div className="filters">{filterControls()}<Tooltip content="Clear search and filters"><IconButton variant="ghost" color="gray" aria-label="Reset filters" disabled={!activeFilters.length && !filters.search} onClick={reset}><ResetIcon /></IconButton></Tooltip></div>
        {activeFilters.length > 0 && <div className="active-filters" aria-label="Active filters">{activeFilters.map(filter => <Button key={filter.key} size="1" variant="soft" onClick={() => updateFilter(filter.key, '')} aria-label={`Remove ${filter.label} filter`}><filter.icon />{filter.label} · {options[filter.key].find(([key]) => key === filters[filter.key])?.[1] || filters[filter.key]}<Cross2Icon /></Button>)}</div>}
      </section>
      <section className="mobile-controls" aria-label="Place filters">
        <div className="mobile-filter-strip" ref={mobileFilterStrip}>
          {filterControls()}
          <SearchSelect label="Sort" icon={CaretSortIcon} value={`${sorting[0]?.id || 'name'}:${sorting[0]?.desc ? 'desc' : 'asc'}`} options={mobileSortOptions} placeholder="Name · ascending" allowAll={false} onChange={value => { const [id, direction] = value.split(':'); table.setSorting([{ id, desc: direction === 'desc' }]); }} />
          <SearchSelect label="Rows" icon={TableIcon} value={String(pagination.pageSize)} options={['25', '50', '100'].map(value => [value, value])} placeholder="25" allowAll={false} onChange={value => table.setPageSize(Number(value))} />
          {(activeFilters.length > 0 || filters.search) && <Button className="mobile-reset" variant="ghost" color="gray" onClick={reset} aria-label="Reset filters"><ResetIcon />Clear</Button>}
        </div>
        {filters.search && <div className="mobile-query"><Button variant="ghost" color="gray" onClick={() => changeMobileSearchOpen(true)}><MagnifyingGlassIcon /><span>{filters.search}</span></Button><IconButton variant="ghost" color="gray" aria-label="Clear search" onClick={() => updateFilter('search', '')}><Cross2Icon /></IconButton></div>}
      </section>
      {failures.length > 0 && <div className="load-error" role="alert"><InfoCircledIcon /><span>Some sources could not load. {records.length.toLocaleString()} records available.</span><Tooltip content={failures.join(', ')}><Button size="1" variant="soft" onClick={() => setRetry(value => value + 1)}><ResetIcon />Retry</Button></Tooltip></div>}
      <section id="results" tabIndex={-1} aria-label="Places">
        <div className="grid-toolbar"><p role="status" aria-live="polite">{loading ? 'Loading places…' : <><strong>{matches.length.toLocaleString()}</strong> results <span>· {records.length.toLocaleString()} source records</span></>}</p><div className="grid-actions"><Tooltip content="Row spacing"><SegmentedControl.Root size="1" value={density} aria-label="Row density" onValueChange={setDensity}><SegmentedControl.Item value="compact" aria-label="Compact rows"><RowsIcon /></SegmentedControl.Item><SegmentedControl.Item value="comfortable" aria-label="Comfortable rows"><SizeIcon /></SegmentedControl.Item></SegmentedControl.Root></Tooltip><Tooltip content="Download all filtered results in sort order"><Button variant="ghost" color="gray" size="1" aria-label="Export CSV" disabled={loading || !matches.length} onClick={() => downloadRows(table.getSortedRowModel().rows)}><DownloadIcon /><span>Export CSV</span></Button></Tooltip></div></div>
        <div className="mobile-sort"><SearchSelect label="Sort" icon={CaretSortIcon} value={`${sorting[0]?.id || 'name'}:${sorting[0]?.desc ? 'desc' : 'asc'}`} options={mobileSortOptions} placeholder="Name · ascending" allowAll={false} onChange={value => { const [id, direction] = value.split(':'); table.setSorting([{ id, desc: direction === 'desc' }]); }} /></div>
        <div className={`grid-scroll ${density}`} tabIndex={0} role="region" aria-label="Location grid" aria-busy={loading}>
          <Table.Root className="places-table" variant="surface" size="1"><Table.Header>{table.getHeaderGroups().map(group => <Table.Row key={group.id}>{group.headers.map(header => {
            const direction = header.column.getIsSorted();
            const Icon = COLUMN_ICONS[header.id];
            const priority = sorting.findIndex(value => value.id === header.id);
            return <Table.ColumnHeaderCell key={header.id} aria-sort={direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none'}><Tooltip content="Click to sort. Shift-click to add another column."><Button size="1" variant="ghost" color="gray" className="sort-button" onClick={header.column.getToggleSortingHandler()} aria-label={`Sort by ${COLUMN_LABELS[header.id]}`}><Icon />{flexRender(header.column.columnDef.header, header.getContext())}{direction === 'asc' ? <ArrowUpIcon /> : direction === 'desc' ? <ArrowDownIcon /> : <CaretSortIcon className="sort-idle" />}{sorting.length > 1 && priority >= 0 && <sup>{priority + 1}</sup>}</Button></Tooltip></Table.ColumnHeaderCell>;
          })}</Table.Row>)}</Table.Header><Table.Body>
            {loading && !records.length ? Array.from({ length: 8 }, (_, index) => <Table.Row key={index}>{columns.map(column => <Table.Cell key={column.id || column.accessorKey}><Skeleton height="16px" width={column.accessorKey === 'name' ? '80%' : '65%'} /></Table.Cell>)}</Table.Row>) : visibleRows.map(row => <Table.Row key={row.id}>{row.getVisibleCells().map(cell => <Table.Cell key={cell.id} data-label={COLUMN_LABELS[cell.column.id]} className={`column-${cell.column.id}`}>{cellContent(row.original, cell.column.id)}</Table.Cell>)}</Table.Row>)}
          </Table.Body></Table.Root>
          {!loading && !matches.length && <div className="empty"><MagnifyingGlassIcon width="27" height="27" /><h2>No matching places</h2><p>Try another name or remove a filter.</p><Button variant="soft" onClick={reset}><ResetIcon />Reset filters</Button></div>}
        </div>
        <div className="mobile-place-list" aria-label="Place list" aria-busy={loading}>
          {loading && !records.length ? Array.from({ length: 5 }, (_, index) => <div className="mobile-place-skeleton" key={index}><Skeleton height="22px" width="65%" /><Skeleton height="16px" width="80%" /><Skeleton height="20px" width="45%" /></div>) : visibleRows.map(({ original: record }) => {
            const CategoryIcon = getCategoryIcon(record.category);
            const area = record.area === 'Not Stated' ? record.address || 'Area unknown' : record.area;
            return <article className="mobile-place" key={record.key}>
              <Button variant="ghost" color="gray" className="mobile-place-main" onClick={event => openDetails(record, event)}>
                <span className="mobile-category-icon"><CategoryIcon aria-hidden="true" /></span>
                <span className="mobile-place-text"><strong>{record.name}</strong><span>{record.type || record.category} · {area}</span></span>
                <ChevronRightIcon className="mobile-place-chevron" />
              </Button>
              <div className="mobile-place-status"><span>Access <ReportBadge value={record.access} /></span><span>Parking <ReportBadge value={record.parking} /></span></div>
            </article>;
          })}
          {!loading && !matches.length && <div className="empty"><MagnifyingGlassIcon width="28" height="28" /><h2>No places found</h2><p>Try another search or clear your filters.</p><Button variant="soft" onClick={reset}>Clear filters</Button></div>}
        </div>
        <nav className="pagination" aria-label="Results pages"><span className="page-range">{start}–{Math.min(start + visibleRows.length - (start ? 1 : 0), matches.length)} of {matches.length.toLocaleString()}</span><div className="page-navigation"><IconButton variant="soft" color="gray" size="1" aria-label="First page" disabled={loading || !pageIndex} onClick={() => goToPage(0)}><DoubleArrowLeftIcon /></IconButton><IconButton variant="soft" color="gray" size="1" aria-label="Previous page" disabled={loading || !pageIndex} onClick={() => goToPage(pageIndex - 1)}><ArrowLeftIcon /></IconButton><label className="page-jump">Page<TextField.Root size="1" aria-label="Page number" type="number" min="1" max={pageCount} value={pageIndex + 1} onChange={event => table.setPageIndex(Math.min(pageCount - 1, Math.max(0, Number(event.target.value) - 1 || 0)))} /></label><span className="desktop-page-total">of {pageCount}</span><span className="mobile-page-indicator">Page {pageIndex + 1} of {pageCount}</span><IconButton variant="soft" color="gray" size="1" aria-label="Next page" disabled={loading || pageIndex >= pageCount - 1} onClick={() => goToPage(pageIndex + 1)}><ArrowRightIcon /></IconButton><IconButton variant="soft" color="gray" size="1" aria-label="Last page" disabled={loading || pageIndex >= pageCount - 1} onClick={() => goToPage(pageCount - 1)}><DoubleArrowRightIcon /></IconButton></div><SearchSelect label="Rows" icon={TableIcon} value={String(pagination.pageSize)} options={['25', '50', '100'].map(value => [value, value])} placeholder="25" allowAll={false} onChange={value => table.setPageSize(Number(value))} /></nav>
      </section>
      <footer><span className="footer-note">Source records may overlap. Unknown means details are missing.</span><Link href="https://github.com/RishiRajGujadhur/MauritiusInfo#readme">Sources & licences<ExternalLinkIcon /></Link><span className="footer-copyright">© OpenStreetMap contributors · ODbL. Open Data Mauritius via cyber.mu · CC BY-SA 4.0.</span></footer>
    </main>
    <Dialog.Root open={mobileSearchOpen} onOpenChange={changeMobileSearchOpen}>
      <nav className="mobile-bottom-bar" aria-label="Mobile search"><Dialog.Trigger><Button className="mobile-search-button" size="3" variant="surface"><MagnifyingGlassIcon width="22" height="22" />Search places</Button></Dialog.Trigger></nav>
      <Dialog.Content className="mobile-search-sheet" maxWidth="520px" onOpenAutoFocus={event => { event.preventDefault(); mobileSearchInput.current?.focus(); }}>
        <div className="mobile-search-heading"><Dialog.Title>Search places</Dialog.Title><Dialog.Close><IconButton variant="ghost" color="gray" aria-label="Close search"><Cross2Icon /></IconButton></Dialog.Close></div>
        <Dialog.Description className="sr-only">Search by place name, town or address. Your selected filters also apply.</Dialog.Description>
        <form onSubmit={event => { event.preventDefault(); updateFilter('search', searchDraft.trim()); setMobileSearchOpen(false); scrollToResults(); }}>
          <TextField.Root ref={mobileSearchInput} size="3" type="search" enterKeyHint="search" autoComplete="off" aria-label="Search places on mobile" placeholder="Place, town or address" value={searchDraft} onChange={event => setSearchDraft(event.target.value)}>
            <TextField.Slot><MagnifyingGlassIcon width="21" height="21" /></TextField.Slot>
            {searchDraft && <TextField.Slot side="right"><IconButton type="button" variant="ghost" color="gray" aria-label="Clear mobile search" onClick={() => { setSearchDraft(''); mobileSearchInput.current?.focus(); }}><Cross2Icon /></IconButton></TextField.Slot>}
          </TextField.Root>
          <Button className="mobile-search-submit" type="submit" size="3" disabled={loading}>{loading ? 'Loading places…' : `Show ${draftCount.toLocaleString()} results`}<ArrowRightIcon /></Button>
        </form>
      </Dialog.Content>
    </Dialog.Root>
    <Suspense fallback={selectedKey ? <div className="detail-loading" role="status">Loading place details…</div> : null}>{selectedRecord && <PlaceDetails record={selectedRecord} onClose={() => setSelectedKey(null)} triggerRef={detailTrigger} />}</Suspense>
  </Theme>;
}
