#!/usr/bin/env python3
"""Genera web/articles/comptar-ocells/dades.js a partir de raw/ (vegeu fonts.md i raw/README.md)."""
import json, os, sys, math
HERE=os.path.dirname(os.path.abspath(__file__)); R=os.path.join(HERE,"raw")
sys.path.insert(0,R)
from geohash import decode
OUT=os.path.join(HERE,"../../web/articles/comptar-ocells/dades.js")
D={}
# 1. Cercles del recompte de Nadal, temporada 126 (només codi, nom i coordenades)
D["cercles"]=json.load(open(os.path.join(R,"circles126.json")))
# 3. Registres d'eBird per any (EOD a GBIF)
ey=json.load(open(os.path.join(R,"ebird_years.json")))
D["ebird"]=sorted([int(x["name"]),x["count"]] for x in ey["facets"][0]["counts"] if 2002<=int(x["name"])<=2025)
# 4. Oreneta vulgar: proporció mensual de registres d'eBird (cel·les geohash de 3 caràcters, 1,4°)
mg=json.load(open(os.path.join(R,"oreneta-gbif-ebird-mensual.json")))
MIN=100
cells={}
for m in range(1,13):
    sp=mg[f"9515886_{m}"]; al=mg[f"all_{m}"]
    for g,a in al.items():
        if a<MIN: continue
        lon,lat,_,_=decode(g)
        if lon>-30 or lat<-58: continue
        c=cells.setdefault(g,[round(lon,2),round(lat,2)]+[-1]*12)
        c[1+m]=round(10000*sp.get(g,0)/a)
D["oreneta"]=sorted(cells.values(),key=lambda c:(-c[1],c[0]))
# 5. SOCC: itineraris (centre, traça simplificada a ~8 punts i si té col·laborador actiu)
ss=json.load(open(os.path.join(R,"socc-itineraris.json")))
it=[]
for s in ss:
    pts=list(s["coords"])
    if len(pts)>8:
        k=(len(pts)-1)/7; pts=[pts[round(i*k)] for i in range(8)]
    it.append([s["name"],1 if s["active"] else 0,[[round(p[0],4),round(p[1],4)] for p in pts]])
D["socc"]=it
# 6. SOCC: indicadors per hàbitat 2002–2024
ind={}
for f in ("ind_specialist.json","ind_farmland.json"):
    for k,v in json.load(open(os.path.join(R,f))).items():
        ind[k]=[[x["year"],x["index"],x["lower"],x["upper"]] for x in v]
D["indicadors"]=ind
# 7. Rosenberg et al. 2019, taula 1: biomes de cria (milions, IC 95 %, %)
D["biomes"]=[ # nom, espècies, canvi (M), IC baix, IC alt, %
 ["Prats i pastures",31,-717.5,-763.9,-673.3,-53.3],["Bosc boreal",34,-500.7,-627.1,-381.0,-33.1],
 ["Generalistes de bosc",40,-482.2,-552.5,-413.4,-18.1],["Generalistes d'hàbitat",38,-417.3,-462.1,-371.3,-23.1],
 ["Boscos de l'est",63,-166.7,-185.8,-147.7,-17.4],["Boscos de l'oest",67,-139.7,-163.8,-116.1,-29.5],
 ["Tundra àrtica",51,-79.9,-131.2,-0.7,-23.4],["Zones àrides",62,-35.6,-49.7,-17.0,-17.0],
 ["Costes",38,-6.1,-18.9,8.5,-15.0],["Zones humides",95,20.6,8.3,35.3,13.0]]
js="/* «Comptar ocells» · dades dels gràfics, generades per research/comptar-ocells/dades.py. Fonts: research/comptar-ocells/fonts.md */\nwindow.OC="+json.dumps(D,ensure_ascii=False,separators=(",",":"))+";\n"
open(OUT,"w").write(js)
print("dades.js",len(js)//1024,"KB · cercles",len(D["cercles"]),"· oreneta",len(D["oreneta"]),"· socc",len(it))
mx=sorted(v for c in D["oreneta"] for v in c[2:] if v>0); print("freq quantils", [mx[int(len(mx)*q)] for q in (.5,.9,.98,.999)])
