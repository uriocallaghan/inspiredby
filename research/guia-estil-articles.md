# Guia d'estil dels articles d'Inspired by Magazine

Model de referència: **«El Niño i La Niña»** (`web/articles/el-nino/index.html`). Llegeix-lo sencer abans de començar: text, estructura i codi dels gràfics. Altres exemples fets amb la mateixa base: `web/articles/calendari-cosmic/` i `web/articles/de-que-mor-el-mon/`.

La revista: *articles visuals per entendre el món*. Cada article explica una qüestió complexa de manera molt visual, maca i fàcil d'entendre. L'autor és molt exigent amb dues coses: **que tot sigui cert** i **que no sembli fet per una IA** (res de farciment, rètols decoratius, frases buides o dades inventades).

## 1. Escriptura

- **Català** natural i correcte, frases curtes, to de reportatge de diari (no de llibre de text ni de nota de premsa). Tracte de «tu» al lector quan cal («Baixa per veure…», «Arrossega…»).
- **Comença amb una història o una imatge concreta** (a El Niño: els pescadors del Perú abans de Nadal). Primer paràgraf amb caplletra (`<p class="dl">`).
- **Mirada antropològica que sorprengui:** sempre que el tema tingui dimensió humana (societat, història, ciència, economia, territori o vida quotidiana), evita limitar-te a una explicació purament tècnica o descriptiva. Qüestiona allò que el lector occidental modern dona per «normal» o «inevitable» contrastant-ho amb etnografia verificada, història cultural i altres societats (com ho viuen altres cultures, què era diferent abans de la modernitat, quins rituals o solucions socials s'hi han inventat). Aquest contrast entre el fenomen i la diversitat humana és un dels trets que més sorprenen i enganxen el lector.
- **Primer les peces, després el fenomen.** El Niño explica primer el vent, després l'aigua calenta, després la mesura, i només llavors El Niño. Cada secció respon una pregunta («Per què…?», «Què vol dir…?»).
- **Analogies quotidianes** (la banyera, el plat de sopa, els cavallets de la fira, el gronxador). Una per idea difícil, no més.
- **Números concrets** i amb unitats, sempre amb font. Arrodoneix com ho faria un diari (2,3 milions; uns 20 °C).
- Notes laterals en cursiva amb `<p class="note">` per a curiositats i matisos.
- Quan una cosa es debat o és incerta, **digues-ho una sola vegada i des del principi**, només si la incertesa és part de la història (vegeu §1b, punt 4). Si no, no la posis.
- Al final: **«Paraules clau»** (`<dl class="gl">`), i una sola secció **«Dades i fonts»** (`<section class="col fn" id="fonts">`) amb **Metodologia** (què és dada real i què és esquema o simulació), **Els gràfics** (l'explicació completa de cada gràfic: dades, tractament i fonts) i **Fonts** (llista numerada per ordre d'aparició, amb enllaços/DOI).
- **Cites d'un sol clic.** Cada número del text (`<sup class="nr"><a href="#font-N" id="cX" data-c="uN-k">N</a></sup>`) porta directament a la font, mai a una nota intermèdia. Sota cada font, «Hi recolza:» diu quines afirmacions sustenta, i la fletxa ↑ torna al punt on llegies (`cites.js`). Si un article encara té el format antic (Notes + Fonts), converteix-lo amb `scripts/unifica-cites.mjs`.
- **Entradeta i peus de gràfic sense llistes de fonts.** A l'entradeta, només l'enllaç «Dades i fonts ↓». Al peu de cada gràfic, només l'etiqueta (dades reals / esquema / simulació), les instruccions d'ús si cal, i l'enllaç «Fonts i dades del gràfic →» cap a la seva entrada a «Els gràfics».
- Meta de capçalera: «N min de lectura · <a class="dl-f" href="#fonts">Dades i fonts&nbsp;↓</a> · Actualitzat el …». Res de llistes d'autors a la capçalera.
- **Temps de lectura** (decisió de l'editor, 21-11-2026): no s'escriu a mà; el calcula `node scripts/sync-home.mjs` (`readingMinutes`) i el posa a `web/articles.json` i a la capçalera de cada article. Criteri de Medium: unes **265 paraules per minut**, la mitjana d'un adult segons la seva [pàgina d'ajuda «Read time»](https://help.medium.com/hc/en-us/articles/214991667-Read-time), arrodonit al minut. Sense ajust per gràfics: Medium en té un per imatges però no en publica els valors, i els nostres gràfics són interactius. Compta el cos de l'article, sense peus de gràfic ni «Dades i fonts» (als articles antics, ni «Metodologia» ni «Fonts»). És una estimació: la mesura científica de referència, Brysbaert (2019, *Journal of Memory and Language* 109), dona 238 par/min en anglès per a no-ficció; no hi ha cap xifra per al català, i un text amb xifres i gràfics es llegeix més lent. Els articles no han de dur cap script propi de temps de lectura.
- Prohibit: rètols petits en majúscules decoratius, «Dins l'article», índexs numerats, seccions «Pròximament», cites inventades o no verificades, emojis.

## 1b. Edició: què es talla (decisió de l'editor, 21-11-2026)

L'editor llegeix els articles com un lector, no com un revisor de fonts. Quatre defectes que s'han de buscar i tallar abans de publicar, rellegint l'article sencer un cop escrit:

1. **Un nom propi només es queda si el lector el retrobarà o si porta l'argument.** Si apareix una vegada i no torna (un metge, un editor, un arqueòleg, un capità, un institut), es treu i es diu la funció («un metge», «un equip de Copenhaguen») o res. El nom i l'afiliació ja són a «Dades i fonts». Excepció: les persones que són subjecte de la història sí que porten nom (`guia-representacio.md`). Es treuen els figurants, no els protagonistes. Prova: «recordarà aquest nom el lector al cap de tres paràgrafs? el necessita?».
2. **El text mana, el gràfic el serveix.** Un paràgraf, un pas de scroll o una xifra han d'existir perquè l'argument els necessita. Si hi són perquè el gràfic tingui alguna cosa a explicar (un recompte, una comparació, una llista de casos), es treu el text o es treu el gràfic. Un gràfic que il·lustra una frase que ja és clara sobra. Prova: «si traiem el gràfic, aquest paràgraf continuaria existint?».
3. **Dir-ho més ràpid.** Si un paràgraf es pot eliminar o reduir a una frase sense perdre el fil, es fa. Una idea, una vegada: no es repeteix la mateixa explicació amb una altra metàfora, ni la mateixa xifra en dos llocs, ni al cos, al peu del gràfic i al glossari. Un sol exemple per idea, el millor. Les comparacions de mida (marató, Andròmeda, «vuitanta Amazones») són una per xifra, no tres.
4. **Cap matís de revisor.** Si una afirmació no es pot fer amb fermesa, no es fa. Res de «però no està clar», «segons alguns», «tot i que altres estudiosos…», «si X té raó…», «(22, segons una font; 44, segons una altra)» a l'article: aquestes diferències van a «Dades i fonts». Només es diu una incertesa si és **el tema** (el debat sobre el Jesús històric, el futur de la cinta transportadora), i aleshores es diu **una sola vegada, al principi**, com a part de la història, no com a rectificació unes frases després. Una xifra discutida es dona com a forquilla única («entre 150.000 i 316.000»), no amb dues versions i una advertència. Si una dada només té una font dubtosa, no s'hi recolza cap afirmació del cos.

5. **La descripció de portada és curta, amb gancho, s'entén sola i diu només la idea central** (decisió de l'editor, 21-11-2026). És el que més gent llegeix i ho llegeix sense l'article: dues frases com a molt, de què va i quina és la idea central, i no pot suposar res que només s'explica dins. **Cap detall**: res de xifres secundàries, d'orígens («sobretot de fora d'Haití», «un saber de la Xina, l'Índia i l'Àfrica»), de noms ni d'enumeracions; el detall és dins l'article. Cap referent sense presentar («quan la terra va tremolar» sense dir que és un terratrèmol; «en va veure la meitat» sense dir què); res d'eufemismes ni d'abstraccions buides («un pacte d'illa», «un mirall de cada època»). Prova: llegeix-la sense el títol ni l'article i pregunta't si un desconegut sap què passa, on i per què val la pena. Va igual a `articles.json`, `<meta name="description">` i `og:description`.

Quan es talla text, es treuen també les cites `<sup class="nr">` que quedin òrfenes i les entrades de «Dades i fonts» que ja ningú no cita. Revisió feta dels 12 articles penjats, amb les propostes concretes: `research/revisio-farciment-2026-11-21.md`.

## 2. Dades i rigor (obligatori)

- Cada xifra, data i afirmació científica ha de venir d'una **font primària o d'alta confiança** que hagis **obert i llegit** (article revisat per experts amb DOI, NASA/NOAA/ESA, IPCC, OMS, Global Carbon Project, etc.). Wikipedia o blogs només com a pista, mai com a font.
- Comprova cada DOI/URL online (que existeixi i que digui el que li atribueixes). No escriguis DOI de memòria sense verificar-los.
- Si un gràfic és un **esquema o una simulació**, digues-ho al peu («Esquema», «Simulació»); si són **dades reals**, «Dades reals». El detall (fonts, anys, tractament) va a «Els gràfics», dins de «Dades i fonts», i el peu hi enllaça.
- Guarda la recerca a `research/<slug>/`: `fonts.md` (cada afirmació → font, amb URL i nota de verificació) i els CSV/JSON de dades que facin servir els gràfics.

## 3. Disseny (copia el sistema, no l'inventis)

**Els gràfics segueixen el sistema infogràfic:** `research/sistema-infografic.md` (principis, paleta vermell-blau-groc, tipografia, components, hover, lleugeresa i les 73 peces en vuit famílies: TIME, MAP, SCALE, SPREAD, PART, LINK, HOW i CASE) i el mostrari `web/sistema/`. Abans de dibuixar, escriu `research/<slug>/pla-visual.md` amb la peça del sistema de cada gràfic, i fes tots els mapes regionals sobre el mapa físic en relleu MAP-01 (vegeu `AGENTS.md`). Fes servir `assets/ib-viz.js` i copia la peça que necessitis de `web/sistema/` (`sistema.js`, `mapes-a.js`, `mapes-b.js`, `creatives-a.js`, `creatives-b.js` i els fitxers de les peces noves). Si aquesta guia i el sistema no coincideixen en un detall gràfic, mana el sistema.

- Tipografia dels articles: **Source Serif 4** (text) i **Source Sans 3** (etiquetes, gràfics), via Google Fonts (mateix `<link>` que El Niño). La portada de la revista fa servir Helvetica; **no la toquis**.
- **Títol (h1) en STIXGeneral amb l'espaiat tancat però llegible:** `letter-spacing: -0.04em` (definit a `assets/article.css`). Abans era -0,068 em i les lletres quedaven massa juntes (decisió de l'editor, 20-11-2026). No el tornis a tancar a cada article.
- Fons blanc, com una làmina impresa. Columna de lectura de 640 px (`.col`). **L'article s'escriu només en clar**: el mode fosc el fa sol `assets/ib-theme.js`, que tradueix tots els colors en pintar-los (vegeu `AGENTS.md`, «Mode fosc», i `research/sistema-infografic.md`, §2). No hi afegeixis `prefers-color-scheme`, `data-theme` ni colors foscos propis (decisió de l'editor, 20-11-2026).
- Paleta (de `assets/article.css`): `--ink #121212`, `--ink-2 #4A4A4A`, `--muted #7A7A7A`, `--hair #DADADA`, `--land #ECEBE8`, `--warm #C8442A` (calent / destacat), `--cold #2C5DA8` (fred / aigua), i a El Niño també `--dry #9A6326`, `--wet #16786C`, `--bio #4C8A2E`. Rampes divergents blau–gris–vermell com la d'El Niño. Pocs colors, amb significat constant dins l'article.
- Base comuna: `assets/ib-viz.js` (helpers dels gràfics, `IBV`), `assets/ib.css` (barra i peu de la revista), `assets/article.css` (tipografia, `.scrolly`, `.step`, `.fig`, `.cap`, `.tip`, `.rng`, `.playb`, `.ctl`, `.legend`, `.gh`, `.ann`, `dl.gl`, `.fn`), `assets/scrolly.js` (`IB.scrolly(stepsEl, graphicEl, onStep)`, `IB.reduced`, `IB.fmt`). **No modifiquis aquests fitxers compartits**: si necessites estils propis, posa'ls en un `<style>` a la pàgina.
- Llibreries: **d3 7.9.0** de `https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js`; si cal un mapa, `topojson-client@3.1.0` de jsdelivr i un mapa del món (p. ex. `world-atlas@2.0.2` de jsdelivr). Res més sense una raó molt bona. Canvas per a animacions amb moltes partícules; SVG per a gràfics de dades.

### Gràfics: el que fa bo El Niño

- **Seccions de scroll** (`.scrolly`) amb el gràfic enganxat a la dreta i els passos a l'esquerra: cada pas canvia el gràfic (estat, zoom, capes, anotacions). Transicions suaus i animació contínua quan té sentit (partícules, corrents, vent).
- **Anotacions sobre el gràfic** (etiquetes amb línies guia, noms de llocs, valors), no només llegendes.
- **Interactivitat real**: controls lliscants, botons de preset, «Reprodueix», línies del temps, tooltips en passar o tocar.
- **Dades reals en almenys un gràfic** (sèrie temporal, mapa, comparació), amb peu i font.
- Talls i esquemes que expliquen el mecanisme (un tall de l'oceà, de l'atmosfera, una cèl·lula), ben etiquetats.
- Llegendes petites en sans, peus de figura en gris (`.cap` / `figcaption`).
- Cada article: **mínim dues seccions de scroll o figures animades i dues figures interactives**, més d'altres de dades. Que siguin precises (escales, unitats, eixos) i boniques.

### Lectura enfocada (decisió de l'editor, 21-11-2026)

Als paràgrafs llargs del cos (`section.col > p`, 4 línies o més), les paraules que són al 24 % inferior de la pantalla surten a 0,12 d'opacitat i s'encenen una a una, en ordre de lectura, a mesura que pugen. La transició és curta (1,4 línies, unes 10–15 paraules): el tall s'ha de veure clar. Mai un degradat que travessi el text. Ho fa `web/assets/ib.js` per a tots els articles embolicant cada paraula en un `span.ib-w` i canviant-ne l'opacitat: no cal fer res a l'article ni posar-hi classes. Queden fora l'scrolly (`.step`, que ja té el seu efecte), els peus de gràfic, les notes, «Dades i fonts», la impressió i «reduir el moviment». Si un paràgraf no ho ha de tenir, posa-li una classe (només s'apliquen els `<p>` sense classe o amb `.dl`).

### Mòbil i accessibilitat

- Sota 900 px: el gràfic es queda enganxat a dalt (ocupa com a màxim ~50 % de l'alçada) i els passos passen per sota (ja ho fa `article.css`). Etiquetes que no hi caben → amaga-les o fes-les numerades. **Cap scroll horitzontal.**
- `role="img"` i `aria-label` descriptiu a cada gràfic; respecta `prefers-reduced-motion` (`IB.reduced`).
- Comprova-ho a 1440×900 i a 390×844.

## 4. Fitxers i estructura

- Article: `web/articles/<slug>/index.html` i `web/articles/<slug>/<slug>.js` (pots tenir-ne més d'un). Copia l'esquelet de capçalera, barra (`ib-bar` amb el logo), barra de progrés, peu i scripts de `web/articles/calendari-cosmic/index.html` (rutes relatives `../../assets/…`). La primera línia després de `<meta charset="utf-8">` ha de ser `<script src="../../assets/ib-theme.js"></script>` (mode fosc, sense `defer`); `check.mjs` ho exigeix.
- Portada per a la revista: crea `web/articles/<slug>/cover.html` (SVG de 1680×720 fet amb codi, sense text, amb la paleta de l'article) i genera'n `cover.jpg`:
  `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --window-size=1680,720 --screenshot=cover.png file://…/cover.html` i converteix-lo amb `sips -s format jpeg cover.png --out cover.jpg`.
- Miniatura 4:5 de portada: afegeix `web/articles/<slug>/thumb.webp`. La miniatura de portada (`thumb.webp`, 800×1000) és sempre una de les imatges de degradat de la casa, mai una il·lustració feta per a l'article; si no n'hi ha cap de nova, es reutilitza la d'un article antic (dels del final de `web/articles.json`, lluny dels nous a la portada) perquè la repetició no es noti (decisió de l'editor, 20-11-2026)., registra l'article a `web/articles.json` i regenera `web/index.html` executant `node scripts/sync-home.mjs`.
- **Tots els articles de `web/articles/` han de sortir a la web: a la portada o, amb `"draft": true` a `web/articles.json`, a «Articles per penjar» (`web/per-penjar/`, enllaçada des del peu)** (decisió de l'editor, 20-11-2026). Un article passa a la portada només quan l'editor ho diu. El peu de pàgina és comú i el posa `sync-home.mjs`: a l'article n'hi ha prou amb un `<footer class="ib-foot"></footer>`. No modifiquis el disseny o CSS de la portada, altres articles ni els fitxers compartits (`web/assets/*`) sense explicar-ho.

## 5. Proves

- **Representació** (decisió de l'editor, 20-11-2026): passa la llista de `research/guia-representacio.md` §3, començant per la descripció de portada, l'entradeta, el títol i els intertítols.
- `node scripts/check.mjs` (valida la sincronia portada i «per penjar» ↔ `web/articles.json` ↔ `web/articles/`, el peu comú, els fitxers obligatoris i el `node --check` de tots els `.js`).
- Serveix la carpeta `web/` amb el teu propi port (`python3 -m http.server <port> --directory "<ruta>/web"`) i atura'l en acabar.
- Pots fer servir el navegador integrat (eines `mcp__Claude_Browser__*`) **només en una pestanya pròpia** (`tabs_create` i passa sempre el teu `tabId`); no toquis les altres pestanyes. Si no està disponible, fes servir Chrome headless (`--screenshot`, `--dump-dom`, `--enable-logging=stderr`).
- Recorre tots els passos del scroll i totes les interaccions; zero errors a la consola; zero desbordaments horitzontals.
- **Repeteix-ho en mode fosc** (Playwright amb `colorScheme: 'dark'`, o posant el dispositiu en fosc) a 1440×900 i a 390×844: cap text fosc sobre fons fosc, cap fons o panell clar que enlluerni, tooltips llegibles, i les categories i rampes de cada gràfic encara es distingeixen.

## 6. Informe final

Resum de l'article (estructura i seccions), llista de gràfics (què mostren, si són dades o esquema), fonts principals, dubtes oberts i qualsevol cosa que no hagis pogut verificar.
