# Auditoria exhaustiva d'adaptació a mòbil dels 12 articles

Data: 19 de novembre de 2026  
Mètode: inspecció completa del codi font (HTML, CSS i JS) dels 12 articles de `web/articles/` + mesurament real en navegador Chromium headless a **390×844 px** (DPR 2, mòbil) recorrent totes les pàgines.

---

## 1. Resum executiu

**Bona notícia estructural:**
- **0 errors de consola** en els 12 articles.
- **0 desbordaments horitzontals de pàgina** (`scrollWidth === 390` a tots 12).
- **Cap article fa servir `viewBox` fix que escali i encongeixi el text**: tots redibuixen a l'amplada real (`350 px` en `.fig`, `342 px` en `.scrolly`).

**Els 4 problemes sistèmics reals trobats:**
1. **`.scrolly` massa alts que ofeguen l'espai de lectura (el problema més greu):** en **11 de les 22 seccions `.scrolly`**, el contenidor `.graphic` enganxat a dalt ocupa entre el **50 % i el 76 % de la pantalla** (425–638 px sobre 844 px). En un mòbil real amb barra de Safari/Chrome (~664–700 px visibles), això deixa entre **30 i 240 px** per llegir passos que sovint fan `300–597 px` d'alçada!
2. **Gràfics horitzontals que s'haurien de transposar a vertical (o apilar):** hi ha **10 gràfics complexos** que a 350 px es queden horitzontals o costat a costat i queden massa estrets, apinyats o tallats.
3. **Etiquetes tallades o solapades a 350 px:** en **10 dels 12 articles** hi ha textos dins SVG/Canvas que surten fora del marge esquerre/dret o xoquen amb eixos/etiquetes veïnes en determinats passos o vistes.
4. **Friccions tàctils:** sliders `.rng` de `28 px` amb thumb de `16 px` a diversos articles, absència de tancament en tocar fora a `per-que-dormim` i `per-que-riem`, bloqueig de l'scroll vertical al mapa `#betlem` (`jesus-i-els-quatre-evangelis`) i conflicte `touch-action` a `#tsw` (`cinta-transportadora`).

---

## 2. Taula comparativa de tots els `.scrolly` (mesures reals a 390×844 px)

Objectiu segons `research/guia-mobil.md`: **`.graphic` ≤ 42 % (≤ 355 px)** perquè quedin **≥ 490 px** (a 844 px) / **≥ 340 px** (en mòbil real amb barres).

| Prioritat | Article | Secció `.scrolly` | Alçada `.graphic` | % de 844 px | Espai lectura | Pas més alt (`.step-in`) | Causa principal |
|---|---|---|---:|---:|---:|---:|---|
| **Crític** | `migracio-vertical` | Scrolly 1 (`#ograph`) | **638 px** | **76 %** | 206 px | 497 px | **Bug:** `<canvas id="ocean">` buit (173 px) apilat sobre `IBV.canvas` (287 px) + `.vh` amb llegenda + `.ctlrow` |
| **Crític** | `migracio-vertical` | Scrolly 2 (`#cgraph`) | **612 px** | **73 %** | 232 px | 326 px | **Bug:** `<canvas id="carb">` buit (173 px) apilat sobre `IBV.canvas` (287 px) + `.vh` amb llegenda de 5 ítems |
| **Crític** | `jesus-i-els-quatre-evangelis` | Scrolly 1 (`#s-temps`) | **586 px** | **69 %** | 258 px | 308 px | Cronologia horitzontal amb `h = 509 px` fixos + `.vh` amb llegenda de 5 ítems |
| **Crític** | `virus-i-bacteris` | Scrolly 1 (`#igraphic`) | **547 px** | **65 %** | 297 px | 385 px | Canvas `321 px` + `.vh` (títol + subtítol + llegenda visibles) + `.ctlrow` |
| **Crític** | `el-jesus-historic` | Scrolly 2 (`#s-mirall`) | **513 px** | **61 %** | 331 px | 308 px | `h = 380 px` fix + `.vh` amb llegenda visible + `.readout` visible |
| **Alt** | `calendari-cosmic` | Scrolly 1 (`#calgraphic`) | **482 px** | **57 %** | 362 px | 557 px | SVG `328 px` + `.vh` amb subtítol/llegenda + `.ibv-dock` + `#calList` |
| **Alt** | `el-nino` | Scrolly 2 (`#graphic`) | **482 px** | **57 %** | 362 px | 525 px | 3 canvas apilats (`#mc` + `#xs` + `#tl`) + `.ghead` + `.lg-m` + `.ctl` |
| **Mitjà** | `de-que-mor-el-mon` | Scrolly 1 (`#ppgraphic`) | **440 px** | **52 %** | 404 px | 304 px | SVG `357 px` + `padding-bottom: 64px` |
| **Mitjà** | `virus-i-bacteris` | Scrolly 2 (`#cgraphic`) | **428 px** | **51 %** | 416 px | 385 px | Canvas `267 px` + `.vh` complet (títol + subtítol + llegenda) |
| **Mitjà** | `per-que-dormim` | Scrolly 2 (`#s-antropologia`) | **427 px** | **51 %** | 417 px | 416 px | SVG `350 px` + `.vh` amb llegenda + `.ibv-dock` |
| **Mitjà** | `el-jesus-historic` | Scrolly 1 (`#s-cares`) | **425 px** | **50 %** | 419 px | 496 px | Mapa+cinta `312 px` + llegenda 4 ítems + `.readout` |
| **Mitjà** | `per-que-dormim` | Scrolly 1 (`#s-nit`) | **417 px** | **49 %** | 427 px | 597 px | SVG `340 px` + llegenda 3 ítems + `.ibv-dock` |
| **Mitjà** | `per-que-riem` | Scrolly 1 (`#s-evolucio`) | **417 px** | **49 %** | 427 px | 335 px | SVG `340 px` + llegenda 3 ítems + `.ibv-dock` |
| **Mitjà** | `cinta-transportadora` | Scrolly 1 (`#ggraphic`) | **413 px** | **49 %** | 431 px | 331 px | Globus `320 px` + `.vh` amb rampa + `.ibv-dock` |
| **Mitjà** | `jesus-i-els-quatre-evangelis` | Scrolly 2 (`#s-mapa`) | **407 px** | **48 %** | 437 px | 283 px | Mapa `330 px` + `.vh` + `.ibv-dock` |
| **Mitjà** | `per-que-riem` | Scrolly 2 (`#s-grooming`) | **407 px** | **48 %** | 437 px | 335 px | SVG `330 px` + llegenda 3 ítems + `.ibv-dock` |
| **Mitjà** | `pols-del-sahara` | Scrolly 2 (`#mgraphic`) | **404 px** | **48 %** | 440 px | 368 px | Mapa `246 px` + `.vh` amb subtítol + `.ctlrow` |
| **Correcte** | `el-nino` | Scrolly 1 (`#pgraphic`) | **395 px** | **47 %** | 449 px | 468 px | Globus `333 px` (reduïble a ~260 px per més marge) |
| **Òptim** | `on-va-el-co2` | Scrolly 1 & 2 (`#scA`, `#scB`) | **358 px** | **42 %** | 486 px | 323 / 527 px | Canvas `256 px` + `.vh` sense llegenda |
| **Òptim** | `pols-del-sahara` | Scrolly 1 (`#bgraphic`) | **351 px** | **42 %** | 493 px | 412 px | Mapa `253 px` + `.vh` sense llegenda |
| **Òptim** | `el-nino` | Scrolly 3 (`#mgraphic`) | **329 px** | **39 %** | 515 px | 365 px | Tall `273 px` + `.cap` |
| **Òptim** | `cinta-transportadora` | Scrolly 2 (`#xgraphic`) | **319 px** | **38 %** | 525 px | 358 px | Tall `226 px` + `.vh` + `.ibv-dock` |

---

## 3. Gràfics horitzontals o compostos que cal transposar a vertical en mòbil

1. **`cinta-transportadora` — `#denfig` (`#tsw` + `#colc`)**: estan costat a costat (`226 px` + `114 px`), fent que la boleta solapi les xifres de densitat a `#colc` i les isopicnes s'apinyin. **Solució:** apilar en 1 columna (`1fr`).
2. **`jesus-i-els-quatre-evangelis` — `#flux` (V7a, Sankey)**: horitzontal amb `176 px` útils pels corrents. **Solució:** transposar a vertical `top → bottom` (com `#shunt-viz` de `virus-i-bacteris`).
3. **`virus-i-bacteris` — `#tline-viz` (línia del temps 1987–2023)**: 13 punts en `314 px` amb 9 fites apinyades entre 2000 i 2013 (~8 px entre punts). **Solució:** transposar a línia del temps vertical.
4. **`el-jesus-historic` — `#viz-escala` (escala logarítmica)**: horitzontal; `Tiberíades` (9.000) i `Sèforis` (10.000) queden a 4 px i es trepitgen. **Solució:** transposar a cinta vertical.
5. **`migracio-vertical` — `#regwrap` (Malaspina, 6 regions)**: 6 columnes de `49 px` amb etiquetes que es toquen al peu. **Solució:** girar a 6 files horitzontals amb nom a sobre.
6. **`per-que-dormim` — `#vida-viz` (vista `edat`)**: 9 franges verticals de `33 px` amb etiquetes (`14–17a`, `18–25a`, `26–64a`) que xoquen. **Solució:** girar a 9 files horitzontals.
7. **`per-que-dormim` — `#animals-viz` (3 vistes)**: horitzontal amb anotacions que surten per la dreta i punts petits de 9 px. **Solució:** disposició vertical o files horitzontals amb noms a sobre en `primats`/`tots`.
8. **`calendari-cosmic` — `#erasbox` (vista `log`, 39 fites)**: horitzontal en `350 px`; la majoria de fites perden etiqueta i els punts de `r=2,2` s'amunteguen. **Solució:** transposar a eix logarítmic vertical en mòbil.
9. **`per-que-riem` — `#acustica-viz` (3 mètriques inferiors)**: 3 columnes de `107 px` dins l'SVG fan que `"Alliberament d'opioides"` solapi la columna 3 i toqui la vora inferior. **Solució:** apilar les 3 mètriques verticalment.
10. **`jesus-i-els-quatre-evangelis` — `#temps` (V1 scrolly)**: 5 blocs horitzontals que fan `509 px` d'alt i en mòbil solapen bombolles (`Ø 29 px > rh 24 px`). **Solució:** compactar per bloc actiu al pas del scroll (mostrant només el focus o reduint alçada a `≤ 260 px`).

*(Nota positiva: `#shunt-viz` de `virus-i-bacteris`, `#provine-viz`, `#acustica-viz` i `#cultures-viz` de `per-que-riem`, i `#pjw`/`#tipw` de `cinta-transportadora` ja apliquen bones adaptacions verticals/apilades que serveixen de model.)*

---

## 4. Detall complet article per article

### 1. `migracio-vertical` — Prioritat CRÍTICA
- **Bug de canvas duplicat:** a `#oStack` (`index.html:104`), `#echoStack` i `#cStack`, l'HTML inclou un `<canvas>` (`#ocean`, `#echo`, `#carb`) i `migracio.js` n'hi afegeix un segon amb `IBV.canvas`, duplicant l'alçada (`638 px` i `612 px` als dos scrollys, `495 px` a `#echoStack`). **Eliminar els `<canvas>` redundants a l'HTML o muntar-hi directament.**
- **`.scrolly`:** amagar `.graphic .vh span` i `.graphic .vh .lgs` a `≤ 899 px` (actualment només s'amaguen a `max-height: 700px`), i baixar l'alçada del canvas a `≤ 230–250 px`.
- **`#szHumWrap` (retall confirmat en Chrome):** `Tolosa` (~254 km) excedeix `KMAX = 230` i queda tallada fora de la vora dreta. Pujar `KMAX` o ajustar l'escala en mòbil.
- **`#regwrap`:** transposar 6 columnes de 49 px a 6 files horitzontals.
- **`#echo` (mode `polar`):** 13 tics en 302 px se solapen; passar a pas de `24 h` en mòbil.
- **`#estwrap`:** l'últim tic `"7 PgC/any"` surt ~9 px per la dreta (`anchor: "end"` a l'últim tic).
- **Tàctil:** sliders `#oRng` i `#szRng` tenen `height: 28px` / thumb `16px`.

### 2. `jesus-i-els-quatre-evangelis` — Prioritat CRÍTICA
- **Scrolly 1 (`#s-temps`):** `586 px` (69 % viewport). Reduir drasticament l'alçada del gràfic en mòbil (màx. 260 px) i amagar `#temps-lg` dins `.graphic`.
- **Scrolly 2 (`#s-mapa`):** `407 px` (48 %). Baixar `h` de 330 a ~250 px i amagar llegenda dins `.graphic`; revisar `"Mar Mort (−415 m)"` a la dreta.
- **`#betlem` (V5, bug tàctil greu):** `startDrag` fa `ev.preventDefault()` al `pointerdown` de tot el mapa, bloquejant l'scroll vertical de la pàgina. Restringir-lo al mànec del divisor (ampliat a `r = 22`). A més, les dues etiquetes de la barra inferior (`4 aC` i `6 dC`) es toquen/tallen, i les etiquetes de Mateu es tallen a la dreta per `overflow: hidden`.
- **`#flux` (V7a):** transposar el flux Sankey a vertical en mòbil.
- **`#intro-viz`, `#biblio`, `#aparicions-orb`:** etiquetes esquerres (`"≈ 6 aC – ≈ 30 dC"`, `"1 Tessalonicencs"`, `"Els deixebles (Jerusalem)"`) es tallen pel marge esquerre. Passar les etiquetes a sobre de cada fila en mòbil.
- **`#pujada`:** `"0 m (nivell del mar)"` se solapa amb el perfil.
- **`#setmana` (vista `escenes`):** la píndola de hover (`M.t - 6`) solapa els tics superiors (`M.t - 14`).
- **`#flors`:** les etiquetes radials de hover surten de la cel·la 2×2 i envaeixen la veïna.

### 3. `virus-i-bacteris` — Prioritat CRÍTICA
- **Scrolly 1 (`#igraphic`):** `547 px` (65 % viewport). Amagar `.graphic .vh span` i `.graphic .vh .lgs` a `≤ 899 px` i limitar `#inf-viz` a `≤ 240 px`. A l'escena 0, reduir de 5 a 2–3 etiquetes simultànies.
- **Scrolly 2 (`#cgraphic`):** `428 px` (51 %). Amagar subtítol i llegenda a `≤ 899 px`. A `#cr-viz`, **`LBL()` no fa clamp** i talla textos per la dreta en 5 escenes (0, 1, 3, 6, 7).
- **`#tline-viz`:** transposar la línia del temps 1987–2023 a vertical en mòbil.
- **`#scale-ribbon` i `#scale-viz`:** a la cinta, la fila 2 d'etiquetes (`y=181`) solapa `"Escala logarítmica →"` (`y=178`). Al canvas, `"Fag T4..."` i `"Cèl·lula humana..."` surten per la dreta sense clamp.
- **`#def-viz`:** a la vista 0, `"Restricció-modificació"` frega/talla el marge esquerre i `rh = 20 px` és massa baix per tocar. A la vista 1, les dues anotacions superiors se solapen i les barres fan `9,5 px`.
- **`#shunt-viz`:** molt bona transposició vertical; ajustar només la franja inferior entre `"Curtcircuit viral"` i `"↑ Més reciclatge microbià"`, i treure `document.addEventListener("pointerdown", ...)` fora de `draw()` perquè no s'acumuli.

### 4. `el-jesus-historic` — Prioritat ALTA
- **Scrolly 2 (`#s-mirall`):** `513 px` (61 % viewport) per `h = 380` fix + llegenda + `.readout`. Baixar `h` a `240–250 px`, amagar `.vh .lgs` i compactar `.readout`. Fer clamp dels títols dels orbs drets (`x=0.68–0.70`).
- **Scrolly 1 (`#s-cares`):** `425 px` (50 %). Baixar `hMap + hTime` de 312 a ~245 px i amagar llegenda; ampliar hitbox dels 24 punts de la cinta temporal.
- **`#viz-escala`:** transposar a cinta vertical perquè `Tiberíades` i `Sèforis` no se superposin.
- **`#viz-enquesta`:** en mode `yougov`, `"Orient Mitjà"` frega `"22 %"` a la mateixa alçada; en mode `plos`, pujar una mica l'espaiat entre files.

### 5. `per-que-dormim` — Prioritat ALTA
- **Bug tàctil global:** 5 de 7 gràfics (`#animals-viz`, `#antro-viz`, `#vida-viz`, `#foc-viz`, `#cson-viz`) no tanquen el focus/tooltip en tocar fora. Migrar a `IBV.hover` o afegir tancament fora.
- **Scrollys (`#s-nit` 417 px / 49 %; `#s-antropologia` 427 px / 51 %):** amagar `.vh .lgs` dins `.graphic` i reduir `h` de `340–350` a `240–250 px`. A `#s-nit`, els passos arriben a `597 px` d'alt!
- **`#nit-viz`:** el títol `eegTitle` (`"Senyal EEG en N2: base suau amb esclats..."`) desborda greument per la dreta a 342 px → escurçar-lo en mòbil.
- **`#antro-viz`:** `"Mínim tèrmic"` solapa `"06:00"`; els 18 arcs de `sentinella` (~3,5 px) necessiten cerca pel més proper.
- **`#animals-viz`:** `"Predicció humana: 9,55 h..."` i `"20 h totals"` surten per la dreta; punts de `9 px` sense hitbox ampliada.
- **`#borbely-viz`:** anotacions de `blanc` i `cafe` surten per la dreta (`anchor: "end"`).
- **`#vida-viz`:** transposar vista `edat` a files horitzontals; fer clamp de `"pic més nocturn..."` a l'esquerra i reduir tics de `privacio`.

### 6. `calendari-cosmic` — Prioritat ALTA
- **Scrolly 1 (`#calgraphic`):** `482 px` (57 % viewport), mentre el pas més llarg fa `557 px`. Reduir `H` del SVG a `240–255 px`, amagar `.vh span` i `#calLg` en mòbil, i compactar `#calList` a 1–2 línies curtes.
- **`#calplot`:** a `day`, els badges `tools` (21:54) i `homo` (22:13) se solapen (4,75° de separació). A `sec`, `"Una vida de 80 anys"` frega `24:00`.
- **`#erasbox` (vista `log`):** transposar a eix logarítmic vertical en mòbil.
- **`#lifebox`:** el slider `#lifeRange` queda comprimit a ~95 px d'ample dins `.rng-wrap` i té thumb de `16 px`. Posar-lo en la seva pròpia fila al 100 % d'amplada.

### 7. `el-nino` — Prioritat ALTA
- **Scrolly 2 (`#graphic`):** `482 px` (57 % viewport) pels 3 canvas + capçalera + llegenda + controls. Compactar el bloc de controls en 1 sola fila i baixar `#mc` a `115–120 px` / `#xs` a `72 px` per situar-lo sota `380 px`.
- **Tooltips amb `white-space: nowrap`:** `#tip` i `#atip` desborden i es tallen a 350 px; `#atip` no es tanca en fer scroll. Canviar a `white-space: normal` o dock.
- **Tipografia < 11 px en canvas:** gairebé tots els canvas usen `fs = 10.5` i `fs - 1 = 9.5` en mòbil → pujar el mínim a `11 px`.
- **`#anom`, `#zones`, `#rain`, `#osc`:** reduir tics d'eix X a `#anom` (mesos alterns), separar `"llindar de la pluja"` a `#zones`, fer clamp esquerre de `"1. Dipòsit ple"` a `#osc`, i ampliar els botons `#aReplay` / `#oReplay` a 44 px.

### 8. `per-que-riem` — Prioritat MITJANA-ALTA
- **Bug tàctil global:** les 6 visualitzacions no tanquen el focus/tooltip en tocar fora.
- **Scrollys (`#s-evolucio` 417 px / 49 %; `#s-grooming` 407 px / 48 %):** amagar `.vh .lgs` dins `.graphic` i baixar `h` a `240–250 px`.
- **`#acustica-viz`:** apilar verticalment les 3 mètriques inferiors perquè `"Alliberament d'opioides"` no solapi la columna 3 ni toqui la vora inferior.
- **`#grm-viz`:** `"Cor natural: 3–4 persones (Dezecache & Dunbar, 2012)"` es talla per la dreta → partir en 2 línies i fer clamp.
- **`#evo-viz`:** ajustar `rootNote` perquè no solapi les branques superiors.

### 9. `on-va-el-co2` — Prioritat MITJANA-ALTA
- **Scrollys (`#scA`, `#scB`):** molt bona alçada global (**358 px / 42 %**)! Però **`#scB` té solapaments i talls greus** en 4 dels 6 passos (0, 1, 2 i 5; 1 text tallat confirmat en Chrome en estat inicial). Reubicar i escurçar les anotacions per a `w < 600`. A `#scA` pas 2, `"Ús del sòl · 4,4 Gt"` surt lleugerament per la dreta.
- **`#pPlot` (persistència):** 8 tics logarítmics en 328 px fan que `0` i `1` se solapin → reduir a `0, 10, 100, 1.000, 100 mil, 1 M` en mòbil.
- **Tàctil (`12` controls petits detectats):** pujar `.seg button` de 42 a 44 px, ampliar `#pRng`, i a `#yPlot` (barres de 4,2 px) afegir navegació tàctil `← / →` o busca pel més proper.

### 10. `cinta-transportadora` — Prioritat MITJANA
- **Scrollys:** `#xgraphic` és un model exemplar (**319 px / 38 %**); `#ggraphic` fa **413 px (49 %)** → reduir el globus de `320` a `240–250 px`. Revisar el pas 5 de `#gov` (4 anotacions simultànies) i donar fons translúcid a `#xov .ann`.
- **`#denfig` (`#tsw` + `#colc`):** apilar en 1 columna i corregir el conflicte `touch-action: pan-y` d'`IBV.hover` sobre l'arrossegament del punt T–S.
- **`#winfig`:** separar `Bergen` i `Mar de Noruega` en 227 px.
- **`#paleow` / `#tipw`:** separar lleugerament `B-A` i `DR` a `#paleow`; escurçar la descripció de `Drijfhout et al.` a `#tipw`.

### 11. `de-que-mor-el-mon` — Prioritat MITJANA
- **Scrolly 1 (`#ppgraphic`):** `440 px` (52 %). Baixar `H` a `~260 px` i reduir `padding-bottom`. Al pas `"ALL"`, pujar text de `10,5` a `11 px` i posar noms a sobre o abreujats perquè no es tallin a l'esquerra.
- **`#pop` i `#bd`:** etiquetes tallades per dalt (`"Màxim previst"`) i per la dreta (`"Projecció ONU"`, `"Es creuen cap al 2084"`); afegir `pointerdown` i tancament tàctil.
- **`#capNat`:** `"Desastres naturals"` solapa el signe `+`.
- **`#fear`:** passar etiquetes a sobre de cada barra en mòbil (`"Infeccions respiratòries"` al límit esquerre) i pujar botons `#fearYr` a 44 px.

### 12. `pols-del-sahara` — Prioritat MITJANA-BAIXA
- **Scrollys:** `#bgraphic` molt bé (**351 px / 42 %**); `#mgraphic` fa **404 px (48 %)** → amagar `.vh span` a `≤ 899 px` (no esperar a `max-height: 760px`) per baixar-lo sota `365 px`.
- **`#trucksWrap` (etapa 4 «El fòsfor»):** `"880 camions / 1/23 d'un cercle"` surt fora per la dreta → posar-lo a sota o amb `anchor: "end"`.
- **`#budgetWrap`:** a la part 2, `"1.400–4.100 →"` queda a 6 px de l'eix X; a la part 1, `rowH = 34 px` és sota 44 px.
- **`#mmap` (pas 1):** `182 Mt/any` i `132 Mt/any` es poden solapar a `lat = 30`.
- **`#salWrap` / `#yearsWrap`:** ajustar posició de `"la pluja arrossega la pols"` i `"2011 · mínim..."`.
- **Tàctil (`11` controls petits):** revisar alçada de botons i sliders en mòbil.

---

## 5. Ordre d'execució recomanat per arreglar-ho

1. **Fase 1 — Base compartida (`web/assets/article.css` + `research/guia-mobil.md`):** aplicar les regles mòbils de `.scrolly`, `.graphic`, `.step` (`dvh`) i controls tàctils (`44 px`).
2. **Fase 2 — Arreglar els 5 crítics immediats:**
   - Eliminar el bug dels `<canvas>` duplicats de `migracio-vertical` (baixa de 76 % a ~42 % de cop!).
   - Reduir `#s-temps` i arreglar el bloqueig d'scroll de `#betlem` a `jesus-i-els-quatre-evangelis`.
   - Compactar `#igraphic` i fer clamp de `#cr-viz` a `virus-i-bacteris`.
   - Compactar `#s-mirall` a `el-jesus-historic`.
   - Afegir tancament tàctil fora del gràfic a `per-que-dormim` i `per-que-riem`.
3. **Fase 3 — Transposar a vertical els 10 gràfics horitzontals/compostos** (llistats a §3).
4. **Fase 4 — Polir talls d'etiquetes, tooltips i sliders** de la resta d'articles i passar el script automàtic de verificació a 390×844 i 390×664.
