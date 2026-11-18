# On va el CO₂ que emetem — fonts i verificació

Data de la recerca: 17-11-2026. Totes les fonts s'han obert i llegit (PDF o pàgina) llevat que s'indiqui el contrari. Els fitxers descarregats van a `raw/` (els PDFs no es pugen al repositori).

## Fitxers de dades

| Fitxer | Origen | Notes |
|---|---|---|
| `raw/Global_Carbon_Budget_2026_v0.1.xlsx` | ICOS Carbon Portal, objecte `tGBR0_JV6zn3TGDzwaIEUNNn`, col·lecció del DOI 10.18160/GCP-2026 (publicat 10-11-2026) | Fulls «Global Carbon Budget» (1959–2026) i «Historical Budget» (1750–2026), GtC/any |
| `gcb2026_historical_budget_1850_2026_GtC.csv` | Extret del full «Historical Budget» | Columnes: fòssil sense carbonatació, ús del sòl, creixement atmosfèric, oceà, terra, carbonatació del ciment, desquadrament. 2026 = projecció |
| `raw/co2_mm_mlo.txt` → `noaa_mlo_monthly_co2.csv` | NOAA GML, https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.txt (creació del fitxer: 9-10-2026) | Mitjana mensual i desestacionalitzada, març 1958 – setembre 2026. Fins a l'abril del 1974, dades de Scripps |
| `raw/co2_annmean_mlo.txt`, `raw/co2_gr_mlo.txt`, `raw/co2_gr_gl.txt` | NOAA GML | Mitjanes anuals i creixement (Mauna Loa i global) per a comprovacions |
| `raw/oni.ascii.txt` → `noaa_oni_annual_mean.csv` | NOAA CPC, https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt | Mitjana de les estacions de 3 mesos de cada any; 2026 fins a ASO |
| `raw/gcb2026_preprint.pdf` | https://essd.copernicus.org/preprints/essd-2026-895/essd-2026-895.pdf | Text complet llegit (resum, resum executiu, seccions 3.1–3.9, taula 8) |
| `raw/IPCC_AR6_WGI_Chapter05.pdf` | https://www.ipcc.ch/report/ar6/wg1/downloads/report/IPCC_AR6_WGI_Chapter05.pdf | Text llegit |
| `raw/IPCC_AR5_WG1_Chapter06.pdf` | https://www.ipcc.ch/site/assets/uploads/2018/02/WG1AR5_Chapter06_FINAL.pdf | Text llegit |
| `raw/joos2013.pdf` | https://acp.copernicus.org/articles/13/2793/2013/acp-13-2793-2013.pdf | Text llegit |
| `raw/archer2009_preprint.pdf` | https://doi.org/10.1146/annurev.earth.031208.100206 (preprint a ORBi, Universitat de Lieja) | Text llegit |

Els PDFs no són al repositori (tenen copyright); es baixen dels enllaços d'aquesta taula a `raw/`.

El fitxer `web/articles/on-va-el-co2/dades.js` conté només el que fa servir la pàgina (pressupost 1850–2026, Mauna Loa mensual, ONI anual), generat a partir d'aquests fitxers.

Conversió: 1 GtC = 3,664 GtCO₂; 1 ppm = 2,124 GtC (GCB 2026, secció 1).

## Afirmacions → font

### Global Carbon Budget 2026 (Friedlingstein et al. 2026, preprint ESSD, doi:10.5194/essd-2026-895; dades doi:10.18160/GCP-2026)
DOI comprovat (pàgina de la discussió: rebut 30-10-2026, discussió iniciada 10-11-2026, 144 autors).

- Emissions totals 2025: 11,7 ± 0,9 GtC = 42,8 ± 3,2 GtCO₂ (resum). Al full de càlcul: fòssil 10,643 GtC − carbonatació 0,163 + ús del sòl 1,188 = 11,668 GtC → 42,75 GtCO₂.
- Fòssil 2025: 38,4 ± 1,8 GtCO₂ incloent-hi la carbonatació (resum executiu). Carbonatació 2025: 0,163 GtC = 0,6 GtCO₂ (full de càlcul).
- Repartiment per combustible 2025: el preprint diu «coal (41%), oil (33%), natural gas (21%)» (línies 1025–1027), percentatges sobre el fòssil amb la carbonatació inclosa. Al full «Fossil Emissions by Category»: carbó 4,291, petroli 3,503, gas 2,208, ciment 0,403, cremada 0,126 GtC de 10,643 (dividint per aquest total el carbó surt un 40%). L'article fa servir el 41% del preprint.
- Ús del sòl 2025: 1,188 GtC = 4,35 GtCO₂. Brasil, Indonèsia i RD del Congo: 0,7 GtC/any, més de la meitat de les emissions per ús del sòl 2016–2025 (resum executiu).
- Creixement atmosfèric 2025: 4,4 GtC = 2,06 ppm; 2024: 8,0 GtC = 3,8 ppm, rècord (secció 3.5.3). Són mitjanes mundials (NOAA `co2_gr_gl.txt`: 2,06 i 3,76); a Mauna Loa van ser 2,23 i 3,33 ppm.
- Fracció aerotransportada 2016–2025 sense el 2023 i el 2024: 44,5% (càlcul propi amb el CSV; amb tots els anys, 47,6%). Justifica que la dècada quedi per sobre del 44% de l'IPCC «sobretot» per aquests dos anys. Sense absorció: 11,67/2,124 = 5,5 ppm (càlcul propi).
- Oceà 2025: 3,19 GtC = 11,7 GtCO₂ (27%); terra 3,64 GtC = 13,3 GtCO₂ (31%), «the highest on record» (secció 3.7.3); desquadrament 0,47 GtC = 1,7 GtCO₂ (4%). Aire: 4,375 GtC = 16,0 GtCO₂ (37%).
- Mitjana 2016–2025: aire 48%, oceà 27%, terra 22% (resum executiu; recalculat amb el full: 47,6 / 26,8 / 22,3 / desquadrament 3,4%).
- Oceà estancat des del 2016 i terra des del 2000; «the effects of climate change and climate variability» redueixen els embornals un 8% (oceà) i un 19% (terra) el 2016–2025 (resum executiu, línies 290–291). El 19% de la terra és respecte de l'efecte del CO₂ (0,6 de 3,3 GtC l'any).
- «Cumulative sink reduction of 27 ± 21 GtC since 1960 … contributed 7.3 ± 4.5 ppm (7%) to the observed increase in atmospheric CO2» (secció 3.7.2, línies 1637–1640). **Atenció:** no són 27 GtC «deixades a l'aire» (27 GtC serien 12,7 ppm); són 27 GtC menys absorbides respecte d'un món sense canvi climàtic. A l'article: 27 × 3,664 ≈ 100 GtCO₂ (±21 × 3,664 ≈ ±77). L'explicació que no tot es queda a l'aire (com més CO₂ a l'aire, més n'absorbeixen els embornals) és nostra, no una frase del GCB; és la raó física de la diferència entre 12,7 i 7,3 ppm.
- Efecte CO₂ sobre l'embornal terrestre 3,3 ± 0,8 GtC/any (= 12 GtCO₂) i el canvi climàtic el redueix en 0,6 GtC (19%) (secció 3.7.2).
- Els DGVM probablement subestimen la caiguda de l'embornal terrestre amb El Niño; explica el desquadrament negatiu del 1986–87, 1997–98 i 2023–24; després del Pinatubo els models subestimen l'embornal (secció 3.10).
- L'oceà absorbeix més amb El Niño forts (menys desgasificació al Pacífic tropical) (secció 3.6.1). Efecte d'El Niño visible sobretot l'any següent; efecte del 2026 esperat el 2027 (seccions 3.5.4 i 3.6.4).
- Emissions acumulades 1850–2025: 755 ± 55 GtC = 2.765 ± 205 GtCO₂; 36% des del 2000; repartiment: aire 39%, oceà 26%, terra 25%, desquadrament 70 GtC (9%); la terra, font neta de 55 ± 65 GtC (seccions 3.4 i 3.9.1, taula 8). A l'article: ≈ 200 ± 240 GtCO₂; la incertesa (±1σ) inclou el zero, i per això ja no diem «probablement».
- Fòssils dominants des de ~1950 (secció 1). Al full de càlcul, el primer any en què el fòssil supera l'ús del sòl és el 1958.
- Projecció 2026: fòssil −0,4% (−1,5% a +0,6%; línies 254 i 280), 38,2 GtCO₂ (el comunicat de premsa dona només el −0,4%, sense marge); ús del sòl 5,1 GtCO₂; total 43,3 GtCO₂; concentració 427,7 ppm, 54% sobre 278 ppm (resum; el resum executiu diu 53%, 427,7/278 = 1,539).
- Pressupost restant per a 1,5 °C (50%) des de començament del 2027: 150 GtCO₂, menys de 4 anys (resum executiu).
- CDR nou: menys de 30 minuts d'emissions fòssils anuals (resum executiu).
- «Sink» no implica permanència (secció 1).
- Mètodes: terra = mitjana de 23 DGVM; oceà = 10 models + 10 productes fCO₂ (full de càlcul, capçalera).

- Incertesa d'un any (2025, ±1σ = 68% de probabilitat): terra ±0,9 GtC, oceà ±0,7, ús del sòl ±0,7 (resum i línies 380–386) → a la metodologia, ±2,6 a ±3,3 GtCO₂.
- El 2026, l'embornal terrestre és la resta dels altres termes, amb desquadrament zero per construcció (línies 846–849 i 1651); ho diu la nota del 2026 al gràfic anual.
- L'embornal terrestre (S_LAND) és l'absorció neta de tota la terra excloent-ne el canvi d'ús del sòl (línia 284), no només la vegetació «no tocada».
- Absorció dels embornals només calculada amb models/productes: des del 1959 només es mesura directament el creixement atmosfèric (línia 824: S_LAND = mitjana de 23 DGVM).

Nota: el preprint encara és en revisió (comentaris oberts fins al 17-12-2026). Les xifres finals podrien canviar lleugerament. **Data:** la pàgina de l'ESSD diu «Discussion started: 10 Nov 2026» i el comunicat del GCP diu «Published on 10 November 2026» (comprovat el 17-11-2026). La nota de premsa d'Exeter a EurekAlert porta data del 9-11-2026 i ella mateixa diu que el preprint es publica el 10 de novembre; la data correcta de publicació és el 10 de novembre.

### Comunicat del Global Carbon Project (10-11-2026)
https://globalcarbonbudget.org/fossil-co2-emissions-decrease-in-2026/ — Coincideix amb el preprint (38,2 Gt fòssil, 43,3 total, 427,7 ppm, 150 Gt). Diu que l'embornal terrestre «returned to former levels after a severe weakening during the 2023-24 El Niño».

### NOAA GML, Mauna Loa
- https://gml.noaa.gov/ccgg/trends/ (llegida): registre iniciat per C. David Keeling (Scripps) el març del 1958; NOAA des del maig del 1974.
- Fitxer mensual: març 1958 = 315,71 ppm; màxim maig 2026 = 432,34 ppm (el valor mensual més alt del fitxer); 2024: juny 426,91 i maig 426,90 (empat pràctic, per això «cap al maig»).
- Amplitud del cicle mitjà (mensual menys desestacionalitzat): 5,8 ppm el 1959, 6,8 ppm el 2024–25 (càlcul propi). Màxim al maig, mínim al setembre-octubre.
- Nota del fitxer: mesures a Maunakea del desembre 2022 al 4 de juliol de 2023 (a ~21 milles = 34 km) per l'erupció.
- https://gml.noaa.gov/obop/mlo/ (llegida): «located on the north flank of Mauna Loa Volcano … at an elevation of 3397 meters», per sobre de la capa d'inversió marina. L'observatori és al vessant nord, no al cim (que fa uns 4.169 m).

### Keeling (1960), Tellus 12, 200–203, doi:10.3402/tellusa.v12i2.9366
Resum llegit a tellusjournal.org: variació sistemàtica amb l'estació i la latitud a l'hemisferi nord; a l'Antàrtida «a small but persistent increase in concentration».

### IPCC AR6 WGI, capítol 5 (Canadell et al. 2021)
PDF llegit (resum executiu i secció 5.2.1.3).
- Fracció aerotransportada ~44% en sis dècades; embornals han crescut (confiança alta).
- pH superficial: −0,016 a −0,020 per dècada en zones subtropicals des dels anys 80; acidificació per sota dels 2.000 m a l'Atlàntic Nord i a l'oceà Antàrtic.
- La fracció absorbida per terra i oceà baixarà a mesura que augmenti el CO₂ (confiança alta); més enllà del 2100, la terra podria passar a ser font amb emissions molt altes (confiança mitjana).
- Fertilització per CO₂ i més eficiència en l'ús de l'aigua (confiança alta).
- L'absorció oceànica de CO₂ antropogènic és «a two-step set of abiotic processes»: intercanvi aire-mar i transport a l'interior, on es guarda «for decades to millennia».
- Confiança baixa sobre com canviarà la bomba biològica.

### IPCC AR5 WGI, capítol 6, Box 6.1 (Ciais et al. 2013)
PDF llegit. Molècules intercanviades «every few years»; retirar tot el CO₂ humà: «a few hundred thousand years»; 15–40% del CO₂ emès fins al 2100 queda més de 1.000 anys; com més emissions, més fracció remanent. Taula: fotosíntesi–respiració 1–10² anys; tampó de l'aigua de mar 10–10³; reacció amb CaCO₃ 10³–10⁴; meteorització de silicats 10⁴–10⁶.

### Joos et al. (2013), ACP 13, 2793–2825, doi:10.5194/acp-13-2793-2013
PDF llegit. Pols de 100 GtC (≈ 366 GtCO₂, 8,6 anys d'emissions del 2025) sobre 389 ppm; fracció aerotransportada 0,60 ± 0,14 als 20 anys, 0,41 ± 0,13 als 100 anys (±2σ; a l'article «entre un 28 i un 54%»), 25 ± 9% als 1.000 anys (oceà 59 ± 12%, terra 16 ± 14%). Taula 5: coeficients de l'ajust (IRFCO2: a0 0,2173, a1 0,2240, a2 0,2824, a3 0,2763; τ 394,4, 36,54, 4,304 anys; i els d'oceà i terra), vàlids 0–1.000 anys. L'ajust dona 0,235 als 1.000 anys (s'explica al peu). La figura fa servir l'IRF exacta per a l'aire, l'ajust d'oceà, i la terra com a resta.

### Archer et al. (2009), Annu. Rev. Earth Planet. Sci. 37, 117–134, doi:10.1146/annurev.earth.031208.100206
DOI comprovat a Crossref; text llegit al preprint (ORBi, Universitat de Lieja). Resum: «20-35% of the CO2 remains in the atmosphere after equilibration with the ocean (2-20 centuries). Neutralization by CaCO3 draws the airborne fraction down further on time scales of 3-7 kyr.» Termòstat de meteorització de silicats: centenars de milers d'anys.

### Ke et al. (2024), National Science Review 11, nwae367, doi:10.1093/nsr/nwae367
Llegit a OUP. Creixement 2023 a Mauna Loa 3,37 ppm (+86%); embornal terrestre net 0,44 ± 0,21 GtC, el més feble des del 2003; Amazònia −0,31 GtC; incendis del Canadà 0,58 ± 0,10 GtC (= 2,1 GtCO₂). Mètode diferent del GCB (el GCB 2026 dona 1,79 GtC per al 2023 amb models): no es comparen directament.

### Acidificació
- NOAA, https://www.noaa.gov/education/resource-collections/ocean-coasts/ocean-acidification (llegida): pH −0,1 unitats des de la Revolució Industrial ≈ «about 30%» més acidesa; menys ions carbonat per a organismes calcificadors. L'article dona el 26% (10^0,1 = 1,26, la xifra de l'IPCC AR5, resum per a responsables polítics, B.5: «26% increase in hydrogen ion concentration») i diu que sovint s'arrodoneix a un 30%.
- Dore et al. (2009), PNAS 106, 12235–12240, doi:10.1073/pnas.0906044106 (resum llegit a Crossref): gairebé 20 anys a l'estació ALOHA (sèrie HOT, iniciada el 1988), −0,0019 ± 0,0002 unitats de pH l'any. A l'article, simplificat: «les mesures el veuen baixar any rere any des de finals dels anys vuitanta».
- No s'han pogut descarregar les dades HOT (servidor hahana.soest.hawaii.edu inaccessible el 17-11-2026), per això no hi ha cap gràfic de pH.

### Cicle estacional
- Graven et al. (2013), Science 341, 1085–1089, doi:10.1126/science.1239207 (resum a PubMed): amplitud +50% a 45–90°N entre 3 i 6 km als vols del 2009–2011 respecte al 1958–61; intercanvi dels ecosistemes extratropicals del nord +30–60%, sobretot els boreals.
- Wang et al. (2020), Global Change Biology 26, 4462–4477, doi:10.1111/gcb.15162 (resum a PubMed): a Mauna Loa l'amplitud va créixer fins als anys 80 i després no ha canviat significativament.

### El Niño
- ONI (NOAA CPC): 1997 pic NDJ +2,37; 2015–16 pic NDJ 2015 +2,59; 2023–24 pic NDJ 2023 +1,99, ≥0,5 fins a MAM 2024; ASO 2026 +2,46. El Niño és irregular (cada 2 a 7 anys), no periòdic.
- Creixement mundial del CO₂ (NOAA `co2_gr_gl.txt`): 1997 1,98 ppm, 1998 2,84 ppm (l'exemple de «l'any següent» que fa servir l'article); 2015 2,95, 2016 2,83. A Mauna Loa (`co2_gr_mlo.txt`): 2015 2,95, 2016 3,03, rècord fins aleshores (el màxim anterior era 2,97 el 1998). Per això el 2016 ja no es dona com a exemple de «salt l'any següent»: amb dades mundials, el 2015 va pujar més. El GCB (línia 1690) fa servir el 1997/98 i el 2015/16 de manera genèrica.
- Pinatubo: erupció el juny del 1991 (fet històric general).
- Incendis a Indonèsia 1997: article El Niño de la revista (fet ben documentat). Torberes 2015: GCB 2026 secció 3.2.4 («peat fires in equatorial Asia ... 0.2 GtC in 2015»).

## Coses a tenir en compte
- El GCB 2026 és un preprint en revisió.
- El 2024 el pressupost no tanca (desquadrament −1,8 GtC): la xifra d'embornal terrestre del 2024 (2,2 GtC) és dels models i probablement és massa alta.
- Les xifres de la secció de persistència són d'un model (mitjana de models), no mesures.
- L'«índex ONI mitjà de l'any» és una simplificació pròpia per al gràfic; els episodis d'El Niño travessen anys naturals.

## Canvis després de la validació final (17-11-2026)
Corregit segons `research/validacio-final/1-ciencia-i-fonts.md`, `2-text-i-interes.md` i `3-visualitzacions.md`:
- 27 GtC → «unes 100 Gt de CO₂ menys absorbides (±77)» i 7 ppm (±4,5), coherent amb 1 ppm = 2,124 GtC.
- Exemple d'El Niño: el 1997/1998 en lloc del 2016; nota del 2016 al gràfic reescrita.
- «Al cim» → «al vessant nord» del Mauna Loa.
- Entradeta i meta: «De mitjana, menys de la meitat».
- Projecció del 2026 amb el marge (−1,5% a +0,6%).
- El GCB 2026 es presenta com a versió preliminar en revisió (10 de novembre).
- Persistència: 60% que queda als 20 anys i 41% (28–54%) als 100, en lloc de barrejar absorbit i remanent.
- Unitats: tot en Gt de CO₂; les GtC només a l'experiment de Joos (traduïdes) i a la metodologia.
- Carbó 41%, acidesa 26%, «canvi i variabilitat del clima», Graven 2009–2011, terra font neta 55 ± 65 GtC, 2,1 i 3,8 ppm com a mitjanes mundials, El Niño irregular, incertesa ±1σ, embornals modelats, «de dècades a mil·lennis».
- No s'ha canviat el 54% del 2026: el preprint diu 54% al resum i 53% al resum executiu, i 427,7/278 = 1,539.
