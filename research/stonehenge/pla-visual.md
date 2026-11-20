# Pla visual: Per què van aixecar Stonehenge? (`web/articles/stonehenge/`)

Refeta sencera el 19-11-2026 a petició de l'editor: «molt més estètic, wow i visual, amb recreació de Stonehenge en línia fina neta».

Guia de disseny: `research/sistema-infografic.md`. Paleta estricta (vermell `#C8442A`, blau `#2C5DA8`, groc `#F5C518`, grisos), mai text en groc, cap fons pintat, hover suau (`IBV.focus`, 0,5) i lectura dock d'una línia (`IBV.tip`).

## Peça nova proposada: «Maqueta de línia» (recreació 3D en gravat)

Cap peça del sistema dibuixa un monument en perspectiva. La més propera és **IB-16** (tall/esquema que explica com funciona per dins). La maqueta n'és l'extensió a tres dimensions: un motor propi molt petit (`sh3d.js`, canvas 2D, sense llibreries noves) que projecta en perspectiva prop de 200 blocs a escala real i els dibuixa com un gravat científic:

- Cares en blanc de paper (només per tapar el que queda darrere) i arestes en tinta de 0,7 px; ombrejat amb **ratllat fi** (línies de 0,5 px a 0,3) a les cares que no miren a la llum del NO, com el relleu IB-59.
- Terra sense pintar: el fossat, el talús, els forats i l'Avinguda són fils grisos sobre el paper.
- Color només per a la història: vermell per a l'element apuntat, groc per al Sol i el passadís de llum, blau per a la Lluna.
- Es pot girar arrossegant (ratolí i dit en horitzontal, perquè la pàgina continuï fent scroll), gira sol molt a poc a poc (una volta cada ~120 s) i s'atura amb `prefers-reduced-motion`.
- Una persona d'1,7 m dibuixada en línia dona l'escala.
- Peu: «Reconstrucció esquemàtica a escala amb les dimensions d'English Heritage; les posicions de les pedres blaves i dels forats són aproximades».

Si agrada a l'editor, s'afegeix al sistema com a peça nova.

## Inventari

- **V1 · Maqueta de línia (IB-16 en 3D, peça nova):** obertura de l'article. Stonehenge cap al 2200 aC (~160 pedres, l'estat de la maqueta acústica de Cox et al. 2020), girable, amb hover per pedra (sarsen, trílit, pedra blava, Altar, Taló, Station Stones). Tres vistes: «Des de l'Avinguda», «Des de dalt», «A ran de terra». *Per què:* el lector ha de poder «caminar» pel monument abans de llegir-ne res.

- **V2 · Paisatge doble (IB-59 + IB-13):** mapa físic local (10 × 8 km, relleu `relleu-local.js` generat amb `scripts/relleu.mjs`, cel·les de 0,0008° ≈ 90 m, isolínies cada 10 m perquè el relleu de la plana de Salisbury només va de 59 a 147 m). Durrington Walls i Woodhenge (fusta, vius), el riu Avon (traçat pel fons de la vall del mateix relleu), l'Avinguda i Stonehenge (pedra, avantpassats). Botó «Fes la processó»: un punt recorre a poc a poc el camí del solstici d'hivern. *Dades:* coordenades reals dels jaciments; traçat de l'Avinguda aproximat (dit al peu).

- **V3 · Scrolly «Un mapa de pedra de tota una illa» (IB-59 + IB-13 + IB-25):** mapa físic de Gran Bretanya (relleu `relleu.js`), trajectòries de cercle màxim de cada pedra amb partícules molt lentes (~25 s) i cercles translúcids d'àrea proporcional a la distància. 5 passos: sarsens, pedres blaves, Altar, morts i porcs, illa sencera. *Dades reals* (Nash 2020, Parker Pearson 2019/2021, Clarke 2024, Pirrie 2026, Snoeck 2018, Madgwick 2019).

- **V4 · Quanta gent cal per moure una pedra (IB-11 amb figures de línia, interactiu):** un trineu sobre carrils amb la pedra triada (pedra blava, Altar, sarsen, Gran Trílit) i tantes figures de línia com persones caldrien segons el ritme mesurat a l'experiment d'UCL (2016), comparat amb Sumba. *Dades reals* de l'experiment; l'escala lineal és una extrapolació, dit al peu.

- **V5 · Scrolly «Com s'alça un trílit» (IB-16):** alçat lateral en gravat, 5 passos (fossa amb rampa, palanca, cordes, plataforma de troncs per a la llinda, encaixos de caixa i metxa i encadellat). *Esquema* d'una hipòtesi (English Heritage), dit al peu.

- **V6 · Scrolly «Cinc monuments apilats» (V1 + IB-49):** la mateixa maqueta de línia es construeix fase a fase (les pedres surten de terra, les llindes baixen) mentre la càmera gira; a sota, una línia de temps amb els intervals bayesians al 95 % de Darvill et al. (2012). *Dades reals* (cronologia) + reconstrucció esquemàtica.

- **V7 · El cel dins la pedra (V1 en primera persona + IB-05):** la maqueta vista a ulls d'una persona de peu, amb el Sol o la Lluna que surten o es ponen a l'azimut calculat per al dia triat (lliscant) i l'època (2500 aC / avui); passadís de llum groc sobre el terra. Al costat, un horitzó de 360° amb la franja anual de sortides i postes. *Model astronòmic exacte* (fórmules d'astronomia esfèrica, φ = 51,1789° N).

- **V8 · Una cambra de ressonància (IB-28 aplicada al so):** planta de les pedres amb centenars de raigs de so que reboten a poc a poc des d'una veu al centre; commutador «amb pedres / camp obert». Les xifres mesurades (0,64 s, +4,3 dB) a la capçalera. *Simulació geomètrica 2D* (esquema), no reprodueix la mesura de Cox et al. (2020), dit al peu.

- **V9 · Qui hi havia (IB-11 + IB-53):** tres vistes: 25 cremats analitzats (10 forans, punts sobre el cercle dels forats Aubrey), el reemplaçament genètic del ~90 % (reixa de 100 unitats que es reordena) i l'any dels porcs en cercle (temps cíclic, P7: naixements de primavera, sacrificis a ~9 mesos al voltant del solstici d'hivern; *síntesi* de Wright et al. 2014, dit al peu).

- **V10 · Plantes a la mateixa escala (IB-20):** petits múltiples en línia fina de Stonehenge, Waun Mawn, Anell de Brodgar, Avebury, Durrington Walls, Newgrange i Göbekli Tepe (recinte D), tots a la mateixa escala en metres. *Dades reals* (dimensions publicades); siluetes simplificades.

- **V11 · Dotze mil anys movent pedres (IB-49 lineal + IB-25):** línia de temps de megalitismes del món, amb Stonehenge en vermell; vista alternativa en mapa del món (terra plana, sense relleu: mapa del món sencer).

- **V12 · Cada segle s'inventa el seu Stonehenge (IB-38):** filera cronològica 1136–2026 d'interpretacions (Merlí, temple romà, druides, ordinador, avantpassats) i d'intervencions (restauracions, Beanfield, UNESCO), amb hover. *Dades reals* (English Heritage, fonts històriques).

## Segona passada (20-11-2026): gràfics 2D més rics

L'editor va trobar massa simples els gràfics plans. Cada un viu ara en un fitxer propi (`fig-*.js`):

- **V4 (`fig-moure.js`):** escena en perspectiva amb el trineu, el camí de cada experiment (troncs fixos a UCL, carril greixat a la BBC), cordes en ventall i colles a escala; a sota, comparació de les quatre pedres amb els dos ritmes.
- **V5 (`fig-trilit.js`):** gravat en canvas amb el tall de la creta (terra vegetal, bandes de sílex il·lustratives), pedres picades com a la maqueta, fusta amb veta i anells, cordes de fibra i una colla fent la feina de cada pas (cavar amb pics de banya, contrapès, estirar, picar el rebliment, palanques a la torre). Al pas 5, dues lupes amb la metxa i caixa i l'encadellat.
- **V8 (`fig-so.js`):** planta de pedres amb volum, raigs blaus (directes) i vermells (retornats), i al costat les corbes de caiguda dibuixades amb els temps de reverberació mesurats i les barres de +4,3 dB.
- **V9 (`fig-gent.js`):** planta de la fase 1 amb els 56 forats Aubrey i els dipòsits, el forat 7 amb 27 figures, 25 analitzades amb 10 de lluny, el canvi d'ascendència en 100 figures i una espiral de dos anys per als porcs.
- **V10 (`fig-escala.js`):** plantes reals en línia fina a la mateixa escala, posades dins de Durrington Walls, amb una lupa ×7 del cercle de sarsens i de Göbekli D.
- **V11 (`fig-mon.js`):** cronologia amb una icona de línia per a cada tradició, la pedra més gran de cada lloc i els dos intervals (Göbekli → Stonehenge, Stonehenge → avui).
- **V12 (`fig-mirall.js`):** sis vinyetes d'interpretació sobre l'eix trencat i, a sota, set carrils amb l'estat físic de les pedres (caigudes i redreçaments); en vertical al mòbil.
