import sys,json,re,csv,numpy as np,gsw,netCDF4 as nc
sys.path.insert(0,'.')
from woa import parse
R='/Users/uriocallaghan/Documents/Claude Code/InspiredBy Magazine/research/cinta-transportadora/'
A='/Users/uriocallaghan/Documents/Claude Code/InspiredBy Magazine/web/articles/cinta-transportadora/'
def sig0(S,T,lat,lon,p=0):
  SA=gsw.SA_from_SP(S,p,lon,lat);CT=gsw.CT_from_t(SA,T,p);return gsw.sigma0(SA,CT)
OUT={}
# ---- surface grid
lat=np.arange(-70.5,88.6,1.0);lon=np.arange(-110.5,49.6,1.0)
T=parse('sfc_t.txt',(1,1,160,161))[0,0];S=parse('sfc_s.txt',(1,1,160,161))[0,0]
LA,LO=np.meshgrid(lat,lon,indexing='ij')
SG=sig0(S,T,LA,LO)
with open(R+'woa23-superficie-atlantic-1deg.csv','w') as f:
  f.write('lat,lon,temp_c,salinitat_psu,sigma0_kgm3\n')
  for i in range(len(lat)):
    for j in range(len(lon)):
      if not np.isnan(T[i,j]) and not np.isnan(S[i,j]): f.write('%.1f,%.1f,%.2f,%.3f,%.3f\n'%(lat[i],lon[j],T[i,j],S[i,j],SG[i,j]))
# 2-degree subsample for the page: store as flat arrays row-major lat (from -70.5 step 2) x lon (-110.5 step 2)
li=np.arange(0,160,2);lj=np.arange(0,161,2)
def pack(a,d,scale):
  out=[]
  for i in li:
    for j in lj:
      v=a[i,j]; out.append(None if np.isnan(v) else round(float(v)*scale)/scale)
  return out
GT=parse('gl_t.txt',(1,1,90,180))[0,0];GS=parse('gl_s.txt',(1,1,90,180))[0,0]
def pk(a,sc): return [None if np.isnan(v) else round(float(v)*sc)/sc for v in a.ravel()]
OUT['sfc']={'lat0':-88.5,'lon0':-179.5,'d':2,'nlat':90,'nlon':180,'t':pk(GT,10),'s':pk(GS,10)}
print('global surface ok',np.nanmin(GT),np.nanmax(GS))
# ---- section 25.5W
depth=np.array([float(x) for x in re.search(r't_an.depth\[102\]\n([^\n]*)',open('sec_t.txt').read()).group(1).split(',')])
slat=np.arange(-70.5,64.6,1.0)
tt=parse('sec_t.txt',(1,102,136,1))[0,:,:,0];ss=parse('sec_s.txt',(1,102,136,1))[0,:,:,0]
P=gsw.p_from_z(-depth[:,None],slat[None,:])
SA=gsw.SA_from_SP(ss,P,-25.5,slat[None,:]);CT=gsw.CT_from_t(SA,tt,P);PT=gsw.pt0_from_t(SA,tt,P);g0=gsw.sigma0(SA,CT)
with open(R+'woa23-tall-25W.csv','w') as f:
  f.write('lat,profunditat_m,temp_c,temp_potencial_c,salinitat_psu,sigma0_kgm3\n')
  for k in range(102):
    for i in range(len(slat)):
      if not np.isnan(tt[k,i]) and not np.isnan(ss[k,i]): f.write('%.1f,%.0f,%.3f,%.3f,%.3f,%.3f\n'%(slat[i],depth[k],tt[k,i],PT[k,i],ss[k,i],g0[k,i]))
keep=[k for k,dd in enumerate(depth) if dd<=100 and dd%25==0 or 100<dd<=2000 and dd%100==0 or dd>2000 and dd%200==0]
OUT['sec']={'lat':[float(x) for x in slat],'depth':[float(depth[k]) for k in keep],
  't':[[None if np.isnan(v) else round(float(v),1) for v in PT[k]] for k in keep],
  's':[[None if np.isnan(v) else round(float(v),2) for v in ss[k]] for k in keep]}
# ---- winter profiles
def prof(ft,fs,la,lo):
  t=parse(ft,(1,102,3,3))[0];s=parse(fs,(1,102,3,3))[0]
  t=np.nanmean(t.reshape(102,-1),1);s=np.nanmean(s.reshape(102,-1),1)
  ok=~np.isnan(t)&~np.isnan(s)
  P=gsw.p_from_z(-depth,la);SA=gsw.SA_from_SP(s,P,lo,la);CT=gsw.CT_from_t(SA,t,P);PT=gsw.pt0_from_t(SA,t,P)
  return depth[ok],PT[ok],s[ok],gsw.sigma0(SA,CT)[ok],t[ok]
import warnings;warnings.simplefilter('ignore')
for name,ft,fs,la,lo in [('labrador','lab_t13.txt','lab_s13.txt',57.5,-52.5),('groenlandia','grs_t13.txt','grs_s13.txt',75.5,-0.5)]:
  d,pt,s,g,t=prof(ft,fs,la,lo)
  with open(R+'woa23-perfil-hivern-%s.csv'%name,'w') as f:
    f.write('profunditat_m,temp_potencial_c,salinitat_psu,sigma0_kgm3\n')
    for row in zip(d,pt,s,g): f.write('%.0f,%.3f,%.3f,%.3f\n'%row)
  OUT['prof_'+name]={'d':[float(x) for x in d],'t':[round(float(x),2) for x in pt],'s':[round(float(x),3) for x in s],'g':[round(float(x),3) for x in g]}
  print(name,'surface',pt[0],s[0],g[0],'1000m',pt[d==1000],s[d==1000],g[d==1000],'max depth',d[-1],g[-1])
# point lookups
def at(la,lo):
  i=int(round(la+70.5));j=int(round(lo+110.5));return T[i,j],S[i,j],SG[i,j]
for n,la,lo in [('Florida',25.5,-79.5),('Florida2',26.5,-79.5),('GolfMid',35.5,-70.5),('Irlanda',53.5,-15.5),('Labrador',57.5,-52.5),('Noruega',66.5,5.5),('SargassoMax',24.5,-45.5)]:
  print(n,at(la,lo))
print('max surface S',np.nanmax(S),'at',np.unravel_index(np.nanargmax(S),S.shape))
# ---- NCEP zonal anomaly
d=nc.Dataset('air995.nc');a=d['air'][:].astype(float)
z=a-a.mean(2,keepdims=True)
OUT['ncep']={'lat0':90,'dlat':-2.5,'lon0':0,'dlon':2.5,'nlat':37,'nlon':144,'jan':[round(float(v)) for v in z[0,:37].ravel()],'jul':[round(float(v)) for v in z[6,:37].ravel()],'janT':[round(float(v)) for v in a[0,:37].ravel()],'julT':[round(float(v)) for v in a[6,:37].ravel()]}
with open(R+'ncep-r1-anomalia-zonal-gener-juliol.csv','w') as f:
  f.write('lat,lon,gener_temp_c,gener_anomalia_zonal_c,juliol_temp_c,juliol_anomalia_zonal_c\n')
  for i,la in enumerate(d['lat'][:]):
    for j,lo in enumerate(d['lon'][:]): f.write('%.1f,%.1f,%.2f,%.2f,%.2f,%.2f\n'%(la,lo,a[0,i,j],z[0,i,j],a[6,i,j],z[6,i,j]))
# ---- RAPID monthly
rows=list(csv.DictReader(open(R+'rapid-26n-mensual.csv')))
OUT['rapid']={'y0':int(rows[0]['year']),'m0':int(rows[0]['month']),'moc':[float(r['amoc_sv']) for r in rows],'gs':[float(r['florida_sv']) for r in rows],'ek':[float(r['ekman_sv']) for r in rows],'umo':[float(r['upper_midocean_sv']) for r in rows]}
# ---- paleo
L=open('mcmanus2004.txt',encoding='latin-1').read().splitlines()
pa=[]
st=False
for l in L:
  if l.startswith('Age     Pa/Th238'): st=True;continue
  if st:
    p=l.split()
    if len(p)==5:
      try: pa.append([float(p[0]),float(p[1]),float(p[2])])
      except: break
    elif len(p)==0 and pa: break
OUT['pa']=pa
ng=[]
for l in open('gicc05-60ka-20yr.txt',encoding='latin-1'):
  p=l.split()
  if len(p)==4:
    try: a_,dd,o,e=map(float,p)
    except: continue
    if a_<=25000 and a_%100==0: ng.append([int(a_),o])
seen=set();ng=[x for x in ng if not (x[0] in seen or seen.add(x[0]))]
OUT['ngrip']=ng
with open(R+'paleo-ngrip-d18o-i-mcmanus-path.csv','w') as f:
  f.write('serie,edat_anys,valor,error\n')
  for a_,o in ng: f.write('ngrip_d18o_permil_b2k,%d,%.2f,\n'%(a_,o))
  for a_,v,e in pa: f.write('ggc5_pa_th_238,%d,%.4f,%.4f\n'%(round(a_*1000),v,e))
print('pa',len(pa),pa[0],pa[-1],'ngrip',len(ng))
js='/* Dades de «La cinta transportadora de l\'Atlàntic». Generat a partir dels fitxers de research/cinta-transportadora. */\nwindow.CT_DATA='+json.dumps(OUT,separators=(',',':'))+';\n'
open(A+'dades.js','w').write(js);print('dades.js bytes',len(js))
