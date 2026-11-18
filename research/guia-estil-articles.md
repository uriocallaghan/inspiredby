# Guia d'estil dels articles d'Inspired by Magazine

Model de referència: **«El Niño i La Niña»** (`web/articles/el-nino/index.html`). Llegeix-lo sencer abans de començar: text, estructura i codi dels gràfics. Altres exemples fets amb la mateixa base: `web/articles/calendari-cosmic/` i `web/articles/de-que-mor-el-mon/`.

La revista: *articles visuals per entendre el món*. Cada article explica una qüestió complexa de manera molt visual, maca i fàcil d'entendre. L'autor és molt exigent amb dues coses: **que tot sigui cert** i **que no sembli fet per una IA** (res de farciment, rètols decoratius, frases buides o dades inventades).

## 1. Escriptura

- **Català** natural i correcte, frases curtes, to de reportatge de diari (no de llibre de text ni de nota de premsa). Tracte de «tu» al lector quan cal («Baixa per veure…», «Arrossega…»).
- **Comença amb una història o una imatge concreta** (a El Niño: els pescadors del Perú abans de Nadal). Primer paràgraf amb caplletra (`<p class="dl">`).
- **Primer les peces, després el fenomen.** El Niño explica primer el vent, després l'aigua calenta, després la mesura, i només llavors El Niño. Cada secció respon una pregunta («Per què…?», «Què vol dir…?»).
- **Analogies quotidianes** (la banyera, el plat de sopa, els cavallets de la fira, el gronxador). Una per idea difícil, no més.
- **Números concrets** i amb unitats, sempre amb font. Arrodoneix com ho faria un diari (2,3 milions; uns 20 °C).
- Notes laterals en cursiva amb `<p class="note">` per a curiositats i matisos.
- Quan una cosa es debat o és incerta, **digues-ho** («encara es debat», «és una estimació»).
- Al final: **«Paraules clau»** (`<dl class="gl">`), i un bloc `.fn` amb **Metodologia** (què és dada real i què és esquema o simulació) i **Fonts** (llista numerada amb enllaços/DOI).
- Meta de capçalera: «N min de lectura · Dades: … · Actualitzat el 17 de novembre de 2026».
- Prohibit: rètols petits en majúscules decoratius, «Dins l'article», índexs numerats, seccions «Pròximament», cites inventades o no verificades, emojis.

## 2. Dades i rigor (obligatori)

- Cada xifra, data i afirmació científica ha de venir d'una **font primària o d'alta confiança** que hagis **obert i llegit** (article revisat per experts amb DOI, NASA/NOAA/ESA, IPCC, OMS, Global Carbon Project, etc.). Wikipedia o blogs només com a pista, mai com a font.
- Comprova cada DOI/URL online (que existeixi i que digui el que li atribueixes). No escriguis DOI de memòria sense verificar-los.
- Si un gràfic és un **esquema o una simulació**, digues-ho al peu («Esquema, no dades reals»). Si són **dades reals**, cita-les amb any i font al peu.
- Guarda la recerca a `research/<slug>/`: `fonts.md` (cada afirmació → font, amb URL i nota de verificació) i els CSV/JSON de dades que facin servir els gràfics.

## 3. Disseny (copia el sistema, no l'inventis)

- Tipografia dels articles: **Source Serif 4** (text) i **Source Sans 3** (etiquetes, gràfics), via Google Fonts (mateix `<link>` que El Niño). La portada de la revista fa servir Helvetica; **no la toquis**.
- Fons blanc, un sol tema clar, com una làmina impresa. Columna de lectura de 640 px (`.col`).
- Paleta (de `assets/article.css`): `--ink #121212`, `--ink-2 #4A4A4A`, `--muted #7A7A7A`, `--hair #DADADA`, `--land #ECEBE8`, `--warm #C8442A` (calent / destacat), `--cold #2C5DA8` (fred / aigua), i a El Niño també `--dry #9A6326`, `--wet #16786C`, `--bio #4C8A2E`. Rampes divergents blau–gris–vermell com la d'El Niño. Pocs colors, amb significat constant dins l'article.
- Base comuna: `assets/ib.css` (barra i peu de la revista), `assets/article.css` (tipografia, `.scrolly`, `.step`, `.fig`, `.cap`, `.tip`, `.rng`, `.playb`, `.ctl`, `.legend`, `.gh`, `.ann`, `dl.gl`, `.fn`), `assets/scrolly.js` (`IB.scrolly(stepsEl, graphicEl, onStep)`, `IB.reduced`, `IB.fmt`). **No modifiquis aquests fitxers compartits**: si necessites estils propis, posa'ls en un `<style>` a la pàgina.
- Llibreries: **d3 7.9.0** de `https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js`; si cal un mapa, `topojson-client@3.1.0` de jsdelivr i un mapa del món (p. ex. `world-atlas@2.0.2` de jsdelivr). Res més sense una raó molt bona. Canvas per a animacions amb moltes partícules; SVG per a gràfics de dades.

### Gràfics: el que fa bo El Niño

- **Seccions de scroll** (`.scrolly`) amb el gràfic enganxat a la dreta i els passos a l'esquerra: cada pas canvia el gràfic (estat, zoom, capes, anotacions). Transicions suaus i animació contínua quan té sentit (partícules, corrents, vent).
- **Anotacions sobre el gràfic** (etiquetes amb línies guia, noms de llocs, valors), no només llegendes.
- **Interactivitat real**: controls lliscants, botons de preset, «Reprodueix», línies del temps, tooltips en passar o tocar.
- **Dades reals en almenys un gràfic** (sèrie temporal, mapa, comparació), amb peu i font.
- Talls i esquemes que expliquen el mecanisme (un tall de l'oceà, de l'atmosfera, una cèl·lula), ben etiquetats.
- Llegendes petites en sans, peus de figura en gris (`.cap` / `figcaption`).
- Cada article: **mínim dues seccions de scroll o figures animades i dues figures interactives**, més d'altres de dades. Que siguin precises (escales, unitats, eixos) i boniques.

### Mòbil i accessibilitat

- Sota 900 px: el gràfic es queda enganxat a dalt (ocupa com a màxim ~50 % de l'alçada) i els passos passen per sota (ja ho fa `article.css`). Etiquetes que no hi caben → amaga-les o fes-les numerades. **Cap scroll horitzontal.**
- `role="img"` i `aria-label` descriptiu a cada gràfic; respecta `prefers-reduced-motion` (`IB.reduced`).
- Comprova-ho a 1440×900 i a 390×844.

## 4. Fitxers i estructura

- Article: `web/articles/<slug>/index.html` i `web/articles/<slug>/<slug>.js` (pots tenir-ne més d'un). Copia l'esquelet de capçalera, barra (`ib-bar` amb el logo), barra de progrés, peu i scripts de `web/articles/calendari-cosmic/index.html` (rutes relatives `../../assets/…`).
- Portada per a la revista: crea `web/articles/<slug>/cover.html` (SVG de 1680×720 fet amb codi, sense text, amb la paleta de l'article) i genera'n `cover.jpg`:
  `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --window-size=1680,720 --screenshot=cover.png file://…/cover.html` i converteix-lo amb `sips -s format jpeg cover.png --out cover.jpg`.
- **No toquis** la portada de la revista (`web/index.html`), altres articles, ni els fitxers compartits. Tampoc publiquis res: ho integra i publica l'editor.

## 5. Proves

- `node --check` de cada .js.
- Serveix la carpeta `web/` amb el teu propi port (`python3 -m http.server <port> --directory "<ruta>/web"`) i atura'l en acabar.
- Pots fer servir el navegador integrat (eines `mcp__Claude_Browser__*`) **només en una pestanya pròpia** (`tabs_create` i passa sempre el teu `tabId`); no toquis les altres pestanyes. Si no està disponible, fes servir Chrome headless (`--screenshot`, `--dump-dom`, `--enable-logging=stderr`).
- Recorre tots els passos del scroll i totes les interaccions; zero errors a la consola; zero desbordaments horitzontals.

## 6. Informe final

Resum de l'article (estructura i seccions), llista de gràfics (què mostren, si són dades o esquema), fonts principals, dubtes oberts i qualsevol cosa que no hagis pogut verificar.
