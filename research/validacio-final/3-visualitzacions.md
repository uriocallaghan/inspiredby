# Validació final 3 — Visualitzacions (escriptori i mòbil)

Revisió dels gràfics de cinc articles nous, comparats amb «El Niño i La Niña» com a model de qualitat. No s'ha modificat cap fitxer d'article: aquí només hi ha l'informe.

## Com s'ha fet

- Servidor local propi: `python3 -m http.server 8783 --directory web` (aturat en acabar).
- Navegador: per comprovar l'animació calen fotogrames reals, i la pestanya pròpia del navegador integrat anava frenada a uns 2 fps perquè era en segon pla. Per això les proves s'han fet amb **Chrome headless controlat per CDP** (script propi, sense dependències) a **1440×900** i **390×844** (emulació de mòbil i tàctil, DPR 1). El navegador integrat només s'ha fet servir per veure El Niño.
- Per a cada article i mida de pantalla: càrrega, consola (errors, excepcions i peticions fallides), desbordament horitzontal (`scrollWidth` respecte a `innerWidth`), passos de cada `.scrolly` un per un (centrant el text del pas i esperant 1,5 s), mesura de fps amb `requestAnimationFrame`, auditoria del text SVG (mida efectiva en px, solapaments i retalls), alçada del gràfic enganxat, captura de pantalla, ús de cada botó i de cada control lliscant (mínim, màxim i teclat amb fletxes), sondeig de tooltips (20 punts per gràfic, ratolí a escriptori i toc a mòbil) i una passada amb `prefers-reduced-motion: reduce`.
- Proves dirigides per confirmar els casos dubtosos (seqüències temporals, toc a mòbil, rendiment i portada).
- **Captures (evidència):** `research/validacio-final/captures-visualitzacions/<article>/{d,m,d-rm}/`. Els noms segueixen aquest patró: `sI-JJ.png` = scrolly I, pas JJ; `fK-0.png` = figura K; `fK-bN.png` = figura K després del botó N; `fK-cN-min|max.png` = control lliscant; `*-tip-*.png` = tooltip. Cada carpeta té un `result.json` amb totes les mesures. **Atenció:** a `migracio-vertical/m/f2-b1…b4.png` l'ecograma surt en blanc per culpa de l'eina de captura de la primera passada (la captura «més enllà de la finestra» provoca un `resize`). No és un error de l'article: s'ha comprovat a part i es dibuixa bé (`m/echo-*-viewport.png`). A la passada general de virus a mòbil, alguns botons semblaven no reaccionar; s'ha refet la prova i funcionen (`virus-i-bacteris/proves/`).

### Resultats globals (els cinc articles, a les dues mides)

| Comprovació | Resultat |
|---|---|
| Errors de consola, excepcions o peticions fallides | **0** a tots els articles i mides |
| Scroll horitzontal | **Cap** (`scrollWidth` = 1440 / 390 sempre) |
| Gràfic enganxat a mòbil (alçada / 844 px) | 39–52 %: dins del límit (~50 %) |
| Pas actiu = pas llegit (mòbil i escriptori) | Correcte a tots els passos |
| `role="img"` + `aria-label` als gràfics | Sí a tots (el canvas auxiliar `simChart` té `aria-hidden`, correcte) |
| Portada (`/`) | Les cinc targetes hi surten amb el títol, l'entradeta, la categoria, els minuts i la imatge de portada (`cover.jpg`), a 1440 i a 390 sense desbordament. Vegeu `captures-visualitzacions/home/`. |

Problemes transversals que es repeteixen en diversos articles (cada article els torna a esmentar breument):

- **T1 · Tooltips que a mòbil no es poden obrir tocant (IMPORTANT).** Molts gràfics només escolten `pointermove`. En pantalla tàctil un toc no genera cap `pointermove`, i on sí que s'obre, el `pointerleave` que arriba en aixecar el dit el tanca a l'instant. Els peus de figura diuen «Passa o toca…», però el toc no funciona. El patró correcte ja és a `on-va-el-co2.js` (`pointerdown` + no amagar a `pointerleave` si `e.pointerType!=="mouse"`). Detall per gràfic a cada article i a l'annex A.
- **T2 · Controls lliscants sense `aria-valuetext` (MENOR).** Un lector de pantalla llegeix «12,1» o «0,08» en lloc de «12:06», «gener» o «aigua dolça 0,08». Passa a `oRng`, `szRng` (migració), `scRng` (virus), `mRng` (pols), `dT`, `dS`, `stF` i `pjR` (cinta) i `pRng` (CO₂). Només `bRng` (pols) i la finestra de Keeling (CO₂) el tenen. Arreglament: a cada `input`, `rng.setAttribute("aria-valuetext", textLlegible)`.
- **T3 · Botons «Reprodueix», «Torna a començar», «Anterior» i «Següent» de 18–20 px d'alçada (MENOR).** Queden per sota dels 24 px mínims per tocar amb el dit (WCAG 2.5.8). La classe `.playb` és compartida i no s'ha de tocar: a cada pàgina n'hi ha prou d'afegir `.playb{padding:6px 0}` dins del seu `<style>`.
- **T4 · Gràfics amb tooltip de ratolí però sense accés per teclat (MENOR).** Només `#tline` (virus), `#years` (pols) i `#ySvg` i la finestra de Keeling (CO₂) es poden fer servir amb el teclat. Els `aria-label` ja resumeixen les dades, i això compensa una part del problema.
- **T5 · `prefers-reduced-motion` aplicat a mitges (MENOR o IMPORTANT segons l'article).** La majoria només alenteix les partícules o en treu alguna, però les animacions continuen. Vegeu cada article.

---

## 1. La gran migració de cada nit (`migracio-vertical`)

Gràfics: scrolly A «Un dia a l'oceà» (`#ocean`, canvas, 9 passos amb rellotge i control lliscant), `#sizefig` (copèpode i persona a escala, amb control lliscant d'alçada), `#regfig` (dades reals de Malaspina per regions), `#echofig` (ecograma simulat amb 4 escenaris), scrolly B «Bomba biològica» (`#carb`, 5 passos) i `#estfig` (estimacions publicades).

Rendiment: 60 fps a tots els gràfics. Pes: `migracio.js` 46 KB + d3 (76 KB comprimit). Correcte.

| # | Severitat | Viewport | On | Problema | Solució concreta |
|---|---|---|---|---|---|
| M1 | **IMPORTANT** | tots | Scrolly B, pas 4 «I el deixen a baix» (`migracio.js`, IIFE «5. CARBON PUMP», `draw()`: `if(step===3)txt(...yz(680))`; cicle `cyc(tt)` amb `PERIOD=12`) | El cicle dia/nit de 12 s va per lliure i no depèn del pas. Quan el lector arriba a aquest pas, la meitat de les vegades el gràfic és de **nit**: tots els migradors són a dalt i les etiquetes «CO₂ que respiren / Excrements que s'enfonsen de pressa» queden flotant sobre aigua buida a 680 m. Evidència: `d/s1-03.png`. Amb el pas 3 «Mengen a dalt» passa el mateix, però al revés. | Fixar la fase del cicle segons el pas (pas 2 → nit, pas 3 → dia, amb els migradors a 400–600 m deixant anar CO₂ i excrements) i fer córrer el cicle només als passos 4 i 5. Una altra opció és col·locar l'etiqueta damunt dels migradors (`yz(a.z)`) i mostrar-la només quan `!night`. |
| M2 | **IMPORTANT** | tots, amb reduced motion | Scrolly B, passos 1–4 (`tick()`: `if(!RM&&r()<…)` a `air`, `snow`, `co2` i `poop`) | Amb `prefers-reduced-motion` no es crea **cap** partícula: el pas «La pluja lenta» es queda sense neu marina i el pas 4 sense CO₂ ni excrements. Són passos buits que no expliquen res. A més, els migradors continuen pujant i baixant, perquè `cyc(tt)` no té en compte `RM`. Evidència: `d-rm/s1-01.png` i `d-rm/s1-03.png`. | En mode RM, crear una sola vegada una distribució estàtica de partícules (p. ex. 120 flocs de neu repartits entre 50 i 900 m, amb alfa decreixent) i dibuixar fletxes fixes. Congelar la fase per pas (vegeu M1). |
| M3 | MENOR | tots, amb reduced motion | Scrolly A (`#ocean`) | Amb RM els animals es continuen movent i el rellotge avança. | Amb `RM`, saltar directament a l'hora del pas, sense interpolar, i no fer oscil·lar els animals. |
| M4 | MENOR | escriptori i mòbil | Scrolly A, pas 2 «Qui hi ha» (`draw()`, bloc `S.f.types`, línia ~153) | El quadre de llegenda dels tipus d'animal (fons fosc) es dibuixa just a sobre de la capa d'animals (190–350 m): «Meduses i sifonòfors» queda trepitjat per peixos. Evidència: `d/s0-01.png`. | Posar el quadre a la zona fosca buida (≈ 750–950 m) o a la zona il·luminada (0–150 m) mentre la capa és a baix. |
| M5 | MENOR | tots | Scrolly A, etiquetes de zona (`zl("Zona il·luminada"…)`, línia 136) i de velocitat | «Zona il·luminada» i «Zona crepuscular» no tenen halo i queden tapades pels animals. A l'alba, «Baixa a 7,6 cm/s» se solapa amb «Zona il·luminada». Evidència: `d/s0-05.png`, `m/s0-05.png`. | Fer servir halo fosc, com a la resta d'etiquetes, o amagar l'etiqueta de zona quan hi passa la capa. |
| M6 | MENOR | tots | Scrolly A, pas 7 «No tothom fa el viatge» | El pas explica que només la meitat de la capa puja, però el gràfic és a les 11:58, quan tots els animals són a la mateixa fondària. Així no es veu la diferència entre els que migren i els que es queden. L'etiqueta «Es queden a baix» és a 760 m, on gairebé no hi ha animals. | Mostrar aquest pas de nit (23:00): els taronges a dalt i els grisos a baix. Allà la separació es veu d'un cop d'ull. |
| M7 | MENOR | tots | Scrolly A, pas 6 «Alba» | El cel de l'alba és una franja plana de color salmó apagat (#B98A7E) que fa brut al costat del degradat de dia i del de nit. El sol, en canvi, és un semicercle de 10 px a la vora. | Fer un degradat vertical (rosa o taronja suau que s'esvaeix cap al blau) i fer el sol una mica més gran o amb halo. |
| M8 | MENOR | tots | `#regfig` (`move()`, línia ~287) | La reproducció automàtica alterna dia i nit: el text de l'etiqueta canvia a l'instant, però el punt tarda 1,1 s a arribar-hi, i durant aquest temps el valor no coincideix amb la posició. Evidència: `d/f1-0.png`. A més, hi ha tres codificacions per a dos valors (punt negre = dia, cercle buit = nit, cercle taronja gran = estat actual), i això costa de llegir. | Treure el cercle taronja que es mou i dibuixar per a cada regió una fletxa del dia a la nit (gràfic de pesos), amb els dos valors sempre visibles. La reproducció pot animar el creixement de les fletxes. Si es manté la transició, canviar el text a `.on("end")`. |
| M9 | MENOR | mòbil | `#regfig` | Etiquetes de 10 px («200–650 m: interval mundial de dia»), per sota del mínim de 10,5 px que fa servir El Niño. | Pujar-les a 10,5–11 px o treure el text de l'interval i deixar només la franja. |
| M10 | MENOR | tots | `#echofig` | En triar «Nit polar», l'eix vertical canvia de 0–600 m a 0–200 m sense cap avís. Comparant escenaris, sembla que la capa és igual de profunda. | Deixar l'eix fix a 0–600 m, o afegir un avís visible («Atenció: escala 0–200 m»). |
| M11 | MENOR | tots | `#estfig` | Gràfic pobre: tres franges pàl·lides en un eix de 0 a 7, amb dues terceres parts de l'amplada buides (la línia de 6,5 PgC és a la dreta). | Fer servir una barra de 6,5 PgC com a total i dibuixar-hi a sobre les tres franges per mostrar quina part del total podria ser obra dels migradors. Una altra opció és posar l'eix en percentatge del total. |
| M12 | IMPORTANT | mòbil | `#echofig` (`cv.addEventListener("pointermove",…)`, IIFE de l'ecograma) i `#regfig` (T1) | A mòbil, el tooltip de l'ecograma (hora, fondària i llum) **no s'obre mai** tocant: 0 de 35 tocs. A `#reg` s'obre en 6 de 35 (només si toques just el cercle). `#est` sí que funciona. | A l'ecograma, afegir `pointerdown` amb el mateix gestor i no amagar a `pointerleave` en tàctil. A `#reg`, fer més gran la zona tàctil (rectangle invisible de tota la columna de la regió). |
| M13 | MENOR | tots | `oRng` | Sense `aria-valuetext`: el lector diu «12,1» en lloc de «12:06». Passa el mateix amb `szRng`. | Vegeu T2. |

**Valoració.** El scrolly de l'oceà és el gràfic més bonic dels cinc articles: té textura, llum que canvia amb l'hora i una animació contínua ben feta. Està al nivell d'El Niño, tret de M4 i M5. L'ecograma també és molt bo: original i ben explicat. En canvi, la bomba biològica és clarament el punt dèbil, pel desajust entre pas i cicle (M1) i perquè amb RM queda buida (M2). `#estfig` és el gràfic més fluix de l'article.

---

## 2. La guerra invisible (`virus-i-bacteris`)

Gràfics: `#scale` (zoom a escala de l'òvul al fag, amb control lliscant i botons), scrolly A «Cicle d'infecció» (`#inf`, 10 passos, lític i lisogènic), `#sea` (dispersió real de 5.671 mostres), `#shunt` (curtcircuit viral), `#def` (sistemes de defensa, dades reals), scrolly B «CRISPR» (`#cr`, 8 passos), `#sim` + `#simChart` (simulació d'una colònia) i `#tline` (línia del temps).

Rendiment: 60 fps arreu. Pes: `dades.js` 111 KB (la dispersió) + 40 + 31 KB de JS. Acceptable; el servidor de producció hauria de servir-los comprimits.

| # | Severitat | Viewport | On | Problema | Solució concreta |
|---|---|---|---|---|---|
| V1 | **CRÍTIC** | escriptori | Scrolly A, pas 1 «Un injector de DNA» i pas 10 «Ara prova-ho tu» (`virus-i-bacteris.js`, `draw()`, bloc `if(sc===0)`, línies 208–213) | Dues de les cinc etiquetes del T4 queden **fora del canvas**. «Cap · 115 × 85 nm / guarda el DNA: 168.903 parells de bases» es dibuixa per sobre del marge superior, i «Paret del bacteri» per sota del marge inferior. Es veuen dues línies guia que no porten enlloc, en el primer gràfic de l'article. Evidència: `d/s0-00.png`, `d/s0-09.png`. A mòbil sí que es veuen (`m/s0-00.png`). | Limitar la posició vertical de l'etiqueta (`ty`) entre `fs*2.5` i `H-fs*2` dins de `label()`, o posar el text del cap a l'esquerra del cap (`"right"`) a la mateixa alçada. «Paret del bacteri» hauria d'anar a sobre de la membrana, no a sota. |
| V2 | IMPORTANT | tots | `#sim` + `#simChart` (`crispr.js`, simulació) | Costa molt de llegir: cercles mig plens (memòria), punts (infecció), anells de color verd blavós sense llegenda i quatre colors de virus (vermell, marró, salmó #E08A6E i lila #7A4C9A, tots dos fora de la paleta). El gràfic de sota és tan baix (110 px) que només té l'etiqueta «100 %» i ocupa dues terceres parts buides fins que passa un minut. Evidència: `d/f4-b3.png`. | Reduir a dos estats visibles per cel·la (viva / immune a A, B…) amb una llegenda per a cada símbol, inclòs l'anell. Fer servir els colors d'El Niño (vermell per a A, ocre per a B, el vermell en clar per al mutant). Fer la sèrie temporal d'amplada fixa (60 s), amb eix 0–100 % i amb les línies de «Recorden A/B», no només la de «vius». |
| V3 | IMPORTANT | tots | `#shunt` «On va a parar el carboni del plàncton» | Gràfic dèbil: el 95 % és blanc (taca de color del 4–7 %), icones petites i fletxes de punts; «Sense virus» i «Amb virus» gairebé no es distingeixen. No hi ha cap xifra. Evidència: `d/f2-b0.png` i `d/f2-b1.png`. | Convertir-lo en un diagrama de fluxos (Sankey) amb amplades proporcionals i xifres (p. ex. l'ordre de magnitud de la mortalitat bacteriana diària causada per virus que cita l'article), o com a mínim engruixir les fletxes segons el flux i escriure al costat de cada fletxa quina part del carboni hi passa. |
| V4 | MENOR | tots | Scrolly B, pas 4 «Una memòria que s'hereta» (`crispr.js`, bloc `if(st===3)`) | La divisió és un fos encadenat: durant ~1 s es veu una cèl·lula buida, amb només l'arxiu i sense cromosoma ni gens (`d/s1-03.png`, `virus-i-bacteris/proves/vb-cr3-900.png`). Les filles acaben molt petites (escala 0,48) i l'arxiu, que és el que importa, gairebé no es llegeix. | Animar l'estrangulament (la cèl·lula s'allarga i es parteix pel mig) i copiar l'arxiu mentre es divideix, amb les filles a una escala de ≥0,7. Posar «Les dues filles recorden el virus» a sota, amb una fletxa curta. |
| V5 | MENOR | escriptori | Scrolly B, pas 1 | «Espaiadors: retrats de virus antics» trepitja la vora de la cèl·lula. Evidència: `d/s1-00.png`. | Moure l'etiqueta 20 px a la dreta o a dins de la cèl·lula. |
| V6 | MENOR | mòbil | `#def`, vista «Quants per genoma» | «1.450 genomes sense cap sistema» se solapa amb «Mitjana: 5,2». | A mòbil, escriure la segona etiqueta a sota de la barra o abreujar-la («1.450 sense cap»). |
| V7 | MENOR | tots | Botons de `#scale` (`seg` click) | Cada botó canvia el títol i fa saltar el disseny 33 px amunt i avall a mòbil (el títol de la figura passa d'una línia a dues). | Donar al títol una alçada mínima fixa (`min-height: 2.6em`). |
| V8 | MENOR | tots, amb reduced motion | Scrolly A i B | Amb RM les escenes es continuen reproduint (injecció, esclat, càmera). Només es treu l'oscil·lació. | Amb `RM`, dibuixar directament l'estat final de cada escena (`t = SC[scene].dur`). |
| V9 | IMPORTANT | mòbil | `#sea` (`virus-i-bacteris.js` línia 315) i `#def` (`crispr.js` línies 30 i 48) (T1) | A mòbil, tocant no queda **cap** tooltip visible: 0 de 35 tocs a cadascun. El `pointerdown` o el `pointerenter` sí que l'obren, però el `pointerleave` que arriba en aixecar el dit l'amaga a l'instant. El peu de `#sea` diu «Passa o toca sobre un punt». | No amagar a `pointerleave` quan `e.pointerType!=="mouse"`. Un toc fora dels punts l'amaga. |

**Valoració.** El dibuix del T4 i del cicle lític és net, precís i a escala, molt en la línia d'El Niño. La dispersió de 5.671 mostres (`#sea`) és un dels millors gràfics de dades del conjunt: logarítmic, amb la mediana, les diagonals «10 per bacteri» i un filtre per fondària. `#def` és clar i honest. Els punts dèbils són `#shunt`, molt buit, i `#sim`, molt carregat. El scrolly del CRISPR és correcte però pla: molt espai buit dins de la cèl·lula i animacions fetes amb fosos.

---

## 3. La pols que adoba l'Amazònia (`pols-del-sahara`)

Gràfics: scrolly A «Bodélé» (`#bcv`, mapa en canvas, 6 passos), `#sal` (tall de la capa d'aire del Sàhara per estacions), scrolly B «El viatge» (`#mcv`, mapa de l'Atlàntic amb control lliscant de mes, 7 passos), `#trucks` (camions de pols), `#budget` (balanç de fòsfor, control lliscant) i `#years` (sèrie 2007–2013 amb bandes).

| # | Severitat | Viewport | On | Problema | Solució concreta |
|---|---|---|---|---|---|
| P1 | **IMPORTANT** | tots | Scrolly B, tots els passos (`pols-del-sahara.js`, `setStep()` línia 239–240: `tg.m=S.m` sense actualitzar `rng.value`) | **El control lliscant de mes no segueix el scroll.** El títol diu «Juliol», «Març» o «Juny», però el polze es queda a «gen». Evidència: `d/s1-01.png` («Juliol» amb el polze a gener) i tots els `s1-*.png` a les dues mides. | A `setStep`, quan `S.m!==null`, fer `rng.value=S.m`. A més, a `frame`, quan `!user`, sincronitzar `rng.value=st.m.toFixed(2)` mentre `st.m` s'apropa al valor del pas. |
| P2 | **IMPORTANT** | tots | Scrolly A `#bcv` (passos 3–6), scrolly B `#mcv` i `#sal` (`pols-del-sahara.js`, `frame()` de B, línies 157–189) | **Animació a batzegades.** Mesurat en headless, sense cap altra càrrega i amb renderitzat per programari: el Bodélé va a **8 fps** de manera sostinguda (fotograma pitjor 150 ms) des del pas 3 fins al 6, també quan la vista ja és quieta. El pas 1 va a 60 fps. El viatge va a 15 fps durant la transició i a 42–49 fps un cop quiet. `#sal` va a 21 fps. Amb el mateix mètode, El Niño i la cinta van a 60 fps. Un perfil de CPU del pas 4 mostra que el **80 % del temps se'n va en operacions de camí del canvas** (`closePath`, `lineTo`), és a dir, en patrons estàtics que es redibuixen a cada fotograma: la trama de punts de la diatomita (bucle `fillRect` dins d'un `clip()`, milers de rectangles), el glif `diatom()` i les muntanyes `mountains()`. A més, mentre la vista es mou, `GeoMap.ease()` → `fit()` → `drawBase()` torna a projectar **`countries-50m`** a cada fotograma, i `leaders()` i `placeLabels()` llegeixen `offsetHeight` i `offsetWidth` a cada fotograma. | Pre-renderitzar la diatomita (contorn + trama), les muntanyes i la diatomea en un canvas fora de pantalla quan canvia la vista, i a cada fotograma fer-ne només un `drawImage`. Fer servir `countries-110m`. Durant el zoom, escalar la base ja dibuixada amb `drawImage` i redibuixar-la quan s'aturi. Desar en memòria la mida de les etiquetes. Després, verificar-ho en un mòbil de gamma mitjana. |
| P3 | MENOR | tots | Càrrega | `countries-50m.json` pesa 739 KB descomprimit (201 KB per la xarxa). És el fitxer més gran dels cinc articles. | Vegeu P2 (110m). |
| P4 | MENOR | tots | Scrolly A, passos 4–5 (`pols-del-sahara.js` línia ~153, «Una diatomea (esquema)») | El glif de la diatomea del pas 4 es queda (s'esvaeix a poc a poc) a sobre de les línies de vent i de l'etiqueta «Harmattan» del pas 5. El text «Una diatomea (esquema)» queda **tallat** per la dreta («Una diatomea (esque»), tant a escriptori com a mòbil. Evidència: `d/s0-04.png`, `m/s0-03.png`. | Amagar el glif quan `step!==3` (alfa directe a 0) i ajustar la x del text: `x=Math.min(x, W - c.measureText(t).width/2 - 4)`. |
| P5 | MENOR | tots | Mapes `#bcv` i `#mcv` | El mapa té molt poc contrast: terra #ECEBE8 sobre mar #E6EDF5, pols en punts de color ocre molt pàl·lid i fronteres gairebé invisibles. Comparat amb El Niño, sembla desenfocat, i a mòbil (mapa de 245 px) la pols gairebé no es veu. | Enfosquir el mar (#D7E3F0), fer servir per a la pols el `--dry` #9A6326 amb alfa 0,6–0,8 i punts d'1,5–2 px a mòbil. Els vents del Bodélé, en gris fosc, ja funcionen. |
| P6 | IMPORTANT | mòbil | `#years` (T1) | El tooltip de la sèrie només respon a `pointermove` (línia 513), i amb el dit no s'obre mai (0 de 35 tocs). El text de l'article diu «Passa el cursor o toca el gràfic»: a mòbil, la meitat de la interacció promesa no hi és. | Afegir `pointerdown` amb el mateix gestor `showY` i no amagar a `pointerleave` en tàctil. |
| P7 | MENOR | tots, amb reduced motion | Mapes i `#sal` | Amb RM les partícules continuen movent-se, al 25–35 % de la velocitat. | Amb RM, deixar quiet un camp de partícules ja repartit. |
| P8 | MENOR | tots | `#trucks`, botó «El fòsfor» | 880 camions són menys d'una vintena part d'una icona: es marquen amb un cercle vermell sobre la primera icona, que gairebé no es veu. | Afegir-hi una ampliació (lupa) que mostri una icona dividida en 23 parts amb una de pintada, o canviar d'unitat en aquest pas (1 icona = 100 camions). |
| P9 | MENOR | mòbil | Scrolly B | El subtítol del mapa ocupa dues línies, i les etiquetes de mes del control lliscant fan 10 px. | Escurçar el subtítol a mòbil i posar les etiquetes de mes a 10,5–11 px. |

**Valoració.** El tall de la capa d'aire del Sàhara (`#sal`) és molt bo: explica el mecanisme amb dades de CALIPSO i canvia per estacions. `#years` i `#budget` són gràfics de dades rigorosos, amb incertesa. Els mapes tenen bona narrativa (el llac Megatxad, l'embut del vent) però són pàl·lids i van lents, i el control lliscant desincronitzat (P1) fa que la secció sembli trencada. `#trucks` és entenedor però repetitiu: un gràfic d'unitats de 365 icones no aporta gaire més que una barra.

---

## 4. La cinta transportadora de l'Atlàntic (`cinta-transportadora`)

Gràfics: `#denfig` (diagrama de temperatura i salinitat amb dades reals + columna del Labrador, dos controls lliscants i 5 presets), scrolly A «Globus» (`#globe`, 9 passos, temperatura, salinitat i densitat), scrolly B «Tall de l'Atlàntic» (`#sec`, 4 passos, dades WOA), `#flowfig` (Sv i TW en quadradets), `#winfig` (mapa d'anomalies d'hivern i estiu), `#paleofig` (NGRIP i Pa/Th, 20.000 anys), `#rapidfig` (RAPID 2004–2024), `#stfig` (model de Stommel), `#pjfig` (projeccions) i `#tipfig` (estimacions de col·lapse).

Rendiment: 60 fps a tot arreu. Pes: `dades.js` 285 KB (el fitxer de dades més gran després de la geografia de pols; gzip el deixaria a ~80 KB) i `cinta-transportadora.js` 67 KB.

| # | Severitat | Viewport | On | Problema | Solució concreta |
|---|---|---|---|---|---|
| C1 | **IMPORTANT** | mòbil | Tooltips de `#ts`, `#sec`, `#win`, `#paleo`, `#rapid` i `#tip` (T1) | A mòbil, **cap** dels sis gràfics amb tooltip respon a un toc: 0 de 16 a cada un a la prova general, i 0 de 35 a la prova dirigida de `#rapid` i `#ts`. Els peus diuen «Passa o toca…». Tots fan servir només `svg.on("pointermove")` o `cv.addEventListener("pointermove")` (línies 334, 383, 424 i 468). Com que l'article té tantes sèries de dades reals, a mòbil es perd molta informació. | Afegir `pointerdown` amb el mateix gestor i no amagar a `pointerleave` quan `e.pointerType!=="mouse"`, com fa `on-va-el-co2.js`. |
| C2 | IMPORTANT | mòbil | `#denfig` | La figura fa **1.135 px** d'alçada, més que la pantalla. Primer hi ha el diagrama T-S, després els controls lliscants, els presets i la lectura, i la columna del Labrador queda ~500 px més avall. Mentre arrossegues la temperatura o la salinitat, no veus si l'aigua s'enfonsa, que és la gràcia de la figura. | A mòbil, posar la columna (més estreta, ~120 px) al costat del diagrama T-S, o enganxar els controls a la part de sota de la figura. Com a mínim, posar el resultat («Baixaria fins al fons…») just a sota dels controls. |
| C3 | MENOR | tots | Scrolly A, passos 2–6 i 9 (globus ampliat) | La quadrícula regular de latitud i longitud fa, a prop del pol, **anells concèntrics** («diana») molt marcats en la vista ampliada de l'Atlàntic Nord. Distreu just a la zona on passa la història. Evidència: `d/s0-05.png`. | Fer servir una quadrícula d'àrea igual (Fibonacci o hexagonal) o reduir la densitat de punts per sobre de 70° N (saltar punts segons `cos(lat)`). |
| C4 | MENOR | tots | Scrolly B, `#sec` | Una línia blanca vertical travessa tota la columna d'aigua a ~37,5° N. És la columna de terra de les Açores, però es pinta blanca i sembla un error del dibuix. L'etiqueta «Açores» (línia 329) a mòbil fa 9,5 px. | Pintar aquesta columna amb el color de terra (`C.land`), igual que el fons, i posar l'etiqueta a 10,5 px. |
| C5 | MENOR | tots | `#pjfig` (línia 534: `tickFormat(d=>"−"+d+" %")`) | El primer tick mostra «**−0 %**». | `d=>d?"−"+d+" %":"0 %"`. |
| C6 | MENOR | escriptori | `#paleofig` | «Avui» i «anys enrere» se solapen a l'extrem dret de l'eix X. A mòbil, «Heinrich 1», «B-A» i «YD» queden apretats. | Posar «anys enrere» a sota de l'eix i, a mòbil, numerar els esdeveniments. |
| C7 | MENOR | tots | `#tipfig` | Les etiquetes de Drijfhout («2025, simulacions fins al 2300») i «després del 2100» se solapen, i a mòbil també xoquen amb les barres. | Escriure «després del 2100» dins de la barra, alineat a la dreta. |
| C8 | MENOR | mòbil | `#stfig` | El punt de l'estat tapa l'etiqueta «Cinta en marxa», i «Punt de no retorn» toca la corba. | Desplaçar les etiquetes 12 px o posar-les quan el punt no hi sigui a prop. |
| C9 | MENOR | mòbil | Scrolly A, etiquetes del globus | Les etiquetes de 10,5 px amb halo blanc a sobre d'una catifa densa de punts («Fins a 37,4 · l'aigua més salada de l'Atlàntic obert») es llegeixen malament. Evidència: `m/s0-02.png`. | Fons blanc semitransparent rectangular (`rgba(255,255,255,.8)`) darrere de les etiquetes del globus. |
| C10 | MENOR | mòbil | `#winfig` | El mapa fa 350×133 px: les anomalies es veuen, però els noms (Bergen, Labrador) són minúsculs. | A mòbil, retallar la vista a 100° O – 40° E (l'Atlàntic Nord), que és on hi ha la història. |
| C11 | MENOR | tots, amb reduced motion | Scrolly A | Amb RM el globus continua animant els corrents (a 0,25 de velocitat). | Amb RM, dibuixar les fletxes estàtiques. |
| C12 | MENOR | tots | `dT`, `dS`, `stF` i `pjR` (T2) | Sense `aria-valuetext` (p. ex. «27 °C», «salinitat 36,15»). | Vegeu T2. |

**Valoració.** És l'article més ric en gràfics, i diversos estan al nivell d'El Niño o per sobre: el tall de l'Atlàntic amb les fletxes de la cinta, el globus de punts amb dades del WOA, la sèrie de RAPID, el gràfic paleoclimàtic i el model de Stommel amb histèresi (molt didàctic). El més fluix és `#flowfig` (quadradets, correcte però sense gràcia) i, a mòbil, `#denfig`. El problema principal és que a mòbil no funciona cap tooltip (C1).

---

## 5. On va el CO₂ que emetem (`on-va-el-co2`)

Gràfics: scrolly A «Un any d'emissions» (`#aCv`, 427 punts = 42,75 Gt, 9 passos), scrolly B «Com absorbeixen» (`#bCv`, 6 passos), `#keelFig` (corba de Keeling amb lupa desplaçable), `#yearFig` (barres 1959–2026 amb l'ONI), `#histFig` (fonts i destins 1850–2026, anual o acumulat) i `#persFig` (persistència d'un pols de CO₂, control lliscant logarítmic).

Rendiment: 60 fps. Pes: 20 + 53 KB. És l'article més lleuger. És també el **millor resolt en accessibilitat i interacció**: tooltips tàctils ben fets, teclat a `#ySvg` i a la lupa de Keeling, i `aria-valuetext` a la lupa.

| # | Severitat | Viewport | On | Problema | Solució concreta |
|---|---|---|---|---|---|
| O1 | MENOR | escriptori | `#keelFig` | «315,7 ppm» se solapa amb «març del 1958» (el text de dues línies queda massa junt) i la unitat «ppm» de l'eix Y queda tallada per l'esquerra. A mòbil, la lupa 1996–1999 talla «2000». | Posar `dy` = 1,25 em a la segona línia, moure «ppm» dins del marge (`x = M.l + 2`) i deixar 8 px de marge a la dreta de la lupa. |
| O2 | MENOR | escriptori | `#histFig` | Les etiquetes finals de dues línies («Fòssil i ciment / 38,4 Gt», «Atmosfera / 16,0 Gt»…) tenen un interlineat massa curt i les capses se solapen. En mode acumulat, «3.000» toca «1850». | Interlineat d'1,2 em i separar «3.000» de l'eix X. |
| O3 | MENOR | tots | `#persFig` | L'eix X arriba a 1.000.000 d'anys però la corba s'acaba als 1.000: tres quartes parts de l'àrea són blanques. «1.000.000» (a mòbil, «1 milió») queda tallat per la dreta. | Ombrejar la zona de més de 1.000 anys amb una trama i el text «Fora del model: carbonats i roques», o escurçar l'eix a 10.000 anys i deixar les franges de processos a sota. Afegir marge dret. |
| O4 | MENOR | escriptori | Scrolly A, pas 8 «Desquadrament» | Uns quants punts buits del desquadrament queden fora del quadre de punts que els conté. Evidència: `d/s0-07.png`. | Limitar la posició dels punts (`tx`, `ty`) a dins del rectangle. |
| O5 | MENOR | tots | Scrolly B, pas 3 «Cap al fons» | Un rectangle arrodonit de punts que circulen, sense fletxes de direcció ni indicació de fondària; el 50 % superior («Atmosfera») queda buit. Explica menys que el pas equivalent de la cinta. Evidència: `d/s1-02.png`. | Afegir fletxes de sentit (baixa a l'esquerra, als pols, i torna per la dreta) i una escala de fondària (0, 1.000, 4.000 m). |
| O6 | MENOR | tots | `pRng` (T2) | Sense `aria-valuetext` («100 anys: 41 % a l'aire»). | Vegeu T2. |
| O7 | MENOR | tots, amb reduced motion | Scrolly B, passos 3–6 (`bCv`) | Amb RM, el scrolly A queda quiet (correcte), però al B els punts continuen circulant. | Aplicar també al B el `sp=RM?0:1` a tots els desplaçaments. |

Interacció tàctil comprovada: la lupa de Keeling (tooltip amb el toc), `#histFig` (35 de 35 tocs) i `#yearFig` (el toc tria l'any i actualitza el panell lateral) funcionen bé a mòbil. És el model que haurien de copiar els altres articles (T1).

**Valoració.** El scrolly dels punts (427 punts = 42,75 Gt) és una idea excel·lent i ben executada: cada punt va al seu lloc, el desquadrament és honest, i el pas final, que posa la barra del 2025 al costat de la mitjana, és molt clar. `#histFig` (fonts i destins en mirall), `#yearFig` amb l'ONI i la corba de Keeling amb lupa són gràfics de dades de primera. El scrolly B és el més fluix: correcte però esquemàtic i amb molt espai buit.

---

## Rànquing global de gràfics

### Els millors (al nivell d'El Niño o per sobre)

1. **Oceà de dia i de nit** (migració, scrolly A `#ocean`): bellesa, animació contínua, llum i hora, el millor del conjunt. Només li cal arreglar M4 i M5.
2. **Tall de l'Atlàntic amb la cinta** (cinta, scrolly B `#sec`): dades reals del WOA, capes etiquetades i el circuit de fletxes al pas final.
3. **427 punts d'emissions** (CO₂, scrolly A `#aCv`): la metàfora de comptar s'entén a la primera.
4. **Fonts i destins 1850–2026** (CO₂, `#histFig`) i **barres anuals amb l'ONI** (`#yearFig`).
5. **Model de Stommel amb histèresi** (cinta, `#stfig`): fa entendre el punt de no retorn.
6. **Ecograma simulat** (migració, `#echofig`).
7. **Dispersió de virus i bacteris** (virus, `#sea`) i **globus de punts** (cinta, `#globe`, tret de la diana del pol).
8. **Capa d'aire del Sàhara per estacions** (pols, `#sal`).

### Els més febles (per ordre de prioritat de millora)

1. **Bomba biològica** (migració, `#carb`): el cicle no coincideix amb el pas i, amb reduced motion, queda buida (M1, M2).
2. **Curtcircuit viral** (virus, `#shunt`): gairebé buit, sense xifres (V3).
3. **Simulació de la colònia** (virus, `#sim`): massa codificacions, llegenda incompleta i colors fora de la paleta (V2).
4. **Mapes de la pols** (pols, `#bcv` i `#mcv`): pàl·lids, lents i amb el control lliscant desincronitzat (P1, P2, P5).
5. **Estimacions del carboni** (migració, `#estfig`) i **camions** (pols, `#trucks`): correctes però poc interessants (M11, P8).
6. **Cap al fons** (CO₂, pas 3 del scrolly B) i **quadradets de Sv i TW** (cinta, `#flowfig`): esquemes plans.

## Resum de comptatges

| Article | CRÍTIC | IMPORTANT | MENOR |
|---|---|---|---|
| Migració vertical | 0 | 3 (M1, M2, M12) | 10 |
| Virus i bacteris | 1 (V1) | 3 (V2, V3, V9) | 5 |
| Pols del Sàhara | 0 | 3 (P1, P2, P6) | 6 |
| Cinta transportadora | 0 | 2 (C1, C2) | 10 |
| On va el CO₂ | 0 | 0 | 7 |
| **Total** | **1** | **11** | **38** |

Els problemes transversals (T1–T5) estan comptats dins de cada article, no a part.

**Prioritat d'arreglament:**
1. V1 (etiquetes del T4 fora del canvas).
2. P1 (control lliscant de mes desincronitzat).
3. M1 i M2 (bomba biològica).
4. T1: tooltips tàctils a migració, virus, pols i cinta.
5. P2 (rendiment dels mapes de la pols).
6. C2 (figura de densitat a mòbil).
7. V2 i V3 (redisseny de la simulació i del curtcircuit).

## Annex A — Toc a mòbil (tooltips)

Prova dirigida a 390×844 amb tàctil emulat: es recarrega la pàgina per a cada gràfic, es fan 35 tocs en una quadrícula de 7×5 i es comprova si queda algun tooltip visible al cap de 0,5 s.

| Gràfic | Tocs amb tooltip | Comentari |
|---|---|---|
| migració `#echo` | 0/35 | només `pointermove` |
| migració `#reg` | 6/35 | només si toques el cercle |
| migració `#est` | 12/16 (prova general) | funciona |
| virus `#sea` | 0/35 | el `pointerleave` l'amaga |
| virus `#def` | 0/35 | el `pointerleave` l'amaga |
| pols `#years` | 0/35 | només `pointermove` |
| cinta `#rapid`, `#ts` | 0/35 | només `pointermove` |
| cinta `#sec`, `#win`, `#paleo`, `#tip` | 0/16 (prova general) | només `pointermove` |
| CO₂ `#kSvg` | 15/16 | funciona |
| CO₂ `#hSvg` | 35/35 | funciona |
| CO₂ `#ySvg` | el toc tria l'any (panell) | funciona |
| CO₂ `#pSvg` | — | no té tooltip (es fa servir amb el control lliscant) |

## Annex B — Rendiment (fps amb `requestAnimationFrame`, headless, 1440×900)

| Gràfic | fps (en transició / quiet) |
|---|---|
| El Niño, scrolly 2 (referència) | 60 / 60 |
| Migració: oceà, bomba, ecograma | 60 / 60 |
| Virus: tots | 60 / 60 |
| Cinta: globus, tall, mapa | 60 / 60 |
| CO₂: tots | 60 / 60 |
| **Pols `#bcv`, passos 3–6** | **8 / 8** |
| **Pols `#mcv`** | **15 / 42–49** |
| **Pols `#sal`** | **21** |

## Annex C — Pes de càrrega (descomprimit, sense contar fonts ni d3)

| Article | JS propi + dades | Altres |
|---|---|---|
| Migració | 46 KB | — |
| Virus | 40 + 31 + 111 KB (dades) | — |
| Pols | 51 KB | `countries-50m.json` 739 KB (201 KB per la xarxa) |
| Cinta | 67 + 285 KB (dades) | `land-110m.json` 54 KB |
| CO₂ | 53 + 20 KB | — |

Les portades `cover.jpg` pesen entre 155 i 491 KB; la de la cinta (491 KB) es podria comprimir més. A més, `on-va-el-co2/cover.html` pesa 222 KB, però només fa de font per generar la portada i no es carrega a la pàgina.
