"""Genera web/sistema/dades-map-new.js per a MAP-20 i MAP-21 (peces del 22-11-2026).
MAP-20: dipositants de la Volta de Svalbard (Seed Portal de NordGen, llista desada el 20-11-2026 a
        research/les-llavors-de-leningrad/svalbard-dipositants.csv), sumats pel país de la seu (prefix del codi WIEWS).
MAP-21: casos de còlera notificats a l'OMS per país i any, 1949–2024 (Our World in Data, actualització 18-08-2026,
        research/el-mapa-del-colera/raw/owid-cases.csv). Només països (codi ISO real), sense regions de l'OMS."""
import csv, json, re
from collections import defaultdict
R='research/'
iso=json.load(open(R+'el-mapa-del-colera/raw/iso-num.json'))
# noms catalans: la taula de països de «El forat de l'ozó»
oz=open('web/articles/el-forat-de-l-ozo/dades.js').read()
ca={en:c for c,en in re.findall(r'\["([^"]+)","([^"]+)","\d{4}-\d\d-\d\d"',oz)}
extra={"Democratic Republic of Congo":"República Democràtica del Congo","Congo":"Congo","Cote d'Ivoire":"Costa d'Ivori",
 "United States":"Estats Units","United Kingdom":"Regne Unit","Russia":"Rússia","South Korea":"Corea del Sud","North Korea":"Corea del Nord",
 "Taiwan":"Taiwan","Palestine":"Palestina","Hong Kong":"Hong Kong","Macao":"Macau","Iran":"Iran","Syria":"Síria","Laos":"Laos",
 "Vietnam":"Vietnam","Tanzania":"Tanzània","Bolivia":"Bolívia","Venezuela":"Veneçuela","Moldova":"Moldàvia","Micronesia (country)":"Micronèsia",
 "Cape Verde":"Cap Verd","Eswatini":"Eswatini","Timor":"Timor Oriental","East Timor":"Timor Oriental","Brunei":"Brunei","Czechia":"Txèquia",
 "North Macedonia":"Macedònia del Nord","Turkey":"Turquia","Myanmar":"Myanmar","Haiti":"Haití","Yemen":"Iemen","Peru":"Perú","Central African Republic":"República Centreafricana","Dominican Republic":"República Dominicana",
 "Equatorial Guinea":"Guinea Equatorial","Guam":"Guam","South Sudan":"Sudan del Sud","Turks and Caicos Islands":"Illes Turks i Caicos",
 "Bolivia, Plurinational State of":"Bolívia","Bosnia and Herzegovina":"Bòsnia i Hercegovina","Korea, Democratic People's Republic of":"Corea del Nord",
 "Korea, Republic of":"Corea del Sud","Netherlands, Kingdom of the":"Països Baixos","Palestine, State of":"Palestina","Russian Federation":"Rússia",
 "Syrian Arab Republic":"Síria","Taiwan, Province of China":"Taiwan","United Kingdom of Great Britain and Northern Ireland":"Regne Unit"}
def nom(en): return extra.get(en) or ca.get(en) or en
# MAP-20
sv=defaultdict(int); nInst=0
for x in csv.DictReader(open(R+'les-llavors-de-leningrad/svalbard-dipositants.csv')):
    sv[x['codi'][:3]]+=int(x['mostres'].replace(',','')); nInst+=1
en={x['alpha-3']:x['name'] for x in csv.DictReader(open(R+'el-mapa-del-colera/raw/iso.csv'))}
svalbard={iso[k].lstrip('0'):{"n":nom(en[k]),"v":v} for k,v in sv.items() if k in iso}
miss=[k for k in sv if k not in iso]
# MAP-21
ch=defaultdict(dict); names={}
for x in csv.DictReader(open(R+'el-mapa-del-colera/raw/owid-cases.csv')):
    c=x['code']
    if c not in iso: continue
    n=iso[c].lstrip('0'); ch[n][int(x['year'])]=int(float(x['cholera_reported_cases'])); names[n]=nom(x['entity'])
cholera={n:{"n":names[n],"v":";".join(f"{y}:{v}" for y,v in sorted(d.items()))} for n,d in ch.items()}
untrans=sorted(v for k,v in names.items() if v==[e for e in [v]][0] and v not in ca.values() and v not in extra.values())
out=("/* Dades reals per a MAP-20 i MAP-21 (peces del 22-11-2026). Generat amb research/sistema/build-peces-22-11.py.\n"
 "   svalbard: mostres dipositades a la Volta de Svalbard per país de la seu del dipositant (id numèric ISO 3166 = id de world-atlas);\n"
 f"             Seed Portal de NordGen, llista desada el 20-11-2026 ({nInst} dipositants, {sum(sv.values())} mostres).\n"
 "   cholera:  casos de còlera notificats a l'OMS per país i any, 1949–2024 (Our World in Data, 18-08-2026). «v» = any:casos;…\n"
 "             Un any sense dada vol dir que el país no en va notificar. */\n"
 "window.IBNEW="+json.dumps({"svalbard":svalbard,"svTotal":sum(sv.values()),"svInst":nInst,"cholera":cholera},ensure_ascii=False,separators=(',',':'))+";\n")
open('web/sistema/dades-map-new.js','w').write(out)
print('sense iso:',miss); print('noms sense traduir:',untrans); print(len(out))
