import json,math,sys
S=sys.argv[1]
g=json.load(open(S+'/build/gnt.json')); p=json.load(open(S+'/build/par.json')); l=json.load(open(S+'/build/llocs.json'))
pal=json.load(open(S+'/geo/palestina.topo.json'))
pal['objects']={'land':pal['objects']['land_p'],'lakes':pal['objects']['lakes_p2'],'rivers':pal['objects']['riv_p2']}; med=json.load(open(S+'/geo/med.topo.json'))
def km(a,b):
    R=6371; la1,lo1,la2,lo2=map(math.radians,[a[0],a[1],b[0],b[1]])
    h=math.sin((la2-la1)/2)**2+math.cos(la1)*math.cos(la2)*math.sin((lo2-lo1)/2)**2
    return 2*R*math.asin(math.sqrt(h))
C={'Jerusalem':(31.778,35.235),'Damasc':(33.513,36.292),'Antioquia':(36.202,36.160),'Tars':(36.917,34.893),'Efes':(37.941,27.341),'Corint':(37.906,22.879),'Cèncrees':(37.884,22.990),'Tessalònica':(40.640,22.935),'Filips':(41.013,24.284),'Roma':(41.893,12.483),'Cesarea':(32.500,34.892),'Ancira':(39.93,32.86)}
print({k:round(km(C['Jerusalem'],v)) for k,v in C.items()})
print('Cencrees-Roma',round(km(C['Cèncrees'],C['Roma'])),'Corint-Jer',round(km(C['Corint'],C['Jerusalem'])),'Efes-Corint',round(km(C['Efes'],C['Corint'])))
wp=[(32.881,35.575),(32.35,35.60),(31.871,35.444),(31.771,35.262),(31.778,35.235)]
print('ruta Marc',round(sum(km(wp[i],wp[i+1]) for i in range(len(wp)-1))))
print('Natz-Jer',round(km((32.702,35.297),(31.778,35.235))),'Natz-Betlem',round(km((32.702,35.297),(31.705,35.202))),'Natz-Cafarn',round(km((32.702,35.297),(32.881,35.575))),'Natz-Sef',round(km((32.702,35.297),(32.753,35.279))))
e=json.load(open(S+'/build/eus.json'))
D=dict(eus=e,gnt=g,par=p,llocs=l['llocs'],regions=l['regions'],geoP=pal,geoM=med,
 cartes=[{'k':'1Te','nom':'1 Tessalonicencs','w':1473,'ciutat':'Tessalònica'},{'k':'Ga','nom':'Gàlates','w':2226,'ciutat':'Galàcia'},{'k':'1Co','nom':'1 Corintis','w':6812,'ciutat':'Corint'},{'k':'2Co','nom':'2 Corintis','w':4473,'ciutat':'Corint'},{'k':'Fl','nom':'Filipencs','w':1626,'ciutat':'Filips'},{'k':'Flm','nom':'Filèmon','w':334,'ciutat':None},{'k':'Rm','nom':'Romans','w':7055,'ciutat':'Roma'}],
 nt=[['Mt',18329],['Mc',11085],['Lc',19446],['Jn',15438],['Ac',18412],['Rm',7055],['1Co',6812],['2Co',4473],['Ga',2226],['Ef',2416],['Fl',1626],['Col',1580],['1Te',1473],['2Te',820],['1Tm',1591],['2Tm',1235],['Tt',659],['Flm',334],['He',4935],['Jm',1739],['1Pe',1678],['2Pe',1098],['1Jn',2137],['2Jn',245],['3Jn',219],['Jud',459],['Ap',9833]])
open(sys.argv[2],'w').write('/* Dades de l\'article «Una vida, quatre evangelis». Generades per research/jesus-i-els-quatre-evangelis/scripts a partir de MorphGNT SBLGNT 6.12 i Natural Earth. */\nwindow.EVG='+json.dumps(D,ensure_ascii=False,separators=(',',':'))+';\n')
