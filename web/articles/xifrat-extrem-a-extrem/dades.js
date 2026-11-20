/* Dades dels gràfics de «El sobre que ningú no pot obrir». Fonts a research/xifrat-extrem-a-extrem/fonts.md */
window.XIF_DATA={
  // V4 · nombre de combinacions possibles (càlcul exacte) i dues referències de context
  claus:[
    {id:"pin", up:1,lv:0,  v:1e4,                 t:"PIN de 4 xifres",            m:"10 × 10 × 10 × 10", broken:1},
    {id:"pwd", up:0,lv:0,  v:Math.pow(95,8),      t:"Contrasenya de 8 caràcters", m:"95 símbols per lletra", broken:1},
    {id:"des", up:1,lv:1,  v:Math.pow(2,56),      t:"Clau DES de 56 bits",        m:"trencada en 56 hores el 1998", broken:1},
    {id:"bb", up:0,lv:1,   v:13.8e9*365.25*86400, t:"Segons des del Big Bang",  m:"≈ 4,4 × 10¹⁷", ctx:1},
    {id:"a128", up:1,lv:0, v:Math.pow(2,128),     t:"Clau de 128 bits",           m:"AES-128"},
    {id:"a256", up:1,lv:0, v:Math.pow(2,256),     t:"Clau de 256 bits",           m:"AES-256"},
    {id:"atom", up:0,lv:0, v:7e79,                t:"Àtoms de l'univers visible", m:"uns 10⁸⁰ (estimació)", ctx:1}
  ],
  // V6 · quan es comença a fer servir cada xifrat i quan es trenca (null = encara resisteix). Fonts a «Els gràfics».
  vides:[
    {n:"Xifra de Cèsar",        ty:"ma",  a:-50,  b:850,  aT:"Roma, segle I aC", bT:"al-Kindi, segle IX: comptar lletres"},
    {n:"Xifra de Maria Estuard",ty:"ma",  a:1578, b:1586, aT:"cartes del 1578–1586", bT:"Phelippes la desxifra el 1586"},
    {n:"Xifra de Vigenère",     ty:"ma",  a:1586, b:1863, aT:"tractat de 1586", bT:"Kasiski, 1863"},
    {n:"Bloc d'un sol ús",      ty:"ma",  a:1919, b:null, aT:"patent de Vernam, 1919", bT:""},
    {n:"Enigma",                ty:"maq", a:1926, b:1932, aT:"marina alemanya, 1926", bT:"Rejewski, desembre de 1932"},
    {n:"Diffie-Hellman",        ty:"ord", a:1976, b:null, aT:"1976", bT:""},
    {n:"DES",                   ty:"ord", a:1977, b:1998, aT:"estàndard dels EUA, 1977", bT:"força bruta en 56 hores, 1998"},
    {n:"RSA",                   ty:"ord", a:1978, b:null, aT:"1978", bT:""},
    {n:"AES",                   ty:"ord", a:2001, b:null, aT:"estàndard dels EUA, 2001", bT:""},
    {n:"Protocol Signal",       ty:"ord", a:2016, b:null, aT:"doble trinquet, 2016", bT:""}
  ]
};
