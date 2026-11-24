#!/usr/bin/env python3
"""Centroides (lon, lat) de cada país del recompte propi, calculats sobre countries-110m
de world-atlas 2.0.2 (Natural Earth 1:110 m). Els noms del conjunt de Nextstrain es
tradueixen als de Natural Earth amb la taula ALIAS; els que no hi són es llisten."""
import json, os, collections

HERE = os.path.dirname(os.path.abspath(__file__))
topo = json.load(open(os.path.join(HERE, 'world110.json')))

# descodifica la topologia (quantitzada) i calcula el centroide de l'anell més gran
tr = topo['transform']; sx, sy = tr['scale']; dx, dy = tr['translate']
arcs = []
for arc in topo['arcs']:
    x = y = 0; pts = []
    for p in arc:
        x += p[0]; y += p[1]
        pts.append((x*sx+dx, y*sy+dy))
    arcs.append(pts)

def ring(idx):
    out = []
    for i in idx:
        a = arcs[~i][::-1] if i < 0 else arcs[i]
        out.extend(a if not out else a[1:])
    return out

def area(r):
    s = 0
    for i in range(len(r)-1):
        s += r[i][0]*r[i+1][1] - r[i+1][0]*r[i][1]
    return abs(s)/2

def centroid(r):
    s = cx = cy = 0
    for i in range(len(r)-1):
        f = r[i][0]*r[i+1][1] - r[i+1][0]*r[i][1]
        s += f; cx += (r[i][0]+r[i+1][0])*f; cy += (r[i][1]+r[i+1][1])*f
    if abs(s) < 1e-12:
        return (sum(p[0] for p in r)/len(r), sum(p[1] for p in r)/len(r))
    return (cx/(3*s), cy/(3*s))

CENT = {}
for geo in topo['objects']['countries']['geometries']:
    name = geo['properties']['name']
    polys = [geo['arcs']] if geo['type'] == 'Polygon' else geo['arcs']
    best = None
    for poly in polys:
        r = ring(poly[0])
        if len(r) < 4: continue
        a = area(r)
        if best is None or a > best[0]: best = (a, r)
    if best: CENT[name] = [round(v, 3) for v in centroid(best[1])]

ALIAS = {
 'USA': 'United States of America', 'Democratic Republic of the Congo': 'Dem. Rep. Congo',
 'Republic of the Congo': 'Congo', 'Czech Republic': 'Czechia', 'Bosnia and Herzegovina': 'Bosnia and Herz.',
 'North Macedonia': 'Macedonia', 'Serbia': 'Serbia', 'Eswatini': 'eSwatini', 'Timor-Leste': 'Timor-Leste',
 'Cote d Ivoire': "Côte d'Ivoire", "Cote d'Ivoire": "Côte d'Ivoire", 'Ivory Coast': "Côte d'Ivoire",
 'South Sudan': 'S. Sudan', 'Central African Republic': 'Central African Rep.',
 'Equatorial Guinea': 'Eq. Guinea', 'Dominican Republic': 'Dominican Rep.',
 'Solomon Islands': 'Solomon Is.', 'Myanmar': 'Myanmar', 'Laos': 'Laos', 'Vietnam': 'Vietnam',
 'Russia': 'Russia', 'Turkey': 'Turkey', 'Trkiye': 'Turkey', 'Türkiye': 'Turkey',
 'Falkland Islands': 'Falkland Is.', 'Western Sahara': 'W. Sahara', 'Palestine': 'Palestine',
 'Brunei': 'Brunei', 'Cape Verde': 'Cabo Verde', 'Gambia': 'Gambia', 'Taiwan': 'Taiwan',
}
# illes i territoris petits que no hi són a 1:110 m: coordenades d'OpenStreetMap (centre aproximat)
EXTRA = {
 'Bahrain': [50.55, 26.07], 'Singapore': [103.82, 1.35], 'Hong Kong': [114.17, 22.32],
 'Malta': [14.44, 35.9], 'Mauritius': [57.55, -20.28], 'Maldives': [73.51, 4.18],
 'Barbados': [-59.54, 13.19], 'Seychelles': [55.49, -4.68], 'Bermuda': [-64.75, 32.31],
 'Aruba': [-69.97, 12.52], 'Curacao': [-68.93, 12.17], 'Sint Maarten': [-63.06, 18.03],
 'Cayman Islands': [-81.25, 19.31], 'Jersey': [-2.11, 49.21], 'Gibraltar': [-5.35, 36.14],
 'Liechtenstein': [9.55, 47.17], 'Andorra': [1.52, 42.51], 'Monaco': [7.42, 43.74],
 'San Marino': [12.46, 43.94], 'Luxembourg': [6.13, 49.81], 'Saint Barthelemy': [-62.83, 17.9],
 'Guadeloupe': [-61.55, 16.25], 'Martinique': [-61.02, 14.64], 'Mayotte': [45.17, -12.83],
 'Reunion': [55.54, -21.12], 'French Guiana': [-53.13, 3.93], 'Guam': [144.79, 13.44],
 'Puerto Rico': [-66.59, 18.22], 'Saint Martin': [-63.08, 18.08], 'Antigua and Barbuda': [-61.8, 17.06],
 'Saint Kitts and Nevis': [-62.76, 17.33], 'Dominica': [-61.37, 15.41], 'Grenada': [-61.68, 12.12],
 'Saint Lucia': [-60.98, 13.91], 'Saint Vincent and the Grenadines': [-61.2, 13.25],
 'Bonaire': [-68.26, 12.18], 'Anguilla': [-63.07, 18.22], 'British Virgin Islands': [-64.62, 18.42],
 'U.S. Virgin Islands': [-64.9, 17.73], 'Turks and Caicos Islands': [-71.8, 21.7],
 'Montserrat': [-62.19, 16.74], 'Cuba': None, 'Comoros': [43.33, -11.65], 'Union of the Comoros': [43.33, -11.65], 'Micronesia': [158.21, 6.92], 'Sao Tome and Principe': [6.73, 0.25],
 'Cook Islands': [-159.78, -21.23], 'French Polynesia': [-149.57, -17.65], 'New Caledonia': [165.62, -21.3],
 'Wallis and Futuna': [-176.2, -13.3], 'Samoa': [-172.1, -13.76], 'American Samoa': [-170.7, -14.3],
 'Tonga': [-175.2, -21.18], 'Fiji': None, 'Vanuatu': [168.32, -17.74], 'Palau': [134.58, 7.5],
 'Micronesia (country)': [158.21, 6.92], 'Marshall Islands': [171.14, 7.09], 'Nauru': [166.93, -0.52],
 'Kiribati': [172.98, 1.33], 'Tuvalu': [179.19, -8.52], 'Northern Mariana Islands': [145.75, 15.19],
 'Isle of Man': [-4.55, 54.24], 'Faroe Islands': [-6.88, 62.01], 'Guernsey': [-2.58, 49.45],
 'Cyprus': None, 'Trinidad and Tobago': [-61.27, 10.45], 'Bahamas': None, 'Jamaica': None,
 'Sint Eustatius': [-62.97, 17.49], 'Saba': [-63.23, 17.63], 'Saint Pierre and Miquelon': [-56.33, 46.84],
 'Greenland': None, 'Hungary': None, 'Slovakia': None, 'Slovenia': None,
}

def resolve(name):
    n = ALIAS.get(name, name)
    if n in CENT: return CENT[n]
    if name in EXTRA and EXTRA[name]: return EXTRA[name]
    return None

if __name__ == '__main__':
    a1 = json.load(open(os.path.join(HERE, 'agg.json')))
    co = collections.Counter()
    for key, v in a1['coll_month'].items():
        r, c, m = key.split('|'); co[c] += v
    out, miss = {}, []
    for c, n in co.items():
        p = resolve(c)
        if p: out[c] = p
        else: miss.append((c, n))
    print('resolts', len(out), 'sense centroide', len(miss))
    print('sense:', sorted(miss, key=lambda x: -x[1])[:20])
    print('no resolts en total de genomes:', sum(n for _, n in miss), 'de', sum(co.values()))
    json.dump(out, open(os.path.join(HERE, 'centroids.json'), 'w'))
