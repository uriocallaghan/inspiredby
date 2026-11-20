# Inspired by Magazine: instruccions per a agents

Revista web d'articles visuals per entendre el món, en català. Llegeix aquest fitxer sencer abans de tocar res.

## Com es publica

- **GitHub és la versió de referència.** La branca `main` de `uriocallaghan/inspiredby` és el que es veu a la web.
- **Tot el que entra a `main` es publica sol** a Netlify, al domini https://inspiredby.uriocallaghan.com (Netlify està connectat al repositori). No publiquis a mà (res de `netlify deploy`).
- **Treballa directament a `main`.** Fes `git pull origin main` abans de començar, verifica en local, fes commit i `git push origin main` perquè es publiqui de seguida sense deixar branques obertes. Només crea una branca i una PR si l'editor t'ho demana explícitament.
- No reescriguis l'historial de `main` ni facis `push --force` a `main`.

## Què hi ha

- `web/`: la web que es publica (estàtica, sense build). `web/articles.json` és el catàleg únic dels articles que genera `web/index.html` (la portada); `web/articles/<slug>/` els articles; `web/assets/` el codi i els estils comuns; `web/sistema/` el sistema infogràfic; `web/guidelines/` la pàgina visual de normes de l'editor.
- `scripts/`: eines de sistema (`sync-home.mjs` regenera la portada des de `web/articles.json`, `check.mjs` valida tot el conjunt).
- `research/`: dades, fonts i validacions de cada article, i les guies.
- `site/`: còpia de la web original del 2020–2021. **No la toquis.**

## Guies obligatòries

1. `research/guia-estil-articles.md`: com s'escriu un article, rigor de dades, cites, estructura i proves.
2. `research/sistema-infografic.md`: com han de ser els gràfics (principis, paleta, hover, lleugeresa) i les 73 peces, ordenades en vuit famílies per l'ús: `TIME` (quan), `MAP` (on), `SCALE` (com de gran), `SPREAD` (com es distribueix), `PART` (de què està fet), `LINK` (què connecta amb què), `HOW` (com funciona) i `CASE` (comparar casos). Codis en anglès amb número (`MAP-01`); els antics `IB-xx` ja no valen (equivalències a `research/sistema-codis.json`). Mostrari viu: `web/sistema/` (https://inspiredby.uriocallaghan.com/sistema/).
3. `research/guia-mobil.md`: adaptació a mòbil (alçada dels gràfics enganxats, gràfics verticals, etiquetes, tacte).

**Aquest fitxer i les guies de `research/` són la teva font.** `web/guidelines/` (https://inspiredby.uriocallaghan.com/guidelines/) és la pàgina visual de l'editor: hi veu les normes amb exemples, la llista de decisions preses i els punts pendents de decidir. No cal que la llegeixis per fer un article, però **quan l'editor fixa o canvia una norma**:

1. Escriu-la aquí (si és bàsica) i a la guia detallada que toqui, amb la data («decisió de l'editor, DD-MM-AAAA»).
2. Actualitza `web/guidelines/`: afegeix-la a «Decisions que ja has pres» (`TL` a `guidelines.js`), treu de «Per decidir» (`DEC`) el punt que hagi resolt i, si cal, l'exemple visual.
3. Si trobes dues normes que es contradiuen, no en triïs una pel teu compte: afegeix-ho a «Per decidir» amb les dues cites i el fitxer d'on surten, i avisa l'editor.

Tot al mateix commit. Cap norma ha de viure només en una conversa.

## Els gràfics surten del sistema, no de zero

El sistema infogràfic existeix perquè es faci servir. Per a cada article nou:

1. **Abans de dibuixar res**, escriu `research/<slug>/pla-visual.md`: una línia per gràfic amb la peça del sistema que fa servir (p. ex. «V2 · MAP-01 + MAP-11: mapa físic del viatge»), per què aquesta forma i d'on surten les dades. Si cap peça encaixa, explica-ho i descriu la peça nova; si després agrada a l'editor, s'afegeix al sistema.
2. **Copia el bloc de la peça** de `web/sistema/*.js` i canvia-hi les dades; no la reescriguis a mà.
3. **Tot mapa regional va sobre el mapa físic en relleu MAP-01** (l'estil dels evangelis): `node scripts/relleu.mjs` genera el relleu de la regió. Els mapes del món o d'un oceà van en terra plana; si és el cas, escriu «sense relleu: motiu» al pla visual.
4. **Abans de publicar**, repassa la llista del §6 de la guia per a cada gràfic.

`node scripts/check.mjs` falla si un article nou no té `pla-visual.md`, si hi cita peces que no existeixen o si té un mapa regional sense relleu; també avisa dels colors fora de la paleta.

## Mode fosc

- `web/assets/ib-theme.js` ha d'anar **el primer de tot al `<head>`** de cada pàgina (just després de `<meta charset>`, sense `defer`). Segueix el tema del sistema o el que tria el lector amb el botó de la barra (sol/lluna), desat a `localStorage`.
- En fosc, tradueix sol tots els colors en el moment de pintar-los: fulls d'estil, atributs SVG, estils en línia, canvas (`fillStyle`, `strokeStyle`, degradats i `putImageData`). **Els articles es continuen escrivint amb els colors clars de sempre**; no hi posis colors foscos ni `prefers-color-scheme` a mà. Les lectures (`getAttribute`, `getPropertyValue`, `getComputedStyle`) tornen el color clar original.
- Comprova cada article nou també en fosc (Playwright amb `colorScheme:'dark'`): text llegible, gràfics amb contrast i cap fons clar que enlluerni.
- Els canvas ocults que es llegeixen amb `getImageData` (màscares de terra o d'identitat per al hover) es queden en clar; un canvas ocult que es copia amb `drawImage` a un de visible es tradueix. Els modes de fusió `multiply`/`darken` passen a `screen`/`lighten`. Detalls i límits: `research/sistema-infografic.md`, §2 «Mode fosc».
- `node scripts/check.mjs` falla si una pàgina no carrega `ib-theme.js` el primer al `<head>` o si un article fa el seu propi mode fosc (decisió de l'editor, 20-11-2026: tota la web té mode fosc i cada article nou l'ha de tenir).

## Regles que l'editor no negocia

- **Mirada antropològica i transcultural:** sempre que el tema toqui l'experiència humana (hàbits, societat, història, clima viscut, economia, cos o ment), no et quedis en una explicació purament tècnica o descriptiva ni donis per «natural» el costum occidental modern. Obre i entrellaça l'article amb etnografia verificada, història cultural i contrast entre societats (p. ex. com el dormitori solitari és una raresa històrica, o com altres cultures usen el riure com a tribunal o ritu).
- **Res inventat.** Cada xifra ve d'una font primària verificada i citada. Dades d'exemple o simulacions, sempre dites al peu.
- **Cites d'un sol clic.** Cada número del text porta directament a la seva font a «Dades i fonts» (mai a una nota intermèdia), i la font diu què hi recolza i torna al text amb ↑. L'entradeta i els peus de gràfic no expliquen fonts: només enllacen a «Dades i fonts». Cada DOI i URL es comprova abans de publicar.
- **Res de «AI slop»:** cap rètol decoratiu en majúscules petites, cap índex numerat, cap secció «Pròximament», cap text de farciment, cap emoji (ni caràcters Unicode que els navegadors renderitzen com a emoji, com `◀`, `▶`, `↔`; fes servir sempre fletxes tipogràfiques `←` `→` `↑` `↓`).
- **Paleta:** vermell `#C8442A`, blau `#2C5DA8` i groc `#F5C518` (i els seus tons), grisos i terra, i un quart color, el **verd de la natura** (`#A6C06A` i tons; `IBV.C.green*`), només per a la natura viva: dibuixar vegetació i, com a categoria de dades, només si la categoria és natura (bosc, conreus, espais naturals). Mai text en groc ni en verd. Cap gràfic pinta fons. Al codi, els colors es diuen en anglès (`IBV.C.red`, `blue`, `yellow`, `green`); els noms catalans són àlies antics.
- **Portada:** tipografia Helvetica Neue LT Pro i l'aspecte original. No en redissenyis ni el CSS ni la maquetació, però **tots els articles de `web/articles/` han d'aparèixer sempre a la portada**: cada article nou porta el seu `thumb.webp` (800×1000; temporalment es pot copiar el d'un article existent si no se'n crea un de nou), s'afegeix a `web/articles.json` i es regenera `web/index.html` amb `node scripts/sync-home.mjs`.
- **Gràfics:** animats en entrar, amb hover que mostra clarament què s'apunta, superlleugers (canvas per a molts elements) i sense scroll horitzontal a 390 px.
- No modifiquis els fitxers compartits (`web/assets/*`) sense explicar-ho clarament al commit i al resum a l'editor.

## Abans de fer push a `main`

- `node scripts/sync-home.mjs` i `node scripts/check.mjs` (ha de passar amb 0 errors i 0 articles orfes; llegeix-ne també els avisos).
- Serveix `web/` en local (`python3 -m http.server 8000 --directory web`) i comprova 1440×900 i 390×844, **en clar i en fosc**: zero errors a la consola, cap scroll horitzontal, cap etiqueta tallada, i en fosc cap text il·legible ni fons clar.
- Al missatge de commit i a la resposta a l'editor: què canvia, quines dades són reals (amb fonts) i què no has pogut verificar.
