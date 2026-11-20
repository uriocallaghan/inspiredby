# Pla visual: Per què van aixecar Stonehenge? (`web/articles/stonehenge/`)

Refeta sencera el 19-11-2026 a petició de l'editor: «molt més estètic, wow i visual, amb recreació de Stonehenge en línia fina neta».

Guia de disseny: `research/sistema-infografic.md`. Paleta estricta (vermell `#C8442A`, blau `#2C5DA8`, groc `#F5C518`, grisos), mai text en groc, cap fons pintat, hover suau (`IBV.focus`, 0,5) i lectura dock d'una línia (`IBV.tip`).

## Peça nova proposada: «Maqueta de línia» (recreació 3D en gravat)

Cap peça del sistema dibuixa un monument en perspectiva. La més propera és **HOW-01** (tall/esquema que explica com funciona per dins). La maqueta n'és l'extensió a tres dimensions: un motor propi molt petit (`sh3d.js`, canvas 2D, sense llibreries noves) que projecta en perspectiva prop de 200 blocs a escala real i els dibuixa com un gravat científic:

- Cares en blanc de paper (només per tapar el que queda darrere) i arestes en tinta de 0,7 px; ombrejat amb **ratllat fi** (línies de 0,5 px a 0,3) a les cares que no miren a la llum del NO, com el relleu MAP-01.
- Terra sense pintar: el fossat, el talús, els forats i l'Avinguda són fils grisos sobre el paper.
- Color només per a la història: vermell per a l'element apuntat, groc per al Sol i el passadís de llum, blau per a la Lluna.
- Es pot girar arrossegant (ratolí i dit en horitzontal, perquè la pàgina continuï fent scroll), gira sol molt a poc a poc (una volta cada ~120 s) i s'atura amb `prefers-reduced-motion`.
- Una persona d'1,7 m dibuixada en línia dona l'escala.
- Peu: «Reconstrucció esquemàtica a escala amb les dimensions d'English Heritage; les posicions de les pedres blaves i dels forats són aproximades».

L'editor la va aprovar el 20-11-2026: ara és **HOW-03 · Line model / Maqueta de línia** del sistema, i les altres peces noves d'aquest article també hi són (HOW-02, HOW-04, SCALE-05, SCALE-06, TIME-13, TIME-14).

## Inventari

- **V1 · Maqueta de línia (HOW-03):** obertura de l'article. Stonehenge cap al 2200 aC (~160 pedres, l'estat de la maqueta acústica de Cox et al. 2020), girable, amb hover per pedra (sarsen, trílit, pedra blava, Altar, Taló, Station Stones). Tres vistes: «Des de l'Avinguda», «Des de dalt», «A ran de terra». *Per què:* el lector ha de poder «caminar» pel monument abans de llegir-ne res.

- **V2 · Paisatge doble (MAP-01 + MAP-11):** mapa físic local (10 × 8 km, relleu `relleu-local.js` generat amb `scripts/relleu.mjs`, cel·les de 0,0008° ≈ 90 m, isolínies cada 10 m perquè el relleu de la plana de Salisbury només va de 59 a 147 m). Durrington Walls i Woodhenge (fusta, vius), el riu Avon (traçat pel fons de la vall del mateix relleu), l'Avinguda i Stonehenge (pedra, avantpassats). Botó «Fes la processó»: un punt recorre a poc a poc el camí del solstici d'hivern. *Dades:* coordenades reals dels jaciments; traçat de l'Avinguda aproximat (dit al peu).

- **V3 · Scrolly «Un mapa de pedra de tota una illa» (MAP-01 + MAP-11 + MAP-03):** mapa físic de Gran Bretanya (relleu `relleu.js`), trajectòries de cercle màxim de cada pedra amb partícules molt lentes (~25 s) i cercles translúcids d'àrea proporcional a la distància. 5 passos: sarsens, pedres blaves, Altar, morts i porcs, illa sencera. *Dades reals* (Nash 2020, Parker Pearson 2019/2021, Clarke 2024, Pirrie 2026, Snoeck 2018, Madgwick 2019).

- **V4 · Quanta gent cal per moure una pedra (SCALE-06 + CASE-02):** un trineu sobre carrils amb la pedra triada (pedra blava, Altar, sarsen, Gran Trílit) i tantes figures de línia com persones caldrien segons el ritme mesurat a l'experiment d'UCL (2016), comparat amb Sumba. *Dades reals* de l'experiment; l'escala lineal és una extrapolació, dit al peu.

- **V5 · Scrolly «Com s'alça un trílit» (HOW-02):** alçat lateral en gravat, 5 passos (fossa amb rampa, palanca, cordes, plataforma de troncs per a la llinda, encaixos de caixa i metxa i encadellat). *Esquema* d'una hipòtesi (English Heritage), dit al peu.

- **V6 · Scrolly «Cinc monuments apilats» (V1 + TIME-15):** la mateixa maqueta de línia es construeix fase a fase (les pedres surten de terra, les llindes baixen) mentre la càmera gira; a sota, una línia de temps amb els intervals bayesians al 95 % de Darvill et al. (2012). *Dades reals* (cronologia) + reconstrucció esquemàtica.

- **V7 · El cel dins la pedra (V1 en primera persona + TIME-09):** la maqueta vista a ulls d'una persona de peu, amb el Sol o la Lluna que surten o es ponen a l'azimut calculat per al dia triat (lliscant) i l'època (2500 aC / avui); passadís de llum groc sobre el terra. Al costat, un horitzó de 360° amb la franja anual de sortides i postes. *Model astronòmic exacte* (fórmules d'astronomia esfèrica, φ = 51,1789° N).

- **V8 · Una cambra de ressonància (HOW-04):** planta de les pedres amb centenars de raigs de so que reboten a poc a poc des d'una veu al centre; commutador «amb pedres / camp obert». Les xifres mesurades (0,64 s, +4,3 dB) a la capçalera. *Simulació geomètrica 2D* (esquema), no reprodueix la mesura de Cox et al. (2020), dit al peu.

- **V9 · Qui hi havia (PART-01 + TIME-10):** tres vistes: 25 cremats analitzats (10 forans, punts sobre el cercle dels forats Aubrey), el reemplaçament genètic del ~90 % (reixa de 100 unitats que es reordena) i l'any dels porcs en cercle (temps cíclic, P7: naixements de primavera, sacrificis a ~9 mesos al voltant del solstici d'hivern; *síntesi* de Wright et al. 2014, dit al peu).

- **V10 · Plantes a la mateixa escala (SCALE-05):** petits múltiples en línia fina de Stonehenge, Waun Mawn, Anell de Brodgar, Avebury, Durrington Walls, Newgrange i Göbekli Tepe (recinte D), tots a la mateixa escala en metres. *Dades reals* (dimensions publicades); siluetes simplificades.

- **V11 · Dotze mil anys movent pedres (TIME-13 + MAP-03):** línia de temps de megalitismes del món, amb Stonehenge en vermell; vista alternativa en mapa del món (terra plana, sense relleu: mapa del món sencer).

- **V12 · Cada segle s'inventa el seu Stonehenge (TIME-14):** filera cronològica 1136–2026 d'interpretacions (Merlí, temple romà, druides, ordinador, avantpassats) i d'intervencions (restauracions, Beanfield, UNESCO), amb hover. *Dades reals* (English Heritage, fonts històriques).

## Segona passada (20-11-2026): gràfics 2D més rics

L'editor va trobar massa simples els gràfics plans. Cada un viu ara en un fitxer propi (`fig-*.js`):

- **V4 (`fig-moure.js`):** escena en perspectiva amb el trineu, el camí de cada experiment (troncs fixos a UCL, carril greixat a la BBC), cordes en ventall i colles a escala; a sota, comparació de les quatre pedres amb els dos ritmes.
- **V5 (`fig-trilit.js`):** gravat en canvas amb el tall de la creta (terra vegetal, bandes de sílex il·lustratives), pedres picades com a la maqueta, fusta amb veta i anells, cordes de fibra i una colla fent la feina de cada pas (cavar amb pics de banya, contrapès, estirar, picar el rebliment, palanques a la torre). Al pas 5, dues lupes amb la metxa i caixa i l'encadellat.
- **V8 (`fig-so.js`):** planta de pedres amb volum, raigs blaus (directes) i vermells (retornats), i al costat les corbes de caiguda dibuixades amb els temps de reverberació mesurats i les barres de +4,3 dB.
- **V9 (`fig-gent.js`):** planta de la fase 1 amb els 56 forats Aubrey i els dipòsits, el forat 7 amb 27 figures, 25 analitzades amb 10 de lluny, el canvi d'ascendència en 100 figures i una espiral de dos anys per als porcs.
- **V10 (`fig-escala.js`):** plantes reals en línia fina a la mateixa escala, posades dins de Durrington Walls, amb una lupa ×7 del cercle de sarsens i de Göbekli D.
- **V11 (`fig-mon.js`):** cronologia amb una icona de línia per a cada tradició, la pedra més gran de cada lloc i els dos intervals (Göbekli → Stonehenge, Stonehenge → avui).
- **V12 (`fig-mirall.js`):** sis vinyetes d'interpretació sobre l'eix trencat i, a sota, set carrils amb l'estat físic de les pedres (caigudes i redreçaments); en vertical al mòbil.

## Tercera passada (20-11-2026): realisme i mòbil

- **V4 (`fig-moure.js`):** cordes de fibra que passen per les mans de cada persona amb una mica de panxa entre mans, punta sobrant arrugada a terra i, mentre la gent apareix, la corda encara estesa a terra. Les persones ja no fan el pas animat (semblava que caminessin sense avançar): són quietes, fent força. El terra tampoc no llisca.
- **V1 / V6 (`sh3d.js`):** el fossat i el talús ja no són cercles perfectes (ondulació lenta i festó dels segments de cavar, caps arrodonits a les entrades); les hachures de pendent són irregulars i ja no semblen una escala graduada. L'Avinguda neix tocant la vora de fora del fossat, s'obre de mica en mica, serpenteja uns metres i, passats uns 470 m, gira cap a l'est com el traçat real cap a l'Avon. Les cordes de la colla de la maqueta fan panxa. Ningú camina al lloc (només es mouen les eines de picar i cavar).
- **V5 (`fig-trilit.js`):** les colles que estiren i el portador són quiets.
- **V7 (`article-b.js`):** amb «Avui», la maqueta mostra Stonehenge com és ara (`SH3D.todayModel`): 17 dels 30 pilars i 6 de les 30 llindes del cercle, 11 pedres blaves dretes al cercle i 6 a la ferradura (Historic England 1010140). La tria de quines pedres concretes cauen és aproximada (dit al peu). Té sentit perquè l'alineació del solstici encara funciona avui (l'azimut només es mou uns 3° per l'obliqüitat) i el lector compara el monument sencer amb la ruïna.
- **V10 (`fig-escala.js`):** al mòbil, les plantes de dins de Durrington Walls s'han recol·locat perquè els noms no toquin cap anell (Brodgar i Waun Mawn amb el nom a dins, Göbekli D al costat) i «cap a l'Avon» va al marge dret.
