import React, { lazy, Suspense, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Dialog, IconButton, Link, Popover, SegmentedControl, Skeleton, Switch, Table, TextField, Theme, Tooltip } from '@radix-ui/themes';
import { AccessibilityIcon, ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, CaretSortIcon, ClockIcon, ChevronRightIcon, Cross2Icon, DashboardIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon, DownloadIcon, DrawingPinIcon, ExternalLinkIcon, GlobeIcon, InfoCircledIcon, LayersIcon, MagnifyingGlassIcon, MixIcon, MoonIcon, ResetIcon, RowsIcon, SizeIcon, SunIcon, TableIcon, BookmarkIcon, BookmarkFilledIcon } from '@radix-ui/react-icons';
import { flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { DATASETS, filterRecords } from '../../data-core.mjs';
import SearchSelect from './search-select';
import { addRecent, readRecents, readSearches, searchQuery, recordsCSV } from '../../qol-core.mjs';
import { copyText, downloadFile } from './qol-actions.mjs';
import { CopyFallback, RecentSearches } from './qol-ui';
const ToolsPanel=lazy(()=>import('./tools-panel'));
import HoursFilter from './hours-filter';
import { getCategoryIcon } from './category-icons';
import { ReportBadge, EvidenceLabels } from './ui';
const NeedsFilter = lazy(() => import('./needs-filter'));
import { PRACTICAL_FILTERS, practicalMatch, nearbyRecords, readTrip, readHoursWindow, hoursWindowMatch, windowTime, distanceKm } from '../../planning-core.mjs';
import { requestGPS } from './geolocation.mjs';
import { coordinates } from '../../place-tools.mjs';
import calendar from '../../data/planning/holidays.json';
import locations from '../../data/planning/locations.json';
import { HoursBadge } from './visit-info';
import { loadOfflineRecords, saveOfflineRecords, hasOfflineCopy } from './offline';
import { matchesNeeds, validNeeds, readSaved } from '../../place-tools.mjs';

const VisitFilters = lazy(() => import('./visit-filters'));
const TripPanel = lazy(() => import('./trip-panel'));
const MapView = lazy(() => import('./map-view'));
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
const COLUMN_LABELS = { proximity: 'Proximity', distance: 'Distance', name: 'Place', category: 'Category', area: 'Area', access: 'Access', parking: 'Parking', dataset: 'Source' };
const COLUMN_ICONS = { proximity: DrawingPinIcon, distance: DrawingPinIcon, name: DrawingPinIcon, category: MixIcon, area: GlobeIcon, access: AccessibilityIcon, parking: DashboardIcon, dataset: LayersIcon };
const REPORT_RANK = { positive: 0, limited: 1, negative: 2, unknown: 3 };

function readInitial() {
  const query = new URLSearchParams(location.search);
  const filters = Object.fromEntries(Object.entries(DEFAULT_FILTERS).map(([key, value]) => [key, query.get(key) ?? value]));
  const sorting = (query.get('sort') || 'name:asc').split(',').map(value => {
    const [id, direction] = value.split(':');
    return { id, desc: direction === 'desc' };
  }).filter(value => Object.hasOwn(COLUMN_LABELS, value.id) && value.id !== 'proximity' && (value.id !== 'distance' || locations.some(t=>t.id===query.get('near'))));
  const size = Number(query.get('size'));
  const practical = (query.get('features') || '').split(',').filter(id => PRACTICAL_FILTERS.some(([key]) => key === id));
  const town = locations.find(t => t.id === query.get('near'));
  const radius = [1,2,5,10,25,50].includes(Number(query.get('radius'))) ? Number(query.get('radius')) : 5;
  return { hoursWindow: readHoursWindow(query.get('hours')), practical, nearby: town ? { id:town.id, name:town.name, point:[town.latitude,town.longitude], radius } : null, view: query.get('view') === 'map' ? 'map' : 'list', savedOnly: query.get('saved') === '1', needs: query.has('needs') ? validNeeds(query.get('needs').split(',')) : null, filters, sorting: sorting.length ? sorting : [{ id: 'name', desc: false }], pageIndex: Number.isSafeInteger(Number(query.get('page'))) ? Math.max(0, Number(query.get('page')) - 1) : 0, pageSize: [25, 50, 100].includes(size) ? size : 25, record: query.get('record') };
}

function storedValue(key, fallback) {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}

function downloadRows(rows){downloadFile('access-mauritius-results.csv',recordsCSV(rows.map(row=>row.original)),'text/csv;charset=utf-8');}

export default function Explorer() {
  const [initial] = useState(readInitial);
  const [toolsOpen,setToolsOpen]=useState(false);
  const [recents,setRecents]=useState(()=>readRecents(storedValue('mu-recents-v1','[]')));
  const [searches,setSearches]=useState(()=>readSearches(storedValue('mu-searches-v1','[]')));
  const [notice,setNotice]=useState(null);
  const [copyFallback,setCopyFallback]=useState('');
  const [connected,setConnected]=useState(navigator.onLine);
  function rememberSearch(text){setRecents(rows=>addRecent(rows,text));}
  async function shareResults(){
    const url=location.href;
    try{if(navigator.share){await navigator.share({title:'Access Mauritius places',url});return;}}catch(error){if(error.name==='AbortError')return;}
    if(await copyText(url))setNotice({message:'Results link copied.'});else setCopyFallback(url);
  }
  function restoreSearch(query){history.pushState(null,'',location.pathname+'?'+searchQuery(query));dispatchEvent(new PopStateEvent('popstate'));}
  function recentControls(){return <RecentSearches rows={recents} onChoose={text=>{updateFilter('search',text);setSearchDraft(text);rememberSearch(text);}} onRemove={text=>setRecents(rows=>rows.filter(r=>r!==text))} onClear={()=>setRecents([])} />;}
  useEffect(()=>{try{localStorage.setItem('mu-recents-v1',JSON.stringify(recents));localStorage.setItem('mu-searches-v1',JSON.stringify(searches));}catch{setNotice({message:'Search history could not be saved on this browser.'});}},[recents,searches]);
  useEffect(()=>{function online(){setConnected(true);setNotice({message:'Connection restored. Retry sources to refresh the data.'});}function offline(){setConnected(false);}addEventListener('online',online);addEventListener('offline',offline);return()=>{removeEventListener('online',online);removeEventListener('offline',offline);};},[]);
  const [practical, setPractical] = useState(initial.practical);
  const [nearby, setNearby] = useState(initial.nearby);
  const [hoursWindow,setHoursWindow]=useState(initial.hoursWindow);
  const [gps,setGPS]=useState(null);
  const [geoMessage,setGeoMessage]=useState('');
  const [gpsPending,setGPSPending]=useState(false);
  const gpsRequest=useRef(0);
  useEffect(()=>()=>{gpsRequest.current++;},[]);
  const [visitOpen, setVisitOpen] = useState(false);
  const [tripOpen, setTripOpen] = useState(false);
  const [trip, setTrip] = useState(() => readTrip(storedValue('mu-trip-v1', '[]')));
  const [now, setNow] = useState(() => new Date());
  const [offlineMode, setOfflineMode] = useState(false);
  const [tripWarning, setTripWarning] = useState('');
  const [filters, setFilters] = useState(initial.filters);
  const [view, setView] = useState(initial.view);
  const [savedKeys, setSavedKeys] = useState(() => readSaved(storedValue('mu-saved-v1', '[]')));
  const [savedOnly, setSavedOnly] = useState(initial.savedOnly);
  const [storageWarning, setStorageWarning] = useState('');
  const [needsOpen, setNeedsOpen] = useState(false);
  const [needs, setNeeds] = useState(() => {
    if (initial.needs) return { ids: initial.needs, enabled: initial.needs.length > 0 };
    try { const value = JSON.parse(storedValue('mu-needs-v1', '{}')); return { ids: validNeeds(Array.isArray(value.ids) ? value.ids : []), enabled: Boolean(value.enabled) }; } catch { return { ids: [], enabled: false }; }
  });
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
    const refresh = () => setNow(new Date());
    const timer = setInterval(refresh, 60000);
    document.addEventListener('visibilitychange', refresh);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', refresh); };
  }, []);
  useEffect(() => {
    try { localStorage.setItem('mu-trip-v1', JSON.stringify(trip)); setTripWarning(''); }
    catch { setTripWarning('Trip storage is unavailable. Your plan will last for this tab only.'); }
  }, [trip]);
  useEffect(() => {
    if (loading || !records.length || !('caches' in window)) return;
    let current = true;
    Promise.all([hasOfflineCopy(), loadOfflineRecords()]).then(([exists, saved]) => {
      if (!current || !exists) return;
      const merged = new Map(saved.map(record => [record.key, record]));
      records.forEach(record => merged.set(record.key, record));
      return saveOfflineRecords(savedKeys.map(key => merged.get(key)).filter(Boolean));
    }).catch(() => setTripWarning('Offline saved-place copy could not be updated. Reconnect and download it again in My trip.'));
    return () => { current = false; };
  }, [records, savedKeys, loading]);

  useEffect(() => {
    try { localStorage.setItem('mu-saved-v1', JSON.stringify(savedKeys)); localStorage.setItem('mu-needs-v1', JSON.stringify(needs)); setStorageWarning(''); }
    catch { setStorageWarning('Browser storage is unavailable. Saved places and needs will last for this tab only.'); }
  }, [savedKeys, needs]);
  useEffect(() => {
    const sync = event => {
      if (event.key === 'mu-saved-v1') setSavedKeys(readSaved(event.newValue));
    };
    addEventListener('storage', sync); return () => removeEventListener('storage', sync);
  }, []);
  const savedSet = useMemo(() => new Set(savedKeys), [savedKeys]);
  function toggleSave(key) { const removing=savedKeys.includes(key);setSavedKeys(current=>removing?current.filter(value=>value!==key):[...new Set([...current,key])]);setNotice({message:removing?'Place removed from saved places.':'Place saved.',undo:removing?()=>setSavedKeys(current=>[...new Set([...current,key])]):null}); }
  function updateNeeds(next) { setNeeds(next); setPagination(current => ({ ...current, pageIndex: 0 })); }
  function toggleSavedOnly() { setSavedOnly(value => !value); setPagination(current => ({ ...current, pageIndex: 0 })); }
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
    let alive = true;
    async function fallback(failures) {
      try{const saved=await loadOfflineRecords();if(!alive)return;setRecords(saved);setOfflineMode(true);setFailures(failures);}catch{if(alive){setRecords([]);setFailures(failures);setTripWarning('Saved data could not load. Reconnect and retry sources.');}}finally{if(alive)setLoading(false);}
    }
    if (!navigator.onLine) {
      fallback([]);
      return () => { alive = false; };
    }
    setOfflineMode(false);
    let worker;
    try { worker = new Worker(new URL('./data-worker.js', import.meta.url), { type: 'module' }); }
    catch { fallback(DATASETS.map(dataset => dataset.name)); return () => { alive = false; }; }
    worker.onmessage = ({ data }) => {
      if (!data.records.length) { fallback(data.failures); return; }
      setRecords(data.records);
      setFailures([...data.failures, ...data.evidenceFailures.map(name => `${name} evidence`)]);
      setLoading(false);
    };
    worker.onerror = () => {
      fallback(DATASETS.map(dataset => dataset.name));
    };
    worker.postMessage({ base: new URL(BASE, location.href).href, reload: retry > 0 });
    return () => { alive = false; worker.terminate(); };
  }, [retry]);

  const areas = useMemo(() => [...new Set(records.map(record => record.area))].sort().map(value => [value, value]), [records]);
  const categories = useMemo(() => [...new Set(records.map(record => record.category))].sort().map(value => [value, value]), [records]);
  const sourceOptions = useMemo(() => DATASETS.map(dataset => [dataset.id, dataset.name]), []);
  const options = { area: areas, category: categories, access: REPORTS, parking: REPORTS, dataset: sourceOptions };
  const eligibleRecords = useMemo(() => records.filter(record => (!savedOnly || savedSet.has(record.key)) && (!needs.enabled || matchesNeeds(record, needs.ids)) && practicalMatch(record, practical, now, calendar) && hoursWindowMatch(record,hoursWindow,calendar)), [records, savedOnly, savedSet, needs, practical, now, hoursWindow]);
  const nearbyResult = useMemo(() => nearby ? nearbyRecords(eligibleRecords, nearby.point, nearby.radius) : null, [eligibleRecords, nearby]);
  const nearbyDistanceByKey = useMemo(() => new Map(nearbyResult?.map(({record,distance}) => [record.key,distance]) || []), [nearbyResult]);
  const locatedRecords = useMemo(() => nearbyResult ? nearbyResult.map(item => item.record) : eligibleRecords, [nearbyResult, eligibleRecords]);
  const gpsDistanceByKey=useMemo(()=>new Map(gps?records.map(record=>[record.key,distanceKm(gps.point,coordinates(record))]).filter(([,distance])=>distance!==null):[]),[records,gps]);
  const distanceByKey=sorting[0]?.id==='proximity'||(!nearby&&gps)?gpsDistanceByKey:nearbyDistanceByKey;
  const matches = useMemo(() => filterRecords(locatedRecords, deferredFilters, { sort: false }), [locatedRecords, deferredFilters]);
  const draftCount = useMemo(() => mobileSearchOpen ? filterRecords(locatedRecords, { ...filters, search: deferredSearchDraft }, { sort: false }).length : 0, [locatedRecords, filters, deferredSearchDraft, mobileSearchOpen]);
  const columns = useMemo(() => [
    { id: 'proximity', accessorFn: record => gpsDistanceByKey.get(record.key) ?? Infinity, sortingFn: 'basic', header: 'Proximity' },
    { id: 'distance', accessorFn: record => nearbyDistanceByKey.get(record.key), sortUndefined: 'last', header: 'Distance' },
    { accessorKey: 'name', header: 'Place', sortingFn: 'alphanumeric' },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'area', header: 'Area' },
    { id: 'access', accessorFn: record => REPORT_RANK[record.access.group], header: 'Access' },
    { id: 'parking', accessorFn: record => REPORT_RANK[record.parking.group], header: 'Parking' },
    { id: 'dataset', accessorFn: record => record.dataset.name, header: 'Source' },
  ], [gpsDistanceByKey,nearbyDistanceByKey]);
  const table = useReactTable({
    data: matches,
    columns,
    state: { sorting, pagination, columnVisibility: { distance: false, proximity: false } },
    getRowId: record => record.key,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: update => {
      gpsRequest.current++;setGPSPending(false);setGeoMessage('');
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
  useEffect(()=>{
    function keys(event){
      const target=event.target;
      if(target?.closest?.('input,textarea,select,[contenteditable="true"],[role="slider"]')||document.querySelector('[role="dialog"],[role="alertdialog"]')||document.querySelector('.search-popover'))return;
      if(event.key==='?'&&!event.ctrlKey&&!event.metaKey){event.preventDefault();setToolsOpen(true);return;}
      if(!event.altKey||event.ctrlKey||event.metaKey)return;
      const key=event.key.toLowerCase();
      if(key==='pagedown'&&!loading){event.preventDefault();goToPage(Math.min(pageCount-1,pageIndex+1));}
      if(key==='pageup'&&!loading){event.preventDefault();goToPage(Math.max(0,pageIndex-1));}
      if(key==='m'){event.preventDefault();setView('map');}
      if(key==='l'){event.preventDefault();setView('list');}
      if(key==='s'){event.preventDefault();toggleSavedOnly();}
      if(key==='t'){event.preventDefault();setTripOpen(true);}
    }
    addEventListener('keydown',keys);return()=>removeEventListener('keydown',keys);
  },[pageIndex,pageCount,loading]);


  useEffect(() => {
    if (!loading && pagination.pageIndex !== pageIndex) setPagination(current => ({ ...current, pageIndex }));
  }, [loading, pageIndex, pagination.pageIndex]);

  useEffect(() => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) if (value) query.set(key, value);
    const sortText = sorting.filter(value=>value.id!=='proximity' && !(value.id==='distance' && nearby?.id==='gps')).map(value => `${value.id}:${value.desc ? 'desc' : 'asc'}`).join(',');
    if (sortText && sortText !== 'name:asc') query.set('sort', sortText);
    const urlPage = loading ? pagination.pageIndex : pageIndex;
    if (urlPage) query.set('page', String(urlPage + 1));
    if (pagination.pageSize !== 25) query.set('size', String(pagination.pageSize));
    if(hoursWindow)query.set('hours',`${hoursWindow.date},${hoursWindow.start},${hoursWindow.end}`);
    if (practical.length) query.set('features', practical.join(','));
    if (nearby && nearby.id !== 'gps') { query.set('near', nearby.id); query.set('radius', String(nearby.radius)); }
    if (view === 'map') query.set('view', 'map');
    if (savedOnly) query.set('saved', '1');
    query.set('needs', needs.enabled ? needs.ids.join(',') : '');
    if (selectedKey) query.set('record', selectedKey);
    history.replaceState(null, '', location.pathname + (query.size ? `?${query}` : ''));
  }, [filters, sorting, pageIndex, pagination.pageSize, selectedKey, view, savedOnly, needs, loading, pagination.pageIndex, practical, nearby, hoursWindow]);

  useEffect(() => {
    function restoreURL() {
      const next = readInitial();
      setFilters(next.filters); setSearchDraft(next.filters.search);
      setPractical(next.practical); setNearby(next.nearby); setHoursWindow(next.hoursWindow);
      gpsRequest.current++;setGPSPending(false);setGPS(null);setGeoMessage('');
      setView(next.view); setSavedOnly(next.savedOnly); setSorting(next.sorting);
      setPagination({ pageIndex: next.pageIndex, pageSize: next.pageSize });
      setSelectedKey(next.record);
      if (next.needs !== null) setNeeds({ ids: next.needs, enabled: next.needs.length > 0 });
    }
    addEventListener('popstate', restoreURL);
    return () => removeEventListener('popstate', restoreURL);
  }, []);

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
    setNeeds(current => ({ ...current, enabled: false }));
    setSavedOnly(false);
    setPractical([]); setNearby(null); setHoursWindow(null);
    gpsRequest.current++;setGPS(null);setGPSPending(false);setGeoMessage('');
    if(sorting.some(value=>['distance','proximity'].includes(value.id)))setSorting([{id:'name',desc:false}]);
    setFilters(DEFAULT_FILTERS);
    setPagination(current => ({ ...current, pageIndex: 0 }));
  }
  function openDetails(record, event) {
    detailTrigger.current = event.currentTarget;
    setSelectedKey(record.key);
  }
  function cellContent(record, column) {
    if (column === 'name') return <div className="place-cell"><IconButton className="save-place" variant="ghost" color={savedSet.has(record.key) ? 'blue' : 'gray'} aria-label={`${savedSet.has(record.key) ? 'Unsave' : 'Save'} ${record.name}`} aria-pressed={savedSet.has(record.key)} onClick={() => toggleSave(record.key)}>{savedSet.has(record.key) ? <BookmarkFilledIcon /> : <BookmarkIcon />}</IconButton><Button variant="ghost" className="place-name" onClick={event => openDetails(record, event)}><DrawingPinIcon /><span title={record.name}>{record.name}<HoursBadge record={record} now={now} />{distanceByKey.has(record.key) && <small>{distanceByKey.get(record.key).toFixed(1)} km straight line</small>}</span><ExternalLinkIcon className="row-open-icon" /></Button></div>;
    if (column === 'category') {
      const CategoryIcon = getCategoryIcon(record.category);
      return <span className="muted"><span className="category-label"><CategoryIcon aria-hidden="true" />{record.category}</span><small>{record.type !== record.category ? record.type : ''}</small></span>;
    }
    if (column === 'area') return <span>{record.area}<small>{record.address}</small></span>;
    if (column === 'access' || column === 'parking') return <ReportBadge value={record[column]} />;
    return <span className="muted source-name">{record.dataset.name}<EvidenceLabels record={record} /></span>;
  }
  const selectedRecord = records.find(record => record.key === selectedKey);
  const sortedRecords=table.getSortedRowModel().rows.map(row=>row.original);
  const selectedIndex=sortedRecords.findIndex(record=>record.key===selectedKey);
  const activeFilters = FILTERS.filter(filter => filters[filter.key]);
  const visibleRows = table.getRowModel().rows;
  const start = matches.length ? pageIndex * pagination.pageSize + 1 : 0;
  function updatePractical(next) { setPractical(next); setPagination(current => ({ ...current, pageIndex: 0 })); }
  function updateNearby(next) { gpsRequest.current++;setGPSPending(false);setGeoMessage('');setNearby(next); setSorting([{ id: next ? 'distance' : 'name', desc:false }]); setPagination(current => ({ ...current, pageIndex: 0 })); }
  function updateHoursWindow(next){setHoursWindow(next);setPagination(current=>({...current,pageIndex:0}));}
  async function changeSort(value) {
    const [id,direction]=value.split(':');
    const request=++gpsRequest.current;
    setGPSPending(false);setGeoMessage('');
    if(id!=='proximity'){table.setSorting([{id,desc:direction==='desc'}]);return;}
    setGPSPending(true);setGeoMessage('Finding your GPS location…');
    try {
      const position=await requestGPS();
      if(request!==gpsRequest.current)return;
      setGPS(position);setSorting([{id:'proximity',desc:false},{id:'name',desc:false}]);setPagination(current=>({...current,pageIndex:0}));
      setGeoMessage('Sorted nearest first using your GPS location. Distances are straight line; places without coordinates appear last.');
    } catch(error){if(request===gpsRequest.current)setGeoMessage(error.message);}
    finally{if(request===gpsRequest.current)setGPSPending(false);}
  }
  function clearGPS(){gpsRequest.current++;setGPS(null);setGPSPending(false);setGeoMessage('');if(nearby?.id==='gps')setNearby(null);if(sorting.some(value=>value.id==='proximity'||(value.id==='distance'&&nearby?.id==='gps')))table.setSorting([{id:'name',desc:false}]);setPagination(current=>({...current,pageIndex:0}));}
  function sortControl(){return <SearchSelect label="Sort" icon={CaretSortIcon} value={`${sorting[0]?.id || 'name'}:${sorting[0]?.desc ? 'desc' : 'asc'}`} options={mobileSortOptions} placeholder="Place · ascending" allowAll={false} onChange={changeSort} />;}
  function filterControls() {
    return <><Popover.Root><Popover.Trigger><Button variant={hoursWindow?'soft':'surface'} color={hoursWindow?'blue':'gray'}><ClockIcon />Hours</Button></Popover.Trigger><Popover.Content className="hours-popover" aria-label="Filter by opening hours" sideOffset={7} align="start"><HoursFilter value={hoursWindow} onChange={updateHoursWindow} /></Popover.Content></Popover.Root><Button variant={practical.length || nearby || hoursWindow ? "soft" : "surface"} color={practical.length || nearby || hoursWindow ? "blue" : "gray"} onClick={() => setVisitOpen(true)}><MagnifyingGlassIcon />Visit filters{(practical.length > 0 || nearby || hoursWindow) && <span className="control-count">{practical.length + (nearby ? 1 : 0) + (hoursWindow ? 1 : 0)}</span>}</Button><Button className="needs-trigger" variant={needs.enabled && needs.ids.length ? "soft" : "surface"} color={needs.enabled && needs.ids.length ? "blue" : "gray"} onClick={() => setNeedsOpen(true)}><AccessibilityIcon />My needs{needs.enabled && needs.ids.length > 0 && <span className="control-count">{needs.ids.length}</span>}</Button>{FILTERS.map(({key,...filter}) => <SearchSelect key={key} {...filter} getOptionIcon={key === 'category' ? getCategoryIcon : undefined} value={filters[key]} options={options[key]} onChange={value => updateFilter(key, value)} />)}</>;
  }
  const mobileSortOptions = [['proximity:asc','Nearest to me (GPS)'],...Object.entries(COLUMN_LABELS).filter(([key])=>key!=='proximity' && (key!=='distance'||nearby)).flatMap(([key, label]) => [[`${key}:asc`, `${label} · ascending`], [`${key}:desc`, `${label} · descending`]])];

  return <Theme className="app-theme" appearance={appearance} accentColor="blue" grayColor="slate" radius="medium">
    <Link className="skip-link" href="#results">Skip to places</Link>
    <header className="site-header"><div className="shell header-inner">
      <Link href={BASE} className="brand"><GlobeIcon className="brand-icon" width="23" height="23" /><span className="desktop-brand">Access Mauritius</span><span className="mobile-brand">Places</span></Link>
      <div className="header-actions"><IconButton variant="ghost" color="gray" aria-label="Saved places and tools" title="Saved places, backups and shortcuts (?)" onClick={()=>setToolsOpen(true)}><LayersIcon /></IconButton>{(activeFilters.length > 0 || filters.search || savedOnly || practical.length > 0 || nearby || hoursWindow || gps || (needs.enabled && needs.ids.length > 0)) && <IconButton className="mobile-clear-all" variant="ghost" color="gray" aria-label="Clear all filters" onClick={reset}><ResetIcon /></IconButton>}<Link href="https://github.com/RishiRajGujadhur/MauritiusInfo" className="data-link"><LayersIcon />Data<ExternalLinkIcon /></Link><label className="theme-switch"><span className="sr-only">Dark mode</span>{appearance === 'dark' ? <MoonIcon /> : <SunIcon />}<Switch size="1" aria-label="Dark mode" checked={appearance === 'dark'} onCheckedChange={checked => setAppearance(checked ? 'dark' : 'light')} /></label></div>
    </div></header>
    <main className="shell">
      <section className="workspace" aria-label="Find places">
        <div className="search-toolbar"><h1><DrawingPinIcon />Find a place</h1><TextField.Root ref={searchInput} aria-label="Search places" type="search" className="main-search" size="3" placeholder="Place, town or address" value={filters.search} onKeyDown={event=>{if(event.key==='Enter'&&!event.nativeEvent.isComposing)rememberSearch(filters.search);}} onChange={event => updateFilter('search', event.target.value)}>
          <TextField.Slot><MagnifyingGlassIcon width="19" height="19" /></TextField.Slot><TextField.Slot side="right">{filters.search ? <IconButton size="1" variant="ghost" color="gray" aria-label="Clear search" onClick={() => { updateFilter('search', ''); searchInput.current?.focus(); }}><Cross2Icon /></IconButton> : <kbd>/</kbd>}</TextField.Slot>
        </TextField.Root><Tooltip content="Access can change. Confirm the facilities you need with the venue before visiting."><IconButton variant="ghost" color="gray" aria-label="About access reports"><InfoCircledIcon width="18" height="18" /></IconButton></Tooltip></div>
        {!filters.search&&recentControls()}
        <div className="filters">{filterControls()}<div className="desktop-sort">{sortControl()}</div><Tooltip content="Clear search and filters"><IconButton variant="ghost" color="gray" aria-label="Reset filters" disabled={!activeFilters.length && !filters.search && !savedOnly && !practical.length && !nearby && !hoursWindow && !gps && !(needs.enabled && needs.ids.length)} onClick={reset}><ResetIcon /></IconButton></Tooltip></div>
        {activeFilters.length > 0 && <div className="active-filters" aria-label="Active filters">{activeFilters.map(filter => <Button key={filter.key} size="1" variant="soft" onClick={() => updateFilter(filter.key, '')} aria-label={`Remove ${filter.label} filter`}><filter.icon />{filter.label} · {options[filter.key].find(([key]) => key === filters[filter.key])?.[1] || filters[filter.key]}<Cross2Icon /></Button>)}</div>}
      </section>
      <section className="mobile-controls" aria-label="Place filters">
        <div className="mobile-filter-strip" ref={mobileFilterStrip}>
          {filterControls()}
          <SearchSelect label="Sort" icon={CaretSortIcon} value={`${sorting[0]?.id || 'name'}:${sorting[0]?.desc ? 'desc' : 'asc'}`} options={mobileSortOptions} placeholder="Name · ascending" allowAll={false} onChange={changeSort} />
          <SearchSelect label="Rows" icon={TableIcon} value={String(pagination.pageSize)} options={['25', '50', '100'].map(value => [value, value])} placeholder="25" allowAll={false} onChange={value => table.setPageSize(Number(value))} />
          {(activeFilters.length > 0 || filters.search || savedOnly || practical.length > 0 || nearby || hoursWindow || gps || (needs.enabled && needs.ids.length > 0)) && <Button className="mobile-reset" variant="ghost" color="gray" onClick={reset} aria-label="Reset filters"><ResetIcon />Clear</Button>}
        </div>
        {filters.search && <div className="mobile-query"><Button variant="ghost" color="gray" onClick={() => changeMobileSearchOpen(true)}><MagnifyingGlassIcon /><span>{filters.search}</span></Button><IconButton variant="ghost" color="gray" aria-label="Clear search" onClick={() => updateFilter('search', '')}><Cross2Icon /></IconButton></div>}
      </section>
      {!connected&&<p className="offline-banner" role="status">You are offline. External links and map backgrounds need a connection.</p>}
      {connected&&offlineMode&&<Button variant="soft" onClick={()=>setRetry(value=>value+1)}>Refresh online sources</Button>}
      {offlineMode && <p className="offline-banner" role="status">Saved offline copy · {records.length} downloaded places. Reconnect to refresh hours, reports and other data.<Button variant="soft" onClick={() => setRetry(value => value + 1)}>Retry connection</Button></p>}{tripWarning && <p role="status">{tripWarning}</p>}
      {(geoMessage||gps) && <div className="gps-summary"><p role="status">{geoMessage||'GPS location is active for this tab.'}{gps?.accuracy!=null&&` GPS accuracy: about ${Math.round(gps.accuracy)} m.`}</p>{gps&&<Button variant="ghost" size="1" onClick={clearGPS}>Clear GPS</Button>}{!gpsPending&&geoMessage&&!gps&&<Button variant="soft" size="1" onClick={()=>changeSort('proximity:asc')}>Try GPS again</Button>}</div>}
      {storageWarning && <p className="storage-warning" role="status">{storageWarning}</p>}
      {failures.length > 0 && <div className="load-error" role="alert"><InfoCircledIcon /><span>Some sources could not load. {records.length.toLocaleString()} records available.</span><Tooltip content={failures.join(', ')}><Button size="1" variant="soft" onClick={() => setRetry(value => value + 1)}><ResetIcon />Retry</Button></Tooltip></div>}
      <section id="results" tabIndex={-1} aria-label="Places">
        <div className="grid-toolbar"><p role="status" aria-live="polite">{loading ? 'Loading places…' : <><strong>{matches.length.toLocaleString()}</strong> {matches.length === 1 ? 'result' : 'results'} <span>· {records.length.toLocaleString()} source records</span></>}</p><div className={`grid-actions ${view === 'map' ? 'map-actions' : ''}`}><IconButton variant="ghost" color="gray" aria-label="Share filtered results" onClick={shareResults}><ExternalLinkIcon /></IconButton><Button className="mobile-view-button" variant="soft" onClick={()=>setView(view==='map'?'list':'map')} aria-label={view==='map'?'Show list':'Show map'}>{view==='map'?<RowsIcon />:<GlobeIcon />}</Button><Button size="2" variant="soft" onClick={() => setTripOpen(true)} aria-label="My trip"><DrawingPinIcon /><span>My trip</span>{trip.length > 0 && <span>{trip.length}</span>}</Button><Button className="saved-view-toggle" size="2" variant={savedOnly ? 'soft' : 'ghost'} color={savedOnly ? 'blue' : 'gray'} aria-pressed={savedOnly} onClick={toggleSavedOnly} aria-label={`Saved places (${savedKeys.length})`}>{savedOnly ? <BookmarkFilledIcon /> : <BookmarkIcon />}<span>Saved</span>{savedKeys.length > 0 && <span className="saved-count">{savedKeys.length}</span>}</Button><SegmentedControl.Root className="view-toggle" size="2" aria-label="Place view" value={view} onValueChange={setView}><SegmentedControl.Item value="list" aria-label="List view"><RowsIcon /><span className="view-label">List</span></SegmentedControl.Item><SegmentedControl.Item value="map" aria-label="Map view"><GlobeIcon /><span className="view-label">Map</span></SegmentedControl.Item></SegmentedControl.Root><Tooltip content="Row spacing"><SegmentedControl.Root className="density-toggle" size="1" value={density} aria-label="Row density" onValueChange={setDensity}><SegmentedControl.Item value="compact" aria-label="Compact rows"><RowsIcon /></SegmentedControl.Item><SegmentedControl.Item value="comfortable" aria-label="Comfortable rows"><SizeIcon /></SegmentedControl.Item></SegmentedControl.Root></Tooltip><Tooltip content="Download all filtered results in sort order"><Button variant="ghost" color="gray" size="1" aria-label="Export CSV" disabled={loading || !matches.length} onClick={() => downloadRows(table.getSortedRowModel().rows)}><DownloadIcon /><span>Export CSV</span></Button></Tooltip></div></div>
        {(practical.length > 0 || nearby || hoursWindow) && <p className="visit-active-summary">{practical.map(id => PRACTICAL_FILTERS.find(([key]) => key === id)?.[1]).join(' · ')}{nearby && ` · Within ${nearby.radius} km of ${nearby.name}`}{hoursWindow&&` · Open ${windowTime(hoursWindow.start)}–${windowTime(hoursWindow.end)} on ${hoursWindow.date} (Mauritius)`}<Button variant="ghost" size="1" onClick={() => setVisitOpen(true)}>Edit</Button></p>}
        {savedOnly && !loading && <p className="saved-explainer">Saved on this browser only.{!savedKeys.length && ' Open a place and tap Save place to start your shortlist.'}</p>}
        {needs.enabled && needs.ids.length > 0 && <p className="needs-summary">Matching all {needs.ids.length} selected needs · reported availability only<Button variant="ghost" size="1" onClick={() => setNeedsOpen(true)}>Edit</Button></p>}
        {view === 'map' ? <Suspense fallback={<div className="map-loading" role="status">Loading map…</div>}><MapView records={matches} gps={gps?.point} savedSet={savedSet} onToggleSave={toggleSave} onOpen={openDetails} onList={() => setView('list')} /></Suspense> : <>
        <div className="mobile-sort"><SearchSelect label="Sort" icon={CaretSortIcon} value={`${sorting[0]?.id || 'name'}:${sorting[0]?.desc ? 'desc' : 'asc'}`} options={mobileSortOptions} placeholder="Name · ascending" allowAll={false} onChange={changeSort} /></div>
        <div className={`grid-scroll ${density}`} tabIndex={0} role="region" aria-label="Location grid" aria-busy={loading}>
          <Table.Root className="places-table" variant="surface" size="1"><Table.Header>{table.getHeaderGroups().map(group => <Table.Row key={group.id}>{group.headers.map(header => {
            const direction = header.column.getIsSorted();
            const Icon = COLUMN_ICONS[header.id];
            const priority = sorting.findIndex(value => value.id === header.id);
            return <Table.ColumnHeaderCell key={header.id} aria-sort={direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none'}><Tooltip content="Click to sort. Shift-click to add another column."><Button size="1" variant="ghost" color="gray" className="sort-button" onClick={header.column.getToggleSortingHandler()} aria-label={`Sort by ${COLUMN_LABELS[header.id]}`}><Icon />{flexRender(header.column.columnDef.header, header.getContext())}{direction === 'asc' ? <ArrowUpIcon /> : direction === 'desc' ? <ArrowDownIcon /> : <CaretSortIcon className="sort-idle" />}{sorting.length > 1 && priority >= 0 && <sup>{priority + 1}</sup>}</Button></Tooltip></Table.ColumnHeaderCell>;
          })}</Table.Row>)}</Table.Header><Table.Body>
            {loading && !records.length ? Array.from({ length: 8 }, (_, index) => <Table.Row key={index}>{table.getVisibleLeafColumns().map(column => <Table.Cell key={column.id}><Skeleton height="16px" width={column.accessorKey === 'name' ? '80%' : '65%'} /></Table.Cell>)}</Table.Row>) : visibleRows.map(row => <Table.Row key={row.id}>{row.getVisibleCells().map(cell => <Table.Cell key={cell.id} data-label={COLUMN_LABELS[cell.column.id]} className={`column-${cell.column.id}`}>{cellContent(row.original, cell.column.id)}</Table.Cell>)}</Table.Row>)}
          </Table.Body></Table.Root>
          {!loading && !matches.length && <div className="empty"><MagnifyingGlassIcon width="27" height="27" /><h2>{savedOnly && !savedKeys.length ? "No saved places yet" : "No matching places"}</h2><p>Try another name or remove a filter.</p><Button variant="soft" onClick={reset}><ResetIcon />Reset filters</Button></div>}
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
              </Button><IconButton className="mobile-save-place" variant="ghost" color={savedSet.has(record.key) ? "blue" : "gray"} aria-label={`${savedSet.has(record.key) ? "Unsave" : "Save"} ${record.name}`} aria-pressed={savedSet.has(record.key)} onClick={() => toggleSave(record.key)}>{savedSet.has(record.key) ? <BookmarkFilledIcon /> : <BookmarkIcon />}</IconButton>
              <HoursBadge record={record} now={now} />{distanceByKey.has(record.key) && <small className="mobile-distance">{distanceByKey.get(record.key).toFixed(1)} km straight line</small>}<EvidenceLabels record={record} /><div className="mobile-place-status"><span>Access <ReportBadge value={record.access} /></span><span>Parking <ReportBadge value={record.parking} /></span></div>
            </article>;
          })}
          {!loading && !matches.length && <div className="empty"><MagnifyingGlassIcon width="28" height="28" /><h2>{savedOnly && !savedKeys.length ? "No saved places yet" : "No places found"}</h2><p>Try another search or clear your filters.</p><Button variant="soft" onClick={reset}>Clear filters</Button></div>}
        </div>
        <nav className="pagination" aria-label="Results pages"><span className="page-range">{start}–{Math.min(start + visibleRows.length - (start ? 1 : 0), matches.length)} of {matches.length.toLocaleString()}</span><div className="page-navigation"><IconButton variant="soft" color="gray" size="1" aria-label="First page" disabled={loading || !pageIndex} onClick={() => goToPage(0)}><DoubleArrowLeftIcon /></IconButton><IconButton variant="soft" color="gray" size="1" aria-label="Previous page" disabled={loading || !pageIndex} onClick={() => goToPage(pageIndex - 1)}><ArrowLeftIcon /></IconButton><label className="page-jump">Page<TextField.Root size="1" aria-label="Page number" type="number" min="1" max={pageCount} value={pageIndex + 1} onChange={event => table.setPageIndex(Math.min(pageCount - 1, Math.max(0, Number(event.target.value) - 1 || 0)))} /></label><span className="desktop-page-total">of {pageCount}</span><span className="mobile-page-indicator">Page {pageIndex + 1} of {pageCount}</span><IconButton variant="soft" color="gray" size="1" aria-label="Next page" disabled={loading || pageIndex >= pageCount - 1} onClick={() => goToPage(pageIndex + 1)}><ArrowRightIcon /></IconButton><IconButton variant="soft" color="gray" size="1" aria-label="Last page" disabled={loading || pageIndex >= pageCount - 1} onClick={() => goToPage(pageCount - 1)}><DoubleArrowRightIcon /></IconButton></div><SearchSelect label="Rows" icon={TableIcon} value={String(pagination.pageSize)} options={['25', '50', '100'].map(value => [value, value])} placeholder="25" allowAll={false} onChange={value => table.setPageSize(Number(value))} /></nav></>}
      </section>
      <footer><span className="footer-note">Source records may overlap. Unknown means details are missing.</span><Link href="https://github.com/RishiRajGujadhur/MauritiusInfo#readme">Sources & licences<ExternalLinkIcon /></Link><span className="footer-copyright">© OpenStreetMap contributors · ODbL. Open Data Mauritius via cyber.mu · CC BY-SA 4.0.</span></footer>
    </main>
    <Dialog.Root open={mobileSearchOpen} onOpenChange={changeMobileSearchOpen}>
      <nav className="mobile-bottom-bar" aria-label="Mobile search"><Dialog.Trigger><Button className="mobile-search-button" size="3" variant="surface"><MagnifyingGlassIcon width="22" height="22" />Search places</Button></Dialog.Trigger></nav>
      <Dialog.Content className="mobile-search-sheet" maxWidth="520px" onOpenAutoFocus={event => { event.preventDefault(); mobileSearchInput.current?.focus(); }}>
        <div className="mobile-search-heading"><Dialog.Title>Search places</Dialog.Title><Dialog.Close><IconButton variant="ghost" color="gray" aria-label="Close search"><Cross2Icon /></IconButton></Dialog.Close></div>
        <Dialog.Description className="sr-only">Search by place name, town or address. Your selected filters also apply.</Dialog.Description>
        <form onSubmit={event => { event.preventDefault(); updateFilter('search', searchDraft.trim()); rememberSearch(searchDraft);setMobileSearchOpen(false); scrollToResults(); }}>
          <TextField.Root ref={mobileSearchInput} size="3" type="search" enterKeyHint="search" autoComplete="off" aria-label="Search places on mobile" placeholder="Place, town or address" value={searchDraft} onChange={event => setSearchDraft(event.target.value)}>
            <TextField.Slot><MagnifyingGlassIcon width="21" height="21" /></TextField.Slot>
            {searchDraft && <TextField.Slot side="right"><IconButton type="button" variant="ghost" color="gray" aria-label="Clear mobile search" onClick={() => { setSearchDraft(''); mobileSearchInput.current?.focus(); }}><Cross2Icon /></IconButton></TextField.Slot>}
          </TextField.Root>
          {!searchDraft&&recentControls()}
          <Button className="mobile-search-submit" type="submit" size="3" disabled={loading}>{loading ? 'Loading places…' : `Show ${draftCount.toLocaleString()} results`}<ArrowRightIcon /></Button>
        </form>
      </Dialog.Content>
    </Dialog.Root>
    <CopyFallback text={copyFallback} onClose={()=>setCopyFallback('')} />
    {notice&&<div className="qol-toast" role="status"><span>{notice.message}</span>{notice.undo&&<Button size="1" variant="soft" onClick={()=>{notice.undo();setNotice(null);}}>Undo</Button>}<IconButton variant="ghost" color="gray" aria-label="Dismiss notification" onClick={()=>setNotice(null)}><Cross2Icon /></IconButton></div>}
    <Suspense fallback={<div className="detail-loading" role="status">Loading tools…</div>}>{toolsOpen&&<ToolsPanel onClose={()=>setToolsOpen(false)} records={records} savedKeys={savedKeys} onSaved={setSavedKeys} allowCleanup={!loading&&!failures.length&&!offlineMode} searches={searches} onSearches={setSearches} onRestore={restoreSearch} onOpen={openDetails} onSavedView={()=>{setSavedOnly(true);setPagination(current=>({...current,pageIndex:0}));}} onSavePage={()=>{setSavedKeys(current=>[...new Set([...current,...visibleRows.map(row=>row.original.key)])]);setNotice({message:'Current page added to saved places.'});}} onShare={shareResults} onExport={()=>downloadFile('access-mauritius-results.csv',recordsCSV(sortedRecords),'text/csv;charset=utf-8')} onTop={()=>{window.scrollTo({top:0});document.querySelector('.grid-scroll')?.scrollTo({top:0});}} />}</Suspense>
    <Suspense fallback={needsOpen ? <div className="detail-loading" role="status">Loading needs…</div> : null}>{needsOpen && <NeedsFilter needs={needs} onChange={updateNeeds} open={needsOpen} onOpenChange={setNeedsOpen} />}</Suspense>
    <Suspense fallback={<div className="detail-loading" role="status">Loading visit tools…</div>}>{visitOpen && <VisitFilters open={visitOpen} onClose={() => setVisitOpen(false)} selected={practical} onChange={updatePractical} nearby={nearby} onNearby={updateNearby} hoursWindow={hoursWindow} onHoursWindow={updateHoursWindow} />}{tripOpen && <TripPanel open={tripOpen} onClose={() => setTripOpen(false)} trip={trip} onChange={setTrip} records={records} savedKeys={savedKeys} onOpen={openDetails} offlineMode={offlineMode} />}</Suspense>
    <Suspense fallback={selectedKey ? <div className="detail-loading" role="status">Loading place details…</div> : null}>{selectedRecord && <PlaceDetails key={selectedRecord.key} record={selectedRecord} resultIndex={selectedIndex} resultCount={sortedRecords.length} onPrevious={selectedIndex>0?()=>setSelectedKey(sortedRecords[selectedIndex-1].key):null} onNext={selectedIndex>=0&&selectedIndex<sortedRecords.length-1?()=>setSelectedKey(sortedRecords[selectedIndex+1].key):null} now={now} onAddToTrip={() => { if (!trip.some(stop => stop.key === selectedRecord.key) && trip.length < 50) { setTrip(current => [...current,{key:selectedRecord.key,arrival:'',duration:60}]); if (!savedSet.has(selectedRecord.key)) toggleSave(selectedRecord.key); } }} tripFull={trip.length >= 50} inTrip={trip.some(stop => stop.key === selectedRecord.key)} saved={savedSet.has(selectedRecord.key)} onToggleSave={toggleSave} onClose={() => setSelectedKey(null)} triggerRef={detailTrigger} />}</Suspense>
  </Theme>;
}
