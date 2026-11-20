# Sistema infogràfic d'Inspired by Magazine

Com han de ser els gràfics de tots els articles nous. Llegeix-ho sencer abans de dibuixar res, juntament amb `research/guia-estil-articles.md` (text, dades i estructura de l'article).

- **Mostrari viu:** `web/sistema/index.html`, publicat a https://inspiredby.uriocallaghan.com/sistema/. Cada peça hi és dibuixada i funciona.
- **Codi comú:** `web/assets/ib-viz.js` (objecte global `IBV`): colors, escales, text amb halo, anotacions, llegendes, tooltip tàctil, mapes. Es carrega després de d3 7.9.0 (i de `topojson-client@3.1.0` si hi ha mapes).
- **Codi de cada peça:** un bloc per peça, marcat amb el número: TIME-02 a CASE-05 a `web/sistema/sistema.js`, MAP-17 a MAP-18 a `mapes-a.js`, MAP-19 a MAP-09 i MAP-01 a `mapes-b.js`, SCALE-04 a TIME-05 a `creatives-a.js` i CASE-09 a PART-07 a `creatives-b.js` (cadascun amb el seu `.css` i el seu fitxer de dades). Copia el bloc que necessitis al JS de l'article i canvia-hi les dades.
- **Model de qualitat:** «El Niño i La Niña» (`web/articles/el-nino/`). **Model per als mapes regionals:** «Jesús i els quatre evangelis» (`web/articles/jesus-i-els-quatre-evangelis/`), que ha donat lloc a MAP-01.

Quan planifiquis un article, anomena els gràfics pel número: «MAP-06 per al mapa de l'anomalia, TIME-02 per a la sèrie de 1950–2026, HOW-01 per al tall».

---

## 1. Principis

Tots són obligatoris.

| | Principi | Què vol dir a la pràctica |
|---|---|---|
| P1 | **El fons és el paper** | Cap gràfic pinta fons, panells, targetes, vores de caixa ni ombres. El blanc de la pàgina és el fons. L'única superfície pintada és la terra dels mapes (`land`), perquè és informació. |
| P2 | **Gris per al context, color per a la història** | El que no és protagonista va en gris fi (`ghost`, `grid`). Un o dos colors per gràfic. Cada color vol dir el mateix a tot l'article. |
| P3 | **Molts elements, petits i translúcids** | Si hi ha milers de dades, es dibuixen totes, petites i amb opacitat baixa (0,05–0,5). La densitat ha d'aparèixer sola. |
| P4 | **Anotar dins del gràfic** | La història s'escriu al lloc on passa: títol en negreta i una línia de detall, amb línia guia fina. La llegenda només explica la codificació. |
| P5 | **Escales honestes i explicades** | Llegenda a la capçalera, amb el sentit escrit (← menys · més →). La unitat va al valor de dalt. El zero es marca en tinta. Si l'escala és logarítmica, el títol de l'eix ho diu. Àrees proporcionals (`d3.scaleSqrt`). Mai facis servir `◀`, `▶`, `↔` ni cap caràcter Unicode amb presentació d'emoji (fletxes tipogràfiques `←` `→` `↑` `↓` sempre). |
| P6 | **Una sola jerarquia de text** | Vegeu §3. Res per sota d'11 px reals a la pantalla. |
| P7 | **La forma segueix el fenomen** | El temps cíclic (any, dia) va en cercle; el temps lineal, en línia. Un lloc va en mapa quan explica alguna cosa. Un mecanisme va en tall o esquema. |
| P8 | **Petits múltiples abans que espaguetis de colors** | Si hi ha més de tres sèries, es fan gràfics petits amb la mateixa escala. Només vermell, blau i groc (i els seus tons). |
| P9 | **Dada, simulació o esquema, sempre dit** | El peu diu què és: dades reals, simulació o esquema, i enllaça («Fonts i dades del gràfic →») a l'explicació completa dins de «Dades i fonts» (fonts amb any, model, tractament). Mai una forma inventada que sembli una dada. |
| P10 | **Es toca, es mou i cap a 390 px** | Tooltip amb ratolí, teclat i dit (`IBV.hover`). Moviment suau i amb sentit, que respecta `prefers-reduced-motion` (`IBV.reduced`). Cap scroll horitzontal. A mòbil, menys etiquetes, no més petites. |

### Estètica orgànica: què diferencia una làmina d'un gràfic estàndard

Les 11 referències de l'editor comparteixen un llenguatge de **gravat científic i atles contemporani** que s'allunya del tot dels gràfics de *dashboard* o d'Excel:

- **Res de barres rectangulars massisses quan hi ha una forma més orgànica:** si pots mostrar les observacions reals com a **núvol de punts translúcids** (`IBV.cloud`, estil *Fair and square?*), **cercles translúcids superposats** amb `mix-blend-mode: multiply` (*Major quakes*, *Incendios en Perú*), **corbes topogràfiques de densitat** (*Building strategy*) o **roses polars suaus** (`IBV.polarGrid`, *Typology demand* i *Parcs nacionals dels EUA*), tria sempre la forma orgànica.
- **Cercles translúcids, MAI anells concèntrics (decisió de l'editor, 19-11-2026):** a l'editor li encanten els **cercles plens translúcids** (`opacity 0,18–0,45`, `mix-blend-mode: multiply`, gradients radials suaus amb un puntet central) i **no li agraden gens els anells concèntrics tipus diana**. No facis servir anells concèntrics per marcar llocs o quantitats; fes servir cercles translúcids d'àrea proporcional (`d3.scaleSqrt`).
- **Prohibits els mapes inclinats pseudo-3D, els mapes de pics/agulles, els mapes de crestes abstractes i les lupes flotants que amaguen les dades (decisió de l'editor, 19-11-2026):** els mapes sempre van en projecció neta (plana Equal Earth/Mercator/cònica o globus ortogràfic real) amb costes recognoscibles i **tota la informació visible d'entrada** — mai inclinats, mai amb agulles verticals, mai amb crestes abstractes tipus *Joy Division*, ni amb una lupa circular que obliga a passar el ratolí per descobrir un mapa esvaït. Les quantitats puntuals sobre mapa es representen amb cercles translúcids `multiply` (MAP-03) i els camps continus amb franges suaus i isolínies nítides sobre costes clares (MAP-07, MAP-09).
- **Els mapes regionals són mapes físics en relleu: MAP-01 (decisió de l'editor, 19-11-2026).** L'editor vol que tots els mapes d'escala regional tinguin el detall del territori en gris dels mapes de «Jesús i els quatre evangelis». No és decoració: el relleu explica per què el camí va per la vall, per què «es puja» a Jerusalem, d'on surt el vent o on viu la gent.
  - **Quan:** sempre que el mapa mostri una regió (d'una vall a un país o una conca, aproximadament fins a 3.000 km d'amplada): rutes, jaciments, viatges, batalles, ciutats, conques, fonts de pols. Els mapes del món sencer o d'un oceà mantenen la terra plana `#ECEBE8` (geografia ultra-silenciosa d'MAP-19), perquè a aquesta escala el relleu és soroll; un globus o un oceà pot afegir-hi, com a molt, el relleu continental molt pàl·lid.
  - **La recepta (no la canviïs):**
    1. **Franges hipsomètriques de gris càlid**, mai colors d'atles: 0–200 m `#F3F2EF`, 200–500 `rgb(235,233,228)`, 500–800 `rgb(226,223,216)`, 800–1.500 `rgb(216,212,204)`, 1.500–2.200 `rgb(206,202,193)`, més amunt `rgb(196,191,182)`.
    2. **Ombra suau des del nord-oest**, ±15 punts de gris, saturada a un pendent d'uns 100 m/km. Res de llums dures ni de 3D.
    3. **Isolínies finíssimes**: tinta a 0,14 d'opacitat i 0,55 px, cada 300 m (relleu baix) o 500 m (alta muntanya). La de 0 m, en blau discontinu, només on hi ha terra sota el nivell del mar.
    4. **Aigua:** mar en blanc de paper (P1); costa nítida en `#ABA8A1` a 0,9 px; rius en blau a 0,78 d'opacitat i 1,25 px; llacs en `#AEC6E6` amb vora blava; terra sota el nivell del mar en blau clar.
    5. **Sense marc:** on el relleu s'acaba en terra, la vora s'esvaeix (`fade`). Escala gràfica en km i, si el lloc no és evident, mapa de situació petit.
    6. **Les dades a sobre, en color:** rutes, llocs, cercles i etiquetes en vermell, blau, groc i tinta. El relleu sempre és context gris (P2).
  - **Com es fa:** `node scripts/relleu.mjs --bbox oest,sud,est,nord --st 0.0125 --var XX_DEM --out web/articles/<slug>/relleu.js` (Mapzen Terrain Tiles a AWS Open Data, que combinen NASA SRTM, GMTED2010 i ETOPO1; 0,0125° ≈ 1,2 km per a una regió, 0,05–0,1° per a un país gran o un desert sencer; uns 50–90 KB). Després copia el bloc MAP-01 de `web/sistema/mapes-b.js` (`dem59`, `iso59`, `relleu59`) i crida `relleu59(ctx, proj, w, h, window.XX_DEM, {land, lakes, rivers, fade})`. Sense `land`, la costa surt de la isolínia de 0 m del mateix relleu; amb depressions per sota del nivell del mar (Mar Mort, Qattara) passa-hi la terra de Natural Earth. Comprovat: el generador reprodueix el relleu SRTM dels evangelis amb una mediana d'error de 0 m.
  - **Al peu:** «Relleu: Mapzen Terrain Tiles (NASA SRTM, GMTED2010, ETOPO1), mitjana per cel·les de X km». Si el hover dona alçades, digues que són la mitjana de la cel·la (més baixa que els cims).
- **Partícules lentes i contemplatives (decisió de l'editor, 19-11-2026):** totes les partícules que es mouen (fluxos LINK-03, boires de punts, arcs de flux, vents) han d'anar **molt a poc a poc** — recorregut complet en ~20–35 segons, moviment serè i hipnòtic, mai ràpid ni nerviós.
- **Ordenar el caos aparent:** quan hi ha centenars o milers de dades, deixa que els punts, les traces o els cercles revelin l'estructura per densitat (`opacity 0,05–0,38`, `mix-blend-mode: multiply`), en lloc d'amagar-los darrere mitjanes o caixes opaques.
- **Fils d'estructura ultra-fins:** retícules polars, cercles guia i línies base de `0,45–0,6 px`, sense graelles verticals feixugues que tallin les marques. Molt aire blanc al voltant.
- **Model de referència de l'editor — MAP-19 («Camp de vent animat», 19-11-2026):** aquesta peça resumeix la gramàtica visual ideal de la revista:
  1. **Monocromia rica:** un sol to seqüencial (blau) modulat en intensitat, sense soroll de colors.
  2. **Doble o triple codificació natural:** la intensitat es nota alhora pel **to**, la **llargada del traç** i la **densitat** — s'entén en mig segon sense mirar la llegenda.
  3. **Geografia ultra-silenciosa (mapes de món i d'oceà; els regionals van en relleu, MAP-01):** terra plana en `#ECEBE8` sense vores dures, aigua en blanc de paper, gratícula gairebé invisible; el mapa s'identifica a l'instant però cedeix el 100 % del protagonisme al fenomen.
  4. **La forma és el fenomen:** milers de micro-traços direccionals deixen aparèixer l'estructura orgànica (espirals, corrents, fluxos) sense caixes ni símbols artificials; funciona tant animat (a poc a poc) com congelat.
  5. **Anotacions quirúrgiques de mecanisme:** només 2–3 anotacions breus (títol en negreta + 4–5 paraules que expliquen *com funciona*, no què es veu) amb colze ultra-fi en tinta.
  6. **Aplicable més enllà de la meteorologia:** reutilitza aquesta gramàtica per a rutes marítimes, migracions, difusió cultural o de llengües, comerç antic o fluxos econòmics.
- **Segon model de referència de l'editor — TIME-07 («Calendari de calor», 19-11-2026):** complementa MAP-19 amb la mateixa fórmula mestra aplicada a sèries temporals denses:
  1. **Macro + micro simultanis (totes les dades d'un cop):** més de mil registres individuals visibles alhora permeten llegir en mig segon quatre capes (estacionalitat, ritme setmanal, excepcions culturals com les vacances d'agost i tendència interanual) sense amagar res darrere mitjanes ni lliscants.
  2. **Gamma tonal única i càlida (`IBV.heat`):** de crema quasi blanc a vermell fosc sense salts bruscos; els dies excepcionals destaquen sols com una brasa fosca.
  3. **Ordre tipogràfic d'alta precisió:** cel·les respirades amb blanc fi, fronteres de mes esglaonades en gris d'1 px, anys apilats amb la mateixa alineació vertical per comparar-los a cop d'ull i un resum discret a la capçalera de cada fila (`2023 · 45/dia`).
  4. **Minimalisme en etiquetes i anotacions:** només els dies alterns (`dl / dc / dv / dg`), mesos escrits una sola vegada i màxim 2 anotacions quirúrgiques amb colze fi que assenyalen un extrem i una anomalia estructural.
- **Noves formes creatives aprovades per l'editor (19-11-2026, adaptades sempre a la paleta vermell/blau/groc sobre paper blanc):**
  - **Xarxes circulars híbrides** (*Letter traffic*): anell finíssim amb ones translúcides exteriors (volum d'entrada/sortida), fils Bézier interiors delicats i seqüències de puntets sobre tiges corbes (ideal per a relacions, correspondències, influències o LINK-04).
  - **Mapes conceptuals de cercles translúcids sobre eix** (*Modified Mapping of Design Futures*): grans cercles monocroms translúcids `multiply` que se solapen al llarg d'un eix discontinu bipolar (`A ← · · · → B`) per cartografiar idees, corrents culturals, escoles o categories.
  - **Matrius monocromes d'alta densitat amb anomalies ressaltades** (*NBA stats heatmap* i *24-hour activity matrix*): centenars o milers de cel·les en una sola rampa tonal (blau o calor, sempre sobre blanc) amb fils blancs de `0,8 px` i cercles fins sobre els valors excepcionals.
  - **Radars orgànics i ruscs radials** (*Member Behaviour*, *Radar de discos suaus*, *Hex-cluster*): corbes tancades suaus (`curveCardinalClosed`) o polígons translúcids sobre discos d'aquarel·la sense vora (mai anells negres tipus diana), i ruscs radials d'hexàgons petits com a alternativa orgànica als diagrames de sectors.
- **Anotacions editorials amb fletxes corbes delicades:** `IBV.note(..., {kind:"curve"})` i caixes discontínues (`IBV.box`) que assenyalen el descobriment dins del núvol de dades.

---

## 2. Colors (`IBV.C`)

Tinta i estructura:

| Nom | Hex | Ús |
|---|---|---|
| `ink` | `#121212` | Text, dada clau, línia del zero |
| `ink2` | `#4A4A4A` | Subtítols, text secundari, zones |
| `muted` | `#7A7A7A` | Eixos, fonts, llegendes |
| `ghost` | `#C9C9C9` | Context (els altres anys, els altres casos) |
| `hair` / `grid` | `#DADADA` / `#EAEAEA` | Separadors / quadrícula |
| `land` | `#ECEBE8` | Terra als mapes (fronteres en blanc) |
| `neutral` | `#ECE9E4` | Centre de la rampa divergent |

**Tres colors i un quart per a la natura** (decisions de l'editor, 18-11-2026 i 20-11-2026). Al codi es diuen en anglès; els noms catalans (`vermell`, `blau`, `groc`, `vegetacio`…) són àlies antics perquè els articles publicats no es trenquin, però el codi nou fa servir els anglesos. Els tres primers van sempre en aquest ordre (`IBV.CAT`), validats per a daltonisme entre ells (ΔE ≥ 18).

| # | Nom | Hex | Significat habitual |
|---|---|---|---|
| 1 | `red` (= `warm`) | `#C8442A` | Calent, destacat, el protagonista, l'any actual |
| 2 | `blue` (= `cold`) | `#2C5DA8` | Fred, aigua, la comparació |
| 3 | `yellow` | `#F5C518` | Llum, sol, sec, tercera categoria |
| 4 | `green` | `#A6C06A` | Natura viva, només (vegeu a sota) |

- **El groc té poc contrast sobre blanc (1,7:1): mai text en groc**, ni línies de menys de 2 px. Només superfícies, punts i línies gruixudes, i sempre amb etiqueta en tinta.
- **El verd, el quart color, només per a la natura viva.** Un verd groguenc clar com el de les maquetes d'arquitectura.
  | Nom | Hex | Ús |
  |---|---|---|
  | `greenLight` | `#DCE8B5` | Superfícies: gespa, prats, cobertes (aiguada translúcida, 0,4–0,8) |
  | `green` | `#A6C06A` | Capçades d'arbres, matolls, mates d'herba; categoria de natura |
  | `greenDark` | `#6F8A3C` | Contorn fi (0,5–0,8 px) de capçades i taques verdes |
  - **Sí:** dibuixar vegetació (gespa, prats, boscos, arbres, conreus, màquia, horts, cobertes verdes), sempre amb el contorn en `greenDark`; i ser una **categoria de dades quan la categoria és natura viva** (superfície de bosc, terra agrícola, espais naturals, biomassa).
  - **No:** text, aigua (blava), animals, roca, rampes, el relleu MAP-01 (es queda gris) ni categories que no siguin natura (un partit, un país, «sí/no»).
  - **Daltonisme:** si el verd i el vermell conviuen com a categories, distingeix-los també per lluminositat o textura.
  - Si la vegetació és d'una època passada, ha de ser coherent amb les dades (p. ex. la plana de Salisbury del Neolític era prat obert, no bosc).
- **Prohibits:** ocre, verd mar, violeta i qualsevol altre to o verd, també en rampes.
- Més categories: el secundari va en gris (`ink2`, `ghost`). Si encara en calen, els tons dels mateixos colors: `redLight #E9A391`, `blueLight #9DB6DD`, `yellowLight #FBE38E`, `redDark #7A2312`, `blueDark #173A70`, `yellowDark #E0A800` (`IBV.CAT6`), sempre amb etiqueta directa.

Els articles anteriors fan servir `--dry #9A6326`, `--wet #16786C` i `--bio #4C8A2E`. Es queden en aquells articles; en els nous, no.

Rampes:

- **Divergent** `IBV.div(max)`: `#173A70 → blau → #9FB6DA → neutral → #E8AB98 → vermell → #7A2312`. Per a anomalies i qualsevol cosa amb un zero que tingui sentit. El centre sempre és gris.
- **Calor** `IBV.heat([min, max])`: gairebé blanc → groc → vermell → vermell fosc. Per a intensitats (foc, calor, densitat, risc).
- **Seqüencial** `IBV.seq(IBV.C.blue o IBV.C.red, [min, max])`: gairebé blanc → color → color fosc. Només en blau o vermell. Mai arc de Sant Martí.
- **Opacitat** `IBV.alpha(color, a)` per a núvols de punts i superposicions.

El text (valors, etiquetes, llegendes) va en tinta, no amb el color de la sèrie. Excepcions: el nom del protagonista (p. ex. «2026» en vermell) i les etiquetes d'isolínies.

### Mode fosc (decisió de l'editor, 20-11-2026)

Tota la web té mode fosc i **cada gràfic nou l'ha de suportar**. No es dissenya dues vegades: `web/assets/ib-theme.js` tradueix els colors en el moment de pintar-los.

- **Escriu els gràfics només en clar**, amb `IBV.C` i les rampes d'aquesta secció. Mai colors foscos propis, `prefers-color-scheme` ni `data-theme` als articles (`check.mjs` ho atura).
- **Com tradueix:** els neutres s'inverteixen (paper → `#131312`, tinta → `#EAE8E3`, filets i terra → grisos foscos); el vermell, el blau, el groc i el verd conserven el to i gairebé la lluminositat; els tons clars (`redLight`, `blueLight`, `yellowLight`, l'inici de `seq` i `heat`) passen a tons foscos apagats, i els foscos (`redDark`, `blueDark`) a clars. Així una rampa continua anant «del fons cap al color intens».
- **Què es tradueix:** fulls d'estil, atributs SVG (`fill`, `stroke`, `stop-color`…), estils en línia, i al canvas `fillStyle`, `strokeStyle`, `shadowColor`, degradats i `putImageData` (mapes de relleu). Les lectures (`getAttribute`, `getPropertyValue`, `getComputedStyle`, `ctx.fillStyle`) tornen el color clar original, de manera que les transicions de d3 i el codi que llegeix `--paper` funcionen igual.
- **Canvas ocults:** un canvas que no és a la pàgina es queda en clar fins que es copia amb `drawImage` a un de visible; aleshores es tradueix. Per això **les màscares** (pintar terra o països amb colors codificats i llegir-los amb `getImageData`) **funcionen igual en fosc**: no les copiïs mai a la pàgina.
- **Modes de fusió:** `multiply`, `darken` i `color-burn` es tornen `screen`, `lighten` i `color-dodge` (al canvas i a `mix-blend-mode`).
- **Text sobre farcits clars:** el groc i els farcits que es queden clars continuen sent clars en fosc. Un text SVG (o una insígnia HTML amb fons propi) que cau a sobre d'un farcit clar torna a ser fosc sol, i el halo pren el color del farcit. No cal fer res a l'article; només que el text vagi després de la forma (a sobre).
- **Dibuixos de línia sobre blanc** (gravats, grafits, il·lustracions amb fons blanc): posa-hi `mix-blend-mode: multiply` com sempre o la classe `ib-ink`; en fosc s'inverteixen (traç clar, el blanc desapareix). Les fotos i pintures, sense classe, només s'apaguen una mica.
- **Què no es tradueix:** fotos i imatges (`<img>`, `cover.jpg`, `drawImage` d'una imatge) fora del cas anterior; colors dins de `url()`; text de canvas sobre farcits clars; i WebGL. Si un gràfic depèn d'una imatge amb fons blanc, fes-la amb fons transparent o marca-la amb `ib-ink` si és un dibuix de línia.
- **El groc** continua sent per a superfícies, punts i línies gruixudes; en fosc queda una mica més daurat. Mai text en groc tampoc en fosc.

---

## 3. Tipografia

Source Serif 4 i Source Sans 3 (el mateix `<link>` que El Niño). Les mides són px reals: `IBV.mount` torna a dibuixar a l'amplada real, no s'escala amb `viewBox`.

| Element | Lletra | Mida | Color |
|---|---|---|---|
| Títol del gràfic | Serif 600 | 22 px (19 a mòbil) | ink |
| Subtítol / valor actual | Sans 400 | 13,5 px | ink2 |
| Anotació | Sans 700 (títol) + 400 | 12,5 px, halo blanc de 3 px | ink |
| Zona o nom secundari (oceà, «Llindar») | Sans cursiva | 12–14 px | ink2 |
| Eixos, llegendes | Sans 400, xifres tabulars | 11,5 px (mínim 11) | muted |
| Peu: tipus de dada i enllaç a les fonts | Sans 400 | 12,5–13 px | muted |

Números en català: coma decimal, punt de milers, signe menys tipogràfic. `IBV.fmt(",.1f")`, `IBV.signed(v, decimals)` per a anomalies (+2,5 / −0,8), `IBV.MES` i `IBV.MES1` per als mesos. Sense majúscules decoratives ni rètols petits en majúscules.

---

## 4. Components

| Codi | Component | Funció | Regles |
|---|---|---|---|
| C-01 | Capçalera | HTML `.vh` (títol `strong`, subtítol `span`, llegendes a `.lgs`) | Sempre a dalt del gràfic. La llegenda a la dreta, mai a sota. |
| C-02 | Llegenda de rampa | `IBV.legendRamp(el,{scale,min,max,ticks,f,title,lo,hi})` | Barra de 8 px, zero marcat, sentit escrit. |
| C-03 | Llegenda de mida | `IBV.legendSize(el,{values,r,f,title})` | Cercles discontinus amb el valor a dins, en cursiva. La mateixa escala `r` que el gràfic. |
| C-04 | Llegenda de categories | `IBV.legendCat(el,[{c,t,kind}])`, `kind`: `dot`, `line`, `ring`, `hollow`, `none` | Mateix símbol que al gràfic. Si hi ha ≤ 4 sèries, a més, etiqueta directa. |
| C-05 | Anotacions | `IBV.note(g,{x,y,tx,ty,lines,kind,anchor})` (`kind`: `elbow`, `straight`, `curve`), `IBV.box` (caixa discontínua), `IBV.rule` (llindar puntejat) | Línia de 0,8 px en tinta. Text amb halo. Mai a sobre d'una dada clau. |
| C-06 | Eixos i quadrícula | `IBV.gridY(g,y,x0,x1,ticks,f,{zero,unit})`, `IBV.axisX(g,x,y0,ticks,f)` | Sense línia d'eix. Quadrícula `grid`, valors a sobre de la línia, unitat al valor de dalt, zero en tinta. |
| C-07 | Controls | `.rng` (lliscant), `.seg` (botons de segment), `.playb` (Reprodueix) d'`article.css` | Sota el gràfic, separats per una línia. `aria-valuetext` llegible al lliscant. `.playb{padding:6px 0}` per tocar-lo amb el dit. |
| C-08 | Tooltip | `const tp=IBV.tip(container)` + `IBV.hover(node,onMove,onLeave)` | Blanc amb vora fina, sense ombra. Negreta per a qui és, xifres tabulars. S'obre amb un toc i no es tanca en aixecar el dit. |

Altres eines: `IBV.mount(el, draw)` (dibuixa i redibuixa quan canvia l'amplada), `IBV.svg(el,w,h,ariaLabel)`, `IBV.canvas(el,w,h,ariaLabel)`, `IBV.t(g,x,y,text,{size,weight,anchor,italic,serif,halo})`, `IBV.lines(...)`, `IBV.rings(g,cx,cy,n,step,color,o)` (anells concèntrics finíssims estil *A sea of sand and sickness*), `IBV.polarGrid(g,cx,cy,R,rings,spokes,o)` (retícula polar de 0,5 px estil *Typology demand* i *Parcs nacionals*), `IBV.cloud(ctx,pts,color,o)` (boira orgànica de punts en canvas estil *Fair and square?*), `IBV.world()` (promesa amb `land`, `countries` i `borders` de world-atlas 110m), `IBV.rng(seed)` i `IBV.gauss(r)` per a esquemes repetibles.

### Components de dibuix compartits (20-11-2026)

- **`assets/ib-gent.js`** (`window.IBGENT`): figures humanes de perfil en silueta plena, amb proporcions reals i poses de feina (`dret`, `mira`, `camina`, `porta`, `estira`, `palanca`, `picar`, `cavar`). `drawSil` per a canvas i `silPaths` per a SVG. Fes-les servir sempre que calgui gent a escala (persona d'1,7 m) o una colla; vesteix-les segons l'època i posa-les a fer feines documentades.
- **`assets/ib-voyager.js`** (`window.IBVOY`): **persones «Voyager»**. És l'home de la placa de les Pioneer 10 i 11 (NASA, 1972–1973, dibuix de Linda Salzman Sagan; domini públic; traçat de Wikimedia Commons «Pioneer plaque man as diagram template.svg») **amb el seu cos original**: contorn, espatlles, braços i cap. Només s'hi afegeix roba amb la mateixa línia: coll rodó, plecs a les mànigues i un mantell sobre l'espatlla. Peces: `IBVOY.use(g, "bust" | "torso" | "back", {flip})` (fins a la línia d'una taula, fins als malucs o d'esquena), dins d'un grup `translate(x,y) scale(s)` amb l'origen a la base del coll; `IBVOY.shape` i `IBVOY.line` per als objectes, amb el gruix `IBVOY.W`. **Decisió de l'editor (20-11-2026): quan un gràfic dibuixa persones que es miren de prop, fes-les amb aquesta referència, vestides segons el context.** Com fer-les bé (després que la primera versió fes «molt mal rotllo»): només línia de tinta sobre paper, sense omplir la roba de colors; no redibuixis braços ni mans amb tubs; no tombis el cap més de 10°; la variació ve de petites inclinacions de tot el cos, de qui s'aixeca i del mirall. Les siluetes petites d'`IBGENT` continuen servint per donar escala dins de maquetes i paisatges.
- **`assets/ib-3d.js`** (`window.IB3D`): motor 3D petit per a les maquetes de línia (HOW-03): càmera i òrbita, pedres amb secció orgànica i ombrejat suau, murs de paret seca, contorns de tinta, ombres, vegetació en verd i gent amb `IBGENT`. Les dades del model les posa l'article.

### Lleugeresa (obligatori)

Els gràfics han de ser molt lleugers i fluids, també en un mòbil normal.

- **Dibuix diferit:** `IBV.mount` no dibuixa res fins que el gràfic és a menys de 800 px de la pantalla. No calculis res pesat fora de la funció de dibuix si no cal.
- **Pocs elements DOM:** més de ~600 elements (punts, hexàgons, cel·les, anells) van en **canvas**, no en SVG. L'SVG queda per a eixos, text, anotacions i la capa de hover.
- **Animacions contínues** només amb `IBV.loop` (s'atura fora de pantalla), i a 60 fps: res de recalcular projeccions, contorns o geometria a cada fotograma; prerenderitza el que és fix en un canvas fora de pantalla i fes `drawImage`.
- **Hover barat:** cerca amb `d3.Delaunay` o una reixa precalculada; en hover només es toca la capa de ressaltat i l'opacitat de grups, mai es redibuixa tot.
- **Dades petites:** només el que el gràfic dibuixa, arrodonit (2–3 decimals), en un `.js` de menys de 100 KB per gràfic. Mapes: `countries-110m` (50m només si és imprescindible i carregat a demanda).
- **Res de llibreries noves.** d3 7.9.0, topojson-client i prou.

### Moviment i hover (obligatori a cada gràfic)

- **Entrada:** `IBV.onView(el, inst => …)` anima el gràfic la primera vegada que es veu (línies que es dibuixen, punts que creixen, morph). Només una vegada; en redibuixar per amplada, va directe a l'estat final. Durada 700–1.300 ms, `d3.easeCubicInOut`.
- **Animació contínua** (partícules, rellotges, rotació): `IBV.loop(el, (t, dt) => …)`, que s'atura quan el gràfic no es veu.
- **Hover: sempre s'ha de saber què estàs apuntant, sense tapar ni esborrar el gràfic (decisió de l'editor, 19-11-2026).** Cada gràfic compleix aquestes regles:
  1. **L'element apuntat es transforma**: contorn en tinta d'1,4–1,5 px, línia més gruixuda o color ple, i passa al davant (`raise()`).
  2. **La resta s'atenua suaument a 0,46–0,55 (`IBV.focus`)** — **mai a 0,15**: el context ha de continuar sent llegible i mai ha de desaparèixer.
  3. **Guia fins a l'eix o fins a l'escala**: línia fina (vertical, horitzontal o radial) quan ajuda a llegir el valor.
  4. **Lectura fixa d'una sola línia sota el gràfic (`IBV.tip` en mode `.ibv-dock`)**: **mai una caixa gran flotant al voltant del cursor que tapi les dades**. Una sola línia concisa (`Nom · valor`, màx. dues dades) que no mou la maquetació (`min-height: 24px`) i no cobreix mai ni un píxel del gràfic.
  5. **Zona de contacte còmoda** (el més proper amb `d3.Delaunay` o `d3.least`), cursor `pointer` o `crosshair`, transicions de 120–160 ms, i en sortir tot torna a l'estat inicial. Amb el dit: un toc fa de hover i un toc fora el tanca.
- **Controls que transformen:** quan un botó canvia la vista (mapa ↔ rànquing, mapa ↔ cercles, agrupacions), els elements es mouen al lloc nou; no es redibuixa en sec.
- **Reduced motion** (`IBV.reduced`): estat final directe i cap bucle.

---

## 5. Peces

Hi ha 73 peces en **vuit famílies**, ordenades per la pregunta que respon el gràfic. Els codis són en anglès (prefix de família i número) i dins de cada família van **de la més bàsica a la més creativa**. Totes tenen animació d'entrada (`IBV.onView`) i estat de hover (`IBV.focus` + tooltip). Al pla visual, cita-les pel codi («V2 · MAP-01 + MAP-11»). Els codis antics `IB-xx` ja no valen: les equivalències són a `research/sistema-codis.json`.

| Família | Pregunta | Peces |
|---|---|---|
| `TIME` · Temps | Quan passa: sèries, cicles i cronologies | 15 |
| `MAP` · Mapes | On passa | 19 |
| `SCALE` · Escala | Com de gran és, comparat amb una altra cosa | 6 |
| `SPREAD` · Distribució | Quina forma tenen les dades | 7 |
| `PART` · Parts d'un total | De què està fet | 7 |
| `LINK` · Relacions i fluxos | Què connecta amb què | 5 |
| `HOW` · Com funciona | Per dins i pas a pas | 5 |
| `CASE` · Comparar casos | Molts casos i moltes variables | 9 |

### TIME · Temps

Quan passa: sèries, cicles i cronologies.

| Codi | Nom | Per a què | Dades | Regles clau | Origen o codi |
|---|---|---|---|---|---|
| **TIME-01** | Annotated series · Sèrie temporal anotada | Línia protagonista amb soroll fi a sota, franja de variació, episodis ombrejats i anotacions en colze calculades | Sèrie llarga (mensual/anual) | 1 línia de 2–2,5 px vermella; soroll 0,6 px gris; ≤3 notes i ≤2 episodis; etiqueta final, sense llegenda | `sistema/basic-a.js` |
| **TIME-02** | Year bundle · Feix d'anys | «Com és aquest any respecte a tots els altres?» | Una sèrie per any amb 12 (o 365) valors | Context 1 px `ghost` 0,6; protagonista 2,2 px en color amb punt i etiqueta al final; com a màxim un segon destacat en tinta. | El Niño; «Seasonal Temperature Change» |
| **TIME-03** | Pulse index · Índex de pulsacions | «Quan hi ha hagut episodis i de quina força?» | Una sèrie llarga amb signe | Barres ≤ 2 px; color només fora dels llindars; nom només als 5–7 extrems, sense solapar-se. | Índex d'El Niño |
| **TIME-04** | Stacked stream · Corrent apilat | Diverses sèries apilades com un riu que s'eixampla i s'estreny. | Dades d'exemple generades | Màxim cinc capes, amb etiqueta dins de la capa quan hi cap; Corbes suaus (curveBasis) i separació blanca de 0,7 px; En la vista centrada, barra d'escala en lloc d'eix | `sistema/creatives-b.js` |
| **TIME-05** | Horizon · Horitzó | Moltes sèries llargues en files molt primes. | Dades reals | Dues o tres bandes de la rampa divergent, de la mateixa amplada; Files de 30–40 px, amb el mateix eix x; La línia de hover dona tots els valors alhora | `sistema/creatives-a.js` |
| **TIME-06** | Distribution band · Franja de distribució | «Què és normal en cada moment del cicle?» | Moltes observacions per mes/hora | Cel·les amb rampa seqüencial pel recompte; mediana en tinta; l'any actual en vermell; finestra amb màxim, mediana i mínim. | «Seasonal Temperature Change» |
| **TIME-07** | Heat calendar · Calendari de calor | Cada dia és un quadrat en una reixa de setmanes per dies de la setmana, i el color en dona el valor. | Dades d'exemple generades | Rampa de calor (groc → vermell) per a intensitats; el zero, gairebé blanc; Vora fina per als mesos; setmana que comença en dilluns; A mòbil, els anys en columnes i les setmanes cap avall | `sistema/creatives-a.js` |
| **TIME-08** | Bubble rows · Files de bombolles | «Quan arriba la temporada alta i quant dura?» | Recompte per setmana × anys o casos | Àrea proporcional; opacitat 0,4–0,5 sense vora; el màxim de cada fila en vermell; llegenda de mida. | Incendis al Perú; rèpliques de terratrèmols (Reuters) |
| **TIME-09** | Year spiral · Espiral anual | «Com canvia un cicle anual al llarg de dècades?» | Valor mensual durant molts anys | Gener a dalt, sentit horari, inicials dels mesos; rampa seqüencial pel temps; últim any en vermell. | Parcs nacionals dels EUA |
| **TIME-10** | Year ring · Anell de l'any | L'any al voltant d'un cercle, un sector per mes, i a cada sector una barra fina per any que neix d'un anell interior. | Dades reals | Gener a dalt, sentit horari, mesos a fora; Anell interior = zero, en tinta; barres amb la rampa divergent; En passar-hi, l'any sencer ressaltat i l'etiqueta al centre | `sistema/creatives-b.js` |
| **TIME-11** | Hour rose · Rosa horària | «En quines hores passa?» | 24 valors per a 2–3 sèries | Radi amb `scaleSqrt`; farciment 0,28 + contorn 1 px; mitjanit a dalt. | «Typology demand» |
| **TIME-12** | A day in a minute · Un dia en un minut | Un rellotge de 24 hores on l'agulla fa la volta en un minut. | Dades d'exemple generades | Mitjanit a dalt, sentit horari; un anell per categoria (màxim tres); Cada esdeveniment nou fa una ona que s'apaga; Amb moviment reduït, el dia sencer de cop | `sistema/creatives-b.js` |
| **TIME-13** | Icon timeline · Cronologia amb icones | Files amb icona de tipus, barra de durada (fins avui/esvaïda), franges d'època, claudàtors i columna de mida | Inici, final, tipus, mida | ≤ 6 tipus, ≤ 2 claudàtors, protagonista en vermell | `sistema/time-new.js` |
| **TIME-14** | State lanes · Carrils d'estat | Vinyetes sobre eix trencat i carrils d'estat (dret/no hi és/obres/cau) | Fets datats i trams | ≤ 6 vinyetes; vertical en mòbil | `sistema/time-new.js` |
| **TIME-15** | Deep time · Temps profund | Del Big Bang a avui en una sola línia. | Dades reals | L'escala logarítmica s'anuncia a l'eix; Etiquetes en carrils que no se solapen; les que no hi caben, només punt; Dates aproximades amb ≈ i interval al tooltip | `sistema/creatives-b.js` |

### MAP · Mapes

On passa.

| Codi | Nom | Per a què | Dades | Regles clau | Origen o codi |
|---|---|---|---|---|---|
| **MAP-01** | Physical relief · Mapa físic en relleu | Base de tots els mapes regionals: franges hipsomètriques en gris càlid, ombra suau des del NO, isolínies finíssimes, mar en blanc i aigua en blau; les dades a sobre en color (estil «Jesús i els quatre evangelis»). | Dades reals (Catalunya, Mapzen Terrain Tiles / SRTM) | Grisos càlids, mai verds ni marrons; ombra ±15; isolínies 0,55 px a 0,14; vora esvaïda sense marc; escala en km; relleu sempre context gris | `sistema/mapes-b.js` + `scripts/relleu.mjs` |
| **MAP-02** | Soft choropleth · Coropleta suau | Un valor per regió amb una rampa d'un sol to, en `multiply` sobre el relleu MAP-01; el cas extrem va anotat | Dades reals derivades: pendent i altitud de 947 municipis | Farciment a 0,74, vores blanques fines, límits grans discontinus; entrada de la dada més baixa a la més alta | `sistema/basic-b.js` |
| **MAP-03** | Translucent circle map · Mapa de cercles translúcids | Projecció plana neta (Equal Earth) amb cercles translúcids `multiply` d'àrea proporcional i puntet central (sense inclinació 3D ni agulles). | Dades reals | Projecció plana neta; cercles amb gradient radial i `multiply` (`d3.scaleSqrt`); etiqueta els 3–5 extrems amb fletxes corbes | `sistema/mapes-a.js` |
| **MAP-04** | Proportional rings · Anells proporcionals | «Quants casos hi ha a cada lloc, i de quin tipus?» | Recompte per lloc i categoria | Un anell per cas (o 1 anell = N, dit a la llegenda); ≤ 3 categories; rutes en blanc gruixut a sota. | «A sea of sand and sickness» |
| **MAP-05** | Dot density · Densitat de punts | Un punt per cada N unitats, escampats només dins de la frontera de cada regió i on és més probable que hi siguin (mètode dasimètric). | Dades d'exemple generades | Un sol color, punts d'1–1,5 px, opacitat alta; «1 punt = …» a la llegenda; la mateixa N a totes les amplades; Projecció d'àrees iguals | `sistema/mapes-a.js` |
| **MAP-06** | Dot field · Camp de punts sobre mapa | «On és més calent/humit/dens?» | Camp continu lon/lat | Trama hexagonal de punts al mar; mida i color pel valor; el que és ≈ 0 no es dibuixa; terra `land`. | El Niño (mapa i portada) |
| **MAP-07** | Bands and isolines · Mapa de franges i isolínies | Projecció plana neta (Equal Earth) amb bandes suaus d'anomalia, costes nítides i isolínies etiquetades (estil *Germany — rainfall and temperature*). | Dades reals | Bandes esglaonades translúcides + isolínies fines en vermell/blau (zero discontinu); costes sempre recognoscibles; sense crestes abstractes | `sistema/mapes-a.js` |
| **MAP-08** | Isolines over a field · Isolínies sobre camp | «Com es combinen dues variables al territori?» | Dos camps continus | Camp en 6–8 franges seqüencials; isolínies d'1,4 px amb l'etiqueta girada sobre la línia; ciutats amb halo. | «Germany – average rainfall and temperature» |
| **MAP-09** | Sea isotherms · Mapa d'isotermes marí | Camp complet de temperatura de la superfície del mar amb franges litogràfiques translúcides, isotermes fines cada 2 °C i principals cada 5 °C, i terra silenciosa a sobre (sense lupa que amagui el mapa). | Dades reals | Tota la dada visible d'entrada; franges suaus blau↔vermell + isotermes fines (2 °C) i etiquetades (5 °C); 3 anotacions de mecanisme; en passar-hi, ressalta la isoterma del punt | `sistema/mapes-b.js` |
| **MAP-10** | Bivariate map · Mapa bivariant | Dues variables al mateix mapa amb una reixa de 3 × 3 colors: vermell per a una, blau per a l'altra, gris on totes dues són baixes i fosc on totes dues són altes. | Dades reals | Reixa 3 × 3 entre el vermell i el blau sobre gris; les cantonades són els colors purs; Talls per terços, escrits a la llegenda; Llegenda girada 45° amb el nom dels dos eixos i el sentit; Hover recíproc: cel·la → països, país → cel·la | `sistema/mapes-b.js` |
| **MAP-11** | Tracks · Trajectòries | «Per on es mouen?» | Recorreguts (lon/lat al llarg del temps) | Línies de 0,75 px a 0,3; un recorregut destacat en vermell amb inici i final; ortogràfica si és polar. | «Iceberg alley»; biodiversitat antàrtica |
| **MAP-12** | Flow arcs · Arcs de flux | Orígens i destinacions units per arcs que segueixen el cercle màxim, amb partícules que hi circulen en el sentit del flux. | Dades d'exemple generades | Arcs de cercle màxim amb una petita separació per a cada sentit; Gruix de 0,6 a 5 px; partícules més ràpides que llegibles, mai al revés; Sortides en vermell, arribades en blau quan se'n destaca una | `sistema/mapes-a.js` |
| **MAP-13** | Strip map · Mapa en franja | Un recorregut desplegat en línia recta: el mapa es gira perquè el camí quedi horitzontal, amb els llocs al llarg, els països que travessa i una variable a sota. | Dades reals | El recorregut, recte i en vermell; el mapa es gira, no es deforma el camí; Vores de la franja que s'esvaeixen, sense marc; Variable a sota amb la mateixa escala horitzontal; línia guia comuna; Mini mapa de situació sempre visible | `sistema/mapes-b.js` |
| **MAP-14** | Distance from a point · Distància des d'un punt | Projecció azimutal equidistant: totes les distàncies des del centre són reals i qualsevol recta que en surt és el camí més curt. | Geometria real | Anells puntejats cada 2.000 km; el de 10.000, més fosc; Rectes des del centre en vermell fi; la ressaltada, de 2 px; Etiquetes radials, sense solapar-se; a mòbil, menys; Recentrar amb una transició de 1,3 s pel cercle màxim | `sistema/mapes-b.js` |
| **MAP-15** | Before and after · Abans i després | Dos estats del mateix mapa, l'un sobre l'altre, separats per un divisor que s'arrossega amb el ratolí, amb el dit o amb les fletxes del teclat. | Dades reals | Els dos mapes, idèntics en projecció i escala; Etiquetes dels dos estats (abans / després, o els dos mesos) enganxades al divisor; El divisor és un control: ratolí, dit i teclat, amb aria-valuetext; Entrada: el divisor escombra fins al mig | `sistema/mapes-b.js` |
| **MAP-16** | Hexagons over time · Hexàgons en el temps | La terra coberta d'hexàgons iguals que canvien de color mes a mes amb un lliscant o amb «Reprodueix». | Simulació | Hexàgons iguals, separats 1 px; només sobre terra; Rampa divergent amb el zero en gris; la línia del zero, en tinta; El mes, gran i en serif dins del mapa; Lliscant amb aria-valuetext i botó que s'atura | `sistema/mapes-b.js` |
| **MAP-17** | Circle cartogram · Cartograma de cercles | Del mapa als cercles: cada país es converteix en un cercle d'àrea proporcional al valor i una simulació de forces els separa sense allunyar-los gaire del seu lloc. | Dades reals | Àrea del cercle proporcional al valor; clau de mida dins del gràfic; Els cercles surten del seu país i hi tornen; Etiqueta només els cercles que caben; la resta, al tooltip | `sistema/mapes-a.js` |
| **MAP-18** | Spinning globe · Globus que gira | El planeta en projecció ortogràfica, que gira sol com la Terra i es pot arrossegar amb el ratolí o el dit. | Dades reals | Gir lent (un tomb cada 40 s); s'atura en passar-hi, en arrossegar i amb prefers-reduced-motion; Gratícula de 15° en gris finíssim, costa en tinta clara; Arrossegar en horitzontal a mòbil, perquè la pàgina continuï fent scroll | `sistema/mapes-a.js` |
| **MAP-19** | Wind field · Camp de vent animat | Milers de partícules que es deixen portar pel vent i deixen una estela que s'esvaeix. | Simulació | Canvas, 1.500–4.000 partícules d'1 px amb estela de 10–14 punts; Un sol to (rampa seqüencial blava) per a la velocitat; En passar-hi, les partícules baixen a 0,3 i surt la línia de corrent en tinta; Botó per aturar el moviment; amb moviment reduït, estela fixa | `sistema/mapes-b.js` |

### SCALE · Escala

Com de gran és, comparat amb una altra cosa.

| Codi | Nom | Per a què | Dades | Regles clau | Origen o codi |
|---|---|---|---|---|---|
| **SCALE-01** | Threshold scale · Escala amb llindar | «A partir de quin valor passa una cosa? On és cada lloc?» | Una variable, uns quants casos | Regla de color de 10 px; zona de llindar gris pàl·lid amb nom; marcadors amb triangle; fletxa corba per al canvi. | El Niño («L'aigua calenta fa ploure») |
| **SCALE-02** | Nested squares · Quadrats d'escala | Quadrats niats a la mateixa cantonada, amb l'àrea proporcional a la quantitat, que creixen un darrere l'altre des del més petit. | Dades reals | Àrea proporcional, mai el costat; Tots a la mateixa cantonada, del més gran al més petit; El protagonista diminut amb color i anotació | `sistema/creatives-a.js` |
| **SCALE-03** | People count · Retrat de figures | Una quantitat en siluetes humanes en files amb profunditat, agrupades o barrejades | 40–300 unitats, ≤ 6 grups | Siluetes d'`ib-gent.js`, xifra serif per grup, hover 0,46 | `sistema/scale-new.js` |
| **SCALE-04** | Comparative scale · Escala comparativa | Tots els ordres de magnitud visibles alhora en una cinta logarítmica amb referències concretes (cercles translúcids) i arcs que comparen la raó exacta entre dues mides qualsevol. | Dades reals | Tota l'escala visible d'un cop (mai cercles concèntrics buits amb zoom); cercles translúcids `multiply` per domini; clic fixa l'àncora i hover dibuixa l'arc de proporció exacta (`×N` / `÷N`) | `sistema/creatives-a.js` |
| **SCALE-05** | Same-scale plans · Plantes a la mateixa escala | Plantes en línia fina a una escala, niades, amb lupa ×N i persona vista des de dalt | Dimensions publicades | Una escala amb barra; verd només per a gespa; sense mida verificada, no hi va | `sistema/scale-new.js` |
| **SCALE-06** | Crew at scale · Escena de colla a escala | Escena obliqua amb objecte, cordes en ventall i colla a escala; commutadors d'objecte i mètode | Ritme kg/persona (font o «exemple») | Persona d'1,7 m, corda destacada en vermell, moviment lent | `sistema/scale-new.js` |

### SPREAD · Distribució

Quina forma tenen les dades.

| Codi | Nom | Per a què | Dades | Regles clau | Origen o codi |
|---|---|---|---|---|---|
| **SPREAD-01** | Uncertainty intervals · Intervals d'incertesa | Cada interval és una llentia ratllada amb l'estimació central en punt blanc | Intervals publicats (95 %) | Llentia translúcida + ratllat 0,5 px; peu diu si la forma no és la distribució; 2 colors com a màxim | `sistema/basic-a.js` |
| **SPREAD-02** | Cloud with protagonists · Núvol amb protagonistes | «Quins casos se surten de la norma?» | Centenars o milers de punts x/y | Punts de 2 px a 0,2; protagonistes en cercle buit + nom en cursiva (màxim 6–8); log anunciat. | «The Worst Games Ever Made» (FiveThirtyEight) |
| **SPREAD-03** | Force swarm · Eixam de forces | Centenars de punts, un per cas, que s'empenyen sense trepitjar-se. | Dades reals | Entre 200 i 2.000 punts, sense vora; Etiqueta de grup amb el recompte o el percentatge; En passar per un punt, s'il·luminen els del mateix grup (aquí, el mateix any) | `sistema/creatives-a.js` |
| **SPREAD-04** | Dot dust · Pols de punts | «Quina forma té la distribució? Hi ha patrons estranys?» | 10.000–100.000 punts | Canvas; punts d'1 px a 0,04–0,09; un sol color; caixa discontínua + nota. | «Fair and square?» (The Economist) |
| **SPREAD-05** | Hex mosaic · Mosaic hexagonal | «On és més alt un valor segons dues variables?» | Molts punts amb un valor | Hexàgons amb rampa divergent centrada a la mitjana; mínim 5 casos per hexàgon; zones amb línia puntejada i nom en cursiva. | «The sweet spot» (FiveThirtyEight) |
| **SPREAD-06** | Density topography · Topografia de densitat | «On s'agrupen i com es toquen els grups?» | Punts x/y | `d3.contourDensity`, 20–30 nivells de 0,7 px, rampa a la línia, la corba exterior més gruixuda. | «Building strategy»; Senezh |
| **SPREAD-07** | Moving bubbles · Bombolles en moviment | Una dispersió que es mou amb el temps: cada bombolla és un lloc, la mida és la població i l'any passa gran i pàl·lid al fons. | Dades d'exemple generades | Àrea proporcional; bombolles a 0,55 amb contorn fosc; L'any en serif gran, en el gris de la quadrícula; Cada camí deixa una estela fina translúcida permanent i el hover hi marca cada any i cada dècada | `sistema/creatives-b.js` |

### PART · Parts d'un total

De què està fet.

| Codi | Nom | Per a què | Dades | Regles clau | Origen o codi |
|---|---|---|---|---|---|
| **PART-01** | Unit grid · Reixa d'unitats | «Quina part del total és cada cosa?» | Percentatges de ≤ 5 grups | 100 punts; colors en l'ordre de la paleta; vista junta i vista per grup amb transició. | «De què mor el món?» |
| **PART-02** | Waterfall · Cascada | D'un valor a un altre pas a pas, amb barres flotants, connectors discontinus i el total en tinta | Dades reals: Global Carbon Budget 2023 | Un color per signe, incertesa en bigoti, entrada pas a pas, una frase de lectura | `sistema/basic-b.js` |
| **PART-03** | Nested mosaic · Mosaic jeràrquic | Caixes niades d'àrea proporcional amb buits orgànics; es pot entrar a cada nivell | Dades reals: FAO (terra agrícola via Our World in Data; boscos, FRA 2020) | Cantonades suaus, translúcids `multiply`, verd només per a natura viva, caixes petites amb nota | `sistema/basic-b.js` |
| **PART-04** | Breaking bar · Barra que es trenca | Un total que sembla una sola cosa es trenca en les unitats que el formen, i les unitats volen a agrupar-se. | Dades d'exemple generades | A la barra sencera, un sol color i cap separació; Cada unitat vola en arc, amb un petit retard per columna; Màxim cinc grups, en l'ordre de la paleta | `sistema/creatives-b.js` |
| **PART-05** | Radial burst · Esclat radial | «Quines parts té un tema i com es reparteixen?» | 30–100 elements amb categoria i valor | Radis 0,6 px; 2 categories; ≤ 5 etiquetes amb línia puntejada fins al marge. | «Technology / Ecology» |
| **PART-06** | Circle constellation · Constel·lació de cercles | Cercles translúcids de color pla (`fill-opacity` + `multiply`, estil LINK-05) agrupats en constel·lacions amb àrea proporcional i zoom suau en clicar, sense degradats ni puntets darrere el text. | Dades reals | Cercles translúcids de color pla (`d3.pack`, sense degradats) i sense puntets que embrutin el text; cercles suaus de grup amb etiquetes horitzontals netes (mai text corbat); hover suau (0,48) i zoom en clicar | `sistema/creatives-a.js` |
| **PART-07** | Radial hive · Rusc radial d'hexàgons | Composició orgànica de 127 hexàgons que floreixen del nucli càlid (groc/vermell) cap a capes fredes (blau), sense vores dures. | Dades d'exemple generades | Hexàgons iguals amb separació blanca d'1,4 px; color per capa radial; hover aïlla la capa sencera (la resta a 0,45) | `sistema/creatives-b.js` |

### LINK · Relacions i fluxos

Què connecta amb què.

| Codi | Nom | Per a què | Dades | Regles clau | Origen o codi |
|---|---|---|---|---|---|
| **LINK-01** | Sets · Conjunts | Venn de tres conjunts amb el número de cada zona; amb més conjunts, matriu de coincidències | Dades d'exemple | Cercles proporcionals al conjunt; més de tres conjunts, mai Venn; hover per zona | `sistema/basic-b.js` |
| **LINK-02** | Link arcs · Arcs d'enllaç | «Què connecta amb què?» | Dues llistes i parells | Bézier horitzontals d'1 px a 0,55; nodes buits; en passar-hi, la resta a 0,08. | Senezh; músics de rock (La Lettura) |
| **LINK-03** | Particle flow · Flux amb partícules | Diagrama de flux amb bandes d'aquarel·la sense contorn (`multiply`), nodes esvelts arrodonits i micro-traços corbats que circulen a poc a poc seguint cada camí (estil MAP-19 aplicat a un Sankey). | Dades reals | Bandes translúcides amb degradat i sense vores dures; nodes fins de 3,5 px arrodonits; micro-traços corbats amb estela que flueixen lentament (~28 s); s'aturen amb moviment reduït | `sistema/creatives-a.js` |
| **LINK-04** | Circular network · Xarxa circular amb ones | Anell finíssim amb nodes translúcids, dues ones exteriors suaus (sortides en vermell, entrades en blau) i fils Bézier delicats a l'interior (estil *Letter traffic*). | Dades d'exemple generades | Anell de 0,9 px + ones exteriors `multiply`; fils interiors fins amb puntets als fluxos clau; hover en vermell (sortides) i blau (entrades) | `sistema/creatives-b.js` |
| **LINK-05** | Concept map on an axis · Mapa conceptual sobre eix | Grans cercles monocroms translúcids `multiply` solapats al llarg d'un eix discontinu bipolar (estil *Design Futures*). | Esquema conceptual | Un sol color translúcid `multiply`; eix discontinu bipolar fi; tipografia neta dins de cada cercle; hover suau (0,46) amb definició | `sistema/creatives-b.js` |

### HOW · Com funciona

Per dins i pas a pas.

| Codi | Nom | Per a què | Dades | Regles clau | Origen o codi |
|---|---|---|---|---|---|
| **HOW-01** | Cutaway · Tall | «Com funciona per dins?» | Esquema | Capes amb la rampa del fenomen, sense contorns negres; fletxes fines; noms dins de cada capa; escala vertical exagerada declarada. | El Niño (tall de l'oceà) |
| **HOW-02** | Engraved elevation · Alçat en gravat | Un procés constructiu pas a pas en alçat lateral a escala, com un gravat: tall del terreny, materials amb textura, la colla de cada pas i lupes de detall | Esquema d'exemple (seqüència documentada, mides il·lustratives) | Persona d'1,7 m fixa; terra en grisos càlids, gespa en verd; vermell només per a la peça del pas; lupes amb contorn vermell; botons o scroll; reduced-motion sense moviment | `sistema/how-engrave.js` |
| **HOW-03** | Line model · Maqueta de línia | Monument de pedra en perspectiva, a escala real i girable, dibuixat com un gravat (volum suau, contorn de tinta, murs amb filades, vegetació en verd, gent a escala) | Recinte de taula de Talatí de Dalt: dades reals i parts esquemàtiques dites al peu | Escala en metres i persona d'1,7 m; vermell només per a l'apuntat; verd només per a la vegetació; gira molt a poc a poc, s'atura amb reduced-motion i es gira arrossegant en horitzontal; ≤ 3 vistes; hover al dock | `assets/ib-3d.js` + `assets/ib-gent.js` + `sistema/how-model.js` |
| **HOW-04** | Ray simulation · Simulació de raigs | Raigs que surten d'una font, reboten a les parets d'una planta i perden energia, amb un panell sincronitzat que mesura què arriba a qui escolta | Simulació geomètrica amb valors d'exemple | Canvas; blau abans del primer rebot i vermell després; l'opacitat segueix l'energia; xifres calculades; fronts fixos amb reduced-motion | `sistema/how-rays.js` |
| **HOW-05** | Galton board · Màquina de Galton | Mil boles cauen per una reixa de claus i, a cada clau, reboten a la dreta o a l'esquerra. | Simulació | Simulació en canvas; la teoria, una línia en tinta per sobre; El comptador diu quantes boles han caigut; Amb moviment reduït, el resultat final directe | `sistema/creatives-a.js` |

### CASE · Comparar casos

Molts casos i moltes variables.

| Codi | Nom | Per a què | Dades | Regles clau | Origen o codi |
|---|---|---|---|---|---|
| **CASE-01** | Ranked bars · Barres ordenades | Rànquing de tija i punt, mitjana discontínua, llindars en franges, reordenable | 8–40 casos, un valor | Tija 0,9 px, protagonista 2,2 px vermell; etiquetes a l'esquerra, valor al final; reordenar amb transició | `sistema/basic-a.js` |
| **CASE-02** | Dumbbells · Halteres | Dos valors per cas units per una barra; vistes real / diferència / ordenat per diferència, animades | 5–30 casos amb dos valors | Blau i vermell fixos; extrems 4,4 px amb vora blanca; diferència escrita al final | `sistema/basic-a.js` |
| **CASE-03** | Slopes · Pendents | Dos moments, dues columnes i una línia per cas: el pendent diu si puja o baixa i quant. | Dades reals | Vermell si puja, blau si baixa, gris si gairebé no canvia; Etiquetes a les dues bandes, separades amb una guia fina; Escala logarítmica anunciada si els valors són molt diferents | `sistema/creatives-a.js` |
| **CASE-04** | Translucent circle rows · Filera de cercles translúcids | Una fila neta per grup on cada dada real és un cercle translúcid `multiply` d'àrea proporcional a la intensitat (estil *Major quakes* i *Incendios en Perú*), sense muntanyes opaques que tapin la fila de darrere. | Dades reals | Cada cas real visible d'un cop sobre un fil de 0,6 px; cercles translúcids `multiply` amb `d3.scaleSqrt`; mediana marcada amb una ratlla fina en tinta; zero crestes opaques encavalcades | `sistema/creatives-a.js` |
| **CASE-05** | Small multiples · Petits múltiples | «Com canvia el mateix patró entre llocs o èpoques?» | Qualsevol peça repetida | Mateixa escala a tots, escrita només al primer; títol serif 16 px; 4 per fila (2 a mòbil). | Parcs nacionals; seqüències de procés |
| **CASE-06** | Monochrome matrix · Matriu monocroma | Reixa densa multivariant en una sola rampa blava amb fils blancs d'1 px i cercles d'accent sobre els màxims (estil *NBA heatmap*). | Dades d'exemple generades | Una sola rampa seqüencial sobre paper blanc; separació blanca d'1 px; hover ressalta fila i columna (la resta a 0,5) | `sistema/creatives-b.js` |
| **CASE-07** | Parallel coordinates · Coordenades paral·leles | Cada cas és una línia que travessa tants eixos com variables té. | Dades d'exemple generades | Línies de 0,75 px a 0,25; les filtrades, en gris; Corbes suaus entre eixos; mínim, mig i màxim a cada eix; En passar per sobre, la línia en tinta amb els valors | `sistema/creatives-b.js` |
| **CASE-08** | Organic radar · Radar orgànic | Corba tancada suau (`curveCardinalClosed`) sobre 4 discos translúcids sense vora (mai anells negres tipus diana). | Dades d'exemple generades | 4 discos translúcids guia (25/50/75/100); corba suau `multiply` per a 1–2 perfils; radis fins (0,55 px) | `sistema/creatives-b.js` |
| **CASE-09** | Data flowers · Flors de dades | Cada cas és una flor i cada pètal, una variable: com més llarg, més valor; el color en diu el tipus. | Dades d'exemple generades | Llargada del pètal amb d3.scaleSqrt (l'àrea mana); Màxim tres tipus de color; pètals a 0,5 amb contorn de 0,8 px (el groc, a 0,7 i sense contorn); Cercle discontinu = 100; clau de la flor a la llegenda | `sistema/creatives-b.js` |

### Combinar peces amb el scroll

Les peces funcionen dins d'una secció `.scrolly` (el gràfic enganxat i els passos al costat). Cada pas pot afegir una capa, fer zoom o canviar l'estat: MAP-06 + HOW-01 a sota és la combinació d'El Niño; TIME-02 pot destacar un any diferent a cada pas; PART-01 pot reagrupar els punts.

---

## 6. Abans de publicar un gràfic

- [ ] És una peça IB del pla visual de l'article (`research/<slug>/pla-visual.md`), o el pla explica per què cal una peça nova.
- [ ] No pinta cap fons, panell ni ombra (P1).
- [ ] Si és un mapa regional, va sobre la base física en relleu MAP-01 (no sobre terra plana).
- [ ] El protagonista és clar en dos segons; la resta, gris (P2).
- [ ] Té capçalera (C-01) i llegenda si hi ha ≥ 2 sèries o una rampa.
- [ ] Les idees clau estan anotades dins del gràfic (P4).
- [ ] Unitat al valor de dalt, zero marcat, escales no truncades sense avís (P5).
- [ ] Cap text per sota d'11 px; cap etiqueta tallada o solapada a 1440 i a 390 px.
- [ ] Peu amb «Dades reals», «Simulació» o «Esquema» i l'enllaç a la seva entrada de «Els gràfics», on hi ha les fonts amb any (P9).
- [ ] `role="img"` i `aria-label` amb el que diu el gràfic, no només què és.
- [ ] Tooltip amb ratolí i amb un toc (`IBV.hover`); lliscants amb `aria-valuetext`.
- [ ] `IBV.reduced`: sense animacions contínues, estat final directe.
- [ ] Zero errors a la consola i cap scroll horitzontal.
- [ ] **En mode fosc** (1440 i 390 px): el gràfic es llegeix igual de bé, cap text desapareix, cap fons clar, i les categories i rampes es continuen distingint. Escrit només amb colors clars (§2, «Mode fosc»).

## 7. Referències

Imatges que l'editor va donar com a model (18–19-11-2026): «Seasonal Temperature Change»; «The sweet spot» i «The Worst Games Ever Made» (FiveThirtyEight); parcs nacionals dels EUA (visitants per mes); «Technology / Ecology»; «Building strategy» (punts atractors); «Public / private typology demand»; Senezh («Concept diagram of the masterplan»); músics de rock (La Lettura); «Fair and square?» (The Economist); «Major quakes and their aftershocks» (Reuters); «Incendios en Perú 2012–2024» (Enrique Mendoza Tincopa); «Walking to Starbucks in Manhattan»; «Iceberg alley»; «Germany – average rainfall and temperature»; mapa de biodiversitat antàrtica; «A sea of sand and sickness» (Amy Powell, Creu Roja britànica); «Letter traffic» (xarxa circular híbrida amb ones exteriors i fils); matriu horària d'activitat 24 h amb anomalies encerclades; «Modified Mapping of Design Futures» (cercles conceptuals translúcids sobre eix); «Member Behaviour» (radar hexagonal de cantonades suaus i corba orgànica); rusc radial d'hexàgons (*Performance hex-cluster*); radar monocrom sobre discos translúcids suaus; matriu monocroma blava d'estadístiques NBA. No se'n copia cap dibuix ni dada: se n'agafen principis i formes, sempre adaptats a paper blanc (P1) i a la paleta vermell/blau/groc.
