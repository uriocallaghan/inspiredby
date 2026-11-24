import urllib.request, os, json, sys, time
sys.path.insert(0,'pylib')
import mapbox_vector_tile as m
DS="4fa7b334-ce0d-4e88-aaae-2e0c138d049e"
def get(z,x,y,month,taxon=None):
    fn=f"mvt/{taxon or 'all'}_{month}_{x}_{y}.mvt"
    if not os.path.exists(fn):
        u=f"https://api.gbif.org/v2/map/occurrence/adhoc/{z}/{x}/{y}.mvt?srs=EPSG:4326&datasetKey={DS}&month={month}&mode=GEO_CENTROID"+(f"&taxonKey={taxon}" if taxon else "")
        for t in range(4):
            try:
                open(fn,'wb').write(urllib.request.urlopen(u,timeout=120).read()); break
            except Exception as e: print("retry",e); time.sleep(3)
    d=m.decode(open(fn,'rb').read()).get('occurrence',{'features':[]})['features']
    return {f['properties']['geohash']:f['properties']['total'] for f in d}
taxon=sys.argv[1]
out={}
for month in range(1,13):
    for who in (taxon,None):
        acc={}
        for x in (0,1):
            for y in (0,1):
                acc.update(get(1,x,y,month,who))
        out[f"{who or 'all'}_{month}"]=acc
    print(month, len(out[f'{taxon}_{month}']), len(out[f'all_{month}']), flush=True)
json.dump(out,open(f"mig_{taxon}.json","w"))
