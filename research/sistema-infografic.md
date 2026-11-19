# Sistema infogràfic d'Inspired by Magazine

Com han de ser els gràfics de tots els articles nous. Llegeix-ho sencer abans de dibuixar res, juntament amb `research/guia-estil-articles.md` (text, dades i estructura de l'article).

- **Mostrari viu:** `web/sistema/index.html`, publicat a https://inspiredby.uriocallaghan.com/sistema/. Cada peça hi és dibuixada i funciona.
- **Codi comú:** `web/assets/ib-viz.js` (objecte global `IBV`): colors, escales, text amb halo, anotacions, llegendes, tooltip tàctil, mapes. Es carrega després de d3 7.9.0 (i de `topojson-client@3.1.0` si hi ha mapes).
- **Codi de cada peça:** un bloc per peça, marcat amb el número: IB-01 a IB-20 a `web/sistema/sistema.js`, IB-21 a IB-27 a `mapes-a.js`, IB-28 a IB-34 a `mapes-b.js`, IB-35 a IB-44 a `creatives-a.js` i IB-45 a IB-54 a `creatives-b.js` (cadascun amb el seu `.css` i el seu fitxer de dades). Copia el bloc que necessitis al JS de l'article i canvia-hi les dades.
- **Model de qualitat:** «El Niño i La Niña» (`web/articles/el-nino/`).

Quan planifiquis un article, anomena els gràfics pel número: «IB-12 per al mapa de l'anomalia, IB-01 per a la sèrie de 1950–2026, IB-16 per al tall».

---

## 1. Principis

Tots són obligatoris.

| | Principi | Què vol dir a la pràctica |
|---|---|---|
| P1 | **El fons és el paper** | Cap gràfic pinta fons, panells, targetes, vores de caixa ni ombres. El blanc de la pàgina és el fons. L'única superfície pintada és la terra dels mapes (`land`), perquè és informació. |
| P2 | **Gris per al context, color per a la història** | El que no és protagonista va en gris fi (`ghost`, `grid`). Un o dos colors per gràfic. Cada color vol dir el mateix a tot l'article. |
| P3 | **Molts elements, petits i translúcids** | Si hi ha milers de dades, es dibuixen totes, petites i amb opacitat baixa (0,05–0,5). La densitat ha d'aparèixer sola. |
| P4 | **Anotar dins del gràfic** | La història s'escriu al lloc on passa: títol en negreta i una línia de detall, amb línia guia fina. La llegenda només explica la codificació. |
| P5 | **Escales honestes i explicades** | Llegenda a la capçalera, amb el sentit escrit (◀ menys · més ▶). La unitat va al valor de dalt. El zero es marca en tinta. Si l'escala és logarítmica, el títol de l'eix ho diu. Àrees proporcionals (`d3.scaleSqrt`). |
| P6 | **Una sola jerarquia de text** | Vegeu §3. Res per sota d'11 px reals a la pantalla. |
| P7 | **La forma segueix el fenomen** | El temps cíclic (any, dia) va en cercle; el temps lineal, en línia. Un lloc va en mapa quan explica alguna cosa. Un mecanisme va en tall o esquema. |
| P8 | **Petits múltiples abans que espaguetis de colors** | Si hi ha més de tres sèries, es fan gràfics petits amb la mateixa escala. Només vermell, blau i groc (i els seus tons). |
| P9 | **Dada, simulació o esquema, sempre dit** | El peu diu què és: dades reals (font i any), simulació (quin model) o esquema. Mai una forma inventada que sembli una dada. |
| P10 | **Es toca, es mou i cap a 390 px** | Tooltip amb ratolí, teclat i dit (`IBV.hover`). Moviment suau i amb sentit, que respecta `prefers-reduced-motion` (`IBV.reduced`). Cap scroll horitzontal. A mòbil, menys etiquetes, no més petites. |

### Estètica orgànica: què diferencia una làmina d'un gràfic estàndard

Les 11 referències de l'editor comparteixen un llenguatge de **gravat científic i atles contemporani** que s'allunya del tot dels gràfics de *dashboard* o d'Excel:

- **Res de barres rectangulars massisses quan hi ha una forma més orgànica:** si pots mostrar les observacions reals com a **núvol de punts translúcids** (`IBV.cloud`, estil *Fair and square?*), **cercles translúcids superposats** amb `mix-blend-mode: multiply` (*Major quakes*, *Incendios en Perú*), **corbes topogràfiques de densitat** (*Building strategy*) o **roses polars suaus** (`IBV.polarGrid`, *Typology demand* i *Parcs nacionals dels EUA*), tria sempre la forma orgànica.
- **Cercles translúcids, MAI anells concèntrics (decisió de l'editor, 19-11-2026):** a l'editor li encanten els **cercles plens translúcids** (`opacity 0,18–0,45`, `mix-blend-mode: multiply`, gradients radials suaus amb un puntet central) i **no li agraden gens els anells concèntrics tipus diana**. No facis servir anells concèntrics per marcar llocs o quantitats; fes servir cercles translúcids d'àrea proporcional (`d3.scaleSqrt`).
- **Prohibits els mapes inclinats pseudo-3D, els mapes de pics/agulles, els mapes de crestes abstractes i les lupes flotants que amaguen les dades (decisió de l'editor, 19-11-2026):** els mapes sempre van en projecció neta (plana Equal Earth/Mercator/cònica o globus ortogràfic real) amb costes recognoscibles i **tota la informació visible d'entrada** — mai inclinats, mai amb agulles verticals, mai amb crestes abstractes tipus *Joy Division*, ni amb una lupa circular que obliga a passar el ratolí per descobrir un mapa esvaït. Les quantitats puntuals sobre mapa es representen amb cercles translúcids `multiply` (IB-25) i els camps continus amb franges suaus i isolínies nítides sobre costes clares (IB-26, IB-34).
- **Partícules lentes i contemplatives (decisió de l'editor, 19-11-2026):** totes les partícules que es mouen (fluxos IB-40, boires de punts, arcs de flux, vents) han d'anar **molt a poc a poc** — recorregut complet en ~20–35 segons, moviment serè i hipnòtic, mai ràpid ni nerviós.
- **Ordenar el caos aparent:** quan hi ha centenars o milers de dades, deixa que els punts, les traces o els cercles revelin l'estructura per densitat (`opacity 0,05–0,38`, `mix-blend-mode: multiply`), en lloc d'amagar-los darrere mitjanes o caixes opaques.
- **Fils d'estructura ultra-fins:** retícules polars, cercles guia i línies base de `0,45–0,6 px`, sense graelles verticals feixugues que tallin les marques. Molt aire blanc al voltant.
- **Model de referència de l'editor — IB-28 («Camp de vent animat», 19-11-2026):** aquesta peça resumeix la gramàtica visual ideal de la revista:
  1. **Monocromia rica:** un sol to seqüencial (blau) modulat en intensitat, sense soroll de colors.
  2. **Doble o triple codificació natural:** la intensitat es nota alhora pel **to**, la **llargada del traç** i la **densitat** — s'entén en mig segon sense mirar la llegenda.
  3. **Geografia ultra-silenciosa:** terra plana en `#ECEBE8` sense vores dures, aigua en blanc de paper, gratícula gairebé invisible; el mapa s'identifica a l'instant però cedeix el 100 % del protagonisme al fenomen.
  4. **La forma és el fenomen:** milers de micro-traços direccionals deixen aparèixer l'estructura orgànica (espirals, corrents, fluxos) sense caixes ni símbols artificials; funciona tant animat (a poc a poc) com congelat.
  5. **Anotacions quirúrgiques de mecanisme:** només 2–3 anotacions breus (títol en negreta + 4–5 paraules que expliquen *com funciona*, no què es veu) amb colze ultra-fi en tinta.
  6. **Aplicable més enllà de la meteorologia:** reutilitza aquesta gramàtica per a rutes marítimes, migracions, difusió cultural o de llengües, comerç antic o fluxos econòmics.
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

**Només tres colors** (decisió de l'editor, 18-11-2026), sempre en aquest ordre (`IBV.CAT`). Validats per a daltonisme entre tots tres (ΔE ≥ 18).

| # | Nom | Hex | Significat habitual |
|---|---|---|---|
| 1 | `vermell` (= `warm`) | `#C8442A` | Calent, destacat, el protagonista, l'any actual |
| 2 | `blau` (= `cold`) | `#2C5DA8` | Fred, aigua, la comparació |
| 3 | `groc` | `#F5C518` | Llum, sol, sec, tercera categoria |

- **El groc té poc contrast sobre blanc (1,7:1): mai text en groc**, ni línies de menys de 2 px. Només superfícies, punts i línies gruixudes, i sempre amb etiqueta en tinta.
- **Prohibits:** ocre, verds, verd mar, violeta, qualsevol altre to. També les rampes en aquests colors.
- Més de tres categories: el secundari va en gris (`ink2`, `ghost`). Si encara en calen, els tons del mateix color: `vermellClar #E9A391`, `blauClar #9DB6DD`, `grocClar #FBE38E`, `vermellFosc #7A2312`, `blauFosc #173A70`, `grocFosc #E0A800` (`IBV.CAT6`), sempre amb etiqueta directa.
- Els noms antics `ocre`, `mar`, `violeta` i `verd` d'`IBV.C` són àlies d'aquests colors perquè el codi vell no es trenqui. No els facis servir.

Els articles anteriors fan servir `--dry #9A6326`, `--wet #16786C` i `--bio #4C8A2E`. Es queden en aquells articles; en els nous, no.

Rampes:

- **Divergent** `IBV.div(max)`: `#173A70 → blau → #9FB6DA → neutral → #E8AB98 → vermell → #7A2312`. Per a anomalies i qualsevol cosa amb un zero que tingui sentit. El centre sempre és gris.
- **Calor** `IBV.heat([min, max])`: gairebé blanc → groc → vermell → vermell fosc. Per a intensitats (foc, calor, densitat, risc).
- **Seqüencial** `IBV.seq(IBV.C.blau o IBV.C.vermell, [min, max])`: gairebé blanc → color → color fosc. Només en blau o vermell. Mai arc de Sant Martí.
- **Opacitat** `IBV.alpha(color, a)` per a núvols de punts i superposicions.

El text (valors, etiquetes, llegendes) va en tinta, no amb el color de la sèrie. Excepcions: el nom del protagonista (p. ex. «2026» en vermell) i les etiquetes d'isolínies.

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
| Peu: font i metodologia | Sans 400 | 12,5–13 px | muted |

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

Hi ha 54 peces, totes amb animació d'entrada (`IBV.onView`) i estat de hover (`IBV.focus` + tooltip). Cada peça té nom i número. Tria-les per la **pregunta** que ha de respondre el gràfic.

### Temps

| Núm. | Nom | Respon | Dades | Regles clau | Ve de |
|---|---|---|---|---|---|
| **IB-01** | Feix d'anys | «Com és aquest any respecte a tots els altres?» | Una sèrie per any amb 12 (o 365) valors | Context 1 px `ghost` 0,6; protagonista 2,2 px en color amb punt i etiqueta al final; com a màxim un segon destacat en tinta. | El Niño; «Seasonal Temperature Change» |
| **IB-02** | Índex de pulsacions | «Quan hi ha hagut episodis i de quina força?» | Una sèrie llarga amb signe | Barres ≤ 2 px; color només fora dels llindars; nom només als 5–7 extrems, sense solapar-se. | Índex d'El Niño |
| **IB-03** | Franja de distribució | «Què és normal en cada moment del cicle?» | Moltes observacions per mes/hora | Cel·les amb rampa seqüencial pel recompte; mediana en tinta; l'any actual en vermell; finestra amb màxim, mediana i mínim. | «Seasonal Temperature Change» |
| **IB-04** | Files de bombolles | «Quan arriba la temporada alta i quant dura?» | Recompte per setmana × anys o casos | Àrea proporcional; opacitat 0,4–0,5 sense vora; el màxim de cada fila en vermell; llegenda de mida. | Incendis al Perú; rèpliques de terratrèmols (Reuters) |
| **IB-05** | Espiral anual | «Com canvia un cicle anual al llarg de dècades?» | Valor mensual durant molts anys | Gener a dalt, sentit horari, inicials dels mesos; rampa seqüencial pel temps; últim any en vermell. | Parcs nacionals dels EUA |
| **IB-06** | Rosa horària | «En quines hores passa?» | 24 valors per a 2–3 sèries | Radi amb `scaleSqrt`; farciment 0,28 + contorn 1 px; mitjanit a dalt. | «Typology demand» |

### Quantitat i relació

| Núm. | Nom | Respon | Dades | Regles clau | Ve de |
|---|---|---|---|---|---|
| **IB-07** | Núvol amb protagonistes | «Quins casos se surten de la norma?» | Centenars o milers de punts x/y | Punts de 2 px a 0,2; protagonistes en cercle buit + nom en cursiva (màxim 6–8); log anunciat. | «The Worst Games Ever Made» (FiveThirtyEight) |
| **IB-08** | Pols de punts | «Quina forma té la distribució? Hi ha patrons estranys?» | 10.000–100.000 punts | Canvas; punts d'1 px a 0,04–0,09; un sol color; caixa discontínua + nota. | «Fair and square?» (The Economist) |
| **IB-09** | Mosaic hexagonal | «On és més alt un valor segons dues variables?» | Molts punts amb un valor | Hexàgons amb rampa divergent centrada a la mitjana; mínim 5 casos per hexàgon; zones amb línia puntejada i nom en cursiva. | «The sweet spot» (FiveThirtyEight) |
| **IB-10** | Escala amb llindar | «A partir de quin valor passa una cosa? On és cada lloc?» | Una variable, uns quants casos | Regla de color de 10 px; zona de llindar gris pàl·lid amb nom; marcadors amb triangle; fletxa corba per al canvi. | El Niño («L'aigua calenta fa ploure») |
| **IB-11** | Reixa d'unitats | «Quina part del total és cada cosa?» | Percentatges de ≤ 5 grups | 100 punts; colors en l'ordre de la paleta; vista junta i vista per grup amb transició. | «De què mor el món?» |

### Lloc

| Núm. | Nom | Respon | Dades | Regles clau | Ve de |
|---|---|---|---|---|---|
| **IB-12** | Camp de punts sobre mapa | «On és més calent/humit/dens?» | Camp continu lon/lat | Trama hexagonal de punts al mar; mida i color pel valor; el que és ≈ 0 no es dibuixa; terra `land`. | El Niño (mapa i portada) |
| **IB-13** | Trajectòries | «Per on es mouen?» | Recorreguts (lon/lat al llarg del temps) | Línies de 0,75 px a 0,3; un recorregut destacat en vermell amb inici i final; ortogràfica si és polar. | «Iceberg alley»; biodiversitat antàrtica |
| **IB-14** | Anells proporcionals | «Quants casos hi ha a cada lloc, i de quin tipus?» | Recompte per lloc i categoria | Un anell per cas (o 1 anell = N, dit a la llegenda); ≤ 3 categories; rutes en blanc gruixut a sota. | «A sea of sand and sickness» |
| **IB-15** | Isolínies sobre camp | «Com es combinen dues variables al territori?» | Dos camps continus | Camp en 6–8 franges seqüencials; isolínies d'1,4 px amb l'etiqueta girada sobre la línia; ciutats amb halo. | «Germany – average rainfall and temperature» |
| **IB-16** | Tall | «Com funciona per dins?» | Esquema | Capes amb la rampa del fenomen, sense contorns negres; fletxes fines; noms dins de cada capa; escala vertical exagerada declarada. | El Niño (tall de l'oceà) |

### Estructura

| Núm. | Nom | Respon | Dades | Regles clau | Ve de |
|---|---|---|---|---|---|
| **IB-17** | Esclat radial | «Quines parts té un tema i com es reparteixen?» | 30–100 elements amb categoria i valor | Radis 0,6 px; 2 categories; ≤ 5 etiquetes amb línia puntejada fins al marge. | «Technology / Ecology» |
| **IB-18** | Arcs d'enllaç | «Què connecta amb què?» | Dues llistes i parells | Bézier horitzontals d'1 px a 0,55; nodes buits; en passar-hi, la resta a 0,08. | Senezh; músics de rock (La Lettura) |
| **IB-19** | Topografia de densitat | «On s'agrupen i com es toquen els grups?» | Punts x/y | `d3.contourDensity`, 20–30 nivells de 0,7 px, rampa a la línia, la corba exterior més gruixuda. | «Building strategy»; Senezh |
| **IB-20** | Petits múltiples | «Com canvia el mateix patró entre llocs o èpoques?» | Qualsevol peça repetida | Mateixa escala a tots, escrita només al primer; títol serif 16 px; 4 per fila (2 a mòbil). | Parcs nacionals; seqüències de procés |

### Mapes (IB-21 a IB-34)

| Núm. | Nom | Què fa | Dades al mostrari | Regles clau | Codi |
|---|---|---|---|---|---|
| **IB-21** | Mosaic de quadrats | Cada país és un quadrat igual en una reixa que recorda la geografia. | Dades reals | Quadrats iguals, 3 px de separació, codi de dues lletres a dins; Rampa divergent si hi ha un zero amb sentit; si no, seqüencial; El rànquing comparteix colors i ordre de lectura amb el mapa | `sistema/mapes-a.js` |
| **IB-22** | Cartograma de cercles | Del mapa als cercles: cada país es converteix en un cercle d'àrea proporcional al valor i una simulació de forces els separa sense allunyar-los gaire del seu lloc. | Dades reals | Àrea del cercle proporcional al valor; clau de mida dins del gràfic; Els cercles surten del seu país i hi tornen; Etiqueta només els cercles que caben; la resta, al tooltip | `sistema/mapes-a.js` |
| **IB-23** | Densitat de punts | Un punt per cada N unitats, escampats només dins de la frontera de cada regió i on és més probable que hi siguin (mètode dasimètric). | Dades d'exemple generades | Un sol color, punts d'1–1,5 px, opacitat alta; «1 punt = …» a la llegenda; la mateixa N a totes les amplades; Projecció d'àrees iguals | `sistema/mapes-a.js` |
| **IB-24** | Arcs de flux | Orígens i destinacions units per arcs que segueixen el cercle màxim, amb partícules que hi circulen en el sentit del flux. | Dades d'exemple generades | Arcs de cercle màxim amb una petita separació per a cada sentit; Gruix de 0,6 a 5 px; partícules més ràpides que llegibles, mai al revés; Sortides en vermell, arribades en blau quan se'n destaca una | `sistema/mapes-a.js` |
| **IB-25** | Mapa de cercles translúcids | Projecció plana neta (Equal Earth) amb cercles translúcids `multiply` d'àrea proporcional i puntet central (sense inclinació 3D ni agulles). | Dades reals | Projecció plana neta; cercles amb gradient radial i `multiply` (`d3.scaleSqrt`); etiqueta els 3–5 extrems amb fletxes corbes | `sistema/mapes-a.js` |
| **IB-26** | Mapa de franges i isolínies | Projecció plana neta (Equal Earth) amb bandes suaus d'anomalia, costes nítides i isolínies etiquetades (estil *Germany — rainfall and temperature*). | Dades reals | Bandes esglaonades translúcides + isolínies fines en vermell/blau (zero discontinu); costes sempre recognoscibles; sense crestes abstractes | `sistema/mapes-a.js` |
| **IB-27** | Globus que gira | El planeta en projecció ortogràfica, que gira sol com la Terra i es pot arrossegar amb el ratolí o el dit. | Dades reals | Gir lent (un tomb cada 40 s); s'atura en passar-hi, en arrossegar i amb prefers-reduced-motion; Gratícula de 15° en gris finíssim, costa en tinta clara; Arrossegar en horitzontal a mòbil, perquè la pàgina continuï fent scroll | `sistema/mapes-a.js` |
| **IB-28** | Camp de vent animat | Milers de partícules que es deixen portar pel vent i deixen una estela que s'esvaeix. | Simulació | Canvas, 1.500–4.000 partícules d'1 px amb estela de 10–14 punts; Un sol to (rampa seqüencial blava) per a la velocitat; En passar-hi, les partícules baixen a 0,3 i surt la línia de corrent en tinta; Botó per aturar el moviment; amb moviment reduït, estela fixa | `sistema/mapes-b.js` |
| **IB-29** | Mapa bivariant | Dues variables al mateix mapa amb una reixa de 3 × 3 colors: vermell per a una, blau per a l'altra, gris on totes dues són baixes i fosc on totes dues són altes. | Dades reals | Reixa 3 × 3 entre el vermell i el blau sobre gris; les cantonades són els colors purs; Talls per terços, escrits a la llegenda; Llegenda girada 45° amb el nom dels dos eixos i el sentit; Hover recíproc: cel·la → països, país → cel·la | `sistema/mapes-b.js` |
| **IB-30** | Distància des d'un punt | Projecció azimutal equidistant: totes les distàncies des del centre són reals i qualsevol recta que en surt és el camí més curt. | Geometria real | Anells puntejats cada 2.000 km; el de 10.000, més fosc; Rectes des del centre en vermell fi; la ressaltada, de 2 px; Etiquetes radials, sense solapar-se; a mòbil, menys; Recentrar amb una transició de 1,3 s pel cercle màxim | `sistema/mapes-b.js` |
| **IB-31** | Abans i després | Dos estats del mateix mapa, l'un sobre l'altre, separats per un divisor que s'arrossega amb el ratolí, amb el dit o amb les fletxes del teclat. | Dades reals | Els dos mapes, idèntics en projecció i escala; Etiquetes dels dos estats (abans / després, o els dos mesos) enganxades al divisor; El divisor és un control: ratolí, dit i teclat, amb aria-valuetext; Entrada: el divisor escombra fins al mig | `sistema/mapes-b.js` |
| **IB-32** | Mapa en franja | Un recorregut desplegat en línia recta: el mapa es gira perquè el camí quedi horitzontal, amb els llocs al llarg, els països que travessa i una variable a sota. | Dades reals | El recorregut, recte i en vermell; el mapa es gira, no es deforma el camí; Vores de la franja que s'esvaeixen, sense marc; Variable a sota amb la mateixa escala horitzontal; línia guia comuna; Mini mapa de situació sempre visible | `sistema/mapes-b.js` |
| **IB-33** | Hexàgons en el temps | La terra coberta d'hexàgons iguals que canvien de color mes a mes amb un lliscant o amb «Reprodueix». | Simulació | Hexàgons iguals, separats 1 px; només sobre terra; Rampa divergent amb el zero en gris; la línia del zero, en tinta; El mes, gran i en serif dins del mapa; Lliscant amb aria-valuetext i botó que s'atura | `sistema/mapes-b.js` |
| **IB-34** | Mapa d'isotermes marí | Camp complet de temperatura de la superfície del mar amb franges litogràfiques translúcides, isotermes fines cada 2 °C i principals cada 5 °C, i terra silenciosa a sobre (sense lupa que amagui el mapa). | Dades reals | Tota la dada visible d'entrada; franges suaus blau↔vermell + isotermes fines (2 °C) i etiquetades (5 °C); 3 anotacions de mecanisme; en passar-hi, ressalta la isoterma del punt | `sistema/mapes-b.js` |

### Formes inesperades (IB-35 a IB-54)

| Núm. | Nom | Què fa | Dades al mostrari | Regles clau | Codi |
|---|---|---|---|---|---|
| **IB-35** | Escala comparativa | Tots els ordres de magnitud visibles alhora en una cinta logarítmica amb referències concretes (cercles translúcids) i arcs que comparen la raó exacta entre dues mides qualsevol. | Dades reals | Tota l'escala visible d'un cop (mai cercles concèntrics buits amb zoom); cercles translúcids `multiply` per domini; clic fixa l'àncora i hover dibuixa l'arc de proporció exacta (`×N` / `÷N`) | `sistema/creatives-a.js` |
| **IB-36** | Màquina de Galton | Mil boles cauen per una reixa de claus i, a cada clau, reboten a la dreta o a l'esquerra. | Simulació | Simulació en canvas; la teoria, una línia en tinta per sobre; El comptador diu quantes boles han caigut; Amb moviment reduït, el resultat final directe | `sistema/creatives-a.js` |
| **IB-37** | Calendari de calor | Cada dia és un quadrat en una reixa de setmanes per dies de la setmana, i el color en dona el valor. | Dades d'exemple generades | Rampa de calor (groc → vermell) per a intensitats; el zero, gairebé blanc; Vora fina per als mesos; setmana que comença en dilluns; A mòbil, els anys en columnes i les setmanes cap avall | `sistema/creatives-a.js` |
| **IB-38** | Crestes | Una distribució per fila, apilades i encavalcades com una serralada. | Dades reals | Mateixa escala de densitat a totes les files; Color per valor (la rampa de la història), contorn en tinta; Entre 5 i 15 files; la mediana marcada | `sistema/creatives-a.js` |
| **IB-39** | Eixam de forces | Centenars de punts, un per cas, que s'empenyen sense trepitjar-se. | Dades reals | Entre 200 i 2.000 punts, sense vora; Etiqueta de grup amb el recompte o el percentatge; En passar per un punt, s'il·luminen els del mateix grup (aquí, el mateix any) | `sistema/creatives-a.js` |
| **IB-40** | Flux amb partícules | Un diagrama de flux d'on surt una quantitat, per on passa i on acaba. | Dades reals | Columnes que sumen el mateix; amplada proporcional al volum; Color per a la destinació que explica la història; el camí d'origen, en gris; Partícules de 2 px, ni massa ni massa ràpides; s'aturen amb moviment reduït | `sistema/creatives-a.js` |
| **IB-41** | Bombolles niades | Cercles dins de cercles: el total, els grans grups i cada cas, amb l'àrea proporcional al valor. | Dades reals | Àrea proporcional; el grup només amb la vora; Noms només si hi caben; la resta, al tooltip o fent zoom; Un color per grup, en l'ordre de la paleta | `sistema/creatives-a.js` |
| **IB-42** | Pendents | Dos moments, dues columnes i una línia per cas: el pendent diu si puja o baixa i quant. | Dades reals | Vermell si puja, blau si baixa, gris si gairebé no canvia; Etiquetes a les dues bandes, separades amb una guia fina; Escala logarítmica anunciada si els valors són molt diferents | `sistema/creatives-a.js` |
| **IB-43** | Quadrats d'escala | Quadrats niats a la mateixa cantonada, amb l'àrea proporcional a la quantitat, que creixen un darrere l'altre des del més petit. | Dades reals | Àrea proporcional, mai el costat; Tots a la mateixa cantonada, del més gran al més petit; El protagonista diminut amb color i anotació | `sistema/creatives-a.js` |
| **IB-44** | Horitzó | Moltes sèries llargues en files molt primes. | Dades reals | Dues o tres bandes de la rampa divergent, de la mateixa amplada; Files de 30–40 px, amb el mateix eix x; La línia de hover dona tots els valors alhora | `sistema/creatives-a.js` |
| **IB-45** | Flors de dades | Cada cas és una flor i cada pètal, una variable: com més llarg, més valor; el color en diu el tipus. | Dades d'exemple generades | Llargada del pètal amb d3.scaleSqrt (l'àrea mana); Màxim tres tipus de color; pètals a 0,5 amb contorn de 0,8 px (el groc, a 0,7 i sense contorn); Cercle discontinu = 100; clau de la flor a la llegenda | `sistema/creatives-b.js` |
| **IB-46** | Corda | Els elements, en un cercle; les cintes que els uneixen, el que va de l'un a l'altre. | Dades d'exemple generades | Cintes a 0,4 amb el color de qui n'envia més; Marques fines a l'arc cada 20 unitats; En passar-hi, la resta de cintes a 0,05 | `sistema/creatives-b.js` |
| **IB-47** | Corrent apilat | Diverses sèries apilades com un riu que s'eixampla i s'estreny. | Dades d'exemple generades | Màxim cinc capes, amb etiqueta dins de la capa quan hi cap; Corbes suaus (curveBasis) i separació blanca de 0,7 px; En la vista centrada, barra d'escala en lloc d'eix | `sistema/creatives-b.js` |
| **IB-48** | Un dia en un minut | Un rellotge de 24 hores on l'agulla fa la volta en un minut. | Dades d'exemple generades | Mitjanit a dalt, sentit horari; un anell per categoria (màxim tres); Cada esdeveniment nou fa una ona que s'apaga; Amb moviment reduït, el dia sencer de cop | `sistema/creatives-b.js` |
| **IB-49** | Temps profund | Del Big Bang a avui en una sola línia. | Dades reals | L'escala logarítmica s'anuncia a l'eix; Etiquetes en carrils que no se solapen; les que no hi caben, només punt; Dates aproximades amb ≈ i interval al tooltip | `sistema/creatives-b.js` |
| **IB-50** | Coordenades paral·leles | Cada cas és una línia que travessa tants eixos com variables té. | Dades d'exemple generades | Línies de 0,75 px a 0,25; les filtrades, en gris; Corbes suaus entre eixos; mínim, mig i màxim a cada eix; En passar per sobre, la línia en tinta amb els valors | `sistema/creatives-b.js` |
| **IB-51** | Barra que es trenca | Un total que sembla una sola cosa es trenca en les unitats que el formen, i les unitats volen a agrupar-se. | Dades d'exemple generades | A la barra sencera, un sol color i cap separació; Cada unitat vola en arc, amb un petit retard per columna; Màxim cinc grups, en l'ordre de la paleta | `sistema/creatives-b.js` |
| **IB-52** | Mentre llegeixes | Comptadors que comencen quan la peça apareix i pugen al ritme real de cada fenomen. | Taxes d'exemple | Només corre quan la peça és a la pantalla; Cada punt nou s'encén i fa una ona; Taxa escrita a cada fila, amb la font al peu | `sistema/creatives-b.js` |
| **IB-53** | Anell de l'any | L'any al voltant d'un cercle, un sector per mes, i a cada sector una barra fina per any que neix d'un anell interior. | Dades reals | Gener a dalt, sentit horari, mesos a fora; Anell interior = zero, en tinta; barres amb la rampa divergent; En passar-hi, l'any sencer ressaltat i l'etiqueta al centre | `sistema/creatives-b.js` |
| **IB-54** | Bombolles en moviment | Una dispersió que es mou amb el temps: cada bombolla és un lloc, la mida és la població i l'any passa gran i pàl·lid al fons. | Dades d'exemple generades | Àrea proporcional; bombolles a 0,55 amb contorn fosc; L'any en serif gran, en el gris de la quadrícula; Estela amb un punt per any i l'any cada dècada | `sistema/creatives-b.js` |

### Combinar peces amb el scroll

Les peces funcionen dins d'una secció `.scrolly` (el gràfic enganxat i els passos al costat). Cada pas pot afegir una capa, fer zoom o canviar l'estat: IB-12 + IB-16 a sota és la combinació d'El Niño; IB-01 pot destacar un any diferent a cada pas; IB-11 pot reagrupar els punts.

---

## 6. Abans de publicar un gràfic

- [ ] No pinta cap fons, panell ni ombra (P1).
- [ ] El protagonista és clar en dos segons; la resta, gris (P2).
- [ ] Té capçalera (C-01) i llegenda si hi ha ≥ 2 sèries o una rampa.
- [ ] Les idees clau estan anotades dins del gràfic (P4).
- [ ] Unitat al valor de dalt, zero marcat, escales no truncades sense avís (P5).
- [ ] Cap text per sota d'11 px; cap etiqueta tallada o solapada a 1440 i a 390 px.
- [ ] Peu amb «Dades reals» + font i any, «Simulació» o «Esquema» (P9).
- [ ] `role="img"` i `aria-label` amb el que diu el gràfic, no només què és.
- [ ] Tooltip amb ratolí i amb un toc (`IBV.hover`); lliscants amb `aria-valuetext`.
- [ ] `IBV.reduced`: sense animacions contínues, estat final directe.
- [ ] Zero errors a la consola i cap scroll horitzontal.

## 7. Referències

Imatges que l'editor va donar com a model (18-11-2026): «Seasonal Temperature Change»; «The sweet spot» i «The Worst Games Ever Made» (FiveThirtyEight); parcs nacionals dels EUA (visitants per mes); «Technology / Ecology»; «Building strategy» (punts atractors); «Public / private typology demand»; Senezh («Concept diagram of the masterplan»); músics de rock (La Lettura); «Fair and square?» (The Economist); «Major quakes and their aftershocks» (Reuters); «Incendios en Perú 2012–2024» (Enrique Mendoza Tincopa); «Walking to Starbucks in Manhattan»; «Iceberg alley»; «Germany – average rainfall and temperature»; mapa de biodiversitat antàrtica; «A sea of sand and sickness» (Amy Powell, Creu Roja britànica). No se'n copia cap dibuix ni dada: se n'agafen principis i formes.
