import json
OFF={'MAT':1,'MRK':18330,'LUK':29616,'JHN':49062}
K={'MAT':'Mt','MRK':'Mc','LUK':'Lc','JHN':'Jn'}
NG={1:4,2:3,3:3,4:3,5:2,6:2,7:2,8:2,9:2,10:1,11:1,12:1,13:1,0:0}
secs={}
for b in OFF:
    rows=[]
    for line in open(f'eus/data_{b}-sections-aligned.txt',encoding='utf8'):
        p=line.rstrip('\n').split('\t')
        if not p[0].isdigit(): continue
        n=int(p[0]); c=int(p[1]); a=int(p[5])-OFF[b]; z=int(p[6])-OFF[b]+1
        rows.append([n,c,p[2].replace('.',','),a,z])
    secs[K[b]]=rows
canons=json.load(open('eus/json_canons.json'))
rows=[[r['canon'],r.get('MAT') or 0,r.get('MRK') or 0,r.get('LUK') or 0,r.get('JHN') or 0] for r in canons]
# fix John 98 coded 0
for s in secs['Jn']:
    if s[0]==98 and s[1]==0:
        cs={r[0] for r in rows if r[4]==98}; print('Jn98 canons',cs); s[1]=min(cs) if cs else 0
tot={'Mt':18329,'Mc':11085,'Lc':19446,'Jn':15438}
for k,ss in secs.items():
    agg={}
    for n,c,ref,a,z in ss:
        if k=='Mc' and n>233: continue
        g=NG[c]; agg[g]=agg.get(g,0)+(z-a)
    print(k,len(ss),{g:round(v/tot[k]*100,1) for g,v in sorted(agg.items())})
from collections import Counter
print(Counter(r[0] for r in rows))
json.dump({'secs':secs,'rows':rows},open('build/eus.json','w'),ensure_ascii=False,separators=(',',':'))
