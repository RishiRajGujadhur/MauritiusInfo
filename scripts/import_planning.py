"""Import traceable Mauritius visit-planning facts (never infer access from nearby objects).
Usage: python import_planning.py --pbf extract.osm.pbf --checked-date YYYY-MM-DD [--cache-dir DIR]
Requires osmium (scripts/requirements.txt) and pdftotext. HTML parsing uses stdlib only.
"""
import argparse, collections, csv, hashlib, html, json, pathlib, re, subprocess, urllib.request, xml.etree.ElementTree as ET
import osmium
from htmltree import Tree
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'data/planning'
DAYS=['Mo','Tu','We','Th','Fr','Sa','Su']
URLS={
 'padharo':'https://padharosa.littleindiaresto.com/',
 'padharo-contact':'https://padharosa.littleindiaresto.com/contact/',
 'ihg':'https://www.ihg.com/intercontinental/hotels/us/en/balaclava/mruma/hoteldetail/accessibility',
 'reports':'https://api.github.com/repos/RishiRajGujadhur/MauritiusInfo/issues?state=all&per_page=100',
 'ascencia':'https://www.ascenciamalls.com/opening-hours',
 'myt':'https://www.myt.mu/support/phpsqlajax_genxml.php',
 'mra':'https://eservices.mra.mu/home',
 'mra-checklist':'https://eservices.mra.mu/reqinfo',
 'holiday2026':'https://pmo.govmu.org/Communique/GN_No._611-Amendment_to_Public_Holidays_2026.pdf',
 'holiday2027':'https://dha.govmu.org/Communique/Public_Holidays_2027.pdf',
 'holiday-amendment':'https://statsmauritius.govmu.org/Pages/Statistics/Publication_Programme/Pub_Prog26.aspx',
}
TAGS=['opening_hours','phone','contact:phone','contact:whatsapp','website','contact:website','diet:vegetarian','diet:vegan','diet:egg_free','diet:ovo_vegetarian','air_conditioning','covered','outdoor_seating','toilets:wheelchair','wheelchair','entrance','step_count','surface','smoothness','check_date:opening_hours','check_date:phone','check_date','survey:date','description','wheelchair:description','payment:cash','payment:credit_cards','payment:debit_cards','fee']
class Collect(osmium.SimpleHandler):
 def __init__(self,ids):super().__init__();self.ids=ids;self.records={};self.locations=[]
 def inspect(self,o,kind):
  key=f'OSM-{kind}-{o.id}';t=dict(o.tags)
  if key in self.ids:
   facts={k:t[k] for k in TAGS if t.get(k)}
   if facts:self.records['osm:'+key]={'tags':facts,'source_url':f'https://www.openstreetmap.org/{kind}/{o.id}','source_object_timestamp':o.timestamp.isoformat(),'basis':'OpenStreetMap tags; not independently checked'}
 def node(self,o):
  self.inspect(o,'node');t=dict(o.tags)
  if t.get('place') in ['city','town','village','suburb'] and t.get('name') and o.location.valid():
   if -21<=o.location.lat<=-9 and 55<=o.location.lon<=65:self.locations.append({'id':str(o.id),'name':t['name'],'latitude':o.location.lat,'longitude':o.location.lon,'source_url':f'https://www.openstreetmap.org/node/{o.id}'})
 def way(self,o):self.inspect(o,'way')
 def relation(self,o):self.inspect(o,'relation')
def compact(v):return re.sub('[^a-z0-9]','',__import__('unicodedata').normalize('NFKD',v).encode('ascii','ignore').decode().lower())
def run():
 ap=argparse.ArgumentParser();ap.add_argument('--pbf',required=True);ap.add_argument('--checked-date',required=True);ap.add_argument('--cache-dir',default='/tmp/mauritius-planning-sources');args=ap.parse_args();OUT.mkdir(exist_ok=True);cache=pathlib.Path(args.cache_dir);cache.mkdir(parents=True,exist_ok=True)
 sources=[];failures=[]
 def get(name):
  url=URLS[name];ext='.pdf' if '.pdf' in url else '.xml' if name=='myt' else '.html';p=cache/(name+ext)
  if not p.exists():
   request=urllib.request.Request(url,headers={'User-Agent':'MauritiusInfo/1.0 (public directory facts; github.com/RishiRajGujadhur/MauritiusInfo)'})
   try:p.write_bytes(urllib.request.urlopen(request,timeout=25).read())
   except Exception as e:failures.append({'source':name,'error':str(e)});return None
  b=p.read_bytes();sources.append({'id':name,'url':url,'retrieved_date':args.checked_date,'sha256':hashlib.sha256(b).hexdigest(),'licence':'Published factual details; publisher retains page rights','parser':'import_planning.py'});return b
 existing=list(csv.DictReader((ROOT/'data/osm/places.csv').open()));h=Collect({r['record_id'] for r in existing});h.apply_file(args.pbf)
 for fact in h.records.values():fact['retrieved_date']=args.checked_date
 manifest=json.loads((ROOT/'data/osm/import_manifest.json').read_text());assert hashlib.sha256(pathlib.Path(args.pbf).read_bytes()).hexdigest()==manifest['pbf_sha256'],'PBF does not match existing record snapshot'
 sources.insert(0,{**{k:manifest[k] for k in ['extract_url','extract_data_timestamp','pbf_sha256','licence','licence_url','attribution']},'id':'osm','retrieved_date':args.checked_date})
 official=[];records=h.records;mall_schedules=[]
 b=get('ascencia')
 if b:
  tree=Tree(b.decode()).root;labels={n.attrs['data-tab']:n.text for n in tree.all('li') if 'data-tab' in n.attrs}
  for tab in tree.all(cls='opbanner__tabs--body'):
   mall=labels[tab.attrs['id']];groups=collections.defaultdict(list)
   for i,day in enumerate(tab.all(cls='opbanner__tabs--date')):
    assert len(tab.all(cls='opbanner__tabs--date'))==7,'Mall source structure changed'
    for li in day.all('li'):
     category=li.all(cls='date-name')[0].text;raw=li.all(cls='date-time')[0].text
     times=re.findall(r'(\d{1,2}):(\d{2})',raw);assert len(times)==2,(mall,raw)
     interval='-'.join(f'{int(a):02}:{b}' for a,b in times)
     groups[category].append(f'{DAYS[i]} {interval}')
     if i==6:groups[category].append(f'PH {interval}')
   for category,weekly in groups.items():mall_schedules.append({'mall':mall,'scope':category,'opening_hours':'; '.join(weekly),'source_url':URLS['ascencia'],'retrieved_date':args.checked_date})
   hours=next(v for v in mall_schedules if v['mall']==mall and v['scope']=='Shops')
   # Exact mall identity only. Never propagate mall schedules to its tenants.
   datasets=[('curated','data/places.csv','place_id','place_name'),('directory','data/directory/places.csv','record_id','place_name'),('osm','data/osm/places.csv','record_id','place_name')]
   aliases={compact(mall)}
   if mall=='Les Allées':aliases.add('lesalleeshelvetia')
   for ds,path,idfield,namefield in datasets:
    for row in csv.DictReader((ROOT/path).open()):
     if compact(row[namefield]) in aliases:
      key=ds+':'+row[idfield];base=records.setdefault(key,{'tags':{}})
      base.update({'opening_hours':hours['opening_hours'],'hours_scope':'Mall shops; individual tenants may differ','hours_source_url':URLS['ascencia'],'hours_checked_date':args.checked_date,'trading_schedules':[v for v in mall_schedules if v['mall']==mall]})
 b=get('myt')
 if b:
  for i,node in enumerate(ET.fromstring(b).findall('marker')):
   a=node.attrib;key='MYT-'+compact(a['name']);weekly=[]
   for day,name in zip(DAYS+['PH'],['monday','tuesday','wednesday','thursday','friday','saturday','sunday','publicholiday']):
    start,end=a.get(name+'_open',''),a.get(name+'_close','')
    if start=='00:00' and end=='00:00':weekly.append(day+' off')
    elif re.fullmatch(r'\d\d:\d\d',start) and re.fullmatch(r'\d\d:\d\d',end):weekly.append(f'{day} {start}-{end}')
    else:raise ValueError('Unknown myt hours format: '+str(a))
   official.append({'record_id':key,'place_name':a['name'],'category':'Telecom services','location_type':'Telecom shop','address':a['address'],'latitude':a['latitude'],'longitude':a['longitude'],'coordinate_method':'operator_store_locator','source_url':'https://www.myt.mu/support/store-locator','last_web_check':args.checked_date,'wheelchair_access':'unknown','wheelchair_parking':'unknown','field_verified':'false'})
   records['official:'+key]={'tags':{},'opening_hours':'; '.join(weekly),'hours_scope':'Branch trading hours; service cut-offs may differ','hours_source_url':'https://www.myt.mu/support/store-locator','hours_checked_date':args.checked_date,'source_url':URLS['myt'],'retrieved_date':args.checked_date,'services':['Telecom shop services; confirm the service with this branch before travelling.'],'service_notes':'Bill payment cut-offs may differ from shop hours. Check the operator locator.'}
 # MRA source-specific service and checklist links; do not copy tax guidance or assume branch facilities.
 b=get('mra')
 if b:
  text=Tree(b.decode()).root.text
  assert '207 6000' in text and '08 45' in text and '16 00' in text,'MRA source hours changed; review parser'
  key='MRA-EHRAM-HELPDESK';official.append({'record_id':key,'place_name':'MRA e-services helpdesk — Ehram Court','category':'Government services','location_type':'Taxpayer helpdesk','address':'Ehram Court, Cnr Sir Virgil Naz & Mgr Gonin Streets, Port Louis','latitude':'','longitude':'','coordinate_method':'not_provided','source_url':URLS['mra'],'last_web_check':args.checked_date,'wheelchair_access':'unknown','wheelchair_parking':'unknown','field_verified':'false'})
  records['official:'+key]={'tags':{'phone':'+230 207 6000','website':URLS['mra']},'opening_hours':'Mo-Fr 08:45-16:00; Sa-Su off; PH off','hours_scope':'Published MRA e-services support/office hours','hours_source_url':URLS['mra'],'hours_checked_date':args.checked_date,'source_url':URLS['mra'],'retrieved_date':args.checked_date,'services':['Individual income-tax e-filing assistance','Remote assistance by appointment'],'appointment_url':'https://eservices.mra.mu/e-appointment/index.html','documents_url':URLS['mra-checklist'],'service_notes':'Prepare identification, income and deduction information and refund bank details using the official checklist. Appointment link is for remote assistance; in-person arrangements must be confirmed.','payment_notes':'Official e-payment options are linked from the MRA website; confirm payment methods for your service.'}
 b=get('padharo')
 if b:
  tree=Tree(b.decode()).root;text=tree.text
  assert 'pure vegetarian' in text.lower() and '+230-58824444' in text,'Restaurant source changed'
  key='PADHARO-SA-CENTREPOINT'
  official.append({'record_id':key,'place_name':"Padharo Sa by Jain's Little India — CentrePoint",'category':'Restaurant','location_type':'Vegetarian restaurant','address':'CentrePoint, Mauritius; contact venue for arrival instructions','latitude':'','longitude':'','coordinate_method':'not_provided','source_url':URLS['padharo'],'last_web_check':args.checked_date,'wheelchair_access':'unknown','wheelchair_parking':'unknown','field_verified':'false'})
  records['official:'+key]={'tags':{'phone':'+230 5882 4444','website':URLS['padharo'],'diet:vegetarian':'only'},'source_url':URLS['padharo'],'retrieved_date':args.checked_date,'diet_notes':'Operator describes a pure vegetarian restaurant. Eggs and vegan options are not confirmed.','hours_note':'Operator footer says Sunday to Monday 11AM–9.30PM, with an everyday 3–5PM break. The day range is ambiguous; confirm trading days before travelling.'}
  b=get('padharo-contact')
  if b:
   contact=Tree(b.decode()).root
   whatsapp=next((a.attrs.get('href') for a in contact.all('a') if re.match(r'https://(?:wa.me/|api.whatsapp.com/send)',a.attrs.get('href',''))),None)
   if whatsapp:
    match=re.search(r'(?:wa.me/|phone=)([+0-9]+)',whatsapp)
    if match:records['official:'+key]['tags']['contact:whatsapp']='+'+match[1].lstrip('+')
 b=get('ihg')
 if b:
  text=Tree(b.decode()).root.text
  assert 'Flat terrain between parking and entrance' in text and 'Parking drop off point adjacent to entrance' in text,'Arrival source changed'
  fact=records.setdefault('osm:OSM-node-528903259',{'tags':{}})
  fact.update({'arrival_notes':'The operator reports flat terrain from parking to the entrance, accessible parking and ramp access. These are operator statements, not a checked route.','drop_off_notes':'Operator reports a parking drop-off point adjacent to the entrance; call ahead for assistance and transfer arrangements.','arrival_source_url':URLS['ihg'],'arrival_checked_date':args.checked_date})
 reports=[]
 b=get('reports')
 if b:
  issues=json.loads(b)
  if not isinstance(issues,list):raise ValueError('Invalid public issues response')
  for issue in issues:
   if 'pull_request' in issue:continue
   match=re.search(r'Record:\s*([^\s]+)',issue.get('body') or '')
   if match and re.match(r'^(osm|curated|shops|directory|health|services|offices|entertainment|festivals|official):',match[1]):
    reports.append({'record_key':match[1],'title':issue['title'][:200],'url':issue['html_url'],'updated_at':issue['updated_at'],'state':issue['state'],'verification':'Visitor submission; not verified. Closed does not mean confirmed.'})
 (OUT/'reports.json').write_text(json.dumps({'reports':reports,'retrieved_date':args.checked_date,'source_url':URLS['reports'],'coverage':'First 100 issues (including pull requests); refresh importer for newer reports.'},ensure_ascii=False,indent=2)+'\n')
 holidays=[];months={n:i+1 for i,n in enumerate(['January','February','March','April','May','June','July','August','September','October','November','December'])}
 for year in [2026,2027]:
  b=get('holiday'+str(year))
  if not b:continue
  pdf=cache/f'holiday{year}.pdf';txt=subprocess.check_output(['pdftotext','-layout',str(pdf),'-'],text=True)
  pattern=r'^\s*(.*?)\s{2,}(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(\d{2})\s+([A-Za-z]+)(\*{0,2})\s*$'
  pending=''
  for line in txt.splitlines():
   match=re.match(pattern,line)
   if match:
    name,day,month,stars=match.groups();name=name.strip() or pending or 'Public holiday';pending=name
    holidays.append({'date':f'{year}-{months[month]:02}-{day}','name':name.replace('*',''),'tentative':'Eid' in name,'source_url':URLS['holiday'+str(year)],'retrieved_date':args.checked_date})
  if sum(x['date'].startswith(str(year)) for x in holidays)<14:raise ValueError('Holiday PDF structure changed: '+str(year))
 b=get('holiday-amendment')
 if b and '9 November 2026' in Tree(b.decode()).root.text:
  holidays.append({'date':'2026-11-09','name':'Public holiday following Divali','tentative':False,'source_url':URLS['holiday-amendment'],'retrieved_date':args.checked_date})
 for file,obj in [('records.json',{'schemaVersion':1,'checkedDate':args.checked_date,'records':records}),('locations.json',sorted(h.locations,key=lambda r:r['name'])),('mall-hours.json',mall_schedules),('holidays.json',{'years':sorted({int(h['date'][:4]) for h in holidays}),'holidays':sorted(holidays,key=lambda r:r['date'])})]:
  (OUT/file).write_text(json.dumps(obj,ensure_ascii=False,separators=(',',':'))+'\n')
 with (OUT/'official-places.csv').open('w',newline='') as f:
  w=csv.DictWriter(f,fieldnames=list(official[0]));w.writeheader();w.writerows(official)
 report={'checked_date':args.checked_date,'sources':sources,'failures':failures,'enriched_records':len(records),'official_records':len(official),'osm_opening_hours':sum(bool(v.get('tags',{}).get('opening_hours')) for v in records.values()),'towns':len(h.locations),'holidays':len(holidays),'notes':['OSM source snapshot is dated separately from extraction. Retrieval does not mean field verification.','No accessibility, dietary, contact or hours inheritance from parent malls or nearby objects.','Complex OSM expressions remain verbatim; app must not claim open/closed unless parsed.']}
 (OUT/'import-manifest.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='sources'},ensure_ascii=False))
if __name__=='__main__':run()
