# Fonts i verificació · «El genoma que es va publicar en una nit»

Totes les fonts s'han obert i llegit el 24-11-2026. Les referències i les afirmacions que sustenta
cadascuna són a `fonts.py`; aquí hi ha com s'han comprovat i què s'ha deixat fora.

## 1. El fil de l'11 de gener del 2020

| Afirmació | Com s'ha comprovat |
|---|---|
| Hora exacta del missatge: 11-01-2020, 01.05.33 UTC | API del fòrum: `https://virological.org/t/novel-2019-coronavirus-genome/319.json`, camp `created_at` del primer missatge. El text del missatge duu la data «10th January 2020», que és la del dia als fusos americans. |
| El penja Holmes en nom del consorci de Zhang | Text del mateix missatge, llegit sencer. |
| Hi convida a descarregar, compartir i analitzar | Frase literal del missatge («Please feel free to download, share, use, and analyze this data»). |
| Cinc genomes més a GISAID el 12 de gener | Missatge d'Andrew Rambaut al mateix fil, 2020-01-12T12:14:59Z. |
| Primer arbre de Nextstrain el 14 de gener | Missatge de Trevor Bedford al mateix fil, 2020-01-14T00:36:27Z. |
| Mostra rebuda el 3 de gener; 40 hores; avís de Chen Yan-Mei a les 2.00 del 5 de gener; pujada a l'NCBI; trucada a la pista de l'aeroport; «Eddie, t'autoritzo a alliberar les dades» | Reportatge de David Cyranoski a *Nature's 10* (15-12-2020), llegit sencer, amb les paraules de Zhang. |
| Enviament a GenBank el 5 de gener i alliberament el 12 | Registre MN908947.3 descarregat per e-utils: «Submitted (05-JAN-2020)»; les metadades del conjunt obert donen `date_submitted` = 2020-01-12. |
| Mida del genoma | Capçalera `LOCUS` de cada versió, baixada amb e-utils: MN908947.1 (12-01-2020) 30.473 bases; .2 (14-01-2020) 29.875; .3 (17-01-2020) 29.903. **El fitxer que es va publicar l'11 de gener és el .1**: per això l'article diu «unes trenta mil lletres» per a aquell dia i reserva el 29.903 per a la versió de referència corregida. |
| L'hora de l'avís de Chen Yan-Mei | *Nature* diu «at 2 a.m. on 5 January», que és hora de Xangai (UTC+8): a l'eix del gràfic, en hora universal, són les 18 h del 4 de gener. L'**inici** de la barra de 40 hores és un càlcul propi (40 h abans), i es diu al peu del gràfic. |
| La persona de qui ve la mostra | Wu et al. (2020), *Nature*: home de 41 anys, treballador del mercat, ingressat el 26-12-2019. La identitat no es dona (ni la dona la font). |
| Dates de l'OMS (1, 9, 11, 13 i 30 de gener; 11 de març) | Cronologia oficial de l'OMS, llegida sencera. |

## 2. Què es va fer amb la seqüència

- **PCR sense virus:** Corman et al., *Eurosurveillance*, rebut el 21-01-2020 i publicat el 23. L'article diu
  explícitament que els aïllats no estaven disponibles i que van fer servir àcids nucleics sintètics. Les 297
  mostres clíniques són al resum. Llegit el text complet a PMC (PMC6988269): **«the first version of the
  diagnostic protocol provided to the WHO on 13 January 2020»**, que és el primer protocol de PCR que la
  cronologia de l'OMS situa el dia 13. Per això l'article diu «dos dies» (del missatge del fòrum al protocol a
  l'OMS) i reserva el 23 de gener per a l'article. El mateix text diu que el 12 de gener es van dipositar a
  GISAID «four other genomes», mentre que el missatge d'Andrew Rambaut al fòrum en diu cinc: es dona la xifra
  del missatge i la discrepància consta al peu del gràfic V1.
- **Vacuna:** Corbett et al., *Nature* (2020). Frases comprovades: «Within 24 h of the release of genomic
  sequences of SARS-CoV-2 isolates on 10 January 2020, the 2P mutations were substituted into S protein
  residues 986 and 987 to produce prefusion-stabilized SARS-CoV-2 S(2P) protein **for structural analysis**»
  i «…first-in-human phase I clinical trial starting on 16 March 2020, 66 days after the viral sequence was
  released». Dues conseqüències per al text: (1) la rapidesa ve d'una feina anterior, l'estabilització de
  l'espícula, i l'article ho diu («tenien mitja feina feta»); (2) l'article de la revista compta els 66 dies
  des del 10 de gener (fus americà), i per això el nostre text ho atribueix («segons el mateix equip»).
- **Nom del virus:** Gorbalenya et al. (grup d'estudi de Coronaviridae de l'ICTV), *Nature Microbiology* (2020).
- **Llinatges:** O'Toole et al., *Virus Evolution* (2021), l'eina pangolin.
- **Variant Alfa:** Volz et al., *Nature* (2021). **Introduccions múltiples:** Deng et al., *Science* (2020).

## 3. La norma

- **Bermuda 1996 i 1997:** l'acta parla d'alliberament **diari** («released automatically on a daily basis»),
  no de «24 hores»: el text i el gràfic V5 diuen «alliberament diari». A més, Bermuda mesura del muntatge a
  l'alliberament i el gràfic V5 mesura de la mostra a la publicació: són coses diferents i es diu al peu. s'ha llegit l'acta sencera de HUGO (còpia de l'arxiu del Projecte Genoma Humà del
  Departament d'Energia dels Estats Units, via Internet Archive). D'allà surten, literalment, «freely available
  and in the public domain», l'alliberament diari dels muntatges de més d'1 kb, el motiu (evitar una posició
  privilegiada) i la llista de participants.
- **Toronto 2009:** *Nature* 461, 168–170. Verificat a Crossref; se'n cita només l'existència i la proposta.
- **OMS 2016:** Modjarrad et al., *PLOS Medicine*, llegit el resum i la descripció de la consulta de setembre del 2015.
- **Indonèsia i la grip aviària:** Fidler, *Emerging Infectious Diseases* (2008), llegit sencer (accés obert).
- **GISAID:** Elbe i Buckland-Merrett, *Global Challenges* (2017), llegit sencer a PMC (PMC6607375).
- **Maxson Jones et al. (2018)**, llegit a PMC (PMC7307446): «Daily data release **may have become** a formal
  grant condition at the NIH and the Wellcome Trust, but the scientists and administrators at other major HGP
  funding agencies, particularly outside the US, found ways to sidestep or revise their existing polices just
  to remain compliant». L'article ho diu amb aquesta mateixa prudència, en lloc de l'afirmació anterior
  («els finançadors els van convertir en condició i això els va fer complir»), que la font no sosté.
- **1665:** registre de Crossref de l'«Epistle dedicatory» d'Oldenburg, amb data del 6 de març de 1665
  (`10.1098/rstl.1665.0001`, pàgines i–ii). **La pàgina de l'editor no es deixa llegir des d'aquí**: per això
  l'article només en diu la data del primer número i que la revista encara es publica, i cap contingut del
  text. S'ha tret la frase «la primera revista científica»: el *Journal des sçavans* es va publicar unes
  setmanes abans i no s'ha pogut verificar cap font primària sobre la primacia.
- **OMS 2015:** la consulta és del setembre del 2015 a Ginebra (Modjarrad et al.), no del 2016, que és la data
  de l'article: el text i el gràfic V8 donen el 2015.

## 4. Desigualtat

Brito et al., *Nature Communications* (2022), llegit el resum, la introducció i les figures: 78 % contra 42 %
dels països per sobre del 0,5 % dels casos seqüenciats; 25 % contra 5 % dels genomes publicats en menys de 21
dies; 8.947.455 genomes analitzats. La comparació entre bases de dades surt de la introducció, literalment:
fins al 9 de juny del 2022, «>11.3 million consensus sequences» compartides a l'EpiCoV de GISAID i «over 5.5
million sequences» a les bases de l'INSDC. L'afirmació anterior («la major part dels genomes del món van anar
a GISAID») s'ha substituït per aquestes dues xifres, que són el que diu la font. Chen et al., *Nature Genetics* (2022) es cita per al retrat general del repartiment.

## 5. Dades pròpies

Vegeu `raw/README.md`: consultes, tractament i xifres. Límit principal, dit a l'article i a «Dades i fonts»:
el conjunt obert no conté els genomes compartits només a GISAID.

## 6. Què s'ha tret del text després de la revisió crítica

- **L'ordre de «rectificació» del gener del 2020 i el laboratori tancat el 2024 com a «preu» d'haver compartit.**
  Cap font llegida no estableix aquesta causalitat: Zhang mateix nega que fos un càstig, i de la notícia de
  *Nature* del 2024 només se'n pot llegir l'entradeta, que parla d'una disputa amb el Centre Clínic de Salut
  Pública de Xangai que sembla resolta. Els dos fets es mantenen a «Dades i fonts» (Metodologia), sense
  presentar-los com una conseqüència.
- **L'ordre del 3 de gener que prohibia publicar informació i l'error del 2003 amb el SARS.** Les dues versions
  (Holmes diu que l'equip s'havia esperat per l'ordre; Zhang diu que no en sabia res) no es poden resoldre amb
  les fonts llegides, i el detall no porta l'argument de l'article: s'han tret del cos.
- **El contrafactual del final** («els dies que hauríem perdut si…»): especulació, fora.
- **«La corba té la forma dels pressupostos»**: el pic del juny del 2023 no és vigilància sinó un dipòsit tardà
  (270.808 mostres europees antigues, amb 268–295 dies de mitjana entre recollida i publicació, comptatge propi).
  El text ho diu i el gràfic V4 ho anota.
- **«Ningú de fora pot comptar els genomes de GISAID sense permís»**: GISAID en publica recomptes; fora.
- **Elogis al model de GISAID**: no s'ha pogut llegir cap font sobre les controvèrsies de governança i accés que
  s'hi han plantejat, de manera que el text el descriu (accés amb condicions, crèdit als laboratoris d'origen)
  sense valorar-lo.
- **Frases sense font**: «pesa menys que una fotografia», «el nostre genoma té 3.000 milions de lletres»,
  «seqüenciar un virus era rutina el 2020», «l'arbre té milions de fulles» (en tenen les bases de dades; l'arbre
  publicat n'ensenya 3.078), «tres països tenen més de la meitat» (són dos països i tres quartes parts, 74,9 %,
  comptatge propi) i «una eina que s'ha acabat usant arreu» (pangolin).
- **Noms que no tornaven**: Ilaria Capua, Christian Drosten i Trevor Bedford passen a l'equip o la institució
  («l'equip de la Charité», «l'equip de Nextstrain»). Chen Yan-Mei es manté perquè és qui fa la troballa.

## 7. Què s'ha deixat fora (no s'ha pogut llegir la font primària)

- **L'ordre de «rectificació» del 12 de gener del 2020.** Diversos mitjans (SCMP, AP) expliquen que la comissió
  de salut de Xangai va ordenar tancar el laboratori l'endemà de la publicació, i ho presenten com a possible
  represàlia. Aquestes peces són de pagament o bloquegen l'accés automatitzat i no s'han pogut llegir senceres.
  L'article només recull el que en diu Zhang mateix al reportatge de *Nature* (que no va ser un càstig, sinó
  una actualització de protocols de bioseguretat després d'unes obres) i el fet, documentat per *Nature* el 2024,
  que va acampar davant del laboratori quan el van tancar.
- **La disputa sobre qui va compartir primer.** GISAID sosté que va publicar el genoma el 10 de gener; Holmes ho
  discuteix en declaracions a *The Lancet Microbe*. No s'ha pogut llegir aquesta peça i no s'ha fet servir:
  l'article es limita al que està documentat amb hora (el missatge del fòrum i el registre de GenBank) i fa servir
  la descripció que *Nature* fa de Zhang com «la primera persona que va fer pública la seqüència».
- **El nombre total de genomes de SARS-CoV-2 a GISAID.** La pàgina de GISAID dona 22.676.898 enviaments, però és
  el total de totes les seves bases (grip, VRS, mpox, arbovirus i hCoV-19 juntes), no els de SARS-CoV-2. Com que
  no s'ha trobat la xifra només de SARS-CoV-2 en una font oberta i datada, no s'ha donat cap total de GISAID:
  només es diu que n'hi ha més que en obert, amb la xifra de Brito et al. (8.947.455 els dos primers anys).
- **Anagrames i disputes de prioritat del segle XVII** (Galileu, Hooke). Es van considerar per obrir la secció de la
  norma i es van descartar: no s'ha pogut llegir cap font primària ni cap estudi de referència sobre el tema.
