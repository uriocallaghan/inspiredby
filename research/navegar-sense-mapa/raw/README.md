# Dades brutes · Navegar sense mapa (20-11-2026)

- `atolls.json`: Overpass API (OpenStreetMap, ODbL): `nwr["natural"="atoll"](-28,-156,-7,-133); nwr["place"="island"]["name"](-28,-156,-7,-133); out center tags;`. Dedupe per nom (< 0,6°) → `dades.js` (`illes`, 138 punts).
- `stars6.json`: catàleg Hipparcos via d3-celestial 0.7.35 (`data/stars.6.json`); `estrelles.json`: les 25 estrelles de la brúixola (HIP, AR, declinació, magnitud).
- `geo.json`: coordenades de Nominatim (OpenStreetMap) per a illes i ports.
- `map1976.png`: mapa del viatge de 1976 de la Polynesian Voyaging Society (archive.hokulea.com/images/maps/1976_bw_map.gif), usat només per digitalitzar la ruta (reixa: x 49 → 160° O, 351 → 140° O; y 60 → 20° N, 666 → 20° S). No es publica.
