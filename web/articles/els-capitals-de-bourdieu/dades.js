/* Dades verificades per als gràfics de «Els quatre capitals de Pierre Bourdieu».
   Fonts:
   - Bourdieu & Passeron (1964), Les Héritiers (França, 1961–1962)
   - Bourdieu (1979), La Distinction (enquesta 1963 i 1967–1968, N = 1.217)
   - Savage et al. (2013), Sociology 47(2), taules 5 i 6 (Great British Class Survey + GfK) */
window.BOURDIEU_DATA = {
  // V2 · Les Héritiers (1964): probabilitat d'accés a la universitat a França (1961–1962) segons professió del pare
  heritiers: [
    { id: "sup", label: "Quadres superiors i professions liberals", short: "Quadres superiors", pct: 58.5, highlight: true },
    { id: "mit", label: "Quadres mitjans", short: "Quadres mitjans", pct: 29.6 },
    { id: "art", label: "Artesans i comerciants", short: "Artesans i comerç", pct: 16.4 },
    { id: "emp", label: "Empleats", short: "Empleats", pct: 9.5 },
    { id: "pag", label: "Pagesos propietaris", short: "Pagesos propietaris", pct: 3.6 },
    { id: "obr", label: "Obrers", short: "Obrers", pct: 1.4, ref: true },
    { id: "agr", label: "Assalariats agrícoles", short: "Assalariats agrícoles", pct: 0.7 }
  ],

  // V4 · La Distinction (1979): preferències musicals (%) segons classe social i titulació
  // Tres obres emblema de les tres zones del gust: Danubi blau (popular), Rhapsody in Blue (mitjà), Clave ben temperat (legítim)
  musica: [
    { id: "o0", label: "Classe obrera · sense títol / CEP / CAP", short: "Obrera · sense títol", danubi: 65.0, rhapsody: 41.0, bach: 1.0 },
    { id: "o1", label: "Classe obrera · BEPC o superior", short: "Obrera · BEPC+", danubi: 62.5, rhapsody: 47.5, bach: 0.0 },
    { id: "m0", label: "Classe mitjana · sense títol / CEP / CAP", short: "Mitjana · sense títol", danubi: 64.0, rhapsody: 41.0, bach: 1.5 },
    { id: "m1", label: "Classe mitjana · BEPC / Batxillerat", short: "Mitjana · Batxillerat", danubi: 31.0, rhapsody: 46.5, bach: 5.0 },
    { id: "m2", label: "Classe mitjana · Estudis superiors", short: "Mitjana · Univ.", danubi: 3.0, rhapsody: 54.0, bach: 21.0 }
  ],

  // V5 · Savage et al. (2013, Sociology 47(2)), taules 5 i 6 (GfK nacional): pes (%), renda, estalvis i valor de l'habitatge (£),
  // puntuació i nombre de contactes socials (cs, cn) i capital cultural «alt» i «emergent» (hb, em)
  gbcs: [
    { id: "elit", label: "Elit", short: "Elit", pop: 6, income: 89082, sav: 142458, house: 325000, cs: 50.1, cn: 16.2, hb: 16.9, em: 14.4, tag: "Molts estalvis, cultura «alta» al màxim", tone: "red" },
    { id: "est",  label: "Classe mitjana establerta", short: "Mitjana establerta", pop: 25, income: 47184, sav: 26090, house: 176834, cs: 45.3, cn: 17.0, hb: 13.7, em: 16.5, tag: "Alt en tot, sota l'elit", tone: "red" },
    { id: "tec",  label: "Classe mitjana tècnica", short: "Mitjana tècnica", pop: 6, income: 37428, sav: 65844, house: 163362, cs: 53.5, cn: 3.6, hb: 9.2, em: 11.4, tag: "Molts estalvis, contactes de prestigi però pocs", tone: "yellow" },
    { id: "nou",  label: "Nous treballadors acomodats", short: "Nous acomodats", pop: 15, income: 29252, sav: 4918, house: 128639, cs: 37.8, cn: 16.9, hb: 6.9, em: 14.8, tag: "Economia moderada, molta cultura emergent", tone: "blue" },
    { id: "eme",  label: "Treballadors emergents de serveis", short: "Emergents de serveis", pop: 19, income: 21048, sav: 1138, house: 17968, cs: 38.3, cn: 14.8, hb: 9.6, em: 17.5, tag: "Renda modesta, la cultura emergent més alta", tone: "blue" },
    { id: "tra",  label: "Classe obrera tradicional", short: "Obrera tradicional", pop: 14, income: 13305, sav: 9500, house: 127174, cs: 41.5, cn: 9.8, hb: 10.8, em: 6.5, tag: "Habitatge raonable, pocs contactes, poca cultura", tone: "ink2" },
    { id: "pre",  label: "Precariat", short: "Precariat", pop: 15, income: 8253, sav: 793, house: 26948, cs: 29.9, cn: 6.7, hb: 6.0, em: 8.4, tag: "El més baix en gairebé tot", tone: "ink2" }
  ],

  // V3 · L'espai social de La Distinction (Bourdieu, 1979, figures de l'espai de les posicions socials i dels estils de vida).
  // Posicions aproximades (x: −1 cultural … +1 econòmic; y: −1 menys capital … +1 més) llegides de la reproducció
  // «Espace social de Bourdieu.svg» de Nicolas Lardot (Wikimedia Commons, CC BY-SA 3.0): centre de cada etiqueta.
  espai: {
    professions: [{"n": "Professions liberals", "short": "Prof. liberals", "x": 0.204, "y": 0.917, "mob": true}, {"n": "Quadres del sector privat", "short": "Quadres del sector privat", "x": 0.01, "y": 0.771, "mob": false}, {"n": "Enginyers", "short": "Enginyers", "x": 0.008, "y": 0.671, "mob": false}, {"n": "Quadres del sector públic", "short": "Quadres del sector públic", "x": -0.203, "y": 0.6, "mob": false}, {"n": "Professors d'universitat", "short": "Professors univ.", "x": -0.38, "y": 0.855, "mob": true}, {"n": "Artistes", "short": "Artistes", "x": -0.886, "y": 0.588, "mob": true}, {"n": "Professors de secundària", "short": "Professors de secundària", "x": -0.572, "y": 0.575, "mob": false}, {"n": "Serveis medicosocials", "short": "Serveis medicosocials", "x": -0.106, "y": 0.309, "mob": false}, {"n": "Intermediaris culturals", "short": "Intermediaris culturals", "x": -0.691, "y": 0.194, "mob": false}, {"n": "Quadres mitjans del comerç", "short": "Quadres mitjans del comerç", "x": -0.136, "y": 0.082, "mob": false}, {"n": "Tècnics", "short": "Tècnics", "x": -0.163, "y": -0.086, "mob": false}, {"n": "Quadres mitjans administratius", "short": "Quadres mitjans administratius", "x": -0.382, "y": -0.216, "mob": false}, {"n": "Empleats d'oficina", "short": "Empleats", "x": -0.318, "y": -0.353, "mob": true}, {"n": "Empleats del comerç", "short": "Empleats del comerç", "x": 0.038, "y": -0.353, "mob": false}, {"n": "Contramestres", "short": "Contramestres", "x": -0.192, "y": -0.516, "mob": false}, {"n": "Obrers qualificats", "short": "Obrers qualificats", "x": -0.351, "y": -0.618, "mob": false}, {"n": "Obrers especialitzats", "short": "Obrers especialitzats", "x": -0.359, "y": -0.807, "mob": false}, {"n": "Peons", "short": "Peons", "x": -0.283, "y": -0.934, "mob": true}, {"n": "Mestres", "short": "Mestres", "x": -0.663, "y": -0.126, "mob": true}, {"n": "Patrons del comerç", "short": "Patrons del comerç", "x": 0.495, "y": 0.785, "mob": false}, {"n": "Patrons de la indústria", "short": "Patrons ind.", "x": 0.506, "y": 0.699, "mob": true}, {"n": "Agricultors", "short": "Agricultors", "x": 0.848, "y": -0.45, "mob": true}, {"n": "Petits comerciants", "short": "Petits comerciants", "x": 0.345, "y": -0.231, "mob": false}, {"n": "Artesans", "short": "Artesans", "x": 0.289, "y": -0.312, "mob": false}],
    practiques: [{"n": "piano", "x": -0.193, "y": 1.003, "mob": true}, {"n": "golf", "x": 0.005, "y": 0.966, "mob": true}, {"n": "tennis", "x": 0.103, "y": 0.855, "mob": false}, {"n": "whisky", "x": -0.105, "y": 0.855, "mob": false}, {"n": "vela", "x": 0.134, "y": 0.61, "mob": false}, {"n": "muntanya", "x": -0.436, "y": 0.568, "mob": false}, {"n": "escacs", "x": -0.268, "y": 0.854, "mob": true}, {"n": "caminar", "x": -0.555, "y": 0.464, "mob": false}, {"n": "guitarra", "x": -0.319, "y": 0.224, "mob": false}, {"n": "comèdia musical", "x": -0.225, "y": -0.038, "mob": false}, {"n": "cervesa", "x": -0.107, "y": -0.45, "mob": false}, {"n": "pesca", "x": 0.065, "y": -0.518, "mob": false}, {"n": "belote (cartes)", "x": -0.273, "y": -0.754, "mob": false}, {"n": "futbol", "x": 0.014, "y": -0.754, "mob": true}, {"n": "vi negre corrent", "x": 0.217, "y": -0.848, "mob": true}, {"n": "natació", "x": -0.072, "y": 0.49, "mob": false}, {"n": "aigua mineral", "x": -0.112, "y": 0.439, "mob": false}, {"n": "equitació", "x": 0.846, "y": 0.938, "mob": true}, {"n": "xampany", "x": 0.824, "y": 0.872, "mob": false}, {"n": "caça", "x": 0.835, "y": 0.656, "mob": false}, {"n": "petanca", "x": 0.519, "y": -0.372, "mob": true}, {"n": "Pernod", "x": 0.522, "y": -0.417, "mob": false}]
  }
};
