/* Dades verificades per a l'article «L'últim sopar de Leonardo» */
window.SOPAR_DADES = {
  /* V1 · Scrollytelling 1: evolució antropològica de la taula */
  etapesTaula: [
    {
      id: "jerusalem",
      titol: "1 · Jerusalem, c. 30 dC (Triclinium)",
      sub: "Reclinats sobre el colze esquerre en divans en forma d'U; mà dreta lliure i peus cap enfora.",
      detall: "Postura del banquet grecoromà adaptada al judaisme (Mixnà Pessahim 10:1; Jn 13,23–25). Explica com Joan reposa sobre el pit de Jesús i com Jesús pot rentar els peus per darrere."
    },
    {
      id: "ravenna",
      titol: "2 · Ravenna, s. VI (Stibadium / Sigma)",
      sub: "Taula semicircular amb pa i dos peixos grossos; Jesús ocupa l'extrem esquerre i Judes resta integrat a la corba.",
      detall: "Mosaic de Sant'Apollinare Nuovo (c. 500–526) i Evangeliari de Rossano (s. VI): la postura reclinada es manté cinc segles després, però la taula passa d'U a semicercle."
    },
    {
      id: "medieval",
      titol: "3 · Europa medieval i s. XV (Judes exiliat)",
      sub: "Taula recta de cavallets i cadires/bancs; Europa adopta la postura erecta i exilia Judes sol al costat frontal.",
      detall: "De la Seu d'Urgell (1242–1255) a Castagno (1447) i Ghirlandaio (1480): els dotze apòstols es col·loquen al costat llunyà amb aurèola i Judes queda aïllat sense aurèola al davant."
    },
    {
      id: "mila",
      titol: "4 · Milà, 1495–1498 (El fris de Leonardo)",
      sub: "Tots tretze al mateix costat, zero aurèoles i perspectiva convergent a la templa dreta de Crist.",
      detall: "Leonardo integra Judes dins la segona tríada, l'aïlla només amb l'ombra i la postura enretirada, i estén el mural com a quarta paret real del refectori dominic."
    }
  ],

  /* V2 · Matriu comparativa textual (NA28 + Leonardo) */
  textosCols: [
    { id: "1co", nom: "1 Corintis 11", meta: "Pau · c. 53–55 dC" },
    { id: "mc",  nom: "Marc 14",       meta: "~70 dC" },
    { id: "mt",  nom: "Mateu 26",      meta: "~80–85 dC" },
    { id: "lc",  nom: "Lluc 22",       meta: "~80–90 dC" },
    { id: "jn",  nom: "Joan 13–19",    meta: "~90–100 dC" },
    { id: "leo", nom: "Leonardo",      meta: "Milà · 1495–1498" }
  ],
  /* estats: "si" (blau), "no" (vermell - omissió o xoc), "deb" (groc - variant o síntesi) */
  textosVars: [
    {
      id: "pasqua", nom: "Marc pasqual", divergencia: true, fontLeo: false,
      c: [
        { s: "no",  v: "Sense menció", d: "1 Co 11 no esmenta la Pasqua («la nit en què era lliurat», 11,23), tot i que Pau usa la metàfora pasqual a 1 Co 5,7." },
        { s: "si",  v: "15 nissan",    d: "Mc 14,12.17: «el primer dia dels Àzims, quan s'immola la Pasqua»; sopar a l'inici del 15 de nissan." },
        { s: "si",  v: "15 nissan",    d: "Mt 26,17–20 segueix el marc cronològic pasqual de Marc." },
        { s: "si",  v: "15 nissan",    d: "Lc 22,7–15 presenta explícitament l'àpat com a sopar de Pasqua." },
        { s: "no",  v: "14 nissan",    d: "Contradicció clau: Jn 13,1 («abans de la festa»), 18,28 i 19,14 situen la mort abans del sopar pasqual, mentre s'immolen els anyells." },
        { s: "no",  v: "Sense anyell", d: "No hi ha anyell pasqual ni pa àzim." }
      ]
    },
    {
      id: "postura", nom: "Postura i sala", divergencia: true, fontLeo: false,
      c: [
        { s: "si",  v: "Triclinium",   d: "Comunitat de Corint dividida entre el triclinium i el pati/atrium (Murphy-O'Connor 1983 sobre Theissen 1982)." },
        { s: "si",  v: "Ajaguts",      d: "Mc 14,15.18: sala superior (anagaion) i comensals reclinats (anakeimenōn)." },
        { s: "si",  v: "Ajaguts",      d: "Mt 26,20: anekeito (reclinat amb els Dotze)." },
        { s: "si",  v: "Ajaguts",      d: "Lc 22,12.14: anagaion i anepesen (reclinat amb «els apòstols»)." },
        { s: "si",  v: "Ajaguts",      d: "Jn 13,23: el deixeble estimat jau al pit de Jesús (anakeimenos ... en tō kolpō), impossible asseguts en fila." },
        { s: "no",  v: "Asseguts en fila", d: "Tots tretze asseguts o drets al costat llunyà d'una taula rectangular de cavallets renaixentista." }
      ]
    },
    {
      id: "rentament", nom: "Rentament de peus", divergencia: true, fontLeo: false,
      c: [
        { s: "no",  v: "Absent",       d: "No apareix a 1 Corintis 11." },
        { s: "no",  v: "Absent",       d: "No apareix a Marc 14." },
        { s: "no",  v: "Absent",       d: "No apareix a Mateu 26." },
        { s: "no",  v: "Només lema",   d: "Lluc 22,27 esmenta servir a taula però no narra el rentament de peus." },
        { s: "si",  v: "Jn 13,1–20",   d: "Substitueix el pa i el vi: Jesús se cenyeix un lention d'esclau i renta (niptō) els peus dels deixebles." },
        { s: "no",  v: "Porta 1652",   d: "Leonardo no pinta el rentament; el 1652 els frares fins i tot tallaren els peus de Crist en obrir la porta." }
      ]
    },
    {
      id: "eucaristia", nom: "Pa i vi (institució)", divergencia: true, fontLeo: true,
      c: [
        { s: "si",  v: "Pa → Copa",    d: "1 Co 11,23–25: pa primer i copa «després de sopar»; nova aliança i «feu això en memòria meva»." },
        { s: "si",  v: "Pa → Copa",    d: "Mc 14,22–25: pa i una copa («sang de l'aliança», sense «nova» ni anamnēsis)." },
        { s: "si",  v: "Pa → Copa",    d: "Mt 26,26–29: únic relat del sopar que afegeix «per al perdó dels pecats» (eis aphesin hamartiōn)." },
        { s: "deb", v: "Debat 22,19b–20", d: "Text llarg (P75, Aleph, B): Copa 1 → Pa → Copa 2 (Metzger). Text curt (Codex Bezae D): Copa → Pa sense 19b–20 (Ehrman)." },
        { s: "no",  v: "Absent al sopar", d: "Joan omet completament la institució del pa i el vi durant el sopar (la trasllada al discurs de Jn 6,51–58)." },
        { s: "deb", v: "Al·lusió dual", d: "Leo Steinberg (2001): les mans obertes de Crist assenyalen el pa i el got de vidre amb vi sense calze daurat." }
      ]
    },
    {
      id: "anamnesis", nom: "«En memòria meva»", divergencia: true, fontLeo: false,
      c: [
        { s: "si",  v: "Sí (11,24–25)", d: "1 Co 11,24 i 11,25 (amb hosakis ean pinēte) són la font més antiga del manament de repetició." },
        { s: "no",  v: "No hi surt",   d: "Absent de l'Evangeli de Marc." },
        { s: "no",  v: "No hi surt",   d: "Absent de l'Evangeli de Mateu." },
        { s: "deb", v: "Només text llarg", d: "Apareix a Lc 22,19b al text llarg, però falta al Codex Bezae (D) i manuscrits Vetus Latina." },
        { s: "no",  v: "No hi surt",   d: "Absent a Joan; en lloc d'això dona el «manament nou» de l'amor (Jn 13,34)." },
        { s: "no",  v: "Sense text",   d: "L'obra no conté inscripcions litúrgiques; comunica la tensió humana del moment." }
      ]
    },
    {
      id: "judes", nom: "Judes anomenat a taula", divergencia: true, fontLeo: true,
      c: [
        { s: "no",  v: "Mai en Pau",   d: "Pau no anomena mai Judes; usa paredideto («era lliurat», 11,23), passiu que pot designar el lliurament diví." },
        { s: "no",  v: "Anònim a taula", d: "Anomena Judes a 14,10 i 14,43, però al sopar només diu «un dels Dotze» (14,18–20)." },
        { s: "si",  v: "Mt 26,25",     d: "Identificat pel nom: «Judes digué: No sóc pas jo, rabí? — Tu ho has dit (Sy eipas)»." },
        { s: "no",  v: "Després i anònim", d: "Lluc col·loca l'anunci després de les copes (22,21–23) sense dir el nom de Judes a taula." },
        { s: "si",  v: "Jn 13,26–27",  d: "Judes fill de Simó Iscariot rep el bocí mullat i surt a la nit." },
        { s: "si",  v: "Individualitzat", d: "En penombra dins la 2a tríada, subjectant la bossa de plata i tombant el saler." }
      ]
    },
    {
      id: "plat", nom: "Mà al plat comú", divergencia: false, fontLeo: true,
      c: [
        { s: "no",  v: "Absent",       d: "No consta a 1 Corintis 11." },
        { s: "si",  v: "Suca al plat",  d: "Mc 14,20: «el qui suca amb mi al plat» (trublion)." },
        { s: "si",  v: "Mt 26,23",     d: "Precisa «el qui ha sucat la mà amb mi al plat» (embapsas tēn cheira en tō trubliō)." },
        { s: "deb", v: "Sobre la taula", d: "Lc 22,21 diu només «la mà del qui em lliura és amb mi sobre la taula» (epi tēs trapezēs)." },
        { s: "deb", v: "Bocí mullat",  d: "Jn 13,26: Jesús mateix mulla un bocí de pa (psōmion) i el lliura a Judes." },
        { s: "si",  v: "Font: Mt 26,23", d: "Pres literalment de Mateu: mà dreta de Crist i mà esquerra de Judes s'acosten al mateix plat." }
      ]
    },
    {
      id: "pere_joan", nom: "Senyal de Pere i Joan", divergencia: true, fontLeo: true,
      c: [
        { s: "no",  v: "Absent",       d: "Absent a 1 Corintis." },
        { s: "no",  v: "Absent",       d: "Absent a Marc." },
        { s: "no",  v: "Absent",       d: "Absent a Mateu." },
        { s: "no",  v: "Absent",       d: "Absent a Lluc." },
        { s: "si",  v: "Jn 13,23–25",  d: "Pere fa un senyal al deixeble estimat (reclinat al pit) perquè pregunti qui és el traïdor; a 18,10 Pere treu l'espasa contra Malc." },
        { s: "si",  v: "Font: Jn 13 i 18", d: "Muntatge joànic directe: Pere s'inclina darrere Judes cap a Joan imberbe mentre amaga un ganivet a l'esquena." }
      ]
    },
    {
      id: "comensals", nom: "Qui era a la sala", divergencia: true, fontLeo: false,
      c: [
        { s: "si",  v: "Tota l'església", d: "A Corint hi menjaven homes, dones, lliberts i esclaus, amb conflicte entre rics i tous mē echontas (11,22)." },
        { s: "si",  v: "«Els Dotze»",  d: "Mc 14,17: meta tōn dōdeka." },
        { s: "si",  v: "«Els Dotze»",  d: "Mt 26,20: meta tōn dōdeka." },
        { s: "si",  v: "«Els apòstols»", d: "Lc 22,14: hoi apostoloi." },
        { s: "deb", v: "«Els deixebles»", d: "Jn 13 no usa mai «els Dotze» (només hoi mathētai)." },
        { s: "si",  v: "12 homes", d: "Quatre tríades masculines confirmades per la còpia de Giampietrino (Joan jove, no Maria Magdalena)." }
      ]
    }
  ],

  /* V3 · Comparador MAP-15 Leonardo vs Giampietrino: coordenades calibrades al canvas 1600×586 */
  cenacolo: {
    vp: { x: 0.502, y: 0.258 }, // Forat del clau a la templa dreta de Crist
    porta1652: { x0: 0.365, x1: 0.648, yTop: 0.700, ySide: 0.755 },
    personatges: [
      { id: "bartomeu", nom: "1 · Bartomeu",      triada: 1, x: 0.092, y: 0.235, col: "blau",    det: "A l'extrem esquerre, s'aixeca recolzant les mans al cantó de la taula mirant cap a Crist." },
      { id: "jaumemenor", nom: "2 · Jaume el Menor", triada: 1, x: 0.148, y: 0.265, col: "blau",    det: "Allarga el braç esquerre darrere Andreu fins a tocar l'espatlla de Pere." },
      { id: "andreu",   nom: "3 · Andreu",        triada: 1, x: 0.184, y: 0.245, col: "blau",    det: "Alça tots dos palmells oberts en gest d'estupor i negació («Jo no he estat»)." },
      { id: "judes",    nom: "4 · Judes Iscariot",triada: 2, x: 0.281, y: 0.360, col: "vermell", det: "Integrat al mateix costat però reculat en ombra (cap més baix); subjecta la bossa i tomba el saler mentre acosta la mà al plat (Mt 26,23)." },
      { id: "pere",     nom: "5 · Simó Pere",     triada: 2, x: 0.312, y: 0.290, col: "blau",    det: "S'inclina impetuosament darrere Judes cap a Joan per fer-li un senyal (Jn 13,24) mentre empunya un ganivet rere l'esquena (Jn 18,10)." },
      { id: "joan",     nom: "6 · Joan Evangelista", triada: 2, x: 0.346, y: 0.300, col: "groc", det: "El deixeble jove i imberbe de la tradició renaixentista (no Maria Magdalena), amb les mans entrellaçades i el cap inclinat." },
      { id: "crist",    nom: "7 · Jesucrist",     triada: 0, x: 0.503, y: 0.260, col: "ink",     det: "Centre triangular i punt de fuga físic (forat del clau a la templa dreta). Les mans senyalen alhora la traïció i el pa/vi (Steinberg 2001)." },
      { id: "tomas",    nom: "8 · Tomàs",         triada: 3, x: 0.605, y: 0.265, col: "blau",    det: "S'acosta per darrere aixecant el dit índex amunt en signe de dubte o pregunta («És veritat?»)." },
      { id: "jaumemajor", nom: "9 · Jaume el Major", triada: 3, x: 0.629, y: 0.315, col: "blau", det: "Obre els braços d'esglai davant Crist (l'únic estudi del natural conservat a Windsor, RCIN 912552)." },
      { id: "felip",    nom: "10 · Felip",        triada: 3, x: 0.669, y: 0.215, col: "groc",    det: "S'incorpora amb les mans al pit en protesta innocent (estudi a Windsor RCIN 912551)." },
      { id: "mateu",    nom: "11 · Mateu",        triada: 4, x: 0.834, y: 0.255, col: "blau",    det: "Gira el cos cap a Tadeu i Simó estenent els braços en direcció a Crist (un dels 3 rostres no raspats per Mazza el 1770)." },
      { id: "tadeu",    nom: "12 · Judes Tadeu",  triada: 4, x: 0.905, y: 0.260, col: "blau",    det: "Escolta i gesticula amb el palmell cap amunt en el debat de la quarta tríada (respectat el 1770)." },
      { id: "simo",     nom: "13 · Simó el Zelota", triada: 4, x: 0.958, y: 0.240, col: "blau",  det: "Tanca el grup de la dreta estenent totes dues mans obertes sobre la taula (respectat el 1770)." }
    ],
    pistes: [
      { id: "ganivet",  nom: "El ganivet de Pere (RCIN 912546)", x: 0.232, y: 0.440, col: "blau",    det: "No és una «mà sense cos»: a Giampietrino i al dibuix de Windsor RCIN 912546 es veu perfectament que és el braç dret retorçat de Pere, prefigurant Jn 18,10." },
      { id: "saler",    nom: "El saler bolcat de Judes",        x: 0.288, y: 0.578, col: "vermell", det: "Gairebé esborrat a l'original degradat de Milà, però nítid a Giampietrino: simbolitza la ruptura del pacte de la sal i del comensal." },
      { id: "plat",     nom: "Mans al plat (Mateu 26,23)",      x: 0.388, y: 0.545, col: "vermell", det: "La mà esquerra de Judes i la dreta de Crist convergeixen cap al mateix plat — cita visual directa de Mt 26,23." },
      { id: "peus",     nom: "Els peus amputats el 1652",       x: 0.508, y: 0.915, col: "vermell", det: "Arrossega la cortina cap a l'esquerra: la porta oberta pels frares el 1652 va destruir els peus de Crist, visibles gràcies a Giampietrino." },
      { id: "vidre",    nom: "Gots de vidre sense calze d'or",  x: 0.594, y: 0.578, col: "blau",    det: "No hi falta cap Sant Greal: cada comensal té un got de vidre transparent amb vi negre, en clau domèstica del segle XV." },
      { id: "estovalles", nom: "Estovalles de Perusa nuades",   x: 0.985, y: 0.780, col: "ink",     det: "Lli blanc amb franges blaves (tovaglia perugina) recollit amb un nus domèstic als extrems perquè no fregués el terra." }
    ]
  },

  /* V5 · Tall estratigràfic paret sud vs paret nord */
  estratigrafia: {
    sud: [
      { nom: "Mur de maó (paret sud)", desc: "Mur estructural del refectori (1495)", gruix: 28, c: "#C9C9C9" },
      { nom: "Arriccio (morter gruixut)", desc: "Base rugosa de calç i sorra", gruix: 18, c: "#DADADA" },
      { nom: "Intonaco humit (calç fresca)", desc: "Fresc per jornades sobre calç humida", gruix: 22, c: "#9DB6DD" },
      { nom: "Carbonatació química", desc: "Pigment soldat dins la calcita (resisteix)", gruix: 20, c: "#2C5DA8" }
    ],
    nord: [
      { nom: "Mur prim amb humitat de cuines", desc: "Mur fred contigu a les cuines dominiques", gruix: 24, c: "#C9C9C9" },
      { nom: "Arriccio (morter base)", desc: "Capa preparatòria de morter gruixut", gruix: 16, c: "#DADADA" },
      { nom: "Carbonat de calci + magnesi i cola", desc: "Capa seca rígida en comptes d'intonaco", gruix: 16, c: "#E9A391" },
      { nom: "Imprimatura de blanc de plom", desc: "Base d'oli i plom per reflectir la llum", gruix: 16, c: "#F5C518" },
      { nom: "Tremp d'ou i oli aplicats a secco", desc: "No es solda: cau ja el 1517–1518 (De Beatis)", gruix: 18, c: "#C8442A" }
    ]
  },

  /* V6 · Taula forense mites moderns vs proves materials */
  mites: [
    {
      k: "Identitat a la dreta de Crist",
      cat: "esoteric",
      mite: "És Maria Magdalena disfressada d'apòstol, formant una «V» de feminitat sagrada (Picknett & Prince 1997; Dan Brown 2003).",
      real: "És Sant Joan Evangelista. La tradició renaixentista el representa sistemàticament jove, imberbe i de trets suaus. La còpia de Giampietrino confirma els dotze apòstols masculins.",
      src: "Giampietrino (Royal Academy); Marani & Brambilla Barcilon (2001)."
    },
    {
      k: "La «mà sense cos» i el ganivet",
      cat: "esoteric",
      mite: "Una mà anònima o femenina sense propietari empunya una daga amenaçant cap al centre de la taula.",
      real: "Pertany al braç dret de Sant Pere, que gira l'espatlla cap a Joan mentre subjecta el ganivet (prolepsi de Getsemaní, Jn 18,10). Leonardo va dibuixar expressament aquesta torsió anatòmica abans de pintar-la.",
      src: "Leonardo, Estudi del braç de Sant Pere (Windsor, RCIN 912546); Giampietrino (c. 1515–1520)."
    },
    {
      k: "L'absència del Sant Greal",
      cat: "esoteric",
      mite: "Falta el calze de vi perquè el veritable Greal és el ventre de Maria Magdalena.",
      real: "No falta vi ni recipients: hi ha gots i garrafes individuals de vidre transparent sobre la taula, coherents amb el realisme d'un refectori del segle XV i l'escena dramàtica de la traïció.",
      src: "Restauració 1978–1999 (Brambilla Barcilon & Marani 2001); Steinberg (2001)."
    },
    {
      k: "Les tres Magdalenes? El gir real de Solsona",
      cat: "art",
      mite: "En els Sant Sopars catalans i italians mai no hi havia dones amb nimbe, excepte si s'amagaven en secret.",
      real: "Irònicament, on SÍ que apareix explícitament Maria Magdalena amb nimbe és a la taula de Solsona (MDCS 16, Pere Teixidor / trad. Jaume Ferrer I, 1435–1445) — estudiada per Monzón & Bernad (2021) com una possible Unció a Betània.",
      src: "Museu Diocesà i Comarcal de Solsona (MDCS 16); Monzón Pertejo & Bernad López (De Medio Aevo, 2021)."
    },
    {
      k: "Pràctiques de tir napoleòniques (1796)",
      cat: "historic",
      mite: "Les tropes franceses van usar sistemàticament els caps dels apòstols com a diana per disparar amb fusells.",
      real: "És un mite propagandístic del segle XIX (p. ex. Eustace 1813). Sí que està documentat l'ús del refectori com a magatzem i quadra (1796), pedrades aïllades i la inundació de 1800, però no hi ha impactes de bala.",
      src: "Bossi (1810); King (2012); documentació de conservació del Cenacolo Vinciano."
    },
    {
      k: "Els nusos de les estovalles",
      cat: "esoteric",
      mite: "Són «nusos d'Isis» o una firma secreta d'una societat oculta.",
      real: "És un recurs domèstic documentat a les taules llargues de cavallets del segle XV per recollir els extrems del lli de Perusa (tovaglie perugine) i evitar que freguessin el terra (amb un possible joc visual menor amb vincolo/Vinci).",
      src: "Brambilla Barcilon & Marani (2001); inventaris tèxtils renaixentistes italians."
    }
  ]
,
  cataleg: [
  {
    "id": 1,
    "any": 520,
    "anyTxt": "c. 500–526",
    "artista": "Taller bizantí/ostrogot",
    "obra": "Sant'Apollinare Nuovo",
    "lloc": "Ravenna",
    "taula": "sigma",
    "postura": "reclinats",
    "judes": "integrat",
    "menu": "peix",
    "moment": "Traïció (anunci)",
    "detall": "Taula semicircular sigma (stibadium), comensals reclinats sobre el colze esquerre, dos peixos grossos i pans rodons; Judes integrat al semicercle."
  },
  {
    "id": 2,
    "any": 550,
    "anyTxt": "s. VI",
    "artista": "Taller bizantí oriental",
    "obra": "Evangeliari de Rossano (f. 3r)",
    "lloc": "Rossano (Calàbria)",
    "taula": "sigma",
    "postura": "reclinats",
    "judes": "integrat",
    "menu": "pavi_bol",
    "moment": "Bocí / mà al plat",
    "detall": "Codex Purpureus Rossanensis (f. 3r): postura reclinada en sigma al costat del rentament de peus; Judes allarga la mà cap al gran bol central."
  },
  {
    "id": 3,
    "any": 1080,
    "anyTxt": "c. 1072–1087",
    "artista": "Taller italobizantí",
    "obra": "Abadia de Sant'Angelo in Formis",
    "lloc": "Càpua",
    "taula": "sigma",
    "postura": "reclinats",
    "judes": "integrat",
    "menu": "peix_anyell",
    "moment": "Bocí / traïció",
    "detall": "Transició bizantina-llatina: taula en ferradura semicircular amb els deixebles semireclinats sobre coixins i Judes allargant el braç."
  },
  {
    "id": 4,
    "any": 1248,
    "anyTxt": "1242–1255",
    "artista": "Tallers de la Seu d'Urgell",
    "obra": "Catedral de la Seu d'Urgell (MEV 9031)",
    "lloc": "Museu Episcopal de Vic",
    "taula": "recta",
    "postura": "asseguts",
    "judes": "aillat",
    "menu": "peix",
    "moment": "Bocí",
    "detall": "Mural català de la capella de Santa Caterina (180 × 457 cm): taula recta, Judes aïllat al davant de perfil rebent el bocí de Crist mentre Joan dorm."
  },
  {
    "id": 5,
    "any": 1305,
    "anyTxt": "c. 1303–1305",
    "artista": "Giotto di Bondone",
    "obra": "Capella dels Scrovegni",
    "lloc": "Pàdua",
    "taula": "recta",
    "postura": "asseguts",
    "judes": "al_davant",
    "menu": "pa_vi",
    "moment": "Mà al plat",
    "detall": "Caixa espacial en perspectiva primerenca: quatre apòstols i Judes (túnica groga) asseguts al costat frontal d'esquena parcial."
  },
  {
    "id": 6,
    "any": 1310,
    "anyTxt": "1308–1311",
    "artista": "Duccio di Buoninsegna",
    "obra": "Maestà (revers)",
    "lloc": "Siena",
    "taula": "recta",
    "postura": "asseguts",
    "judes": "al_davant",
    "menu": "garri_anyell",
    "moment": "Bocí / traïció",
    "detall": "Revers de la Maestà: al plat central hi ha una bèstia rostida identificada sovint com a garrí (porcell rostit, lectura divergent respecte a l'anyell pasqual); Judes sense aurèola al davant."
  },
  {
    "id": 7,
    "any": 1320,
    "anyTxt": "c. 1320",
    "artista": "Pietro Lorenzetti",
    "obra": "Basílica Inferior de Sant Francesc",
    "lloc": "Assís",
    "taula": "hexagonal",
    "postura": "asseguts",
    "judes": "al_davant",
    "menu": "anyell",
    "moment": "Traïció / bocí",
    "detall": "Pavelló hexagonal amb cuina annexa a l'esquerra (criats rentant plats, gos i gat). Anyell a taula; Judes sense aurèola."
  },
  {
    "id": 8,
    "any": 1352,
    "anyTxt": "c. 1345–1360",
    "artista": "Taddeo Gaddi",
    "obra": "Refectori de Santa Croce",
    "lloc": "Florència",
    "taula": "recta",
    "postura": "asseguts",
    "judes": "aillat",
    "menu": "pa_vi",
    "moment": "Traïció / bocí",
    "detall": "Prototip de mural de refectori sota l'Arbre de la Vida: llarga taula recta i Judes aïllat sol en un tamboret al costat proper."
  },
  {
    "id": 9,
    "any": 1440,
    "anyTxt": "1435–1445",
    "artista": "Pere Teixidor (trad. Jaume Ferrer I)",
    "obra": "Taula de Solsona (MDCS 16)",
    "lloc": "Museu Diocesà de Solsona",
    "taula": "recta",
    "postura": "asseguts",
    "judes": "aillat",
    "menu": "peix_anyell",
    "moment": "Eucaristia / Unció?",
    "detall": "115 × 327 cm: ceràmica de Manises «Ave Maria», animals sota taula i Maria Magdalena amb nimbe al costat de Crist (Monzón & Bernad 2021 hi veuen la Unció a Betània)."
  },
  {
    "id": 10,
    "any": 1447,
    "anyTxt": "1447",
    "artista": "Andrea del Castagno",
    "obra": "Cenacolo di Sant'Apollonia",
    "lloc": "Florència",
    "taula": "recta",
    "postura": "asseguts",
    "judes": "aillat",
    "menu": "pa_vi",
    "moment": "Traïció (anunci)",
    "detall": "Cambra il·lusionista de marbres policroms: Judes aïllat en un tamboret davant Crist com un perfil fosc."
  },
  {
    "id": 11,
    "any": 1466,
    "anyTxt": "1464–1468",
    "artista": "Dieric Bouts",
    "obra": "Retaule del Sant Sagrament",
    "lloc": "Lovaina",
    "taula": "quadrada",
    "postura": "asseguts",
    "judes": "al_davant",
    "menu": "hostia_anyell",
    "moment": "Eucaristia (sacerdot)",
    "detall": "Primer gran sopar flamenc en perspectiva central: Crist consagra una hòstia sobre el calze, amb servents i plaça de Lovaina."
  },
  {
    "id": 12,
    "any": 1469,
    "anyTxt": "c. 1463–1475",
    "artista": "Jaume Huguet",
    "obra": "Predel·la de Sant Agustí (MNAC 040412)",
    "lloc": "MNAC, Barcelona",
    "taula": "quadrada",
    "postura": "asseguts",
    "judes": "al_davant",
    "menu": "pa_vi",
    "moment": "Eucaristia",
    "detall": "170 × 161 cm: quatre apòstols en bancs al davant d'esquena a l'espectador; Judes no està sol sinó marcat per l'absència d'aurèola."
  },
  {
    "id": 13,
    "any": 1480,
    "anyTxt": "1480",
    "artista": "Domenico Ghirlandaio",
    "obra": "Cenacolo di Ognissanti",
    "lloc": "Florència",
    "taula": "u",
    "postura": "asseguts",
    "judes": "aillat",
    "menu": "pa_vi",
    "moment": "Traïció (anunci)",
    "detall": "Taula en forma de U oberta a un jardí de xiprers, tarongers i un paó; cireres a taula i Judes sol al davant."
  },
  {
    "id": 14,
    "any": 1482,
    "anyTxt": "1481–1482",
    "artista": "Cosimo Rosselli",
    "obra": "Capella Sixtina",
    "lloc": "Ciutat del Vaticà",
    "taula": "sigma",
    "postura": "asseguts",
    "judes": "aillat",
    "menu": "pa_vi",
    "moment": "Traïció / Passió",
    "detall": "Taula poligonal semicircular amb Judes d'esquena i un dimoni a l'espatlla, mentre gat i gos es barallen al terra."
  },
  {
    "id": 15,
    "any": 1486,
    "anyTxt": "c. 1486",
    "artista": "Domenico Ghirlandaio",
    "obra": "Cenacolo di San Marco",
    "lloc": "Florència",
    "taula": "u",
    "postura": "asseguts",
    "judes": "aillat",
    "menu": "pa_vi",
    "moment": "Traïció (anunci)",
    "detall": "Taula en U en refectori dominicà amb un gat assegut just darrere Judes al costat frontal."
  },
  {
    "id": 16,
    "any": 1495,
    "anyTxt": "c. 1493–1496",
    "artista": "Pietro Perugino",
    "obra": "Cenacolo di Fuligno",
    "lloc": "Florència",
    "taula": "u",
    "postura": "asseguts",
    "judes": "aillat",
    "menu": "pa_vi",
    "moment": "Traïció / bocí",
    "detall": "Simetria absoluta en U: Judes sol al davant girant el rostre cap a l'espectador amb la bossa de monedes."
  },
  {
    "id": 17,
    "any": 1498,
    "anyTxt": "c. 1495–1498",
    "artista": "Leonardo da Vinci",
    "obra": "Il Cenacolo (Santa Maria delle Grazie)",
    "lloc": "Milà",
    "taula": "recta",
    "postura": "fris",
    "judes": "integrat",
    "menu": "pa_vi",
    "moment": "Traïció + Eucaristia",
    "detall": "Ruptura total: els 13 al mateix costat sense aurèoles; Judes integrat dins la 2a tríada però en penombra i amb saler bolcat."
  },
  {
    "id": 18,
    "any": 1523,
    "anyTxt": "c. 1519–1527",
    "artista": "Andrea del Sarto",
    "obra": "Cenacolo di San Salvi",
    "lloc": "Florència",
    "taula": "recta",
    "postura": "asseguts",
    "judes": "integrat",
    "menu": "pa_vi",
    "moment": "Bocí / traïció",
    "detall": "Segueix la revolució de Leonardo: asseu Judes al mateix costat, just a la dreta de Crist, mentre servents miren des del balcó."
  },
  {
    "id": 19,
    "any": 1573,
    "anyTxt": "1573",
    "artista": "Paolo Veronese",
    "obra": "El banquet a casa de Leví",
    "lloc": "Gallerie dell'Accademia, Venècia",
    "taula": "recta",
    "postura": "asseguts",
    "judes": "integrat",
    "menu": "banquet",
    "moment": "Banquet censurat",
    "detall": "560 × 1309 cm: concebut com a Últim Sopar per a SS. Giovanni e Paolo amb nans i soldats alemanys, i també gossos; rebatejat per ordre de la Inquisició (18-07-1573)."
  },
  {
    "id": 20,
    "any": 1593,
    "anyTxt": "1592–1594",
    "artista": "Jacopo Tintoretto",
    "obra": "San Giorgio Maggiore",
    "lloc": "Venècia",
    "taula": "diagonal",
    "postura": "moviment",
    "judes": "aillat",
    "menu": "pavi_hostia",
    "moment": "Eucaristia (Contrareforma)",
    "detall": "Taula en diagonal dramàtica cap a l'altar major; àngels de fum i llàntia sobrenatural; Crist dret donant l'Eucaristia."
  }
],
  conservacio: [
  {
    "any": 1495,
    "anyTxt": "1495",
    "tipus": "creacio",
    "t": "Inici del mural + Montorfano (paret sud)",
    "d": "Montorfano signa el seu fresc a la paret sud (1495); Leonardo inicia Il Cenacolo a la paret nord amb tremp i oli a secco."
  },
  {
    "any": 1498,
    "anyTxt": "feb. 1498",
    "tipus": "creacio",
    "t": "Obra acabada (testimoni de Pacioli)",
    "d": "Luca Pacioli elogia Il Cenacolo ja acabat al tractat De divina proportione (referint-se al duel científic del 9 de febrer de 1498)."
  },
  {
    "any": 1517,
    "anyTxt": "des. 1517",
    "tipus": "deteriorament",
    "t": "Primer col·lapse documentat (De Beatis)",
    "d": "Antonio de Beatis visita Milà a finals de desembre de 1517 (en el retorn cap a Ferrara del gener de 1518) i anota al seu Itinerario que l'obra excel·lentíssima «incomincia ad guastarse»."
  },
  {
    "any": 1566,
    "anyTxt": "maig 1566",
    "tipus": "deteriorament",
    "t": "Giorgio Vasari: «una macchia abbagliata»",
    "d": "Vasari visita Milà el maig de 1566 i escriu a Le Vite (1568) que ja no s'hi distingeix res més que una taca confusa."
  },
  {
    "any": 1652,
    "anyTxt": "1652",
    "tipus": "ferida",
    "t": "Obertura de la porta cap a la cuina",
    "d": "Els frares amplien una porta al centre inferior de la paret nord i destrueixen per sempre els peus de Crist."
  },
  {
    "any": 1726,
    "anyTxt": "1726",
    "tipus": "repintada",
    "t": "Repintada de Michelangelo Bellotti",
    "d": "Primera restauració invasiva documentada: repinta les llacunes a l'oli i aplica vernissos que enfosqueixen la superfície."
  },
  {
    "any": 1770,
    "anyTxt": "1770",
    "tipus": "repintada",
    "t": "Raspada i repintada de Giuseppe Mazza",
    "d": "Mazza raspa l'obra i repinta pràcticament tots els rostres d'esquerra a dreta excepte tres (Mateu, Tadeu i Simó) abans de ser aturat."
  },
  {
    "any": 1796,
    "anyTxt": "1796–1800",
    "tipus": "ferida",
    "t": "Quarter napoleònic i inundació de 1800",
    "d": "Les tropes franceses usen el refectori com a magatzem i quadra (sense proves de pràctiques de tir); el 1800 una inundació hi deixa aigua estancada."
  },
  {
    "any": 1821,
    "anyTxt": "1821",
    "tipus": "ferida",
    "t": "Intent fallit d'arrencada (Stefano Barezzi)",
    "d": "Creient que era buon fresco, Barezzi intenta arrencar-lo (strappo) prop de Crist; el guix s'esmicola i enganxa els fragments amb cola."
  },
  {
    "any": 1905,
    "anyTxt": "1903–1908",
    "tipus": "rescat",
    "t": "Consolidació de Luigi Cavenaghi",
    "d": "Després dels estudis de 1901, Cavenaghi emprèn la primera consolidació científica moderna (seguida per Oreste Silvestri el 1924)."
  },
  {
    "any": 1943,
    "anyTxt": "15–16 ag. 1943",
    "tipus": "ferida",
    "t": "Bombardeig aliat de la RAF",
    "d": "Una bomba enfonsa el sostre i la paret est; les parets nord i sud se salven gràcies als sacs de sorra i bastides preventives de Gino Chierici."
  },
  {
    "any": 1950,
    "anyTxt": "1947–1954",
    "tipus": "rescat",
    "t": "Rescat de Mauro Pellicioli",
    "d": "Amb suport de Fernanda Wittgens i Pellicioli (des del 1946–1947), es fixen les escames i es netegen les repintades més grolleres."
  },
  {
    "any": 1999,
    "anyTxt": "1978–1999",
    "tipus": "rescat",
    "t": "Restauració de Pinin Brambilla Barcilon",
    "d": "21 anys de neteja microscòpica (estudis 1977, reobertura 28 de maig de 1999): retira segles de repintades i revela els detalls originals supervivents."
  }
]
};
