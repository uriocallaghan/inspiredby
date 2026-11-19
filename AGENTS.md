# Inspired by Magazine: instruccions per a agents

Revista web d'articles visuals per entendre el món, en català. Llegeix aquest fitxer sencer abans de tocar res.

## Com es publica

- **GitHub és la versió de referència.** La branca `main` de `uriocallaghan/inspiredby` és el que es veu a la web.
- **Tot el que entra a `main` es publica sol** a Netlify, al domini https://inspiredby.uriocallaghan.com (Netlify està connectat al repositori). No publiquis a mà (res de `netlify deploy`).
- **Treballa directament a `main`.** Fes `git pull origin main` abans de començar, verifica en local, fes commit i `git push origin main` perquè es publiqui de seguida sense deixar branques obertes. Només crea una branca i una PR si l'editor t'ho demana explícitament.
- No reescriguis l'historial de `main` ni facis `push --force` a `main`.

## Què hi ha

- `web/`: la web que es publica (estàtica, sense build). `web/articles.json` és el catàleg únic dels articles que genera `web/index.html` (la portada); `web/articles/<slug>/` els articles; `web/assets/` el codi i els estils comuns; `web/sistema/` el sistema infogràfic.
- `scripts/`: eines de sistema (`sync-home.mjs` regenera la portada des de `web/articles.json`, `check.mjs` valida tot el conjunt).
- `research/`: dades, fonts i validacions de cada article, i les guies.
- `site/`: còpia de la web original del 2020–2021. **No la toquis.**

## Guies obligatòries

1. `research/guia-estil-articles.md`: com s'escriu un article, rigor de dades, estructura i proves.
2. `research/sistema-infografic.md`: com han de ser els gràfics (principis, paleta, hover, lleugeresa) i les 54 peces IB-01 a IB-54. Mostrari viu: `web/sistema/` (https://inspiredby.uriocallaghan.com/sistema/).

## Regles que l'editor no negocia

- **Mirada antropològica i transcultural:** sempre que el tema toqui l'experiència humana (hàbits, societat, història, clima viscut, economia, cos o ment), no et quedis en una explicació purament tècnica o descriptiva ni donis per «natural» el costum occidental modern. Obre i entrellaça l'article amb etnografia verificada, història cultural i contrast entre societats (p. ex. com el dormitori solitari és una raresa històrica, o com altres cultures usen el riure com a tribunal o ritu).
- **Res inventat.** Cada xifra ve d'una font primària verificada i citada. Dades d'exemple o simulacions, sempre dites al peu.
- **Res de «AI slop»:** cap rètol decoratiu en majúscules petites, cap índex numerat, cap secció «Pròximament», cap text de farciment, cap emoji (ni caràcters Unicode que els navegadors renderitzen com a emoji, com `◀`, `▶`, `↔`; fes servir sempre fletxes tipogràfiques `←` `→` `↑` `↓`).
- **Paleta:** només vermell `#C8442A`, blau `#2C5DA8` i groc `#F5C518` (i els seus tons), grisos i terra. Mai text en groc. Cap gràfic pinta fons.
- **Portada:** tipografia Helvetica Neue LT Pro i l'aspecte original. No en redissenyis ni el CSS ni la maquetació, però **tots els articles de `web/articles/` han d'aparèixer sempre a la portada**: cada article nou porta el seu `thumb.webp` (800×1000; temporalment es pot copiar el d'un article existent si no se'n crea un de nou), s'afegeix a `web/articles.json` i es regenera `web/index.html` amb `node scripts/sync-home.mjs`.
- **Gràfics:** animats en entrar, amb hover que mostra clarament què s'apunta, superlleugers (canvas per a molts elements) i sense scroll horitzontal a 390 px.
- No modifiquis els fitxers compartits (`web/assets/*`) sense explicar-ho clarament al commit i al resum a l'editor.

## Abans de fer push a `main`

- `node scripts/sync-home.mjs` i `node scripts/check.mjs` (ha de passar amb 0 errors i 0 articles orfes).
- Serveix `web/` en local (`python3 -m http.server 8000 --directory web`) i comprova 1440×900 i 390×844: zero errors a la consola, cap scroll horitzontal, cap etiqueta tallada.
- Al missatge de commit i a la resposta a l'editor: què canvia, quines dades són reals (amb fonts) i què no has pogut verificar.
