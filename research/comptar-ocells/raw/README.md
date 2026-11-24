# Dades en brut de «Comptar ocells»

Totes descarregades el 24-11-2026. `../dades.py` les converteix en `web/articles/comptar-ocells/dades.js`.

- `circles126.json`: centre dels 3.138 cercles del recompte de Nadal inscrits a la temporada 126 (2025–26). Capa pública d'Audubon a ArcGIS Online:
  `https://services1.arcgis.com/lDFzr3JyGEn5Eymu/ArcGIS/rest/services/CBC_126/FeatureServer/1/query?where=1%3D1&outFields=Abbrev,Name,Latitude,Longitude&returnGeometry=false&f=json` (en dues pàgines de 2.000). La capa també té noms i correus dels compiladors: **no s'han descarregat ni es fan servir**.
- `ebird_years.json`: registres per any de l'eBird Observation Dataset (EOD) a GBIF:
  `https://api.gbif.org/v1/occurrence/search?datasetKey=4fa7b334-ce0d-4e88-aaae-2e0c138d049e&limit=0&facet=year&year=2002,2026&facetLimit=100`
- `oreneta-gbif-ebird-mensual.json`: per a cada mes (1–12, tots els anys junts), comptatges per cel·la geohash de 3 caràcters (1,40625° × 1,40625°) de l'oreneta vulgar (`taxonKey=9515886`, *Hirundo rustica*) i de totes les espècies (`all_…`) a l'EOD, a les quatre tessel·les de zoom 1 en EPSG:4326 que cobreixen Amèrica (x 0–1, y 0–1). API de mapes v2 de GBIF, mode `GEO_CENTROID`:
  `https://api.gbif.org/v2/map/occurrence/adhoc/1/{x}/{y}.mvt?srs=EPSG:4326&datasetKey=4fa7b334-ce0d-4e88-aaae-2e0c138d049e&month={m}&mode=GEO_CENTROID[&taxonKey=9515886]`. Script: `fetch_mig.py` (descodifica els MVT amb `mapbox-vector-tile`); `geohash.py` passa de geohash a coordenades.
- `socc-itineraris.json`: els 644 itineraris del SOCC (codi, nom, si tenen col·laborador actiu, centre i traça), de `https://www.socc.cat/visualization/monitoringsitespublic.json?monitoringscheme=socc` (coordenades arrodonides a 5 decimals).
- `ind_specialist.json`, `ind_farmland.json`: indicadors del SOCC 2002–2024 amb l'interval de confiança, de `https://www.socc.cat/socc/resultats/indicadors/specialist/data/` i `…/farmland/data/`.
