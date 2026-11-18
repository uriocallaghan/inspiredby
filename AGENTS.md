# Inspired by Magazine: instruccions per a agents

Revista web d'articles visuals per entendre el món, en català. Llegeix aquest fitxer sencer abans de tocar res.

## Com es publica

- **GitHub és la versió de referència.** La branca `main` de `uriocallaghan/inspiredby` és el que es veu a la web.
- **Tot el que entra a `main` es publica sol** a Netlify (https://inspiredby-magazine.netlify.app), que està connectat al repositori. No publiquis a mà (res de `netlify deploy`).
- **No treballis directament a `main`.** Crea una branca (`article/<slug>`, `sistema/<canvi>`, `fix/<què>`), fes-hi els commits i obre una pull request. Netlify en fa una previsualització (deploy preview) amb un enllaç propi: és el que l'editor revisa. L'editor és qui fusiona.
- No reescriguis l'historial de `main` ni facis `push --force` a `main`.

## Què hi ha

- `web/`: la web que es publica (estàtica, sense build). `web/index.html` és la portada; `web/articles/<slug>/` els articles; `web/assets/` el codi i els estils comuns; `web/sistema/` el sistema infogràfic.
- `research/`: dades, fonts i validacions de cada article, i les guies.
- `site/`: còpia de la web original del 2020–2021. **No la toquis.**

## Guies obligatòries

1. `research/guia-estil-articles.md`: com s'escriu un article, rigor de dades, estructura i proves.
2. `research/sistema-infografic.md`: com han de ser els gràfics (principis, paleta, hover, lleugeresa) i les 54 peces IB-01 a IB-54. Mostrari viu: `web/sistema/` (https://inspiredby-magazine.netlify.app/sistema/).

## Regles que l'editor no negocia

- **Res inventat.** Cada xifra ve d'una font primària verificada i citada. Dades d'exemple o simulacions, sempre dites al peu.
- **Res de «AI slop»:** cap rètol decoratiu en majúscules petites, cap índex numerat, cap secció «Pròximament», cap text de farciment, cap emoji.
- **Paleta:** només vermell `#C8442A`, blau `#2C5DA8` i groc `#F5C518` (i els seus tons), grisos i terra. Mai text en groc. Cap gràfic pinta fons.
- **Portada:** tipografia Helvetica Neue LT Pro i l'aspecte original. No la redissenyis.
- **Gràfics:** animats en entrar, amb hover que mostra clarament què s'apunta, superlleugers (canvas per a molts elements) i sense scroll horitzontal a 390 px.
- No modifiquis els fitxers compartits (`web/assets/*`) en una PR d'article; si cal canviar-los, fes-ho en una PR a part que ho expliqui.

## Abans d'obrir la PR

- `node --check` de cada `.js` que hagis tocat.
- Serveix `web/` en local (`python3 -m http.server 8000 --directory web`) i comprova 1440×900 i 390×844: zero errors a la consola, cap scroll horitzontal, cap etiqueta tallada.
- A la descripció de la PR: què canvia, quines dades són reals (amb fonts) i què no has pogut verificar.
