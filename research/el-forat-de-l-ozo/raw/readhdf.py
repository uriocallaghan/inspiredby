import struct,zlib,sys
def read(path):
  b=open(path,'rb').read(); off=4; dd={}
  while off:
    n,nxt=struct.unpack('>HI',b[off:off+6]); p=off+6
    for i in range(n):
      t,r,o,l=struct.unpack('>HHII',b[p:p+12]); p+=12; dd[(t,r)]=(o,l)
    off=nxt
  # primer SDS (Average_O3_column): element especial 0x42BE amb la ref més baixa
  sds=sorted(r for (t,r) in dd if t==0x42BE)
  o,l=dd[(0x42BE,sds[0])]; h=b[o:o+l]
  sp,ver,ulen,cref=struct.unpack('>HHIH',h[:10]); assert sp==3
  if (40,cref) in dd: o,l=dd[(40,cref)]; comp=b[o:o+l]
  else:
    o,l=dd[(0x4028,cref)]; h2=b[o:o+l]
    _,tot,blen,nb,lref=struct.unpack('>HIIIH',h2[:16])
    o,l=dd[(20,lref)]; lt=b[o:o+l]; refs=[x for x in struct.unpack('>%dH'%(l//2),lt)[1:] if x]
    comp=b''.join(b[dd[(20,r)][0]:dd[(20,r)][0]+dd[(20,r)][1]] for r in refs)[:tot]
  raw=zlib.decompress(comp); v=struct.unpack('>%dh'%(len(raw)//2),raw)
  return v  # 361 x 720
if __name__=='__main__':
  v=read(sys.argv[1]); print(len(v),min(v),max(v),v[:5],v[180*720:180*720+5])
