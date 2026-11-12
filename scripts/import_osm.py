"""Build a separate ODbL Mauritius POI dataset from a Geofabrik .osm.pbf.

Usage: python import_osm.py input.osm.pbf output_directory --checked-date YYYY-MM-DD
Dependency: osmium==4.3.2. No geocoding or external calls during processing.
"""
import argparse, collections, csv, hashlib, json, math, pathlib, re, unicodedata
import osmium

AMENITIES=set('restaurant cafe fast_food food_court bar pub ice_cream marketplace bank atm bureau_de_change pharmacy hospital clinic doctors dentist veterinary social_facility public_building townhall courthouse police fire_station post_office library arts_centre community_centre cinema theatre college school university kindergarten childcare language_school music_school driving_school fuel charging_station parking parking_space bicycle_parking bus_station ferry_terminal taxi car_rental car_wash toilets place_of_worship grave_yard crematorium events_venue conference_centre internet_cafe payment_terminal'.split())
LEISURE=set('park garden playground sports_centre sports_hall stadium swimming_pool fitness_centre fitness_station golf_course miniature_golf marina nature_reserve water_park bowling_alley amusement_arcade recreation_ground beach_resort resort'.split())
TOURISM=set('hotel motel hostel guest_house apartment chalet camp_site caravan_site attraction museum gallery zoo aquarium theme_park viewpoint information picnic_site'.split())
REGIONS={'Black River':'West and south-west','Flacq':'East','Grand Port':'South and south-east','Moka':'Central plateau and Moka','Pamplemousses':'North','Plaines Wilhems':'Central plateau and Moka','Port Louis':'Port Louis','Savanne':'South and south-east','Riviere du Rempart':'North','Rodrigues':'Rodrigues','Agaléga':'Agalega','Saint Brandon':'Saint Brandon'}

def norm(s):
    return re.sub(r'[^a-z0-9]+','',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower())

def kind(t):
    if t.get('shop') and t['shop'] not in ('no','vacant','yes'):return 'shop',t['shop']
    if t.get('amenity') in AMENITIES:return 'amenity',t['amenity']
    if t.get('healthcare') and t['healthcare']!='no':return 'healthcare',t['healthcare']
    if t.get('tourism') in TOURISM:return 'tourism',t['tourism']
    if t.get('leisure') in LEISURE:return 'leisure',t['leisure']
    if t.get('natural')=='beach':return 'natural','beach'
    if t.get('office') and t['office'] not in ('no','vacant','yes'):return 'office',t['office']
    return None

class Collect(osmium.SimpleHandler):
    def __init__(self):
        super().__init__();self.records={};self.boundaries=[];self.errors=collections.Counter();self.geo=osmium.geom.GeoJSONFactory()
    def save(self,o,otype,lat,lon):
        t=dict(o.tags);k=kind(t);name=t.get('name') or t.get('name:en') or t.get('name:fr')
        if not k or not name or t.get('disused')=='yes' or t.get('abandoned')=='yes':return
        self.records[(otype,o.id)]={'osm_type':otype,'osm_id':o.id,'name':name,'latitude':lat,'longitude':lon,'category':k[0],'subcategory':k[1],'tags':t,'timestamp':o.timestamp.isoformat(),'version':o.version}
    def node(self,o):
        if o.tags and o.location.valid():self.save(o,'node',o.location.lat,o.location.lon)
    def way(self,o):
        if not (o.tags.get('name') or o.tags.get('name:en') or o.tags.get('name:fr')) or not kind(dict(o.tags)):return
        p=[(n.lat,n.lon) for n in o.nodes if n.location.valid()]
        if p:self.save(o,'way',(min(x[0] for x in p)+max(x[0] for x in p))/2,(min(x[1] for x in p)+max(x[1] for x in p))/2)
    def area(self,a):
        t=dict(a.tags)
        if t.get('boundary')=='administrative' and t.get('admin_level') in ('3','4'):
            try:self.boundaries.append({'name':t.get('name',''),'geometry':json.loads(self.geo.create_multipolygon(a))['coordinates'],'source_url':f'https://www.openstreetmap.org/relation/{a.orig_id()}'})
            except RuntimeError:self.errors['boundary_geometry']+=1
        if not a.from_way() and kind(t) and (t.get('name') or t.get('name:en') or t.get('name:fr')):
            try:
                coords=json.loads(self.geo.create_multipolygon(a))['coordinates'];pts=[p for poly in coords for ring in poly for p in ring]
                self.save(a,'relation',(min(p[1] for p in pts)+max(p[1] for p in pts))/2,(min(p[0] for p in pts)+max(p[0] for p in pts))/2)
                r=self.records.get(('relation',a.id))
                if r:r['osm_id']=a.orig_id();self.records[('relation',a.orig_id())]=self.records.pop(('relation',a.id))
            except RuntimeError:self.errors['poi_geometry']+=1

def in_ring(x,y,ring):
    inside=False
    for p,q in zip(ring,ring[1:]+ring[:1]):
        if (p[1]>y)!=(q[1]>y) and x<(q[0]-p[0])*(y-p[1])/(q[1]-p[1])+p[0]:inside=not inside
    return inside

def inside(lon,lat,polygons):
    return any(in_ring(lon,lat,p[0]) and not any(in_ring(lon,lat,h) for h in p[1:]) for p in polygons)

def distance(a,b):
    return math.hypot((a['latitude']-b['latitude'])*111195,(a['longitude']-b['longitude'])*111195*math.cos(math.radians(a['latitude'])))

def mapped(v):return {'yes':'mapped_yes','designated':'mapped_yes','no':'mapped_no','limited':'mapped_limited'}.get(v,'unknown')

def write_csv(path,rows,headers=None):
    if headers is None:headers=list(rows[0])
    with path.open('w',encoding='utf-8',newline='') as f:
        w=csv.DictWriter(f,fieldnames=headers);w.writeheader();w.writerows(rows)

def main():
    ap=argparse.ArgumentParser();ap.add_argument('pbf');ap.add_argument('output');ap.add_argument('--checked-date',required=True);args=ap.parse_args()
    out=pathlib.Path(args.output);out.mkdir(parents=True,exist_ok=True)
    h=Collect();h.apply_file(args.pbf,locations=True,idx='flex_mem')
    # Exact normalised name + category within 100m: retain richer object, log suppressed IDs.
    groups=collections.defaultdict(list);kept=[];duplicates=[]
    for r in sorted(h.records.values(),key=lambda r:(-len(r['tags']),r['osm_type'],r['osm_id'])):
        key=(norm(r['name']),r['category'],r['subcategory']);match=next((q for q in groups[key] if distance(r,q)<=100),None)
        if match:
            duplicates.append({'suppressed_osm_type':r['osm_type'],'suppressed_osm_id':r['osm_id'],'retained_record_id':f"OSM-{match['osm_type']}-{match['osm_id']}",'name':r['name'],'distance_m':round(distance(r,match),1),'rule':'normalised_name_category_within_100m','suppressed_source_url':f"https://www.openstreetmap.org/{r['osm_type']}/{r['osm_id']}",'suppressed_accessibility_tags_json':json.dumps({k:v for k,v in r['tags'].items() if 'wheelchair' in k or k in ('capacity:disabled','parking_space')},ensure_ascii=False,separators=(',',':'))})
        else:groups[key].append(r);kept.append(r)
    rows=[];observations=[]
    for r in sorted(kept,key=lambda r:(r['osm_type'],r['osm_id'])):
        t=r['tags'];districts=[b for b in h.boundaries if inside(r['longitude'],r['latitude'],b['geometry'])]
        district=districts[0]['name'] if len(districts)==1 else '';region=REGIONS.get(district,'Unknown');rid=f"OSM-{r['osm_type']}-{r['osm_id']}";url=f"https://www.openstreetmap.org/{r['osm_type']}/{r['osm_id']}"
        cap=t.get('capacity:disabled','');parking='unknown';bay_count=''
        if r['subcategory'] in ('parking','parking_space'):
            if cap.isdigit():bay_count=int(cap);parking='mapped_yes' if int(cap)>0 else 'mapped_no'
            elif cap=='no':parking='mapped_no'
            elif cap=='yes' or t.get('parking_space')=='disabled':parking='mapped_yes'
        fields={'wheelchair_access':mapped(t.get('wheelchair','')),'wheelchair_toilet':mapped(t.get('toilets:wheelchair','')),'wheelchair_parking':parking,'ramp':mapped(t.get('ramp:wheelchair',''))}
        relevant={k:v for k,v in t.items() if 'wheelchair' in k or k in ('capacity:disabled','parking_space','entrance','step_count','incline','surface','smoothness','kerb','access','check_date','survey:date')}
        for k,v in relevant.items():
            if 'wheelchair' in k or k in ('capacity:disabled','parking_space'):
                observations.append({'observation_id':f'{rid}:{k}','record_id':rid,'tag_key':k,'tag_value':v,'evidence_type':'osm_tag','source_url':url,'source_object_timestamp':r['timestamp'],'check_date_tag':t.get('check_date:wheelchair',t.get('check_date','')),'import_date':args.checked_date})
        rows.append({'record_id':rid,'place_name':r['name'],'region':region,'district':district,'region_basis':'osm_boundary_point_in_polygon' if district else 'unresolved','locality':t.get('addr:city',t.get('addr:suburb','')),'category':r['category'],'location_type':r['subcategory'],'latitude':round(r['latitude'],7),'longitude':round(r['longitude'],7),'coordinate_method':'osm_node' if r['osm_type']=='node' else 'geometry_bbox_centre','wheelchair_access':fields['wheelchair_access'],'wheelchair_parking':parking,'wheelchair_parking_bay_count':bay_count,'wheelchair_toilet':fields['wheelchair_toilet'],'ramp':fields['ramp'],'step_free_entrance':'unknown','lift':'unknown','wheelchair_seating':'unknown','parking_to_entrance_route':'unknown','has_accessibility_tag':str(any('wheelchair' in k or k=='capacity:disabled' for k in relevant)).lower(),'evidence_type':'osm_import','field_verified':'false','review_checked':'false','access_restriction':t.get('access',''),'source_url':url,'source_object_timestamp':r['timestamp'],'last_web_check':args.checked_date,'accessibility_tags_json':json.dumps(relevant,ensure_ascii=False,separators=(',',':'))})
    write_csv(out/'places.csv',rows)
    write_csv(out/'accessibility_tags.csv',observations,['observation_id','record_id','tag_key','tag_value','evidence_type','source_url','source_object_timestamp','check_date_tag','import_date'])
    write_csv(out/'duplicate_candidates.csv',duplicates,['suppressed_osm_type','suppressed_osm_id','retained_record_id','name','distance_m','rule','suppressed_source_url','suppressed_accessibility_tags_json'])
    timestamp=osmium.io.Reader(args.pbf).header().get('osmosis_replication_timestamp')
    meta={'import_date':args.checked_date,'extract_url':'https://download.geofabrik.de/africa/mauritius-latest.osm.pbf','extract_data_timestamp':timestamp,'pbf_sha256':hashlib.sha256(pathlib.Path(args.pbf).read_bytes()).hexdigest(),'licence':'ODbL-1.0','licence_url':'https://opendatacommons.org/licenses/odbl/1-0/','attribution':'© OpenStreetMap contributors','raw_selected_objects':len(h.records),'retained_records':len(rows),'suppressed_duplicate_candidates':len(duplicates),'rows_with_accessibility_tags':sum(r['has_accessibility_tag']=='true' for r in rows),'accessibility_tag_observations':len(observations),'regions':dict(collections.Counter(r['region'] for r in rows)),'categories':dict(collections.Counter(r['category'] for r in rows)),'geometry_errors':dict(h.errors),'boundary_names':[b['name'] for b in h.boundaries]}
    (out/'import_manifest.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(meta,ensure_ascii=False))

if __name__=='__main__':main()
