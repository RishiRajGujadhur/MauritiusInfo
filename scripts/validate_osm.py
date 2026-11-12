"""Validate exported CSV relationships, status mapping and recorded counts."""
import collections, csv, json, pathlib, sys

def validate(folder):
    root=pathlib.Path(folder)
    def read(name):
        with (root/name).open(encoding='utf-8',newline='') as f:
            rows=list(csv.DictReader(f))
        assert all(None not in r and all(v is not None for v in r.values()) for r in rows),name
        return rows
    places=read('places.csv');tags=read('accessibility_tags.csv');dupes=read('duplicate_candidates.csv')
    manifest=json.loads((root/'import_manifest.json').read_text(encoding='utf-8'))
    ids={p['record_id'] for p in places}
    assert len(ids)==len(places)==manifest['retained_records']
    assert len(dupes)==manifest['suppressed_duplicate_candidates']
    assert len(places)+len(dupes)==manifest['raw_selected_objects']
    assert len(tags)==manifest['accessibility_tag_observations']
    assert len({t['observation_id'] for t in tags})==len(tags)
    assert all(t['record_id'] in ids for t in tags)
    assert all(d['retained_record_id'] in ids and 0<=float(d['distance_m'])<=100 for d in dupes)
    assert all('OSM-'+d['suppressed_osm_type']+'-'+d['suppressed_osm_id'] not in ids for d in dupes)
    mapped={'yes':'mapped_yes','designated':'mapped_yes','no':'mapped_no','limited':'mapped_limited'}
    for p in places:
        assert p['place_name'].strip() and p['source_url'].startswith('https://www.openstreetmap.org/')
        assert -90<=float(p['latitude'])<=90 and -180<=float(p['longitude'])<=180
        assert p['field_verified']==p['review_checked']=='false'
        t=json.loads(p['accessibility_tags_json'])
        assert p['wheelchair_access']==mapped.get(t.get('wheelchair'),'unknown')
        assert p['wheelchair_toilet']==mapped.get(t.get('toilets:wheelchair'),'unknown')
        assert p['ramp']==mapped.get(t.get('ramp:wheelchair'),'unknown')
        assert all(p[f]=='unknown' for f in ('step_free_entrance','lift','wheelchair_seating','parking_to_entrance_route'))
        if p['wheelchair_parking']!='unknown':assert p['location_type'] in ('parking','parking_space')
        assert p['wheelchair_parking_bay_count']=='' or int(p['wheelchair_parking_bay_count'])>=0
    assert sum(p['has_accessibility_tag']=='true' for p in places)==manifest['rows_with_accessibility_tags']
    assert dict(collections.Counter(p['region'] for p in places))==manifest['regions']
    print(json.dumps({'valid':True,'places':len(places),'tags':len(tags),'duplicates':len(dupes),'wheelchair_access':dict(collections.Counter(p['wheelchair_access'] for p in places))}))

if __name__=='__main__':validate(sys.argv[1] if len(sys.argv)>1 else 'data/osm')
