import numpy as np, gzip, base64, json, sys
D=sys.argv[1]
LON0,LON1,LAT0,LAT1,ST=34.0,37.0,30.6,33.9,0.0125
nx=round((LON1-LON0)/ST); ny=round((LAT1-LAT0)/ST)
k=int(round(ST*3600))  # pixels per cell (1 arcsec)
out=np.zeros((ny,nx),dtype=np.float32)
cache={}
def tile(la,lo):
    key=(la,lo)
    if key not in cache:
        a=np.frombuffer(gzip.open(f'{D}/N{la}E{lo:03d}.hgt.gz').read(),dtype='>i2').reshape(3601,3601).astype(np.float32)
        a[a<-1000]=np.nan; cache[key]=a
    return cache[key]
for j in range(ny):
    lat_top=LAT1-j*ST
    for i in range(nx):
        lon_l=LON0+i*ST
        la=int(np.floor(lat_top-1e-9)); lo=int(np.floor(lon_l+1e-9))
        t=tile(la,lo)
        r0=int(round((la+1-lat_top)*3600)); c0=int(round((lon_l-lo)*3600))
        blk=t[r0:r0+k,c0:c0+k]
        out[j,i]=np.nanmean(blk) if blk.size else np.nan
out=np.nan_to_num(out,nan=0)
mn,mx=-430,2000
q=np.clip(np.round((out-mn)/(mx-mn)*254),0,254).astype(np.uint8)
print(nx,ny,out.min(),out.max())
def at(lat,lon):
    j=int((LAT1-lat)/ST); i=int((lon-LON0)/ST); return float(out[j,i])
for n,ll in {'Jerusalem':(31.778,35.235),'Jericó':(31.871,35.444),'Cafarnaüm':(32.881,35.575),'Natzaret':(32.702,35.297),'Betlem':(31.705,35.202),'Mar Mort':(31.5,35.5),'Llac':(32.8,35.6)}.items(): print(n,round(at(*ll)))
open(sys.argv[2],'w').write("/* Relleu de Palestina: SRTM via AWS Terrain Tiles (Mapzen), mitjana per cel·les de 0,0125° (≈1,2 km). Valor = alçada en m: v/254*(2000+430)-430. */\nwindow.EVG_DEM="+json.dumps({'lon0':LON0,'lat1':LAT1,'st':ST,'nx':nx,'ny':ny,'mn':mn,'mx':mx,'b64':base64.b64encode(q.tobytes()).decode()})+";\n")
