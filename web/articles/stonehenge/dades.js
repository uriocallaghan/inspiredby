/* Dades verificades per a les 6 visualitzacions de «Per què van aixecar Stonehenge?» */
window.STONEHENGE_DADES = {
  stonehenge: { lon: -1.8262, lat: 51.1789 },

  /* 1. Procedència de pedres, ramats i morts a les illes Britàniques */
  orígens: [
    {
      id: "sarsen",
      nom: "Sarsens (50 de 52)",
      curt: "West Woods (~25 km)",
      origen: "Marlborough Downs (Wiltshire)",
      lon: -1.785, lat: 51.402,
      dist: 25, pes: "25 t mitjana (màx. ~30 t)",
      epoca: "Fase 2 · c. 2600–2480 aC",
      pas: 0, cat: "groc", r: 17,
      detall: "30 pilars + 30 llindes + 5 trílits; gres silicificat quasi idèntic a West Woods (Nash et al., 2020)"
    },
    {
      id: "bluestones",
      nom: "Pedres blaves (~80 blocs)",
      curt: "Turons Preseli (~230 km)",
      origen: "Carn Goedog i Craig Rhos-y-felin (Gal·les)",
      lon: -4.74, lat: 51.96,
      dist: 230, pes: "2–4 t cada bloc",
      epoca: "Pedreres ~3400–3000 cal BC · Waun Mawn c. 3000 aC",
      pas: 1, cat: "blau", r: 14,
      detall: "Dolerita tacada i riolita gal·leses; possible cercle previ a Waun Mawn en debat (Parker Pearson et al., 2019, 2021)"
    },
    {
      id: "altar",
      nom: "Pedra de l'Altar (6 t)",
      curt: "Conca Orcadiana (≥ 750 km)",
      origen: "NE d'Escòcia (aflorament exacte obert)",
      lon: -3.28, lat: 58.38,
      dist: 750, pes: "6 t (4,9 × 1,0 × 0,5 m)",
      epoca: "Col·locada al centre (Fase 2)",
      pas: 2, cat: "vermell", r: 18,
      detall: "Zircons laurèntians apunten al NE d'Escòcia (Clarke et al., Nature 2024); cap aflorament exacte confirmat (Pirrie et al., 2026)"
    },
    {
      id: "cremats",
      nom: "Morts cremats (40 % forans)",
      curt: "Cremacions oest de Gal·les",
      origen: "Fora de Wessex (compatible amb Gal·les)",
      lon: -4.42, lat: 51.78,
      dist: 215, pes: "10 de 25 individus analitzats",
      epoca: "c. 3000–2500 aC",
      pas: 3, cat: "blau", r: 11,
      detall: "Isòtops d'estronci en ossos calcinats dels forats Aubrey (Snoeck et al., 2018)"
    },
    {
      id: "porcs",
      nom: "Porcs dels banquets (131)",
      curt: "Ramats d'arreu de l'illa",
      origen: "Gal·les, nord d'Anglaterra i possiblement Escòcia",
      lon: -1.95, lat: 54.95,
      dist: 430, pes: "Sacrifici massiu d'hivern (~9 mesos)",
      epoca: "c. 2800–2400 aC (Durrington Walls)",
      pas: 3, cat: "vermell", r: 12,
      detall: "Multi-isòtops mostren molt pocs porcs criats a Wessex (Madgwick et al., 2019; Wright et al., 2014)"
    },
    {
      id: "orkney",
      nom: "Òrcades (Brodgar i Skara Brae)",
      curt: "Illes Òrcades (~840 km)",
      origen: "Arquitectura ritual i domèstica compartida",
      lon: -3.22, lat: 59.01,
      dist: 840, pes: "Cercle de 104 m i cases quadrades",
      epoca: "c. 3000–2400 aC",
      pas: 4, cat: "groc", r: 12,
      detall: "Les cases de Durrington Walls segueixen el patró ortogonal de Skara Brae (Parker Pearson et al., 2024)"
    }
  ],

  /* 2. Fases Bayesianes (Darvill et al., Antiquity 2012) */
  fases: [
    {
      id: "f1", num: 1,
      titol: "Fase 1 · El fossat circular i el cementiri",
      dates: "3100–2920 a 2965–2755", ini:[-3100,-2920], fi:[-2965,-2755], dIni:"3100–2920", dFi:"2965–2755",
      inici: -3010, fi: -2860,
      desc: "Talús i fossat de ~110 m, 56 forats Aubrey (amb possibles pedres blaves inicials) i el gran cementiri de cremacions."
    },
    {
      id: "f2", num: 2,
      titol: "Fase 2 · Els gegants de sarsen i la fusteria en pedra",
      dates: "2760–2510 a 2470–2300", ini:[-2760,-2510], fi:[-2470,-2300], dIni:"2760–2510", dFi:"2470–2300",
      inici: -2635, fi: -2385,
      desc: "30 pilars sarsen + 30 llindes encaixades, 5 trílits, Pedra de l'Altar, 4 Station Stones i doble cercle Q/R."
    },
    {
      id: "f3", num: 3,
      titol: "Fase 3 · L'Avinguda cap al riu i l'onada Campaniforme",
      dates: "2405–2225 a 2300–2100", ini:[-2405,-2225], fi:[-2300,-2100], dIni:"2405–2225", dFi:"2300–2100",
      inici: -2315, fi: -2200,
      desc: "Avinguda de 2,8 km cap a l'Avon (Bluestonehenge), entrada NE modificada i enterrament de l'Arquer d'Amesbury."
    },
    {
      id: "f4", num: 4,
      titol: "Fase 4 · La darrera coreografia de pedres blaves",
      dates: "2210–2030 a 2160–1925", ini:[-2210,-2030], fi:[-2160,-1925], dIni:"2210–2030", dFi:"2160–1925",
      inici: -2120, fi: -2040,
      desc: "Es desmunta el doble cercle Q/R i s'erigeixen l'oval interior i el cercle exterior de pedres blaves que veiem avui."
    },
    {
      id: "f5", num: 5,
      titol: "Fase 5 · Els forats Y i Z i els gravats de bronze",
      dates: "2020–1745 a 1620–1450", ini:[-2020,-1745], fi:[-1620,-1450], dIni:"2020–1745", dFi:"1620–1450",
      inici: -1880, fi: -1535,
      desc: "S'excaven 59 forats concèntrics Y i Z (c. 1630–1520 cal BC), es graven destrals i dagues sobre els sarsens i el lloc s'abandona."
    }
  ],

  /* 3. Paisatge doble del riu Avon (posicions relatives en km respecte a Stonehenge [0,0]) */
  paisatge_nodes: [
    { id: "sh", nom: "Stonehenge", x: 0.0, y: 0.0, cat: "vermell", r: 15, mat: "Pedra (avantpassats)", detall: "Recinte de pedra sobre la cresta seca, eix solsticial i cementiri de cremacions" },
    { id: "cursus", nom: "Gran Cursus (3 km)", x: -0.2, y: 0.9, cat: "gris", r: 9, mat: "Terra (~3600–3300 aC)", detall: "Recinte allargat de 3 km anterior a Stonehenge (~500 anys més antic)" },
    { id: "bhenge", nom: "Bluestonehenge", x: 2.35, y: -1.15, cat: "blau", r: 10, mat: "Avinguda → Riu Avon", detall: "Cercle de ~25 pedres blaves arran d'aigua, desmantellat i pujat a Stonehenge" },
    { id: "wood", nom: "Woodhenge", x: 2.75, y: 1.55, cat: "groc", r: 11, mat: "Fusta (6 anells)", detall: "Sis anells concèntrics de troncs de roure (~2500 aC) a tocar de Durrington Walls" },
    { id: "durr", nom: "Durrington Walls", x: 2.85, y: 2.05, cat: "groc", r: 18, mat: "Fusta (món dels vius)", detall: "Cercle Sud de fusta, centenars de cases i grans abocadors de banquets hivernals" },
    { id: "archer", nom: "Arquer d'Amesbury", x: 4.5, y: -1.5, cat: "vermell", r: 9, mat: "Tomba Campaniforme (~2300 aC)", detall: "Home crescut als Alps, enterrat a ~5 km amb l'or més antic datat de Gran Bretanya" }
  ],

  /* 4. Mesures acústiques de Cox, Fazenda & Greaney (J. Archaeol. Sci., 2020) */
  acustica: [
    { id: "camp", nom: "Camp obert (sense pedres)", rt: 0.00, amp: 0.0, cat: "gris", detall: "Sense reflexions laterals; la veu s'esvaeix amb el quadrat de la distància" },
    { id: "ext", nom: "Stonehenge · Fora del cercle (fossat)", rt: 0.14, amp: 0.4, cat: "blau", detall: "Fora dels sarsens l'ona acústica s'escapa; quasi cap amplificació (+0,4 dB)" },
    { id: "int", nom: "Stonehenge · Dins el cercle (~2200 aC)", rt: 0.64, amp: 4.3, cat: "vermell", detall: "Maqueta 1:12 de ~157 pedres: reverberació 0,64 ± 0,03 s i parla +4,3 ± 0,9 dB" },
    { id: "sala", nom: "Sala de conferències / estudi modern", rt: 0.65, amp: 5.0, cat: "groc", detall: "Temps de reverberació ideal per a veu nítida i música sense fang sonor" },
    { id: "cat", nom: "Catedral gòtica de pedra (referència)", rt: 4.50, amp: 9.0, cat: "gris", detall: "Eco extrem que embulla les síl·labes ràpides (4–5 s)" }
  ],

  /* 5. Gent: cremacions (Snoeck et al., 2018) + ADNa (Brace 2019, Olalde 2018) + banquets (Wright 2014) */
  cremacions: [
    { id: "wessex", nom: "Creta local de Wessex", count: 15, pct: 60, cat: "groc", detall: "15 dels 25 individus analitzats presenten estronci compatible amb el sud d'Anglaterra" },
    { id: "forans", nom: "Fora de Wessex (compatible amb Gal·les)", count: 10, pct: 40, cat: "blau", detall: "Almenys 10 dels 25 cremats als forats Aubrey provenien de fora (Snoeck et al., 2018)" }
  ],

  adn: [
    {
      id: "mesolitic",
      nom: "Mesolític (~8500–4000 aC)",
      titol: "Abans de l'agricultura: caçadors-recol·lectors occidentals (WHG)",
      desc: "Població poc nombrosa, pell fosca i ulls clars (Brace et al., 2019).",
      grups: [
        { nom: "Caçadors-recol·lectors (WHG)", pct: 100, cat: "blau" },
        { nom: "Agricultors mediterranis (EEF)", pct: 0, cat: "groc" },
        { nom: "Ona continental / estepària", pct: 0, cat: "vermell" }
      ]
    },
    {
      id: "neolitic",
      nom: "Neolític (4000–2500 aC · Fases 1–2)",
      titol: "Qui va alçar els sarsens: substitució quasi completa per agricultors neolítics",
      desc: "Migració des de l'Egeu/Anatòlia per via mediterrània; pell bruna/olivàcia i cabells foscos (Brace et al., 2019).",
      grups: [
        { nom: "Agricultors neolítics (EEF)", pct: 78, cat: "groc" },
        { nom: "WHG residual europeu", pct: 22, cat: "blau" },
        { nom: "Ona continental / estepària", pct: 0, cat: "vermell" }
      ]
    },
    {
      id: "campaniforme",
      nom: "Vas Campaniforme (c. 2450–1800 aC)",
      titol: "El gir radical: ~90 % del pool genètic substituït en pocs segles",
      desc: "Arribada des del Baix Rin (com l'Arquer d'Amesbury); enllaça amb les fases finals de Stonehenge (Olalde et al., 2018).",
      grups: [
        { nom: "Nou patrimoni continental / estepari", pct: 90, cat: "vermell" },
        { nom: "Continuïtat neolítica britànica", pct: 10, cat: "groc" }
      ]
    }
  ],

  /* Cicle estacional sintetitzat de Wright et al. (2014): parts a la primavera, sacrificis als ~9 mesos a tardor-hivern */
  banquets_mesos: [
    { m: 0, nom: "Gen", sac: 14, naix: 2, nota: "Ple hivern · Continuen els sacrificis als ~9–10 mesos" },
    { m: 1, nom: "Feb", sac: 9, naix: 5, nota: "Final d'hivern · Darreres matances abans de marxar" },
    { m: 2, nom: "Mar", sac: 3, naix: 26, nota: "Primavera · Inicis dels parts (farrowing)" },
    { m: 3, nom: "Abr", sac: 2, naix: 38, nota: "Pic de naixements primaverals fora de Durrington" },
    { m: 4, nom: "Mai", sac: 2, naix: 20, nota: "Final de primavera · Garrins criant-se a tota l'illa" },
    { m: 5, nom: "Jun", sac: 3, naix: 6, nota: "Solstici d'estiu · Pocs sacrificis als abocadors" },
    { m: 6, nom: "Jul", sac: 2, naix: 2, nota: "Estiu · Creixement del bestiar als pobles d'origen" },
    { m: 7, nom: "Ago", sac: 3, naix: 1, nota: "Final d'estiu · Preparació i engreix" },
    { m: 8, nom: "Set", sac: 6, naix: 0, nota: "Principi de tardor · Primers desplaçaments cap a Wessex" },
    { m: 9, nom: "Oct", sac: 13, naix: 0, nota: "Tardor · Pugen les matances (~7–8 mesos d'edat)" },
    { m: 10, nom: "Nov", sac: 21, naix: 0, nota: "Tardor tardana · Pic d'entrada de ramats (~8–9 mesos)" },
    { m: 11, nom: "Des", sac: 22, naix: 0, nota: "Solstici d'hivern · Clímax dels banquets a Durrington Walls" }
  ],


  /* 4b. Moure pedres: ritmes d'experiments documentats (Harris, UCL 2016; Richards & Whitby 1997, BBC 1994) */
  moure: {
    ritmes: [
      { id: "ucl", k: 13.3, sub: "10 persones per cada 0,75 t", font: "UCL, 2016", detall: "Deu persones van moure una rèplica de formigó de ¾ de tona sobre un trineu senzill que llisca per troncs fixos" },
      { id: "bbc", k: 5, sub: "200 persones per 40 t", font: "BBC, 1994", detall: "130 voluntaris van pujar una rèplica de 40 t per un pendent de 1:20 sobre un carril greixat; amb sèu en caldrien uns 200" }
    ],
    pedres: [
      { id: "blava", nom: "Pedra blava", t: 3, l: 2.6, h: 1.0, def: false },
      { id: "altar", nom: "Pedra de l'Altar", t: 6, l: 4.9, h: 0.5 },
      { id: "sarsen", nom: "Sarsen mitjà", t: 25, l: 5.4, h: 1.1, def: true },
      { id: "p56", nom: "Rèplica de la pedra 56", t: 40, l: 9.1, h: 1.2 }
    ]
  },

  /* 6b. Plantes a la mateixa escala (diàmetres publicats) */
  escala: [
    { id: "durrington", nom: "Durrington Walls", curt: "Durrington", d: 480, data: "c. 2500 aC", det: "Henge de ~490 × 468 m vora l'Avon, amb cercles de pals i cases (Historic England)" },
    { id: "stonehenge", nom: "Stonehenge (fossat)", curt: "Stonehenge", d: 110, data: "c. 3000 aC", det: "Fossat circular d'uns 110 m (English Heritage)" },
    { id: "woodhenge", nom: "Woodhenge", curt: "Woodhenge", d: 110, data: "c. 2500 aC", det: "Sis anells de pals dins un fossat d'uns 110 m en total (Historic England)" },
    { id: "waunmawn", nom: "Waun Mawn (Gal·les)", curt: "Waun Mawn", d: 110, data: "c. 3000 aC", dash: true, det: "Cercle desmantellat de diàmetre «idèntic» al fossat de Stonehenge, segons Parker Pearson et al. (2021); en debat" },
    { id: "brodgar", nom: "Anell de Brodgar (Òrcades)", curt: "Brodgar", d: 104, data: "c. 2500 aC", det: "Cercle de 104 m, 60 pedres originals (Historic Environment Scotland)" },
    { id: "sarsens", nom: "Cercle de sarsens", curt: "Sarsens", d: 30, data: "c. 2500 aC", det: "Els 30 pilars amb llindes fan un anell d'uns 30 m" },
    { id: "gobekli", nom: "Göbekli Tepe, recinte D", curt: "Göbekli D", d: 14, data: "c. 9500 aC", det: "Recinte de ~14 m de diàmetre interior amb pilars en T de 5,5 m (Haklay i Gopher, 2020)" }
  ],

  /* 7. Cada segle s'inventa el seu Stonehenge */
  mirall: [
    { any: 1136, tipus: "dalt", clau: true, curt: "Merlí", det: "Geoffrey of Monmouth: la «Dansa dels Gegants», portada d'Irlanda per art de màgia" },
    { any: 1655, tipus: "dalt", curt: "Temple romà", det: "Inigo Jones (publicat pòstumament): un temple d'ordre toscà" },
    { any: 1740, tipus: "dalt", clau: true, curt: "Druides", det: "William Stukeley: «temple dels druides britànics», uns 2.000 anys massa tard" },
    { any: 1797, tipus: "baix", curt: "Cau el trílit 57–58", det: "Dos pilars i la llinda cauen; no es redrecen fins al 1958" },
    { any: 1901, tipus: "baix", curt: "Es redreça la pedra 56", det: "Excavació de William Gowland per redreçar el pilar més alt, que s'inclinava" },
    { any: 1918, tipus: "baix", clau: true, curt: "Cecil Chubb el regala", det: "Comprat en una subhasta el 1915, el cedeix a la nació el 1918" },
    { any: 1919, tipus: "baix", anyTxt: "1919–20", curt: "Grues i formigó", det: "Es redrecen les pedres 6, 7, 29, 30, 1 i 2" },
    { any: 1958, tipus: "baix", anyTxt: "1958–59", curt: "Tornen a pujar 57–58", det: "Es redrecen el trílit caigut el 1797 i la pedra 22, caiguda el 1900" },
    { any: 1963, tipus: "dalt", curt: "Ordinador", det: "Gerald Hawkins a Nature: «Stonehenge decoded», un calculador d'eclipsis" },
    { any: 1964, tipus: "baix", curt: "Una pedra més", det: "Es redreça el sarsen que el vent va tombar el 10 de març del 1963" },
    { any: 1985, tipus: "baix", clau: true, curt: "Camp de Faves", det: "1 de juny: uns 1.300 policies aturen la caravana del festival; més de 500 detinguts" },
    { any: 1986, tipus: "baix", curt: "UNESCO", det: "Patrimoni Mundial amb Avebury" },
    { any: 1998, tipus: "dalt", clau: true, curt: "Avantpassats", det: "Parker Pearson i Ramilisonina: pedra per als morts, fusta per als vius" },
    { any: 2000, tipus: "baix", curt: "Accés obert", det: "Tornen les trobades lliures als solsticis; el 2025 n'hi van anar unes 25.000 persones" },
    { any: 2024, tipus: "dalt", curt: "Unió de l'illa", det: "L'Altar ve del nord d'Escòcia: un monument de tota Gran Bretanya" }
  ],

  /* 6. Megalitisme comparat al món (12.000 anys) */
  mon: [
    { id: "gobekli", nom: "Göbekli Tepe", lloc: "Anatòlia SE (Turquia)", inici: -9600, fi: -8200, mid: -8900, pes: 16, lon: 38.92, lat: 37.22, cat: "vermell", carril: 0, detall: "Pilars en T anteriors a l'agricultura (~16–20 t; Dietrich, 2011)" },
    { id: "nabta", nom: "Nabta Playa", lloc: "Núbia (Egipte)", inici: -4800, fi: -4500, mid: -4650, pes: 0.8, lon: 30.72, lat: 22.51, cat: "groc", carril: 1, detall: "Cercle calendàric de pastors nòmades (~4800–4500 aC)" },
    { id: "carnac", nom: "Carnac", lloc: "Bretanya (França)", inici: -4600, fi: -3300, mid: -4000, pes: 20, lon: -3.08, lat: 47.59, cat: "blau", carril: 2, detall: "Milers de menhirs anteriors a Stonehenge en més de 1.000 anys" },
    { id: "newgrange", nom: "Newgrange", lloc: "Vall del Boyne (Irlanda)", inici: -3200, fi: -3000, mid: -3150, pes: 10, lon: -6.48, lat: 53.69, cat: "blau", carril: 0, detall: "Tomba de corredor alineada al solstici d'hivern (~3200 aC)" },
    { id: "stonehenge", nom: "Stonehenge", lloc: "Wiltshire (Gran Bretanya)", inici: -3010, fi: -1535, mid: -2500, pes: 25, lon: -1.83, lat: 51.18, cat: "vermell", carril: 1, detall: "Únic cercle britànic 100 % de pedres foranes (25–750+ km) amb llindes encaixades" },
    { id: "brodgar", nom: "Anell de Brodgar", lloc: "Illes Òrcades (Escòcia)", inici: -2600, fi: -2000, mid: -2350, pes: 6, lon: -3.23, lat: 59.00, cat: "blau", carril: 2, detall: "Cercle contemporani de 104 m al nord extrem de l'illa" },
    { id: "menorca", nom: "Menorca Talaiòtica", lloc: "Menorca (Illes Balears)", inici: -1200, fi: -200, mid: -900, pes: 18, lon: 4.13, lat: 39.96, cat: "vermell", carril: 0, detall: "Naveta des Tudons (976–822 aC) i Taules (~1100–200 aC); UNESCO 2023" },
    { id: "rapanui", nom: "Rapa Nui (Moai)", lloc: "Illa de Pasqua", inici: 1100, fi: 1600, mid: 1350, pes: 14, lon: -109.28, lat: -27.12, cat: "groc", carril: 1, detall: "Estàtues d'avantpassats (~14 t de mitjana) mogudes sense roda" },
    { id: "sumba", nom: "Sumba Occidental", lloc: "Indonèsia (tradició viva)", inici: 1800, fi: 2026, mid: 2000, pes: 17, lon: 119.35, lat: -9.58, cat: "groc", carril: 2, detall: "100–1.000 persones arrosseguen lloses de 17–30+ t amb festins de porcs i búfals (Adams, 2007)" }
  ]
};
