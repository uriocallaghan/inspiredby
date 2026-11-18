# Cosmic Calendar: scientific validation

Scope: the science behind every event in the 2020 article "El Calendario Cósmico" (`original-calendari-cosmic.txt`). Quotes and attributions (Sagan, Druyan) are out of scope and were not checked.
Checked: 2026-11-17. Machine-readable data: `calendari-events.csv`, same folder.

Status labels:
- **OK**: the original is acceptable.
- **CORRECT**: the original is wrong or out of date.
- **DEBATED**: there is no consensus, so the text must say so.

---

## 1. Scale

**Age of the Universe.** T = 13.787 ± 0.020 Gyr. This is the Planck 2018 base-ΛCDM value (TT,TE,EE+lowE+lensing).
Source: Planck Collaboration (2020), "Planck 2018 results. VI. Cosmological parameters", *A&A* 641, A6. https://doi.org/10.1051/0004-6361/201833910

**Calendar convention.**
- Non-leap year of 365 d = 31,536,000 s.
- Jan 1 00:00 is the Big Bang. Dec 31 24:00 is now (2026).
- For an event *t* years ago, calendar time elapsed since Jan 1 00:00 = (T − t) / T × 31,536,000 s.
- Equivalently, time before midnight on Dec 31 = t / T × 31,536,000 s.

| Calendar unit | Real time |
|---|---|
| 1 day | 37.77 million years (37,772,603 yr) |
| 1 hour | 1.574 million years (1,573,858 yr) |
| 1 minute | 26,231 years |
| 1 second | 437.2 years |

The ±20 Myr uncertainty on T moves dates by at most about 0.15% (roughly 13 hours in early January, about 0.1 s for historical events). That is negligible.

Note on the article's intro: Earth formed 4.54 Ga, so "nothing we know existed for 70% of the history" should read **about two-thirds (67%)**.

---

## 2. Events in the original

For each event: the original calendar date converted back to years ago, then the best current estimate and its calendar date.

### Big Bang: Jan 1. **OK date; CORRECT description**
- 13.787 ± 0.020 Gyr (Planck 2020, above).
- **Wrong:** "an explosion at an original point smaller than a coin". The Big Bang was not an explosion from a point into pre-existing space. It is the expansion of space itself, everywhere at once. Only the region that is now our *observable* Universe was once tiny. The Universe as a whole may be infinite.
- **Wrong:** "in much less than a second the Universe is already larger than our galaxy". The observable Universe was not that large that early.
  - At t ≈ 1 s the temperature was about 10¹⁰ K, about 4×10⁹ times today's 2.7 K. The size scales by the same factor, so today's observable Universe (radius about 46 billion light-years) was then about 10 light-years across.
  - It only reached the size of the Milky Way (about 10⁵ ly) roughly years later.
  - Inflation (about 10⁻³² s) stretched the patch to roughly macroscopic size (centimetres to metres), not to galactic size.
  - Suggested wording: "in a tiny fraction of a second, space expanded by an enormous factor (cosmic inflation)".

### First stars: original Jan 10 (≈ 340 Myr after the Big Bang). **CORRECT / DEBATED**
- Models put the first Population III stars at about **100–250 Myr after the Big Bang**. Source: Bromm & Yoshida 2011, *ARA&A* 49, 373. https://doi.org/10.1146/annurev-astro-081710-102608
- No Pop III star has been observed directly. JWST is finding galaxies that are already chemically enriched by about 280 Myr, which implies stars existed earlier.
- Corrected calendar date: **about Jan 4–5 (range Jan 3–7)**.
- **Wrong:** "many of them now extinct". Pop III stars were massive and lived only a few million years. *All* of them are gone; none have been found surviving.

### First galaxies: original Jan 13 (≈ 450 Myr after the Big Bang). **CORRECT**
- JWST has spectroscopically confirmed galaxies at about **280–300 Myr after the Big Bang**:
  - MoM-z14, z = 14.44, about 280 Myr. Naidu et al. 2026, *Open Journal of Astrophysics* 9. https://doi.org/10.33232/001c.156033
  - JADES-GS-z14-0, z ≈ 14.2–14.3, about 290 Myr. Carniani et al. 2024, *Nature* 633, 318. https://doi.org/10.1038/s41586-024-07860-9
- Corrected calendar date: **Jan 8**, at the latest. These are the earliest *seen* so far, not necessarily the first that formed. Records keep falling.

### Milky Way: original Mar 15 (≈ 11.0 Ga). **CORRECT / DEBATED (definition-dependent)**
- The galaxy has no single "birthday". The oldest Milky Way components are older than 11 Ga:
  - The proto-galaxy ("Aurora") and the old thick disk began forming about **13 Ga** (range 12–13.2 Ga). Source: Xiang & Rix 2022, *Nature* 603, 599. https://doi.org/10.1038/s41586-022-04496-5
  - The last major merger, Gaia-Enceladus/Sausage, happened about 10 Ga (9–11 Ga). Source: Helmi et al. 2018, *Nature* 563, 85. https://doi.org/10.1038/s41586-018-0625-x
- Recommended date: **about Jan 21 (range Jan 16 – Feb 17)**. Mar 15 is only defensible if it is framed as "the Milky Way takes its current shape", which actually lands around Mar 15 – May 7.
- **Wrong:** "the name was given 10,000 million years later". The name came about 2,500 years ago, so with a 13-Ga (or 11-Ga) origin the gap is about **13 (or 11) billion years**, not 10. The Greek *galaxías kýklos* (from *gála*, milk) gave "galaxy"; *Via Lactea* is the Latin form. The Greek origin itself is fine.
- **"More than 200,000 million stars": DEBATED.** Estimates run **100–400 billion**, depending on the assumed average stellar mass (NASA Goddard). Safer wording: "between 100,000 and 400,000 million stars".

### Sun / Solar System: original Aug 31 (≈ 4.65 Ga). **CORRECT (small)**
- The oldest Solar System solids (calcium-aluminium-rich inclusions) date to **4,567.3 ± 0.16 Myr**. Source: Connelly et al. 2012, *Science* 338, 651. https://doi.org/10.1126/science.1226919
- Calendar date: **Sep 2, about 02:00**.
- Process note: planetesimals form in the disk *around* the young Sun; the Sun itself does not form from planetesimals. "Eight planets" is fine (IAU 2006).

### Life on Earth: original Sep 21 (≈ 3.85 Ga). **DEBATED: rephrase**
- Oldest *widely accepted* evidence: stromatolites and microbial mats in the Pilbara, Australia, at **3.48–3.43 Ga**. This gives **Sep 30 – Oct 2**.
  - Djokic et al. 2017, *Nat. Commun.* 8, 15263. https://doi.org/10.1038/ncomms15263
  - Allwood et al. 2006, *Nature* 441, 714. https://doi.org/10.1038/nature04764
- Older claims are **contested**:
  - Isua stromatolites, 3.7 Ga: Nutman et al. 2016, *Nature* 537, 535 (https://doi.org/10.1038/nature19355), disputed by Allwood et al. 2018, *Nature* 563, 241 (https://doi.org/10.1038/s41586-018-0610-4).
  - Nuvvuagittuq, 3.77–4.28 Ga: Dodd et al. 2017, *Nature* 543, 60. https://doi.org/10.1038/nature21377
  - Carbon in a 4.1-Ga zircon: Bell et al. 2015, *PNAS* 112, 14518. https://doi.org/10.1073/pnas.1517557112
- Phylogenomics put the last universal common ancestor (LUCA) at **about 4.2 Ga (4.09–4.33)**. Source: Moody et al. 2024, *Nat. Ecol. Evol.* 8, 1654. https://doi.org/10.1038/s41559-024-02461-1
- Recommendation: "life on Earth by **at least 3.5 Ga (≈ Sep 30)**, possibly as early as 4.1–4.2 Ga (≈ Sep 12–14)". Sep 21 sits inside the debated window but should not be presented as a firm date.

### Sexual reproduction: original Nov 29 (≈ 1.25 Ga). **CORRECT (minor) / DEBATED**
- Oldest fossil evidence: *Bangiomorpha pubescens*, a red alga, re-dated to **1.047 Ga** (1.03–1.06). Calendar date: **Dec 4, about 07:00**. Source: Gibson et al. 2018, *Geology* 46, 135. https://doi.org/10.1130/G39829.1
- Meiosis was probably already present in the last eukaryotic common ancestor, so sex is likely older (more than 1.2 Ga). The date of its *origin* is unknown.

### Multicellular life: original Dec 5 (≈ 1.02 Ga). **CORRECT**
- Simple multicellularity evolved many times and is much older:
  - Filamentous cyanobacteria: more than 2.5 Ga.
  - Decimetre-scale multicellular eukaryotes: **1.56 Ga**. Source: Zhu et al. 2016, *Nat. Commun.* 7, 11500. https://doi.org/10.1038/ncomms11500
  - The contested Francevillian biota: 2.1 Ga (El Albani et al. 2010, *Nature* 466, 100, https://doi.org/10.1038/nature09166).
- Calendar date for multicellular eukaryotes: **about Nov 20** (range Nov 6 – Dec 4).
- **Wrong order:** the original says multicellularity came *six days after* sex. *Bangiomorpha*, the oldest sexual organism, is itself multicellular, so the article's order is unsupported.
- If the article wants "the start of complex beings", use **complex animals (Ediacaran, about 574 Ma, Dec 16)** or the **Cambrian explosion (538.8 Ma, Dec 17)**.
- **Internal inconsistency:** "life appeared 2,500 million years earlier". From Sep 21 to Dec 5 is about 2.8 Gyr in the article's own calendar.

### Life leaves the sea: original Dec 17 (≈ 570 Ma). **CORRECT**
- Dec 17 is the **Cambrian explosion** (538.8 Ma, Dec 17 17:39), not the move onto land.
- The text says "eleven days before the end of the year", but Dec 17 is 15 days before the end. That is an internal error.
- "The first marine animal leaves the sea" is wrong on two counts: plants came first, and microbial mats were on land far earlier (about 3.2 Ga, Homann et al. 2018, *Nat. Geosci.* 11, 665, https://doi.org/10.1038/s41561-018-0190-9).
- Better sequence:
  - **Land plants**: about **470 Ma** (cryptospores; molecular clocks up to about 515 Ma), **Dec 19**. Sources: Wellman et al. 2003, *Nature* 425, 282 (https://doi.org/10.1038/nature01884); Morris et al. 2018, *PNAS* 115, E2274. https://doi.org/10.1073/pnas.1719588115
  - **Oldest land-animal body fossil** (the millipede *Kampecaris obanensis*, Kerrera, Scotland): about **425 Ma**, **Dec 20**. Arthropods made amphibious excursions earlier, in the Cambrian. Source: Brookfield, Catlos & Suarez 2021, *Hist. Biol.* 33, 2014. https://doi.org/10.1080/08912963.2020.1762593
  - The first *demonstrably air-breathing* animal, the millipede *Pneumodesmus* (it has spiracles; Wilson & Anderson 2004, *J. Paleontol.* 78, 169, https://doi.org/10.1666/0022-3360(2004)078%3C0169:MATOPM%3E2.0.CO;2), comes from the Cowie Formation. That formation's age is **debated** (about 414–425 Ma).
  - **Vertebrates (tetrapods)**: trackways at about **395 Ma**, **Dec 21**. Source: Niedźwiedzki et al. 2010, *Nature* 463, 43. https://doi.org/10.1038/nature08623

### First flowers: original Dec 28 (≈ 151 Ma). **OK date; CORRECT description**
- Oldest undisputed angiosperm fossils: about **130–125 Ma**. This includes ***Montsechia vidalii*, from the Montsec range in Lleida (about 130 Ma)**, a nice Catalan angle. Calendar date: **Dec 28, about 13:00**. Source: Gómez et al. 2015, *PNAS* 112, 10985. https://doi.org/10.1073/pnas.1509241112
- Molecular clocks place the angiosperm crown group earlier, at about 149–256 Ma (Barba-Montoya et al. 2018, *New Phytol.* 218, 819, https://doi.org/10.1111/nph.15011). This is **DEBATED** (the "Darwin's abominable mystery" gap).
- **Overstated:** "until then the only colour was green… an explosion of colours over the whole world from Dec 28". Flowering plants became ecologically dominant only about 100–66 Ma, during the Cretaceous Terrestrial Revolution. That is tens of millions of years (about 1 calendar day) after the first flowers. Earlier plants were not purely green either: think of cones, seeds, and autumn-type pigments.

### Dinosaur extinction: original Dec 30. **OK date; CORRECT details**
- The K–Pg boundary and the Chicxulub impact are dated to **66.043 ± 0.011 Ma**. Calendar date: **Dec 30, 06:02**. Source: Renne et al. 2013, *Science* 339, 684. https://doi.org/10.1126/science.1230492
- **Impactor size.** The usual estimate is **about 10–15 km** (Schulte et al. 2010, *Science* 327, 1214, https://doi.org/10.1126/science.1177265). Impact simulations explored about 12–16 km for a steep (45–60°) impact at about 20 km/s (Collins et al. 2020, *Nat. Commun.* 11, 1480, https://doi.org/10.1038/s41467-020-15269-x).
  - "12 km" is acceptable; "10–15 km" is better.
  - It was an **asteroid**: a carbonaceous (C-type) body from beyond Jupiter (Fischer-Gödde et al. 2024, *Science* 385, 752, https://doi.org/10.1126/science.adk4868). "Meteorite" strictly means a fragment that survives on the ground.
- **Wrong:** "extinction of the dinosaurs". Only the *non-avian* dinosaurs died out; birds are dinosaurs.
- **Oversimplified causality.** Mammals radiated because ecological niches were emptied (ecological release), not because predators simply disappeared. Many mammal lineages also died at K–Pg. Deccan Traps volcanism as a contributing factor remains **DEBATED**.

### "First humans" / human–chimpanzee split: original Dec 31 "during the early morning" (madrugada). **CORRECT: major error**
- Estimate: **about 7 Ma (range about 5.5–10 Ma)**. Molecular estimates run about 7–8 Ma (Langergraber et al. 2012, *PNAS* 109, 15716, https://doi.org/10.1073/pnas.1211740109). The oldest putative hominin, *Sahelanthropus*, is about 7 Ma (Brunet et al. 2002, *Nature* 418, 145, https://doi.org/10.1038/nature00879).
- On the calendar, 6–7 Ma falls at **Dec 31, 19:33–20:11**, in the *evening*, not the early morning. (Range 17:39–20:30.) Early morning on Dec 31 would correspond to about 30–38 Ma.
- "Homo sapiens still has about 15 hours to appear" is therefore also wrong. The gap is about **4 h 15 min** (19:33 to 23:48).
- **Wording:** the split marks the start of the **hominin lineage**, not of "human species". The genus *Homo* appears about **2.8 Ma, Dec 31 22:13**. Source: Villmoare et al. 2015, *Science* 347, 1352. https://doi.org/10.1126/science.aaa1343

### Control of fire: original 23:49 (≈ 290 ka). **CORRECT**
- Earliest well-supported *use* of fire: about **1.0 Ma** at Wonderwerk Cave, South Africa, giving **23:22**. Source: Berna et al. 2012, *PNAS* 109, E1215. https://doi.org/10.1073/pnas.1117620109
- Gesher Benot Ya'aqov, Israel: about 0.78 Ma, giving 23:30. Source: Goren-Inbar et al. 2004, *Science* 304, 725. https://doi.org/10.1126/science.1095443
- Habitual fire use in Europe: about 400–300 ka. Source: Roebroeks & Villa 2011, *PNAS* 108, 5209. https://doi.org/10.1073/pnas.1018116108
- Earliest evidence of **making** fire: Barnham, UK, about **400 ka**, probably early Neanderthals, giving **23:44:45**. Source: Davis et al. 2025, *Nature* 649, 631. https://doi.org/10.1038/s41586-025-09855-6 This is new and will need cautious wording.
- Recommendation: "first fire use about 1 Ma (23:22); routine use and fire-making by about 400 ka (23:45)".
- **Internal inconsistency:** the intro says humanity discovered fire "only a few seconds ago". In the article's own calendar it was 11 minutes ago.

### Homo sapiens: original 23:52 (≈ 210 ka), "in East Africa". **CORRECT**
- Oldest *H. sapiens* fossils: Jebel Irhoud, **Morocco**, **315 ± 34 ka**, giving **23:48 (range 23:46:41 – 23:49:17)**.
  - Richter et al. 2017, *Nature* 546, 293. https://doi.org/10.1038/nature22335
  - Hublin et al. 2017, *Nature* 546, 289. https://doi.org/10.1038/nature22336
- Omo Kibish I (Ethiopia) is at least about 233 ka (Vidal et al. 2022, *Nature* 601, 579, https://doi.org/10.1038/s41586-021-04275-8).
- "East Africa" is outdated. The current view is a **pan-African**, structured origin (Scerri et al. 2018, *Trends Ecol. Evol.* 33, 582, https://doi.org/10.1016/j.tree.2018.05.005).
- **Wrong:** "the remaining 8 minutes are what we call history". Recorded history (writing) covers only the **last about 12 seconds**.

### Neanderthal extinction: original "1 minute ago … 30,000 years". **CORRECT**
- Neanderthals disappeared across Europe by **41,030–39,260 cal BP**, about 40 ka. Calendar time: **23:58:28 (about 1 min 32 s before midnight)**. Source: Higham et al. 2014, *Nature* 512, 306. https://doi.org/10.1038/nature13621
- The old "about 28–30 ka at Gibraltar" survival claim is contested and mostly rejected.
- Their genes persist: non-Africans carry about 1–2% Neanderthal DNA. Worth mentioning.

### Peopling of the Americas: original "36 s ago" (≈ 15.7 ka). **CORRECT / DEBATED**
- Footprints at White Sands, New Mexico: **23–21 ka**. They were confirmed by independent pollen and quartz OSL dating. Calendar time: **about 23:59:09 (about 50 s before midnight)**.
  - Bennett et al. 2021, *Science* 373, 1528. https://doi.org/10.1126/science.abg7586
  - Pigati et al. 2023, *Science* 382, 73. https://doi.org/10.1126/science.adh5007
- Pre-LGM presence is still debated by some. Undisputed sites are about 16–14.5 ka: Cooper's Ferry about 16 ka (Davis et al. 2019, *Science* 365, 891, https://doi.org/10.1126/science.aax9830) and Monte Verde about 14.5 ka. Those give 36–33 s before midnight.
- **Inaccurate route:** people did not "cross the Bering Strait". They lived in and crossed **Beringia**, a dry land bridge exposed by low glacial sea level. The early route was probably the **Pacific coast**, because the inland ice-free corridor was not viable until about 13.8 ka.
- **Wrong:** "contact forgotten for more than 10,000 years until Columbus".
  - Norse were at L'Anse aux Meadows in **1021 CE** (Kuitems et al. 2022 (online 2021), *Nature* 601, 388. https://doi.org/10.1038/s41586-021-03972-8).
  - There were continuous Siberia–Alaska contacts and migrations, including Paleo-Inuit (about 5 ka) and Thule/Inuit (about 1 ka).

### Agricultural revolution: original "27 s ago" (≈ 11.8 ka). **OK (minor nuance)**
- Cultivation and domestication began in the Fertile Crescent at **about 11.5–10.5 ka**. Calendar time: **about 23:59:33 (about 26 s before midnight)**.
  - Zeder 2011, *Curr. Anthropol.* 52, S221. https://doi.org/10.1086/659307
  - Larson et al. 2014, *PNAS* 111, 6139. https://doi.org/10.1073/pnas.1323964111
- Farming arose **independently in at least about 11 regions**: China, New Guinea, Mesoamerica, the Andes, Africa, eastern North America, and others.
- **Oversimplified:** "Homo sapiens becomes sedentary at this moment". Sedentism preceded agriculture in places (the Natufians, about 15–12 ka). Many groups stayed mobile.

### Writing: original "14 s ago … about 6,000 years". **CORRECT**
- Proto-cuneiform (Uruk) and the earliest Egyptian hieroglyphs date to **about 3300–3200 BCE, about 5,200 years ago**. Calendar time: **23:59:48 (about 12 s before midnight)**. Source: Woods (ed.) 2010, *Visible Language*, Oriental Institute Museum Publications 32, University of Chicago. https://isac.uchicago.edu/sites/default/files/uploads/shared/docs/oimp32.pdf
- "6,000 years" is too old; there are only proto-writing precursors at that age.
- "The last 3% of Homo sapiens' existence" is wrong: 5,200 / 315,000 is about **1.7%**.
- Independent inventions of writing: Mesopotamia, probably Egypt, China (about 1200 BCE), and Mesoamerica (about 900–600 BCE). "Some civilisations never developed writing" is fine.

### Christianity: original "5 s ago". **OK**
- About 30–33 CE, about 1,995 years ago. Calendar time: **23:59:55.4 (4.6 s before midnight)**.
- It became the state religion of the Roman Empire with the Edict of Thessalonica (380 CE). That is consistent.

### Columbus, 1492: original "1 s ago". **OK date; CORRECT causal claims**
- 534 years ago, giving **23:59:58.8 (1.2 s before midnight)**.
- Problems with the causal claims:
  - **"After the Turkish conquest of Constantinople Europe must seek new routes"** is a classic but historiographically discredited causal link (Lybyer 1915, *English Historical Review* 30, 577, https://doi.org/10.1093/ehr/XXX.CXX.577). Portuguese Atlantic and African exploration began decades *before* 1453 (Ceuta 1415, Madeira about 1420, the Azores about 1427). Iberian motives were access to gold, spices, and the African trade, bypassing Venetian and Muslim intermediaries.
  - **"Columbus's feat starts the Renaissance, and therefore the scientific revolution"** is **wrong**. The Renaissance began in 14th–15th-century Italy, well before 1492. The scientific revolution is usually dated from 1543 (Copernicus, Vesalius). 1492 is only one of several contributing factors.
  - **"Discovers America"** ignores the tens of millions of Indigenous inhabitants and the Norse landfall of 1021. Better: "Columbus reaches the Caribbean / begins sustained Euro-American contact".
  - "Ends more than 10,000 years of isolation between two worlds" is wrong: see the Norse and Beringian contacts above.
  - "Sin querer" (unintentionally): defensible, since he believed he had reached Asia.

### French Revolution, 1789: original "0.5 s ago". **OK**
- 237 years ago, giving **23:59:59.46 (0.54 s before midnight)**.
- "Trigger of contemporary history" is a periodisation convention in Spanish and Catalan historiography (Edat Contemporània from 1789). Present it as a convention.

### "Today" (24:00)
- The Moon landing in 1969 falls at 23:59:59.87, 0.13 s before midnight. All of the "Today" items are within the last about 0.2 s.

---

## 3. Suggested additional milestones (well established)

| Event | Age | Uncertainty | Calendar | Source |
|---|---|---|---|---|
| Recombination: first atoms, CMB released | 380 kyr after the Big Bang | ±~5 kyr | Jan 1, 00:14 | Planck 2020 (above) |
| Moon-forming giant impact | ~4.51 Ga | 4.35–4.53 (debated) | Sep 3 | Barboni et al. 2017, *Sci. Adv.* 3, e1602365, https://doi.org/10.1126/sciadv.1602365 |
| Oldest Earth minerals (Jack Hills zircon) | 4.404 Ga | ±0.008 | Sep 6 | Wilde et al. 2001, *Nature* 409, 175, https://doi.org/10.1038/35051550 |
| LUCA | ~4.2 Ga | 4.09–4.33 | Sep 11 | Moody et al. 2024 (above) |
| Great Oxidation Event (onset) | ~2.43 Ga | 2.5–2.22 | Oct 28 | Poulton et al. 2021, *Nature* 592, 232, https://doi.org/10.1038/s41586-021-03393-7; Gumsley et al. 2017, *PNAS* 114, 1811, https://doi.org/10.1073/pnas.1608824114 |
| First eukaryote fossils | ~1.65 Ga | 1.56–1.75 | Nov 18 | Miao et al. 2019, *Precambrian Res.* 321, 172, https://doi.org/10.1016/j.precamres.2018.11.019; Javaux & Lepot 2018, *Earth-Sci. Rev.* 176, 68, https://doi.org/10.1016/j.earscirev.2017.10.001 |
| Snowball Earth (Cryogenian) | 717–635 Ma | ±~1 | Dec 13–15 | Hoffman et al. 2017, *Sci. Adv.* 3, e1600983, https://doi.org/10.1126/sciadv.1600983 |
| Ediacaran complex life | ~574 Ma | 560–580 | Dec 16 | Matthews et al. 2021, *GSA Bulletin* 133, 612, https://doi.org/10.1130/B35646.1 |
| Cambrian explosion (base of Cambrian) | 538.8 Ma | ±0.2 | Dec 17, 17:39 | ICS Chronostratigraphic Chart, https://stratigraphy.org/chart |
| Great Dying (end-Permian) | 251.94 Ma | ±0.03 | Dec 25, 07:55 | Burgess et al. 2014, *PNAS* 111, 3316, https://doi.org/10.1073/pnas.1317692111 |
| First dinosaurs | ~231.4 Ma | 230–233 | Dec 25, 21:00 | Martínez et al. 2011, *Science* 331, 206, https://doi.org/10.1126/science.1198467 |
| First mammaliaforms | ~205 Ma | 200–225 | Dec 26 | Luo 2007, *Nature* 450, 1011, https://doi.org/10.1038/nature06277 |
| Oldest stone tools (Lomekwi 3) | 3.3 Ma | ±~0.1 | Dec 31, 21:54 | Harmand et al. 2015, *Nature* 521, 310, https://doi.org/10.1038/nature14464 |
| Genus *Homo* | 2.8 Ma | 2.75–2.8 | Dec 31, 22:13 | Villmoare et al. 2015, *Science* 347, 1352, https://doi.org/10.1126/science.aaa1343 |

Visual tip: the "Today" second is dominated by the Moon landing (0.13 s), Columbus (1.2 s) and the Christian era (4.6 s). A zoomed inset for the last minute of Dec 31 works well.

---

## 4. Factual problems beyond dates (summary)

1. The Big Bang is described as an explosion from a point; the Universe "bigger than the galaxy in under a second" is wrong. See §2.
2. "Many" first stars extinct: in fact all of them are.
3. The 10-billion-year gap to the Greek naming is wrong; the star count should be given as a range.
4. Planetesimals described as forming the Sun.
5. Sex before multicellularity: unsupported order. The "2,500 million years" gap is inconsistent.
6. "Eleven days before the end" vs Dec 17 (15 days). Life on land: plants first, not "a marine animal".
7. Flowers: an instant "explosion of colour" is overstated.
8. "Dinosaurs" should be non-avian dinosaurs; the mammal-predator causality is oversimplified; "meteorite" should be asteroid.
9. Human–chimp split in the "early morning": it is the evening (about 19:30). "15 hours to H. sapiens" should be about 4 h.
10. "Few seconds since fire" contradicts the article's own 11 minutes.
11. "The last 8 minutes are history": history is the last about 12 s. "East Africa" origin is outdated.
12. Americas: Beringia, not "the Bering Strait"; no "10,000 years of isolation" (Norse, Inuit).
13. Constantinople as the cause of the voyages of discovery is a discredited thesis. Columbus did not start the Renaissance or the scientific revolution. "Discover" erases Indigenous peoples.
14. Writing is not "6,000 years" or "3%": it is about 5,200 years and about 1.7%.

---

## Verificació de fonts

Checked on 2026-11-17. Each DOI was resolved against Crossref metadata (authors, year, journal, volume, pages, title). Each title or abstract was checked for consistency with the age attributed to it. Non-DOI URLs were checked by HTTP request.

### Corrected
- **Miao et al. 2019, *Precambrian Res.* 321, 172.**
  - The DOI was wrong: it pointed to an unrelated paper on the Jiangnan Orogen.
  - Correct DOI: 10.1016/j.precamres.2018.11.019.
- **Matthews et al., Ediacaran macrobiota chronology.**
  - The journal and DOI were wrong: it is not *J. Geol. Soc.*, and the old DOI did not resolve.
  - Correct: *GSA Bulletin* 133, 612–624 (2021; online 2020). https://doi.org/10.1130/B35646.1
- **Brookfield et al., Historical Biology.**
  - The DOI and journal are correct. Authors: Brookfield, Catlos & Suarez; volume 33 (2021; online 2020).
  - The 425-Ma age belongs to ***Kampecaris obanensis*** (Kerrera), not to *Pneumodesmus*. Event wording fixed in both files.
  - The age of *Pneumodesmus* (Cowie Formation) is marked as debated.
- **Naidu et al. (MoM-z14).**
  - Published version: *Open Journal of Astrophysics* 9 (2026). https://doi.org/10.33232/001c.156033 (replaces the preprint reference).
  - In the CSV, the first-galaxies URL now points to this paper.
- **Davis et al. 2025, Nature.** Volume and pages added: 649, 631–637.
- **Kuitems et al.** Published online 2021, issue *Nature* 601 (2022). Both are now noted.
- **Gibson et al. (*Bangiomorpha*).** Online 2017, *Geology* 46 (2018). Citation as "2018" is correct.
- **Woods (ed.) 2010, *Visible Language*.** The ISAC URL returned 404 and was replaced by the working ISAC page: https://isac.uchicago.edu/sites/default/files/uploads/shared/docs/oimp32.pdf
- **Schulte 2010, Collins 2020, Fischer-Gödde 2024 and about 20 other citations** were given without DOIs. DOIs were looked up and added; all are listed under Verified below.

### Verified (metadata and supported claim match)
- **Cosmology:**
  - Planck 2020, A&A 641 A6
  - Bromm & Yoshida 2011, ARA&A 49, 373 (title "The First Galaxies"; covers Pop III / first stars)
  - Carniani 2024, Nature 633, 318
  - Xiang & Rix 2022, Nature 603, 599
  - Helmi 2018, Nature 563, 85
  - Connelly 2012, Science 338, 651
  - Barboni 2017, Sci. Adv. 3, e1602365 ("Moon 4.51 billion years ago")
  - Wilde 2001, Nature 409, 175
- **Early life:**
  - Moody 2024, Nat. Ecol. Evol. 8, 1654 (LUCA 4.09–4.33 Ga)
  - Djokic 2017, Nat. Commun. 8, 15263
  - Allwood 2006, Nature 441, 714
  - Nutman 2016, Nature 537, 535
  - Allwood 2018, Nature 563, 241
  - Dodd 2017, Nature 543, 60
  - Bell 2015, PNAS 112, 14518
  - Homann 2018, Nat. Geosci. 11, 665
- **Precambrian:**
  - Poulton 2021, Nature 592, 232
  - Gumsley 2017, PNAS 114, 1811
  - Javaux & Lepot 2018, Earth-Sci. Rev. 176, 68
  - Zhu 2016, Nat. Commun. 7, 11500 (1.56 Ga)
  - El Albani 2010, Nature 466, 100
  - Gibson 2018, Geology 46, 135
  - Hoffman 2017, Sci. Adv. 3, e1600983
- **Phanerozoic:**
  - ICS chart (stratigraphy.org/chart, resolves)
  - Wellman 2003, Nature 425, 282
  - Morris 2018, PNAS 115, E2274
  - Wilson & Anderson 2004, J. Paleontol. 78, 169
  - Niedźwiedzki 2010, Nature 463, 43
  - Burgess 2014, PNAS 111, 3316
  - Martínez 2011, Science 331, 206
  - Luo 2007, Nature 450, 1011
  - Gómez 2015, PNAS 112, 10985
  - Barba-Montoya 2018, New Phytol. 218, 819
  - Renne 2013, Science 339, 684
  - Schulte 2010, Science 327, 1214
  - Collins 2020, Nat. Commun. 11, 1480
  - Fischer-Gödde 2024, Science 385, 752
  - Wilson Mantilla 2021, R. Soc. Open Sci. 8, 210050
- **Human evolution:**
  - Langergraber 2012, PNAS 109, 15716
  - Brunet 2002, Nature 418, 145
  - Harmand 2015, Nature 521, 310
  - Villmoare 2015, Science 347, 1352
  - Berna 2012, PNAS 109, E1215
  - Goren-Inbar 2004, Science 304, 725
  - Roebroeks & Villa 2011, PNAS 108, 5209
  - Davis 2025, Nature 649, 631
  - Richter 2017, Nature 546, 293
  - Hublin 2017, Nature 546, 289
  - Vidal 2022, Nature 601, 579
  - Scerri 2018, TREE 33, 582
  - Higham 2014, Nature 512, 306
- **Americas, agriculture and history:**
  - Bennett 2021, Science 373, 1528
  - Pigati 2023, Science 382, 73
  - Davis 2019, Science 365, 891
  - Kuitems 2022, Nature 601, 388
  - Zeder 2011, Curr. Anthropol. 52, S221
  - Larson 2014, PNAS 111, 6139
  - Lybyer 1915, EHR 30, 577
  - NASA Apollo 11 page (resolves)

### Unverified / no single primary source
- **Christianity c. 30–33 CE, Columbus 1492, French Revolution 1789, Edict of Thessalonica 380 CE:** standard historical dates with no single primary source cited. Labelled "general historical consensus" or "historical record" in the CSV.
- **Statements given without a specific citation:**
  - "Farming arose independently in at least ~11 regions": follows Larson et al. 2014, which lists the centres, but the count depends on definitions.
  - Independent invention of writing in China and Mesoamerica (covered in *Visible Language*).
  - Paleo-Inuit and Thule contacts.
  - The observable-Universe size at t = 1 s: an order-of-magnitude estimate derived from standard cosmology, not from a cited paper.
- **Milky Way star count (100–400 billion):** comes from NASA Goddard outreach pages (asd.gsfc.nasa.gov "Blueshift"; imagine.gsfc.nasa.gov), not peer-reviewed. Treat as an outreach-grade range.
