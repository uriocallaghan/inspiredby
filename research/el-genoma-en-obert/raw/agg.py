import sys, collections, json
# columns: date(7) region(8) country(9) date_submitted(29) database(32) host(17)
sub_week = collections.Counter()   # (country, isoweek-of-submission)
coll_month = collections.Counter()  # (country, YYYY-MM of collection)
sub_day = collections.Counter()    # submissions per day (all)
lag = collections.defaultdict(list)
n=0
hdr = sys.stdin.readline().rstrip('\n').split('\t')
ix = {k:i for i,k in enumerate(hdr)}
for line in sys.stdin:
    f = line.rstrip('\n').split('\t')
    if len(f) < len(hdr): continue
    if f[ix['host']] not in ('Homo sapiens','?',''): continue
    n+=1
    c=f[ix['country']]; r=f[ix['region']]; d=f[ix['date']]; s=f[ix['date_submitted']]
    if len(s)>=10: sub_day[s[:10]]+=1
    if len(d)>=7: coll_month[(r,c,d[:7])]+=1
    if len(d)==10 and len(s)>=10 and d<'2020-04': lag[(r,c)].append((d,s[:10]))
out={'n':n,'sub_day':sub_day,'coll_month':{f'{a}|{b}|{m}':v for (a,b,m),v in coll_month.items()},'early':{f'{a}|{b}':v for (a,b),v in lag.items()}}
json.dump(out,open('agg.json','w'))
print(n)
