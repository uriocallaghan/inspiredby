# Inspired by Magazine: instruccions per a agents

Revista web d'articles visuals per entendre el món, en català. Llegeix aquest fitxer sencer abans de tocar res.

## Com es publica

- **GitHub és la versió de referència.** La branca `main` de `uriocallaghan/inspiredby` és el que es veu a la web.
- **Tot el que entra a `main` es publica sol** a Netlify, al domini https://inspiredby.uriocallaghan.com (Netlify està connectat al repositori). No publiquis a mà (res de `netlify deploy`).
- **Treballa directament a `main`.** Fes `git pull origin main` abans de començar, verifica en local, fes commit i `git push origin main` perquè es publiqui de seguida sense deixar branques obertes. Només crea una branca i una PR si l'editor t'ho demana explícitament.
- No reescriguis l'historial de `main` ni facis `push --force` a `main`.

## Què hi ha

- `web/`: la web que es publica (estàtica, sense build). `web/articles.json` és el catàleg únic dels articles que genera `web/index.html` (la portada); `web/articles/<slug>/` els articles; `web/assets/` el codi i els estils comuns; `web/sistema/` el sistema infogràfic; `web/guidelines/` la pàgina amb totes les normes.
- `scripts/`: eines de sistema (`sync-home.mjs` regenera la portada des de `web/articles.json`, `check.mjs` valida tot el conjunt).
- `research/`: dades, fonts i validacions de cada article, i les guies.
- `site/`: còpia de la web original del 2020–2021. **No la toquis.**

## Guies obligatòries

0. **`web/guidelines/index.html`** (https://inspiredby.uriocallaghan.com/guidelines/): el resum de **totes** les normes del projecte en una sola pàgina (publicació, mirada, to, rigor, cites i fonts, estructura, gràfics, mòbil, portada, comprovacions). Llegeix-la primer.
1. `research/guia-estil-articles.md`: com s'escriu un article, rigor de dades, cites, estructura i proves.
2. `research/sistema-infografic.md`: com han de ser els gràfics (principis, paleta, hover, lleugeresa) i les peces IB-01 a IB-59. Mostrari viu: `web/sistema/` (https://inspiredby.uriocallaghan.com/sistema/).
3. `research/guia-mobil.md`: adaptació a mòbil (alçada dels gràfics enganxats, gràfics verticals, etiquetes, tacte).

**Quan l'editor fixa o canvia una norma**, escriu-la alhora a `web/guidelines/index.html` i a la guia detallada que toqui (i aquí si és una regla bàsica), al mateix commit. Cap norma ha de viure només en una conversa.

## Els gràfics surten del sistema, no de zero

El sistema infogràfic existeix perquè es faci servir. Per a cada article nou:

1. **Abans de dibuixar res**, escriu `research/<slug>/pla-visual.md`: una línia per gràfic amb la peça IB que fa servir (p. ex. «V2 · IB-59 + IB-13: mapa físic del viatge»), per què aquesta forma i d'on surten les dades. Si cap peça encaixa, explica-ho i descriu la peça nova; si després agrada a l'editor, s'afegeix al sistema.
2. **Copia el bloc de la peça** de `web/sistema/*.js` i canvia-hi les dades; no la reescriguis a mà.
3. **Tot mapa regional va sobre el mapa físic en relleu IB-59** (l'estil dels evangelis): `node scripts/relleu.mjs` genera el relleu de la regió. Els mapes del món o d'un oceà van en terra plana; si és el cas, escriu «sense relleu: motiu» al pla visual.
4. **Abans de publicar**, repassa la llista del §6 de la guia per a cada gràfic.

`node scripts/check.mjs` falla si un article nou no té `pla-visual.md`, si hi cita peces que no existeixen o si té un mapa regional sense relleu; també avisa dels colors fora de la paleta.

## Regles que l'editor no negocia

- **Mirada antropològica i transcultural:** sempre que el tema toqui l'experiència humana (hàbits, societat, història, clima viscut, economia, cos o ment), no et quedis en una explicació purament tècnica o descriptiva ni donis per «natural» el costum occidental modern. Obre i entrellaça l'article amb etnografia verificada, història cultural i contrast entre societats (p. ex. com el dormitori solitari és una raresa històrica, o com altres cultures usen el riure com a tribunal o ritu).
- **Res inventat.** Cada xifra ve d'una font primària verificada i citada. Dades d'exemple o simulacions, sempre dites al peu.
- **Cites d'un sol clic.** Cada número del text porta directament a la seva font a «Dades i fonts» (mai a una nota intermèdia), i la font diu què hi recolza i torna al text amb ↑. L'entradeta i els peus de gràfic no expliquen fonts: només enllacen a «Dades i fonts». Cada DOI i URL es comprova abans de publicar.
- **Res de «AI slop»:** cap rètol decoratiu en majúscules petites, cap índex numerat, cap secció «Pròximament», cap text de farciment, cap emoji (ni caràcters Unicode que els navegadors renderitzen com a emoji, com `◀`, `▶`, `↔`; fes servir sempre fletxes tipogràfiques `←` `→` `↑` `↓`).
- **Paleta:** només vermell `#C8442A`, blau `#2C5DA8` i groc `#F5C518` (i els seus tons), grisos i terra. Mai text en groc. Cap gràfic pinta fons. Única excepció: el **verd vegetal** (`IBV.C.vegetacio*`, vegeu el §2 del sistema infogràfic), només per dibuixar vegetació.
- **Portada:** tipografia Helvetica Neue LT Pro i l'aspecte original. No en redissenyis ni el CSS ni la maquetació, però **tots els articles de `web/articles/` han d'aparèixer sempre a la portada**: cada article nou porta el seu `thumb.webp` (800×1000; temporalment es pot copiar el d'un article existent si no se'n crea un de nou), s'afegeix a `web/articles.json` i es regenera `web/index.html` amb `node scripts/sync-home.mjs`.
- **Gràfics:** animats en entrar, amb hover que mostra clarament què s'apunta, superlleugers (canvas per a molts elements) i sense scroll horitzontal a 390 px.
- No modifiquis els fitxers compartits (`web/assets/*`) sense explicar-ho clarament al commit i al resum a l'editor.

## Abans de fer push a `main`

- `node scripts/sync-home.mjs` i `node scripts/check.mjs` (ha de passar amb 0 errors i 0 articles orfes; llegeix-ne també els avisos).
- Serveix `web/` en local (`python3 -m http.server 8000 --directory web`) i comprova 1440×900 i 390×844: zero errors a la consola, cap scroll horitzontal, cap etiqueta tallada.
- Al missatge de commit i a la resposta a l'editor: què canvia, quines dades són reals (amb fonts) i què no has pogut verificar.
