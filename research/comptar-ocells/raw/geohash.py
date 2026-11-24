B="0123456789bcdefghjkmnpqrstuvwxyz"
def decode(g):
    lat=[-90.,90.]; lon=[-180.,180.]; ev=True
    for c in g:
        v=B.index(c)
        for b in (16,8,4,2,1):
            r=lon if ev else lat
            mid=(r[0]+r[1])/2
            if v&b: r[0]=mid
            else: r[1]=mid
            ev=not ev
    return (lon[0]+lon[1])/2,(lat[0]+lat[1])/2,lon[1]-lon[0],lat[1]-lat[0]
