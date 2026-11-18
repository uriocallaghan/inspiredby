# Brief comú: peces noves del sistema infogràfic

Projecte: revista web «Inspired by Magazine» (articles visuals en català per entendre el món), carpeta `/Users/uriocallaghan/Documents/Claude Code/InspiredBy Magazine`. Ja hi ha un sistema infogràfic amb 20 peces (IB-01 a IB-20). L'editor el troba massa minimalista: vol peces **superpolides, elegants, molt creatives, molt visuals, animades i amb estats de hover**, formes de visualitzar dades **que no t'esperaries** però que s'entenen a l'instant. Pensa en el millor del NYT, Reuters Graphics, The Pudding, Bloomberg, FiveThirtyEight, La Lettura, Federica Fragapane: dibuix fi, molts elements petits i translúcids, anotacions elegants, moviment amb sentit.

## Llegeix primer (obligatori)

1. `research/sistema-infografic.md`: principis P1–P10, colors, tipografia, components. Compleix-ho tot.
2. `web/assets/ib-viz.js`: l'objecte `IBV`. Fes-lo servir: colors `IBV.C`/`IBV.CAT`, rampes `IBV.div`/`IBV.seq`, `IBV.mount` (redibuix per amplada), `IBV.svg`/`IBV.canvas`, text `IBV.t`/`IBV.lines` (halo), anotacions `IBV.note`/`IBV.box`/`IBV.rule`, eixos `IBV.gridY`/`IBV.axisX`, llegendes `IBV.legendRamp`/`legendSize`/`legendCat`, tooltip `IBV.tip` + `IBV.hover` (funciona amb el dit), mapes `IBV.world()`, atzar `IBV.rng`/`IBV.gauss`. **Nou**: `IBV.onView(el, cb)` per a l'animació d'entrada (només la primera vegada; `cb(true)` vol dir «sense animació»), `IBV.loop(el, frame)` per a animacions contínues (s'atura fora de pantalla i amb reduced motion), `IBV.focus(sel, isOn)` per a l'estat de hover (la resta baixa a 0,15), `IBV.DUR` i `IBV.EASE`.
3. `web/sistema/sistema.js`: com està escrita cada peça (patró `legend(n, …)` + `piece(n, (el,w)=>{…})`, helper `layer()` per a canvas+svg, `landMask()` per a mapes). Copia aquests helpers al teu fitxer.
4. `web/sistema/index.html` i `web/sistema/sistema.css`: l'estructura HTML exacta d'una peça (`section.pc#ib-NN` > `.pc-h` (número + `h4`), `.pc-d`, `.vh` (títol `strong`, subtítol `span`, `.lgs[data-lg=NN]`), `.plot[data-p=NN]`, `.ctlbar` opcional, `p.src`, `.pc-r` amb «Per a», «Regles», «Ve de»).
5. `web/articles/el-nino/index.html`: el model de qualitat de la revista (mira com són les anotacions, el mapa de punts, el tall, els controls).

Obre `web/sistema/index.html` al navegador per veure el nivell actual; el teu ha de ser clarament superior en riquesa visual i en moviment.

## Què has de lliurar

- `web/sistema/<nom>.js`: tot el teu codi dins d'una IIFE (`(function(){ "use strict"; … })();`), cap variable global. Un bloc comentat per peça (`/* IB-NN · NOM */`).
- `web/sistema/<nom>.html`: **fragment** HTML (sense `<html>`/`<head>`) amb un `<h3 class="fam">Nom de la família</h3>` i les teves seccions `section.pc`, amb el format exacte de l'index. `data-p` i `data-lg` = número de la peça (p. ex. `data-p="24"`). Botons de control amb `data-seg="NN"`/`data-play="NN"` o els teus propis atributs.
- `web/sistema/<nom>.css` només si necessites estils addicionals (prefixa les classes amb `ibx-`). Res de fons de color.
- `web/sistema/prova-<nom>.html`: pàgina de prova completa (copia el `<head>` i el peu d'`index.html`, enganxa-hi el fragment i carrega: d3 7.9.0, topojson-client 3.1.0, `../assets/ib-viz.js`, `dades.js` si el fas servir, el teu JS, `../assets/ib.js`). L'editor la integrarà; no toquis l'index.
- Si fas servir dades reals, un fitxer de dades `web/sistema/dades-<nom>.js` (`window.IBDATA_<NOM>=…`), petit (< 300 KB).

**No modifiquis** cap fitxer compartit: `web/assets/*`, `web/sistema/index.html`, `sistema.js`, `sistema.css`, `dades.js`, ni cap article. Si et falta un helper, escriu-lo dins del teu fitxer.

## Regles de disseny (a més del sistema)

- **P1: cap fons pintat** a cap peça (ni panells, ni targetes, ni ombres). Fons = blanc de la pàgina. La terra dels mapes (`IBV.C.land`) sí.
- Paleta: **només vermell, blau i groc** (`IBV.CAT`) i els seus tons (`IBV.CAT6`), grisos i terra. Rampes: `IBV.div`, `IBV.heat`, `IBV.seq` en blau o vermell. Prohibits ocre, verds i violeta. Mai text en groc. Gris per al context, color per a la història.
- Tipografia: Source Serif 4 per a títols, Source Sans 3 per a tot el que hi ha dins del gràfic. Text mínim 11 px reals. Xifres tabulars. Catalan correcte i natural. **Sense** majúscules decoratives, emojis ni rètols buits.
- **Cada peça**: animació d'entrada amb `IBV.onView` (creixement, dibuix de línies, aparició escalonada, morph), **estat de hover** ric (ressaltat amb `IBV.focus`, tooltip, línies guia, valors que apareixen) que també funcioni amb un toc, i, quan tingui sentit, un control (botons de segment `.seg`, lliscant `.rng` amb `aria-valuetext`, «Reprodueix» `.playb`). Transicions suaus (700–1200 ms, `d3.easeCubicInOut`).
- Anotacions dins del gràfic amb `IBV.note` (títol en negreta + una línia).
- Canvas per a més de ~2.000 elements o per a partícules; SVG per a la resta. Les animacions contínues amb `IBV.loop`. Amb `IBV.reduced`: estat final, sense moviment continu.
- Responsive real: es redibuixa amb `IBV.mount`. A 390 px no hi pot haver cap scroll horitzontal ni cap etiqueta tallada o solapada; a mòbil, menys etiquetes, no més petites.
- `role="img"` + `aria-label` que digui el que mostra el gràfic.
- Llibreries: només d3 7.9.0 (cdnjs), topojson-client 3.1.0 i world-atlas 2.0.2 (jsdelivr; `countries-110m.json` per defecte, `countries-50m.json` només si cal detall en una zona petita). Res més.

## Dades: veritat abans que res

L'editor és molt exigent: **res inventat que sembli real**.
- Dades d'exemple generades amb `IBV.rng(seed)`: el peu diu «**Dades d'exemple generades**, només per mostrar la forma.» Les etiquetes han de ser genèriques o descriptives («Grup A», «Ciutat 1», «Origen», «Destinació») o noms geogràfics reals sense afirmar cap xifra real sobre ells.
- Simulacions (camps de vent, partícules): el peu diu «**Simulació**, no dades reals».
- Dades reals: només de fitxers del repositori (`web/sistema/dades.js` amb l'ONI de la NOAA i el CO₂ de Mauna Loa; `research/*/` amb CSV del World Ocean Atlas, Global Carbon Budget, RAPID, etc.; mira els `fonts.md` de cada carpeta per citar-los bé) o la geografia de world-atlas. Peu: «**Dades reals.** Font: …».
- Cap afirmació sobre el món real a les anotacions si no ve d'aquestes dades.

## Proves (obligatòries)

- `node --check` de cada .js.
- Serveix `web/` amb el teu port: `python3 -m http.server <port> --directory "/Users/uriocallaghan/Documents/Claude Code/InspiredBy Magazine/web"` (atura'l en acabar).
- Mira la teva pàgina de prova a **1440×900** i a **390×844**. Pots fer servir el navegador integrat (`mcp__Claude_Browser__*`) **només en una pestanya pròpia** (`tabs_create` i passa sempre el teu `tabId`; no toquis altres pestanyes) o Chrome headless: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --window-size=1440,900 --virtual-time-budget=6000 --screenshot=/tmp/x.png <url>` (per a captures llargues, augmenta l'alçada de la finestra).
- Mira cada captura amb l'eina Read i corregeix: solapaments, etiquetes tallades, peces buides, colors fora de paleta, text massa petit. Comprova zero errors a la consola, que els hovers i els botons funcionen, i que no hi ha scroll horitzontal (`document.documentElement.scrollWidth === innerWidth`).
- Itera fins que cada peça sigui realment bonica. Millor menys peces impecables que moltes de fluixes, però l'objectiu és fer-les totes.

## Informe final (breu)

Taula amb: número, nom, què mostra, dades (reals/exemple/simulació), animació d'entrada, hover i controls. Fitxers creats. Problemes pendents.
