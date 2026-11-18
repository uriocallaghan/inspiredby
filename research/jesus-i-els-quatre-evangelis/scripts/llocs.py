import json,os,sys
D=sys.argv[1]
def load(fn,mk=False):
    rows=[];n=0
    for line in open(os.path.join(D,fn),encoding='utf8'):
        p=line.split(); c=int(p[0][2:4]); v=int(p[0][4:6])
        if mk and c==16 and v>8: continue
        if mk and c==16 and v==8:
            n+=1
            if n>18: continue
        rows.append((c,v,p[6]))
    return rows
B={'Mt':load('61-Mt.txt'),'Mc':load('62-Mk.txt',True),'Lc':load('63-Lk.txt'),'Jn':load('64-Jn.txt')}
P=[ # nom, lemmas, lat, lon, nota, excloure (book,c,v)
 ('Jerusalem',['Ἱεροσόλυμα','Ἰερουσαλήμ'],31.778,35.235,'',[]),
 ('Betlem',['Βηθλέεμ'],31.705,35.202,'',[]),
 ('Betània',['Βηθανία'],31.771,35.262,'',[('Jn',1,28)]),
 ('Jericó',['Ἰεριχώ'],31.871,35.444,'',[]),
 ('Natzaret',['Ναζαρέθ','Ναζαρέτ','Ναζαρά'],32.702,35.297,'',[]),
 ('Cafarnaüm',['Καφαρναούμ'],32.881,35.575,'',[]),
 ('Betsaida',['Βηθσαϊδά'],32.910,35.630,'Identificació discutida',[]),
 ('Corazín',['Χοραζίν'],32.911,35.564,'',[]),
 ('Naín',['Ναΐν'],32.630,35.348,'',[]),
 ('Canà',['Κανά'],32.814,35.309,'Identificació discutida',[]),
 ('Tiberíades',['Τιβεριάς'],32.789,35.537,'',[('Jn',6,1),('Jn',21,1)]),
 ('Cesarea de Filip',['Καισάρεια'],33.248,35.694,'',[]),
 ('Tir',['Τύρος'],33.271,35.196,'',[]),
 ('Sidó',['Σιδών'],33.563,35.371,'',[]),
 ('Sicar',['Συχάρ'],32.213,35.282,'Identificació discutida',[]),
]
out=[]
for nom,lems,lat,lon,nota,exc in P:
    n={}
    refs={}
    for b,rows in B.items():
        rr=[(c,v) for c,v,l in rows if l in lems and (b,c,v) not in exc]
        n[b]=len(rr); refs[b]=[f'{c},{v}' for c,v in rr]
    out.append(dict(nom=nom,lat=lat,lon=lon,nota=nota,n=n,refs=refs))
    print(nom,n)
R=[('Galilea',['Γαλιλαία']),('Judea',['Ἰουδαία']),('Samaria',['Σαμάρεια']),('Decàpolis',['Δεκάπολις']),('Jordà',['Ἰορδάνης'])]
reg={}
for nom,lems in R:
    reg[nom]={b:sum(1 for c,v,l in rows if l in lems) for b,rows in B.items()}
print(reg)
json.dump({'llocs':out,'regions':reg},open(sys.argv[2],'w'),ensure_ascii=False)
