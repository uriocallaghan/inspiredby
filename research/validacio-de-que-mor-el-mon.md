# Validació de dades: «De què mor el món?»

Abast: només xifres de **mortalitat** i **població** de l'article original de 2020 («¿De qué muere el mundo?», dades de 2017). Les cites, els refugiats i l'aigua els revisa un altre agent.
Data de la revisió: 17-11-2026.

Fitxers de dades (a la mateixa carpeta):
- `causes-mort.csv`: causes de mort de 2023 i 2019, amb morts, % i persones per cada 100 morts.
- `poblacio-historica.csv`: població mundial de l'any 0 al 2023, més la projecció de l'ONU fins al 2100.
- `natalitat-mortalitat.csv`: taxes brutes de natalitat i mortalitat de l'ONU (1950–2023 observades, 2025–2100 projectades).

---

## 1. Quin conjunt de dades i quin any

### Conjunts disponibles (comprovat el novembre de 2026)

| Conjunt | Darrer any | Estat | Comentari |
|---|---|---|---|
| **IHME GBD 2023** | 2023 | Publicat a *The Lancet*, 18-10-2025 (GBD 2023 Causes of Death Collaborators, *Lancet* 406:1811–1872, doi:10.1016/S0140-6736(25)01917-8). OWID el va incorporar el 07-02-2026. | Té 292 causes jeràrquiques que **no se solapen**: les causes d'un mateix nivell sumen el total de morts. Està disponible per a tots els anys de 1980 a 2023, amb una sola metodologia. |
| GBD 2021 | 2021 | Superat pel GBD 2023 | No l'utilitzeu. |
| **WHO Global Health Estimates** | 2023 | Publicat el 2026, cobreix 2000–2023. Full informatiu de l'OMS «The top 10 causes of death», 02-10-2026. | Dona 61 milions de morts el 2023. És bo per contrastar xifres, però publica sobretot causes concretes (cardiopatia isquèmica, ictus…) i no grups amplis. |
| UN WPP 2024 (només total de morts) | 2023 observat | És l'edició vigent; no s'ha publicat cap WPP 2026 (population.un.org/wpp, consultat el 17-11-2026). | Dona 61,65 milions de morts el 2023. És la referència demogràfica, però no desglossa per causes. |

### Recomanació
**Utilitzeu IHME GBD 2023, any 2023**, a través d'Our World in Data (que cita l'IHME). Els motius:
- És el conjunt complet més recent.
- Té la mateixa font i la mateixa estructura de causes que l'article original (OWID/IHME), i això permet comparar-los.
- Les causes no se solapen i sumen el total.
- El 2023 la COVID-19 ja només és l'1,4 % de les morts (posició 20 al GBD). L'any ja no està distorsionat, a diferència del 2020 i el 2021 (el 2021 la COVID va ser el 14,3 % de les morts al GBD).

**Alternativa sense COVID: el 2019.** Les dues sèries són al CSV. Les diferències entre 2019 i 2023 són petites (±1 persona en gairebé totes les causes), així que el 2023 és defensable.

### Contrast de totals de morts el 2023
- GBD 2023: **60,04 milions**. Calculat a partir de les morts i les quotes de cada causa a OWID; diverses causes donen el mateix total amb una diferència inferior al 0,01 %.
- OMS GHE: **61 milions**.
- ONU WPP 2024: **61,65 milions**.

Les tres xifres difereixen menys d'un 3 %. Per al 2019 els totals són 55,16 milions (GBD) i 58,35 milions (ONU).

> Nota de llicència: les dades GBD que mostra OWID no es poden redistribuir en brut (OWID bloqueja la descàrrega CSV per condicions de l'IHME). Les xifres s'han llegit dels gràfics públics d'OWID. Per publicar-les, citeu l'IHME, com demana OWID: «Global Burden of Disease Collaborative Network. GBD 2023. Seattle: IHME, 2025», via ourworldindata.org/causes-of-death.

---

## 2. El món en 100 morts (GBD 2023, any 2023)

Fonts: `https://ourworldindata.org/grapher/annual-number-of-deaths-by-cause` (morts) i `https://ourworldindata.org/grapher/share-of-deaths-by-cause` (quotes i hepatopatia).

| Causa (nom GBD) | Morts 2023 | per 100 (decimal) | per 100 (enter, residu més gran) | 2019: per 100 |
|---|---:|---:|---:|---:|
| Malalties cardiovasculars | 19,14 M | 31,9 | 32 | 32,0 |
| Càncers (neoplàsies) | 10,56 M | 17,6 | 18 | 16,9 |
| Respiratòries cròniques (MPOC, asma…) | 4,15 M | 6,9 | 7 | 6,8 |
| Infeccions respiratòries baixes (pneumònia…) | 2,50 M | 4,2 | 4 | 4,6 |
| Digestives (*inclou la cirrosi*) | 2,42 M | 4,0 | 4 | 4,3 |
| Alzheimer i altres demències | 2,21 M | 3,7 | 4 | 3,5 |
| Diabetis | 2,00 M | 3,3 | 3 | 3,2 |
| Trastorns neonatals | 1,63 M | 2,7 | 3 | 3,3 |
| Malaltia renal crònica | 1,52 M | 2,5 | 3 | 2,4 |
| Lesions de trànsit | 1,34 M | 2,2 | 2 | 2,3 |
| Malalties diarreiques | 1,11 M | 1,8 | 2 | 2,3 |
| Tuberculosi | 1,01 M | 1,7 | 2 | 2,1 |
| COVID-19 | 0,85 M | 1,4 | 1 | 0 |
| VIH/sida | 0,83 M | 1,4 | 1 | 1,7 |
| Suïcidi (autolesions) | 0,77 M | 1,3 | 1 | 1,3 |
| Malària | 0,67 M | 1,1 | 1 | 1,2 |
| ⚠ Homicidi (violència interpersonal) | 0,44 M | 0,7 | 1* | 0,8 |
| ⚠ Parkinson | 0,43 M | 0,7 | 1* | 0,7 |
| ⚠ Ofegament | 0,29 M | 0,5 | 1* | 0,5 |
| ⚠ Meningitis | 0,26 M | 0,4 | 0 | 0,5 |
| ⚠ Drogues (trastorns per consum) | 0,17 M | 0,3 | 0 | 0,2 |
| ⚠ Alcohol (trastorns per consum) | 0,17 M | 0,3 | 0 | 0,3 |
| ⚠ Conflicte i terrorisme | 0,16 M | 0,3 | 0 | 0,2 |
| ⚠ Foc, calor i substàncies calentes | 0,15 M | 0,3 | 0 | 0,2 |
| ⚠ Desastres naturals (forces de la natura) | 0,09 M | 0,1 | 0 | 0,02 |
| ⚠ Enverinaments | 0,07 M | 0,1 | 0 | 0,1 |
| Totes les altres causes | 5,11 M | 8,5 | 9 | 8,7 |
| **Total** | **60,04 M** | **100** | **100** | |
| *(Hepatopatia / cirrosi: és part de «Digestives» i no se suma)* | 1,28 M | 2,1 | — | 2,3 |

⚠ = per sota d'1 persona de cada 100. *Arrodonides a 1 només pel mètode del residu més gran. A l'article, presenteu-les com a «menys d'una persona».

### Proposta per a la infografia (agrupada, suma exactament 100)
Aquesta versió agrupa les causes per sota d'1 tal com feia l'original. Prové del mateix CSV, amb el mètode del residu més gran.

| Grup | 2023 decimal | 2023 enter | 2019 enter |
|---|---:|---:|---:|
| Cardiovasculars | 31,9 | 32 | 32 |
| Càncers | 17,6 | 18 | 17 |
| Respiratòries cròniques | 6,9 | 7 | 7 |
| Infeccions respiratòries baixes | 4,2 | 4 | 5 |
| Digestives | 4,0 | 4 | 4 |
| Demència | 3,7 | 4 | 4 |
| Diabetis | 3,3 | 3 | 3 |
| Neonatals | 2,7 | 3 | 3 |
| Renals | 2,5 | 3 | 2 |
| Trànsit | 2,2 | 2 | 2 |
| Diarrea | 1,8 | 2 | 2 |
| Tuberculosi | 1,7 | 2 | 2 |
| COVID-19 | 1,4 | 1 | 0 |
| VIH/sida | 1,4 | 1 | 2 |
| Suïcidi | 1,3 | 1 | 1 |
| Malària | 1,1 | 1 | 1 |
| Homicidi + conflicte + terrorisme | 1,0 | 1 | 1 |
| Ofegament + foc + desastres naturals | 0,9 | 1 | 1 |
| Altres (Parkinson, meningitis, alcohol, drogues, enverinaments, mortalitat materna, desnutrició, etc.) | 10,4 | 10 | 11 |
| **Total** | 100 | **100** | **100** |

Notes de lectura:
- **Respiratori:** l'original va sumar **respiratòries cròniques + infeccions respiratòries baixes** en un sol bloc: 3,91 M + 2,56 M = 6,47 M al GBD 2017. Al 2023 són 4,15 + 2,50 = 6,66 M, és a dir 11,1 per cada 100 (11 persones). Les dues xifres es poden donar juntes o per separat, però no s'han de barrejar.
- **Nom «Pneumonia» d'OWID:** correspon a la causa GBD *lower respiratory infections*, segons les metadades de l'indicador 1159214.
- **Volatilitat anual el 2023:**
  - «Desastres naturals» és alt per culpa del terratrèmol de Turquia i Síria (≈53.000 morts a Turquia al GBD) i de la riuada de Derna, a Líbia (≈13.000). El 2019 van ser només 9.700 morts. Si se citen, convé dir que és una xifra molt variable d'un any a l'altre.
  - «Conflicte i terrorisme» (159.000) inclou Gaza, Ucraïna i el Sudan. Comptabilitza només morts violentes directes, té incertesa alta i el GBD 2023 ja no separa el terrorisme. El 2019, el terrorisme sol eren 19.500 morts (0,04 %).
- **«Foc»:** la categoria GBD és *fire, heat and hot substances*.

---

## 3. Verificació de les afirmacions de l'original

| Afirmació original (dades 2017) | Valor GBD 2017 (vintage antic) | Valor actual (GBD 2023, any 2023) | Veredicte |
|---|---|---|---|
| Cardiovasculars 31 %, 17,79 M | Correcte per al GBD 2017 | **31,9 %, 19,14 M** | Actualitzeu: **32 de cada 100**. |
| Càncer 17 %, 9,56 M | Correcte per al GBD 2017 | **17,6 %, 10,56 M** | Actualitzeu: **18 de cada 100**. |
| Respiratòries + infeccions 11 %, 6,47 M | Correcte (3,91 cròniques + 2,56 infeccions) | **11,1 %, 6,66 M** (4,15 + 2,50) | Correcte en essència. Expliciteu que són dues causes sumades. |
| Demència 4 %, 2,51 M | Correcte per al GBD 2017 | **3,7 %, 2,21 M** | El percentatge es manté (4). La xifra absoluta ha baixat perquè l'IHME ha revisat el model: el GBD 2023 dona 1,78 M per al mateix 2017. |
| Digestives 4 %, 2,38 M | Correcte | **4,0 %, 2,42 M** | Es manté. |
| Neonatals 3 %, 1,78 M | Correcte | **2,7 %, 1,63 M** | Es manté el 3, però **la frase és incorrecta** (vegeu més avall). |
| Diarrea 1,57 M | Correcte per al GBD 2017 | **1,11 M (1,8 %)** | Actualitzeu. El GBD 2023 dona 1,36 M per al 2017, una revisió a la baixa. |
| Diabetis, renals, trànsit ≈ 2 cadascuna | ≈2,2–2,4 % | Diabetis **3**, renal **3** (2,5), trànsit **2** | Diabetis i renal pugen a 3. |
| «Problemes renals» (segona menció), TB, VIH ≈ 2 | — | TB 1,7 → **2**; VIH 1,4 → **1** | **Error a l'original:** el ronyó surt dues vegades («Enfermedades de riñón» i «Problemas renales»). Segurament la segona havia de ser **malalties hepàtiques (cirrosi)**, 1,32 M el 2017 al GBD 2017, on eren categoria pròpia. Al GBD 2023 la cirrosi (1,28 M, 2,1 %) és una **subcategoria de digestives**: si es mostra a part, s'ha de restar de digestives per no comptar-la dues vegades. |
| Suïcidi i malària ≈ 1 cadascuna | Correcte | Suïcidi 1,3; malària 1,1 → **1 i 1** | Es manté. |
| «Mor més gent per suïcidi que per homicidi» | Correcte | Suïcidi 0,77 M contra homicidi 0,44 M (1,8 vegades) | **Correcte.** També és cert contra homicidi + conflicte + terrorisme (0,59 M el 2023; 0,52 M el 2019). Matís: un any amb guerres molt letals podria ajustar la diferència; l'afirmació és certa per al 2019 i el 2023, però no cal generalitzar-la a qualsevol any (per exemple, un any de genocidi com el 1994 pot ser diferent; no s'ha verificat). |
| Homicidi + terrorisme + conflicte ≈ 1 de cada 100 | 0,9 % aprox. | **0,99 % el 2023**; 0,95 % el 2019 | **Correcte** («gairebé una persona»). |
| Ofegament + foc + desastres ≈ 1 de cada 100 | ≈0,8 % | **0,88 % el 2023**; 0,80 % el 2019 | **Gairebé correcte:** «menys d'una persona». Arrodonit dona 1, però és millor escriure «gairebé una». |
| «Els 13 restants» i «les últimes 11 persones» | — | Altres causes: **10** (2023) / **11** (2019) | **Incoherència interna a l'original** (13 i 11 alhora). Feu servir la xifra de la taula agrupada. |
| «Més probable morir de meningitis que de terrorisme» | Correcte | Meningitis 259.000; tot el conflicte i terrorisme junt, 159.000 | **Correcte**, encara que s'hi sumin les guerres. |
| «Més probable morir per l'alcohol que per una guerra» | Correcte | Trastorns per alcohol 172.000; conflicte i terrorisme 159.000 (2023), 97.000 (2019) | **Correcte però ajustat el 2023.** Matís: si es compten totes les morts *atribuïbles* a l'alcohol (factor de risc, ≈2,6 M segons l'OMS) la diferència és enorme. El GBD «alcohol use disorders» només compta la dependència i la intoxicació. |
| «Més probable morir d'infecció respiratòria que per drogues» | Correcte | 2,50 M contra 0,17 M | **Correcte.** |

### Frase neonatal: interpretació incorrecta
«El 3% de los recién nacidos no llegarían a vivir más de unos pocos días» és **incorrecte**. El 3 % és la proporció de **totes les morts** del món que es deuen a trastorns neonatals: prematuritat, asfíxia o trauma del part, sèpsia neonatal, etc. No és la proporció de nadons que moren.

Dades correctes per a la frase:
- **UN IGME** (UNICEF/OMS/BM/ONU), estimacions per al 2024: taxa de mortalitat neonatal de **17,2 per cada 1.000 nascuts vius**. Això vol dir que **≈1,7 % dels nadons moren durant els primers 28 dies**, unes **2,3 milions** de morts neonatals l'any. Font: data.unicef.org/topic/child-survival/neonatal-mortality/.
- L'**OMS** (full informatiu «Newborn mortality», 14-03-2024) afegeix que ≈75 % d'aquestes morts passen la primera setmana i ≈1 milió el primer dia.

Text proposat: «Gairebé 3 de cada 100 morts al món són de nadons que moren per complicacions del naixement en el seu primer mes de vida.»

El GBD «neonatal disorders» (1,63 M) és menor que el total de morts neonatals de l'IGME (2,3 M), perquè molts nadons moren d'altres causes: infeccions, malformacions congènites, etc.

---

## 4. Població

| Afirmació | Original | Valor actual | Font |
|---|---|---|---|
| Població actual | 7.600 milions | **8.232 M (mitjan 2025); 8.301 M (mitjan 2026)**. El 2018 eren 7.730 M i el 2017, 7.646 M, així que l'original era correcte per al seu any. | UN WPP 2024, variant mitjana |
| Població el 2050 | 9.700 milions | **9.664 M** («uns 9.700 milions» encara és acceptable) | UN WPP 2024, variant mitjana |
| Pic | — | **≈10.290 M cap a 2084** (10.289.315.239 el 2084), i baixada a 10.180 M el 2100 | UN WPP 2024, variant mitjana |
| Creixement natural | — | Segons la projecció, els naixements i les defuncions s'igualen cap al 2084 (≈11,5 ‰ cadascuna) | `natalitat-mortalitat.csv` |

- **Edició vigent:** el WPP 2024 continua sent l'edició vigent. No s'ha publicat cap WPP 2026 (population.un.org/wpp, 17-11-2026).
- **Sèrie històrica** (`poblacio-historica.csv`). És la sèrie combinada d'OWID:
  - HYDE 3.3 fins a 1799;
  - Gapminder v7 de 1800 a 1949;
  - UN WPP 2024 de 1950 a 2023;
  - projecció mitjana de l'ONU de 2024 a 2100.
- **Valors orientatius:**
  - any 0: 232 M;
  - any 200: 241 M;
  - any 1000: 323 M;
  - 1500: 503 M;
  - 1800: 983 M;
  - 1900: 1.627 M;
  - 1950: 2.493 M;
  - 2000: 6.172 M;
  - 2023: 8.092 M.
- **Avís per al gràfic:** abans de 1800 les estimacions tenen molta incertesa. Per a l'any 1, la literatura va de ≈170 a ≈300 M. Convé indicar-ho al peu del gràfic. El gràfic original citava el US Census Bureau, que publica precisament aquest ventall d'estimacions històriques. HYDE via OWID és una font més recent, citable i amb un sol valor per any.

### Natalitat i mortalitat (transició demogràfica)
`natalitat-mortalitat.csv` (taxes brutes per 1.000 habitants, ONU WPP 2024):

| Any | Natalitat (‰) | Mortalitat (‰) |
|---|---:|---:|
| 1950 | 36,8 | 19,4 |
| 1970 | 33,6 | 13,0 |
| 1990 | 26,9 | 9,3 |
| 2010 | 20,4 | 7,7 |
| 2023 | 16,3 | 7,6 |
| 2050 (proj.) | 13,7 | 9,5 |

Els anys 2020–2022 mostren un repunt de la mortalitat per la COVID-19.

- **Abans de 1950** no hi ha cap sèrie mundial de taxes brutes de l'ONU. La frase de l'original («natalitat i mortalitat molt elevades però equivalents durant la major part de la història») és correcta com a descripció general de la transició demogràfica: abans de la industrialització, totes dues taxes eren de l'ordre de 30–40 ‰ i el creixement era proper a zero. HYDE dona un creixement mitjà inferior al 0,1 % anual entre l'any 0 i el 1700.
- Si es vol un gràfic de llarga durada, feu servir sèries nacionals (Suècia o Anglaterra des del segle XVIII; OWID «Demographic transition» les té). No inventeu una sèrie mundial anterior a 1950.

### «Homo sapiens era un animal amb poc menys de 10.000 exemplars al Rift d'Àfrica Oriental»
**Veredicte: confús i inexacte.** Cal reescriure-ho.

1. **El ≈10.000 és la *mida efectiva de població* (Ne), no el nombre d'individus.**
   - La genètica de poblacions estima per a l'espècie humana una Ne a llarg termini de l'ordre de 10.000 (p. ex. Takahata 1993, *Mol. Biol. Evol.*; Harpending et al. 1998, *PNAS* 95:1961).
   - La Ne és una mitjana harmònica de llarg termini, ponderada pels mínims, i mesura quants reproductors «ideals» explicarien la diversitat genètica observada.
   - La població censal real era probablement diverses vegades més gran: desenes o centenars de milers d'individus repartits en grups estructurats.
2. **No va ser un sol lloc del Rift.**
   - Els fòssils de *H. sapiens* més antics són a Jebel Irhoud (Marroc), de ≈300.000 anys (Hublin et al. 2017, *Nature* 546:289; Richter et al. 2017, *Nature* 546:293).
   - El consens actual és un origen **panafricà**: diverses poblacions connectades a tot Àfrica (Scerri et al. 2018, *Trends Ecol. Evol.* 33:582).
   - L'Àfrica Oriental és important (Omo Kibish, Etiòpia, ≥233.000 anys), però no és «la cuna» única.
3. **Els colls d'ampolla són debatuts.**
   - Hu et al. 2023 (*Science* 381:979) proposen ≈1.280 reproductors fa 930.000–813.000 anys. Això és en els *avantpassats* d'*H. sapiens*, no en *H. sapiens*.
   - Ho han qüestionat Cousins i Durvasula (2025, *Mol. Biol. Evol.* 42(2): msaf041, «Insufficient evidence for a severe bottleneck…»), i Deng, Nielsen i Song (preprint), que hi veuen un artefacte del mètode. El debat continua obert.
   - El coll d'ampolla de Toba (fa ≈74.000 anys) també està molt qüestionat (p. ex. Smith et al. 2018, *Nature* 555:511, Pinnacle Point).

**Text proposat:** «La genètica suggereix que durant gran part de la nostra història els nostres avantpassats van tenir una diversitat genètica pròpia d'una població reproductora "efectiva" d'uns 10.000 individus, una xifra d'espècie amenaçada, tot i que el nombre real de persones devia ser més gran i repartit per tota l'Àfrica.»

---

## 5. Resum de correccions
1. **Any de dades:** passeu del 2017 al **2023 (GBD 2023)**. Cardiovasculars 32, càncers 18, respiratòries 11 (7 + 4), digestives 4, demència 4, diabetis 3, neonatals 3, renals 3, trànsit 2, diarrea 2, TB 2, i COVID, VIH, suïcidi, malària, «violència» i «accidents naturals» 1 cadascuna, més 10 d'altres causes.
2. **Frase neonatal:** el 3 % és de les morts, no dels nadons. Els nadons que moren el primer mes són ≈1,7 % (IGME).
3. **Duplicació renal:** «Problemas renales» apareix dues vegades. Probablement havia de ser *hepàtiques*. Avui la cirrosi forma part de digestives.
4. **Diarrea:** 1,57 M → **1,11 M**.
5. **«13 restants» i «11 últimes»:** és incoherent. Ara són **10** (2023).
6. **Població:** 7.600 M → **8.300 M (2026)**; 2050 → **9.660 M**; pic de **10.300 M cap a 2084**.
7. **«10.000 exemplars»:** és mida efectiva, no censal. L'origen és panafricà, no només del Rift.
8. **Afirmacions que es mantenen:** més suïcidis que homicidis, «violència» ≈ 1, «accidents i natura» < 1 (≈0,9), meningitis > terrorisme, alcohol > guerra (ajustat el 2023).

## Fonts principals
- GBD 2023 Causes of Death Collaborators. *Lancet* 2025;406:1811–72. doi:10.1016/S0140-6736(25)01917-8.
- IHME GBD 2023 via Our World in Data:
  - https://ourworldindata.org/grapher/annual-number-of-deaths-by-cause
  - https://ourworldindata.org/grapher/share-of-deaths-by-cause
  - https://ourworldindata.org/causes-of-death
- OMS, «The top 10 causes of death» (02-10-2026, GHE 2000–2023): https://www.who.int/news-room/fact-sheets/detail/the-top-10-causes-of-death
- UN DESA, World Population Prospects 2024: https://population.un.org/wpp/. Via OWID:
  - https://ourworldindata.org/grapher/population-with-un-projections
  - https://ourworldindata.org/grapher/crude-birth-rate
  - https://ourworldindata.org/grapher/crude-death-rate
  - https://ourworldindata.org/grapher/births-and-deaths-projected-to-2100
- Població històrica (HYDE 3.3 + Gapminder + WPP 2024): https://ourworldindata.org/grapher/population
- UN IGME / UNICEF, mortalitat neonatal: https://data.unicef.org/topic/child-survival/neonatal-mortality/
- OMS, «Newborn mortality» (14-03-2024): https://www.who.int/news-room/fact-sheets/detail/newborn-mortality
- Hu W. et al. 2023, *Science* 381:979–984; Cousins T., Durvasula A. 2025, *Mol. Biol. Evol.* 42(2):msaf041; Hublin J.-J. et al. 2017, *Nature* 546:289; Scerri E. et al. 2018, *TREE* 33:582.
