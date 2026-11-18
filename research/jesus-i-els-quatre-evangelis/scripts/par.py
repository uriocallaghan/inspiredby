import json,sys,os,unicodedata
D=sys.argv[1]
def rng(fn,c,v1,v2):
    out=[]
    for line in open(os.path.join(D,fn),encoding='utf8'):
        p=line.split(); cc=int(p[0][2:4]); vv=int(p[0][4:6])
        if cc==c and v1<=vv<=v2: out.append(dict(t=p[3].replace('⸀','').replace('⸁','').replace('⸂','').replace('⸃','').replace('⸄','').replace('⸅',''),n=p[5],l=p[6],v=vv))
    return out
def strip(s): return ''.join(ch for ch in unicodedata.normalize('NFD',s.lower()) if unicodedata.category(ch)!='Mn')
mk=rng('62-Mk.txt',2,1,12); mt=rng('61-Mt.txt',9,1,8); lk=rng('63-Lk.txt',5,17,26)
def lcs(a,b):
    A=[strip(x['n']) for x in a]; B=[strip(x['n']) for x in b]
    n,m=len(A),len(B); L=[[0]*(m+1) for _ in range(n+1)]
    for i in range(n-1,-1,-1):
        for j in range(m-1,-1,-1):
            L[i][j]=L[i+1][j+1]+1 if A[i]==B[j] else max(L[i+1][j],L[i][j+1])
    i=j=0; pairs=[]
    while i<n and j<m:
        if A[i]==B[j]: pairs.append((i,j)); i+=1; j+=1
        elif L[i+1][j]>=L[i][j+1]: i+=1
        else: j+=1
    return pairs
pmt=lcs(mk,mt); plk=lcs(mk,lk)
mk_in_mt={i for i,_ in pmt}; mk_in_lk={i for i,_ in plk}
mt_from={j for _,j in pmt}; lk_from={j for _,j in plk}
out={'Mc':[[w['t'],w['v'],(1 if i in mk_in_mt else 0)+(2 if i in mk_in_lk else 0)] for i,w in enumerate(mk)],
     'Mt':[[w['t'],w['v'],1 if j in mt_from else 0] for j,w in enumerate(mt)],
     'Lc':[[w['t'],w['v'],1 if j in lk_from else 0] for j,w in enumerate(lk)]}
json.dump(out,open(sys.argv[2],'w'),ensure_ascii=False)
print(len(mk),len(mt),len(lk),len(pmt),len(plk),len(mk_in_mt&mk_in_lk))
print(' '.join(w['t'] for w in mk if w['v']==10))
print(' '.join(w['t'] for w in mt if w['v']==6))
print(' '.join(w['t'] for w in lk if w['v']==24))
