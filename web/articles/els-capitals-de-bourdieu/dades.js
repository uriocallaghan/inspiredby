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

  // V5 · Savage et al. (2013, Sociology 47(2)): 7 classes socials al Regne Unit (GfK nacional + renda mitjana familiar £)
  gbcs: [
    { id: "elit", label: "Elit", short: "Elit", pop: 6, income: 89082, tag: "Alt en tots tres capitals", tone: "red" },
    { id: "est",  label: "Classe mitjana establerta", short: "Mitjana establerta", pop: 25, income: 47184, tag: "Alt en tots tres, sota l'elit", tone: "red" },
    { id: "tec",  label: "Classe mitjana tècnica", short: "Mitjana tècnica", pop: 6, income: 37428, tag: "Renda alta · poc capital cultural i social", tone: "yellow" },
    { id: "nou",  label: "Nous treballadors acomodats", short: "Nous acomodats", pop: 15, income: 29247, tag: "Renda mitjana · actius en cultura i xarxa", tone: "blue" },
    { id: "eme",  label: "Treballadors emergents de serveis", short: "Emergents de serveis", pop: 19, income: 21048, tag: "Joves urbans · renda baixa, alt capital cultural emergent", tone: "blue" },
    { id: "tra",  label: "Classe obrera tradicional", short: "Obrera tradicional", pop: 14, income: 13305, tag: "Més grans (66 anys de mitjana) · habitatge propi modest", tone: "ink2" },
    { id: "pre",  label: "Precariat", short: "Precariat", pop: 15, income: 8253, tag: "Mínim en econòmic, cultural i social", tone: "ink2" }
  ],

  // V3 · Esquema de l'espai social (Bourdieu, 1979, La Distinction): posicions relatives en volum (y: -1..1) i estructura (x: -1 cultural .. +1 econòmic)
  espai: {
    professions: [
      { id: "prof-uni", n: "Professors universitaris", short: "Professors", x: -0.72, y: 0.78, g: "dom", mob: true },
      { id: "artistes", n: "Artistes i escriptors", short: "Artistes", x: -0.82, y: 0.56, g: "dom", mob: false },
      { id: "prof-lib", n: "Professions liberals", short: "Prof. liberals", x: 0.08, y: 0.84, g: "dom", mob: false },
      { id: "enginyers", n: "Enginyers", short: "Enginyers", x: -0.18, y: 0.66, g: "dom", mob: false },
      { id: "empresaris", n: "Industrials i empresaris", short: "Empresaris", x: 0.78, y: 0.80, g: "dom", mob: true },
      { id: "grans-com", n: "Grans comerciants", short: "Grans comerç.", x: 0.66, y: 0.54, g: "dom", mob: false },
      { id: "mestres", n: "Mestres d'escola", short: "Mestres", x: -0.58, y: 0.16, g: "mit", mob: false },
      { id: "tecnics", n: "Tècnics i quadres mitjans", short: "Quadres mitjans", x: -0.12, y: 0.12, g: "mit", mob: false },
      { id: "empleats", n: "Empleats d'oficina", short: "Empleats", x: -0.05, y: -0.16, g: "mit", mob: false },
      { id: "petits-com", n: "Petits comerciants i artesans", short: "Comerciants", x: 0.52, y: 0.04, g: "mit", mob: false },
      { id: "obrers-q", n: "Obrers qualificats", short: "Obrers qualif.", x: -0.22, y: -0.50, g: "pop", mob: false },
      { id: "obrers", n: "Obrers no qualificats", short: "Obrers", x: -0.34, y: -0.82, g: "pop", mob: true },
      { id: "pagesos", n: "Pagesos i assalariats agrícoles", short: "Pagesos", x: 0.42, y: -0.78, g: "pop", mob: true }
    ],
    gustos: [
      { n: "Bach · museus d'avantguarda", short: "Bach · museus", x: -0.74, y: 0.66, c: "blue" },
      { n: "Tennis · golf · xampany", short: "Golf · xampany", x: 0.66, y: 0.66, c: "red" },
      { n: "Rhapsody in Blue · fotografia", short: "Rhapsody in Blue", x: -0.34, y: 0.08, c: "yellow" },
      { n: "Futbol · El Danubi blau", short: "Futbol · Danubi blau", x: 0.10, y: -0.58, c: "ink2" }
    ]
  }
};
