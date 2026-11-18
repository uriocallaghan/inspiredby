import netCDF4 as nc, numpy as np, sys, json, collections
d=nc.Dataset(sys.argv[1])
t=nc.num2date(d['time'][:],d['time'].units)
V=['moc_mar_hc10','t_gs10','t_ek10','t_umo10']
arr={v:np.ma.filled(d[v][:].astype(float),np.nan) for v in V}
for v in V: print(v,'nan',np.isnan(arr[v]).sum(),'mean %.2f std %.2f min %.2f max %.2f'%(np.nanmean(arr[v]),np.nanstd(arr[v]),np.nanmin(arr[v]),np.nanmax(arr[v])))
mon=collections.OrderedDict()
for i,tt in enumerate(t):
  k=(tt.year,tt.month); mon.setdefault(k,[]).append([arr[v][i] for v in V])
out=sys.argv[2]
with open(out,'w') as f:
  f.write('year,month,amoc_sv,florida_sv,ekman_sv,upper_midocean_sv,n_obs\n')
  for (y,m),rows in mon.items():
    a=np.array(rows); mm=np.nanmean(a,0)
    f.write('%d,%d,%.2f,%.2f,%.2f,%.2f,%d\n'%(y,m,*mm,len(rows)))
yr=collections.OrderedDict()
for (y,m),rows in mon.items(): yr.setdefault(y,[]).extend(rows)
for y,rows in yr.items():
  a=np.array(rows); print(y, len(rows), ' '.join('%.2f'%x for x in np.nanmean(a,0)))
# min monthly
