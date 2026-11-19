/* Dades verificades per a «El viatge de la pizza» · vegeu research/viatge-de-la-pizza/fonts.md */
window.PIZZA_DADES = {
  napoli: [14.268, 40.852],

  /* 1. Geografia de convergència (4 continents -> Nàpols) */
  origens: [
    {
      id: "blat", nom: "Blat panificable", curt: "Blat", especie: "Triticum aestivum",
      origen: "Creixent Fèrtil i sud del Caspi", lon: 43.0, lat: 37.8,
      epoca: "Fa ~10.000–8.500 anys", pas: 0, cat: "groc", r: 13,
      detall: "Híbrid hexaploide (AABBDD) amb gluten elàstic; Marcussen et al. (2014)"
    },
    {
      id: "llevat", nom: "Llevat del pa", curt: "Llevat", especie: "Saccharomyces cerevisiae",
      origen: "Xina i Taiwan (Àsia Oriental)", lon: 115.5, lat: 28.0,
      epoca: "Origen silvestre asiàtic", pas: 1, cat: "blau", r: 12,
      detall: "Màxima diversitat genètica a la Xina (1.011 genomes); Peter et al. (2018)"
    },
    {
      id: "olivera", nom: "Oli d'oliva", curt: "Olivera", especie: "Olea europaea",
      origen: "Llevant mediterrani", lon: 35.8, lat: 33.2,
      epoca: "Fa ~6.000–7.000 anys", pas: 1, cat: "groc", r: 10,
      detall: "Domesticació primària al Llevant; Besnard et al. (2018)"
    },
    {
      id: "bufala", nom: "Búfala d'aigua", curt: "Búfala", especie: "Bubalus bubalis",
      origen: "Subcontinent indi", lon: 76.2, lat: 25.0,
      epoca: "Fa ~4.500–5.000 anys", pas: 2, cat: "blau", r: 13,
      detall: "Domesticada a l'Índia; migració cap als aiguamolls de Campània (Colli et al., 2018)"
    },
    {
      id: "alfabrega", nom: "Alfàbrega", curt: "Alfàbrega", especie: "Ocimum basilicum",
      origen: "Àsia tropical (Índia / SE asiàtic)", lon: 86.0, lat: 19.5,
      epoca: "Rutes antigues d'espècies", pas: 2, cat: "groc", r: 9.5,
      detall: "Herba aromàtica d'origen asiàtic tropical incorporada al Mediterrani"
    },
    {
      id: "tomaquet", nom: "Tomàquet", curt: "Tomàquet", especie: "Solanum lycopersicum",
      origen: "Andes → Mesoamèrica (Mèxic)", lon: -99.1, lat: 19.4, andes: [-77.0, -9.5],
      epoca: "Europa s. XVI · Nàpols s. XVII–XVIII", pas: 3, cat: "vermell", r: 15,
      detall: "Silvestre als Andes, domesticat a Mèxic (Razifard et al., 2020); salsa a Nàpols 1692"
    }
  ],

  /* 2. Cronologia de 14.400 anys (escala lineal real + zoom lineal 1500–2025) */
  fites: [
    { any: -12400, etiq: "≈ 12.400 aC", lloc: "Shubayqa 1 (Jordània)", titol: "Pa pla abans de l'agricultura", cat: "pa", detall: "Fa ~14.400 anys: restes de pa pla natufià amb cereals silvestres i jonça (Arranz-Otaegui et al., 2018)" },
    { any: -8000, etiq: "≈ 8.000 aC", lloc: "Creixent Fèrtil", titol: "Domesticació del blat", cat: "bio", detall: "Fa ~10.000 anys: el blat hexaploide posterior aporta gliadina i glutenina, la xarxa de gluten" },
    { any: 79, etiq: "79 dC", lloc: "Pompeia (Regio IX)", titol: "Fresc de la «focaccia» romana", cat: "pa", detall: "Pa pla sobre safata de plata amb magrana, dàtils i moretum — sense tomàquet" },
    { any: 997, etiq: "997", lloc: "Gaeta (Campània)", titol: "Primer mot «pizza» escrit", cat: "hist", detall: "Codex Diplomaticus Cajetanus: renda anual de dotze pizzes al bisbe" },
    { any: 1544, etiq: "1544", lloc: "Itàlia", titol: "Mattioli descriu el «pomo d'oro»", cat: "bio", detall: "El tomàquet arriba d'Amèrica, temut durant segles com a solanàcia sospitosa" },
    { any: 1692, etiq: "1692", lloc: "Nàpols", titol: "Primera salsa de tomàquet impresa", cat: "hist", detall: "Antonio Latini publica «Salsa di Pomadoro, alla Spagnuola» a Lo Scalco alla Moderna" },
    { any: 1835, etiq: "1835", lloc: "Nàpols", titol: "Dumas retrata els lazzaroni", cat: "hist", detall: "Pa pla de carrer doblegat en quatre per a obrers sense cuina ni coberts (Le Corricolo)" },
    { any: 1858, etiq: "1858", lloc: "Nàpols", titol: "Tomàquet, mozzarella i alfàbrega", cat: "hist", detall: "De Bourcard documenta la combinació trenta anys abans del mite de 1889" },
    { any: 1889, etiq: "1889", lloc: "Nàpols", titol: "El mite de la reina Margarida", cat: "hist", detall: "Tradició consolidada al s. XX com a símbol nacional (Nowak, 2014)" },
    { any: 1905, etiq: "1905", lloc: "Nova York", titol: "Lombardi's i la pizza americana", cat: "global", detall: "Forns de carbó, blat ric en proteïna i porció gran compartida per a la diàspora" },
    { any: 1970, etiq: "1970", lloc: "Antropologia", titol: "Bharati encunya l'«efecte pizza»", cat: "global", detall: "Allò que es menystenia a casa torna amb prestigi després de triomfar fora" },
    { any: 2017, etiq: "2017", lloc: "UNESCO", titol: "Art del pizzaiuolo napolità", cat: "global", detall: "Inscrit al Patrimoni Cultural Immaterial de la Humanitat" }
  ],

  /* 2b. Parents antropològics del pa pla */
  parents: [
    { nom: "Coca de recapte", lloc: "Catalunya i País Valencià", lon: 1.5, lat: 41.4, cereal: "Blat", foc: "Forn de llenya comunal", rol: "Aprofitament d'horta (escalivada, arengada) sobre pa sense llevar o poc llevat", cat: "med" },
    { nom: "Manakish", lloc: "Llevant (Líban, Síria)", lon: 35.5, lat: 33.9, cereal: "Blat", foc: "Forn de pedra / saj", rol: "Esmorzar comunitari de carrer amb za'atar, oli d'oliva o formatge akkawi", cat: "med" },
    { nom: "Lahmacun", lloc: "Anatòlia i Armènia", lon: 37.4, lat: 37.1, cereal: "Blat", foc: "Forn de volta alta", rol: "Disc ultra-fi que s'enrotlla amb herbes fresques com a plat i cobert alhora", cat: "med" },
    { nom: "Pissaladière", lloc: "Provença (Niça)", lon: 7.26, lat: 43.7, cereal: "Blat", foc: "Forn de pa", rol: "Ceba caramel·litzada, olives i pissalat (pasta de peix hereva del garum romà)", cat: "med" },
    { nom: "Flammekueche", lloc: "Alsàcia", lon: 7.75, lat: 48.6, cereal: "Blat", foc: "Brases de forn de pa", rol: "«Termòmetre comestible» dels pagesos per comprovar si el forn ja era prou calent", cat: "eur" },
    { nom: "Injera", lloc: "Etiòpia i Eritrea", lon: 38.7, lat: 9.0, cereal: "Teff fermentat", foc: "Planxa d'argila (mitad)", rol: "Estovalles, plat i cullera comunals: tothom estripa el mateix pa fermentat", cat: "mon" },
    { nom: "Naan i roti", lloc: "Subcontinent indi", lon: 77.2, lat: 28.6, cereal: "Blat", foc: "Tandoor d'argila / tawa", rol: "Paret vertical a >400 °C que cou el pa en segons amb mínim consum de llenya", cat: "mon" },
    { nom: "Tortilla / tlayuda", lloc: "Mesoamèrica (Oaxaca)", lon: -96.7, lat: 17.1, cereal: "Blat de moro nixtamalitzat", foc: "Comal d'argila", rol: "La calç allibera niacina (vit. B3) i converteix el disc en suport de fesols i formatge", cat: "mon" }
  ],

  /* 3a. Lactosa: malabsorció en adults (%) — Storhaug et al. (2017) & Itan et al. (2010) */
  lactosa_reg: [
    { regio: "Dinamarca", pct: 4, grup: "nord", font: "Storhaug et al. (2017)" },
    { regio: "Europa del Nord-oest", pct: 12, grup: "nord", font: "Storhaug et al. (2017)" },
    { regio: "Itàlia (mitjana)", pct: 50, grup: "italia", font: "Storhaug et al. (2017)" },
    { regio: "Mitjana mundial", pct: 68, grup: "mon", font: "Storhaug et al. (2017)" },
    { regio: "Sardenya (no persistència)", pct: 85, grup: "italia", font: "Itan et al. (2010)" },
    { regio: "Xina i Àsia Oriental", pct: 98, grup: "asia", font: "Storhaug et al. (2017)" }
  ],
  lactosa_llet: [
    { nom: "Llet sencera", g: 4.81, sub: "4,81 g / 100 g · lactosa intacta" },
    { nom: "Mozzarella fresca", g: 0.07, sub: "0–0,07 g · el sèrum se n'enduu el 98 %" },
    { nom: "Parmigiano curat", g: 0.0, sub: "0 g · els bacteris l'han digerida" }
  ],

  /* 3b. Umami: glutamat lliure (mg/100 g) — Yamaguchi & Ninomiya (2000) / Umami Info Center */
  umami: [
    { nom: "Mozzarella fresca", min: 8, max: 12, mid: 10, cat: "blau", nota: "Aporta greix, textura elàstica i lactones; poc glutamat lliure" },
    { nom: "Xampinyó fresc", min: 40, max: 100, mid: 70, cat: "blau", nota: "Moderat en glutamat, però ric en guanilat (sinergia)" },
    { nom: "Tomàquet fresc madur", min: 140, max: 250, mid: 195, cat: "vermell", nota: "El motor umami de la base: glutamat + acidesa que neteja el paladar" },
    { nom: "Anxova curada", min: 480, max: 630, mid: 555, cat: "groc", nota: "Doble cop: molt glutamat i inosinat (IMP) que multiplica el receptor T1R1/T1R3" },
    { nom: "Tomàquet sec", min: 600, max: 700, mid: 650, cat: "vermell", nota: "Deshidratat concentra més del triple de glutamat lliure" },
    { nom: "Bolet sec (cep/shiitake)", min: 1060, max: 1140, mid: 1100, cat: "groc", nota: "Font potent de 5'-guanilat (GMP) + glutamat" },
    { nom: "Parmigiano-Reggiano (24 m)", min: 1200, max: 1680, mid: 1440, cat: "vermell", nota: "La proteòlisi de 24 mesos allibera cristalls de glutamat pur" }
  ],

  /* 4. Física del forn — Varlamov, Glatz & Grasso (2018), Physics Education
     Equació exacta d'interfície: T_int = T_d + (T_o - T_d) / (1 + nu)
     on nu = e_massa / e_superficie.
     Calibrada als punts exactes del paper (T_d = 20 °C):
     - Maó a 330 °C -> T_int = 208 °C => nu_mao = (330 - 208) / (208 - 20) = 0,6489
     - Acer a 330 °C -> T_int = 300 °C => nu_acer = (330 - 300) / (300 - 20) = 0,1071
     - Biscotto volcànic napolità (argila molt porosa, efusivitat inferior al maó estàndard) -> a 485 °C manté T_int ~ 230–240 °C => nu_biscotto ~ 1,12 (esquema calibrat a la pràctica STG 485 °C) */
  forn_materials: {
    biscotto: { nom: "Biscotto volcànic (Nàpols)", nu: 1.12, refT: 485, refNota: "STG 97/2010: 485 °C en 60–90 s sense cremar la base", color: "vermell" },
    mao:      { nom: "Maó refractari (Varlamov 2018)", nu: 0.6489, refT: 330, refNota: "Varlamov et al. (2018): 330 °C → interfície 208 °C (~2 min)", color: "groc" },
    acer:     { nom: "Acer / xapa domèstica", nu: 0.1071, refT: 230, refNota: "Varlamov et al. (2018): a 330 °C crema (300 °C); cal baixar a ~230 °C", color: "blau" }
  },

  /* 5. Emigració italiana 1876–1915 (ISTAT / Rosoli, 14,02 M sortides) */
  diaspora: [
    { pais: "Estats Units", sortides: 4.16, pct: 29.0, lon: -74.0, lat: 40.7, via: "america", mutacio: "Nova York (1905) i Chicago: porció gran, carbó, blat proteic i «efecte pizza»" },
    { pais: "Argentina", sortides: 1.80, pct: 13.0, lon: -58.4, lat: -34.6, via: "america", mutacio: "Buenos Aires: pizza al molde, fugazzeta i fainá de cigrons drets a la barra" },
    { pais: "França", sortides: 1.72, pct: 12.0, lon: 5.4, lat: 43.3, via: "europa", mutacio: "Marsella i el migdia: camions de llenya i parentiu amb la pissaladière" },
    { pais: "Suïssa", sortides: 1.34, pct: 9.5, lon: 8.5, lat: 47.4, via: "europa", mutacio: "Migració estacional i pizzeries urbanes alpines" },
    { pais: "Alemanya", sortides: 1.23, pct: 8.8, lon: 10.4, lat: 51.1, via: "europa", mutacio: "Pizzeries obreres de postguerra (Würzburg 1952) i expansió europea" },
    { pais: "Brasil", sortides: 1.23, pct: 9.0, lon: -46.6, lat: -23.5, via: "america", mutacio: "São Paulo: massa fina, formatge catupiry, rodízio i ritual familiar de diumenge" }
  ],

  /* 5b. Glocalització (8 tradicions contemporànies) */
  glocal: [
    { ciutat: "Nàpols", pais: "Itàlia", lon: 14.27, lat: 40.85, gruix: 1, forn: "Llenya 485 °C (60–90 s)", base: "Tomàquet San Marzano, mozzarella de búfala, alfàbrega", ritual: "Individual (o a portafoglio al carrer); Patrimoni UNESCO 2017", cat: "origen" },
    { ciutat: "Nova York", pais: "EUA", lon: -74.0, lat: 40.71, gruix: 2, forn: "Gas / carbó 280–340 °C", base: "Mozzarella seca, salsa cuita, blat ric en gluten", ritual: "Porció triangular gegant plegada caminant; 13 % dels EUA en menja cada dia", cat: "diaspora" },
    { ciutat: "Chicago", pais: "EUA", lon: -87.63, lat: 41.88, gruix: 4, forn: "Motlle profund 220 °C", base: "Ordre invertit: formatge a sota, tomàquet a sobre (deep-dish, 1943)", ritual: "Plat de forquilla i ganivet per a hiverns freds i àpats llargs", cat: "diaspora" },
    { ciutat: "Buenos Aires", pais: "Argentina", lon: -58.38, lat: -34.6, gruix: 3, forn: "Motlle i pedra", base: "Fugazzeta (ceba i molta mozzarella) + fainá de farina de cigró", ritual: "Menjar dret «de parado» a barres de marbre amb moscato", cat: "diaspora" },
    { ciutat: "São Paulo", pais: "Brasil", lon: -46.63, lat: -23.55, gruix: 2, forn: "Llenya / gas", base: "Catupiry cremós, pollastre esfilagarsat, cors de palmera o xocolata", ritual: "Sopar familiar de diumenge i servei rotatiu (rodízio) amb ganivet i forquilla", cat: "diaspora" },
    { ciutat: "Tòquio", pais: "Japó", lon: 139.69, lat: 35.69, gruix: 2, forn: "Elèctric / llenya napolitana", base: "Sípia, blat de moro i maionesa o teriyaki; també escola napolitana purista", ritual: "Doble vida: delivery localitzat vs. mestres certificats (Ceccarini, 2011)", cat: "glocal" },
    { ciutat: "Estocolm", pais: "Suècia", lon: 18.06, lat: 59.33, gruix: 2, forn: "Elèctric alt", base: "Kebabpizza (carn de kebab, salsa d'all, pebrotins) o plàtan i curri", ritual: "El plat més demanat de l'1 de gener; fusió d'immigració italiana i d'Orient Mitjà", cat: "glocal" },
    { ciutat: "Nova Delhi", pais: "Índia", lon: 77.21, lat: 28.61, gruix: 2, forn: "Cinta / pedra", base: "Paneer tikka, xili verd, coriandre, gingebre; absència de vedella", ritual: "Adaptada al vegetarianisme majoritari i al mapa d'espècies local", cat: "glocal" }
  ]
};
