# InspiredBy Magazine

"Curated stories to understand the 21st century": revista d'arts, cultura i afers internacionals (en castellà), 2020–2021.

## Origen d'aquesta còpia

- Domini: `inspiredbymagazine.com`, registrat a Nominalia. Va caducar el 21/06/2022.
- La web era a Netlify i continua publicada a **https://inspiredbymagazine.netlify.app**, en un compte de Netlify diferent de l'actual.
- `site/` és una còpia completa descarregada d'aquesta adreça el 17/11/2026, amb els enllaços reescrits perquè funcioni en local.

## Pàgines

- `index.html`: portada
- `bvi-underwater-art-reef.html`: El mejor barco de guerra es el que se hunde (Uri O'Callaghan)
- `articles/galapagoschina.html`: ¿Qué hace China en las Galápagos? (Wendy Cedeño)
- `articles/poblacionmundial.html`: ¿De qué muere el mundo?
- `articles/proteccionplanetaria.html`: La protección planetaria
- `articles/calendariocosmico.html`: Calendario cósmico
- `articles/standard_model/standardmodel.html`: El Modelo Estándar
- `origenes_genesis.html`, `origenes_nosotros.html`: sèrie "Orígenes"
- `404.html`

## Veure-la en local

```bash
python3 -m http.server 8000 --directory site
```

A la web original ja faltaven 6 fitxers que es referencien (dos scripts jQuery del calendari còsmic, `localfonts/haass/stylesheet.css`, entre d'altres): també donaven 404 a Netlify.

## Nova versió (`web/`)

Revista d'articles visuals per entendre el món (en català). `site/` es conserva intacta; `web/` és la web nova, estàtica, sense build.

- `index.html`: portada. Mateixa tipografia (Helvetica Neue LT Pro, a `assets/fonts/`), logo i línies grises que la web original.
- `articles/el-nino/`: *El Niño i La Niña*, importat de l'artifact de Claude (17/11/2026) amb la barra prima de la revista i barra de progrés de lectura. `cover.jpg` és una captura del mapa de l'article.
- `assets/ib.css` i `assets/ib.js`: barra, peu i portada (classes `ib-*`, no xoquen amb els estils dels articles).

- `articles/calendari-cosmic/` i `articles/de-que-mor-el-mon/`: versions noves (2026) dels articles de 2020, traduïdes al català, amb dades validades i infografies fetes amb d3. `assets/article.css` i `assets/scrolly.js` són la base comuna dels articles.
- `../research/`: validacions de dades, cites i fonts (fetes amb tres agents), i les dades en CSV que fan servir els gràfics.

- `sistema/`: mostrari del sistema infogràfic (principis, colors, components i 54 peces animades, IB-01 a IB-54), amb `assets/ib-viz.js` com a codi comú. Les regles per als agents són a `research/sistema-infografic.md`.

Per afegir un article: carpeta `articles/<slug>/index.html` amb la mateixa capçalera (`ib-bar`), i una entrada a la portada.

```bash
python3 -m http.server 8000 --directory web
```

## Publicació

GitHub (`main`) és la versió de referència: tot el que s'hi fusiona es publica sol a Netlify, al domini https://inspiredby.uriocallaghan.com. Els canvis es fan en una branca amb pull request. Instruccions per a agents: `AGENTS.md`.
