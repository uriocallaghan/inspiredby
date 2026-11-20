# Dades brutes (API ohsome, HeiGIT · © OpenStreetMap contributors, ODbL) · consultes del 20-11-2026

Base: `https://api.ohsome.org/v1` (v1.10.4). Filtre de persones: `type:way or type:node`.

- `users-*.json`: `/users/count`, interval `P1D`. Haití `-74.5,17.9,-71.6,20.1` (2009-12-01/2010-04-01); Nepal `80.0,26.3,88.2,30.5` (2015-04-05/2015-06-24); Haiyan `122.0,9.5,126.2,12.8` (2013-10-19/2014-01-07); Turquia–Síria `35.5,36.0,40.5,38.5` (2023-01-17/2023-04-07).
- `u31-*.json`: persones diferents en els 31 dies posteriors a cada desastre; `u31-haitiabans.json`, de 2008-12-12 a 2010-01-12 (l'article fa servir la consulta 2009-01-12/2010-01-12/P365D, que dona el mateix: 58).
- `road-pap.json`, `bld-pap.json`: `/elements/length` (`highway=* and type:way`) i `/elements/count` (`building=* and type:way`), caixa `-72.42,18.48,-72.22,18.62`, diàries.
- Carrers de l'animació (`web/articles/el-mapa-d-haiti/pap-carrers.js`): `/elementsFullHistory/geometry?bboxes=-72.42,18.48,-72.22,18.62&time=2009-12-31,2010-02-13&filter=highway=* and type:way&properties=metadata` (49 MB, no es desa al repositori). Per a cada `@osmId`: primer `@validFrom` i geometria de l'última versió; Douglas–Peucker 0,00004°, arrodonit a 0,0001°.
- Tancament: `/users/count` Haití 2025-01-01/2026-01-01 → 323; vies 2025-11-01 → 3.444 km; edificis 2025-11-01 → 133.597.
