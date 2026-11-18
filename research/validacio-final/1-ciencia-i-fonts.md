# Validació final 1 — Ciència i fonts

**Data:** 17 de novembre de 2026.

**Abast:** cinc articles nous (`web/articles/…/index.html`, el JS dels gràfics i els fitxers de dades) contrastats amb fonts primàries en línia. Les notes de recerca (`research/*/fonts.md`) només s'han fet servir per localitzar què es cita, no com a prova.

**No s'ha modificat cap fitxer d'article ni de recerca.**

**Mètode.** Per a cada article s'ha fet el següent:
- s'ha llegit tot el text visible i totes les xifres i etiquetes fixades al JS (anotacions, tooltips, eixos, llegendes, matrius de dades);
- s'han recalculat les xifres a partir dels CSV;
- s'han comprovat els DOI a Crossref o DataCite: tots els de les llistes en quatre articles i 9 a «On va el CO₂»;
- s'han contrastat les afirmacions amb els resums i, quan s'hi ha pogut accedir, amb el text complet de les fonts.

**Segona comprovació.** El revisor final ha tornat a verificar de manera independent les troballes més greus:
- la correcció de 2017 de Wigington et al. (versió vigent: 5.508 mesures de 22 campanyes);
- la cita del «≤13 %» de fòsfor de la pols (Yu et al. 2015);
- l'abast exacte de la xifra de 25–100 anys de Boyd et al. 2019;
- el context de la densitat de 1.028 g/l.

Arran d'aquesta comprovació s'han fet dos ajustos de classificació, que estan marcats al lloc corresponent.

**Severitats:**
- **CRÍTIC:** fals o enganyós.
- **IMPORTANT:** imprecís, falta un matís o cita incorrecta.
- **MENOR:** detall d'estil, de precisió o de context.

**Línies:** els números de línia es refereixen als fitxers tal com eren el 17-11-2026 a les 20:00.

## Resum

| Article | CRÍTIC | IMPORTANT | MENOR | DOI comprovats |
|---|---|---|---|---|
| 1. Migració vertical | 2 | 7 | 11 | 18/18 correctes |
| 2. Virus i bacteris | 1 | 9 | 11 | 50/50 correctes |
| 3. Pols del Sàhara | 1 | 5 | 17 | 29/29 correctes (+ Ridley 2012, que no és a la llista) |
| 4. Cinta transportadora | 0 | 8 | 14 | 36/36 + DOI de dades RAPID correctes |
| 5. On va el CO₂ | 0 | 6 | 13 | 9/9 correctes |
| **Total** | **4** | **35** | **66** | Cap DOI mort ni equivocat |

**Els problemes més greus**

1. **Virus i bacteris (CRÍTIC).** El gràfic «Una gota de mar» fa servir la versió original del conjunt de Wigington et al. 2016. Els autors el van corregir el 2017: tres conjunts (ELA, TROUT i SWAT; 163 mostres) eren d'aigua dolça amb coordenades errònies. El gràfic les etiqueta com «Columbia Britànica» dins de «mostres d'aigua de mar». Les xifres vigents són 5.508 mesures de 22 campanyes, i les medianes passen a ser 6,8 milions de virus, 540.000 bacteris i una relació d'11 a 1. Cal refer `dades.js`, la línia de tendència i el text.
2. **Pols del Sàhara (CRÍTIC).** La metàfora de l'«aixeta» i el gràfic del balanç de fòsfor presenten la pols com l'única entrada de fòsfor nou a l'Amazònia. La mateixa font principal (Yu et al. 2015) diu que la pols és com a màxim el 13 % del fòsfor que cau de l'aire, i els autors tenien aquesta dada al seu CSV. El veredicte del gràfic per a 0 tones («Sense pols, no entraria fòsfor nou») és fals.
3. **Migració vertical (2 CRÍTIC).** Tots dos són als gràfics de carboni:
   - La barra del zooplàncton (1,04 PgC, 0,78–1,30) és un càlcul propi (6,5 × 16 %) amb un interval mal construït, però es presenta com a «valor publicat».
   - L'etiqueta «Capa de mescla d'hivern: 25–100 anys» deforma Boyd et al. 2019 i contradiu el text.
4. **On va el CO₂ (IMPORTANT).** «Deixades a l'aire unes 27 GtC… 7,3 ppm» és internament incoherent: 27 GtC equivalen a 12,7 ppm. El GCB parla de 27 ± 21 GtC *menys absorbides*. A més:
   - l'exemple del 2016 com a «salt l'any següent» d'El Niño contradiu el gràfic mundial (2015 > 2016);
   - l'observatori no és «al cim» del Mauna Loa;
   - el preprint del GCB 2026 es presenta com a publicat.
5. **Cinta transportadora (IMPORTANT).** El problema és d'interpretació física:
   - el motor de la circulació s'atribueix «sobretot» a la densitat, quan l'energia ve sobretot del vent i les marees;
   - no s'avisa que la «cinta» és una simplificació;
   - la llengua salada del tall és aigua mediterrània;
   - el text diu «3 o 4 °C» al fons, i el gràfic, «0 a 4 °C»;
   - els Heinrich es presenten com a causa establerta;
   - les reanàlisis de van Westen s'atribueixen a «observacions».

**Patrons que es repeteixen en diversos articles:**
- **CALIPSO en present** (migració i pols). La missió va acabar l'1 d'agost de 2023.
- **Xifres sense el marge d'incertesa:**
  - 28 Mt (8–48);
  - −0,4 % (−1,5 a +0,6);
  - 41 % als 100 anys (±13);
  - la biomassa de mesopelàgics.
- **Càlculs propis presentats com si fossin de l'estudi:**
  - 1,04 PgC;
  - el factor ×5 virus/bacteris;
  - «unes dues hores».
- **Meta-descripcions més categòriques que el cos del text** (migració, pols, CO₂).

---

## 1. Migració vertical (web/articles/migracio-vertical/)

Revisió feta el 17/11/2026. He llegit tot el text visible d'`index.html` i `cover.html`, i totes les cadenes i dades de `migracio.js`. He comprovat els 18 DOI a Crossref i he contrastat el contingut amb els textos complets de Klevjer 2016, Bianchi 2013, Boyd 2019, Timmins-Schiffman 2024, Irigoien 2014 i Berge 2009, i amb els resums oficials de la resta. Rutes relatives a `web/articles/migracio-vertical/`.

### Problemes

1. **[CRÍTIC] La barra del zooplàncton del gràfic de carboni no és un «valor publicat» i el seu interval està mal construït**
   - **On:** `migracio.js:483` (`lo:.78,c:1.04,hi:1.30`, tooltip «La franja és la variació entre regions i estacions (± 4 punts)»), `index.html:260` (aria-label «uns 1,0, amb una variació d'entre 0,8 i 1,3 segons la regió i l'estació») i `index.html:294` («Són dades reals … el de les estimacions de carboni (valors publicats)»).
   - **Què falla:** Archibald, Siegel i Doney (2019) no publiquen cap flux global de la migració en PgC. Publiquen una exportació total de 6,5 PgC/any i una contribució proporcional mitjana de 0,16 ± 0,04 (mitjana ± desviació estàndard), «averaged over the global domain and the climatological seasonal cycle».
     - El valor 1,04 és un càlcul propi (6,5 × 0,16).
     - La franja 0,78–1,30 converteix la dispersió espacial i estacional d'una proporció local en un suposat interval del flux global. Això no és cap interval d'incertesa del total.
     - Els mateixos autors presenten el model com «a thought experiment».
     - La metodologia afirma que el gràfic són «valors publicats», i en aquesta barra és fals.
   - **Font:** resum oficial, https://api.openalex.org/works/doi:10.1029/2018GB005983 (DOI https://doi.org/10.1029/2018GB005983).
   - **Proposta:**
     - Representar-ho com a punt sense franja, amb un tooltip nou: «Càlcul nostre: el 16 % de mitjana de l'exportació total del model (6,5 PgC l'any). El model no dona un interval global; els autors el presenten com un experiment de pensament.»
     - Metodologia: «El gràfic de les estimacions de carboni mostra valors publicats, excepte la xifra del zooplàncton (uns 1,0 PgC l'any), que és un càlcul nostre a partir del 16 % i dels 6,5 PgC del model del 2019.»

2. **[CRÍTIC] «Capa de mescla d'hivern: 25–100 anys» deforma la font i contradiu el text**
   - *Nota de la revisió final:* Boyd et al. sí que associen 25–100 anys a la «fondària de la capa de mescla d'hivern», però només amb la condició que el carboni sigui subduït abans que l'hivern següent el torni a barrejar. Un claudàtor que abraça tota la capa (60–190 m), sense aquesta condició, fa creure que el carboni que queda *dins* la capa s'hi està dècades. Això és enganyós i contradiu la frase «torna aviat a la superfície». Es manté com a CRÍTIC per la contradicció entre el gràfic i el text.
   - **On:** `migracio.js:469` (claudàtor de 60 a 190 m amb «Capa de mescla d'hivern» / «25–100 anys»), dins de l'esquema que acompanya `index.html:240-241`.
   - **Què falla:** Boyd et al. (2019) atribueixen 25–100 anys a les partícules que les bombes físiques (mixed-layer i large-scale subduction) injecten a la fondària de la capa de mescla d'hivern, «assuming that subduction occurs before re-entrainment the next winter».
     - La mateixa revisió diu que el carboni només queda segrestat més d'un any si travessa la picnoclina permanent, «beneath the wintertime mixed layer».
     - El gràfic etiqueta la mateixa capa de mescla amb 25–100 anys. Això contradiu la font i contradiu el text de l'article: «El CO₂ alliberat a poca fondària torna aviat a la superfície».
   - **Font:** Boyd et al. 2019, PDF complet, https://par.nsf.gov/servlets/purl/10111652 (DOI https://doi.org/10.1038/s41586-019-1098-2).
   - **Proposta:** substituir el primer claudàtor per «Dins la capa de mescla d'hivern» / «torna a l'aire en menys d'un any». Si es vol mantenir la dada de 25–100 anys, cal un claudàtor just a sota de la capa de mescla amb el text «Just a sota de la capa de mescla: 25–100 anys».

3. **[IMPORTANT] La lluna: l'estudi citat no va trobar que la capa seguís la llum, i la simulació li atribueix just el comportament que l'estudi va descartar**
   - **On:** `index.html:196-197` («Si la llum marca el ritme, tot el que canvia la llum hauria de moure la capa. I la mou. … Amb lluna plena, la capa no arriba tan amunt…»), `index.html:206` («Els comportaments que reprodueix estan descrits als estudis citats: lluna (Benoit-Bird et al., 2009)») i `migracio.js:303` (nota de «Lluna plena»).
   - **Què falla:** Benoit-Bird et al. van partir de la hipòtesi que la capa es quedaria en una isoluma, i el resultat va ser el contrari.
     - Els animals no compensaven els canvis de llum: «at night animals often remained at light levels higher than they experience at depth during the day».
     - La fase lunar explicava «substantially more of the variability … than surface irradiance».
     - Conclouen que la llum de la lluna podria ser el senyal d'un ritme lunar intern, «rather than a direct cause».
     - A més, era una capa costanera de Hawaii.
   - **Font:** resum oficial, https://api.openalex.org/works/doi:10.4319/lo.2009.54.5.1789 (DOI https://doi.org/10.4319/lo.2009.54.5.1789).
   - **Proposta (text, l. 197):** «Amb **lluna plena**, la capa no arriba tan amunt. En un estudi que va seguir una capa d'animals petits davant de la costa de Hawaii durant sis cicles de lluna, la capa pujava més a prop de la superfície les nits fosques que les clares. Però no seguia exactament la llum: la fase de la lluna explicava més que la llum mesurada, com si els animals tinguessin també un calendari lunar intern.»
   - **Proposta (peu, l. 206):** «…núvols (Omand et al., 2021) i nit polar (Berge et al., 2009; Last et al., 2016). En el cas de la lluna, el model simplifica: l'estudi de Benoit-Bird et al. (2009) va trobar que la capa no seguia exactament una isoluma.»

4. **[IMPORTANT] «16 % de tot el carboni que s'enfonsa»: el denominador està mal descrit, i els dos «16 %» no són comparables**
   - **On:** `index.html:257` («un 16 % de tot el carboni que s'enfonsa per sota de la zona il·luminada … un 16 % semblant») i `migracio.js:494` («Tot el carboni que s'enfonsa: 6,5 (model del 2019)»).
   - **Què falla:**
     - Els 6,5 PgC/any d'Archibald són l'exportació total, que inclou el transport actiu de la migració, i aquest carboni no «s'enfonsa».
     - El 16 % és una mitjana de proporcions locals (± 0,04 de desviació estàndard), d'un model que els autors anomenen «thought experiment».
     - El 16,1 % ± 13 % de Saba et al. es calcula sobre «the mean value of model-generated global carbon flux estimates». Com que 1,5/0,161 ≈ 9,3 PgC, és un total diferent.
     - Al gràfic, dos «16 %» es tradueixen en 1,0 i 1,5 PgC al costat d'una línia de 6,5, i el lector no ho pot entendre.
   - **Fonts:** https://api.openalex.org/works/doi:10.1029/2018GB005983 ; https://api.openalex.org/works/doi:10.1002/lno.11709
   - **Proposta (l. 257):** «Un model global del 2019, que els mateixos autors presenten com un experiment de pensament, calcula que la migració del zooplàncton aporta de mitjana un 16 % de tot el carboni que baixa per sota de la zona il·luminada. Un recull d'estudis del 2021 atribueix als peixos, entre el que baixa en excrements i el que porten nedant, un 16 % semblant, amb un marge enorme (d'un 3 % a un 29 %) i calculat sobre un total diferent.»
   - **Proposta (gràfic, `migracio.js:494`):** «Tot el carboni exportat: 6,5 (model del 2019)».

5. **[IMPORTANT] La meta-descripció dona com a fet el que el text presenta com a descripció habitual**
   - **On:** `index.html:7`: «És la migració més gran del planeta.»
   - **Què falla:** la literatura ho formula com a descripció, no com a mesura.
     - Klevjer 2016: «has been described as the largest animal movement on earth in terms of biomass».
     - Berge 2009: «the largest synchronized movement of biomass on the planet».
     - El cos de l'article ho matisa bé (l. 83), però la meta-descripció, que és el que es veu als cercadors i a les xarxes, no.
   - **Fonts:** https://www.ebi.ac.uk/europepmc/webservices/rest/PMC4728495/fullTextXML ; https://www.ebi.ac.uk/europepmc/webservices/rest/PMC2657746/fullTextXML
   - **Proposta:** «…i abans de l'alba torna a baixar. Sovint es descriu com el moviment d'animals més gran del planeta, si es compta en tones.»

6. **[IMPORTANT] El CALIPSO ja no funciona**
   - **On:** `index.html:271`: «Des del 2019 també es veu des de l'espai: un satèl·lit amb làser, el CALIPSO, detecta de nit…»
   - **Què falla:** la missió científica del CALIPSO va acabar l'1 d'agost del 2023. A més, l'estudi és del 2019, però les dades són de 10 anys anteriors.
   - **Fonts:** https://www.nasa.gov/missions/calipso/first-long-duration-lidar-satellite-mission-calipso-ends ; https://cnes.fr/en/news/calipso-bows ; Behrenfeld et al. 2019, https://doi.org/10.1038/s41586-019-1796-9 (resum: «the 10-year satellite record»).
   - **Proposta:** «El 2019, un equip va mostrar que també es pot veure des de l'espai: el làser del satèl·lit CALIPSO, en servei fins al 2023, detectava de nit el senyal dels animals que havien arribat a la superfície. Deu anys de dades mostren que…»

7. **[IMPORTANT] La biomassa de peixos mesopelàgics apareix sense la seva enorme incertesa**
   - **On:** `index.html:265`: «el 2014 un equip va estimar que, només entre els 40 graus nord i sud, n'hi podria haver deu vegades més.»
   - **Què falla:** el resum d'Irigoien et al. 2014 és correcte (medianes d'11.000 a 15.000 milions de tones entre 40° N i 40° S), però el mateix article dona un interval de 6.000 a 200.000 milions de tones.
     - Treballs posteriors el rebaixen. Proud et al. (2019) donen 1,8–16 Gt, amb medianes de 3,8 a 8,3 Gt segons l'escenari.
     - Proud et al. remarquen que el senyal acústic prové «predominantly from fish and siphonophores», en proporcions incertes.
     - Aquesta xifra continua sent debatuda.
   - **Fonts:** Irigoien 2014, text complet, https://www.ebi.ac.uk/europepmc/webservices/rest/PMC3926006/fullTextXML ; Proud et al. 2019, ICES J. Mar. Sci. 76:718, https://doi.org/10.1093/icesjms/fsy037 (resum: https://api.openalex.org/works/doi:10.1093/icesjms/fsy037).
   - **Proposta:** «…el 2014 un equip va estimar que, només entre els 40 graus nord i sud, n'hi podria haver deu vegades més, tot i que amb un marge enorme. Estimacions posteriors donen entre 2.000 i 16.000 milions de tones: la xifra encara es discuteix.» Caldria afegir Proud et al. (2019) a la llista de fonts.

8. **[IMPORTANT] «L'Índic» sense precisar: sembla que l'article es contradigui**
   - **On:** `index.html:181` («A l'Índic, la capa es quedava de dia a gairebé 600 metres»), `index.html:190` («Les més someres, … al nord de l'Índic») i les etiquetes «Oceà Índic» a `migracio.js:236` i `index.html:186`.
   - **Què falla:** Klevjer diu «deepest in the southern Indian Ocean (WMD 590 m)». El trajecte de la Malaspina va creuar el sud de l'Índic, mentre que el nord de l'Índic (mar d'Aràbia) és dels llocs on la capa és més somera. Tal com està escrit, el lector veu les dues frases en contradicció.
   - **Font:** https://api.openalex.org/works/doi:10.1038/srep19873
   - **Proposta:** «Al sud de l'Índic, la capa es quedava de dia a gairebé 600 metres…». Al gràfic i a l'aria-label: «Índic (sud)».

9. **[IMPORTANT] Raonament propi presentat com a observació: «la capa comença a pujar quan el sol encara és alt»**
   - **On:** `index.html:113` («ha de sortir unes dues hores abans que es pongui el sol») i `index.html:134` («Però la llum no ho explica tot. La capa comença a pujar quan el sol encara és alt, com si s'anticipés a la fosca.»).
   - **Què falla:** cap font citada no ho diu així. És una deducció feta amb les velocitats mitjanes de Bianchi i Mislan.
     - Amb 450 m a 6,5 cm/s (234 m/h), el viatge dura uns 115 minuts. Arribant 17 minuts després de la posta, cal sortir uns 98 minuts abans: una hora i mitja llarga, no «unes dues hores». En aquest moment el sol és a uns 25° a l'equador, no «alt».
     - La pujada abans de la posta no demostra per si sola que «la llum no ho explica tot»: la llum a 450 m comença a baixar després de migdia.
     - L'evidència d'un rellotge intern sí que existeix (la nota dels copèpodes, Timmins-Schiffman 2024), però és una altra cosa.
   - **Fonts:** Bianchi i Mislan 2016, resum, https://api.openalex.org/works/doi:10.1002/lno.10219 ; Bianchi et al. 2013, text complet («reverse migrations before sunset»), https://earthsystemdynamics.org/wp-content/uploads/2018/05/Bianchi-NGeo-2013-DVM-and-oxygen.pdf
   - **Proposta (l. 113):** «…Per arribar a dalt poc després de la posta, ha de sortir una hora i mitja abans que es pongui el sol.»
   - **Proposta (l. 134):** «Però la llum no ho explica tot. Molts migradors també tenen un rellotge intern que els marca el ritme encara que no vegin el sol.»

10. **[MENOR] La «lluna plena» de l'ecograma no encaixa amb l'astronomia ni amb el mateix model**
    - **On:** `migracio.js:303`: «només toca la superfície en l'estona fosca entre la posta del sol i la sortida de la lluna».
    - **Què falla:** amb lluna plena, la lluna surt aproximadament quan es pon el sol, de manera que no hi ha cap estona fosca entre la posta i la sortida.
      - Al mateix model (`moonL`, trànsit a mitjanit i període de 24,84 h), el primer dia la lluna surt a les 17:47, abans de la posta de les 18:00 (càlcul fet a partir del codi).
      - El que el model reprodueix en realitat és que la llum de la lluna baixa a l'horitzó és feble.
    - **Proposta:** «…i només s'acosta a la superfície quan la lluna és baixa, poc després de sortir o abans de pondre's.»

11. **[MENOR] El 36 % de l'estudi dels núvols es compara amb l'anada i tornada, no amb «la migració de nit»**
    - **On:** `index.html:209`: «aquests petits viatges sumaven com a mínim un 36 % del recorregut de la migració de nit.»
    - **Què falla:** Omand et al. diuen «at least 36% of the round-trip diel migration distance».
    - **Font:** https://api.openalex.org/works/doi:10.1073/pnas.2022977118
    - **Proposta:** «…sumaven com a mínim un 36 % del recorregut d'anada i tornada de la migració diària.»

12. **[MENOR] Les velocitats mitjanes s'usen com si fossin màximes**
    - **On:** `index.html:206` («no pot nedar més de pressa que les velocitats mesurades (6,5 cm/s amunt, 7,6 cm/s avall)») i `index.html:294`.
    - **Què falla:** són mitjanes amb una desviació gran (6,5 ± 3,5 i 7,6 ± 3,6 cm/s), no velocitats màximes.
    - **Font:** https://api.openalex.org/works/doi:10.1002/lno.10219
    - **Proposta:** «…i no pot nedar més de pressa que les velocitats mitjanes mesurades (6,5 cm/s amunt, 7,6 cm/s avall), que el model usa com a límit.»

13. **[MENOR] Peixos llanterna: «els que més ressonen» és més fort que la font**
    - **On:** `index.html:104`.
    - **Què falla:**
      - Bianchi 2013: «responsible for much of the sound scattering».
      - Proud 2019: el senyal a 38 kHz prové «predominantly from fish and siphonophores».
      - Klevjer 2016 avisa que els sifonòfors fisonectes poden pesar molt en el senyal.
    - **Fonts:** PDF de Bianchi 2013 (URL de dalt) ; https://api.openalex.org/works/doi:10.1093/icesjms/fsy037
    - **Proposta:** «Els peixos llanterna, o mictòfids, produeixen bona part de l'eco que veu el sonar, juntament amb els sifonòfors, que també porten una bombolla de gas.»

14. **[MENOR] Senyal acústic no és el mateix que animals**
    - **On:** `index.html:294` («la proporció d'animals que migren (50 %) és la mitjana de la Malaspina») i la llegenda «Animals que es queden» (`index.html:151`).
    - **Què falla:** Klevjer mesura la proporció del senyal acústic a 38 kHz, «geared towards … mesopelagic fish with a gas-filled swim bladder», i avisa que «backscatter will not relate reliably with biomass». El text del pas 7 ho diu bé; la metodologia no.
    - **Font:** https://www.ebi.ac.uk/europepmc/webservices/rest/PMC4728495/fullTextXML
    - **Proposta (metodologia):** «…la proporció de la capa que migra (50 %) és la mitjana del senyal acústic mesurat a la Malaspina (46 % a la taula 1)…»

15. **[MENOR] L'oxigen com a causa «sobretot» de la diferència entre regions**
    - **On:** `index.html:182`: «La diferència té a veure, sobretot, amb l'oxigen.»
    - **Què falla:** a Klevjer és una correlació. L'oxigen hi entra amb la terbolesa i la temperatura, i els autors diuen que expliquen «parts of this spatial variability». També escriuen: «Establishing the reasons for shallower distributions in areas with midwater OMZ requires further research.»
    - **Font:** text complet de Klevjer (URL de dalt).
    - **Proposta:** «La diferència va lligada, sobretot, a l'oxigen, tot i que també hi compten la temperatura i la transparència de l'aigua.»

16. **[MENOR] El límit de 200 m de Bianchi et al. 2013 és en part metodològic**
    - **On:** `index.html:190` i `index.html:187` (franja grisa 200–650 m).
    - **Què falla:** els autors van excloure expressament «migrations shallower than approximately 150-200 m».
    - **Font:** PDF de Bianchi 2013 (Methods).
    - **Proposta:** afegir al peu de figura de la l. 187: «L'estudi no va comptar les migracions de menys de 150–200 m.»

17. **[MENOR] Cartes «ED»: la cronologia i el grau de certesa**
    - **On:** `index.html:82`: «A les cartes nàutiques dels anys cinquanta s'hi van acumular centenars de suposats esculls… Després de la guerra, … Johnson … va resoldre el misteri.»
    - **Què falla:** WHOI diu que centenars de lectures es van apuntar com a bancs desconeguts i encara figuren com a «ED». La carta dels anys cinquanta és un exemple que, segons el peu, «could represent» un fals fons. L'ordre del paràgraf fa creure que els anys cinquanta van ser abans de Johnson, que va publicar el 1948.
    - **Font:** https://twilightzone.whoi.edu/the-mysterious-false-bottom-of-the-twilight-zone/
    - **Proposta:** «Les ecosondes d'altres vaixells també el veien, i el prenien per bancs desconeguts. Centenars d'aquestes lectures van acabar a les cartes nàutiques amb dues lletres, **ED**, «existència dubtosa», i algunes encara hi són.»

18. **[MENOR] «On el mar feia milers de metres de fondària»: no verificable**
    - **On:** `index.html:81`.
    - **Què falla:** ni WHOI ni NOAA ho diuen, i no he pogut llegir el text de JASA 1948 (és de pagament).
    - **Proposta:** «Lluny de la costa, on el fons era molt més avall, el so rebotava a unes 300 iardes…», o bé verificar-ho a Eyring et al. 1948.

19. **[MENOR] Copèpodes a les fosques: el que es va mesurar van ser proteïnes**
    - **On:** `index.html:135`: «continuaven canviant el metabolisme de dia i de nit».
    - **Què falla:** l'estudi mesura el proteoma, per exemple «increased abundance of carbohydrate metabolism proteins at night». El resum parla de «24 h of darkness», però la metodologia del manuscrit diu que es van mostrejar cada 6 h durant 36 h.
    - **Font:** https://par.nsf.gov/servlets/purl/10507435 (DOI https://doi.org/10.1021/acs.jproteome.4c00086).
    - **Proposta:** «Copèpodes tancats a les fosques en un vaixell continuaven canviant de dia i de nit les proteïnes del metabolisme, com si portessin un rellotge intern.»

20. **[MENOR] Global Carbon Budget: la xifra del 2026 és una projecció**
    - **On:** `index.html:264`: «el 2026, la crema de combustibles fòssils emetrà uns 38.200 milions de tones».
    - **Què falla:** la nota de premsa ho presenta com a projecció: «projects 38.2 billion tonnes of fossil carbon dioxide (CO2) emissions this year».
    - **Font:** https://www.eurekalert.org/news-releases/1150611
    - **Proposta:** «…segons les projeccions del Global Carbon Budget, el 2026 les emissions fòssils seran d'uns 38.200 milions de tones de CO₂…»

### Comprovat i correcte

- **DOI (18 de 18 a Crossref):** títol, autors, any, revista, volum i pàgines o número d'article coincideixen per a:
  - Eyring 1948 (JASA 20:462–475)
  - Proud 2017 (Curr. Biol. 27:113–119)
  - Hays 2003 (Hydrobiologia 503:163–170)
  - Klevjer 2016 (Sci. Rep. 6:19873)
  - Bianchi 2013 (Nat. Geosci. 6:545–548)
  - Bianchi i Mislan 2016 (L&O 61:353–364)
  - Timmins-Schiffman 2024 (JPR 23:2112–2123)
  - Omand 2021 (PNAS 118:e2022977118)
  - Røstad 2016 (DSR I 113:1–6)
  - Benoit-Bird 2009 (L&O 54:1789–1800)
  - Berge 2009 (Biol. Lett. 5:69–72)
  - Last 2016 (Curr. Biol. 26:244–251)
  - Boyd 2019 (Nature 568:327–335)
  - Archibald 2019 (GBC 33:181–199)
  - Bianchi, Stock et al. 2013 (GBC 27:478–491)
  - Saba 2021 (L&O 66:1639–1664)
  - Irigoien 2014 (Nat. Commun. 5:3271)
  - Behrenfeld 2019 (Nature 576:257–261)
- **Altres URL:**
  - Johnson 1948 a EliScholar: títol, any, volum 7 i número 3 correctes. Les pàgines 443–458 no apareixen a la fitxa, i no les he pogut verificar.
  - Les pàgines de WHOI, NOAA Ocean Service i NOAA Ocean Exploration funcionen.
  - Smithsonian (ocean.si.edu) i EurekaLert retornen 403 als clients automàtics. EurekaLert l'he pogut llegir amb WebFetch; Smithsonian, no verificable.
- **Història:** estiu (juny) del 1942, USS *Jasper*, Eyring, Christensen i Raitt, «about 300 yards» (≈ 274 m), desapareix i reapareix al vespre, Johnson (Scripps) pesca zooplàncton després de la guerra (WHOI).
- **Llum:** «rarely any significant light beyond 200 meters», detectable fins a 1.000 m (NOAA). Mesopelàgic = ~20 % del volum de l'oceà; capes de dispersió de «tens to hundreds of m» de gruix, contínues «for tens to thousands of km»; per al 2100 es preveu homogeneïtzació i ~17 % més de biomassa (Proud 2017, resum Europe PMC).
- **Horaris i velocitats** (Bianchi i Mislan 2016): la capa deixa la superfície 21 ± 20 min abans de l'alba i hi arriba 17 ± 23 min després de la posta; baixa a 7,6 i puja a 6,5 cm/s. Les conversions a 230 i 270 m/h són correctes (234 i 274).
- **Taula 1 de Klevjer 2016:** els sis grups (dia/nit, amplitud, proporció, parells; total 105) coincideixen exactament amb el CSV, amb `migracio.js` i amb l'aria-label. També són correctes la mitjana de ~50 % (46 % a la taula), l'interval del 20 % al 91 %, el WMD de 0 a 1.000 m a 38 kHz, el BIO *Hespérides* i el període de desembre del 2010 a juliol del 2011.
- **Bianchi 2013:**
  - 389 campanyes, 1990–2011, fondàries de 200 a 650 m.
  - Les capes més fondes són als girs subtropicals. Les més someres, al Pacífic subpolar nord, al Pacífic tropical oriental, al nord de l'Índic i a l'Atlàntic nord d'altes latituds.
  - L'oxigen és «the best single predictor».
  - Els migradors entren als mínims d'oxigen, «in many cases reaching their cores», i la hipòtesi del refugi està formulada com a hipòtesi.
  - La migració intensifica els mínims d'oxigen.
  - Mictòfids acompanyats de sifonòfors, cefalòpodes, copèpodes, eufausiacis i salpes.
- **Núvols, nit polar i lluna:**
  - Omand 2021: fins a 60 m, ~5 min de retard, capa a 300 m al Pacífic nord-est subpolar.
  - Berge 2009: Kongsfjorden i Rijpfjorden (79° i 80° N), ADCP ancorats, llum «far below the threshold of human perception».
  - Last 2016: 24,8 h, cada 29,5 dies, ~50 m.
- **Carboni:**
  - Boyd 2019: bomba de migrants de 0,9 a 3,6 PgC/any; injecció fins a 600 m i fins a 250 anys; segles per sota dels ~1.000 m; neu marina de 10 a 100 m/dia; els excrements s'enfonsen més de pressa que els agregats.
  - Saba 2021: 16,1 % ± 13 % i 1,5 ± 1,2 PgC/any. Archibald 2019: 6,5 PgC/any i 0,16 ± 0,04.
  - GCB 2026: 38,2 Gt de CO₂ (nota d'Exeter del 9/11/2026). 38,2 × 12/44 = 10,4 PgC.
- **Peixos i satèl·lit:**
  - Irigoien 2014: ~1.000 Mt (Gjøsæter i Kawaguchi 1980), 40° N–40° S, un ordre de magnitud més.
  - Behrenfeld 2019: xarxes «nearly 200 years ago», 10 anys de dades; fracció més gran als girs clars i biomassa total més gran on hi ha més producció.
- **Copèpode i comparació de mida:**
  - *P. xiphias*: 5 mm, «cosmopolitan», migra ~500 m, incubat a bord a les fosques (Timmins-Schiffman 2024).
  - 500 m / 5 mm = 100.000; 1,70 m → 170 km = 4,03 maratons.
  - Distàncies en línia recta des de Barcelona: Girona 85 km, Lleida 132, Perpinyà 157, Tolosa 254 (queda fora de l'escala de 230 km). La frase «més que de Barcelona a Perpinyà» és correcta.
- **Etiquetatge:** el tall de 24 h està marcat com a «Esquema», l'ecograma com a «Simulació, no dades reals» i el de carboni com a «Esquema, no a escala». `cover.html` és decoratiu i no conté xifres.

### Veredicte

L'article està ben documentat i la gran majoria de xifres coincideixen amb les fonts primàries, inclosos tots els DOI i la taula de Klevjer. La migració més gran del planeta s'hi presenta correctament com a descripció habitual, excepte a la meta-descripció. Els errors greus es concentren en els gràfics de carboni:

- Una barra que es presenta com a «valor publicat» però és un càlcul propi, amb un interval mal construït.
- Una etiqueta de segrest (25–100 anys a la capa de mescla d'hivern) que diu el contrari de Boyd et al. 2019.

També cal corregir que l'estudi de la lluna s'utilitzi per avalar un comportament que l'estudi va descartar, el CALIPSO en present, la biomassa de peixos sense incertesa i l'ambigüitat de «l'Índic». Amb aquestes correccions, l'article es pot publicar.

---

## 2. Virus i bacteris (web/articles/virus-i-bacteris/)

Revisió feta el 17/11/2026 sobre `index.html`, `cover.html`, `virus-i-bacteris.js`, `crispr.js`, `dades.js` i els CSV de `research/virus-i-bacteris/`. Totes les xifres del gràfic de l'oceà s'han recalculat des del CSV (script propi, Python). `dades.js` coincideix fila per fila amb el CSV de Wigington (5.671 files, 0 discrepàncies en log10 i fondària), i `def`/`hist` coincideixen amb els CSV de Tesson (60 famílies; 21.738 genomes). El problema no és la transcripció, sinó el conjunt de dades original (vegeu el punt 1).

### Problemes

1. **[CRÍTIC] El gràfic «Una gota de mar» inclou 163 mostres d'aigua dolça de llac, i l'article de Wigington es va corregir el 2017**
   - **On:** `index.html:207` («va reunir **5.671 mesures** d'aquest tipus, preses en 25 campanyes»); `:216` («Virus i bacteris en 5.671 mostres d'aigua de mar»); `:217` (aria-label «5.671 mostres d'aigua de mar»); `:222` («5.671 parells de mesures de 25 campanyes oceanogràfiques»); `:402` (metodologia); `dades.js` (`seaStudies`: «Columbia Britànica (ELA)», «Columbia Britànica (SWAT)», «Columbia Britànica (TROUT)»); `virus-i-bacteris.js:300,306` (coeficients de la línia de tendència 2,9487 + 0,6656·x).
   - **Què falla:** l'article té una *Author Correction* del 3 d'octubre de 2017. Tres dels 25 conjunts de dades (ELA, TROUT i SWAT) es van classificar per error com a marins: són mostres d'aigües continentals dolces amb coordenades mal registrades. Representen 163 de les 5.671 files. La versió vigent de l'article analitza **5.508 mesures de 22 campanyes**. Al CSV, aquestes 163 files tenen totes la coordenada -123,5 / 49,5 i fondàries de 0,5 a 32 m, i el gràfic les etiqueta com «Columbia Britànica». Les notes de recerca (`fonts.md:18`) ja havien vist el «5.508» a nature.com, però no en van treure les conseqüències.
   - **Font:** https://www.nature.com/articles/nmicrobiol201524 (secció «Change history», 03/10/2017). Cita literal de la correcció: «3 of the studies… were erroneously classified as marine sites».
   - **Recàlcul propi sense ELA, TROUT i SWAT** (n = 5.508; 22 campanyes):
     - 0–100 m: n = 2.706. Medianes de 5,4 × 10⁵ bacteris/ml i 6,8 × 10⁶ virus/ml. Relació mediana 11,1; percentils 10–90 de 4,6 a 73. El 82,5 % de les mostres queda entre 4 i 70.
     - Més de 1.000 m: sense canvis (n = 870; relació 36).
     - Ajust log–log de totes les mesures: pendent 0,70 (r² = 0,62), intercept 2,773. Deu vegades més bacteris donen unes 5,0 vegades més virus, de manera que la frase «sinó unes cinc» es manté.
     - Rang dels eixos: sense canvis (bacteris de 4.635 a 17,7 milions; virus de 103.200 a 590 milions; fins a 5.931 m).
   - **Què cal fer:** treure del `dades.js` les files dels estudis ELA, TROUT i SWAT (i les tres etiquetes de `seaStudies`). Canviar la línia de tendència a `2.7732 + 0.7010*x`, l'anotació del JS a «6,8 M de virus · 540.000 bacteris» i les xifres de text que es proposen tot seguit.
   - **Textos proposats:**
     - `:207` → «El 2016, un equip de catorze investigadors va reunir milers de mesures d'aquest tipus, de l'Àrtic a l'Índic i de la superfície fins a gairebé 6.000 metres de fondària. El 2017 en van corregir la compilació: tres dels conjunts de dades eren d'aigua dolça, no de mar. Sense aquests, queden <b>5.508 mesures</b> de 22 campanyes.»
     - `:212–214` → «<b>6,8 milions</b> de virus en un mil·lilitre d'aigua dels primers 100 metres (mediana)» / «<b>540.000</b> bacteris en el mateix mil·lilitre» / «<b>11 a 1</b> virus per cada bacteri en aquests 100 metres, de mediana. Però en 8 de cada 10 mostres va de 5 a 70»
     - `:216` → «Virus i bacteris en 5.508 mostres d'aigua de mar»
     - `:222` → «Dades reals: 5.508 parells de mesures de 22 campanyes oceanogràfiques, compilades per Wigington et al. 2016 (<i>Nature Microbiology</i>), segons la correcció del 2017, que en va treure tres conjunts d'aigua dolça. Medianes i línia de tendència: càlcul propi. Passa o toca sobre un punt per veure'n els valors.»
     - Metodologia `:402`: substituir «fitxer suplementari de Wigington et al. 2016» per «fitxer suplementari de Wigington et al. 2016, sense els tres conjunts d'aigua dolça (ELA, TROUT i SWAT) que l'article va retirar en la correcció del 2017».

2. **[IMPORTANT] Les xifres del got d'aigua impliquen 20 virus per bacteri, i contradiuen el «10 a 1» i les dades del mateix article**
   - **On:** `index.html:108` («uns 2.500 milions de virus. I uns 125 milions de bacteris») i `:402` («250 mil·lilitres per 10 milions de virus i per 500.000 bacteris per mil·lilitre, valors típics d'aigua costanera»).
   - **Què falla:** 2.500 / 125 dona una relació de 20 a 1. Uns paràgrafs més avall, l'article explica que el valor habitual és d'uns 10 a 1. A més, els dos valors no són de la mateixa mena d'aigua:
     - 10⁷ virus/ml és un valor costaner (Hendrix, citat per Mushegian: «10^7 tailed phage particles per milliliter in coastal seawater»).
     - 5 × 10⁵ cèl·lules/ml és el valor de Whitman per als 200 m superiors de l'**oceà obert**, no de la costa.
     - Amb les medianes del gràfic de l'article (0–100 m, després de la correcció), un got de 250 ml té uns 1.700 milions de virus i uns 135 milions de bacteris.
   - **Fonts:** https://doi.org/10.1128/JB.00052-20 (Mushegian 2020, PMC7148134); https://doi.org/10.1073/pnas.95.12.6578 (Whitman 1998); recàlcul propi del CSV.
   - **Text proposat (`:108`):** «Però si és com l'aigua de la superfície de la majoria de mars del món, en aquest quart de litre hi neden uns 1.700 milions de virus. I uns 135 milions de bacteris.» A la metodologia: «Les xifres del got d'aigua són càlculs propis: 250 mil·lilitres per les medianes dels primers 100 metres del gràfic (6,8 milions de virus i 540.000 bacteris per mil·lilitre).»

3. **[IMPORTANT] L'origen del 10³¹ es presenta com un càlcul explícit de Hendrix, però és una reconstrucció**
   - **On:** `index.html:200`: «ve d'un càlcul del biòleg Roger Hendrix de finals dels anys noranta. Va multiplicar dues coses: el nombre de bacteris i arqueus de la Terra, uns 5 × 10³⁰, i … unes deu».
   - **Què falla:** Mushegian (2020) explica que el número és «implicit» als articles de Hendrix i que es pot obtenir com el producte de dos paràmetres.
     - Hendrix et al. 1999 dona la proporció d'unes deu partícules per cèl·lula.
     - La revisió de Hendrix del 2002 diu «in excess of 10³⁰».
     - El nombre de procariotes (4–6 × 10³⁰) és de Whitman et al. 1998, i la proporció de 10 ve de Bergh et al. 1989.
     - Mushegian és qui l'anomena «producte de Hendrix».
     - Hendrix no va publicar la multiplicació tal com la descriu el text.
   - **Font:** https://doi.org/10.1128/JB.00052-20 (PMC7148134).
   - **Text proposat:** «L'estimació que se sol citar, 10<sup>31</sup>, surt dels treballs del biòleg Roger Hendrix de finals dels anys noranta, tot i que ell no la va escriure mai amb aquestes xifres. És el resultat de multiplicar dues coses: el nombre de bacteris i arqueus de la Terra, uns 5 × 10<sup>30</sup> segons un càlcul del 1998, i la proporció habitual d'unes deu partícules de fag per cada cèl·lula a les mostres naturals. Per això se'n diu el "producte de Hendrix".»

4. **[IMPORTANT] Mojica no «va desxifrar en bona part» el CRISPR**
   - **On:** `index.html:110`: «el va desxifrar en bona part un microbiòleg d'Alacant».
   - **Què falla:** Mojica va descriure les repeticions el 1993, en va veure l'abast el 2000 i el 2005 va proposar-ne la funció immunitària (alhora que Pourcel i Bolotin). El mecanisme el van desxifrar altres equips:
     - Barrangou 2007: adquisició d'espaiadors i resistència.
     - Brouns i Marraffini 2008: guies d'RNA i diana de DNA.
     - Garneau 2010: tall del DNA del fag.
     - Deltcheva 2011: tracrRNA.
     - Jinek i Gasiunas 2012: Cas9.

     L'informe científic del Nobel ho explica així. La frase sobredimensiona el seu paper, i el mateix article ho contradiu més endavant.
   - **Font:** https://www.nobelprize.org/uploads/2020/10/advanced-chemistryprize2020.pdf (pàg. 1–3).
   - **Text proposat:** «Un d'aquests sistemes, una mena de memòria amb què el bacteri recorda els virus que l'han atacat, el va descobrir i en va intuir la funció un microbiòleg d'Alacant.»

5. **[IMPORTANT] «L'eina amb què es corregeix el DNA de persones malaltes» no és exacte**
   - **On:** `index.html:110`.
   - **Què falla:** el primer medicament autoritzat, el Casgevy, no corregeix la mutació causant. Edita cèl·lules mare de la sang fora del cos perquè tornin a fabricar hemoglobina fetal. La FDA ho descriu així: «increased levels of HbF prevent the sickling». A més, l'ús clínic encara és molt limitat.
   - **Font:** https://www.fda.gov/news-events/press-announcements/fda-approves-first-gene-therapies-treat-patients-sickle-cell-disease
   - **Text proposat:** «Avui és l'eina amb què ja s'editen cèl·lules de persones malaltes per tractar-les.»

6. **[IMPORTANT] L'informe del Nobel cita quatre treballs de Mojica, no tres**
   - **On:** `index.html:371`: «L'informe científic de l'Acadèmia sueca … cita tres treballs de Mojica».
   - **Què falla:** a la bibliografia de l'informe hi ha quatre articles de Mojica:
     - ref. 4: 1993, *Mol Microbiol*;
     - ref. 5: 2000, *Mol Microbiol*;
     - ref. 9: 2005, *J Mol Evol*;
     - ref. 19: Mojica et al. 2009, «Short motif sequences determine the targets of the prokaryotic CRISPR defence system», *Microbiology* 155:733, l'article dels PAM.

     Les notes de recerca (`fonts.md:68`) només n'havien comptat tres.
   - **Font:** https://www.nobelprize.org/uploads/2020/10/advanced-chemistryprize2020.pdf (bibliografia, pàg. 11).
   - **Text proposat:** «L'informe científic de l'Acadèmia sueca repassa tota la història i cita quatre treballs de Mojica, però el premi no el va incloure.»

7. **[IMPORTANT] Data de l'autorització del Casgevy: el 15 de novembre, anunciada el 16**
   - **On:** `index.html:372` («El 16 de novembre de 2023, el Regne Unit va aprovar…») i `crispr.js:230` (línia del temps: «El 16 de novembre, el Regne Unit autoritza el Casgevy…»).
   - **Què falla:** la nota de l'MHRA es va publicar el 16/11/2023, però les seves «Notes to editors» diuen literalment «The new indication was granted on 15 November 2023». A més, la indicació és la beta-talassèmia **dependent de transfusions**, en pacients de 12 anys o més.
   - **Font:** https://www.gov.uk/government/news/mhra-authorises-world-first-gene-therapy-that-aims-to-cure-sickle-cell-disease-and-transfusion-dependent-thalassemia
   - **Text proposat (`:372`):** «El 15 de novembre de 2023 (ho va anunciar l'endemà), el Regne Unit va aprovar el primer medicament basat en CRISPR, el Casgevy, per a l'anèmia de cèl·lules falciformes i la beta-talassèmia dependent de transfusions, a partir dels 12 anys.»
   - **Text proposat (`crispr.js:230`):** «El 15 de novembre, el Regne Unit autoritza el Casgevy, el primer medicament basat en CRISPR, per a l'anèmia falciforme i la beta-talassèmia que depèn de transfusions.»

8. **[IMPORTANT] Les mares sí que passen anticossos als fills**
   - **On:** `index.html:291`: «els anticossos que fabriquem no passen als fills. La memòria del CRISPR, sí.»
   - **Què falla:** és fals tal com està escrit. Les IgG maternes travessen la placenta (i també passen anticossos per la llet), i protegeixen el nadó. El que no s'hereta és la **memòria immunitària**: aquests anticossos no queden escrits al genoma i desapareixen en uns mesos. El CRISPR, en canvi, guarda la memòria al DNA.
   - **Font:** Palmeira P et al. 2012, *Clin Dev Immunol* 2012:985646, https://doi.org/10.1155/2012/985646 (resum: «IgG is the only antibody class that significantly crosses the human placenta»).
   - **Text proposat:** «És una diferència important amb la nostra immunitat: la memòria que guarden els nostres limfòcits no queda escrita al DNA i no l'hereten els fills. La del CRISPR, sí.»

9. **[IMPORTANT] Tbilisi i Wrocław no són «els centres que la van començar»**
   - **On:** `index.html:377`: «A Tbilisi, a Geòrgia, i a Wrocław, a Polònia, els centres que la van començar encara funcionen.»
   - **Què falla:**
     - D'Hérelle va començar la teràpia a París el 1919.
     - L'Institut Eliava de Tbilisi es va fundar el 1923.
     - L'Institut Hirszfeld de Wrocław es va crear el 1952 (va començar a funcionar el 1954), i la seva Unitat de Teràpia amb Fags és del 2005.

     El que cal dir és que en aquests països no es va abandonar mai.
   - **Font:** Żaczek M et al. 2020, *Front Microbiol* 11:1056, https://doi.org/10.3389/fmicb.2020.01056
   - **Text proposat:** «A Geòrgia i a Polònia, en canvi, no es va abandonar mai: l'Institut Eliava de Tbilisi, fundat el 1923, i l'Institut Hirszfeld de Wrocław encara la fan servir.»

10. **[IMPORTANT] El «deu vegades més bacteris, unes cinc vegades més virus» és un càlcul propi que el text atribueix implícitament a l'estudi**
    - **On:** `index.html:226`.
    - **Què falla:** el factor ~5 surt de l'ajust conjunt fet per la revista (pendent 0,67; 0,70 després de la correcció). L'article original ajusta cada campanya per separat i només diu que els exponents són «typically less than 1». La frase següent comença amb «Els autors de l'estudi conclouen…», i el lector entén que el factor ~5 també és dels autors.
    - **Fonts:** https://www.nature.com/articles/nmicrobiol201524 (resum); recàlcul propi.
    - **Text proposat:** «A més, els virus no creixen al mateix ritme que els bacteris. Si ajuntem totes les mesures, una mostra amb deu vegades més bacteris que una altra no té deu vegades més virus, sinó unes cinc (càlcul propi). Els autors de l'estudi, que analitzen cada campanya per separat, també troben que els virus creixen més a poc a poc que els bacteris, i conclouen que…»

11. **[MENOR] Ni són «fags» ni és una dada exacta: el 20 % diari és de «virus» i és una estimació**
    - **On:** `index.html:231`: «els fags maten aproximadament el 20 % de la biomassa microbiana cada dia».
    - **Què falla:** Suttle (2007) parla de «Viruses», que inclouen els virus d'algues i protists. A més, el text del mateix article ho presenta com una estimació («It is estimated that…»), i altres xifres van del 10 al 40 %.
    - **Font:** https://doi.org/10.1038/nrmicro1750 (resum, via Europe PMC).
    - **Text proposat:** «A l'oceà, segons una estimació del viròleg marí Curtis Suttle, els virus maten cada dia aproximadament <b>el 20 % de la biomassa microbiana</b>.»

12. **[MENOR] El requadre de xifres no diu que el 10 a 1 és només dels primers 100 metres**
    - **On:** `index.html:214`.
    - **Què falla:** «10 a 1 … de mediana. Però en 8 de cada 10 mostres va de 4 a 70» correspon només a les mostres de 0–100 m (percentils 10–90: 3,7–69,7). Per a totes les mostres, la mediana és 13 i el rang 4,8–54. El text no ho diu.
    - **Text proposat:** ja inclòs al punt 1 («en aquests 100 metres»).

13. **[MENOR] El gràfic del cicle d'infecció no diu clarament què és a escala i què és esquema**
    - **On:** `index.html:192` (aria-label «Dibuix a escala … i d'un fag lambda») i `:132` («El dibuix és a escala»).
    - **Què falla:** la metodologia (`:402`) diu que només el T4 és a escala i que la resta del cicle i el lambda són esquemes. El gràfic CRISPR porta l'etiqueta «Esquema»; el del cicle d'infecció, no.
    - **Text proposat:** aria-label: «Dibuix d'un fag T4, a escala, que aterra sobre un bacteri…; i esquema d'un fag lambda que s'amaga al cromosoma del bacteri.» A `:132`: «El fag i el bacteri estan dibuixats a escala; el que passa a dins és un esquema.»

14. **[MENOR] El cap del lambda fa uns 60 nm, no 70**
    - **On:** `index.html:172`.
    - **Què falla:** la crio-EM de la càpsida madura dona «~600 Å» de diàmetre mitjà (Lander et al. 2008). El mapa EMDB indica 650 Å. El resum de Campbell 2020, la font que cita l'article, no dona aquesta xifra.
    - **Font:** Lander GC et al. 2008, *Structure* 16:1399, https://pmc.ncbi.nlm.nih.gov/articles/PMC2614288/
    - **Text proposat:** «El lambda té una altra forma: un cap rodó d'uns 60 nanòmetres i una cua flexible de 135, sense beina.»

15. **[MENOR] «El fag més estudiat de tots»**
    - **On:** `index.html:132`.
    - **Què falla:** la font (Yap i Rossmann 2014) diu «the most well-studied member of Myoviridae», no de tots els fags. El lambda és tan estudiat com el T4, o més.
    - **Font:** https://doi.org/10.2217/fmb.14.91
    - **Text proposat:** «El <b>T4</b>, un dels fags més estudiats, infecta el bacteri…»

16. **[MENOR] El receptor del T4 no sempre és un sucre**
    - **On:** `index.html:145`: «un sucre de la paret exterior».
    - **Què falla:** les fibres del T4 reconeixen el lipopolisacàrid (LPS) o la proteïna porina OmpC, segons la soca. A *E. coli* K-12, és sobretot OmpC.
    - **Fonts:** Yap i Rossmann 2014 (LPS), https://doi.org/10.2217/fmb.14.91; https://pmc.ncbi.nlm.nih.gov/articles/PMC8315975 (OmpC i LPS; vist només a través de cercador).
    - **Text proposat:** «…reconeixen una molècula concreta de la superfície: segons la soca, un sucre o una proteïna de la membrana exterior.»

17. **[MENOR] El fag de ΦKZ no escapa a «gairebé totes» les defenses que tallen DNA**
    - **On:** `index.html:357`.
    - **Què falla:** Mendoza et al. 2020 diu «resistant to many immunity mechanisms that target DNA». Van provar Cas3, Cas9, Cas12a, HsdRMS i EcoRI; el fag és vulnerable a Cas13a, que talla RNA.
    - **Font:** https://doi.org/10.1038/s41586-019-1786-y
    - **Text proposat:** «…fora de l'abast de Cas9, de les tisores de restricció i de moltes altres defenses que tallen DNA. Però no de les que tallen RNA.»

18. **[MENOR] «Es va curar després de rebre» suggereix causalitat que el cas no demostra**
    - **On:** `index.html:378`.
    - **Què falla:** el resum de Schooley et al. 2017 diu que l'administració dels fags «was associated with» la recuperació. És un sol cas sense grup de control.
    - **Font:** https://doi.org/10.1128/AAC.00954-17
    - **Text proposat:** «…es va recuperar després de rebre un còctel de nou fags.»

19. **[MENOR] El tracrRNA no es va descobrir només a Umeå**
    - **On:** `crispr.js:226`: «L'equip d'Emmanuelle Charpentier, a Umeå (Suècia)».
    - **Què falla:** Deltcheva et al. 2011 té dues afiliacions, Umeå (MIMS) i la Universitat de Viena (Max Perutz Labs). Max Perutz Labs explica que els passos clau es van fer a Viena, i també a Umeå.
    - **Font:** https://www.maxperutzlabs.ac.at/research/key-discoveries/crispr/cas9-how-gene-scissors-work
    - **Text proposat:** «L'equip d'Emmanuelle Charpentier, entre Viena i Umeå (Suècia), descobreix el tracrRNA…»

20. **[MENOR] Les dades de Tesson inclouen també arqueus**
    - **On:** `index.html:259` («cada bacteri té cinc sistemes») i títol del gràfic («Quins sistemes de defensa porten els bacteris», `crispr.js:19`).
    - **Què falla:** les 21.738 genomes són de procariotes, és a dir, bacteris i arqueus. El peu ho diu, però el text i el títol no.
    - **Font:** https://doi.org/10.1038/s41467-022-30269-9 («On average prokaryotes encode five antiviral systems (5.2)… three distinct families»).
    - **Text proposat:** «De mitjana, cada genoma de bacteri o d'arqueu té cinc sistemes antivirals de tres famílies diferents…»

21. **[MENOR] El cap del T4 empaqueta una mica més de 168.903 lletres**
    - **On:** `index.html:139`.
    - **Què falla:** la seqüència única del genoma del T4 és de 168.903 parells de bases, però el cap n'empaqueta uns 172.000 perquè en repeteix un tros als extrems. La xifra no és errònia, però la frase «a dins hi porta» no és exacta.
    - **Font:** Yap i Rossmann 2014 (resum: «encapsidates a 172 kbp concatemeric dsDNA genome»).
    - **Text proposat (opcional):** «…el seu DNA: un genoma de <b>168.903 lletres</b> de codi genètic (de fet, n'hi cap una mica més, perquè en repeteix un tros).»

### Comprovat i correcte

- **DOI:** 50 DOI comprovats un a un amb `api.crossref.org/works/<doi>`. Tots resolen, i el primer autor, l'any, la revista, el volum i la pàgina coincideixen amb la llista de fonts. La llista inclou Mushegian 2020, Hendrix 1999, Whitman 1998, Suttle 2005/2007, Wigington 2016 (14 autors, que confirma «catorze investigadors»), Wilhelm i Suttle 1999, Weitz i Wilhelm 2012, Thingstad 2000, Twort 1915, Yap i Rossmann 2014, Miller 2003, Rabinovitch 1999, Casjens i Hendrix 2015, Campbell 2020, Touchon 2016, Tesson 2022, Doron 2018, Cohen 2019, Lopatina 2020, Ishino 1987, Mojica 1993/2000/2005, Jansen 2002, Pourcel 2005, Bolotin 2005, Barrangou 2007, Deveau 2008, Brouns 2008, Marraffini 2008, Garneau 2010, Deltcheva 2011, Jinek 2012, Gasiunas 2012, Cong 2013, Mali 2013, Makarova 2020, Bondy-Denomy 2013/2015, Mendoza 2020, Schooley 2017, Dedrick 2019, Pirnay 2018/2024, Jault 2019 i Fuerst-Wilmes 2025. Les URL del Nobel i de l'MHRA també funcionen.
- **Mushegian 2020:** «remains close to 10^31 and is unlikely to be either much less or much more». El text (`:201`) és correcte.
- **Suttle 2007 (resum):** 10³⁰ virus a l'oceà, «span farther than the nearest 60 galaxies», 10²³ infeccions per segon (= 100.000 trilions en escala llarga, correcte en català) i «~20 % of the oceanic microbial biomass daily».
- **Wigington:** el model 10:1 té «limited or no explanatory power», i els exponents són «typically less than 1».
- **Medianes de més de 1.000 m:** mediana de 36 virus per bacteri. Recalculat; no canvia amb la correcció.
- **Tesson 2022 (text complet):** 60 famílies; 5,2 sistemes de mitjana; 3 famílies per genoma; 1.450 genomes sense cap sistema; màxim de 57 (*Desulfonema limicola*). Del CSV de Source data: RM 83 %, CRISPR-Cas 39 %, Gabija 15 % i 25 famílies mostrades. Els 10 sistemes de Doron estan ben marcats.
- **Doron 2018:** nou sistemes antifag i un antiplasmidi; origen comú amb la immunitat innata.
- **Cohen 2019:** CBASS present en més del 10 % dels genomes i amb arrel comuna amb cGAS-STING.
- **T4 (Yap i Rossmann):** cua de 92,5 nm, fibres de 145 nm, almenys tres fibres enganxades, beina contreta de 42 nm, gir del cap de 345° «in the manner of a drill».
- **DNA del T4 desplegat:** 57 µm (168.903 × 0,34 nm). L'«unes 500 vegades» el cap i el «nou vegades menys» que l'amplada d'*E. coli* també són correctes.
- **Mides cel·lulars del dibuix (codi):** òvul de 120 µm, HeLa de 20 µm, glòbul vermell de 7,5 µm, *E. coli* de 2 × 1 µm. Concorden amb el text.
- **Touchon 2016:** «Nearly half of the sequenced bacteria are lysogens».
- **Lederberg 1951:** l'alliberament de lambda després d'irradiar *E. coli* K-12 amb UV és el que diuen Casjens i Hendrix 2015. Algunes fonts secundàries daten el descobriment el 1950 i el descriuen d'una altra manera; no s'ha pogut verificar contra la publicació original.
- **Història del CRISPR (informe Nobel):** 1987, cinc repeticions de 29 pb amb espaiadors de 32; 1993, 14 repeticions de 30 pb a *H. mediterranei*; 2000, família estesa; 2002, nom i gens *cas*; 2005, tres articles; 2007, Danisco; 2008–2012. Els resums de Mojica 2005, Barrangou 2007, Jinek 2012, Bondy-Denomy 2013 i Mendoza 2020 coincideixen amb el text. «Tretze anys» del 2007 al 2020: correcte. Nobel del 7/10/2020: correcte.
- **Teràpia amb fags:**
  - Pirnay 2024: «first 100 consecutive cases», 2008–2022, 77,2 % i 61,3 %, sense control.
  - Jault 2019 (PhagoBurn): centres de França i Bèlgica, aturat el 2/1/2017 per eficàcia insuficient, dosi real de 10² PFU/ml en lloc de 10⁶.
  - Dedrick 2019: 15 anys, fibrosi quística, tres fags, millora clínica.
  - Farmacopea Europea 5.31: en vigor des de l'1/1/2025 (Suplement 11.6, Swissmedic).
  - Armata: nota del 13/01/2026, fase 3 prevista per al segon semestre del 2026. No s'ha trobat confirmació que hagi començat; el verb «preparava» és prudent.
- **Etiquetes de gràfics:** la simulació i el curtcircuit estan ben etiquetats com a simulació o esquema; el CRISPR, com a «Esquema».
- **No verificable:**
  - Que cap teràpia amb fags tingui autorització a la UE o als EUA a data de novembre de 2026. Correcte segons Fuerst-Wilmes 2025, sense comprovació posterior.
  - Que Mojica pactés el nom CRISPR amb Jansen el 2001. Només en fonts secundàries; l'article no ho afirma, i està bé.
  - CRISPR al ~40 % dels bacteris i ~85 % dels arqueus (Makarova 2020). El text complet no ha estat accessible; l'article no ho afirma.
  - Els noms de déus protectors de Doron 2018. Text complet no accessible.

### Veredicte

L'article és rigorós en general: les fonts existeixen i coincideixen, el càlcul de les dades de Tesson és impecable, i la secció de teràpia amb fags té els matisos que cal. Hi ha, però, un error greu de dades. El gràfic central de l'oceà fa servir la versió original del conjunt de Wigington, i inclou 163 mostres d'aigua dolça que els autors van retirar en la correcció del 2017. Cal refer `dades.js`, la línia de tendència i quatre xifres del requadre i del text (5.508 mostres, 22 campanyes, 6,8 milions, 540.000, 11 a 1). Les conclusions qualitatives no canvien. També cal corregir:
- el got d'aigua, que implica 20 a 1;
- l'atribució de l'«origen» del 10³¹;
- el nombre de treballs de Mojica citats pel Nobel (quatre, no tres);
- la data de l'MHRA (15 de novembre);
- la frase sobre els anticossos i els fills;
- dues sobreafirmacions de la introducció: Mojica «el va desxifrar» i el CRISPR «corregeix el DNA».

Fet això, l'article es pot publicar.

---

## 3. Pols del Sàhara (web/articles/pols-del-sahara/)

Revisió feta el 17-11-2026 sobre `index.html`, `cover.html` i `pols-del-sahara.js`, contrastada amb les fonts primàries (text complet de Yu et al. 2015 GRL i RSE, resums oficials a Crossref/Europe PMC/NCBI de la resta). Les xifres dels CSV s'han recalculat: les mitjanes de la taula 2 de Yu RSE (182,2 / 131,8 / 43,1 Tg), els camions (1,108 M; 3.034/dia; 18.282 km), el fòsfor (27,7 Tg × 780 ppm ÷ 9,6·10⁸ ha = 22,5 g/ha) i la distància Bodélé–Manaus (8.816 km) quadren.

1. **[CRÍTIC] La metàfora de l'«aixeta» i el gràfic del balanç de fòsfor amaguen que la pols és una part petita del fòsfor que cau de l'aire**
   - Lloc: `index.html:274` («La pols del Sàhara és aquesta aixeta, que degota»); `index.html:286` («l'aixeta i el forat s'assemblen molt»); `index.html:283` (figcaption del balanç); `pols-del-sahara.js:461-470` (el gràfic només té tres barres: pols, rius i reciclatge); `pols-del-sahara.js:477` («Sense pols, no entraria fòsfor nou i la selva aniria perdent el que té»).
   - Problema: el text presenta la pols africana com L'entrada de fòsfor nou. Però la mateixa font principal diu el contrari. Yu et al. 2015 (GRL, §3.3) escriu que la deposició atmosfèrica total de fòsfor és de 161–300 g P/ha/any (Vitousek i Sanford 1986) i que el fòsfor de la pols «accounts for no more than 13% of the total atmospheric deposition». La resta ve sobretot d'aerosols biogènics i de fum de cremes. Conclou que el fòsfor de la pols és «relatively small» comparat amb aquests aerosols i amb el reciclatge. També avisa que el seu coneixement «does not warrant a claim with high level of confidence that there exists a missing source of phosphorus». Els autors ho tenien anotat (`fosfor_balanc.csv`, fila «Deposició atmosfèrica total… la pols n'és com a màxim el 13%»), però el gràfic ha deixat fora aquesta fila. A més, el text del gràfic per a 0 Tg («no entraria fòsfor nou») és fals: hi continuarien entrant el fum (Barkley et al. 2019, Mahowald et al. 2005) i altres aerosols. Matís: una part dels aerosols biogènics es recicla dins la mateixa conca, o sigui que no tot són entrades netes. Per això cal explicar-ho, no amagar-ho.
   - Fonts: https://acd-ext.gsfc.nasa.gov/People/Chin/papers/Yu_grl_2015.pdf (§3.3, p. 6–7); https://doi.org/10.1002/2015GL063040; Barkley et al. 2019, resum a Europe PMC: https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%2210.1073/pnas.1906091116%22&resultType=core&format=json
   - Text suggerit (`index.html:274`): «És com una banyera amb una bomba que fa circular l'aigua sense parar, i un forat petit al fons. Perquè no es buidi a la llarga, hi ha d'entrar aigua nova per alguna aixeta. La pols del Sàhara és una d'aquestes aixetes, que degota.»
   - Text suggerit (`index.html:286`): «Amb els números del satèl·lit, aquesta aixeta i el forat s'assemblen molt: unes 22.000 tones de fòsfor l'any, uns 23 grams per hectàrea (entre 7 i 39). Però no és l'única aixeta. Segons el mateix estudi, la pols aporta com a màxim un 13% de tot el fòsfor que cau de l'aire sobre la selva. La resta ve sobretot del fum dels incendis i de partícules d'origen biològic, una part de les quals es recicla dins la mateixa selva. I no tothom està d'acord amb els números.»
   - Text suggerit (JS:477, verdict per a 0 Tg): «Sense pols africana, la selva perdria una de les seves entrades de fòsfor nou, però no l'única: el fum dels incendis i altres partícules també n'hi porten.»
   - Gràfic: afegiu una quarta fila, «Cau de l'aire, de totes les fonts», amb 161–300 g/ha/any (fora d'escala, com el reciclatge). Figcaption (`index.html:283`), afegiu-hi: «La deposició atmosfèrica total de fòsfor (pols, fum i partícules biològiques) és de 161 a 300 grams per hectàrea i any; la pols n'és com a màxim un 13% (Yu et al. 2015, a partir de Vitousek i Sanford 1986).»

2. **[IMPORTANT] El titular i la descripció presenten la compensació com un fet establert**
   - Lloc: `index.html:7` i `index.html:9` (meta description i og:description): «Una part cau sobre l'Amazònia i li porta el fòsfor que la pluja li treu.»
   - Problema: la frase diu que la pols repon el fòsfor que es perd. Yu et al. 2015 només diu que l'entrada és «comparable» a la pèrdua hidrològica, amb un interval de 7 a 39 g/ha. Prospero et al. 2020 obté una deposició 3 vegades més baixa i diu que això posa en dubte l'efecte de la pols en la fertilitat. Tant el cos del text com la metodologia ja diuen que és un debat obert, però la descripció (la que es veu a xarxes i cercadors) no ho diu.
   - Fonts: https://acd-ext.gsfc.nasa.gov/People/Chin/papers/Yu_grl_2015.pdf; https://api.crossref.org/works/10.1029/2020GB006536 (resum: «Our results raise questions about the impact of African dust on soil fertility in Amazonia»).
   - Text suggerit (meta i og:description): «Cada any, el vent s'endu milions de tones de pols del Sàhara a l'altra banda de l'Atlàntic. Una part cau sobre l'Amazònia i li porta fòsfor, el nutrient que més li falta. Quant, encara es discuteix.»

3. **[IMPORTANT] «En unes dècades o uns segles es buida»: és una afirmació d'un sol estudi, i altres càlculs no la recolzen**
   - Lloc: `index.html:274`: «Si ningú no obre l'aixeta, en unes dècades o uns segles es buida.»
   - Problema: la frase ve de Yu et al. 2015 («would greatly deplete the soil phosphorus reservoir over a timescale of decades or centuries»), però l'article la converteix en un «es buida» sense matisos i no diu de qui és. Okin et al. 2004 (GBC) calcula que el fòsfor total del sòl, comparat amb l'entrada de la pols, triga de ~10⁴ a ~10⁷ anys a renovar-se. Dit d'una altra manera, l'estoc de fòsfor del sòl equival a desenes de milers d'anys de pèrdues de 8–40 g/ha. Okin també conclou que l'Amazònia depèn de la pols «for the maintenance of long-term productivity». La idea de fons és correcta, però el termini no està establert.
   - Font: https://doi.org/10.1029/2003GB002145 (resum via https://api.crossref.org/works?query.bibliographic=Okin+Impact+of+desert+dust+on+the+biogeochemistry+of+phosphorus); Yu GRL p. 7.
   - Text suggerit: «Si no hi entrés res de nou, la selva s'aniria empobrint a poc a poc. Quant trigaria és discutit: l'estudi del satèl·lit parla de dècades o segles; altres càlculs, de milers d'anys o més.»

4. **[IMPORTANT] «28 milions de tones» sense el marge d'error, que és molt ample**
   - Lloc: `index.html:212` («Cada any cauen sobre l'Amazònia uns 28 milions de tones»); `index.html:256`; `index.html:286` (22.000 t, 23 g/ha); `index.html:340` (Metodologia: «amb un marge d'error d'entre el 45% i el 70%»).
   - Problema: la xifra (27,7 Tg) és correcta i el context també (deposició dins la regió de Yu, DJF+MAM). Però a la font l'interval és **28 (8–48) Tg/any**, i el fòsfor és **0,022 (0,006–0,037) Tg, 23 (7–39) g/ha**. El text principal no dona mai aquests intervals. El ±45–70% de la metodologia és la incertesa dels fluxos de transport (Yu RSE), no la de la deposició a l'Amazònia. Al gràfic hi surt l'interval 8–48, però al text no.
   - Fonts: resum de Yu GRL, https://api.crossref.org/works/10.1002/2015GL063040 («28 (8–48) Tg a⁻¹ … 0.022 (0.006–0.037) Tg P … 23 (7–39) g P ha⁻¹ a⁻¹»); Yu RSE, https://acd-ext.gsfc.nasa.gov/People/Chin/papers/Yu_rse_2015.txt
   - Text suggerit (`index.html:212`): «Cada any cauen sobre l'Amazònia uns 28 milions de tones, sobretot a la meitat nord. És una estimació amb molt marge: podrien ser només 8 o arribar a 48.»
   - Text suggerit (Metodologia, `index.html:340`): «…del satèl·lit CALIPSO (Yu et al. 2015). Els fluxos de pols tenen un marge d'error d'entre el 45% i el 70%, i la pols que cau a l'Amazònia va de 8 a 48 milions de tones (millor estimació, 28).»

5. **[IMPORTANT] Error de física: l'aire humit no és més pesant**
   - Lloc: `index.html:170`: «l'aire del mar, que és més fresc i humit i, per tant, més pesant».
   - Problema: si la temperatura i la pressió són les mateixes, l'aire humit és **menys** dens que el sec, perquè el vapor d'aigua (18 g/mol) és més lleuger que el nitrogen i l'oxigen (~29 g/mol). L'aire marí queda per sota de la SAL perquè és més fresc, no perquè sigui humit. Tal com està escrita, la frase dona la humitat com a causa.
   - Font: NOAA JetStream, https://www.noaa.gov/jetstream/ll-heavyair
   - Text suggerit: «Quan arriba a la costa, aquest aire calent i sec no es barreja amb l'aire del mar, que és més fresc i humit. Com que és més fresc, és més dens, i l'aire del Sàhara hi passa per sobre, com l'oli sobre l'aigua.»

6. **[IMPORTANT] El gràfic dels camions fa creure que els 28 de l'Amazònia surten dels 43 que arriben al Carib**
   - Lloc: `index.html:261` (botons en l'ordre Surt d'Àfrica → A mig oceà → Al Carib → Cau a l'Amazònia); `index.html:265` (aria-label: «…43 al Carib, 28 cauen a l'Amazònia…»); `index.html:266`; `pols-del-sahara.js:386` i el botó «Reprodueix el viatge».
   - Problema: l'animació ensenya com una sola massa es va fent petita en un mateix viatge (182 → 132 → 43 → 28). Però a Yu GRL la deposició a l'Amazònia passa a la regió de 75°O fins a 40/50°O i ve de la pols que entra per l'est i pel nord. Cau **abans** d'arribar a 75°O i no forma part dels 43 Tg que creuen aquest meridià. L'ordre fa pensar que el 28 és un subconjunt del 43.
   - Fonts: Yu GRL §2–3.1 (definició de la regió i càlcul d'entrades i sortides): https://acd-ext.gsfc.nasa.gov/People/Chin/papers/Yu_grl_2015.pdf; Yu RSE (fluxos a 15°, 35° i 75°O): https://acd-ext.gsfc.nasa.gov/People/Chin/papers/Yu_rse_2015.txt
   - Solució: poseu «Cau a l'Amazònia» entre «A mig oceà» i «Al Carib», o bé afegiu-hi una nota. Figcaption suggerida (`index.html:266`): «Cada icona representa 20.000 camions de 25 tones (500.000 tones). La pols que cau a l'Amazònia no surt de la que arriba al Carib: cau abans, entre els 40–50° i els 75° oest. Quantitats anuals de Yu et al. 2015; càlcul de camions propi.»

7. **[MENOR] Darwin: detalls embellits i unitats barrejades**
   - Lloc: `index.html:103`: «va recollir del penell del pal major un grapat de pols»; `index.html:105`: «a centenars de quilòmetres de la costa, i alguna a més de mil milles».
   - Problema: Darwin parla de la pols «adhering to the under side of the horizontal wind-vane at the mast-head», filtrada per la gasa del penell. No diu de quin pal era ni parla d'un «grapat»: era pols fina enganxada. A més, la frase barreja quilòmetres i milles.
   - Font: https://darwin-online.org.uk/converted/published/1846_dust_F1672.html
   - Text suggerit: «…Charles Darwin, va trobar una pols marró finíssima enganxada a la gasa del penell, dalt del pal.» / «…pluges de pols a centenars de quilòmetres de la costa, i alguna a més de 1.600.»

8. **[MENOR] Gènere de «km²» i ubicació del Megatxad**
   - Lloc: `index.html:125` («unes 361.000 km²»), `index.html:328` («ocupava unes 361.000 km² del centre del Sàhara»), `pols-del-sahara.js:124` («unes 361.000 km²»).
   - Problema: «km²» es llegeix «quilòmetres quadrats», que és masculí, i per tant ha de ser «uns». El llac era al sud del Sàhara i al Sahel (aprox. 11–19°N), no al centre. La xifra de 361.000 km² no l'he pogut comprovar al cos d'Armitage 2015 (només n'he pogut llegir el resum). Altres fonts donen entre 340.000 i 400.000 km², de manera que l'ordre de magnitud és correcte. El període 11.500–5.000 anys i l'assecament fa uns 1.000 anys sí que surten al resum d'Armitage.
   - Font: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&id=4507243 (resum d'Armitage et al. 2015)
   - Text suggerit: «uns 361.000 km²» (a les tres ocurrències); glossari: «Llac gegant que fa entre 11.500 i 5.000 anys ocupava uns 361.000 km² al sud del Sàhara. L'actual llac Txad n'és una resta.»

9. **[MENOR] «Gairebé un de cada sis dies» es queda curt**
   - Lloc: `index.html:225`; `pols-del-sahara.js:232` (rètol «Catalunya»).
   - Problema: el 17–18% dels dies equival a 1 de cada 5,6–5,9, és a dir, una mica **més** d'un de cada sis. «Gairebé» vol dir el contrari. A més, el 17–18% de Pey et al. és el valor conjunt del NE d'Espanya, el SE de França i el nord d'Itàlia.
   - Font: https://acp.copernicus.org/articles/13/1395/2013/acp-13-1395-2013.pdf (§3.3: «NE Spain, SE France and northern Italy (17–18%)»)
   - Text suggerit: «Al nord-est peninsular passa, de mitjana, una mica més d'un de cada sis dies.» / rètol: «pols africana, un de cada sis dies».

10. **[MENOR] Període de Pey et al. mal citat**
    - Lloc: `index.html:306`: «Entre el 2001 i el 2010, al nord-est peninsular hi va haver pols africana el 17% o el 18% dels dies».
    - Problema: les freqüències de Pey et al. 2013 corresponen al període 2001–2011 (fig. 4). Els 1,1–1,5 µg/m³ són mitjanes «in most cases from 2001–2010».
    - Font: https://acp.copernicus.org/articles/13/1395/2013/acp-13-1395-2013.pdf
    - Text suggerit: «Entre el 2001 i el 2011, al nord-est peninsular hi va haver pols africana el 17% o el 18% dels dies, sobretot a l'estiu.»

11. **[MENOR] CALIPSO ja no funciona**
    - Lloc: `index.html:193` («el satèl·lit CALIPSO, que escaneja l'atmosfera»); `index.html:333` (glossari: «que porta un lidar»).
    - Problema: la missió científica de CALIPSO va acabar l'1 d'agost de 2023.
    - Fonts: https://www.nasa.gov/missions/calipso/first-long-duration-lidar-satellite-mission-calipso-ends ; https://cnes.fr/en/news/calipso-bows
    - Text suggerit: «…amb el satèl·lit CALIPSO, que fins al 2023 escanejava l'atmosfera amb un làser…» / glossari: «Satèl·lit de la NASA i l'agència espacial francesa (2006–2023) que portava un lidar…»

12. **[MENOR] Cunha et al. 2022: falta dir que els troncs no van créixer més**
    - Lloc: `index.html:272`: «Només el fòsfor la va fer créixer: en dos anys, un 29% més d'arrels fines i un 19% més de fulles i branques noves.»
    - Problema: el resum diu «strong responses … in fine root (+29%) and canopy productivity (+19%), but not stem growth». «La va fer créixer» fa pensar en arbres més grossos, i això no va passar.
    - Font: https://doi.org/10.1038/s41586-022-05085-2 (resum a Europe PMC)
    - Text suggerit: «Només el fòsfor la va fer més productiva: en dos anys, un 29% més d'arrels fines i un 19% més de fulles i branques noves, tot i que els troncs no van créixer més de pressa.»

13. **[MENOR] Límit de l'OMS sense data**
    - Lloc: `index.html:300`: «fa superar el límit de partícules recomanat per l'OMS gairebé un de cada deu dies».
    - Problema: Prospero et al. 2014 compara amb la guia del 2005 (PM10 diari de 50 µg/m³). El 2021 l'OMS la va abaixar a 45 µg/m³. El percentatge (9,0–9,2%) surt de les notes. Jo només he pogut comprovar el resum, que diu «frequently exceed».
    - Fonts: https://api.crossref.org/works/10.1002/2013GB004802 ; https://www.who.int/publications/i/item/9789240034228
    - Text suggerit: «…fa superar el límit diari de partícules que recomanava l'OMS (50 micrograms per metre cúbic) gairebé un de cada deu dies.»

14. **[MENOR] Metodologia: els 8–10 Mt de Prospero surten d'un model, no de les mesures a terra**
    - Lloc: `index.html:340`: «les mesures a terra de Prospero et al. (2020) donen una deposició a l'Amazònia unes tres vegades menor».
    - Problema: la deposició la calcula el model MERRA-2, validat amb les mesures diàries de Caiena. A `index.html:287` («Segons els seus càlculs») està ben dit.
    - Font: https://api.crossref.org/works/10.1029/2020GB006536
    - Text suggerit: «…el model validat amb mesures a terra de Prospero et al. (2020) dona una deposició a l'Amazònia unes tres vegades menor…»

15. **[MENOR] Ridley et al. 2012 es cita al gràfic però no és a la llista de fonts**
    - Lloc: `pols-del-sahara.js:428` («Model GEOS-Chem · Ridley et al. 2012»); la llista `index.html:343-373` no l'inclou.
    - Comprovat: el valor de 17 Tg (10°S–10°N, només terra) coincideix amb la taula 2 de Yu GRL. WRF-Chem 19, GOCART 26, MODIS 50 i Swap 13 (9–19) també coincideixen.
    - Text suggerit (font nova): «Ridley, D. A., Heald, C. L. i Ford, B. (2012). North African dust export and deposition: A satellite and model perspective. *Journal of Geophysical Research: Atmospheres* 117. doi.org/10.1029/2011JD016794». El DOI, el títol, la revista, el volum i l'any estan comprovats a Crossref (https://api.crossref.org/works/10.1029/2011JD016794). El número d'article (D02202) no l'he pogut confirmar.

16. **[MENOR] Discrepància a la font: la regió de Yu no fa 9,6 milions de km²**
    - Lloc: `index.html:283` i `index.html:340` («÷ 9,6 milions de km²»); `index.html:212` («uns 3 grams per metre quadrat»).
    - Problema (de la font, no de l'article): Yu GRL defineix la regió com 12°S–2°S × 75°–40°O més 2°S–8°N × 75°–50°O i diu que fa «about 9.6×10⁸ ha». Calculada sobre l'esfera, aquesta regió fa ~7,4 milions de km² (4,29 + 3,08). Si la regió és aquesta, els valors per superfície (28,9 kg/ha, 23 g P/ha) quedarien un ~23% per sota (≈3,8 g/m², ≈29 g P/ha). Els totals en Tg no canvien. L'article reprodueix bé la font. Només ho anoto perquè l'editor ho sàpiga.
    - Font: Yu GRL §2, p. 3 (càlcul propi: R²·Δλ·(sin φ₂ − sin φ₁)).
    - Text suggerit: cap canvi obligatori. Opcionalment: «…÷ la superfície de la regió segons els autors (9,6 milions de km²)».

17. **[MENOR] Tempestes del Bodélé: la xifra de 700.000 t és «per dia» a la font que es pot comprovar**
    - Lloc: `index.html:142`: «Hi ha tempesta de pols uns cent dies l'any, i cada una s'endu de mitjana unes 700.000 tones.»; `index.html:119`: «una depressió d'uns 150 quilòmetres de costat».
    - Problema: no he pogut accedir al cos de Washington et al. 2009 (PNAS/PMC bloquejats), així que els «cent dies» i els 150 km queden **no verificables**. Koren et al. 2006 diu que el Bodélé emet pols el 40% dels dies d'hivern, «averaging more than 0.7 million tons of dust per day». Una tempesta pot durar més d'un dia, així que «cada una» no és el mateix que «cada dia». La superfície de diatomita aflorant és de ~24.000 km² (Bristow et al., Birkbeck), compatible amb ~150 × 150 km.
    - Fonts: https://iopscience.iop.org/article/10.1088/1748-9326/1/1/014005 ; https://eprints.bbk.ac.uk/1737
    - Text suggerit: «Hi ha pols uns cent dies l'any, i els dies de tempesta en surten de mitjana més de 700.000 tones.» (si Washington 2009 no ho diu «per esdeveniment»).

18. **[MENOR] «Guarda la meitat de les selves tropicals que queden» no té font i les xifres varien**
    - Lloc: `index.html:106`.
    - Problema: el WWF dels EUA parla de «half of the planet's remaining tropical forests», mentre que el WWF d'Austràlia diu «nearly a third» de les selves tropicals. No hi ha cap font a la llista. L'he trobat a través de resultats de cerca; la pàgina del WWF dels EUA no s'ha pogut obrir (error 403).
    - Fonts: https://wwf.org.au/blogs/why-is-the-amazon-rainforest-so-important/ ; https://www.worldwildlife.org/stories/what-animals-live-in-the-amazon-and-8-other-amazon-facts
    - Text suggerit: «…i cau sobre l'Amazònia, la selva tropical més gran del món.»

19. **[MENOR] La quantitat «de cada mes» és interpolada**
    - Lloc: `index.html:249` («La quantitat de pols de cada mes segueix les dades de CALIPSO»); `pols-del-sahara.js:33-34` (fluxM interpola els percentatges estacionals).
    - Problema: la font no dona dades mensuals. Són quatre percentatges estacionals (escenari LDF, taula 1 de Yu RSE) interpolats mes a mes.
    - Font: https://acd-ext.gsfc.nasa.gov/People/Chin/papers/Yu_rse_2015.txt (taula 1)
    - Text suggerit: «Recorregut i altura segons Tsamalis et al. 2013 i Yu et al. 2015. La quantitat de pols segueix els percentatges per estació de CALIPSO, repartits entre els mesos.»

20. **[MENOR] «Un adob que canvia cada any» mostra la pols que surt, no la que cau a l'Amazònia**
    - Lloc: `index.html:311-312` i el gràfic `#years`.
    - Problema: el gràfic és correcte (valors AVE de la taula 2 de Yu RSE, comprovats), però ensenya el transport total, inclosa la pols d'estiu que va al Carib. La variació de la deposició a l'Amazònia (Yu GRL) és d'«as much as 29%» de la mitjana.
    - Font: Yu GRL §3.1, p. 3.
    - Text suggerit (afegit a `index.html:312`): «La que cau a l'Amazònia també varia: fins a un 29% amunt o avall de la mitjana, segons l'any.»

21. **[MENOR] El meridià 15° oest no és «just davant de la costa»**
    - Lloc: `index.html:192`.
    - Problema: entre 10° i 21°N, el meridià 15°O passa per terra (Guinea, Senegal, Mauritània). Dakar, per exemple, és a 17,4°O. Yu RSE en diu «the coast of North Africa at 15°W».
    - Text suggerit: «…creuen el meridià 15° oest, a l'altura de la costa africana, uns 182 milions de tones de pols.»

22. **[MENOR] La part del Bodélé és una estimació d'un sol estudi**
    - Lloc: `index.html:148`: «Un estudi del 2006 va calcular que gairebé la meitat de la pols que arriba a l'Amazònia surt d'aquest racó del Txad.»
    - Problema: la xifra és fidel a Koren et al. 2006 («about half»), però es basa en un total de 40 Mt/any que estudis posteriors han rebaixat a 28 (Yu) o 8–10 (Prospero 2020). A més, Prospero et al. 2014 apunta que la font dominant de la pols de primavera a Caiena és el Sahel. La nota d'Armitage ja ho matisa en part.
    - Fonts: https://iopscience.iop.org/article/10.1088/1748-9326/1/1/014005 ; https://api.crossref.org/works/10.1002/2013GB004802
    - Text suggerit (afegir a la nota, `index.html:149`): «…o que és molt recent. I altres mesures apunten que bona part de la pols que arriba a la Guaiana a la primavera ve del Sahel.»

23. **[MENOR] Kaufman et al. 2005 és un sol any**
    - Lloc: `index.html:294`: «de cada 240 milions de tones que surten d'Àfrica, 140 cauen a l'Atlàntic».
    - Problema: les xifres són correctes (240 ± 80 i 140 ± 40), però són de l'any 2001. Yu et al. 2015 conclou que el mateix estudi sobreestimava la pols que cau a l'Amazònia (50 Tg).
    - Font: https://api.crossref.org/works/10.1029/2003JD004436
    - Text suggerit: «Segons un altre càlcul fet amb satèl·lit per a l'any 2001, de cada 240 milions de tones que van sortir d'Àfrica, unes 140 van caure a l'Atlàntic.»

### Comprovat i correcte

- **DOI (29/29 resolts a Crossref):** títol, primer autor, revista, volum, pàgines i any coincideixen per a Yu GRL 2015, Yu RSE 2015, Prospero 2020, Barkley 2019, Koren 2006, Washington 2009, Armitage 2015, Bristow 2010, Bristow 2009, Tsamalis 2013, Carlson i Prospero 1972, Velasco-Merino 2018, Cunha 2022, Vitousek i Sanford 1986, Swap 1992, Kaufman 2005, Mills 2004, Jickells 2005, Muhs 2007, Dunion i Velden 2004 (353–366), Evan 2006, Braun 2010, Francis 2020, Prospero 2014, Prospero i Lamb 2003, Evan 2016, Pey 2013, Rodríguez i López-Darias 2024 i Prospero 2002. La URL de la NASA (22-2-2015) i la de darwin-online funcionen.
- **Yu RSE:** 182 / 132 / 43 Tg/any a 15° / 35° / 75°O, integrats entre 10°S i 30°N, amb una incertesa de ±(45–70)%. 2011 és l'any mínim. Els valors de la taula 2 del JS i del CSV coincideixen any per any i la mitjana recalculada també. Els percentatges estacionals (23/21/46/10 i 11/16/61/12) són els de la taula 1 (LDF). Hivern i primavera: 0–10°N. NASA: els 43 Mt «settle over the Caribbean».
- **Yu GRL:** 27,7 Tg/any (28,9 kg/ha); DJF 11,9 i MAM 15,8 Tg; estiu i tardor negligibles; 86% per via humida (GOCART); 780 ppm de fòsfor (Bristow 2010); 0,022 Tg P = 23 g/ha; reciclatge 1.400–4.100 i pèrdues 8–40 g/ha/any; anticorrelació amb la pluja del Sahel de l'any anterior; taula 2 d'altres estimacions. L'article diu «28 Mt» en el context correcte (deposició a l'Amazònia, no pas pols que arriba a 75°O).
- **Tsamalis 2013:** juny 2006 – maig 2011; hivern 0–3 km → 0–2 km; estiu 1–5 km → 0–2 km al golf de Mèxic; aire marí net per sota fins a ~50°O.
- **Travessia:** 5–7 dies fins al Carib (Velasco-Merino 2018). Dakar–Barbados: 4.552 km.
- **Prospero 2020:** Caiena 2002–2017 (16 anys), 8–10 Tg, deposició més alta al N i NE i baixa a l'Amazònia central. «Tres vegades menys» és correcte (27,7/9).
- **Barkley 2019:** el fum de l'Àfrica austral aporta «up to half of the P deposited annually to the Amazon from transported African aerosol».
- **Washington 2009:** el Bodélé produeix «about half» de la pols del Sàhara, que és la font més gran del món; algunes simulacions preveuen més pols a final de segle.
- **Koren 2006:** 0,2% del Sàhara; «about half» de la pols de l'Amazònia.
- **Armitage 2015:** nivell alt del llac de fa 11.500 a 5.000 anys; caiguda ràpida fa ~5.000 anys; Bodélé sec fa ~1.000 anys; el seu paper com a adob està «overstated or geologically recent».
- **Bristow 2010:** fins a 6,5 Tg de Fe i 0,12 Tg de P. Erosió de fins a 4 m de sediment (EGU 2011), on caldria afegir «localment».
- **Altres:** Carlson i Prospero 1972, primera descripció de la SAL (nota de premsa NOAA 2004). Francis 2020, AOD més alta registrada. Darwin: gener de 1832, 22 anys, 67 formes (65 d'aigua dolça), «sens dubte» d'Àfrica. Cunha 2022: 60% de la conca, +29% i +19%. Mills 2004. Muhs 2007 (Bahames i Keys). Evan 2016 (sèrie de 161 anys; màxims 1910–1940 i 1970–1980, mínim als 2000; baixada projectada). Prospero i Lamb 2003. Pey 2013 (Sicília 37%, 1,1–1,5 µg/m³, predomini d'estiu a l'oest). Rodríguez i López-Darias 2024 (sis episodis sense precedents 2000–2022; 14–20 de març de 2022; SE peninsular fins a 3.070 µg/m³ de mitjana de 24 h; normalment < 100). Bodélé–Manaus: 8.816 km («gairebé 9.000»). Megatxad ≈ 11,2 vegades Catalunya.
- **Gràfics:** totes les dades del JS que he contrastat coincideixen amb els CSV i les fonts. Els esquemes (mapa del Bodélé, tall de la SAL i partícules) estan etiquetats com a esquemes al peu i a la metodologia. La portada (`cover.html`) no té text ni dades.

### Veredicte

L'article és rigorós en les xifres: no he trobat cap número inventat ni mal transcrit, i els gràfics de dades reprodueixen bé Yu et al. 2015. El problema greu és de relat. La metàfora de l'aixeta i el gràfic del balanç de fòsfor presenten la pols africana com l'única entrada de fòsfor nou. En canvi, la mateixa font principal diu que en aporta com a màxim un 13% de la deposició atmosfèrica i que no es pot afirmar amb confiança que la selva en depengui. Els autors tenien aquesta dada a les notes i l'han deixat fora del gràfic. Cal corregir-ho (punt 1), suavitzar el titular i el termini de «dècades o segles» (punts 2–3), donar el marge 8–48 Mt al text (punt 4), arreglar l'error de física de l'aire humit (punt 5) i l'ordre enganyós dels camions (punt 6). Amb aquests canvis i els retocs menors, l'article es pot publicar.

---

## 4. Cinta transportadora (web/articles/cinta-transportadora/)

Abast de la revisió: tot el text visible d'`index.html` (incloent-hi glossari, metodologia i fonts), totes les xifres i etiquetes fixades al codi de `cinta-transportadora.js`, l'estructura de `dades.js` (revisada contra els CSV de recerca) i `cover.html` (no té text). He recalculat les estadístiques de RAPID a partir de `rapid-26n-mensual.csv`, he reimplementat l'EOS-80 i l'he comprovat amb el valor de control de la UNESCO, he revisat el tall WOA23 a 25,5° O, els perfils del Labrador i de Groenlàndia, l'anomalia zonal NCEP i els valors puntuals del globus (amb l'arrodoniment del JS). He comprovat a Crossref els 36 DOI d'articles de la llista (tots existeixen i el títol, els autors, la revista, el volum i l'any coincideixen) i a DataCite el DOI de les dades RAPID.

### Problemes

1. **[IMPORTANT] La densitat de l'aigua del fons és la d'un litre portat a la superfície, no la real.**
   - *Nota de la revisió final:* el subagent ho va classificar com a CRÍTIC. Es rebaixa a IMPORTANT perquè comparar densitats potencials és la pràctica estàndard, i la metodologia i el peu ja ho expliquen. Tot i així, la frase del cos del text és imprecisa.
   - On: `index.html:152`. Text: «Un litre de l'aigua freda que omple el fons de l'Atlàntic, uns 1.028.» (i a la línia 153, «aquests quatre grams fan girar tot el sistema»).
   - Què falla: 1.027,9 kg/m³ és la *densitat potencial* (σ0) de l'aigua profunda de l'Atlàntic nord, és a dir, la que tindria a la pressió de superfície. A la fondària on és, la pressió la comprimeix i un litre pesa uns 1.041 g a 3.000 m i uns 1.046 g a 4.000 m. Ho he calculat amb l'equació d'estat UNESCO/EOS-80 a alta pressió (el valor de control, 1.062,538 kg/m³ a S = 35, T = 25 °C i 10.000 dbar, surt exacte). La metodologia i el peu de la figura ja diuen que el càlcul és «a la pressió de superfície», però aquesta frase del text, la primera que llegeix el lector, presenta la xifra com si fos literal. Comparar aigües a la mateixa pressió és precisament el que fa servir la física, i el text ho hauria de dir.
   - Font: Millero i Poisson 1981, https://doi.org/10.1016/0198-0149(81)90122-9; equació a alta pressió UNESCO 1981 (Technical Papers in Marine Science 36). Càlcul propi.
   - Proposta: «Un litre d'aigua del corrent del Golf, davant de Florida, pesa uns 1.024 grams. Un litre de l'aigua freda que omple el fons de l'Atlàntic, si el poguéssim pujar a la superfície sense que s'escalfés, en pesaria uns 1.028. (Allà baix, aixafat per quilòmetres d'aigua, en pesa més, però per comparar aigües cal fer-ho a la mateixa pressió.)»

2. **[IMPORTANT] Atribuir el motor de la cinta «sobretot» a la densitat és una qüestió debatuda.**
   - On: `index.html:151`. Text: «La cinta no la mou només el vent. La mou, sobretot, una regla molt senzilla: l'aigua més densa baixa i la més lleugera queda a sobre».
   - Què falla: les revisions de referència concloen que l'energia que manté la bolcada la donen la barreja vertical (marees i vent) i l'aflorament de l'oceà Antàrtic empès pel vent. Els fluxos de calor i d'aigua dolça en determinen la forma i el volum, però no hi aporten energia en estat estacionari. La qüestió continua oberta. El mateix article, més endavant (línies 227 i 415, Baker et al. 2025), dona un paper clau als vents de l'oceà Antàrtic, cosa que contradiu el «sobretot».
   - Fonts: Kuhlbrodt et al. 2007, *Rev. Geophys.* 45, https://doi.org/10.1029/2004RG000166 (resum: «both wind-driven upwelling and vertical mixing are likely contributing to driving»; els fluxos de superfície «without actually supplying energy»); Wunsch 2002, *Science* 298:1179, https://doi.org/10.1126/science.1079329.
   - Proposta: «La cinta no la mou una sola cosa. Hi ha una regla molt senzilla que n'explica la forma: l'aigua més densa baixa i la més lleugera queda a sobre, com l'oli que sura damunt del vinagre. Però l'energia que la manté en marxa ve sobretot del vent i de les marees, que remenen l'oceà i fan pujar l'aigua del fons.»

3. **[IMPORTANT] L'article no diu enlloc que la imatge de la «cinta» mateixa és una simplificació, i descriu el camí de tornada com un sol corrent de vora.**
   - On: `index.html:146` («el nom s'ha quedat») i `index.html:227`: «baixa cap al sud enganxada a la costa americana». També el glossari, `index.html:431`.
   - Què falla: les línies del globus estan ben etiquetades com a esquema (`index.html:251`), però el concepte mateix no. Els flotadors i els models dels anys 2000 van mostrar que la major part de l'aigua profunda recent surt del corrent profund de vora oest i baixa per camins interiors, i que els remolins i el vent conformen la bolcada. Avui el model de «cinta» continu es considera una simplificació útil, no una descripció literal.
   - Fonts: Lozier 2010, «Deconstructing the conveyor belt», *Science* 328:1507, https://doi.org/10.1126/science.1189250; Bower et al. 2009, *Nature* 459:243, https://doi.org/10.1038/nature07979 («the dominant route … is via internal pathways rather than the DWBC»).
   - Proposta per a la línia 146, després de «i el nom s'ha quedat»: «És una imatge útil, però simplificada: avui se sap que l'aigua no viatja com en una cinta contínua, sinó per molts camins, empesa també pels remolins i pel vent.» Proposta per a la línia 227: «L'aigua enfonsada, l'aigua profunda de l'Atlàntic nord, baixa cap al sud entre 1.500 i 4.000 metres de fondària: una part enganxada a la costa americana i una part, potser la major, per camins més tortuosos pel mig de l'oceà.»

4. **[IMPORTANT] Al tall per 25,5° O, la «llengua salada» més visible del nord és aigua mediterrània, no aigua profunda de l'Atlàntic nord.**
   - On: `index.html:270-271`: «Una llengua d'aigua més salada surt del nord i s'estira cap al sud entre 1.500 i 4.000 metres». Anotació `cinta-transportadora.js:310`: «Surt del nord», a [52° N, 700 m].
   - Què falla: al CSV del mateix tall (`woa23-tall-25W.csv`), el màxim de salinitat a mitja fondària del nord és entre 30 i 45° N i entre 800 i 1.200 m, amb salinitats de 35,4–35,6 (35,58 a 35,5° N i 1.000 m). Això és la llengua d'aigua mediterrània, que surt per Gibraltar i s'escampa cap a l'oest. L'aigua profunda de l'Atlàntic nord, entre 1.500 i 4.000 m, té 34,9–35,0. Amb la rampa de color de la línia 133 del JS, la taca mediterrània és la més fosca de la meitat nord, i el lector la confondrà amb «la llengua que surt del nord». El text n'hauria de donar el nom.
   - Fonts: dades WOA23 del CSV (càlcul propi); llengua mediterrània a ~1.000–1.200 m que travessa gairebé tot l'Atlàntic nord: *Ocean Science* 15:565 (2019), https://os.copernicus.org/articles/15/565/2019/os-15-565-2019.pdf.
   - Proposta (afegir a la línia 271): «La taca més salada que es veu cap als 1.000 metres davant de la península Ibèrica és una altra cosa: aigua de la Mediterrània, que surt per l'estret de Gibraltar i s'escampa per l'Atlàntic. També aporta sal a l'aigua profunda que baixa cap al sud.»

5. **[IMPORTANT] El text diu «a uns 3 o 4 °C» per sota de 2.000 m, però al terç sud del tall l'aigua és entre −0,9 i 2 °C. El gràfic diu «de 0 a 4 °C».**
   - On: `index.html:265`: «i per sota de 2.000, a uns 3 o 4 °C»; contradiu l'anotació `cinta-transportadora.js:309`, «Aigua freda: de 0 a 4 °C».
   - Què falla: al tall WOA23, la temperatura potencial per sota de 2.000 m va de −0,89 °C (65,5° S, 4.900 m) a 4,0 °C (29,5° N, 2.000 m). Al sud de ~45° S i a tot arreu per sota de ~4.000 m és inferior a 2 °C.
   - Font: `woa23-tall-25W.csv` (càlcul propi).
   - Proposta: «Per sota d'uns 1.000 metres l'aigua és a menys de 10 °C a tot arreu, i per sota de 2.000, entre 0 i 4 °C, i fins i tot per sota de zero a prop de l'Antàrtida.»

6. **[IMPORTANT] El text presenta com a fet establert que els icebergs de Heinrich van fer aturar la cinta.**
   - On: `index.html:340`: «Tota aquella aigua dolça va fer més lleugera la superfície del nord. Al fang de les Bermudes, el protoactini s'enfila … la cinta va quedar gairebé o del tot aturada.»
   - Què falla: McManus et al. 2004 diuen que l'afebliment comença «with» H1, és a dir, coincideix amb l'esdeveniment, no que en sigui l'efecte. Barker et al. 2015 van trobar que, en quatre cicles glacials, els icebergs arriben *després* del refredament. Segons ells, no en són el desencadenant, tot i que poden reforçar-lo. La nota de la línia 342 diu que «les causes exactes … es debaten», però la frase principal afirma la causa.
   - Fonts: McManus et al. 2004, https://doi.org/10.1038/nature02494 (resum); Barker et al. 2015, *Nature* 520:333, https://doi.org/10.1038/nature14330 (resum: «icebergs typically arrived too late to have triggered cooling … may provide a positive feedback»).
   - Proposta: «Fa uns 17.500 anys, al final de l'última glaciació, una allau d'icebergs es va desprendre del gel que cobria el Canadà. … Al fang de les Bermudes, el protoactini s'enfila fins gairebé el màxim: la cinta va quedar gairebé o del tot aturada. L'aigua dolça dels icebergs hi va contribuir, però no està clar que en fos la causa: alguns estudis troben que el fred i l'afebliment van començar abans que arribessin els icebergs.» Fonts que caldria afegir: Barker et al. 2015.

7. **[IMPORTANT] Hi falta un matís de Seager que afecta precisament Noruega.**
   - On: `index.html:323-327`, el bloc de Seager, que s'il·lustra amb Bergen (60° N) i el mar de Noruega (67° N).
   - Què falla: el resum complet de Seager et al. 2002 limita la conclusió a «western Europe south of 60°N». Al nord dels 60° N, el transport de calor oceànic explica «about a quarter of the contrast by restricting winter sea-ice cover». La taca de +25 °C del mar de Noruega, que el text fa servir d'exemple, és just on l'oceà hi compta més. La resta del bloc és correcta (ho he comprovat al PDF): ~3 °C de refredament a l'Europa occidental i a l'est d'Amèrica del Nord, més de 6 °C prop d'Islàndia, mapa de gener i gel marí fix al model CCM3.
   - Font: Seager et al. 2002, PDF de Lamont-Doherty: https://ocp.ldeo.columbia.edu/res/div/ocp/gs/pubs/Seager_etal_QJ_2002.pdf
   - Proposta (afegir després de la línia 326): «Més al nord, a partir dels 60 graus, el mateix estudi trobava que la calor de l'oceà sí que pesa més: en mantenir el mar lliure de gel a l'hivern, explicava una quarta part del contrast.»

8. **[IMPORTANT] Les reanàlisis s'atribueixen a «les observacions», i s'hi barregen dos indicadors diferents de van Westen.**
   - On: `index.html:414`: «i les observacions diuen que la cinta real «va cap al punt de no retorn». El 2025, amb 25 models, van estimar…»
   - Què falla: (a) van Westen et al. 2024 basen la frase en *reanàlisis*: «Reanalysis products indicate that the present-day AMOC is on route to tipping». El text complet adverteix que aquests productes tenen biaixos i són massa curts per estimar la distància al punt de no retorn. (b) L'estudi del 2025 (JGR Oceans) fa servir un *altre* indicador, «diagnosed from the surface buoyancy fluxes over the North Atlantic», no el transport d'aigua dolça a 34° S. Tal com està escrit, sembla que el mateix indicador doni el 2063. El tooltip del JS (`cinta-transportadora.js:563`) sí que descriu bé l'indicador del 2025.
   - Fonts: https://doi.org/10.1126/sciadv.adk1189 (resum) i text complet a https://pmc.ncbi.nlm.nih.gov/articles/PMC10857529/; https://doi.org/10.1029/2025JC022651 (resum a Crossref).
   - Proposta: «…Hi van trobar un indicador mesurable, la quantitat d'aigua dolça que la cinta porta a l'extrem sud de l'Atlàntic, i segons les reanàlisis (reconstruccions que combinen observacions i models) la cinta real «va cap al punt de no retorn», tot i que aquestes dades són massa curtes per dir a quina distància. El 2025, amb un altre indicador basat en els intercanvis de calor i d'aigua dolça entre l'oceà i l'aire a l'Atlàntic nord, aplicat a 25 models, van estimar que el col·lapse podria començar cap al 2063…»

9. **[MENOR] El gràfic i el text no coincideixen en la temperatura davant de Noruega.**
   - On: `index.html:211` diu «a uns 9 °C»; l'anotació del globus (`cinta-transportadora.js:211`) mostra «8 °C davant de Noruega».
   - Què falla: el JS arrodoneix les coordenades a la cel·la de 2° més propera (67,5° N, 6,5° E), que té 8,3 °C, mentre que el text fa servir la cel·la d'1° de 66,5° N 5,5° E, amb 8,6 °C.
   - Font: `dades.js` i `woa23-superficie-atlantic-1deg.csv`.
   - Proposta: «…arriba a la costa de Noruega, de mitjana, a uns 8 o 9 °C.» (o fer que l'anotació llegeixi la mateixa cel·la).

10. **[MENOR] L'anècdota de Franklin segueix la versió divulgativa de la Library of Congress, no el relat de Franklin.**
    - On: `index.html:144`: «anar en vaixell d'Amèrica a Anglaterra costava menys temps que fer el camí de tornada.»
    - Què falla: la fitxa de la LoC diu exactament això, o sigui que la frase coincideix amb la font citada. Però el problema concret que Franklin va plantejar a Folger el 1768 era que els paquebots de correu de Falmouth a Nova York trigaven unes dues setmanes més que els mercants de Londres a Rhode Island. Totes dues travessies eren cap a l'oest.
    - Fonts: https://www.loc.gov/exhibits/franklin/franklin-scientist.html; Richardson 1980, *Science* 207:643, https://doi.org/10.1126/science.207.4431.643.
    - Proposta: «Cap al 1768, Benjamin Franklin, que dirigia el correu de les colònies, es va fixar en una cosa estranya: els vaixells correu que anaven d'Anglaterra a Nova York trigaven unes dues setmanes més que els mercants que feien un camí semblant.»

11. **[MENOR] OSNAP Oest: «menys de 3» no encaixa amb la xifra publicada.**
    - On: `index.html:222`: «uns 16 milions de m³/s, contra menys de 3 al Labrador».
    - Què falla: Fu et al. 2023 (2014–2020) donen 16,3 ± 0,6 Sv a l'est i 3,0 ± 0,5 Sv a l'oest. El web d'OSNAP dona 2,7 Sv.
    - Font: Fu et al. 2023, *Commun. Earth Environ.* 4:181, https://doi.org/10.1038/s43247-023-00848-9.
    - Proposta: «…uns 16 milions de m³/s, contra uns 3 al Labrador.»

12. **[MENOR] Caesar et al. 2018: la taca subpolar es va refredar, no només «s'escalfa menys».**
    - On: `index.html:364`: «una taca d'aigua que s'escalfa menys que la resta al sud de Groenlàndia».
    - Què falla: el resum parla de «a pattern of cooling in the subpolar Atlantic Ocean». A més, Terhaar et al. 2025 qüestionen justament aquest mètode de l'empremta de temperatura («cannot robustly reconstruct the AMOC»). Seria el contrapunt natural al text.
    - Fonts: https://doi.org/10.1038/s41586-018-0006-5; https://doi.org/10.1038/s41467-024-55297-5.
    - Proposta: «…una taca d'aigua al sud de Groenlàndia que s'ha refredat mentre la resta de l'oceà s'escalfava… Però el 2025, un estudi que reconstrueix la cinta a partir de la calor que l'oceà cedeix a l'aire no hi va trobar cap disminució entre el 1963 i el 2017, i va concloure que l'empremta de la temperatura no és un bon termòmetre de la cinta.»

13. **[MENOR] A la tendència de McCarthy et al. 2025 li falta el signe i la conclusió principal.**
    - On: `index.html:363`: «Una anàlisi del 2025 hi calcula una tendència d'1 Sv per dècada, amb un rang entre 0,4 i 1,6.»
    - Font: resum de McCarthy et al. 2025, https://doi.org/10.1029/2025GL115055: «weakening of 1.0 [0.4–1.6] Sv per decade from 2004 to 2023, consistent with climate model projections and not consistent with a collapse in the mid-21st century». La meva regressió amb el CSV, d'abril del 2004 a març del 2024, dona −0,92 Sv per dècada. És coherent.
    - Proposta: «Una anàlisi del 2025 hi calcula una baixada d'1 Sv per dècada (entre 0,4 i 1,6) del 2004 al 2023: coherent amb el que preveuen els models, però no amb un col·lapse a mitjan segle.»

14. **[MENOR] Ditlevsen: falten les xifres originals, la hipòtesi d'escenari i la referència de la crítica.**
    - On: `index.html:413`.
    - Què falla: la xifra corregida (2065, IC del 95 % 2037–2109) és correcta i l'he verificada a l'article corregit i a la nota de correcció. Però la premsa del 2023 va difondre l'interval 2025–2095, i convé dir que se suposa que les emissions continuen al ritme actual («under the current scenario of future emissions»). La crítica no té cap font a la llista.
    - Fonts: https://www.nature.com/articles/s41467-023-39810-w (text corregit) i https://doi.org/10.1038/s41467-025-63201-y; Ben-Yami et al. 2024, *Sci. Adv.* 10:eadl4841, https://doi.org/10.1126/sciadv.adl4841.
    - Proposta: «…Van estimar que, si les emissions continuaven com fins ara, el col·lapse arribaria cap a mitjan segle (la xifra que va córrer, entre el 2025 i el 2095). El 2025 van corregir un error del seu codi: l'estimació actual és el 2065, amb un interval de confiança del 95 % entre el 2037 i el 2109. Altres científics hi han objectat que la temperatura d'aquella zona no depèn només de la cinta, i que les incerteses són massa grans per predir una data així.» A les fonts: Ben-Yami et al. 2024.

15. **[MENOR] Drijfhout et al. 2025: «simulacions fins al 2300» és inexacte.**
    - On: `cinta-transportadora.js:565`.
    - Què falla: el resum parla d'extensions «beyond year 2100–2300/2500».
    - Font: https://doi.org/10.1088/1748-9326/adfa3b.
    - Proposta: `y:"2025, simulacions fins al 2300 o el 2500"`.

16. **[MENOR] Rang de van Westen et al. 2025: no se sap quins percentils defineixen 2026–2095.**
    - On: `index.html:415`; `cinta-transportadora.js:563-564`.
    - Què falla: el resum que es pot llegir a Crossref no conserva els percentils, i no he pogut obrir la pàgina de l'editor. És **no verificable**. Les xifres 2063 (2026–2095) i 2055 (2023–2076) i els 25 models sí que les he verificades.
    - Proposta: mentre no es comprovi, escriure «amb un rang ampli, entre el 2026 i el 2095».

17. **[MENOR] Al model de Stommel, l'estat «aturat» és en realitat una circulació feble i invertida.**
    - On: `cinta-transportadora.js:497` («Cinta gairebé aturada») i `index.html:371`.
    - Què falla: a la branca de baix (x > 1), q = 1 − x és negatiu, és a dir, una circulació feble que gira al revés (fins a −0,21 en el rang del control). És un detall del model conceptual, però el peu de figura ja és molt didàctic.
    - Proposta d'etiqueta: «Cinta molt feble (fins i tot del revés)».

18. **[MENOR] Al glossari, els 1,2 PW s'atribueixen sencers a «la cinta».**
    - On: `index.html:436`: «La cinta porta uns 1,2 PW de calor cap al nord a 26,5° N.»
    - Què falla: 1,20 ± 0,12 PW és el transport total de l'Atlàntic a 26,5° N (2004–2020); la circulació de bolcada en porta «approximately 90%».
    - Font: Johns et al. 2023, https://doi.org/10.1098/rsta.2022.0188 (resum i PMC10590663).
    - Proposta: «L'Atlàntic porta uns 1,2 PW de calor cap al nord a 26,5° N, la major part gràcies a la cinta.»

19. **[MENOR] Pacífic nord: «l'aigua no s'enfonsa» és massa absolut.**
    - On: `index.html:324`.
    - Què falla: al Pacífic nord no es forma aigua *profunda*, però sí aigua intermèdia (a la mar d'Okhotsk).
    - Proposta: «…i al Pacífic nord no hi ha cap cinta transportadora: allà l'aigua de superfície no arriba a enfonsar-se fins al fons.»

20. **[MENOR] «S'ha aturat» és més fort que les proves.**
    - On: `index.html:331` (títol «Ja s'havia aturat abans») i `index.html:424` («la cinta s'ha aturat en el passat»).
    - Què falla: McManus diu «nearly, or completely, eliminated» per a H1, i per al Younger Dryas només «declined sharply but briefly». El proxy té matisos, com ja reconeix la nota de la línia 342.
    - Proposta: «la cinta s'ha aturat o gairebé aturat en el passat».

21. **[MENOR] Paràfrasi imprecisa de l'IPCC sobre el segle XX.**
    - On: `index.html:365`: «hi ha confiança baixa que la cinta s'hagi afeblit al segle XX».
    - Què falla: el text literal de l'AR6 és: «For the 20th century, there is low confidence in reconstructed and modelled AMOC changes because of their low agreement in quantitative trends».
    - Font: IPCC AR6 GT1, cap. 9, resum executiu (PDF https://www.ipcc.ch/report/ar6/wg1/downloads/report/IPCC_AR6_WGI_Chapter09.pdf).
    - Proposta: «…hi ha confiança baixa en els canvis de la cinta al segle XX que donen les reconstruccions i els models, perquè no coincideixen en la tendència.»

22. **[MENOR] Corrent del Golf o corrent de Florida: el nom canvia entre el text i el gràfic.**
    - On: `index.html:201` i l'anotació del globus diuen «corrent del Golf… 32 milions»; el gràfic de quadradets i RAPID diuen «corrent de Florida».
    - Proposta (línia 201): «Entre Florida i les Bahames, el corrent del Golf, que en aquest tram els oceanògrafs anomenen corrent de Florida, mou de mitjana uns 32 milions de metres cúbics per segon.»

### Comprovat i correcte

- **RAPID, recalculat amb el CSV de 240 mesos (abril 2004 – març 2024):**
  - Mitjanes: AMOC 16,97 Sv; Florida 31,69; Ekman 3,72; oceà obert −18,37. Quadra amb «17 Sv», «31,7», 170 i 317 quadradets.
  - Valors mensuals: màxim 24,99 (setembre 2004); mínim 6,64 (març 2013). Quadra amb «mesos amb 25 Sv i mesos amb menys de 10». Mínim del 2009–10: 8,19 (gener 2010), coherent amb l'aria-label «fins a valors mensuals de 8».
  - Períodes: 2004–08 = 18,66 i 2008–24 = 16,55 (al gràfic, 18,7 i 16,6); 2009–10 = 12,98 (al gràfic, «13,0, un 30 % menys»). El text cita 18,5 → 12,8 (McCarthy 2012, resum verificat) i 18,8 → 16,1 (Smeed 2018, citat literalment a l'AR6 cap. 9, p. 1238). La diferència de versió ja s'adverteix al peu.
  - Tendències: AMOC −0,92 Sv per dècada; corrent de Florida 0,00 Sv per dècada, coherent amb la correcció de Volkov et al. 2024 (resum verificat).
  - DOI de les dades (DataCite): Moat et al., 2026, «April 2004 to March 2024», correcte.
- **EOS-80:** els coeficients del JS reprodueixen el valor de control 1.023,343 kg/m³ (S = 35, T = 25 °C). Florida 1.023,6; Groenlàndia a l'hivern 1.027,95; ràtios de l'efecte de 1 °C contra 0,1 de salinitat: 2,19 a 10 °C («més del doble») i 1,16 a 3 °C («gairebé el mateix»). La fórmula del punt de congelació (UNESCO) dona −1,92 °C a S = 35. Els perfils fan servir temperatura potencial, de manera que el resultat és densitat potencial (correcte). Els perfils del Labrador i de Groenlàndia són monòtons, amb inversions < 0,005 kg/m³. La diferència amb TEOS-10 «< 0,01 kg/m³» és **no verificable** aquí (no hi ha `gsw` instal·lat).
- **Valors del globus:** 37,4 de salinitat màxima, 27 °C davant de Florida, 1.027,8 kg/m³ al mar de Groenlàndia (mitjana anual).
- **Tall WOA23:** < 10 °C per sota de 1.000 m (màxim 8,66), aigua profunda de l'Atlàntic nord ~3 °C i 34,9–35,0, aigua intermèdia antàrtica amb mínim de 34,2–34,4 cap als 700–850 m, fons < 0,5 °C del sud fins a l'equador.
- **NCEP:** Bergen 1,9 °C i +14,6; badia de Hudson −27,9; mar de Noruega +25,8; Sibèria −20,2; est del Canadà −15,7.
- **Comparacions:**
  - Rius: 1,18 Sv (Dai i Trenberth: 37.288 km³ l'any). 17/1,18 = 14,4 → «catorze vegades»; 17/0,21 ≈ 80 Amazones.
  - Calor: 1,20 ± 0,12 PW, «approximately 60%» de la calor que porten els oceans cap al pol (Johns et al. 2023, text complet a PMC). 600 EJ l'any = 19 TW (Statistical Review 2026, via premsa secundària); 1,2 PW / 19 TW ≈ 63.
  - Unitats: 1 Sv = 10⁶ m³/s; 1 PW = 10¹⁵ W = «mil bilions».
- **IPCC AR6** (verificat literalment al PDF del capítol 9):
  - «very likely decline … all SSP scenarios»; «medium confidence that the decline will not involve an abrupt collapse before 2100».
  - 24 [4–46] % (SSP1-2.6) i 39 [17–55] % (SSP5-8.5), confiança mitjana, basats en mitjanes de conjunt de cada model.
  - «None of the CMIP6 models features an abrupt AMOC collapse in the 21st century, but they neglect meltwater release from the Greenland Ice Sheet»; models amb tendència a una «unrealistic stability».
  - Impactes de SPM C.3.4 (pluges tropicals, monsons, assecament d'Europa).
  - La frase dels «8.000 anys estables» **no l'he trobada literalment** (no verificable). És coherent amb el capítol 2 (Gulev et al. 2021).
- **Estudis posteriors** (resums verificats):
  - Weijer 2020: 6–8 Sv (34–45 %) restringit amb RAPID.
  - Bonan 2025: 3–6 Sv (18–43 %), sigui quin sigui l'escenari.
  - Portmann 2026: 51 ± 8 % (90 %, SSP2-4.5); corregeix un biaix de la salinitat superficial de l'Atlàntic sud.
  - Baker 2025: 34 models; l'aflorament de l'oceà Antàrtic manté la cinta; «collapse is unlikely this century».
  - Drijfhout 2025: < 6 Sv en tots els SSP5-8.5 allargats; col·lapse de la barreja a mitjan segle; 20–40 % del transport de calor.
  - van Westen 2025: 2063 (2026–2095) amb SSP2-4.5 i 2055 (2023–2076) amb SSP5-8.5, 25 models.
  - van Westen i Baatsen 2025: el resum és coherent amb el text.
- **van Westen 2024** (text complet a PMC): > 1 °C per dècada al nord-oest d'Europa; Bergen al febrer, −3,5 °C per dècada; estacions de l'Amazones intercanviades; forçament preindustrial.
- **Ditlevsen i Ditlevsen:**
  - Correcció del 21/8/2025: error de codi, la data es mou 8 anys.
  - Text corregit: 2065, IC del 95 % 2037–2109.
  - Dades: temperatura del mar del gir subpolar des del 1870.
- **Seager 2002** (PDF): els vents mitjans són la causa principal; la calor estacional emmagatzemada; ~3 °C a l'Europa occidental i a l'est d'Amèrica del Nord; > 6 °C prop d'Islàndia; mapa de gener; gel fix al CCM3; paper de les Rocalloses.
- **Paleoclima:**
  - McManus 2004 (resum): «nearly, or completely, eliminated … H1, 17,500 yr ago»; caiguda al Younger Dryas.
  - Nucli GGC5 a 4.550 m; ràtio de producció 0,093.
  - Dates GICC05: 14.692, 12.896 i 11.703 b2k.
- **Altres:**
  - Goddard 2015: 128 mm el 2009–10, «unprecedented (a 1-in-850 year event)», caiguda del 30 % de l'AMOC i NAO negativa.
  - Terhaar 2025: cap disminució entre el 1963 i el 2017.
  - Caesar 2018: 3 ± 1 Sv (~15 %).
  - NOAA: «an estimated 1,000 years» per a una parcel·la d'aigua (pàgina actualitzada el 23/09/26).
  - Library of Congress: Franklin i el seu cosí Timothy Folger (vegeu el punt 10).
- **DOI:** he verificat a Crossref els 36 DOI d'articles de la llista de fonts, i el de les dades RAPID a DataCite. Tots resolen i el títol, els autors, la revista, el volum i l'any coincideixen. Inclouen Moat (BODC), McCarthy 2015, Millero i Poisson, Yashayaev i Clarke, Broecker, Lozier 2019, Johns, Dai i Trenberth, Seager, Palter, McManus, Rasmussen 2006 i 2014, Heinrich, Hemming, Lynch-Stieglitz, McCarthy 2012, Goddard, Smeed, McCarthy 2025, Volkov, Caesar, Thornalley, Terhaar, Weijer, Bonan, Portmann, Stommel, Ditlevsen i la seva correcció, van Westen 2024 i 2025 (JGR), van Westen i Baatsen, Baker, Drijfhout, van Westen i Dijkstra 2026 i Dijkstra i van Westen 2026. Observació: Palter 2015 i els dos articles de van Westen i Dijkstra del 2026 són a la llista però el text no els cita explícitament.
- **Etiquetatge d'esquemes:** «Corrents: esquema simplificat, no dades» (globus), «Les fletxes són un esquema» (tall), el model de Stommel és «conceptual… no és una predicció», el gràfic de dates diu «Estimacions publicades, no prediccions d'aquest article», i la metodologia separa dades i esquemes. Està ben fet. El que falta és el matís conceptual del punt 3.

### Veredicte

L'article és rigorós i està molt ben documentat: les xifres quantitatives (RAPID, IPCC, rius, calor, estudis del 2024–2026, correcció de Ditlevsen) coincideixen amb les fonts primàries i amb els CSV, i els DOI són tots correctes. El risc principal no són els números sinó la interpretació física. Cal arreglar tres coses abans de publicar:

- La densitat «del fons» (punt 1), que és potencial i no real.
- El motor de la cinta presentat com a «sobretot» de densitat (punt 2).
- La falta d'un avís que la «cinta» és un model simplificat i que l'aigua no baixa només per la vora (punt 3).

També convé corregir la confusió possible amb l'aigua mediterrània al tall (punt 4), la contradicció entre el text i el gràfic a les temperatures profundes (punt 5) i l'atribució de les reanàlisis a «les observacions» (punt 8). Amb aquests canvis i els retocs menors, l'article seria publicable amb garanties.

---

## 5. On va el CO₂ (web/articles/on-va-el-co2/)

Abast de la revisió: tot el text visible de `index.html`, totes les xifres i etiquetes de `on-va-el-co2.js` (anotacions, títols de pas, notes del gràfic anual, llegendes, coeficients de Joos), `dades.js` comparat amb els CSV de `research/` i amb el full de càlcul del GCB 2026 (`Global_Carbon_Budget_2026_v0.1.xlsx`, fulls «Global Carbon Budget», «Historical Budget» i «Fossil Emissions by Category»), i el text complet del preprint del GCB 2026 (còpia local de https://essd.copernicus.org/preprints/essd-2026-895/essd-2026-895.pdf), de Joos et al. 2013, d'Archer et al. 2009, del capítol 5 de l'AR6 i del Box 6.1 de l'AR5. Totes les xifres s'han recalculat amb Python. `dades.js` coincideix exactament amb els tres CSV: 177 files del pressupost, 823 mesos de Mauna Loa i 68 anys d'ONI, sense cap discrepància. El CSV del pressupost també coincideix amb el full de càlcul del GCB.

1. **[IMPORTANT] L'afebliment dels embornals: «27 Gt deixades a l'aire» no equival a 7,3 ppm.**
   - Ubicació: `index.html:257`. Text actual: «Sumat des del 1960, aquest afebliment ha deixat a l'aire unes 27 gigatones de carboni més, prou per explicar 7,3 ppm de la pujada de la corba de Keeling».
   - Què falla: el GCB no diu que 27 GtC s'hagin quedat a l'aire. Diu que els embornals han absorbit 27 ± 21 GtC menys (una «reducció acumulada de l'embornal» respecte d'un món sense canvi climàtic) i que això ha aportat 7,3 ± 4,5 ppm a l'augment observat. Amb el factor del mateix article (1 ppm = 2,124 GtC, glossari, línia 306), 27 GtC a l'aire serien 12,7 ppm, no 7,3. El lector que ho comprovi hi trobarà una contradicció. A més, s'han omès unes incerteses molt grans (±78% i ±62%).
   - Font: preprint del GCB 2026, línies 1637–1640 («cumulative sink reduction of 27 ± 21 GtC since 1960 … contributed 7.3 ± 4.5 ppm (7%)») i resum executiu, línies 290–293. https://essd.copernicus.org/preprints/essd-2026-895/
   - Text proposat: «Sumat des del 1960, aquest afebliment ha fet que el mar i la terra absorbissin unes 27 gigatones de carboni menys (amb un marge d'error de ±21). Segons el Global Carbon Budget, això explica uns 7 ppm (±4,5) de la pujada de la corba de Keeling, un 7% del total.»

2. **[IMPORTANT] L'exemple del 2016 com a «salt l'any següent» d'El Niño contradiu les dades del mateix gràfic.**
   - Ubicació: `index.html:235`, text actual: «L'efecte arriba amb retard: el gran salt de CO₂ es nota sobretot l'any següent a un El Niño fort, com el 1998 o el 2016.» També `on-va-el-co2.js:397` (nota del 2016), text actual: «L'any després del pic d'El Niño, el CO₂ va pujar 2,8 ppm.»
   - Què falla: en la sèrie mundial que fa servir el gràfic (GCB i NOAA), el 2015 va pujar més que el 2016: 2,95 ppm contra 2,83 ppm. En gigatones, l'atmosfera rep 23,0 Gt de CO₂ el 2015 i 22,0 Gt el 2016. Quan el lector clica el 2016 per comprovar el «gran salt», veu una barra més baixa que la de l'any anterior. A més, el pic d'El Niño 2015–16 va ser a NDJ 2015/16 (ONI +2,59), de manera que el 2016 no és «l'any després del pic». L'exemple del 1998 sí que funciona: 1,98 ppm el 1997 i 2,84 ppm el 1998. A Mauna Loa, en canvi, el 2016 (3,03) sí que supera el 2015 (2,95). El GCB fa servir el 2015/16 com a exemple de manera genèrica (línies 1329–1332), però amb dades anuals mundials no es veu.
   - Fonts: https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_gr_gl.txt (2015: 2,95; 2016: 2,83), https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_gr_mlo.txt (2015: 2,95; 2016: 3,03), https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt (NDJ 2015: +2,59).
   - Text proposat per a la línia 235: «L'efecte arriba amb retard: el gran salt de CO₂ sovint es nota l'any següent a un El Niño fort. El 1997, quan El Niño s'enfilava, el CO₂ va pujar 2,0 ppm; el 1998, 2,8.»
   - Text proposat per a la nota del 2016 (JS): «El Niño va tocar sostre a l'hivern del 2015 al 2016. El CO₂ mundial va pujar gairebé tant com el 2015: 2,8 ppm. A Mauna Loa, 3,0 ppm, el rècord fins aleshores.»

3. **[IMPORTANT] L'observatori no és «al cim» del Mauna Loa.**
   - Ubicació: `index.html:96`. Text actual: «va començar a mesurar el diòxid de carboni de l'aire al cim del Mauna Loa, un volcà de Hawaii. L'observatori és a 3.397 metres».
   - Què falla: l'observatori és al vessant nord, a 3.397 m. El cim fa uns 4.169 m. L'error es veu sol, perquè la frase següent dona l'alçada de 3.397 m.
   - Font: https://gml.noaa.gov/obop/mlo/ («located on the north flank of Mauna Loa Volcano … at an elevation of 3397 meters»).
   - Text proposat: «…va començar a mesurar el diòxid de carboni de l'aire al vessant nord del Mauna Loa, un volcà de Hawaii. L'observatori és a 3.397 metres, per sobre de la capa d'aire més brut de prop del mar…»

4. **[IMPORTANT] L'entradeta diu que «cada any» se'n queda menys de la meitat, però no és cert cada any.**
   - Ubicació: `index.html:7`, `9` i `90` (meta description, og:description i entradeta). Text actual: «Cada any la humanitat aboca a l'aire més de 40.000 milions de tones de CO₂. Menys de la meitat s'hi queda.»
   - Què falla: amb les dades del mateix article, en 16 dels 67 anys entre el 1959 i el 2025 se n'ha quedat a l'aire més de la meitat. Hi ha dos dels tres últims anys: el 2023 (50,1%) i el 2024 (69%). També el 2015 (55%) i el 2016 (54%). L'afirmació només és vàlida de mitjana (44% en sis dècades segons l'IPCC; 48% entre el 2016 i el 2025 segons el GCB). L'article mateix ho explica a les línies 152–154 i 233.
   - Fonts: el CSV i el full de càlcul del GCB 2026 (recàlcul propi). Preprint, línia 277 («48% of total CO2 emissions»): https://essd.copernicus.org/preprints/essd-2026-895/
   - Text proposat: «Cada any la humanitat aboca a l'aire més de 40.000 milions de tones de CO₂. De mitjana, menys de la meitat s'hi queda. Hem seguit la resta fins al fons del mar i les fulles dels boscos.» Cal aplicar el mateix canvi a la meta description i a og:description.

5. **[IMPORTANT] La projecció del −0,4% del 2026 es dona sense el marge, i el marge inclou un augment.**
   - Ubicació: `index.html:298`. Text actual: «les emissions fòssils baixaran lleugerament, un 0,4%».
   - Què falla: el GCB dona −0,4% amb un interval de −1,5% a +0,6%. Presentar la baixada com a segura és una sobreafirmació: la projecció no descarta que les emissions pugin lleugerament.
   - Font: resum del preprint, https://essd.copernicus.org/preprints/essd-2026-895/ («decrease … 0.40% … (–1.5% to +0.6%)»).
   - Text proposat: «El 2026, segons les projeccions del Global Carbon Budget, les emissions fòssils baixaran probablement una mica, un 0,4% (entre una baixada de l'1,5% i una pujada del 0,6%), però el total pujarà fins a 43,3 Gt per l'augment de les emissions per ús del sòl.»

6. **[IMPORTANT] El preprint es presenta com a publicació a la primera menció.**
   - Ubicació: `index.html:100`. Text actual: «L'última edició, el Global Carbon Budget 2026, es va publicar el 10 de novembre.»
   - Què falla: el 10 de novembre es va obrir la discussió pública d'un preprint a *Earth System Science Data Discussions*. Encara és en revisió per parells, amb comentaris oberts fins al 17 de desembre de 2026. La metodologia (línia 319) ho diu bé, però el lector del cos del text no ho veu.
   - Font: https://essd.copernicus.org/preprints/essd-2026-895/ (rebut el 30-10-2026, discussió iniciada el 10-11-2026, «under review»). Crossref el classifica com a «posted-content»: https://api.crossref.org/works/10.5194/essd-2026-895
   - Text proposat: «L'última edició, el *Global Carbon Budget 2026*, es va presentar el 10 de novembre; encara és una versió preliminar en revisió per altres científics, i les xifres poden canviar lleugerament.»

7. **[MENOR] El percentatge del carbó és un 41% a la font, no un 40%.**
   - Ubicació: `index.html:118`. Text actual: «El carbó n'és la font més gran, un 40%».
   - Què falla: el preprint diu «coal (41%), oil (33%), natural gas (21%)». El 40% surt de dividir pel fòssil sense la carbonatació (4,291 / 10,643). El GCB divideix pel fòssil amb la carbonatació inclosa (10,5 GtC), que és la mateixa xifra de 38,4 Gt que dona l'article.
   - Font: preprint, línies 1025–1027.
   - Text proposat: «El carbó n'és la font més gran, un 41%, seguit del petroli (33%) i del gas (21%).»

8. **[MENOR] L'augment d'acidesa és un 26% segons l'IPCC; el 30% és un arrodoniment.**
   - Ubicació: `index.html:182`. Text actual: «ha baixat unes 0,1 unitats, que equivalen a un 30% més d'acidesa».
   - Què falla: 10^0,1 = 1,26. L'IPCC (AR5) diu un 26% més d'ions d'hidrogen. La NOAA, que és la font citada, diu «aproximadament un 30%», així que la citació és correcta però imprecisa.
   - Fonts: https://www.noaa.gov/education/resource-collections/ocean-coasts/ocean-acidification (NOAA). Resum per a responsables polítics de l'AR5 WGI, B.5: «corresponding to a 26% increase in hydrogen ion concentration».
   - Text proposat: «…ha baixat unes 0,1 unitats, que equivalen a un 26% més d'ions d'hidrogen, la mesura de l'acidesa (sovint s'arrodoneix a un 30%).»

9. **[MENOR] Els percentatges del 8% i el 19% s'atribueixen només al canvi climàtic.**
   - Ubicació: `index.html:256`. Text actual: «Entre el 2016 i el 2025, el canvi climàtic va reduir l'absorció de l'oceà un 8% i la de la terra, un 19%.»
   - Què falla: el GCB atribueix la reducció a «climate change and climate variability». Per a la terra, el 19% és respecte de l'efecte del CO₂ (0,6 ± 0,5 de 3,3 GtC l'any), no respecte de l'absorció total.
   - Font: preprint, línies 290–291 i 1609–1610.
   - Text proposat: «Entre el 2016 i el 2025, el canvi i la variabilitat del clima van reduir l'absorció de l'oceà un 8% i la de la terra, un 19%.»

10. **[MENOR] «Probablement una font neta» és una interpretació pròpia.**
    - Ubicació: `index.html:203`.
    - Què falla: el GCB diu literalment que la terra ha estat «a source of 55 ± 65 GtC» entre el 1850 i el 2025. La incertesa (±1σ) inclou el zero, i el GCB no fa servir «probablement».
    - Font: preprint, línies 1966–1969, i taula 8.
    - Text proposat: «Des del 1850, segons el Global Carbon Budget, la tala ha emès més carboni que el que ha absorbit la resta de la vegetació: en conjunt, la terra hauria estat una font neta d'uns 55 gigatones de carboni, tot i que la incertesa és tan gran (±65) que no es pot descartar un balanç gairebé nul.»

11. **[MENOR] Les dades de Graven són del 2009–2011, i l'augment no és només dels boscos boreals.**
    - Ubicació: `index.html:228`. Text actual: «l'amplitud del cicle és un 50% més gran que a finals dels anys cinquanta. Els boscos boreals intercanvien…»
    - Què falla: la comparació és entre els vols del 2009–2011 i els del 1958–61. Graven et al. dedueixen un 30–60% més d'intercanvi dels ecosistemes extratropicals del nord, sobretot als boscos boreals.
    - Fonts: https://doi.org/10.1126/science.1239207 i https://news.ucar.edu/10046/seasonal-fluctuations-co2-rise
    - Text proposat: «…mostren que, al nord dels 45 graus, l'amplitud del cicle era el 2009–2011 un 50% més gran que a finals dels anys cinquanta. Els ecosistemes del nord, sobretot els boscos boreals, intercanvien amb l'aire entre un 30 i un 60% més de CO₂ cada estació.»

12. **[MENOR] El 41% als cent anys apareix sense el marge entre models.**
    - Ubicació: `index.html:290` (i el text alternatiu del gràfic, línia 284).
    - Què falla: Joos et al. donen 0,60 ± 0,14 als 20 anys i 0,41 ± 0,13 als 100 anys (±2 desviacions estàndard).
    - Font: https://doi.org/10.5194/acp-13-2793-2013 (secció 4.1; còpia local llegida).
    - Text proposat: «Al cap de cent anys, segons la mitjana dels models, encara en queda a l'aire un 41% (entre un 28 i un 54%), i al cap de mil, aproximadament una quarta part.»

13. **[MENOR] Els creixements de 2,1 i 3,8 ppm són mitjanes mundials, no de Mauna Loa.**
    - Ubicació: `index.html:99` («Només va pujar 2,1») i `index.html:249` / `on-va-el-co2.js:399` («3,8 ppm»).
    - Què falla: totes dues xifres són mitjanes mundials de la NOAA i del GCB, però el context immediat és Mauna Loa. A Mauna Loa el creixement va ser de 2,23 ppm el 2025 i de 3,33 ppm el 2024.
    - Fonts: https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_gr_gl.txt i https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_gr_mlo.txt
    - Text proposat per a la línia 99: «Només va pujar 2,1 de mitjana a tot el planeta.»
    - Text proposat per a la línia 249: «…la concentració mitjana mundial de CO₂ va pujar 3,8 ppm, el rècord des que hi ha mesures.»

14. **[MENOR] La definició d'El Niño al glossari diu que és periòdic.**
    - Ubicació: `index.html:316`. Text actual: «L'escalfament periòdic del Pacífic equatorial.»
    - Què falla: no és periòdic. És irregular i es repeteix cada 2 a 7 anys.
    - Font: NOAA CPC, sèrie ONI: https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt
    - Text proposat: «L'escalfament irregular del Pacífic equatorial, cada dos a set anys…»

15. **[MENOR] A la metodologia, la incertesa dels embornals és massa genèrica i no diu què representa.**
    - Ubicació: `index.html:319`. Text actual: «la incertesa típica és d'uns ±0,7 Gt de carboni l'any».
    - Què falla: per al 2025, el GCB dona ±0,9 GtC per a la terra, ±0,7 per a l'oceà i ±0,7 per a l'ús del sòl, i les incerteses són ±1σ (68% de probabilitat).
    - Font: preprint, resum i línies 380–386.
    - Text proposat: «…la incertesa d'un any és d'entre ±0,7 i ±0,9 Gt de carboni (un 68% de probabilitat que el valor real hi sigui dins).»

16. **[MENOR] L'anotació «Des del 1959: mesures directes» es pot llegir com si també es mesuressin l'oceà i la terra.**
    - Ubicació: `on-va-el-co2.js:501`, l'anotació és a la meitat inferior del gràfic històric, la dels embornals. També el peu de figura, `index.html:271`.
    - Què falla: des del 1959 només es mesura directament el creixement atmosfèric. L'oceà surt de models i de productes basats en observacions, i la terra, de 23 models de vegetació.
    - Font: preprint, línia 824 («S_LAND is derived from the multi-model mean of 23 DGVMs»).
    - Text proposat per a l'anotació: «Des del 1959: CO₂ de l'aire mesurat directament».
    - Text proposat per al peu de figura: «…Abans del 1959, el creixement atmosfèric es reconstrueix a partir de les bombolles d'aire atrapades al gel; els embornals de l'oceà i de la terra surten sempre, en bona part, de models.»

17. **[MENOR] L'embornal terrestre del GCB no és només la vegetació «que no s'ha tocat».**
    - Ubicació: `index.html:138`. Text actual: «els absorbeixen els boscos, les praderies i els sòls que no s'han tocat».
    - Què falla: el GCB defineix l'embornal terrestre com l'absorció neta de la terra excloent-ne el canvi d'ús del sòl. És la resposta de tota la vegetació al CO₂ i al clima, i inclou boscos gestionats.
    - Font: preprint, línia 284.
    - Text proposat: «…els absorbeixen els boscos, les praderies i els sòls, sense comptar-hi el que es talla.»

18. **[MENOR] El temps que el carboni passa al fons del mar no coincideix entre dos passatges.**
    - Ubicació: `index.html:134` diu «s'hi queda dècades o segles»; `index.html:188` i el gràfic B diuen «de dècades a mil·lennis».
    - Font: AR6 WGI, capítol 5, que diu «for decades to millennia».
    - Text proposat per a la línia 134: «Una part baixa cap al fons i s'hi queda de dècades a mil·lennis.»

19. **[MENOR] El 2026 l'embornal terrestre és una resta, no una estimació independent.**
    - Ubicació: `on-va-el-co2.js:401` (nota del 2026) i el panell anual del 2026, que mostra «Terra 15,0 Gt · 35%» com si fos una estimació.
    - Què falla: el GCB calcula l'embornal terrestre del 2026 com el que sobra de les altres projeccions, amb el desquadrament posat a zero per construcció.
    - Font: preprint, línies 846–849 i 1651.
    - Text proposat per a la nota: «Projecció. L'embornal terrestre es calcula com la resta dels altres termes, sense desquadrament. Comença un El Niño fort; l'efecte sobre el CO₂ es notarà sobretot el 2027.»

### Comprovat i correcte
- **El preprint del GCB 2026 existeix.** Es diu essd-2026-895, té 144 autors i Friedlingstein com a primer autor, es va rebre el 30-10-2026 i la discussió es va obrir el 10-11-2026. El DOI de dades 10.18160/GCP-2026 redirigeix a ICOS (https://www.icos-cp.eu/GCP/2026) i és a DataCite. El comunicat del 10-11-2026 a globalcarbonbudget.org existeix i coincideix: 38,2 / 43,3 Gt, 427,7 ppm, 54% i 150 GtCO₂.
- **Xifres del 2025, recalculades de les dades i coincidents amb el preprint:**
  - Emissions totals: 42,75 Gt de CO₂ (11,7 ± 0,9 GtC).
  - Fòssil: 38,4 Gt amb la carbonatació inclosa. La carbonatació és de 0,6 Gt.
  - Ús del sòl: 4,35 Gt.
  - Oceà: 11,7 Gt (27%). Terra: 13,3 Gt (31%, «highest on record»). Aire: 16,0 Gt (37%). Desquadrament: 1,7 Gt (4%).
  - Si no s'hagués absorbit res, la concentració hauria pujat 5,5 ppm. Va pujar 2,06 ppm.
  - Els punts del gràfic (384 + 43 = 160 + 117 + 133 + 17 = 427) són coherents.
- **Mitjana 2016–2025:** 47,6% a l'aire, 26,8% a l'oceà, 22,3% a la terra. Les emissions duplicaven els embornals (factor 2,04).
- **2024:** 3,76 ppm, rècord mundial. Les barres passen de la línia (desquadrament de −6,7 Gt de CO₂).
- **Fracció aerotransportada:** mínim del 19% el 1992 i màxim del 76% el 1987.
- **Brasil, Indonèsia i la RD del Congo:** un 54% de les emissions per ús del sòl entre el 2016 i el 2025.
- **Efecte del CO₂:** 3,3 GtC l'any, unes 12 Gt de CO₂.
- **Embornals estancats:** l'oceà des del 2016 i la terra des del 2000.
- **Acumulat 1850–2025:** 755 GtC (2.765 Gt de CO₂), un 36% des del 2000. Repartiment: 39% a l'aire, 26% a l'oceà, 25% a la terra i 9% de desquadrament. El GCB també dona l'explicació que l'article fa del desquadrament.
- **El fòssil supera l'ús del sòl a partir del 1958**, coherent amb «fins a mitjan segle XX».
- **Projecció 2026:** 427,7 ppm. Respecte de 278 ppm és un 53,9% més; el preprint diu un 54% al resum i un 53% al resum executiu, així que el 54% de l'article és acceptable.
- **Pressupost restant per a 1,5 °C:** 150 Gt de CO₂, menys de 4 anys. Les noves tècniques per retirar CO₂ equivalen a menys de 30 minuts d'emissions fòssils.
- **Unitats:** 1 ppm = 2,124 GtC i 1 GtC = 3,664 Gt de CO₂ (preprint, línies 350–351).
- **Mauna Loa (NOAA):**
  - Inici el març del 1958 (Keeling, Scripps), amb 315,71 ppm. Fins al 1974 són dades de Scripps.
  - Màxim del maig del 2026: 432,34 ppm, el valor mensual més alt de la sèrie.
  - Fitxer del 9-10-2026, amb dades fins al setembre del 2026 (426,07 ppm).
  - Del desembre del 2022 al 4 de juliol de 2023, mesures a Maunakea, a 21 milles (34 km).
  - Altitud de 3.397 m.
  - Màxim estacional al maig en 61 de 67 anys; mínim al setembre (40) o a l'octubre (27). L'amplitud sense tendència és de 5,8 ppm el 1959 i de 6,8 ppm el 2023–25.
- **ONI:** ASO 2026 +2,46, un El Niño fort en curs. NDJ 1997: +2,37. El 2023–24, El Niño (≥0,5) va durar fins a MAM 2024.
- **Joos et al. 2013:**
  - Pols de 100 GtC sobre 389 ppm, amb 15 models.
  - 25 ± 9% a l'aire als 1.000 anys.
  - Els coeficients de la taula 5 són correctes, i l'ajust dona 59,6% / 40,9% / 23,5% a 20 / 100 / 1.000 anys, tal com diu el peu de figura.
  - La figura està ben etiquetada com a «Model, no dades mesurades».
- **Archer et al. 2009:** un 20–35% hi queda després de 2–20 segles, i el CaCO₃ el neutralitza en 3–7 mil anys. L'article no ho confon amb «vida mitjana». L'AR5 Box 6.1 confirma els temps de les quatre franges del gràfic, que les molècules es renoven «every few years», que retirar-ho tot costa «a few hundred thousand years» i que, com més emissions, més fracció remanent.
- **IPCC AR6, capítol 5:**
  - Fracció aerotransportada d'un 44% en sis dècades.
  - Acidificació per sota dels 2.000 m a l'Atlàntic Nord i a l'oceà Antàrtic.
  - Absorció creixent però amb una fracció decreixent (confiança alta).
  - La terra podria passar a ser una font més enllà del 2100 amb SSP5-8.5 (confiança mitjana; es podria afegir).
  - Fertilització i eficiència en l'ús de l'aigua.
- **Ke et al. 2024:** embornal terrestre net de 0,44 ± 0,21 GtC, el més feble des del 2003. Sequera amazònica a la segona meitat del 2023. Incendis del Canadà: 0,58 GtC, unes 2,1 Gt de CO₂.
- **Dore et al. 2009:** −0,0019 ± 0,0002 unitats de pH l'any en gairebé 20 anys a l'estació ALOHA.
- **Wang et al. 2020:** l'amplitud a Mauna Loa va créixer fins als anys vuitanta i després no ha canviat significativament.
- **Keeling 1960:** variació estacional a l'hemisferi nord i un augment «petit però persistent» a l'Antàrtida.
- **DOI comprovats a Crossref o DataCite (els 9 són correctes en títol, revista, volum i pàgines):** 10.5194/essd-2026-895, 10.18160/GCP-2026, 10.3402/tellusa.v12i2.9366, 10.5194/acp-13-2793-2013, 10.1146/annurev.earth.031208.100206, 10.1093/nsr/nwae367, 10.1073/pnas.0906044106, 10.1126/science.1239207 (Graven) i 10.1111/gcb.15162 (primer autor Kai Wang). Les pàgines de la NOAA (GML trends, obop/mlo, acidificació) i de la CPC responen 200. **No verificable:** les dues URL de l'IPCC (AR5 i AR6, capítol 5) responen 403 a les consultes automàtiques, però el contingut s'ha comprovat als PDF.
- **Etiquetes de simulacions i esquemes:** els dos scrollies diuen «Esquema» i «Esquema, no a escala», la persistència diu «Model» i el 2026 diu «projecció». Correcte.
- **`cover.html`:** no té cap text ni cap xifra visible. És una il·lustració decorativa de punts sense llegenda, i les proporcions de colors no pretenen ser dades. No hi ha res a corregir.

### Veredicte
És un article sòlid i ben documentat. Les dades dels gràfics coincideixen exactament amb les fonts primàries, i la gran majoria de xifres són correctes i estan ben atribuïdes. També té la virtut d'etiquetar com a tals els models, els esquemes i les projeccions.

No hi he trobat cap error crític. Abans de publicar, però, cal corregir sis punts importants:
- la frase de les «27 Gt deixades a l'aire», que és incoherent amb els 7,3 ppm;
- l'exemple del 2016, que el gràfic mateix contradiu;
- «al cim» del Mauna Loa;
- el «cada any, menys de la meitat» de l'entradeta;
- el −0,4% sense el marge, que inclou una pujada;
- la presentació del preprint com a publicat.

La resta són precisions menors i incerteses que val la pena afegir.

---

## Veredicte global

| Article | Veredicte |
|---|---|
| Migració vertical | **Publicable després de corregir** els dos gràfics de carboni i l'ús de Benoit-Bird 2009. La resta de xifres i tots els DOI són correctes. |
| Virus i bacteris | **No publicable sense refer el gràfic de l'oceà** amb la versió corregida (2017) de Wigington. Cal corregir també la data del Casgevy (15-11-2023), els anticossos maternals, el nombre de treballs de Mojica citats pel Nobel (quatre) i les sobreafirmacions de la introducció. |
| Pols del Sàhara | **Publicable després de reescriure el relat del fòsfor** (l'«aixeta» i el gràfic del balanç) i d'afegir els marges. Les xifres són fidels a Yu et al. 2015. |
| Cinta transportadora | **Publicable amb correccions de text**: el motor de la circulació, l'avís que la «cinta» és una simplificació, l'aigua mediterrània, les temperatures del fons, els Heinrich, Seager i van Westen. Les dades i les xifres són sòlides. |
| On va el CO₂ | **Publicable amb correccions menors i sis d'importants.** És l'article més sòlid: les dades coincideixen exactament amb el GCB 2026, la NOAA i Joos. |
