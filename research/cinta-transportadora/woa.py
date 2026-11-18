import re,sys,numpy as np
def parse(fn,shape):
  txt=open(fn).read()
  body=txt.split('---------------------------------------------')[1]
  arr=np.full(shape,np.nan)
  for m in re.finditer(r'^((?:\[\d+\])+), (.*)$',body,re.M):
    idx=[int(x) for x in re.findall(r'\d+',m.group(1))]
    vals=[float(v) for v in m.group(2).split(',')]
    sl=tuple(idx)
    a=arr[sl]; a[:]=vals if a.ndim else vals[0]
    arr[sl]=a
  arr[np.abs(arr)>1e30]=np.nan
  return arr
if __name__=='__main__':
  t=parse('sfc_t.txt',(1,1,160,161)); print(np.nanmin(t),np.nanmax(t),np.isnan(t).sum())
  s=parse('sec_t.txt',(1,102,136,1)); print(np.nanmin(s),np.nanmax(s),np.isnan(s).sum())
