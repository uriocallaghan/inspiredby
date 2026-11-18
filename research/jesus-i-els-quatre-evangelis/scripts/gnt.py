import json,sys,os,re
D=sys.argv[1]
def load(fn,book):
    rows=[]
    for line in open(os.path.join(D,fn),encoding='utf8'):
        p=line.split()
        ref=p[0]; c=int(ref[2:4]); v=int(ref[4:6])
        rows.append(dict(c=c,v=v,pos=p[1],text=p[3],word=p[4],norm=p[5],lemma=p[6]))
    if book=='Mk':
        out=[];n1608=0
        for r in rows:
            if r['c']==16 and r['v']>8: continue
            if r['c']==16 and r['v']==8:
                n1608+=1
                if n1608>18: continue
            out.append(r)
        rows=out
    for i,r in enumerate(rows): r['i']=i
    return rows
G={'Mt':'61-Mt','Mc':'62-Mk','Lc':'63-Lk','Jn':'64-Jn'}
books={k:load(v+'.txt','Mk' if k=='Mc' else k) for k,v in G.items()}
def at(b,c,v):
    for r in books[b]:
        if r['c']==c and r['v']==v: return r['i']
    raise Exception((b,c,v))
res={}
res['total']={b:len(r) for b,r in books.items()}
res['caps']={b:[sum(1 for r in rows if r['c']==c) for c in range(1,max(r['c'] for r in rows)+1)] for b,rows in books.items()}
lem={'βασιλεία':'Regne','παραβολή':'paràbola','εὐθύς':'de seguida','πιστεύω':'creure','κόσμος':'món','Ἰουδαῖος':'jueus','ἀγαπάω':'estimar'}
res['mots']=[{'g':l,'ca':ca,'pos':{b:[r['i'] for r in rows if r['lemma']==l] for b,rows in books.items()}} for l,ca in lem.items()]
sc=[('Baptisme',[(3,13),(1,9),(3,21),(1,29)]),('Pa per a cinc mil',[(14,13),(6,30),(9,10),(6,1)]),('Pere: «Ets el Messies»',[(16,13),(8,27),(9,18),(6,66)]),('Entrada a Jerusalem',[(21,1),(11,1),(19,28),(12,12)]),('Gest al Temple',[(21,12),(11,15),(19,45),(2,13)]),('Darrer sopar',[(26,20),(14,17),(22,14),(13,1)]),('Detenció',[(26,47),(14,43),(22,47),(18,1)]),('Crucifixió',[(27,33),(15,22),(23,33),(19,17)]),('Tomba oberta',[(28,1),(16,1),(24,1),(20,1)])]
res['escenes']=[{'nom':n,'ref':{b:f'{c},{v}' for b,(c,v) in zip(['Mt','Mc','Lc','Jn'],refs)},'pos':{b:at(b,c,v) for b,(c,v) in zip(['Mt','Mc','Lc','Jn'],refs)}} for n,refs in sc]
# passion share from entry into Jerusalem
res['passio']={b:res['total'][b]-at(b,*cv) for b,cv in zip(['Mt','Mc','Lc','Jn'],[(21,1),(11,1),(19,28),(12,12)])}
# Mark segments
seg=[('1,1','Baptisme i Galilea',(1,1)),('11,1','Arribada',(11,1)),('11,12','L’endemà',(11,12)),('11,20','Al matí',(11,20)),('14,1','Dos dies abans de Pasqua',(14,1)),('14,12','Primer dia dels Àzims',(14,12)),('15,1','De bon matí',(15,1)),('16,1','Passat el dissabte',(16,1))]
st=[at('Mc',*s[2]) for s in seg]+[res['total']['Mc']]
res['marcDies']=[{'ref':s[0],'nom':s[1],'w':st[i+1]-st[i],'start':st[i]} for i,s in enumerate(seg)]
# Mark ch15 hours
res['marcHores']={k:at('Mc',15,v) for k,v in [('15,1',1),('15,25',25),('15,33',33),('15,42',42)]}
json.dump(res,open(sys.argv[2],'w'),ensure_ascii=False)
print(res['total'],res['passio'],{b:round(res['passio'][b]/res['total'][b]*100,1) for b in res['passio']})
print(res['marcDies'])
print([(m['ca'],{b:len(p) for b,p in m['pos'].items()}) for m in res['mots']])
print([(e['nom'],{b:round(e['pos'][b]/res['total'][b]*100) for b in e['pos']}) for e in res['escenes']])
