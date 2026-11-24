/* «El cercle del kula» — dades dels gràfics.
   Posicions: OpenStreetMap (Nominatim, consulta del 24-11-2026), arrodonides a 0,001°; Duau és orientativa (sud de Normanby).
   Comunitats i camí: mapa V i capítols II–III de Malinowski (1922); xifres del 1918: Malinowski (1922), pp. 267–268, 386–387 i 489.
   Casos de Mauss: taula de matèries de l'«Essai sur le don» (1925); posicions orientatives.
   Cronologia: fonts citades a «Dades i fonts». */
window.KU_DATA = {
  // comunitats del kula (k: clau; n: nom; ll: lon/lat; g: grup; t: què en diuen les fonts)
  places: [
    {k:"kiriwina", n:"Kiriwina", ll:[151.106,-8.464], g:"Trobriand", t:"Omarakana, el poble de To'uluwa. A l'època de Malinowski, hi arribaven els braçalets per mar, de Kitava, i els collarets per terra, de Sinaketa."},
    {k:"sinaketa", n:"Sinaketa", ll:[151.087,-8.678], g:"Trobriand", t:"A l'època de Malinowski, feia les grans expedicions cap a Dobu."},
    {k:"vakuta", n:"Vakuta", ll:[151.172,-8.838], g:"Trobriand", t:"Feia kula per mar a banda i banda, com Kitava."},
    {k:"kitava", n:"Kitava", ll:[151.333,-8.622], g:"Marshall Bennett", t:"A l'època de Malinowski, l'illa per on passaven els braçalets que anaven cap a l'oest."},
    {k:"iwa", n:"Iwa", ll:[151.676,-8.703], g:"Marshall Bennett", t:"Iwa, Gawa i Kwayawata formen una sola comunitat de kula."},
    {k:"gawa", n:"Gawa", ll:[151.979,-8.97], g:"Marshall Bennett", t:"Iwa, Gawa i Kwayawata formen una sola comunitat de kula."},
    {k:"muyuw", n:"Muyuw", n2:"Woodlark", ll:[152.808,-9.123], g:"Muyuw", t:"D'aquí el camí baixa cap al sud, directe a Tubetube o passant per Misima."},
    {k:"nada", n:"Nada", n2:"Laughlan", ll:[153.685,-9.282], g:"Muyuw", t:"Atol petit al costat de Muyuw, dins del mateix districte."},
    {k:"misima", n:"Misima", ll:[152.734,-10.664], g:"Sud", t:"Una de les branques del camí entre Muyuw i Tubetube."},
    {k:"tubetube", n:"Tubetube", ll:[151.199,-10.589], g:"Sud", t:"Amb Wari, l'última baula del cercle. Hi fan olles de fang."},
    {k:"wari", n:"Wari", ll:[151.057,-10.96], g:"Sud", t:"Amb Tubetube, l'última baula del cercle. Hi fan olles de fang."},
    {k:"duau", n:"Duau", n2:"Normanby", ll:[151.02,-10.06], g:"Sud", t:"La costa de Normanby que tanca el cercle pel sud (posició orientativa)."},
    {k:"dobu", n:"Dobu", ll:[150.867,-9.752], g:"Dobu", t:"Una altra llengua que la de les Trobriand. D'aquí sortien flotes de desenes de canoes."},
    {k:"amphlett", n:"Amphlett", ll:[150.817,-9.211], g:"Amphlett", t:"Feien de pont entre Dobu i les Trobriand. Les dones hi feien terrissa."}
  ],
  // ordre del cercle en el sentit de les agulles del rellotge (el dels collarets)
  ring: ["kiriwina","kitava","iwa","gawa","muyuw","misima","tubetube","duau","dobu","amphlett","sinaketa"],
  spurs: [["muyuw","nada"],["tubetube","wari"],["sinaketa","vakuta"]],
  branch: ["muyuw","tubetube"],          // branca directa (Malinowski, p. 79)
  sanaroa: [150.999,-9.623],             // llacuna on els de Sinaketa bussegen la petxina vermella
  // l'onada de braçalets de l'abril del 1918 (parells)
  wave1918: [
    {k:"kiriwina", v:213, t:"To'uluwa torna de Kitava amb 213 parells de braçalets."},
    {k:"sinaketa", v:304, t:"Sinaketa n'aconsegueix 154 a Kiriwina i en reuneix 304 amb els 150 que ja tenia."},
    {k:"dobu", v:648, t:"L'expedició de Dobu, de seixanta canoes, se n'endu 648 braçalets: 304 de Sinaketa i 344 de Vakuta."}
  ],
  context: [
    {t:"Nova Guinea", ll:[150.62,-10.62]},
    {t:"Fergusson", ll:[150.62,-9.47]},
    {t:"Normanby", ll:[151.12,-9.86]},
    {t:"Mar de Salomó", ll:[152.55,-8.42]},
    {t:"Mar del Corall", ll:[152.55,-11.05]}
  ],
  // casos de l'«Essai sur le don» (taula de matèries); c: capítol; ty: "etno" (societats estudiades per etnògrafs) o "dret" (drets antics)
  mauss: [
    {n:"Samoa", ll:[-172.1,-13.8], c:"Cap. I · Polinèsia", ty:"etno", t:"Estores i béns que circulen en casaments, naixements i altres moments de la vida."},
    {n:"Maoris", ll:[175.5,-39.4], c:"Cap. I · Polinèsia", ty:"etno", t:"El hau, a partir del text de Tamati Ranapiri recollit per Elsdon Best."},
    {n:"Andaman", ll:[92.7,12.0], c:"Cap. II", ty:"etno", t:"Les regles de la generositat i l'hospitalitat."},
    {n:"Nova Caledònia", ll:[165.6,-21.3], c:"Cap. II · Melanèsia", ty:"etno", t:"En un discurs de la festa del pilou: «és la cosa mateixa que torna»."},
    {n:"Trobriand", ll:[151.1,-8.6], c:"Cap. II · Melanèsia", ty:"etno", t:"El kula, «una mena de gran potlatch»."},
    {n:"Fiji", ll:[178.0,-17.8], c:"Cap. II · Melanèsia", ty:"etno", t:"Les tambua, dents de balena: oferir-les és demanar, acceptar-les és comprometre's."},
    {n:"Costa nord-oest", n2:"tlingit, haida, kwakwaka'wakw", ll:[-129.5,53.5], c:"Cap. II · Amèrica", ty:"etno", t:"El potlatch: donar, i fins i tot destruir, riquesa davant de testimonis."},
    {n:"Dret romà", ll:[12.5,41.9], c:"Cap. III · Drets antics", ty:"dret", t:"El nexum: la cosa lliurada lliga qui la rep amb qui l'ha donada."},
    {n:"Dret hindú", ll:[78.0,22.0], c:"Cap. III · Drets antics", ty:"dret", t:"Un llibre del Mahabharata, «una enorme epopeia del do», dedica més de quaranta lliçons al regal."},
    {n:"Dret germànic", ll:[10.0,52.0], c:"Cap. III · Drets antics", ty:"dret", t:"El wadium, una penyora sense valor que lliga les dues parts d'un contracte."},
    {n:"Dret celta", ll:[-8.0,53.2], c:"Cap. III · Drets antics", ty:"dret", t:"Mauss hi veu les mateixes institucions, però només ho deixa esbossat."},
    {n:"Dret xinès", ll:[108.0,34.0], c:"Cap. III · Drets antics", ty:"dret", t:"Qui ven un bé conserva tota la vida una mena de dret a «plorar el seu bé»."}
  ],
  // cronologia: lane 0 = les illes; 1 = les idees; y0/y1 = anys
  segle: [
    {l:0, y0:1915, y1:1918, n:"Malinowski a les Trobriand", t:"Treball de camp a les Trobriand en dues expedicions, 1915–1916 i 1917–1918.", s:"malinowski"},
    {l:0, y0:1918, n:"La flota de Dobu", t:"Seixanta canoes de Dobu s'enduen 648 braçalets de Sinaketa i Vakuta.", s:"malinowski"},
    {l:0, y0:1946, c:1, n:"Es reprèn després de la guerra", t:"Hi entren molts més participants (data aproximada: la font diu «des de la guerra»).", s:"kuehling21"},
    {l:0, y0:1968, c:1, n:"Kibu Tokunuwesi", t:"A finals dels anys seixanta es troba a l'escull Kibu el con d'un dels braçalets més famosos (data aproximada).", s:"kuehling21"},
    {l:0, y0:2016, n:"Un mwali nou", t:"Entra al kula Lagim, un braçalet nou amb grans talles.", s:"kuehling21"},
    {l:0, y0:2018, n:"L'onada salta les Amphlett", t:"Amb vaixells de motor, l'ulai passa de llarg: les Amphlett «no van tocar ni un mwali».", s:"kuehling21"},
    {l:1, y0:1922, n:"Argonauts of the Western Pacific", t:"Malinowski descriu el kula i el fa famós.", s:"malinowski"},
    {l:1, y0:1925, n:"Essai sur le don", t:"Mauss el compara amb el potlatch i el hau: donar, rebre, tornar.", s:"mauss"},
    {l:1, y0:1967, n:"El diari de Malinowski", t:"Es publica el diari privat: menyspreu i insults racistes cap a la gent amb qui vivia.", s:"geertz"},
    {l:1, y0:1926, n:"Malinowski rectifica", t:"Dona la raó a Mauss: els seus «regals purs» també es tornen.", s:"malinowski1926"},
    {l:1, y0:1965, n:"Les reciprocitats", t:"Sahlins les ordena segons la distància social.", s:"sahlins"},
    {l:1, y0:1969, n:"El fruit del regal", t:"Sahlins rellegeix el text maori: el hau és el fruit del regal.", s:"sahlins69"},
    {l:1, y0:1976, n:"La riquesa de les dones", t:"Annette Weiner estudia els intercanvis de farcells de fulla de plataner a les Trobriand.", s:"kuehling25"},
    {l:1, y0:2025, n:"L'hospitalitat, el benefici", t:"Kuehling: el kula és sobretot la cooperació de les famílies que acullen.", s:"kuehling25"},
    {l:2, y0:1884, y1:1951, n:"Potlatch prohibit al Canadà", t:"Del 19 d'abril de 1884 fins al 1951, celebrar un potlatch era delicte.", s:"umista"},
    {l:2, y0:1921, n:"Confiscacions", t:"Es confisquen els objectes cerimonials d'un gran potlatch; la major part va a museus d'Ottawa i Toronto.", s:"umista"}
  ]
};
