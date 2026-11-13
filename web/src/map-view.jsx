import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@radix-ui/themes';
import { EnterFullScreenIcon, RowsIcon } from '@radix-ui/react-icons';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { coordinates } from '../../place-tools.mjs';

const COLORS = {positive:'#17854a',limited:'#a46406',negative:'#c83138',unknown:'#64748b'};
export default function MapView({ records, onOpen, onList }) {
  const host = useRef(null), map = useRef(null), cluster = useRef(null), open = useRef(onOpen);
  const [tileError, setTileError] = useState(false);
  const plotted = useMemo(() => records.filter(record => coordinates(record)), [records]);
  open.current = onOpen;
  useEffect(() => {
    const instance = L.map(host.current, { scrollWheelZoom:false, zoomControl:true, maxZoom:19 }).setView([-20.2,57.55],10);
    map.current = instance;
    const tiles = L.tileLayer(import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom:19, attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    }).addTo(instance);
    tiles.on('tileerror', () => setTileError(true));
    cluster.current = L.markerClusterGroup({ chunkedLoading:false, maxClusterRadius:45, showCoverageOnHover:false, removeOutsideVisibleBounds:true, animate:false });
    cluster.current.addTo(instance);
    const resize = new ResizeObserver(() => instance.invalidateSize()); resize.observe(host.current);
    return () => { resize.disconnect(); instance.remove(); map.current = null; cluster.current = null; };
  }, []);
  useEffect(() => {
    const layer = cluster.current, instance = map.current;
    if (!layer || !instance) return;
    layer.clearLayers();
    const markers = plotted.map(record => {
      const group = record.access.group;
      const symbol = {positive:'✓', limited:'!', negative:'×', unknown:'?'}[group];
      const marker = L.marker(coordinates(record), {
        icon:L.divIcon({className:'place-map-marker',html:`<span style="background:${COLORS[group]}">${symbol}</span>`,iconSize:[30,36],iconAnchor:[15,36]}),
        title:record.name, alt:record.name, keyboard:true,
      });
      marker.on('add', () => marker.getElement()?.setAttribute('aria-label', `${record.name} · ${record.access.label}. Open place summary`));
      marker.bindPopup(() => {
        const container = document.createElement('div'); container.className = 'map-place-popup';
        const title = document.createElement('strong'); title.textContent = record.name;
        const location = document.createElement('p'); location.textContent = `${record.type || record.category} · ${record.area}`;
        const access = document.createElement('p'); access.textContent = `Access: ${record.access.label} · Parking: ${record.parking.label}`;
        const position = document.createElement('p'); position.textContent = record.raw.coordinate_method === 'geometry_bbox_centre' ? 'Position: centre of the mapped area; entrance may differ.' : record.raw.coordinate_basis === 'source_map_link_rounded' ? 'Position: rounded source map coordinates; entrance may differ.' : 'Position from the source map; entrance may differ.';
        const evidence = document.createElement('p'); evidence.textContent = (record.evidence || []).map(item => item.label).join(' · ');
        const button = document.createElement('button'); button.type = 'button'; button.textContent = 'View place'; button.addEventListener('click', event => open.current(record,event));
        container.append(title,location,access,evidence,position,button); return container;
      }, {maxWidth:300,minWidth:220});
      return marker;
    });
    layer.addLayers(markers);
    if (plotted.length) {
      const mainland = plotted.filter(record => coordinates(record)[1] < 60);
      const focus = plotted.length > 500 && mainland.length ? mainland : plotted;
      instance.fitBounds(L.latLngBounds(focus.map(coordinates)), {padding:[35,35],maxZoom:15,animate:false});
    }
    return () => { layer.clearLayers(); };
  }, [plotted]);
  return <section className="map-view" aria-label="Place map">
    <div className="map-summary"><p><strong>{plotted.length.toLocaleString()}</strong> mapped · {(records.length-plotted.length).toLocaleString()} without coordinates</p><div><Button variant="soft" color="gray" onClick={() => { if(plotted.length) map.current?.fitBounds(L.latLngBounds(plotted.map(coordinates)),{padding:[35,35],maxZoom:15}); }} disabled={!plotted.length}><EnterFullScreenIcon />Fit all</Button><Button variant="soft" color="gray" onClick={onList}><RowsIcon />List</Button></div></div>
    {tileError && <p className="map-notice" role="status">Map background could not load. Place markers are still available. Try the list view if needed.</p>}
    {!plotted.length && <p className="map-notice" role="status">No coordinates for these results. Use the list to view all matching places.</p>}
    <div ref={host} className="leaflet-host" aria-label="Interactive map of Mauritius and Rodrigues" />
    <div className="map-legend" aria-label="Wheelchair access legend"><span><i style={{background:COLORS.positive}}>✓</i>Reported yes</span><span><i style={{background:COLORS.limited}}>!</i>Limited</span><span><i style={{background:COLORS.negative}}>×</i>Reported no</span><span><i style={{background:COLORS.unknown}}>?</i>Unknown</span></div>
    <p className="form-note">Map shows all filtered records with coordinates, including Rodrigues. Fit all to include every island. Cluster numbers count records. Positions and accessibility reports may need checking.</p>
  </section>;
}
