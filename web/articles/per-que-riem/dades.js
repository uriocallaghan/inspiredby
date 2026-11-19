/* Dades verificades per a «Per què riem?»
   Fonts: Provine & Yong (1991), Provine (1993, 2016), Davila-Ross et al. (2009),
   Dezecache & Dunbar (2012), Bryant et al. (2016, 2018), Manninen et al. (2017),
   Wood et al. (2017), Winkler & Bryant (2021). */
window.RIEM_DATA={
  // Provine (1993, Ethology): 1.200 episodis naturals de rialla
  provine:{
    n:1200,
    // <20 % segueix un comentari pròpiament graciós (Provine 1993/2000)
    humorPct:18,
    // Només 8 de 1.200 casos (0,67 %) interrompen una frase a mitges; 99,3 % en pauses
    interruptN:8,
    punctPct:99.3,
    // El parlant riu un 46 % més que l'oient → proporció ~59,3 % parlant / 40,7 % oient (1.46 / 2.46)
    speakerMorePct:46,
    speakerSharePct:59,
    femaleSpeakerVsMaleAudPct:127,
    maleSpeakerVsFemaleAudPct:-7,
    socialMultiplier:30
  },
  // Davila-Ross et al. (2009, Current Biology): flux egressiu màxim i divergència filogenètica
  hominids:[
    {id:"ora", nom:"Orangutan", llat:"Pongo pygmaeus", ma:14, maxEgr:4.2, mode:"Alterna inspiració i exhalació", desc:"Vocalitzacions curtes i raspades; alternança respiratòria predominant."},
    {id:"gor", nom:"Goril·la", llat:"Gorilla gorilla", ma:9, maxEgr:13.2, mode:"Mixt (egressiu fins a 13,2 s)", desc:"Capacitat sorprenent de sostenir seqüències egressives llargues (proporció ≥ 0,66)."},
    {id:"bon", nom:"Bonobo", llat:"Pan paniscus", ma:6, maxEgr:10.5, mode:"Mixt (egressiu fins a 10,5 s)", desc:"To més agut i seqüències egressives sostingudes (proporció ≥ 0,80)."},
    {id:"xim", nom:"Ximpanzé", llat:"Pan troglodytes", ma:6, maxEgr:3.3, mode:"Panteix alternant (in/out)", desc:"So de panteix ràpid d'anada i tornada durant el joc i les pessigolles."},
    {id:"hum", nom:"Humà", llat:"Homo sapiens", ma:0, maxEgr:null, mode:"Exclusivament egressiu (ha-ha)", desc:"Ràfegues vocàliques regulars (~75 ms cada ~210 ms) en una sola exhalació."}
  ],
  // Wood, Martin & Niedenthal (2017, PLOS ONE, Taula 2): 395 rialles humanes analitzades
  wood395:{
    n:395,
    raters:762,
    female:{dur:2.71, durMed:1.46, db:71.95, f0:411.44, f0Med:394.8, voiced:0.49, hnr:8.81},
    male:{dur:2.24, durMed:1.39, db:66.92, f0:313.18, f0Med:290.76, voiced:0.47, hnr:7.48},
    // Correlacions i perfils funcionals descrits a Wood et al. (2017)
    types:[
      {id:"recompensa", nom:"Recompensa", col:"#C8442A", x:-0.72, y:0.78, r:52,
       trets:"Espontània, molt aguda, ràfegues curtes i sonores, boca ben oberta",
       funcio:"Premia i reforça el comportament d'un altre; contagiosa i difícil de fingir."},
      {id:"afiliacio", nom:"Afiliació", col:"#2C5DA8", x:0.68, y:0.42, r:56,
       trets:"Més suau, volum moderat, sovint voluntària o semicontrolada, boca tancada o entreoberta",
       funcio:"Lubrifica la conversa, indica intenció cooperativa i calma tensions sense humor."},
      {id:"dominancia", nom:"Dominància", col:"#F5C518", x:0.05, y:-0.72, r:44,
       trets:"Més greu o nasal, més forta, menor variabilitat tonal, ritme més irregular",
       funcio:"Marca jerarquia, burla o exclusió dins del grup; alimenta la gelotofòbia."}
    ]
  },
  // Bryant et al. (2016, PNAS) i Bryant et al. (2018, Psychological Science): proves transculturals reals
  crossCultural:[
    {id:"b2016", any:2016, estudi:"Bryant et al. (PNAS)", pregunta:"Amics vs. desconeguts", n:966, societats:24, min:53, mid:61, max:67,
     detall:"966 oients de 24 societats (incloent-hi hadza, tsimané i shuar) escolten 1 segon de rialla compartida d'estatunidencs. Totes les societats encerten per sobre de l'atzar (50 %)."},
    {id:"b2018", any:2018, estudi:"Bryant et al. (Psychol. Sci.)", pregunta:"Espontània vs. voluntària", n:884, societats:21, min:56, mid:62.5, max:69,
     detall:"884 oients de 21 societats distingeixen rialles espontànies de rialles voluntàries amb una precisió del 56–69 %, guiats per marques acústiques d'excitació emocional."}
  ],
  // Dezecache & Dunbar (2012) & Dunbar (1991): mida de grup i sostre de desparasitat
  grooming:{
    ceilingPct:20,
    naturalLaughGroupMin:3,
    naturalLaughGroupMax:4,
    multiplier:3,
    // Esquema quantitatiu basat en Dunbar (1991, Folia Primatol.) i Dezecache & Dunbar (2012)
    milestones:[
      {grup:15, groomPct:4.2, nom:"Macacos / grups petits"},
      {grup:40, groomPct:11.2, nom:"Papió mitjà"},
      {grup:70, groomPct:19.6, nom:"Sostre del desparasitat (~20 % del dia)"},
      {grup:150, groomPct:42.0, nom:"Xarxa humana (~150): impossible mà a mà"}
    ]
  },
  // Mapa etnogràfic dels usos socials, rituals i polítics del riure arreu del món
  ethnoSites:[
    {id:"inuit", nom:"Duels de cançons inuit", lloc:"Groenlàndia i Àrtic canadenc", lon:-44, lat:66, cat:"conflicte",
     resum:"Disputes resoltes davant la comunitat amb cançons satíriques: el riure del públic dicta sentència i evita la violència (Hoebel; Briggs).", dx:10, dy:14, anc:"start"},
    {id:"sanankuya", nom:"Sanankuya (parentiu de broma)", lloc:"Mali i Àfrica Occidental", lon:-5, lat:14, cat:"conflicte",
     resum:"Clans i pobles (com dogons i bozos) s'han de fer bromes punyents amb prohibició d'ofendre's: una institució de pau i ajuda mútua (Radcliffe-Brown, 1940).", dx:10, dy:16, anc:"start"},
    {id:"pueblo", nom:"Pallassos sagrats (Koyemshi i Heyoka)", lloc:"Sud-oest i Grans Planures (EUA)", lon:-106, lat:38, cat:"poder",
     resum:"Figures rituals que actuen al revés i es burlen de caps i tabús enmig de la cerimònia sagrada per mantenir humil l'autoritat (Douglas, 1968).", dx:-10, dy:16, anc:"end"},
    {id:"carnaval", nom:"Carnaval i Festa dels Bojos", lloc:"Europa medieval", lon:4, lat:48, cat:"poder",
     resum:"Inversió anual de jerarquies on el poble parodiava reis i bisbes, en tensió constant amb la disciplina monàstica (Bakhtin; Le Goff, 1997).", dx:10, dy:-14, anc:"start"},
    {id:"tanganyika", nom:"Brot de Kashasha (1962)", lloc:"Districte de Bukoba, Tanzània", lon:31.8, lat:-1.3, cat:"etiqueta",
     resum:"Episodi psicogènic massiu de rialla incontrolable propagat entre escoles i pobles en un context d'estrès social (Rankin & Philip, 1963).", dx:10, dy:14, anc:"start"},
    {id:"japo", nom:"Terewarai i aiso-warai", lloc:"Japó", lon:138, lat:36, cat:"etiqueta",
     resum:"Rialla de vergonya o cortesia que protegeix l'harmonia del grup i suavitza la incomoditat social sense implicar humor.", dx:-10, dy:-14, anc:"end"}
  ]
};
