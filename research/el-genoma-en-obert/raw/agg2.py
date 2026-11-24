import sys, collections, json, datetime
hdr = sys.stdin.readline().rstrip('\n').split('\t'); ix={k:i for i,k in enumerate(hdr)}
lag=collections.defaultdict(list); wk_reg=collections.Counter(); early=[]; n=0
for line in sys.stdin:
    f=line.rstrip('\n').split('\t')
    if len(f)<len(hdr): continue
    if f[ix['host']] not in ('Homo sapiens','?',''): continue
    n+=1
    d=f[ix['date']]; s=f[ix['date_submitted']]; r=f[ix['region']]; c=f[ix['country']]
    if len(s)>=10:
        sd=s[:10]
        try: dt=datetime.date.fromisoformat(sd)
        except: continue
        wk=(dt-datetime.timedelta(days=dt.weekday())).isoformat()
        wk_reg[(wk,r)]+=1
        if len(d)==10:
            try: cd=datetime.date.fromisoformat(d)
            except: continue
            L=(dt-cd).days
            if 0<=L<400: lag[sd[:7]].append(L)
        if sd<'2020-03-01': early.append((sd,d,c,f[ix['genbank_accession']],f[ix['submitting_lab']][:60]))
q={}
for m,v in lag.items():
    v.sort(); k=len(v)
    q[m]=[k, v[k//2], v[int(k*0.9)], round(sum(v)/k,1)]
json.dump({'n':n,'wk_reg':{f'{a}|{b}':v for (a,b),v in wk_reg.items()},'lag_q':q,'early':sorted(early)[:120]}, open('agg2.json','w'))
print('rows',n)
