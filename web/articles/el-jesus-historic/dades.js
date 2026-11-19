/* «Qui era realment Jesús?»: dades verificades (fonts completes a research/el-jesus-historic/fonts.md) */
window.JH = {
  // 1. Onomàstica jueva de Palestina (330 aC – 200 dC): Tal Ilan (2002) / Bauckham (2006, 2017, Taules 6 i 7)
  // Percentatges calculats sobre denominadors exactes per sexe (2.625 homes; 328 dones; cf. van de Weghe, NTS 2023).
  noms: {
    homes: {
      total: 2625,
      distints: 447,
      items: [
        {r:1, nom:"Simó", orig:"Shimon", n:243, cercle:true, det:"El nom més comú del país (9,3 %): el porten el seu germà Simó, Simó Pere i Simó el Zelota."},
        {r:2, nom:"Josep", orig:"Yosef", n:218, cercle:true, det:"Segon nom més freqüent (8,3 %): el seu pare Josep i un dels seus germans."},
        {r:3, nom:"Llàtzer", orig:"El'azar", n:166, cercle:true, det:"Tercer (6,3 %): forma grega d'Eleazar, nom d'un dels fills de Mataties Macabeu."},
        {r:4, nom:"Judes", orig:"Yehudah", n:164, cercle:true, det:"Quart (6,2 %): el porten un germà de Jesús i dos apòstols (entre ells Iscariot)."},
        {r:5, nom:"Joan", orig:"Yohanan", n:122, cercle:true, det:"Cinquè (4,6 %): Joan Baptista i l'apòstol Joan."},
        {r:6, nom:"Jesús", orig:"Yešūaʿ", n:99, cercle:true, star:true, det:"Sisè nom masculí més corrent (3,8 %, ~1 de cada 26 homes): per això calia dir «Jesús de Natzaret»."},
        {r:7, nom:"Ananies", orig:"Hananyah", n:82, cercle:false, det:"Setè (3,1 %): molt habitual entre sacerdots i famílies de Jerusalem."},
        {r:8, nom:"Jonatan", orig:"Yehonatan", n:71, cercle:false, det:"Vuitè (2,7 %): popular per la memòria patriòtica de la dinastia asmonea."},
        {r:9, nom:"Mateu", orig:"Mattityahu", n:62, cercle:true, det:"Novè (2,4 %): l'apòstol Mateu i Maties, nom del patriarca dels Macabeus."},
        {r:10, nom:"Manaen", orig:"Menahem", n:42, cercle:false, det:"Desè (1,6 %): present en inscripcions d'ossaris i en Flavi Josep."},
        {r:11, nom:"Jaume", orig:"Ya'akov", n:40, cercle:true, det:"Onzè (1,5 %): el seu germà Jaume —líder a Jerusalem— i dos apòstols."}
      ]
    },
    dones: {
      total: 328,
      distints: 74,
      items: [
        {r:1, nom:"Maria", orig:"Mariam", n:70, cercle:true, star:true, det:"Més d'1 de cada 5 dones jueves registrades (21,3 %): la seva mare, Maria Magdalena i altres Maries."},
        {r:2, nom:"Salomé", orig:"Shalom", n:58, cercle:true, det:"Segona (17,7 %): una de les seguidores presents al peu de la creu (Mc 15,40)."},
        {r:3, nom:"Xelamzion", orig:"Shelamzion", n:24, cercle:false, det:"Tercera (7,3 %): forma llarga de Salomé, nom de la reina asmonea Salomé Alexandra."},
        {r:4, nom:"Marta", orig:"Marta", n:20, cercle:true, det:"Quarta (6,1 %): Marta de Betània (Lluc 10; Joan 11), molt comuna en ossaris."},
        {r:5, nom:"Joana", orig:"Yohannah", n:12, cercle:true, det:"Cinquena empatada (3,7 %): una de les dones que sostenien econòmicament el grup (Lc 8,3)."},
        {r:6, nom:"Safira", orig:"Shifrah", n:12, cercle:false, det:"Cinquena empatada (3,7 %): testimoniada en ossaris de Judea i a Fets dels Apòstols."},
        {r:7, nom:"Berenice", orig:"Berenike", n:8, cercle:false, det:"Setena (2,4 %): nom grec estès per la dinastia herodiana."},
        {r:8, nom:"Imma", orig:"Imma", n:7, cercle:false, det:"Vuitena empatada (2,1 %): documentada en Flavi Josep i fonts rabíniques."},
        {r:9, nom:"Mara", orig:"Mara", n:7, cercle:false, det:"Vuitena empatada (2,1 %): variant aramea present en ossaris i en Flavi Josep."}
      ]
    }
  },

  // 2. Demografia del segle I (estimacions arqueològiques verificades amb rangs honestos)
  ciutats: [
    {id:"natzaret", nom:"Natzaret", sub:"El poble de Jesús", v:350, lo:200, hi:1000, g:"galilea", font:"Reed (2000: 200–400), Strange (200–480), Dark (2020: 400–1.000)", det:"Poblet agrícola i de pedrera sense muralles ni paviment, a 6 km de Sèforis. Ni tan sols surt a l'Antic Testament."},
    {id:"cafarnaum", nom:"Cafarnaüm", sub:"Base al llac", v:1250, lo:1000, hi:1500, g:"galilea", font:"Reed (2000)", det:"Poble de pescadors i duana a la riba nord del llac de Galilea, centre de l'activitat pública de Jesús."},
    {id:"tiberiades", nom:"Tiberíades", sub:"Capital nova", v:9000, lo:6000, hi:12000, g:"galilea", font:"Reed (2000)", det:"Ciutat hel·lenitzada fundada per Herodes Antipes cap al 19 dC. Els evangelis mai no hi situen Jesús."},
    {id:"seforis", nom:"Sèforis", sub:"A 1 hora a peu", v:10000, lo:8000, hi:12000, g:"galilea", font:"Reed (2000)", det:"Gran capital galilea en reconstrucció durant la joventut de Jesús; tampoc no apareix mai citada als evangelis."},
    {id:"jerusalem", nom:"Jerusalem (habitual)", sub:"Ciutat del Temple", v:50000, lo:20000, hi:80000, g:"judea", font:"Geva (2014: ≤20k), Jeremias (25–30k), Levine (60–70k), Broshi (~80k)", det:"Cor religiós del judaisme. La població permanent és objecte de debat viu entre minimalistes i maximalistes."},
    {id:"pasqua", nom:"Jerusalem per Pasqua", sub:"Marea de pelegrins", v:300000, lo:100000, hi:400000, g:"judea", font:"Jeremias (100k+), Sanders (1992: 300–400k)", det:"Durant la Pasqua, la ciutat multiplicava la població i el prefecte romà hi desplegava tropes per evitar revoltes."},
    {id:"roma", nom:"Roma imperial", sub:"Centre de l'Imperi", v:900000, lo:450000, hi:1000000, g:"imperi", font:"Scheidel/Morley (800k–1M), Storey (1997: 450–500k)", det:"La metròpoli de l'Imperi romà: milers de vegades més gran que el llogaret galileu on va créixer Jesús."}
  ],

  // 3. Bioarqueologia: alçades puntuals publicades d'esquelets de Judea del segle I (cm)
  // Sense barres d'error inventades: només valors publicats i la franja verificada de mitjanes masculines (165–169 cm).
  estatura: [
    {id:"dones", nom:"Dones adultes de Judea (mitjana)", v:147, cat:"ref", tipus:"Mitjana poblacional", font:"Nagar & Torge (2003, IEJ 53 · IAA)", det:"Mitjana d'esquelets de dones jueves dels períodes hel·lenístic i romà primerenc a la base de l'Autoritat d'Antiguitats d'Israel."},
    {id:"homes", nom:"Homes adults de Judea (mitjana IAA)", v:166, cat:"prota", tipus:"Mitjana poblacional", font:"Nagar & Torge (2003, IEJ 53); Taylor (2018)", det:"Alçada típica d'un home jueu del segle I segons la síntesi osteològica de l'Autoritat d'Antiguitats d'Israel."},
    {id:"yehohanan", nom:"Yehohanan (crucificat a Jerusalem)", v:167, cat:"prota", tipus:"Esquelet individual", font:"Haas (1970, IEJ 20); Zias & Sekeles (1985, IEJ 35)", det:"L'únic esquelet jueu del segle I amb un clau romà de crucifixió (11,5 cm) encara travessant el taló."},
    {id:"jerico", nom:"Homes de la necròpolis de Jericó", v:169, cat:"prota", tipus:"Mitjana poblacional", font:"Hachlili (1979); Hachlili & Smith (1979, BASOR 235)", det:"Mitjana masculina en tombes monumentals jueves del segle I a Jericó."},
    {id:"goliat", nom:"Yeho'ezer «Goliat» (excepció a Jericó)", v:188.5, cat:"extrem", tipus:"Esquelet individual", font:"Hachlili & Smith (1979, BASOR 235, Ossari XXI)", det:"Feia 1,885 m: tan excepcionalment alt per a la Judea del segle I que la seva família portava inscrit el sobrenom «Goliat»."}
  ],

  // 4. Catàleg verificat de 24 fites iconogràfiques (200 dC – 2001)
  iconografia: [
    {id:"alexamenos", any:200, data:"c. 200", nom:"Grafit d'Alexàmenos", lloc:"Roma", lat:41.89, lon:12.49, ox:-8, oy:-7, tipus:"altre", fase:0, font:"Museu Palatí, Inv. 381403", det:"Sàtira romana amb cap d'ase: la primera representació coneguda de la crucifixió de Jesús."},
    {id:"dura", any:240, data:"c. 240–256", nom:"Dura-Europos (Paralític)", lloc:"Dura-Europos, Síria", lat:34.75, lon:40.73, tipus:"imberbe", fase:0, font:"Yale Univ. Art Gallery, 34498", det:"La pintura narrativa més antiga conservada de Jesús: jove, sense barba, cabell curt i túnica grecoromana."},
    {id:"priscila", any:260, data:"c. 230–300", nom:"Bon Pastor (Catacumbes)", lloc:"Roma", lat:41.93, lon:12.51, ox:-6, oy:6, tipus:"imberbe", fase:0, font:"Catacumbes de Priscil·la i Cal·lixt", det:"Jove imberbe amb una ovella sobre les espatlles, inspirat en el model clàssic d'Hermes i Orfeu."},
    {id:"hinton", any:330, data:"c. 300–350", nom:"Mosaic de Hinton St Mary", lloc:"Dorset, Britània", lat:50.95, lon:-2.30, tipus:"imberbe", fase:0, font:"British Museum, 1965,0409.1", det:"Bust d'un jove romà imberbe de cabell curt amb el monograma Chi-Rho darrere el cap."},
    {id:"junibas", any:359, data:"359", nom:"Sarcòfag de Juni Bas", lloc:"Roma", lat:41.90, lon:12.45, ox:0, oy:10, tipus:"imberbe", fase:0, font:"Tresor de Sant Pere, Vaticà", det:"Jesús entronitzat sobre el cel: encara imberbe i juvenil, com Apol·lo o un filòsof."},
    {id:"commodilla", any:385, data:"c. 375–400", nom:"Catacumba de Commodil·la", lloc:"Roma", lat:41.86, lon:12.48, ox:8, oy:6, tipus:"barbut", fase:1, font:"Catacumba de Commodil·la", det:"Un dels primers busts amb barba plena i cabell llarg fosc, evocant Zeus i els filòsofs."},
    {id:"pudenziana", any:410, data:"c. 401–417", nom:"Absis de Santa Pudenziana", lloc:"Roma", lat:41.90, lon:12.50, ox:8, oy:-6, tipus:"barbut", fase:1, font:"Santa Pudenziana, Roma", det:"Crist Emperador vestit d'or i porpra, amb barba llarga i tron imperial."},
    {id:"ravenna", any:515, data:"c. 500–526", nom:"Sant'Apollinare Nuovo", lloc:"Ravenna, Itàlia", lat:44.42, lon:12.20, tipus:"barbut", dual:true, fase:1, font:"Sant'Apollinare Nuovo, Ravenna", det:"Dins la mateixa basílica conviuen tots dos models: jove imberbe als miracles (nord) i barbut a la Passió (sud)."},
    {id:"sinai", any:550, data:"c. 550", nom:"Pantocràtor del Sinaí", lloc:"Sinaí / Constantinoble", lat:28.56, lon:33.98, tipus:"barbut", fase:1, font:"Monestir de Santa Caterina, Sinaí", det:"Icona encàustica que fixa el model bizantí: barba, cabell llarg fosc i mirada frontal solemne."},
    {id:"justinia", any:692, data:"692–711", nom:"Solidus de Justinià II", lloc:"Constantinoble", lat:41.01, lon:28.98, tipus:"barbut", fase:1, font:"Dumbarton Oaks / British Museum", det:"Primera moneda amb Crist: barbut de cabell llarg (692–695) i després amb rínxols curts i barba curta (705–711)."},
    {id:"dunhuang", any:850, data:"s. IX (Tang)", nom:"Seda de Dunhuang", lloc:"Dunhuang, Xina", lat:40.04, lon:94.80, tipus:"global", fase:2, font:"British Museum, 1919,0101,0.48", det:"Figura cristiana vestida de bodhisattva amb tres creus nestorianes (identificació debatuda entre Jesús i un sant)."},
    {id:"taull", any:1123, data:"c. 1123", nom:"Sant Climent de Taüll", lloc:"Taüll, Catalunya", lat:42.52, lon:0.85, tipus:"barbut", fase:2, font:"MNAC Barcelona, 015966-000", det:"El gran Pantocràtor romànic català: herència directa del cànon bizantí amb barba partida."},
    {id:"zirganela", any:1400, data:"1400–1401", nom:"Evangelis de Zir Ganela", lloc:"Etiòpia", lat:11.33, lon:39.72, tipus:"global", fase:2, font:"Morgan Library, MS M.828", det:"Miniatura etíop solomònica: Jesús adoptat plenament als trets i ulls ametllats locals."},
    {id:"vaneyck", any:1438, data:"1432–1440", nom:"Van Eyck (Gant / Vera Icon)", lloc:"Gant / Bruges", lat:51.05, lon:3.73, tipus:"barbut", fase:2, font:"Sant Bavó / Groeningemuseum", det:"Realisme flamenc fidel a la Carta de Lèntul (falsificació medieval): cabells castanys partits i barba partida."},
    {id:"leonardo", any:1497, data:"1495–1498", nom:"El Sant Sopar (Leonardo)", lloc:"Milà, Itàlia", lat:45.47, lon:9.17, tipus:"barbut", fase:3, font:"Santa Maria delle Grazie", det:"Humanisme renaixentista italià: pell clara, cabells castany rogenc i bellesa clàssica europea."},
    {id:"durer", any:1500, data:"1500", nom:"Autoretrat de Dürer", lloc:"Nuremberg, Alemanya", lat:49.45, lon:11.08, tipus:"barbut", fase:3, font:"Alte Pinakothek, Munic", det:"Dürer s'autoretrata frontalment com a Salvator Mundi: el Jesús de pell pàl·lida del nord d'Europa."},
    {id:"esquipulas", any:1595, data:"1595", nom:"Cristo Negro de Esquipulas", lloc:"Esquipulas, Guatemala", lat:14.57, lon:-89.35, tipus:"global", fase:3, font:"Basílica de Esquipulas", det:"Talla de cedre enfosquida pel fum d'espelmes i resines, integrada en la cosmovisió maia-chortí."},
    {id:"rembrandt", any:1650, data:"c. 1648–1656", nom:"Cap de Crist (Rembrandt)", lloc:"Amsterdam", lat:52.37, lon:4.90, tipus:"global", fase:3, font:"Gemäldegalerie Berlin, 811C", det:"Excepció extraordinària: pintat del natural («nae't leven»); els historiadors de l'art el vinculen a un jove jueu del seu barri d'Amsterdam."},
    {id:"hofmann", any:1889, data:"1889–1890", nom:"Crist (Heinrich Hofmann)", lloc:"Dresden, Alemanya", lat:51.05, lon:13.74, tipus:"barbut", fase:4, font:"Riverside Church, Nova York", det:"Model romàntic alemany de rostre dolç, pell molt clara i cabell castany clar, antecedent de Sallman."},
    {id:"eisenach", any:1939, data:"1939–1940", nom:"Institut «desjudaïtzador»", lloc:"Eisenach, Alemanya", lat:50.98, lon:10.32, ox:-6, oy:4, tipus:"barbut", fase:4, font:"Heschel (2008, Princeton UP)", det:"Teòlegs nazis liderats per Walter Grundmann reescriuen el Nou Testament (Die Botschaft Gottes) per fabricar un «Jesús ari»."},
    {id:"sallman", any:1940, data:"1940", nom:"Head of Christ (W. Sallman)", lloc:"Chicago, EUA", lat:41.88, lon:-87.63, tipus:"barbut", star:true, fase:4, font:"Anderson Univ. / Morgan (1996)", det:"Més de 500 milions de còpies: l'home blanc d'ulls clars i cabell ondulat que fixa l'estàndard occidental modern."},
    {id:"kim", any:1953, data:"1952–1953", nom:"Jesús en hanbok (Kim Ki-chang)", lloc:"Corea del Sud", lat:37.57, lon:126.98, tipus:"global", fase:5, font:"Unbo Museum / MMCA Corea", det:"Durant la guerra de Corea, Kim pinta la vida de Jesús vestit amb roba tradicional Joseon."},
    {id:"powell", any:1977, data:"1977", nom:"Jesus of Nazareth (R. Powell)", lloc:"Londres / Roma", lat:51.51, lon:-0.13, tipus:"barbut", fase:5, font:"ITC / RAI (F. Zeffirelli)", det:"Ulls blaus perfilats i mirada sense parpellejar: consolida el cànon Sallman a la televisió mundial."},
    {id:"neave", any:2001, data:"2001", nom:"Reconstrucció forense (R. Neave)", lloc:"Judea / Manchester", lat:32.70, lon:35.30, tipus:"global", fase:5, font:"BBC (2001) / crítica Taylor (2018)", det:"Tipus mitjà d'un home jueu del segle I basat en cranis antics (no un retrat personal): cabell curt, pell bruna, barba curta."}
  ],

  // 5. Dades empíriques modernes: YouGov UK (2021) & EUA (2020) + PLOS ONE (2018)
  yougov: {
    // Regne Unit (n = 1.714 adults + 1.023 minories ètniques, desembre 2021) i EUA (n = 1.067 adults, desembre 2020)
    veuVsAccepta: [
      {k:"blanc", nom:"Blanc / europeu", veuUK:58, accUK:63, accUS:60, joveUK:51, bameUK:40},
      {k:"om", nom:"Orient Mitjà", veuUK:22, accUK:68, accUS:65, joveUK:null, bameUK:60},
      {k:"negre", nom:"Negre / africà", veuUK:null, accUK:44, accUS:52, joveUK:null, bameUK:null},
      {k:"sud", nom:"Sud-asiàtic", veuUK:null, accUK:40, accUS:40, joveUK:null, bameUK:null},
      {k:"est", nom:"Est-asiàtic", veuUK:null, accUK:37, accUS:38, joveUK:null, bameUK:null}
    ],
    // Jackson, Hester & Gray (PLOS ONE 2018, n = 511 cristians EUA + 1.200 avaluadors):
    // valors t verificats exactes (op "=") o cotes mínimes entre diversos trets (op ">")
    plos: [
      {nom:"Edat pròpia → Déu més gran", op:"=", t:13.96, p:"p < 0,001", grup:"ego", det:"Els participants de més edat visualitzen un rostre diví significativament més gran (t = 13,96)."},
      {nom:"Atractiu propi → Déu més atractiu", op:"=", t:12.33, p:"p < 0,001", grup:"ego", det:"Qui es considera més atractiu dibuixa mentalment un rostre més atractiu (t = 12,33)."},
      {nom:"Progressistes → més amorós / afroamericà", op:">", t:3.49, p:"p < 0,002", grup:"pol", det:"Controlant la demografia, els progressistes visualitzen un rostre més amorós i afroamericà (t > 3,49 en tots els trets reportats)."},
      {nom:"Conservadors → més masculí, ric i poderós", op:">", t:2.20, p:"p < 0,03", grup:"pol", det:"Controlant la demografia, els conservadors visualitzen un rostre més masculí, gran, poderós i ric (t > 2,20 en tots els trets reportats)."},
      {nom:"Raça pròpia (afroamericans)", op:"=", t:1.86, p:"p = 0,06", grup:"ego", det:"Efecte marginalment significatiu entre participants afroamericans (t = 1,86)."},
      {nom:"Gènere propi (homes vs. dones)", op:"=", t:0.93, p:"p = 0,36 (no sig.)", grup:"no", det:"Única excepció: tant homes com dones visualitzen igualment un rostre masculí (t = 0,93)."}
    ]
  },

  // 6. Esquema historiogràfic: «El pou de Tyrrell» (IB-55, coordenades conceptuals ben separades)
  mirall: [
    {id:"historic", nom:"El jueu galileu", sub:"Consens històric (s. I)", x:-0.72, y:0.62, r:60, c:"vermell", fase:0,
      det:"Profeta apocalíptic jueu observant (Sanders, Fredriksen, Vermes, Ehrman): arrelat a Israel i executat per Roma."},
    {id:"bizanti", nom:"Crist Emperador", sub:"Bizanci (s. IV–XII)", x:-0.05, y:0.72, r:54, c:"blau", fase:1,
      det:"Pantocràtor entronitzat vestit de porpra i or: autoritat còsmica i imperial inspirada en Zeus i els cèsars."},
    {id:"liberal", nom:"Mestre moral i «Jesús ari»", sub:"Europa (1863–1940)", x:0.68, y:0.34, r:58, c:"blau", fase:2,
      det:"Del Jesús protestant liberal que critica Tyrrell (1909) fins a la distorsió racial extrema de l'Institut d'Eisenach (1939)."},
    {id:"sallman", nom:"Executiu i icona blanca", sub:"EUA (1925–1977)", x:0.70, y:-0.32, r:58, c:"groc", fase:3,
      det:"El líder empresarial de Bruce Barton (1925), el rostre blanc de Warner Sallman (1940) i els ulls blaus de Hollywood."},
    {id:"actual", nom:"«Jesús a la carta»", sub:"Occident (segle XXI)", x:0.20, y:-0.78, r:52, c:"vermellClar", fase:4,
      det:"Guerrer nacionalista (Du Mez, 2020) o coach espiritual neoliberal (Crossley, 2012): dos miralls oposats del present."}
  ],

  // 7. Dotze contrastos verificats (Imatge occidental vs. Consens històric)
  contrastos: [
    {k:"Nom i cognom", myth:"«Jesús Crist» sembla un nom i un cognom únics.", hist:"Es deia Yešūaʿ (6è nom masculí més comú a Judea, 3,8 %). «Crist» (Christós) tradueix Messies («ungit»): era un títol.", src:"Ilan (2002); Bauckham (2017)", deg:"solid"},
    {k:"Aspecte físic", myth:"Alt (~1,80 m), pell molt clara, cabells llargs castany-ros i ulls clars.", hist:"Home jueu de l'Orient Mitjà (~1,66 m), pell marró olivàcia (encara més enfosquida pel treball a l'exterior), ulls foscos, cabells curts i barba curta.", src:"Taylor (2018); Nagar & Torge (2003); 1Co 11,14", deg:"solid"},
    {k:"Vestimenta", myth:"Túnica blanca impecable fins als turmells.", hist:"Túnica curta de llana sense tenyir (chiton), mantell (himation) amb borles rituals jueves (tzitzit) i sandàlies de cuir.", src:"Taylor (2018); Mc 6,56", deg:"solid"},
    {k:"Religió", myth:"Va trencar amb el judaisme per fundar una religió nova.", hist:"Va viure i morir com a jueu observant; debatia dins del judaisme i era sorprenentment pròxim als fariseus.", src:"Sanders (1985); Levine (2006); Fredriksen (1999)", deg:"solid"},
    {k:"Ofici i classe", myth:"Fuster de taller acomodat, amb casa i mobles de fusta.", hist:"Téktōn: artesà manual de la pedra i la fusta en un poblet rural de ~200–1.000 habitants, sense riquesa ni estatus escriba.", src:"Mc 6,3; Meier (1991); Reed (2000); Dark (2020)", deg:"solid"},
    {k:"Llengua", myth:"Sovint imaginat parlant llatí, grec culte o la nostra llengua.", hist:"Parlava arameu galileu com a llengua materna; coneixia l'hebreu litúrgic i, com a molt, un grec bàsic de mercat.", src:"Fitzmyer; Meier (1991); Casey", deg:"solid"},
    {k:"Motiu de la mort", myth:"Un afer purament religiós o espiritual fora de la política.", hist:"Crucificat per Roma (càstig de sedició) com a «Rei dels jueus», però Pilat no va arrestar els deixebles: no liderava una guerrilla.", src:"Mc 15,26; Tàcit Ann. XV,44; Fredriksen (1999)", deg:"solid"},
    {k:"Primeres imatges", myth:"Sempre se l'ha pintat amb barba llarga i cabells sobre les espatlles.", hist:"Durant els primers tres segles conservats (s. III–IV) apareix jove, imberbe i amb cabells curts. La barba s'imposa a partir del s. IV–VI.", src:"Dura-Europos (c. 240); Sant'Apollinare Nuovo; Jensen (2005)", deg:"solid"},
    {k:"Urgència del missatge", myth:"Un savi atemporal que promet pau interior i el cel després de morir.", hist:"Profeta apocalíptic que anunciava la intervenció imminent de Déu al món «abans que passi aquesta generació».", src:"Mc 9,1; Mc 13,30; Schweitzer (1906); Ehrman (1999)", deg:"majoria"},
    {k:"Família i germans", myth:"Fill únic sempre envoltat d'una família devota i convençuda.", hist:"Mc 6,3 anomena 4 germans i germanes, i Mc 3,21 diu que la família pensava que «havia perdut el seny». (Catòlics i ortodoxos llegeixen «cosins» o «germanastres».)", src:"Mc 3,21; Mc 6,3; Ga 1,19; Flavi Josep Ant. XX,200", deg:"majoria"},
    {k:"Destinataris", myth:"Predicació universalista moderna adreçada d'entrada a tots els pobles.", hist:"Entenia la seva missió adreçada a Israel («les ovelles perdudes de la casa d'Israel»); l'obertura als no jueus creix després de la seva mort.", src:"Mt 15,24; Mc 7,24–30; Sanders (1985)", deg:"majoria"},
    {k:"Sabia llegir i escriure?", myth:"Autor instruït que dominava l'escriptura.", hist:"No va deixar res escrit. En una Palestina rural amb ~1–3 % d'alfabetització (Hezser 2001), els historiadors debaten si llegia rotlles hebreus (Lc 4,16 vs. Keith 2011).", src:"Hezser (2001); Keith (2011); Meier (1991); Lc 4,16", deg:"debat"}
  ]
};
